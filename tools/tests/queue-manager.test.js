/*
 * RlonDSP 播放队列数据层（Queue Manager）测试
 * 覆盖 P0 持久化投影 / P1 删除·插队·重排·定位 / P2 下一首决策（顺序与随机）/ P3 多队列。
 * 纯数据层测试：不启动界面、不碰音频链。
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const { createQueueManager } = require(path.join('..', '..', 'src', 'queue-manager.js'));

function localTrack(name) {
  return { path: `C:\\Music\\${name}.flac`, title: name, artist: 'Artist', album: 'Album', duration: 180, cover: '' };
}

function onlineTrack(id) {
  return {
    id: `online:src_x:${id}`,
    onlineId: id,
    sourceId: 'src_x',
    sourceType: 'declarative',
    resourceType: 'song',
    title: `Online ${id}`,
    artist: 'Artist',
    album: 'Album',
    duration: 30,
    cover: '',
    path: `online:src_x:${id}`,
    url: 'https://example.com/preview.m4a'
  };
}

/** 固定随机序列（0 → 保持原序），便于确定性断言 */
function fixedRandom() {
  return 0;
}

function makeState() {
  return { tracks: [], currentIndex: -1, currentTrack: null };
}

function makeManager(options = {}) {
  const state = makeState();
  const saves = [];
  const manager = createQueueManager({
    state,
    storage: {
      load: async () => options.snapshot || null,
      save: async (snapshot) => { saves.push(snapshot); }
    },
    readMetadata: async (filePath) => ({ title: ' hydrated ' + filePath.slice(-5), duration: 200 }),
    getPlayMode: () => options.mode || 'list',
    random: options.random || fixedRandom,
    now: () => 1000
  });
  return { manager, state, saves };
}

async function flushManager(manager) {
  await manager.flush();
}

test('Queue 是真相源：state.tracks / state.currentIndex 只是兼容投影', async () => {
  const { manager, state } = makeManager();
  await manager.init();
  assert.deepStrictEqual(state.tracks, [], '空队列投影为空');
  assert.strictEqual(state.currentIndex, -1);

  manager.appendTracks([localTrack('A'), localTrack('B')]);
  assert.strictEqual(state.tracks.length, 2, '追加后投影同步');
  assert.strictEqual(manager.getActiveQueue().songs.length, 2, '真相源是 activeQueue.songs');

  manager.setCurrentTrackKey(manager.keyAtIndex(1));
  assert.strictEqual(state.currentIndex, 1, '索引由 currentTrackKey 反查得到');
  assert.strictEqual(state.currentTrack.title, 'B');

  // 重新排序后，索引跟着身份走，不会指向错误曲目
  manager.moveTrack(manager.keyAtIndex(1), 0);
  assert.strictEqual(state.tracks[0].title, 'B');
  assert.strictEqual(state.currentIndex, 0, '重排后当前曲目身份不丢失');
  assert.strictEqual(state.currentTrack.title, 'B');
});

test('trackKey：本地=path，在线=sourceId+onlineId；身份不因重启改变', async () => {
  const { manager, state, saves } = makeManager();
  await manager.init();
  const local = localTrack('A');
  const online = onlineTrack('t1');
  manager.appendTracks([local, online]);
  assert.strictEqual(manager.trackKey(local), local.path);
  assert.strictEqual(manager.trackKey(online), 'online:src_x:t1');
  assert.strictEqual(state.tracks.length, 2);

  await flushManager(manager);
  const snapshot = saves[saves.length - 1];
  const onlineEntry = snapshot.queues[0].songs[1];
  assert.strictEqual(onlineEntry.onlineId, 't1');
  assert.strictEqual(onlineEntry.sourceId, 'src_x');
  assert.strictEqual(onlineEntry.url, undefined, '在线临时播放地址不落盘');
  assert.strictEqual(snapshot.queues[0].songs[0].cover, undefined, '本地封面 dataURL 不落盘');
});

