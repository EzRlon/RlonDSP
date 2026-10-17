const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const WORKLET = path.resolve(__dirname, '..', '..', 'src', 'dsp-worklet.js');
const RATE = 48000;

function loadProcessor() {
  let captured = null;
  class StubProcessor {
    constructor() {
      this.port = { onmessage: null, postMessage() {} };
    }
  }
  const sandbox = {
    sampleRate: RATE,
    currentTime: 0,
    AudioWorkletProcessor: StubProcessor,
    registerProcessor: (name, cls) => { captured = cls; },
    console,
    Float32Array,
    Int32Array,
    Math,
    Number
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(WORKLET, 'utf8'), sandbox, { filename: WORKLET });
  if (!captured) throw new Error('AudioWorklet processor 未注册');
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
    p.process(
      [[l.subarray(off, off + n), r.subarray(off, off + n)]],
      [[oL.subarray(off, off + n), oR.subarray(off, off + n)]]
    );
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

function assertFinite(arr) {
  for (let i = 0; i < arr.length; i++) assert.ok(Number.isFinite(arr[i]), `索引 ${i} 出现非有限值`);
}

test('Limiter 新参数：softClip / input / truePeak / oversampling 进入 DSP', () => {
  const input = new Float32Array(512).fill(0.9);
  const base = { enabled: { limiter: true }, limiter: { ceilingDB: -6, lookaheadMs: 2, releaseMs: 60, inputDB: 0, softClip: false } };
  const soft = { enabled: { limiter: true }, limiter: { ceilingDB: -6, lookaheadMs: 2, releaseMs: 60, inputDB: 6, softClip: true, truePeak: true, oversample: 4, stereoLink: 0.2, autoRelease: true } };
  const a = make(base, { steps: [{ kind: 'node', type: 'limiter' }] });
  const b = make(soft, { steps: [{ kind: 'node', type: 'limiter' }] });
  const [aL] = run(a, input, input);
  const [bL] = run(b, input, input);
  assert.ok(diff(aL, bL) > 0.01, 'Limiter 新参数应改变输出');
  assertFinite(bL);
});

test('Stereo 新参数：Mid/Side、Bass Mono、Correlation Protect、Mix 进入 DSP', () => {
  const l = sine(1024, 220, 0.4);
  const r = sine(1024, 220, -0.4);
  const base = { enabled: { stereo: true }, stereo: { width: 0.5, midDB: 0, sideDB: 0, bassMono: 0, monoFreq: 120, correlationProtect: 0, mix: 1 } };
  const altered = { enabled: { stereo: true }, stereo: { width: 1.5, midDB: -6, sideDB: 6, bassMono: 1, monoFreq: 300, correlationProtect: 1, mix: 0.5 } };
  const [a] = run(make(base, { steps: [{ kind: 'node', type: 'stereo' }] }), l, r);
  const [b] = run(make(altered, { steps: [{ kind: 'node', type: 'stereo' }] }), l, r);
  assert.ok(diff(a, b) > 0.01, 'Stereo 新参数应改变输出');
  assertFinite(b);
});

test('Reverb 新参数：Diffusion、Width、Early Reflections、Mod、Low Cut、Ducking 进入 DSP', () => {
  const input = sine(4096, 440, 0.3);
  const base = { enabled: { reverb: true }, reverb: { roomSize: 1, t60: 2.6, damping: 0.55, wet: 0.5, predelay: 0.02 } };
  const altered = {
    enabled: { reverb: true },
    reverb: {
      roomSize: 2, t60: 5, damping: 0.2, wet: 0.9, predelay: 0.05,
      diffusion: 0.1, width: 0.1, earlyReflections: 1, modRate: 3, modAmount: 1,
      lowCut: 500, ducking: 1, duckSensitivity: 1
    }
  };
  const [a] = run(make(base, { steps: [{ kind: 'node', type: 'reverb' }] }), input, input);
  const [b] = run(make(altered, { steps: [{ kind: 'node', type: 'reverb' }] }), input, input);
  assert.ok(diff(a, b) > 0.001, 'Reverb 新参数应改变输出');
  assertFinite(b);
});

test('Compressor 新参数：Knee、Makeup、Lookahead、Sidechain、Link、Auto Release 进入 DSP', () => {
  const input = sine(2048, 220, 0.8);
  const base = { enabled: { compressor: true }, compressor: { thresholdDB: -24, ratio: 4, attackMs: 10, releaseMs: 120, knee: 0, makeupDB: 0, lookaheadMs: 0, sidechainHz: 80, stereoLink: 1, autoRelease: false } };
  const altered = { enabled: { compressor: true }, compressor: { thresholdDB: -24, ratio: 4, attackMs: 10, releaseMs: 120, knee: 24, makeupDB: 12, lookaheadMs: 5, sidechainHz: 1000, stereoLink: 0, autoRelease: true } };
  const [a] = run(make(base, { steps: [{ kind: 'node', type: 'compressor' }] }), input, input);
  const [b] = run(make(altered, { steps: [{ kind: 'node', type: 'compressor' }] }), input, input);
  assert.ok(diff(a, b) > 0.01, 'Compressor 新参数应改变输出');
  assertFinite(b);
});

test('Gate 新参数：Attack、Hold、Range、Ratio、Sidechain、Hysteresis 进入 DSP', () => {
  const input = new Float32Array(2048);
  for (let i = 0; i < input.length; i++) input[i] = i < 1024 ? 0.5 : 0.01;
  const base = { enabled: { noiseGate: true }, gate: { threshold: -30, attackMs: 1, releaseMs: 50, holdMs: 0, rangeDB: 0, ratio: 1, sidechainHz: 20, hysteresisDB: 0 } };
  const altered = { enabled: { noiseGate: true }, gate: { threshold: -30, attackMs: 20, releaseMs: 300, holdMs: 200, rangeDB: 60, ratio: 8, sidechainHz: 1500, hysteresisDB: 12 } };
  const [a] = run(make(base, { steps: [{ kind: 'node', type: 'gate' }] }), input, input);
  const [b] = run(make(altered, { steps: [{ kind: 'node', type: 'gate' }] }), input, input);
  assert.ok(diff(a, b) > 0.001, 'Gate 新参数应改变输出');
  assertFinite(b);
});

test('Clarity 新参数：Presence、Air、Target/Q、Exciter、Mix 进入 DSP', () => {
  const input = sine(2048, 6000, 0.3);
  const base = { enabled: { clarity: true }, clarity: { strength: 0.5, presenceDB: 0, airDB: 0, targetHz: 3500, targetQ: 1.2, exciter: 0, mix: 1 } };
  const altered = { enabled: { clarity: true }, clarity: { strength: 1, presenceDB: 9, airDB: 9, targetHz: 8000, targetQ: 6, exciter: 1, mix: 0.4 } };
  const [a] = run(make(base, { steps: [{ kind: 'node', type: 'clarity' }] }), input, input);
  const [b] = run(make(altered, { steps: [{ kind: 'node', type: 'clarity' }] }), input, input);
  assert.ok(diff(a, b) > 0.01, 'Clarity 新参数应改变输出');
  assertFinite(b);
});

test('Tube 新参数：Bias、Character、Symmetry、Mix、Oversampling 进入 DSP', () => {
  const input = sine(2048, 440, 0.6);
  const base = { enabled: { tube: true }, tube: { drive: 0.3, bias: 0, character: 0, symmetry: 1, mix: 1, oversample: 1 } };
  const altered = { enabled: { tube: true }, tube: { drive: 1, bias: 0.8, character: 1, symmetry: 0.1, mix: 0.5, oversample: 4 } };
  const [a] = run(make(base, { steps: [{ kind: 'node', type: 'tube' }] }), input, input);
  const [b] = run(make(altered, { steps: [{ kind: 'node', type: 'tube' }] }), input, input);
  assert.ok(diff(a, b) > 0.01, 'Tube 新参数应改变输出');
  assertFinite(b);
});

test('Bass 新参数：Sub、Harmonic、Slope、Bass Mono、Mix 进入 DSP', () => {
  const input = sine(2048, 60, 0.5);
  const base = { enabled: { bass: true }, bass: { gainDB: 6, crossoverHz: 80, subDB: 0, harmonic: 0, slope: 0.5, bassMono: 0, mix: 1 } };
  const altered = { enabled: { bass: true }, bass: { gainDB: 12, crossoverHz: 120, subDB: 12, harmonic: 1, slope: 1, bassMono: 1, mix: 0.5 } };
  const [a] = run(make(base, { steps: [{ kind: 'node', type: 'bass' }] }), input, input);
  const [b] = run(make(altered, { steps: [{ kind: 'node', type: 'bass' }] }), input, input);
  assert.ok(diff(a, b) > 0.01, 'Bass 新参数应改变输出');
  assertFinite(b);
});

test('Spatial 新参数：Crossfeed、Width、Depth、Center 进入 DSP', () => {
  const l = sine(2048, 440, 0.4);
  const r = sine(2048, 440, 0.4, Math.PI * 0.5);
  const base = { enabled: { surround: true }, surround: { roomSize: 1, crossfeed: 0, width: 1, depth: 0, center: 0.5 } };
  const altered = { enabled: { surround: true }, surround: { roomSize: 2, crossfeed: 1, width: 0.1, depth: 1, center: 1 } };
  const [a] = run(make(base, { steps: [{ kind: 'node', type: 'spatial' }] }), l, r);
  const [b] = run(make(altered, { steps: [{ kind: 'node', type: 'spatial' }] }), l, r);
  assert.ok(diff(a, b) > 0.01, 'Spatial 新参数应改变输出');
  assertFinite(b);
});

test('EQ 新参数：Frequency、Q、Type、Slope、M/S、Dynamic 进入 DSP', () => {
  const input = sine(2048, 500, 0.4);
  const base = { eqGains: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6], eqBands: Array.from({ length: 10 }, (_, i) => ({ freq: [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000][i], q: 1.2, type: 'peaking', slope: 0.5, ms: 0, dynamic: 0 })) };
  const altered = { eqGains: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6], eqBands: Array.from({ length: 10 }, (_, i) => ({ freq: [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000][i], q: 6, type: i === 4 ? 'bandpass' : 'peaking', slope: 1, ms: -1, dynamic: 1 })) };
  const [a] = run(make(base, { steps: [{ kind: 'node', type: 'eq' }] }), input, input);
  const [b] = run(make(altered, { steps: [{ kind: 'node', type: 'eq' }] }), input, input);
  assert.ok(diff(a, b) > 0.01, 'EQ 新参数应改变输出');
  assertFinite(b);
});
