/*
 * RlonDSP
 * Copyright © 2026 RlonDSP. All rights reserved.
 * Based on Echomusic open-source project, modified and extended for RlonDSP.
 *
 * 实时 DSP 引擎测试：不依赖界面，直接把音频信号喂进 AudioWorklet 里的算法，
 * 验证限幅器、参数平滑、内置引擎让位等行为是否真的正确。
 *
 * 运行方式（项目根目录）：
 *   node --test tools/tests/
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const WORKLET = path.resolve(__dirname, '..', '..', 'src', 'dsp-worklet.js');
const FS_RATE = 48000;

/** 在沙箱里加载 AudioWorklet 源码，取出处理器类 */
function loadProcessor() {
  let captured = null;
  class StubProcessor {
    constructor() {
      this.port = { onmessage: null, postMessage() {} };
    }
  }
  const sandbox = {
    sampleRate: FS_RATE,
    currentTime: 0,
    AudioWorkletProcessor: StubProcessor,
    registerProcessor: (name, cls) => { captured = { name, cls }; },
    console
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(WORKLET, 'utf8'), sandbox, { filename: 'dsp-worklet.js' });
  if (!captured) throw new Error('未注册处理器');
  return captured.cls;
}

/** 建一个处理器，并把参数发进去 */
function makeProc(params) {
  const Proc = loadProcessor();
  const proc = new Proc();
  proc.port.onmessage({ data: { type: 'params', params } });
  return proc;
}

/** 跑一段信号，返回左右输出 */
function run(proc, left, right, block = 128) {
  const outL = new Float32Array(left.length);
  const outR = new Float32Array(right.length);
  for (let off = 0; off < left.length; off += block) {
    const n = Math.min(block, left.length - off);
    const inL = left.subarray(off, off + n);
    const inR = right.subarray(off, off + n);
    const oL = outL.subarray(off, off + n);
    const oR = outR.subarray(off, off + n);
    proc.process([[inL, inR]], [[oL, oR]]);
  }
  return { outL, outR };
}

function sine(n, freq, amp) {
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = amp * Math.sin(2 * Math.PI * freq * i / FS_RATE);
  return a;
}

function peakOf(arr) {
  let p = 0;
  for (let i = 0; i < arr.length; i++) {
    const v = Math.abs(arr[i]);
    if (v > p) p = v;
  }
  return p;
}

test('默认参数下信号应当基本透明（仅有限幅器前瞻延迟）', () => {
  const proc = makeProc({});
  const n = 4096;
  const sig = sine(n, 440, 0.3);
  const { outL } = run(proc, sig, sig);

  // 前 limLen 个样点是延迟线预热，跳过；其余应与输入一致
  const skip = proc.limLen;
  let maxDiff = 0;
  for (let i = skip + 256; i < n; i++) {
    maxDiff = Math.max(maxDiff, Math.abs(outL[i] - sig[i - skip]));
  }
  assert.ok(maxDiff < 1e-6, '默认参数下应基本透明，实际最大偏差 ' + maxDiff);
});

test('限幅器：过载信号不得超过上限（峰值保护生效）', () => {
  const ceilingDB = -1;
  const ceiling = Math.pow(10, ceilingDB / 20);
  const proc = makeProc({ limiter: { ceilingDB, lookaheadMs: 2, releaseMs: 60 } });

  const n = FS_RATE; // 1 秒
  const loud = sine(n, 220, 1.0);      // 0 dBFS，远超 -1 dBFS 上限
  const { outL, outR } = run(proc, loud, loud);

  const p = Math.max(peakOf(outL.subarray(2000)), peakOf(outR.subarray(2000)));
  assert.ok(p <= ceiling + 1e-6, '输出峰值 ' + p.toFixed(4) + ' 不应超过上限 ' + ceiling.toFixed(4));
  assert.ok(p > ceiling * 0.5, '限幅器不应把信号压得过小（实际 ' + p.toFixed(4) + '）');
});

test('限幅器：立体声联动，两声道使用同一增益', () => {
  const proc = makeProc({ limiter: { ceilingDB: -6, lookaheadMs: 2, releaseMs: 80 } });

  // 左声道很响、右声道较轻；两声道同相，便于逐样点比较增益
  const n = 8192;
  const left = sine(n, 200, 1.0);
  const right = sine(n, 200, 0.2);
  const { outL, outR } = run(proc, left, right);

  const skip = proc.limLen;              // 输出比输入恰好晚 limLen 个样点
  let worst = 0;
  let checked = 0;
  for (let i = skip + 2000; i < n; i++) {   // 跳过起始段，等增益包络稳定
    const inL = left[i - skip];
    const inR = right[i - skip];
    // 只在两个声道都有足够信号、除法数值稳定的样点上比较
    if (Math.abs(inL) < 0.5 || Math.abs(inR) < 0.1) continue;
    const gainL = outL[i] / inL;
    const gainR = outR[i] / inR;
    worst = Math.max(worst, Math.abs(gainL - gainR));
    checked++;
  }
  assert.ok(checked > 100, '应有足够的有效样点参与比较，实际 ' + checked);
  assert.ok(worst < 1e-3, '左右声道增益应相同（联动），实际最大差异 ' + worst.toFixed(6));
});

