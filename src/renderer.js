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
    noLyrics: '暂无歌词',
    soundEffects: '音效',
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
    noLyrics: 'No lyrics',
    soundEffects: 'Effects',
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
    mode: 'bar',
    fftSize: 2048,
    infoVisible: false,
    waterfall: []
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
  const label = resolved === 'system' ? t('themeSystem') : resolved === 'dark' ? t('themeDark') : t('themeLight');
  $('themeSelect').value = resolved;
}

function updateModeButton() {
  const map = { list: '🔁', single: '🔂', random: '🔀' };
  $('modeBtn').textContent = map[state.mode] || '🔁';
  $('modeBtn').title = t('playbackMode') || 'Playback mode';
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
  $('nowTitle').textContent = track ? track.title : t('noTrack');
  $('nowArtist').textContent = track ? (track.artist || '') : '';
  $('nowAlbum').textContent = track ? (track.album || '') : '';
  $('playerTitle').textContent = track ? track.title : t('noTrack');
  $('playerArtist').textContent = track ? (track.artist || '') : '';
  $('totalTime').textContent = track && track.duration ? formatTime(track.duration) : '0:00';
  if (track && track.cover) {
    $('cover').src = track.cover;
    $('cover').classList.add('visible');
    $('miniCover').innerHTML = `<img alt="" src="${track.cover}">`;
  } else {
    $('cover').classList.remove('visible');
    $('cover').removeAttribute('src');
    $('miniCover').textContent = '♪';
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
  $('playBtn').textContent = playing ? '⏸' : '▶';
  $('playBtn').title = playing ? '暂停' : '播放';
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
  $('muteBtn').textContent = state.muted ? '🔇' : '🔊';
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
  $('irName').textContent = fx.ir.filePath ? fx.ir.filePath.split(/[\\/]/).pop() : (state.settings.language === 'zh' ? '未加载 IR' : 'No IR loaded');
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
  state.presets.forEach((preset) => {
    const option = document.createElement('option');
    option.value = preset.id;
    option.textContent = preset.name || preset.id;
    select.appendChild(option);
  });
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
let analyserData = null;
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
  analyser.smoothingTimeConstant = 0.78;
  analyserData = new Uint8Array(analyser.frequencyBinCount);

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
      option.textContent = device.label || `${state.settings.language === 'zh' ? '输出设备' : 'Output'} ${index + 1}`;
      select.appendChild(option);
    });
    if (state.settings.outputDeviceId) {
      select.value = state.settings.outputDeviceId;
    }
  } catch (error) {
    console.warn('enumerateDevices failed', error);
  }
}

function getAccentColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#6f92ff';
}

function getAccent2Color() {
  return getComputedStyle(document.documentElement).getPropertyValue('--accent-2').trim() || '#9b82ff';
}

function updateAudioInfo() {
  if (!state.visual.infoVisible) return;
  const track = state.currentTrack;
  const fileLines = [];
  if (track) {
    fileLines.push(`文件：${track.title}`);
    fileLines.push(`路径：${track.path}`);
    if (track.sampleRate) fileLines.push(`采样率：${track.sampleRate} Hz`);
    if (track.bitrate) fileLines.push(`比特率：${track.bitrate} bps`);
    if (track.channels) fileLines.push(`声道：${track.channels}`);
    if (track.bitdepth) fileLines.push(`位深：${track.bitdepth} bit`);
    if (track.codec) fileLines.push(`编码：${track.codec}`);
    if (track.duration) fileLines.push(`时长：${formatTime(track.duration)}`);
  } else {
    fileLines.push('未加载音频');
  }
  $('fileInfo').innerHTML = fileLines.map((line) => `<div>${line}</div>`).join('');

  if (analyser && state.isPlaying) {
    const timeData = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(timeData);
    let sumL = 0;
    let sumR = 0;
    let peakL = 0;
    let peakR = 0;
    for (let i = 0; i < timeData.length; i += 2) {
      const l = timeData[i];
      const r = timeData[i + 1] ?? l;
      sumL += l * l;
      sumR += r * r;
      peakL = Math.max(peakL, Math.abs(l));
      peakR = Math.max(peakR, Math.abs(r));
    }
    const rmsL = Math.sqrt(sumL / (timeData.length / 2));
    const rmsR = Math.sqrt(sumR / (timeData.length / 2));
    analyser.getByteFrequencyData(analyserData);
    let dominant = 0;
    let maxBin = 0;
    for (let i = 0; i < analyserData.length; i++) {
      if (analyserData[i] > maxBin) {
        maxBin = analyserData[i];
        dominant = i;
      }
    }
    const nyquist = (audioContext?.sampleRate || 48000) / 2;
    const dominantHz = Math.round((dominant / analyserData.length) * nyquist);
    const db = (value) => value > 0 ? (20 * Math.log10(value)).toFixed(1) : '-∞';
    $('liveInfo').innerHTML = [
      `<div>L RMS：${db(rmsL)} dB</div>`,
      `<div>R RMS：${db(rmsR)} dB</div>`,
      `<div>L Peak：${db(peakL)} dB</div>`,
      `<div>R Peak：${db(peakR)} dB</div>`,
      `<div>主频：${dominantHz} Hz</div>`
    ].join('');
  } else {
    $('liveInfo').innerHTML = '<div>等待播放</div>';
  }
}