test('P1 删除：删除非当前曲目不影响播放；删除当前曲目能接播下一首；删空即停止', async () => {
  const { manager, state } = makeManager();
  await manager.init();
  const tracks = ['A', 'B', 'C'].map(localTrack);
  manager.appendTracks(tracks);
  manager.setCurrentTrackKey(manager.trackKey(tracks[1]));
  assert.strictEqual(state.currentIndex, 1);

  // 删除非当前曲目：当前曲目与索引都不受影响
  manager.removeTrack(manager.trackKey(tracks[0]));
  assert.strictEqual(state.currentTrack.title, 'B', '删除别的歌不影响正在播放的曲目');
  assert.strictEqual(state.currentIndex, 0, '索引按新顺序重新反查');
  assert.deepStrictEqual(state.tracks.map((t) => t.title), ['B', 'C']);

  // 删除当前曲目：调用方据此接播下一首（决策交给 nextKey）
  const wasCurrent = state.tracks[state.currentIndex];
  manager.removeTrack(manager.trackKey(wasCurrent));
  assert.strictEqual(manager.getActiveQueue().currentTrackKey, '', '当前曲目被删除后身份清空');
  assert.strictEqual(state.currentIndex, -1);
  const decision = manager.nextKey({ automatic: true });
  assert.strictEqual(decision.key, manager.trackKey(state.tracks[0]), '接播剩余队列里的第一首');

  // 删到空：nextKey 不再返回任何曲目
  manager.removeTrack(manager.trackKey(state.tracks[0]));
  assert.strictEqual(state.tracks.length, 0);
  assert.strictEqual(manager.nextKey({ automatic: true }), null, '空队列不出下一首');
  assert.strictEqual(manager.previousKey(), null, '空队列不出上一首');
});

test('P1 queuedNext：先插队 LIFO，依次插队 FIFO，自动 next 优先消费', async () => {
  const { manager } = makeManager();
  await manager.init();
  const tracks = ['A', 'B', 'C', 'X', 'Y'].map(localTrack);
  manager.appendTracks(tracks);
  const keyOf = (name) => manager.trackKey(tracks.find((t) => t.title === name));
  manager.setCurrentTrackKey(keyOf('A'));

  // 连续两次「下一首播放」= LIFO：Y 在 X 之前播
  manager.enqueueNext(keyOf('X'), 'cut');
  manager.enqueueNext(keyOf('Y'), 'cut');
  assert.deepStrictEqual(manager.listQueuedNext(), [keyOf('Y'), keyOf('X')]);
  assert.strictEqual(manager.nextKey({ automatic: true }).key, keyOf('Y'));
  manager.setCurrentTrackKey(keyOf('Y'));
  assert.strictEqual(manager.nextKey({ automatic: true }).key, keyOf('X'));
  manager.setCurrentTrackKey(keyOf('X'));
  // 插队消费完后回到普通顺序（X 在队列里的下一首是 Y）
  const sequential = manager.nextKey({ automatic: true });
  assert.strictEqual(sequential.source, 'sequential');
  assert.strictEqual(sequential.key, keyOf('Y'));

  // 连续「依次插队」= FIFO：先加的 X 先播
  manager.enqueueNext(keyOf('X'), 'sequence');
  manager.enqueueNext(keyOf('Y'), 'sequence');
  assert.deepStrictEqual(manager.listQueuedNext(), [keyOf('X'), keyOf('Y')]);
});

test('P2 普通模式：A → B → C，Previous 回到 B', async () => {
  const { manager } = makeManager({ mode: 'list' });
  await manager.init();
  const tracks = ['A', 'B', 'C'].map(localTrack);
  manager.appendTracks(tracks);
  const keyOf = (name) => manager.trackKey(tracks.find((t) => t.title === name));

  manager.setCurrentTrackKey(keyOf('A'));
  assert.strictEqual(manager.nextKey({ automatic: true }).key, keyOf('B'));
  manager.setCurrentTrackKey(keyOf('B'));
  assert.strictEqual(manager.nextKey({ automatic: true }).key, keyOf('C'));
  manager.setCurrentTrackKey(keyOf('C'));
  assert.strictEqual(manager.previousKey().key, keyOf('B'), 'Previous 回到真实上一首 B');
  manager.setCurrentTrackKey(keyOf('B'));
  assert.strictEqual(manager.previousKey().key, keyOf('A'));
  manager.setCurrentTrackKey(keyOf('A'));
  assert.strictEqual(manager.previousKey().key, keyOf('C'), '到头部后回到底部，保持既有循环语义');
});

