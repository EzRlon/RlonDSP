/*
 * RlonDSP
 * Copyright © 2026 RlonDSP. All rights reserved.
 *
 * MusicSquare 在线源 + 每首歌曲下载 专项测试
 * ---------------------------------------------------------------------------
 * 静态：源适配器 / 下载服务接线 / 每行下载按钮 / 双语文案 / 图标登记。
 * 实机：切到 MusicSquare → 真实搜索出结果 → 每行都有下载按钮 →
 *       点下载只下这一首（不触发播放）→ 进度真实 → 落盘文件是真实音频（扩展名与魔数一致）。
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const RENDERER = fs.readFileSync(path.join(ROOT, 'src', 'renderer.js'), 'utf8');
const CSS = fs.readFileSync(path.join(ROOT, 'src', 'styles.css'), 'utf8');
const HTML = fs.readFileSync(path.join(ROOT, 'src', 'index.html'), 'utf8');
const LAYER = fs.readFileSync(path.join(ROOT, 'online-source-layer.js'), 'utf8');
const DOWNLOAD = fs.readFileSync(path.join(ROOT, 'online-download.js'), 'utf8');
const PRELOAD = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8');
const MAIN = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8');

test('MusicSquare：来源层有独立适配器，首页 URL 只作归属、不当作歌曲 API', () => {
  assert.ok(LAYER.includes("sourceType === 'musicsquare'"), '来源层按 sourceType 分派适配器');
  assert.ok(LAYER.includes('function musicsquareSearch'), '有搜索适配器');
  assert.ok(LAYER.includes('function musicsquareResolve'), '有播放地址解析适配器');
  assert.ok(LAYER.includes('charlespikachu.github.io/musicsquare/'), '保留上游归属地址');
  for (const host of ['api.qijieya.cn', 'tang.api.s01s.cn', 'oiapi.net', 'apicx.asia']) {
    assert.ok(LAYER.includes(host), `接入真实平台主机 ${host}`);
  }
  assert.ok(/musicsquareRequest[\s\S]{0,400}baseUrl: platform\.host/.test(LAYER), '请求基址来自平台主机，不是首页');
});

test('下载：主进程新增下载服务，渲染层只通过受控 IPC 调用', () => {
  assert.ok(DOWNLOAD.includes('function createOnlineDownloader'), '有下载服务实现');
  assert.ok(DOWNLOAD.includes('ERROR_CODES.CANCELLED'), '支持取消');
  assert.ok(/flags:\s*'wx'/.test(DOWNLOAD), '临时文件独占创建，避免与旧残片拼接');
  assert.ok(DOWNLOAD.includes('rename'), '完成后原子改名');
  for (const channel of ['online:download:start', 'online:download:cancel', 'online:download:reveal']) {
    assert.ok(MAIN.includes(channel), `主进程注册 ${channel}`);
    assert.ok(PRELOAD.includes(channel), `preload 暴露 ${channel}`);
  }
  assert.ok(PRELOAD.includes('onOnlineDownloadProgress'), '进度通过受控通道回传');
  assert.ok(!RENDERER.includes('ipcRenderer'), '渲染层不直接碰 ipcRenderer');
  assert.ok(!RENDERER.includes("require('node:fs')"), '渲染层不做文件系统操作');
});

test('下载：每一行歌曲都有独立下载操作，且与播放 / 加入队列分开', () => {
  assert.ok(RENDERER.includes('function onlineDownloadControl'), '有统一下载控件工厂');
  assert.ok(RENDERER.includes('onlineDownloadNodes'), '进度就地更新，不整表重建');
  for (const fn of ['renderOnlineSongList', 'onlineHomeSongRow', 'spotifySongRow']) {
    const block = RENDERER.split(`function ${fn}`)[1] || '';
    assert.ok(block.slice(0, 3000).includes('onlineDownloadControl(resource)'), `${fn} 的每一行都有下载按钮`);
  }
  assert.ok(/function onlineDownloadControl[\s\S]{0,1600}stopPropagation\(\)/.test(RENDERER), '点击下载不会冒泡成播放 / 选中');
  assert.ok(RENDERER.includes("button.setAttribute('aria-label'"), '下载按钮有可访问名称（随状态更新）');
  assert.ok(RENDERER.includes('href="#icon-download"'), '下载按钮有图标');
  assert.ok(/<symbol id="icon-download"/.test(HTML), '图标在 sprite 里');
  const registry = fs.readFileSync(path.join(ROOT, 'src', 'icon-registry.js'), 'utf8');
  assert.ok(/(^|[\s,{])download:\s*\{/.test(registry), '图标登记表里登记了 download');
  assert.ok(CSS.includes('.online-download-btn'), '下载按钮有独立样式');
  assert.ok(RENDERER.includes("return resource.sourceType !== 'spotify'"), 'Spotify 只提供受条款限制的试听，不做下载');
  assert.ok(RENDERER.includes("t('downloadNotAvailable')"), '不可下载时按钮显示真实状态');
});

test('下载：进度 / 成功 / 失败 / 取消 / 重试 文案中英双语齐备', () => {
  for (const key of ['downloadTitle', 'downloadProgress', 'downloadDone', 'downloadFailed',
    'downloadCancelled', 'downloadCancel', 'downloadRetry', 'downloadReveal',
    'downloadNotAvailable', 'downloadNotAvailableHint', 'musicSquarePlatforms',
    'musicSquareHomeHint', 'musicSquareAttribution']) {
    const hits = RENDERER.split(`${key}:`).length - 1;
    assert.ok(hits >= 2, `${key} 需要中英文两份文案（实际 ${hits}）`);
  }
});

test('在线播放：远程音源统一走 CORS，且只播被点的那一首（不串歌、不假装成功）', () => {
  // 根因：audioElement 接进了 Web Audio，非 CORS 干净的媒体会被整体静音（进度在走但没声音）
  assert.ok(RENDERER.includes('function applyAudioSource'), '有统一的音源接入函数');
  assert.ok(/function applyAudioSource[\s\S]{0,700}crossOrigin = want/.test(RENDERER), '远程地址设置 crossOrigin');
  assert.ok(/const want = remote \? 'anonymous' : null/.test(RENDERER), '远程用 anonymous，本地不带 crossOrigin');
  assert.ok(/function playTrack[\s\S]{0,900}applyAudioSource\(src\)/.test(RENDERER), '播放一律经过 applyAudioSource');
  assert.strictEqual(/function playTrack[\s\S]{0,900}audioElement\.src = src/.test(RENDERER), false, '不再绕过 CORS 直接塞 src');
  // 单曲解析失败不能拿别的歌顶替
  assert.ok(RENDERER.includes('function onlineSameTrack'), '兜底搜索必须命中同一首歌');
  assert.ok(/url = await api\.onlineResolve\(target\.sourceId, onlineResolvePayload\(target\)\)/.test(RENDERER),
    '首选按这条资源自己的身份解析地址');
  assert.ok(RENDERER.includes("target.sourceType === 'musicsquare') throw error"),
    'MusicSquare 的条目只按自己的身份解析，不退回按歌名搜别人的地址');
  for (const key of ['onlinePlayBlocked']) {
    const hits = RENDERER.split(`${key}:`).length - 1;
    assert.ok(hits >= 2, `${key} 需要中英文两份文案（实际 ${hits}）`);
  }
});

/* ------------------------------------------------------------------ 实机部分 */

