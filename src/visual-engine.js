/*
 * RlonDSP
 * Copyright © 2026 RlonDSP. All rights reserved.
 *
 * Procedural Audio-Reactive Visual Engine —— 频谱空间第二页的视觉引擎。
 *
 * 设计原则（对应需求文档）：
 *   1. 每个视觉效果都是一个「程序化生成器」，不是一个动画片段：
 *        Audio → Bus → 参数调制 → Generator → Renderer → Compositor
 *   2. 音频分析只有一条：全部数据来自渲染进程已有的分析结果，不做第二次 FFT。
 *   3. Beat 是连续值：Beat → 置信度 → 强度 → 脉冲包络（起音/保持/释放），
 *      而不是 if (beat) scale = 1.2。
 *   4. 基础运动与音频运动分离：没有音乐时依然有缓慢自然运动，音乐只做调制。
 *   5. 多种 Generator 类型并存：粒子场 / 密度场 / 向量场 / 程序化条带 /
 *      网格流体 / 程序化等离子 / 波的干涉 —— 不是「粒子 + 圆环 + 光晕」套模板。
 *   6. 运行时零分配：粒子数据全部放在 TypedArray 里，运行中不创建对象。
 *   7. 只有「启用 + 第二页活动 + 窗口可见」才运行；隐藏即真正停表，状态不丢。
 *   8. 视觉层不接触音频链路：不进 AudioWorklet、不改 DSP、不改任何 DSP 参数。
 */
