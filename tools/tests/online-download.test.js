/*
 * RlonDSP
 * Copyright © 2026 RlonDSP. All rights reserved.
 *
 * 在线歌曲下载服务专项测试（真实 HTTP + 真实文件系统）
 * ---------------------------------------------------------------------------
 * 不 mock fs、不 mock 流：起一个真实本地 HTTP 服务，跑真实的流式下载，然后检查磁盘结果。
 * 覆盖：真实进度 → 成功落盘；同名不覆盖；非法文件名；取消清理残片；HTTP / 内容类型 /
 * 传输中断 / 体积超限 / 地址解析失败 这些真实失败路径。
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');

const { createOnlineDownloader, sanitizeFileName } = require('../../online-download');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** 起一个真实本地服务；用 t.after 保证用例失败时也会关掉（否则测试进程不会退出） */
function startServer(handler, t) {
  return new Promise((resolve) => {
    const server = http.createServer(handler);
    const close = server.close.bind(server);
    server.close = () => {
      try { server.closeAllConnections(); } catch { /* fetch 是 keep-alive，必须连连接一起关 */ }
      close();
    };
    if (t && typeof t.after === 'function') t.after(() => server.close());
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

function audioBuffer(size) {
  const buffer = Buffer.alloc(size);
  for (let i = 0; i < size; i += 1) buffer[i] = (i * 7) % 251;
  return buffer;
}

function makeDownloader(dir, onProgress, extra = {}) {
  return createOnlineDownloader({
    fetchImpl: (url, init) => fetch(url, init),
    resolveUrl: async (task) => task.playUrl,
    downloadsDir: dir,
    onProgress: onProgress || (() => {}),
    ...extra
  });
}

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'rlondsp-dl-'));
}

test('下载：真实流式下载 → 进度是真实字节数 → 文件落在下载目录且内容一致', async (t) => {
  const payload = audioBuffer(256 * 1024);
  const { port } = await startServer((req, res) => {
    res.writeHead(200, { 'content-type': 'audio/mpeg', 'content-length': String(payload.length) });
    // 分片下发，确保进度事件来自真实分块而不是一次写完
    let offset = 0;
    const step = () => {
      if (offset >= payload.length) return res.end();
      res.write(payload.subarray(offset, offset + 16 * 1024));
      offset += 16 * 1024;
      setTimeout(step, 10);
    };
    step();
  }, t);
  const dir = tempDir();
  const events = [];
  const downloader = makeDownloader(dir, (state) => events.push({ ...state }));
  const result = await downloader.start({
    sourceId: 'src_1', id: 'kuwo:MUSIC_1', title: '晴天', artist: '周杰伦',
    playUrl: `http://127.0.0.1:${port}/music/F000.flac`
  });

  assert.strictEqual(path.dirname(result.filePath), dir, '文件落在受控下载目录');
  assert.strictEqual(path.basename(result.filePath), '周杰伦 - 晴天.flac', '文件名优先「歌手 - 歌曲名」，扩展名来自真实地址');
  assert.strictEqual(result.bytes, payload.length, '上报的字节数等于真实大小');
  const written = await fsp.readFile(result.filePath);
  assert.strictEqual(written.length, payload.length, '磁盘上的文件与上游内容等长');
  assert.ok(written.equals(payload), '磁盘内容与上游字节完全一致');
  assert.ok(!fs.existsSync(`${result.filePath}.part`), '完成后不残留临时文件');

  const progress = events.filter((event) => event.status === 'downloading' && event.received > 0);
  assert.ok(progress.length >= 1, '至少上报一次真实进度');
  assert.ok(progress.every((event, index) => index === 0 || event.received >= progress[index - 1].received), '进度单调不回退');
  assert.strictEqual(progress[progress.length - 1].percent, 100, '最后一次进度是 100%');
  assert.strictEqual(events[events.length - 1].status, 'done', '终态是完成');
});

