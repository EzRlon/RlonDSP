const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..', '..');
const WORKLET = path.join(ROOT, 'src', 'dsp-worklet.js');
const RENDERER = path.join(ROOT, 'src', 'renderer.js');
const HTML = path.join(ROOT, 'src', 'index.html');
const RATE = 48000;

function loadProcessor() {
  let captured = null;
  class StubProcessor {
    constructor() { this.port = { onmessage: null, postMessage() {} }; }
  }
  const sandbox = {
    sampleRate: RATE,
    currentTime: 0,
    AudioWorkletProcessor: StubProcessor,
    registerProcessor: (name, cls) => { captured = cls; },
    console, Float32Array, Int32Array, Math, Number
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(WORKLET, 'utf8'), sandbox, { filename: WORKLET });
  return captured;
}

function make(params, plan) {
  const P = loadProcessor();
  const p = new P();
  p.port.onmessage({ data: { type: 'params', params: { ...params, plan } } });
  return p;
}

function run(p, l, r) {
  const oL = new Float32Array(l.length);
  const oR = new Float32Array(r.length);
  for (let off = 0; off < l.length; off += 128) {
    const n = Math.min(128, l.length - off);
    p.process([[l.subarray(off, off + n), r.subarray(off, off + n)]], [[oL.subarray(off, off + n), oR.subarray(off, off + n)]]);
  }
  return [oL, oR];
}

function sine(n, freq, amp, phase = 0) {
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = amp * Math.sin((2 * Math.PI * freq * i) / RATE + phase);
  return a;
}

function diff(a, b) {
  let d = 0;
  for (let i = 0; i < a.length; i++) d = Math.max(d, Math.abs(a[i] - b[i]));
  return d;
}

function maxAbs(a) {
  let m = 0;
  for (let i = 0; i < a.length; i++) m = Math.max(m, Math.abs(a[i]));
  return m;
}

function sourceBetween(source, startText, endText) {
  const start = source.indexOf(startText);
  assert.ok(start >= 0, `missing ${startText}`);
  const end = source.indexOf(endText, start);
  assert.ok(end > start, `missing ${endText}`);
  return source.slice(start, end);
}

test('FIX-01 Spatial roomSize 真正进入 DSP', () => {
  const l = sine(2048, 440, 0.5);
  const r = sine(2048, 440, 0.5, Math.PI * 0.5);
  const base = { enabled: { surround: true }, surround: { roomSize: 0, crossfeed: 1, width: 1, depth: 1, center: 0.5 } };
  const wide = { enabled: { surround: true }, surround: { roomSize: 2, crossfeed: 1, width: 1, depth: 1, center: 0.5 } };
  const [a] = run(make(base, { steps: [{ kind: 'node', type: 'spatial' }] }), l, r);
  const [b] = run(make(wide, { steps: [{ kind: 'node', type: 'spatial' }] }), l, r);
  assert.ok(diff(a, b) > 0.001, 'roomSize 应改变 Spatial 输出');
});

test('FIX-02 Preset 加载同步 DSP Graph', () => {
  const src = fs.readFileSync(RENDERER, 'utf8');
  const body = sourceBetween(src, 'function applyPreset(', '\nlet audioElement');
  assert.ok(body.includes('syncDspGraph()'), 'applyPreset 必须调用 syncDspGraph');
});

test('FIX-03 Preset 深合并默认参数，旧 Preset 不产生 undefined', () => {
  const src = fs.readFileSync(RENDERER, 'utf8');
  const helper = sourceBetween(src, 'function isPlainObject', 'const warnedMissingIds');
  const sandbox = { JSON, Object, Array };
  vm.createContext(sandbox);
  vm.runInContext(helper + '\nthis.deepMergeEffects = deepMergeEffects;', sandbox);
  const merged = sandbox.deepMergeEffects(
    { compressor: { thresholdDB: -24, knee: 6 }, enabled: { limiter: true } },
    { compressor: { thresholdDB: -20 }, enabled: { reverb: true } }
  );
  assert.strictEqual(merged.compressor.knee, 6);
  assert.strictEqual(merged.compressor.thresholdDB, -20);
  assert.strictEqual(merged.enabled.limiter, true);
  assert.strictEqual(merged.enabled.reverb, true);
});

test('FIX-04 Gate hysteresis 参与开关门限', () => {
  const src = fs.readFileSync(WORKLET, 'utf8');
  const gate = sourceBetween(src, 'stageGate(outL, outR, n)', 'stageChannelDelay(outL, outR, n)');
  assert.ok(gate.includes('closeThresholdLin'), 'stageGate 必须使用 closeThresholdLin');
  const input = new Float32Array(8192);
  for (let i = 0; i < 2048; i++) input[i] = Math.sin(2 * Math.PI * 1000 * i / RATE) * 0.2;
  for (let i = 2048; i < input.length; i++) input[i] = Math.sin(2 * Math.PI * 1000 * i / RATE) * 0.015;
  const base = { enabled: { noiseGate: true }, gate: { threshold: -30, attackMs: 1, releaseMs: 10, holdMs: 0, rangeDB: 60, ratio: 2, sidechainHz: 20, hysteresisDB: 0 } };
  const hyst = { enabled: { noiseGate: true }, gate: { threshold: -30, attackMs: 1, releaseMs: 10, holdMs: 0, rangeDB: 60, ratio: 2, sidechainHz: 20, hysteresisDB: 12 } };
  const [a] = run(make(base, { steps: [{ kind: 'node', type: 'gate' }] }), input, input);
  const [b] = run(make(hyst, { steps: [{ kind: 'node', type: 'gate' }] }), input, input);
  assert.ok(maxAbs(b.subarray(7000)) > maxAbs(a.subarray(7000)), 'hysteresis 应保持门开启更久');
});

