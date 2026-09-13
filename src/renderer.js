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
    soundEffects: '实时音效',
    pulseFeedback: '脉冲反馈',
    reset: '重置',
    preset: '预设',
    newPreset: '新建预设',
    clipper: '削波 / 饱和',
    delay: '延迟 / 回声',
    chorus: '合唱',
    flanger: '镶边',
    delayTime: '延迟时间',
    feedback: '反馈',
    pingPong: '乒乓',
    rate: '速率',
    depth: '深度',
    spread: '左右错开',
    mode: '模式',
    clipSoft: '软削波',
    clipHard: '硬削波',
    outputGain: '输出',
    off: '关',
    on: '开',
    collapse: '折叠 / 展开',
    eqPresetDefault: '默认',
    eqPresetClassical: '古典',
    eqPresetHeavyMetal: '重金属',
    eqPresetPop: '流行',
    eqPresetJazz: '爵士',
    eqPresetFolk: '民谣',
    eqPresetRock: '摇滚',
    eqPresetElectronic: '电子',
    updateSection: '版本更新',
    currentVersion: '当前版本',
    updateStatus: '更新状态',
    updateIdle: '尚未检查',
    checkUpdate: '检查更新',
    updateChecking: '正在检查更新…',
    updateUpToDate: '当前已经是最新版本',
    updateAvailable: '发现新版本',
    updateNotes: '更新说明',
    installNow: '立即更新',
    cancelDownload: '取消下载',
    updateDownloading: '下载中',
    updateDownloadDone: '下载完成',
    updateVerifying: '验证更新',
    updateReady: '安装准备完成',
    updateFailed: '更新失败',
    updateNetError: '检查更新失败（网络不可用或无法连接更新源）',
    updateNotFound: '更新源上还没有正式版本',
    updateChecksumFailed: '更新包校验不通过，已停止更新',
    updateCancelled: '已取消下载',
    updatePortable: '便携版无法自动安装更新，请打开发布页下载新版本后手动替换',
    openReleasePage: '打开发布页',
    autoCheckUpdate: '自动检查更新',
    updateNewVersionIs: '新版本',
    updatePublishedAt: '发布时间',
    restartNow: '重新启动',
    dynEq: '动态 EQ',
    mbComp: '多段压缩',
    deesser: '去齿音',
    expander: '扩展器',
    transient: '瞬态整形',
    frequency: '频率',
    q: 'Q 值',
    gain: '增益',
    range: '作用范围',
    lowXover: '低频分频',
    highXover: '高频分频',
    lowGain: '低频增益',
    midGain: '中频增益',
    highGain: '高频增益',
    transientAttack: '起音',
    transientSustain: '延音',
    delayFilter: '反馈滤波',
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
    lookahead: '前瞻',
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
    toastPresetRenamed: '预设已重命名',
    externalLoaded: '外部加载',
    rename: '重命名',
    presetName: '名称',
    presetNamePlaceholder: 'RlonIR_',
    toastPresetExported: '预设已导出',
    toastPresetImported: '预设已导入',
    toastReset: '音效已重置',
    toastNoPreset: '请先选择或命名预设',
    toastNoTrack: '请先导入本地音乐',
    toastUnsupported: '该文件格式暂不支持，可尝试转换后导入',
    about: '关于 RlonDSP',
    upstreamProject: '开源致谢',
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
    irsSection: '空间音效',
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
    soundEffects: 'Real-time Effects',
    pulseFeedback: 'Pulse Feedback',
    reset: 'Reset',
    preset: 'Presets',
    newPreset: 'New preset',
    clipper: 'Clipper / Saturation',
    delay: 'Delay / Echo',
    chorus: 'Chorus',
    flanger: 'Flanger',
    delayTime: 'Delay time',
    feedback: 'Feedback',
    pingPong: 'Ping-pong',
    rate: 'Rate',
    depth: 'Depth',
    spread: 'Stereo spread',
    mode: 'Mode',
    clipSoft: 'Soft clip',
    clipHard: 'Hard clip',
    outputGain: 'Output',
    off: 'Off',
    on: 'On',
    collapse: 'Collapse / expand',
    eqPresetDefault: 'Default',
    eqPresetClassical: 'Classical',
    eqPresetHeavyMetal: 'Heavy Metal',
    eqPresetPop: 'Pop',
    eqPresetJazz: 'Jazz',
    eqPresetFolk: 'Folk',
    eqPresetRock: 'Rock',
    eqPresetElectronic: 'Electronic',
    updateSection: 'Software update',
    currentVersion: 'Current version',
    updateStatus: 'Status',
    updateIdle: 'Not checked yet',
    checkUpdate: 'Check for updates',
    updateChecking: 'Checking for updates…',
    updateUpToDate: 'You are up to date',
    updateAvailable: 'Update available',
    updateNotes: 'Release notes',
    installNow: 'Update now',
    cancelDownload: 'Cancel download',
    updateDownloading: 'Downloading',
    updateDownloadDone: 'Download complete',
    updateVerifying: 'Verifying update',
    updateReady: 'Ready to install',
    updateFailed: 'Update failed',
    updateNetError: 'Check failed (network or update source unreachable)',
    updateNotFound: 'No published release yet',
    updateChecksumFailed: 'Update package failed verification; aborted',
    updateCancelled: 'Download cancelled',
    updatePortable: 'The portable build cannot auto-install. Open the release page and replace it manually.',
    openReleasePage: 'Open release page',
    autoCheckUpdate: 'Check for updates automatically',
    updateNewVersionIs: 'New version',
    updatePublishedAt: 'Published',
    restartNow: 'Restart',
    dynEq: 'Dynamic EQ',
    mbComp: 'Multiband Compressor',
    deesser: 'De-esser',
    expander: 'Expander',
    transient: 'Transient Shaper',
    frequency: 'Frequency',
    q: 'Q',
    gain: 'Gain',
    range: 'Range',
    lowXover: 'Low crossover',
    highXover: 'High crossover',
    lowGain: 'Low gain',
    midGain: 'Mid gain',
    highGain: 'High gain',
    transientAttack: 'Attack',
    transientSustain: 'Sustain',
    delayFilter: 'Feedback filter',
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
    lookahead: 'Lookahead',
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
    toastPresetRenamed: 'Preset renamed',
    externalLoaded: 'External',
    rename: 'Rename',
    presetName: 'Name',
    presetNamePlaceholder: 'RlonIR_',
    toastPresetExported: 'Preset exported',
    toastPresetImported: 'Preset imported',
    toastReset: 'Effects reset',
    toastNoPreset: 'Select or name a preset first',
    toastNoTrack: 'Import local music first',
    toastUnsupported: 'This format is not supported, please convert it first',
    about: 'About RlonDSP',
    upstreamProject: 'Acknowledgements',
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
    irsSection: 'Spatial Audio',
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
  compressor: { thresholdDB: -24, ratio: 4, attackMs: 10, releaseMs: 120 },
  bass: { gainDB: 6, crossoverHz: 80 },
  stereo: { width: 0.5 },
  surround: { roomSize: 1 },
  clarity: { strength: 0.5 },
  tube: { drive: 0.3 },
  reverb: { roomSize: 1, t60: 2.6, damping: 0.55, wet: 0.32, predelay: 0.02 },
  gate: { threshold: -52, releaseMs: 180 },
  limiter: { ceilingDB: -1, lookaheadMs: 2, releaseMs: 60 },
  // 差分环绕：延迟声道（L/R）与延迟毫秒数
  channelDelay: { enabled: false, channel: 'R', ms: 15 },
  // 延迟 / 回声（可交叉反馈做乒乓）
  delay: { timeMs: 320, feedback: 0.35, mix: 0.25, pingPong: false, filterHz: 20000 },
  // 合唱：速率 / 深度 / 干湿 / 左右错开
  chorus: { rateHz: 0.6, depthMs: 6, mix: 0.4, spread: 0.5 },
  // 镶边：速率 / 深度 / 反馈 / 干湿
  flanger: { rateHz: 0.25, depthMs: 3, feedback: 0.4, mix: 0.45 },
  // 削波 / 饱和：驱动 / 模式 / 输出补偿
  clipper: { drive: 2, mode: 'soft', thresholdDB: -6, ceilingDB: 0, mix: 1, outputDB: 0 },
  // 扩展器 / 瞬态整形 / 去齿音 / 动态 EQ / 多段压缩
  expander: { threshold: -40, ratio: 2, attackMs: 5, releaseMs: 150, range: 24 },
  transient: { attack: 0.5, sustain: 0.5, mix: 1, outputDB: 0 },
  deesser: { freq: 6000, threshold: -24, range: 12, attackMs: 1, releaseMs: 60 },
  dynEq: { freq: 200, q: 1.2, gainDB: -6, threshold: -30, range: 12, attackMs: 10, releaseMs: 150 },
  mbComp: {
    lowXover: 200, highXover: 3000, lowGainDB: 0, midGainDB: 0, highGainDB: 0,
    threshold: -20, ratio: 3, attackMs: 10, releaseMs: 120
  },
  ir: { enabled: false, filePath: '', wet: 0.35, predelay: 0.02, highpass: 20, lowpass: 20000, ab: false }
};

/* ============================================================================
 * Unified DSP Graph —— 统一 DSP 图谱
 *
 * RlonDSP 内置 DSP、原生引擎、第三方 Provider、空间音效、卷积、分析器
 * 都是同一张图里的节点，可以同时启用、按图里的顺序共同工作。
 *
 * 规则：
 *   - 同一种功能可以存在多个独立节点（例如两个均衡器），由用户明确加入；
 *   - 只有用户加进图里、且启用未旁通的节点才会进入执行计划；
 *   - 每个进入计划的节点恰好执行一次，不存在隐式的重复处理；
 *   - 每个节点自带延迟、尾音、通道要求，整图延迟与尾音由图谱汇总。
 * ========================================================================== */
const dspHost = (window.RlonDspHost && typeof window.RlonDspHost.createDspHost === 'function')
  ? window.RlonDspHost.createDspHost({
      onLog: (entry) => {
        if (window.__rlondspDebug) console.debug('[DSP Graph]', entry.type, entry.detail);
      }
    })
  : null;

