/*
 * RlonDSP
 * Copyright © 2026 RlonDSP. All rights reserved.
 * Based on Echomusic open-source project, modified and extended for RlonDSP.
 */
const api = window.rlonDsp;

const I18N = {
  zh: {
    importFiles: '导入文件',
    importFolder: '导入文件夹',
    searchPlaceholder: '搜索歌曲',
    themeSystem: '跟随系统',
    themeLight: '浅色',
    themeDark: '深色',
    playlist: '播放列表',
    sortDefault: '默认排序',
    sortTitle: '按标题',
    sortArtist: '按歌手',
    sortDuration: '按时长',
    clear: '清空',
    noTrack: '未播放',
    noLyrics: '暂无歌词',
    soundEffects: '实时音效',
    pulseFeedback: '脉冲反馈',
    reset: '重置',
    preset: '预设',
    save: '保存',
    delete: '删除',
    export: '导出',
    import: '导入',
    equalizer: '均衡器',
    masterGain: '总增益',
    compressor: '压缩器',
    bassBoost: '低音增强',
    stereoWide: '立体声增强',
    virtualSurround: '虚拟环绕',
    clarity: '清晰度增强',
    ultrasonic: '超高频净化',
    tube: '胆机模拟',
    reverb: '混响',
    noiseGate: '降噪',
    limiter: '限幅',
    threshold: '阈值',
    ratio: '压缩比',
    attack: '启动',
    release: '释放',
    bassGain: '增益',
    crossover: '分频点',
    width: '宽度',
    roomSize: '空间感',
    strength: '强度',
    drive: '驱动',
    reverbTime: '混响时间',
    damping: '高频阻尼',
    wet: '湿声比例',
    predelay: '预延迟',
    ceiling: '上限',
    settings: '设置',
    theme: '主题',
    language: '语言',
    outputDevice: '输出设备',
    closeToTray: '关闭时最小化到托盘',
    toastImported: '已导入歌曲',
    toastLoading: '正在读取音乐信息…',
    toastPresetSaved: '预设已保存',
    toastPresetDeleted: '预设已删除',
    toastPresetExported: '预设已导出',
    toastPresetImported: '预设已导入',
    toastReset: '音效已重置',
    toastNoPreset: '请先选择或命名预设',
    toastNoTrack: '请先导入本地音乐',
    toastUnsupported: '该文件格式暂不支持，可尝试转换后导入',
    about: '关于 RlonDSP',
    upstreamProject: '上游项目：Echomusic',
    thirdParty: '第三方依赖',
    license: '许可证',
    viewLicense: '查看许可证',
    thanks: '感谢所有开源项目、贡献者与社区的支持。',
    playbackMode: '播放模式',
    play: '播放',
    pause: '暂停',
    mute: '静音',
    unmute: '取消静音',
    vizAnalyzer: '频谱分析仪',
    vizScope: '示波器',
    vizPolar: '极坐标声场',
    vizLoudness: '响度历史',
    vizArc: '弧形电平表',
    vizOctave: '倍频程频段',
    vizPhase: '相位分析',
    vizDynamics: '动态范围',
    vizCentroid: '频谱质心',
    vizEvents: '事件检测',
    irsSection: 'IRS 空间音效',
    loadPulse: '加载脉冲',
    pulseClear: '清除',
    audition: '试听',
    highpass: '高通',
    lowpass: '低通',
    noPulse: '未加载脉冲',
    bandLow: '低频',
    bandLowMid: '中低频',
    bandMid: '中频',
    bandHighMid: '中高频',
    bandHigh: '高频',
    phaseWidth: '宽度',
    phaseOk: '相位正常',
    phaseInv: '相位反转',
    statInt: '整体响度',
    statPeak: '峰值',
    statDr: '动态',
    statDistort: '失真',
    toneDark: '偏暗',
    toneBright: '偏亮',
    evBeat: '节拍',
    evBass: '低频',
    evVocal: '人声',
    evHigh: '高频',
    evOverload: '过载',
    enable: '启用'
  },
  en: {
    importFiles: 'Import Files',
    importFolder: 'Import Folder',
    searchPlaceholder: 'Search tracks',
    themeSystem: 'System',
    themeLight: 'Light',
    themeDark: 'Dark',
    playlist: 'Playlist',
    sortDefault: 'Default',
    sortTitle: 'Title',
    sortArtist: 'Artist',
    sortDuration: 'Duration',
    clear: 'Clear',
    noTrack: 'Nothing Playing',
    noLyrics: 'No lyrics',
    soundEffects: 'Real-time Effects',
    pulseFeedback: 'Pulse Feedback',
    reset: 'Reset',
    preset: 'Presets',
    save: 'Save',
    delete: 'Delete',
    export: 'Export',
    import: 'Import',
    equalizer: 'Equalizer',
    masterGain: 'Master Gain',
    compressor: 'Compressor',
    bassBoost: 'Bass Boost',
    stereoWide: 'Stereo Wide',
    virtualSurround: 'Virtual Surround',
    clarity: 'Clarity',
    ultrasonic: 'Ultrasonic Clean',
    tube: 'Tube Saturation',
    reverb: 'Reverb',
    noiseGate: 'Noise Gate',
    limiter: 'Limiter',
    threshold: 'Threshold',
    ratio: 'Ratio',
    attack: 'Attack',
    release: 'Release',
    bassGain: 'Gain',
    crossover: 'Crossover',
    width: 'Width',
    roomSize: 'Space',
    strength: 'Strength',
    drive: 'Drive',
    reverbTime: 'Decay',
    damping: 'Damping',
    wet: 'Wet',
    predelay: 'Pre-delay',
    ceiling: 'Ceiling',
    settings: 'Settings',
    theme: 'Theme',
    language: 'Language',
    outputDevice: 'Output Device',
    closeToTray: 'Close to tray',
    toastImported: 'Tracks imported',
    toastLoading: 'Reading track info…',
    toastPresetSaved: 'Preset saved',
    toastPresetDeleted: 'Preset deleted',
    toastPresetExported: 'Preset exported',
    toastPresetImported: 'Preset imported',
    toastReset: 'Effects reset',
    toastNoPreset: 'Select or name a preset first',
    toastNoTrack: 'Import local music first',
    toastUnsupported: 'This format is not supported, please convert it first',
    about: 'About RlonDSP',
    upstreamProject: 'Upstream: Echomusic',
    thirdParty: 'Third-party dependencies',
    license: 'License',
    viewLicense: 'View License',
    thanks: 'Thanks to all open-source projects, contributors, and the community.',
    playbackMode: 'Playback Mode',
    play: 'Play',
    pause: 'Pause',
    mute: 'Mute',
    unmute: 'Unmute',
    vizAnalyzer: 'Spectrum Analyzer',
    vizScope: 'Oscilloscope',
    vizPolar: 'Polar Field',
    vizLoudness: 'Loudness History',
    vizArc: 'Arc Meter',
    vizOctave: 'Octave Bands',
    vizPhase: 'Phase Analysis',
    vizDynamics: 'Dynamics',
    vizCentroid: 'Spectral Centroid',
    vizEvents: 'Events',
    irsSection: 'IRS Spatial',
    loadPulse: 'Load Pulse',
    pulseClear: 'Clear',
    audition: 'Audition',
    highpass: 'High-pass',
    lowpass: 'Low-pass',
    noPulse: 'No pulse loaded',
    bandLow: 'LOW',
    bandLowMid: 'LMID',
    bandMid: 'MID',
    bandHighMid: 'HMID',
    bandHigh: 'HIGH',
    phaseWidth: 'WIDTH',
    phaseOk: 'PHASE OK',
    phaseInv: 'PHASE INV',
    statInt: 'INT',
    statPeak: 'PEAK',
    statDr: 'DR',
    statDistort: 'DISTORT',
    toneDark: 'DARK',
    toneBright: 'BRIGHT',
    evBeat: 'BEAT',
    evBass: 'BASS',
    evVocal: 'VOCAL',
    evHigh: 'HIGH FREQ',
    evOverload: 'OVERLOAD',
    enable: 'Enable'
  }
};

const defaultEffects = {
  masterGain: 0,
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
  compressor: { thresholdDB: -24, ratio: 4, attackMs: 10, releaseMs: 120 },
  bass: { gainDB: 6, crossoverHz: 80 },
  stereo: { width: 0.5 },
  surround: { roomSize: 1 },
  clarity: { strength: 0.5 },
  tube: { drive: 0.3 },
  reverb: { roomSize: 1, t60: 2.6, damping: 0.55, wet: 0.32, predelay: 0.02 },
  gate: { threshold: -52, releaseMs: 180 },
  limiter: { ceilingDB: -1 },
  ir: { enabled: false, filePath: '', wet: 0.35, predelay: 0.02, highpass: 20, lowpass: 20000, ab: false }
};

const state = {
  tracks: [],
  currentIndex: -1,
  mode: 'list',
  volume: 0.8,
  muted: false,
  settings: {
    language: 'zh',
    theme: 'system',
    volume: 0.8,
    closeToTray: true,
    desktopLyrics: false,
    outputDeviceId: '',
    playbackMode: 'list'
  },
  favorites: new Set(),
  presets: [],
  effects: deepClone(defaultEffects),
  visual: {
    fftSize: 2048,
    logScale: true,
    smoothing: 0.78
  },
  lyrics: [],
  lyricsIndex: -1,
  currentTrack: null,
  isPlaying: false,
  loading: false
};

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

const warnedMissingIds = new Set();

function $(id) {
  const el = document.getElementById(id);
  if (!el && !warnedMissingIds.has(id)) {
    warnedMissingIds.add(id);
    console.warn('[RlonDSP] 缺少界面元素，已跳过:', id);
  }
  return el;
}

// 安全绑定：元素不存在时静默跳过，避免一处缺失导致整段绑定中断
function on(id, type, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(type, handler);
}

// 安全执行：单块界面同步出错时只记录提醒，不影响程序其余部分
function safeRun(label, fn) {
  try {
    fn();
  } catch (error) {
    console.warn('[RlonDSP] 已跳过:', label, error && error.message);
  }
}

async function safeRunAsync(label, fn) {
  try {
    await fn();
  } catch (error) {
    console.warn('[RlonDSP] 已跳过:', label, error && error.message);
  }
}