test('FIX-05 Limiter lookahead UI 允许 0', () => {
  const html = fs.readFileSync(HTML, 'utf8');
  assert.ok(/id="limiterLookahead"[^>]*min="0"/.test(html), 'limiterLookahead min 必须为 0');
});

test('FIX-06 Dynamic EQ range=0 与 DSP 一致且透明', () => {
  const input = sine(2048, 440, 0.4);
  const params = { enabled: { dynEq: true }, dynEq: { freq: 440, q: 1, gainDB: -18, threshold: -60, range: 0, attackMs: 1, releaseMs: 20 } };
  const [out] = run(make(params, { steps: [{ kind: 'node', type: 'dyn-eq' }] }), input, input);
  assert.ok(diff(input, out) < 1e-6, 'range=0 应不产生动态增益');
});

test('FIX-07 Tube drive=0 透明', () => {
  const input = sine(1024, 440, 0.5);
  const params = { enabled: { tube: true }, tube: { drive: 0, bias: 0, character: 0, symmetry: 1, mix: 1, oversample: 1 } };
  const [out] = run(make(params, { steps: [{ kind: 'node', type: 'tube' }] }), input, input);
  assert.ok(diff(input, out) < 1e-6, 'drive=0 应透明');
});

test('FIX-08 Limiter oversampling 参数有真实意义', () => {
  const input = new Float32Array(2048);
  for (let i = 0; i < input.length; i++) input[i] = (i % 2 ? -1 : 1) * 0.9;
  const base = { enabled: { limiter: true }, limiter: { ceilingDB: -6, lookaheadMs: 2, releaseMs: 60, truePeak: false, oversample: 1, stereoLink: 1, inputDB: 0, softClip: false, autoRelease: false } };
  const os = { enabled: { limiter: true }, limiter: { ...base.limiter, oversample: 4 } };
  const [a] = run(make(base, { steps: [{ kind: 'node', type: 'limiter' }] }), input, input);
  const [b] = run(make(os, { steps: [{ kind: 'node', type: 'limiter' }] }), input, input);
  assert.ok(diff(a, b) > 1e-4, 'oversampling=4 应改变 Limiter 检测结果');
  assert.ok(Number.isFinite(b[0]));
});

test('FIX-09 Preset/Reset 刷新 IR Graph', () => {
  const src = fs.readFileSync(RENDERER, 'utf8');
  const preset = sourceBetween(src, 'function applyPreset(', '\nlet audioElement');
  const reset = sourceBetween(src, 'function resetEffects()', 'async function loadPresets');
  assert.ok(preset.includes('updateIRGraph()'));
  assert.ok(reset.includes('updateIRGraph()'));
});

test('FIX-10 Reset 同步 DSP Graph', () => {
  const src = fs.readFileSync(RENDERER, 'utf8');
  const reset = sourceBetween(src, 'function resetEffects()', 'async function loadPresets');
  assert.ok(reset.includes('syncDspGraph()'));
});

test('FIX-11 高级 select 随语言切换刷新', () => {
  const src = fs.readFileSync(RENDERER, 'utf8');
  assert.ok(src.includes('option.dataset.i18n'), '动态 option 必须带 data-i18n');
  assert.ok(src.includes('filterPeaking') && src.includes('filterLowShelf'));
});

test('FIX-12 参数更新路径避免额外分配', () => {
  const src = fs.readFileSync(WORKLET, 'utf8');
  const body = sourceBetween(src, 'applyParams(p)', '// 内置引擎开关表');
  assert.ok(body.includes('mergeParamGroup'), 'applyParams 必须使用预分配 merge');
  assert.ok(!body.includes('Array.from'), 'applyParams 不应再使用 Array.from');
});

test('FIX-13 True Peak 使用 oversampling + 抗混叠 FIR', () => {
  const src = fs.readFileSync(WORKLET, 'utf8');
  assert.ok(src.includes('class PolyphaseOversampler'));
  assert.ok(src.includes('windowed-sinc'));
  const input = new Float32Array(2048);
  for (let i = 0; i < input.length; i++) input[i] = Math.sin(i * 0.7) * 0.95;
  const params = { enabled: { limiter: true }, limiter: { ceilingDB: -6, lookaheadMs: 2, releaseMs: 60, truePeak: true, oversample: 4, stereoLink: 1, inputDB: 0, softClip: false, autoRelease: false } };
  const [out] = run(make(params, { steps: [{ kind: 'node', type: 'limiter' }] }), input, input);
  for (let i = 0; i < out.length; i++) assert.ok(Number.isFinite(out[i]));
});