test('P2 随机模式：一轮不重复，Previous 按真实播放历史回退', async () => {
  const { manager } = makeManager({ mode: 'random' });
  await manager.init();
  const tracks = ['A', 'B', 'C', 'D'].map(localTrack);
  manager.appendTracks(tracks);
  const keyOf = (name) => manager.trackKey(tracks.find((t) => t.title === name));

  manager.setCurrentTrackKey(keyOf('A'));
  const played = [keyOf('A')];
  for (let i = 0; i < 3; i++) {
    const decision = manager.nextKey({ automatic: true });
    played.push(decision.key);
    manager.setCurrentTrackKey(decision.key);
  }
  assert.strictEqual(new Set(played).size, played.length, `一轮之内不重复：${played.join(' → ')}`);
  assert.deepStrictEqual(new Set(played), new Set(Object.values({ ...tracks.reduce((acc, t) => ({ ...acc, [t.title]: manager.trackKey(t) }), {}) })));

  // Previous：回到真正上一次播放的曲目（不是 index-1）
  const beforePrevious = played[played.length - 1];
  const step = manager.previousKey();
  assert.strictEqual(step.key, played[played.length - 2], 'Shuffle 的 Previous 走播放历史');
  assert.notStrictEqual(step.key, beforePrevious);
  manager.setCurrentTrackKey(step.key);
  assert.strictEqual(manager.previousKey().key, played[played.length - 3], '可连续回退');
});

test('P2 一轮播完后自动开新一轮，仍然不立刻重复当前曲目', async () => {
  const { manager } = makeManager({ mode: 'random' });
  await manager.init();
  const tracks = ['A', 'B', 'C'].map(localTrack);
  manager.appendTracks(tracks);
  const keyOf = (name) => manager.trackKey(tracks.find((t) => t.title === name));
  manager.setCurrentTrackKey(keyOf('A'));
  const cycle = [keyOf('A')];
  for (let i = 0; i < 2; i++) {
    const decision = manager.nextKey({ automatic: true });
    cycle.push(decision.key);
    manager.setCurrentTrackKey(decision.key);
  }
  assert.strictEqual(new Set(cycle).size, 3, '第一轮覆盖全部三首');
  const next = manager.nextKey({ automatic: true });
  assert.ok(next && next.key, '新一轮仍然能出歌');
  assert.notStrictEqual(next.key, cycle[2], '新一轮不会立刻重复当前曲目');
});

test('P2 队列变化后随机池不产生孤儿/重复：删除与重排后仍正确', async () => {
  const { manager } = makeManager({ mode: 'random' });
  await manager.init();
  const tracks = ['A', 'B', 'C', 'D'].map(localTrack);
  manager.appendTracks(tracks);
  const keyOf = (name) => manager.trackKey(tracks.find((t) => t.title === name));
  manager.setCurrentTrackKey(keyOf('A'));
  manager.nextKey({ automatic: true });

  const removedKey = keyOf('C');
  manager.removeTrack(removedKey);
  const info = manager.getShuffleInfo();
  assert.strictEqual(info.order.includes(removedKey), false, '已删除曲目不在随机池');
  assert.strictEqual(new Set(info.order).size, info.order.length, '随机池无重复');
  assert.deepStrictEqual(
    info.order.filter((key) => !manager.getActiveQueue().songs.some((t) => manager.trackKey(t) === key)),
    [],
    '随机池没有孤儿 key'
  );
  assert.strictEqual(info.history.includes(removedKey), false, '历史里也没有已删除曲目');

  manager.moveTrack(keyOf('D'), 0);
  const afterMove = manager.getShuffleInfo();
  assert.strictEqual(new Set(afterMove.order).size, afterMove.order.length, '重排后随机池依旧无重复');
  assert.strictEqual(afterMove.order.length, manager.getActiveQueue().songs.length, '随机池覆盖全部剩余曲目');

  // 一轮内不会把已删除的曲目再播一次
  for (let i = 0; i < 6; i++) {
    const decision = manager.nextKey({ automatic: true });
    if (!decision) break;
    assert.notStrictEqual(decision.key, removedKey, '已删除歌曲不会再次播放');
    manager.setCurrentTrackKey(decision.key);
  }
});