function t(key) {
  return (I18N[state.settings.language] || I18N.zh)[key] || key;
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const s = Math.floor(seconds % 60);
  const m = Math.floor(seconds / 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function applyLanguage(lang) {
  state.settings.language = lang || state.settings.language;
  document.documentElement.lang = state.settings.language === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  renderPlaylist();
  updateNowPlaying();
  updateLyricsDisplay();
  syncStudioTheme();
}

function applyTheme(theme) {
  const resolved = theme || state.settings.theme;
  const isDark = resolved === 'dark' || (resolved === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  refreshAccent();
  syncStudioTheme();
  const label = resolved === 'system' ? t('themeSystem') : resolved === 'dark' ? t('themeDark') : t('themeLight');
  $('themeSelect').value = resolved;
}

function syncStudioTheme() {
  const frame = document.getElementById('irStudioFrame');
  if (frame && frame.contentWindow) {
    frame.contentWindow.postMessage({
      type: 'rlondsp-theme',
      theme: document.documentElement.dataset.theme || 'light',
      lang: state.settings.language || 'zh'
    }, '*');
  }
}

function toggleMiniMode() {
  document.body.classList.toggle('mini-mode');
  api.toggleMini();
}

function updateModeButton() {
  const icon = $('modeBtnIcon');
  if (!icon) return;
  const map = { list: '#icon-loop-list', single: '#icon-loop-single', random: '#icon-loop-random' };
  icon.setAttribute('href', map[state.mode] || '#icon-loop-list');
  $('modeBtn').title = t('playbackMode');
}

function cycleMode() {
  if (state.mode === 'list') state.mode = 'single';
  else if (state.mode === 'single') state.mode = 'random';
  else state.mode = 'list';
  state.settings.playbackMode = state.mode;
  api.setSettings({ playbackMode: state.mode });
  updateModeButton();
}

function setCurrentIndex(index) {
  state.currentIndex = index;
  state.currentTrack = state.tracks[index] || null;
  updateNowPlaying();
  renderPlaylist();
  loadLyricsForCurrent();
  if (state.currentTrack) {
    api.addHistory({ path: state.currentTrack.path, title: state.currentTrack.title, artist: state.currentTrack.artist });
  }
}

function updateNowPlaying() {
  const track = state.currentTrack;
  $('playerTitle').textContent = track ? track.title : t('noTrack');
  $('playerArtist').textContent = track ? (track.artist || '') : '';
  $('totalTime').textContent = track && track.duration ? formatTime(track.duration) : '0:00';
  if (track && track.cover) {
    $('miniCover').innerHTML = `<img alt="" src="${track.cover}">`;
  } else {
    $('miniCover').innerHTML = `<svg class="icon icon-lg"><use href="#icon-note"></use></svg>`;
  }
}

function renderPlaylist() {
  const list = $('trackList');
  list.innerHTML = '';
  const query = ($('playlistSearch').value || '').trim().toLowerCase();
  let tracks = state.tracks.filter((track) => {
    if (!query) return true;
    return `${track.title} ${track.artist} ${track.album}`.toLowerCase().includes(query);
  });
  const sort = $('sortSelect').value;
  if (sort === 'title') tracks = [...tracks].sort((a, b) => a.title.localeCompare(b.title));
  else if (sort === 'artist') tracks = [...tracks].sort((a, b) => (a.artist || '').localeCompare(b.artist || ''));
  else if (sort === 'duration') tracks = [...tracks].sort((a, b) => (a.duration || 0) - (b.duration || 0));

  tracks.forEach((track) => {
    const originalIndex = state.tracks.indexOf(track);
    const li = document.createElement('li');
    li.className = 'track-item' + (originalIndex === state.currentIndex ? ' active' : '');
    li.dataset.index = String(originalIndex);
    li.innerHTML = `
      <span class="track-num">${originalIndex + 1}</span>
      <span class="track-main">
        <span class="track-title"></span>
        <span class="track-artist"></span>
      </span>
      <span class="track-time">${formatTime(track.duration || 0)}</span>
      <button class="track-heart ${state.favorites.has(track.path) ? 'fav' : ''}" data-index="${originalIndex}" title="收藏">♥</button>
    `;
    li.querySelector('.track-title').textContent = track.title;
    li.querySelector('.track-artist').textContent = track.artist || track.album || '';
    li.addEventListener('click', (event) => {
      if (event.target.classList.contains('track-heart')) return;
      playTrack(originalIndex);
    });
    li.addEventListener('dblclick', () => playTrack(originalIndex));
    list.appendChild(li);
  });
  $('trackCount').textContent = String(state.tracks.length);
}

function toggleFavorite(index) {
  const track = state.tracks[index];
  if (!track) return;
  if (state.favorites.has(track.path)) state.favorites.delete(track.path);
  else state.favorites.add(track.path);
  api.setFavorites([...state.favorites]);
  renderPlaylist();
}

async function readMetadataForPath(filePath) {
  return api.readMetadata(filePath);
}

async function addPaths(paths) {
  const unique = [...new Set(paths.filter(Boolean))];
  const existing = new Set(state.tracks.map((track) => track.path));
  const fresh = unique.filter((path) => !existing.has(path));
  if (!fresh.length) return;
  state.loading = true;
  showToast(t('toastLoading'));
  const concurrency = 8;
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, fresh.length) }, async () => {
    while (cursor < fresh.length) {
      const index = cursor++;
      const filePath = fresh[index];
      const meta = await readMetadataForPath(filePath);
      state.tracks.push(meta);
      if (state.tracks.length % 5 === 0 || index === fresh.length - 1) renderPlaylist();
    }
  });
  await Promise.all(workers);
  state.loading = false;
  renderPlaylist();
  showToast(t('toastImported'));
}

async function importFiles() {
  const files = await api.openFiles();
  await addPaths(files);
}

async function importFolder() {
  const folder = await api.openFolder();
  if (!folder) return;
  const files = await api.scanFolder(folder);
  await addPaths(files);
}

function playTrack(index) {
  if (index < 0 || index >= state.tracks.length) return;
  setCurrentIndex(index);
  const track = state.tracks[index];
  ensureAudioGraph().then(() => {
    if (audioElement.src !== api.toFileUrl(track.path)) {
      audioElement.src = api.toFileUrl(track.path);
    }
    audioElement.play().catch((error) => {
      console.error('Playback failed', error);
      showToast(t('toastUnsupported'));
    });
  });
}

function playNext(automatic = false) {
  if (!state.tracks.length) return;
  let next = state.currentIndex + 1;
  if (state.mode === 'random') {
    next = Math.floor(Math.random() * state.tracks.length);
  } else if (state.mode === 'single' && automatic) {
    next = state.currentIndex;
  } else if (next >= state.tracks.length) {
    next = 0;
  }
  playTrack(next);
}

function playPrevious() {
  if (!state.tracks.length) return;
  let prev = state.currentIndex - 1;
  if (prev < 0) prev = state.tracks.length - 1;
  playTrack(prev);
}

function togglePlay() {
  if (!state.currentTrack) {
    if (state.tracks.length) playTrack(0);
    else showToast(t('toastNoTrack'));
    return;
  }
  ensureAudioGraph().then(() => {
    if (audioElement.paused) audioElement.play();
    else audioElement.pause();
  });
}

function setPlayButton(playing) {
  state.isPlaying = playing;
  const icon = $('playBtnIcon');
  if (icon) icon.setAttribute('href', playing ? '#icon-pause' : '#icon-play');
  $('playBtn').title = playing ? t('pause') || '暂停' : t('play') || '播放';
  // 恢复播放时立即恢复频谱渲染
  if (playing) startVisualizerLoop();
}

function seekTo(ratio) {
  if (!audioElement || !Number.isFinite(audioElement.duration)) return;
  audioElement.currentTime = ratio * audioElement.duration;
}

function setVolume(value) {
  state.volume = value;
  if (audioElement) audioElement.volume = value;
  $('volume').value = String(Math.round(value * 100));
  api.setSettings({ volume: value });
}

function toggleMute() {
  state.muted = !state.muted;
  if (audioElement) audioElement.muted = state.muted;
  const icon = $('muteBtnIcon');
  if (icon) icon.setAttribute('href', state.muted ? '#icon-mute' : '#icon-volume');
  $('muteBtn').title = state.muted ? t('unmute') || '取消静音' : t('mute') || '静音';
}

function clearPlaylist() {
  state.tracks = [];
  state.currentIndex = -1;
  state.currentTrack = null;
  if (audioElement) {
    audioElement.pause();
    audioElement.removeAttribute('src');
    audioElement.load();
  }
  renderPlaylist();
  updateNowPlaying();
  setPlayButton(false);
}

function sortPlaylist() {
  renderPlaylist();
}

function collectEffects() {
  return deepClone(state.effects);
}

function applyEffectsToUI() {
  safeRun('音效面板同步', applyEffectsToUIRaw);
}

function applyEffectsToUIRaw() {
  const fx = state.effects;
  $('masterGain').value = String(Math.round(fx.masterGain * 10));
  $('masterGainVal').textContent = `${fx.masterGain.toFixed(1)} dB`;
  document.querySelectorAll('.eq-band input').forEach((slider, index) => {
    slider.value = String(Math.round(fx.eqGains[index] * 10));
    slider.parentElement.querySelector('.eq-db').textContent = `${fx.eqGains[index].toFixed(1)} dB`;
  });
  $('fxCompressor').checked = fx.enabled.compressor;
  $('fxBass').checked = fx.enabled.bass;
  $('fxStereo').checked = fx.enabled.stereo;
  $('fxSurround').checked = fx.enabled.surround;
  $('fxClarity').checked = fx.enabled.clarity;
  $('fxUltrasonic').checked = fx.enabled.ultrasonic;
  $('fxTube').checked = fx.enabled.tube;
  $('fxReverb').checked = fx.enabled.reverb;
  $('fxNoiseGate').checked = fx.enabled.noiseGate;
  $('fxLimiter').checked = fx.enabled.limiter;
  $('compThreshold').value = String(fx.compressor.thresholdDB);
  $('compThresholdVal').textContent = `${fx.compressor.thresholdDB} dB`;
  $('compRatio').value = String(fx.compressor.ratio);
  $('compRatioVal').textContent = `${fx.compressor.ratio.toFixed(1)}:1`;
  $('compAttack').value = String(fx.compressor.attackMs);
  $('compAttackVal').textContent = `${fx.compressor.attackMs} ms`;
  $('compRelease').value = String(fx.compressor.releaseMs);
  $('compReleaseVal').textContent = `${fx.compressor.releaseMs} ms`;
  $('bassGain').value = String(Math.round(fx.bass.gainDB * 10));
  $('bassGainVal').textContent = `+${fx.bass.gainDB.toFixed(1)} dB`;
  $('bassCrossover').value = String(fx.bass.crossoverHz);
  $('stereoWidth').value = String(Math.round(fx.stereo.width * 100));
  $('stereoWidthVal').textContent = fx.stereo.width.toFixed(2);
  $('surroundRoom').value = String(Math.round(fx.surround.roomSize * 100));
  $('surroundRoomVal').textContent = fx.surround.roomSize.toFixed(2);
  $('clarityStrength').value = String(Math.round(fx.clarity.strength * 100));
  $('clarityStrengthVal').textContent = fx.clarity.strength.toFixed(2);
  $('tubeDrive').value = String(Math.round(fx.tube.drive * 100));
  $('tubeDriveVal').textContent = fx.tube.drive.toFixed(2);
  $('revTime').value = String(Math.round(fx.reverb.t60 * 100));
  $('revTimeVal').textContent = `${fx.reverb.t60.toFixed(2)} s`;
  $('revDamping').value = String(Math.round(fx.reverb.damping * 100));
  $('revDampingVal').textContent = fx.reverb.damping.toFixed(2);
  $('revWet').value = String(Math.round(fx.reverb.wet * 100));
  $('revWetVal').textContent = fx.reverb.wet.toFixed(2);
  $('revPredelay').value = String(Math.round(fx.reverb.predelay * 100));
  $('revPredelayVal').textContent = `${fx.reverb.predelay.toFixed(2)} s`;
  $('revRoom').value = String(Math.round(fx.reverb.roomSize * 100));
  $('revRoomVal').textContent = fx.reverb.roomSize.toFixed(2);
  $('gateThreshold').value = String(fx.gate.threshold);
  $('gateThresholdVal').textContent = `${fx.gate.threshold} dB`;
  $('gateRelease').value = String(fx.gate.releaseMs);
  $('gateReleaseVal').textContent = `${fx.gate.releaseMs} ms`;
  $('limiterCeiling').value = String(fx.limiter.ceilingDB);
  $('limiterCeilingVal').textContent = `${fx.limiter.ceilingDB.toFixed(1)} dB`;
  $('fxIR').checked = fx.ir.enabled;
  $('irWet').value = String(Math.round(fx.ir.wet * 100));
  $('irWetVal').textContent = fx.ir.wet.toFixed(2);
  $('irPredelay').value = String(Math.round(fx.ir.predelay * 100));
  $('irPredelayVal').textContent = `${fx.ir.predelay.toFixed(2)} s`;
  $('irHighpass').value = String(fx.ir.highpass);
  $('irHighpassVal').textContent = `${fx.ir.highpass} Hz`;
  $('irLowpass').value = String(fx.ir.lowpass);
  $('irLowpassVal').textContent = `${fx.ir.lowpass} Hz`;
  $('irName').textContent = fx.ir.filePath ? fx.ir.filePath.split(/[\\/]/).pop() : t('noPulse');
}

