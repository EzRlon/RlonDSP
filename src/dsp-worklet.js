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

class RlonDSPDSP extends AudioWorkletProcessor {
  constructor() {
    super();
    this.fs = sampleRate || 48000;
    this.eqFreqs = [60, 120, 250, 500, 1000, 2000, 4000, 8000, 12000, 16000];
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
        limiter: true
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
      limiter: { ceilingDB: -1 }
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
      limiter: { ...this.defaultParams().limiter, ...(p.limiter || {}) }
    };

    const eqGains = this.params.eqGains || new Array(10).fill(0);
    for (let i = 0; i < this.eqFreqs.length; i++) {
      this.eqL[i].setPeaking(this.eqFreqs[i], eqGains[i] || 0, this.fs);
      this.eqR[i].setPeaking(this.eqFreqs[i], eqGains[i] || 0, this.fs);
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

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    if (!input || !output || input.length === 0) return true;
    const n = output[0].length;
    const inL = input[0] || new Float32Array(n);
    const inR = input[1] || inL;
    const outL = output[0];
    const outR = output.length > 1 ? output[1] : outL;

    for (let i = 0; i < n; i++) {
      let l = inL[i] || 0;
      let r = inR[i] || 0;

      if (this.params.enabled.bass) {
        l = this.bassL.process(l);
        r = this.bassR.process(r);
        if (this.bassDrive > 1.001) {
          l = Math.tanh(l * this.bassDrive);
          r = Math.tanh(r * this.bassDrive);
        }
      }

      for (let b = 0; b < this.eqFreqs.length; b++) {
        l = this.eqL[b].process(l);
        r = this.eqR[b].process(r);
      }

      if (this.params.enabled.compressor) {
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

      if (this.params.enabled.clarity) {
        l = this.clarityL.process(l);
        r = this.clarityR.process(r);
      }

      if (this.params.enabled.stereo) {
        const mid = (l + r) * 0.5;
        const side = (l - r) * 0.5 * (1 + this.stereoWidth);
        l = mid + side;
        r = mid - side;
      }

      if (this.params.enabled.surround) {
        const cross = this.surroundCross;
        l = l + (r - l) * cross;
        r = r + (l - r) * cross;
      }

      if (this.params.enabled.tube) {
        l = Math.tanh(l * this.tubeDrive);
        r = Math.tanh(r * this.tubeDrive);
      }

      if (this.params.enabled.ultrasonic) {
        l = this.ultraL.process(l);
        r = this.ultraR.process(r);
      }

      outL[i] = l;
      outR[i] = r;
    }

    if (this.params.enabled.reverb) {
      this.reverb.process(outL, outL, 0, n);
      this.reverb.process(outR, outR, 0, n);
    }

    if (this.params.enabled.noiseGate) {
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

    for (let i = 0; i < n; i++) {
      let l = outL[i] * this.masterGain;
      let r = outR[i] * this.masterGain;
      if (this.params.enabled.limiter) {
        l = Math.max(-this.ceiling, Math.min(this.ceiling, l));
        r = Math.max(-this.ceiling, Math.min(this.ceiling, r));
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
