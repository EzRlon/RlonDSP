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

  setHighpass(freq, fs, q = 0.707) {
    const w0 = 2 * Math.PI * Math.min(fs * 0.45, Math.max(10, freq)) / fs;
    const cos = Math.cos(w0);
    const sin = Math.sin(w0);
    const alpha = sin / (2 * Math.max(0.1, q));
    const a0 = 1 + alpha;
    this.setCoefficients(
      (1 + cos) / 2 / a0,
      -(1 + cos) / a0,
      (1 + cos) / 2 / a0,
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

/**
 * 多相 FIR 过采样器：用于 Limiter True Peak 检测。
 * 预计算 16-tap windowed-sinc 系数，运行期只读写 Float32Array，不创建对象。
 */
class PolyphaseOversampler {
  constructor(maxFactor, taps) {
    this.maxFactor = maxFactor || 4;
    this.taps = taps || 16;
    this.hist = new Float32Array(this.taps);
    this.buf = new Float32Array(this.maxFactor);
    this.pos = 0;
    this.factor = 1;
    this.count = 1;
    this.coeff = new Array(this.maxFactor + 1);
    const center = (this.taps - 1) * 0.5;
    [1, 2, 4].forEach((L) => {
      const table = new Float32Array(L * this.taps);
      for (let p = 0; p < L; p++) {
        let sum = 0;
        for (let k = 0; k < this.taps; k++) {
          const x = k - center + p / L;
          const sinc = Math.abs(x) < 1e-7 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x);
          const win = 0.54 - 0.46 * Math.cos((2 * Math.PI * k) / (this.taps - 1));
          const value = sinc * win;
          table[p * this.taps + k] = value;
          sum += value;
        }
        const norm = Math.abs(sum) < 1e-7 ? 1 : sum;
        for (let k = 0; k < this.taps; k++) table[p * this.taps + k] /= norm;
      }
      this.coeff[L] = table;
    });
  }

  setFactor(factor) {
    this.factor = factor === 2 || factor === 4 ? factor : 1;
  }

  process(x) {
    const taps = this.taps;
    this.hist[this.pos] = Number.isFinite(x) ? x : 0;
    const table = this.coeff[this.factor] || this.coeff[1];
    const count = this.factor;
    for (let p = 0; p < count; p++) {
      let sum = 0;
      const base = p * taps;
      for (let k = 0; k < taps; k++) {
        let index = this.pos - k;
        if (index < 0) index += taps;
        sum += this.hist[index] * table[base + k];
      }
      this.buf[p] = sum * count;
    }
    this.pos++;
    if (this.pos >= taps) this.pos = 0;
    this.count = count;
    return this.buf;
  }
}

class FDNReverb {
  constructor(fs) {
    this.fs = fs;
    this.N = 8;
    this.baseLen = [4799, 5119, 5441, 5743, 6047, 6373, 6911, 7297];
    this.maxRoomSize = 2.5;
    this.maxPredelay = 0.25;
    this.roomSize = 1;
    this.t60 = 2.6;
    this.damping = 0.55;
    this.wet = 0.32;
    this.predelay = 0.02;
    this.diffusion = 0.7;
    this.modRate = 0.3;
    this.modAmount = 0.15;
    this.lowCut = 20;
    this.modPhase = 0;
    this.enabled = true;
    this.v = new Float32Array(this.N).fill(1);
    this.scratchY = new Float32Array(this.N);
    this.scratchD = new Float32Array(this.N);
    this.scratchW = new Float32Array(this.N);
    this.damp = new Float32Array(this.N);
    this.pos = new Int32Array(this.N);
    this.delay = new Array(this.N);
    this.maxDelayLengths = new Int32Array(this.N);
    this.predelayBuf = null;
    this.pd = 0;
    this.activePredelayLen = 1;
    this.activeDelayLengths = new Int32Array(this.N);
    this.lowCutFilter = new Biquad();
    this.allocMax();
    this.updateDecay();
    this.updateDamping();
    this.updatePredelay();
  }

  allocMax() {
    const scale = this.fs / 48000;
    for (let i = 0; i < this.N; i++) {
      const length = Math.max(1, Math.floor(this.baseLen[i] * this.maxRoomSize * scale) + 2);
      this.maxDelayLengths[i] = length;
      this.delay[i] = new Float32Array(length);
    }
    const pdLen = Math.max(1, Math.floor(this.maxPredelay * this.fs) + 1);
    this.predelayBuf = new Float32Array(pdLen);
    this.activePredelayLen = 1;
    this.pd = 0;
    this.pos.fill(0);
    this.activeDelayLengths.fill(1);
  }

  updateActiveLengths() {
    const scale = this.fs / 48000;
    for (let i = 0; i < this.N; i++) {
      this.activeDelayLengths[i] = Math.max(1, Math.min(this.maxDelayLengths[i] - 1, Math.floor(this.baseLen[i] * this.roomSize * scale)));
      if (this.pos[i] >= this.activeDelayLengths[i]) this.pos[i] = 0;
    }
  }

  updateDecay() {
    let avg = 0;
    for (let i = 0; i < this.N; i++) avg += this.baseLen[i] * this.roomSize;
    avg = (avg / this.N) / this.fs;
    this.fbGain = this.t60 > 0.001 ? Math.pow(10, -3 * avg / this.t60) : 0.001;
    if (!Number.isFinite(this.fbGain)) this.fbGain = 0.7;
    this.fbGain = Math.max(0.001, Math.min(0.999, this.fbGain * (0.75 + 0.25 * this.diffusion)));
  }

  updateDamping() {
    this.dampCoef = Math.min(0.95, 0.1 + this.damping * 0.7);
  }

  updatePredelay() {
    const requested = Math.max(0, Math.min(this.maxPredelay, Number.isFinite(this.predelay) ? this.predelay : 0.02));
    this.activePredelayLen = Math.max(1, Math.min(this.predelayBuf.length, Math.floor(requested * this.fs) + 1));
    if (this.pd >= this.activePredelayLen) this.pd = 0;
  }

  setParams(p) {
    this.enabled = p.enabled !== false;
    this.roomSize = Math.max(0.3, Math.min(this.maxRoomSize, Number.isFinite(Number(p.roomSize)) ? Number(p.roomSize) : 1));
    this.t60 = Math.max(0.05, Math.min(20, Number.isFinite(Number(p.t60)) ? Number(p.t60) : 2.6));
    this.damping = Math.max(0, Math.min(1, Number.isFinite(Number(p.damping)) ? Number(p.damping) : 0.55));
    this.wet = Math.max(0, Math.min(1, Number.isFinite(Number(p.wet)) ? Number(p.wet) : 0.32));
    this.predelay = Math.max(0, Math.min(this.maxPredelay, Number.isFinite(Number(p.predelay)) ? Number(p.predelay) : 0.02));
    this.diffusion = Math.max(0, Math.min(1, Number.isFinite(Number(p.diffusion)) ? Number(p.diffusion) : 0.7));
    this.modRate = Math.max(0.05, Math.min(5, Number.isFinite(Number(p.modRate)) ? Number(p.modRate) : 0.3));
    this.modAmount = Math.max(0, Math.min(1, Number.isFinite(Number(p.modAmount)) ? Number(p.modAmount) : 0.15));
    this.lowCut = Math.max(20, Math.min(1000, Number.isFinite(Number(p.lowCut)) ? Number(p.lowCut) : 20));
    const requestedFs = Number(p.fs);
    if (Number.isFinite(requestedFs) && Math.abs(requestedFs - this.fs) > 0.5) {
      this.fs = requestedFs;
      this.allocMax();
    }
    this.updateActiveLengths();
    this.updateDecay();
    this.updateDamping();
    this.updatePredelay();
    this.lowCutFilter.setHighpass(this.lowCut, this.fs, 0.707);
  }

  process(input, output, start, n) {
    const wet = this.wet;
    if (!this.enabled || wet <= 0) {
      for (let s = 0; s < n; s++) output[start + s] = input[start + s];
      return;
    }
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
    const preLen = this.activePredelayLen;
    const modDepth = this.modAmount * 0.02;
    const modInc = this.modRate / this.fs;
    let modPhase = this.modPhase;

    for (let s = 0; s < n; s++) {
      const inSample = Number.isFinite(input[start + s]) ? input[start + s] : 0;
      predelayBuf[pd] = inSample;
      const x = predelayBuf[pd];
      pd++;
      if (pd >= preLen) pd = 0;

      let dot = 0;
      const mod = Math.sin(modPhase * 6.283185307179586) * modDepth;
      modPhase += modInc; if (modPhase >= 1) modPhase -= 1;
      for (let i = 0; i < N; i++) {
        const len = this.activeDelayLengths[i];
        let idx = pos[i] - Math.round(mod * len);
        if (idx < 0) idx += len;
        if (idx >= len) idx -= len;
        const yi = delays[i][idx];
        y[i] = yi;
        damp[i] = (1 - dampCoef) * yi + dampCoef * damp[i];
        d[i] = damp[i];
        dot += v[i] * d[i];
      }
      const k = 2 * dot / N;
      for (let i = 0; i < N; i++) {
        w[i] = d[i] - k * v[i];
        const idx = pos[i];
        delays[i][idx] = x + fb * w[i];
        const next = idx + 1;
        pos[i] = next >= this.activeDelayLengths[i] ? 0 : next;
      }

      let wetOut = 0;
      for (let i = 0; i < N; i++) wetOut += y[i];
      wetOut = this.lowCutFilter.process(wetOut * outCoef);
      const dry = input[start + s];
      output[start + s] = dry * (1 - wet) + wetOut * wet;
    }
    this.pd = pd;
    this.modPhase = modPhase;
  }
}

class NoiseGate {
  constructor(fs) {
    this.fs = fs;
    this.threshold = -52;
    this.releaseMs = 180;
    this.attackMs = 2;
    this.holdMs = 50;
    this.rangeDB = 60;
    this.ratio = 2;
    this.hysteresisDB = 3;
    this.envL = 0;
    this.envR = 0;
    this.gainL = 1;
    this.gainR = 1;
    this.update();
  }
  setParams(p) {
    const threshold = Number(p.threshold);
    const releaseMs = Number(p.releaseMs);
    const attackMs = Number(p.attackMs);
    const holdMs = Number(p.holdMs);
    const rangeDB = Number(p.rangeDB);
    const ratio = Number(p.ratio);
    const hysteresisDB = Number(p.hysteresisDB);
    this.threshold = Number.isFinite(threshold) ? threshold : -52;
    this.releaseMs = Number.isFinite(releaseMs) ? releaseMs : 180;
    this.attackMs = Number.isFinite(attackMs) ? attackMs : 2;
    this.holdMs = Number.isFinite(holdMs) ? holdMs : 50;
    this.rangeDB = Number.isFinite(rangeDB) ? rangeDB : 60;
    this.ratio = Number.isFinite(ratio) ? ratio : 2;
    this.hysteresisDB = Number.isFinite(hysteresisDB) ? hysteresisDB : 3;
    this.update();
  }
  update() {
    this.thresholdLin = Math.pow(10, this.threshold / 20);
    this.closeThresholdLin = Math.pow(10, (this.threshold - this.hysteresisDB) / 20);
    this.holdSamples = Math.max(0, Math.round(this.holdMs * this.fs / 1000));
    this.rangeLin = Math.pow(10, -Math.max(0, this.rangeDB) / 20);
    this.ratio = Math.max(1, this.ratio);
    this.releaseCoef = 1 - Math.exp(-1 / (Math.max(1, this.releaseMs) * this.fs / 1000));
    this.attackCoef = 1 - Math.exp(-1 / (Math.max(0.1, this.attackMs) * this.fs / 1000));
  }
  processSample(x, env, gain) {
    const level = Math.abs(Number.isFinite(x) ? x : 0);
    let nextEnv = env;
    if (level > nextEnv) nextEnv += this.attackCoef * (level - nextEnv);
    else nextEnv += this.releaseCoef * (level - nextEnv);
    const target = nextEnv > this.thresholdLin ? 1 : 0;
    const nextGain = gain + (target - gain) * this.attackCoef;
    return x * nextGain;
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

const EMPTY_PARAM_SOURCE = {};

/** 把消息参数写进已有对象，避免参数更新时反复创建参数对象。 */
function mergeParamGroup(target, defaults, source) {
  const src = source || EMPTY_PARAM_SOURCE;
  for (const key in defaults) {
    const value = src[key];
    target[key] = value === undefined ? defaults[key] : value;
  }
  return target;
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
    this.eqMid = this.eqFreqs.map(() => new Biquad());
    this.eqSide = this.eqFreqs.map(() => new Biquad());
    this.eqDynL = null;
    this.eqDynR = null;
    this.bassL = new Biquad();
    this.bassR = new Biquad();
    this.bassSubL = new Biquad();
    this.bassSubR = new Biquad();
    this.compScL = new Biquad();
    this.compScR = new Biquad();
    this.compLookL = null;
    this.compLookR = null;
    this.compLookLen = 0;
    this.compLookPos = 0;
    this.compEnvDb = -120;
    this.stereoSideLpL = new Biquad();
    this.stereoSideLpR = new Biquad();
    this.stereoCorrEnv = 0;
    this.spatialL = null;
    this.spatialR = null;
    this.clarityPresenceL = new Biquad();
    this.clarityPresenceR = new Biquad();
    this.clarityAirL = new Biquad();
    this.clarityAirR = new Biquad();
    this.clarityTargetL = new Biquad();
    this.clarityTargetR = new Biquad();
    this.clarityL = new Biquad();
    this.clarityR = new Biquad();
    this.ultraL = new Biquad();
    this.ultraR = new Biquad();
    this.reverbL = new FDNReverb(this.fs);
    this.reverbR = new FDNReverb(this.fs);
    this.revErL = null;
    this.revErR = null;
    this.revDuckEnv = 0;
    this.gate = new NoiseGate(this.fs);
    this.gateScL = new Biquad();
    this.gateScR = new Biquad();
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
    this.limOsL = new PolyphaseOversampler(4, 16);
    this.limOsR = new PolyphaseOversampler(4, 16);
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
    this.executionTypes = null;
    this.graphPlanValid = false;
    this.graphPlanWarning = 'no-graph-plan';
    this.defaults = this.defaultParams();
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
      eqBands: Array.from({ length: 10 }, (_, i) => ({
        freq: [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000][i],
        q: 1.2,
        type: 'peaking',
        slope: 0.5,
        ms: 0,
        dynamic: 0
      })),
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
      compressor: {
        thresholdDB: -24, ratio: 4, attackMs: 10, releaseMs: 120,
        knee: 6, makeupDB: 0, lookaheadMs: 0, sidechainHz: 80, stereoLink: 1, autoRelease: false
      },
      bass: { gainDB: 6, crossoverHz: 80, subDB: 0, harmonic: 0, slope: 0.5, bassMono: 0, mix: 1 },
      stereo: { width: 0.5, midDB: 0, sideDB: 0, bassMono: 0, monoFreq: 120, correlationProtect: 0, mix: 1 },
      surround: { roomSize: 1, crossfeed: 0.3, width: 1, depth: 0.3, center: 0.5 },
      clarity: { strength: 0.5, presenceDB: 0, airDB: 0, targetHz: 3500, targetQ: 1.2, exciter: 0, mix: 1 },
      tube: { drive: 0.3, bias: 0, character: 0, symmetry: 1, mix: 1, oversample: 2 },
      reverb: {
        roomSize: 1, t60: 2.6, damping: 0.55, wet: 0.32, predelay: 0.02,
        diffusion: 0.7, width: 1, earlyReflections: 0.3,
        modRate: 0.3, modAmount: 0.15, lowCut: 20, ducking: 0, duckSensitivity: 0.5
      },
      gate: {
        threshold: -52, attackMs: 2, releaseMs: 180, holdMs: 50,
        rangeDB: 60, ratio: 2, sidechainHz: 80, hysteresisDB: 3
      },
      limiter: {
        ceilingDB: -1, lookaheadMs: 2, releaseMs: 60,
        truePeak: false, oversample: 1, stereoLink: 1, inputDB: 0, softClip: false, autoRelease: false
      },
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
    const incoming = p || EMPTY_PARAM_SOURCE;
    const defaults = this.defaults || this.defaultParams();
    const params = this.params || this.defaultParams();
    params.gainDB = incoming.gainDB === undefined ? defaults.gainDB : incoming.gainDB;
    params.eqGains = incoming.eqGains || params.eqGains || defaults.eqGains;
    mergeParamGroup(params.enabled, defaults.enabled, incoming.enabled);
    mergeParamGroup(params.compressor, defaults.compressor, incoming.compressor);
    mergeParamGroup(params.bass, defaults.bass, incoming.bass);
    mergeParamGroup(params.stereo, defaults.stereo, incoming.stereo);
    mergeParamGroup(params.surround, defaults.surround, incoming.surround);
    mergeParamGroup(params.clarity, defaults.clarity, incoming.clarity);
    mergeParamGroup(params.tube, defaults.tube, incoming.tube);
    mergeParamGroup(params.reverb, defaults.reverb, incoming.reverb);
    mergeParamGroup(params.gate, defaults.gate, incoming.gate);
    mergeParamGroup(params.limiter, defaults.limiter, incoming.limiter);
    mergeParamGroup(params.channelDelay, defaults.channelDelay, incoming.channelDelay);
    mergeParamGroup(params.delay, defaults.delay, incoming.delay);
    mergeParamGroup(params.chorus, defaults.chorus, incoming.chorus);
    mergeParamGroup(params.flanger, defaults.flanger, incoming.flanger);
    mergeParamGroup(params.clipper, defaults.clipper, incoming.clipper);
    mergeParamGroup(params.expander, defaults.expander, incoming.expander);
    mergeParamGroup(params.transient, defaults.transient, incoming.transient);
    mergeParamGroup(params.deesser, defaults.deesser, incoming.deesser);
    mergeParamGroup(params.dynEq, defaults.dynEq, incoming.dynEq);
    mergeParamGroup(params.mbComp, defaults.mbComp, incoming.mbComp);
    for (let i = 0; i < params.eqBands.length; i++) {
      mergeParamGroup(params.eqBands[i], defaults.eqBands[i], incoming.eqBands && incoming.eqBands[i]);
    }
    this.params = params;

    // 内置引擎开关表：被第三方 Provider 接管的类型，内置引擎必须跳过，避免重复处理。
    // 未提供时全部视为启用（与旧版行为一致）。
    this.builtins = incoming.builtins || null;
    this.setExecutionPlan(incoming.plan);

    // 均衡器：目标增益与当前平滑增益分离，逐块向目标靠拢，避免拖动时产生爆音
    const eqGains = this.params.eqGains || new Array(this.eqFreqs.length).fill(0);
    if (!this.eqConfig || this.eqConfig.length !== this.eqFreqs.length) {
      this.eqConfig = this.eqFreqs.map(() => ({ freq: 0, q: 1.2, type: 'peaking', slope: 0.5, ms: 0, dynamic: 0 }));
    }
    if (!this.eqTarget || this.eqTarget.length !== this.eqFreqs.length) {
      this.eqTarget = new Array(this.eqFreqs.length).fill(0);
    }
    for (let i = 0; i < this.eqFreqs.length; i++) {
      const cfg = (this.params.eqBands && this.params.eqBands[i]) || {};
      const type = ['peaking', 'lowshelf', 'highshelf', 'bandpass'].includes(cfg.type) ? cfg.type : 'peaking';
      const out = this.eqConfig[i];
      out.freq = clampNum(cfg.freq, 20, this.fs * 0.45, this.eqFreqs[i]);
      out.q = clampNum(cfg.q, 0.3, 10, 1.2);
      out.type = type;
      out.slope = clampNum(cfg.slope, 0, 1, 0.5);
      out.ms = clampNum(cfg.ms, -1, 1, 0);
      out.dynamic = clampNum(cfg.dynamic, 0, 1, 0);
      this.eqTarget[i] = Number.isFinite(Number(eqGains[i])) ? Number(eqGains[i]) : 0;
    }
    if (!this.eqDynL || this.eqDynL.length !== this.eqFreqs.length) {
      this.eqDynL = this.eqFreqs.map(() => new EnvelopeFollower());
      this.eqDynR = this.eqFreqs.map(() => new EnvelopeFollower());
    }
    if (!this.eqCurrent || this.eqCurrent.length !== this.eqTarget.length) {
      // 首次加载直接生效，不做渐入
      this.eqCurrent = this.eqTarget.slice();
    }
    for (let i = 0; i < this.eqFreqs.length; i++) this.setEqBandFilters(i, this.eqCurrent[i]);

    const bassGain = this.params.enabled.bass ? this.params.bass.gainDB : 0;
    const bassCfg = this.params.bass;
    this.bassL.setLowShelf(bassCfg.crossoverHz, bassGain, this.fs, clampNum(0.4 + bassCfg.slope * 1.6, 0.4, 2, 0.707));
    this.bassR.setLowShelf(bassCfg.crossoverHz, bassGain, this.fs, clampNum(0.4 + bassCfg.slope * 1.6, 0.4, 2, 0.707));
    this.bassSubL.setLowShelf(Math.min(80, bassCfg.crossoverHz), clampNum(bassCfg.subDB, -12, 12, 0), this.fs, 0.707);
    this.bassSubR.setLowShelf(Math.min(80, bassCfg.crossoverHz), clampNum(bassCfg.subDB, -12, 12, 0), this.fs, 0.707);
    this.bassHarmonic = clampNum(bassCfg.harmonic, 0, 1, 0);
    this.bassMono = clampNum(bassCfg.bassMono, 0, 1, 0);
    this.bassMix = clampNum(bassCfg.mix, 0, 1, 1);

    const clarityCfg = this.params.clarity;
    const clarityGain = this.params.enabled.clarity ? clarityCfg.strength * 5 : 0;
    this.clarityL.setHighShelf(3500, clarityGain, this.fs);
    this.clarityR.setHighShelf(3500, clarityGain, this.fs);
    this.clarityPresenceL.setPeaking(3200, clampNum(clarityCfg.presenceDB, -12, 12, 0), this.fs, 1.0);
    this.clarityPresenceR.setPeaking(3200, clampNum(clarityCfg.presenceDB, -12, 12, 0), this.fs, 1.0);
    this.clarityAirL.setHighShelf(10000, clampNum(clarityCfg.airDB, -12, 12, 0), this.fs, 0.707);
    this.clarityAirR.setHighShelf(10000, clampNum(clarityCfg.airDB, -12, 12, 0), this.fs, 0.707);
    this.clarityTargetL.setPeaking(clampNum(clarityCfg.targetHz, 1000, 12000, 3500), clarityGain, this.fs, clampNum(clarityCfg.targetQ, 0.3, 8, 1.2));
    this.clarityTargetR.setPeaking(clampNum(clarityCfg.targetHz, 1000, 12000, 3500), clarityGain, this.fs, clampNum(clarityCfg.targetQ, 0.3, 8, 1.2));
    this.clarityExciter = clampNum(clarityCfg.exciter, 0, 1, 0);
    this.clarityMix = clampNum(clarityCfg.mix, 0, 1, 1);
    this.ultraL.setLowpass(19000, this.fs, 0.9);
    this.ultraR.setLowpass(19000, this.fs, 0.9);

    this.masterGain = Math.pow(10, (Number.isFinite(Number(this.params.gainDB)) ? Number(this.params.gainDB) : 0) / 20);
    this.comp = this.params.compressor;
    this.compAttackCoef = 1 - Math.exp(-1 / (Math.max(1, this.comp.attackMs) * this.fs / 1000));
    this.compReleaseCoef = 1 - Math.exp(-1 / (Math.max(1, this.comp.releaseMs) * this.fs / 1000));
    this.compKnee = clampNum(this.comp.knee, 0, 24, 6);
    this.compMakeup = Math.pow(10, clampNum(this.comp.makeupDB, -12, 24, 0) / 20);
    this.compLink = clampNum(this.comp.stereoLink, 0, 1, 1);
    this.compAutoRelease = !!this.comp.autoRelease;
    this.compScL.setHighpass(clampNum(this.comp.sidechainHz, 20, 2000, 80), this.fs, 0.707);
    this.compScR.setHighpass(clampNum(this.comp.sidechainHz, 20, 2000, 80), this.fs, 0.707);
    const compLook = Math.max(0, Math.min(this.fs * 0.02, Math.round(clampNum(this.comp.lookaheadMs, 0, 10, 0) * this.fs / 1000)));
    if (compLook !== this.compLookLen) {
      this.compLookLen = compLook;
      this.compLookL = compLook ? new Float32Array(compLook) : null;
      this.compLookR = compLook ? new Float32Array(compLook) : null;
      this.compLookPos = 0;
    }
    this.compReleaseFastCoef = 1 - Math.exp(-1 / (Math.max(5, this.comp.releaseMs * 0.35) * this.fs / 1000));
    this.bassDrive = 1 + this.params.bass.gainDB / 30;
    const stereoCfg = this.params.stereo;
    this.stereoWidth = clampNum(stereoCfg.width, 0, 2, 0.5);
    this.stereoMidGain = Math.pow(10, clampNum(stereoCfg.midDB, -12, 12, 0) / 20);
    this.stereoSideGain = Math.pow(10, clampNum(stereoCfg.sideDB, -12, 12, 0) / 20);
    this.stereoBassMono = clampNum(stereoCfg.bassMono, 0, 1, 0);
    this.stereoCorrProtect = clampNum(stereoCfg.correlationProtect, 0, 1, 0);
    this.stereoMix = clampNum(stereoCfg.mix, 0, 1, 1);
    this.stereoSideLpL.setLowpass(clampNum(stereoCfg.monoFreq, 20, 500, 120), this.fs, 0.707);
    this.stereoSideLpR.setLowpass(clampNum(stereoCfg.monoFreq, 20, 500, 120), this.fs, 0.707);
    const spatialCfg = this.params.surround;
    this.surroundRoom = clampNum(spatialCfg.roomSize, 0, 2, 1);
    this.surroundCross = clampNum(spatialCfg.crossfeed, 0, 1, 0.3);
    this.surroundWidth = clampNum(spatialCfg.width, 0, 2, 1);
    this.surroundDepth = clampNum(spatialCfg.depth, 0, 1, 0.3);
    this.surroundCenter = clampNum(spatialCfg.center, 0, 1, 0.5);
    if (!this.spatialL) {
      this.spatialL = new DelayLine(this.fs * 0.01);
      this.spatialR = new DelayLine(this.fs * 0.01);
      this.spatialLpL = new Biquad();
      this.spatialLpR = new Biquad();
    }
    this.spatialLpL.setLowpass(8000, this.fs, 0.707);
    this.spatialLpR.setLowpass(8000, this.fs, 0.707);
    const tubeCfg = this.params.tube;
    this.tubeDrive = clampNum(tubeCfg.drive, 0, 1, 0.3);
    this.tubeBias = clampNum(tubeCfg.bias, -1, 1, 0);
    this.tubeCharacter = clampNum(tubeCfg.character, -1, 1, 0);
    this.tubeSymmetry = clampNum(tubeCfg.symmetry, 0, 1, 1);
    this.tubeMix = clampNum(tubeCfg.mix, 0, 1, 1);
    this.tubeOversample = [1, 2, 4].includes(Number(tubeCfg.oversample)) ? Number(tubeCfg.oversample) : 2;
    this.ceiling = Math.pow(10, (Number.isFinite(Number(this.params.limiter.ceilingDB)) ? Number(this.params.limiter.ceilingDB) : -1) / 20);
    this.limInput = Math.pow(10, clampNum(this.params.limiter.inputDB, -24, 24, 0) / 20);
    this.limTruePeak = !!this.params.limiter.truePeak;
    this.limOversample = [1, 2, 4].includes(Number(this.params.limiter.oversample)) ? Number(this.params.limiter.oversample) : 1;
    this.limOsL.setFactor(this.limOversample);
    this.limOsR.setFactor(this.limOversample);
    this.limLink = clampNum(this.params.limiter.stereoLink, 0, 1, 1);
    this.limSoftClip = !!this.params.limiter.softClip;
    this.limAutoRelease = !!this.params.limiter.autoRelease;
    // 限幅器：前瞻长度与释放系数
    const lim = this.params.limiter;
    const lookMs = Math.max(0.2, Math.min(20, Number.isFinite(Number(lim.lookaheadMs)) ? Number(lim.lookaheadMs) : 2));
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
    this.limReleaseCoef = 1 - Math.exp(-1 / (Math.max(5, Number.isFinite(Number(lim.releaseMs)) ? Number(lim.releaseMs) : 60) * this.fs / 1000));
    this.limReleaseFastCoef = 1 - Math.exp(-1 / (Math.max(5, (Number.isFinite(Number(lim.releaseMs)) ? Number(lim.releaseMs) : 60) * 0.35) * this.fs / 1000));
    this.limPrevL = 0;
    this.limPrevR = 0;

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
    this.dqRangeDB = clampNum(dq.range, 0, 24, 12);
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
    if (!this.mbTrim) this.mbTrim = new Float32Array(3);
    this.mbTrim[0] = Math.pow(10, clampNum(mb.lowGainDB, -24, 24, 0) / 20);
    this.mbTrim[1] = Math.pow(10, clampNum(mb.midGainDB, -24, 24, 0) / 20);
    this.mbTrim[2] = Math.pow(10, clampNum(mb.highGainDB, -24, 24, 0) / 20);
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
    this.reverbL.setParams({
      enabled: this.params.enabled.reverb,
      roomSize: this.params.reverb.roomSize,
      t60: this.params.reverb.t60,
      damping: this.params.reverb.damping,
      wet: this.params.reverb.wet,
      predelay: this.params.reverb.predelay,
      diffusion: this.params.reverb.diffusion,
      modRate: this.params.reverb.modRate,
      modAmount: this.params.reverb.modAmount,
      lowCut: this.params.reverb.lowCut,
      fs: this.fs
    });
    this.reverbR.setParams({
      enabled: this.params.enabled.reverb,
      roomSize: this.params.reverb.roomSize,
      t60: this.params.reverb.t60,
      damping: this.params.reverb.damping,
      wet: this.params.reverb.wet,
      predelay: this.params.reverb.predelay,
      diffusion: this.params.reverb.diffusion,
      modRate: this.params.reverb.modRate,
      modAmount: this.params.reverb.modAmount,
      lowCut: this.params.reverb.lowCut,
      fs: this.fs
    });
    this.revEarly = clampNum(this.params.reverb.earlyReflections, 0, 1, 0.3);
    this.revWidth = clampNum(this.params.reverb.width, 0, 1, 1);
    this.revDucking = clampNum(this.params.reverb.ducking, 0, 1, 0);
    this.revDuckSensitivity = clampNum(this.params.reverb.duckSensitivity, 0, 1, 0.5);
    if (!this.revErL) {
      this.revErL = new DelayLine(this.fs * 0.08);
      this.revErR = new DelayLine(this.fs * 0.08);
    }
    if (!this.revDryL || this.revDryL.length < 8192) {
      this.revDryL = new Float32Array(8192);
      this.revDryR = new Float32Array(8192);
    }
    this.gate.setParams({
      threshold: this.params.gate.threshold,
      releaseMs: this.params.gate.releaseMs,
      attackMs: this.params.gate.attackMs,
      holdMs: this.params.gate.holdMs,
      rangeDB: this.params.gate.rangeDB,
      ratio: this.params.gate.ratio,
      hysteresisDB: this.params.gate.hysteresisDB
    });
    this.gateScL.setHighpass(clampNum(this.params.gate.sidechainHz, 20, 2000, 80), this.fs, 0.707);
    this.gateScR.setHighpass(clampNum(this.params.gate.sidechainHz, 20, 2000, 80), this.fs, 0.707);
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

  setEqBandFilters(index, gainDB) {
    const cfg = this.eqConfig[index];
    const filters = [this.eqMid[index], this.eqSide[index]];
    for (let f = 0; f < filters.length; f++) {
      const filter = filters[f];
      if (cfg.type === 'lowshelf') {
        filter.setLowShelf(cfg.freq, gainDB, this.fs, clampNum(0.4 + cfg.slope * 1.2, 0.4, 2, 0.707));
      } else if (cfg.type === 'highshelf') {
        filter.setHighShelf(cfg.freq, gainDB, this.fs, clampNum(0.4 + cfg.slope * 1.2, 0.4, 2, 0.707));
      } else if (cfg.type === 'bandpass') {
        filter.setBandpass(cfg.freq, this.fs, cfg.q);
      } else {
        filter.setPeaking(cfg.freq, gainDB, this.fs, clampNum(cfg.q * (0.6 + 0.8 * cfg.slope), 0.3, 10, 1.2));
      }
    }
  }

  /** 当前图谱：没有计划时使用历史固定顺序；收到 serial plan 后严格按 plan 执行。 */
  setExecutionPlan(plan) {
    const next = [];
    if (plan && Array.isArray(plan.steps)) {
      for (const step of plan.steps) {
        if (!step) continue;
        if (step.kind === 'node' && step.type) {
          next.push(String(step.type));
        } else if (step.kind === 'parallel') {
          // 当前 renderer 未创建 parallel branch。为避免错误的“假并行”，遇到该结构时
          // 放弃该次计划并回退到安全的既有串行顺序，而不是悄悄串行化改变语义。
          this.executionTypes = null;
          this.graphPlanValid = false;
          this.graphPlanWarning = 'parallel-branch-not-supported-in-audio-worklet';
          return;
        }
      }
      const filtered = next.filter((type) => type !== 'convolution' && type !== 'analyzer');
      this.executionTypes = filtered;
      this.graphPlanValid = true;
      this.graphPlanWarning = '';
      return;
    }
    this.executionTypes = null;
    this.graphPlanValid = false;
    this.graphPlanWarning = 'no-graph-plan';
  }

  /** 判断节点是否启用；Graph 已经决定是否执行，参数 enabled 只作为兼容保护。 */
  nodeEnabled(type) {
    if (!this.executionTypes) return this.on(type) && this.legacyEnabled(type);
    if (this.executionTypes.indexOf(type) < 0) return false;
    return this.on(type) && this.legacyEnabled(type);
  }

  legacyEnabled(type) {
    switch (type) {
      case 'bass': return !!this.params.enabled.bass;
      case 'eq': return true;
      case 'compressor': return !!this.params.enabled.compressor;
      case 'clarity': return !!this.params.enabled.clarity;
      case 'stereo': return !!this.params.enabled.stereo;
      case 'spatial': return !!this.params.enabled.surround;
      case 'tube': return !!this.params.enabled.tube;
      case 'ultrasonic': return !!this.params.enabled.ultrasonic;
      case 'clipper': return !!this.params.enabled.clipper;
      case 'reverb': return !!this.params.enabled.reverb;
      case 'gate': return !!this.params.enabled.noiseGate;
      case 'channel-delay': return !!this.params.channelDelay.enabled;
      case 'expander': return !!this.params.enabled.expander;
      case 'transient': return !!this.params.enabled.transient;
      case 'deesser': return !!this.params.enabled.deesser;
      case 'dyn-eq': return !!this.params.enabled.dynEq;
      case 'mb-comp': return !!this.params.enabled.mbComp;
      case 'delay': return !!this.params.enabled.delay;
      case 'chorus': return !!this.params.enabled.chorus;
      case 'flanger': return !!this.params.enabled.flanger;
      case 'gain': return true;
      case 'limiter': return !!this.params.enabled.limiter;
      default: return false;
    }
  }

  stageBass(outL, outR, n) {
    if (!this.params.enabled.bass) return;
    const mix = this.bassMix;
    const harmonic = this.bassHarmonic;
    const mono = this.bassMono;
    for (let i = 0; i < n; i++) {
      const dryL = outL[i], dryR = outR[i];
      let l = this.bassL.process(dryL) + this.bassSubL.process(dryL);
      let r = this.bassR.process(dryR) + this.bassSubR.process(dryR);
      if (harmonic > 0) {
        l += Math.tanh(Math.abs(l) * this.bassDrive) * harmonic * 0.35;
        r += Math.tanh(Math.abs(r) * this.bassDrive) * harmonic * 0.35;
      }
      if (this.bassDrive > 1.001) {
        l = Math.tanh(l * this.bassDrive);
        r = Math.tanh(r * this.bassDrive);
      }
      if (mono > 0) {
        const low = (l + r) * 0.5;
        l += (low - l) * mono;
        r += (low - r) * mono;
      }
      outL[i] = dryL + (l - dryL) * mix;
      outR[i] = dryR + (r - dryR) * mix;
    }
  }

  stageEQ(outL, outR, n) {
    if (this.eqCurrent && this.eqTarget) {
      for (let b = 0; b < this.eqFreqs.length; b++) {
        const target = this.eqTarget[b];
        let cur = this.eqCurrent[b];
        if (cur !== target) {
          const delta = target - cur;
          cur = Math.abs(delta) < 0.005 ? target : cur + delta * 0.25;
          this.eqCurrent[b] = cur;
          this.setEqBandFilters(b, cur);
        }
      }
    }
    for (let i = 0; i < n; i++) {
      const dryL = outL[i], dryR = outR[i];
      let mid = (dryL + dryR) * 0.5;
      let side = (dryL - dryR) * 0.5;
      for (let b = 0; b < this.eqFreqs.length; b++) {
        const cfg = this.eqConfig[b];
        const fMid = this.eqMid[b].process(mid);
        const fSide = this.eqSide[b].process(side);
        let dyn = 1;
        if (cfg.dynamic > 0) {
          const envL = this.eqDynL[b].step(Math.abs(fMid));
          const envR = this.eqDynR[b].step(Math.abs(fSide));
          const env = Math.max(envL, envR);
          dyn = 1 - cfg.dynamic * 0.5 * (env / (env + 0.1));
        }
        const midWeight = (cfg.ms >= 0 ? 1 : 1 + cfg.ms) * dyn;
        const sideWeight = (cfg.ms <= 0 ? 1 : 1 - cfg.ms) * dyn;
        mid += (fMid - mid) * midWeight;
        side += (fSide - side) * sideWeight;
      }
      outL[i] = mid + side;
      outR[i] = mid - side;
    }
  }

  stageCompressor(outL, outR, n) {
    const comp = this.comp;
    let env = this.env;
    for (let i = 0; i < n; i++) {
      const l = outL[i], r = outR[i];
      const scL = Math.abs(this.compScL.process(l));
      const scR = Math.abs(this.compScR.process(r));
      const level = this.compLink * Math.max(scL, scR)
        + (1 - this.compLink) * Math.sqrt((scL * scL + scR * scR) * 0.5);
      if (level > env) env += this.compAttackCoef * (level - env);
      else {
        const releaseCoef = this.compAutoRelease ? this.compReleaseFastCoef : this.compReleaseCoef;
        env += releaseCoef * (level - env);
      }
      const levelDB = 20 * Math.log10(Math.max(env, 1e-9));
      const over = levelDB - comp.thresholdDB;
      let reductionDB = 0;
      const knee = this.compKnee;
      const slope = 1 - 1 / Math.max(1, comp.ratio);
      if (knee <= 0.001) {
        reductionDB = over > 0 ? over * slope : 0;
      } else if (over >= knee * 0.5) {
        reductionDB = over * slope;
      } else if (over > -knee * 0.5) {
        const t = over + knee * 0.5;
        reductionDB = slope * t * t / (2 * knee);
      }
      const g = Math.pow(10, -reductionDB / 20);
      let outL0 = l, outR0 = r;
      if (this.compLookLen > 0) {
        const pos = this.compLookPos;
        outL0 = this.compLookL[pos];
        outR0 = this.compLookR[pos];
        this.compLookL[pos] = l;
        this.compLookR[pos] = r;
        this.compLookPos = pos + 1 >= this.compLookLen ? 0 : pos + 1;
      }
      const makeup = this.compMakeup;
      outL[i] = outL0 * g * makeup;
      outR[i] = outR0 * g * makeup;
    }
    this.env = env;
  }

  stageClarity(outL, outR, n) {
    const mix = this.clarityMix;
    const exciter = this.clarityExciter;
    for (let i = 0; i < n; i++) {
      const dryL = outL[i], dryR = outR[i];
      let l = this.clarityL.process(dryL);
      let r = this.clarityR.process(dryR);
      l = this.clarityPresenceL.process(l);
      r = this.clarityPresenceR.process(r);
      l = this.clarityAirL.process(l);
      r = this.clarityAirR.process(r);
      l = this.clarityTargetL.process(l);
      r = this.clarityTargetR.process(r);
      if (exciter > 0) {
        l += (Math.tanh(l * 3) - l) * exciter * 0.35;
        r += (Math.tanh(r * 3) - r) * exciter * 0.35;
      }
      outL[i] = dryL + (l - dryL) * mix;
      outR[i] = dryR + (r - dryR) * mix;
    }
  }

  stageStereo(outL, outR, n) {
    const w = this.stereoWidth;
    const mix = this.stereoMix;
    for (let i = 0; i < n; i++) {
      const dryL = outL[i], dryR = outR[i];
      let mid = (dryL + dryR) * 0.5 * this.stereoMidGain;
      let side = (dryL - dryR) * 0.5 * (1 + w) * this.stereoSideGain;
      if (this.stereoBassMono > 0) {
        const lowSide = this.stereoSideLpL.process(side);
        side -= lowSide * this.stereoBassMono;
      }
      if (this.stereoCorrProtect > 0) {
        const corr = Math.abs(side) / (Math.abs(mid) + 1e-6);
        side *= 1 - this.stereoCorrProtect * Math.min(1, corr);
      }
      const l = mid + side;
      const r = mid - side;
      outL[i] = dryL + (l - dryL) * mix;
      outR[i] = dryR + (r - dryR) * mix;
    }
  }

  stageSpatial(outL, outR, n) {
    const room = this.surroundRoom === undefined ? 1 : this.surroundRoom;
    const cross = clampNum(this.surroundCross * (0.5 + room * 0.5), 0, 1.5, 0.3);
    const width = this.surroundWidth;
    const depth = this.surroundDepth * (0.5 + room * 0.5);
    const center = this.surroundCenter;
    const depthSamples = depth * this.fs * 0.006;
    for (let i = 0; i < n; i++) {
      const dryL = outL[i], dryR = outR[i];
      const dL = this.spatialL.read(depthSamples);
      const dR = this.spatialR.read(depthSamples);
      this.spatialL.push(dryL);
      this.spatialR.push(dryR);
      const cfL = this.spatialLpL.process(dryR);
      const cfR = this.spatialLpR.process(dryL);
      let l = dryL * (1 - cross) + cfL * cross + dL * depth * 0.35;
      let r = dryR * (1 - cross) + cfR * cross + dR * depth * 0.35;
      const mid = (l + r) * 0.5;
      let side = (l - r) * 0.5 * width;
      const centerGain = 0.5 + center;
      l = mid * centerGain + side;
      r = mid * centerGain - side;
      outL[i] = l;
      outR[i] = r;
    }
  }

  stageTube(outL, outR, n) {
    const d = this.tubeDrive;
    const os = this.tubeOversample;
    const mix = this.tubeMix;
    if (d <= 0.0001 || mix <= 0.0001) return;
    const driveGain = 1 + d * 2;
    const prevL = this.tubePrevL || 0;
    const prevR = this.tubePrevR || 0;
    const bias = this.tubeBias;
    const character = this.tubeCharacter;
    const symmetry = this.tubeSymmetry;
    for (let i = 0; i < n; i++) {
      const dryL = outL[i], dryR = outR[i];
      let wetL = 0, wetR = 0;
      for (let k = 1; k <= os; k++) {
        const t = k / os;
        wetL += this.tubeShape(prevL + (dryL - prevL) * t, driveGain, bias, character, symmetry);
        wetR += this.tubeShape(prevR + (dryR - prevR) * t, driveGain, bias, character, symmetry);
      }
      wetL /= os; wetR /= os;
      outL[i] = dryL + (wetL - dryL) * mix;
      outR[i] = dryR + (wetR - dryR) * mix;
    }
    this.tubePrevL = outL[n - 1];
    this.tubePrevR = outR[n - 1];
  }

  tubeShape(x, d, bias, character, symmetry) {
    const driven = x * d + bias;
    const harmonics = Math.tanh(driven) * (0.75 + 0.25 * character)
      + Math.tanh(driven * 2) * 0.25 * Math.abs(character);
    const asym = x >= 0 ? 1 : (0.4 + symmetry * 0.6);
    return harmonics * asym;
  }

  stageUltrasonic(outL, outR, n) {
    for (let i = 0; i < n; i++) {
      outL[i] = this.ultraL.process(outL[i]);
      outR[i] = this.ultraR.process(outR[i]);
    }
  }

  stageClipper(outL, outR, n) {
    const d = this.clipDrive;
    const thr = this.clipThresholdLin;
    const ceil = Math.max(1e-6, this.clipCeilingLin);
    const mix = this.clipMix;
    const outMul = this.clipOut;
    for (let i = 0; i < n; i++) {
      const l = outL[i], r = outR[i];
      let pl = l, pr = r;
      if (Math.abs(l) > thr) {
        const driven = l * d;
        if (this.clipHard) {
          pl = Math.max(-ceil, Math.min(ceil, driven));
        } else {
          const excess = Math.abs(l) - thr;
          const knee = Math.max(1e-6, ceil - thr);
          const u = Math.min(1, excess / knee);
          const t = u * u * (3 - 2 * u);
          const shaped = Math.tanh(driven / ceil) * ceil;
          pl = l + (shaped - l) * t;
        }
        pl *= outMul;
      }
      if (Math.abs(r) > thr) {
        const driven = r * d;
        if (this.clipHard) {
          pr = Math.max(-ceil, Math.min(ceil, driven));
        } else {
          const excess = Math.abs(r) - thr;
          const knee = Math.max(1e-6, ceil - thr);
          const u = Math.min(1, excess / knee);
          const t = u * u * (3 - 2 * u);
          const shaped = Math.tanh(driven / ceil) * ceil;
          pr = r + (shaped - r) * t;
        }
        pr *= outMul;
      }
      outL[i] = l + (pl - l) * mix;
      outR[i] = r + (pr - r) * mix;
    }
  }

  stageReverb(outL, outR, n) {
    const count = Math.min(n, this.revDryL.length);
    for (let i = 0; i < count; i++) {
      this.revDryL[i] = outL[i];
      this.revDryR[i] = outR[i];
    }
    this.reverbL.process(outL, outL, 0, n);
    this.reverbR.process(outR, outR, 0, n);
    const er1 = Math.round(this.fs * 0.007);
    const er2 = Math.round(this.fs * 0.013);
    const early = this.revEarly;
    const wetAmount = clampNum(this.params.reverb.wet, 0, 1, 0.32);
    const width = this.revWidth;
    const ducking = this.revDucking;
    const duckSens = this.revDuckSensitivity;
    let duckEnv = this.revDuckEnv;
    for (let i = 0; i < n; i++) {
      const dryL = this.revDryL[i], dryR = this.revDryR[i];
      const tapL = this.revErL.read(er1) * 0.5 + this.revErL.read(er2) * 0.25;
      const tapR = this.revErR.read(er1) * 0.5 + this.revErR.read(er2) * 0.25;
      this.revErL.push(dryL);
      this.revErR.push(dryR);
      let wetL = outL[i] - dryL;
      let wetR = outR[i] - dryR;
      wetL += tapL * early * wetAmount;
      wetR += tapR * early * wetAmount;
      const mid = (wetL + wetR) * 0.5;
      const side = (wetL - wetR) * 0.5 * width;
      wetL = mid + side;
      wetR = mid - side;
      const env = Math.max(Math.abs(dryL), Math.abs(dryR));
      duckEnv = env > duckEnv ? env : duckEnv * 0.9995;
      const duckGain = ducking > 0
        ? 1 - ducking * Math.min(1, duckEnv * (1 + duckSens * 12))
        : 1;
      outL[i] = dryL + wetL * duckGain;
      outR[i] = dryR + wetR * duckGain;
    }
    this.revDuckEnv = duckEnv;
  }

  stageGate(outL, outR, n) {
    let envL = this.gate.envL, envR = this.gate.envR;
    let gainL = this.gate.gainL, gainR = this.gate.gainR;
    let holdL = this.gate.holdL || 0, holdR = this.gate.holdR || 0;
    const holdSamples = this.gate.holdSamples;
    const rangeLin = this.gate.rangeLin;
    const ratio = this.gate.ratio;
    for (let i = 0; i < n; i++) {
      const xL = outL[i], xR = outR[i];
      const levelL = Math.abs(this.gateScL.process(xL));
      const levelR = Math.abs(this.gateScR.process(xR));
      if (levelL > envL) envL += this.gate.attackCoef * (levelL - envL);
      else envL += this.gate.releaseCoef * (levelL - envL);
      if (levelR > envR) envR += this.gate.attackCoef * (levelR - envR);
      else envR += this.gate.releaseCoef * (levelR - envR);
      let targetL;
      if (envL > this.gate.thresholdLin) {
        targetL = 1;
        holdL = holdSamples;
      } else if (envL > this.gate.closeThresholdLin && gainL > 0.5) {
        targetL = 1;
      } else if (holdL > 0) {
        targetL = 1;
        holdL--;
      } else {
        targetL = Math.max(rangeLin, Math.pow(Math.max(1e-6, envL) / this.gate.thresholdLin, ratio - 1));
      }
      let targetR;
      if (envR > this.gate.thresholdLin) {
        targetR = 1;
        holdR = holdSamples;
      } else if (envR > this.gate.closeThresholdLin && gainR > 0.5) {
        targetR = 1;
      } else if (holdR > 0) {
        targetR = 1;
        holdR--;
      } else {
        targetR = Math.max(rangeLin, Math.pow(Math.max(1e-6, envR) / this.gate.thresholdLin, ratio - 1));
      }
      gainL += (targetL - gainL) * (targetL > gainL ? this.gate.attackCoef : this.gate.releaseCoef);
      gainR += (targetR - gainR) * (targetR > gainR ? this.gate.attackCoef : this.gate.releaseCoef);
      outL[i] = xL * gainL; outR[i] = xR * gainR;
    }
    this.gate.envL = envL; this.gate.envR = envR;
    this.gate.gainL = gainL; this.gate.gainR = gainR;
    this.gate.holdL = holdL; this.gate.holdR = holdR;
  }

  stageChannelDelay(outL, outR, n) {
    if (!this.cdBufL || !this.cdBufR || this.cdSamples <= 0) return;
    const cd = this.params.channelDelay;
    const delayRight = cd.channel !== 'L';
    const buf = delayRight ? this.cdBufR : this.cdBufL;
    const target = delayRight ? outR : outL;
    const size = this.cdSize;
    const delaySamples = this.cdSamples;
    let w = this.cdWrite;
    for (let i = 0; i < n; i++) {
      const dry = target[i];
      buf[w] = Number.isFinite(dry) ? dry : 0;
      let rp = w - delaySamples;
      if (rp < 0) rp += size;
      target[i] = buf[rp];
      w++; if (w >= size) w = 0;
    }
    this.cdWrite = w;
  }

  stageExpander(outL, outR, n) {
    const thr = this.expThresholdLin, ratio = this.expRatio, floorLin = this.expRangeLin;
    const eL = this.expEnvL, eR = this.expEnvR;
    let g = this.expGainL;
    for (let i = 0; i < n; i++) {
      const l = outL[i], r = outR[i];
      const env = Math.max(eL.step(l), eR.step(r));
      let target = 1;
      if (env < thr) {
        target = Math.pow(Math.max(1e-6, env) / thr, ratio - 1);
        if (target < floorLin) target = floorLin;
      }
      g += (target < g ? this.expAtkCoef : this.expRelCoef) * (target - g);
      outL[i] = l * g; outR[i] = r * g;
    }
    this.expGainL = g; this.expGainR = g;
  }

  stageTransient(outL, outR, n) {
    const a = this.trAttack, s = this.trSustain, mix = this.trMix, outGain = this.trOutGain;
    const fL = this.trFastL, fR = this.trFastR, sL = this.trSlowL, sR = this.trSlowR;
    for (let i = 0; i < n; i++) {
      const l = outL[i], r = outR[i];
      const fast = Math.max(fL.step(l), fR.step(r));
      const slow = Math.max(sL.step(l), sR.step(r));
      const diff = fast - slow;
      let gain = diff > 0 ? 1 + a * Math.min(1, diff * 4) * 2.5 : 1 + s * Math.max(-1, diff * 4) * 0.6;
      if (!Number.isFinite(gain)) gain = 1;
      gain = Math.max(0.2, Math.min(4, gain));
      const applied = 1 + (gain - 1) * mix;
      outL[i] = l * applied * outGain; outR[i] = r * applied * outGain;
    }
  }

  stageDeesser(outL, outR, n) {
    const thr = this.dsThresholdLin, floorLin = this.dsRangeLin;
    const eL = this.dsEnvL, eR = this.dsEnvR;
    let g = this.dsGain;
    for (let i = 0; i < n; i++) {
      const l = outL[i], r = outR[i];
      const band = Math.max(eL.step(this.dsBandL.process(l)), eR.step(this.dsBandR.process(r)));
      const target = band > thr ? Math.max(floorLin, thr / Math.max(band, 1e-9)) : 1;
      g += (target < g ? this.dsAtkCoef : this.dsRelCoef) * (target - g);
      outL[i] = l * g; outR[i] = r * g;
    }
    this.dsGain = g;
  }

  stageDynEq(outL, outR, n) {
    let current = this.dqCurrent;
    for (let i = 0; i < n; i++) {
      const l = outL[i], r = outR[i];
      const level = Math.max(this.dqEnvL.step(this.dqDetL.process(l)), this.dqEnvR.step(this.dqDetR.process(r)));
      const levelDb = 20 * Math.log10(Math.max(level, 1e-9));
      let target = 0;
      if (this.dqRangeDB <= 0.0001) {
        target = 0;
      } else if (this.dqRangeDB > 0 && levelDb > this.dqThresholdDB) {
        const over = levelDb - this.dqThresholdDB;
        const normalized = Math.max(0, Math.min(1, over / Math.max(0.1, this.dqRangeDB)));
        target = this.dqGainDB * normalized;
      }
      current += (Math.abs(target) > Math.abs(current) ? this.dqAtkCoef : this.dqRelCoef) * (target - current);
      if ((i & 31) === 0) {
        this.dqL.setPeaking(this.dqFreq, current, this.fs, this.dqQ);
        this.dqR.setPeaking(this.dqFreq, current, this.fs, this.dqQ);
      }
      outL[i] = this.dqL.process(l); outR[i] = this.dqR.process(r);
    }
    this.dqCurrent = current;
  }

  stageMbComp(outL, outR, n) {
    const env = this.mbEnv;
    const gainState = this.mbGain;
    const trim = this.mbTrim;
    const atk = this.mbAtkCoef, rel = this.mbRelCoef;
    const thr = this.mbThresholdLin, ratio = this.mbRatio;
    for (let i = 0; i < n; i++) {
      const l = outL[i], r = outR[i];
      const lowL = this.mbLowL.process(l), lowR = this.mbLowR.process(r);
      const mid2L = this.mbMidL.process(l), mid2R = this.mbMidR.process(r);
      const midL = mid2L - lowL, midR = mid2R - lowR;
      const highL = l - mid2L, highR = r - mid2R;
      let peak = Math.max(Math.abs(lowL), Math.abs(lowR));
      env[0].step(peak);
      let e = env[0].env;
      let t = 1;
      if (e > thr) t = Math.pow(thr / Math.max(e, 1e-9), 1 - 1 / ratio);
      gainState[0] += (t < gainState[0] ? atk : rel) * (t - gainState[0]);

      peak = Math.max(Math.abs(midL), Math.abs(midR));
      env[1].step(peak);
      e = env[1].env;
      t = 1;
      if (e > thr) t = Math.pow(thr / Math.max(e, 1e-9), 1 - 1 / ratio);
      gainState[1] += (t < gainState[1] ? atk : rel) * (t - gainState[1]);

      peak = Math.max(Math.abs(highL), Math.abs(highR));
      env[2].step(peak);
      e = env[2].env;
      t = 1;
      if (e > thr) t = Math.pow(thr / Math.max(e, 1e-9), 1 - 1 / ratio);
      gainState[2] += (t < gainState[2] ? atk : rel) * (t - gainState[2]);
      if (!Number.isFinite(gainState[0])) gainState[0] = 1;
      if (!Number.isFinite(gainState[1])) gainState[1] = 1;
      if (!Number.isFinite(gainState[2])) gainState[2] = 1;
      /*
      */
      outL[i] = lowL * gainState[0] * trim[0] + midL * gainState[1] * trim[1] + highL * gainState[2] * trim[2];
      outR[i] = lowR * gainState[0] * trim[0] + midR * gainState[1] * trim[1] + highR * gainState[2] * trim[2];
    }
  }

  stageDelay(outL, outR, n) {
    if (!this.dlL) return;
    const t = this.delayTimeSamples, fb = this.delayFeedback, mix = this.delayMix, pp = this.delayPingPong;
    for (let i = 0; i < n; i++) {
      const xl = outL[i], xr = outR[i];
      const wetL = this.dlLpL.process(this.dlL.read(t));
      const wetR = this.dlLpR.process(this.dlR.read(t));
      this.dlL.push(xl + (pp ? wetR : wetL) * fb);
      this.dlR.push(xr + (pp ? wetL : wetR) * fb);
      outL[i] = xl + wetL * mix; outR[i] = xr + wetR * mix;
    }
  }

  stageChorus(outL, outR, n) {
    if (!this.chL) return;
    const base = this.chorusBase, depth = this.chorusDepth, mix = this.chorusMix, spread = this.chorusSpread;
    const inc = this.chorusRate / this.fs;
    let p = this.modPhase;
    const tau = 2 * Math.PI;
    for (let i = 0; i < n; i++) {
      let p2 = p + spread; if (p2 >= 1) p2 -= 1;
      const mL = 0.5 + 0.5 * Math.sin(p * tau);
      const mR = 0.5 + 0.5 * Math.sin(p2 * tau);
      p += inc; if (p >= 1) p -= 1;
      const xl = outL[i], xr = outR[i];
      const wetL = this.chL.read(base + mL * depth), wetR = this.chR.read(base + mR * depth);
      this.chL.push(xl); this.chR.push(xr);
      outL[i] = xl * (1 - mix) + wetL * mix; outR[i] = xr * (1 - mix) + wetR * mix;
    }
    this.modPhase = p;
  }

  stageFlanger(outL, outR, n) {
    if (!this.flL) return;
    const base = this.flangerBase, depth = this.flangerDepth, mix = this.flangerMix, fb = this.flangerFeedback;
    const inc = this.flangerRate / this.fs;
    let p = this.modPhase2;
    const tau = 2 * Math.PI;
    for (let i = 0; i < n; i++) {
      const m = 0.5 + 0.5 * Math.sin(p * tau);
      p += inc; if (p >= 1) p -= 1;
      const xl = outL[i], xr = outR[i];
      const d = base + m * depth;
      const wetL = this.flL.read(d), wetR = this.flR.read(d);
      this.flL.push(xl + wetL * fb); this.flR.push(xr + wetR * fb);
      outL[i] = xl * (1 - mix) + wetL * mix; outR[i] = xr * (1 - mix) + wetR * mix;
    }
    this.modPhase2 = p;
  }

  stageGain(outL, outR, n) {
    const g = this.masterGain;
    if (g === 1) return;
    for (let i = 0; i < n; i++) { outL[i] *= g; outR[i] *= g; }
  }

  stageLimiter(outL, outR, n) {
    if (!this.limLen) return;
    const ceiling = this.ceiling;
    const input = this.limInput;
    const os = this.limOversample;
    const link = this.limLink;
    const softClip = this.limSoftClip;
    const autoRelease = this.limAutoRelease;
    for (let i = 0; i < n; i++) {
      let l = outL[i] * input, r = outR[i] * input;
      const samplePeakL = Math.abs(l), samplePeakR = Math.abs(r);
      const subL = this.limOsL.process(l);
      const subR = this.limOsR.process(r);
      let oversampledL = samplePeakL, oversampledR = samplePeakR;
      for (let k = 0; k < this.limOsL.count; k++) {
        const al = Math.abs(subL[k]);
        const ar = Math.abs(subR[k]);
        if (al > oversampledL) oversampledL = al;
        if (ar > oversampledR) oversampledR = ar;
      }
      const detL = this.limTruePeak
        ? oversampledL
        : (os > 1 ? samplePeakL * 0.5 + oversampledL * 0.5 : samplePeakL);
      const detR = this.limTruePeak
        ? oversampledR
        : (os > 1 ? samplePeakR * 0.5 + oversampledR * 0.5 : samplePeakR);
      const peak = link * Math.max(detL, detR) + (1 - link) * (detL + detR) * 0.5;
      const abs = this.limAbs++;
      const dqIdx = this.limDqIdx, dqVal = this.limDqVal;
      let head = this.limDqHead, tail = this.limDqTail;
      while (tail > head && dqVal[tail - 1] <= peak) tail--;
      if (tail >= dqIdx.length) {
        const live = tail - head;
        for (let k = 0; k < live; k++) { dqIdx[k] = dqIdx[head + k]; dqVal[k] = dqVal[head + k]; }
        head = 0; tail = live;
      }
      dqIdx[tail] = abs; dqVal[tail] = peak; tail++;
      while (head < tail && abs - dqIdx[head] > this.limLen) head++;
      const windowMax = dqVal[head];
      this.limDqHead = head; this.limDqTail = tail;
      const need = windowMax > ceiling ? ceiling / windowMax : 1;
      if (need < this.limGain) this.limGain = need;
      else {
        const releaseCoef = autoRelease && need < 0.999 ? this.limReleaseFastCoef : this.limReleaseCoef;
        this.limGain += releaseCoef * (need - this.limGain);
      }
      const g = this.limGain;
      const delayedL = this.limBufL[this.limPos], delayedR = this.limBufR[this.limPos];
      this.limBufL[this.limPos] = l; this.limBufR[this.limPos] = r;
      this.limPos++; if (this.limPos >= this.limLen) this.limPos = 0;
      l = delayedL * g; r = delayedR * g;
      l = Number.isFinite(l) ? Math.max(-ceiling, Math.min(ceiling, l)) : 0;
      r = Number.isFinite(r) ? Math.max(-ceiling, Math.min(ceiling, r)) : 0;
      if (softClip) {
        l = ceiling * Math.tanh(l / ceiling);
        r = ceiling * Math.tanh(r / ceiling);
      }
      outL[i] = l;
      outR[i] = r;
    }
  }

  runStage(type, outL, outR, n) {
    switch (type) {
      case 'bass': return this.stageBass(outL, outR, n);
      case 'eq': return this.stageEQ(outL, outR, n);
      case 'compressor': return this.stageCompressor(outL, outR, n);
      case 'clarity': return this.stageClarity(outL, outR, n);
      case 'stereo': return this.stageStereo(outL, outR, n);
      case 'spatial': return this.stageSpatial(outL, outR, n);
      case 'tube': return this.stageTube(outL, outR, n);
      case 'ultrasonic': return this.stageUltrasonic(outL, outR, n);
      case 'clipper': return this.stageClipper(outL, outR, n);
      case 'reverb': return this.stageReverb(outL, outR, n);
      case 'gate': return this.stageGate(outL, outR, n);
      case 'channel-delay': return this.stageChannelDelay(outL, outR, n);
      case 'expander': return this.stageExpander(outL, outR, n);
      case 'transient': return this.stageTransient(outL, outR, n);
      case 'deesser': return this.stageDeesser(outL, outR, n);
      case 'dyn-eq': return this.stageDynEq(outL, outR, n);
      case 'mb-comp': return this.stageMbComp(outL, outR, n);
      case 'delay': return this.stageDelay(outL, outR, n);
      case 'chorus': return this.stageChorus(outL, outR, n);
      case 'flanger': return this.stageFlanger(outL, outR, n);
      case 'gain': return this.stageGain(outL, outR, n);
      case 'limiter': return this.stageLimiter(outL, outR, n);
      default: return;
    }
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    if (!input || !output || input.length === 0) return true;
    const n = output[0].length;
    const inL = input[0] || output[0];
    const inR = input[1] || inL;
    const outL = output[0];
    const outR = output.length > 1 ? output[1] : outL;

    for (let i = 0; i < n; i++) {
      const l = inL[i], r = inR[i];
      outL[i] = Number.isFinite(l) ? l : 0;
      outR[i] = Number.isFinite(r) ? r : 0;
    }

    const order = this.executionTypes || [
      'bass', 'eq', 'compressor', 'clarity', 'stereo', 'spatial', 'tube', 'ultrasonic',
      'clipper', 'reverb', 'gate', 'channel-delay', 'expander', 'transient', 'deesser',
      'dyn-eq', 'mb-comp', 'delay', 'chorus', 'flanger', 'gain', 'limiter'
    ];

    for (let i = 0; i < order.length; i++) {
      const type = order[i];
      if (this.nodeEnabled(type)) this.runStage(type, outL, outR, n);
    }

    // 即便 Limiter 被用户关闭，也必须保证 Worklet 不输出 NaN/Infinity。
    for (let i = 0; i < n; i++) {
      if (!Number.isFinite(outL[i])) outL[i] = 0;
      if (!Number.isFinite(outR[i])) outR[i] = 0;
    }
    return true;
  }

}

registerProcessor('rlondsp-dsp', RlonDSPDSP);