function sendDSPParams() {
  if (dspNode) {
    dspNode.port.postMessage({ type: 'params', params: collectEffects() });
  }
}

function updateEffectsFromUI() {
  safeRun('音效参数读取', updateEffectsFromUIRaw);
}

function updateEffectsFromUIRaw() {
  const fx = state.effects;
  fx.masterGain = Number($('masterGain').value) / 10;
  fx.eqGains = Array.from(document.querySelectorAll('.eq-band input')).map((el) => Number(el.value) / 10);
  fx.enabled.compressor = $('fxCompressor').checked;
  fx.enabled.bass = $('fxBass').checked;
  fx.enabled.stereo = $('fxStereo').checked;
  fx.enabled.surround = $('fxSurround').checked;
  fx.enabled.clarity = $('fxClarity').checked;
  fx.enabled.ultrasonic = $('fxUltrasonic').checked;
  fx.enabled.tube = $('fxTube').checked;
  fx.enabled.reverb = $('fxReverb').checked;
  fx.enabled.noiseGate = $('fxNoiseGate').checked;
  fx.enabled.limiter = $('fxLimiter').checked;
  fx.compressor.thresholdDB = Number($('compThreshold').value);
  fx.compressor.ratio = Number($('compRatio').value);
  fx.compressor.attackMs = Number($('compAttack').value);
  fx.compressor.releaseMs = Number($('compRelease').value);
  fx.bass.gainDB = Number($('bassGain').value) / 10;
  fx.bass.crossoverHz = Number($('bassCrossover').value);
  fx.stereo.width = Number($('stereoWidth').value) / 100;
  fx.surround.roomSize = Number($('surroundRoom').value) / 100;
  fx.clarity.strength = Number($('clarityStrength').value) / 100;
  fx.tube.drive = Number($('tubeDrive').value) / 100;
  fx.reverb.t60 = Number($('revTime').value) / 100;
  fx.reverb.damping = Number($('revDamping').value) / 100;
  fx.reverb.wet = Number($('revWet').value) / 100;
  fx.reverb.predelay = Number($('revPredelay').value) / 100;
  fx.reverb.roomSize = Number($('revRoom').value) / 100;
  fx.gate.threshold = Number($('gateThreshold').value);
  fx.gate.releaseMs = Number($('gateRelease').value);
  fx.limiter.ceilingDB = Number($('limiterCeiling').value);
  fx.ir.enabled = $('fxIR').checked;
  fx.ir.wet = Number($('irWet').value) / 100;
  fx.ir.predelay = Number($('irPredelay').value) / 100;
  fx.ir.highpass = Number($('irHighpass').value);
  fx.ir.lowpass = Number($('irLowpass').value);
  applyEffectsToUI();
  sendDSPParams();
  updateIRGraph();
}

function bindEffectInputs() {
  safeRun('音效控件绑定', bindEffectInputsRaw);
}

function bindEffectInputsRaw() {
  const valueBindings = {
    masterGain: () => `${(Number($('masterGain').value) / 10).toFixed(1)} dB`,
    compThreshold: () => `${$('compThreshold').value} dB`,
    compRatio: () => `${(Number($('compRatio').value)).toFixed(1)}:1`,
    compAttack: () => `${$('compAttack').value} ms`,
    compRelease: () => `${$('compRelease').value} ms`,
    bassGain: () => `+${(Number($('bassGain').value) / 10).toFixed(1)} dB`,
    stereoWidth: () => (Number($('stereoWidth').value) / 100).toFixed(2),
    surroundRoom: () => (Number($('surroundRoom').value) / 100).toFixed(2),
    clarityStrength: () => (Number($('clarityStrength').value) / 100).toFixed(2),
    tubeDrive: () => (Number($('tubeDrive').value) / 100).toFixed(2),
    revTime: () => `${(Number($('revTime').value) / 100).toFixed(2)} s`,
    revDamping: () => (Number($('revDamping').value) / 100).toFixed(2),
    revWet: () => (Number($('revWet').value) / 100).toFixed(2),
    revPredelay: () => `${(Number($('revPredelay').value) / 100).toFixed(2)} s`,
    revRoom: () => (Number($('revRoom').value) / 100).toFixed(2),
    gateThreshold: () => `${$('gateThreshold').value} dB`,
    gateRelease: () => `${$('gateRelease').value} ms`,
    limiterCeiling: () => `${(Number($('limiterCeiling').value)).toFixed(1)} dB`,
    irWet: () => (Number($('irWet').value) / 100).toFixed(2),
    irPredelay: () => `${(Number($('irPredelay').value) / 100).toFixed(2)} s`,
    irHighpass: () => `${$('irHighpass').value} Hz`,
    irLowpass: () => `${$('irLowpass').value} Hz`
  };
  Object.entries(valueBindings).forEach(([id, formatter]) => {
    const el = $(id);
    const out = $(`${id}Val`);
    if (el && out) el.addEventListener('input', () => { out.textContent = formatter(); updateEffectsFromUI(); });
  });
  document.querySelectorAll('.switches-grid input[type="checkbox"]').forEach((el) => el.addEventListener('change', updateEffectsFromUI));
  $('fxIR').addEventListener('change', updateEffectsFromUI);
}

function buildEQ() {
  const container = $('eqBands');
  container.innerHTML = '';
  const freqs = [60, 120, 250, 500, 1000, 2000, 4000, 8000, 12000, 16000];
  freqs.forEach((freq, index) => {
    const band = document.createElement('div');
    band.className = 'eq-band';
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '-120';
    slider.max = '120';
    slider.step = '1';
    slider.value = '0';
    slider.addEventListener('input', () => {
      band.querySelector('.eq-db').textContent = `${(Number(slider.value) / 10).toFixed(1)} dB`;
      updateEffectsFromUI();
    });
    const db = document.createElement('span');
    db.className = 'eq-db';
    db.textContent = '0.0 dB';
    const label = document.createElement('span');
    label.className = 'eq-freq';
    label.textContent = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
    band.append(slider, db, label);
    container.appendChild(band);
  });
}

function resetEffects() {
  state.effects = deepClone(defaultEffects);
  applyEffectsToUI();
  sendDSPParams();
  showToast(t('toastReset'));
}

async function loadPresets() {
  state.presets = await api.listPresets();
  renderPresets();
}

function renderPresets() {
  const select = $('presetSelect');
  select.innerHTML = '<option value="">--</option>';
  state.presets.filter((preset) => preset.type !== 'pulse').forEach((preset) => {
    const option = document.createElement('option');
    option.value = preset.id;
    option.textContent = preset.name || preset.id;
    select.appendChild(option);
  });
  renderPulseList();
}

function currentPresetId() {
  return $('presetSelect').value;
}

async function savePreset() {
  const name = prompt(state.settings.language === 'zh' ? '输入预设名称' : 'Enter preset name', '我的预设');
  if (!name) return;
  const preset = {
    id: `preset-${Date.now()}`,
    name,
    effects: collectEffects(),
    updatedAt: Date.now()
  };
  state.presets = await api.savePreset(preset);
  renderPresets();
  $('presetSelect').value = preset.id;
  showToast(t('toastPresetSaved'));
}

async function deletePreset() {
  const id = currentPresetId();
  if (!id) {
    showToast(t('toastNoPreset'));
    return;
  }
  state.presets = await api.deletePreset(id);
  renderPresets();
  showToast(t('toastPresetDeleted'));
}

async function exportPreset() {
  const id = currentPresetId();
  if (!id) {
    showToast(t('toastNoPreset'));
    return;
  }
  const preset = state.presets.find((item) => item.id === id);
  if (!preset) return;
  await api.exportPreset(preset);
  showToast(t('toastPresetExported'));
}

async function importPreset() {
  const preset = await api.importPreset();
  if (!preset || !preset.effects) return;
  preset.id = `preset-${Date.now()}`;
  preset.name = preset.name || '导入预设';
  state.presets = await api.savePreset(preset);
  renderPresets();
  $('presetSelect').value = preset.id;
  applyPreset(preset);
  showToast(t('toastPresetImported'));
}

function applyPreset(preset) {
  if (!preset || !preset.effects) return;
  state.effects = deepClone(defaultEffects);
  Object.assign(state.effects, preset.effects);
  state.effects.enabled = { ...state.effects.enabled, ...(preset.effects.enabled || {}) };
  applyEffectsToUI();
  sendDSPParams();
}

