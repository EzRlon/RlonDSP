/*
 * RlonDSP
 * Copyright © 2026 RlonDSP. All rights reserved.
 * Based on Echomusic open-source project, modified and extended for RlonDSP.
 */
class Biquad {
  constructor() {
    this.b0 = 1;
    this.b1 = 0;
    this.b2 = 0;
    this.a1 = 0;
    this.a2 = 0;
    this.x1 = 0;
    this.x2 = 0;
    this.y1 = 0;
    this.y2 = 0;
  }

  setCoefficients(b0, b1, b2, a1, a2) {
    this.b0 = b0;
    this.b1 = b1;
    this.b2 = b2;
    this.a1 = a1;
    this.a2 = a2;
  }

  setPeaking(freq, gainDB, fs, q = 1.41) {
    const A = Math.pow(10, gainDB / 40);
    const w0 = 2 * Math.PI * freq / fs;
    const cos = Math.cos(w0);
    const sin = Math.sin(w0);
    const alpha = sin / (2 * q);
    const a0 = 1 + alpha / A;
    this.setCoefficients(
      (1 + alpha * A) / a0,
      (-2 * cos) / a0,
      (1 - alpha * A) / a0,
      (-2 * cos) / a0,
      (1 - alpha / A) / a0
    );
  }

  setLowShelf(freq, gainDB, fs, q = 0.707) {
    const A = Math.pow(10, gainDB / 40);
    const w0 = 2 * Math.PI * freq / fs;
    const cos = Math.cos(w0);
    const sin = Math.sin(w0);
    const alpha = sin / (2 * q);
    const twoSqrtAalpha = 2 * Math.sqrt(A) * alpha;
    const a0 = (A + 1) + (A - 1) * cos + twoSqrtAalpha;
    this.setCoefficients(
      A * ((A + 1) - (A - 1) * cos + twoSqrtAalpha) / a0,
      2 * A * ((A - 1) - (A + 1) * cos) / a0,
      A * ((A + 1) - (A - 1) * cos - twoSqrtAalpha) / a0,
      -2 * ((A - 1) + (A + 1) * cos) / a0,
      ((A + 1) + (A - 1) * cos - twoSqrtAalpha) / a0
    );
  }

  setHighShelf(freq, gainDB, fs, q = 0.707) {
    const A = Math.pow(10, gainDB / 40);
    const w0 = 2 * Math.PI * freq / fs;
    const cos = Math.cos(w0);
    const sin = Math.sin(w0);
    const alpha = sin / (2 * q);
    const twoSqrtAalpha = 2 * Math.sqrt(A) * alpha;
    const a0 = (A + 1) - (A - 1) * cos + twoSqrtAalpha;
    this.setCoefficients(
      A * ((A + 1) + (A - 1) * cos + twoSqrtAalpha) / a0,
      -2 * A * ((A - 1) + (A + 1) * cos) / a0,
      A * ((A + 1) + (A - 1) * cos - twoSqrtAalpha) / a0,
      2 * ((A - 1) - (A + 1) * cos) / a0,
      ((A + 1) - (A - 1) * cos - twoSqrtAalpha) / a0
    );
  }

  setLowpass(freq, fs, q = 0.707) {
    const w0 = 2 * Math.PI * freq / fs;
    const cos = Math.cos(w0);
    const sin = Math.sin(w0);
    const alpha = sin / (2 * q);
    const a0 = 1 + alpha;
    this.setCoefficients(
      (1 - cos) / 2 / a0,
      (1 - cos) / a0,
      (1 - cos) / 2 / a0,
      -2 * cos / a0,
      (1 - alpha) / a0
    );
  }

  process(x) {
    const out = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2
      - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1;
    this.x1 = x;
    this.y2 = this.y1;
    this.y1 = out;
    return out;
  }

  /** 带通（RBJ）：用于去齿音与动态 EQ 的检测频段 */
  setBandpass(freq, fs, q = 1.2) {
    const w0 = 2 * Math.PI * Math.min(fs * 0.45, Math.max(20, freq)) / fs;
    const cos = Math.cos(w0);
    const sin = Math.sin(w0);
    const alpha = sin / (2 * Math.max(0.1, q));
    const a0 = 1 + alpha;
    this.setCoefficients(
      alpha / a0,
      0,
      -alpha / a0,
      -2 * cos / a0,
      (1 - alpha) / a0
    );
  }
}

class FDNReverb {
  constructor(fs) {
    this.fs = fs;
    this.N = 8;
    this.baseLen = [4799, 5119, 5441, 5743, 6047, 6373, 6911, 7297];
    this.roomSize = 1;
    this.t60 = 2.6;
    this.damping = 0.55;
    this.wet = 0.32;
    this.predelay = 0.02;
    this.enabled = true;
    this.v = new Float32Array(this.N).fill(1);
    this.scratchY = new Float32Array(this.N);
    this.scratchD = new Float32Array(this.N);
    this.scratchW = new Float32Array(this.N);
    this.alloc();
    this.updateDecay();
    this.updateDamping();
    this.updatePredelay();
  }

  alloc() {
    this.delay = [];
    this.pos = new Int32Array(this.N);
    this.damp = new Float32Array(this.N);
    for (let i = 0; i < this.N; i++) {
      const scale = this.fs / 48000;
      const length = Math.max(1, Math.floor(this.baseLen[i] * this.roomSize * scale));
      this.delay.push(new Float32Array(length));
    }
  }

  updateDecay() {
    let avg = 0;
    for (let i = 0; i < this.N; i++) avg += this.baseLen[i] * this.roomSize;
    avg = (avg / this.N) / this.fs;
    this.fbGain = this.t60 > 0.001 ? Math.pow(10, -3 * avg / this.t60) : 0.001;
    if (this.fbGain > 0.999) this.fbGain = 0.999;
  }

  updateDamping() {
    this.dampCoef = Math.min(0.95, 0.1 + this.damping * 0.7);
  }

  updatePredelay() {
    const len = Math.max(1, Math.floor(this.predelay * this.fs));
    if (!this.predelayBuf || this.predelayBuf.length !== len) {
      this.predelayBuf = new Float32Array(len);
      this.pd = 0;
    }
  }

  setParams(p) {
    this.enabled = !!p.enabled;
    const room = Math.max(0.3, Math.min(2.5, Number(p.roomSize) || 1));
    const fsChanged = this.fs !== (p.fs || this.fs);
    if (fsChanged) {
      this.fs = p.fs;
      this.alloc();
    } else if (Math.abs(room - this.roomSize) > 0.001) {
      this.roomSize = room;
      this.alloc();
    } else {
      this.roomSize = room;
    }
    this.t60 = Number(p.t60) || 2.6;
    this.damping = Number(p.damping) || 0.55;
    this.wet = Number(p.wet) || 0.32;
    this.predelay = Number(p.predelay) || 0.02;
    this.updateDecay();
    this.updateDamping();
    this.updatePredelay();
  }

