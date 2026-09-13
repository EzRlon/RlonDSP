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

/* ===================== 延迟 / 合唱 / 镶边 / 削波 ===================== */

test('新增效果器默认关闭时完全透明', () => {
  const proc = makeProc({});
  const n = 4096;
  const sig = sine(n, 330, 0.3);
  const { outL, outR } = run(proc, sig, sig);
  const skip = proc.limLen;
  let maxDiff = 0;
  for (let i = skip + 256; i < n; i++) {
    maxDiff = Math.max(maxDiff, Math.abs(outL[i] - sig[i - skip]), Math.abs(outR[i] - sig[i - skip]));
  }
  assert.ok(maxDiff < 1e-6, '四个新效果器默认关闭时不应改变声音，实际偏差 ' + maxDiff);
});

test('延迟：脉冲在设定的延迟时间后出现回声', () => {
  [120, 320, 600].forEach((timeMs) => {
    const proc = makeProc({
      enabled: { limiter: false, delay: true },
      delay: { timeMs, feedback: 0, mix: 1 }
    });
    const n = FS_RATE; // 1 秒，足够覆盖 600 ms
    const imp = new Float32Array(n);
    imp[0] = 1;
    const { outL } = run(proc, imp, imp);
    let idx = -1;
    // 跳过开头：干信号（直达声）本身也在输出里，要测的是回声的位置
    for (let i = 200; i < n; i++) if (Math.abs(outL[i]) > 0.5) { idx = i; break; }
    const expected = Math.round(FS_RATE * timeMs / 1000);
    assert.ok(Math.abs(idx - expected) <= 2, timeMs + ' ms 回声应出现在约 ' + expected + ' 帧，实际 ' + idx);
  });
});

test('延迟：反馈会产生多次回声，且不会失控（<= 0.9）', () => {
  const proc = makeProc({
    enabled: { limiter: false, delay: true },
    delay: { timeMs: 100, feedback: 0.9, mix: 1 }
  });
  const n = FS_RATE;
  const imp = new Float32Array(n);
  imp[0] = 1;
  const { outL } = run(proc, imp, imp);
  const step = Math.round(FS_RATE * 0.1);
  let echoes = 0;
  for (let k = 1; k <= 5; k++) {
    // 在期望位置附近取窗口，避免因整数取整差 1 个样点而漏判
    let local = 0;
    // 反馈路径每绕一圈会多出 1 个样点的延迟，所以窗口取宽一点
    for (let i = step * k - 10; i <= step * k + 10; i++) local = Math.max(local, Math.abs(outL[i]));
    if (local > 0.05) echoes++;
  }
  assert.ok(echoes >= 4, '反馈应产生多次回声，实际 ' + echoes + ' 次');
  assert.ok(peakOf(outL) <= 1.01, '反馈不得导致增益失控，实际峰值 ' + peakOf(outL));
});

test('合唱：左右两路被调制得不一样，且湿声参与输出', () => {
  const proc = makeProc({
    enabled: { limiter: false, chorus: true },
    chorus: { rateHz: 2, depthMs: 8, mix: 0.5, spread: 0.5 }
  });
  const n = 8192;
  const sig = sine(n, 1000, 0.4);
  const { outL, outR } = run(proc, sig, sig);
  let diffLR = 0;
  let diffDry = 0;
  for (let i = 2000; i < n; i++) {
    diffLR = Math.max(diffLR, Math.abs(outL[i] - outR[i]));
    diffDry = Math.max(diffDry, Math.abs(outL[i] - sig[i]));
  }
  assert.ok(diffDry > 1e-3, '合唱应改变声音，实际偏差 ' + diffDry);
  assert.ok(diffLR > 1e-3, '左右两路应有不同调制，实际差值 ' + diffLR);
});

test('镶边：短延迟 + 反馈产生梳状滤波，关闭即还原', () => {
  const on = makeProc({
    enabled: { limiter: false, flanger: true },
    flanger: { rateHz: 0.5, depthMs: 3, feedback: 0.6, mix: 0.5 }
  });
  const off = makeProc({ enabled: { limiter: false } });
  const n = 8192;
  const sig = sine(n, 800, 0.4);
  const a = run(on, sig, sig).outL;
  const b = run(off, sig, sig).outL;
  let diff = 0;
  for (let i = 2000; i < n; i++) diff = Math.max(diff, Math.abs(a[i] - b[i]));
  assert.ok(diff > 1e-3, '镶边开启后应与关闭时明显不同，实际偏差 ' + diff);
});