/**
 * RlonDSP 内置 DSP 的节点清单。
 * owner 固定为 rlondsp；将来原生引擎与第三方 Provider 会用各自的 owner
 * 注册同名类型的实现，它们与内置节点并存、互不排斥。
 */
const DSP_BUILTIN_SPECS = [
  // 顺序与音频线程里的实际处理顺序一致
  { type: 'bass', name: '低音增强', latencyFrames: 0, tailFrames: 0, key: 'bass' },
  { type: 'eq', name: '均衡器', latencyFrames: 0, tailFrames: 0, key: 'eq' },
  { type: 'compressor', name: '压缩器', latencyFrames: 0, tailFrames: 0, key: 'compressor' },
  { type: 'clarity', name: '清晰度增强', latencyFrames: 0, tailFrames: 0, key: 'clarity' },
  { type: 'stereo', name: '立体声增强', latencyFrames: 0, tailFrames: 0, key: 'stereo' },
  { type: 'spatial', name: '空间音效', latencyFrames: 0, tailFrames: 2048, key: 'surround' },
  { type: 'tube', name: '胆机模拟', latencyFrames: 0, tailFrames: 0, key: 'tube' },
  { type: 'ultrasonic', name: '超高频净化', latencyFrames: 0, tailFrames: 0, key: 'ultrasonic' },
  { type: 'clipper', name: '削波 / 饱和', latencyFrames: 0, tailFrames: 0, key: 'clipper' },
  { type: 'reverb', name: '混响', latencyFrames: 0, tailFrames: 24000, key: 'reverb' },
  { type: 'gate', name: '降噪', latencyFrames: 0, tailFrames: 0, key: 'noiseGate' },
  { type: 'gain', name: '总增益', latencyFrames: 0, tailFrames: 0, key: 'gain' },
  { type: 'limiter', name: '限幅', latencyFrames: 96, tailFrames: 0, key: 'limiter' },
  // 差分环绕：把选定声道整体延后，制造左右时间差（Haas 效应）
  { type: 'channel-delay', name: '差分环绕（声道延迟）', latencyFrames: 0, tailFrames: 0, key: 'channelDelay' },
  // 时间 / 调制类：延迟线共用同一套基础设施（DelayLine），延迟与尾音如实上报
  { type: 'delay', name: '延迟 / 回声', latencyFrames: 0, tailFrames: 96000, key: 'delay' },
  { type: 'chorus', name: '合唱', latencyFrames: 0, tailFrames: 4096, key: 'chorus' },
  { type: 'flanger', name: '镶边', latencyFrames: 0, tailFrames: 4096, key: 'flanger' },
  // —— 追加的效果器（按实时音效列表末尾的顺序注册）——
  { type: 'dyn-eq', name: '动态 EQ', latencyFrames: 0, tailFrames: 0, key: 'dynEq' },
  { type: 'mb-comp', name: '多段压缩', latencyFrames: 0, tailFrames: 0, key: 'mbComp' },
  { type: 'deesser', name: '去齿音', latencyFrames: 0, tailFrames: 0, key: 'deesser' },
  { type: 'expander', name: '扩展器', latencyFrames: 0, tailFrames: 0, key: 'expander' },
  { type: 'transient', name: '瞬态整形', latencyFrames: 0, tailFrames: 0, key: 'transient' },
  // 卷积在渲染进程的 Web Audio 图里执行，位于内置链条之后
  { type: 'convolution', name: '脉冲卷积（IRS）', latencyFrames: 0, tailFrames: 48000, key: 'ir' }
];

if (dspHost) {
  DSP_BUILTIN_SPECS.forEach((spec) => {
    dspHost.defineNode({
      type: spec.type,
      owner: 'rlondsp',
      name: spec.name,
      implementation: 'builtin',
      latencyFrames: spec.latencyFrames,
      tailFrames: spec.tailFrames,
      realtimeSafe: true,
      capabilities: ['serial', 'runtime-editable']
    });
    dspHost.addNode({ type: spec.type, owner: 'rlondsp', id: 'rlondsp:' + spec.type });
  });
  window.__dspHost = dspHost;
}

/** 某个内置节点是否仍在执行计划里（被停用、旁通或被 Provider 顶掉时为 false） */
function builtinActive(type) {
  if (!dspHost) return true;
  return dspHost.activeNodeIds().indexOf('rlondsp:' + type) >= 0;
}

/**
 * 把当前音效状态同步到图谱：启用状态、参数、以及卷积资源。
 * 图谱只反映用户的实际选择，不会自行添加节点。
 */
function syncDspGraph() {
  if (!dspHost) return;
  const fx = state.effects;
  DSP_BUILTIN_SPECS.forEach((spec) => {
    const id = 'rlondsp:' + spec.type;
    const on = spec.type === 'gain'
      ? Math.abs(fx.masterGain) > 0.05
      : spec.type === 'eq'
        ? fx.eqGains.some((g) => Math.abs(g) > 0.05)
        : spec.type === 'convolution'
          ? !!fx.ir.enabled
          : spec.type === 'channel-delay'
            ? !!fx.channelDelay.enabled
            : !!fx.enabled[spec.key];
    dspHost.setEnabled(id, on || spec.type === 'limiter');
    dspHost.setParam(id, 'enabled', on);
  });
}

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
    // 制作器加载/切主题时同步一次「脉冲名称」的建议默认名
    pushPulseNameSuggestion();
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
  applyCoverBackground(track);
}

/* ============================================================================
 * 动态专辑环境背景（Dynamic Album Environment Background）
 * --------------------------------------------------------------------------
 * 复用现有的专辑封面数据（track.cover，渲染进程已有的 artwork 来源），
 * 在原「静态模糊底」的位置升级为动态环境层，不新建第二套封面/主题系统。
 *
 * 工作原理：
 *   封面 → 大幅放大（图层比窗口大 70%）→ 严重模糊 → cover 铺满
 *        → 由 4 组低频正弦叠加驱动的缓慢漂移 / 呼吸 → 全窗口背景
 *
 * 关键约束：
 *   - 运动只写 transform / opacity（GPU 合成）：不重绘图片、不重复模糊、不重新解码；
 *   - 轨迹由多组低频正弦叠加（主周期约 7～20 秒），连续且不可预测，不是左右往返；
 *   - 切歌先预加载新封面，加载成功才交叉淡化（1.1 s），失败保持旧背景不闪；
 *   - 无封面时整体淡出，回退到原有渐变背景（不出现破图 / 黑框）；
 *   - 暂停播放时运动幅度平滑降到 30%，恢复播放平滑回到 100%，位置不跳变；
 *   - 页面不可见时立即停表，避免后台空转；只操作两个图层，不产生额外 DOM。
 *   - 只属于渲染层，完全不接触音频链路（DSP / AudioWorklet / 引擎均不涉及）。
 * ========================================================================== */
