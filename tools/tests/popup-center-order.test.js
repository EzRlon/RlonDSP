const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const css = fs.readFileSync(path.join(ROOT, 'src', 'styles.css'), 'utf8');
const html = fs.readFileSync(path.join(ROOT, 'src', 'index.html'), 'utf8');
const renderer = fs.readFileSync(path.join(ROOT, 'src', 'renderer.js'), 'utf8');

test('实时音效/脉冲反馈 Popup 在客户区居中且不超出可用 viewport', () => {
  assert.ok(css.includes('top: 44px'));
  assert.ok(css.includes('bottom: 82px'));
  assert.ok(css.includes('align-items: center'));
  assert.ok(css.includes('justify-content: center'));
  assert.ok(css.includes('max-height: calc(100vh - 158px)'));
  assert.ok(css.includes('max-width: calc(100vw - 32px)'));
  assert.ok(css.includes('.modal-card.effects-card.pulse-mode'));
});

test('实时音效 Header 固定，内容区滚动', () => {
  assert.ok(css.includes('.panel-head'));
  assert.ok(css.includes('flex: none'));
  assert.ok(css.includes('.fx-body { flex: 1; min-height: 0;'));
  assert.ok(css.includes('.fx-scroll'));
  assert.ok(css.includes('overflow-y: auto'));
});

test('限幅移动到实时音效功能列表最后', () => {
  const ids = [...html.matchAll(/class="fx-section" id="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(ids.length > 0);
  assert.strictEqual(ids[ids.length - 1], 'limiterParams');
  assert.ok(ids.indexOf('flangerParams') < ids.indexOf('limiterParams'));
});

test('RlonIR_3 从预设列表移除且不再自动生成', () => {
  assert.ok(renderer.includes("DEPRECATED_PRESET_NAMES"));
  assert.ok(renderer.includes("'RlonIR_3'"));
  assert.ok(renderer.includes('api.deletePreset(preset.id)'));
  assert.ok(renderer.includes('!isDeprecatedPreset(preset)'));
  assert.ok(renderer.includes('if (DEPRECATED_PRESET_NAMES.has(name))'));
});