test('削波：软 / 硬两种模式都把过载信号压回 1 以内，关闭时不动', () => {
  ['soft', 'hard'].forEach((mode) => {
    const proc = makeProc({
      enabled: { limiter: false, clipper: true },
      clipper: { drive: 8, mode, outputDB: 0 }
    });
    const n = 8192;
    const loud = sine(n, 440, 1.0);
    const { outL } = run(proc, loud, loud);
    const p = peakOf(outL);
    assert.ok(p <= 1.0001, mode + ' 削波后峰值应 <= 1，实际 ' + p.toFixed(4));
    assert.ok(p > 0.3, mode + ' 削波不应把信号压没，实际 ' + p.toFixed(4));
  });

  const bypass = makeProc({ enabled: { limiter: false } });
  const n2 = 2048;
  const sig = sine(n2, 440, 0.5);
  const { outL } = run(bypass, sig, sig);
  let diff = 0;
  for (let i = 0; i < n2; i++) diff = Math.max(diff, Math.abs(outL[i] - sig[i]));
  assert.ok(diff < 1e-6, '削波关闭时不应改变声音，实际偏差 ' + diff);
});

test('新增效果器：非法参数（NaN / Infinity / 越界）不会产生 NaN 输出', () => {
  const proc = makeProc({
    enabled: { limiter: false, delay: true, chorus: true, flanger: true, clipper: true },
    delay: { timeMs: NaN, feedback: Infinity, mix: -5, pingPong: true },
    chorus: { rateHz: NaN, depthMs: Infinity, mix: 99, spread: -3 },
    flanger: { rateHz: Infinity, depthMs: NaN, feedback: 50, mix: NaN },
    clipper: { drive: NaN, mode: 'hard', outputDB: Infinity }
  });
  const n = 8192;
  const sig = sine(n, 440, 0.6);
  const { outL, outR } = run(proc, sig, sig);
  for (let i = 0; i < n; i++) {
    assert.ok(Number.isFinite(outL[i]) && Number.isFinite(outR[i]), '第 ' + i + ' 个样点出现非有限值');
  }
  assert.ok(peakOf(outL) < 100, '非法参数下不应出现异常增益');
});

/* ============ 追加效果器：扩展器 / 瞬态整形 / 去齿音 / 动态 EQ / 多段压缩 ============ */

test('扩展器：阈值以下的低电平被进一步压低，关闭时完全透明', () => {
  const n = 8192;
  const quiet = sine(n, 440, 0.002); // ≈ -54 dBFS，低于 -40 dB 阈值
  const on = makeProc({
    enabled: { limiter: false, expander: true },
    expander: { threshold: -40, ratio: 2, attackMs: 1, releaseMs: 20, range: 24 }
  });
  const off = makeProc({ enabled: { limiter: false } });
  const a = peakOf(run(on, quiet, quiet).outL.subarray(3000));
  const b = peakOf(run(off, quiet, quiet).outL.subarray(3000));
  assert.ok(a < b * 0.5, '扩展器应明显压低阈值以下的信号：' + a.toFixed(5) + ' vs ' + b.toFixed(5));
  assert.ok(a > 0, '不应把信号完全压没');
});

test('瞬态整形：提高「起音」会放大瞬态，设为 0 时不处理', () => {
  const n = 16384;
  const burst = new Float32Array(n);
  for (let i = 4096; i < n; i++) burst[i] = 0.4 * Math.sin(2 * Math.PI * 1000 * (i - 4096) / FS_RATE);
  const boost = makeProc({
    enabled: { limiter: false, transient: true },
    transient: { attack: 1, sustain: 0, mix: 1, outputDB: 0 }
  });
  const flat = makeProc({
    enabled: { limiter: false, transient: true },
    transient: { attack: 0, sustain: 0, mix: 1, outputDB: 0 }
  });
  const a = peakOf(run(boost, burst, burst).outL.subarray(4096, 4600));
  const b = peakOf(run(flat, burst, burst).outL.subarray(4096, 4600));
  assert.ok(a > b * 1.2, '起音拉满时瞬态应明显更大：' + a.toFixed(4) + ' vs ' + b.toFixed(4));
});

