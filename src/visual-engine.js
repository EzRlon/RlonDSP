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

  /** 把相位差折到 -0.5 ~ +0.5 —— PLL 软校正必须用最短路径 */
  function wrapPhase(p) {
    let x = p;
    while (x > 0.5) x -= 1;
    while (x < -0.5) x += 1;
    return x;
  }

  /** 读取当前主题强调色的色相（颜色只作为视觉调制，绝不参与音频逻辑） */
  let themeHueCache = -1;
  function readThemeHue() {
    try {
      const css = getComputedStyle(document.documentElement);
      const raw = (css.getPropertyValue('--accent') || '').trim();
      if (!raw) return themeHueCache;
      let r = 0, g = 0, b = 0;
      if (raw[0] === '#') {
        const hex = raw.length === 4
          ? raw[1] + raw[1] + raw[2] + raw[2] + raw[3] + raw[3]
          : raw.slice(1, 7);
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
      } else {
        const nums = raw.match(/\d+(\.\d+)?/g);
        if (!nums || nums.length < 3) return themeHueCache;
        r = +nums[0]; g = +nums[1]; b = +nums[2];
      }
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const d = max - min;
      let h = 0;
      if (d > 1e-6) {
        if (max === r) h = ((g - b) / d) % 6;
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h *= 60;
        if (h < 0) h += 360;
      }
      themeHueCache = h;
      return h;
    } catch (error) {
      return themeHueCache;
    }
  }

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
      kick: 0,                            // 更快的冲击包络（约 45ms），用于给粒子打一记冲量
      beatId: 0,                          // 节拍序号：每次检测到节拍 +1，效果可据此在“正好这一拍”触发动作
      push: 0,                            // 节拍推力包络（约 90ms）：推动粒子本体，比 kick 长一点，动起来才看得见
      phrase: 0,                          // 乐句级慢包络（2~8 秒尺度）
      spectralFlux: 0, transient: 0, energy: 0, loud: 0,
      silence: true,                      // 是否近似静音（决定只跑基础运动）
      stereoWidth: 0, correlation: 0, balance: 0,
      spectrum: null, waveform: null, albumHue: 200
    };
    /**
     * Music Motion Core 的对外读数：所有效果都从这里取“音乐时间”。
     * 单位：phase 为 0~1（一拍一圈），时间单位为秒。
     */
    value.motion = {
      tempo: 0, tempoConfidence: 0, beatInterval: 0.5,
      beatPhase: 0, beatProgress: 0, beatIndex: 0,
      barPhase: 0, barIndex: 0, phrasePhase: 0,
      beatPulse: 0, beatAttack: 0, beatRelease: 0, beatEnergy: 0, beatVelocity: 0,
      groove: 0, predictedBeatTime: 0, timeToNextBeat: 0.5,
      lockState: 'UNLOCKED', holdover: false,
      prepare: 0, attack: 0, peak: 0, overshoot: 0, release: 0,
      beatEnvelope: 0, accent: 1, downbeatAccent: 1, releaseTime: 0.2,
      phaseError: 0, correction: 0, lastObservedAt: 0,
      // 五个频段的“动作角色”（已平滑）：bass 身体 / lowMid 聚散 / mid 方向 / highMid 结构 / treble 细节
      role: { bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0 }
    };
    // 强弱拍重音模板（4/4）：1 强、2 弱、3 次强、4 弱
    const ACCENTS = [1, 0.62, 0.88, 0.62];
    const intervals = new Float32Array(12);
    const scratch = new Float32Array(12);
    let intervalHead = 0;
    let intervalFilled = 0;
    let lastBeatAt = 0;
    let observedBeat = false;
    let beatPhase = 0;
    let lastPhase = 0;
    let beatInterval = 0.5;
    let tempoConfidence = 0;
    let beatIndex = 0;
    let barIndex = 0;
    let downbeatAccent = 1;
    let lastEnvelope = 0;
    let hueClock = 1;
    const pllGain = 0.12;          // 相位软校正增益（0.08~0.18）
    const maxCorrection = 0.05;    // 每帧最多校正 5% 相位：所以永远不会跳变
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
    let kickEnv = 0;
    let pushEnv = 0;
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
        kickEnv = 1;
        pushEnv = 1;
        pulseHold = 0.05;
        beatTimes.push(performance.now());
        value.beatId += 1;
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

      // 两级包络：
      //   kick  —— 45ms 时间常数，给粒子一记真正的冲量（打得住节拍）
      //   pulse —— 75ms 时间常数 + 50ms 保持，用于亮度 / 尺寸 / 压力波
      if (pulseHold > 0) {
        pulseHold -= dt;
      } else {
        pulseEnv *= Math.exp(-dt / 0.075);
        if (pulseEnv < 0.001) pulseEnv = 0;
      }
      value.pulse = pulseEnv;
      kickEnv *= Math.exp(-dt / 0.045);
      if (kickEnv < 0.001) kickEnv = 0;
      value.kick = kickEnv;
      // 推力比闪光慢一点（90ms）：闪光负责“看见这一拍”，推力负责“粒子真的被推动”
      pushEnv *= Math.exp(-dt / 0.09);
      if (pushEnv < 0.001) pushEnv = 0;
      value.push = pushEnv;
      value.transient = clamp01(pulseEnv * 0.6 + value.spectralFlux * 6);
      // 乐句级慢包络（2~8 秒尺度）：用于颜色 / 形态这类慢变化
      phraseEnv = lerp(phraseEnv, value.energy, clamp01(dt * 0.55));
      value.phrase = phraseEnv;

      /* ======================================================================
       * Music Motion Core（音乐运动核心）
       * ----------------------------------------------------------------------
       * 它是所有视觉效果唯一的“音乐时钟”。它不做两件事：
       *   · 不把 detected beat 直接当成相位（那会造成每拍硬跳）；
       *   · 不用“最近一次间隔”当 BPM（那会被误检带飞）。
       * 它做的是：
       *   1) 用最近 12 个有效间隔的中位数（去掉异常值）算稳定 tempo；
       *   2) 用相位锁定环（PLL）持续跟踪 beatPhase，检测到的鼓点只做“软校正”；
       *   3) 预测下一拍时间，提前 60~120ms 进入 prepare，让画面“先准备、再被推起来”；
       *   4) 生成 prepare / attack / peak / overshoot / release 连续运动包络；
       *   5) 给出小节与乐句相位、强弱拍重音、以及五个频段的“动作角色”。
       * ==================================================================== */
      const M = value.motion;
      const beatNow = value.beat;
      const now = performance.now() / 1000;

      // --- 1. 稳定 tempo：中位数 + 异常值剔除（40~240 BPM）---
      if (beatNow) {
        if (lastBeatAt > 0) {
          const iv = now - lastBeatAt;
          if (iv >= 0.25 && iv <= 1.5) {
            intervals[intervalHead] = iv;
            intervalHead = (intervalHead + 1) % intervals.length;
            if (intervalFilled < intervals.length) intervalFilled++;
          }
        }
        lastBeatAt = now;
        observedBeat = true;
        M.lastObservedAt = now;
      }
      if (intervalFilled >= 4) {
        // 取中位数：对漏拍/多拍都稳
        const tmp = scratch;
        for (let i = 0; i < intervalFilled; i++) tmp[i] = intervals[i];
        for (let i = 1; i < intervalFilled; i++) {
          const v = tmp[i];
          let j = i - 1;
          while (j >= 0 && tmp[j] > v) { tmp[j + 1] = tmp[j]; j--; }
          tmp[j + 1] = v;
        }
        const med = tmp[Math.floor(intervalFilled / 2)];
        // 只在“半拍 / 双拍”这类倍数关系上做一次收敛，避免抖动地来回跳
        let target = med;
        if (beatInterval > 0) {
          const ratio = med / beatInterval;
          if (ratio > 1.75 && ratio < 2.25) target = med / 2;
          else if (ratio > 0.44 && ratio < 0.56) target = med * 2;
        }
        beatInterval += (target - beatInterval) * clamp01(dt * 2.5);
        const bpm = 60 / beatInterval;
        if (bpm >= 40 && bpm <= 240) value.bpm = Math.round(bpm);
        tempoConfidence = clamp01(tempoConfidence + dt * 0.8);
      } else {
        tempoConfidence = clamp01(tempoConfidence - dt * 0.6);
      }
      M.tempo = value.bpm;
      M.tempoConfidence = tempoConfidence;
      M.beatInterval = beatInterval;

      // --- 2. PLL：相位持续前进，鼓点只做有限幅度的软校正 ---
      const targetInterval = beatInterval > 0 ? beatInterval : 0.5;
      let phaseAdvance = dt / targetInterval;
      if (observedBeat) {
        // 观测相位：鼓点应该落在 0（拍点）
        const err = wrapPhase(-beatPhase);
        const corr = Math.max(-maxCorrection, Math.min(maxCorrection, err * pllGain));
        phaseAdvance += corr;
        observedBeat = false;
        M.phaseError = err;
        M.correction = corr;
      }
      beatPhase = wrapPhase(beatPhase + phaseAdvance);
      if (beatPhase < lastPhase) {
        // 走过一圈 = 一拍：这里才推进拍号（不是检测到鼓点就推进）
        beatIndex++;
        barIndex = Math.floor(beatIndex / 4);
        downbeatAccent = ACCENTS[beatIndex % 4];
      }
      lastPhase = beatPhase;
      M.beatPhase = beatPhase;
      M.beatProgress = beatPhase;
      M.beatIndex = beatIndex;
      M.barIndex = barIndex;
      M.barPhase = (beatIndex % 4 + beatPhase) / 4;
      M.phrasePhase = ((beatIndex % 32) + beatPhase) / 32;
      M.timeToNextBeat = (1 - beatPhase) * targetInterval;
      M.predictedBeatTime = now + M.timeToNextBeat;
      M.downbeatAccent = downbeatAccent;

      // --- 3. 锁定状态机：漏拍也不会让画面失去节奏 ---
      const sinceBeat = now - M.lastObservedAt;
      if (!intervalFilled) M.lockState = 'UNLOCKED';
      else if (intervalFilled < 4) M.lockState = 'ACQUIRING';
      else if (sinceBeat > targetInterval * 2.2) M.lockState = 'HOLDOVER';
      else if (M.lockState === 'HOLDOVER') M.lockState = 'RELOCK';
      else if (M.lockState === 'RELOCK' && sinceBeat < targetInterval * 0.6) M.lockState = 'LOCKED';
      else if (M.lockState !== 'RELOCK') M.lockState = 'LOCKED';
      M.holdover = M.lockState === 'HOLDOVER';

      // --- 4. 连续运动包络：prepare → attack → peak → overshoot → release ---
      // 释放时间随 BPM 自适应：快歌收得快、慢歌收得慢，不会高 BPM 一直沸腾
      const releaseTime = Math.max(0.08, Math.min(0.45, targetInterval * 0.35));
      const prepareLead = Math.max(0.06, Math.min(0.12, targetInterval * 0.35));
      const timeToBeat = (1 - beatPhase) * targetInterval;
      const sinceLast = beatPhase * targetInterval;
      // 提前量：拍点前 prepareLead 秒开始“准备”
      M.prepare = timeToBeat <= prepareLead ? 1 - timeToBeat / prepareLead : 0;
      // 打击：拍点后 18ms 内快速起
      M.attack = sinceLast < 0.018 ? sinceLast / 0.018 : 0;
      // 峰值与回弹：用指数衰减表示“被推起来 → 惯性 → 回弹”
      const decay = Math.exp(-Math.max(0, sinceLast) / releaseTime);
      M.peak = decay;
      M.overshoot = sinceLast > releaseTime * 0.35 && sinceLast < releaseTime * 1.3
        ? Math.exp(-Math.pow((sinceLast - releaseTime * 0.7) / (releaseTime * 0.5), 2)) * 0.35
        : 0;
      M.release = decay * (1 - M.overshoot);
      // 合成包络：0 表示完全静止，1 表示这一拍最强
      M.beatEnvelope = clamp01(
        M.prepare * 0.28 + M.attack * 0.5 + M.peak * 0.75 + M.overshoot * 0.6 + M.release * 0.35
      );
      // 强弱拍：强拍更重，弱拍更轻（不再每拍一模一样）
      M.accent = downbeatAccent;
      M.beatEnergy = M.beatEnvelope * downbeatAccent;
      M.beatVelocity = (M.beatEnvelope - lastEnvelope) / Math.max(dt, 1e-4);
      lastEnvelope = M.beatEnvelope;
      M.beatPulse = M.peak;                 // 与旧字段对应，兼容现有效果
      M.beatAttack = M.attack;
      M.beatRelease = M.release;
      M.releaseTime = releaseTime;
      M.groove = lerp(M.groove, clamp01(value.spectralFlux * 8 + value.highMid * 0.6), clamp01(dt * 3));

      // --- 5. 频段角色：五个频段各自负责一种“动作类型” ---
      const R = M.role;
      R.bass = lerp(R.bass, value.bass, clamp01(dt * 4));
      R.lowMid = lerp(R.lowMid, value.lowMid, clamp01(dt * 5));
      R.mid = lerp(R.mid, value.mid, clamp01(dt * 6));
      R.highMid = lerp(R.highMid, value.highMid, clamp01(dt * 8));
      R.treble = lerp(R.treble, value.treble, clamp01(dt * 10));

      // --- 6. 专辑 / 主题色相：每 0.5 秒读一次 CSS 变量，颜色只做视觉调制 ---
      hueClock += dt;
      if (hueClock > 0.5) {
        hueClock = 0;
        const v = readThemeHue();
        if (v >= 0) value.albumHue = v;
      }
    }

    return { value, update };
  }

  /* ==========================================================================
   * Particle Agent 生态内核（V2 重构）
   * --------------------------------------------------------------------------
   * 设计目标：
   *   1. 每个粒子都是“个体”：有性格、能量、记忆和生命周期，不是 x/y/vx/vy 四个数字；
   *   2. 运动永远走 acceleration → velocity → position，保留惯性与过冲；
   *   3. 音乐不是“遥控每个粒子”，而是先改变世界（局部能量区域），
   *      附近个体先感受到，再通过邻居互动传播出去；
   *   4. 邻居查询用均匀网格（O(N)），不做 O(N²) 暴力比较；
   *   5. 全部数据放在 TypedArray 里，运行期不创建对象 / 数组，避免 GC 抖动。
   * ==================================================================== */

  /** 稳定哈希：同一个 seed 永远得到同一个 0~1 值（性格不会每帧变化） */
  function hash01(seed, salt) {
    let h = Math.imul(seed | 0, 374761393) + Math.imul(salt | 0, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  /* 生命周期阶段：每个粒子处在不同阶段，禁止全体同步 */
  const AG_BIRTH = 0, AG_AWAKEN = 1, AG_EXPLORE = 2, AG_INTERACT = 3,
        AG_EXCITED = 4, AG_DRIFT = 5, AG_DECAY = 6;

  /** 局部环境的临时输出缓冲（预分配，避免每帧建对象） */
  const ENV_OUT = new Float32Array(7);

  /**
   * 粒子个体池。所有字段都是 TypedArray，按索引访问同一个粒子。
   * 性格字段在“出生”时按 seed 生成一次，之后整个生命周期保持不变。
   */
  function createAgents(capacity) {
    const n = Math.max(1, Math.floor(capacity));
    const A = {
      n,
      count: 0,
      x: new Float32Array(n),
      y: new Float32Array(n),
      vx: new Float32Array(n),
      vy: new Float32Array(n),
      age: new Float32Array(n),
      life: new Float32Array(n),
      energy: new Float32Array(n),
      inertia: new Float32Array(n),
      seed: new Float32Array(n),
      wander: new Float32Array(n),
      curiosity: new Float32Array(n),
      social: new Float32Array(n),
      cohesion: new Float32Array(n),
      separ: new Float32Array(n),
      align: new Float32Array(n),
      audioSens: new Float32Array(n),
      beatSens: new Float32Array(n),
      noisePhase: new Float32Array(n),
      noiseSpeed: new Float32Array(n),
      state: new Uint8Array(n),
      stateTimer: new Float32Array(n),
      stateDur: new Float32Array(n),
      memEnergy: new Float32Array(n),
      memDirX: new Float32Array(n),
      memDirY: new Float32Array(n),
      memBeat: new Float32Array(n),
      rot: new Float32Array(n),
      rotV: new Float32Array(n),
      opacity: new Float32Array(n),
      size: new Float32Array(n),
      depth: new Float32Array(n),
      glow: new Float32Array(n),
      local: new Float32Array(n),
      link: new Float32Array(n),      // 最近邻居索引（-1 表示没有）
      beatPhaseOffset: new Float32Array(n), // 个体拍点偏移：±0.15 拍（有人先动、有人正拍、有人稍后回弹）
      dirMix: new Float32Array(n),          // 0=径向为主 / 1=切向为主，避免所有效果都变成“中心爆炸”
      nb: new Uint8Array(n),          // 邻居数量（生命周期与渲染都会用到）
      cell: new Uint32Array(n),       // 网格归属（邻居查询用）

      /** 让第 i 个粒子“出生”：随机挑选性格，并给它一个错开的年龄 */
      spawn(i, w, h, env, cfg) {
        const c = cfg || EMPTY_CFG;
        // 位置：整屏随机，再按局部区域偏一点 → 有密度差、有空旷区，但四角都有生命
        let px = Math.random() * w;
        let py = Math.random() * h;
        if (env && env.n) {
          const z = (Math.random() * env.n) | 0;
          const bias = (c.zoneBias === undefined ? 0.35 : c.zoneBias) * (0.4 + Math.random() * 0.9);
          px = px * (1 - bias) + (env.x[z] + (Math.random() - 0.5) * env.r[z] * 1.7) * bias;
          py = py * (1 - bias) + (env.y[z] + (Math.random() - 0.5) * env.r[z] * 1.7) * bias;
        }
        A.x[i] = px < 1 ? 1 : (px > w - 1 ? w - 1 : px);
        A.y[i] = py < 1 ? 1 : (py > h - 1 ? h - 1 : py);
        const a0 = Math.random() * TAU;
        const sp = (c.spawnSpeed === undefined ? 8 : c.spawnSpeed) * (0.4 + Math.random());
        A.vx[i] = Math.cos(a0) * sp;
        A.vy[i] = Math.sin(a0) * sp;

        const seed = Math.random() * 100000;
        A.seed[i] = seed;
        const s = seed | 0;
        A.wander[i] = 0.25 + hash01(s, 11) * 1.7;              // 爱不爱自己乱走
        A.curiosity[i] = 0.2 + hash01(s, 12) * 1.7;            // 探索欲望
        A.social[i] = hash01(s, 13);                            // 0 喜欢独处 → 1 喜欢群体
        A.cohesion[i] = 0.1 + hash01(s, 14) * 1.0;              // 聚拢倾向
        A.separ[i] = 0.35 + hash01(s, 15) * 1.5;                // 保持距离倾向
        A.align[i] = hash01(s, 16) * 1.0;                       // 跟随邻居方向倾向
        A.audioSens[i] = 0.25 + hash01(s, 17) * 1.6;            // 对音乐敏感度
        A.beatSens[i] = Math.pow(hash01(s, 18), 3) * 2.4;       // 只有少数粒子对节拍特别敏感
        A.inertia[i] = 0.35 + hash01(s, 19) * 1.5;              // 惯性大小
        A.noiseSpeed[i] = 0.05 + hash01(s, 20) * 0.25;
        A.noisePhase[i] = hash01(s, 21) * 200;
        A.rot[i] = Math.random() * TAU;
        A.rotV[i] = (Math.random() - 0.5) * 2.4;
        A.beatPhaseOffset[i] = (hash01(s, 31) - 0.5) * 0.3;   // ±0.15 拍
        A.dirMix[i] = hash01(s, 32);
        A.size[i] = 0.7 + Math.random() * 1.8;
        A.opacity[i] = 0.22 + Math.random() * 0.5;
        A.depth[i] = Math.random();

        const minLife = c.minLife === undefined ? 8 : c.minLife;
        const span = c.lifeSpan === undefined ? 22 : c.lifeSpan;
        A.life[i] = minLife + Math.random() * span;
        // 关键：初始年龄随机 → 同一时刻所有粒子处在不同生命阶段，不会一起生一起死
        A.age[i] = Math.random() * A.life[i] * 0.92;
        const f = A.age[i] / A.life[i];
        A.state[i] = f < 0.05 ? AG_BIRTH : f < 0.18 ? AG_AWAKEN : f < 0.72 ? AG_EXPLORE : f < 0.86 ? AG_DRIFT : AG_DECAY;
        A.stateDur[i] = 0.6 + Math.random() * 1.6;
        A.stateTimer[i] = A.stateDur[i] * Math.random();
        A.energy[i] = 0.4 + Math.random() * 0.5;
        A.memEnergy[i] = 0;
        // 方向记忆一开始就朝向它出生的方向（单位向量），否则兴奋时没有方向可推
        A.memDirX[i] = Math.cos(a0);
        A.memDirY[i] = Math.sin(a0);
        A.memBeat[i] = 0;
        A.glow[i] = 0;
        A.local[i] = 0;
        A.link[i] = -1;
      },

      /** 按需补齐到 want 个（只增不减，避免运行期抖动） */
      ensure(want, w, h, env, cfg) {
        const target = Math.min(A.n, Math.max(0, Math.floor(want)));
        if (target > A.count) {
          for (let i = A.count; i < target; i++) A.spawn(i, w, h, env, cfg);
        }
        A.count = target;
      },

      reset() { A.count = 0; }
    };
    return A;
  }

  const EMPTY_CFG = {};

  /**
   * 局部环境：若干块缓慢漂移的“区域”（高能区 / 安静区 / 吸引区 / 排斥区 / 流动区）。
   * 音乐不会直接推粒子，而是先给这些区域注入能量 —— 靠近的粒子先受影响。
   */
  function createEnvironment(count) {
    const n = Math.max(3, Math.floor(count));
    const E = {
      n,
      x: new Float32Array(n),
      y: new Float32Array(n),
      r: new Float32Array(n),
      vx: new Float32Array(n),
      vy: new Float32Array(n),
      energy: new Float32Array(n),
      base: new Float32Array(n),
      pull: new Float32Array(n),
      beatPulse: new Float32Array(n),
      lastBeat: -1,
      w: 1,
      h: 1,
      drift: 1,
      init(w, h) {
        E.w = Math.max(2, w);
        E.h = Math.max(2, h);
        for (let k = 0; k < E.n; k++) {
          const a = (k / E.n) * TAU + Math.random() * 0.6;
          E.x[k] = E.w * (0.5 + Math.cos(a) * (0.18 + Math.random() * 0.26));
          E.y[k] = E.h * (0.5 + Math.sin(a) * (0.18 + Math.random() * 0.26));
          E.r[k] = Math.min(E.w, E.h) * (0.16 + Math.random() * 0.24);
          const sp = 3 + Math.random() * 9;
          E.vx[k] = Math.cos(a + 1.7) * sp;
          E.vy[k] = Math.sin(a + 1.7) * sp;
          E.base[k] = 0.25 + Math.random() * 0.55;
          // 一半区域吸引、一半排斥，另有安静区（负能量）
          const roll = Math.random();
          E.pull[k] = roll < 0.34 ? 0.5 + Math.random() * 0.9 : (roll < 0.58 ? -(0.4 + Math.random() * 0.8) : 0);
          E.energy[k] = E.base[k];
          E.beatPulse[k] = 0;
        }
        // 关键：把整体漂移扣掉。
        // 如果几块区域的速度方向凑巧偏同一侧，整屏粒子会被一起推着往一个方向走，
        // 看起来就是“全体同步” —— 这是必须避免的。扣掉平均值后，环境整体不流动，
        // 只有局部在互相推挤。
        let mvx = 0, mvy = 0;
        for (let k = 0; k < E.n; k++) { mvx += E.vx[k]; mvy += E.vy[k]; }
        mvx /= E.n;
        mvy /= E.n;
        for (let k = 0; k < E.n; k++) { E.vx[k] -= mvx; E.vy[k] -= mvy; }
      },
      resize(w, h) {
        const sx = Math.max(2, w) / E.w;
        const sy = Math.max(2, h) / E.h;
        for (let k = 0; k < E.n; k++) { E.x[k] *= sx; E.y[k] *= sy; }
        E.w = Math.max(2, w);
        E.h = Math.max(2, h);
      },
      update(dt, bus, speed) {
        const sp = speed === undefined ? 1 : speed;
        for (let k = 0; k < E.n; k++) {
          E.x[k] += E.vx[k] * dt * sp;
          E.y[k] += E.vy[k] * dt * sp;
          if (E.x[k] < -E.r[k]) { E.x[k] = -E.r[k]; E.vx[k] = Math.abs(E.vx[k]); }
          else if (E.x[k] > E.w + E.r[k]) { E.x[k] = E.w + E.r[k]; E.vx[k] = -Math.abs(E.vx[k]); }
          if (E.y[k] < -E.r[k]) { E.y[k] = -E.r[k]; E.vy[k] = Math.abs(E.vy[k]); }
          else if (E.y[k] > E.h + E.r[k]) { E.y[k] = E.h + E.r[k]; E.vy[k] = -Math.abs(E.vy[k]); }
          E.beatPulse[k] = Math.max(0, E.beatPulse[k] - dt * 1.5);
          // 音乐只改变“世界的能量水平”，再由粒子自己去感受
          const target = E.base[k] * (0.45 + bus.energy * 1.3) + bus.pulse * 0.25 * E.base[k];
          E.energy[k] += (target - E.energy[k]) * clamp01(dt * 1.6);
        }
        // 一记节拍只砸在 1~2 个区域上：于是“某个角落先动起来”，再往旁边传
        if (bus.beatId !== E.lastBeat) {
          E.lastBeat = bus.beatId;
          const hits = 1 + ((Math.random() * 2) | 0);
          for (let h = 0; h < hits; h++) {
            const k = (Math.random() * E.n) | 0;
            E.beatPulse[k] = Math.min(1.8, E.beatPulse[k] + 0.9 + bus.beatStrength * 0.7);
            E.energy[k] = Math.min(1.8, E.energy[k] + 0.35);
          }
        }
      }
    };
    return E;
  }

  /** 采样某个点的局部环境：能量 / 流动 / 吸引 / 节拍脉冲 / 最近区域中心 */
  function sampleEnv(E, x, y, out) {
    let e = 0, fx = 0, fy = 0, pull = 0, hit = 0;
    let bestD = Infinity, bx = x, by = y;
    for (let k = 0; k < E.n; k++) {
      const dx = x - E.x[k];
      const dy = y - E.y[k];
      const r = E.r[k];
      const w = 1 / (1 + (dx * dx + dy * dy) / (r * r));
      e += E.energy[k] * w;
      fx += E.vx[k] * w;
      fy += E.vy[k] * w;
      pull += E.pull[k] * w;
      hit += E.beatPulse[k] * w;
      if (dx * dx + dy * dy < bestD) { bestD = dx * dx + dy * dy; bx = E.x[k]; by = E.y[k]; }
    }
    out[0] = e;
    out[1] = fx;
    out[2] = fy;
    out[3] = pull;
    out[4] = hit;
    out[5] = bx;
    out[6] = by;
  }

  /* --------------------------------------------------------------------------
   * 均匀网格：邻居查询。先按格子做一次计数排序（O(N)），
   * 每个粒子只看自己所在格子与周围 8 个格子，避免 O(N²) 两两比较。
   * ------------------------------------------------------------------------ */
  function createGrid(capacity, cellSize) {
    const n = Math.max(1, Math.floor(capacity));
    return {
      cell: cellSize,
      cols: 1,
      rows: 1,
      cells: 1,
      counts: new Uint32Array(4),
      starts: new Uint32Array(8),
      cursor: new Uint32Array(4),
      items: new Uint32Array(n),
      order: new Uint32Array(n)
    };
  }

  function resizeGrid(G, w, h, cellSize) {
    const cols = Math.max(1, Math.ceil(w / cellSize));
    const rows = Math.max(1, Math.ceil(h / cellSize));
    const cells = cols * rows;
    G.cell = cellSize;
    G.cols = cols;
    G.rows = rows;
    G.w = w;
    G.h = h;
    if (cells + 1 > G.counts.length) {
      G.counts = new Uint32Array(cells + 1);
      G.starts = new Uint32Array(cells + 1);
      G.cursor = new Uint32Array(cells + 1);
    }
    G.cells = cells;
  }

  /** 把当前所有粒子按格子归位（计数排序），供邻居查询使用 */
  function buildGrid(G, A) {
    const cells = G.cells;
    const counts = G.counts;
    const starts = G.starts;
    const cursor = G.cursor;
    const order = G.order;
    const count = A.count;
    counts.fill(0, 0, cells + 1);
    for (let i = 0; i < count; i++) {
      let cx = (A.x[i] / G.cell) | 0;
      let cy = (A.y[i] / G.cell) | 0;
      if (cx < 0) cx = 0; else if (cx >= G.cols) cx = G.cols - 1;
      if (cy < 0) cy = 0; else if (cy >= G.rows) cy = G.rows - 1;
      const c = cy * G.cols + cx;
      A.cell[i] = c;
      counts[c]++;
    }
    let acc = 0;
    for (let c = 0; c < cells; c++) {
      starts[c] = acc;
      cursor[c] = acc;
      acc += counts[c];
    }
    starts[cells] = acc;
    for (let i = 0; i < count; i++) order[cursor[A.cell[i]]++] = i;
  }

  /**
   * 生态演化主循环（所有粒子效果共用，靠 cfg 参数区分“这个世界的性格”）。
   *
   * 一帧里每个粒子依次经历：
   *   局部环境采样 → 自主游走 → 环境推力 → 邻居互动 → 节拍能量 → 记忆衰减
   *   → 加速度积分 → 惯性阻尼 → 位置更新 → 生命周期推进（到点重生）
   *
   * cfg 可调：
   *   wander / flow / pull / neighbor / beat / drag / maxSpeed / stateBase
   *   nbRadius / maxNb / minLife / lifeSpan / zoneBias / spawnSpeed
   */
  function stepAgents(A, dt, bus, E, G, cfg, t) {
    const n = A.count;
    if (!n) return;
    const nbR = cfg.nbRadius === undefined ? 34 : cfg.nbRadius;
    const nbR2 = nbR * nbR;
    const maxNb = cfg.maxNb === undefined ? 14 : cfg.maxNb;
    const drag = cfg.drag === undefined ? 0.9 : cfg.drag;
    const maxSpeed = cfg.maxSpeed === undefined ? 90 : cfg.maxSpeed;
    const stateBase = cfg.stateBase === undefined ? 1.4 : cfg.stateBase;
    const out = ENV_OUT;

    for (let i = 0; i < n; i++) {
      /* ---------------- 1. 局部环境：这个世界此刻在这个位置是什么样 ---------------- */
      sampleEnv(E, A.x[i], A.y[i], out);
      const envEnergy = out[0];
      const envHit = out[4];
      A.local[i] = envEnergy + envHit;

      /* ---------------- 2. 自主游走：每个粒子有自己的噪声相位与速度 ---------------- */
      const ph = A.noisePhase[i] + t * A.noiseSpeed[i];
      const wanderAmt = A.wander[i] * (0.5 + A.curiosity[i] * 0.5) * cfg.wander;
      // 注意：noise1 / noise2 本身已经是 [-1, 1] 的居中噪声。
      // 这里绝不能再写 (n * 2 - 1)：那会把居中值硬生生变成 -1 的常数偏置，
      // 于是每个粒子都被恒定往同一个方向推 —— 整片粒子集体同向漂移。
      let ax = noise1(ph * 1.3) * wanderAmt;
      let ay = noise2(ph * 1.1) * wanderAmt;

      /* ---------------- 3. 环境推力：流动 / 吸引 / 排斥 ---------------- */
      if (cfg.flow) {
        ax += out[1] * cfg.flow * 0.01;
        ay += out[2] * cfg.flow * 0.01;
      }
      const pull = out[3];
      if (pull !== 0 && cfg.pull) {
        const dxz = out[5] - A.x[i];
        const dyz = out[6] - A.y[i];
        const dz = Math.sqrt(dxz * dxz + dyz * dyz) + 1e-3;
        ax += (dxz / dz) * pull * cfg.pull;
        ay += (dyz / dz) * pull * cfg.pull;
      }

      /* ---------------- 4. 邻居互动：分离 / 排列 / 聚集（网格查询） ---------------- */
      const cxi = A.cell[i] % G.cols;
      const cyi = (A.cell[i] / G.cols) | 0;
      let nb = 0;
      let sepX = 0, sepY = 0, cohX = 0, cohY = 0, aliX = 0, aliY = 0, nbBeat = 0;
      let closest = -1, closestD = nbR2;
      for (let gy = cyi - 1; gy <= cyi + 1; gy++) {
        if (gy < 0 || gy >= G.rows) continue;
        for (let gx = cxi - 1; gx <= cxi + 1; gx++) {
          if (gx < 0 || gx >= G.cols) continue;
          const c = gy * G.cols + gx;
          const s = G.starts[c];
          const e = G.starts[c + 1];
          for (let k = s; k < e; k++) {
            const j = G.order[k];
            if (j === i) continue;
            const dx = A.x[j] - A.x[i];
            const dy = A.y[j] - A.y[i];
            const d2 = dx * dx + dy * dy;
            if (d2 > nbR2) continue;
            const d = Math.sqrt(d2) + 1e-3;
            const inv = 1 / d;
            sepX -= dx * inv * inv * nbR;
            sepY -= dy * inv * inv * nbR;
            cohX += dx;
            cohY += dy;
            aliX += A.vx[j];
            aliY += A.vy[j];
            nbBeat += A.memBeat[j];
            nb++;
            if (d2 < closestD) { closestD = d2; closest = j; }
            if (nb >= maxNb) break;
          }
          if (nb >= maxNb) break;
        }
        if (nb >= maxNb) break;
      }
      A.nb[i] = nb > 255 ? 255 : nb;
      A.link[i] = closest;
      if (nb > 0) {
        const inv = 1 / nb;
        // 三种力分开加权：分离要够强（个体感），排列必须很弱，
        // 否则整片粒子会迅速锁成一个方向 —— 那就是“全体同步”，必须避免。
        const sepW = cfg.sepW === undefined ? 0.6 : cfg.sepW;
        const cohW = cfg.cohW === undefined ? 0.04 : cfg.cohW;
        const aliW = cfg.alignW === undefined ? 0.05 : cfg.alignW;
        ax += (sepX * A.separ[i] * sepW + cohX * inv * A.cohesion[i] * cohW +
          (aliX * inv - A.vx[i]) * A.align[i] * aliW) * cfg.neighbor;
        ay += (sepY * A.separ[i] * sepW + cohY * inv * A.cohesion[i] * cohW +
          (aliY * inv - A.vy[i]) * A.align[i] * aliW) * cfg.neighbor;
        // 邻居刚刚兴奋过 → 自己也被轻微带动（这是“局部传播”的关键）
        A.memBeat[i] = Math.min(1.6, A.memBeat[i] + nbBeat * inv * 0.35 * dt);
      }

      /* ---------------- 5. 节拍：不是遥控，而是世界给这个地方加了一点能量 ---------------- */
      // Music Motion Core：所有个体共用同一条音乐时间轴，但每人有自己的 beatPhaseOffset。
      // 于是同一拍里有人提前准备、有人正拍被推、有人稍后回弹 —— 既不脱节，也不同步。
      // 驱动量是“连续运动包络 × 个体敏感度”，不是“检测到 beat 就跳一下”。
      const mt = bus.motion;
      const localBoost = 0.5 + Math.min(1.5, envEnergy) * 0.35 + envHit * 0.35;
      const ownPhase = wrapPhase(mt.beatPhase - A.beatPhaseOffset[i]);
      const interval = mt.beatInterval > 0 ? mt.beatInterval : 0.5;
      const releaseT = mt.releaseTime > 0 ? mt.releaseTime : 0.2;
      const toBeat = (1 - ownPhase) * interval;
      const sinceOwn = ownPhase * interval;
      const envPrepare = toBeat <= releaseT * 0.6 ? 1 - toBeat / Math.max(releaseT * 0.6, 1e-3) : 0;
      const envPeak = Math.exp(-Math.max(0, sinceOwn) / releaseT);
      const envOvershoot = sinceOwn > releaseT * 0.35 && sinceOwn < releaseT * 1.3
        ? Math.exp(-Math.pow((sinceOwn - releaseT * 0.7) / (releaseT * 0.5), 2)) * 0.35
        : 0;
      const beatEnv = clamp01(envPrepare * 0.3 + envPeak * 0.8 + envOvershoot * 0.6) * mt.downbeatAccent;
      // 100% 活跃个体都受音乐驱动（最低幅度 0.12），敏感度只决定强弱
      const musicDrive = beatEnv * (0.12 + A.beatSens[i]) * (0.55 + localBoost * 0.45) * cfg.beat;
      A.memBeat[i] = Math.min(1.5, A.memBeat[i] + musicDrive * dt * 3);
      A.energy[i] = Math.min(1.6, A.energy[i] + musicDrive * dt * 1.1);
      // 兴奋消退随 BPM 自适应：快歌收得快（不会持续沸腾），慢歌收得慢（不会呆滞）
      const decay = (0.9 / releaseT) * (1.15 - 0.4 * Math.min(1, A.beatSens[i] / 2));
      A.memBeat[i] = Math.max(0, A.memBeat[i] - dt * decay);
      A.memEnergy[i] += (A.energy[i] - A.memEnergy[i]) * clamp01(dt * 1.2);
      // 平时靠“所在区域的能量”给一点常态底色：这是空间差异，不是时间上的全体同步
      A.energy[i] = Math.min(1.6, A.energy[i] + (0.25 + envEnergy * 0.12) * dt * 0.5);

      /* ---------------- 5b. BeatForce：方向混合（径向 + 切向 + 空间场），不是纯爆炸 ------- */
      const halfMin = Math.min(G.w, G.h) * 0.5 + 1e-3;
      const bxn = (A.x[i] - G.w * 0.5) / halfMin;
      const byn = (A.y[i] - G.h * 0.5) / halfMin;
      const fieldX = noise1(A.x[i] * 0.0035 + mt.beatPhase * 1.7 + A.noisePhase[i] * 0.02);
      const fieldY = noise2(A.y[i] * 0.0035 - mt.beatPhase * 1.7 + A.noisePhase[i] * 0.02);
      const mix = A.dirMix[i];
      ax += (bxn * mix - byn * (1 - mix)) * musicDrive * 55 + fieldX * musicDrive * 30;
      ay += (byn * mix + bxn * (1 - mix)) * musicDrive * 55 + fieldY * musicDrive * 30;
      /* ---------------- 5c. 频段角色：五个频段各负责一种动作 ---------------- */
      const role = mt.role;
      const bassF = role.bass * (cfg.bass === undefined ? 1 : cfg.bass);
      ax += fieldX * bassF * 34;                       // BASS：整个空间有重量
      ay += fieldY * bassF * 34;
      const lowMidF = role.lowMid * (cfg.lowMid === undefined ? 1 : cfg.lowMid);
      ax += -bxn * lowMidF * 26 * A.cohesion[i];        // LOW MID：群体聚散
      ay += -byn * lowMidF * 26 * A.cohesion[i];
      const midF = role.mid * (cfg.mid === undefined ? 1 : cfg.mid);
      ax += (-byn) * midF * 22 * A.align[i];            // MID：方向 / 旋转 / 流向
      ay += (bxn) * midF * 22 * A.align[i];
      const microF = (role.highMid * 0.55 + role.treble * 0.5) * (cfg.micro === undefined ? 1 : cfg.micro);
      ax += noise1(ph * 6.3 + t * 2.4) * microF * 22;   // HIGH MID + TREBLE：细节与微粒
      ay += noise2(ph * 5.7 + t * 2.4) * microF * 22;

      /* ---------------- 6. 兴奋：沿记忆方向持续一段，再衰减（不是闪一下就没） ---------------- */
      const excite = A.memBeat[i];
      if (excite > 0.08) {
        const dirX = A.memDirX[i], dirY = A.memDirY[i];
        const curl2 = curl(A.x[i] / 220, A.y[i] / 220, t * 0.3 + A.noisePhase[i]);
        const push = (cfg.exciteAccel === undefined ? 26 : cfg.exciteAccel) * excite;
        ax += dirX * push + curl2.x * push * 0.35;
        ay += dirY * push + curl2.y * push * 0.35;
        A.rotV[i] += (curl2.x - curl2.y) * excite * dt * 6;
      }
      A.rot[i] += A.rotV[i] * dt;
      A.rotV[i] *= (1 - dt * 1.2);

      /* ---------------- 7. 惯性积分：加速度 → 速度 → 位置 ---------------- */
      // 阻尼按 BPM 自适应：拍点附近收得更快（不会高 BPM 一直沸腾），拍间放松
      const dmp = (drag + musicDrive * 0.08 / Math.max(0.06, releaseT)) / A.inertia[i];
      A.vx[i] += (ax - A.vx[i] * dmp) * dt;
      A.vy[i] += (ay - A.vy[i] * dmp) * dt;
      const sp2 = A.vx[i] * A.vx[i] + A.vy[i] * A.vy[i];
      if (sp2 > maxSpeed * maxSpeed) {
        const k = maxSpeed / Math.sqrt(sp2);
        A.vx[i] *= k;
        A.vy[i] *= k;
      }
      A.x[i] += A.vx[i] * dt;
      A.y[i] += A.vy[i] * dt;

      // 方向记忆保存的是“单位方向”（不是速度大小），这样兴奋时的推力大小可控，
      // 不会因为速度越大推力越大而把所有人顶到同一个上限。
      const spd = Math.sqrt(A.vx[i] * A.vx[i] + A.vy[i] * A.vy[i]) + 1e-4;
      A.memDirX[i] += (A.vx[i] / spd - A.memDirX[i]) * clamp01(dt * 0.9);
      A.memDirY[i] += (A.vy[i] / spd - A.memDirY[i]) * clamp01(dt * 0.9);
      A.energy[i] = Math.max(0, A.energy[i] - dt * 0.45);
      A.glow[i] = A.memBeat[i];

      /* ---------------- 8. 边界：环绕（保证整屏都有生命，不会都堆在中间） ---------------- */
      const bx = cfg.wrap === undefined ? 12 : cfg.wrap;
      if (A.x[i] < -bx) A.x[i] = G.w + bx; else if (A.x[i] > G.w + bx) A.x[i] = -bx;
      if (A.y[i] < -bx) A.y[i] = G.h + bx; else if (A.y[i] > G.h + bx) A.y[i] = -bx;

      /* ---------------- 9. 生命周期推进 ---------------- */
      A.age[i] += dt;
      A.stateTimer[i] -= dt;
      const frac = A.age[i] / A.life[i];
      let st = A.state[i];
      if (A.stateTimer[i] <= 0) {
        if (st === AG_BIRTH) st = AG_AWAKEN;
        else if (st === AG_AWAKEN) st = AG_EXPLORE;
        else if (st === AG_EXPLORE) st = (nb >= 3 && A.social[i] > 0.55) ? AG_INTERACT : (frac > 0.55 ? AG_DRIFT : AG_EXPLORE);
        else if (st === AG_INTERACT) st = (A.memBeat[i] > 0.7 || A.energy[i] > 1.1) ? AG_EXCITED : (nb < 2 ? AG_EXPLORE : AG_INTERACT);
        else if (st === AG_EXCITED) st = AG_INTERACT;
        else if (st === AG_DRIFT) st = frac > 0.85 ? AG_DECAY : AG_EXPLORE;
        else st = AG_DECAY;
        A.state[i] = st;
        A.stateDur[i] = stateBase * (0.55 + Math.random() * 0.95) * (st === AG_INTERACT ? 0.75 : 1);
        A.stateTimer[i] = A.stateDur[i];
      }
      if (frac >= 1 || (st === AG_DECAY && A.stateTimer[i] <= 0)) {
        A.spawn(i, G.w, G.h, E, cfg);
      }
    }
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
      scale: 1,
      time: 0,
      created: false,
      running: false,
      enabled: false,
      w: 0,          // 当前的“可见程度” 0~1：换预设时用它做淡出淡入，不会硬切
      fadeDur: 0.5,  // 这一档淡入淡出要花几秒
      /**
       * w / h 是 CSS 像素（效果内部统一用这个坐标画画），
       * scale 是屏幕物理像素倍率。画布真正的像素数 = CSS 尺寸 × 倍率，
       * 所以画面永远按屏幕的物理像素绘制，不会因为放大而发虚。
       */
      resize(w, h, scale) {
        const nw = Math.max(2, Math.round(w));
        const nh = Math.max(2, Math.round(h));
        const s = Math.max(0.5, Number(scale) || 1);
        if (nw === this.width && nh === this.height && s === this.scale) return;
        this.width = nw;
        this.height = nh;
        this.scale = s;
        canvas.width = Math.max(2, Math.round(nw * s));
        canvas.height = Math.max(2, Math.round(nh * s));
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
        if (!def.render) return;
        const paint = this.ctx;
        // 效果内部按 CSS 像素描述几何，实际输出到物理像素：文字与边缘都不会被重采样糊掉
        paint.setTransform(this.scale, 0, 0, this.scale, 0, 0);
        def.render(this, bus);
        paint.setTransform(1, 0, 0, 1, 0, 0);
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
      // 一个“生态”：个体池 + 局部环境 + 邻居网格
      fx.agents = createAgents(2600);
      fx.env = createEnvironment(6);
      fx.grid = createGrid(2600, 42);
      fx.cfg = {};
      fx.ready = false;
    },
    update(fx, dt, bus) {
      const A = fx.agents;
      if (!fx.ready) { fx.env.init(fx.width, fx.height); fx.ready = true; }
      // 现有滑杆映射到新模型：不新增控件，但每个滑杆现在真的改变“世界的规则”
      const cfg = fx.cfg;
      cfg.wander = 14 + (fx.state.flow / 100) * 45;            // 流动速度 → 个体自主游走强度
      cfg.flow = 0.8 + (fx.state.turbulence / 100) * 3.4;      // 扰动 → 环境流动影响
      cfg.pull = (fx.state.attraction / 100) * 2.4;            // 吸引 / 排斥（可为负）
      cfg.neighbor = 0.55 + (fx.state.pulseStrength / 100) * 0.8; // 脉冲强度 → 邻居互动强度
      cfg.beat = 1.0 + (fx.state.pulseStrength / 100) * 0.9;      // 脉冲强度 → 对音乐事件的敏感度
      // 阻尼偏大：每一拍的推力变成“一记冲劲 + 随后收住”，而不是越积越快
      cfg.drag = 1.4 + (fx.state.flow / 100) * 1.0;
      cfg.maxSpeed = 60 + (fx.state.flow / 100) * 110;
      cfg.nbRadius = 26 + (fx.state.noiseScale / 300) * 30;    // 噪声尺度 → 感知半径
      cfg.maxNb = 14;
      cfg.minLife = 7;
      cfg.lifeSpan = 20;
      cfg.zoneBias = 0.35;
      cfg.spawnSpeed = 9;
      cfg.stateBase = 1.5;
      cfg.memDecay = 1.2;
      cfg.alignW = 0.05;
      cfg.sepW = 0.8;
      cfg.cohW = 0.03;
      cfg.exciteAccel = 30;
      fx.env.update(dt, bus, 1);
      resizeGrid(fx.grid, fx.width, fx.height, cfg.nbRadius);
      A.ensure(fx.state.count, fx.width, fx.height, fx.env, cfg);
      buildGrid(fx.grid, A);
      stepAgents(A, dt, bus, fx.env, fx.grid, cfg, fx.time);
    },
    render(fx, bus) {
      const { ctx, width: w, height: h } = fx;
      const A = fx.agents;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      const hueBase = hueOf(bus, 0);
      // 个体亮度/大小来自它自己的能量与节拍记忆 —— 没有“全屏统一闪一下”
      for (let i = 0; i < A.count; i++) {
        const depth = A.depth[i];
        const lit = A.energy[i] + A.memBeat[i];
        const size = A.size[i] * (0.55 + depth * 1.5) * (0.75 + Math.min(1.6, lit) * 0.55);
        let alpha = A.opacity[i] * (0.4 + Math.min(1.4, lit) * 0.55);
        const st = A.state[i];
        if (st === AG_BIRTH) alpha *= 0.35;
        else if (st === AG_DECAY) alpha *= 0.5;
        else if (st === AG_EXCITED) alpha *= 1.35;
        if (alpha < 0.015) continue;
        const hue = (hueBase + (depth - 0.5) * 70 + A.rot[i] * 5 + bus.phrase * 30 + 360) % 360;
        ctx.fillStyle = 'hsla(' + hue + ', 88%, ' + (56 + depth * 22).toFixed(0) + '%, ' + alpha.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(A.x[i], A.y[i], size, 0, TAU);
        ctx.fill();
      }
      // 关系层：正在互动的个体与最近邻居之间有一条很淡的线（看得出“它们在互相影响”）
      ctx.lineWidth = 0.6;
      for (let i = 0; i < A.count; i++) {
        const st = A.state[i];
        if (st !== AG_INTERACT && st !== AG_EXCITED) continue;
        const j = A.link[i];
        if (j < 0 || j <= i) continue;
        const glow = (A.glow[i] + A.glow[j]) * 0.5;
        ctx.strokeStyle = 'hsla(' + ((hueBase + 20) % 360) + ', 85%, 70%, ' + (0.03 + glow * 0.14).toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(A.x[i], A.y[i]);
        ctx.lineTo(A.x[j], A.y[j]);
        ctx.stroke();
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
      // 流场：个体在环境流里自主移动，邻居只做很弱的呼应（保持“被风带走”的观感）
      fx.agents = createAgents(3200);
      fx.env = createEnvironment(5);
      fx.grid = createGrid(3200, 46);
      fx.cfg = {};
      fx.ready = false;
      fx.trailCanvas = document.createElement('canvas');
      fx.trailCtx = fx.trailCanvas.getContext('2d');
    },
    resize(fx) {
      // 拖尾画布也按物理像素开，最后 1:1 贴回去，边缘不会发虚
      fx.trailCanvas.width = Math.max(2, Math.round(fx.width * fx.scale));
      fx.trailCanvas.height = Math.max(2, Math.round(fx.height * fx.scale));
      fx.trailCtx.setTransform(fx.scale, 0, 0, fx.scale, 0, 0);
      if (fx.agents) fx.agents.reset();
    },
    update(fx, dt, bus) {
      const A = fx.agents;
      if (!fx.ready) { fx.env.init(fx.width, fx.height); fx.ready = true; }
      const cfg = fx.cfg;
      cfg.wander = 10 + (fx.state.speed / 100) * 30;
      cfg.flow = 2 + (fx.state.turbulence / 100) * 5.5;
      cfg.pull = 0;
      cfg.neighbor = 0.12 + (fx.state.turbulence / 100) * 0.5;
      cfg.beat = 0.35 + (fx.state.speed / 100) * 0.95;
      cfg.drag = 0.9 + (fx.state.trail / 100) * 0.6;
      cfg.maxSpeed = 60 + (fx.state.speed / 100) * 150;
      cfg.nbRadius = 30 + (fx.state.noiseScale / 400) * 34;
      cfg.maxNb = 8;
      cfg.minLife = 5;
      cfg.lifeSpan = 12;
      cfg.zoneBias = 0.2;      // 流场更均匀一些，但仍有密度差
      cfg.spawnSpeed = 18;
      cfg.stateBase = 1.1;
      cfg.memDecay = 1.1;
      fx.env.update(dt, bus, 1.6);
      resizeGrid(fx.grid, fx.width, fx.height, cfg.nbRadius);
      A.ensure(fx.state.count, fx.width, fx.height, fx.env, cfg);
      buildGrid(fx.grid, A);
      stepAgents(A, dt, bus, fx.env, fx.grid, cfg, fx.time);
    },
    render(fx, bus) {
      const { ctx, width: w, height: h } = fx;
      const tc = fx.trailCtx;
      const A = fx.agents;
      // 拖尾：一层淡出，让流线自然连成流动感
      const fade = 0.06 + (1 - fx.state.trail / 100) * 0.35;
      tc.globalCompositeOperation = 'destination-out';
      tc.fillStyle = 'rgba(0,0,0,' + fade.toFixed(3) + ')';
      tc.fillRect(0, 0, w, h);
      tc.globalCompositeOperation = 'lighter';
      for (let i = 0; i < A.count; i++) {
        const depth = A.depth[i];
        const lit = A.energy[i] + A.memBeat[i];
        const size = 0.5 + depth * 1.4 + Math.min(1.2, lit) * 1.1;
        const alpha = (0.14 + depth * 0.3) * (0.6 + Math.min(1.2, lit) * 0.6);
        if (alpha < 0.02) continue;
        tc.fillStyle = 'hsla(' + hueOf(bus, (depth - 0.5) * 90 + bus.phrase * 35) + ', 88%, ' + (58 + depth * 18).toFixed(0) + '%, ' + alpha.toFixed(3) + ')';
        tc.beginPath();
        tc.arc(A.x[i], A.y[i], size, 0, TAU);
        tc.fill();
      }
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(fx.trailCanvas, 0, 0, w, h);
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
      // 三个缓慢漂移的波源：声音在空间里长出结构，而不是绕着屏幕正中画同心圆
      const t = fx.time;
      const sx = [w * (0.5 + Math.sin(t * 0.070) * 0.30), w * (0.5 + Math.cos(t * 0.050 + 2.1) * 0.34), w * (0.5 + Math.sin(t * 0.045 + 4.2) * 0.30)];
      const sy = [h * (0.5 + Math.cos(t * 0.060 + 1.2) * 0.30), h * (0.5 + Math.sin(t * 0.048 + 3.3) * 0.32), h * (0.5 + Math.cos(t * 0.052 + 5.1) * 0.30)];
      const R = Math.min(w, h) * 0.55;
      ctx.globalCompositeOperation = 'lighter';
      for (let r = 4; r <= n; r += 2) {
        const u = r / n;
        const bandIdx = Math.min(bins - 1, Math.round(Math.pow(u, 1.8) * (bins - 1)));
        const amp = bins ? (spec[bandIdx] / 255) : bus.energy * 0.4;
        const energy = Math.pow(amp, 1.25) * react * Math.exp(-u * decay);
        const rad = u * R;
        for (let s = 0; s < 3; s++) {
          ctx.beginPath();
          for (let a = 0; a <= 48; a++) {
            const ang = (a / 48) * TAU;
            // 波的干涉：两种模式叠加 + 噪声扰动，避免出现完美圆环
            const wave = Math.sin(ang * mode + t * 0.3 + s) * 0.6
              + Math.sin(ang * (mode * 2 + 1) - t * 0.17 + s * 1.7) * 0.4
              + noise1(ang * 3.3 + r * 0.7 + s * 13) * 0.35;
            const rr = rad * (1 + wave * energy * 0.42);
            const x = sx[s] + Math.cos(ang) * rr;
            const y = sy[s] + Math.sin(ang) * rr;
            if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = 'hsla(' + hueOf(bus, u * 110 + s * 40) + ', 86%, ' + (62 - u * 12).toFixed(0) + '%, ' + ((0.05 + energy * 0.5) / (1 + s * 0.8)).toFixed(3) + ')';
          ctx.lineWidth = 0.8 + energy * 1.8;
          ctx.stroke();
        }
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
      // 电场：个体之间追逐 / 排斥，靠近到一定程度就发生一次局部放电（连接）
      fx.agents = createAgents(1400);
      fx.env = createEnvironment(4);
      fx.grid = createGrid(1400, 58);
      fx.cfg = {};
      fx.ready = false;
      fx.discharge = new Float32Array(1400);
    },
    update(fx, dt, bus) {
      const A = fx.agents;
      if (!fx.ready) { fx.env.init(fx.width, fx.height); fx.ready = true; }
      const cfg = fx.cfg;
      cfg.wander = 14 + (fx.state.branch / 100) * 26;          // 分叉 → 个体自主性
      cfg.flow = 0.6;
      cfg.pull = 0.9;                                           // 天生想靠近别人
      cfg.neighbor = 1.1 + (fx.state.reactivity / 100) * 2.4;    // 反应强度 → 互相影响有多强
      cfg.beat = 0.5 + (fx.state.reactivity / 100) * 1.6;
      cfg.drag = 0.8 + (fx.state.life / 100) * 1.0;             // 生命周期 → 收得多快
      cfg.maxSpeed = 70 + (fx.state.reactivity / 100) * 130;
      cfg.nbRadius = 60;
      cfg.maxNb = 6;
      cfg.minLife = 6;
      cfg.lifeSpan = 14;
      cfg.zoneBias = 0.4;
      cfg.spawnSpeed = 12;
      cfg.stateBase = 1.0;
      cfg.memDecay = 0.9;
      fx.env.update(dt, bus, 1.2);
      resizeGrid(fx.grid, fx.width, fx.height, cfg.nbRadius);
      A.ensure(Math.min(1400, Math.round(fx.state.arcs) * 60), fx.width, fx.height, fx.env, cfg);
      buildGrid(fx.grid, A);
      stepAgents(A, dt, bus, fx.env, fx.grid, cfg, fx.time);
      // 放电：刚兴奋过、又刚好有邻居的个体，会亮起一条连接（局部放电事件）
      const D = fx.discharge;
      for (let i = 0; i < A.count; i++) {
        D[i] = Math.max(0, D[i] - dt * 2.2);
        if (A.memBeat[i] > 0.55 && A.link[i] >= 0) D[i] = Math.min(1, D[i] + A.memBeat[i] * dt * 6);
      }
    },
    render(fx, bus) {
      const { ctx, width: w, height: h } = fx;
      const A = fx.agents;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      const hueBase = hueOf(bus, -20);
      const D = fx.discharge;
      // 主体是“关系”：个体之间的连接线，而不是一根根孤立的闪电
      for (let i = 0; i < A.count; i++) {
        const j = A.link[i];
        if (j < 0 || j <= i) continue;
        const dx = A.x[j] - A.x[i];
        const dy = A.y[j] - A.y[i];
        const d2 = dx * dx + dy * dy;
        if (d2 > 8100) continue;
        const near = 1 - Math.sqrt(d2) / 90;
        const d = D[i];
        const alpha = (0.05 + near * 0.22 + d * 0.5) * (0.6 + bus.energy * 0.6);
        if (alpha < 0.02) continue;
        ctx.strokeStyle = 'hsla(' + ((hueBase + 40 + near * 60 + 360) % 360) + ', 92%, ' + (66 + d * 18).toFixed(0) + '%, ' + alpha.toFixed(3) + ')';
        ctx.lineWidth = 0.5 + d * 1.8 + near * 0.6;
        ctx.beginPath();
        ctx.moveTo(A.x[i], A.y[i]);
        ctx.lineTo(A.x[j], A.y[j]);
        ctx.stroke();
      }
      // 个体
      for (let i = 0; i < A.count; i++) {
        const lit = A.energy[i] + A.memBeat[i];
        const r = 0.8 + A.depth[i] * 1.6 + Math.min(1.5, lit) * 1.4;
        const a = 0.18 + Math.min(1.4, lit) * 0.5;
        if (a < 0.03) continue;
        ctx.fillStyle = 'hsla(' + ((hueBase + A.depth[i] * 80 + 360) % 360) + ', 92%, 72%, ' + a.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(A.x[i], A.y[i], r, 0, TAU);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  });

  /* ==========================================================================
   * 预设：一条预设 = 一组同时打开的效果（单效果 或 组合）
   * 自动模式会按音乐节拍在这些预设之间随机轮换，切换时淡出淡入，不会突然跳。
   * ==================================================================== */
  const presets = [
    { id: 'organic', labelKey: 'vfxOrganicPulse', effects: ['organicPulse'] },
    { id: 'nebula', labelKey: 'vfxNebula', effects: ['nebula'] },
    { id: 'flow', labelKey: 'vfxFlowField', effects: ['flowField'] },
    { id: 'aurora', labelKey: 'vfxAurora', effects: ['aurora'] },
    { id: 'fluid', labelKey: 'vfxFluid', effects: ['fluid'] },
    { id: 'plasma', labelKey: 'vfxPlasma', effects: ['plasma'] },
    { id: 'cymatics', labelKey: 'vfxCymatics', effects: ['cymatics'] },
    { id: 'electric', labelKey: 'vfxElectricField', effects: ['electricField'] },
    { id: 'nebulaAurora', labelKey: 'vfxPresetNebulaAurora', effects: ['nebula', 'aurora'] },
    { id: 'fluidElectric', labelKey: 'vfxPresetFluidElectric', effects: ['fluid', 'electricField'] },
    { id: 'pulseCymatics', labelKey: 'vfxPresetPulseCymatics', effects: ['organicPulse', 'cymatics'] },
    { id: 'plasmaFlow', labelKey: 'vfxPresetPlasmaFlow', effects: ['plasma', 'flowField'] },
    { id: 'auroraElectric', labelKey: 'vfxPresetAuroraElectric', effects: ['aurora', 'electricField'] },
    { id: 'deepSpace', labelKey: 'vfxPresetDeepSpace', effects: ['nebula', 'plasma', 'cymatics'] }
  ];

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
    let rafId = 0;
    let lastTime = 0;
    let frameMsAvg = 16;
    let cssWidth = 2;
    let cssHeight = 2;
    let renderScale = 1;
    let mode = 'manual';          // manual = 自己勾选；auto = 自动轮换预设
    let presetId = 'manual';      // 当前固定的预设 id
    const auto = { pending: false, nextAt: 0, beatId: 0 };

    registry.forEach((def) => instances.set(def.id, createEffect(def, options)));

    function isRunning(id) {
      const fx = instances.get(id);
      return !!(fx && (fx.enabled || fx.w > 0.05) && sceneActive && windowVisible);
    }

    function notifyScene() {
      if (!options.onSceneChange) return;
      try {
        options.onSceneChange({ mode, preset: presetId });
      } catch (error) { /* 界面同步失败不影响画面 */ }
    }

    /** 打开/关闭某个效果：关闭时先淡出，淡完再真正停（避免画面突然缺一块） */
    function setFxEnabled(fx, on, fade) {
      const next = !!on;
      fx.fadeDur = fade;
      if (next === !!fx.enabled) return;
      fx.enabled = next;
      if (next) {
        fx.create();
        fx.running = true;
        fx.resume();
      }
    }

    function effectIds() {
      const ids = [];
      instances.forEach((fx, id) => { if (fx.enabled) ids.push(id); });
      return ids;
    }

    /** 把「当前开着哪些效果」整体换成 ids（其余淡出），fade 是淡入淡出秒数 */
    function applyEnabledSet(ids, fade) {
      const wanted = new Set(ids);
      instances.forEach((fx, id) => setFxEnabled(fx, wanted.has(id), fade));
      if (sceneActive && windowVisible) start();
    }

    /** 自动模式下每一段停留多久：大约 9~15 秒，并按 BPM 对齐到小节（4 拍） */
    function nextAutoDelay() {
      const base = 9 + Math.random() * 6;
      const bpm = bus.value.bpm;
      if (!bpm || bpm < 50 || bpm > 220) return base * 1000;
      const beatMs = 60000 / bpm;
      const beats = Math.max(8, Math.round((base * 1000) / beatMs / 4) * 4);
      return beats * beatMs;
    }

    /** 随机挑下一条预设（不挑当前这条，避免连着两次一样） */
    function pickRandom(excludeId) {
      const pool = presets.filter((p) => p.id !== excludeId);
      const list = pool.length ? pool : presets;
      return list[Math.floor(Math.random() * list.length)];
    }

    function usePreset(id, fade) {
      const preset = presets.find((p) => p.id === id);
      if (!preset) return false;
      presetId = preset.id;
      applyEnabledSet(preset.effects, fade);
      return true;
    }

    function startAuto() {
      mode = 'auto';
      const next = pickRandom(null);
      presetId = next.id;
      applyEnabledSet(next.effects, 1.6);
      auto.pending = false;
      auto.beatId = bus.value.beatId;
      auto.nextAt = performance.now() + nextAutoDelay();
      notifyScene();
    }

    /**
     * 画布可用的 CSS 尺寸。
     * 取父元素（视觉区容器）的 clientWidth/Height —— 它是整数，而且不受
     * 下面给画布写样式的影响，避免出现「越量越小」的循环。
     */
    function hostBox() {
      const parent = host.parentElement;
      if (parent && parent.clientWidth >= 2 && parent.clientHeight >= 2) {
        return { width: parent.clientWidth, height: parent.clientHeight };
      }
      const rect = host.getBoundingClientRect();
      return { width: Math.max(2, rect.width), height: Math.max(2, rect.height) };
    }

    function resize() {
      const box = hostBox();
      cssWidth = Math.max(2, box.width);
      cssHeight = Math.max(2, box.height);
      // 画质固定为屏幕的物理像素倍率（最高 2 倍）。
      // 这里绝不再「为了帧率把画面降分辨率」——降分辨率正是之前画面发虚的原因。
      renderScale = Math.min(Math.max(window.devicePixelRatio || 1, 1), 2);
      host.width = Math.max(2, Math.round(cssWidth * renderScale));
      host.height = Math.max(2, Math.round(cssHeight * renderScale));
      // 把画布的 CSS 尺寸对齐到整数个物理像素：
      // 否则画布像素和屏幕像素对不齐，浏览器会把整幅画面再重采样一次，边缘和亮部就糊了。
      host.style.width = (host.width / renderScale) + 'px';
      host.style.height = (host.height / renderScale) + 'px';
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
      // 自动模式：到点了就换下一条预设，并且等一个节拍再换，听感上更顺
      if (mode === 'auto') {
        if (!auto.pending && now >= auto.nextAt) auto.pending = true;
        const onBeat = bus.value.beatId !== auto.beatId;
        if (auto.pending && (onBeat || now >= auto.nextAt + 2000)) {
          auto.pending = false;
          usePreset(pickRandom(presetId).id, 1.6);
          auto.nextAt = now + nextAutoDelay();
          notifyScene();
        }
        auto.beatId = bus.value.beatId;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, host.width, host.height);
      let active = 0;
      instances.forEach((fx) => {
        const target = fx.enabled ? 1 : 0;
        if (fx.w !== target) {
          const step = dt / Math.max(0.15, fx.fadeDur || 0.5);
          fx.w = target > fx.w ? Math.min(target, fx.w + step) : Math.max(target, fx.w - step);
        }
        if (fx.w <= 0.005) {
          // 淡出结束才真正停下，画面不会中途被掐掉
          if (!fx.enabled && fx.running) { fx.running = false; fx.pause(); }
          return;
        }
        active++;
        fx.create();
        fx.resize(cssWidth, cssHeight, renderScale);
        fx.update(dt, bus.value);
        fx.render(bus.value);
        ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);
        ctx.globalCompositeOperation = fx.def.blend || 'lighter';
        ctx.globalAlpha = fx.w;
        ctx.drawImage(fx.canvas, 0, 0, cssWidth, cssHeight);
      });
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      frameMsAvg = frameMsAvg * 0.92 + dt * 1000 * 0.08;
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

    // 窗口尺寸变化（用户拖动窗口边界）时立刻重新量一次画布尺寸，
    // 否则画布会被 CSS 拉伸，画面就会发虚。
    const resizeObserver = typeof ResizeObserver === 'function'
      ? new ResizeObserver(() => resize())
      : null;
    if (resizeObserver) resizeObserver.observe(host.parentElement || host);

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
        setFxEnabled(fx, !!enabled, 0.45);
        // 手动改过开关就进入「自定义」，不再挂着某条预设
        mode = 'manual';
        presetId = 'manual';
        if (sceneActive && windowVisible) start();
        notifyScene();
      },
      presets,
      getMode() { return mode; },
      getPreset() { return presetId; },
      /** 自动模式：按节拍在这些预设里随机轮换（可传 true/false） */
      setAuto(on) {
        if (on) {
          if (mode === 'auto') return;
          startAuto();
        } else {
          mode = 'manual';
          presetId = 'manual';
          applyEnabledSet(effectIds(), 0.6);
          notifyScene();
        }
      },
      /** 固定选一条预设（单效果或组合） */
      setPreset(id) {
        if (!usePreset(id, 1.2)) return;
        mode = 'manual';
        notifyScene();
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
        out.mode = mode;
        out.preset = presetId;
        return out;
      },
      applyState(state) {
        if (!state || typeof state !== 'object') return;
        Object.keys(state).forEach((id) => {
          if (id === 'mode' || id === 'preset') return;
          const fx = instances.get(id);
          if (!fx) return;
          const s = state[id] || {};
          fx.enabled = !!s.enabled;
          Object.keys(s.params || {}).forEach((k) => {
            if (fx.state[k] !== undefined) fx.state[k] = s.params[k];
          });
        });
        mode = state.mode === 'auto' ? 'auto' : 'manual';
        presetId = typeof state.preset === 'string' ? state.preset : 'manual';
        // 启动时直接显示，不做淡入（避免刚打开软件时画面是空的）
        instances.forEach((fx) => { fx.w = fx.enabled ? 1 : 0; fx.fadeDur = 0.5; });
        if (mode === 'auto') {
          auto.pending = false;
          auto.beatId = bus.value.beatId;
          auto.nextAt = performance.now() + nextAutoDelay();
        }
        notifyScene();
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
        if (resizeObserver) resizeObserver.disconnect();
        stop();
        instances.forEach((fx) => fx.destroy());
      }
    };
  }

  window.RlonVisualEngine = { create, createBus, registry, presets };
})();
