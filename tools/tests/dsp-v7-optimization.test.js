const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const WORKLET = path.resolve(__dirname, '..', '..', 'src', 'dsp-worklet.js');
const RATE = 48000;

function loadProcessor() {
  let captured = null;
  class StubProcessor { constructor() { this.port = { onmessage: null, postMessage() {} }; } }
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
  const oL = new Float32Array(l.length), oR = new Float32Array(r.length);
  for (let off = 0; off < l.length; off += 128) {
    const n = Math.min(128, l.length - off);
    p.process([[l.subarray(off, off+n), r.subarray(off, off+n)]], [[oL.subarray(off, off+n), oR.subarray(off, off+n)]]);
  }
  return [oL, oR];
}

function maxAbs(a) { let m = 0; for (const v of a) m = Math.max(m, Math.abs(v)); return m; }

test('Graph plan 真正决定内置 DSP 串行执行顺序', () => {
  const input = new Float32Array(256).fill(0.9);
  const off = { enabled: { limiter: false, clipper: true }, gainDB: 6, clipper: { thresholdDB: -6, ceilingDB: 0, drive: 2, mode: 'soft', mix: 1, outputDB: 0 } };
  const a = make(off, { steps: [{ kind: 'node', type: 'gain' }, { kind: 'node', type: 'clipper' }] });
  const b = make(off, { steps: [{ kind: 'node', type: 'clipper' }, { kind: 'node', type: 'gain' }] });
  const [aL] = run(a, input, input), [bL] = run(b, input, input);
  let diff = 0;
  for (let i = 20; i < 256; i++) diff = Math.max(diff, Math.abs(aL[i] - bL[i]));
  assert.ok(diff > 0.05, `两种 Graph 顺序应产生可测差异，实际 ${diff}`);
});

test('Reverb 左右状态完全独立，左侧脉冲不会通过内部状态泄漏到右侧', () => {
  const plan = { steps: [{ kind: 'node', type: 'reverb' }] };
  const p = make({ enabled: { limiter: false, reverb: true }, reverb: { wet: 1, roomSize: 1, t60: 2.6, damping: 0.55, predelay: 0.01 } }, plan);
  const l = new Float32Array(4096), r = new Float32Array(4096);
  l[0] = 1;
  const [, outR] = run(p, l, r);
  assert.ok(maxAbs(outR) < 1e-7, `右侧不应出现来自左侧 FDN 状态的泄漏，实际 ${maxAbs(outR)}`);
});

test('Reverb wet=0 能真正为干声，不再被 || 默认值覆盖', () => {
  const p = make({ enabled: { limiter: false, reverb: true }, reverb: { wet: 0, predelay: 0, damping: 0, t60: 0.05 } }, { steps: [{ kind: 'node', type: 'reverb' }] });
  const sig = new Float32Array(512);
  for (let i = 0; i < sig.length; i++) sig[i] = 0.2 * Math.sin(i * 0.13);
  const [o] = run(p, sig, sig);
  let err = 0;
  for (let i = 0; i < sig.length; i++) err = Math.max(err, Math.abs(o[i] - sig[i]));
  assert.ok(err < 1e-7, `wet=0 应为透明，实际最大误差 ${err}`);
});

test('Limiter ceiling=0 dBFS 参数有效', () => {
  const p = make({ limiter: { ceilingDB: 0, lookaheadMs: 2, releaseMs: 60 } }, { steps: [{ kind: 'node', type: 'limiter' }] });
  assert.ok(Math.abs(p.ceiling - 1) < 1e-12, `ceiling=0 应转换为线性 1，实际 ${p.ceiling}`);
});

test('Noise Gate 音频线程不再依赖逐采样临时对象返回值', () => {
  const source = fs.readFileSync(WORKLET, 'utf8');
  const gateSection = source.slice(source.indexOf('class NoiseGate'), source.indexOf('/** 把参数夹到安全范围'));
  assert.ok(!gateSection.includes('return { out'), 'NoiseGate 不应逐样本创建 {out,env,gain} 对象');
});

test('AudioWorklet process 阶段不存在动态 new/箭头函数分配', () => {
  const source = fs.readFileSync(WORKLET, 'utf8');
  const start = source.indexOf('  stageBass(');
  const end = source.indexOf('  process(inputs, outputs)', start);
  const stage = source.slice(start, end);
  assert.ok(!stage.includes('=>'), 'DSP stage 不应在实时处理路径创建闭包');
  assert.ok(!stage.includes('new Float32Array'), 'DSP stage 不应动态分配 Float32Array');
  assert.ok(!stage.includes('const peaks = ['), 'DSP stage 不应逐样本创建数组');
});

test('Dynamic EQ Range 真正进入动态增益归一化', () => {
  const source = fs.readFileSync(WORKLET, 'utf8');
  const idx = source.indexOf('stageDynEq(outL, outR, n)');
  const section = source.slice(idx, source.indexOf('stageMbComp(', idx));
  assert.ok(section.includes('this.dqRangeDB'), 'Dynamic EQ stage 必须读取 dqRangeDB');
  assert.ok(section.includes('over / Math.max(0.1, this.dqRangeDB)'), 'Dynamic EQ Range 必须参与归一化');
});

test('Clipper 软模式阈值以下保持干声，阈值上方连续过渡', () => {
  const p = make({ enabled: { limiter: false, clipper: true }, clipper: { thresholdDB: -6, ceilingDB: 0, drive: 2, mode: 'soft', mix: 1, outputDB: 0 } }, { steps: [{ kind: 'node', type: 'clipper' }] });
  const thr = Math.pow(10, -6/20);
  const s = new Float32Array([thr - 1e-5, thr + 1e-5, 0, 0]);
  const [o] = run(p, s, s);
  assert.ok(Math.abs(o[0] - s[0]) < 1e-6, '阈值以下应保持干声');
  assert.ok(Math.abs(o[1] - s[1]) < 0.05, '阈值刚上方不应发生巨大的输出跳变');
});