  process(input, output, start, n) {
    if (!this.enabled) {
      for (let s = 0; s < n; s++) output[start + s] = input[start + s];
      return;
    }
    const wet = this.wet;
    const N = this.N;
    const v = this.v;
    const y = this.scratchY;
    const d = this.scratchD;
    const w = this.scratchW;
    const dampCoef = this.dampCoef;
    const fb = this.fbGain;
    const outCoef = 0.25;
    const delays = this.delay;
    const pos = this.pos;
    const damp = this.damp;
    const predelayBuf = this.predelayBuf;
    let pd = this.pd;
    const preLen = predelayBuf.length;

    for (let s = 0; s < n; s++) {
      predelayBuf[pd] = input[start + s];
      const x = predelayBuf[pd];
      pd = (pd + 1) % preLen;

      let dot = 0;
      for (let i = 0; i < N; i++) {
        y[i] = delays[i][pos[i]];
        damp[i] = (1 - dampCoef) * y[i] + dampCoef * damp[i];
        d[i] = damp[i];
        dot += v[i] * d[i];
      }
      const k = 2 * dot / N;
      for (let i = 0; i < N; i++) {
        w[i] = d[i] - k * v[i];
        delays[i][pos[i]] = x + fb * w[i];
        pos[i] = (pos[i] + 1) % delays[i].length;
      }

      let wetOut = 0;
      for (let i = 0; i < N; i++) wetOut += y[i];
      wetOut *= outCoef;
      output[start + s] = input[start + s] * (1 - wet) + wetOut * wet;
    }
    this.pd = pd;
  }
}

class NoiseGate {
  constructor(fs) {
    this.fs = fs;
    this.threshold = -52;
    this.releaseMs = 180;
    this.envL = 0;
    this.envR = 0;
    this.gainL = 1;
    this.gainR = 1;
    this.update();
  }
  setParams(p) {
    this.threshold = Number(p.threshold) ?? -52;
    this.releaseMs = Number(p.releaseMs) ?? 180;
    this.update();
  }
  update() {
    this.thresholdLin = Math.pow(10, this.threshold / 20);
    this.releaseCoef = 1 - Math.exp(-1 / (Math.max(1, this.releaseMs) * this.fs / 1000));
    this.attackCoef = 1 - Math.exp(-1 / (this.fs * 0.002));
  }
  processSample(x, env, gainState) {
    const level = Math.abs(x);
    if (level > env) env += this.attackCoef * (level - env);
    else env += this.releaseCoef * (level - env);
    const target = env > this.thresholdLin ? 1 : 0;
    const gain = gainState + (target - gainState) * this.attackCoef;
    return { out: x * gain, env, gain };
  }
}

/** 把参数夹到安全范围：非法值一律回落到默认值，防止 NaN / Infinity 进入音频路径 */
function clampNum(v, lo, hi, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  if (n < lo) return lo;
  if (n > hi) return hi;
  return n;
}

/* ===== 包络跟随器：扩展器 / 瞬态整形 / 去齿音 / 动态 EQ 共用 =====
   一次攻击时间、一次释放时间，输入取绝对值，输出 0~1 的包络。 */
class EnvelopeFollower {
  constructor() {
    this.env = 0;
    this.aCoef = 0.5;
    this.rCoef = 0.01;
  }
  setTimes(fs, attackMs, releaseMs) {
    this.aCoef = 1 - Math.exp(-1 / (Math.max(0.1, attackMs) * fs / 1000));
    this.rCoef = 1 - Math.exp(-1 / (Math.max(1, releaseMs) * fs / 1000));
  }
  step(x) {
    const v = Math.abs(Number.isFinite(x) ? x : 0);
    this.env += (v > this.env ? this.aCoef : this.rCoef) * (v - this.env);
    return this.env;
  }
}

/* ===== 延迟线：延迟 / 合唱 / 镶边 三段效果共用的一套基础设施 =====
   环形缓冲 + 线性插值读取，可以读「小数个样点之前」的值 —— 调制类
   效果（合唱、镶边）必须要这个能力。
   写入前把 NaN / Infinity 一律换成 0，避免脏数据被反馈循环放大。 */
class DelayLine {
  constructor(maxSamples) {
    this.max = Math.max(8, Math.round(maxSamples) + 8);
    this.buf = new Float32Array(this.max);
    this.w = 0;
  }
  push(x) {
    this.buf[this.w] = Number.isFinite(x) ? x : 0;
    this.w++;
    if (this.w >= this.max) this.w = 0;
  }
  /** 读取 delaySamples 个样点之前的值（支持小数，线性插值） */
  read(delaySamples) {
    const maxDelay = this.max - 2;
    let d = Number.isFinite(delaySamples) ? delaySamples : 0;
    if (d < 0) d = 0;
    if (d > maxDelay) d = maxDelay;
    let p = this.w - 1 - d;
    while (p < 0) p += this.max;
    const i0 = Math.floor(p);
    const frac = p - i0;
    const a = this.buf[i0 % this.max];
    const b = this.buf[(i0 + 1) % this.max];
    const y = a + (b - a) * frac;
    return Number.isFinite(y) ? y : 0;
  }
  clear() {
    this.buf.fill(0);
    this.w = 0;
  }
}

class RlonDSPDSP extends AudioWorkletProcessor {
  constructor() {
    super();
    this.fs = sampleRate || 48000;
    // 均衡器频点（ISO 八度系列，31 Hz ~ 16 kHz，共 10 段）
    this.eqFreqs = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
    this.eqL = this.eqFreqs.map(() => new Biquad());
    this.eqR = this.eqFreqs.map(() => new Biquad());
    this.bassL = new Biquad();
    this.bassR = new Biquad();
    this.clarityL = new Biquad();
    this.clarityR = new Biquad();
    this.ultraL = new Biquad();
    this.ultraR = new Biquad();
    this.reverb = new FDNReverb(this.fs);
    this.gate = new NoiseGate(this.fs);
    this.env = 0;
    // 均衡器平滑状态（目标值 → 当前值逐块逼近，消除拖动爆音）
    this.eqCurrent = null;
    this.eqTarget = null;
    // 限幅器前瞻缓冲
    this.limLen = 0;
    this.limPos = 0;
    this.limBufL = null;
    this.limBufR = null;
    this.limGain = 1;
    // 前瞻窗口最大值（单调队列，O(1) 均摊），保证增益覆盖延迟样点之后的峰值
    this.limDqIdx = null;
    this.limDqVal = null;
    this.limDqHead = 0;
    this.limDqTail = 0;
    this.limAbs = 0;
    this.builtins = null;
    // 差分环绕：声道延迟环形缓冲（最大 30 ms）
    this.cdSize = 0;
    this.cdBufL = null;
    this.cdBufR = null;
    this.cdWrite = 0;
    this.cdSamples = 0;
    // 延迟 / 合唱 / 镶边：延迟线在首次用到时按最大长度一次性分配，
    // 之后音频线程内不再分配内存（实时安全）
    this.dlL = null;
    this.dlR = null;
    this.chL = null;
    this.chR = null;
    this.flL = null;
    this.flR = null;
    this.modPhase = 0;
    this.modPhase2 = 0.5;
    // 扩展器 / 瞬态整形 / 去齿音 / 动态 EQ / 多段压缩
    this.fol = null;
    this.expEnvL = null;
    this.expEnvR = null;
    this.expGainL = 1;
    this.expGainR = 1;
    this.trFastL = null;
    this.trFastR = null;
    this.trSlowL = null;
    this.trSlowR = null;
    this.dsBandL = new Biquad();
    this.dsBandR = new Biquad();
    this.dsEnvL = null;
    this.dsEnvR = null;
    this.dsGain = 1;
    this.dqDetL = new Biquad();
    this.dqDetR = new Biquad();
    this.dqL = new Biquad();
    this.dqR = new Biquad();
    this.dqEnvL = null;
    this.dqEnvR = null;
    this.dqCurrent = 0;
    this.mbLowL = new Biquad();
    this.mbLowR = new Biquad();
    this.mbMidL = new Biquad();
    this.mbMidR = new Biquad();
    this.mbEnv = null;
    this.mbGain = [1, 1, 1];
    this.params = this.defaultParams();
    this.applyParams(this.params);
    this.port.onmessage = (event) => {
      if (event.data && event.data.type === 'params') {
        this.applyParams(event.data.params);
      }
    };
  }