function parseLRC(text) {
  const lines = [];
  text.split(/\r?\n/).forEach((line) => {
    const match = line.match(/\[(\d{1,2}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g);
    if (!match) return;
    const content = line.replace(/\[[^\]]*\]/g, '').trim();
    match.forEach((tag) => {
      const timeMatch = tag.match(/\[(\d{1,2}):(\d{1,2})(?:[.:](\d{1,3}))?\]/);
      const minutes = Number(timeMatch[1]);
      const seconds = Number(timeMatch[2]);
      const fraction = timeMatch[3] ? Number(`0.${timeMatch[3]}`) : 0;
      lines.push({ time: minutes * 60 + seconds + fraction, text: content || '' });
    });
  });
  lines.sort((a, b) => a.time - b.time);
  return lines;
}

async function loadLyricsForCurrent() {
  state.lyrics = [];
  state.lyricsIndex = -1;
  if (!state.currentTrack) {
    $('lyricsLine').textContent = t('noLyrics');
    sendLyricsToDesktop(null);
    return;
  }
  const text = await api.readLyrics(state.currentTrack.path);
  if (text) state.lyrics = parseLRC(text);
  updateLyricsDisplay();
}

function updateLyricsDisplay(currentTime = audioElement ? audioElement.currentTime : 0) {
  if (!state.lyrics.length) {
    $('lyricsLine').textContent = t('noLyrics');
    return;
  }
  let index = -1;
  for (let i = 0; i < state.lyrics.length; i++) {
    if (state.lyrics[i].time <= currentTime) index = i;
    else break;
  }
  state.lyricsIndex = index;
  const current = index >= 0 ? state.lyrics[index].text : '';
  const next = index + 1 < state.lyrics.length ? state.lyrics[index + 1].text : '';
  $('lyricsLine').textContent = current || (index < 0 && state.lyrics[0] ? state.lyrics[0].text : t('noLyrics'));
  if (state.settings.desktopLyrics) {
    sendLyricsToDesktop({ current, next, active: index, total: state.lyrics.length, lang: state.settings.language });
  }
}

function sendLyricsToDesktop(payload) {
  api.updateLyrics(payload);
}

function toggleDesktopLyrics() {
  state.settings.desktopLyrics = !state.settings.desktopLyrics;
  api.setSettings({ desktopLyrics: state.settings.desktopLyrics });
  if (state.settings.desktopLyrics) {
    api.showLyrics();
    sendLyricsToDesktop({ lang: state.settings.language });
    updateLyricsDisplay();
  } else {
    api.hideLyrics();
  }
}

let audioElement = null;
let audioContext = null;
let sourceNode = null;
let dspNode = null;
let analyser = null;
let dryGainNode = null;
let wetGainNode = null;
let irDelayNode = null;
let irHighpassNode = null;
let irLowpassNode = null;
let convolverNode = null;

const ANALYZER_BARS = 72;
const LUFS_K = -0.691;

let freqData = null;
let freqFloatData = null;
let timeData = null;
let monoData = null;
let analyzerPeak = null;
let curvePeak = null;

let loudMomentary = null;
let loudShort = null;
let loudMomentarySum = 0;
let loudShortSum = 0;
let loudMomentaryCount = 0;
let loudShortCount = 0;
let loudMomentaryHead = 0;
let loudShortHead = 0;
let loudIntegratedSum = 0;
let loudIntegratedCount = 0;
let loudTruePeak = 0;

let cachedAccent = '#6f92ff';
let cachedAccent2 = '#9b82ff';
let cachedText = '#1d222c';
let cachedMuted = '#6d7483';
let cachedLine = 'rgba(0, 0, 0, 0.08)';
let animationFrame = null;

async function ensureAudioGraph() {
  if (audioContext) {
    if (audioContext.state === 'suspended') await audioContext.resume();
    return;
  }
  audioElement = new Audio();
  audioElement.preload = 'auto';
  audioContext = new AudioContext();
  await audioContext.audioWorklet.addModule('./dsp-worklet.js');
  sourceNode = audioContext.createMediaElementSource(audioElement);
  dspNode = new AudioWorkletNode(audioContext, 'rlondsp-dsp', { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2] });
  analyser = audioContext.createAnalyser();
  analyser.fftSize = state.visual.fftSize;
  analyser.smoothingTimeConstant = state.visual.smoothing;
  analyser.minDecibels = -120;
  analyser.maxDecibels = -20;
  allocateAnalyserBuffers();

  dryGainNode = audioContext.createGain();
  wetGainNode = audioContext.createGain();
  irDelayNode = audioContext.createDelay(1);
  irHighpassNode = audioContext.createBiquadFilter();
  irLowpassNode = audioContext.createBiquadFilter();
  convolverNode = audioContext.createConvolver();

  irHighpassNode.type = 'highpass';
  irLowpassNode.type = 'lowpass';
  irDelayNode.delayTime.value = state.effects.ir.predelay;
  irHighpassNode.frequency.value = state.effects.ir.highpass;
  irLowpassNode.frequency.value = state.effects.ir.lowpass;

  sourceNode.connect(dspNode);
  dspNode.connect(dryGainNode);
  dryGainNode.connect(analyser);

  dspNode.connect(irDelayNode);
  irDelayNode.connect(irHighpassNode);
  irHighpassNode.connect(irLowpassNode);
  irLowpassNode.connect(convolverNode);
  convolverNode.connect(wetGainNode);
  wetGainNode.connect(analyser);

  analyser.connect(audioContext.destination);
  sendDSPParams();
  updateIRGraph();
  applyOutputDevice(state.settings.outputDeviceId);

  audioElement.addEventListener('play', () => setPlayButton(true));
  audioElement.addEventListener('pause', () => setPlayButton(false));
  audioElement.addEventListener('ended', () => playNext(true));
  audioElement.addEventListener('timeupdate', () => {
    if (!Number.isFinite(audioElement.duration)) return;
    $('progress').value = String(Math.round((audioElement.currentTime / audioElement.duration) * 1000));
    $('currentTime').textContent = formatTime(audioElement.currentTime);
    updateLyricsDisplay(audioElement.currentTime);
  });
  audioElement.addEventListener('loadedmetadata', () => {
    $('totalTime').textContent = formatTime(audioElement.duration || 0);
  });
  audioElement.addEventListener('error', () => {
    showToast(t('toastUnsupported'));
    setPlayButton(false);
  });
  audioElement.volume = state.volume;
  audioElement.muted = state.muted;
  if (state.currentTrack) {
    audioElement.src = api.toFileUrl(state.currentTrack.path);
  }
  if (audioContext.state === 'suspended') await audioContext.resume();
}

async function applyOutputDevice(deviceId) {
  state.settings.outputDeviceId = deviceId || '';
  if (audioContext && audioContext.setSinkId) {
    try {
      await audioContext.setSinkId(deviceId || '');
    } catch (error) {
      console.warn('setSinkId failed', error);
    }
  } else if (audioElement && audioElement.setSinkId) {
    try {
      await audioElement.setSinkId(deviceId || '');
    } catch (error) {
      console.warn('setSinkId fallback failed', error);
    }
  }
}

function updateIRGraph() {
  if (!dryGainNode || !wetGainNode || !irDelayNode || !irHighpassNode || !irLowpassNode) return;
  const ir = state.effects.ir;
  const hasBuffer = !!convolverNode?.buffer;
  const active = ir.enabled && hasBuffer;
  if (!active || ir.ab) {
    dryGainNode.gain.value = 1;
    wetGainNode.gain.value = 0;
  } else {
    dryGainNode.gain.value = Math.max(0, 1 - ir.wet);
    wetGainNode.gain.value = ir.wet;
  }
  irDelayNode.delayTime.value = ir.predelay;
  irHighpassNode.frequency.value = ir.highpass;
  irLowpassNode.frequency.value = ir.lowpass;
}

async function loadIRFile() {
  const filePath = await api.openIRFile();
  if (!filePath) return;
  try {
    await ensureAudioGraph();
    const response = await fetch(api.toFileUrl(filePath));
    const arrayBuffer = await response.arrayBuffer();
    const decoded = await audioContext.decodeAudioData(arrayBuffer);
    convolverNode.buffer = decoded;
    state.effects.ir.filePath = filePath;
    state.effects.ir.enabled = true;
    $('fxIR').checked = true;
    applyEffectsToUI();
    updateIRGraph();
    showToast(state.settings.language === 'zh' ? 'IR 已加载' : 'IR loaded');
  } catch (error) {
    console.error(error);
    showToast(state.settings.language === 'zh' ? 'IR 加载失败' : 'IR load failed');
  }
}

function clearIR() {
  if (convolverNode) convolverNode.buffer = null;
  state.effects.ir.filePath = '';
  state.effects.ir.enabled = false;
  $('fxIR').checked = false;
  applyEffectsToUI();
  updateIRGraph();
  showToast(state.settings.language === 'zh' ? 'IR 已清除' : 'IR cleared');
}

function toggleIRAB() {
  state.effects.ir.ab = !state.effects.ir.ab;
  updateIRGraph();
  showToast(state.effects.ir.ab ? 'A/B: A' : 'A/B: B');
}

let pulseAuditionTimer = null;

function auditionPulse() {
  if (!state.currentTrack || !audioElement) {
    showToast(t('toastNoTrack'));
    return;
  }
  if (!convolverNode || !convolverNode.buffer) {
    showToast(state.settings.language === 'zh' ? '请先加载脉冲文件' : 'Load a pulse file first');
    return;
  }
  const previousEnabled = state.effects.ir.enabled;
  const previousWet = state.effects.ir.wet;
  state.effects.ir.enabled = true;
  state.effects.ir.wet = Math.max(state.effects.ir.wet, 0.55);
  $('fxIR').checked = true;
  updateEffectsFromUI();
  showToast(state.settings.language === 'zh' ? '脉冲试听中' : 'Pulse audition playing');
  window.clearTimeout(pulseAuditionTimer);
  pulseAuditionTimer = window.setTimeout(() => {
    state.effects.ir.enabled = previousEnabled;
    state.effects.ir.wet = previousWet;
    updateEffectsFromUI();
    showToast(state.settings.language === 'zh' ? '试听结束' : 'Audition ended');
  }, 4000);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function applyPulsePreset(preset) {
  try {
    await ensureAudioGraph();
    const arrayBuffer = base64ToArrayBuffer(preset.wavBase64);
    const decoded = await audioContext.decodeAudioData(arrayBuffer);
    convolverNode.buffer = decoded;
    state.effects.ir.filePath = preset.name;
    state.effects.ir.enabled = preset.enabled !== false;
    $('fxIR').checked = state.effects.ir.enabled;
    $('irName').textContent = preset.name;
    applyEffectsToUI();
    updateIRGraph();
    renderPulseList();
  } catch (error) {
    console.error(error);
    showToast(state.settings.language === 'zh' ? '脉冲加载失败' : 'Pulse load failed');
  }
}

function deletePulsePreset(id) {
  api.deletePreset(id).then((presets) => {
    state.presets = presets;
    renderPulseList();
  });
}

async function renamePulsePreset(id) {
  const preset = state.presets.find((p) => p.id === id);
  if (!preset) return;
  const next = prompt(state.settings.language === 'zh' ? '输入新的脉冲名称' : 'Enter new pulse name', preset.name);
  if (!next || !next.trim()) return;
  preset.name = next.trim();
  state.presets = await api.savePreset(preset);
  renderPulseList();
}

function selectFxTab(tabName) {
  document.querySelectorAll('.fx-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.fxTab === tabName);
  });
  document.querySelectorAll('.fx-tab-panel').forEach((panel) => {
    panel.hidden = panel.dataset.fxPanel !== tabName;
  });
  const card = document.querySelector('.effects-card');
  if (card) card.classList.toggle('pulse-mode', tabName === 'pulse');
  if (tabName === 'pulse') syncStudioTheme();
}

function handleStudioMessage(event) {
  const data = event.data;
  if (!data || data.type !== 'rlondsp-pulse-save') return;
  const name = (data.name || '').trim() || `脉冲反馈 ${new Date().toLocaleTimeString()}`;
  const preset = {
    id: `pulse-${Date.now()}`,
    name,
    type: 'pulse',
    createdAt: Date.now(),
    wavBase64: data.wavBase64,
    sampleRate: data.sampleRate || 48000,
    enabled: false
  };
  api.savePreset(preset).then((presets) => {
    state.presets = presets;
    renderPulseList();
    showToast(state.settings.language === 'zh' ? `脉冲已保存：${name}` : `Pulse saved: ${name}`);
  });
}

