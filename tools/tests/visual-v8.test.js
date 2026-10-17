const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ENGINE = path.resolve(__dirname, '..', '..', 'src', 'visual-engine.js');

function loadEngine() {
  const sandbox = {
    window: {},
    document: { documentElement: {} },
    performance: { now: () => Date.now() },
    console,
    Math,
    Float32Array,
    Uint8Array,
    Uint32Array,
    requestAnimationFrame: () => 0,
    cancelAnimationFrame: () => {},
    setTimeout,
    clearTimeout
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(ENGINE, 'utf8'), sandbox, { filename: ENGINE });
  return sandbox.RlonVisualEngine;
}

function makeFreq(profile) {
  const freq = new Uint8Array(1024);
  const set = (a, b, v) => {
    const i0 = Math.floor(freq.length * a);
    const i1 = Math.floor(freq.length * b);
    for (let i = i0; i < i1; i++) freq[i] = Math.round(255 * v);
  };
  set(0, 0.04, profile.bass || 0);
  set(0.04, 0.12, profile.lowMid || 0);
  set(0.12, 0.32, profile.mid || 0);
  set(0.32, 0.6, profile.highMid || 0);
  set(0.6, 1, profile.treble || 0);
  return freq;
}

test('Visual Engine V8 可以加载并保留现有 8 个效果注册', () => {
  const engine = loadEngine();
  assert.ok(engine);
  assert.strictEqual(engine.registry.length, 8);
  assert.ok(engine.registry.every((def) => typeof def.id === 'string' && typeof def.render === 'function'));
});

test('Kick 音频事件产生即时冲量并注入共享 Motion Field', () => {
  const engine = loadEngine();
  const bus = engine.createBus();
  const metrics = { peakDb: -6, rmsDb: -12, integrated: -14, width: 0.5, corr: 0.8, balance: 0 };
  for (let i = 0; i < 24; i++) {
    bus.update({ dt: 0.016, metrics, freqBytes: makeFreq({ bass: 0.02, mid: 0.02, treble: 0.01 }), timeData: new Float32Array(128) });
  }
  bus.update({ dt: 0.016, metrics, freqBytes: makeFreq({ bass: 0.95, lowMid: 0.5, mid: 0.4 }), timeData: new Float32Array(128) });
  assert.ok(bus.value.impulse.kick > 0, 'Kick 应产生非零即时冲量');
  assert.ok(bus.value.motionField.count > 0, 'Kick 应向 Motion Field 注入波源');
  assert.ok(Number.isFinite(bus.value.impulse.kick));
  assert.ok(Number.isFinite(bus.value.energy));
  assert.ok(Number.isFinite(bus.value.motion.beatEnvelope));
});

test('Motion Field 冲击波有传播延迟，近处先于远处响应', () => {
  const engine = loadEngine();
  const bus = engine.createBus();
  const metrics = { peakDb: -6, rmsDb: -12, integrated: -14, width: 0.5, corr: 0.8, balance: 0 };
  bus.update({ dt: 0.016, metrics, freqBytes: makeFreq({ bass: 0.2 }), timeData: new Float32Array(128) });
  const field = bus.value.motionField;
  field.emit(0.5, 0.5, 1.2, 'kick', 0, 0.06, 0.55, 1.4);
  field.update(0.08, bus.value);
  const near = { x: 0, y: 0, pressure: 0, shock: 0 };
  const far = { x: 0, y: 0, pressure: 0, shock: 0 };
  field.sample(0.5, 0.5, 0.08, near);
  field.sample(0.92, 0.92, 0.08, far);
  assert.ok(Number.isFinite(near.x) && Number.isFinite(near.y));
  assert.ok(near.shock > far.shock, `冲击波应先到达近处，near=${near.shock} far=${far.shock}`);
});