  defaultParams() {
    return {
      eqGains: new Array(10).fill(0),
      enabled: {
        compressor: false,
        bass: false,
        stereo: false,
        surround: false,
        clarity: false,
        ultrasonic: false,
        tube: false,
        reverb: false,
        noiseGate: false,
        limiter: true,
        delay: false,
        chorus: false,
        flanger: false,
        clipper: false,
        expander: false,
        transient: false,
        deesser: false,
        dynEq: false,
        mbComp: false
      },
      gainDB: 0,
      compressor: { thresholdDB: -24, ratio: 4, attackMs: 10, releaseMs: 120 },
      bass: { gainDB: 6, crossoverHz: 80 },
      stereo: { width: 0.5 },
      surround: { roomSize: 1 },
      clarity: { strength: 0.5 },
      tube: { drive: 0.3 },
      reverb: { roomSize: 1, t60: 2.6, damping: 0.55, wet: 0.32, predelay: 0.02 },
      gate: { threshold: -52, releaseMs: 180 },
      limiter: { ceilingDB: -1, lookaheadMs: 2, releaseMs: 60 },
      // 差分环绕：把一个声道整体延后，制造左右时间差（Haas 效应），影响人声定位
      channelDelay: { enabled: false, channel: 'R', ms: 0 },
      // 延迟 / 回声（可交叉反馈做乒乓）
      delay: { enabled: false, timeMs: 320, feedback: 0.35, mix: 0.25, pingPong: false, filterHz: 20000 },
      // 合唱：短延迟 + 缓慢调制，制造「多个人同时唱」的厚度
      chorus: { enabled: false, rateHz: 0.6, depthMs: 6, mix: 0.4, spread: 0.5 },
      // 镶边：更短的延迟 + 反馈，产生梳状滤波的扫频效果
      flanger: { enabled: false, rateHz: 0.25, depthMs: 3, mix: 0.45, feedback: 0.4 },
      // 削波 / 饱和：软削波（tanh）或硬削波
      clipper: { enabled: false, drive: 2, mode: 'soft', thresholdDB: -6, ceilingDB: 0, mix: 1, outputDB: 0 },
      // 扩展器：低于阈值时按比例继续压低（噪声门的升级版，带比例）
      expander: { enabled: false, threshold: -40, ratio: 2, attackMs: 5, releaseMs: 150, range: 24 },
      // 瞬态整形：分别强调/削弱起音与延音
      transient: { enabled: false, attack: 0.5, sustain: 0.5, mix: 1, outputDB: 0 },
      // 去齿音：检测高频齿音频段并整体衰减
      deesser: { enabled: false, freq: 6000, threshold: -24, range: 12, attackMs: 1, releaseMs: 60 },
      // 动态 EQ：某个频段的增益随该频段电平变化
      dynEq: { enabled: false, freq: 200, q: 1.2, gainDB: -6, threshold: -30, range: 12, attackMs: 10, releaseMs: 150 },
      // 多段压缩：低 / 中 / 高三个频段共用一组压缩参数，各自带增益补偿
      mbComp: {
        enabled: false, lowXover: 200, highXover: 3000,
        lowGainDB: 0, midGainDB: 0, highGainDB: 0,
        threshold: -20, ratio: 3, attackMs: 10, releaseMs: 120
      }
    };
  }

