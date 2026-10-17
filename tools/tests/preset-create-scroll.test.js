const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const html = fs.readFileSync(path.join(ROOT, 'src', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'src', 'styles.css'), 'utf8');
const renderer = fs.readFileSync(path.join(ROOT, 'src', 'renderer.js'), 'utf8');

test('新建预设按钮存在并绑定创建事件', () => {
  assert.ok(html.includes('id="createPresetBtn"'));
  assert.ok(renderer.includes("on('createPresetBtn', 'click', createPreset)"));
  assert.ok(renderer.includes('async function createPreset()'));
  assert.ok(renderer.includes('uniquePresetName'));
});

test('新建预设走持久化并自动定位', () => {
  assert.ok(renderer.includes('api.savePreset(preset)'));
  assert.ok(renderer.includes('lastCreatedPresetId = preset.id'));
  assert.ok(renderer.includes("created.scrollIntoView({ block: 'nearest' })"));
  assert.ok(renderer.includes('return createPreset()'));
});

test('预设列表独立纵向滚动', () => {
  assert.ok(html.includes('id="presetListViewport"'));
  assert.ok(css.includes('.preset-list-viewport'));
  assert.ok(css.includes('max-height: clamp(120px, 30vh, 300px)'));
  assert.ok(css.includes('overflow-y: auto'));
  assert.ok(css.includes('overflow-x: hidden'));
});

test('删除或新建后自动补位，不保留占位', () => {
  assert.ok(renderer.includes("list.innerHTML = ''"));
  assert.ok(renderer.includes('state.presets.filter((preset) => preset.type !== \'pulse\' && !isDeprecatedPreset(preset))'));
});