const AlbumEnv = (() => {
  const TARGET_FPS = 30;      // 漂移速度调快后，30 帧写入足以保持顺滑
  const PAUSED_AMP = 0.3;     // 暂停时的运动幅度
  const layers = [];
  let frontIndex = 0;
  let currentCover = '';
  let pendingCover = '';
  let rafId = 0;
  let lastApply = 0;
  let clock = 0;        // 累计运行时间（秒）；窗口不可见时不推进，避免回到前台突然跳位
  let lastTick = 0;
  let ampTarget = 1;
  let ampNow = 1;
  let running = false;
  let reduceMotion = false;

  function init() {
    if (layers.length) return true;
    const a = document.getElementById('albumEnvA');
    const b = document.getElementById('albumEnvB');
    if (!a || !b) return false;
    layers.push(a, b);
    clock = 0;
    lastTick = 0;
    try {
      reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (error) {
      reduceMotion = false;
    }
    return true;
  }

  /** 当前可见的图层（新封面淡入后切换到这个索引） */
  function front() {
    return layers[frontIndex];
  }

  /** 把运动轨迹写到两个图层：这样新图层在淡入前就已经处于正确位置，不会跳 */
  function applyTransform() {
    if (!layers.length) return;
    const t = clock;
    const amp = reduceMotion ? 0 : ampNow;
    // 多组低频正弦叠加：连续、平滑、没有明显规律。
    // 主周期约 7～20 秒（此前 20～60 秒偏慢），所以整体漂移明显更活。
    const x = (Math.sin(t * 0.38) * 1.8 + Math.sin(t * 0.85 + 1.7) * 1.2) * amp;
    const y = (Math.sin(t * 0.31 + 0.9) * 1.7 + Math.sin(t * 0.71 + 2.6) * 1.1) * amp;
    const scale = 1.13 + (Math.sin(t * 0.22 + 0.4) * 0.03 + Math.sin(t * 0.52 + 1.1) * 0.018) * amp;
    const rotate = (Math.sin(t * 0.19 + 2.2) * 0.22 + Math.sin(t * 0.47 + 0.3) * 0.1) * amp;
    const value = 'translate3d(' + x.toFixed(3) + '%, ' + y.toFixed(3) + '%, 0) '
      + 'scale(' + scale.toFixed(4) + ') rotate(' + rotate.toFixed(3) + 'deg)';
    for (let i = 0; i < layers.length; i++) layers[i].style.transform = value;
  }

  function tick(now) {
    rafId = 0;
    if (!running) return;
    // 用「只在运行时推进」的时间轴：窗口被遮挡或最小化时系统会节流，
    // 回到前台时从这里接着走，不会因为跳过大段实时时间而突然跳位。
    if (lastTick) clock += Math.min(0.25, (now - lastTick) / 1000);
    lastTick = now;
    // 幅度平滑靠拢目标值：暂停 / 恢复不会突然跳变（约 2 秒过渡）
    ampNow += (ampTarget - ampNow) * 0.045;
    if (now - lastApply >= 1000 / TARGET_FPS) {
      lastApply = now;
      applyTransform();
    }
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (running || !init() || !currentCover) return;
    running = true;
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    lastTick = 0;      // 停表：下次恢复时从当前时间点继续，不补跳
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  /** 清空两层并停表（没有封面时回退到原有渐变背景） */
  function clear() {
    currentCover = '';
    pendingCover = '';
    layers.forEach((layer) => {
      layer.classList.remove('is-visible');
      layer.style.backgroundImage = '';
    });
    stop();
  }

  function setCover(url) {
    if (!init()) return;
    if (!url) {
      clear();
      return;
    }
    if (url === currentCover) return;
    pendingCover = url;
    // 先加载 + 解码，成功后才进入交叉淡化：不先清空旧背景
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      if (pendingCover !== url) return;             // 期间又切歌，丢弃这次结果
      const target = layers[1 - frontIndex];
      target.style.backgroundImage = 'url("' + url + '")';
      applyTransform();                             // 先摆到当前运动位置，避免跳变
      target.classList.add('is-visible');
      const previous = layers[frontIndex];
      previous.classList.remove('is-visible');
      frontIndex = 1 - frontIndex;
      currentCover = url;
      start();
      // 旧图淡出完成后释放引用，避免多首歌曲累积
      window.setTimeout(() => {
        if (previous !== layers[frontIndex]) previous.style.backgroundImage = '';
      }, 1500);
    };
    image.onerror = () => {
      // 加载失败：保持当前背景，不闪、不回退到空白
      console.warn('[AlbumEnv] 封面加载失败，保持当前背景');
    };
    image.src = url;
  }

  /** 播放状态变化时调整运动幅度（暂停 30%，播放 100%） */
  function setPlaying(playing) {
    ampTarget = playing ? 1 : PAUSED_AMP;
    if (playing) start();
  }

  return { setCover, setPlaying, start, stop, clear };
})();

/**
 * 把当前歌曲的专辑封面送到最底层做为环境背景。
 * 封面本身只作为图片资源使用，柔化由图层自身的模糊完成；
 * 没有封面时整体淡出，自动回退到原本的渐变背景。
 */
function applyCoverBackground(track) {
  AlbumEnv.setCover(track && track.cover ? track.cover : '');
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
  // 暂停时专辑环境背景的运动平滑放缓（不是突然冻结），恢复播放再平滑回来
  safeRun('专辑环境背景播放状态', () => AlbumEnv.setPlaying(playing));
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
  // 均衡器风格高亮：与曲线一致才点亮，手动拖动后自动取消
  syncEqPresetButtons();
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
  $('fxDelay').checked = fx.enabled.delay;
  $('fxChorus').checked = fx.enabled.chorus;
  $('fxFlanger').checked = fx.enabled.flanger;
  $('fxClipper').checked = fx.enabled.clipper;
  $('clipDrive').value = String(fx.clipper.drive);
  $('clipDriveVal').textContent = fx.clipper.drive.toFixed(1);
  $('clipMode').value = fx.clipper.mode;
  $('clipOutput').value = String(fx.clipper.outputDB);
  $('clipOutputVal').textContent = `${fx.clipper.outputDB.toFixed(1)} dB`;
  $('delayTime').value = String(fx.delay.timeMs);
  $('delayTimeVal').textContent = `${fx.delay.timeMs} ms`;
  $('delayFeedback').value = String(Math.round(fx.delay.feedback * 100));
  $('delayFeedbackVal').textContent = fx.delay.feedback.toFixed(2);
  $('delayMix').value = String(Math.round(fx.delay.mix * 100));
  $('delayMixVal').textContent = fx.delay.mix.toFixed(2);
  $('delayPingPong').value = fx.delay.pingPong ? 'on' : 'off';
  $('chorusRate').value = String(Math.round(fx.chorus.rateHz * 100));
  $('chorusRateVal').textContent = `${fx.chorus.rateHz.toFixed(2)} Hz`;
  $('chorusDepth').value = String(fx.chorus.depthMs);
  $('chorusDepthVal').textContent = `${fx.chorus.depthMs.toFixed(1)} ms`;
  $('chorusMix').value = String(Math.round(fx.chorus.mix * 100));
  $('chorusMixVal').textContent = fx.chorus.mix.toFixed(2);
  $('chorusSpread').value = String(Math.round(fx.chorus.spread * 100));
  $('chorusSpreadVal').textContent = fx.chorus.spread.toFixed(2);
  $('flangerRate').value = String(Math.round(fx.flanger.rateHz * 100));
  $('flangerRateVal').textContent = `${fx.flanger.rateHz.toFixed(2)} Hz`;
  $('flangerDepth').value = String(fx.flanger.depthMs);
  $('flangerDepthVal').textContent = `${fx.flanger.depthMs.toFixed(1)} ms`;
  $('flangerFeedback').value = String(Math.round(fx.flanger.feedback * 100));
  $('flangerFeedbackVal').textContent = fx.flanger.feedback.toFixed(2);
  $('flangerMix').value = String(Math.round(fx.flanger.mix * 100));
  $('flangerMixVal').textContent = fx.flanger.mix.toFixed(2);
  // —— 追加的效果器 ——
  $('fxDynEq').checked = fx.enabled.dynEq;
  $('fxMbComp').checked = fx.enabled.mbComp;
  $('fxDeesser').checked = fx.enabled.deesser;
  $('fxExpander').checked = fx.enabled.expander;
  $('fxTransient').checked = fx.enabled.transient;
  $('clipThreshold').value = String(fx.clipper.thresholdDB);
  $('clipThresholdVal').textContent = `${fx.clipper.thresholdDB.toFixed(1)} dB`;
  $('clipCeiling').value = String(fx.clipper.ceilingDB);
  $('clipCeilingVal').textContent = `${fx.clipper.ceilingDB.toFixed(1)} dB`;
  $('clipMix').value = String(Math.round(fx.clipper.mix * 100));
  $('clipMixVal').textContent = fx.clipper.mix.toFixed(2);
  $('delayFilter').value = String(Math.round(fx.delay.filterHz || 20000));
  $('delayFilterVal').textContent = `${Math.round(fx.delay.filterHz || 20000)} Hz`;
  $('dynEqFreq').value = String(fx.dynEq.freq);
  $('dynEqFreqVal').textContent = `${fx.dynEq.freq} Hz`;
  $('dynEqQ').value = String(fx.dynEq.q);
  $('dynEqQVal').textContent = fx.dynEq.q.toFixed(2);
  $('dynEqGain').value = String(fx.dynEq.gainDB);
  $('dynEqGainVal').textContent = `${fx.dynEq.gainDB.toFixed(1)} dB`;
  $('dynEqThreshold').value = String(fx.dynEq.threshold);
  $('dynEqThresholdVal').textContent = `${fx.dynEq.threshold} dB`;
  $('dynEqRange').value = String(fx.dynEq.range);
  $('dynEqRangeVal').textContent = `${fx.dynEq.range} dB`;
  $('dynEqAttack').value = String(fx.dynEq.attackMs);
  $('dynEqAttackVal').textContent = `${fx.dynEq.attackMs} ms`;
  $('dynEqRelease').value = String(fx.dynEq.releaseMs);
  $('dynEqReleaseVal').textContent = `${fx.dynEq.releaseMs} ms`;
  $('mbLowXover').value = String(fx.mbComp.lowXover);
  $('mbLowXoverVal').textContent = `${fx.mbComp.lowXover} Hz`;
  $('mbHighXover').value = String(fx.mbComp.highXover);
  $('mbHighXoverVal').textContent = `${fx.mbComp.highXover} Hz`;
  $('mbThreshold').value = String(fx.mbComp.threshold);
  $('mbThresholdVal').textContent = `${fx.mbComp.threshold} dB`;
  $('mbRatio').value = String(fx.mbComp.ratio);
  $('mbRatioVal').textContent = `${fx.mbComp.ratio.toFixed(1)}:1`;
  $('mbAttack').value = String(fx.mbComp.attackMs);
  $('mbAttackVal').textContent = `${fx.mbComp.attackMs} ms`;
  $('mbRelease').value = String(fx.mbComp.releaseMs);
  $('mbReleaseVal').textContent = `${fx.mbComp.releaseMs} ms`;
  $('mbLowGain').value = String(fx.mbComp.lowGainDB);
  $('mbLowGainVal').textContent = `${fx.mbComp.lowGainDB.toFixed(1)} dB`;
  $('mbMidGain').value = String(fx.mbComp.midGainDB);
  $('mbMidGainVal').textContent = `${fx.mbComp.midGainDB.toFixed(1)} dB`;
  $('mbHighGain').value = String(fx.mbComp.highGainDB);
  $('mbHighGainVal').textContent = `${fx.mbComp.highGainDB.toFixed(1)} dB`;
  $('dsFreq').value = String(fx.deesser.freq);
  $('dsFreqVal').textContent = `${fx.deesser.freq} Hz`;
  $('dsThreshold').value = String(fx.deesser.threshold);
  $('dsThresholdVal').textContent = `${fx.deesser.threshold} dB`;
  $('dsRange').value = String(fx.deesser.range);
  $('dsRangeVal').textContent = `${fx.deesser.range} dB`;
  $('dsAttack').value = String(fx.deesser.attackMs);
  $('dsAttackVal').textContent = `${fx.deesser.attackMs} ms`;
  $('dsRelease').value = String(fx.deesser.releaseMs);
  $('dsReleaseVal').textContent = `${fx.deesser.releaseMs} ms`;
  $('expThreshold').value = String(fx.expander.threshold);
  $('expThresholdVal').textContent = `${fx.expander.threshold} dB`;
  $('expRatio').value = String(fx.expander.ratio);
  $('expRatioVal').textContent = `${fx.expander.ratio.toFixed(1)}:1`;
  $('expAttack').value = String(fx.expander.attackMs);
  $('expAttackVal').textContent = `${fx.expander.attackMs} ms`;
  $('expRelease').value = String(fx.expander.releaseMs);
  $('expReleaseVal').textContent = `${fx.expander.releaseMs} ms`;
  $('expRange').value = String(fx.expander.range);
  $('expRangeVal').textContent = `${fx.expander.range} dB`;
  $('trAttack').value = String(Math.round(fx.transient.attack * 100));
  $('trAttackVal').textContent = fx.transient.attack.toFixed(2);
  $('trSustain').value = String(Math.round(fx.transient.sustain * 100));
  $('trSustainVal').textContent = fx.transient.sustain.toFixed(2);
  $('trMix').value = String(Math.round(fx.transient.mix * 100));
  $('trMixVal').textContent = fx.transient.mix.toFixed(2);
  $('trOutput').value = String(fx.transient.outputDB);
  $('trOutputVal').textContent = `${fx.transient.outputDB.toFixed(1)} dB`;
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
  $('limiterLookahead').value = String(fx.limiter.lookaheadMs);
  $('limiterLookaheadVal').textContent = `${fx.limiter.lookaheadMs.toFixed(1)} ms`;
  $('limiterRelease').value = String(fx.limiter.releaseMs);
  $('limiterReleaseVal').textContent = `${fx.limiter.releaseMs} ms`;
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
    dspNode.port.postMessage({
      type: 'params',
      params: collectEffects(),
      // 统一图谱的执行计划：音频线程按这个顺序执行节点，每个节点一次
      plan: dspHost ? dspHost.executionPlan() : null
    });
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
  fx.enabled.delay = $('fxDelay').checked;
  fx.enabled.chorus = $('fxChorus').checked;
  fx.enabled.flanger = $('fxFlanger').checked;
  fx.enabled.clipper = $('fxClipper').checked;
  fx.clipper.drive = Number($('clipDrive').value);
  fx.clipper.mode = $('clipMode').value === 'hard' ? 'hard' : 'soft';
  fx.clipper.outputDB = Number($('clipOutput').value);
  fx.delay.timeMs = Number($('delayTime').value);
  fx.delay.feedback = Number($('delayFeedback').value) / 100;
  fx.delay.mix = Number($('delayMix').value) / 100;
  fx.delay.pingPong = $('delayPingPong').value === 'on';
  fx.chorus.rateHz = Number($('chorusRate').value) / 100;
  fx.chorus.depthMs = Number($('chorusDepth').value);
  fx.chorus.mix = Number($('chorusMix').value) / 100;
  fx.chorus.spread = Number($('chorusSpread').value) / 100;
  fx.flanger.rateHz = Number($('flangerRate').value) / 100;
  fx.flanger.depthMs = Number($('flangerDepth').value);
  fx.flanger.feedback = Number($('flangerFeedback').value) / 100;
  fx.flanger.mix = Number($('flangerMix').value) / 100;
  // —— 追加的效果器 ——
  fx.enabled.dynEq = $('fxDynEq').checked;
  fx.enabled.mbComp = $('fxMbComp').checked;
  fx.enabled.deesser = $('fxDeesser').checked;
  fx.enabled.expander = $('fxExpander').checked;
  fx.enabled.transient = $('fxTransient').checked;
  fx.clipper.thresholdDB = Number($('clipThreshold').value);
  fx.clipper.ceilingDB = Number($('clipCeiling').value);
  fx.clipper.mix = Number($('clipMix').value) / 100;
  fx.delay.filterHz = Number($('delayFilter').value);
  fx.dynEq.freq = Number($('dynEqFreq').value);
  fx.dynEq.q = Number($('dynEqQ').value);
  fx.dynEq.gainDB = Number($('dynEqGain').value);
  fx.dynEq.threshold = Number($('dynEqThreshold').value);
  fx.dynEq.range = Number($('dynEqRange').value);
  fx.dynEq.attackMs = Number($('dynEqAttack').value);
  fx.dynEq.releaseMs = Number($('dynEqRelease').value);
  fx.mbComp.lowXover = Number($('mbLowXover').value);
  fx.mbComp.highXover = Number($('mbHighXover').value);
  fx.mbComp.threshold = Number($('mbThreshold').value);
  fx.mbComp.ratio = Number($('mbRatio').value);
  fx.mbComp.attackMs = Number($('mbAttack').value);
  fx.mbComp.releaseMs = Number($('mbRelease').value);
  fx.mbComp.lowGainDB = Number($('mbLowGain').value);
  fx.mbComp.midGainDB = Number($('mbMidGain').value);
  fx.mbComp.highGainDB = Number($('mbHighGain').value);
  fx.deesser.freq = Number($('dsFreq').value);
  fx.deesser.threshold = Number($('dsThreshold').value);
  fx.deesser.range = Number($('dsRange').value);
  fx.deesser.attackMs = Number($('dsAttack').value);
  fx.deesser.releaseMs = Number($('dsRelease').value);
  fx.expander.threshold = Number($('expThreshold').value);
  fx.expander.ratio = Number($('expRatio').value);
  fx.expander.attackMs = Number($('expAttack').value);
  fx.expander.releaseMs = Number($('expRelease').value);
  fx.expander.range = Number($('expRange').value);
  fx.transient.attack = Number($('trAttack').value) / 100;
  fx.transient.sustain = Number($('trSustain').value) / 100;
  fx.transient.mix = Number($('trMix').value) / 100;
  fx.transient.outputDB = Number($('trOutput').value);
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
  fx.limiter.lookaheadMs = Number($('limiterLookahead').value);
  fx.limiter.releaseMs = Number($('limiterRelease').value);
  fx.ir.enabled = $('fxIR').checked;
  fx.ir.wet = Number($('irWet').value) / 100;
  fx.ir.predelay = Number($('irPredelay').value) / 100;
  fx.ir.highpass = Number($('irHighpass').value);
  fx.ir.lowpass = Number($('irLowpass').value);
  applyEffectsToUI();
  syncDspGraph();
  sendDSPParams();
  updateIRGraph();
}

function bindEffectInputs() {
  safeRun('音效控件绑定', bindEffectInputsRaw);
}

/**
 * 统一效果卡片：给实时音效里的每个区块加上「折叠 / 展开」。
 *
 * 关键点：折叠只影响界面显示，与开关（Enable）完全无关。
 *   - 折叠 = 把参数收起来，不动音频；
 *   - 开关 = 真正在图谱里启用/停用该节点。
 * 所有区块共用同一套标题栏结构（名称 + 开关），不针对某个效果单独写组件，
 * 以后新增效果只要用同样的 .fx-section 结构就自动获得折叠能力。
 * 默认除第一块（预设）外全部收起，几十个效果也不会把面板撑得很长。
 */
function setupEffectCards() {
  const sections = document.querySelectorAll('#effectsModal .fx-section');
  sections.forEach((section, index) => {
    const title = section.querySelector('.fx-section-title');
    if (!title || title.querySelector('.fx-caret')) return;
    // 均衡器是常驻的主要调节区，不参与折叠，始终保持完整展开
    if (section.id === 'eqSection') return;
    const label = t('collapse') || '折叠 / 展开';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fx-caret lg-button';
    btn.title = label;
    btn.setAttribute('aria-label', label);
    btn.innerHTML = '<svg class="icon"><use href="#icon-caret"></use></svg>';
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      const collapsed = section.classList.toggle('collapsed');
      btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    });
    title.insertBefore(btn, title.firstChild);
    const startCollapsed = index > 0;
    section.classList.toggle('collapsed', startCollapsed);
    btn.setAttribute('aria-expanded', startCollapsed ? 'false' : 'true');
  });
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
    limiterLookahead: () => `${(Number($('limiterLookahead').value)).toFixed(1)} ms`,
    limiterRelease: () => `${$('limiterRelease').value} ms`,
    clipDrive: () => Number($('clipDrive').value).toFixed(1),
    clipOutput: () => `${Number($('clipOutput').value).toFixed(1)} dB`,
    clipThreshold: () => `${Number($('clipThreshold').value).toFixed(1)} dB`,
    clipCeiling: () => `${Number($('clipCeiling').value).toFixed(1)} dB`,
    clipMix: () => (Number($('clipMix').value) / 100).toFixed(2),
    delayTime: () => `${$('delayTime').value} ms`,
    delayFeedback: () => (Number($('delayFeedback').value) / 100).toFixed(2),
    delayMix: () => (Number($('delayMix').value) / 100).toFixed(2),
    chorusRate: () => `${(Number($('chorusRate').value) / 100).toFixed(2)} Hz`,
    chorusDepth: () => `${Number($('chorusDepth').value).toFixed(1)} ms`,
    chorusMix: () => (Number($('chorusMix').value) / 100).toFixed(2),
    chorusSpread: () => (Number($('chorusSpread').value) / 100).toFixed(2),
    flangerRate: () => `${(Number($('flangerRate').value) / 100).toFixed(2)} Hz`,
    flangerDepth: () => `${Number($('flangerDepth').value).toFixed(1)} ms`,
    flangerFeedback: () => (Number($('flangerFeedback').value) / 100).toFixed(2),
    flangerMix: () => (Number($('flangerMix').value) / 100).toFixed(2),
    delayFilter: () => `${$('delayFilter').value} Hz`,
    dynEqFreq: () => `${$('dynEqFreq').value} Hz`,
    dynEqQ: () => Number($('dynEqQ').value).toFixed(2),
    dynEqGain: () => `${Number($('dynEqGain').value).toFixed(1)} dB`,
    dynEqThreshold: () => `${$('dynEqThreshold').value} dB`,
    dynEqRange: () => `${$('dynEqRange').value} dB`,
    dynEqAttack: () => `${$('dynEqAttack').value} ms`,
    dynEqRelease: () => `${$('dynEqRelease').value} ms`,
    mbLowXover: () => `${$('mbLowXover').value} Hz`,
    mbHighXover: () => `${$('mbHighXover').value} Hz`,
    mbThreshold: () => `${$('mbThreshold').value} dB`,
    mbRatio: () => `${Number($('mbRatio').value).toFixed(1)}:1`,
    mbAttack: () => `${$('mbAttack').value} ms`,
    mbRelease: () => `${$('mbRelease').value} ms`,
    mbLowGain: () => `${Number($('mbLowGain').value).toFixed(1)} dB`,
    mbMidGain: () => `${Number($('mbMidGain').value).toFixed(1)} dB`,
    mbHighGain: () => `${Number($('mbHighGain').value).toFixed(1)} dB`,
    dsFreq: () => `${$('dsFreq').value} Hz`,
    dsThreshold: () => `${$('dsThreshold').value} dB`,
    dsRange: () => `${$('dsRange').value} dB`,
    dsAttack: () => `${Number($('dsAttack').value).toFixed(1)} ms`,
    dsRelease: () => `${$('dsRelease').value} ms`,
    expThreshold: () => `${$('expThreshold').value} dB`,
    expRatio: () => `${Number($('expRatio').value).toFixed(1)}:1`,
    expAttack: () => `${Number($('expAttack').value).toFixed(1)} ms`,
    expRelease: () => `${$('expRelease').value} ms`,
    expRange: () => `${$('expRange').value} dB`,
    trAttack: () => (Number($('trAttack').value) / 100).toFixed(2),
    trSustain: () => (Number($('trSustain').value) / 100).toFixed(2),
    trMix: () => (Number($('trMix').value) / 100).toFixed(2),
    trOutput: () => `${Number($('trOutput').value).toFixed(1)} dB`,
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
  // 各效果开关已下放到对应子卡片的标题栏，这里按 id 直接绑定，不再依赖容器结构
  [
    'fxCompressor', 'fxBass', 'fxStereo', 'fxSurround', 'fxClarity',
    'fxUltrasonic', 'fxTube', 'fxReverb', 'fxNoiseGate', 'fxLimiter',
    'fxDelay', 'fxChorus', 'fxFlanger', 'fxClipper',
    'fxDynEq', 'fxMbComp', 'fxDeesser', 'fxExpander', 'fxTransient'
  ].forEach((id) => {
    const el = $(id);
    if (el) el.addEventListener('change', updateEffectsFromUI);
  });
  // 下拉/勾选类参数（模式、乒乓）改动后同样立即生效
  ['clipMode', 'delayPingPong'].forEach((id) => {
    const el = $(id);
    if (el) el.addEventListener('change', updateEffectsFromUI);
  });
  $('fxIR').addEventListener('change', updateEffectsFromUI);
}