test('下载：同名文件自动加序号，不覆盖已有文件', async (t) => {
  const payload = audioBuffer(2048);
  const { port } = await startServer((req, res) => {
    res.writeHead(200, { 'content-type': 'audio/mpeg', 'content-length': String(payload.length) });
    res.end(payload);
  }, t);
  const dir = tempDir();
  await fsp.writeFile(path.join(dir, '周杰伦 - 晴天.mp3'), 'already here');
  const downloader = makeDownloader(dir);
  const result = await downloader.start({
    sourceId: 's', id: 'qq:x', title: '晴天', artist: '周杰伦', playUrl: `http://127.0.0.1:${port}/a.mp3`
  });
  assert.strictEqual(path.basename(result.filePath), '周杰伦 - 晴天 (1).mp3');
  assert.strictEqual(await fsp.readFile(path.join(dir, '周杰伦 - 晴天.mp3'), 'utf8'), 'already here', '同名旧文件未被覆盖');
});

test('下载：取消会中断请求、删除残片、上报取消终态', async (t) => {
  const payload = audioBuffer(512 * 1024);
  let opened = false;
  const { port } = await startServer((req, res) => {
    opened = true;
    res.writeHead(200, { 'content-type': 'audio/mpeg', 'content-length': String(payload.length) });
    res.write(payload.subarray(0, 8 * 1024));
    // 之后慢慢滴数据：留出足够的取消窗口
    const timer = setInterval(() => res.write(payload.subarray(0, 4 * 1024)), 50);
    res.on('close', () => clearInterval(timer));
  }, t);
  const dir = tempDir();
  let taskId = '';
  const events = [];
  const downloader = makeDownloader(dir, (state) => {
    events.push({ ...state });
    if (!taskId) taskId = state.id;
  });
  const running = downloader.start({
    sourceId: 's', id: 'kuwo:y', title: '夜曲', artist: '周杰伦', playUrl: `http://127.0.0.1:${port}/b.flac`
  });
  // 等真实请求到达服务端（taskId 在任务创建时就同步给出，不能只等它）
  for (let i = 0; i < 200 && !opened; i += 1) await sleep(10);
  assert.ok(opened && taskId, '下载已经真实开始');
  assert.strictEqual(downloader.cancel(taskId), true, '取消命令被接受');
  await assert.rejects(() => running, /DOWNLOAD_CANCELLED/);
  const left = await fsp.readdir(dir);
  assert.deepStrictEqual(left, [], `取消后不留下任何文件（实际：${left.join(',')}）`);
  assert.strictEqual(events[events.length - 1].status, 'cancelled', '终态是已取消');
});

test('下载：HTTP 失败 / 内容类型不是音频 / 体积超限 / 地址解析失败 都如实报错且不落盘', async (t) => {
  const dir = tempDir();
  const downloader = makeDownloader(dir);
  const { port } = await startServer((req, res) => {
    if (req.url.startsWith('/403')) { res.writeHead(403); res.end('no'); return; }
    if (req.url.startsWith('/html')) {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end('<html>anti-leech</html>');
      return;
    }
    res.writeHead(200, { 'content-type': 'audio/mpeg', 'content-length': '4096' });
    res.end(audioBuffer(4096));
  }, t);

  await assert.rejects(
    () => downloader.start({ sourceId: 's', id: 'x', title: 't', playUrl: `http://127.0.0.1:${port}/403` }),
    /DOWNLOAD_HTTP_ERROR/
  );
  await assert.rejects(
    () => downloader.start({ sourceId: 's', id: 'x', title: 't', playUrl: `http://127.0.0.1:${port}/html` }),
    /DOWNLOAD_CONTENT_TYPE_INVALID/
  );
  await assert.rejects(
    () => makeDownloader(dir, null, { maxBytes: 1024 }).start({ sourceId: 's', id: 'x', title: 't', playUrl: `http://127.0.0.1:${port}/big.mp3` }),
    /DOWNLOAD_CONTENT_TOO_LARGE/
  );
  await assert.rejects(
    () => downloader.start({ sourceId: 's', id: 'x', title: 't', playUrl: 'not-a-url' }),
    /DOWNLOAD_URL_INVALID/
  );
  assert.deepStrictEqual(await fsp.readdir(dir), [], '失败路径不留下任何文件');
});