function renderPulseList() {
  const list = $('pulseList');
  if (!list) return;
  const pulses = state.presets.filter((preset) => preset.type === 'pulse');
  list.innerHTML = '';
  pulses.forEach((preset) => {
    const item = document.createElement('div');
    item.className = 'pulse-item' + (state.effects.ir.filePath === preset.name ? ' active' : '');
    item.innerHTML = `
      <span class="pulse-name"></span>
      <span class="pulse-time">${new Date(preset.createdAt).toLocaleTimeString()}</span>
      <label class="switch"><input type="checkbox" data-pulse-toggle="${preset.id}" ${preset.enabled ? 'checked' : ''}><span></span></label>
      <button data-pulse-load="${preset.id}">加载</button>
      <button data-pulse-rename="${preset.id}">重命名</button>
      <button data-pulse-del="${preset.id}">删除</button>
    `;
    item.querySelector('.pulse-name').textContent = preset.name;
    list.appendChild(item);
  });
  list.querySelectorAll('[data-pulse-toggle]').forEach((toggle) => {
    toggle.addEventListener('change', async (event) => {
      const preset = state.presets.find((p) => p.id === event.target.dataset.pulseToggle);
      if (!preset) return;
      preset.enabled = event.target.checked;
      await api.savePreset(preset);
      if (preset.enabled) await applyPulsePreset(preset);
      else clearIR();
    });
  });
  list.querySelectorAll('[data-pulse-load]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const preset = state.presets.find((p) => p.id === btn.dataset.pulseLoad);
      if (preset) await applyPulsePreset({ ...preset, enabled: true });
    });
  });
  list.querySelectorAll('[data-pulse-del]').forEach((btn) => {
    btn.addEventListener('click', () => deletePulsePreset(btn.dataset.pulseDel));
  });
  list.querySelectorAll('[data-pulse-rename]').forEach((btn) => {
    btn.addEventListener('click', () => renamePulsePreset(btn.dataset.pulseRename));
  });
}

async function enumerateOutputDevices() {
  try {
    let devices = await navigator.mediaDevices.enumerateDevices();
    if (!devices.some((device) => device.kind === 'audiooutput' && device.label)) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        devices = await navigator.mediaDevices.enumerateDevices();
      } catch {
        // labels remain hidden, but IDs are still selectable
      }
    }
    const outputs = devices.filter((device) => device.kind === 'audiooutput');
    const select = $('deviceSelect');
    select.innerHTML = '';
    outputs.forEach((device, index) => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.textContent = normalizeDeviceLabel(device.label, index);
      select.appendChild(option);
    });
    if (state.settings.outputDeviceId) {
      select.value = state.settings.outputDeviceId;
    }
  } catch (error) {
    console.warn('enumerateDevices failed', error);
  }
}

function normalizeDeviceLabel(label, index) {
  const isZh = state.settings.language === 'zh';
  const fallback = isZh ? '默认设备' : 'Default Device';
  if (!label) return index === 0 ? fallback : (isZh ? `设备 ${index + 1}` : `Device ${index + 1}`);
  const cleaned = label.trim();
  if (/^(default|默认)[\s\-—:：]*/i.test(cleaned)) return fallback;
  return cleaned;
}

function refreshAccent() {
  const style = getComputedStyle(document.documentElement);
  cachedAccent = style.getPropertyValue('--accent').trim() || '#6f92ff';
  cachedAccent2 = style.getPropertyValue('--accent-2').trim() || '#9b82ff';
  cachedText = style.getPropertyValue('--text').trim() || '#1d222c';
  cachedMuted = style.getPropertyValue('--muted').trim() || '#6d7483';
  cachedLine = style.getPropertyValue('--line').trim() || 'rgba(0, 0, 0, 0.08)';
}

function getAccentColor() {
  return cachedAccent;
}

function getAccent2Color() {
  return cachedAccent2;
}

function allocateAnalyserBuffers() {
  if (!analyser) return;
  const binCount = analyser.frequencyBinCount;
  const fftSize = analyser.fftSize;
  freqData = new Uint8Array(binCount);
  freqFloatData = new Float32Array(binCount);
  timeData = new Float32Array(fftSize);
  monoData = new Float32Array(Math.max(1, Math.floor(fftSize / 2)));
  analyzerPeak = new Uint8Array(ANALYZER_BARS);
  curvePeak = new Float32Array(binCount);
  curvePeak.fill(-140);
  const sr = audioContext.sampleRate;
  loudMomentary = new Float32Array(Math.max(1, Math.floor(sr * 0.4)));
  loudShort = new Float32Array(Math.max(1, Math.floor(sr * 3.0)));
  loudMomentarySum = 0;
  loudShortSum = 0;
  loudMomentaryCount = 0;
  loudShortCount = 0;
  loudMomentaryHead = 0;
  loudShortHead = 0;
  loudIntegratedSum = 0;
  loudIntegratedCount = 0;
  loudTruePeak = 0;
}

function setupVizCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const w = Math.max(1, Math.round(rect.width * dpr));
  const h = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  return canvas.getContext('2d');
}

function getVizCanvas(key) {
  return document.querySelector(`[data-viz="${key}"]`);
}

function freqToX(i, binCount, width) {
  if (state.visual.logScale && binCount > 1) {
    const nyquist = (audioContext?.sampleRate || 48000) / 2;
    const minF = 20;
    const f = Math.max(minF, (i / (binCount - 1)) * nyquist);
    return (Math.log(f / minF) / Math.log(nyquist / minF)) * width;
  }
  return (i / Math.max(1, binCount - 1)) * width;
}

/* ===== 统一配色与每帧只算一次的音频指标（各卡片共用，避免重复计算/重复展示） ===== */
const VIZ_PEAK = '#ffa63d';
const VIZ_WARN = '#ff5b6b';
const VIZ_BANDS = [[20, 160], [160, 500], [500, 2000], [2000, 6000], [6000, 16000]];
const LUFS_HISTORY_MAX = 420;
const CENTROID_MIN = 200;
const CENTROID_MAX = 6000;
const VIZ_MONO = '"Consolas", "SFMono-Regular", monospace';

const vizMetrics = {
  rms: 0,
  rmsDb: -Infinity,
  peak: 0,
  peakDb: -Infinity,
  balance: 0,
  corr: 0,
  width: 0,
  bands: [0, 0, 0, 0, 0],
  centroid: 0,
  bright: 0,
  momentary: -Infinity,
  short: -Infinity,
  integrated: -Infinity,
  dr: 0,
  distortion: 0
};
const vizEvents = { beat: 0, bass: 0, vocal: 0, high: 0, overload: 0 };
let vizBeatCooldown = 0;
let vizBassAvg = 0;
let lufsHistory = null;
let lufsHistoryLen = 0;
let lufsHistoryHead = 0;
let vizArcSmooth = 0;

function computeVizMetrics() {
  const n = timeData.length;
  let sumL = 0;
  let sumR = 0;
  let sumLL = 0;
  let sumRR = 0;
  let sumLR = 0;
  let midE = 0;
  let sideE = 0;
  let peak = 0;
  let clip = 0;
  let cnt = 0;
  for (let i = 0; i < n; i += 2) {
    const l = timeData[i];
    const r = (i + 1 < n) ? timeData[i + 1] : l;
    const al = Math.abs(l);
    const ar = Math.abs(r);
    const m = (l + r) * 0.5;
    const s = (l - r) * 0.5;
    sumL += l; sumR += r;
    sumLL += l * l; sumRR += r * r; sumLR += l * r;
    midE += m * m; sideE += s * s;
    if (al > peak) peak = al;
    if (ar > peak) peak = ar;
    if (al > 0.985) clip++;
    if (ar > 0.985) clip++;
    cnt++;
  }
  const meanL = cnt ? sumL / cnt : 0;
  const meanR = cnt ? sumR / cnt : 0;
  const varL = cnt ? sumLL / cnt - meanL * meanL : 0;
  const varR = cnt ? sumRR / cnt - meanR * meanR : 0;
  const cov = cnt ? sumLR / cnt - meanL * meanR : 0;
  const denom = Math.sqrt(Math.max(0, varL) * Math.max(0, varR));
  vizMetrics.corr = denom > 1e-9 ? Math.max(-1, Math.min(1, cov / denom)) : 0;
  const eTot = midE + sideE;
  vizMetrics.width = eTot > 1e-12 ? Math.max(0, Math.min(1, (sideE / eTot) * 2)) : 0;
  const rmsL = cnt ? Math.sqrt(sumLL / cnt) : 0;
  const rmsR = cnt ? Math.sqrt(sumRR / cnt) : 0;
  vizMetrics.rms = Math.sqrt((rmsL * rmsL + rmsR * rmsR) / 2);
  vizMetrics.rmsDb = vizMetrics.rms > 1e-6 ? 20 * Math.log10(vizMetrics.rms) : -Infinity;
  vizMetrics.peak = peak;
  vizMetrics.peakDb = peak > 1e-6 ? 20 * Math.log10(peak) : -Infinity;
  vizMetrics.balance = (sumL + sumR) > 1e-6 ? (sumR - sumL) / (sumR + sumL) : 0;
  vizMetrics.distortion = cnt ? (clip / (cnt * 2)) * 100 : 0;

  const nyquist = (audioContext?.sampleRate || 48000) / 2;
  const binCount = freqData.length;
  let wsum = 0;
  let msum = 0;
  for (let b = 1; b < binCount; b++) {
    const m = freqData[b];
    wsum += m;
    msum += m * (b / binCount) * nyquist;
  }
  vizMetrics.centroid = wsum > 0 ? msum / wsum : 0;
  const cF = Math.max(CENTROID_MIN, Math.min(CENTROID_MAX, vizMetrics.centroid || CENTROID_MIN));
  vizMetrics.bright = Math.log(cF / CENTROID_MIN) / Math.log(CENTROID_MAX / CENTROID_MIN);
  for (let k = 0; k < VIZ_BANDS.length; k++) {
    const b0 = Math.max(1, Math.floor((VIZ_BANDS[k][0] / nyquist) * binCount));
    const b1 = Math.min(binCount - 1, Math.max(b0 + 1, Math.ceil((VIZ_BANDS[k][1] / nyquist) * binCount)));
    let s = 0;
    let c = 0;
    for (let b = b0; b <= b1; b++) { s += freqData[b]; c++; }
    vizMetrics.bands[k] = c ? (s / c) / 255 : 0;
  }

  vizMetrics.momentary = loudMomentaryCount ? LUFS_K + 10 * Math.log10(loudMomentarySum / loudMomentaryCount) : -Infinity;
  vizMetrics.short = loudShortCount ? LUFS_K + 10 * Math.log10(loudShortSum / loudShortCount) : -Infinity;
  vizMetrics.integrated = loudIntegratedCount ? LUFS_K + 10 * Math.log10(loudIntegratedSum / loudIntegratedCount) : -Infinity;
  vizMetrics.dr = Math.max(0, vizMetrics.peakDb - vizMetrics.rmsDb);

  if (!lufsHistory) { lufsHistory = new Float32Array(LUFS_HISTORY_MAX); lufsHistory.fill(-70); }
  lufsHistory[lufsHistoryHead] = Number.isFinite(vizMetrics.momentary) ? vizMetrics.momentary : -70;
  lufsHistoryHead = (lufsHistoryHead + 1) % LUFS_HISTORY_MAX;
  if (lufsHistoryLen < LUFS_HISTORY_MAX) lufsHistoryLen++;

  const lowBand = vizMetrics.bands[0];
  vizBassAvg += (lowBand - vizBassAvg) * 0.05;
  if (vizBeatCooldown > 0) vizBeatCooldown--;
  let beatOn = vizEvents.beat > 0.05;
  if (vizBeatCooldown === 0 && lowBand > vizBassAvg * 1.35 + 0.08) {
    beatOn = true;
    vizBeatCooldown = 12;
  }
  const decay = (v, on) => (on ? Math.min(1, v + 0.28) : Math.max(0, v - 0.06));
  vizEvents.beat = decay(vizEvents.beat, beatOn);
  vizEvents.bass = decay(vizEvents.bass, lowBand > 0.45);
  vizEvents.vocal = decay(vizEvents.vocal, vizMetrics.bands[2] > 0.34 && vizMetrics.bands[1] > 0.28);
  vizEvents.high = decay(vizEvents.high, vizMetrics.bands[4] > 0.22);
  vizEvents.overload = decay(vizEvents.overload, vizMetrics.peakDb > -0.8 || vizMetrics.distortion > 0.4);
}

