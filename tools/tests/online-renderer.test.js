const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

test('在线资源不创建第二套音频链 / 播放器 / 队列', () => {
  const renderer = read('src/renderer.js');
  assert.strictEqual((renderer.match(/new AudioContext\(/g) || []).length, 1);
  assert.strictEqual((renderer.match(/new AudioWorkletNode\(/g) || []).length, 1);
  assert.strictEqual((renderer.match(/new Audio\(/g) || []).length, 1);
  // 队列重构后：在线 track 仍然进入同一条队列（只是写入入口变成 Queue Manager），
  // 没有第二套队列 / 播放器 / 音频链，state.tracks 依旧是兼容投影。
  assert.ok(renderer.includes('const index = queueManager.appendTrack(track)'), '在线 track 通过 Queue Manager 进入队列');
  assert.strictEqual(/state\.tracks\.push\(/.test(renderer), false, '不再直接 push 投影数组');
});

test('playTrack 支持在线 track.url', () => {
  const renderer = read('src/renderer.js');
  const start = renderer.indexOf('function playTrack(index)');
  const end = renderer.indexOf('function playTrackByKey', start);
  const body = renderer.slice(start, end);
  // 在线轨道优先用解析出来的 url；恢复后没有 url 的在线条目会被拒绝（不伪造地址），本地才回落到 file URL
  assert.ok(body.includes("let src = track.url ? track.url : ''"), '有 url 直接用 url');
  assert.ok(body.includes('resolveRestoredOnlineUrl(track)'), '在线条目播放前重新解析');
  assert.ok(body.includes('src = api.toFileUrl(track.path)'), '本地文件回落到 file URL');
});

test('viz-page 2 激活时 page 1 Visual Engine 停算', () => {
  const renderer = read('src/renderer.js');
  assert.ok(renderer.includes('Math.max(0, Math.min(2, Number(page) || 0))'));
  // 页面顺序对调后：索引语义集中在 VIZ_PAGE，视觉引擎仍然只绑定「沉浸视觉」那一页
  assert.ok(renderer.includes('const VIZ_PAGE = { online: 0, visual: 1, analysis: 2 }'));
  assert.ok(renderer.includes('visualEngine.setSceneActive(currentVizPage === VIZ_PAGE.visual)'));
  const html = read('src/index.html');
  assert.ok(html.includes('data-viz-page="0"') && html.includes('data-viz-page="1"') && html.includes('data-viz-page="2"'));
  assert.ok(html.includes('data-viz-dot="0"') && html.includes('data-viz-dot="1"') && html.includes('data-viz-dot="2"'));
  assert.ok(/viz-page--visual" data-viz-page="1"/.test(html), '沉浸视觉仍在第 2 页');
});

test('preload 暴露受控 online IPC 且 renderer 不直接 fetch 第三方', () => {
  const preload = read('preload.js');
  assert.ok(preload.includes("onlineSources: () => ipcRenderer.invoke('online:sources:list')"));
  assert.ok(preload.includes("onlineSearch:"));
  assert.ok(preload.includes("onlineResolve:"));
  assert.ok(preload.includes("onlineTestSource:"));
  const main = read('main.js');
  assert.ok(main.includes("online:sources:test"));
  const renderer = read('src/renderer.js');
  assert.ok(!/fetch\(['"]https?:/.test(renderer));
  assert.ok(!/require\(['"]node:(fs|net|http|https)['"]\)/.test(renderer));
});

test('在线资源 UI 文案进入 i18n', () => {
  const renderer = read('src/renderer.js');
  for (const key of ['onlineMusic', 'onlineResources', 'customSources', 'addSource', 'playNow', 'addToQueue']) {
    assert.ok(renderer.includes(`${key}:`), `missing i18n key ${key}`);
  }
});