function buildEQ() {
  const container = $('eqBands');
  container.innerHTML = '';
  const freqs = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
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

/* ============================================================================
 * 均衡器风格预设：固定这 8 种，点击即把 10 段 EQ 调成对应曲线。
 * 频点顺序与 buildEQ 一致：31 / 62 / 125 / 250 / 500 / 1k / 2k / 4k / 8k / 16k Hz
 * 单位 dB，全部落在 EQ 的可调范围（±12 dB）之内。
 * ========================================================================== */
const EQ_PRESET_STYLES = [
  { id: 'default', i18n: 'eqPresetDefault', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { id: 'classical', i18n: 'eqPresetClassical', gains: [4, 3, 2, 0, 0, 0, -1, 0, 2, 3] },
  { id: 'heavyMetal', i18n: 'eqPresetHeavyMetal', gains: [6, 5, 3, 1, -2, -3, -1, 2, 4, 5] },
  { id: 'pop', i18n: 'eqPresetPop', gains: [-1, -1, 0, 2, 3, 3, 1, 0, -1, -1] },
  { id: 'jazz', i18n: 'eqPresetJazz', gains: [3, 2, 1, 0, -1, -1, 0, 1, 2, 3] },
  { id: 'folk', i18n: 'eqPresetFolk', gains: [2, 1, 0, 1, 2, 2, 1, 1, 2, 2] },
  { id: 'rock', i18n: 'eqPresetRock', gains: [5, 4, 2, -1, -3, -2, 0, 2, 4, 5] },
  { id: 'electronic', i18n: 'eqPresetElectronic', gains: [6, 5, 2, 0, -2, -1, 1, 2, 4, 6] }
];

/** 当前高亮的风格（与曲线自动比对得出，手动拖动滑杆后会自动取消高亮） */
function syncEqPresetButtons() {
  const box = $('eqPresets');
  if (!box) return;
  const gains = state.effects.eqGains || [];
  box.querySelectorAll('[data-eq-preset]').forEach((btn) => {
    const style = EQ_PRESET_STYLES.find((s) => s.id === btn.dataset.eqPreset);
    const match = !!style && style.gains.every((g, i) => Math.abs((Number(gains[i]) || 0) - g) < 0.05);
    btn.classList.toggle('active', match);
  });
}

function applyEqPreset(style) {
  state.effects.eqGains = style.gains.slice();
  applyEffectsToUI();
  syncDspGraph();
  sendDSPParams();
  syncEqPresetButtons();
  showToast(`${t('equalizer')} · ${t(style.i18n)}`);
}

function buildEqPresets() {
  const box = $('eqPresets');
  if (!box) return;
  box.innerHTML = '';
  EQ_PRESET_STYLES.forEach((style) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'eq-preset-btn lg-button';
    btn.dataset.eqPreset = style.id;
    btn.textContent = t(style.i18n);
    btn.title = t(style.i18n);
    btn.addEventListener('click', () => applyEqPreset(style));
    box.appendChild(btn);
  });
  syncEqPresetButtons();
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

/** 预设默认名称的前缀；实际默认名称为「前缀 + 升序编号」，例如 RlonIR_1 */
const DEFAULT_PRESET_NAME = 'RlonIR_';

/**
 * 依据已有名称生成「前缀 + 升序编号」的下一个可用名称。
 * 例如已有 RlonIR_1 / RlonIR_3，则返回 RlonIR_4。
 */
function nextNumberedName(prefix, names) {
  let max = 0;
  (names || []).forEach((item) => {
    const text = String(item || '');
    if (!text.startsWith(prefix)) return;
    const num = parseInt(text.slice(prefix.length).trim(), 10);
    if (Number.isFinite(num) && num > max) max = num;
  });
  return prefix + (max + 1);
}

/** 当前应使用的默认预设名称 */
function suggestedPresetName() {
  return nextNumberedName(DEFAULT_PRESET_NAME, state.presets.filter((p) => p.type !== 'pulse').map((p) => p.name));
}

/** 当前已开启的预设（由条目最右侧的开关切换） */
let activePresetId = null;

/**
 * 渲染预设列表。
 * 每一行都是一张独立卡片：名称输入框 + 保存 / 重命名 / 删除 + 最右侧开关。
 * 顶部另有一行「新建条目」，点击它的保存即按当前音效新增一条，列表随之增加一行。
 */
function renderPresets() {
  const list = $('presetList');
  if (list) {
    list.innerHTML = '';
    state.presets.filter((preset) => preset.type !== 'pulse').forEach((preset) => {
      const isActive = activePresetId === preset.id;
      const row = document.createElement('div');
      // 「正在使用」的条目加蓝边 + 淡蓝底，与未启用的条目一眼区分
      row.className = 'preset-row' + (isActive ? ' active' : '');
      row.innerHTML = `
        <input type="text" class="preset-name-input" maxlength="40" spellcheck="false" data-preset-name="${preset.id}" title="${t('rename')}">
        <div class="preset-row-actions">
          <button class="mini-btn lg-button" data-preset-del="${preset.id}" title="${t('delete')}"><svg class="icon icon-sm"><use href="#icon-trash"></use></svg></button>
        </div>
        <label class="switch"><input type="checkbox" data-preset-toggle="${preset.id}"${isActive ? ' checked' : ''}></label>
      `;
      row.querySelector('[data-preset-name]').value = preset.name || DEFAULT_PRESET_NAME;
      list.appendChild(row);
    });

    list.querySelectorAll('[data-preset-del]').forEach((btn) => {
      btn.addEventListener('click', () => deletePreset(btn.dataset.presetDel));
    });
    list.querySelectorAll('[data-preset-toggle]').forEach((toggle) => {
      toggle.addEventListener('change', () => togglePreset(toggle.dataset.presetToggle, toggle.checked));
    });
    list.querySelectorAll('[data-preset-name]').forEach((input) => {
      // 名称框本身就是可编辑的：点进去直接改，
      // 回车或点到别处即保存。所以右侧不再需要「重命名」按钮。
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') { event.preventDefault(); renamePreset(input.dataset.presetName); }
        if (event.key === 'Escape') { event.preventDefault(); input.blur(); renderPresets(); }
      });
      input.addEventListener('change', () => {
        const preset = state.presets.find((p) => p.id === input.dataset.presetName);
        if (preset && String(input.value || '').trim() !== (preset.name || '')) {
          renamePreset(input.dataset.presetName);
        }
      });
    });
  }
  renderPulseList();
  syncPresetCard();
}