test('P2 单曲队列与空队列行为正确', async () => {
  const { manager } = makeManager({ mode: 'list' });
  await manager.init();
  const only = localTrack('Solo');
  manager.appendTracks([only]);
  manager.setCurrentTrackKey(manager.trackKey(only));
  assert.strictEqual(manager.nextKey({ automatic: true }).key, manager.trackKey(only), '单曲队列下一首还是自己');
  assert.strictEqual(manager.previousKey().key, manager.trackKey(only), '单曲队列上一首也是自己');
  manager.clearActiveQueue();
  assert.strictEqual(manager.nextKey({ automatic: true }), null);
  assert.strictEqual(manager.previousKey(), null);
  assert.deepStrictEqual(manager.getShuffleInfo().order, [], '清空后随机池同步清理');
});

test('P3 多队列：切换保留各自的顺序与 currentTrackKey，历史队列只读', async () => {
  const { manager, state } = makeManager();
  await manager.init();
  const localA = localTrack('A');
  const localB = localTrack('B');
  manager.appendTracks([localA, localB]);
  manager.setCurrentTrackKey(manager.trackKey(localA));

  // 新建一个真实队列（手动队列），它有自己的顺序与当前曲目
  const manual = manager.ensureQueue('queue:manual', { kind: 'manual', sourceType: 'manual', title: '我的队列' });
  manager.appendTracks([localTrack('M1'), localTrack('M2')], { queueId: manual.id });
  // 非活动队列也要能记录自己的当前曲目（身份按 key）
  manager.setCurrentTrackKey(manager.trackKey(localTrack('M1')), manual.id);
  assert.strictEqual(manager.getQueue('queue:manual').currentTrackKey, manager.trackKey(localTrack('M1')));
  assert.strictEqual(manager.setActiveQueue('queue:manual'), true);
  assert.strictEqual(state.tracks.length, 2);
  assert.strictEqual(state.tracks[0].title, 'M1');

  // 切回本地队列：它自己的顺序与当前曲目都还在
  manager.setActiveQueue('queue:local');
  assert.deepStrictEqual(state.tracks.map((t) => t.title), ['A', 'B'], '每个队列保留自己的顺序');
  assert.strictEqual(manager.getActiveQueue().currentTrackKey, manager.trackKey(localA), '每个队列保留自己的 currentTrackKey');

  // 手动队列受保护，不能删除
  assert.strictEqual(manager.removeQueue('queue:manual', { archive: true }), false, '手动队列受保护');

  // 删除一个普通内容队列 → 归档成只读历史队列（真实数据，不是假条目）
  const temporary = manager.ensureQueue('queue:playlist:demo', { kind: 'manual', sourceType: 'playlist', title: '示例歌单' });
  manager.appendTracks([localTrack('P1')], { queueId: temporary.id });
  assert.strictEqual(manager.removeQueue(temporary.id, { archive: true }), true);
  const history = manager.listQueues().find((queue) => queue.kind === 'history');
  assert.ok(history, '删除后的队列进入历史（真实数据，不是假条目）');
  assert.strictEqual(history.readonly, true, '历史队列只读');
  assert.strictEqual(manager.setActiveQueue(history.id), false, '只读历史队列不能被直接激活');
  assert.strictEqual(manager.getQueue(history.id).songs.length, 1, '历史队列保留了被删除队列的真实内容');

  // 接管历史队列：新建可写的活动队列，且不共享 songs 引用
  const taken = manager.takeOverQueue(history.id);
  assert.ok(taken && taken.id !== history.id, '接管创建新的 active Queue');
  assert.notStrictEqual(taken.songs, manager.getQueue(history.id).songs, '不共享可变 songs 引用');
  assert.strictEqual(manager.getActiveQueueId(), taken.id);
  manager.getQueue(history.id).songs.push(localTrack('tamper'));
  assert.strictEqual(taken.songs.length, 1, '改历史队列不会影响已接管的队列');
});