test('下载：传输中断（声明长度与实际不符）判定为失败，并清理残片', async (t) => {
  const { port } = await startServer((req, res) => {
    res.writeHead(200, { 'content-type': 'audio/mpeg', 'content-length': '8192' });
    res.write(audioBuffer(1024));
    res.end();
  }, t);
  const dir = tempDir();
  const downloader = makeDownloader(dir);
  // 运行时会按真实情况给出「不完整」或「网络中断」——两者都是真实失败，关键是不能留半截文件
  await assert.rejects(
    () => downloader.start({ sourceId: 's', id: 'x', title: 't', playUrl: `http://127.0.0.1:${port}/cut.mp3` }),
    /DOWNLOAD_INCOMPLETE|DOWNLOAD_NETWORK_ERROR/
  );
  assert.deepStrictEqual(await fsp.readdir(dir), [], '不完整下载不留文件');
});

test('下载：扩展名只认真实音频格式（URL 后缀优先，其次内容类型），认不出就失败', async (t) => {
  const { port } = await startServer((req, res) => {
    res.writeHead(200, { 'content-type': 'audio/ogg' });
    res.end(audioBuffer(1024));
  }, t);
  const dir = tempDir();
  const result = await makeDownloader(dir).start({ sourceId: 's', id: 'x', title: '歌', artist: '人', playUrl: `http://127.0.0.1:${port}/stream` });
  assert.strictEqual(path.extname(result.filePath), '.ogg', '没有 URL 后缀时按真实内容类型定扩展名');

  const { port: port2 } = await startServer((req, res) => {
    res.writeHead(200, { 'content-type': 'audio/unknown-format' });
    res.end(audioBuffer(16));
  }, t);
  const dir2 = tempDir();
  await assert.rejects(
    () => makeDownloader(dir2).start({ sourceId: 's', id: 'x', title: '歌', playUrl: `http://127.0.0.1:${port2}/stream` }),
    /DOWNLOAD_CONTENT_TYPE_INVALID/,
    '认不出的音频格式明确失败，不猜扩展名'
  );
});

test('下载：文件名清洗规则（非法字符 / 空名 / Windows 保留名 / 超长）', () => {
  assert.strictEqual(sanitizeFileName('周杰伦 - 晴天', 'x'), '周杰伦 - 晴天');
  assert.strictEqual(sanitizeFileName('a/b\\c:d*e?f"g<h>i|j', 'x'), 'a b c d e f g h i j');
  assert.strictEqual(sanitizeFileName('   ...   ', 'fallback'), 'fallback', '全是空白 / 点的名字用兜底名');
  assert.strictEqual(sanitizeFileName('CON', 'x'), '_CON', 'Windows 保留设备名加前缀避开');
  assert.strictEqual(sanitizeFileName('x'.repeat(400), 'y').length, 120, '过长的名字被裁剪');
});

test('下载：地址解析失败时按真实原因失败，不产生任何文件', async () => {
  const dir = tempDir();
  const downloader = createOnlineDownloader({
    fetchImpl: (url, init) => fetch(url, init),
    resolveUrl: async () => { throw Object.assign(new Error('SOURCE_PLAY_URL_INVALID: kuwo track not found upstream'), { safeMessage: 'kuwo track not found upstream' }); },
    downloadsDir: dir
  });
  await assert.rejects(
    () => downloader.start({ sourceId: 's', id: 'kuwo:z', title: 't' }),
    /DOWNLOAD_URL_INVALID: kuwo track not found upstream/,
    '上游给不出版本地址时，失败原因里保留真实细节'
  );
  assert.deepStrictEqual(await fsp.readdir(dir), []);
  assert.strictEqual(downloader.activeCount(), 0, '失败任务从活动表里移除');
});