(function () {
  'use strict';

  const TAU = Math.PI * 2;
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ==========================================================================
   * 噪声：值噪声 + 平滑插值，用于所有「自然漂移」的基础运动
   * ==================================================================== */
  function makeNoise(seed) {
    const table = new Float32Array(512);
    let s = seed || 1;
    for (let i = 0; i < 512; i++) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      table[i] = (s / 0x7fffffff) * 2 - 1;
    }
    const at = (i) => table[((i % 512) + 512) % 512];
    return function noise(x) {
      const i = Math.floor(x);
      const f = x - i;
      const t = f * f * (3 - 2 * f);
      return at(i) + (at(i + 1) - at(i)) * t;
    };
  }
  const noise1 = makeNoise(20260913);
  const noise2 = makeNoise(77003);

  /** 二维「类 curl」噪声场：给流场 / 粒子平流使用，避免机械式直线运动 */
  function curl(x, y, t) {
    const e = 0.35;
    const n1 = noise2(x + t) + 0.5 * noise1(y * 1.7 - t * 0.6);
    const n2 = noise2(y - t * 0.8) + 0.5 * noise1(x * 1.5 + t * 0.5);
    const n1x = noise2(x + e + t) - n1;
    const n2y = noise2(y + e - t * 0.8) - n2;
    // 取旋度方向 → 无散度场，粒子会自然形成卷曲的流动
    return { x: n2y / e, y: -n1x / e };
  }

  /* ==========================================================================
   * Audio Reactive Bus —— 全引擎唯一的数据总线
   * ==================================================================== */
  function createBus() {
    const value = {
      rms: 0, peak: 0, lufs: -70,
      bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0,
      beat: false, beatStrength: 0, beatConfidence: 0, bpm: 0,
      timeSinceBeat: 99, pulse: 0,       // 脉冲包络（连续值，含起音/保持/释放）
      phrase: 0,                          // 乐句级慢包络（2~8 秒尺度）
      spectralFlux: 0, transient: 0, energy: 0, loud: 0,
      silence: true,                      // 是否近似静音（决定只跑基础运动）
      stereoWidth: 0, correlation: 0, balance: 0,
      spectrum: null, waveform: null, albumHue: 200
    };
    const bassHist = new Float32Array(64);
    const fluxHist = new Float32Array(48);
    let bassHead = 0;
    let fluxHead = 0;
    let bassFilled = 0;
    let fluxFilled = 0;
    let beatTimer = 0;
    let fluxAvg = 0;
    let bassFast = 0;
    let bassSlow = 0;
    let pulseEnv = 0;
    let pulseHold = 0;
    let phraseEnv = 0;
    let loudSmooth = 0;
    const beatTimes = [];
    const prevSpectrum = { data: null };

    function mean(arr, len) {
      let sum = 0;
      for (let i = 0; i < len; i++) sum += arr[i];
      return len ? sum / len : 0;
    }

    function update(data) {
      const dt = Math.max(0.001, Math.min(0.1, Number(data.dt) || 0.016));
      const m = data.metrics || {};
      const freq = data.freqBytes;
      value.peak = Number.isFinite(m.peakDb) ? clamp01(Math.pow(10, m.peakDb / 20)) : 0;
      value.rms = Number.isFinite(m.rmsDb) ? clamp01(Math.pow(10, m.rmsDb / 20)) : 0;
      value.lufs = Number.isFinite(m.integrated) ? m.integrated : -70;
      value.stereoWidth = Number.isFinite(m.width) ? m.width : 0;
      value.correlation = Number.isFinite(m.corr) ? m.corr : 0;
      value.balance = Number.isFinite(m.balance) ? m.balance : 0;
      value.spectrum = freq || null;
      value.waveform = data.timeData || null;

      if (freq && freq.length) {
        const bin = freq.length;
        const band = (a, b) => {
          const i0 = Math.max(0, Math.floor(bin * a));
          const i1 = Math.max(i0 + 1, Math.floor(bin * b));
          let sum = 0;
          for (let i = i0; i < i1 && i < bin; i++) sum += freq[i];
          return sum / ((i1 - i0) * 255);
        };
        value.bass = band(0, 0.04);
        value.lowMid = band(0.04, 0.12);
        value.mid = band(0.12, 0.32);
        value.highMid = band(0.32, 0.6);
        value.treble = band(0.6, 1);
      }
      value.energy = clamp01(value.bass * 0.34 + value.mid * 0.3 + value.highMid * 0.16 + value.rms * 0.5);
      loudSmooth = lerp(loudSmooth, value.energy, clamp01(dt * 3));
      value.loud = loudSmooth;
      value.silence = loudSmooth < 0.045;

      // 频谱通量：与上一帧频谱的正向差
      if (freq && freq.length) {
        if (!prevSpectrum.data || prevSpectrum.data.length !== freq.length) {
          prevSpectrum.data = new Float32Array(freq.length);
        }
        const prev = prevSpectrum.data;
        let flux = 0;
        for (let i = 0; i < freq.length; i++) {
          const d = freq[i] - prev[i];
          if (d > 0) flux += d;
          prev[i] = freq[i];
        }
        value.spectralFlux = flux / (freq.length * 255);
        fluxHist[fluxHead] = value.spectralFlux;
        fluxHead = (fluxHead + 1) % fluxHist.length;
        if (fluxFilled < fluxHist.length) fluxFilled++;
        fluxAvg = mean(fluxHist, fluxFilled);
      }

      // 节拍：相对起点检测（快/慢包络之差 + 频谱通量），与音量大小无关
      bassHist[bassHead] = value.bass;
      bassHead = (bassHead + 1) % bassHist.length;
      if (bassFilled < bassHist.length) bassFilled++;
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
      if (bassFilled > 12 && canBeat && ((rel > 0.13 && onset > 0.006) || (fluxRel > 1.45 && value.spectralFlux > 0.0012))) {
        value.beat = true;
        beatTimer = 0;
        const excess = clamp01(rel * 2.4 + Math.max(0, fluxRel - 1) * 0.35);
        value.beatStrength = Math.max(0.22, excess);
        value.beatConfidence = clamp01(0.35 + excess * 0.65);
        pulseEnv = 1;
        pulseHold = 0.06;
        beatTimes.push(performance.now());
        if (beatTimes.length > 12) beatTimes.shift();
        if (beatTimes.length >= 5) {
          const gaps = [];
          for (let i = 1; i < beatTimes.length; i++) {
            const gap = beatTimes[i] - beatTimes[i - 1];
            if (gap >= 240 && gap <= 1600) gaps.push(gap);
          }
          if (gaps.length >= 3) {
            gaps.sort((a, b) => a - b);
            value.bpm = Math.round(60000 / gaps[Math.floor(gaps.length / 2)]);
          }
        }
      } else {
        value.beat = false;
        value.beatStrength *= Math.max(0, 1 - dt * 6);
      }
      beatTimer += dt;
      value.timeSinceBeat = beatTimer;

      // 脉冲包络：起音（瞬时到 1）→ 保持（60ms）→ 释放（约 0.34s）
      if (pulseHold > 0) {
        pulseHold -= dt;
      } else {
        pulseEnv *= Math.exp(-dt / 0.11);
        if (pulseEnv < 0.001) pulseEnv = 0;
      }
      value.pulse = pulseEnv;
      value.transient = clamp01(pulseEnv * 0.6 + value.spectralFlux * 6);
      // 乐句级慢包络（2~8 秒尺度）：用于颜色 / 形态这类慢变化
      phraseEnv = lerp(phraseEnv, value.energy, clamp01(dt * 0.55));
      value.phrase = phraseEnv;
    }

    return { value, update };
  }

  /* ==========================================================================
   * 粒子系统：Emitter → Pool → Initializer → Simulation → Operators → Renderer
   * 所有数据放在 TypedArray 中，运行期不分配对象。
   * ==================================================================== */
  function createParticles(capacity) {
    const n = Math.max(1, Math.floor(capacity));
    const P = {
      n,
      count: 0,
      x: new Float32Array(n),
      y: new Float32Array(n),
      vx: new Float32Array(n),
      vy: new Float32Array(n),
      life: new Float32Array(n),
      maxLife: new Float32Array(n),
      size: new Float32Array(n),
      seed: new Float32Array(n),
      z: new Float32Array(n),        // 伪深度，用于大小/亮度分层
      spawnAt(i, cx, cy, spread) {
        P.x[i] = cx + (Math.random() - 0.5) * spread;
        P.y[i] = cy + (Math.random() - 0.5) * spread;
        P.vx[i] = 0;
        P.vy[i] = 0;
        P.maxLife[i] = 3 + Math.random() * 7;
        P.life[i] = Math.random() * P.maxLife[i];
        P.seed[i] = Math.random() * 1000;
        P.z[i] = Math.random();
      },
      /** 按容量补齐到 want 个（只增不减，避免运行期抖动） */
      ensure(want, cx, cy, spread) {
        const target = Math.min(P.n, Math.max(0, Math.floor(want)));
        if (target > P.count) {
          for (let i = P.count; i < target; i++) P.spawnAt(i, cx, cy, spread);
        }
        P.count = target;
      },
      reset() {
        P.count = 0;
      }
    };
    return P;
  }

  /* ==========================================================================
   * 效果基类
   * ==================================================================== */
  function createEffect(def, options) {
    const state = Object.assign({}, def.defaultState);
    def.parameters.forEach((p) => {
      if (state[p.id] === undefined) state[p.id] = p.default;
    });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const fx = {
      id: def.id,
      def,
      state,
      canvas,
      ctx,
      width: 1,
      height: 1,
      time: 0,
      created: false,
      running: false,
      enabled: false,
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
      pause() { if (def.pause) def.pause(this); },
      resume() { if (def.resume) def.resume(this); },
      destroy() {
        if (def.destroy) def.destroy(this);
        canvas.width = 1;
        canvas.height = 1;
        this.created = false;
      }
    };
    return fx;
  }

  /* ==========================================================================
   * 效果注册表
   * ==================================================================== */
  const registry = [];

  /** 统一的颜色工具：全部由专辑色 + 主题强调色推导，不写死颜色 */
  function hueOf(bus, offset) {
    return (bus.albumHue + 360 + (offset || 0)) % 360;
  }

  /* ---------------------------------------------------------------- 1. 有机脉冲场 */
  registry.push({
    id: 'organicPulse',
    nameKey: 'vfxOrganicPulse',
    category: 'organic',
    blend: 'lighter',
    layout: { span: 2, minWidth: 300 },
    generator: 'particle+field',
    defaultState: {},
    parameters: [
      { id: 'count', labelKey: 'vfxParticleCount', min: 200, max: 2600, step: 20, default: 1100, priority: 'core' },
      { id: 'flow', labelKey: 'vfxFlowSpeed', min: 0, max: 100, step: 1, default: 45, priority: 'core' },
      { id: 'pulseStrength', labelKey: 'vfxPulseStrength', min: 0, max: 100, step: 1, default: 62, priority: 'core' },
      { id: 'turbulence', labelKey: 'vfxTurbulence', min: 0, max: 100, step: 1, default: 40, priority: 'secondary' },
      { id: 'attraction', labelKey: 'vfxAttraction', min: -100, max: 100, step: 1, default: 22, priority: 'secondary' },
      { id: 'noiseScale', labelKey: 'vfxNoiseScale', min: 20, max: 300, step: 5, default: 120, priority: 'advanced' }
    ],
    create(fx) {
      fx.ps = createParticles(2800);
      fx.field = new Float32Array(48 * 28);
      fx.fieldW = 48;
      fx.fieldH = 28;
      fx.wave = 0;      // 脉冲压力波半径
    },
    update(fx, dt, bus) {
      const ps = fx.ps;
      // 基础运动始终存在：没有音乐时噪声场依然缓慢演化
      const flow = 0.25 + (fx.state.flow / 100) * 1.9;
      const turb = (fx.state.turbulence / 100) * (0.25 + bus.spectralFlux * 22 + bus.phrase * 0.7);
      const pull = fx.state.attraction / 100;
      const pulse = bus.pulse * fx.state.pulseStrength / 100;
      const cx = fx.width * 0.5;
      const cy = fx.height * 0.5;
      const scale = Math.min(fx.width, fx.height) * 0.46;

      // 脉冲压力波：把能量向外推，但叠加噪声，因此不是完美圆环
      fx.wave += dt * (1.1 + pulse * 3.4);
      if (fx.wave > 1.6) fx.wave = 0;

      ps.ensure(fx.state.count, cx, cy, Math.min(fx.width, fx.height) * 0.6);
      const t = fx.time;
      for (let i = 0; i < ps.count; i++) {
        const dx = (ps.x[i] - cx) / scale;
        const dy = (ps.y[i] - cy) / scale;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1e-4;
        const seed = ps.seed[i];
        // 向量场（噪声）+ 向心吸引 + 脉冲径向力
        const c = curl(ps.x[i] / fx.state.noiseScale, ps.y[i] / fx.state.noiseScale, t * 0.12 + seed * 0.001);
        const waveBand = Math.exp(-Math.pow((dist - fx.wave) * 2.6, 2));
        const radial = -pull * 1.6 + pulse * waveBand * 6.5;
        const ax = c.x * flow * 0.35 - (dx / dist) * radial + (noise1(seed + t * 0.7) * turb);
        const ay = c.y * flow * 0.35 - (dy / dist) * radial + (noise1(seed + 40 + t * 0.7) * turb);
        ps.vx[i] = (ps.vx[i] + ax * dt * 60) * (1 - dt * 1.35);
        ps.vy[i] = (ps.vy[i] + ay * dt * 60) * (1 - dt * 1.35);
        ps.x[i] += ps.vx[i] * dt * flow;
        ps.y[i] += ps.vy[i] * dt * flow;
        ps.life[i] += dt;
        if (ps.life[i] > ps.maxLife[i] || ps.x[i] < -40 || ps.x[i] > fx.width + 40 || ps.y[i] < -40 || ps.y[i] > fx.height + 40) {
          ps.spawnAt(i, cx, cy, scale * 1.1);
        }
      }
    },
    render(fx, bus) {
      const { ctx, width: w, height: h } = fx;
      const ps = fx.ps;
      ctx.clearRect(0, 0, w, h);
      const pulse = bus.pulse;
      const scale = Math.min(w, h) * 0.46;
      // 背景能量场：缓慢扩散的柔光（基础运动，不依赖节拍）
      const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.62);
      bg.addColorStop(0, 'hsla(' + hueOf(bus, 12) + ', 70%, 58%, ' + (0.10 + bus.phrase * 0.16).toFixed(3) + ')');
      bg.addColorStop(1, 'hsla(' + hueOf(bus, -20) + ', 70%, 50%, 0)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      const base = 0.5 + (bus.highMid || 0) * 1.6;
      for (let i = 0; i < ps.count; i++) {
        const z = ps.z[i];
        const size = base * (0.5 + z * 1.6) * (0.8 + pulse * 1.5);
        const alpha = (0.08 + z * 0.30) * (0.55 + pulse * 0.65);
        if (alpha < 0.02) continue;
        // 颜色按深度分层：远处偏冷、近处偏暖，随乐句缓慢变化
        const hue = hueOf(bus, (z - 0.5) * 70 + bus.phrase * 40);
        ctx.fillStyle = 'hsla(' + hue + ', 88%, ' + (58 + z * 20).toFixed(0) + '%, ' + alpha.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(ps.x[i], ps.y[i], size, 0, TAU);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  });

  /* ---------------------------------------------------------------- 2. 星云（密度场） */
  registry.push({
    id: 'nebula',
    nameKey: 'vfxNebula',
    category: 'cosmic',
    blend: 'screen',
    layout: { span: 2, minWidth: 320 },
    generator: 'density-field',
    defaultState: {},
    parameters: [
      { id: 'layers', labelKey: 'vfxDensity', min: 3, max: 12, step: 1, default: 7, priority: 'core' },
      { id: 'reactivity', labelKey: 'vfxReactivity', min: 0, max: 100, step: 1, default: 65, priority: 'core' },
      { id: 'drift', labelKey: 'vfxDrift', min: 0, max: 100, step: 1, default: 40, priority: 'secondary' },
      { id: 'diffusion', labelKey: 'vfxDiffusion', min: 0, max: 100, step: 1, default: 55, priority: 'secondary' }
    ],
    create(fx) {
      fx.clouds = [];
      for (let i = 0; i < 12; i++) {
        fx.clouds.push({ sd: i * 91.7, r: 0.24 + (i % 4) * 0.09, hue: i * 29 });
      }
    },
    render(fx, bus) {
      const { ctx, width: w, height: h } = fx;
      ctx.clearRect(0, 0, w, h);
      const n = Math.round(fx.state.layers);
      const react = fx.state.reactivity / 100;
      const drift = 0.06 + (fx.state.drift / 100) * 0.34;   // 基础运动：始终在漂移
      const diff = 0.5 + (fx.state.diffusion / 100) * 1.5;
      const t = fx.time;
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < n; i++) {
        const c = fx.clouds[i];
        const nx = noise1(c.sd + t * drift);
        const ny = noise2(c.sd + 31 + t * drift * 0.77);
        const cx = w * (0.5 + nx * 0.36);
        const cy = h * (0.5 + ny * 0.34);
        // 音频只调制「大小与亮度」，不改变整体构图 → 不是整幅画面缩放
        const density = 0.75 + bus.phrase * react * 0.5 + bus.bass * react * 0.45;
        const radius = Math.min(w, h) * c.r * density;
        const hue = hueOf(bus, c.hue + bus.phrase * 30);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        g.addColorStop(0, 'hsla(' + hue + ', 82%, 60%, ' + (0.30 / diff).toFixed(3) + ')');
        g.addColorStop(0.5, 'hsla(' + ((hue + 40) % 360) + ', 78%, 52%, ' + (0.12 / diff).toFixed(3) + ')');
        g.addColorStop(1, 'hsla(' + hue + ', 78%, 48%, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, TAU);
        ctx.fill();
      }
      // 细密的星尘：由高频驱动，给星云增加层次而不是纯色块
      const dust = 120 + Math.round(bus.treble * 260);
      for (let i = 0; i < dust; i++) {
        const sd = i * 37.3;
        const x = ((noise1(sd + t * 0.05) + 1) * 0.5) * w;
        const y = ((noise2(sd + t * 0.04) + 1) * 0.5) * h;
        const a = 0.05 + bus.treble * 0.35;
        ctx.fillStyle = 'hsla(' + hueOf(bus, sd % 60) + ', 90%, 78%, ' + a.toFixed(3) + ')';
        ctx.fillRect(x, y, 1, 1);
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  });

  /* ---------------------------------------------------------------- 3. 流场（向量场平流） */
  registry.push({
    id: 'flowField',
    nameKey: 'vfxFlowField',
    category: 'field',
    blend: 'lighter',
    layout: { span: 2, minWidth: 300 },
    generator: 'vector-field',
    defaultState: {},
    parameters: [
      { id: 'count', labelKey: 'vfxParticleCount', min: 200, max: 3000, step: 20, default: 1200, priority: 'core' },
      { id: 'speed', labelKey: 'vfxSpeed', min: 0, max: 100, step: 1, default: 48, priority: 'core' },
      { id: 'turbulence', labelKey: 'vfxTurbulence', min: 0, max: 100, step: 1, default: 35, priority: 'core' },
      { id: 'trail', labelKey: 'vfxTrail', min: 0, max: 100, step: 1, default: 62, priority: 'secondary' },
      { id: 'noiseScale', labelKey: 'vfxNoiseScale', min: 40, max: 400, step: 10, default: 160, priority: 'advanced' }
    ],
    create(fx) {
      fx.ps = createParticles(3200);
      fx.trailCanvas = document.createElement('canvas');
      fx.trailCtx = fx.trailCanvas.getContext('2d');
    },
    resize(fx) {
      fx.trailCanvas.width = fx.width;
      fx.trailCanvas.height = fx.height;
      fx.ps.reset();
    },
    update(fx, dt, bus) {
      const ps = fx.ps;
      const t = fx.time;
      const speed = 0.35 + (fx.state.speed / 100) * 2.2;
      // 基础运动：噪声场自然演化；音频只增加扰动强度
      const turb = 0.15 + (fx.state.turbulence / 100) * (0.5 + bus.spectralFlux * 14 + bus.bass * 0.6);
      ps.ensure(fx.state.count, fx.width * 0.5, fx.height * 0.5, Math.max(fx.width, fx.height) * 0.9);
      for (let i = 0; i < ps.count; i++) {
        const c = curl(ps.x[i] / fx.state.noiseScale, ps.y[i] / fx.state.noiseScale, t * 0.09);
        const seed = ps.seed[i];
        ps.vx[i] = lerp(ps.vx[i], c.x * speed + noise1(seed + t) * turb, clamp01(dt * 4));
        ps.vy[i] = lerp(ps.vy[i], c.y * speed + noise2(seed + t) * turb, clamp01(dt * 4));
        ps.x[i] += ps.vx[i] * dt * 60 * speed * 0.5;
        ps.y[i] += ps.vy[i] * dt * 60 * speed * 0.5;
        ps.life[i] += dt;
        if (ps.life[i] > ps.maxLife[i] || ps.x[i] < -20 || ps.x[i] > fx.width + 20 || ps.y[i] < -20 || ps.y[i] > fx.height + 20) {
          ps.spawnAt(i, Math.random() * fx.width, Math.random() * fx.height, 4);
        }
      }
    },
    render(fx, bus) {
      const { ctx, width: w, height: h } = fx;
      const tc = fx.trailCtx;
      // 拖尾：一层淡出，让流线自然连成流动感
      const fade = 0.06 + (1 - fx.state.trail / 100) * 0.35;
      tc.globalCompositeOperation = 'destination-out';
      tc.fillStyle = 'rgba(0,0,0,' + fade.toFixed(3) + ')';
      tc.fillRect(0, 0, w, h);
      tc.globalCompositeOperation = 'lighter';
      const ps = fx.ps;
      const pulse = bus.pulse;
      for (let i = 0; i < ps.count; i++) {
        const z = ps.z[i];
        const size = 0.6 + z * 1.5 + pulse * 1.2;
        const alpha = 0.18 + z * 0.35;
        tc.fillStyle = 'hsla(' + hueOf(bus, (z - 0.5) * 90 + bus.phrase * 35) + ', 88%, ' + (60 + z * 16).toFixed(0) + '%, ' + alpha.toFixed(3) + ')';
        tc.beginPath();
        tc.arc(ps.x[i], ps.y[i], size, 0, TAU);
        tc.fill();
      }
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(fx.trailCanvas, 0, 0);
    }
  });

  /* ---------------------------------------------------------------- 4. 极光（程序化条带） */
  registry.push({
    id: 'aurora',
    nameKey: 'vfxAurora',
    category: 'organic',
    blend: 'screen',
    layout: { span: 2, minWidth: 320 },
    generator: 'procedural-ribbon',
    defaultState: {},
    parameters: [
      { id: 'ribbons', labelKey: 'vfxRibbons', min: 3, max: 14, step: 1, default: 8, priority: 'core' },
      { id: 'height', labelKey: 'vfxHeight', min: 20, max: 100, step: 1, default: 62, priority: 'core' },
      { id: 'flow', labelKey: 'vfxFlowSpeed', min: 0, max: 100, step: 1, default: 42, priority: 'core' },
      { id: 'shimmer', labelKey: 'vfxShimmer', min: 0, max: 100, step: 1, default: 55, priority: 'secondary' },
      { id: 'spread', labelKey: 'vfxSpread', min: 20, max: 100, step: 1, default: 70, priority: 'advanced' }
    ],
    render(fx, bus) {
      const { ctx, width: w, height: h } = fx;
      ctx.clearRect(0, 0, w, h);
      const t = fx.time;
      const n = Math.round(fx.state.ribbons);
      // 基础运动：垂直与水平噪声流动永不停止
      const flow = 0.06 + (fx.state.flow / 100) * 0.5;
      const shimmer = fx.state.shimmer / 100;
      const bandH = h * (0.35 + fx.state.height / 100 * 0.55);
      ctx.globalCompositeOperation = 'lighter';
      for (let r = 0; r < n; r++) {
        const seed = r * 53.1;
        const baseY = h * (0.22 + (r / n) * 0.62);
        const amp = h * 0.16 * (0.5 + shimmer) * (1 + bus.phrase * 0.7);
        const hue = hueOf(bus, r * 22 + bus.phrase * 45);
        ctx.beginPath();
        const steps = 40;
        for (let i = 0; i <= steps; i++) {
          const u = i / steps;
          const x = u * w;
          const y = baseY
            + noise1(seed + u * 3.1 + t * flow) * amp
            + noise2(seed * 0.7 + u * 6.3 - t * flow * 0.8) * amp * 0.5
            + Math.sin(u * 6.2 + t * 0.4 + r) * amp * 0.25 * (0.4 + bus.mid);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.lineWidth = Math.max(2, bandH / n * 0.9);
        const g = ctx.createLinearGradient(0, 0, w, 0);
        const a = (0.10 + bus.phrase * 0.22) * (1 - r / n * 0.4);
        g.addColorStop(0, 'hsla(' + hue + ', 85%, 62%, 0)');
        g.addColorStop(0.25, 'hsla(' + hue + ', 88%, 66%, ' + a.toFixed(3) + ')');
        g.addColorStop(0.7, 'hsla(' + ((hue + 45) % 360) + ', 80%, 58%, ' + (a * 0.8).toFixed(3) + ')');
        g.addColorStop(1, 'hsla(' + hue + ', 80%, 55%, 0)');
        ctx.strokeStyle = g;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      // 底部地平线辉光：给极光一个空间落点
      const gl = ctx.createLinearGradient(0, h, 0, h * 0.55);
      gl.addColorStop(0, 'hsla(' + hueOf(bus, 0) + ', 80%, 55%, ' + (0.10 + bus.bass * 0.18).toFixed(3) + ')');
      gl.addColorStop(1, 'hsla(' + hueOf(bus, 0) + ', 80%, 55%, 0)');
      ctx.fillStyle = gl;
      ctx.fillRect(0, h * 0.55, w, h * 0.45);
      ctx.globalCompositeOperation = 'source-over';
    }
  });

  /* ---------------------------------------------------------------- 5. 流体（网格速度场 + 染料平流） */
  registry.push({
    id: 'fluid',
    nameKey: 'vfxFluid',
    category: 'fluid',
    blend: 'screen',
    layout: { span: 2, minWidth: 300 },
    generator: 'grid-fluid',
    defaultState: {},
    parameters: [
      { id: 'viscosity', labelKey: 'vfxViscosity', min: 0, max: 100, step: 1, default: 48, priority: 'core' },
      { id: 'injection', labelKey: 'vfxInjection', min: 10, max: 100, step: 1, default: 55, priority: 'core' },
      { id: 'dissipation', labelKey: 'vfxDissipation', min: 0, max: 100, step: 1, default: 30, priority: 'core' },
      { id: 'scale', labelKey: 'vfxDetail', min: 16, max: 96, step: 4, default: 56, priority: 'secondary' }
    ],
    create(fx) {
      // 低分辨率速度场 + 染料浓度场：真正的平流 + 耗散，代价极低且稳定
      const gw = 64;
      const gh = 36;
      fx.gw = gw;
      fx.gh = gh;
      fx.u = new Float32Array(gw * gh);
      fx.v = new Float32Array(gw * gh);
      fx.dye = new Float32Array(gw * gh);
      fx.tmp = new Float32Array(gw * gh);
      fx.img = document.createElement('canvas');
      fx.img.width = gw;
      fx.img.height = gh;
      fx.imgCtx = fx.imgCtx || fx.img.getContext('2d');
      fx.pixels = fx.imgCtx.createImageData(gw, gh);
    },
    update(fx, dt, bus) {
      const gw = fx.gw;
      const gh = fx.gh;
      const u = fx.u;
      const v = fx.v;
      const dye = fx.dye;
      const tmp = fx.tmp;
      const t = fx.time;
      const visc = 0.86 + (fx.state.viscosity / 100) * 0.13;   // 速度保留
      const diss = 0.90 + (fx.state.dissipation / 100) * 0.09; // 染料耗散
      const inject = fx.state.injection / 100;
      // 速度场：基础 curl 噪声 + 音频注入（低频推动整体、高频增加细节）
      for (let y = 0; y < gh; y++) {
        for (let x = 0; x < gw; x++) {
          const i = y * gw + x;
          const c = curl(x * 0.09, y * 0.09, t * 0.05);
          u[i] = u[i] * visc + (c.x * 0.02 + bus.bass * 0.02) * (0.4 + inject);
          v[i] = v[i] * visc + (c.y * 0.02 - bus.mid * 0.015) * (0.4 + inject);
        }
      }
      // 染料平流（半拉格朗日，最简形式） + 音频在固定位置注入
      for (let y = 0; y < gh; y++) {
        for (let x = 0; x < gw; x++) {
          const i = y * gw + x;
          const sx = Math.max(0, Math.min(gw - 1.001, x - u[i] * 18));
          const sy = Math.max(0, Math.min(gh - 1.001, y - v[i] * 18));
          const x0 = Math.floor(sx);
          const y0 = Math.floor(sy);
          const fx1 = sx - x0;
          const fy1 = sy - y0;
          const i00 = y0 * gw + x0;
          const i10 = i00 + 1;
          const i01 = i00 + gw;
          const i11 = i01 + 1;
          const top = dye[i00] + (dye[i10] - dye[i00]) * fx1;
          const bot = dye[i01] + (dye[i11] - dye[i01]) * fx1;
          tmp[i] = (top + (bot - top) * fy1) * diss;
        }
      }
      dye.set(tmp);
      const cx = Math.floor(gw * (0.35 + noise1(t * 0.07) * 0.2));
      const cy = Math.floor(gh * (0.5 + noise2(t * 0.06) * 0.25));
      const strength = (0.10 + bus.energy * 0.55) * (1 + bus.pulse);
      const r = 2 + Math.round(bus.bass * 4);
      for (let y = -r; y <= r; y++) {
        for (let x = -r; x <= r; x++) {
          const px = cx + x;
          const py = cy + y;
          if (px < 0 || py < 0 || px >= gw || py >= gh) continue;
          const d = Math.sqrt(x * x + y * y) / (r + 0.001);
          if (d > 1) continue;
          const i = py * gw + px;
          dye[i] = Math.min(1.6, dye[i] + strength * (1 - d) * 0.5);
        }
      }
    },
    render(fx, bus) {
      const { ctx, width: w, height: h } = fx;
      const gw = fx.gw;
      const gh = fx.gh;
      const dye = fx.dye;
      const px = fx.pixels.data;
      const hue = hueOf(bus, 0);
      const hue2 = hueOf(bus, 55);
      for (let i = 0; i < dye.length; i++) {
        const d = clamp01(dye[i] * 0.8);
        // 由专辑色推导的实际颜色（HSL→RGB 近似：用亮度与饱和度做双色混合）
        const mixHue = d;
        const rC = Math.round(255 * d * (0.55 + 0.45 * Math.cos((hue + mixHue * 40) * Math.PI / 180)));
        const gC = Math.round(255 * d * 0.55);
        const bC = Math.round(255 * d * (0.7 + 0.3 * Math.cos((hue2 + mixHue * 60) * Math.PI / 180)));
        px[i * 4] = rC;
        px[i * 4 + 1] = gC;
        px[i * 4 + 2] = bC;
        px[i * 4 + 3] = Math.round(220 * Math.min(1, d * 1.4));
      }
      fx.imgCtx.putImageData(fx.pixels, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(fx.img, 0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    }
  });

  /* ---------------------------------------------------------------- 6. 等离子（程序化场） */
  registry.push({
    id: 'plasma',
    nameKey: 'vfxPlasma',
    category: 'energy',
    blend: 'lighter',
    layout: { span: 2, minWidth: 300 },
    generator: 'procedural-field',
    defaultState: {},
    parameters: [
      { id: 'scale', labelKey: 'vfxDetail', min: 20, max: 140, step: 4, default: 64, priority: 'core' },
      { id: 'reactivity', labelKey: 'vfxReactivity', min: 0, max: 100, step: 1, default: 65, priority: 'core' },
      { id: 'speed', labelKey: 'vfxSpeed', min: 0, max: 100, step: 1, default: 38, priority: 'core' },
      { id: 'contrast', labelKey: 'vfxContrast', min: 0, max: 100, step: 1, default: 52, priority: 'secondary' }
    ],
    create(fx) {
      fx.grid = document.createElement('canvas');
      fx.grid.width = 96;
      fx.grid.height = 54;
      fx.gridCtx = fx.grid.getContext('2d');
      fx.pixels = fx.gridCtx.createImageData(96, 54);
    },
    render(fx, bus) {
      const { ctx, width: w, height: h } = fx;
      const gw = 96;
      const gh = 54;
      const data = fx.pixels.data;
      const t = fx.time * (0.15 + fx.state.speed / 100 * 0.9);
      const k = 1 / fx.state.scale;
      const react = fx.state.reactivity / 100;
      const contrast = 1 + fx.state.contrast / 100 * 2.2;
      const bass = bus.bass * react;
      const treble = bus.treble * react;
      for (let y = 0; y < gh; y++) {
        for (let x = 0; x < gw; x++) {
          const i = (y * gw + x) * 4;
          const nx = x * k;
          const ny = y * k * 1.6;
          let v = Math.sin(nx * 3.1 + t * 1.3)
            + Math.sin(ny * 2.7 - t * 1.1)
            + Math.sin((nx + ny) * 1.9 + t * 0.7)
            + noise2(nx * 0.8 + t * 0.3) * 1.4
            + noise1(ny * 0.9 - t * 0.25) * (0.6 + treble * 1.6);
          v = (v + 3.6) / 7.2;
          v = clamp01((v - 0.5) * contrast + 0.5 + bass * 0.18);
          const hue = hueOf(bus, v * 120 + bus.phrase * 40);
          // 便宜的 HSL→RGB：按 60° 色相分段
          const c = 0.75;
          const hp = (hue % 360) / 60;
          const xx = c * (1 - Math.abs(hp % 2 - 1));
          let r1 = 0, g1 = 0, b1 = 0;
          if (hp < 1) { r1 = c; g1 = xx; } else if (hp < 2) { r1 = xx; g1 = c; }
          else if (hp < 3) { g1 = c; b1 = xx; } else if (hp < 4) { g1 = xx; b1 = c; }
          else if (hp < 5) { r1 = xx; b1 = c; } else { r1 = c; b1 = xx; }
          const m = 0.28;
          data[i] = Math.round(255 * clamp01((r1 + m) * v));
          data[i + 1] = Math.round(255 * clamp01((g1 + m) * v));
          data[i + 2] = Math.round(255 * clamp01((b1 + m) * v));
          data[i + 3] = 255;
        }
      }
      fx.gridCtx.putImageData(fx.pixels, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(fx.grid, 0, 0, w, h);
    }
  });

  /* ---------------------------------------------------------------- 7. 声波图形（波的干涉） */
  registry.push({
    id: 'cymatics',
    nameKey: 'vfxCymatics',
    category: 'scientific',
    blend: 'lighter',
    layout: { span: 2, minWidth: 320 },
    generator: 'wave-interference',
    defaultState: {},
    parameters: [
      { id: 'mode', labelKey: 'vfxOrder', min: 2, max: 14, step: 1, default: 7, priority: 'core' },
      { id: 'detail', labelKey: 'vfxDetail', min: 60, max: 220, step: 4, default: 128, priority: 'core' },
      { id: 'reactivity', labelKey: 'vfxReactivity', min: 0, max: 100, step: 1, default: 70, priority: 'core' },
      { id: 'decay', labelKey: 'vfxDecay', min: 0, max: 100, step: 1, default: 45, priority: 'secondary' }
    ],
    render(fx, bus) {
      const { ctx, width: w, height: h } = fx;
      ctx.clearRect(0, 0, w, h);
      const spec = bus.spectrum;
      const bins = spec ? spec.length : 0;
      const n = Math.round(fx.state.detail);
      const mode = Math.round(fx.state.mode);
      const react = fx.state.reactivity / 100;
      const decay = 0.3 + (fx.state.decay / 100) * 0.7;
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.46;
      ctx.globalCompositeOperation = 'lighter';
      for (let r = 4; r <= n; r += 2) {
        const u = r / n;
        const bandIdx = Math.min(bins - 1, Math.round(Math.pow(u, 1.8) * (bins - 1)));
        const amp = bins ? (spec[bandIdx] / 255) : bus.energy * 0.4;
        const energy = Math.pow(amp, 1.25) * react * Math.exp(-u * decay);
        ctx.beginPath();
        const rad = u * R;
        for (let a = 0; a <= 72; a++) {
          const ang = (a / 72) * TAU;
          // 波的干涉：两种模式叠加 + 噪声扰动，避免出现完美圆环
          const wave = Math.sin(ang * mode + fx.time * 0.3) * 0.6
            + Math.sin(ang * (mode * 2 + 1) - fx.time * 0.17) * 0.4
            + noise1(ang * 3.3 + r * 0.7) * 0.35;
          const rr = rad * (1 + wave * energy * 0.42);
          const x = cx + Math.cos(ang) * rr;
          const y = cy + Math.sin(ang) * rr;
          if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'hsla(' + hueOf(bus, u * 110) + ', 86%, ' + (62 - u * 12).toFixed(0) + '%, ' + (0.05 + energy * 0.5).toFixed(3) + ')';
        ctx.lineWidth = 0.8 + energy * 1.8;
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  });

  /* ---------------------------------------------------------------- 8. 电场（放电丝） */
  registry.push({
    id: 'electricField',
    nameKey: 'vfxElectricField',
    category: 'energy',
    blend: 'lighter',
    layout: { span: 2, minWidth: 300 },
    generator: 'filament',
    defaultState: {},
    parameters: [
      { id: 'arcs', labelKey: 'vfxRays', min: 2, max: 26, step: 1, default: 9, priority: 'core' },
      { id: 'reactivity', labelKey: 'vfxReactivity', min: 0, max: 100, step: 1, default: 70, priority: 'core' },
      { id: 'branch', labelKey: 'vfxBranch', min: 0, max: 100, step: 1, default: 55, priority: 'core' },
      { id: 'life', labelKey: 'vfxLifetime', min: 10, max: 100, step: 1, default: 45, priority: 'secondary' }
    ],
    create(fx) {
      fx.bolts = [];
      for (let i = 0; i < 26; i++) {
        fx.bolts.push({ life: Math.random(), sd: i * 71.3 });
      }
    },
    update(fx, dt, bus) {
      const life = 0.35 + fx.state.life / 100 * 1.6;
      for (let i = 0; i < fx.bolts.length; i++) {
        const b = fx.bolts[i];
        b.life -= dt / life;
        // 放电由瞬态/高频触发，闪烁间隔随机 → 不是固定节奏动画
        const trigger = bus.transient * fx.state.reactivity / 100 * (0.6 + framelessRand(i));
        if (b.life <= 0 && (bus.silence ? Math.random() < 0.02 : Math.random() < 0.15 + trigger)) {
          b.life = 1;
          b.sd = Math.random() * 1000;
          b.x0 = Math.random() * fx.width;
          b.y0 = Math.random() * fx.height;
          b.x1 = b.x0 + (Math.random() - 0.5) * fx.width * 0.9;
          b.y1 = b.y0 + (Math.random() - 0.5) * fx.height * 0.9;
        }
      }
    },
    render(fx, bus) {
      const { ctx, width: w, height: h } = fx;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      const arcs = Math.round(fx.state.arcs);
      const branch = fx.state.branch / 100;
      for (let i = 0; i < arcs && i < fx.bolts.length; i++) {
        const b = fx.bolts[i];
        if (b.life <= 0) continue;
        const alpha = Math.pow(b.life, 1.6) * (0.25 + bus.transient * 0.6);
        const hue = hueOf(bus, (i * 17) % 90);
        const segments = 14;
        ctx.beginPath();
        for (let s = 0; s <= segments; s++) {
          const u = s / segments;
          const jitter = (noise1(b.sd + u * 7 + fx.time * 9) * 26) * (0.3 + branch);
          const x = lerp(b.x0, b.x1, u) + jitter;
          const y = lerp(b.y0, b.y1, u) + (noise2(b.sd + u * 6 + fx.time * 7) * 26) * (0.3 + branch);
          if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'hsla(' + hue + ', 92%, ' + (68 + bus.treble * 20).toFixed(0) + '%, ' + alpha.toFixed(3) + ')';
        ctx.lineWidth = 0.7 + alpha * 2.2;
        ctx.stroke();
        // 分叉支线
        if (branch > 0.25 && (i % 2 === 0)) {
          ctx.beginPath();
          const mx = lerp(b.x0, b.x1, 0.5);
          const my = lerp(b.y0, b.y1, 0.5);
          for (let s = 0; s <= 6; s++) {
            const u = s / 6;
            const x = lerp(mx, b.x1, u) + noise1(b.sd + u * 11 + fx.time * 11) * 18 * branch;
            const y = lerp(my, b.y1, u) + noise2(b.sd + u * 13 + fx.time * 12) * 18 * branch;
            if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = 'hsla(' + ((hue + 40) % 360) + ', 92%, 72%, ' + (alpha * 0.6).toFixed(3) + ')';
          ctx.lineWidth = 0.6 + alpha * 1.4;
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  });

  /** 供效果内部使用的轻量伪随机（避免每帧 new 对象 / 影响主随机流） */
  function framelessRand(i) {
    const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  /* ==========================================================================
   * 引擎：生命周期、合成、尺寸与画质
   * ==================================================================== */
  function create(options) {
    const host = options.canvas;
    const ctx = host.getContext('2d');
    const bus = createBus();
    const instances = new Map();
    let sceneActive = false;
    let windowVisible = !document.hidden;
    let autoScale = 1;
    let rafId = 0;
    let lastTime = 0;
    let frameMsAvg = 16;
    let cssWidth = 2;
    let cssHeight = 2;
    let renderScale = 1;

    registry.forEach((def) => instances.set(def.id, createEffect(def, options)));

    function isRunning(id) {
      const fx = instances.get(id);
      return !!(fx && fx.enabled && sceneActive && windowVisible);
    }

    function resize() {
      const rect = host.getBoundingClientRect();
      cssWidth = Math.max(2, rect.width);
      cssHeight = Math.max(2, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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
      let active = 0;
      instances.forEach((fx) => {
        if (!fx.enabled) return;
        active++;
        fx.create();
        fx.resize(cssWidth, cssHeight);
        fx.update(dt, bus.value);
        fx.render(bus.value);
        ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);
        ctx.globalCompositeOperation = fx.def.blend || 'lighter';
        ctx.drawImage(fx.canvas, 0, 0, cssWidth, cssHeight);
      });
      ctx.globalCompositeOperation = 'source-over';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      frameMsAvg = frameMsAvg * 0.92 + dt * 1000 * 0.08;
      // 自动画质：帧耗时偏高就降低内部渲染倍率（先保 60fps，再保细节）
      if (frameMsAvg > 20 && autoScale > 0.6) {
        autoScale = Math.max(0.6, autoScale - 0.05);
        resize();
      } else if (frameMsAvg < 13 && autoScale < 1) {
        autoScale = Math.min(1, autoScale + 0.03);
        resize();
      }
      if (active > 0) rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (rafId || !sceneActive || !windowVisible) return;
      lastTime = 0;
      rafId = requestAnimationFrame(frame);
    }

    function stop() {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      instances.forEach((fx) => { if (fx.running) { fx.running = false; fx.pause(); } });
    }

    return {
      bus,
      registry,
      instances,
      setSceneActive(active) {
        sceneActive = !!active;
        if (sceneActive) {
          resize();
          instances.forEach((fx) => { if (fx.enabled) { fx.running = true; fx.resume(); } });
          start();
        } else {
          stop();
        }
      },
      setWindowVisible(visible) {
        windowVisible = !!visible;
        if (windowVisible && sceneActive) start(); else stop();
      },
      setEnabled(id, enabled) {
        const fx = instances.get(id);
        if (!fx) return;
        fx.enabled = !!enabled;
        if (fx.enabled) {
          fx.create();
          fx.running = true;
          fx.resume();
        } else {
          fx.running = false;
          fx.pause();
        }
        if (sceneActive && windowVisible) start();
      },
      setParam(id, paramId, value) {
        const fx = instances.get(id);
        if (fx) fx.state[paramId] = value;
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
