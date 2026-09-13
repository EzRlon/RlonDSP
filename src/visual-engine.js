/*
 * RlonDSP
 * Copyright © 2026 RlonDSP. All rights reserved.
 *
 * Audio-Reactive Visual Engine —— 频谱空间的第二页「沉浸视觉」。
 *
 * 设计要点（与项目既有架构保持一致）：
 *   - 不建第二套分析器：所有数值都来自渲染进程已有的分析数据（Audio Reactive Bus）。
 *   - 视觉引擎不碰音频链路：不进 AudioWorklet、不进 DSP 图谱、不改任何 DSP 参数。
 *   - 每个效果都是注册表里的一个模块，自带参数声明与生命周期：
 *       create / configure / update / render / pause / resume / resize / destroy
 *   - 只有「效果启用 ON」且「第二页处于活动状态」且「窗口可见」时才运行；
 *     隐藏页 / 未启用 / 窗口不可见 → 立即停表，切回来用原状态继续，不重置。
 *   - 每个效果画在自己的离屏画布上，再由合成器按混合模式叠加到主画布：
 *     多效果可以同时运行，不是单选。
 *   - 不在每帧创建对象、不重复 FFT、不做逐帧大分配。
 */
(function () {
  'use strict';

  /* ========================================================================
   * Audio Reactive Bus —— 全引擎共用一条数据总线
   * ====================================================================== */
  function createBus() {
    const value = {
      rms: 0, peak: 0, lufs: -70,
      bass: 0, lowMid: 0, mid: 0, high: 0,
      beat: false, beatStrength: 0, beatConfidence: 0, bpm: 0,
      spectralFlux: 0, transient: 0, energy: 0,
      stereoWidth: 0, correlation: 0, balance: 0,
      spectrum: null, waveform: null, albumHue: 200
    };
    const bassHist = new Float32Array(64);
    const fluxHist = new Float32Array(48);
    let bassHead = 0;
    let fluxHead = 0;
    let bassFilled = 0;
    let fluxFilled = 0;
    let lastBass = 0;
    let beatTimer = 0;        // 距上次判定为节拍的秒数
    let beatEnv = 0;          // 节拍脉冲包络（用于视觉衰减）
    let fluxAvg = 0;
    let bassFast = 0;         // 低频快包络
    let bassSlow = 0;         // 低频慢包络
    const beatTimes = [];

    function mean(arr, len) {
      let sum = 0;
      for (let i = 0; i < len; i++) sum += arr[i];
      return len ? sum / len : 0;
    }

    /**
     * 每帧调用一次（由渲染进程在已有的分析循环里调用）。
     * @param {object} data 现有分析结果：{ freqBytes, timeData, metrics, dt }
     */
    function update(data) {
      const dt = Math.max(0.001, Math.min(0.1, Number(data.dt) || 0.016));
      const metrics = data.metrics || {};
      const freq = data.freqBytes;
      const wave = data.timeData;
      value.peak = Number.isFinite(metrics.peakDb) ? Math.max(0, Math.min(1, Math.pow(10, metrics.peakDb / 20))) : 0;
      value.rms = Number.isFinite(metrics.rmsDb) ? Math.max(0, Math.min(1, Math.pow(10, metrics.rmsDb / 20))) : 0;
      value.lufs = Number.isFinite(metrics.integrated) ? metrics.integrated : -70;
      value.stereoWidth = Number.isFinite(metrics.width) ? metrics.width : 0;
      value.correlation = Number.isFinite(metrics.corr) ? metrics.corr : 0;
      value.balance = Number.isFinite(metrics.balance) ? metrics.balance : 0;
      value.spectrum = freq || null;
      value.waveform = wave || null;

      // 频段能量：直接复用已有频谱数据，不做第二次 FFT
      if (freq && freq.length) {
        const bin = freq.length;
        const band = (from, to) => {
          const a = Math.max(0, Math.floor(bin * from));
          const b = Math.max(a + 1, Math.floor(bin * to));
          let sum = 0;
          for (let i = a; i < b && i < bin; i++) sum += freq[i];
          return sum / ((b - a) * 255);
        };
        value.bass = band(0.0, 0.04);
        value.lowMid = band(0.04, 0.12);
        value.mid = band(0.12, 0.35);
        value.high = band(0.35, 1.0);
      }
      value.energy = Math.max(0, Math.min(1, value.bass * 0.4 + value.mid * 0.35 + value.rms * 0.45));

      // 频谱通量（Spectral Flux）：与上一帧频谱的正向差
      if (freq && freq.length) {
        if (!update._prev || update._prev.length !== freq.length) {
          update._prev = new Float32Array(freq.length);
        }
        const prev = update._prev;
        let flux = 0;
        for (let i = 0; i < freq.length; i++) {
          const d = freq[i] - prev[i];
          if (d > 0) flux += d;
          prev[i] = freq[i];
        }
        flux = flux / (freq.length * 255);
        value.spectralFlux = flux;
        fluxHist[fluxHead] = flux;
        fluxHead = (fluxHead + 1) % fluxHist.length;
        if (fluxFilled < fluxHist.length) fluxFilled++;
        fluxAvg = mean(fluxHist, fluxFilled);
      }

      // 低频包络历史：用于自适应阈值节拍检测
      bassHist[bassHead] = value.bass;
      bassHead = (bassHead + 1) % bassHist.length;
      if (bassFilled < bassHist.length) bassFilled++;
      // 节拍检测用「相对起点」而不是绝对音量：
      // 快包络与慢包络之差在音量大小完全不同的音乐里都能反映鼓点，
      // 只看绝对阈值的话，持续强低频的曲子会一次都检测不到。
      const bassAvg = mean(bassHist, bassFilled);
      const fastAtk = 1 - Math.exp(-dt / 0.008);
      const fastRel = 1 - Math.exp(-dt / 0.05);
      const slowAtk = 1 - Math.exp(-dt / 0.18);
      const slowRel = 1 - Math.exp(-dt / 0.45);
      bassFast += (value.bass - bassFast) * (value.bass > bassFast ? fastAtk : fastRel);
      bassSlow += (value.bass - bassSlow) * (value.bass > bassSlow ? slowAtk : slowRel);
      const onset = bassFast - bassSlow;
      const rel = onset / Math.max(0.02, bassSlow);
      const fluxRel = value.spectralFlux / Math.max(0.0006, fluxAvg);
      const canBeat = beatTimer > 0.22;
      const strongOnset = rel > 0.13 && onset > 0.006;
      const fluxOnset = fluxRel > 1.45 && value.spectralFlux > 0.0012;
      if (bassFilled > 12 && canBeat && (strongOnset || fluxOnset)) {
        value.beat = true;
        beatTimer = 0;
        const excess = Math.min(1, rel * 2.4 + Math.max(0, fluxRel - 1) * 0.35);
        value.beatStrength = Math.max(0.22, excess);
        // 相对起点越明显、通量越大，置信度越高；两者都不明显时降级
        value.beatConfidence = Math.max(0, Math.min(1, 0.35 + excess * 0.65));
        beatEnv = 1;
        beatTimes.push(performance.now());
        if (beatTimes.length > 12) beatTimes.shift();
        if (beatTimes.length >= 5) {
          // 用中位数而不是平均值：偶发的漏检 / 多触发不会把 BPM 拉飞
          const gaps = [];
          for (let i = 1; i < beatTimes.length; i++) {
            const gap = beatTimes[i] - beatTimes[i - 1];
            if (gap >= 240 && gap <= 1600) gaps.push(gap);
          }
          if (gaps.length >= 3) {
            gaps.sort((a, b) => a - b);
            const median = gaps[Math.floor(gaps.length / 2)];
            value.bpm = Math.round(60000 / median);
          }
        }
      } else {
        value.beat = false;
        value.beatStrength *= Math.max(0, 1 - dt * 6);
      }
      lastBass = value.bass;
      beatTimer += dt;
      beatEnv *= Math.max(0, 1 - dt * 3.2);
      value.transient = Math.max(0, Math.min(1, beatEnv * 0.65 + value.spectralFlux * 6));
    }

    return { value, update };
  }

  /* ========================================================================
   * 参数与效果基类
   * ====================================================================== */
  function lerp(a, b, t) { return a + (b - a) * t; }

  /** 极简 2D 值噪声（用于自然漂移，避免机械往返） */
  function makeNoise(seed) {
    const table = new Float32Array(256);
    let s = seed || 1;
    for (let i = 0; i < 256; i++) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      table[i] = (s / 0x7fffffff) * 2 - 1;
    }
    return function noise1(x) {
      const i = Math.floor(x);
      const f = x - i;
      const a = table[((i % 256) + 256) % 256];
      const b = table[(((i + 1) % 256) + 256) % 256];
      const t = f * f * (3 - 2 * f);
      return a + (b - a) * t;
    };
  }

  const noise = makeNoise(20260913);

  /** 基类：统一生命周期 + 离屏画布 + 参数状态 */
  function createEffect(def, options) {
    const state = Object.assign({}, def.defaultState);
    def.parameters.forEach((p) => {
      if (state[p.id] === undefined) state[p.id] = p.default;
    });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const instance = {
      id: def.id,
      def,
      state,
      canvas,
      ctx,
      width: 1,
      height: 1,
      created: false,
      running: false,
      time: 0,
      resize(w, h) {
        const nw = Math.max(2, Math.round(w));
        const nh = Math.max(2, Math.round(h));
        if (nw === this.width && nh === this.height) return;
        this.width = nw;
        this.height = nh;
        canvas.width = nw;
        canvas.height = nh;
        if (def.resize) def.resize(this, options);
      },
      create() {
        if (this.created) return;
        if (def.create) def.create(this, options);
        this.created = true;
      },
      update(dt, bus) {
        this.time += dt;
        if (def.update) def.update(this, dt, bus);
      },
      render(bus) {
        if (def.render) def.render(this, bus);
      },
      pause() {
        this.running = false;
        if (def.pause) def.pause(this);
      },
      resume() {
        this.running = true;
        if (def.resume) def.resume(this);
      },
      destroy() {
        if (def.destroy) def.destroy(this);
        canvas.width = 1;
        canvas.height = 1;
        this.created = false;
      }
    };
    return instance;
  }

  /* ========================================================================
   * 效果注册表
   * ====================================================================== */
  const registry = [];
  function register(def) { registry.push(def); }

  const cat = (id, nameKey, category, layout, params, impl) => {
    register(Object.assign({
      id, nameKey, category, layout,
      parameters: params,
      defaultState: {},
      blend: 'lighter'
    }, impl));
  };

  /* ---- 心跳：由节拍检测 + 低频驱动，可降级 ---- */
  cat('heartbeat', 'vfxHeartbeat', 'life', { span: 1, minWidth: 240, height: 150 },
    [
      { id: 'sensitivity', labelKey: 'vfxSensitivity', min: 0, max: 100, step: 1, default: 55, priority: 'core' },
      { id: 'glow', labelKey: 'vfxGlow', min: 0, max: 100, step: 1, default: 60, priority: 'core' },
      { id: 'ecg', labelKey: 'vfxEcg', min: 0, max: 100, step: 1, default: 70, priority: 'secondary' }
    ], {
      create(fx) {
        fx.pulse = 0;
        fx.ecg = new Float32Array(240);
      },
      update(fx, dt, bus) {
        const sens = fx.state.sensitivity / 100;
        const drive = bus.beat ? bus.beatStrength * bus.beatConfidence : 0;
        const fallback = (bus.bass * 0.7 + bus.transient * 0.3) * 0.55 * (1 - bus.beatConfidence * 0.5);
        const target = Math.min(1, (drive + fallback) * (0.4 + sens * 1.6));
        fx.pulse = Math.max(fx.pulse * Math.max(0, 1 - dt * 2.6), target);
        // ECG 曲线：真实节拍写入尖峰，其余时间保持基线
        const n = fx.ecg.length;
        for (let i = 0; i < n - 1; i++) fx.ecg[i] = fx.ecg[i + 1];
        fx.ecg[n - 1] = fx.pulse;
      },
      render(fx, bus) {
        const { ctx, width: w, height: h } = fx;
        ctx.clearRect(0, 0, w, h);
        const p = Math.min(1, fx.pulse);
        const cx = w / 2;
        const cy = h * 0.46;
        const base = Math.min(w, h) * 0.16;
        const r = base * (1 + p * 0.5);
        const glow = fx.state.glow / 100;
        const hue = (bus.albumHue + 340) % 360;
        if (glow > 0) {
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 3.2);
          g.addColorStop(0, 'hsla(' + hue + ', 90%, 65%, ' + (0.35 * glow * (0.4 + p)).toFixed(3) + ')');
          g.addColorStop(1, 'hsla(' + hue + ', 90%, 60%, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(cx, cy, r * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
        // 双层心形（收缩 / 扩张）
        ctx.save();
        ctx.translate(cx, cy);
        ctx.beginPath();
        const beat = 1 + p * 0.18;
        ctx.moveTo(0, r * 0.62 * beat);
        ctx.bezierCurveTo(-r * 1.5 * beat, -r * 0.5 * beat, -r * 0.55 * beat, -r * 1.35 * beat, 0, -r * 0.42 * beat);
        ctx.bezierCurveTo(r * 0.55 * beat, -r * 1.35 * beat, r * 1.5 * beat, -r * 0.5 * beat, 0, r * 0.62 * beat);
        ctx.closePath();
        ctx.fillStyle = 'hsla(' + hue + ', 85%, ' + (48 + p * 22).toFixed(1) + '%, ' + (0.35 + p * 0.55).toFixed(3) + ')';
        ctx.fill();
        ctx.lineWidth = 1.5 + p * 2.5;
        ctx.strokeStyle = 'hsla(' + hue + ', 100%, 78%, ' + (0.5 + p * 0.5).toFixed(2) + ')';
        ctx.stroke();
        ctx.restore();
        // ECG
        if (fx.state.ecg > 0) {
          const alpha = fx.state.ecg / 100;
          ctx.beginPath();
          for (let i = 0; i < fx.ecg.length; i++) {
            const x = (i / (fx.ecg.length - 1)) * w;
            const v = fx.ecg[i];
            const spike = v > 0.55 ? (v - 0.55) * (h * 0.55) : 0;
            const y = h * 0.9 - v * h * 0.12 - spike;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = 'hsla(' + hue + ', 95%, 72%, ' + (0.25 + alpha * 0.6).toFixed(2) + ')';
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
      }
    });

  /* ---- 星云：能量 + 通量 + 低频，多层色云缓慢漂移 ---- */
  cat('nebula', 'vfxNebula', 'cosmic', { span: 2, minWidth: 320, height: 220 },
    [
      { id: 'density', labelKey: 'vfxDensity', min: 20, max: 100, step: 1, default: 62, priority: 'core' },
      { id: 'reactivity', labelKey: 'vfxReactivity', min: 0, max: 100, step: 1, default: 65, priority: 'core' },
      { id: 'drift', labelKey: 'vfxDrift', min: 0, max: 100, step: 1, default: 45, priority: 'secondary' },
      { id: 'hueShift', labelKey: 'vfxHueShift', min: 0, max: 100, step: 1, default: 40, priority: 'advanced' }
    ], {
      create(fx) {
        fx.blobs = [];
        for (let i = 0; i < 7; i++) {
          fx.blobs.push({
            seed: i * 13.7,
            r: 0.28 + (i % 3) * 0.12,
            hueOffset: i * 24
          });
        }
      },
      render(fx, bus) {
        const { ctx, width: w, height: h } = fx;
        const t = fx.time;
        ctx.clearRect(0, 0, w, h);
        const react = fx.state.reactivity / 100;
        const drift = 0.15 + (fx.state.drift / 100) * 0.6;
        const count = Math.max(4, Math.round((fx.state.density / 100) * fx.blobs.length));
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < count; i++) {
          const b = fx.blobs[i];
          const nx = noise(b.seed + t * drift);
          const ny = noise(b.seed + 50 + t * drift * 0.83);
          const cx = w * (0.5 + nx * 0.34);
          const cy = h * (0.5 + ny * 0.34);
          const energy = bus.energy * react + bus.bass * react * 0.6;
          const radius = Math.min(w, h) * b.r * (0.75 + energy * 1.1);
          const hue = (bus.albumHue + b.hueOffset + (fx.state.hueShift / 100) * 60 * noise(t * 0.07 + i)) % 360;
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
          g.addColorStop(0, 'hsla(' + hue + ', 85%, 62%, 0.42)');
          g.addColorStop(0.55, 'hsla(' + ((hue + 30) % 360) + ', 80%, 55%, 0.16)');
          g.addColorStop(1, 'hsla(' + hue + ', 80%, 50%, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
      }
    });

  /* ---- 粒子星系：节拍 + 能量 + 立体声宽度 ---- */
  cat('particles', 'vfxParticles', 'particle', { span: 2, minWidth: 300, height: 220 },
    [
      { id: 'count', labelKey: 'vfxParticleCount', min: 60, max: 900, step: 10, default: 320, priority: 'core' },
      { id: 'speed', labelKey: 'vfxSpeed', min: 0, max: 100, step: 1, default: 50, priority: 'core' },
      { id: 'spread', labelKey: 'vfxSpread', min: 0, max: 100, step: 1, default: 55, priority: 'secondary' }
    ], {
      create(fx) {
        fx.parts = [];
        fx.capacity = 0;
      },
      resize(fx) {
        fx.capacity = 0;   // 尺寸变化时按需重建，不保留旧坐标系
      },
      update(fx, dt, bus) {
        const want = Math.round(fx.state.count);
        if (fx.capacity !== want) {
          fx.parts.length = 0;
          for (let i = 0; i < want; i++) {
            fx.parts.push({
              a: Math.random() * Math.PI * 2,
              r: Math.random(),
              v: 0.2 + Math.random() * 0.8,
              s: 0.6 + Math.random() * 1.6
            });
          }
          fx.capacity = want;
        }
        const spread = 0.35 + (fx.state.spread / 100) * (0.5 + bus.stereoWidth * 0.9);
        const speed = 0.25 + (fx.state.speed / 100) * 1.6;
        const push = bus.beat ? bus.beatStrength * 0.5 : 0;
        for (let i = 0; i < fx.parts.length; i++) {
          const p = fx.parts[i];
          p.a += dt * speed * p.v * 0.6;
          p.r += dt * (0.06 + push * 0.5) * speed;
          if (p.r > 1) p.r -= 1;
          p.x = Math.cos(p.a) * p.r * spread;
          p.y = Math.sin(p.a) * p.r * spread * 0.72;
        }
      },
      render(fx, bus) {
        const { ctx, width: w, height: h } = fx;
        ctx.clearRect(0, 0, w, h);
        const cx = w / 2;
        const cy = h / 2;
        const scale = Math.min(w, h) * 0.9;
        const energy = bus.energy;
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < fx.parts.length; i++) {
          const p = fx.parts[i];
          const x = cx + p.x * scale;
          const y = cy + p.y * scale;
          const size = p.s * (0.9 + energy * 1.6) * (bus.beat ? 1.35 : 1);
          const alpha = 0.22 + energy * 0.5;
          const hue = (bus.albumHue + p.r * 90) % 360;
          ctx.fillStyle = 'hsla(' + hue + ', 90%, 72%, ' + alpha.toFixed(3) + ')';
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
      }
    });

  /* ---- 液体涟漪：低频 + 中频，同心波纹 ---- */
  cat('liquid', 'vfxLiquid', 'fluid', { span: 1, minWidth: 240, height: 170 },
    [
      { id: 'ripples', labelKey: 'vfxRipples', min: 1, max: 6, step: 1, default: 3, priority: 'core' },
      { id: 'reactivity', labelKey: 'vfxReactivity', min: 0, max: 100, step: 1, default: 70, priority: 'core' },
      { id: 'viscosity', labelKey: 'vfxViscosity', min: 0, max: 100, step: 1, default: 45, priority: 'secondary' }
    ], {
      update(fx, dt, bus) { fx.drive = lerp(fx.drive || 0, bus.bass * 0.7 + bus.mid * 0.5, Math.min(1, dt * 6)); },
      render(fx, bus) {
        const { ctx, width: w, height: h } = fx;
        ctx.clearRect(0, 0, w, h);
        const cx = w / 2;
        const cy = h / 2;
        const max = Math.min(w, h) * 0.48;
        const drive = (fx.drive || 0) * (fx.state.reactivity / 100);
        const visc = 1 - fx.state.viscosity / 100 * 0.6;
        const rings = Math.round(fx.state.ripples);
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < rings; i++) {
          const t = fx.time * (0.25 + visc * 0.5) + i / rings;
          const phase = (t % 1);
          const r = max * phase;
          const alpha = (1 - phase) * (0.18 + drive * 0.75);
          const hue = (bus.albumHue + i * 26) % 360;
          ctx.strokeStyle = 'hsla(' + hue + ', 88%, 68%, ' + alpha.toFixed(3) + ')';
          ctx.lineWidth = 1 + drive * 4;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';
      }
    });

  /* ---- 能量核心：瞬态 + 高频，脉冲核心与射线 ---- */
  cat('energyCore', 'vfxEnergyCore', 'energy', { span: 1, minWidth: 240, height: 170 },
    [
      { id: 'rays', labelKey: 'vfxRays', min: 6, max: 48, step: 1, default: 18, priority: 'core' },
      { id: 'reactivity', labelKey: 'vfxReactivity', min: 0, max: 100, step: 1, default: 70, priority: 'core' },
      { id: 'glow', labelKey: 'vfxGlow', min: 0, max: 100, step: 1, default: 65, priority: 'secondary' }
    ], {
      update(fx, dt, bus) {
        fx.core = lerp(fx.core || 0, bus.energy * 0.6 + bus.transient * 0.6, Math.min(1, dt * 8));
      },
      render(fx, bus) {
        const { ctx, width: w, height: h } = fx;
        ctx.clearRect(0, 0, w, h);
        const cx = w / 2;
        const cy = h / 2;
        const react = fx.state.reactivity / 100;
        const core = Math.min(1, (fx.core || 0) * react);
        const base = Math.min(w, h) * 0.12;
        const hue = bus.albumHue;
        const glow = fx.state.glow / 100;
        if (glow > 0) {
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, base * 4);
          g.addColorStop(0, 'hsla(' + hue + ', 95%, 65%, ' + (0.5 * glow * (0.5 + core)).toFixed(3) + ')');
          g.addColorStop(1, 'hsla(' + hue + ', 95%, 60%, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(cx, cy, base * 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'lighter';
        const rays = Math.round(fx.state.rays);
        for (let i = 0; i < rays; i++) {
          const a = (i / rays) * Math.PI * 2 + fx.time * 0.12;
          const len = base * (1.4 + core * 2.6 + bus.high * 1.4);
          ctx.strokeStyle = 'hsla(' + ((hue + i * 6) % 360) + ', 92%, 70%, ' + (0.12 + core * 0.5).toFixed(3) + ')';
          ctx.lineWidth = 1 + core * 2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * base * 0.7, cy + Math.sin(a) * base * 0.7);
          ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
          ctx.stroke();
        }
        ctx.fillStyle = 'hsla(' + hue + ', 100%, ' + (62 + core * 25).toFixed(0) + '%, 0.9)';
        ctx.beginPath();
        ctx.arc(cx, cy, base * (0.62 + core * 0.4), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }
    });

  /* ---- 声波图形（Cymatics）：由实时频谱驱动的驻波图案 ---- */
  cat('cymatics', 'vfxCymatics', 'scientific', { span: 2, minWidth: 320, height: 220 },
    [
      { id: 'order', labelKey: 'vfxOrder', min: 2, max: 12, step: 1, default: 6, priority: 'core' },
      { id: 'detail', labelKey: 'vfxDetail', min: 40, max: 160, step: 4, default: 96, priority: 'core' },
      { id: 'reactivity', labelKey: 'vfxReactivity', min: 0, max: 100, step: 1, default: 70, priority: 'secondary' }
    ], {
      render(fx, bus) {
        const { ctx, width: w, height: h } = fx;
        ctx.clearRect(0, 0, w, h);
        const react = fx.state.reactivity / 100;
        const bands = bus.spectrum;
        const n = Math.round(fx.state.detail);
        const order = Math.round(fx.state.order);
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) * 0.42;
        ctx.globalCompositeOperation = 'lighter';
        for (let r = 1; r <= n; r++) {
          const rr = (r / n) * radius;
          const bandIndex = bandIndexFor(r / n, bands ? bands.length : 256);
          const amp = bands && bands.length ? bands[bandIndex] / 255 : bus.energy;
          const ampR = Math.pow(amp, 1.2) * react;
          ctx.beginPath();
          for (let a = 0; a <= 96; a++) {
            const ang = (a / 96) * Math.PI * 2;
            const wave = Math.sin(ang * order + fx.time * 0.35) * Math.cos(ang * 2 - fx.time * 0.21);
            const rad = rr * (1 + wave * ampR * 0.34);
            const x = cx + Math.cos(ang) * rad;
            const y = cy + Math.sin(ang) * rad;
            if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.closePath();
          const alpha = 0.05 + ampR * 0.4 * (1 - r / n * 0.6);
          const hue = (bus.albumHue + (r / n) * 90) % 360;
          ctx.strokeStyle = 'hsla(' + hue + ', 88%, 68%, ' + alpha.toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';
      }
    });

  function bandIndexFor(t, len) {
    // 对数分布：低频给更多空间，与专业频谱观感一致
    const x = Math.pow(t, 2);
    return Math.max(0, Math.min(len - 1, Math.round(x * (len - 1))));
  }

  /**
   * Visual Engine 实例：负责生命周期、合成与画布尺寸。
   * 渲染循环只在这一层有唯一一处 requestAnimationFrame。
   */
  function create(options) {
    const host = options.canvas;
    const ctx = host.getContext('2d');
    const bus = createBus();
    const instances = new Map();
    let sceneActive = false;     // 是否在第二页
    let windowVisible = !document.hidden;
    let quality = options.quality || 'auto';
    let rafId = 0;
    let lastTime = 0;
    let frameMsAvg = 16;
    let autoScale = 1;
    let cssWidth = 1;
    let cssHeight = 1;
    let renderScale = 1;

    registry.forEach((def) => {
      instances.set(def.id, createEffect(def, options));
    });

    function isRunning(id) {
      const fx = instances.get(id);
      return !!(fx && fx.enabled && sceneActive && windowVisible);
    }

    function resize() {
      const rect = host.getBoundingClientRect();
      cssWidth = Math.max(2, rect.width);
      cssHeight = Math.max(2, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, quality === 'ultra' ? 2 : 1.5);
      renderScale = dpr * autoScale;
      host.width = Math.max(2, Math.round(cssWidth * renderScale));
      host.height = Math.max(2, Math.round(cssHeight * renderScale));
      if (options.onResize) options.onResize({ width: cssWidth, height: cssHeight });
    }

    function frame(now) {
      rafId = 0;
      if (!sceneActive || !windowVisible) return;
      const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0.016;
      lastTime = now;
      // 第二页期间由这里驱动音频分析，保证总线数据持续更新
      if (options.beforeFrame) {
        try { options.beforeFrame(); } catch (error) { /* 分析失败不阻断视觉 */ }
      }
      bus.update({
        freqBytes: options.getFreqBytes ? options.getFreqBytes() : null,
        timeData: options.getTimeData ? options.getTimeData() : null,
        metrics: options.getMetrics ? options.getMetrics() : {},
        dt
      });
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, host.width, host.height);
      ctx.save();
      ctx.scale(renderScale, renderScale);
      let active = 0;
      instances.forEach((fx) => {
        if (!fx.enabled) return;
        active++;
        fx.create();
        fx.resize(cssWidth, cssHeight);
        fx.update(dt, bus.value);
        fx.render(bus.value);
        ctx.globalCompositeOperation = fx.def.blend || 'lighter';
        ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);
        ctx.drawImage(fx.canvas, 0, 0, cssWidth, cssHeight);
      });
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
      // 自动画质：帧时间偏大时降低内部渲染倍率
      frameMsAvg = frameMsAvg * 0.92 + (dt * 1000) * 0.08;
      if (quality === 'auto') {
        if (frameMsAvg > 26 && autoScale > 0.6) {
          autoScale = Math.max(0.6, autoScale - 0.05);
          resize();
        } else if (frameMsAvg < 15 && autoScale < 1) {
          autoScale = Math.min(1, autoScale + 0.03);
          resize();
        }
      }
      if (active > 0) rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (rafId || !sceneActive || !windowVisible) return;
      lastTime = 0;
      rafId = requestAnimationFrame(frame);
    }

    /** 真正停止：取消 rAF，效果实例暂停（状态保留，不销毁） */
    function stop() {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      instances.forEach((fx) => {
        if (fx.running) fx.pause();
      });
    }

    return {
      bus,
      registry,
      instances,
      setSceneActive(active) {
        sceneActive = !!active;
        if (sceneActive) {
          resize();
          instances.forEach((fx) => { if (fx.enabled) fx.resume(); });
          start();
        } else {
          stop();
        }
      },
      setWindowVisible(visible) {
        windowVisible = !!visible;
        if (windowVisible && sceneActive) start();
        else stop();
      },
      setEnabled(id, enabled) {
        const fx = instances.get(id);
        if (!fx) return;
        fx.enabled = !!enabled;
        if (fx.enabled) {
          fx.create();
          fx.resume();
        } else {
          fx.pause();
        }
        if (sceneActive && windowVisible) start();
      },
      setParam(id, paramId, value) {
        const fx = instances.get(id);
        if (!fx) return;
        fx.state[paramId] = value;
      },
      getState() {
        const out = {};
        instances.forEach((fx, id) => {
          out[id] = { enabled: !!fx.enabled, params: Object.assign({}, fx.state) };
        });
        return out;
      },
      applyState(state) {
        if (!state || typeof state !== 'object') return;
        Object.keys(state).forEach((id) => {
          const fx = instances.get(id);
          if (!fx) return;
          const s = state[id] || {};
          fx.enabled = !!s.enabled;
          Object.keys(s.params || {}).forEach((k) => {
            if (fx.state[k] !== undefined) fx.state[k] = s.params[k];
          });
        });
      },
      resize,
      isRunning,
      runningCount() {
        let n = 0;
        instances.forEach((fx) => { if (isRunning(fx.id)) n++; });
        return n;
      },
      frameStats() {
        return { frameMs: Math.round(frameMsAvg * 10) / 10, scale: Math.round(renderScale * 100) / 100, raf: rafId !== 0 };
      },
      destroy() {
        stop();
        instances.forEach((fx) => fx.destroy());
      }
    };
  }

  window.RlonVisualEngine = { create, createBus, registry };
})();
