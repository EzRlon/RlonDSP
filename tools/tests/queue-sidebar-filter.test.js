/*
 * RlonDSP 左侧栏本地音乐快速导航与智能筛选 —— 静态回归测试。
 * 不启动应用：只校验新增标记 / 图标 / i18n / Queue Manager API，避免把本功能做成第二套 UI。
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', '..');
function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

test('左侧栏筛选与多选只插入到现有播放中心，不替换把手结构', () => {
  const html = read('src/index.html');
  assert.ok(html.includes('id="queueFilterBar"'), '快速视图/筛选入口存在');
  assert.ok(html.includes('id="queueFilterPanel"'), '质量/文件夹筛选面板存在');
  assert.ok(html.includes('id="queueSelectionBar"'), '多选操作栏存在');
  assert.ok(html.includes('id="queueViewChips"'), '快速视图 chips 容器存在');
  assert.ok(html.includes('id="queueQualityChips"'), '质量筛选 chips 容器存在');
  assert.ok(html.includes('id="queueFolderTree"'), '文件夹树容器存在');

  const filterBar = html.indexOf('id="queueFilterBar"');
  const search = html.indexOf('id="playlistSearch"');
  const selectionBar = html.indexOf('id="queueSelectionBar"');
  const trackList = html.indexOf('id="trackList"');
  const handle = html.indexOf('id="playlistExpandBtn"');
  assert.ok(filterBar > 0 && filterBar < search, '筛选入口位于队列选择器与搜索之间');
  assert.ok(selectionBar > 0 && selectionBar < trackList, '多选操作栏位于列表上方');
  assert.ok(handle > trackList, '展开/收起把手仍是侧栏最后一个业务子元素');
});

test('筛选功能复用既有设计令牌，不建立第二套图标/文案体系', () => {
  const css = read('src/styles.css');
  const html = read('src/index.html');
  const registry = read('src/icon-registry.js');
  assert.ok(css.includes('.queue-filter-chip'), '筛选 chip 样式存在');
  assert.ok(css.includes('.queue-selection-bar'), '多选操作栏样式存在');
  assert.ok(css.includes('.track-item.is-selected'), '选中行状态样式存在');
  assert.ok(css.includes('.queue-empty[hidden]'), '空状态 [hidden] 必须显式 display:none，避免与 .queue-empty 的 display:flex 冲突');
  assert.ok(html.includes('id="icon-filter"'), '筛选图标已进入 sprite');
  assert.ok(registry.includes("filter: { cat: 'library'"), '筛选图标已登记到 Icon Registry');
});

test('新增 UI 文案 zh/en 成对存在', () => {
  const renderer = read('src/renderer.js');
  const keys = [
    'queueViewFilterHint',
    'queueFilterAll',
    'queueViewRecentAdded',
    'queueViewRecentPlayed',
    'queueViewUnplayed',
    'queueViewFavorites',
    'queueFilterToggle',
    'queueFilterQuality',
    'queueFilterFolder',
    'queueFilterClear',
    'queueQualityLossless',
    'queueQualityHiRes',
    'queueQuality24bit',
    'queueQualityHighSampleRate',
    'queueQualityMultichannel',
    'queueQualityUnknown',
    'queueSelectionCount',
    'queueSelectionPlay',
    'queueSelectionAdd',
    'queueSelectionFavorite',
    'queueSelectionRemove',
    'queueSelectionSelectAll',
    'queueSelectionClear',
    'queueFolderAll'
  ];
  for (const key of keys) {
    assert.ok(renderer.includes(`${key}:`), `${key} 文案已定义`);
  }
});

test('Queue Manager 暴露「最近添加」侧表 API，不持久化到 Track 字段', () => {
  const queueManager = require(path.join(root, 'src', 'queue-manager.js'));
  assert.strictEqual(typeof queueManager.createQueueManager, 'function');
  const state = { tracks: [], currentIndex: -1, currentTrack: null };
  const manager = queueManager.createQueueManager({
    state,
    storage: { load: async () => null, save: async () => {} },
    readMetadata: async () => ({ title: 'A', duration: 1, sampleRate: 0, bitrate: 0, channels: 0, bitdepth: 0, codec: '' }),
    now: () => 1000
  });
  assert.strictEqual(typeof manager.addedSequence, 'function', 'addedSequence API 可用');
});

test('左侧栏功能按钮为图标 + 提示，且筛选按钮不再占用「最近播放」宽度', () => {
  const html = read('src/index.html');
  const btnTag = (id) => {
    const start = html.indexOf(`id="${id}"`);
    assert.ok(start >= 0, `${id} 存在`);
    const end = html.indexOf('</button>', start);
    assert.ok(end >= 0, `${id} 是 button`);
    return html.slice(start, end + 9);
  };

  // 筛选按钮去掉文字：由 61px 缩到约 33px，避免与「最近播放」chip 重叠
  const toggle = btnTag('queueFilterToggle');
  assert.ok(toggle.includes('data-i18n-title="queueFilterToggle"'), '筛选按钮有 tooltip');
  assert.ok(!toggle.includes('<span data-i18n="queueFilterToggle"'), '筛选按钮不再内嵌文字');

  const selectionIds = [
    'queueSelectionPlay',
    'queueSelectionAdd',
    'queueSelectionFavorite',
    'queueSelectionRemove',
    'queueSelectionSelectAll',
    'queueSelectionClear'
  ];
  for (const id of selectionIds) {
    const tag = btnTag(id);
    assert.ok(tag.includes(`data-i18n-title="${id}"`), `${id} 有 tooltip`);
    assert.ok(!tag.includes(`<span data-i18n="${id}"`), `${id} 不再内嵌文字`);
  }

  for (const id of ['importFileBtn', 'importFolderBtn', 'locateCurrentBtn', 'clearPlaylistBtn']) {
    const tag = btnTag(id);
    assert.ok(tag.includes('data-i18n-title='), `${id} 有 tooltip`);
    assert.ok(!tag.includes('<span data-i18n='), `${id} 不再内嵌文字`);
  }
});

test('快速视图 chips 为图标 + 提示，且不显示文字', () => {
  const renderer = read('src/renderer.js');
  const html = read('src/index.html');
  const registry = read('src/icon-registry.js');
  // QUICK_VIEWS 每一项都带可视化图标
  for (const id of ['all', 'recent-added', 'recent-played', 'unplayed', 'favorites']) {
    assert.ok(renderer.includes(`id: '${id}'`), `${id} 快速视图存在`);
  }
  for (const icon of ['list', 'plus', 'clock', 'play', 'note']) {
    assert.ok(renderer.includes(`icon: '${icon}'`), `快速视图使用 icon-${icon}`);
  }
  // 渲染时不写 textContent，只写 svg + title/aria-label
  assert.ok(renderer.includes('chip.innerHTML = `<svg class="icon icon-sm"><use href="#icon-${item.icon}"></use></svg>`'), '快速视图 chips 只渲染图标');
  assert.ok(renderer.includes("chip.title = t(item.i18n)"), '快速视图 chips 有 title 提示');
  assert.ok(renderer.includes("chip.setAttribute('aria-label', t(item.i18n))"), '快速视图 chips 有 aria-label');
  // 新增 icon-clock 图元与登记表
  assert.ok(html.includes('id="icon-clock"'), 'icon-clock 图元存在');
  assert.ok(registry.includes('clock: {'), 'icon-clock 已登记到 Icon Registry');
});
