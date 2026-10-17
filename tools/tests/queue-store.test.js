/* RlonDSP 队列持久化（主进程侧 queue-store）测试：白名单 / 版本 / 裁剪 / 串行原子写 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { createQueueStore, sanitizeSnapshot, MAX_QUEUES } = require('../../queue-store');

function dir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'rlondsp-queue-'));
}

function queue(id, songs, extra = {}) {
  return {
    id,
    kind: 'local',
    sourceType: 'local',
    sourceId: '',
    title: '',
    subtitle: '',
    currentTrackKey: '',
    queuedNext: [],
    createdAt: 1,
    updatedAt: 1,
    dynamic: false,
    songs,
    ...extra
  };
}

test('白名单校验：未知字段、凭据、临时播放地址、本地封面都不落盘', async () => {
  const dirPath = dir();
  const store = createQueueStore({ userDataDir: dirPath });
  await store.write({
    version: 99,
    activeQueueId: 'queue:local',
    token: 'SECRET-TOKEN',
    queues: [queue('queue:local', [
      { kind: 'local', path: '/music/a.flac', title: 'A', cover: 'data:image/jpeg;base64,AAAA', cookie: 'x' },
      { kind: 'online', sourceType: 'declarative', sourceId: 'src_1', onlineId: 't1', title: 'Online', url: 'https://tmp.example/preview.m4a', key: 'nope' }
    ], { currentTrackKey: '/music/a.flac', queuedNext: ['/music/a.flac'], authorization: 'Bearer x' })]
  });
  const raw = fs.readFileSync(store.file, 'utf8');
  assert.strictEqual(/SECRET-TOKEN|data:image|Bearer|https:\/\/tmp\.example/.test(raw), false, '不含凭据 / 封面 / 临时地址');
  assert.strictEqual(JSON.parse(raw).version, 1, '版本号被规范为当前版本');
  const snapshot = await store.read();
  assert.deepStrictEqual(snapshot.queues[0].songs[0].title, 'A');
  assert.strictEqual(snapshot.queues[0].songs[0].cover, undefined);
  assert.strictEqual(snapshot.queues[0].songs[1].url, undefined, '在线临时播放地址不保存');
  assert.deepStrictEqual(snapshot.queues[0].queuedNext, ['/music/a.flac']);
});

test('结构损坏 / 未知版本 / 空文件都安全回退为空队列，不抛错', async () => {
  const dirPath = dir();
  const store = createQueueStore({ userDataDir: dirPath });
  fs.writeFileSync(store.file, '{ this is not json');
  const broken = await store.read();
  assert.deepStrictEqual(broken.queues, []);
  fs.writeFileSync(store.file, JSON.stringify({ version: 999, queues: 'nope' }));
  assert.deepStrictEqual((await store.read()).queues, []);
  fs.rmSync(store.file);
  assert.deepStrictEqual((await store.read()).queues, []);
});

test('容量裁剪：队列 ≤ 6，优先保护 activeQueue 与 lastActiveQueue', async () => {
  const queues = [];
  for (let i = 0; i < 9; i++) {
    queues.push(queue(`queue:test:${i}`, [], { createdAt: i, updatedAt: i }));
  }
  const snapshot = sanitizeSnapshot({
    activeQueueId: 'queue:test:8',
    lastActiveQueueId: 'queue:test:7',
    queues
  });
  const trimmed = require('../../queue-store').trimSnapshot(snapshot);
  assert.strictEqual(trimmed.queues.length, MAX_QUEUES);
  const ids = trimmed.queues.map((item) => item.id);
  assert.ok(ids.includes('queue:test:8'), 'activeQueue 被保护');
  assert.ok(ids.includes('queue:test:7'), 'lastActiveQueue 被保护');
  assert.strictEqual(ids.includes('queue:test:0'), false, '最旧的非活动队列被淘汰');
});

test('串行 + 原子写：连续写入不并发，最终文件完整且没有残留临时文件', async () => {
  const dirPath = dir();
  const store = createQueueStore({ userDataDir: dirPath });
  const writes = [];
  for (let i = 0; i < 5; i++) {
    writes.push(store.write({ activeQueueId: 'queue:local', queues: [queue('queue:local', [{ kind: 'local', path: `/music/${i}.flac` }])] }));
  }
  await Promise.all(writes);
  const raw = fs.readFileSync(store.file, 'utf8');
  const parsed = JSON.parse(raw);
  assert.strictEqual(parsed.queues[0].songs.length, 1);
  assert.strictEqual(parsed.queues[0].songs[0].path, '/music/4.flac', '最后写入的快照生效');
  assert.strictEqual(fs.existsSync(`${store.file}.tmp`), false, '临时文件已经被原子替换掉');
});

test('本地文件校验：不存在的文件标记 available=false，但不从队列里删除', async () => {
  const dirPath = dir();
  const store = createQueueStore({ userDataDir: dirPath });
  const real = path.join(dirPath, 'exists.flac');
  fs.writeFileSync(real, 'x');
  await store.write({
    activeQueueId: 'queue:local',
    queues: [queue('queue:local', [
      { kind: 'local', path: real },
      { kind: 'local', path: path.join(dirPath, 'missing.flac') },
      { kind: 'local', path: path.join(dirPath, 'not-audio.txt') }
    ])]
  });
  const snapshot = await store.read();
  const byPath = (name) => snapshot.queues[0].songs.find((song) => song.path.endsWith(name));
  assert.strictEqual(byPath('exists.flac').available, true);
  assert.strictEqual(byPath('missing.flac').available, false, '文件不存在：标记不可用但不删除');
  assert.strictEqual(byPath('not-audio.txt'), undefined, '非音频扩展名在校验阶段被拒绝');
});