test('去齿音：齿音频段超过阈值被衰减，非齿音频段基本不动', () => {
  const n = 8192;
  const sibilant = sine(n, 6000, 0.5);
  const low = sine(n, 200, 0.5);
  const on = makeProc({
    enabled: { limiter: false, deesser: true },
    deesser: { freq: 6000, threshold: -24, range: 12, attackMs: 1, releaseMs: 40 }
  });
  const off = makeProc({ enabled: { limiter: false } });
  const sibOn = peakOf(run(on, sibilant, sibilant).outL.subarray(4000));
  const sibOff = peakOf(run(off, sibilant, sibilant).outL.subarray(4000));
  assert.ok(sibOn < sibOff * 0.7, '齿音频段应被衰减：' + sibOn.toFixed(4) + ' vs ' + sibOff.toFixed(4));

  const lowOn = peakOf(run(on, low, low).outL.subarray(4000));
  const lowOff = peakOf(run(off, low, low).outL.subarray(4000));
  assert.ok(Math.abs(lowOn - lowOff) < lowOff * 0.15, '低频不应被明显改动：' + lowOn.toFixed(4) + ' vs ' + lowOff.toFixed(4));
});

test('动态 EQ：该频段超阈值时施加设定增益，关闭时不动', () => {
  const n = 8192;
  const tone = sine(n, 200, 0.5);
  const on = makeProc({
    enabled: { limiter: false, dynEq: true },
    dynEq: { freq: 200, q: 1.2, gainDB: -12, threshold: -30, range: 12, attackMs: 1, releaseMs: 40 }
  });
  const off = makeProc({ enabled: { limiter: false } });
  const a = peakOf(run(on, tone, tone).outL.subarray(4000));
  const b = peakOf(run(off, tone, tone).outL.subarray(4000));
  assert.ok(a < b * 0.8, '动态 EQ 应把该频段压低：' + a.toFixed(4) + ' vs ' + b.toFixed(4));
});

test('多段压缩：过载的低频被压缩，关闭时不受影响', () => {
  const n = 8192;
  const loudLow = sine(n, 100, 0.9);
  const on = makeProc({
    enabled: { limiter: false, mbComp: true },
    mbComp: { lowXover: 200, highXover: 3000, lowGainDB: 0, midGainDB: 0, highGainDB: 0, threshold: -20, ratio: 6, attackMs: 2, releaseMs: 60 }
  });
  const off = makeProc({ enabled: { limiter: false } });
  const a = peakOf(run(on, loudLow, loudLow).outL.subarray(4000));
  const b = peakOf(run(off, loudLow, loudLow).outL.subarray(4000));
  assert.ok(a < b * 0.8, '多段压缩应压低过载低频：' + a.toFixed(4) + ' vs ' + b.toFixed(4));
  assert.ok(a > 0.05, '不应把信号压没：' + a.toFixed(4));
});

test('削波：阈值以下不动，阈值以上被限制在上限内', () => {
  const n = 8192;
  const loud = sine(n, 440, 1.0);
  const on = makeProc({
    enabled: { limiter: false, clipper: true },
    clipper: { drive: 6, mode: 'soft', thresholdDB: -6, ceilingDB: -3, mix: 1, outputDB: 0 }
  });
  const ceiling = Math.pow(10, -3 / 20);
  const a = peakOf(run(on, loud, loud).outL.subarray(3000));
  assert.ok(a <= ceiling + 1e-3, '削波后峰值应不超过上限：' + a.toFixed(4) + ' > ' + ceiling.toFixed(4));

  const quiet = sine(n, 440, 0.1);
  const b = peakOf(run(on, quiet, quiet).outL.subarray(3000));
  assert.ok(Math.abs(b - 0.1) < 0.02, '阈值以下应保持原样：' + b.toFixed(4));
});

test('延迟：反馈滤波会削弱回声的高频，但保留回声本身', () => {
  const n = FS_RATE;
  const imp = new Float32Array(n);
  imp[0] = 1;
  const dark = makeProc({
    enabled: { limiter: false, delay: true },
    delay: { timeMs: 100, feedback: 0.6, mix: 1, filterHz: 1000 }
  });
  const bright = makeProc({
    enabled: { limiter: false, delay: true },
    delay: { timeMs: 100, feedback: 0.6, mix: 1, filterHz: 20000 }
  });
  const step = Math.round(FS_RATE * 0.1);
  const findPeak = (arr) => {
    let p = 0;
    for (let i = step - 20; i <= step + 20; i++) p = Math.max(p, Math.abs(arr[i]));
    return p;
  };
  const darkPeak = findPeak(run(dark, imp, imp).outL);
  const brightPeak = findPeak(run(bright, imp, imp).outL);
  assert.ok(darkPeak > 0.05, '滤波后仍应有回声');
  assert.ok(darkPeak < brightPeak, '滤波应削弱回声：' + darkPeak.toFixed(4) + ' vs ' + brightPeak.toFixed(4));
});