  applyParams(p) {
    this.params = {
      ...this.defaultParams(),
      ...p,
      enabled: { ...this.defaultParams().enabled, ...(p.enabled || {}) },
      compressor: { ...this.defaultParams().compressor, ...(p.compressor || {}) },
      bass: { ...this.defaultParams().bass, ...(p.bass || {}) },
      stereo: { ...this.defaultParams().stereo, ...(p.stereo || {}) },
      surround: { ...this.defaultParams().surround, ...(p.surround || {}) },
      clarity: { ...this.defaultParams().clarity, ...(p.clarity || {}) },
      tube: { ...this.defaultParams().tube, ...(p.tube || {}) },
      reverb: { ...this.defaultParams().reverb, ...(p.reverb || {}) },
      gate: { ...this.defaultParams().gate, ...(p.gate || {}) },
      limiter: { ...this.defaultParams().limiter, ...(p.limiter || {}) },
      channelDelay: { ...this.defaultParams().channelDelay, ...(p.channelDelay || {}) },
      delay: { ...this.defaultParams().delay, ...(p.delay || {}) },
      chorus: { ...this.defaultParams().chorus, ...(p.chorus || {}) },
      flanger: { ...this.defaultParams().flanger, ...(p.flanger || {}) },
      clipper: { ...this.defaultParams().clipper, ...(p.clipper || {}) },
      expander: { ...this.defaultParams().expander, ...(p.expander || {}) },
      transient: { ...this.defaultParams().transient, ...(p.transient || {}) },
      deesser: { ...this.defaultParams().deesser, ...(p.deesser || {}) },
      dynEq: { ...this.defaultParams().dynEq, ...(p.dynEq || {}) },
      mbComp: { ...this.defaultParams().mbComp, ...(p.mbComp || {}) }
    };

    // 内置引擎开关表：被第三方 Provider 接管的类型，内置引擎必须跳过，避免重复处理。
    // 未提供时全部视为启用（与旧版行为一致）。
    this.builtins = p.builtins ? { ...p.builtins } : null;

    // 均衡器：目标增益与当前平滑增益分离，逐块向目标靠拢，避免拖动时产生爆音
    const eqGains = this.params.eqGains || new Array(this.eqFreqs.length).fill(0);
    this.eqTarget = this.eqFreqs.map((_, i) => Number(eqGains[i]) || 0);
    if (!this.eqCurrent || this.eqCurrent.length !== this.eqTarget.length) {
      // 首次加载直接生效，不做渐入
      this.eqCurrent = this.eqTarget.slice();
      for (let i = 0; i < this.eqFreqs.length; i++) {
        this.eqL[i].setPeaking(this.eqFreqs[i], this.eqCurrent[i], this.fs);
        this.eqR[i].setPeaking(this.eqFreqs[i], this.eqCurrent[i], this.fs);
      }
    }

    const bassGain = this.params.enabled.bass ? this.params.bass.gainDB : 0;
    this.bassL.setLowShelf(this.params.bass.crossoverHz, bassGain, this.fs);
    this.bassR.setLowShelf(this.params.bass.crossoverHz, bassGain, this.fs);

    const clarityGain = this.params.enabled.clarity ? this.params.clarity.strength * 5 : 0;
    this.clarityL.setHighShelf(3500, clarityGain, this.fs);
    this.clarityR.setHighShelf(3500, clarityGain, this.fs);
    this.ultraL.setLowpass(19000, this.fs, 0.9);
    this.ultraR.setLowpass(19000, this.fs, 0.9);

    this.masterGain = Math.pow(10, (this.params.gainDB || 0) / 20);
    this.comp = this.params.compressor;
    this.compAttackCoef = 1 - Math.exp(-1 / (Math.max(1, this.comp.attackMs) * this.fs / 1000));
    this.compReleaseCoef = 1 - Math.exp(-1 / (Math.max(1, this.comp.releaseMs) * this.fs / 1000));
    this.bassDrive = 1 + this.params.bass.gainDB / 30;
    this.stereoWidth = Math.max(0, this.params.stereo.width || 0);
    this.surroundCross = 0.02 + (this.params.surround.roomSize || 1) * 0.08;
    this.tubeDrive = 1 + (this.params.tube.drive || 0) * 2;
    this.ceiling = Math.pow(10, (this.params.limiter.ceilingDB || -1) / 20);
    // 限幅器：前瞻长度与释放系数
    const lim = this.params.limiter;
    const lookMs = Math.max(0.2, Math.min(20, Number(lim.lookaheadMs) || 2));
    const lookSamples = Math.max(1, Math.round(this.fs * lookMs / 1000));
    if (lookSamples !== this.limLen) {
      this.limLen = lookSamples;
      this.limBufL = new Float32Array(lookSamples);
      this.limBufR = new Float32Array(lookSamples);
      this.limPos = 0;
      this.limDqIdx = new Int32Array(lookSamples + 2);
      this.limDqVal = new Float32Array(lookSamples + 2);
      this.limDqHead = 0;
      this.limDqTail = 0;
      this.limAbs = 0;
      this.limGain = 1;
    }
    this.limReleaseCoef = 1 - Math.exp(-1 / (Math.max(5, Number(lim.releaseMs) || 60) * this.fs / 1000));

    // 差分环绕：缓冲按最大 30 ms 分配，实际延迟由参数决定（0 ~ 30 ms）
    const cd = this.params.channelDelay;
    const cdMaxMs = 30;
    const cdSize = Math.max(2, Math.round(this.fs * cdMaxMs / 1000) + 1);
    if (this.cdSize !== cdSize) {
      this.cdSize = cdSize;
      this.cdBufL = new Float32Array(cdSize);
      this.cdBufR = new Float32Array(cdSize);
      this.cdWrite = 0;
    }
    const cdMs = Math.max(0, Math.min(cdMaxMs, Number(cd.ms) || 0));
    this.cdSamples = Math.max(0, Math.min(cdSize - 1, Math.round(this.fs * cdMs / 1000)));

    // ---- 延迟 / 合唱 / 镶边 / 削波 参数（全部夹到安全范围）----
    const dl = this.params.delay;
    this.delayTimeSamples = Math.max(1, Math.round(clampNum(dl.timeMs, 20, 1000, 320) * this.fs / 1000));
    this.delayFeedback = clampNum(dl.feedback, 0, 0.9, 0.35);
    this.delayMix = clampNum(dl.mix, 0, 1, 0.25);
    this.delayPingPong = !!dl.pingPong;

    const cho = this.params.chorus;
    this.chorusRate = clampNum(cho.rateHz, 0.05, 8, 0.6);
    this.chorusDepth = clampNum(cho.depthMs, 0, 15, 6) * this.fs / 1000;
    this.chorusBase = 18 * this.fs / 1000;
    this.chorusMix = clampNum(cho.mix, 0, 1, 0.4);
    this.chorusSpread = clampNum(cho.spread, 0, 1, 0.5);

    const flg = this.params.flanger;
    this.flangerRate = clampNum(flg.rateHz, 0.05, 5, 0.25);
    this.flangerDepth = clampNum(flg.depthMs, 0, 6, 3) * this.fs / 1000;
    this.flangerBase = 2 * this.fs / 1000;
    this.flangerMix = clampNum(flg.mix, 0, 1, 0.45);
    this.flangerFeedback = clampNum(flg.feedback, -0.9, 0.9, 0.4);

    const clip = this.params.clipper;
    this.clipDrive = clampNum(clip.drive, 1, 12, 2);
    this.clipHard = clip.mode === 'hard';
    this.clipOut = Math.pow(10, clampNum(clip.outputDB, -24, 24, 0) / 20);
    this.clipThresholdLin = Math.pow(10, clampNum(clip.thresholdDB, -24, 0, -6) / 20);
    this.clipCeilingLin = Math.pow(10, clampNum(clip.ceilingDB, -12, 0, 0) / 20);
    this.clipMix = clampNum(clip.mix, 0, 1, 1);
    // 延迟反馈路径上的低通（阻尼）
    this.delayFilterHz = clampNum(dl.filterHz, 1000, 20000, 20000);
    if (!this.dlLpL) {
      this.dlLpL = new Biquad();
      this.dlLpR = new Biquad();
    }
    this.dlLpL.setLowpass(this.delayFilterHz, this.fs, 0.707);
    this.dlLpR.setLowpass(this.delayFilterHz, this.fs, 0.707);

    if (!this.dlL) {
      // 一次性分配：延迟最长 1.2 s，合唱 60 ms，镶边 25 ms
      this.dlL = new DelayLine(this.fs * 1.2);
      this.dlR = new DelayLine(this.fs * 1.2);
      this.chL = new DelayLine(this.fs * 0.06);
      this.chR = new DelayLine(this.fs * 0.06);
      this.flL = new DelayLine(this.fs * 0.025);
      this.flR = new DelayLine(this.fs * 0.025);
    }

    // ---- 扩展器：低于阈值按比例继续压低，最多压到 range ----
    const exp = this.params.expander;
    this.expThresholdLin = Math.pow(10, clampNum(exp.threshold, -80, 0, -40) / 20);
    this.expRatio = clampNum(exp.ratio, 1, 10, 2);
    this.expRangeLin = Math.pow(10, -clampNum(exp.range, 0, 60, 24) / 20);
    this.expAtkCoef = 1 - Math.exp(-1 / (clampNum(exp.attackMs, 0.1, 100, 5) * this.fs / 1000));
    this.expRelCoef = 1 - Math.exp(-1 / (clampNum(exp.releaseMs, 5, 1000, 150) * this.fs / 1000));
    this.expEnvL = this.follower('expL');
    this.expEnvR = this.follower('expR');
    this.expEnvL.setTimes(this.fs, clampNum(exp.attackMs, 0.1, 100, 5), clampNum(exp.releaseMs, 5, 1000, 150));
    this.expEnvR.setTimes(this.fs, clampNum(exp.attackMs, 0.1, 100, 5), clampNum(exp.releaseMs, 5, 1000, 150));

    // ---- 瞬态整形：快包络与慢包络之差 = 起音 / 延音 ----
    const tr = this.params.transient;
    this.trAttack = clampNum(tr.attack, 0, 1, 0.5);
    this.trSustain = clampNum(tr.sustain, 0, 1, 0.5);
    this.trMix = clampNum(tr.mix, 0, 1, 1);
    this.trOutGain = Math.pow(10, clampNum(tr.outputDB, -24, 24, 0) / 20);
    this.trFastL = this.follower('trFastL');
    this.trFastR = this.follower('trFastR');
    this.trSlowL = this.follower('trSlowL');
    this.trSlowR = this.follower('trSlowR');
    this.trFastL.setTimes(this.fs, 1, 40);
    this.trFastR.setTimes(this.fs, 1, 40);
    this.trSlowL.setTimes(this.fs, 40, 200);
    this.trSlowR.setTimes(this.fs, 40, 200);

    // ---- 去齿音：检测齿音频段，超过阈值就整体衰减 ----
    const ds = this.params.deesser;
    this.dsFreq = clampNum(ds.freq, 2000, 12000, 6000);
    this.dsThresholdLin = Math.pow(10, clampNum(ds.threshold, -60, 0, -24) / 20);
    this.dsRangeLin = Math.pow(10, -clampNum(ds.range, 0, 40, 12) / 20);
    this.dsAtkCoef = 1 - Math.exp(-1 / (clampNum(ds.attackMs, 0.1, 50, 1) * this.fs / 1000));
    this.dsRelCoef = 1 - Math.exp(-1 / (clampNum(ds.releaseMs, 5, 500, 60) * this.fs / 1000));
    this.dsBandL.setBandpass(this.dsFreq, this.fs, 1.4);
    this.dsBandR.setBandpass(this.dsFreq, this.fs, 1.4);
    this.dsEnvL = this.follower('dsL');
    this.dsEnvR = this.follower('dsR');
    this.dsEnvL.setTimes(this.fs, clampNum(ds.attackMs, 0.1, 50, 1), clampNum(ds.releaseMs, 5, 500, 60));
    this.dsEnvR.setTimes(this.fs, clampNum(ds.attackMs, 0.1, 50, 1), clampNum(ds.releaseMs, 5, 500, 60));

    // ---- 动态 EQ：某个频段的增益随该频段电平变化 ----
    const dq = this.params.dynEq;
    this.dqFreq = clampNum(dq.freq, 40, 16000, 200);
    this.dqQ = clampNum(dq.q, 0.3, 8, 1.2);
    this.dqGainDB = clampNum(dq.gainDB, -18, 18, -6);
    this.dqThresholdDB = clampNum(dq.threshold, -60, 0, -30);
    this.dqRange = clampNum(dq.range, 0, 24, 12);
    this.dqAtkCoef = 1 - Math.exp(-1 / (clampNum(dq.attackMs, 0.5, 200, 10) * this.fs / 1000));
    this.dqRelCoef = 1 - Math.exp(-1 / (clampNum(dq.releaseMs, 5, 1000, 150) * this.fs / 1000));
    this.dqDetL.setBandpass(this.dqFreq, this.fs, this.dqQ);
    this.dqDetR.setBandpass(this.dqFreq, this.fs, this.dqQ);
    this.dqL.setPeaking(this.dqFreq, 0, this.fs, this.dqQ);
    this.dqR.setPeaking(this.dqFreq, 0, this.fs, this.dqQ);
    this.dqEnvL = this.follower('dqL');
    this.dqEnvR = this.follower('dqR');
    this.dqEnvL.setTimes(this.fs, clampNum(dq.attackMs, 0.5, 200, 10), clampNum(dq.releaseMs, 5, 1000, 150));
    this.dqEnvR.setTimes(this.fs, clampNum(dq.attackMs, 0.5, 200, 10), clampNum(dq.releaseMs, 5, 1000, 150));

    // ---- 多段压缩：低 / 中 / 高互补分频 + 各自压缩 ----
    const mb = this.params.mbComp;
    this.mbLowXover = clampNum(mb.lowXover, 40, 800, 200);
    this.mbHighXover = clampNum(mb.highXover, this.mbLowXover * 1.5, 12000, 3000);
    this.mbThresholdLin = Math.pow(10, clampNum(mb.threshold, -60, 0, -20) / 20);
    this.mbRatio = clampNum(mb.ratio, 1, 20, 3);
    this.mbAtkCoef = 1 - Math.exp(-1 / (clampNum(mb.attackMs, 0.5, 200, 10) * this.fs / 1000));
    this.mbRelCoef = 1 - Math.exp(-1 / (clampNum(mb.releaseMs, 5, 1000, 120) * this.fs / 1000));
    this.mbTrim = [
      Math.pow(10, clampNum(mb.lowGainDB, -24, 24, 0) / 20),
      Math.pow(10, clampNum(mb.midGainDB, -24, 24, 0) / 20),
      Math.pow(10, clampNum(mb.highGainDB, -24, 24, 0) / 20)
    ];
    this.mbLowL.setLowpass(this.mbLowXover, this.fs, 0.707);
    this.mbLowR.setLowpass(this.mbLowXover, this.fs, 0.707);
    this.mbMidL.setLowpass(this.mbHighXover, this.fs, 0.707);
    this.mbMidR.setLowpass(this.mbHighXover, this.fs, 0.707);
    if (!this.mbEnv) {
      this.mbEnv = [new EnvelopeFollower(), new EnvelopeFollower(), new EnvelopeFollower()];
    }
    for (let b = 0; b < 3; b++) {
      this.mbEnv[b].setTimes(this.fs, clampNum(mb.attackMs, 0.5, 200, 10), clampNum(mb.releaseMs, 5, 1000, 120));
    }
    this.reverb.setParams({
      enabled: this.params.enabled.reverb,
      roomSize: this.params.reverb.roomSize,
      t60: this.params.reverb.t60,
      damping: this.params.reverb.damping,
      wet: this.params.reverb.wet,
      predelay: this.params.reverb.predelay,
      fs: this.fs
    });
    this.gate.setParams({
      threshold: this.params.gate.threshold,
      releaseMs: this.params.gate.releaseMs
    });
  }

