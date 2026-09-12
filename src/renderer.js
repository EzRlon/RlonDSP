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
    desktopLyrics: '桌面歌词',
    themeSystem: '跟随系统',
    themeLight: '浅色',
    themeDark: '深色',
    playlist: '播放列表',
    sortDefault: '默认排序',
    sortTitle: '按标题',
    sortArtist: '按歌手',
    sortDuration: '按时长',
    clear: '清空',
    dropHint: '拖入音频文件或文件夹即可导入',
    noTrack: '未播放',
    visualHint: '播放时显示频谱',
    visualizer: '频谱可视化',
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
    minimizeToTray: '最小化时到托盘',
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
    enable: '启用'
  },
  en: {
    importFiles: 'Import Files',
    importFolder: 'Import Folder',
    searchPlaceholder: 'Search tracks',
    desktopLyrics: 'Desktop Lyrics',
    themeSystem: 'System',
    themeLight: 'Light',
    themeDark: 'Dark',
    playlist: 'Playlist',
    sortDefault: 'Default',
    sortTitle: 'Title',
    sortArtist: 'Artist',
    sortDuration: 'Duration',
    clear: 'Clear',
    dropHint: 'Drop audio files or folders here',
    noTrack: 'Nothing Playing',
    visualHint: 'Spectrum appears while playing',
    visualizer: 'Visualizer',
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
    minimizeToTray: 'Minimize to tray',
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
    minimizeToTray: false,
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
    smoothing: 0.78,
    colormap: 0
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

function $(id) {
  return document.getElementById(id);
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
      theme: document.documentElement.dataset.theme || 'light'
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

function getTrackByPath(path) {
  return state.tracks.find((track) => track.path === path);
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
  $('irName').textContent = fx.ir.filePath ? fx.ir.filePath.split(/[\\/]/).pop() : (state.settings.language === 'zh' ? '未加载脉冲' : 'No pulse loaded');
}

function sendDSPParams() {
  if (dspNode) {
    dspNode.port.postMessage({ type: 'params', params: collectEffects() });
  }
}

function updateEffectsFromUI() {
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
    sendLyricsToDesktop({ current, next, active: index, total: state.lyrics.length });
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
const COLOR_MAPS = ['Thermal', 'Rainbow', 'Ocean', 'Mono'];
const LUFS_K = -0.691;

let freqData = null;
let freqFloatData = null;
let timeData = null;
let monoData = null;
let analyzerPeak = null;
let curvePeak = null;
let spectroBuffer = null;
let spectroCtx = null;
let colorLUT = null;

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

function savePulsePreset() {
  if (!convolverNode || !convolverNode.buffer) {
    showToast(state.settings.language === 'zh' ? '请先生成或加载脉冲' : 'Generate or load a pulse first');
    return;
  }
  const fallbackName = state.settings.language === 'zh' ? '脉冲反馈' : 'Pulse Feedback';
  const name = ($('pulseName').value || '').trim() || `${fallbackName} ${new Date().toLocaleTimeString()}`;
  const pulse = currentPulseToWavBase64();
  if (!pulse) return;
  const preset = {
    id: `pulse-${Date.now()}`,
    name,
    type: 'pulse',
    createdAt: Date.now(),
    wavBase64: pulse.base64,
    sampleRate: pulse.sampleRate,
    enabled: false
  };
  api.savePreset(preset).then((presets) => {
    state.presets = presets;
    renderPulseList();
    showToast(state.settings.language === 'zh' ? '脉冲已保存' : 'Pulse saved');
  });
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function currentPulseToWavBase64() {
  if (!convolverNode || !convolverNode.buffer) return null;
  const buffer = convolverNode.buffer;
  const L = buffer.getChannelData(0);
  const R = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : L;
  const wav = window.IRGenerator.encodeWav(L, R, buffer.sampleRate, 16, {
    name: 'pulse.wav',
    comment: 'RlonDSP',
    software: 'RlonDSP'
  });
  return { base64: arrayBufferToBase64(wav), sampleRate: buffer.sampleRate };
}

async function generatePulse() {
  try {
    await ensureAudioGraph();
    const cfg = JSON.parse(JSON.stringify(window.IRGenerator.DEFAULT_CONFIG));
    cfg.sampleRate = audioContext.sampleRate;
    cfg.length = 1.5;
    const result = window.IRGenerator.renderIR(cfg, null);
    const decoded = await audioContext.decodeAudioData(result.wav);
    convolverNode.buffer = decoded;
    state.effects.ir.filePath = cfg.filename;
    state.effects.ir.enabled = true;
    $('fxIR').checked = true;
    $('irName').textContent = `${cfg.filename}.wav`;
    $('pulseName').value = '';
    applyEffectsToUI();
    updateIRGraph();
    showToast(state.settings.language === 'zh' ? '脉冲已生成并应用' : 'Pulse generated and applied');
  } catch (error) {
    console.error(error);
    showToast(state.settings.language === 'zh' ? '脉冲生成失败' : 'Pulse generation failed');
  }
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

function buildColorLUT() {
  const mode = ((state.visual.colormap % COLOR_MAPS.length) + COLOR_MAPS.length) % COLOR_MAPS.length;
  const lut = new Array(256);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let h;
    let s = 100;
    let l;
    if (mode === 0) { h = 262 - t * 262; l = 8 + t * 52; }
    else if (mode === 1) { h = 285 - t * 285; l = 10 + t * 48; }
    else if (mode === 2) { h = 215 - t * 45; l = 10 + t * 52; }
    else { h = 150; l = 10 + t * 52; }
    lut[i] = `hsl(${h.toFixed(1)}, ${s}%, ${l.toFixed(1)}%)`;
  }
  colorLUT = lut;
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
  buildColorLUT();
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

function drawAnalyzer(ctx, width, height) {
  const nyquist = (audioContext?.sampleRate || 48000) / 2;
  const minF = 20;
  const binCount = freqData.length;
  const gap = Math.max(1, width * 0.002);
  const barW = Math.max(1, (width - gap * (ANALYZER_BARS - 1)) / ANALYZER_BARS);
  const accent = getAccentColor();
  const accent2 = getAccent2Color();
  for (let k = 0; k < ANALYZER_BARS; k++) {
    const fLow = minF * Math.pow(nyquist / minF, k / ANALYZER_BARS);
    const fHigh = minF * Math.pow(nyquist / minF, (k + 1) / ANALYZER_BARS);
    const binLow = Math.min(binCount - 1, Math.floor((fLow / nyquist) * binCount));
    const binHigh = Math.min(binCount - 1, Math.max(binLow + 1, Math.ceil((fHigh / nyquist) * binCount)));
    let peak = 0;
    for (let b = binLow; b <= binHigh; b++) {
      if (freqData[b] > peak) peak = freqData[b];
    }
    const v = peak / 255;
    const barH = Math.max(0.5, v * (height - 16));
    const x = k * (barW + gap);
    const y = height - barH;
    const grad = ctx.createLinearGradient(0, height, 0, y);
    grad.addColorStop(0, accent);
    grad.addColorStop(1, accent2);
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.55 + v * 0.45;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, 1.5);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.strokeStyle = '#ffb547';
  ctx.lineWidth = 1.4;
  ctx.shadowColor = '#ffb547';
  ctx.shadowBlur = 4;
  for (let k = 0; k < ANALYZER_BARS; k++) {
    const fLow = minF * Math.pow(nyquist / minF, k / ANALYZER_BARS);
    const fHigh = minF * Math.pow(nyquist / minF, (k + 1) / ANALYZER_BARS);
    const binLow = Math.min(binCount - 1, Math.floor((fLow / nyquist) * binCount));
    const binHigh = Math.min(binCount - 1, Math.max(binLow + 1, Math.ceil((fHigh / nyquist) * binCount)));
    let peak = 0;
    for (let b = binLow; b <= binHigh; b++) {
      if (freqData[b] > peak) peak = freqData[b];
    }
    if (peak > analyzerPeak[k]) analyzerPeak[k] = peak;
    else analyzerPeak[k] = Math.max(0, analyzerPeak[k] - 1);
    const x = k * (barW + gap) + barW / 2;
    const y = height - (analyzerPeak[k] / 255) * (height - 16);
    if (k === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawCurve(ctx, width, height) {
  const binCount = freqData.length;
  const minDB = -120;
  const maxDB = -20;
  const accent = getAccentColor();
  const accent2 = getAccent2Color();
  const dbToY = (db) => (1 - (db - minDB) / (maxDB - minDB)) * (height - 6);
  ctx.beginPath();
  ctx.moveTo(freqToX(0, binCount, width), height);
  for (let i = 0; i < binCount; i++) {
    const db = Math.max(minDB, Math.min(maxDB, freqFloatData[i]));
    ctx.lineTo(freqToX(i, binCount, width), dbToY(db));
  }
  ctx.lineTo(freqToX(binCount - 1, binCount, width), height);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, accent2);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.beginPath();
  for (let i = 0; i < binCount; i++) {
    const db = Math.max(minDB, Math.min(maxDB, freqFloatData[i]));
    const x = freqToX(i, binCount, width);
    const y = dbToY(db);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.6;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 6;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.strokeStyle = '#ffb547';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < binCount; i++) {
    const db = Math.max(minDB, Math.min(maxDB, freqFloatData[i]));
    if (db > curvePeak[i]) curvePeak[i] = db;
    else curvePeak[i] = Math.max(minDB, curvePeak[i] - 0.35);
    const x = freqToX(i, binCount, width);
    const y = dbToY(curvePeak[i]);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawScope(ctx, width, height) {
  const monoCount = monoData.length;
  if (!monoCount) return;
  const sr = audioContext.sampleRate;
  let trigger = 0;
  const searchEnd = Math.floor(monoCount / 3);
  for (let i = 1; i < searchEnd; i++) {
    if (monoData[i - 1] <= 0 && monoData[i] > 0) { trigger = i; break; }
  }
  const windowSamples = Math.min(monoCount, Math.max(64, Math.floor(sr * 0.01)));
  const accent = getAccentColor();
  const midY = height / 2;
  ctx.beginPath();
  for (let k = 0; k < windowSamples; k++) {
    const idx = (trigger + k) % monoCount;
    const x = (k / (windowSamples - 1)) * width;
    const y = midY - monoData[idx] * (height * 0.46);
    if (k === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.8;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 7;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawSpectrogram(ctx, width, height) {
  if (!spectroBuffer || spectroBuffer.width !== width || spectroBuffer.height !== height) {
    spectroBuffer = document.createElement('canvas');
    spectroBuffer.width = width;
    spectroBuffer.height = height;
    spectroCtx = spectroBuffer.getContext('2d');
  }
  spectroCtx.globalCompositeOperation = 'destination-out';
  spectroCtx.fillStyle = 'rgba(0, 0, 0, 0.10)';
  spectroCtx.fillRect(0, 0, width, height);
  spectroCtx.globalCompositeOperation = 'source-over';
  if (width > 1) {
    spectroCtx.drawImage(spectroBuffer, 1, 0, width - 1, height, 0, 0, width - 1, height);
  }
  const nyquist = (audioContext?.sampleRate || 48000) / 2;
  const minF = 20;
  const binCount = freqData.length;
  const lut = colorLUT;
  const x = width - 1;
  for (let y = 0; y < height; y++) {
    const t = 1 - y / (height - 1);
    const f = minF * Math.pow(nyquist / minF, t);
    const bin = Math.min(binCount - 1, Math.floor((f / nyquist) * binCount));
    const v = freqData[bin] / 255;
    spectroCtx.fillStyle = lut[Math.min(255, Math.floor(v * 255))];
    spectroCtx.fillRect(x, y, 1, 1);
  }
  ctx.drawImage(spectroBuffer, 0, 0);
}

function computeCorrelation(data) {
  let sumL = 0;
  let sumR = 0;
  let sumLL = 0;
  let sumRR = 0;
  let sumLR = 0;
  let n = 0;
  for (let i = 0; i < data.length; i += 2) {
    const l = data[i];
    const r = (i + 1 < data.length) ? data[i + 1] : l;
    sumL += l; sumR += r; sumLL += l * l; sumRR += r * r; sumLR += l * r; n++;
  }
  const cov = sumLR / n - (sumL / n) * (sumR / n);
  const varL = sumLL / n - (sumL / n) * (sumL / n);
  const varR = sumRR / n - (sumR / n) * (sumR / n);
  const denom = Math.sqrt(Math.max(0, varL) * Math.max(0, varR));
  return denom > 1e-9 ? cov / denom : 0;
}

function drawVectorscope(ctx, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.46;
  ctx.strokeStyle = cachedLine;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - radius, cy);
  ctx.lineTo(cx + radius, cy);
  ctx.moveTo(cx, cy - radius);
  ctx.lineTo(cx, cy + radius);
  ctx.stroke();
  ctx.beginPath();
  const accent = getAccentColor();
  for (let i = 0; i < timeData.length; i += 2) {
    const l = timeData[i];
    const r = (i + 1 < timeData.length) ? timeData[i + 1] : l;
    const x = cx + l * radius;
    const y = cy + r * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = getAccent2Color();
  ctx.shadowBlur = 5;
  ctx.stroke();
  ctx.shadowBlur = 0;
  const corr = computeCorrelation(timeData);
  const el = document.getElementById('correlationVal');
  if (el) el.textContent = `Corr ${corr.toFixed(2)}`;
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

function drawLoudness(ctx, width, height) {
  const rangeMin = -60;
  const rangeMax = 0;
  const padL = 34;
  const padR = 8;
  const barW = width - padL - padR;
  const xFor = (db) => padL + ((db - rangeMin) / (rangeMax - rangeMin)) * barW;
  const toLUFS = (sum, cnt) => (cnt > 0 ? LUFS_K + 10 * Math.log10(sum / cnt) : -Infinity);
  const mom = toLUFS(loudMomentarySum, loudMomentaryCount);
  const short = toLUFS(loudShortSum, loudShortCount);
  const integ = toLUFS(loudIntegratedSum, loudIntegratedCount);
  const truePeakDB = loudTruePeak > 0 ? 20 * Math.log10(loudTruePeak) : -Infinity;
  ctx.strokeStyle = cachedLine;
  ctx.fillStyle = cachedMuted;
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  for (let db = rangeMin; db <= rangeMax; db += 10) {
    const x = xFor(db);
    ctx.beginPath();
    ctx.moveTo(x, 10);
    ctx.lineTo(x, 22);
    ctx.stroke();
    ctx.fillText(String(db), x, 8);
  }
  const rows = [
    { label: 'M', value: mom, color: '#4c8dff' },
    { label: 'S', value: short, color: '#7a5cff' },
    { label: 'I', value: integ, color: '#3fd6a5' }
  ];
  const rowArea = height - 34;
  const rowH = rowArea / 3;
  rows.forEach((row, idx) => {
    const ry = 30 + idx * rowH + rowH / 2;
    ctx.fillStyle = row.color;
    ctx.fillText(row.label, 8, ry);
    const v = Number.isFinite(row.value) ? Math.max(rangeMin, Math.min(rangeMax, row.value)) : rangeMin;
    const bx = xFor(v);
    ctx.fillRect(padL, ry - 4, Math.max(1, bx - padL), 8);
    ctx.fillStyle = cachedText;
    ctx.fillText(Number.isFinite(row.value) ? row.value.toFixed(1) : '-∞', padL + barW + 4, ry);
  });
  ctx.fillStyle = cachedText;
  ctx.textAlign = 'right';
  ctx.fillText(`TP ${Number.isFinite(truePeakDB) ? truePeakDB.toFixed(1) : '-∞'} dB`, width - 8, height - 8);
  ctx.textAlign = 'left';
}

let levelPeakL = 0;
let levelPeakR = 0;
let vuL = 0;
let vuR = 0;

function drawLevel(ctx, width, height) {
  let sumL = 0;
  let sumR = 0;
  let peakL = 0;
  let peakR = 0;
  let n = 0;
  for (let i = 0; i < timeData.length; i += 2) {
    const l = timeData[i];
    const r = (i + 1 < timeData.length) ? timeData[i + 1] : l;
    sumL += l * l;
    sumR += r * r;
    const al = Math.abs(l);
    const ar = Math.abs(r);
    if (al > peakL) peakL = al;
    if (ar > peakR) peakR = ar;
    n++;
  }
  const toDB = (v) => (v > 1e-6 ? 20 * Math.log10(v) : -Infinity);
  levelPeakL = Math.max(peakL, levelPeakL - 0.006);
  levelPeakR = Math.max(peakR, levelPeakR - 0.006);
  const minDB = -60;
  const dbToY = (db) => (1 - (Math.max(minDB, Math.min(0, db)) - minDB) / (0 - minDB)) * (height - 14) + 7;
  ctx.strokeStyle = cachedLine;
  ctx.fillStyle = cachedMuted;
  ctx.font = '9px monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let db = 0; db >= -60; db -= 12) {
    const y = dbToY(db);
    ctx.beginPath();
    ctx.moveTo(26, y);
    ctx.lineTo(width - 4, y);
    ctx.stroke();
    ctx.fillText(String(db), 22, y);
  }
  const barW = Math.max(6, Math.min(26, (width - 40) / 2 - 8));
  const X = 30;
  const chans = [
    { x: X, rms: toDB(n ? Math.sqrt(sumL / n) : 0), peak: toDB(levelPeakL), color: '#4c8dff' },
    { x: X + barW + 18, rms: toDB(n ? Math.sqrt(sumR / n) : 0), peak: toDB(levelPeakR), color: '#2fd6a0' }
  ];
  chans.forEach((ch) => {
    const yRms = dbToY(Number.isFinite(ch.rms) ? ch.rms : minDB);
    const grad = ctx.createLinearGradient(0, height, 0, 0);
    grad.addColorStop(0, ch.color);
    grad.addColorStop(1, '#ff5b7f');
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(ch.x, yRms, barW, Math.max(0, height - yRms - 7));
    ctx.globalAlpha = 1;
    if (Number.isFinite(ch.peak)) {
      const yPeak = dbToY(ch.peak);
      ctx.fillStyle = '#ffb547';
      ctx.fillRect(ch.x, yPeak - 1, barW, 2);
    }
  });
  ctx.textAlign = 'left';
}

function drawVu(ctx, width, height) {
  let sumL = 0;
  let sumR = 0;
  let n = 0;
  for (let i = 0; i < timeData.length; i += 2) {
    const l = timeData[i];
    const r = (i + 1 < timeData.length) ? timeData[i + 1] : l;
    sumL += l * l;
    sumR += r * r;
    n++;
  }
  const rmsL = n ? Math.sqrt(sumL / n) : 0;
  const rmsR = n ? Math.sqrt(sumR / n) : 0;
  vuL += (Math.min(1, rmsL * 2.2) - vuL) * 0.18;
  vuR += (Math.min(1, rmsR * 2.2) - vuR) * 0.18;
  const cy = height - 16;
  const radius = Math.max(10, Math.min(width * 0.22, height * 0.78));
  const cx = width / 2;
  const startA = Math.PI * 1.12;
  const endA = Math.PI * 1.88;
  const drawMeter = (offset, value, color, label) => {
    const cxx = cx + offset;
    ctx.beginPath();
    ctx.arc(cxx, cy, radius, startA, endA);
    ctx.strokeStyle = cachedLine;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = cachedMuted;
    ctx.lineWidth = 1;
    for (let k = 0; k <= 10; k++) {
      const a = startA + (endA - startA) * (k / 10);
      const r1 = radius - 3;
      const r2 = radius - (k % 5 === 0 ? 9 : 6);
      ctx.beginPath();
      ctx.moveTo(cxx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.lineTo(cxx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
      ctx.stroke();
    }
    const a = startA + (endA - startA) * Math.max(0, Math.min(1, value));
    ctx.beginPath();
    ctx.moveTo(cxx, cy);
    ctx.lineTo(cxx + Math.cos(a) * (radius - 6), cy + Math.sin(a) * (radius - 6));
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cxx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = cachedMuted;
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, cxx, cy + radius * 0.42);
  };
  drawMeter(-radius * 1.05, vuL, '#ffb547', 'L');
  drawMeter(radius * 1.05, vuR, '#2fd6a0', 'R');
  ctx.textAlign = 'left';
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

function rmsLevel() {
  let sum = 0;
  let n = 0;
  for (let i = 0; i < timeData.length; i++) {
    sum += timeData[i] * timeData[i];
    n++;
  }
  return n ? Math.sqrt(sum / n) : 0;
}

let arcValue = 0;
let orbEnergy = 0;

function drawRadial(ctx, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.28;
  const maxLen = Math.min(width, height) * 0.20;
  const bars = 64;
  const accent = getAccentColor();
  const accent2 = getAccent2Color();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = cachedLine;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.lineCap = 'round';
  for (let k = 0; k < bars; k++) {
    const a = -Math.PI / 2 + (k / bars) * Math.PI * 2;
    const v = logBandValue(k, bars);
    const len = 3 + v * maxLen;
    const x1 = cx + Math.cos(a) * radius;
    const y1 = cy + Math.sin(a) * radius;
    const x2 = cx + Math.cos(a) * (radius + len);
    const y2 = cy + Math.sin(a) * (radius + len);
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, accent);
    grad.addColorStop(1, accent2);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.58, 0, Math.PI * 2);
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.10;
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawRibbon(ctx, width, height) {
  const accent = getAccentColor();
  const accent2 = getAccent2Color();
  const layers = 3;
  const samples = 110;
  const mid = height / 2;
  for (let L = 0; L < layers; L++) {
    const amp = height * (0.30 - L * 0.06);
    const shift = (L - 1) * (height * 0.05);
    const color = L === 0 ? accent2 : accent;
    ctx.beginPath();
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const idx = Math.min(timeData.length - 1, Math.floor(t * (timeData.length - 1)));
      const v = timeData[idx] || 0;
      const x = t * width;
      const y = mid + v * amp + shift;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.globalAlpha = 0.30 - L * 0.07;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const idx = Math.min(timeData.length - 1, Math.floor(t * (timeData.length - 1)));
      const v = timeData[idx] || 0;
      const x = t * width;
      const y = mid + v * amp + shift;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
}

function drawDots(ctx, width, height) {
  const cols = 44;
  const rows = 7;
  const cellW = width / cols;
  const cellH = height / rows;
  const r = Math.min(cellW, cellH) * 0.26;
  const accent = getAccentColor();
  const accent2 = getAccent2Color();
  for (let c = 0; c < cols; c++) {
    const v = logBandValue(c, cols);
    const lit = v * rows;
    for (let row = 0; row < rows; row++) {
      const fromBottom = rows - 1 - row;
      const x = cellW * (c + 0.5);
      const y = cellH * (row + 0.5);
      const on = fromBottom < lit;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      if (on) {
        ctx.fillStyle = row < rows * 0.34 ? accent2 : accent;
        ctx.globalAlpha = 0.55 + 0.45 * v;
      } else {
        ctx.fillStyle = cachedLine;
        ctx.globalAlpha = 0.7;
      }
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function drawArc(ctx, width, height) {
  const cx = width / 2;
  const cy = height * 0.64;
  const r = Math.max(16, Math.min(width * 0.36, height * 0.5));
  const a0 = Math.PI * 0.8;
  const a1 = Math.PI * 2.2;
  const level = rmsLevel();
  const db = level > 1e-6 ? 20 * Math.log10(level) : -Infinity;
  const v = Math.max(0, Math.min(1, (Number.isFinite(db) ? db + 60 : 0) / 60));
  arcValue += (v - arcValue) * 0.25;
  ctx.beginPath();
  ctx.arc(cx, cy, r, a0, a1);
  ctx.strokeStyle = cachedLine;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.stroke();
  const av = a0 + (a1 - a0) * arcValue;
  const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
  grad.addColorStop(0, getAccentColor());
  grad.addColorStop(1, getAccent2Color());
  ctx.beginPath();
  ctx.arc(cx, cy, r, a0, av);
  ctx.strokeStyle = grad;
  ctx.lineWidth = 8;
  ctx.stroke();
  const ex = cx + Math.cos(av) * r;
  const ey = cy + Math.sin(av) * r;
  ctx.beginPath();
  ctx.arc(ex, ey, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.9;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = cachedText;
  ctx.font = '600 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(Number.isFinite(db) ? db.toFixed(1) : '-∞', cx, cy - r * 0.08);
  ctx.fillStyle = cachedMuted;
  ctx.font = '9px monospace';
  ctx.fillText('dBFS', cx, cy + r * 0.30);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function drawOrb(ctx, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const base = Math.min(width, height) * 0.26;
  const level = rmsLevel();
  orbEnergy += (Math.min(1, level * 3.2) - orbEnergy) * 0.12;
  const r = base * (0.72 + orbEnergy * 0.62);
  const accent = getAccentColor();
  const accent2 = getAccent2Color();
  const glow = ctx.createRadialGradient(cx, cy, r * 0.15, cx, cy, r * 1.6);
  glow.addColorStop(0, accent2);
  glow.addColorStop(0.55, accent);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.globalAlpha = 0.30;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  const body = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  body.addColorStop(0, accent2);
  body.addColorStop(1, accent);
  ctx.fillStyle = body;
  ctx.globalAlpha = 0.88;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(cx - r * 0.3, cy - r * 0.34, r * 0.26, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, base * 1.55, 0, Math.PI * 2);
  ctx.strokeStyle = cachedLine;
  ctx.lineWidth = 1;
  ctx.stroke();
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
  }
  const keys = ['analyzer', 'curve', 'scope', 'radial', 'ribbon', 'dots', 'arc', 'orb'];
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
    else if (key === 'curve') drawCurve(ctx, width, height);
    else if (key === 'scope') drawScope(ctx, width, height);
    else if (key === 'radial') drawRadial(ctx, width, height);
    else if (key === 'ribbon') drawRibbon(ctx, width, height);
    else if (key === 'dots') drawDots(ctx, width, height);
    else if (key === 'arc') drawArc(ctx, width, height);
    else if (key === 'orb') drawOrb(ctx, width, height);
  }
}

function drawVisualizer() {
  if (document.hidden) {
    animationFrame = null;
    return;
  }
  if (analyser && freqData) renderVisualization();
  animationFrame = requestAnimationFrame(drawVisualizer);
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !animationFrame) {
    animationFrame = requestAnimationFrame(drawVisualizer);
  }
});

function openSettings() {
  $('themeSelect').value = state.settings.theme;
  $('languageSelect').value = state.settings.language;
  $('closeToTray').checked = state.settings.closeToTray;
  $('minimizeToTray').checked = state.settings.minimizeToTray;
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
    closeToTray: $('closeToTray').checked,
    minimizeToTray: $('minimizeToTray').checked
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
  $('importFileBtn').addEventListener('click', importFiles);
  $('importFolderBtn').addEventListener('click', importFolder);
  $('playlistSearch').addEventListener('input', renderPlaylist);
  $('sortSelect').addEventListener('change', sortPlaylist);
  $('clearPlaylistBtn').addEventListener('click', clearPlaylist);
  $('trackList').addEventListener('click', (event) => {
    const heart = event.target.closest('.track-heart');
    if (heart) {
      toggleFavorite(Number(heart.dataset.index));
    }
  });
  $('playBtn').addEventListener('click', togglePlay);
  $('prevBtn').addEventListener('click', playPrevious);
  $('nextBtn').addEventListener('click', () => playNext(false));
  $('progress').addEventListener('input', (event) => seekTo(Number(event.target.value) / 1000));
  $('volume').addEventListener('input', (event) => setVolume(Number(event.target.value) / 100));
  $('deviceSelect').addEventListener('change', (event) => {
    api.setSettings({ outputDeviceId: event.target.value });
    applyOutputDevice(event.target.value);
  });
  $('effectsBtn').addEventListener('click', () => {
    $('effectsModal').hidden = false;
  });
  $('closeEffectsBtn').addEventListener('click', () => {
    $('effectsModal').hidden = true;
  });
  $('resetFxBtn').addEventListener('click', resetEffects);
  $('savePresetBtn').addEventListener('click', savePreset);
  $('deletePresetBtn').addEventListener('click', deletePreset);
  $('exportPresetBtn').addEventListener('click', exportPreset);
  $('importPresetBtn').addEventListener('click', importPreset);
  $('loadIRBtn').addEventListener('click', loadIRFile);
  $('irClearBtn').addEventListener('click', clearIR);
  $('irABBtn').addEventListener('click', toggleIRAB);
  $('auditionPulseBtn').addEventListener('click', auditionPulse);
  document.querySelectorAll('.fx-tab').forEach((tab) => {
    tab.addEventListener('click', () => selectFxTab(tab.dataset.fxTab));
  });
  window.addEventListener('message', handleStudioMessage);
  const studioFrame = document.getElementById('irStudioFrame');
  if (studioFrame) studioFrame.addEventListener('load', syncStudioTheme);
  $('presetSelect').addEventListener('change', () => {
    const preset = state.presets.find((item) => item.id === currentPresetId());
    if (preset) applyPreset(preset);
  });
  $('settingsBtn').addEventListener('click', openSettings);
  $('winMinBtn').addEventListener('click', () => api.minimize());
  $('winMaxBtn').addEventListener('click', () => api.maximize());
  $('winCloseBtn').addEventListener('click', () => api.close());
  $('winMiniBtn').addEventListener('click', toggleMiniMode);
  $('miniExitBtn').addEventListener('click', toggleMiniMode);
  $('miniCloseBtn').addEventListener('click', () => api.close());
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
  $('closeSettingsBtn').addEventListener('click', () => { $('settingsModal').hidden = true; });
  $('saveSettingsBtn').addEventListener('click', saveSettings);
  $('aboutBtn').addEventListener('click', openAbout);
  $('closeAboutBtn').addEventListener('click', () => { $('aboutModal').hidden = true; });
  $('viewLicenseBtn').addEventListener('click', () => api.openLicense());
  $('muteBtn').addEventListener('click', toggleMute);
  $('modeBtn').addEventListener('click', cycleMode);
  $('lyricsBtn').addEventListener('click', toggleDesktopLyrics);
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
  $('volume').value = String(Math.round(state.volume * 100));
  $('deviceSelect').innerHTML = `<option value="">${state.settings.language === 'zh' ? '默认输出' : 'System Default'}</option>`;
  applyLanguage(state.settings.language);
  applyTheme(state.settings.theme);
  updateModeButton();
  buildEQ();
  applyEffectsToUI();
  bindUI();
  state.favorites = new Set(await api.getFavorites());
  await loadPresets();
  renderPlaylist();
  updateNowPlaying();
  await enumerateOutputDevices();
  if (state.settings.outputDeviceId) applyOutputDevice(state.settings.outputDeviceId);
  drawVisualizer();
}

init().catch((error) => {
  console.error(error);
});