/**
 * 顶部「新建条目」的名称框：只要用户没有手动改过，就始终填入
 * 「RlonIR_ + 下一个升序编号」，保证每次保存都是不重名的新条目。
 */
function syncPresetCard() {
  const input = $('presetNameInput');
  if (!input) return;
  const auto = input.dataset.auto !== '0';
  if (auto || !input.value.trim()) {
    input.value = suggestedPresetName();
    input.dataset.auto = '1';
  }
}

/**
 * 顶部的「保存」：整个实时音效区只有这一个保存入口。
 * - 若有已开启（开关打开）的预设：把当前完整状态覆盖写回该预设；
 * - 否则：按名称输入框里的名字新建一条（名称默认自动升序编号）。
 * 保存的是完整状态（各效果开关、参数、差分环绕、空间音效等），
 * 复用同一个 Preset 存储，不另建第二套保存系统。
 * 注意：不使用 window.prompt —— Electron 中该弹窗不可用（会直接返回空值），
 * 名称一律取自「新建预设」行里的输入框。
 */
async function savePreset() {
  const active = state.presets.find((item) => item.id === activePresetId && item.type !== 'pulse');
  if (active) {
    const row = document.querySelector(`[data-preset-name="${active.id}"]`);
    const rowName = row ? String(row.value || '').trim() : '';
    active.name = rowName || active.name || DEFAULT_PRESET_NAME;
    active.effects = collectEffects();
    active.updatedAt = Date.now();
    state.presets = await api.savePreset(active);
    renderPresets();
    showToast(t('toastPresetSaved'));
    return;
  }
  const input = $('presetNameInput');
  const name = ((input && input.value) || '').trim() || suggestedPresetName();
  const preset = { id: `preset-${Date.now()}`, name, effects: collectEffects(), updatedAt: Date.now() };
  state.presets = await api.savePreset(preset);
  activePresetId = preset.id;
  // 保存后立刻推进到下一个编号，下一次保存不会重名
  if (input) {
    input.dataset.auto = '1';
    input.value = suggestedPresetName();
  }
  renderPresets();
  showToast(t('toastPresetSaved'));
}