test('限幅器：前瞻生效——峰值到来之前就已开始压低', () => {
  const proc = makeProc({ limiter: { ceilingDB: -6, lookaheadMs: 3, releaseMs: 100 } });

  // 前段安静的 1 kHz 小信号，第 4000 个样点突然出现满幅冲击
  const n = 8000;
  const sig = new Float32Array(n);
  for (let i = 0; i < n; i++) sig[i] = 0.05 * Math.sin(2 * Math.PI * 1000 * i / FS_RATE);
  for (let i = 4000; i < 4200; i++) sig[i] = 0.99;

  const { outL } = run(proc, sig, sig);
  const skip = proc.limLen;

  // 输出与输入的对应关系：out[t] = in[t - skip] × 增益
  // 取「冲击到来前 20 个样点」，看它在输出里的那一刻是否已经被压低
  const inIdx = 4000 - 20;
  const outIdx = inIdx + skip;
  const gainAt = Math.abs(outL[outIdx]) / (Math.abs(sig[inIdx]) + 1e-12);
  assert.ok(gainAt < 0.98, '峰值到达前增益应已压低，实际 ' + gainAt.toFixed(4));
});

test('均衡器：参数变化是渐进的（防爆音），不是瞬间跳变', () => {
  const proc = makeProc({ eqGains: new Array(10).fill(0) });
  const silent = new Float32Array(1280);
  run(proc, silent, silent);   // 先跑几块，建立稳定状态

  // 突然把第 0 段推到 +12 dB
  proc.port.onmessage({ data: { type: 'params', params: { eqGains: [12, 0, 0, 0, 0, 0, 0, 0, 0, 0] } } });
  assert.strictEqual(proc.eqCurrent[0], 0, '参数刚下发、还没处理音频时不应跳变');

  run(proc, silent, silent);
  const first = proc.eqCurrent[0];
  assert.ok(first > 0 && first < 12, '第一步应处于 0 与目标之间，实际 ' + first);

  run(proc, silent, silent);
  const second = proc.eqCurrent[0];
  assert.ok(second > first, '应继续向目标逼近');

  // 跑足够多块之后应完全到达目标
  for (let i = 0; i < 60; i++) run(proc, silent, silent);
  assert.ok(Math.abs(proc.eqCurrent[0] - 12) < 0.01, '最终应到达目标值，实际 ' + proc.eqCurrent[0]);
});