test('手动队列受保护：不可删除；活动队列不可被删除', async () => {
  const { manager } = makeManager();
  await manager.init();
  manager.ensureQueue('queue:manual', { kind: 'manual' });
  assert.strictEqual(manager.removeQueue('queue:manual'), false, '手动队列受保护');
  assert.strictEqual(manager.removeQueue('queue:local'), false, '当前活动队列不能删除（用清空）');
});

test('持久化：重启后顺序 / 当前曲目 / 插队 / 随机状态都能恢复', async () => {
  const first = makeManager({ mode: 'random' });
  await first.manager.init();
  const tracks = ['A', 'B', 'C', 'D'].map(localTrack);
  first.manager.appendTracks(tracks);
  first.manager.setCurrentTrackKey(first.manager.trackKey(tracks[1]));
  first.manager.enqueueNext(first.manager.trackKey(tracks[2]), 'sequence');
  first.manager.enqueueNext(first.manager.trackKey(tracks[3]), 'cut');
  // 消费掉队首（tracks[3]），剩下 tracks[2] 应该被持久化
  assert.strictEqual(first.manager.nextKey({ automatic: true }).key, first.manager.trackKey(tracks[3]));
  first.manager.moveTrack(first.manager.trackKey(tracks[0]), 2);
  await first.manager.flush();
  const snapshot = first.saves[first.saves.length - 1];
  assert.strictEqual(snapshot.version, 1);
  assert.strictEqual(snapshot.activeQueueId, 'queue:local');
  assert.deepStrictEqual(snapshot.queues[0].songs.map((song) => song.title), ['B', 'C', 'A', 'D'], '重排后的真实顺序被持久化');
  assert.strictEqual(snapshot.queues[0].currentTrackKey, 'C:\\Music\\B.flac', '当前曲目身份被持久化');
  assert.deepStrictEqual(snapshot.queues[0].queuedNext, ['C:\\Music\\C.flac'], '未消费的插队列表被持久化');
  assert.ok(snapshot.shuffle['queue:local'], '随机状态被持久化');

  // 重启：用同一份快照重新 init
  const second = makeManager({ snapshot });
  const summary = await second.manager.init();
  assert.strictEqual(summary.trackCount, 4, '重启后队列内容完全恢复');
  assert.deepStrictEqual(second.state.tracks.map((track) => track.title), ['B', 'C', 'A', 'D'], '重启后顺序完全一致');
  const restoredCurrent = second.manager.getActiveQueue().currentTrackKey;
  assert.strictEqual(second.state.tracks[second.state.currentIndex] ? second.manager.trackKey(second.state.tracks[second.state.currentIndex]) : '', restoredCurrent,
    '重启后当前曲目仍然可定位');
  assert.ok(second.manager.getShuffleInfo().order.length > 0, '重启后随机池恢复');
});

test('清空后重启仍为空（清空会真实写盘）', async () => {
  const { manager, saves } = makeManager();
  await manager.init();
  manager.appendTracks(['A', 'B'].map(localTrack));
  await manager.flush();
  manager.clearActiveQueue();
  await manager.flush();
  const snapshot = saves[saves.length - 1];
  assert.deepStrictEqual(snapshot.queues[0].songs, [], '清空结果落盘');
  const restarted = makeManager({ snapshot });
  await restarted.manager.init();
  assert.strictEqual(restarted.state.tracks.length, 0, '重启后仍为空');
});