/** 点击已保存条目里的「保存」：把当前音效覆盖写入该预设 */
async function overwritePreset(id) {
  const preset = state.presets.find((item) => item.id === id);
  if (!preset) return;
  const input = document.querySelector(`[data-preset-name="${id}"]`);
  const name = ((input && input.value) || '').trim() || preset.name || DEFAULT_PRESET_NAME;
  preset.name = name;
  preset.effects = collectEffects();
  preset.updatedAt = Date.now();
  state.presets = await api.savePreset(preset);
  renderPresets();
  showToast(t('toastPresetSaved'));
}

/** 重命名：名称取自该条目自己的输入框 */
async function renamePreset(id) {
  const preset = state.presets.find((item) => item.id === id);
  if (!preset) return;
  const input = document.querySelector(`[data-preset-name="${id}"]`);
  const name = ((input && input.value) || '').trim();
  if (!name) {
    showToast(t('toastNoPreset'));
    return;
  }
  preset.name = name;
  preset.updatedAt = Date.now();
  state.presets = await api.savePreset(preset);
  renderPresets();
  showToast(t('toastPresetRenamed'));
}

/** 删除指定预设 */
async function deletePreset(id) {
  if (!id) return;
  if (activePresetId === id) activePresetId = null;
  state.presets = await api.deletePreset(id);
  renderPresets();
  showToast(t('toastPresetDeleted'));
}

/** 条目最右侧的开关：开启即把该预设应用到当前音效 */
function togglePreset(id, on) {
  if (on) {
    const preset = state.presets.find((item) => item.id === id);
    if (!preset) return;
    activePresetId = id;
    applyPreset(preset);
  } else if (activePresetId === id) {
    activePresetId = null;
  }
  renderPresets();
}

/** 导出 / 导入：针对当前已开启的预设 */
async function exportPreset() {
  const preset = state.presets.find((item) => item.id === activePresetId);
  if (!preset) {
    showToast(t('toastNoPreset'));
    return;
  }
  await api.exportPreset(preset);
  showToast(t('toastPresetExported'));
}

async function importPreset() {
  const preset = await api.importPreset();
  if (!preset || !preset.effects) return;
  preset.id = `preset-${Date.now()}`;
  preset.name = preset.name || DEFAULT_PRESET_NAME;
  state.presets = await api.savePreset(preset);
  activePresetId = preset.id;
  renderPresets();
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
  // 卷积被第三方 Provider 接管时，内置卷积必须让位，避免两套卷积同时处理
  const active = builtinActive('convolution') && ir.enabled && hasBuffer;
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
    // 外部加载的脉冲同样进入下方列表，具备重命名 / 删除 / 开关
    await registerExternalPulse(filePath, decoded);
    showToast(state.settings.language === 'zh' ? 'IR 已加载' : 'IR loaded');
  } catch (error) {
    console.error(error);
    showToast(state.settings.language === 'zh' ? 'IR 加载失败' : 'IR load failed');
  }
}

/**
 * 把「从磁盘加载的脉冲文件」登记为列表里的一条脉冲。
 * 与制作器传送过来的脉冲同级：可重命名、可删除、可开关，只是来源不同，
 * 名称后面会带「外部加载」标识；文件只记录路径，不复制内容。
 */
async function registerExternalPulse(filePath, decoded) {
  const existing = state.presets.find(
    (item) => item.type === 'pulse' && item.source === 'external' && item.filePath === filePath
  );
  const baseName = String(filePath).split(/[\\/]/).pop().replace(/\.[^.]+$/, '') || '外部脉冲';
  let activeId = null;
  if (existing) {
    existing.enabled = true;
    existing.updatedAt = Date.now();
    state.presets = await api.savePreset(existing);
    activeId = existing.id;
  } else {
    const preset = {
      id: `pulse-ext-${Date.now()}`,
      name: baseName,
      type: 'pulse',
      source: 'external',
      filePath,
      sampleRate: decoded && decoded.sampleRate ? decoded.sampleRate : 0,
      createdAt: Date.now(),
      enabled: true
    };
    state.presets = await api.savePreset(preset);
    activeId = preset.id;
  }
  // 外部加载的脉冲同样是独占的：其余脉冲自动关闭
  if (activeId) {
    const active = state.presets.find((p) => p.id === activeId);
    // 蓝边（当前使用标记）按名称比对，外部脉冲也统一用名称标记，
    // 否则它虽然被加载了却不会高亮
    if (active) state.effects.ir.filePath = active.name;
    await activatePulsePreset(activeId);
  } else {
    renderPulseList();
  }
}

function clearIR() {
  if (convolverNode) convolverNode.buffer = null;
  state.effects.ir.filePath = '';
  state.effects.ir.enabled = false;
  $('fxIR').checked = false;
  applyEffectsToUI();
  updateIRGraph();
  // 卷积器已经空了，脉冲列表里的开关也要跟着关掉，
  // 否则会出现「列表显示已启用、实际没有加载」的状态不一致。
  renderPulseList();
  void deactivateAllPulses();
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

/* ============================================================================
 * 脉冲（空间音效）的启用是「独占」的：
 * 卷积器同一时刻只能加载一条脉冲，所以任意时刻只允许一条脉冲处于启用状态。
 * 之前只把被点的那条置为启用、没有关掉其它的，于是列表里会出现两个开关
 * 同时打开，而蓝边（当前使用标记）只落在真正加载的那一条上 —— 看起来就像
 * 「多出一个蓝色边框」。现在统一由下面两个函数维护，两者永远一致。
 * ========================================================================== */

/** 把某条脉冲设为当前使用，其余脉冲自动关闭（并写回存储） */
async function activatePulsePreset(id) {
  const pulses = state.presets.filter((p) => p.type === 'pulse');
  for (const pulse of pulses) {
    const want = pulse.id === id;
    if (!!pulse.enabled === want) continue;
    pulse.enabled = want;
    pulse.updatedAt = Date.now();
    state.presets = await api.savePreset(pulse);
  }
  renderPulseList();
}

/** 关闭全部脉冲（用于「清除」：卷积器已空，列表不应再有启用项） */
async function deactivateAllPulses() {
  const pulses = state.presets.filter((p) => p.type === 'pulse' && p.enabled);
  for (const pulse of pulses) {
    pulse.enabled = false;
    pulse.updatedAt = Date.now();
    state.presets = await api.savePreset(pulse);
  }
  renderPulseList();
}

async function applyPulsePreset(preset) {
  try {
    await ensureAudioGraph();
    // 外部加载的脉冲记录的是文件路径，从磁盘读取；制作器传送的脉冲带内嵌数据
    const arrayBuffer = (preset.source === 'external' && preset.filePath)
      ? await (await fetch(api.toFileUrl(preset.filePath))).arrayBuffer()
      : base64ToArrayBuffer(preset.wavBase64);
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

/**
 * 重命名脉冲预设。
 * 不使用 window.prompt —— Electron 中该弹窗不可用（会直接返回空值）。
 * 改为把列表项里的名称就地换成输入框：回车或失焦提交，Esc 取消。
 */
function renamePulsePreset(id) {
  const list = $('pulseList');
  const preset = state.presets.find((p) => p.id === id);
  if (!list || !preset) return;
  const holder = list.querySelector(`.pulse-item [data-pulse-rename="${id}"]`)?.closest('.pulse-item');
  const nameEl = holder ? holder.querySelector('.pulse-name') : null;
  if (!nameEl || nameEl.dataset.editing === '1') return;

  nameEl.dataset.editing = '1';
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'pulse-name-input';
  input.maxLength = 40;
  input.spellcheck = false;
  input.value = preset.name || '';
  nameEl.textContent = '';
  nameEl.appendChild(input);
  input.focus();
  input.select();

  let settled = false;
  const finish = async (save) => {
    if (settled) return;
    settled = true;
    const next = (input.value || '').trim();
    if (save && next && next !== preset.name) {
      preset.name = next;
      state.presets = await api.savePreset(preset);
      showToast(t('toastPresetRenamed'));
    }
    renderPulseList();
  };
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { event.preventDefault(); finish(true); }
    else if (event.key === 'Escape') { event.preventDefault(); finish(false); }
  });
  input.addEventListener('blur', () => finish(true));
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
  if (!data) return;

  // 制作器请求「下一个建议名称」（保存脉冲后推进编号）
  if (data.type === 'rlondsp-pulse-name-request') {
    pushPulseNameSuggestion();
    return;
  }

  // 空间音效制作面板里的「差分环绕」是实时模块，改参数立即作用到当前播放
  if (data.type === 'rlondsp-live-channel-delay') {
    const cd = state.effects.channelDelay;
    if (typeof data.enabled === 'boolean') cd.enabled = data.enabled;
    if (data.channel === 'L' || data.channel === 'R') cd.channel = data.channel;
    if (Number.isFinite(Number(data.ms))) cd.ms = Math.max(0, Math.min(30, Number(data.ms)));
    syncDspGraph();
    sendDSPParams();
    return;
  }

  if (data.type !== 'rlondsp-pulse-save') return;
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
    pushPulseNameSuggestion();
    showToast(state.settings.language === 'zh' ? `脉冲已保存：${name}` : `Pulse saved: ${name}`);
  });
}

/** 建议的脉冲名称：RlonDSP_ + 升序编号 */
function suggestedPulseName() {
  return nextNumberedName('RlonDSP_', state.presets.filter((p) => p.type === 'pulse').map((p) => p.name));
}

