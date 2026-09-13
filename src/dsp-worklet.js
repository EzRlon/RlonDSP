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
        clipper: false
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
      delay: { enabled: false, timeMs: 320, feedback: 0.35, mix: 0.25, pingPong: false },
      // 合唱：短延迟 + 缓慢调制，制造「多个人同时唱」的厚度
      chorus: { enabled: false, rateHz: 0.6, depthMs: 6, mix: 0.4, spread: 0.5 },
      // 镶边：更短的延迟 + 反馈，产生梳状滤波的扫频效果
      flanger: { enabled: false, rateHz: 0.25, depthMs: 3, mix: 0.45, feedback: 0.4 },
      // 削波 / 饱和：软削波（tanh）或硬削波
      clipper: { enabled: false, drive: 2, mode: 'soft', outputDB: 0 }
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
      clipper: { ...this.defaultParams().clipper, ...(p.clipper || {}) }
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

    if (!this.dlL) {
      // 一次性分配：延迟最长 1.2 s，合唱 60 ms，镶边 25 ms
      this.dlL = new DelayLine(this.fs * 1.2);
      this.dlR = new DelayLine(this.fs * 1.2);
      this.chL = new DelayLine(this.fs * 0.06);
      this.chR = new DelayLine(this.fs * 0.06);
      this.flL = new DelayLine(this.fs * 0.025);
      this.flR = new DelayLine(this.fs * 0.025);
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
        if (this.clipHard) {
          l = Math.max(-1, Math.min(1, l * d));
          r = Math.max(-1, Math.min(1, r * d));
        } else {
          l = Math.tanh(l * d);
          r = Math.tanh(r * d);
        }
        l *= this.clipOut;
        r *= this.clipOut;
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

    // ---- 延迟 / 回声：时间 20~1000 ms、反馈 0~0.9、干湿混合，可开乒乓 ----
    if (this.on('delay') && this.params.enabled.delay && this.dlL) {
      const t = this.delayTimeSamples;
      const fb = this.delayFeedback;
      const mix = this.delayMix;
      const pp = this.delayPingPong;
      for (let i = 0; i < n; i++) {
        const xl = outL[i];
        const xr = outR[i];
        const wetL = this.dlL.read(t);
        const wetR = this.dlR.read(t);
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