test('恢复：本地元数据懒加载失败不破坏整个队列；在线曲目不带旧 URL 恢复', async () => {
  const snapshot = {
    version: 1,
    activeQueueId: 'queue:local',
    lastActiveQueueId: 'queue:local',
    queues: [{
      id: 'queue:local',
      kind: 'local',
      sourceType: 'local',
      sourceId: '',
      title: '',
      subtitle: '',
      currentTrackKey: 'C:\\Music\\A.flac',
      queuedNext: [],
      createdAt: 1,
      updatedAt: 1,
      dynamic: false,
      songs: [
        { kind: 'local', path: 'C:\\Music\\A.flac', title: '', artist: '', album: '', duration: 0 },
        { kind: 'online', sourceType: 'declarative', sourceId: 'src_x', onlineId: 't1', title: 'Online t1', duration: 30 }
      ]
    }]
  };
  const { manager, state } = makeManager({ snapshot });
  await manager.init();
  assert.strictEqual(state.tracks.length, 2);
  assert.strictEqual(state.tracks[1].url, '', '在线旧播放地址不恢复');
  assert.strictEqual(state.currentTrack.title.length > 0, true, '当前曲目仍能定位');
});

test('最近添加侧表：追加顺序保持，重排不重写，重启按 Queue 顺序还原相对先后', async () => {
  const { manager, saves } = makeManager();
  await manager.init();
  const a = localTrack('A');
  const b = localTrack('B');
  const c = localTrack('C');
  manager.appendTracks([a, b, c]);
  const queue = manager.getActiveQueue();
  const keyA = manager.trackKey(a);
  const keyB = manager.trackKey(b);
  const keyC = manager.trackKey(c);
  assert.ok(manager.addedSequence(queue.id, keyA) < manager.addedSequence(queue.id, keyB), 'A 先于 B 加入');
  assert.ok(manager.addedSequence(queue.id, keyB) < manager.addedSequence(queue.id, keyC), 'B 先于 C 加入');

  // 拖拽重排只改真实 Queue 顺序，不改「最近添加」侧表
  manager.moveTrack(keyA, 2);
  assert.deepStrictEqual(manager.getActiveQueue().songs.map(manager.trackKey), [keyB, keyC, keyA], '重排后真实顺序变化');
  assert.ok(manager.addedSequence(queue.id, keyA) < manager.addedSequence(queue.id, keyB), '最近添加顺序不因重排改变');

  await manager.flush();
  const snapshot = saves[saves.length - 1];
  const restarted = makeManager({ snapshot });
  await restarted.manager.init();
  const restoredQueue = restarted.manager.getActiveQueue();
  assert.ok(restarted.manager.addedSequence(restoredQueue.id, keyB) < restarted.manager.addedSequence(restoredQueue.id, keyA),
    '重启后按 Queue 顺序还原相对先后（精度只到导入/队列顺序）');
});

test('历史队列的只读属性在重启后仍然生效', async () => {
  const first = makeManager();
  await first.manager.init();
  const temp = first.manager.ensureQueue('queue:playlist:archive', { kind: 'manual', sourceType: 'playlist', title: 'Archive' });
  first.manager.appendTracks([localTrack('P1')], { queueId: temp.id });
  assert.strictEqual(first.manager.removeQueue(temp.id, { archive: true }), true);
  await first.manager.flush();
  const snapshot = first.saves[first.saves.length - 1];

  const second = makeManager({ snapshot });
  await second.manager.init();
  const history = second.manager.listQueues().find((queue) => queue.kind === 'history');
  assert.ok(history, '重启后历史队列仍存在');
  assert.strictEqual(history.readonly, true, '历史队列重启后仍是只读');
  assert.strictEqual(second.manager.setActiveQueue(history.id), false, '只读历史队列重启后也不能直接激活');
});

test('渲染层把播放模式接到 Queue Manager：单曲循环/随机不会被当成顺序播放', () => {
  const root = path.join(__dirname, '..', '..');
  const renderer = fs.readFileSync(path.join(root, 'src', 'renderer.js'), 'utf8');
  const createCall = renderer.slice(renderer.indexOf('window.RlonQueueManager.createQueueManager'));
  assert.ok(createCall.includes('getPlayMode: () => state.mode'),
    'createQueueManager 必须传入 getPlayMode，否则 nextKey/previousKey 会忽略单曲循环与随机模式');
});