/** 把建议名称推送给制作器里的「脉冲名称」输入框 */
function pushPulseNameSuggestion() {
  const frame = $('irStudioFrame');
  if (!frame || !frame.contentWindow) return;
  try {
    frame.contentWindow.postMessage({ type: 'rlondsp-pulse-name', name: suggestedPulseName() }, '*');
  } catch (error) { /* 忽略：推送失败不影响保存 */ }
}

function renderPulseList() {
  const list = $('pulseList');
  if (!list) return;
  const pulses = state.presets.filter((preset) => preset.type === 'pulse');
  list.innerHTML = '';
  pulses.forEach((preset) => {
    // 「是否在使用」只有唯一判据：当前加载进卷积器的那条脉冲名称。
    // 开关与蓝边都由它决定，所以两者永远一致 —— 不会再出现
    // 「开关是打开的、却没有蓝边（或反过来）」这种看起来多一个边框的情况。
    // 重启后 IR 尚未加载，列表因此全部显示为关闭。
    const isActive = !!state.effects.ir.filePath && state.effects.ir.filePath === preset.name;
    const item = document.createElement('div');
    item.className = 'pulse-item' + (isActive ? ' active' : '');
    item.innerHTML = `
      <span class="pulse-name"></span>
      <span class="pulse-badge" hidden></span>
      <button data-pulse-rename="${preset.id}">重命名</button>
      <button data-pulse-del="${preset.id}">删除</button>
      <label class="switch"><input type="checkbox" data-pulse-toggle="${preset.id}" ${isActive ? 'checked' : ''}></label>
    `;
    item.querySelector('.pulse-name').textContent = preset.name;
    if (preset.source === 'external') {
      const badge = item.querySelector('.pulse-badge');
      badge.hidden = false;
      badge.textContent = t('externalLoaded');
    }
    list.appendChild(item);
  });
  list.querySelectorAll('[data-pulse-toggle]').forEach((toggle) => {
    toggle.addEventListener('change', async (event) => {
      const id = event.target.dataset.pulseToggle;
      const preset = state.presets.find((p) => p.id === id);
      if (!preset) return;
      if (event.target.checked) {
        // 打开一条 = 独占：其余脉冲自动关闭，蓝边只会落在真正加载的这一条上
        await activatePulsePreset(id);
        await applyPulsePreset(preset);
      } else {
        preset.enabled = false;
        preset.updatedAt = Date.now();
        state.presets = await api.savePreset(preset);
        // 只有关掉的正好是当前加载的那条时才清空卷积（clearIR 内部会同步列表）
        if (state.effects.ir.filePath === preset.name) clearIR();
        else renderPulseList();
      }
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
  /* 画布按「至少 2 倍」的分辨率绘制，再缩回卡片里的实际显示尺寸。
     原因有两个：
     1) 卡片宽度经常是 247.5 这种小数，按 1 倍渲染会出现半像素错位，
        所有画在画布上的小字都会发虚；
     2) 2 倍超采样等于先用大图绘制再缩回去，8～10px 的等宽小字边缘更干净。
     画布内部的绘制坐标仍然以「显示尺寸」为单位（下面 width/height 传的就是
     显示尺寸），所以各个绘制函数不用改。 */
  const scale = Math.max(2, dpr);
  const w = Math.max(1, Math.round(rect.width * scale));
  const h = Math.max(1, Math.round(rect.height * scale));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  return { ctx, width: rect.width, height: rect.height };
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
/* 卡片底部那一排小字的统一位置。
   卡片的两个下角有 16px 圆角，小字原来贴在距下沿 3～5px、距左右 3～4px 的位置，
   正好落在圆角被切掉的区域里，看上去像被裁掉半截。
   所以统一改成：距下沿 9px、左右各内缩 18px。 */
const VIZ_LABEL_BOTTOM = 9;
const VIZ_LABEL_INSET = 18;
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
  ctx.fillText('20Hz', VIZ_LABEL_INSET, height - VIZ_LABEL_BOTTOM);
  ctx.textAlign = 'center';
  ctx.fillText('1kHz', freqToX((1000 / nyquist) * binCount, binCount, width), height - VIZ_LABEL_BOTTOM);
  ctx.textAlign = 'right';
  ctx.fillText('10kHz', Math.min(width - VIZ_LABEL_INSET, freqToX((10000 / nyquist) * binCount, binCount, width)), height - VIZ_LABEL_BOTTOM);
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
  ctx.fillText('0', VIZ_LABEL_INSET, height - VIZ_LABEL_BOTTOM);
  ctx.textAlign = 'center';
  ctx.fillText((ms / 2).toFixed(0) + 'ms', width / 2, height - VIZ_LABEL_BOTTOM);
  ctx.textAlign = 'right';
  ctx.fillText(ms.toFixed(0) + 'ms', width - VIZ_LABEL_INSET, height - VIZ_LABEL_BOTTOM);
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
  ctx.fillText('PK ' + (Number.isFinite(vizMetrics.peakDb) ? vizMetrics.peakDb.toFixed(1) : '-∞'), VIZ_LABEL_INSET, height - VIZ_LABEL_BOTTOM);
  ctx.textAlign = 'right';
  ctx.fillStyle = cachedMuted;
  ctx.fillText('I ' + (Number.isFinite(vizMetrics.integrated) ? vizMetrics.integrated.toFixed(1) : '-∞'), width - VIZ_LABEL_INSET, height - VIZ_LABEL_BOTTOM);
  ctx.textAlign = 'left';
}

// 倍频程频段：低频 / 中低频 / 中频 / 中高频 / 高频 能量分布（唯一频段统计模块）
function drawOctave(ctx, width, height) {
  const labels = [t('bandLow'), t('bandLowMid'), t('bandMid'), t('bandHighMid'), t('bandHigh')];
  const n = 5;
  const gap = Math.max(4, width * 0.022);
  // 柱子底线要让开底部那排小字，否则小字会压到柱子并贴着卡片下沿
  const base = height - VIZ_LABEL_BOTTOM - 15;
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
    ctx.fillText(labels[k], x + bw / 2, height - VIZ_LABEL_BOTTOM);
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
  ctx.fillText(t('phaseWidth') + ' ' + Math.round(vizMetrics.width * 100) + '%', VIZ_LABEL_INSET, height - VIZ_LABEL_BOTTOM);
  ctx.textAlign = 'right';
  ctx.fillStyle = c < -0.05 ? VIZ_WARN : cachedMuted;
  ctx.fillText(c < -0.05 ? t('phaseInv') : t('phaseOk'), width - VIZ_LABEL_INSET, height - VIZ_LABEL_BOTTOM);
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
  /* 底部这组内容原来全部贴着画布最下沿画：
     色带中心在 height-13，两端「偏暗 / 偏亮」小字的基线在 height-3，
     字几乎顶着卡片下边界，看上去像被切掉半截。
     这里改成从下往上依次排：小字 → 留 6px 间隙 → 色带。 */
  const labelY = height - VIZ_LABEL_BOTTOM;
  const bandH = 10;
  const bandY = labelY - 8 - 6 - bandH / 2;
  const g = ctx.createLinearGradient(pad, 0, pad + bandW, 0);
  g.addColorStop(0, '#4c7dff');
  g.addColorStop(0.5, '#8b6bff');
  g.addColorStop(1, '#ffa63d');
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(pad, bandY - bandH / 2, bandW, bandH, bandH / 2);
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
  ctx.fillText(t('toneDark'), VIZ_LABEL_INSET, labelY);
  ctx.textAlign = 'right';
  ctx.fillText(t('toneBright'), width - VIZ_LABEL_INSET, labelY);
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
    const surface = setupVizCanvas(canvas);
    const ctx = surface.ctx;
    const width = surface.width;
    const height = surface.height;
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
  // 打开设置时刷新一次版本信息（本地读取，不联网）
  safeRun('版本信息刷新', initUpdateSection);
}

function renderAbout() {
  const zh = state.settings.language === 'zh';
  $('aboutDesc').textContent = zh
    ? 'RlonDSP 是一款纯本地的 Windows 桌面音频工作站：实时音效处理、脉冲响应卷积、空间音效与专业频谱可视化全部在本机完成，不联网、不上传任何数据。'
    : 'RlonDSP is a fully local Windows audio workstation. Real-time effects, impulse-response convolution, spatial audio, and professional spectrum visualization all run on your machine — no network, no uploads.';
  // 致谢部分只列举真正参考/沿用的内容，不做笼统的「完全基于某项目」表述
  $('aboutUpstreamNote').innerHTML = zh
    ? '<div>RlonDSP 在以下部分参考并借鉴了 Echomusic 开源项目的成果：</div>'
      + '<div class="about-list-item">· 主界面框架与功能分区（播放列表、播放控制栏、音效面板、迷你窗口）</div>'
      + '<div class="about-list-item">· 原生音频模块的调用接口设计</div>'
      + '<div>Echomusic 的参考源码与原生模块以只读形式保留在 vendor/echomusic 目录，不参与本项目的构建与运行。</div>'
      + '<div>界面、可视化、脉冲反馈生成器、空间音效与统一 DSP 图谱均为本项目自行实现。感谢 Echomusic 作者与全体贡献者的开源工作。</div>'
    : '<div>RlonDSP references the following work from the Echomusic open-source project:</div>'
      + '<div class="about-list-item">· Main window framework and functional layout (playlist, player bar, effects panel, mini window)</div>'
      + '<div class="about-list-item">· Interface design of the native audio modules</div>'
      + '<div>The Echomusic reference source and native modules are kept read-only under vendor/echomusic and take no part in this project\'s build or runtime.</div>'
      + '<div>The interface, visualizations, pulse-feedback generator, spatial audio, and unified DSP graph are implemented by this project. Thanks to the Echomusic authors and all contributors.</div>';
  $('aboutLicense').textContent = zh
    ? '本项目遵循 GPL-3.0-only 开源许可证。'
    : 'This project is licensed under GPL-3.0-only.';
  $('aboutDeps').innerHTML = zh
    ? '<div>Electron - 桌面应用运行时 - MIT</div><div>music-metadata - 音频元数据解析 - MIT</div><div>Chromium / FFmpeg - 音频解码与媒体处理</div>'
    : '<div>Electron - desktop runtime - MIT</div><div>music-metadata - audio metadata parsing - MIT</div><div>Chromium / FFmpeg - audio decoding and media processing</div>';
}

function openAbout() {
  renderAbout();
  $('aboutModal').hidden = false;
}

/* ============================================================================
 * 版本更新（设置窗口）
 * --------------------------------------------------------------------------
 * 这里只做界面与状态显示；联网、下载、校验、安装全部在主进程完成。
 * 与音频系统完全无关：不改 DSP 图谱、不改音量、不改播放状态、不改预设。
 * 更新说明只按纯文本显示 —— 远程内容永远不当作 HTML 执行。
 * ========================================================================== */
const updateUi = { info: null, result: null, phase: 'idle' };

function updateEl(id) {
  return document.getElementById(id);
}

function setUpdateStatusText(text, kind) {
  const el = updateEl('updateStatusText');
  if (!el) return;
  // 状态文字是动态的，去掉 data-i18n 以免语言表把它覆盖回去
  el.removeAttribute('data-i18n');
  el.textContent = text;
  el.className = 'update-status' + (kind ? ' is-' + kind : '');
}

function setUpdateControls(phase) {
  const portable = !!(updateUi.info && updateUi.info.mode === 'portable');
  const set = (id, visible) => {
    const el = updateEl(id);
    if (el) el.hidden = !visible;
  };
  set('installUpdateBtn', (phase === 'available' || phase === 'ready') && !portable);
  set('cancelUpdateBtn', phase === 'downloading');
  set('openReleaseBtn', phase === 'available' || phase === 'ready' || phase === 'portable');
  set('updateProgressWrap', phase === 'downloading' || phase === 'ready');
  const check = updateEl('checkUpdateBtn');
  if (check) check.disabled = phase === 'checking' || phase === 'downloading';
  const install = updateEl('installUpdateBtn');
  if (install) {
    const label = phase === 'ready' ? t('restartNow') : t('installNow');
    if (install.textContent.trim() !== label) install.textContent = label;
  }
}

function renderUpdateNotes(text) {
  const notes = updateEl('updateNotes');
  if (!notes) return;
  notes.textContent = '';
  if (!text) {
    notes.hidden = true;
    return;
  }
  // 只写 textContent：远程内容不会被执行，也不会被当成 HTML 渲染
  notes.textContent = text;
  notes.hidden = false;
}

function setUpdateProgress(received, total) {
  const fill = updateEl('updateProgressFill');
  const label = updateEl('updateProgressText');
  if (!fill || !label) return;
  const percent = total > 0 ? Math.min(100, Math.round((received / total) * 100)) : 0;
  fill.style.width = percent + '%';
  const mb = (n) => (n / 1048576).toFixed(1);
  label.textContent = total > 0 ? percent + '%  ·  ' + mb(received) + ' / ' + mb(total) + ' MB' : mb(received) + ' MB';
}

async function initUpdateSection() {
  if (!updateEl('updateBlock')) return;
  try {
    const info = await api.updateInfo();
    updateUi.info = info || null;
    const versionEl = updateEl('updateCurrentVersion');
    if (versionEl && info) versionEl.textContent = 'v' + info.version;
  } catch (error) {
    console.warn('读取版本信息失败', error);
  }
  const auto = updateEl('autoCheckUpdate');
  if (auto) auto.checked = state.settings.autoCheckUpdate !== false;
  if (updateUi.phase === 'idle') setUpdateControls('idle');
}

async function runUpdateCheck(manual) {
  if (updateUi.phase === 'checking' || updateUi.phase === 'downloading') return;
  updateUi.phase = 'checking';
  setUpdateStatusText(t('updateChecking'), 'warn');
  setUpdateControls('checking');
  const res = await api.checkUpdate();
  if (!res || !res.ok) {
    updateUi.phase = 'failed';
    const message = res && res.error === 'notfound' ? t('updateNotFound') : t('updateNetError');
    setUpdateStatusText(message, 'error');
    setUpdateControls('failed');
    if (manual) showToast(message);
    return;
  }
  updateUi.result = res;
  if (res.hasUpdate) {
    updateUi.phase = 'available';
    const when = res.publishedAt ? new Date(res.publishedAt).toLocaleDateString() : '';
    setUpdateStatusText(t('updateAvailable') + '：v' + res.latestVersion + (when ? '  ·  ' + t('updatePublishedAt') + ' ' + when : ''), 'ok');
    renderUpdateNotes(res.notes);
    setUpdateControls('available');
    // 后台自动检查只提示，不打断任何操作
    if (!manual) showToast(t('updateAvailable') + '：v' + res.latestVersion);
  } else {
    updateUi.phase = 'current';
    setUpdateStatusText(t('updateUpToDate') + '（v' + res.currentVersion + '）', 'ok');
    renderUpdateNotes('');
    setUpdateControls('current');
    if (manual) showToast(t('updateUpToDate'));
  }
}

async function runUpdateDownload() {
  if (updateUi.phase !== 'available') return;
  updateUi.phase = 'downloading';
  setUpdateStatusText(t('updateDownloading') + '：v' + updateUi.result.latestVersion, 'warn');
  setUpdateControls('downloading');
  setUpdateProgress(0, updateUi.result.asset ? updateUi.result.asset.size : 0);
  const res = await api.downloadUpdate();
  if (!res || !res.ok) {
    if (res && res.error === 'cancelled') {
      updateUi.phase = 'available';
      setUpdateStatusText(t('updateCancelled'), '');
      setUpdateControls('available');
      return;
    }
    updateUi.phase = 'failed';
    setUpdateStatusText(t('updateFailed'), 'error');
    setUpdateControls('failed');
    showToast(t('updateFailed'));
    return;
  }
  setUpdateProgress(res.size, res.size);
  const expected = (updateUi.result && updateUi.result.assetSha256) || '';
  if (expected && String(expected).toLowerCase() !== String(res.sha256).toLowerCase()) {
    // 校验不通过：绝不安装损坏或不完整的更新包
    updateUi.phase = 'failed';
    setUpdateStatusText(t('updateChecksumFailed'), 'error');
    setUpdateControls('failed');
    showToast(t('updateChecksumFailed'));
    return;
  }
  updateUi.phase = 'ready';
  setUpdateStatusText(t('updateReady') + (updateUi.info && updateUi.info.mode === 'portable' ? '（' + t('updatePortable') + '）' : ''), 'ok');
  setUpdateControls('ready');
}

async function runUpdateInstall() {
  const res = await api.installUpdate();
  if (res && res.ok) {
    setUpdateStatusText(t('restartNow') + '…', 'ok');
    return;
  }
  const portable = res && res.error === 'portable';
  updateUi.phase = portable ? 'portable' : 'failed';
  setUpdateStatusText(portable ? t('updatePortable') : t('updateFailed'), portable ? 'warn' : 'error');
  setUpdateControls(updateUi.phase);
}

async function saveSettings() {
  const next = {
    theme: $('themeSelect').value,
    language: $('languageSelect').value,
    closeToTray: $('closeToTray').checked,
    autoCheckUpdate: $('autoCheckUpdate') ? $('autoCheckUpdate').checked : true
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
  const presetNameInput = $('presetNameInput');
  if (presetNameInput) {
    // 用户一旦手动改名，就不再自动覆盖
    presetNameInput.addEventListener('input', () => { presetNameInput.dataset.auto = '0'; });
  }
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
      // 最大化时窗口铺满屏幕，四角要恢复直角（见 styles.css 的窗口圆角说明）
      document.documentElement.classList.toggle('is-maximized', !!value);
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
  // 版本更新：检查 / 下载 / 取消 / 安装 / 打开发布页
  on('checkUpdateBtn', 'click', () => runUpdateCheck(true));
  on('installUpdateBtn', 'click', () => {
    if (updateUi.phase === 'ready') return runUpdateInstall();
    return runUpdateDownload();
  });
  on('cancelUpdateBtn', 'click', async () => {
    await api.cancelUpdate();
  });
  on('openReleaseBtn', 'click', () => api.openReleasePage());
  if (api.onUpdateProgress) {
    api.onUpdateProgress((payload) => {
      if (payload) setUpdateProgress(Number(payload.received) || 0, Number(payload.total) || 0);
    });
  }
  on('muteBtn', 'click', toggleMute);
  on('modeBtn', 'click', cycleMode);
  window.addEventListener('resize', () => {
    // canvas resizes during animation loop
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (state.settings.theme === 'system') applyTheme('system');
  });
  // 窗口不可见时停掉背景动画，回到前台再继续（避免后台空转）
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) AlbumEnv.stop();
    else AlbumEnv.start();
  });
  window.addEventListener('beforeunload', () => AlbumEnv.stop());
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
  safeRun('均衡器风格预设构建', buildEqPresets);
  applyEffectsToUI();
  safeRun('DSP 图谱同步', syncDspGraph);
  bindUI();
  safeRun('效果卡片折叠初始化', setupEffectCards);
  state.favorites = new Set(await api.getFavorites());
  await loadPresets();
  safeRun('播放列表渲染', renderPlaylist);
  safeRun('正在播放信息同步', updateNowPlaying);
  await safeRunAsync('输出设备枚举', enumerateOutputDevices);
  if (state.settings.outputDeviceId) applyOutputDevice(state.settings.outputDeviceId);
  await safeRunAsync('版本信息初始化', initUpdateSection);
  // 后台自动检查更新：默认开启，启动后延迟进行，只提示、不打扰播放
  if (state.settings.autoCheckUpdate !== false) {
    window.setTimeout(() => {
      if (!document.hidden) safeRun('后台检查更新', () => runUpdateCheck(false));
    }, 12000);
  }
  drawVisualizer();
}

init().catch((error) => {
  console.error(error);
});
