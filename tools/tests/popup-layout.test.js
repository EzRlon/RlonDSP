const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const css = fs.readFileSync(path.join(ROOT, 'src', 'styles.css'), 'utf8');
const renderer = fs.readFileSync(path.join(ROOT, 'src', 'renderer.js'), 'utf8');

test('设置 Popup 使用固定 Header + 唯一 Body 滚动区', () => {
  assert.ok(css.includes('#settingsModal .modal-card'));
  assert.ok(css.includes('max-height: calc(100vh - 158px)'));
  assert.ok(css.includes('#settingsModal .modal-body'));
  assert.ok(css.includes('overflow-y: auto'));
  assert.ok(css.includes('min-height: 0'));
});

test('自定义源使用左导航 + 右编辑区，且支持折叠', () => {
  assert.ok(css.includes('.online-source-layout'));
  assert.ok(css.includes('grid-template-columns: auto minmax(0, 1fr)'));
  assert.ok(css.includes('.online-source-nav.collapsed'));
  assert.ok(renderer.includes("navCollapsed"));
  assert.ok(renderer.includes("sourceManagement",));
});

test('自定义源表单统一栅格且 Switch 不拉伸', () => {
  assert.ok(css.includes('.online-source-field'));
  assert.ok(css.includes('grid-template-columns: minmax(120px, 170px) minmax(0, 1fr)'));
  assert.ok(css.includes('.online-source-field .switch'));
  assert.ok(css.includes('justify-self: start'));
});

test('实时音效卡片双击空白关闭只绑定 effectsModal，且不绑定 document/body', () => {
  assert.ok(renderer.includes("effectsModal.addEventListener('dblclick'"));
  assert.ok(renderer.includes('event.target !== effectsModal'));
  assert.ok(!renderer.includes("document.addEventListener('dblclick'"));
  assert.ok(!renderer.includes("body.addEventListener('dblclick'"));
});