const PORT = 9234;
const EXE = path.join(ROOT, 'release', 'RlonDSP-portable', 'RlonDSP.exe');
const WORK = path.join(ROOT, 'build', 'test-online-download');
let wsUrl = null;
let child = null;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function findEndpoint() {
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json`);
    const list = await res.json();
    const page = list.find((item) => item.type === 'page');
    return page ? page.webSocketDebuggerUrl : null;
  } catch {
    return null;
  }
}

function evaluate(expression, timeout = 60000) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error('页面执行超时')); }, timeout);
    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true, userGesture: true } }));
    });
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id !== 1) return;
      clearTimeout(timer);
      try { ws.close(); } catch {}
      if (msg.result && msg.result.exceptionDetails) reject(new Error(msg.result.exceptionDetails.text || '页面执行出错'));
      else resolve(msg.result && msg.result.result ? msg.result.result.value : undefined);
    });
    ws.addEventListener('error', () => { clearTimeout(timer); reject(new Error('无法连接应用调试端口')); });
  });
}

test.before(async () => {
  wsUrl = await findEndpoint();
  if (wsUrl) return;
  if (!fs.existsSync(EXE)) return;
  const dataDir = path.join(WORK, 'userdata');
  fs.mkdirSync(dataDir, { recursive: true });
  child = spawn(EXE, [`--remote-debugging-port=${PORT}`, '--remote-allow-origins=*', `--user-data-dir=${dataDir}`],
    { cwd: path.dirname(EXE), stdio: 'ignore' });
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    wsUrl = await findEndpoint();
    if (wsUrl) return;
  }
});

test.after(async () => {
  // 实机部分会切源 / 搜索：收尾时把在线资源页还原成默认源与空关键词，
  // 免得影响随后运行的其它实机用例（它们跑在同一个应用实例上）。
  if (wsUrl) {
    try {
      await evaluate("(function(){ var input = document.getElementById('onlineSearchInput'); if (input) input.value = ''; state.online.query = ''; state.online.results = []; state.online.status = 'idle'; state.online.downloads.clear(); var first = (state.online.sources || []).filter(function (s) { return s.enabled; })[0]; if (first) state.online.sourceId = first.id; })()");
      await evaluate("loadOnlineSources().then(function () { return onlineRefreshResults(); })");
    } catch { /* 还原失败不影响本用例结论 */ }
  }
  try {
    if (child && child.pid && process.platform === 'win32') spawn('taskkill', ['/pid', String(child.pid), '/t', '/f']);
    else if (child) child.kill();
  } catch {}
  await sleep(300);
  try { fs.rmSync(WORK, { recursive: true, force: true }); } catch {}
});

/** 按真实音频容器格式校验文件头，避免只按扩展名“看起来像音频” */
function looksLikeAudio(filePath) {
  const fd = fs.openSync(filePath, 'r');
  const head = Buffer.alloc(16);
  fs.readSync(fd, head, 0, 16, 0);
  fs.closeSync(fd);
  const text = head.toString('latin1');
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.mp3') return head.slice(0, 3).toString('latin1') === 'ID3' || (head[0] === 0xff && (head[1] & 0xe0) === 0xe0);
  if (ext === '.flac') return text.startsWith('fLaC');
  if (ext === '.m4a' || ext === '.aac') return head.slice(4, 8).toString('latin1') === 'ftyp' || (head[0] === 0xff && (head[1] & 0xf0) === 0xf0);
  if (ext === '.ogg' || ext === '.opus') return text.startsWith('OggS');
  if (ext === '.wav') return head.slice(0, 4).toString('latin1') === 'RIFF';
  return false;
}

const PLAY_STATE = "JSON.stringify({track: state.currentTrack ? state.currentTrack.id : '', paused: !!(typeof audioElement !== 'undefined' && audioElement && audioElement.paused), count: document.querySelectorAll('#trackList > li').length})";

test('实机：MusicSquare 出现在在线源入口，搜索结果每行都有下载按钮', async (t) => {
  if (!wsUrl) return t.skip('未运行应用实例，跳过实机核对');
  const sources = await evaluate("JSON.stringify((state.online.sources || []).map((s) => ({ id: s.id, name: s.name, type: s.sourceType, enabled: s.enabled, platforms: s.platforms })))");
  const list = JSON.parse(sources || '[]');
  const ms = list.find((item) => item.type === 'musicsquare');
  assert.ok(ms, '在线源列表里有 MusicSquare');
  assert.strictEqual(ms.enabled, true, '默认启用');
  assert.deepStrictEqual(ms.platforms, { netease: true, qq: true, kuwo: true, joox: true }, '四个真实平台都接入');

  const clicked = await evaluate("(function(){ var chip = Array.prototype.find.call(document.querySelectorAll('#onlineSourceBar .online-source-chip'), function (el) { return el.textContent.trim() === 'MusicSquare'; }); if (chip) chip.click(); return !!chip; })()");
  assert.strictEqual(clicked, true, '在线源入口里有 MusicSquare 标签并且点得到');
  // 回到「没有关键词」的首页态（上一次运行可能留下了搜索结果）
  await evaluate("(function(){ var input = document.getElementById('onlineSearchInput'); if (input) input.value = ''; state.online.query = ''; state.online.results = []; state.online.hasSearched = false; })()");
  await evaluate("onlineRefreshResults()");
  await sleep(300);
  assert.strictEqual(await evaluate("!!document.querySelector('.online-home--musicsquare')"), true, 'MusicSquare 首页是真实入口而不是假榜单');
  assert.ok(await evaluate("document.querySelectorAll('.online-platform-chip').length") >= 3, '首页列出真实启用的平台');

  await evaluate("(function(){ var input = document.getElementById('onlineSearchInput'); input.value = '晴天 周杰伦'; document.getElementById('onlineSearchBtn').click(); })()");
  let rows = 0;
  for (let i = 0; i < 60; i++) {
    await sleep(500);
    rows = await evaluate("document.querySelectorAll('#onlineResults .online-song-row').length");
    if (rows > 0) break;
    if ((await evaluate("state.online.status")) === 'error') {
      return t.skip(`上游不可用，跳过实机核对：${await evaluate("state.online.error")}`);
    }
  }
  assert.ok(rows > 0, `真实搜索出结果（${rows} 行）`);
  const buttons = await evaluate("(function(){ return Array.prototype.map.call(document.querySelectorAll('#onlineResults .online-song-row'), function (row) { var btn = row.querySelector('.online-download-btn'); return btn ? { label: btn.getAttribute('aria-label') || '', text: btn.textContent.trim() } : null; }); })()");
  assert.ok(buttons.every((btn) => btn && btn.text), `每一行都有下载按钮（${buttons.length} 行）`);
  assert.ok(buttons.every((btn) => btn.label && btn.label.length > 0), '按钮有可访问名称');
});

test('实机：解析出的真实地址能被音频解码器加载（确实可播放）', async (t) => {
  if (!wsUrl) return t.skip('未运行应用实例，跳过实机核对');
  const rows = await evaluate("document.querySelectorAll('#onlineResults .online-song-row').length");
  if (!rows) return t.skip('上一步没有搜索结果，跳过实机播放核对');

  // 用真正的解码器（Audio 元素）加载，而不是只看地址字符串像不像音频
  const raw = await evaluate(`(async function () {
    var out = [];
    var list = (state.online.results || []).slice(0, 4);
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      var item = { title: r.title, provider: r.provider, resolved: false, playable: false, reason: '' };
      try {
        var url = await api.onlineResolve(r.sourceId, onlineResolvePayload(r));
        item.resolved = !!url;
        item.playable = await new Promise(function (resolve) {
          var audio = new Audio();
          var settled = false;
          var finish = function (value) { if (!settled) { settled = true; try { audio.src = ''; } catch (e) {} resolve(value); } };
          audio.preload = 'metadata';
          audio.addEventListener('loadedmetadata', function () { finish(Number.isFinite(audio.duration) && audio.duration > 0); });
          audio.addEventListener('error', function () { finish(false); });
          setTimeout(function () { finish(false); }, 15000);
          audio.src = url;
        });
        if (!item.playable) item.reason = 'decode-or-timeout';
      } catch (error) {
        item.reason = String((error && error.message) || error).slice(0, 140);
      }
      out.push(item);
    }
    return JSON.stringify(out);
  })()`, 90000);
  const results = JSON.parse(raw || '[]');
  assert.ok(results.length > 0, '至少核对了一首');
  const playable = results.filter((item) => item.playable);
  assert.ok(playable.length > 0,
    `至少有一首能真实播放（其余可能是上游付费 / 下架，属于真实情况）：${JSON.stringify(results)}`);
});

test('实机：MusicSquare 点「立即播放」真的有声音，且播的就是被点的那一首', async (t) => {
  if (!wsUrl) return t.skip('未运行应用实例，跳过实机核对');
  // 这条用例会把在线曲目真正加进队列：记下原有条目，收尾时只删自己加的，
  // 免得给后面的实机用例（冒烟等）留下一堆在线条目。
  const beforeKeys = JSON.parse(await evaluate("JSON.stringify(state.tracks.map(function (track) { return track.id; }))"));
  // 用 t.after 收尾：即使用例中途失败，也不会把在线条目留在队列里影响后面的实机用例
  t.after(async () => {
    try {
      // 点击触发的解析是异步的：先等一下再清，清完再确认一次，避免「刚清完又被补进来」
      const purge = async () => evaluate(`(function () {
        var keep = ${JSON.stringify(beforeKeys)};
        var removed = [];
        state.tracks.slice().forEach(function (track) {
          if (keep.indexOf(track.id) >= 0) return;
          if (queueManager.removeTrack(track.id)) removed.push(track.id);
        });
        if (audioElement) { try { audioElement.pause(); } catch (e) {} }
        renderPlaylist();
        return removed;
      })()`);
      let removed = [];
      for (let pass = 0; pass < 3; pass += 1) {
        await sleep(1500);
        const gone = await purge();
        removed = removed.concat(gone);
        if (!gone.length) break;
      }
      const left = await evaluate("JSON.stringify(state.tracks.map(function (track) { return track.id; }))");
      console.log(`[清理] 移除 ${JSON.stringify(removed)}，剩余 ${left}`);
    } catch { /* 收尾失败不影响用例结论 */ }
  });
  await evaluate("(function(){var chip=Array.prototype.find.call(document.querySelectorAll('#onlineSourceBar .online-source-chip'),function(el){return el.textContent.trim()==='MusicSquare';});if(chip)chip.click();})()");
  await sleep(700);
  await evaluate("(function(){var input=document.getElementById('onlineSearchInput');input.value='晴天 周杰伦';document.getElementById('onlineSearchBtn').click();})()");
  // 等真实列表落到 DOM 上（state.online.results 可能还是上一次的结果，加载中是骨架屏）
  const rowCount = () => evaluate("document.querySelectorAll('#onlineResults .online-song-row').length");
  let rows = 0;
  for (let i = 0; i < 60; i++) {
    await sleep(500);
    rows = await rowCount();
    if (rows > 0) break;
    if ((await evaluate("state.online.status")) === 'error') return t.skip(`上游不可用，跳过实机核对：${await evaluate("state.online.error")}`);
  }
  if (!rows) return t.skip('没有搜索结果，跳过实机播放核对');
  // 列表是整块重渲染的：点之前确认目标行已经在 DOM 里
  const waitRow = async (index) => {
    for (let i = 0; i < 30; i++) {
      if (await rowCount() > index) return true;
      await sleep(300);
    }
    return false;
  };

  const SOUND = `(function () {
    // 音频图是懒创建的：第一次点播放时可能还没有 analyser / audioElement，先给零值别抛
    var out = {
      avg: 0,
      onlineId: state.currentTrack ? (state.currentTrack.onlineId || '') : '',
      title: state.currentTrack ? (state.currentTrack.title || '') : '',
      playing: state.isPlaying,
      t: 0, err: 0, xo: ''
    };
    if (audioElement) {
      out.t = Number(audioElement.currentTime.toFixed(2));
      out.err = audioElement.error ? audioElement.error.code : 0;
      out.xo = String(audioElement.crossOrigin);
    }
    if (analyser) {
      var bins = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(bins);
      var sum = 0;
      for (var i = 0; i < bins.length; i++) sum += bins[i];
      out.avg = Math.round(sum / bins.length);
    }
    return JSON.stringify(out);
  })()`;

  let playedWithSound = 0;
  const notes = [];
  for (const provider of ['netease', 'qq', 'joox', 'kuwo']) {
    const idx = await evaluate(`(state.online.results||[]).findIndex(function (r) { return r.provider === ${JSON.stringify(provider)}; })`);
    if (typeof idx !== 'number' || idx < 0) continue;
    if (!(await waitRow(idx))) continue;
    const want = JSON.parse(await evaluate(`JSON.stringify({ id: state.online.results[${idx}].id, title: state.online.results[${idx}].title })`));
    const clicked = await evaluate(`(function(){
      var rows = document.querySelectorAll('#onlineResults .online-song-row');
      var row = rows[${idx}];
      if (!row) return 'NO-ROW';
      var button = row.querySelector('.online-action-primary');
      if (!button) return 'NO-BUTTON';
      button.click();
      return 'ok';
    })()`);
    assert.strictEqual(clicked, 'ok', `${provider} 这一行点得到「立即播放」`);

    // 先等到「被点的那一首」成为当前曲目，再看有没有声音 / 报错：
    // 上一首还在播时 analyser 本来就有能量，抢跑会误判（也会让点击的异步解析漏到用例之后）。
    let snap = JSON.parse(await evaluate(SOUND));
    let switched = false;
    for (let i = 0; i < 20; i++) {
      await sleep(800);
      snap = JSON.parse(await evaluate(SOUND));
      if (snap.onlineId !== want.id) continue;
      switched = true;
      if (snap.avg >= 5 || snap.err) break;
    }
    if (!switched) {
      // 上游太慢或直接不给地址：如实记一笔，不把上游问题算成播放器失败
      notes.push(`${provider} 未在预算内切到该曲（实际 ${snap.onlineId || '无'}）`);
      continue;
    }
    if (snap.err) {
      // 上游 CDN 拒绝（反盗链 / 链接过期）属于真实失败：允许，但必须是被点的那一首失败
      notes.push(`${provider} 上游拒绝（err=${snap.err}）`);
      continue;
    }
    // 切到被点的那一首之后，必须真的有声音（无声音时 analyser 平均能量接近 0）
    assert.strictEqual(snap.xo, 'anonymous', `${provider}：远程音源走 CORS 模式`);
    assert.ok(snap.avg >= 5, `${provider}：真的有声音（analyser 平均能量 ${snap.avg}，无声音时接近 0）`);
    playedWithSound += 1;
  }
  assert.ok(playedWithSound >= 1, `至少有一个平台真的出声（其余：${notes.join('；') || '无'}）`);
});

test('实机：点击下载只下被点的那一首，真实进度 → 落盘音频文件有效', async (t) => {
  if (!wsUrl) return t.skip('未运行应用实例，跳过实机核对');
  const rows = await evaluate("document.querySelectorAll('#onlineResults .online-song-row').length");
  if (!rows) return t.skip('上一步没有搜索结果，跳过实机下载核对');

  const before = JSON.parse(await evaluate(PLAY_STATE));
  // 清掉上一次运行留下的下载状态：这次必须真的重新下载一遍，不能复用旧结果
  await evaluate("state.online.downloads.clear()");
  const startedAt = Date.now();
  const title = await evaluate("(function(){ var btn = document.querySelector('#onlineResults .online-song-row .online-download-btn'); var row = btn.closest('.online-song-row'); var name = row.querySelector('strong').textContent; btn.click(); return name; })()");
  assert.ok(title, '点到了具体某一首');

  let record = null;
  for (let i = 0; i < 120; i++) {
    await sleep(500);
    const raw = await evaluate("JSON.stringify(Array.from(state.online.downloads.values()).sort(function (a, b) { return (b.received || 0) - (a.received || 0); })[0] || null)");
    record = JSON.parse(raw || 'null');
    if (record && (record.status === 'done' || record.status === 'error' || record.status === 'cancelled')) break;
  }
  assert.ok(record, '下载任务已被创建');
  assert.notStrictEqual(record.status, 'error', `下载不应失败（真实错误：${record.error || ''} ${record.errorMessage || ''}）`);
  assert.strictEqual(record.status, 'done', '下载完成');
  assert.ok(record.filePath && fs.existsSync(record.filePath), `落盘文件存在：${record.filePath}`);
  const stat = fs.statSync(record.filePath);
  const size = stat.size;
  assert.ok(size >= 100 * 1024, `文件大小真实（${size} 字节）`);
  assert.ok(stat.mtimeMs >= startedAt - 2000, '文件是本次点击下载产生的，不是复用旧结果');
  assert.ok(Number(record.received) > 0, `进度里有真实字节数（${record.received}）`);
  assert.strictEqual(size, Number(record.received), '上报字节数与磁盘大小一致');
  assert.ok(looksLikeAudio(record.filePath), `文件头是真实音频容器格式（${path.extname(record.filePath)}）`);
  // 用真正的解码器加载刚下载的文件：能读出时长才算“下载的文件能正常播放”
  const decodable = await evaluate(`(async function () {
    var src = api.toFileUrl(${JSON.stringify(record.filePath)});
    return await new Promise(function (resolve) {
      var audio = new Audio();
      var settled = false;
      var finish = function (value) { if (!settled) { settled = true; try { audio.src = ''; } catch (e) {} resolve(value); } };
      audio.preload = 'metadata';
      audio.addEventListener('loadedmetadata', function () { finish(Number.isFinite(audio.duration) && audio.duration > 0); });
      audio.addEventListener('error', function () { finish(false); });
      setTimeout(function () { finish(false); }, 15000);
      audio.src = src;
    });
  })()`, 30000);
  assert.strictEqual(decodable, true, '下载下来的文件能被音频解码器正常打开（不是坏文件）');

  const after = JSON.parse(await evaluate(PLAY_STATE));
  assert.strictEqual(after.track, before.track, '下载没有切换当前播放曲目');
  assert.strictEqual(after.paused, before.paused, '下载没有触发播放');
  assert.strictEqual(after.count, before.count, '下载没有往队列里加歌');

  try { fs.rmSync(record.filePath, { force: true }); } catch { /* 只删本次测试自己下载出来的文件 */ }
});