// 主频谱：柱状频谱 + 平滑能量曲线 + 峰值保持线 + 频率刻度 + 低频呼吸光（唯一频域主模块）
function drawAnalyzer(ctx, width, height) {
  const nyquist = (audioContext?.sampleRate || 48000) / 2;
  const binCount = freqData.length;
  const padB = 15;
  const plotH = Math.max(10, height - padB);
  const bars = ANALYZER_BARS;
  const gap = Math.max(1, width * 0.0015);
  const barW = Math.max(1, (width - gap * (bars - 1)) / bars);
  const accent = getAccentColor();
  const accent2 = getAccent2Color();

  ctx.strokeStyle = cachedLine;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let g = 1; g <= 4; g++) {
    const y = Math.round(plotH - (plotH * g) / 5) + 0.5;
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();

  const lowE = vizMetrics.bands[0];
  const glow = ctx.createLinearGradient(0, 0, width * 0.34, 0);
  glow.addColorStop(0, `rgba(76, 125, 255, ${(0.14 + lowE * 0.28).toFixed(3)})`);
  glow.addColorStop(1, 'rgba(76, 125, 255, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width * 0.34, plotH);

  const grad = ctx.createLinearGradient(0, plotH, 0, 0);
  grad.addColorStop(0, accent);
  grad.addColorStop(1, accent2);
  ctx.fillStyle = grad;
  for (let k = 0; k < bars; k++) {
    const v = logBandValue(k, bars);
    const h = Math.max(1, v * (plotH - 6));
    ctx.globalAlpha = 0.5 + v * 0.5;
    ctx.beginPath();
    ctx.roundRect(k * (barW + gap), plotH - h, barW, h, Math.min(2, barW / 2));
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.beginPath();
  for (let k = 0; k < bars; k++) {
    const v = logBandValue(k, bars);
    const x = k * (barW + gap) + barW / 2;
    const y = plotH - v * (plotH - 6);
    if (k === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = accent2;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = VIZ_PEAK;
  ctx.lineWidth = 1.2;
  for (let k = 0; k < bars; k++) {
    const v = logBandValue(k, bars) * 255;
    if (v > analyzerPeak[k]) analyzerPeak[k] = v;
    else analyzerPeak[k] = Math.max(0, analyzerPeak[k] - 1);
    const x = k * (barW + gap) + barW / 2;
    const y = plotH - (analyzerPeak[k] / 255) * (plotH - 6);
    if (k === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.font = '9px ' + VIZ_MONO;
  ctx.fillStyle = cachedMuted;
  ctx.textAlign = 'left';
  ctx.fillText('20Hz', 3, height - 3);
  ctx.textAlign = 'center';
  ctx.fillText('1kHz', freqToX((1000 / nyquist) * binCount, binCount, width), height - 3);
  ctx.textAlign = 'right';
  ctx.fillText('10kHz', Math.min(width - 3, freqToX((10000 / nyquist) * binCount, binCount, width)), height - 3);
  ctx.textAlign = 'left';
}

function drawScope(ctx, width, height) {
  const perChannel = timeData.length >> 1;
  if (!perChannel) return;
  const sr = audioContext?.sampleRate || 48000;
  const mid = height / 2;
  ctx.strokeStyle = cachedLine;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, Math.round(mid) + 0.5);
  ctx.lineTo(width, Math.round(mid) + 0.5);
  for (let g = 1; g <= 3; g++) {
    const dy = (mid * g) / 4;
    ctx.moveTo(0, Math.round(mid - dy) + 0.5);
    ctx.lineTo(width, Math.round(mid - dy) + 0.5);
    ctx.moveTo(0, Math.round(mid + dy) + 0.5);
    ctx.lineTo(width, Math.round(mid + dy) + 0.5);
  }
  ctx.stroke();

  // 触发对齐：以左声道上升过零点稳定波形
  let trigger = 0;
  const searchEnd = Math.max(2, Math.floor(perChannel / 3));
  for (let i = 1; i < searchEnd; i++) {
    if (timeData[(i - 1) * 2] <= 0 && timeData[i * 2] > 0) { trigger = i; break; }
  }
  const windowSamples = Math.max(32, Math.min(perChannel - trigger, Math.floor(sr * 0.02)));
  const trace = (channel, color, lineWidth) => {
    ctx.beginPath();
    for (let k = 0; k < windowSamples; k++) {
      const idx = trigger + k;
      const v = timeData[idx * 2 + channel] || 0;
      const x = (k / Math.max(1, windowSamples - 1)) * width;
      const y = mid - v * (height * 0.42);
      if (k === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;
  };
  trace(1, 'rgba(122, 92, 255, 0.55)', 1.1);
  trace(0, getAccentColor(), 1.6);

  const ms = (windowSamples / sr) * 1000;
  ctx.font = '9px ' + VIZ_MONO;
  ctx.fillStyle = cachedMuted;
  ctx.textAlign = 'left';
  ctx.fillText('0', 3, height - 3);
  ctx.textAlign = 'center';
  ctx.fillText((ms / 2).toFixed(0) + 'ms', width / 2, height - 3);
  ctx.textAlign = 'right';
  ctx.fillText(ms.toFixed(0) + 'ms', width - 3, height - 3);
  ctx.textAlign = 'left';
}

function updateLoudness(mono, count) {
  const momCap = loudMomentary.length;
  const shortCap = loudShort.length;
  let frameSum = 0;
  for (let i = 0; i < count; i++) {
    const sq = mono[i] * mono[i];
    frameSum += sq;
    if (loudMomentaryCount < momCap) {
      loudMomentary[loudMomentaryCount++] = sq;
      loudMomentarySum += sq;
    } else {
      const idx = loudMomentaryHead % momCap;
      loudMomentarySum += sq - loudMomentary[idx];
      loudMomentary[idx] = sq;
      loudMomentaryHead++;
    }
    if (loudShortCount < shortCap) {
      loudShort[loudShortCount++] = sq;
      loudShortSum += sq;
    } else {
      const idx = loudShortHead % shortCap;
      loudShortSum += sq - loudShort[idx];
      loudShort[idx] = sq;
      loudShortHead++;
    }
  }
  const frameLUFS = count > 0 ? LUFS_K + 10 * Math.log10(frameSum / count) : -Infinity;
  if (frameLUFS > -70) {
    loudIntegratedSum += frameSum;
    loudIntegratedCount += count;
  }
}

function logBandValue(k, count) {
  const nyquist = (audioContext?.sampleRate || 48000) / 2;
  const minF = 20;
  const binCount = freqData.length;
  const fLow = minF * Math.pow(nyquist / minF, k / count);
  const fHigh = minF * Math.pow(nyquist / minF, (k + 1) / count);
  const bLow = Math.min(binCount - 1, Math.floor((fLow / nyquist) * binCount));
  const bHigh = Math.min(binCount - 1, Math.max(bLow + 1, Math.ceil((fHigh / nyquist) * binCount)));
  let peak = 0;
  for (let b = bLow; b <= bHigh; b++) {
    if (freqData[b] > peak) peak = freqData[b];
  }
  return peak / 255;
}

// 极坐标声场：声像定位 / 声场宽度 / 相位方向（唯一空间声场模块）
function drawPolar(ctx, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const rMax = Math.min(width, height) * 0.40;
  ctx.strokeStyle = cachedLine;
  ctx.lineWidth = 1;
  for (let ring = 1; ring <= 3; ring++) {
    ctx.beginPath();
    ctx.arc(cx, cy, (rMax * ring) / 3, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(cx - rMax, cy);
  ctx.lineTo(cx + rMax, cy);
  ctx.moveTo(cx, cy - rMax);
  ctx.lineTo(cx, cy + rMax);
  ctx.stroke();

  const w = 0.28 + vizMetrics.width * 0.72;
  const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, rMax);
  g.addColorStop(0, getAccent2Color());
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.16 + vizMetrics.width * 0.24;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rMax * w, rMax * (0.55 + (1 - vizMetrics.width) * 0.35), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  const spotX = cx + vizMetrics.balance * rMax * 0.85;
  const spotY = cy - vizMetrics.corr * rMax * 0.5;
  const spotR = 4 + vizMetrics.rms * 26;
  const sg = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, Math.max(1, spotR * 2));
  sg.addColorStop(0, 'rgba(255,255,255,0.95)');
  sg.addColorStop(0.35, getAccentColor());
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(spotX, spotY, spotR * 2, 0, Math.PI * 2);
  ctx.fill();
}

// 响度历史曲线：LUFS 趋势 + 整体平均线 + -14 LUFS 参考线（唯一响度趋势模块）
function drawLoudnessHistory(ctx, width, height) {
  const top = 14;
  const bottom = height - 4;
  const lo = -36;
  const hi = -6;
  const yFor = (v) => top + (1 - (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * (bottom - top);
  ctx.strokeStyle = cachedLine;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let g = 1; g <= 3; g++) {
    const y = Math.round(top + ((bottom - top) * g) / 4) + 0.5;
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();

  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = 'rgba(255, 166, 61, 0.55)';
  ctx.beginPath();
  ctx.moveTo(0, yFor(-14));
  ctx.lineTo(width, yFor(-14));
  ctx.stroke();
  ctx.setLineDash([]);

  if (Number.isFinite(vizMetrics.integrated)) {
    ctx.setLineDash([2, 3]);
    ctx.strokeStyle = 'rgba(122, 92, 255, 0.50)';
    ctx.beginPath();
    ctx.moveTo(0, yFor(vizMetrics.integrated));
    ctx.lineTo(width, yFor(vizMetrics.integrated));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  const n = lufsHistoryLen;
  if (n > 1 && lufsHistory) {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const idx = (lufsHistoryHead - n + i + LUFS_HISTORY_MAX) % LUFS_HISTORY_MAX;
      const x = width - ((n - 1 - i) / (LUFS_HISTORY_MAX - 1)) * width;
      const y = yFor(lufsHistory[idx]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = getAccentColor();
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }

  ctx.font = '9px ' + VIZ_MONO;
  ctx.textAlign = 'left';
  ctx.fillStyle = cachedMuted;
  ctx.fillText('-14 LUFS', 3, 10);
  ctx.textAlign = 'right';
  ctx.fillStyle = getAccentColor();
  ctx.fillText(Number.isFinite(vizMetrics.short) ? vizMetrics.short.toFixed(1) : '-∞', width - 3, 10);
  ctx.textAlign = 'left';
}

function drawArc(ctx, width, height) {
  const cx = width / 2;
  const cy = height * 0.60;
  const r = Math.max(14, Math.min(width * 0.33, height * 0.40));
  const a0 = Math.PI * 0.82;
  const a1 = Math.PI * 2.18;
  const lvl = Number.isFinite(vizMetrics.rmsDb) ? vizMetrics.rmsDb : -60;
  const v = Math.max(0, Math.min(1, (Math.max(-60, Math.min(0, lvl)) + 60) / 60));
  vizArcSmooth += (v - vizArcSmooth) * 0.25;
  ctx.beginPath();
  ctx.arc(cx, cy, r, a0, a1);
  ctx.strokeStyle = cachedLine;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.stroke();
  const av = a0 + (a1 - a0) * vizArcSmooth;
  const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
  grad.addColorStop(0, getAccentColor());
  grad.addColorStop(1, getAccent2Color());
  ctx.beginPath();
  ctx.arc(cx, cy, r, a0, av);
  ctx.strokeStyle = grad;
  ctx.lineWidth = 7;
  ctx.stroke();

  const pk = Math.max(0, Math.min(1, ((Number.isFinite(vizMetrics.peakDb) ? vizMetrics.peakDb : -60) + 60) / 60));
  const pa = a0 + (a1 - a0) * pk;
  ctx.beginPath();
  ctx.arc(cx + Math.cos(pa) * r, cy + Math.sin(pa) * r, 3.2, 0, Math.PI * 2);
  ctx.fillStyle = VIZ_PEAK;
  ctx.fill();

  if (Number.isFinite(vizMetrics.peakDb) && vizMetrics.peakDb > -1) {
    ctx.beginPath();
    ctx.arc(cx, cy, r + 6, a0 - 0.06, a1 + 0.06);
    ctx.strokeStyle = VIZ_WARN;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  ctx.fillStyle = cachedText;
  ctx.font = '600 14px ' + VIZ_MONO;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(Number.isFinite(vizMetrics.rmsDb) ? vizMetrics.rmsDb.toFixed(1) : '-∞', cx, cy - r * 0.05);
  ctx.fillStyle = cachedMuted;
  ctx.font = '8.5px ' + VIZ_MONO;
  ctx.fillText('dBFS', cx, cy + r * 0.28);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = '8.5px ' + VIZ_MONO;
  ctx.fillStyle = VIZ_PEAK;
  ctx.fillText('PK ' + (Number.isFinite(vizMetrics.peakDb) ? vizMetrics.peakDb.toFixed(1) : '-∞'), 4, height - 4);
  ctx.textAlign = 'right';
  ctx.fillStyle = cachedMuted;
  ctx.fillText('I ' + (Number.isFinite(vizMetrics.integrated) ? vizMetrics.integrated.toFixed(1) : '-∞'), width - 4, height - 4);
  ctx.textAlign = 'left';
}

// 倍频程频段：低频 / 中低频 / 中频 / 中高频 / 高频 能量分布（唯一频段统计模块）
function drawOctave(ctx, width, height) {
  const labels = [t('bandLow'), t('bandLowMid'), t('bandMid'), t('bandHighMid'), t('bandHigh')];
  const n = 5;
  const gap = Math.max(4, width * 0.022);
  const base = height - 13;
  const maxH = Math.max(6, base - 8);
  const bw = Math.max(3, (width - gap * (n + 1)) / n);
  const grad = ctx.createLinearGradient(0, base, 0, 0);
  grad.addColorStop(0, getAccentColor());
  grad.addColorStop(1, getAccent2Color());
  ctx.font = '8.5px ' + VIZ_MONO;
  ctx.textAlign = 'center';
  for (let k = 0; k < n; k++) {
    const v = Math.max(0, Math.min(1, vizMetrics.bands[k] * 1.5));
    const x = gap + k * (bw + gap);
    const h = Math.max(2, v * maxH);
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.55 + v * 0.45;
    ctx.beginPath();
    ctx.roundRect(x, base - h, bw, h, 3);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = v > 0.8 ? VIZ_PEAK : cachedMuted;
    ctx.fillText(labels[k], x + bw / 2, height - 3);
  }
  ctx.textAlign = 'left';
}

// 立体声相位分析：相关度 + 立体声宽度 + 正反相指示（唯一相位分析模块）
function drawPhase(ctx, width, height) {
  const pad = 12;
  const barW = Math.max(20, width - pad * 2);
  const cx = pad + barW / 2;
  const barY = height * 0.40;
  ctx.fillStyle = cachedLine;
  ctx.beginPath();
  ctx.roundRect(pad, barY - 4, barW, 8, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120, 130, 150, 0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, barY - 8);
  ctx.lineTo(cx, barY + 8);
  ctx.stroke();
  const c = Math.max(-1, Math.min(1, vizMetrics.corr));
  const x = cx + (c * barW) / 2;
  ctx.beginPath();
  ctx.arc(x, barY, 5, 0, Math.PI * 2);
  ctx.fillStyle = c < -0.05 ? VIZ_WARN : getAccentColor();
  ctx.fill();
  ctx.font = '600 13px ' + VIZ_MONO;
  ctx.fillStyle = cachedText;
  ctx.textAlign = 'center';
  ctx.fillText((c >= 0 ? '+' : '') + c.toFixed(2), cx, barY - 16);
  ctx.font = '8.5px ' + VIZ_MONO;
  ctx.textAlign = 'left';
  ctx.fillStyle = cachedMuted;
  ctx.fillText(t('phaseWidth') + ' ' + Math.round(vizMetrics.width * 100) + '%', pad, height - 5);
  ctx.textAlign = 'right';
  ctx.fillStyle = c < -0.05 ? VIZ_WARN : cachedMuted;
  ctx.fillText(c < -0.05 ? t('phaseInv') : t('phaseOk'), width - pad, height - 5);
  ctx.textAlign = 'left';
}

// 动态范围统计：整体响度 / 峰值 / 动态范围 / 失真（唯一音频统计模块）
function drawStats(ctx, width, height) {
  const rows = [
    [t('statInt') + ' LUFS', Number.isFinite(vizMetrics.integrated) ? vizMetrics.integrated.toFixed(1) : '-∞', false],
    [t('statPeak') + ' dBFS', Number.isFinite(vizMetrics.peakDb) ? vizMetrics.peakDb.toFixed(1) : '-∞', Number.isFinite(vizMetrics.peakDb) && vizMetrics.peakDb > -1],
    [t('statDr'), vizMetrics.dr.toFixed(1), false],
    [t('statDistort'), vizMetrics.distortion.toFixed(1) + '%', vizMetrics.distortion > 0.4]
  ];
  const pad = 11;
  const rowH = (height - pad) / rows.length;
  for (let i = 0; i < rows.length; i++) {
    const y = pad * 0.5 + i * rowH + rowH * 0.62;
    ctx.font = '9px ' + VIZ_MONO;
    ctx.textAlign = 'left';
    ctx.fillStyle = cachedMuted;
    ctx.fillText(rows[i][0], pad, y);
    ctx.font = '600 11px ' + VIZ_MONO;
    ctx.textAlign = 'right';
    ctx.fillStyle = rows[i][2] ? VIZ_WARN : cachedText;
    ctx.fillText(rows[i][1], width - pad, y);
  }
  ctx.textAlign = 'left';
}

// 频谱质心：重心频率 + 明亮度（冷暖色带，唯一音色评估模块）
function drawCentroid(ctx, width, height) {
  const pad = 12;
  const bandW = Math.max(20, width - pad * 2);
  const bandY = height - 13;
  const g = ctx.createLinearGradient(pad, 0, pad + bandW, 0);
  g.addColorStop(0, '#4c7dff');
  g.addColorStop(0.5, '#8b6bff');
  g.addColorStop(1, '#ffa63d');
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(pad, bandY - 5, bandW, 10, 5);
  ctx.fill();
  ctx.globalAlpha = 1;
  const brightness = Math.max(0, Math.min(1, vizMetrics.bright));
  const x = pad + brightness * bandW;
  ctx.beginPath();
  ctx.arc(x, bandY, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = 'rgba(90, 100, 120, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  const hz = vizMetrics.centroid;
  ctx.textAlign = 'center';
  ctx.fillStyle = cachedText;
  ctx.font = '600 15px ' + VIZ_MONO;
  ctx.fillText(hz >= 1000 ? (hz / 1000).toFixed(1) + ' kHz' : Math.round(hz) + ' Hz', width / 2, height * 0.42);
  ctx.fillStyle = cachedMuted;
  ctx.font = '9px ' + VIZ_MONO;
  ctx.fillText('BRIGHT ' + Math.round(brightness * 100) + '%', width / 2, height * 0.42 + 15);
  ctx.font = '8px ' + VIZ_MONO;
  ctx.textAlign = 'left';
  ctx.fillText(t('toneDark'), pad, height - 3);
  ctx.textAlign = 'right';
  ctx.fillText(t('toneBright'), width - pad, height - 3);
  ctx.textAlign = 'left';
}

// 音频事件检测条：Beat / Bass / Vocal / High Frequency / Overload（唯一事件模块）
function drawEvents(ctx, width, height) {
  const defs = [
    [t('evBeat'), vizEvents.beat, '#4c8dff'],
    [t('evBass'), vizEvents.bass, '#7a5cff'],
    [t('evVocal'), vizEvents.vocal, '#2fd6a0'],
    [t('evHigh'), vizEvents.high, '#39c9d6'],
    [t('evOverload'), vizEvents.overload, '#ff5b6b']
  ];
  const n = defs.length;
  const pad = 8;
  const gap = 8;
  const cellW = Math.max(40, (width - pad * 2 - gap * (n - 1)) / n);
  const tagH = Math.max(16, Math.min(22, height - 12));
  const y = (height - tagH) * 0.42;
  ctx.font = '600 9.5px ' + VIZ_MONO;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < n; i++) {
    const label = defs[i][0];
    const level = defs[i][1];
    const color = defs[i][2];
    const x = pad + i * (cellW + gap);
    ctx.globalAlpha = 0.08 + level * 0.28;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, cellW, tagH, 6);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = level > 0.15 ? color : cachedLine;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x + 0.5, y + 0.5, cellW - 1, tagH - 1, 6);
    ctx.stroke();
    ctx.fillStyle = level > 0.15 ? cachedText : cachedMuted;
    ctx.fillText(label, x + cellW / 2, y + tagH / 2 + 0.5);
    const stripW = cellW * Math.max(0, Math.min(1, level));
    if (stripW > 1) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y + tagH + 3, stripW, 2.5, 2);
      ctx.fill();
    }
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function renderVisualization() {
  const hasSignal = analyser && state.isPlaying;
  if (hasSignal) {
    analyser.getByteFrequencyData(freqData);
    analyser.getFloatFrequencyData(freqFloatData);
    analyser.getFloatTimeDomainData(timeData);
    const monoCount = monoData.length;
    for (let i = 0; i < monoCount; i++) {
      const l = timeData[i * 2];
      const r = (i * 2 + 1 < timeData.length) ? timeData[i * 2 + 1] : l;
      monoData[i] = (l + r) * 0.5;
    }
    let tp = 0;
    for (let i = 0; i < timeData.length; i++) {
      const a = Math.abs(timeData[i]);
      if (a > tp) tp = a;
    }
    loudTruePeak = tp;
    updateLoudness(monoData, monoCount);
    computeVizMetrics();
  }
  const keys = ['analyzer', 'scope', 'polar', 'loudness', 'arc', 'octave', 'phase', 'stats', 'centroid', 'events'];
  for (const key of keys) {
    const canvas = getVizCanvas(key);
    if (!canvas) continue;
    const ctx = setupVizCanvas(canvas);
    const width = canvas.width;
    const height = canvas.height;
    if (!hasSignal) {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = cachedLine;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      continue;
    }
    ctx.clearRect(0, 0, width, height);
    if (key === 'analyzer') drawAnalyzer(ctx, width, height);
    else if (key === 'scope') drawScope(ctx, width, height);
    else if (key === 'polar') drawPolar(ctx, width, height);
    else if (key === 'loudness') drawLoudnessHistory(ctx, width, height);
    else if (key === 'arc') drawArc(ctx, width, height);
    else if (key === 'octave') drawOctave(ctx, width, height);
    else if (key === 'phase') drawPhase(ctx, width, height);
    else if (key === 'stats') drawStats(ctx, width, height);
    else if (key === 'centroid') drawCentroid(ctx, width, height);
    else if (key === 'events') drawEvents(ctx, width, height);
  }
}

// 渲染循环开关：已经在跑就不重复排队
function startVisualizerLoop() {
  if (animationFrame) return;
  animationFrame = requestAnimationFrame(drawVisualizer);
}

function drawVisualizer() {
  if (document.hidden) {
    animationFrame = null;
    return;
  }
  if (analyser && freqData) renderVisualization();
  if (state.isPlaying) {
    animationFrame = requestAnimationFrame(drawVisualizer);
  } else {
    // 暂停时停笔：保留最后一帧画面，不再空转重画
    animationFrame = null;
  }
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && state.isPlaying) startVisualizerLoop();
});

function openSettings() {
  $('themeSelect').value = state.settings.theme;
  $('languageSelect').value = state.settings.language;
  $('closeToTray').checked = state.settings.closeToTray;
  $('settingsModal').hidden = false;
}

function renderAbout() {
  const zh = state.settings.language === 'zh';
  $('aboutDesc').textContent = zh
    ? '本项目基于 Echomusic 开源项目分支改造与扩展，专注于本地实时音效处理与频谱可视化。'
    : 'This project is a fork of the Echomusic open-source project, focused on local real-time audio effects and spectrum visualization.';
  $('aboutUpstreamNote').textContent = zh
    ? '核心音频播放与音效框架源自 Echomusic，在此向原项目贡献者致以诚挚感谢。'
    : 'The core audio playback and effects framework originates from Echomusic. Sincere thanks to the original contributors.';
  $('aboutLicense').textContent = zh
    ? '本项目遵循 GPL-3.0-only，与上游 Echomusic 许可证保持兼容。'
    : 'This project is licensed under GPL-3.0-only, compatible with the upstream Echomusic license.';
  $('aboutDeps').innerHTML = zh
    ? '<div>Electron - 桌面应用运行时 - MIT</div><div>music-metadata - 音频元数据解析 - MIT</div><div>Chromium / FFmpeg - 音频解码与媒体处理</div><div>Echomusic 原生音频模块 - 音频播放与音效 DSP - GPL-3.0-only</div>'
    : '<div>Electron - desktop runtime - MIT</div><div>music-metadata - audio metadata parsing - MIT</div><div>Chromium / FFmpeg - audio decoding and media processing</div><div>Echomusic native audio modules - playback and effects DSP - GPL-3.0-only</div>';
}

function openAbout() {
  renderAbout();
  $('aboutModal').hidden = false;
}

async function saveSettings() {
  const next = {
    theme: $('themeSelect').value,
    language: $('languageSelect').value,
    closeToTray: $('closeToTray').checked
  };
  state.settings = { ...state.settings, ...next };
  state.settings = await api.setSettings(next);
  applyLanguage(state.settings.language);
  applyTheme(state.settings.theme);
  $('settingsModal').hidden = true;
}

function handleDragDrop() {
  document.addEventListener('dragover', (event) => {
    event.preventDefault();
  });
  document.addEventListener('dragleave', (event) => {
    event.preventDefault();
  });
  document.addEventListener('drop', async (event) => {
    event.preventDefault();
    const files = [];
    for (const file of event.dataTransfer.files) {
      const path = api.getPathForFile(file);
      if (path) files.push(path);
    }
    await addPaths(files);
  });
}

function bindUI() {
  on('importFileBtn', 'click', importFiles);
  on('importFolderBtn', 'click', importFolder);
  on('playlistSearch', 'input', renderPlaylist);
  on('sortSelect', 'change', sortPlaylist);
  on('clearPlaylistBtn', 'click', clearPlaylist);
  on('trackList', 'click', (event) => {
    const heart = event.target.closest('.track-heart');
    if (heart) {
      toggleFavorite(Number(heart.dataset.index));
    }
  });
  on('playBtn', 'click', togglePlay);
  on('prevBtn', 'click', playPrevious);
  on('nextBtn', 'click', () => playNext(false));
  on('progress', 'input', (event) => seekTo(Number(event.target.value) / 1000));
  on('volume', 'input', (event) => setVolume(Number(event.target.value) / 100));
  on('deviceSelect', 'change', (event) => {
    api.setSettings({ outputDeviceId: event.target.value });
    applyOutputDevice(event.target.value);
  });
  on('effectsBtn', 'click', () => {
    const modal = $('effectsModal');
    if (modal) modal.hidden = false;
  });
  on('closeEffectsBtn', 'click', () => {
    const modal = $('effectsModal');
    if (modal) modal.hidden = true;
  });
  on('resetFxBtn', 'click', resetEffects);
  on('savePresetBtn', 'click', savePreset);
  on('deletePresetBtn', 'click', deletePreset);
  on('exportPresetBtn', 'click', exportPreset);
  on('importPresetBtn', 'click', importPreset);
  on('loadIRBtn', 'click', loadIRFile);
  on('irClearBtn', 'click', clearIR);
  on('irABBtn', 'click', toggleIRAB);
  on('auditionPulseBtn', 'click', auditionPulse);
  document.querySelectorAll('.fx-tab').forEach((tab) => {
    tab.addEventListener('click', () => selectFxTab(tab.dataset.fxTab));
  });
  window.addEventListener('message', handleStudioMessage);
  const studioFrame = document.getElementById('irStudioFrame');
  if (studioFrame) studioFrame.addEventListener('load', syncStudioTheme);
  on('presetSelect', 'change', () => {
    const preset = state.presets.find((item) => item.id === currentPresetId());
    if (preset) applyPreset(preset);
  });
  on('settingsBtn', 'click', openSettings);
  on('winMinBtn', 'click', () => api.minimize());
  on('winMaxBtn', 'click', () => api.maximize());
  on('winCloseBtn', 'click', () => api.close());
  on('winMiniBtn', 'click', toggleMiniMode);
  on('miniExitBtn', 'click', toggleMiniMode);
  on('miniCloseBtn', 'click', () => api.close());
  if (api.onMiniState) {
    api.onMiniState((value) => {
      document.body.classList.toggle('mini-mode', value);
      const btn = $('winMiniBtn');
      if (btn) btn.classList.toggle('active', value);
    });
  }
  if (api.onMaximized) {
    api.onMaximized((value) => {
      const icon = $('winMaxIcon');
      if (icon) icon.setAttribute('href', value ? '#icon-win-restore' : '#icon-win-max');
      const btn = $('winMaxBtn');
      if (btn) btn.title = value ? '还原' : '最大化';
    });
  }
  on('closeSettingsBtn', 'click', () => {
    const modal = $('settingsModal');
    if (modal) modal.hidden = true;
  });
  on('saveSettingsBtn', 'click', saveSettings);
  on('aboutBtn', 'click', openAbout);
  on('closeAboutBtn', 'click', () => {
    const modal = $('aboutModal');
    if (modal) modal.hidden = true;
  });
  on('viewLicenseBtn', 'click', () => api.openLicense());
  on('muteBtn', 'click', toggleMute);
  on('modeBtn', 'click', cycleMode);
  on('lyricsBtn', 'click', toggleDesktopLyrics);
  window.addEventListener('resize', () => {
    // canvas resizes during animation loop
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (state.settings.theme === 'system') applyTheme('system');
  });
  bindEffectInputs();
  handleDragDrop();
  api.onShortcut((command) => {
    if (command === 'playpause') togglePlay();
    if (command === 'next') playNext(false);
    if (command === 'previous') playPrevious();
  });
  api.onShowAbout(openAbout);
}

async function init() {
  state.settings = { ...state.settings, ...(await api.getSettings()) };
  state.volume = state.settings.volume;
  state.mode = state.settings.playbackMode || 'list';
  safeRun('音量滑块初始化', () => {
    const volume = $('volume');
    if (volume) volume.value = String(Math.round(state.volume * 100));
  });
  safeRun('输出设备下拉初始化', () => {
    const select = $('deviceSelect');
    if (select) select.innerHTML = `<option value="">${state.settings.language === 'zh' ? '默认输出' : 'System Default'}</option>`;
  });
  safeRun('语言应用', () => applyLanguage(state.settings.language));
  safeRun('主题应用', () => applyTheme(state.settings.theme));
  safeRun('播放模式按钮同步', updateModeButton);
  safeRun('均衡器构建', buildEQ);
  applyEffectsToUI();
  bindUI();
  state.favorites = new Set(await api.getFavorites());
  await loadPresets();
  safeRun('播放列表渲染', renderPlaylist);
  safeRun('正在播放信息同步', updateNowPlaying);
  await safeRunAsync('输出设备枚举', enumerateOutputDevices);
  if (state.settings.outputDeviceId) applyOutputDevice(state.settings.outputDeviceId);
  drawVisualizer();
}

init().catch((error) => {
  console.error(error);
});