function drawVisualizer() {
  const canvas = $('visualizer');
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  if (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr)) {
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const width = canvas.width;
  const height = canvas.height;
  const hint = $('visualHint');
  const mode = state.visual.mode;
  const accent = getAccentColor();
  const accent2 = getAccent2Color();

  if (analyser && state.isPlaying) {
    hint.style.display = 'none';
    if (mode === 'waveform') {
      const timeData = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(timeData);
      ctx.beginPath();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.shadowColor = accent;
      ctx.shadowBlur = 8;
      for (let i = 0; i < timeData.length; i++) {
        const x = (i / timeData.length) * width;
        const y = height / 2 + timeData[i] * height * 0.48;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (mode === 'radial') {
      analyser.getByteFrequencyData(analyserData);
      const cx = width / 2;
      const cy = height / 2;
      const maxRadius = Math.min(width, height) * 0.42;
      ctx.lineWidth = 2;
      for (let i = 0; i < analyserData.length; i++) {
        const value = analyserData[i] / 255;
        const angle = (i / analyserData.length) * Math.PI * 2 - Math.PI / 2;
        const r = 12 + value * maxRadius;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = accent;
      ctx.stroke();
    } else if (mode === 'waterfall') {
      analyser.getByteFrequencyData(analyserData);
      state.visual.waterfall.unshift(Array.from(analyserData));
      if (state.visual.waterfall.length > 120) state.visual.waterfall.pop();
      const rows = state.visual.waterfall.length;
      for (let y = 0; y < rows; y++) {
        const data = state.visual.waterfall[y];
        for (let x = 0; x < data.length; x++) {
          const value = data[x] / 255;
          const px = (x / data.length) * width;
          const py = height - (y / rows) * height;
          ctx.fillStyle = `hsla(${200 + value * 90}, 95%, ${28 + value * 52}%, 1)`;
          ctx.fillRect(px, py, Math.max(1, width / data.length), Math.max(1, height / rows));
        }
      }
    } else if (mode === 'line') {
      analyser.getByteFrequencyData(analyserData);
      ctx.beginPath();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.shadowColor = accent;
      ctx.shadowBlur = 7;
      for (let i = 0; i < analyserData.length; i++) {
        const value = analyserData[i] / 255;
        const x = (i / analyserData.length) * width;
        const y = height - value * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else {
      analyser.getByteFrequencyData(analyserData);
      const barWidth = Math.max(2, width / analyserData.length);
      const bars = Math.min(analyserData.length, Math.floor(width / barWidth));
      for (let i = 0; i < bars; i++) {
        const value = analyserData[i] / 255;
        const barHeight = value * height * 0.9;
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, accent);
        gradient.addColorStop(1, accent2);
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.55 + value * 0.45;
        ctx.beginPath();
        ctx.roundRect(i * barWidth, height - barHeight, barWidth - 1, barHeight, 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    updateAudioInfo();
  } else {
    hint.style.display = 'flex';
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.strokeStyle = 'rgba(120,130,150,0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  animationFrame = requestAnimationFrame(drawVisualizer);
}

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
    $('dropHint').style.borderColor = 'var(--accent)';
  });
  document.addEventListener('dragleave', (event) => {
    event.preventDefault();
    $('dropHint').style.borderColor = '';
  });
  document.addEventListener('drop', async (event) => {
    event.preventDefault();
    $('dropHint').style.borderColor = '';
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
  $('muteBtn').addEventListener('click', toggleMute);
  $('modeBtn').addEventListener('click', cycleMode);
  $('deviceSelect').addEventListener('change', (event) => {
    api.setSettings({ outputDeviceId: event.target.value });
    applyOutputDevice(event.target.value);
  });
  $('resetFxBtn').addEventListener('click', resetEffects);
  $('savePresetBtn').addEventListener('click', savePreset);
  $('deletePresetBtn').addEventListener('click', deletePreset);
  $('exportPresetBtn').addEventListener('click', exportPreset);
  $('importPresetBtn').addEventListener('click', importPreset);
  $('loadIRBtn').addEventListener('click', loadIRFile);
  $('irClearBtn').addEventListener('click', clearIR);
  $('irABBtn').addEventListener('click', toggleIRAB);
  $('presetSelect').addEventListener('change', () => {
    const preset = state.presets.find((item) => item.id === currentPresetId());
    if (preset) applyPreset(preset);
  });
  $('lyricsBtn').addEventListener('click', toggleDesktopLyrics);
  $('settingsBtn').addEventListener('click', openSettings);
  $('closeSettingsBtn').addEventListener('click', () => { $('settingsModal').hidden = true; });
  $('saveSettingsBtn').addEventListener('click', saveSettings);
  $('aboutBtn').addEventListener('click', openAbout);
  $('closeAboutBtn').addEventListener('click', () => { $('aboutModal').hidden = true; });
  $('viewLicenseBtn').addEventListener('click', () => api.openLicense());
  $('spectrumMode').addEventListener('change', (event) => {
    state.visual.mode = event.target.value;
    if (event.target.value !== 'waterfall') state.visual.waterfall = [];
  });
  $('fftSizeSelect').addEventListener('change', (event) => {
    state.visual.fftSize = Number(event.target.value);
    if (analyser) {
      analyser.fftSize = state.visual.fftSize;
      analyserData = new Uint8Array(analyser.frequencyBinCount);
    }
  });
  $('toggleInfoBtn').addEventListener('click', () => {
    state.visual.infoVisible = !state.visual.infoVisible;
    $('audioInfo').hidden = !state.visual.infoVisible;
  });
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
  $('deviceSelect').innerHTML = '<option value="">默认输出</option>';
  applyLanguage(state.settings.language);
  applyTheme(state.settings.theme);
  updateModeButton();
  buildEQ();
  applyEffectsToUI();
  $('spectrumMode').value = state.visual.mode;
  $('fftSizeSelect').value = String(state.visual.fftSize);
  $('audioInfo').hidden = !state.visual.infoVisible;
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