  /**
   * 某个内置引擎当前是否应当执行。
   * 被第三方 Provider 接管（DSP Host 判定）时返回 false，内置引擎必须跳过，
   * 这就是「同一时刻同一种 DSP 只有一个执行者」在音频线程里的落地。
   */
  on(kind) {
    return !this.builtins || this.builtins[kind] !== false;
  }

  /** 取（或首次创建）一个具名包络跟随器，避免在音频线程里反复分配 */
  follower(name) {
    if (!this.fol) this.fol = {};
    if (!this.fol[name]) this.fol[name] = new EnvelopeFollower();
    return this.fol[name];
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    if (!input || !output || input.length === 0) return true;
    const n = output[0].length;
    const inL = input[0] || new Float32Array(n);
    const inR = input[1] || inL;
    const outL = output[0];
    const outR = output.length > 1 ? output[1] : outL;

    // 均衡器参数平滑：每块只更新有变化的那几段，向目标值逼近，避免拖动产生爆音
    if (this.on('eq') && this.eqCurrent && this.eqTarget) {
      for (let b = 0; b < this.eqFreqs.length; b++) {
        const target = this.eqTarget[b];
        let cur = this.eqCurrent[b];
        if (cur === target) continue;
        const delta = target - cur;
        cur = Math.abs(delta) < 0.005 ? target : cur + delta * 0.25;
        this.eqCurrent[b] = cur;
        this.eqL[b].setPeaking(this.eqFreqs[b], cur, this.fs);
        this.eqR[b].setPeaking(this.eqFreqs[b], cur, this.fs);
      }
    }

    for (let i = 0; i < n; i++) {
      let l = inL[i] || 0;
      let r = inR[i] || 0;

      if (this.on('bass') && this.params.enabled.bass) {
        l = this.bassL.process(l);
        r = this.bassR.process(r);
        if (this.bassDrive > 1.001) {
          l = Math.tanh(l * this.bassDrive);
          r = Math.tanh(r * this.bassDrive);
        }
      }

      if (this.on('eq')) {
        for (let b = 0; b < this.eqFreqs.length; b++) {
          l = this.eqL[b].process(l);
          r = this.eqR[b].process(r);
        }
      }

      if (this.on('compressor') && this.params.enabled.compressor) {
        const level = Math.max(Math.abs(l), Math.abs(r));
        if (level > this.env) this.env += this.compAttackCoef * (level - this.env);
        else this.env += this.compReleaseCoef * (level - this.env);
        const levelDB = 20 * Math.log10(Math.max(this.env, 1e-9));
        const over = levelDB - this.comp.thresholdDB;
        let reductionDB = 0;
        if (over > 3) reductionDB = over * (1 - 1 / this.comp.ratio);
        else if (over > -3) {
          const t = (over + 3) / 6;
          reductionDB = t * over * (1 - 1 / this.comp.ratio);
        }
        const g = Math.pow(10, -reductionDB / 20);
        l *= g;
        r *= g;
      }

      if (this.on('clarity') && this.params.enabled.clarity) {
        l = this.clarityL.process(l);
        r = this.clarityR.process(r);
      }

      if (this.on('stereo') && this.params.enabled.stereo) {
        const mid = (l + r) * 0.5;
        const side = (l - r) * 0.5 * (1 + this.stereoWidth);
        l = mid + side;
        r = mid - side;
      }

      if (this.on('spatial') && this.params.enabled.surround) {
        const cross = this.surroundCross;
        l = l + (r - l) * cross;
        r = r + (l - r) * cross;
      }

      if (this.on('tube') && this.params.enabled.tube) {
        l = Math.tanh(l * this.tubeDrive);
        r = Math.tanh(r * this.tubeDrive);
      }

      if (this.on('ultrasonic') && this.params.enabled.ultrasonic) {
        l = this.ultraL.process(l);
        r = this.ultraR.process(r);
      }

      // 削波 / 饱和：驱动增益 + 软削波（tanh）或硬削波，再按输出增益补回电平
      if (this.on('clipper') && this.params.enabled.clipper) {
        const d = this.clipDrive;
        const thr = this.clipThresholdLin;
        const ceil = this.clipCeilingLin;
        const mix = this.clipMix;
        const dryL = l;
        const dryR = r;
        if (Math.abs(l) > thr) {
          const driven = l * d;
          l = this.clipHard
            ? Math.max(-ceil, Math.min(ceil, driven))
            : Math.tanh(driven / ceil) * ceil;
          l *= this.clipOut;
        }
        if (Math.abs(r) > thr) {
          const driven = r * d;
          r = this.clipHard
            ? Math.max(-ceil, Math.min(ceil, driven))
            : Math.tanh(driven / ceil) * ceil;
          r *= this.clipOut;
        }
        // 干湿比：0 = 完全不处理，1 = 全处理
        l = dryL + (l - dryL) * mix;
        r = dryR + (r - dryR) * mix;
      }

      outL[i] = l;
      outR[i] = r;
    }

      if (this.on('reverb') && this.params.enabled.reverb) {
      this.reverb.process(outL, outL, 0, n);
      this.reverb.process(outR, outR, 0, n);
    }

      if (this.on('gate') && this.params.enabled.noiseGate) {
      for (let i = 0; i < n; i++) {
        const left = this.gate.processSample(outL[i], this.gate.envL, this.gate.gainL);
        this.gate.envL = left.env;
        this.gate.gainL = left.gain;
        outL[i] = left.out;

        const right = this.gate.processSample(outR[i], this.gate.envR, this.gate.gainR);
        this.gate.envR = right.env;
        this.gate.gainR = right.gain;
        outR[i] = right.out;
      }
    }

    // 差分环绕（Haas 效应）：把选定声道整体延后，制造左右时间差。
    // 先发声的一侧被优先感知，因此人声定位会偏向未延迟的那一侧。
    if (this.on('channel-delay') && this.cdBufL && this.cdBufR) {
      const cd = this.params.channelDelay;
      const delayRight = cd.channel !== 'L';
      const buf = delayRight ? this.cdBufR : this.cdBufL;
      const target = delayRight ? outR : outL;
      const size = this.cdSize;
      const delaySamples = this.cdSamples;
      const active = cd.enabled && delaySamples > 0;
      let w = this.cdWrite;
      for (let i = 0; i < n; i++) {
        const dry = target[i];
        buf[w] = dry;
        if (active) {
          let rp = w - delaySamples;
          if (rp < 0) rp += size;
          target[i] = buf[rp];
        }
        w++;
        if (w >= size) w = 0;
      }
      this.cdWrite = w;
    }

    // ---- 扩展器：低于阈值时按比例继续压低（立体声联动，最多压到 range）----
    if (this.on('expander') && this.params.enabled.expander) {
      const thr = this.expThresholdLin;
      const ratio = this.expRatio;
      const floorLin = this.expRangeLin;
      const eL = this.expEnvL;
      const eR = this.expEnvR;
      let g = this.expGainL;
      for (let i = 0; i < n; i++) {
        const l = outL[i];
        const r = outR[i];
        const env = Math.max(eL.step(l), eR.step(r));
        let target = 1;
        if (env < thr) {
          const below = Math.max(1e-6, env) / thr;
          target = Math.pow(below, ratio - 1);
          if (target < floorLin) target = floorLin;
        }
        const coef = target < g ? this.expAtkCoef : this.expRelCoef;
        g += coef * (target - g);
        outL[i] = l * g;
        outR[i] = r * g;
      }
      this.expGainL = g;
      this.expGainR = g;
    }

    // ---- 瞬态整形：快 / 慢包络之差决定起音与延音 ----
    if (this.on('transient') && this.params.enabled.transient) {
      const a = this.trAttack;
      const s = this.trSustain;
      const mix = this.trMix;
      const outGain = this.trOutGain;
      const fL = this.trFastL;
      const fR = this.trFastR;
      const sL = this.trSlowL;
      const sR = this.trSlowR;
      for (let i = 0; i < n; i++) {
        const l = outL[i];
        const r = outR[i];
        const fast = Math.max(fL.step(l), fR.step(r));
        const slow = Math.max(sL.step(l), sR.step(r));
        const diff = fast - slow;
        let gain = 1;
        if (diff > 0) gain = 1 + a * Math.min(1, diff * 4) * 2.5;
        else gain = 1 + s * Math.max(-1, diff * 4) * 0.6;
        if (!Number.isFinite(gain)) gain = 1;
        if (gain < 0.2) gain = 0.2;
        if (gain > 4) gain = 4;
        const applied = 1 + (gain - 1) * mix;
        outL[i] = l * applied * outGain;
        outR[i] = r * applied * outGain;
      }
    }

    // ---- 去齿音：检测高频齿音频段，超过阈值就整体衰减 ----
    if (this.on('deesser') && this.params.enabled.deesser) {
      const thr = this.dsThresholdLin;
      const floorLin = this.dsRangeLin;
      const eL = this.dsEnvL;
      const eR = this.dsEnvR;
      let g = this.dsGain;
      for (let i = 0; i < n; i++) {
        const l = outL[i];
        const r = outR[i];
        const band = Math.max(eL.step(this.dsBandL.process(l)), eR.step(this.dsBandR.process(r)));
        let target = 1;
        if (band > thr) {
          target = Math.max(floorLin, thr / band);
        }
        const coef = target < g ? this.dsAtkCoef : this.dsRelCoef;
        g += coef * (target - g);
        outL[i] = l * g;
        outR[i] = r * g;
      }
      this.dsGain = g;
    }

    // ---- 动态 EQ：该频段超过阈值时按比例施加设定的增益 ----
    if (this.on('dynEq') && this.params.enabled.dynEq) {
      const eL = this.dqEnvL;
      const eR = this.dqEnvR;
      let current = this.dqCurrent;
      let phase = 0;
      for (let i = 0; i < n; i++) {
        const l = outL[i];
        const r = outR[i];
        const level = Math.max(eL.step(this.dqDetL.process(l)), eR.step(this.dqDetR.process(r)));
        const levelDb = 20 * Math.log10(Math.max(level, 1e-9));
        let target = 0;
        if (levelDb > this.dqThresholdDB) {
          const over = Math.min(1, (levelDb - this.dqThresholdDB) / 12);
          target = this.dqGainDB * over;
        }
        const coef = target < current ? this.dqAtkCoef : this.dqRelCoef;
        current += coef * (target - current);
        // 每 32 个样点更新一次滤波器系数：避免逐样点重算，同时保持听感平滑
        if ((phase++ & 31) === 0) {
          this.dqL.setPeaking(this.dqFreq, current, this.fs, this.dqQ);
          this.dqR.setPeaking(this.dqFreq, current, this.fs, this.dqQ);
        }
        outL[i] = this.dqL.process(l);
        outR[i] = this.dqR.process(r);
      }
      this.dqCurrent = current;
    }

    // ---- 多段压缩：低 / 中 / 高互补分频，各自按同一组参数压缩并做增益补偿 ----
    if (this.on('mbComp') && this.params.enabled.mbComp) {
      const thr = this.mbThresholdLin;
      const ratio = this.mbRatio;
      const env = this.mbEnv;
      const gainState = this.mbGain;
      const trim = this.mbTrim;
      const atk = this.mbAtkCoef;
      const rel = this.mbRelCoef;
      for (let i = 0; i < n; i++) {
        const l = outL[i];
        const r = outR[i];
        const lowL = this.mbLowL.process(l);
        const lowR = this.mbLowR.process(r);
        const mid2L = this.mbMidL.process(l);
        const mid2R = this.mbMidR.process(r);
        const midL = mid2L - lowL;
        const midR = mid2R - lowR;
        const highL = l - mid2L;
        const highR = r - mid2R;
        // 三个频段各自算增益（立体声联动）。这里不建临时数组，避免音频线程内分配。
        const lvLow = lowL < 0 ? -lowL : lowL;
        const lvLowR = lowR < 0 ? -lowR : lowR;
        const lowPeak = lvLow > lvLowR ? lvLow : lvLowR;
        env[0].step(lowPeak);
        let e0 = env[0].env;
        let t0 = 1;
        if (e0 > thr) t0 = Math.pow(thr / e0, 1 - 1 / ratio);
        gainState[0] += (t0 < gainState[0] ? atk : rel) * (t0 - gainState[0]);

        const lvMid = midL < 0 ? -midL : midL;
        const lvMidR = midR < 0 ? -midR : midR;
        const midPeak = lvMid > lvMidR ? lvMid : lvMidR;
        env[1].step(midPeak);
        let e1 = env[1].env;
        let t1 = 1;
        if (e1 > thr) t1 = Math.pow(thr / e1, 1 - 1 / ratio);
        gainState[1] += (t1 < gainState[1] ? atk : rel) * (t1 - gainState[1]);

        const lvHigh = highL < 0 ? -highL : highL;
        const lvHighR = highR < 0 ? -highR : highR;
        const highPeak = lvHigh > lvHighR ? lvHigh : lvHighR;
        env[2].step(highPeak);
        let e2 = env[2].env;
        let t2 = 1;
        if (e2 > thr) t2 = Math.pow(thr / e2, 1 - 1 / ratio);
        gainState[2] += (t2 < gainState[2] ? atk : rel) * (t2 - gainState[2]);
        const gLow = gainState[0] * trim[0];
        const gMid = gainState[1] * trim[1];
        const gHigh = gainState[2] * trim[2];
        outL[i] = lowL * gLow + midL * gMid + highL * gHigh;
        outR[i] = lowR * gLow + midR * gMid + highR * gHigh;
      }
    }

    // ---- 延迟 / 回声：时间 20~1000 ms、反馈 0~0.9、干湿混合，可开乒乓 ----
    if (this.on('delay') && this.params.enabled.delay && this.dlL) {
      const t = this.delayTimeSamples;
      const fb = this.delayFeedback;
      const mix = this.delayMix;
      const pp = this.delayPingPong;
      for (let i = 0; i < n; i++) {
        const xl = outL[i];
        const xr = outR[i];
        // 反馈路径经过低通（阻尼），可把回声调暗
        const wetL = this.dlLpL.process(this.dlL.read(t));
        const wetR = this.dlLpR.process(this.dlR.read(t));
        // 乒乓：两条延迟线的反馈互相交叉，回声在左右之间来回跳
        this.dlL.push(xl + (pp ? wetR : wetL) * fb);
        this.dlR.push(xr + (pp ? wetL : wetR) * fb);
        outL[i] = xl + wetL * mix;
        outR[i] = xr + wetR * mix;
      }
    }

    // ---- 合唱：18 ms 基准延迟 + 缓慢调制，左右两路相位错开产生厚度 ----
    if (this.on('chorus') && this.params.enabled.chorus && this.chL) {
      const base = this.chorusBase;
      const depth = this.chorusDepth;
      const mix = this.chorusMix;
      const spread = this.chorusSpread;
      const inc = this.chorusRate / this.fs;
      let p = this.modPhase;
      for (let i = 0; i < n; i++) {
        const p2 = p + spread >= 1 ? p + spread - 1 : p + spread;
        const mL = 0.5 + 0.5 * Math.sin(p * 6.283185307179586);
        const mR = 0.5 + 0.5 * Math.sin(p2 * 6.283185307179586);
        p += inc;
        if (p >= 1) p -= 1;
        const xl = outL[i];
        const xr = outR[i];
        const wetL = this.chL.read(base + mL * depth);
        const wetR = this.chR.read(base + mR * depth);
        this.chL.push(xl);
        this.chR.push(xr);
        outL[i] = xl * (1 - mix) + wetL * mix;
        outR[i] = xr * (1 - mix) + wetR * mix;
      }
      this.modPhase = p;
    }

    // ---- 镶边：2 ms 级短延迟 + 反馈，形成梳状滤波的扫频 ----
    if (this.on('flanger') && this.params.enabled.flanger && this.flL) {
      const base = this.flangerBase;
      const depth = this.flangerDepth;
      const mix = this.flangerMix;
      const fb = this.flangerFeedback;
      const inc = this.flangerRate / this.fs;
      let p = this.modPhase2;
      for (let i = 0; i < n; i++) {
        const m = 0.5 + 0.5 * Math.sin(p * 6.283185307179586);
        p += inc;
        if (p >= 1) p -= 1;
        const xl = outL[i];
        const xr = outR[i];
        const d = base + m * depth;
        const wetL = this.flL.read(d);
        const wetR = this.flR.read(d);
        this.flL.push(xl + wetL * fb);
        this.flR.push(xr + wetR * fb);
        outL[i] = xl * (1 - mix) + wetL * mix;
        outR[i] = xr * (1 - mix) + wetR * mix;
      }
      this.modPhase2 = p;
    }

    const masterGain = this.on('gain') ? this.masterGain : 1;
    // 限幅器升级：前瞻 + 立体声联动 + 峰值保护
    // 侧链读取「当前样点」，主通路延迟一小段；增益因此在峰值抵达输出之前就已压下，
    // 正常情况不会削波，只有极端情况才由末尾的峰值保护兜底。
    const limActive = this.on('limiter') && this.params.enabled.limiter && this.limLen > 0;

    for (let i = 0; i < n; i++) {
      let l = outL[i] * masterGain;
      let r = outR[i] * masterGain;

      if (limActive) {
        // 1) 立体声联动：用左右声道的较大值作为本样点的峰值
        const peak = Math.max(Math.abs(l), Math.abs(r));

        // 2) 维护「前瞻窗口最大值」：窗口覆盖最近 limLen 个样点。
        //    输出样点比输入晚 limLen 个样点，因此该窗口对输出而言包含其“未来”，
        //    增益据此计算，必然覆盖即将到来的峰值 —— 不需要靠削波兜底。
        const abs = this.limAbs++;
        const dqIdx = this.limDqIdx;
        const dqVal = this.limDqVal;
        let head = this.limDqHead;
        let tail = this.limDqTail;
        while (tail > head && dqVal[tail - 1] <= peak) tail--;
        if (tail >= dqIdx.length) {
          // 压缩有效区间，避免队列指针跑出数组
          const live = tail - head;
          for (let k = 0; k < live; k++) {
            dqIdx[k] = dqIdx[head + k];
            dqVal[k] = dqVal[head + k];
          }
          head = 0;
          tail = live;
        }
        dqIdx[tail] = abs;
        dqVal[tail] = peak;
        tail++;
        // 窗口保持 limLen + 1 个样点：必须把延迟后的那个样点本身也覆盖进去
        while (head < tail && abs - dqIdx[head] > this.limLen) head++;
        const windowMax = dqVal[head];
        this.limDqHead = head;
        this.limDqTail = tail;

        // 3) 目标增益：瞬时压下、缓慢释放（释放慢于前瞻长度，保证峰值经过时仍处于压低状态）
        const need = windowMax > this.ceiling ? this.ceiling / windowMax : 1;
        if (need < this.limGain) this.limGain = need;
        else this.limGain += this.limReleaseCoef * (need - this.limGain);
        const limGain = this.limGain;

        const delayedL = this.limBufL[this.limPos];
        const delayedR = this.limBufR[this.limPos];
        this.limBufL[this.limPos] = l;
        this.limBufR[this.limPos] = r;
        this.limPos = (this.limPos + 1) % this.limLen;

        l = delayedL * limGain;
        r = delayedR * limGain;

        // 峰值保护：无论如何都不允许越过上限
        if (l > this.ceiling) l = this.ceiling;
        else if (l < -this.ceiling) l = -this.ceiling;
        if (r > this.ceiling) r = this.ceiling;
        else if (r < -this.ceiling) r = -this.ceiling;
      } else {
        l = Math.max(-1, Math.min(1, l));
        r = Math.max(-1, Math.min(1, r));
      }
      if (!Number.isFinite(l)) l = 0;
      if (!Number.isFinite(r)) r = 0;
      outL[i] = l;
      outR[i] = r;
    }

    return true;
  }
}

registerProcessor('rlondsp-dsp', RlonDSPDSP);