test('内置引擎让位：开关表为 false 时该模块完全不参与处理', () => {
  // 把均衡器推到 +12 dB
  const params = { eqGains: [12, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
  const n = 4096;
  const sig = sine(n, 31, 0.25);

  const withEq = makeProc(params);
  const a = run(withEq, sig, sig);

  const withoutEq = makeProc({ ...params, builtins: { eq: false } });
  const b = run(withoutEq, sig, sig);

  const skip = withEq.limLen + 512;
  let diff = 0;
  for (let i = skip; i < n; i++) diff = Math.max(diff, Math.abs(a.outL[i] - b.outL[i]));
  assert.ok(diff > 0.01, '关闭内置均衡器后输出应当明显不同，实际差异 ' + diff);

  // 被 Provider 接管时，输出应等于未经均衡的原始信号
  let neutral = 0;
  for (let i = skip; i < n; i++) neutral = Math.max(neutral, Math.abs(b.outL[i] - sig[i - withEq.limLen]));
  assert.ok(neutral < 1e-6, '让位后不应再对该段做任何处理，实际偏差 ' + neutral);
});

test('开关表为 false 时，混响等模块同样不参与处理', () => {
  const n = 4096;
  const sig = sine(n, 440, 0.3);

  const reverbOn = makeProc({ enabled: { reverb: true } });
  const a = run(reverbOn, sig, sig);
  assert.ok(peakOf(a.outL) > 0, '开启混响应有输出');

  const superseded = makeProc({ enabled: { reverb: true }, builtins: { reverb: false } });
  const b = run(superseded, sig, sig);

  const skip = superseded.limLen + 512;
  let neutral = 0;
  for (let i = skip; i < n; i++) neutral = Math.max(neutral, Math.abs(b.outL[i] - sig[i - superseded.limLen]));
  assert.ok(neutral < 1e-6, '混响被接管后不应再处理，实际偏差 ' + neutral);
});

test('限幅器不是硬削波：输出波形不应出现顶部被压平的痕迹', () => {
  const ceilingDB = -6;
  const ceiling = Math.pow(10, ceilingDB / 20);
  const proc = makeProc({ limiter: { ceilingDB, lookaheadMs: 3, releaseMs: 120 } });

  const n = FS_RATE;
  const loud = sine(n, 220, 0.95);           // 需要约 5 dB 的衰减
  const { outL } = run(proc, loud, loud);

  // 统计有多少样点正好压在阈值上。真正的削波器会让一整段顶部都停在阈值，
  // 而前瞻限幅器只在正弦峰值附近短暂触及，连续样点数应该很少。
  let streak = 0;
  let maxRun = 0;
  for (let i = proc.limLen + 2000; i < n; i++) {
    if (Math.abs(Math.abs(outL[i]) - ceiling) < 1e-6) {
      streak++;
      if (streak > maxRun) maxRun = streak;
    } else {
      streak = 0;
    }
  }
  assert.ok(maxRun <= 3, '不应出现被压平的顶部，实际最长连续 ' + maxRun + ' 个样点');
});

test('限幅器在长时间过载下依然稳定（无 NaN / 无失控）', () => {
  const proc = makeProc({ limiter: { ceilingDB: -1, lookaheadMs: 2, releaseMs: 50 } });
  const n = FS_RATE * 2;
  const loud = sine(n, 100, 1.2);            // 故意超过满刻度
  const { outL, outR } = run(proc, loud, loud);

  const ceiling = Math.pow(10, -1 / 20);
  for (let i = proc.limLen + 1000; i < n; i++) {
    assert.ok(Number.isFinite(outL[i]), '第 ' + i + ' 个样点出现非法值');
    assert.ok(Number.isFinite(outR[i]), '第 ' + i + ' 个样点出现非法值');
  }
  const p = peakOf(outL.subarray(proc.limLen + 1000));
  assert.ok(p <= ceiling + 1e-6, '长时间过载下峰值仍不得超过上限，实际 ' + p.toFixed(4));
});

test('差分环绕：延迟右声道时，只有右声道被整体延后', () => {
  const ms = 10;
  const proc = makeProc({
    enabled: { limiter: false },
    channelDelay: { enabled: true, channel: 'R', ms }
  });
  const n = 8192;
  const imp = new Float32Array(n);
  imp[0] = 1;                       // 用一个脉冲来定位延迟

  const { outL, outR } = run(proc, imp, imp);
  const expected = Math.round(FS_RATE * ms / 1000);

  assert.ok(Math.abs(outL[0] - 1) < 1e-6, '左声道不应被延迟');
  assert.ok(Math.abs(outR[0]) < 1e-6, '右声道原位置应当为空');
  assert.ok(Math.abs(outR[expected] - 1) < 1e-6, '右声道应在 ' + expected + ' 帧后出现，实际位置 ' + outR.findIndex((v) => Math.abs(v) > 0.5));
});

test('差分环绕：切换到左声道时，改为延迟左声道', () => {
  const ms = 6;
  const proc = makeProc({
    enabled: { limiter: false },
    channelDelay: { enabled: true, channel: 'L', ms }
  });
  const n = 8192;
  const imp = new Float32Array(n);
  imp[0] = 1;

  const { outL, outR } = run(proc, imp, imp);
  const expected = Math.round(FS_RATE * ms / 1000);

  assert.ok(Math.abs(outR[0] - 1) < 1e-6, '右声道不应被延迟');
  assert.ok(Math.abs(outL[0]) < 1e-6, '左声道原位置应当为空');
  assert.ok(Math.abs(outL[expected] - 1) < 1e-6, '左声道应在 ' + expected + ' 帧后出现');
});

test('差分环绕：关闭时完全不影响信号', () => {
  const proc = makeProc({
    enabled: { limiter: false },
    channelDelay: { enabled: false, channel: 'R', ms: 20 }
  });
  const n = 4096;
  const sig = sine(n, 440, 0.5);
  const { outL, outR } = run(proc, sig, sig);

  let diff = 0;
  for (let i = 0; i < n; i++) {
    diff = Math.max(diff, Math.abs(outL[i] - sig[i]), Math.abs(outR[i] - sig[i]));
  }
  assert.ok(diff < 1e-6, '关闭时不应有任何变化，实际最大偏差 ' + diff);
});

test('差分环绕：延迟时间与设定值成比例', () => {
  const positions = [2, 10, 20, 30].map((ms) => {
    const proc = makeProc({
      enabled: { limiter: false },
      channelDelay: { enabled: true, channel: 'R', ms }
    });
    const n = 8192;
    const imp = new Float32Array(n);
    imp[0] = 1;
    const { outR } = run(proc, imp, imp);
    let idx = -1;
    for (let i = 0; i < n; i++) if (Math.abs(outR[i]) > 0.5) { idx = i; break; }
    return { ms, idx, expected: Math.round(FS_RATE * ms / 1000) };
  });

  positions.forEach((p) => {
    assert.strictEqual(p.idx, p.expected, p.ms + ' ms 应对应 ' + p.expected + ' 帧，实际 ' + p.idx);
  });
});
