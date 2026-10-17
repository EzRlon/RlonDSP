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
    queueTitle: '播放队列',
    queueTotalSongs: '共 {n} 首',
    queueRemaining: '剩 {n} 首',
    queueLocal: '本地队列',
    queueManual: '我的队列',
    queueHistory: '历史',
    queueSwitcherHint: '队列',
    queueHistoryHint: '历史队列只读：点歌会继续播放并接管',
    queueAddManual: '新建我的队列',
    queueDelete: '删除这个队列',
    queueSourceLocal: '本地',
    queueSourceOnline: '在线',
    queueViewFilterHint: '当前是视图筛选：只改变显示，不改变播放队列（已停用拖拽）',
    queueFilterAll: '全部',
    queueViewRecentAdded: '最近添加',
    queueViewRecentPlayed: '最近播放',
    queueViewUnplayed: '未播放',
    queueViewFavorites: '收藏',
    queueFilterToggle: '筛选',
    queueFilterQuality: '音频质量',
    queueFilterFolder: '文件夹',
    queueFilterClear: '清除筛选',
    queueQualityLossless: 'Lossless',
    queueQualityHiRes: 'Hi-Res',
    queueQuality24bit: '24-bit',
    queueQualityHighSampleRate: '高采样率',
    queueQualityMultichannel: '多声道',
    queueQualityUnknown: 'Unknown',
    queueSelectionCount: '已选 {n} 首',
    queueSelectionPlay: '播放',
    queueSelectionAdd: '加入当前 Queue',
    queueSelectionFavorite: '收藏',
    queueSelectionRemove: '移除',
    queueSelectionSelectAll: '全选',
    queueSelectionClear: '取消选择',
    queueFolderAll: '全部文件夹',
    queueEmptyTitle: '队列为空',
    queueGoOnline: '前往在线资源',
    queueReordered: '已更新播放顺序',
    trackPlayNext: '下一首播放（Shift = 依次插队）',
    trackQueuedNext: '已插入下一首',
    trackQueuedSequence: '已依次插队',
    trackRemove: '从队列移除',
    trackLocate: '定位当前歌曲',
    trackLocateShort: '定位当前',
    trackLocateMissing: '当前没有正在播放的歌曲',
    favorite: '收藏',
    clear: '清空',
    noTrack: '未播放',
    soundEffects: '实时音效',
    pulseFeedback: '脉冲反馈',
    reset: '重置',
    preset: '预设',
    realtimeFx: '实时音效',
    realtimeFxOn: '实时音效：已启用',
    realtimeFxOff: '实时音效：已停用',
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
    visualPageTitle: '沉浸视觉',
    visualParams: '参数控制',
    vfxHint: '向左滑动进入视觉空间',
    vfxHeartbeat: '心跳',
    vfxNebula: '星云',
    vfxParticles: '粒子星系',
    vfxLiquid: '液体涟漪',
    vfxEnergyCore: '能量核心',
    vfxCymatics: '声波图形',
    vfxCatLife: '生命',
    vfxCatCosmic: '宇宙',
    vfxCatParticle: '粒子',
    vfxCatFluid: '流体',
    vfxCatEnergy: '能量',
    vfxCatScientific: '科学',
    vfxSensitivity: '灵敏度',
    vfxGlow: '光晕',
    vfxEcg: '心电曲线',
    vfxDensity: '层次',
    vfxReactivity: '反应强度',
    vfxDrift: '漂移速度',
    vfxHueShift: '色相变化',
    vfxParticleCount: '粒子数量',
    vfxSpeed: '速度',
    vfxSpread: '扩散',
    vfxRipples: '波纹层数',
    vfxViscosity: '黏度',
    vfxRays: '射线数量',
    vfxOrder: '对称阶数',
    vfxDetail: '细节密度',
    vfxOrganicPulse: '有机脉冲场',
    vfxFlowField: '流场',
    vfxAurora: '极光',
    vfxFluid: '流体',
    vfxPlasma: '等离子',
    vfxElectricField: '电场',
    vfxCatOrganic: '有机',
    vfxCatField: '场',
    vfxFlowSpeed: '流动速度',
    vfxPulseStrength: '脉冲强度',
    vfxTurbulence: '扰动',
    vfxAttraction: '吸引 / 排斥',
    vfxNoiseScale: '噪声尺度',
    vfxTrail: '拖尾',
    vfxRibbons: '条带数量',
    vfxHeight: '高度',
    vfxShimmer: '闪烁',
    vfxInjection: '注入强度',
    vfxDissipation: '耗散',
    vfxDiffusion: '扩散',
    vfxContrast: '对比度',
    vfxDecay: '衰减',
    vfxBranch: '分叉',
    vfxLifetime: '生命周期',
    vfxModeAuto: '自动',
    vfxPresetNebulaAurora: '星云极光',
    vfxPresetFluidElectric: '流体电场',
    vfxPresetPulseCymatics: '脉冲声波',
    vfxPresetPlasmaFlow: '等离子流场',
    vfxPresetAuroraElectric: '极光电场',
    vfxPresetDeepSpace: '星云三重奏',
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
    knee: '拐点',
    makeup: '补偿增益',
    sidechainFilter: '侧链滤波',
    stereoLink: '立体声联动',
    autoRelease: '自动释放',
    sub: '超低频',
    harmonic: '谐波',
    slope: '斜率',
    bassMono: '低频单声道',
    mix: '混合',
    mid: '中置',
    side: '侧向',
    monoFrequency: '单声道频率',
    correlationProtect: '相关性保护',
    crossfeed: '交叉反馈',
    depth: '深度',
    center: '中央',
    presence: '临场感',
    air: '空气感',
    targetFrequency: '目标频率',
    q: 'Q 值',
    harmonicExciter: '谐波激励',
    bias: '偏置',
    character: '音色',
    symmetry: '对称性',
    oversampling: '过采样',
    diffusion: '扩散',
    earlyReflections: '早期反射',
    modRate: '调制速率',
    modAmount: '调制量',
    lowCut: '低切',
    ducking: '闪避',
    duckSensitivity: '闪避灵敏度',
    hold: '保持',
    range: '作用范围',
    hysteresis: '迟滞',
    truePeak: '真峰值',
    input: '输入',
    softClip: '软削波',
    band: '频段',
    filterType: '滤波类型',
    filterPeaking: '峰值',
    filterLowShelf: '低架',
    filterHighShelf: '高架',
    filterBandPass: '带通',
    midSide: 'M/S',
    dynamic: '动态',
    settings: '设置',
    theme: '主题',
    language: '语言',
    outputDevice: '输出设备',
    closeToTray: '关闭时最小化到托盘',
    alwaysOnTop: '始终置顶',
    toastImported: '已导入歌曲',
    toastLoading: '正在读取音乐信息…',
    toastPresetSaved: '预设已保存',
    toastPresetDeleted: '预设已删除',
    toastPresetRenamed: '预设已重命名',
    toastPresetReset: '该预设已重置',
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
    volumeAdjust: '调整音量',
    volumeMuted: '静音',
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
    enable: '启用',
    onlineMusic: '在线音乐',
    onlineMusicHint: '搜索并播放在线资源',
    onlineResources: '在线资源',
    onlineResourcesHint: '启用自定义源后，在这里搜索、浏览并加入当前播放队列。',
    refresh: '刷新',
    search: '搜索',
    onlineSearchPlaceholder: '搜索歌曲、歌手、专辑或歌单',
    onlineSongs: '歌曲',
    onlineArtists: '歌手',
    onlineAlbums: '专辑',
    onlinePlaylists: '歌单',
    customSources: '自定义源',
    addSource: '新增源',
    editSource: '编辑源',
    deleteSource: '删除源',
    sourceName: '名称',
    sourceType: '类型',
    baseUrl: '基础地址',
    sourceEnabled: '已启用',
    sourceDisabled: '已停用',
    searchConfig: '搜索配置',
    detailConfig: '详情配置',
    playUrlConfig: '播放地址配置',
    mappingConfig: '资源映射',
    loginToken: 'Token / 凭据',
    login: '登录',
    logout: '退出登录',
    loggedIn: '已登录',
    notLoggedIn: '未登录',
    saveSource: '保存源',
    cancel: '取消',
    addToQueue: '加入队列',
    playNow: '立即播放',
    onlineNoSources: '暂无启用的在线源，请在设置中新增。',
    onlineNoResults: '没有结果',
    onlineDetail: '资源详情',
    onlineLoading: '加载中…',
    onlineError: '在线资源请求失败',
    onlineSourceSaved: '在线源已保存',
    onlineSourceDeleted: '在线源已删除',
    onlineSourceEnabled: '在线源已启用',
    onlineSourceDisabled: '在线源已停用',
    onlineSourceOrderSaved: '在线源顺序已保存',
    onlineLoginDone: '登录状态已保存',
    onlineLogoutDone: '已退出登录',
    onlineInvalidSource: '在线源配置无效',
    onlinePlayUrlFailed: '无法解析播放地址',
    onlineAdded: '已加入当前队列',
    onlineEmptyHint: '选择在线源、输入关键词后开始搜索。',
    onlineRetry: '重试',
    onlineSource: '在线源',
    onlineAlbum: '专辑',
    onlineArtist: '歌手',
    onlinePlaylist: '歌单',
    onlineSearching: '搜索中…',
    onlineSearchSuccess: '搜索完成',
    onlineSearchError: '搜索失败',
    onlineUpdated: '最近更新',
    onlineHotSongs: '今日热门歌曲',
    onlineHotAlbums: '热门专辑',
    onlineHotPlaylists: '热门歌单',
    onlineMoreHot: '更多热门内容',
    onlineShuffle: '换一批',
    onlineNoHot: '暂无可用热门内容',
    onlineHotHint: '该来源暂时没有可浏览的热门榜单，或网络不可用。',
    onlineNoPreview: '这首暂无可播放的试听地址',
    onlinePlayBlocked: '这首的音频地址不允许跨域播放（上游限制了来源），暂时无法播放',
    spotifyAttribution: '内容与播放信息来自 Spotify 官方 Web API',
    spotifyLogin: '登录 Spotify',
    spotifyLogout: '退出 Spotify',
    spotifyLoggingIn: '正在打开 Spotify 官方登录页面…',
    spotifyNeedClientId: '请先在「设置 → 在线源 → Spotify」填写 Spotify Client ID 再登录',
    spotifyNeedLogin: '需要登录 Spotify',
    spotifyNeedLoginHint: '登录后可浏览你的热门曲目、歌单与收藏专辑；RlonDSP 不会保存你的 Spotify 密码。',
    spotifyTopTracks: '你的热门曲目',
    spotifyPlaylists: '我的歌单',
    spotifySavedAlbums: '收藏专辑',
    spotifyCategories: '分类浏览',
    spotifyEmptyHint: 'Spotify 暂时没有可展示的内容。',
    spotifyOpen: '在 Spotify 打开',
    spotifyClientId: 'Spotify Client ID',
    spotifyClientIdHint: '填写你自己 Spotify 应用的 Client ID（非机密）；只有登录 Spotify 时才需要。',
    playlistExpand: '展开播放列表',
    playlistCollapse: '收起播放列表',
    progressExpand: '展开播放进度条',
    progressCollapse: '收起播放进度条',
    sourceTypeDeclarative: '声明式 HTTP',
    sourceTypeMusicSquare: 'MusicSquare',
    musicSquareHint: 'MusicSquare 聚合网易云 / QQ 音乐 / 酷我 / JOOX 的公开搜索接口；只做搜索、试听与下载，不绕过付费或权限。',
    musicSquareHomeTitle: 'MusicSquare 搜索',
    musicSquareHomeHint: '在上方输入关键词（歌名或歌手）后点搜索；结果会标注来自哪个平台。',
    musicSquareNoChart: 'MusicSquare 只提供搜索，没有可浏览的榜单。',
    musicSquareSongOnly: 'MusicSquare 只支持歌曲搜索',
    musicSquareAttribution: '搜索与播放地址来自 MusicSquare（Apache-2.0）聚合的公开接口；歌曲版权归各平台与权利人所有，请仅在有权下载时使用下载功能。',
    musicSquarePlatforms: '接入平台',
    musicSquarePlatformNetease: '网易云音乐',
    musicSquarePlatformQq: 'QQ 音乐',
    musicSquarePlatformKuwo: '酷我音乐',
    musicSquarePlatformJoox: 'JOOX',
    musicSquareNoPlatform: '请至少启用一个平台',
    platformLabel: '平台',
    download: '下载',
    downloadTitle: '下载这首歌',
    downloadStart: '开始下载',
    downloadPreparing: '准备中…',
    downloadProgress: '下载中',
    downloadDone: '下载完成',
    downloadFailed: '下载失败',
    downloadCancelled: '已取消下载',
    downloadCancel: '取消下载',
    downloadRetry: '重试',
    downloadReveal: '打开所在文件夹',
    downloadFolder: '下载目录',
    downloadNotAvailable: '不可下载',
    downloadNotAvailableHint: '该来源未提供可下载地址（或只提供受平台条款限制的试听）；请到原平台收听或获取。',
    downloadErrorNetwork: '网络中断，下载失败',
    downloadErrorHttp: '上游拒绝下载请求',
    downloadErrorType: '上游返回的不是音频文件',
    downloadErrorSize: '文件超过体积上限',
    downloadErrorDir: '下载目录不可写',
    downloadErrorWrite: '写入文件失败',
    downloadErrorIncomplete: '下载不完整',
    downloadErrorUrl: '没有可用的下载地址',
    authType: '认证方式',
    authNone: '无',
    authBearer: 'Bearer Token',
    authHeader: '自定义 Header',
    authHeaderName: 'Header 名称',
    authPrefix: '前缀',
    sourceManagement: '源管理',
    basicInfo: '基本信息',
    authSection: '认证',
    searchSection: '搜索配置',
    detailSection: '详情配置',
    playUrlSection: '播放地址配置',
    mappingSection: '资源映射',
    advancedSection: '高级配置',
    sourceId: '源 ID',
    sourceRawConfig: '完整配置预览',
    testConnection: '测试连接',
    connectionSuccess: '连接成功'
  },
  en: {
    importFiles: 'Import Files',
    importFolder: 'Import Folder',
    searchPlaceholder: 'Search tracks',
    themeSystem: 'System',
    themeLight: 'Light',
    themeDark: 'Dark',
    playlist: 'Playlist',
    queueTitle: 'Play queue',
    queueTotalSongs: '{n} tracks',
    queueRemaining: '{n} left',
    queueLocal: 'Local queue',
    queueManual: 'My queue',
    queueHistory: 'History',
    queueSwitcherHint: 'Queue',
    queueHistoryHint: 'History queues are read-only: clicking a track resumes and takes it over',
    queueAddManual: 'New “my queue”',
    queueDelete: 'Delete this queue',
    queueSourceLocal: 'Local',
    queueSourceOnline: 'Online',
    queueViewFilterHint: 'View filter is on: display only, queue order unchanged (drag disabled)',
    queueFilterAll: 'All',
    queueViewRecentAdded: 'Recently added',
    queueViewRecentPlayed: 'Recently played',
    queueViewUnplayed: 'Unplayed',
    queueViewFavorites: 'Favorites',
    queueFilterToggle: 'Filter',
    queueFilterQuality: 'Audio quality',
    queueFilterFolder: 'Folder',
    queueFilterClear: 'Clear filter',
    queueQualityLossless: 'Lossless',
    queueQualityHiRes: 'Hi-Res',
    queueQuality24bit: '24-bit',
    queueQualityHighSampleRate: 'High sample rate',
    queueQualityMultichannel: 'Multichannel',
    queueQualityUnknown: 'Unknown',
    queueSelectionCount: '{n} selected',
    queueSelectionPlay: 'Play',
    queueSelectionAdd: 'Add to current queue',
    queueSelectionFavorite: 'Favorite',
    queueSelectionRemove: 'Remove',
    queueSelectionSelectAll: 'Select all',
    queueSelectionClear: 'Clear selection',
    queueFolderAll: 'All folders',
    queueEmptyTitle: 'Queue is empty',
    queueGoOnline: 'Go to Online Resources',
    queueReordered: 'Playback order updated',
    trackPlayNext: 'Play next (Shift = add in order)',
    trackQueuedNext: 'Queued to play next',
    trackQueuedSequence: 'Added to play next in order',
    trackRemove: 'Remove from queue',
    trackLocate: 'Locate current track',
    trackLocateShort: 'Locate',
    trackLocateMissing: 'Nothing is playing right now',
    favorite: 'Favorite',
    clear: 'Clear',
    noTrack: 'Nothing Playing',
    soundEffects: 'Real-time Effects',
    pulseFeedback: 'Pulse Feedback',
    reset: 'Reset',
    preset: 'Presets',
    realtimeFx: 'Realtime FX',
    realtimeFxOn: 'Realtime FX: On',
    realtimeFxOff: 'Realtime FX: Off',
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
    visualPageTitle: 'Immersive Visual',
    visualParams: 'Parameters',
    vfxHint: 'Swipe left for the visual space',
    vfxHeartbeat: 'Heartbeat',
    vfxNebula: 'Nebula',
    vfxParticles: 'Particle Galaxy',
    vfxLiquid: 'Liquid Ripple',
    vfxEnergyCore: 'Energy Core',
    vfxCymatics: 'Cymatics',
    vfxCatLife: 'Life',
    vfxCatCosmic: 'Cosmic',
    vfxCatParticle: 'Particle',
    vfxCatFluid: 'Fluid',
    vfxCatEnergy: 'Energy',
    vfxCatScientific: 'Scientific',
    vfxSensitivity: 'Sensitivity',
    vfxGlow: 'Glow',
    vfxEcg: 'ECG',
    vfxDensity: 'Density',
    vfxReactivity: 'Reactivity',
    vfxDrift: 'Drift',
    vfxHueShift: 'Hue shift',
    vfxParticleCount: 'Particles',
    vfxSpeed: 'Speed',
    vfxSpread: 'Spread',
    vfxRipples: 'Ripples',
    vfxViscosity: 'Viscosity',
    vfxRays: 'Rays',
    vfxOrder: 'Symmetry',
    vfxDetail: 'Detail',
    vfxOrganicPulse: 'Organic Pulse',
    vfxFlowField: 'Flow Field',
    vfxAurora: 'Aurora',
    vfxFluid: 'Fluid',
    vfxPlasma: 'Plasma',
    vfxElectricField: 'Electric Field',
    vfxCatOrganic: 'Organic',
    vfxCatField: 'Field',
    vfxFlowSpeed: 'Flow speed',
    vfxPulseStrength: 'Pulse strength',
    vfxTurbulence: 'Turbulence',
    vfxAttraction: 'Attraction',
    vfxNoiseScale: 'Noise scale',
    vfxTrail: 'Trail',
    vfxRibbons: 'Ribbons',
    vfxHeight: 'Height',
    vfxShimmer: 'Shimmer',
    vfxInjection: 'Injection',
    vfxDissipation: 'Dissipation',
    vfxDiffusion: 'Diffusion',
    vfxContrast: 'Contrast',
    vfxDecay: 'Decay',
    vfxBranch: 'Branch',
    vfxLifetime: 'Lifetime',
    vfxModeAuto: 'Auto',
    vfxPresetNebulaAurora: 'Nebula Aurora',
    vfxPresetFluidElectric: 'Fluid Field',
    vfxPresetPulseCymatics: 'Pulse Wave',
    vfxPresetPlasmaFlow: 'Plasma Flow',
    vfxPresetAuroraElectric: 'Aurora Field',
    vfxPresetDeepSpace: 'Deep Space Trio',
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
    knee: 'Knee',
    makeup: 'Makeup',
    sidechainFilter: 'Sidechain Filter',
    stereoLink: 'Stereo Link',
    autoRelease: 'Auto Release',
    sub: 'Sub',
    harmonic: 'Harmonic',
    slope: 'Slope',
    bassMono: 'Bass Mono',
    mix: 'Mix',
    mid: 'Mid',
    side: 'Side',
    monoFrequency: 'Mono Frequency',
    correlationProtect: 'Correlation Protect',
    crossfeed: 'Crossfeed',
    depth: 'Depth',
    center: 'Center',
    presence: 'Presence',
    air: 'Air',
    targetFrequency: 'Target Frequency',
    q: 'Q',
    harmonicExciter: 'Harmonic Exciter',
    bias: 'Bias',
    character: 'Character',
    symmetry: 'Symmetry',
    oversampling: 'Oversampling',
    diffusion: 'Diffusion',
    earlyReflections: 'Early Reflections',
    modRate: 'Mod Rate',
    modAmount: 'Mod Amount',
    lowCut: 'Low Cut',
    ducking: 'Ducking',
    duckSensitivity: 'Duck Sensitivity',
    hold: 'Hold',
    range: 'Range',
    hysteresis: 'Hysteresis',
    truePeak: 'True Peak',
    input: 'Input',
    softClip: 'Soft Clip',
    band: 'Band',
    filterType: 'Filter Type',
    filterPeaking: 'Peaking',
    filterLowShelf: 'Low Shelf',
    filterHighShelf: 'High Shelf',
    filterBandPass: 'Band Pass',
    midSide: 'M/S',
    dynamic: 'Dynamic',
    settings: 'Settings',
    theme: 'Theme',
    language: 'Language',
    outputDevice: 'Output Device',
    closeToTray: 'Close to tray',
    alwaysOnTop: 'Always on Top',
    toastImported: 'Tracks imported',
    toastLoading: 'Reading track info…',
    toastPresetSaved: 'Preset saved',
    toastPresetDeleted: 'Preset deleted',
    toastPresetRenamed: 'Preset renamed',
    toastPresetReset: 'Preset reset',
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
    volumeAdjust: 'Adjust volume',
    volumeMuted: 'Muted',
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
    enable: 'Enable',
    onlineMusic: 'Online Music',
    onlineMusicHint: 'Search and play online resources',
    onlineResources: 'Online Resources',
    onlineResourcesHint: 'Enable a custom source, then search and add resources to the current queue.',
    refresh: 'Refresh',
    search: 'Search',
    onlineSearchPlaceholder: 'Search songs, artists, albums, or playlists',
    onlineSongs: 'Songs',
    onlineArtists: 'Artists',
    onlineAlbums: 'Albums',
    onlinePlaylists: 'Playlists',
    customSources: 'Custom Sources',
    addSource: 'Add Source',
    editSource: 'Edit Source',
    deleteSource: 'Delete Source',
    sourceName: 'Name',
    sourceType: 'Type',
    baseUrl: 'Base URL',
    sourceEnabled: 'Enabled',
    sourceDisabled: 'Disabled',
    searchConfig: 'Search Config',
    detailConfig: 'Detail Config',
    playUrlConfig: 'Play URL Config',
    mappingConfig: 'Resource Mapping',
    loginToken: 'Token / Credential',
    login: 'Login',
    logout: 'Logout',
    loggedIn: 'Logged in',
    notLoggedIn: 'Not logged in',
    saveSource: 'Save Source',
    cancel: 'Cancel',
    addToQueue: 'Add to Queue',
    playNow: 'Play Now',
    onlineNoSources: 'No enabled online source. Add one in Settings.',
    onlineNoResults: 'No results',
    onlineDetail: 'Resource Detail',
    onlineLoading: 'Loading…',
    onlineError: 'Online resource request failed',
    onlineSourceSaved: 'Source saved',
    onlineSourceDeleted: 'Source deleted',
    onlineSourceEnabled: 'Source enabled',
    onlineSourceDisabled: 'Source disabled',
    onlineSourceOrderSaved: 'Source order saved',
    onlineLoginDone: 'Login state saved',
    onlineLogoutDone: 'Logged out',
    onlineInvalidSource: 'Invalid source configuration',
    onlinePlayUrlFailed: 'Unable to resolve play URL',
    onlineAdded: 'Added to current queue',
    onlineEmptyHint: 'Choose an online source and enter a keyword to begin.',
    onlineRetry: 'Retry',
    onlineSource: 'Source',
    onlineAlbum: 'Album',
    onlineArtist: 'Artist',
    onlinePlaylist: 'Playlist',
    onlineSearching: 'Searching…',
    onlineSearchSuccess: 'Search complete',
    onlineSearchError: 'Search failed',
    onlineUpdated: 'Updated',
    onlineHotSongs: 'Today’s top songs',
    onlineHotAlbums: 'Top albums',
    onlineHotPlaylists: 'Top playlists',
    onlineMoreHot: 'More hot picks',
    onlineShuffle: 'Shuffle',
    onlineNoHot: 'No hot content available',
    onlineHotHint: 'This source has no browsable charts right now, or the network is unavailable.',
    onlineNoPreview: 'No playable preview for this track',
    onlinePlayBlocked: 'This track blocks cross-origin playback, so it cannot be played here right now',
    spotifyAttribution: 'Content and playback info come from the official Spotify Web API',
    spotifyLogin: 'Log in to Spotify',
    spotifyLogout: 'Log out of Spotify',
    spotifyLoggingIn: 'Opening the official Spotify login page…',
    spotifyNeedClientId: 'Add your Spotify Client ID first in Settings → Online sources → Spotify',
    spotifyNeedLogin: 'Spotify login required',
    spotifyNeedLoginHint: 'Log in to browse your top tracks, playlists and saved albums. RlonDSP never stores your Spotify password.',
    spotifyTopTracks: 'Your top tracks',
    spotifyPlaylists: 'Your playlists',
    spotifySavedAlbums: 'Saved albums',
    spotifyCategories: 'Browse categories',
    spotifyEmptyHint: 'Spotify has nothing to show right now.',
    spotifyOpen: 'Open in Spotify',
    spotifyClientId: 'Spotify Client ID',
    spotifyClientIdHint: 'Your own Spotify app Client ID (not a secret). Only needed to log in to Spotify.',
    playlistExpand: 'Expand playlist',
    playlistCollapse: 'Collapse playlist',
    progressExpand: 'Expand progress bar',
    progressCollapse: 'Collapse progress bar',
    sourceTypeDeclarative: 'Declarative HTTP',
    sourceTypeMusicSquare: 'MusicSquare',
    musicSquareHint: 'MusicSquare aggregates the public search endpoints of Netease, QQ Music, Kuwo and JOOX. Search, preview and download only — no DRM or paid-content bypass.',
    musicSquareHomeTitle: 'Search MusicSquare',
    musicSquareHomeHint: 'Type a song or artist above and hit search. Every result is labelled with its platform.',
    musicSquareNoChart: 'MusicSquare only offers search — it has no browsable charts.',
    musicSquareSongOnly: 'MusicSquare supports song search only',
    musicSquareAttribution: 'Search and playback addresses come from the public endpoints aggregated by MusicSquare (Apache-2.0). Track rights belong to the platforms and rights holders — only download what you are entitled to.',
    musicSquarePlatforms: 'Platforms',
    musicSquarePlatformNetease: 'Netease Cloud Music',
    musicSquarePlatformQq: 'QQ Music',
    musicSquarePlatformKuwo: 'Kuwo Music',
    musicSquarePlatformJoox: 'JOOX',
    musicSquareNoPlatform: 'Enable at least one platform',
    platformLabel: 'Platform',
    download: 'Download',
    downloadTitle: 'Download this song',
    downloadStart: 'Download',
    downloadPreparing: 'Preparing…',
    downloadProgress: 'Downloading',
    downloadDone: 'Download complete',
    downloadFailed: 'Download failed',
    downloadCancelled: 'Download cancelled',
    downloadCancel: 'Cancel download',
    downloadRetry: 'Retry',
    downloadReveal: 'Show in folder',
    downloadFolder: 'Download folder',
    downloadNotAvailable: 'Not downloadable',
    downloadNotAvailableHint: 'This source provides no downloadable address (or only a preview restricted by platform terms). Listen on the original platform instead.',
    downloadErrorNetwork: 'Network interrupted, download failed',
    downloadErrorHttp: 'The upstream rejected the download request',
    downloadErrorType: 'The upstream did not return an audio file',
    downloadErrorSize: 'File exceeds the size limit',
    downloadErrorDir: 'The download folder is not writable',
    downloadErrorWrite: 'Failed to write the file',
    downloadErrorIncomplete: 'Download incomplete',
    downloadErrorUrl: 'No downloadable address available',
    authType: 'Auth Type',
    authNone: 'None',
    authBearer: 'Bearer Token',
    authHeader: 'Custom Header',
    authHeaderName: 'Header Name',
    authPrefix: 'Prefix',
    sourceManagement: 'Sources',
    basicInfo: 'Basic Info',
    authSection: 'Authentication',
    searchSection: 'Search Config',
    detailSection: 'Detail Config',
    playUrlSection: 'Play URL Config',
    mappingSection: 'Resource Mapping',
    advancedSection: 'Advanced',
    sourceId: 'Source ID',
    sourceRawConfig: 'Raw Config Preview',
    testConnection: 'Test Connection',
    connectionSuccess: 'Connection OK'
  }
};

const defaultEffects = {
  masterGain: 0,
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
 * 实时音效专业参数扩展
 *
 * 只向现有 Effect Card 追加参数行，不创建新的效果器卡片，也不改变开关、
 * 折叠、主题和预设逻辑。所有参数都由 updateEffectsFromUI → DSP Graph →
 * AudioWorklet 真实参与处理。
 * ========================================================================== */
const ADVANCED_EFFECT_CONTROLS = [
  {
    section: 'compressorParams',
    params: [
      { id: 'compKnee', label: 'knee', min: 0, max: 24, step: 0.5, get: (fx) => fx.compressor.knee, set: (fx, v) => (fx.compressor.knee = v), format: (v) => `${Number(v).toFixed(1)} dB` },
      { id: 'compMakeup', label: 'makeup', min: -12, max: 24, step: 0.5, get: (fx) => fx.compressor.makeupDB, set: (fx, v) => (fx.compressor.makeupDB = v), format: (v) => `${Number(v).toFixed(1)} dB` },
      { id: 'compLookahead', label: 'lookahead', min: 0, max: 10, step: 0.1, get: (fx) => fx.compressor.lookaheadMs, set: (fx, v) => (fx.compressor.lookaheadMs = v), format: (v) => `${Number(v).toFixed(1)} ms` },
      { id: 'compSidechain', label: 'sidechainFilter', min: 20, max: 2000, step: 10, get: (fx) => fx.compressor.sidechainHz, set: (fx, v) => (fx.compressor.sidechainHz = v), format: (v) => `${Math.round(v)} Hz` },
      { id: 'compLink', label: 'stereoLink', min: 0, max: 100, step: 1, get: (fx) => fx.compressor.stereoLink * 100, set: (fx, v) => (fx.compressor.stereoLink = v / 100), format: (v) => `${Math.round(v)}%` },
      { id: 'compAutoRelease', label: 'autoRelease', type: 'toggle', get: (fx) => fx.compressor.autoRelease, set: (fx, v) => (fx.compressor.autoRelease = !!v) }
    ]
  },
  {
    section: 'bassParams',
    params: [
      { id: 'bassSub', label: 'sub', min: -12, max: 12, step: 0.5, get: (fx) => fx.bass.subDB, set: (fx, v) => (fx.bass.subDB = v), format: (v) => `${Number(v).toFixed(1)} dB` },
      { id: 'bassHarmonic', label: 'harmonic', min: 0, max: 100, step: 1, get: (fx) => fx.bass.harmonic * 100, set: (fx, v) => (fx.bass.harmonic = v / 100), format: (v) => `${Math.round(v)}%` },
      { id: 'bassSlope', label: 'slope', min: 0, max: 100, step: 1, get: (fx) => fx.bass.slope * 100, set: (fx, v) => (fx.bass.slope = v / 100), format: (v) => `${Math.round(v)}%` },
      { id: 'bassMono', label: 'bassMono', min: 0, max: 100, step: 1, get: (fx) => fx.bass.bassMono * 100, set: (fx, v) => (fx.bass.bassMono = v / 100), format: (v) => `${Math.round(v)}%` },
      { id: 'bassMix', label: 'mix', min: 0, max: 100, step: 1, get: (fx) => fx.bass.mix * 100, set: (fx, v) => (fx.bass.mix = v / 100), format: (v) => `${Math.round(v)}%` }
    ]
  },
  {
    section: 'stereoParams',
    params: [
      { id: 'stereoMid', label: 'mid', min: -12, max: 12, step: 0.5, get: (fx) => fx.stereo.midDB, set: (fx, v) => (fx.stereo.midDB = v), format: (v) => `${Number(v).toFixed(1)} dB` },
      { id: 'stereoSide', label: 'side', min: -12, max: 12, step: 0.5, get: (fx) => fx.stereo.sideDB, set: (fx, v) => (fx.stereo.sideDB = v), format: (v) => `${Number(v).toFixed(1)} dB` },
      { id: 'stereoBassMono', label: 'bassMono', min: 0, max: 100, step: 1, get: (fx) => fx.stereo.bassMono * 100, set: (fx, v) => (fx.stereo.bassMono = v / 100), format: (v) => `${Math.round(v)}%` },
      { id: 'stereoMonoFreq', label: 'monoFrequency', min: 20, max: 500, step: 5, get: (fx) => fx.stereo.monoFreq, set: (fx, v) => (fx.stereo.monoFreq = v), format: (v) => `${Math.round(v)} Hz` },
      { id: 'stereoCorr', label: 'correlationProtect', min: 0, max: 100, step: 1, get: (fx) => fx.stereo.correlationProtect * 100, set: (fx, v) => (fx.stereo.correlationProtect = v / 100), format: (v) => `${Math.round(v)}%` },
      { id: 'stereoMix', label: 'mix', min: 0, max: 100, step: 1, get: (fx) => fx.stereo.mix * 100, set: (fx, v) => (fx.stereo.mix = v / 100), format: (v) => `${Math.round(v)}%` }
    ]
  },
  {
    section: 'surroundParams',
    params: [
      { id: 'spatialCrossfeed', label: 'crossfeed', min: 0, max: 100, step: 1, get: (fx) => fx.surround.crossfeed * 100, set: (fx, v) => (fx.surround.crossfeed = v / 100), format: (v) => `${Math.round(v)}%` },
      { id: 'spatialWidth', label: 'width', min: 0, max: 200, step: 1, get: (fx) => fx.surround.width * 100, set: (fx, v) => (fx.surround.width = v / 100), format: (v) => `${(v / 100).toFixed(2)}` },
      { id: 'spatialDepth', label: 'depth', min: 0, max: 100, step: 1, get: (fx) => fx.surround.depth * 100, set: (fx, v) => (fx.surround.depth = v / 100), format: (v) => `${Math.round(v)}%` },
      { id: 'spatialCenter', label: 'center', min: 0, max: 100, step: 1, get: (fx) => fx.surround.center * 100, set: (fx, v) => (fx.surround.center = v / 100), format: (v) => `${Math.round(v)}%` }
    ]
  },
  {
    section: 'clarityParams',
    params: [
      { id: 'clarityPresence', label: 'presence', min: -12, max: 12, step: 0.5, get: (fx) => fx.clarity.presenceDB, set: (fx, v) => (fx.clarity.presenceDB = v), format: (v) => `${Number(v).toFixed(1)} dB` },
      { id: 'clarityAir', label: 'air', min: -12, max: 12, step: 0.5, get: (fx) => fx.clarity.airDB, set: (fx, v) => (fx.clarity.airDB = v), format: (v) => `${Number(v).toFixed(1)} dB` },
      { id: 'clarityTarget', label: 'targetFrequency', min: 1000, max: 12000, step: 100, get: (fx) => fx.clarity.targetHz, set: (fx, v) => (fx.clarity.targetHz = v), format: (v) => `${Math.round(v)} Hz` },
      { id: 'clarityQ', label: 'q', min: 0.3, max: 8, step: 0.1, get: (fx) => fx.clarity.targetQ, set: (fx, v) => (fx.clarity.targetQ = v), format: (v) => Number(v).toFixed(2) },
      { id: 'clarityExciter', label: 'harmonicExciter', min: 0, max: 100, step: 1, get: (fx) => fx.clarity.exciter * 100, set: (fx, v) => (fx.clarity.exciter = v / 100), format: (v) => `${Math.round(v)}%` },
      { id: 'clarityMix', label: 'mix', min: 0, max: 100, step: 1, get: (fx) => fx.clarity.mix * 100, set: (fx, v) => (fx.clarity.mix = v / 100), format: (v) => `${Math.round(v)}%` }
    ]
  },
  {
    section: 'tubeParams',
    params: [
      { id: 'tubeBias', label: 'bias', min: -100, max: 100, step: 1, get: (fx) => fx.tube.bias * 100, set: (fx, v) => (fx.tube.bias = v / 100), format: (v) => `${Math.round(v)}%` },
      { id: 'tubeCharacter', label: 'character', min: -100, max: 100, step: 1, get: (fx) => fx.tube.character * 100, set: (fx, v) => (fx.tube.character = v / 100), format: (v) => `${Math.round(v)}%` },
      { id: 'tubeSymmetry', label: 'symmetry', min: 0, max: 100, step: 1, get: (fx) => fx.tube.symmetry * 100, set: (fx, v) => (fx.tube.symmetry = v / 100), format: (v) => `${Math.round(v)}%` },
      { id: 'tubeMix', label: 'mix', min: 0, max: 100, step: 1, get: (fx) => fx.tube.mix * 100, set: (fx, v) => (fx.tube.mix = v / 100), format: (v) => `${Math.round(v)}%` },
      { id: 'tubeOversample', label: 'oversampling', type: 'select', options: [['1', '1x'], ['2', '2x'], ['4', '4x']], get: (fx) => String(fx.tube.oversample), set: (fx, v) => (fx.tube.oversample = Number(v)) }
    ]
  },
  {
    section: 'reverbParams',
    params: [
      { id: 'revDiffusion', label: 'diffusion', min: 0, max: 100, step: 1, get: (fx) => fx.reverb.diffusion * 100, set: (fx, v) => (fx.reverb.diffusion = v / 100), format: (v) => `${Math.round(v)}%` },
      { id: 'revWidth', label: 'width', min: 0, max: 100, step: 1, get: (fx) => fx.reverb.width * 100, set: (fx, v) => (fx.reverb.width = v / 100), format: (v) => `${(v / 100).toFixed(2)}` },
      { id: 'revEarly', label: 'earlyReflections', min: 0, max: 100, step: 1, get: (fx) => fx.reverb.earlyReflections * 100, set: (fx, v) => (fx.reverb.earlyReflections = v / 100), format: (v) => `${Math.round(v)}%` },
      { id: 'revModRate', label: 'modRate', min: 5, max: 500, step: 5, get: (fx) => fx.reverb.modRate * 100, set: (fx, v) => (fx.reverb.modRate = v / 100), format: (v) => `${(v / 100).toFixed(2)} Hz` },
      { id: 'revModAmount', label: 'modAmount', min: 0, max: 100, step: 1, get: (fx) => fx.reverb.modAmount * 100, set: (fx, v) => (fx.reverb.modAmount = v / 100), format: (v) => `${Math.round(v)}%` },
      { id: 'revLowCut', label: 'lowCut', min: 20, max: 1000, step: 5, get: (fx) => fx.reverb.lowCut, set: (fx, v) => (fx.reverb.lowCut = v), format: (v) => `${Math.round(v)} Hz` },
      { id: 'revDucking', label: 'ducking', min: 0, max: 100, step: 1, get: (fx) => fx.reverb.ducking * 100, set: (fx, v) => (fx.reverb.ducking = v / 100), format: (v) => `${Math.round(v)}%` },
      { id: 'revDuckSens', label: 'duckSensitivity', min: 0, max: 100, step: 1, get: (fx) => fx.reverb.duckSensitivity * 100, set: (fx, v) => (fx.reverb.duckSensitivity = v / 100), format: (v) => `${Math.round(v)}%` }
    ]
  },
  {
    section: 'noiseGateParams',
    params: [
      { id: 'gateAttack', label: 'attack', min: 0.1, max: 50, step: 0.1, get: (fx) => fx.gate.attackMs, set: (fx, v) => (fx.gate.attackMs = v), format: (v) => `${Number(v).toFixed(1)} ms` },
      { id: 'gateHold', label: 'hold', min: 0, max: 500, step: 5, get: (fx) => fx.gate.holdMs, set: (fx, v) => (fx.gate.holdMs = v), format: (v) => `${Math.round(v)} ms` },
      { id: 'gateRange', label: 'range', min: 0, max: 80, step: 1, get: (fx) => fx.gate.rangeDB, set: (fx, v) => (fx.gate.rangeDB = v), format: (v) => `${Math.round(v)} dB` },
      { id: 'gateRatio', label: 'ratio', min: 1, max: 10, step: 0.1, get: (fx) => fx.gate.ratio, set: (fx, v) => (fx.gate.ratio = v), format: (v) => `${Number(v).toFixed(1)}:1` },
      { id: 'gateSidechain', label: 'sidechainFilter', min: 20, max: 2000, step: 10, get: (fx) => fx.gate.sidechainHz, set: (fx, v) => (fx.gate.sidechainHz = v), format: (v) => `${Math.round(v)} Hz` },
      { id: 'gateHysteresis', label: 'hysteresis', min: 0, max: 12, step: 0.5, get: (fx) => fx.gate.hysteresisDB, set: (fx, v) => (fx.gate.hysteresisDB = v), format: (v) => `${Number(v).toFixed(1)} dB` }
    ]
  },
  {
    section: 'limiterParams',
    params: [
      { id: 'limiterTruePeak', label: 'truePeak', type: 'toggle', get: (fx) => fx.limiter.truePeak, set: (fx, v) => (fx.limiter.truePeak = !!v) },
      { id: 'limiterOversample', label: 'oversampling', type: 'select', options: [['1', '1x'], ['2', '2x'], ['4', '4x']], get: (fx) => String(fx.limiter.oversample), set: (fx, v) => (fx.limiter.oversample = Number(v)) },
      { id: 'limiterLink', label: 'stereoLink', min: 0, max: 100, step: 1, get: (fx) => fx.limiter.stereoLink * 100, set: (fx, v) => (fx.limiter.stereoLink = v / 100), format: (v) => `${Math.round(v)}%` },
      { id: 'limiterInput', label: 'input', min: -24, max: 24, step: 0.5, get: (fx) => fx.limiter.inputDB, set: (fx, v) => (fx.limiter.inputDB = v), format: (v) => `${Number(v).toFixed(1)} dB` },
      { id: 'limiterSoftClip', label: 'softClip', type: 'toggle', get: (fx) => fx.limiter.softClip, set: (fx, v) => (fx.limiter.softClip = !!v) },
      { id: 'limiterAutoRelease', label: 'autoRelease', type: 'toggle', get: (fx) => fx.limiter.autoRelease, set: (fx, v) => (fx.limiter.autoRelease = !!v) }
    ]
  }
];

const EQ_ADVANCED_CONTROLS = [
  { id: 'eqBandSelect', label: 'band', type: 'select', options: Array.from({ length: 10 }, (_, i) => [String(i), `#${i + 1}`]), get: () => String(window.__eqBandIndex || 0), set: (_, v) => (window.__eqBandIndex = Number(v)) },
  { id: 'eqBandFreq', label: 'frequency', min: 20, max: 20000, step: 1, get: (fx, i) => fx.eqBands[i].freq, set: (fx, v, i) => (fx.eqBands[i].freq = v), format: (v) => `${Math.round(v)} Hz` },
  { id: 'eqBandQ', label: 'q', min: 0.3, max: 10, step: 0.1, get: (fx, i) => fx.eqBands[i].q, set: (fx, v, i) => (fx.eqBands[i].q = v), format: (v) => Number(v).toFixed(2) },
  { id: 'eqBandType', label: 'filterType', type: 'select', options: [['peaking', 'Peaking', 'filterPeaking'], ['lowshelf', 'Low Shelf', 'filterLowShelf'], ['highshelf', 'High Shelf', 'filterHighShelf'], ['bandpass', 'Band Pass', 'filterBandPass']], get: (fx, i) => fx.eqBands[i].type, set: (fx, v, i) => (fx.eqBands[i].type = v) },
  { id: 'eqBandSlope', label: 'slope', min: 0, max: 100, step: 1, get: (fx, i) => fx.eqBands[i].slope * 100, set: (fx, v, i) => (fx.eqBands[i].slope = v / 100), format: (v) => `${Math.round(v)}%` },
  { id: 'eqBandMS', label: 'midSide', min: -100, max: 100, step: 1, get: (fx, i) => fx.eqBands[i].ms * 100, set: (fx, v, i) => (fx.eqBands[i].ms = v / 100), format: (v) => `${Math.round(v)}%` },
  { id: 'eqBandDynamic', label: 'dynamic', min: 0, max: 100, step: 1, get: (fx, i) => fx.eqBands[i].dynamic * 100, set: (fx, v, i) => (fx.eqBands[i].dynamic = v / 100), format: (v) => `${Math.round(v)}%` }
];

window.__eqBandIndex = 0;

function buildAdvancedEffectControls() {
  ADVANCED_EFFECT_CONTROLS.forEach((group) => {
    const section = document.getElementById(group.section);
    if (!section) return;
    group.params.forEach((spec) => {
      const row = document.createElement('div');
      row.className = 'param';
      const label = document.createElement('label');
      label.dataset.i18n = spec.label;
      label.textContent = t(spec.label);
      row.appendChild(label);
      let input;
      if (spec.type === 'select' || spec.type === 'toggle') {
        input = document.createElement('select');
        input.className = 'full-select';
        if (spec.type === 'toggle') {
          [['on', t('on')], ['off', t('off')]].forEach(([value, text]) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = text;
            option.dataset.i18n = value;
            input.appendChild(option);
          });
        } else {
          spec.options.forEach(([value, text, i18nKey]) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = text;
            if (i18nKey) option.dataset.i18n = i18nKey;
            input.appendChild(option);
          });
        }
      } else {
        input = document.createElement('input');
        input.type = 'range';
        input.min = String(spec.min);
        input.max = String(spec.max);
        input.step = String(spec.step);
      }
      input.id = spec.id;
      input.dataset.advancedFx = group.section;
      const value = document.createElement('span');
      value.id = `${spec.id}Val`;
      value.className = 'value';
      input.addEventListener('input', () => {
        applyAdvancedControlLabel(spec);
        updateEffectsFromUI();
      });
      input.addEventListener('change', () => {
        applyAdvancedControlLabel(spec);
        updateEffectsFromUI();
      });
      row.appendChild(input);
      row.appendChild(value);
      section.appendChild(row);
    });
  });
}

function buildEqAdvancedControls() {
  const section = document.getElementById('eqSection');
  if (!section) return;
  const box = document.createElement('div');
  box.className = 'eq-advanced';
  box.id = 'eqAdvanced';
  EQ_ADVANCED_CONTROLS.forEach((spec) => {
    const row = document.createElement('div');
    row.className = 'param';
    const label = document.createElement('label');
    label.dataset.i18n = spec.label;
    label.textContent = t(spec.label);
    row.appendChild(label);
    let input;
    if (spec.type === 'select') {
      input = document.createElement('select');
      input.className = 'full-select';
      spec.options.forEach(([value, text, i18nKey]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        if (i18nKey) option.dataset.i18n = i18nKey;
        input.appendChild(option);
      });
    } else {
      input = document.createElement('input');
      input.type = 'range';
      input.min = String(spec.min);
      input.max = String(spec.max);
      input.step = String(spec.step);
    }
    input.id = spec.id;
    input.dataset.eqAdvanced = '1';
    const value = document.createElement('span');
    value.id = `${spec.id}Val`;
    value.className = 'value';
    input.addEventListener('input', () => {
      applyEqAdvancedControlLabels();
      updateEffectsFromUI();
    });
    input.addEventListener('change', () => {
      applyEqAdvancedControlLabels();
      updateEffectsFromUI();
    });
    row.appendChild(input);
    row.appendChild(value);
    box.appendChild(row);
  });
  section.appendChild(box);
}

function formatAdvancedValue(spec, value) {
  if (spec.type === 'toggle') return '';
  if (spec.type === 'select') return '';
  return spec.format ? spec.format(value) : String(value);
}

function applyAdvancedControlLabel(spec) {
  const input = document.getElementById(spec.id);
  const value = document.getElementById(`${spec.id}Val`);
  if (!input || !value) return;
  value.textContent = formatAdvancedValue(spec, input.value);
}

function applyAdvancedEffectControls() {
  ADVANCED_EFFECT_CONTROLS.forEach((group) => {
    group.params.forEach((spec) => {
      const input = document.getElementById(spec.id);
      const value = document.getElementById(`${spec.id}Val`);
      if (!input) return;
      const raw = spec.get(state.effects);
      if (spec.type === 'toggle') input.value = raw ? 'on' : 'off';
      else if (spec.type === 'select') input.value = String(raw);
      else input.value = String(raw);
      if (value) value.textContent = formatAdvancedValue(spec, raw);
    });
  });
}

function readAdvancedEffectControls() {
  ADVANCED_EFFECT_CONTROLS.forEach((group) => {
    group.params.forEach((spec) => {
      const input = document.getElementById(spec.id);
      if (!input) return;
      const value = spec.type === 'toggle' ? input.value === 'on' : Number(input.value);
      spec.set(state.effects, value);
    });
  });
}

function applyEqAdvancedControlLabels() {
  const i = Math.max(0, Math.min(9, Number(window.__eqBandIndex) || 0));
  EQ_ADVANCED_CONTROLS.forEach((spec) => {
    const input = document.getElementById(spec.id);
    const value = document.getElementById(`${spec.id}Val`);
    if (!input) return;
    const raw = spec.get(state.effects, i);
    if (spec.type === 'select') input.value = String(raw);
    else input.value = String(raw);
    if (value) value.textContent = formatAdvancedValue(spec, raw);
  });
}

function readEqAdvancedControls() {
  const i = Math.max(0, Math.min(9, Number(window.__eqBandIndex) || 0));
  EQ_ADVANCED_CONTROLS.forEach((spec) => {
    const input = document.getElementById(spec.id);
    if (!input) return;
    const value = spec.type === 'select' ? input.value : Number(input.value);
    spec.set(state.effects, value, i);
  });
}

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
  const masterOn = state.realtimeEnabled !== false;
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
    const nodeOn = masterOn && on;
    dspHost.setEnabled(id, nodeOn || (masterOn && spec.type === 'limiter'));
    dspHost.setParam(id, 'enabled', nodeOn);
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
    playbackMode: 'list',
    effectsMasterEnabled: true
  },
  realtimeEnabled: true,
  online: {
    sources: [],
    sourceId: '',
    type: 'song',
    query: '',
    results: [],
    discovery: null,
    picks: null,
    spotifyAuth: { authenticated: false, displayName: '' },
    category: '',
    forceDiscovery: false,
    detail: null,
    loading: false,
    status: 'idle',
    error: '',
    hasSearched: false,
    /** 每首歌的下载状态（键 = `${sourceId}:${resourceId}`），只存渲染所需的最小状态 */
    downloads: new Map(),
    editingSourceId: null,
    section: 'source',
    navCollapsed: false,
    draft: null
  },
  favorites: new Set(),
  history: [],
  playlistFilter: { view: 'all', quality: [], folder: '', panelOpen: false },
  selectedKeys: new Set(),
  lastSelectedKey: '',
  /** 正在只读预览的队列（历史队列）：为空表示在看活动队列 */
  queuePreviewId: '',
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

/* ============================================================================
 * Queue Manager —— 播放队列数据层（Queue 是业务真相源）
 * --------------------------------------------------------------------------
 * 边界：
 *   - 所有队列写入（追加 / 替换 / 删除 / 清空 / 切队列 / 记录当前曲目）只经过 queueManager；
 *   - state.tracks / state.currentIndex 只是 activeQueue 对现有播放器的**兼容投影**，
 *     由 Queue Manager 单向写出，其它逻辑不得再直接 push / splice / sort / 替换它们；
 *   - 播放器、audioElement、MediaElementSource、AudioWorklet、analyser、DSP 一律不碰；
 *   - 持久化只通过主进程的 queues:get / queues:set（结构校验 + 版本校验 + 容量裁剪 + 串行原子写）。
 * ========================================================================== */
const queueManager = window.RlonQueueManager.createQueueManager({
  state,
  getPlayMode: () => state.mode,
  storage: {
    load: () => api.queuesGet(),
    save: (snapshot) => api.queuesSet(snapshot)
  },
  readMetadata: (filePath) => api.readMetadata(filePath)
});

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/** Preset 恢复必须按默认结构深合并，旧 Preset 缺少新增字段时不能产生 undefined。 */
function deepMergeEffects(target, source) {
  if (!isPlainObject(source)) return target;
  Object.keys(source).forEach((key) => {
    const value = source[key];
    const current = target[key];
    if (Array.isArray(value)) {
      if (Array.isArray(current) && value.length === current.length
        && value.every((item, index) => isPlainObject(item) && isPlainObject(current[index]))) {
        value.forEach((item, index) => deepMergeEffects(current[index], item));
      } else {
        target[key] = deepClone(value);
      }
    } else if (isPlainObject(value)) {
      if (!isPlainObject(current)) target[key] = {};
      deepMergeEffects(target[key], value);
    } else {
      target[key] = value;
    }
  });
  return target;
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
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
  renderQueueFilterBar();
  renderPlaylist();
  updateNowPlaying();
  // 在线资源页的分区标题 / 内容归属 / 按钮文案是渲染时生成的（不是 data-i18n 节点），
  // 切语言时按当前数据重渲染一次即可跟上语言（只读缓存，不重新请求网络）。
  renderOnlineResults();
  // 音量控件的提示语 / 读数是运行时生成的，同样在切语言时同步一次
  updateVolumeUi();
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

/**
 * 图标状态切换（播放↔暂停、音量↔静音、循环模式、最大化↔还原）。
 * 只做两件事：换成新的矢量图标 + 在它身上播一段 160ms 的轻微淡入/微缩放。
 * 不延时、不拦截功能：功能状态立即生效，动画只是视觉上的顺滑。
 */
function swapIcon(useEl, href) {
  if (!useEl) return;
  if (useEl.getAttribute('href') === href) return;
  useEl.setAttribute('href', href);
  const svg = useEl.ownerSVGElement;
  if (!svg) return;
  svg.classList.remove('is-swapping');
  // 强制重新开始动画（连续快速切换时也要重播）
  void svg.getBoundingClientRect();
  svg.classList.add('is-swapping');
  window.setTimeout(() => svg.classList.remove('is-swapping'), 220);
}

function updateModeButton() {
  const icon = $('modeBtnIcon');
  if (!icon) return;
  const map = { list: '#icon-loop-list', single: '#icon-loop-single', random: '#icon-loop-random' };
  swapIcon(icon, map[state.mode] || '#icon-loop-list');
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
  // 当前曲目身份只认 currentTrackKey：运行时索引 → 稳定身份 → 投影（索引由投影反查得到）
  queueManager.setCurrentTrackKey(queueManager.keyAtIndex(index));
  updateNowPlaying();
  renderPlaylist();
  if (state.currentTrack) {
    const historyItem = { path: state.currentTrack.path, title: state.currentTrack.title, artist: state.currentTrack.artist };
    api.addHistory(historyItem).then((next) => {
      state.history = Array.isArray(next) ? next : state.history;
      if (playlistFilterActive()) renderPlaylist();
    }).catch(() => { /* 历史写入失败不影响播放 */ });
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

/* ============================================================================
 * 播放中心（左侧卡片内部）：Queue Center
 * --------------------------------------------------------------------------
 * - Queue 是真相源：列表只渲染 activeQueue（或历史队列的只读预览）的投影；
 * - 视图筛选 / 快速视图只改显示顺序，不改 Queue 真实顺序；此时禁用拖拽；
 * - 行内所有操作只认 trackKey（本地 path / 在线 sourceId+onlineId），不依赖旧 index；
 * - 大列表只渲染可视窗口（上下用占位块撑高），1000~3000 首不会产生海量 DOM。
 * ========================================================================== */
const TRACK_ROW_HEIGHT = 46;          // 与 styles.css 里 .track-item 的行高保持一致

function playlistQuery() {
  const input = $('playlistSearch');
  return (input && input.value ? input.value : '').trim().toLowerCase();
}

/** 行内展示的来源名：本地 / 在线源真实名称（按 sourceId 查在线源，不写死平台） */
function queueSourceLabel(track) {
  if (!track) return '';
  if (!track.sourceId) return t('queueSourceLocal');
  const source = (state.online.sources || []).find((item) => item.id === track.sourceId);
  if (source && source.name) return source.name;
  return t('queueSourceOnline');
}

/** 搜索范围：歌名 / 艺人 / 专辑 / 本地文件名与路径 / 来源 id 与来源名 */
function trackMatchesQuery(track, query) {
  if (!query) return true;
  const fileName = String(track.path || '').split(/[\\/]/).pop() || '';
  return [track.title, track.artist, track.album, fileName, track.path, track.sourceId, queueSourceLabel(track)]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(query);
}

/** 预览中的队列（只读历史队列） */
function previewQueueId() {
  return state.queuePreviewId && queueManager.getQueue(state.queuePreviewId) ? state.queuePreviewId : '';
}

/** 当前正在展示的队列：预览优先，否则活动队列 */
function displayedQueue() {
  const preview = previewQueueId();
  return (preview ? queueManager.getQueue(preview) : queueManager.getActiveQueue()) || null;
}

function queueIsEditable(queue) {
  if (!queue) return false;
  if (queue.readonly) return false;
  return queue.id === queueManager.getActiveQueueId();
}

const QUICK_VIEWS = [
  { id: 'all', i18n: 'queueFilterAll', icon: 'list' },
  { id: 'recent-added', i18n: 'queueViewRecentAdded', icon: 'plus' },
  { id: 'recent-played', i18n: 'queueViewRecentPlayed', icon: 'clock' },
  { id: 'unplayed', i18n: 'queueViewUnplayed', icon: 'play' },
  { id: 'favorites', i18n: 'queueViewFavorites', icon: 'note' }
];

const QUALITY_FILTERS = [
  { id: 'lossless', i18n: 'queueQualityLossless' },
  { id: 'hi-res', i18n: 'queueQualityHiRes' },
  { id: '24bit', i18n: 'queueQuality24bit' },
  { id: 'high-sample-rate', i18n: 'queueQualityHighSampleRate' },
  { id: 'multichannel', i18n: 'queueQualityMultichannel' },
  { id: 'unknown', i18n: 'queueQualityUnknown' }
];

/** 质量判断只认 metadata 字段，绝不按扩展名猜。 */
const LOSSLESS_CODECS = new Set([
  'flac', 'alac', 'ape', 'wavpack', 'tta', 'tak',
  'pcm', 'wav', 'aiff', 'aif', 'dsd', 'dsf', 'dff', 'truehd'
]);

function playlistFilterActive() {
  return state.playlistFilter.view !== 'all'
    || state.playlistFilter.quality.length > 0
    || !!state.playlistFilter.folder;
}

function historyEntryForTrack(track) {
  const key = queueManager.trackKey(track);
  if (!key) return null;
  return (state.history || []).find((entry) => String(entry && entry.path || '') === key) || null;
}

function historyTimeForTrack(track) {
  const entry = historyEntryForTrack(track);
  return entry && Number.isFinite(entry.time) ? entry.time : 0;
}

function quickViewSortRows(rows, view) {
  if (view === 'recent-added') {
    const queue = displayedQueue();
    const queueId = queue ? queue.id : '';
    return rows.sort((a, b) => {
      const left = queueManager.addedSequence(queueId, queueManager.trackKey(a.track));
      const right = queueManager.addedSequence(queueId, queueManager.trackKey(b.track));
      return right - left || a.index - b.index;
    });
  }
  if (view === 'recent-played') {
    return rows.sort((a, b) => {
      return historyTimeForTrack(b.track) - historyTimeForTrack(a.track) || a.index - b.index;
    });
  }
  return rows;
}

function trackMatchesQuickView(track) {
  const view = state.playlistFilter.view;
  if (view === 'recent-played') return !!historyEntryForTrack(track);
  if (view === 'unplayed') return !historyEntryForTrack(track);
  if (view === 'favorites') return state.favorites.has(track.path);
  return true;
}

function qualityPredicates(track) {
  if (!track || queueManager.isOnlineTrack(track)) return {};
  const codec = String(track.codec || '').toLowerCase();
  const sampleRate = Number(track.sampleRate) || 0;
  const bitrate = Number(track.bitrate) || 0;
  const bitdepth = Number(track.bitdepth) || 0;
  const channels = Number(track.channels) || 0;
  const hasMetadata = sampleRate > 0 || bitrate > 0 || bitdepth > 0 || channels > 0 || !!codec;
  return {
    lossless: LOSSLESS_CODECS.has(codec),
    'hi-res': bitdepth > 16 || sampleRate > 48000,
    '24bit': bitdepth >= 24,
    'high-sample-rate': sampleRate > 48000,
    multichannel: channels > 2,
    unknown: !hasMetadata
  };
}

function trackMatchesQuality(track) {
  const selected = state.playlistFilter.quality;
  if (!selected.length) return true;
  if (queueManager.isOnlineTrack(track)) return false;
  const predicates = qualityPredicates(track);
  return selected.some((quality) => predicates[quality]);
}

function folderPathOfTrack(track) {
  const filePath = String(track && track.path || '').replace(/\\/g, '/');
  const slash = filePath.lastIndexOf('/');
  return slash >= 0 ? filePath.slice(0, slash) : filePath;
}

function folderKey(value) {
  return String(value || '').replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase();
}

function trackMatchesFolder(track) {
  const folder = state.playlistFilter.folder;
  if (!folder) return true;
  if (queueManager.isOnlineTrack(track)) return false;
  const dir = folderKey(folderPathOfTrack(track));
  const want = folderKey(folder);
  return dir === want || dir.startsWith(`${want}/`);
}

function trackMatchesFilter(track) {
  return trackMatchesQuickView(track) && trackMatchesQuality(track) && trackMatchesFolder(track);
}

function folderPathSegments(rawPath) {
  const norm = String(rawPath || '').replace(/\\/g, '/').replace(/\/+$/, '');
  if (!norm) return [];
  const drive = norm.match(/^([A-Za-z]):(?:\/|$)/);
  if (drive) {
    const drivePath = `${drive[1].toUpperCase()}:/`;
    const rest = norm.slice(drive[0].length).split('/').filter(Boolean);
    const parts = [{ label: `${drive[1].toUpperCase()}:`, path: drivePath }];
    let current = drivePath;
    for (const segment of rest) {
      current = `${current.replace(/\/+$/, '')}/${segment}`;
      parts.push({ label: segment, path: current });
    }
    return parts;
  }
  if (norm.startsWith('//')) {
    const segments = norm.split('/').filter(Boolean);
    if (segments.length < 2) return [];
    const rootPath = `//${segments[0]}/${segments[1]}`;
    const parts = [{ label: rootPath, path: rootPath }];
    let current = rootPath;
    for (const segment of segments.slice(2)) {
      current = `${current.replace(/\/+$/, '')}/${segment}`;
      parts.push({ label: segment, path: current });
    }
    return parts;
  }
  const segments = norm.split('/').filter(Boolean);
  if (!segments.length) return [];
  const rootPath = `/${segments[0]}`;
  const parts = [{ label: segments[0], path: rootPath }];
  let current = rootPath;
  for (const segment of segments.slice(1)) {
    current = `${current.replace(/\/+$/, '')}/${segment}`;
    parts.push({ label: segment, path: current });
  }
  return parts;
}

function folderTreeFromPaths(paths) {
  const roots = [];
  const byPath = new Map();
  for (const rawPath of paths) {
    const filePath = String(rawPath || '').replace(/\\/g, '/');
    const slash = filePath.lastIndexOf('/');
    if (slash < 0) continue;
    const parts = folderPathSegments(filePath.slice(0, slash));
    if (!parts.length) continue;
    let siblings = roots;
    for (const part of parts) {
      let node = byPath.get(part.path);
      if (!node) {
        node = { path: part.path, label: part.label, children: [] };
        byPath.set(part.path, node);
        siblings.push(node);
      }
      siblings = node.children;
    }
  }
  const sortNodes = (nodes) => {
    nodes.sort((left, right) => String(left.label).localeCompare(String(right.label)));
    nodes.forEach((node) => sortNodes(node.children));
  };
  sortNodes(roots);
  return roots;
}

function buildFolderTreeNode(node) {
  const details = document.createElement('details');
  details.className = 'queue-folder-node';
  const summary = document.createElement('summary');
  summary.className = 'queue-folder-node__label';
  summary.dataset.folder = node.path;
  summary.title = node.path;
  summary.innerHTML = '<svg class="icon icon-sm"><use href="#icon-folder"></use></svg><span></span>';
  summary.querySelector('span').textContent = node.label;
  details.appendChild(summary);
  if (node.children.length) {
    const children = document.createElement('div');
    children.className = 'queue-folder-children';
    node.children.forEach((child) => children.appendChild(buildFolderTreeNode(child)));
    details.appendChild(children);
  }
  return details;
}

function renderFolderTree() {
  const host = $('queueFolderTree');
  if (!host) return;
  const queue = displayedQueue();
  const paths = (queue ? queue.songs : [])
    .filter((track) => !queueManager.isOnlineTrack(track))
    .map((track) => track.path);
  const roots = folderTreeFromPaths(paths);
  host.innerHTML = '';
  if (!roots.length) {
    const empty = document.createElement('span');
    empty.className = 'muted small';
    empty.textContent = t('queueFolderAll');
    host.appendChild(empty);
  } else {
    roots.forEach((root) => host.appendChild(buildFolderTreeNode(root)));
  }
  syncFilterControls();
}

function renderQueueFilterBar() {
  const viewHost = $('queueViewChips');
  if (viewHost) {
    viewHost.innerHTML = '';
    QUICK_VIEWS.forEach((item) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'queue-filter-chip';
      chip.dataset.view = item.id;
      chip.innerHTML = `<svg class="icon icon-sm"><use href="#icon-${item.icon}"></use></svg>`;
      chip.title = t(item.i18n);
      chip.setAttribute('aria-label', t(item.i18n));
      chip.setAttribute('data-i18n-title', item.i18n);
      viewHost.appendChild(chip);
    });
  }
  const qualityHost = $('queueQualityChips');
  if (qualityHost) {
    qualityHost.innerHTML = '';
    QUALITY_FILTERS.forEach((item) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'queue-filter-chip';
      chip.dataset.quality = item.id;
      chip.textContent = t(item.i18n);
      qualityHost.appendChild(chip);
    });
  }
  const panel = $('queueFilterPanel');
  if (panel) panel.hidden = !state.playlistFilter.panelOpen;
  renderFolderTree();
}

function syncFilterControls() {
  const view = state.playlistFilter.view;
  document.querySelectorAll('#queueViewChips .queue-filter-chip').forEach((chip) => {
    chip.classList.toggle('is-active', chip.dataset.view === view);
  });
  const quality = new Set(state.playlistFilter.quality);
  document.querySelectorAll('#queueQualityChips .queue-filter-chip').forEach((chip) => {
    chip.classList.toggle('is-active', quality.has(chip.dataset.quality));
  });
  const toggle = $('queueFilterToggle');
  if (toggle) toggle.classList.toggle('is-active', playlistFilterActive());
  const folder = folderKey(state.playlistFilter.folder);
  document.querySelectorAll('#queueFolderTree .queue-folder-node__label').forEach((label) => {
    label.classList.toggle('is-active', !!folder && folderKey(label.dataset.folder) === folder);
  });
}

function currentFilteredRows() {
  return buildPlaylistView(displayedQueue());
}

function selectedKeysInViewOrder() {
  return currentFilteredRows()
    .map((row) => queueManager.trackKey(row.track))
    .filter((key) => key && state.selectedKeys.has(key));
}

function renderSelectionBar() {
  const bar = $('queueSelectionBar');
  if (!bar) return;
  const count = selectedKeysInViewOrder().length;
  bar.hidden = count === 0;
  if (count === 0) return;
  const countEl = $('queueSelectionCount');
  if (countEl) countEl.textContent = t('queueSelectionCount').replace('{n}', String(count));
}

function clearSelection() {
  state.selectedKeys.clear();
  state.lastSelectedKey = '';
  renderSelectionBar();
}

function toggleSelectedKey(key) {
  const target = String(key || '');
  if (!target) return;
  if (state.selectedKeys.has(target)) {
    state.selectedKeys.delete(target);
    state.lastSelectedKey = '';
  } else {
    state.selectedKeys.add(target);
    state.lastSelectedKey = target;
  }
  renderPlaylist();
}

function selectRangeTo(key) {
  const rows = currentFilteredRows();
  const keys = rows.map((row) => queueManager.trackKey(row.track)).filter(Boolean);
  const target = String(key || '');
  if (!keys.length || !target) return;
  if (!state.lastSelectedKey || !keys.includes(state.lastSelectedKey)) {
    state.selectedKeys.add(target);
    state.lastSelectedKey = target;
  } else {
    const start = keys.indexOf(state.lastSelectedKey);
    const end = keys.indexOf(target);
    const from = Math.min(start, end);
    const to = Math.max(start, end);
    for (let index = from; index <= to; index++) state.selectedKeys.add(keys[index]);
    state.lastSelectedKey = target;
  }
  renderPlaylist();
}

function selectAllFiltered() {
  const keys = currentFilteredRows().map((row) => queueManager.trackKey(row.track)).filter(Boolean);
  if (!keys.length) return;
  const allSelected = keys.every((key) => state.selectedKeys.has(key));
  if (allSelected) {
    keys.forEach((key) => state.selectedKeys.delete(key));
    state.lastSelectedKey = '';
  } else {
    keys.forEach((key) => state.selectedKeys.add(key));
    state.lastSelectedKey = keys[keys.length - 1];
  }
  renderPlaylist();
}

function playSelectedKeys() {
  const keys = selectedKeysInViewOrder();
  if (!keys.length) return;
  const first = keys[0];
  // 只播放第一首，其余用现有「依次插队」能力，不重写播放器 / 不改变 songs 顺序。
  keys.slice(1).forEach((key) => queueManager.enqueueNext(key, 'sequence'));
  playTrackByKey(first);
}

function enqueueSelectedKeys() {
  const keys = selectedKeysInViewOrder();
  if (!keys.length) return;
  keys.forEach((key) => queueManager.enqueueNext(key, 'sequence'));
  renderPlaylist();
  showToast(t('trackQueuedSequence'));
}

function favoriteSelectedKeys() {
  const keys = selectedKeysInViewOrder();
  if (!keys.length) return;
  const allFavorite = keys.every((key) => {
    const index = queueManager.indexOfTrackKey(key);
    return index >= 0 && state.favorites.has(state.tracks[index].path);
  });
  keys.forEach((key) => {
    const index = queueManager.indexOfTrackKey(key);
    if (index < 0) return;
    const path = state.tracks[index].path;
    if (allFavorite) state.favorites.delete(path);
    else state.favorites.add(path);
  });
  api.setFavorites([...state.favorites]);
  renderPlaylist();
}

function removeSelectedKeys() {
  const queue = queueManager.getActiveQueue();
  if (!queue || !queueIsEditable(queue)) return;
  const keys = selectedKeysInViewOrder();
  if (!keys.length) return;
  const currentKey = String(queue.currentTrackKey || '');
  const nonCurrent = keys.filter((key) => key !== currentKey);
  nonCurrent.forEach((key) => queueManager.removeTrack(key));
  clearSelection();
  if (keys.includes(currentKey)) {
    removeTrackFromQueue(currentKey);
  } else {
    renderQueueFilterBar();
    renderPlaylist();
  }
}

function setQuickView(view) {
  if (!QUICK_VIEWS.some((item) => item.id === view)) return;
  state.playlistFilter.view = view;
  clearSelection();
  syncFilterControls();
  renderPlaylist();
}

function toggleQuality(quality) {
  const list = state.playlistFilter.quality;
  const index = list.indexOf(quality);
  if (index >= 0) list.splice(index, 1);
  else list.push(quality);
  clearSelection();
  syncFilterControls();
  renderPlaylist();
}

function setFolder(folder) {
  state.playlistFilter.folder = String(folder || '');
  clearSelection();
  syncFilterControls();
  renderPlaylist();
}

function clearPlaylistFilter() {
  state.playlistFilter.view = 'all';
  state.playlistFilter.quality = [];
  state.playlistFilter.folder = '';
  clearSelection();
  syncFilterControls();
  renderPlaylist();
}

/** 过滤 + 视图排序后的展示顺序（元素带真实队列索引，行为/身份永远按 key） */
function buildPlaylistView(queue) {
  const songs = queue ? queue.songs : [];
  const query = playlistQuery();
  const rows = [];
  songs.forEach((track, index) => {
    if (!trackMatchesQuery(track, query)) return;
    if (!trackMatchesFilter(track)) return;
    rows.push({ track, index });
  });
  if (state.playlistFilter.view !== 'all') {
    quickViewSortRows(rows, state.playlistFilter.view);
  }
  return rows;
}

function buildTrackRow(row, options) {
  const { track, index } = row;
  const key = queueManager.trackKey(track);
  const li = document.createElement('li');
  li.className = 'track-item'
    + (index === state.currentIndex ? ' active' : '')
    + (state.selectedKeys.has(key) ? ' is-selected' : '');
  li.dataset.key = key;
  li.dataset.index = String(index);
  li.style.height = `${TRACK_ROW_HEIGHT}px`;
  if (options.editable) li.draggable = true;
  li.innerHTML = `
    <span class="track-num"></span>
    <span class="track-main">
      <span class="track-title"></span>
      <span class="track-artist"></span>
    </span>
    <span class="track-time"></span>
    <span class="track-actions">
      <button class="track-act track-heart" type="button"><svg class="icon icon-sm"><use href="#icon-note"></use></svg></button>
      <button class="track-act track-next" type="button"><svg class="icon icon-sm"><use href="#icon-next"></use></svg></button>
      <button class="track-act track-remove" type="button"><svg class="icon icon-sm"><use href="#icon-trash"></use></svg></button>
    </span>`;
  li.querySelector('.track-num').textContent = String(index + 1);
  li.querySelector('.track-title').textContent = track.title || '';
  const meta = [track.artist || track.album || '', queueSourceLabel(track)].filter(Boolean).join(' · ');
  li.querySelector('.track-artist').textContent = meta;
  li.querySelector('.track-time').textContent = formatTime(track.duration || 0);
  const heart = li.querySelector('.track-heart');
  heart.classList.toggle('fav', state.favorites.has(track.path));
  heart.title = t('favorite');
  heart.setAttribute('aria-label', t('favorite'));
  const next = li.querySelector('.track-next');
  next.title = t('trackPlayNext');
  next.setAttribute('aria-label', t('trackPlayNext'));
  const remove = li.querySelector('.track-remove');
  remove.title = t('trackRemove');
  remove.setAttribute('aria-label', t('trackRemove'));
  if (!options.editable) {
    // 只读预览：不提供删除/拖拽入口，但保留收藏与播放
    remove.remove();
    heart.classList.add('track-act--readonly');
  }
  return li;
}

function renderPlaylist() {
  const list = $('trackList');
  if (!list) return;
  // 窗口化渲染会重建 DOM：先记下当前滚动位置，重建后原样还原，
  // 否则滚动过程中每帧都被重置，列表就「滚不动」。
  const prevScrollTop = list.scrollTop;
  const queue = displayedQueue();
  const rows = buildPlaylistView(queue);
  const editable = queueIsEditable(queue);
  const sortHint = $('queueViewHint');
  if (sortHint) {
    const showHint = playlistFilterActive() && !previewQueueId();
    sortHint.hidden = !showHint;
    sortHint.textContent = showHint ? t('queueViewFilterHint') : '';
  }
  list.classList.toggle('is-readonly', !editable);
  list.innerHTML = '';

  // 整列表渲染：行数由真实数据决定，列表自身滚动。
  // （曾用「可视窗口 + 上下占位块」做 1000+ 优化，但重建 DOM 会让列表高度瞬时塌陷、
  //   浏览器把 scrollTop 归零，表现为列表滚不动；正确性优先，这里恢复整列表渲染。）
  rows.forEach((row) => list.appendChild(buildTrackRow(row, { editable })));
  if (list.scrollTop !== prevScrollTop) list.scrollTop = prevScrollTop;

  const countEl = $('queueCount');
  if (countEl) {
    const activeQueue = queueManager.getActiveQueue();
    const totalSongs = activeQueue ? activeQueue.songs.length : 0;
    const remaining = queueManager.remainingCount();
    countEl.textContent = `${t('queueTotalSongs').replace('{n}', String(totalSongs))} · ${t('queueRemaining').replace('{n}', String(remaining))}`;
  }
  renderQueueSelector();
  renderQueueEmptyState();
  renderSelectionBar();
}

function renderQueueEmptyState() {
  const empty = $('queueEmpty');
  const list = $('trackList');
  if (!empty || !list) return;
  const queue = displayedQueue();
  const isEmpty = !!queue && queue.songs.length === 0 && !previewQueueId();
  empty.hidden = !isEmpty;
  list.hidden = isEmpty;
}

/** 队列选择器：只渲染实际存在的队列（本地 / 手动 / 在线来源 / 历史） */
function renderQueueSelector() {
  const host = $('queueSelector');
  if (!host) return;
  const queues = queueManager.listQueues();
  const activeId = queueManager.getActiveQueueId();
  const preview = previewQueueId();
  const deletable = (queue) => !queue.active && !queue.readonly && queue.kind !== 'manual' && queue.id !== 'queue:local';
  host.innerHTML = '';
  queues.forEach((queue) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'queue-chip' + (queue.id === activeId ? ' is-active' : '') + (queue.id === preview ? ' is-preview' : '');
    chip.dataset.queueId = queue.id;
    chip.title = queue.kind === 'history' ? t('queueHistoryHint') : (queue.title || t('queueSwitcherHint'));
    const name = document.createElement('span');
    name.className = 'queue-chip-name';
    name.textContent = queueChipLabel(queue);
    const count = document.createElement('span');
    count.className = 'queue-chip-count';
    count.textContent = String(queue.count);
    chip.append(name, count);
    if (deletable(queue)) {
      const del = document.createElement('span');
      del.className = 'queue-chip-del';
      del.setAttribute('role', 'button');
      del.title = t('queueDelete');
      del.innerHTML = '<svg class="icon icon-sm"><use href="#icon-close"></use></svg>';
      chip.appendChild(del);
    }
    host.appendChild(chip);
  });
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'queue-chip queue-chip--add';
  add.id = 'queueAddBtn';
  add.title = t('queueAddManual');
  add.innerHTML = '<svg class="icon icon-sm"><use href="#icon-queue-add"></use></svg>';
  host.appendChild(add);
}

function queueChipLabel(queue) {
  if (queue.id === 'queue:local') return t('queueLocal');
  if (queue.kind === 'manual') return t('queueManual');
  if (queue.kind === 'history') return t('queueHistory');
  if (queue.title) return queue.title;
  if (queue.sourceType === 'spotify') return 'Spotify';
  if (queue.sourceType === 'apple-music') return 'Apple Music';
  if (queue.sourceType === 'musicsquare') return 'MusicSquare';
  return queue.sourceType || t('queueSwitcherHint');
}

/** 切换队列：只切数据层指针 + 投影；不重建 Audio Graph，也不打断正在播放的音频 */
function switchQueue(queueId) {
  const queue = queueManager.getQueue(queueId);
  if (!queue) return;
  clearSelection();
  if (queue.readonly) {
    // 历史队列：只读预览；点歌才会真正接管
    state.queuePreviewId = queue.id;
    renderQueueFilterBar();
    renderPlaylist();
    return;
  }
  state.queuePreviewId = '';
  queueManager.setActiveQueue(queue.id);
  renderQueueFilterBar();
  renderPlaylist();
  updateNowPlaying();
  // 切进来的队列可能还是恢复态（quality 字段为 0），懒补全后再刷新 Unknown 状态
  if (queue.kind !== 'online' && queue.songs.some((track) => !queueManager.isOnlineTrack(track) && (!track.sampleRate && !track.bitrate && !track.channels && !track.bitdepth && !track.codec))) {
    void safeRunAsync('队列元数据懒补全', async () => {
      await queueManager.hydrateQueue(queue.id);
      renderPlaylist();
    });
  }
}

function exitQueuePreview() {
  if (!state.queuePreviewId) return;
  state.queuePreviewId = '';
  clearSelection();
  renderQueueFilterBar();
  renderPlaylist();
}

/** 接管只读历史队列：Queue Manager 会新建可写队列并深拷贝曲目（不共享引用） */
function takeOverPreviewQueue(playKey) {
  const preview = previewQueueId();
  if (!preview) return;
  const taken = queueManager.takeOverQueue(preview, { kind: 'manual', queueId: 'queue:manual' });
  state.queuePreviewId = '';
  clearSelection();
  if (!taken) return;
  if (playKey) {
    queueManager.setCurrentTrackKey(playKey);
    playTrackByKey(playKey);
  }
  renderQueueFilterBar();
  renderPlaylist();
}

/** 定位当前歌曲：滚到可视区中部（大列表也成立，窗口会跟着当前行移动） */
function locateCurrentTrack() {
  const list = $('trackList');
  if (!list) return;
  const row = list.querySelector('.track-item.active');
  if (!row) {
    showToast(t('trackLocateMissing'));
    return;
  }
  const target = row.offsetTop - (list.clientHeight - TRACK_ROW_HEIGHT) / 2;
  list.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
  row.classList.add('is-located');
  window.setTimeout(() => row.classList.remove('is-located'), 900);
}

/* ============================================================================
 * 拖拽重排（原生 HTML5 DnD，不引入任何第三方拖拽库）
 * --------------------------------------------------------------------------
 * - 真正修改 Queue 顺序并持久化（moveTrack）；
 * - 只认 trackKey：当前曲目身份不会因为重排丢失；
 * - 拖拽期间挂起侧栏自动收起；dragend / pointercancel / blur / Esc 都会恢复；
 * - Esc 取消不会触发 drop，因此顺序不变。
 * ========================================================================== */
let playlistDrag = null;
let playlistDropTarget = null;

function clearDropMarks() {
  const list = $('trackList');
  if (!list) return;
  list.querySelectorAll('.is-drop-before, .is-drop-after').forEach((row) => {
    row.classList.remove('is-drop-before', 'is-drop-after');
  });
}

function endPlaylistDrag() {
  clearDropMarks();
  const list = $('trackList');
  if (list) list.querySelectorAll('.is-dragging').forEach((row) => row.classList.remove('is-dragging'));
  playlistDrag = null;
  playlistDropTarget = null;
  suspendSidebarAutoCollapse(false);
}

function applyPlaylistDrop() {
  const drag = playlistDrag;
  const target = playlistDropTarget;
  if (!drag || !target) {
    endPlaylistDrag();
    return;
  }
  const from = queueManager.indexOfTrackKey(drag.key);
  if (from < 0) {
    endPlaylistDrag();
    return;
  }
  let to = target.index + (target.after ? 1 : 0);
  if (from < to) to -= 1;                       // 移除源行后目标位置前移
  to = Math.max(0, Math.min(queueManager.getActiveQueue().songs.length - 1, to));
  if (from !== to) queueManager.moveTrack(drag.key, to);
  endPlaylistDrag();
  renderPlaylist();
  showToast(t('queueReordered'));
}

function canDragRows() {
  if (previewQueueId()) return false;           // 历史队列只读预览
  if (!queueIsEditable(displayedQueue())) return false;
  if (playlistFilterActive()) return false;      // 筛选状态下同样只改显示，不允许拖拽
  return true;
}

function setupPlaylistDrag() {
  const list = $('trackList');
  if (!list) return;
  list.addEventListener('dragstart', (event) => {
    const row = event.target.closest('.track-item');
    if (!row) return;
    if (!canDragRows()) {
      event.preventDefault();
      return;
    }
    playlistDrag = { key: row.dataset.key };
    row.classList.add('is-dragging');
    suspendSidebarAutoCollapse(true);
    try {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', row.dataset.key);
    } catch (error) { /* 某些平台不允许写 dataTransfer，忽略 */ }
  });
  list.addEventListener('dragover', (event) => {
    if (!playlistDrag) return;
    const row = event.target.closest('.track-item');
    if (!row) return;
    event.preventDefault();
    try { event.dataTransfer.dropEffect = 'move'; } catch (error) { /* ignore */ }
    const rect = row.getBoundingClientRect();
    const after = event.clientY > rect.top + rect.height / 2;
    clearDropMarks();
    row.classList.add(after ? 'is-drop-after' : 'is-drop-before');
    playlistDropTarget = { key: row.dataset.key, index: Number(row.dataset.index) || 0, after };
  });
  list.addEventListener('drop', (event) => {
    if (!playlistDrag) return;
    event.preventDefault();
    applyPlaylistDrop();
  });
  list.addEventListener('dragend', () => endPlaylistDrag());
  list.addEventListener('pointercancel', () => endPlaylistDrag());
  window.addEventListener('blur', () => endPlaylistDrag());
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !playlistDrag) return;
    // Esc 取消：不执行 drop，顺序保持不变
    endPlaylistDrag();
  });
}

/** 收藏按身份定位（本地 path），不依赖行号 */
function toggleFavorite(key) {
  const index = queueManager.indexOfTrackKey(String(key || ''));
  if (index < 0) return;
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
      // 追加只走 Queue Manager（去重 + 持久化），state.tracks 是它的投影
      queueManager.appendTrack(meta);
      if (state.tracks.length % 5 === 0 || index === fresh.length - 1) renderPlaylist();
    }
  });
  await Promise.all(workers);
  state.loading = false;
  renderQueueFilterBar();
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

/**
 * 恢复后的在线条目没有长期播放地址（磁盘上不保存临时 URL）：
 * 播放前沿用现有 onlineResolve 现场解析，旧地址一律不信任。
 */
async function resolveRestoredOnlineUrl(track) {
  if (!track || !track.sourceId || !track.onlineId) return '';
  try {
    const url = await api.onlineResolve(track.sourceId, {
      id: track.onlineId,
      type: track.resourceType || 'song',
      playUrl: '',
      // 恢复的在线曲目只落盘身份：标题 / 歌手用于 MusicSquare 的详情定位（kuwo 按名次取地址）
      title: track.title || '',
      artist: track.artist || ''
    });
    if (url) track.url = url;
    return url || '';
  } catch (error) {
    onlineSetStatus(onlineErrorText(error), true);
    return '';
  }
}

/**
 * 把地址交给 audioElement 时统一处理 CORS。
 *
 * 为什么必须这么做：播放器把 audioElement 接进了 Web Audio（MediaElementSource → DSP → analyser），
 * 而 Web Audio 对「非 CORS 干净」的媒体一律输出静音 —— 表现就是在线歌曲明明在播放、进度也在走，
 * 却一点声音都没有。远程地址统一用 anonymous 模式加载（上游音频 CDN 基本都返回
 * Access-Control-Allow-Origin），本地 file:// 不能带 crossOrigin，所以按协议区分。
 */
function applyAudioSource(url) {
  if (!audioElement || !url) return false;
  const remote = /^https?:\/\//i.test(String(url));
  const want = remote ? 'anonymous' : null;
  const crossChanged = want === null ? audioElement.crossOrigin !== null : audioElement.crossOrigin !== want;
  if (want === null) audioElement.removeAttribute('crossorigin');
  else audioElement.crossOrigin = want;
  // 上一次加载失败的元素会一直停在 error 状态（paused 还是 false，看起来像在播），
  // 同一地址必须显式 load() 才会重试，否则点播放会「什么都不发生」。
  const errored = !!audioElement.error;
  if (audioElement.src !== url) {
    audioElement.src = url;
  } else if (crossChanged || errored) {
    // CORS 模式变了：同一地址也得重新加载，否则还是原来那份「非 CORS」媒体（依旧无声）
    audioElement.load();
  }
  return true;
}

function playTrack(index) {
  if (index < 0 || index >= state.tracks.length) return;
  setCurrentIndex(index);
  const track = state.tracks[index];
  ensureAudioGraph().then(async () => {
    let src = track.url ? track.url : '';
    if (!src && track.sourceId && track.onlineId) src = await resolveRestoredOnlineUrl(track);
    if (!src && !(track.sourceId && track.onlineId)) src = api.toFileUrl(track.path);
    if (!src) {
      showToast(t('onlineNoPreview'));
      return;
    }
    applyAudioSource(src);
    audioElement.play().catch((error) => {
      console.error('Playback failed', error);
      // 在线曲目启动失败多为上游拒绝跨域 / 反盗链，给出真实原因而不是笼统的「格式不支持」
      showToast(track && track.sourceId ? t('onlinePlayBlocked') : t('toastUnsupported'));
    });
  });
}

/** 由稳定身份播放：索引只在这里运行时反查一次，播放实现仍然交给现有 playTrack */
function playTrackByKey(key) {
  const index = queueManager.indexOfTrackKey(String(key || ''));
  if (index < 0) return false;
  playTrack(index);
  return true;
}

/* 「下一首 / 上一首」只向 Queue Manager 要一个 key：
   queuedNext 优先、随机池一轮不重复、随机模式按播放历史回退，全部在数据层决定；
   playTrack / audioElement / DSP 一行不动。 */
let advanceInFlight = false;

function playNext(automatic = false) {
  // 删除 / 切歌 / ended 可能同时触发 next：同一时刻只允许一次决策，避免重复消费队列
  if (advanceInFlight) return;
  advanceInFlight = true;
  try {
    if (!state.tracks.length) return;
    const decision = queueManager.nextKey({ automatic });
    if (!decision || !decision.key) return;
    playTrackByKey(decision.key);
  } finally {
    advanceInFlight = false;
  }
}

function playPrevious() {
  if (advanceInFlight) return;
  advanceInFlight = true;
  try {
    if (!state.tracks.length) return;
    const decision = queueManager.previousKey();
    if (!decision || !decision.key) return;
    playTrackByKey(decision.key);
  } finally {
    advanceInFlight = false;
  }
}

/** 停止播放但保留队列（删除到空队列时用） */
function stopPlayback() {
  if (!audioElement) return;
  audioElement.pause();
  audioElement.removeAttribute('src');
  audioElement.load();
  setPlayButton(false);
  updateNowPlaying();
}

/**
 * 删除单曲（P1）：删除非当前曲目不影响播放；
 * 删除当前曲目 → 有下一首就接播，没有就停止；索引永远由身份反查，不会留下错误 currentIndex。
 */
function removeTrackFromQueue(key) {
  const queue = queueManager.getActiveQueue();
  if (!queue) return;
  const target = String(key || '');
  const index = queueManager.indexOfTrackKey(target);
  if (index < 0) return;
  const removedCurrent = queue.currentTrackKey === target;
  const wasPlaying = !!audioElement && !audioElement.paused;
  // 删除前先记住「下一首」，它才是接播目标（删除后索引会前移）
  const successor = index + 1 < queue.songs.length ? queueManager.trackKey(queue.songs[index + 1]) : '';
  if (!queueManager.removeTrack(target)) return;
  state.selectedKeys.delete(target);
  if (state.lastSelectedKey === target) state.lastSelectedKey = '';
  renderQueueFilterBar();
  if (!removedCurrent) {
    renderPlaylist();
    return;
  }
  if (successor && queueManager.indexOfTrackKey(successor) >= 0) {
    if (wasPlaying) playTrackByKey(successor);
    else {
      // 暂停状态下只移动播放位置，不擅自开始播放
      queueManager.setCurrentTrackKey(successor);
      renderPlaylist();
      updateNowPlaying();
    }
    return;
  }
  stopPlayback();
  renderPlaylist();
}

/* ============================================================================
 * Online Resource Layer
 * renderer only talks to preload IPC; no Node / fetch / credentials here.
 * ========================================================================== */
function onlineEnabledSources() {
  return state.online.sources.filter((source) => source.enabled);
}

/** 当前选中的在线源（渲染时按它的类型切换内容风格） */
function onlineCurrentSource() {
  return state.online.sources.find((source) => source.id === state.online.sourceId) || null;
}

function onlineSetStatus(message, error) {
  if (!message) return;
  showToast(message);
  if (error) console.warn('[OnlineSource]', message);
}

function onlineErrorText(error) {
  if (error instanceof SyntaxError) return 'SOURCE_CONFIG_INVALID: JSON 配置无效';
  const raw = String((error && error.message) || error || '');
  const match = raw.match(/(?:SOURCE|DOWNLOAD)_[A-Z_]+(?::[^"\n]{0,140})?/);
  return match ? match[0] : t('onlineError');
}

/* ---------------------------------------------------------------------------
 * 单曲下载（搜索结果 / 首页 / 详情 / 队列条目共用同一个组件与同一个下载服务）
 * -------------------------------------------------------------------------
 * 渲染层只负责「显示状态 + 发起 / 取消」：
 *   - 地址解析、流式下载、文件命名、落盘目录、失败清理全部在主进程（online-download.js）；
 *   - 进度是主进程上报的真实字节数，不是定时器估算；失败一定显示真实原因，不伪造成功。
 * 下载控件的 DOM 节点按 `sourceId:resourceId` 登记，进度事件就地更新，不重建整个列表。
 * ------------------------------------------------------------------------- */
const onlineDownloadNodes = new Map();

function onlineDownloadKey(sourceId, resourceId) {
  return `${String(sourceId || '')}:${String(resourceId || '')}`;
}

/**
 * 该条目是否有可用的下载入口：
 * - Spotify 官方只允许 30 秒试听，按平台条款不能下载 → 按钮保留但明确显示不可下载；
 * - 其它来源（Apple 试听 / MusicSquare / 用户自己的声明式源）按钮可用，地址拿不到时
 *   由主进程返回真实失败原因，界面显示真实错误，不伪造进度。
 */
function onlineDownloadable(resource) {
  if (!resource || !resource.sourceId || !resource.id) return false;
  return resource.sourceType !== 'spotify';
}

/** 平台归属文案：MusicSquare 的多平台结果在界面上标注真实平台名（跟随语言切换） */
function onlineProviderLabel(resource) {
  const keys = {
    netease: 'musicSquarePlatformNetease',
    qq: 'musicSquarePlatformQq',
    kuwo: 'musicSquarePlatformKuwo',
    joox: 'musicSquarePlatformJoox'
  };
  const key = keys[String((resource && resource.provider) || '')];
  if (key) return t(key);
  return String((resource && (resource.providerLabel || resource.provider)) || '');
}

function onlineDownloadErrorText(code) {
  const keys = {
    DOWNLOAD_URL_INVALID: 'downloadErrorUrl',
    DOWNLOAD_NETWORK_ERROR: 'downloadErrorNetwork',
    DOWNLOAD_HTTP_ERROR: 'downloadErrorHttp',
    DOWNLOAD_CONTENT_TYPE_INVALID: 'downloadErrorType',
    DOWNLOAD_CONTENT_TOO_LARGE: 'downloadErrorSize',
    DOWNLOAD_DIR_UNAVAILABLE: 'downloadErrorDir',
    DOWNLOAD_WRITE_ERROR: 'downloadErrorWrite',
    DOWNLOAD_INCOMPLETE: 'downloadErrorIncomplete'
  };
  return t(keys[String(code || '')] || 'downloadFailed');
}

function onlineDownloadCode(error) {
  const raw = String((error && error.message) || error || '');
  const match = raw.match(/DOWNLOAD_[A-Z_]+/);
  return match ? match[0] : '';
}

function onlineFormatBytes(value) {
  const bytes = Number(value) || 0;
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let index = 0;
  let amount = bytes;
  while (amount >= 1024 && index < units.length - 1) {
    amount /= 1024;
    index += 1;
  }
  return `${index === 0 ? amount : Math.round(amount * 10) / 10} ${units[index]}`;
}

/** 把某个 key 的最新下载状态写回它对应的 DOM 节点（状态与按钮文案在这里是唯一出口） */
function syncOnlineDownloadNode(key) {
  const entry = onlineDownloadNodes.get(key);
  if (!entry) return;
  const { button, label, status, resource } = entry;
  const record = state.online.downloads.get(key) || null;
  const statusOf = (record && record.status) || 'idle';
  const allowed = onlineDownloadable(resource);
  button.classList.toggle('is-busy', statusOf === 'resolving' || statusOf === 'downloading');
  button.classList.toggle('is-done', statusOf === 'done');
  button.classList.toggle('is-error', statusOf === 'error');
  status.classList.toggle('is-error', statusOf === 'error');
  status.textContent = '';
  if (!allowed) {
    button.disabled = true;
    button.title = t('downloadNotAvailableHint');
    button.setAttribute('aria-label', `${t('downloadNotAvailable')}：${resource.title || ''}`);
    label.textContent = t('downloadNotAvailable');
    return;
  }
  button.disabled = false;
  if (statusOf === 'resolving') {
    label.textContent = t('downloadPreparing');
    button.title = t('downloadCancel');
    button.setAttribute('aria-label', `${t('downloadCancel')}：${resource.title || ''}`);
    return;
  }
  if (statusOf === 'downloading') {
    const received = Number(record.received) || 0;
    const total = Number(record.total) || 0;
    label.textContent = total
      ? `${t('downloadProgress')} ${Math.min(100, Math.round((received / total) * 100))}%`
      : `${t('downloadProgress')} ${onlineFormatBytes(received)}`;
    button.title = t('downloadCancel');
    button.setAttribute('aria-label', `${t('downloadCancel')}：${resource.title || ''}`);
    status.textContent = total ? `${onlineFormatBytes(received)} / ${onlineFormatBytes(total)}` : onlineFormatBytes(received);
    return;
  }
  if (statusOf === 'done') {
    label.textContent = t('downloadDone');
    button.title = t('downloadReveal');
    button.setAttribute('aria-label', `${t('downloadReveal')}：${resource.title || ''}`);
    status.textContent = record.fileName || '';
    return;
  }
  if (statusOf === 'error') {
    label.textContent = t('downloadRetry');
    // 界面显示本地化原因，悬停时给出主进程上报的真实原因（不隐藏失败细节）
    const reason = onlineDownloadErrorText(record.error);
    button.title = record.errorMessage ? `${reason} · ${record.errorMessage}` : reason;
    button.setAttribute('aria-label', `${t('downloadRetry')}：${resource.title || ''}`);
    status.textContent = reason;
    return;
  }
  if (statusOf === 'cancelled') {
    label.textContent = t('downloadStart');
    button.title = t('downloadTitle');
    button.setAttribute('aria-label', `${t('downloadTitle')}：${resource.title || ''}`);
    status.textContent = t('downloadCancelled');
    return;
  }
  label.textContent = t('downloadStart');
  button.title = t('downloadTitle');
  button.setAttribute('aria-label', `${t('downloadTitle')}：${resource.title || ''}`);
}

/** 发起一次下载：资源身份 + 解析所需上下文一起交给主进程，渲染层不提供任何路径 */
async function onlineStartDownload(resource) {
  const key = onlineDownloadKey(resource.sourceId, resource.id);
  const current = state.online.downloads.get(key);
  if (current && (current.status === 'resolving' || current.status === 'downloading')) return;
  state.online.downloads.set(key, { status: 'resolving', percent: 0, received: 0, total: 0 });
  syncOnlineDownloadNode(key);
  try {
    const result = await api.onlineDownloadStart({
      sourceId: resource.sourceId,
      id: resource.id,
      type: resource.type || 'song',
      title: resource.title || resource.name || '',
      artist: resource.artist || '',
      provider: resource.provider || '',
      query: resource.query || '',
      playUrl: resource.playUrl || ''
    });
    const latest = state.online.downloads.get(key) || {};
    state.online.downloads.set(key, {
      ...latest,
      status: 'done',
      percent: 100,
      filePath: (result && result.filePath) || latest.filePath || '',
      fileName: (result && result.filePath) ? String(result.filePath).split(/[\\/]/).pop() : latest.fileName || '',
      bytes: (result && result.bytes) || latest.received || 0
    });
    onlineSetStatus(`${t('downloadDone')} · ${(result && result.filePath) || ''}`);
  } catch (error) {
    const code = onlineDownloadCode(error);
    if (code === 'DOWNLOAD_CANCELLED') {
      state.online.downloads.set(key, { status: 'cancelled' });
    } else {
      state.online.downloads.set(key, {
        status: 'error',
        error: code,
        errorMessage: onlineDownloadErrorText(code)
      });
      onlineSetStatus(onlineDownloadErrorText(code), true);
    }
  }
  syncOnlineDownloadNode(key);
}

/** 唯一的下载控件工厂：图标 + 可访问名称 + 真实进度 / 失败 / 完成 / 取消 / 重试 */
function onlineDownloadControl(resource) {
  const key = onlineDownloadKey(resource.sourceId, resource.id);
  const wrap = document.createElement('span');
  wrap.className = 'online-download';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'mini-btn lg-button online-download-btn';
  button.innerHTML = '<svg class="icon icon-sm"><use href="#icon-download"></use></svg><span class="online-download-label"></span>';
  const label = button.querySelector('.online-download-label');
  const status = document.createElement('span');
  status.className = 'online-download-status muted small';
  wrap.append(button, status);
  // 只处理「这一首」：阻止冒泡，绝不触发行的播放 / 选中 / 其它行操作
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!onlineDownloadable(resource)) {
      onlineSetStatus(t('downloadNotAvailableHint'));
      return;
    }
    const record = state.online.downloads.get(key);
    if (record && (record.status === 'resolving' || record.status === 'downloading')) {
      if (record.id) api.onlineDownloadCancel(record.id).catch(() => {});
      return;
    }
    if (record && record.status === 'done' && record.filePath) {
      api.onlineDownloadReveal(record.filePath).catch(() => {});
      return;
    }
    void onlineStartDownload(resource);
  });
  onlineDownloadNodes.set(key, { button, label, status, resource });
  syncOnlineDownloadNode(key);
  return wrap;
}

/** 主进程上报的真实进度：只更新对应那一首的控件 */
function onlineHandleDownloadProgress(payload) {
  if (!payload || !payload.id || !payload.resourceId) return;
  const key = onlineDownloadKey(payload.sourceId, payload.resourceId);
  const previous = state.online.downloads.get(key) || {};
  state.online.downloads.set(key, { ...previous, ...payload });
  syncOnlineDownloadNode(key);
}

function onlineDraftPayload(draft) {
  return {
    id: draft.id || undefined,
    name: draft.name.trim(),
    sourceType: draft.sourceType,
    baseUrl: draft.baseUrl.trim(),
    // Spotify 用：非机密的 Client ID（Token 永远不进 renderer）
    clientId: String(draft.clientId || '').trim(),
    // MusicSquare 用：每个平台独立的启用开关（没有凭据）
    platforms: draft.platforms,
    enabled: draft.enabled,
    auth: draft.auth,
    search: JSON.parse(draft._raw.search || JSON.stringify(draft.search)),
    detail: JSON.parse(draft._raw.detail || JSON.stringify(draft.detail)),
    playUrl: JSON.parse(draft._raw.playUrl || JSON.stringify(draft.playUrl)),
    mapping: JSON.parse(draft._raw.mapping || JSON.stringify(draft.mapping))
  };
}

function normalizeOnlineTrack(resource, url) {
  return {
    id: `online:${resource.sourceId}:${resource.id}`,
    onlineId: resource.id,
    sourceId: resource.sourceId,
    sourceType: resource.sourceType,
    resourceType: resource.type || 'song',
    title: resource.title || resource.name || 'Untitled',
    artist: resource.artist || '',
    album: resource.album || '',
    duration: Number(resource.duration) || 0,
    cover: resource.coverUrl || '',
    path: `online:${resource.sourceId}:${resource.id}`,
    url
  };
}

function onlineAddTrack(track) {
  // 队列是真相源：去重（在线按 sourceId + onlineId）与追加都走 Queue Manager
  const index = queueManager.appendTrack(track);
  if (index >= 0) renderPlaylist();
  return index;
}

/**
 * 解析播放地址用的统一载荷：解析只认这首资源自己的身份与上下文。
 * MusicSquare 的多平台解析需要作品名 / 平台归属（kuwo 必须按「歌名 歌手」定位上游名次），
 * 播放、下载、详情三处都用这一份，避免各自拼一套参数。
 */
function onlineResolvePayload(resource) {
  return {
    id: resource.id,
    type: resource.type || 'song',
    playUrl: resource.playUrl || '',
    title: resource.title || resource.name || '',
    artist: resource.artist || '',
    provider: resource.provider || '',
    query: resource.query || ''
  };
}

/** 兜底搜索时只认同一首歌：标题一致且歌手有交集，绝不拿列表里第一条冒充（那就是串歌） */
function onlineSameTrack(item, resource) {
  if (!item || !item.playUrl) return false;
  const norm = (value) => String(value || '').toLowerCase().replace(/[\s\-_·・,，.。()（）【】\[\]'"!！?？]/g, '');
  const title = norm(resource.title || resource.name);
  if (!title || norm(item.title || item.name) !== title) return false;
  const artists = String(resource.artist || '').toLowerCase().split(/[/&、,，;；]/).map((name) => name.trim()).filter(Boolean);
  if (!artists.length) return true;
  const candidate = String(item.artist || '').toLowerCase();
  return artists.some((name) => candidate.includes(name));
}

async function onlineResolveAndAdd(resource, playNow) {
  if (!resource || !resource.sourceId || !resource.id) return;
  try {
    state.online.loading = true;
    let target = resource;
    let url = '';
    try {
      // 首选：用这条资源自己的身份解析地址。
      // MusicSquare 的 QQ / 酷我 / JOOX 搜索结果本来就不带地址，全靠这一步拿真实播放地址。
      url = await api.onlineResolve(target.sourceId, onlineResolvePayload(target));
    } catch (error) {
      // 只有「榜单条目」这类既没有地址、按身份又解析不出地址的条目才退回按「歌名 + 艺人」再解析一次；
      // 而且必须命中同一首歌，否则宁可明说解析不到，也绝不播另一首歌的地址。
      if (target.type !== 'song' || target.sourceType === 'musicsquare') throw error;
      const found = await api.onlineSearch(target.sourceId, {
        query: [target.title, target.artist].filter(Boolean).join(' ').slice(0, 120),
        type: 'song',
        page: 1,
        limit: 5
      });
      const playable = (found || []).find((item) => onlineSameTrack(item, target));
      if (!playable) {
        onlineSetStatus(t('onlineNoPreview'), true);
        return;
      }
      target = { ...playable, sourceId: target.sourceId, type: 'song' };
      url = await api.onlineResolve(target.sourceId, onlineResolvePayload(target));
    }
    const track = normalizeOnlineTrack(target, url);
    const index = onlineAddTrack(track);
    onlineSetStatus(t('onlineAdded'));
    if (playNow) playTrack(index);
  } catch (error) {
    onlineSetStatus(onlineErrorText(error), true);
  } finally {
    state.online.loading = false;
  }
}

function renderOnlineSourceBar() {
  const host = $('onlineSourceBar');
  if (!host) return;
  // 刷新按钮是同一个节点，重排后依然在最后一个源标签右侧（不重绑事件）
  const refreshBtn = $('onlineRefreshBtn');
  host.innerHTML = '';
  const enabled = onlineEnabledSources();
  if (!enabled.length) {
    const empty = document.createElement('button');
    empty.type = 'button';
    empty.className = 'mini-btn lg-button online-source-chip is-empty';
    empty.textContent = t('onlineNoSources');
    empty.addEventListener('click', () => openSettings());
    host.appendChild(empty);
    if (refreshBtn) host.appendChild(refreshBtn);
    return;
  }
  enabled.forEach((source) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    // 与右侧「刷新」同一套按钮（mini-btn + lg-button），只是选中态加 is-active
    chip.className = 'mini-btn lg-button online-source-chip' + (state.online.sourceId === source.id ? ' is-active' : '');
    chip.innerHTML = '<svg class="icon icon-sm"><use href="#icon-source"></use></svg><span></span>';
    chip.querySelector('span').textContent = source.name;
    chip.addEventListener('click', () => {
      if (state.online.sourceId === source.id) return;
      // 换源 = 换一整套内容：清掉上一个源的发现结果 / 搜索结果 / 详情，避免 Apple Music 与 Spotify 混排
      state.online.sourceId = source.id;
      state.online.query = '';
      state.online.results = [];
      state.online.discovery = null;
      state.online.picks = null;
      state.online.category = '';
      state.online.detail = null;
      state.online.hasSearched = false;
      state.online.error = '';
      renderOnlineSourceBar();
      onlineRefreshResults();
    });
    host.appendChild(chip);
  });
  if (refreshBtn) host.appendChild(refreshBtn);
}

function renderOnlineTabs() {
  // MusicSquare 的上游接口只有歌曲搜索：没有的能力就直接禁用，不做一个点了一定报错的入口
  const source = onlineCurrentSource();
  const songOnly = !!(source && source.sourceType === 'musicsquare');
  if (songOnly && state.online.type !== 'song') state.online.type = 'song';
  document.querySelectorAll('[data-online-type]').forEach((button) => {
    const disabled = songOnly && button.dataset.onlineType !== 'song';
    button.classList.toggle('is-active', button.dataset.onlineType === state.online.type);
    button.classList.toggle('is-disabled', disabled);
    button.disabled = disabled;
    if (disabled) button.title = t('musicSquareSongOnly');
    else button.removeAttribute('title');
  });
}

function renderOnlineResults() {
  const host = $('onlineResults');
  if (!host) return;
  host.innerHTML = '';
  // 没有搜索关键词 = 自动发现首页（真实榜单，不需要用户输入任何东西）
  if (!state.online.query) {
    renderOnlineHome(host);
    return;
  }
  if (state.online.status === 'loading') {
    renderOnlineLoading(host);
    return;
  }
  if (state.online.status === 'error') {
    renderOnlineError(host, state.online.error || t('onlineError'));
    return;
  }
  if (!state.online.results.length) {
    renderOnlineState(host, 'icon-search', t('onlineNoResults'), t('onlineEmptyHint'), t('onlineRetry'), () => onlineRefreshResults());
    return;
  }
  // Spotify 的搜索结果同样属于 Spotify 内容：保留品牌归属，且不与其他来源混排
  const currentSource = onlineCurrentSource();
  if (currentSource && currentSource.sourceType === 'spotify') host.appendChild(spotifyAttributionBar());
  if (currentSource && currentSource.sourceType === 'musicsquare') host.appendChild(musicSquareAttributionBar());
  if (state.online.type === 'song') {
    renderOnlineSongList(host);
  } else {
    renderOnlineResourceGrid(host);
  }
}

/* ---------------------------------------------------------------------------
 * 自动发现首页（无需搜索）
 * 数据全部来自来源的 getDiscovery：Apple 公开榜单（Most Played Songs/Albums/Playlists）。
 * 这里只做「随机抽取 + 展示」：不动服务器数据、不重写名次、不造新的资源 id。
 * ------------------------------------------------------------------------- */
const ONLINE_HOME_PICK = { song: 10, album: 5, playlist: 4, more: 6 };

/** 从真实榜单里随机抽取，同一次展示不重复；数据不足时按实际条数给，不补空位 */
function onlinePickUnique(list, count) {
  const pool = Array.isArray(list) ? list.slice() : [];
  const picked = [];
  const take = Math.min(count, pool.length);
  for (let i = 0; i < take; i++) {
    picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return picked.sort((a, b) => (a.rank || 0) - (b.rank || 0));
}

/** 分类只做「按真实 genres 过滤」，不生成任何假分类 */
function onlineMatchesCategory(item, category) {
  if (!category) return true;
  const genres = Array.isArray(item && item.genres) ? item.genres : [];
  return genres.some((name) => String(name).toLowerCase() === String(category).toLowerCase());
}

function rollOnlineDiscoveryPicks(sections, category) {
  const data = sections || { song: [], album: [], playlist: [] };
  const filter = (list) => (list || []).filter((item) => onlineMatchesCategory(item, category));
  return {
    song: onlinePickUnique(filter(data.song), ONLINE_HOME_PICK.song),
    album: onlinePickUnique(filter(data.album), ONLINE_HOME_PICK.album),
    playlist: onlinePickUnique(filter(data.playlist), ONLINE_HOME_PICK.playlist),
    more: onlinePickUnique(filter(data.song), ONLINE_HOME_PICK.more)
  };
}

/** 榜单更新时间：能解析就本地化，解析不了就原样展示（不编造时间） */
function onlineUpdatedText(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function onlineHomeSection(host, titleKey, iconId) {
  const section = document.createElement('section');
  section.className = 'online-home-section';
  const head = document.createElement('div');
  head.className = 'online-home-section-head';
  head.innerHTML = `<svg class="icon icon-sm"><use href="#${iconId}"></use></svg><strong></strong>`;
  head.querySelector('strong').textContent = t(titleKey);
  section.appendChild(head);
  host.appendChild(section);
  return section;
}

function renderOnlineHome(host) {
  const cached = !!(state.online.discovery && state.online.picks);
  // MusicSquare 没有榜单：首页只给真实可用的入口（平台说明 + 关键词提示），不铺假推荐
  const homeSource = onlineCurrentSource();
  if (homeSource && homeSource.sourceType === 'musicsquare') {
    renderMusicSquareHome(host);
    return;
  }
  // Spotify 是独立的展示层：只在 Spotify 专属 Shelf 里显示 Spotify 内容，不与 Apple Music 混排
  const source = onlineCurrentSource();
  if (source && source.sourceType === 'spotify') {
    renderSpotifyHome(host, cached);
    return;
  }
  if (state.online.status === 'loading' && !cached) {
    renderOnlineLoading(host);
    return;
  }
  if (state.online.status === 'error' && !cached) {
    renderOnlineError(host, state.online.error || t('onlineError'));
    return;
  }
  const discovery = state.online.discovery;
  const picks = state.online.picks;
  const total = picks ? picks.song.length + picks.album.length + picks.playlist.length : 0;
  if (!discovery || !discovery.supported || !total) {
    renderOnlineState(host, 'icon-online', t('onlineNoHot'), t('onlineHotHint'), t('onlineRetry'), () => onlineRefreshResults());
    return;
  }

  const wrap = document.createElement('div');
  wrap.className = 'online-home';
  const head = document.createElement('div');
  head.className = 'online-home-head';
  // 「热门推荐」标题与图标已按需求移除；这里只保留轻量的更新时间状态
  const updated = onlineUpdatedText(discovery.updated);
  if (updated) {
    const meta = document.createElement('span');
    meta.className = 'online-home-meta muted small';
    meta.textContent = `${t('onlineUpdated')} ${updated}`;
    head.appendChild(meta);
  }
  wrap.appendChild(head);
  host.appendChild(wrap);

  // 网络失败但还有上一次的有效数据：保留内容 + 一条轻量错误提示
  if (state.online.status === 'error' && state.online.error) {
    const warn = document.createElement('div');
    warn.className = 'online-home-warn';
    warn.textContent = state.online.error;
    wrap.appendChild(warn);
  }

  if (picks.song.length) {
    const section = onlineHomeSection(wrap, 'onlineHotSongs', 'icon-note');
    const list = document.createElement('div');
    list.className = 'online-song-list';
    picks.song.forEach((resource) => list.appendChild(onlineHomeSongRow(resource)));
    section.appendChild(list);
  }
  if (picks.album.length) {
    const section = onlineHomeSection(wrap, 'onlineHotAlbums', 'icon-file');
    section.appendChild(onlineHomeCardGrid(picks.album));
  }
  if (picks.playlist.length) {
    const section = onlineHomeSection(wrap, 'onlineHotPlaylists', 'icon-list');
    section.appendChild(onlineHomeCardGrid(picks.playlist));
  }
  if (picks.more.length) {
    const section = onlineHomeSection(wrap, 'onlineMoreHot', 'icon-effects');
    const row = document.createElement('div');
    row.className = 'online-more-row';
    picks.more.forEach((resource) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'vfx-chip online-more-chip';
      chip.textContent = `${resource.rank}. ${resource.title}`;
      chip.title = [resource.title, resource.artist].filter(Boolean).join(' · ');
      chip.addEventListener('click', () => onlineResolveAndAdd(resource, false));
      row.appendChild(chip);
    });
    const again = document.createElement('button');
    again.type = 'button';
    again.className = 'mini-btn lg-button online-more-again';
    again.textContent = t('onlineShuffle');
    again.addEventListener('click', () => {
      state.online.picks = rollOnlineDiscoveryPicks(state.online.discovery.sections);
      renderOnlineResults();
    });
    row.appendChild(again);
    section.appendChild(row);
  }
}

/* ---------------------------------------------------------------------------
 * MusicSquare 专属内容区
 * MusicSquare 只聚合第三方公开搜索接口：它没有榜单，也没有官方推荐，所以首页只提供
 * 真实存在的东西（平台清单 + 搜索提示 + 归属说明），绝不铺假数据、假推荐、假榜位。
 * ------------------------------------------------------------------------- */
const ONLINE_MUSICSQUARE_PLATFORMS = [
  ['netease', 'musicSquarePlatformNetease'],
  ['qq', 'musicSquarePlatformQq'],
  ['kuwo', 'musicSquarePlatformKuwo'],
  ['joox', 'musicSquarePlatformJoox']
];

function onlineMusicSquarePlatforms(source) {
  const configured = (source && source.platforms) || {};
  return ONLINE_MUSICSQUARE_PLATFORMS.filter(([key]) => configured[key] !== false);
}

/** 平台清单（只读展示真实启用的平台，不在界面里改配置） */
function musicSquarePlatformChips(source) {
  const row = document.createElement('div');
  row.className = 'online-more-row online-platform-row';
  const platforms = onlineMusicSquarePlatforms(source);
  if (!platforms.length) {
    const empty = document.createElement('span');
    empty.className = 'muted small';
    empty.textContent = t('musicSquareNoPlatform');
    row.appendChild(empty);
    return row;
  }
  platforms.forEach(([key, labelKey]) => {
    const chip = document.createElement('span');
    chip.className = 'vfx-chip online-platform-chip';
    chip.dataset.platform = key;
    chip.textContent = t(labelKey);
    row.appendChild(chip);
  });
  return row;
}

/** MusicSquare 归属条：与 Spotify 归属条同一层级，说明来源与边界 */
function musicSquareAttributionBar() {
  const source = onlineCurrentSource();
  const attribution = document.createElement('div');
  attribution.className = 'online-attribution online-attribution--musicsquare';
  const head = document.createElement('div');
  head.className = 'online-home-section-head';
  head.innerHTML = '<svg class="icon icon-sm"><use href="#icon-source"></use></svg><strong></strong>';
  head.querySelector('strong').textContent = 'MusicSquare';
  const note = document.createElement('span');
  note.className = 'muted small';
  note.textContent = t('musicSquareAttribution');
  head.appendChild(note);
  attribution.append(head, musicSquarePlatformChips(source));
  return attribution;
}

function renderMusicSquareHome(host) {
  const source = onlineCurrentSource();
  const wrap = document.createElement('div');
  wrap.className = 'online-home online-home--musicsquare';
  const section = document.createElement('section');
  section.className = 'online-home-section';
  const head = document.createElement('div');
  head.className = 'online-home-section-head';
  head.innerHTML = '<svg class="icon icon-sm"><use href="#icon-search"></use></svg><strong></strong>';
  head.querySelector('strong').textContent = t('musicSquareHomeTitle');
  section.appendChild(head);
  const hint = document.createElement('p');
  hint.className = 'muted small';
  hint.textContent = t('musicSquareHomeHint');
  section.appendChild(hint);
  section.appendChild(musicSquarePlatformChips(source));
  const note = document.createElement('p');
  note.className = 'muted small';
  note.textContent = t('musicSquareNoChart');
  section.appendChild(note);
  wrap.appendChild(section);
  wrap.appendChild(musicSquareAttributionBar());
  host.appendChild(wrap);
}

/* ---------------------------------------------------------------------------
 * Spotify 专属内容区
 * 只展示 Spotify 内容与 Spotify 品牌归属；外层仍是 RlonDSP 的卡片 / 列表 / 芯片体系。
 * 内容全部来自 Spotify 官方 Web API（用户授权后的真实数据），没有数据就显示空状态，
 * 不伪造榜单 / 推荐 / 专辑 / 歌单；无法试听的曲目不会伪造播放地址。
 * ------------------------------------------------------------------------- */
function spotifyShelfHeader(section, titleKey) {
  const head = document.createElement('div');
  head.className = 'online-home-section-head';
  head.innerHTML = '<span class="spotify-mark" aria-hidden="true"></span><strong></strong>';
  head.querySelector('strong').textContent = t(titleKey);
  section.appendChild(head);
}

function spotifyExternalLink(resource) {
  if (!resource || !resource.externalUrl) return null;
  const link = document.createElement('button');
  link.type = 'button';
  link.className = 'mini-btn lg-button';
  link.textContent = t('spotifyOpen');
  link.addEventListener('click', () => { api.onlineOpenExternal(resource.externalUrl); });
  return link;
}

function spotifySongRow(resource) {
  const row = document.createElement('div');
  row.className = 'online-song-row';
  row.appendChild(onlineCover(resource.coverUrl, 'online-song-cover'));
  const main = document.createElement('span');
  main.className = 'online-song-main';
  const title = document.createElement('strong');
  title.textContent = resource.title || '';
  const meta = document.createElement('span');
  meta.textContent = [resource.artist, resource.album].filter(Boolean).join(' · ') || 'Spotify';
  main.append(title, meta);
  row.appendChild(main);
  const actions = document.createElement('span');
  actions.className = 'online-source-actions';
  const external = spotifyExternalLink(resource);
  if (external) actions.appendChild(external);
  // Spotify 只允许 30 秒试听：按钮保留在位，但明确显示不可下载（不伪造下载入口）
  actions.appendChild(onlineDownloadControl(resource));
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'mini-btn lg-button';
  addBtn.textContent = t('addToQueue');
  addBtn.addEventListener('click', () => onlineResolveAndAdd(resource, false));
  const playBtn = document.createElement('button');
  playBtn.type = 'button';
  playBtn.className = 'mini-btn lg-button online-action-primary';
  playBtn.textContent = t('playNow');
  playBtn.addEventListener('click', () => onlineResolveAndAdd(resource, true));
  actions.append(addBtn, playBtn);
  row.appendChild(actions);
  return row;
}

function spotifyCard(resource) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'online-card';
  card.appendChild(onlineCover(resource.coverUrl, 'online-card-cover'));
  const title = document.createElement('strong');
  title.textContent = resource.title || '';
  const subtitle = document.createElement('span');
  subtitle.className = 'muted small';
  subtitle.textContent = [resource.artist, resource.album].filter(Boolean).join(' · ') || 'Spotify';
  card.append(title, subtitle);
  card.addEventListener('click', () => {
    if (resource.externalUrl) api.onlineOpenExternal(resource.externalUrl);
    else onlineResolveAndAdd(resource, false);
  });
  return card;
}

async function onlineSpotifyLogin() {
  const source = onlineCurrentSource();
  if (!source) return;
  try {
    if (!String(source.clientId || '').trim()) {
      onlineSetStatus(t('spotifyNeedClientId'), true);
      return;
    }
    onlineSetStatus(t('spotifyLoggingIn'));
    const result = await api.onlineSpotifyLogin(source.id);
    state.online.spotifyAuth = {
      authenticated: !!(result && result.authenticated),
      displayName: (result && result.displayName) || ''
    };
    await loadOnlineSources();
    // 登录后必须拿新授权数据：绕过来源层缓存并清掉旧的空结果
    state.online.forceDiscovery = true;
    state.online.discovery = null;
    state.online.picks = null;
    onlineRefreshResults();
  } catch (error) {
    onlineSetStatus(onlineErrorText(error), true);
  }
}

async function onlineSpotifyLogout() {
  const source = onlineCurrentSource();
  if (!source) return;
  try {
    await api.onlineLogout(source.id);
    state.online.spotifyAuth = { authenticated: false, displayName: '' };
    state.online.forceDiscovery = true;
    state.online.discovery = null;
    state.online.picks = null;
    await loadOnlineSources();
    onlineRefreshResults();
  } catch (error) {
    onlineSetStatus(onlineErrorText(error), true);
  }
}

/** Spotify 品牌归属条：登录态 + 官方标志 + 明确的“内容由 Spotify 提供”。搜索与首页都会显示 */
function spotifyAttributionBar() {
  const auth = state.online.spotifyAuth || { authenticated: false, displayName: '' };
  // Spotify 品牌归属：只在这一块出现（文字归属 + 绿色标识，不改 RlonDSP 全局主题色）
  const attribution = document.createElement('div');
  attribution.className = 'spotify-attribution';
  attribution.innerHTML = '<svg class="icon icon-sm spotify-mark" aria-hidden="true"><use href="#icon-spotify"></use></svg>'
    + '<strong class="spotify-wordmark">Spotify</strong><span class="muted small"></span>';
  const note = attribution.querySelector('span.muted');
  const who = auth.authenticated && auth.displayName ? `${auth.displayName} · ` : '';
  note.textContent = `${who}${t('spotifyAttribution')}`;
  const action = document.createElement('button');
  action.type = 'button';
  action.className = 'mini-btn lg-button spotify-auth-btn';
  action.textContent = auth.authenticated ? t('spotifyLogout') : t('spotifyLogin');
  action.addEventListener('click', () => { if (auth.authenticated) onlineSpotifyLogout(); else onlineSpotifyLogin(); });
  attribution.appendChild(action);
  return attribution;
}

function renderSpotifyHome(host, cached) {
  const auth = state.online.spotifyAuth || { authenticated: false, displayName: '' };
  const wrap = document.createElement('div');
  wrap.className = 'online-home online-home--spotify';
  wrap.appendChild(spotifyAttributionBar());
  host.appendChild(wrap);

  if (!auth.authenticated) {
    const state_ = document.createElement('div');
    state_.className = 'online-state';
    state_.innerHTML = '<span class="online-state-icon"><svg class="icon icon-lg"><use href="#icon-online"></use></svg></span><strong></strong><span class="muted small"></span>';
    state_.querySelector('strong').textContent = t('spotifyNeedLogin');
    state_.querySelector('span.muted').textContent = t('spotifyNeedLoginHint');
    wrap.appendChild(state_);
    return;
  }

  if (state.online.status === 'loading' && !cached) {
    renderOnlineLoading(wrap);
    return;
  }
  if (state.online.status === 'error' && !cached) {
    renderOnlineError(wrap, state.online.error || t('onlineError'));
    return;
  }
  const sections = (state.online.discovery && state.online.discovery.sections) || {};
  const shelves = [
    ['song', 'spotifyTopTracks', (items, section) => {
      const list = document.createElement('div');
      list.className = 'online-song-list';
      items.forEach((item) => list.appendChild(spotifySongRow(item)));
      section.appendChild(list);
    }],
    ['playlist', 'spotifyPlaylists', (items, section) => section.appendChild(onlineHomeCardGridOf(items, spotifyCard))],
    ['album', 'spotifySavedAlbums', (items, section) => section.appendChild(onlineHomeCardGridOf(items, spotifyCard))],
    ['category', 'spotifyCategories', (items, section) => section.appendChild(onlineHomeCardGridOf(items, spotifyCard))]
  ];
  let rendered = 0;
  shelves.forEach(([key, titleKey, render]) => {
    const items = Array.isArray(sections[key]) ? sections[key] : [];
    if (!items.length) return;
    const section = document.createElement('section');
    section.className = 'online-home-section';
    spotifyShelfHeader(section, titleKey);
    render(items, section);
    wrap.appendChild(section);
    rendered += 1;
  });
  if (!rendered) {
    renderOnlineState(wrap, 'icon-online', t('onlineNoHot'), t('spotifyEmptyHint'), t('onlineRetry'), () => onlineRefreshResults());
  }
}

/** 统一的 Card 网格（可指定卡片构造器），保证同类型卡片尺寸一致 */
function onlineHomeCardGridOf(items, factory) {
  const grid = document.createElement('div');
  grid.className = 'online-card-grid';
  items.forEach((item) => grid.appendChild(factory(item)));
  return grid;
}

function onlineHomeSongRow(resource) {
  const row = document.createElement('div');
  row.className = 'online-song-row';
  const rank = document.createElement('span');
  rank.className = 'online-rank';
  rank.textContent = resource.rank ? `#${resource.rank}` : '';
  row.appendChild(rank);
  row.appendChild(onlineCover(resource.coverUrl, 'online-song-cover'));
  const main = document.createElement('span');
  main.className = 'online-song-main';
  const title = document.createElement('strong');
  title.textContent = resource.title || resource.name || 'Untitled';
  const meta = document.createElement('span');
  meta.textContent = [resource.artist, resource.album, onlineProviderLabel(resource)].filter(Boolean).join(' · ') || resource.type;
  main.append(title, meta);
  row.appendChild(main);
  const actions = document.createElement('span');
  actions.className = 'online-source-actions';
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'mini-btn lg-button';
  addBtn.textContent = t('addToQueue');
  addBtn.addEventListener('click', () => onlineResolveAndAdd(resource, false));
  const playBtn = document.createElement('button');
  playBtn.type = 'button';
  playBtn.className = 'mini-btn lg-button online-action-primary';
  playBtn.textContent = t('playNow');
  playBtn.addEventListener('click', () => onlineResolveAndAdd(resource, true));
  actions.append(onlineDownloadControl(resource), addBtn, playBtn);
  row.appendChild(actions);
  return row;
}

function onlineHomeCardGrid(items) {
  const grid = document.createElement('div');
  grid.className = 'online-card-grid';
  items.forEach((resource) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'online-card';
    card.appendChild(onlineCover(resource.coverUrl, 'online-card-cover'));
    const title = document.createElement('strong');
    title.textContent = resource.title || resource.name || 'Untitled';
    const subtitle = document.createElement('span');
    subtitle.className = 'muted small';
    subtitle.textContent = [resource.artist, resource.album].filter(Boolean).join(' · ')
      || (resource.rank ? `#${resource.rank}` : resource.sourceType || '');
    card.append(title, subtitle);
    card.addEventListener('click', () => onlineResolveAndAdd(resource, false));
    grid.appendChild(card);
  });
  return grid;
}

async function onlineLoadDiscovery(sourceId, options) {
  const force = !!(options && options.force);
  const hadData = !!(state.online.discovery && state.online.picks);
  state.online.status = 'loading';
  state.online.error = '';
  state.online.results = [];
  if (!hadData) {
    state.online.discovery = null;
    state.online.picks = null;
  }
  renderOnlineResults();
  try {
    const data = await api.onlineDiscovery(sourceId, { limit: 100, force });
    state.online.discovery = {
      supported: !!(data && data.supported),
      updated: (data && data.updated) || '',
      sections: (data && data.sections) || { song: [], album: [], playlist: [] }
    };
    state.online.picks = rollOnlineDiscoveryPicks(state.online.discovery.sections, state.online.category);
    state.online.status = 'success';
  } catch (error) {
    // 失败时保留上一次有效数据（如果有），只标记轻量错误
    if (!hadData) {
      state.online.discovery = null;
      state.online.picks = null;
    }
    state.online.status = 'error';
    state.online.error = onlineErrorText(error);
    onlineSetStatus(state.online.error, true);
  }
  renderOnlineResults();
}

/** 每次进入在线资源页：已有数据就重新随机，没有数据才真正取一次 */
function onlineEnterPage() {
  if (state.online.query) return;
  if (!state.online.sourceId) return;
  if (state.online.discovery) {
    // 已有数据：只重新随机组合，不重复请求（缓存由来源层负责）
    state.online.picks = rollOnlineDiscoveryPicks(state.online.discovery.sections, state.online.category);
    renderOnlineResults();
    return;
  }
  if (state.online.status !== 'loading') onlineRefreshResults();
}

function onlineCover(url, className) {
  const box = document.createElement('span');
  box.className = className;
  if (url) {
    const img = document.createElement('img');
    img.src = url;
    img.alt = '';
    img.loading = 'lazy';
    img.addEventListener('error', () => {
      img.remove();
      box.classList.add('is-fallback');
      box.innerHTML = '<svg class="icon icon-lg"><use href="#icon-note"></use></svg>';
    });
    box.appendChild(img);
  } else {
    box.classList.add('is-fallback');
    box.innerHTML = '<svg class="icon icon-lg"><use href="#icon-note"></use></svg>';
  }
  return box;
}

function renderOnlineState(host, icon, title, hint, actionLabel, action) {
  const state = document.createElement('div');
  state.className = 'online-state';
  state.innerHTML = `<span class="online-state-icon"><svg class="icon icon-lg"><use href="#${icon}"></use></svg></span><strong></strong><span class="muted small"></span>`;
  state.querySelector('strong').textContent = title;
  state.querySelector('span.muted').textContent = hint || '';
  if (actionLabel) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mini-btn lg-button';
    button.textContent = actionLabel;
    button.addEventListener('click', action);
    state.appendChild(button);
  }
  host.appendChild(state);
}

function renderOnlineLoading(host) {
  const list = document.createElement('div');
  list.className = 'online-skeleton-list';
  for (let i = 0; i < 6; i++) {
    const row = document.createElement('div');
    row.className = 'online-skeleton-row';
    row.innerHTML = '<span class="online-skeleton online-skeleton-cover"></span><span class="online-skeleton online-skeleton-line"></span><span class="online-skeleton online-skeleton-line short"></span>';
    list.appendChild(row);
  }
  host.appendChild(list);
}

function renderOnlineError(host, message) {
  renderOnlineState(host, 'icon-info', t('onlineSearchError'), message, t('onlineRetry'), () => onlineRefreshResults());
}

function renderOnlineSongList(host) {
  const list = document.createElement('div');
  list.className = 'online-song-list';
  state.online.results.forEach((resource) => {
    const row = document.createElement('div');
    row.className = 'online-song-row';
    row.appendChild(onlineCover(resource.coverUrl, 'online-song-cover'));
    const main = document.createElement('span');
    main.className = 'online-song-main';
    const title = document.createElement('strong');
    title.textContent = resource.title || resource.name || 'Untitled';
    const meta = document.createElement('span');
    meta.textContent = [resource.artist, resource.album, onlineProviderLabel(resource)].filter(Boolean).join(' · ') || resource.type;
    main.append(title, meta);
    row.appendChild(main);
    const duration = document.createElement('span');
    duration.className = 'online-song-duration';
    duration.textContent = formatTime(resource.duration || 0);
    row.appendChild(duration);
    const actions = document.createElement('span');
    actions.className = 'online-source-actions';
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'mini-btn lg-button';
    addBtn.textContent = t('addToQueue');
    addBtn.addEventListener('click', () => onlineResolveAndAdd(resource, false));
    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'mini-btn lg-button online-action-primary';
    playBtn.textContent = t('playNow');
    playBtn.addEventListener('click', () => onlineResolveAndAdd(resource, true));
    // 每行都有独立的下载操作（复用同一个下载组件与下载服务），点击不会播放 / 选中这条
    actions.append(onlineDownloadControl(resource), addBtn, playBtn);
    row.appendChild(actions);
    list.appendChild(row);
  });
  host.appendChild(list);
}

function renderOnlineResourceGrid(host) {
  const grid = document.createElement('div');
  grid.className = 'online-card-grid';
  state.online.results.forEach((resource) => {
    const card = document.createElement('div');
    card.className = 'online-card';
    card.appendChild(onlineCover(resource.coverUrl, 'online-card-cover'));
    const title = document.createElement('strong');
    title.textContent = resource.title || resource.name || 'Untitled';
    const subtitle = document.createElement('span');
    subtitle.className = 'muted small';
    subtitle.textContent = [resource.artist, resource.album].filter(Boolean).join(' · ') || resource.sourceType || '';
    card.append(title, subtitle);
    grid.appendChild(card);
  });
  host.appendChild(grid);
}

/** 同步 Spotify 真实登录状态（Token 只在主进程，这里只拿 authenticated / 展示名） */
async function onlineLoadSpotifyAuth(sourceId) {
  const source = state.online.sources.find((item) => item.id === sourceId);
  if (!source || source.sourceType !== 'spotify') return;
  try {
    const auth = await api.onlineAuthState(sourceId);
    state.online.spotifyAuth = {
      authenticated: !!(auth && auth.authenticated),
      displayName: (auth && auth.displayName) || ''
    };
  } catch {
    state.online.spotifyAuth = { authenticated: false, displayName: '' };
  }
}

async function onlineRefreshResults() {
  // 换源 / 换类型后，标签的可用状态（例如 MusicSquare 只有歌曲）要跟着更新
  renderOnlineTabs();
  const sourceId = state.online.sourceId || (onlineEnabledSources()[0] && onlineEnabledSources()[0].id);
  if (!sourceId) {
    state.online.results = [];
    state.online.discovery = null;
    state.online.picks = null;
    state.online.status = 'idle';
    state.online.error = '';
    state.online.hasSearched = false;
    renderOnlineResults();
    return;
  }
  state.online.sourceId = sourceId;
  // 关键词为空 = 自动发现首页：重新取真实榜单并重新随机
  if (!state.online.query) {
    // Spotify 的浏览内容依赖登录态：先同步真实登录状态，再拉取可浏览内容
    await onlineLoadSpotifyAuth(sourceId);
    // 手动刷新（带 force）会绕过来源层的短期缓存，强制重新取数
    await onlineLoadDiscovery(sourceId, { force: state.online.forceDiscovery === true });
    state.online.forceDiscovery = false;
    return;
  }
  const searchButton = $('onlineSearchBtn');
  const searchRow = document.querySelector('.online-search-row');
  if (searchButton) {
    searchButton.disabled = true;
    searchButton.textContent = t('onlineSearching');
  }
  if (searchRow) {
    searchRow.classList.remove('is-success', 'is-error');
    searchRow.classList.add('is-loading');
  }
  try {
    state.online.loading = true;
    state.online.status = 'loading';
    state.online.error = '';
    state.online.hasSearched = true;
    renderOnlineResults();
    const payload = {
      query: state.online.query,
      type: state.online.type,
      page: 1,
      limit: 30
    };
    state.online.results = state.online.query
      ? await api.onlineSearch(sourceId, payload)
      : await api.onlineBrowse(sourceId, payload);
    state.online.status = 'success';
  } catch (error) {
    state.online.results = [];
    state.online.status = 'error';
    state.online.error = onlineErrorText(error);
    if (searchRow) searchRow.classList.add('is-error');
    onlineSetStatus(state.online.error, true);
  } finally {
    state.online.loading = false;
    if (searchButton) {
      searchButton.disabled = false;
      searchButton.textContent = t('search');
    }
    if (searchRow) searchRow.classList.remove('is-loading');
    if (searchRow && state.online.status === 'success') searchRow.classList.add('is-success');
    renderOnlineResults();
  }
}

async function onlineOpenDetail(resource) {
  if (!resource || resource.type !== 'song') return;
  try {
    state.online.detail = await api.onlineDetail(resource.sourceId, { id: resource.id, type: resource.type });
    const host = $('onlineDetail');
    if (!host) return;
    host.hidden = false;
    host.innerHTML = '';
    const title = document.createElement('strong');
    title.textContent = state.online.detail.title || resource.title;
    const meta = document.createElement('div');
    meta.className = 'muted small';
    meta.textContent = [state.online.detail.artist, state.online.detail.album].filter(Boolean).join(' · ');
    const actions = document.createElement('div');
    actions.className = 'online-source-actions';
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'mini-btn lg-button';
    addBtn.textContent = t('addToQueue');
    addBtn.addEventListener('click', () => onlineResolveAndAdd(state.online.detail, false));
    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'mini-btn lg-button';
    playBtn.textContent = t('playNow');
    playBtn.addEventListener('click', () => onlineResolveAndAdd(state.online.detail, true));
    // 详情里的下载入口与列表行共用同一个组件，指向的还是被点开的那一首
    actions.append(onlineDownloadControl(state.online.detail), addBtn, playBtn);
    host.append(title, meta, actions);
  } catch {
    onlineSetStatus(t('onlineError'), true);
  }
}

async function loadOnlineSources() {
  try {
    state.online.sources = await api.onlineSources();
  } catch {
    state.online.sources = [];
  }
  if (!state.online.sourceId || !state.online.sources.some((source) => source.id === state.online.sourceId && source.enabled)) {
    state.online.sourceId = (onlineEnabledSources()[0] && onlineEnabledSources()[0].id) || '';
  }
  renderOnlineSourceBar();
  renderOnlineSettings();
}

function onlineSourceConfigText(source, key) {
  return JSON.stringify((source && source[key]) || {}, null, 2);
}

/** 源列表里的一行说明：MusicSquare 展示真实平台数量，不把项目首页冒充成接口地址 */
function onlineSourceMeta(source) {
  const statusText = source.enabled ? t('sourceEnabled') : t('sourceDisabled');
  if (source.sourceType === 'musicsquare') {
    const count = onlineMusicSquarePlatforms(source).length;
    return `${t('musicSquarePlatforms')}: ${count} · ${statusText}`;
  }
  return `${source.baseUrl} · ${statusText}`;
}

function renderOnlineSettingsLegacy() {
  const host = $('onlineSourcesSettings');
  if (!host) return;
  host.innerHTML = '';
  state.online.sources.forEach((source, index) => {
    const row = document.createElement('div');
    row.className = 'online-source-row';
    const main = document.createElement('div');
    main.className = 'online-source-row-main';
    const name = document.createElement('strong');
    name.textContent = source.name;
    const meta = document.createElement('span');
    meta.textContent = onlineSourceMeta(source);
    main.append(name, meta);
    const actions = document.createElement('div');
    actions.className = 'online-source-actions';
    const toggle = document.createElement('label');
    toggle.className = 'switch';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!source.enabled;
    checkbox.addEventListener('change', async () => {
      try {
        await api.onlineSetSourceEnabled(source.id, checkbox.checked);
        await loadOnlineSources();
        onlineSetStatus(checkbox.checked ? t('onlineSourceEnabled') : t('onlineSourceDisabled'));
      } catch (error) { onlineSetStatus(onlineErrorText(error), true); }
    });
    toggle.appendChild(checkbox);
    const up = document.createElement('button');
    up.type = 'button';
    up.className = 'mini-btn lg-button';
    up.textContent = '↑';
    up.disabled = index === 0;
    up.addEventListener('click', () => moveOnlineSource(index, -1));
    const down = document.createElement('button');
    down.type = 'button';
    down.className = 'mini-btn lg-button';
    down.textContent = '↓';
    down.disabled = index === state.online.sources.length - 1;
    down.addEventListener('click', () => moveOnlineSource(index, 1));
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'mini-btn lg-button';
    edit.textContent = t('editSource');
    edit.addEventListener('click', () => {
      state.online.editingSourceId = source.id;
      renderOnlineSettings();
    });
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'mini-btn lg-button';
    del.textContent = t('deleteSource');
    del.addEventListener('click', async () => {
      try {
        await api.onlineDeleteSource(source.id);
        if (state.online.editingSourceId === source.id) state.online.editingSourceId = null;
        await loadOnlineSources();
        onlineSetStatus(t('onlineSourceDeleted'));
      } catch (error) { onlineSetStatus(onlineErrorText(error), true); }
    });
    actions.append(toggle, up, down, edit, del);
    row.append(main, actions);
    host.appendChild(row);
  });
  if (state.online.editingSourceId !== null || state.online.sources.length === 0) {
    renderOnlineSourceForm(host);
  }
}

async function moveOnlineSource(index, delta) {
  const nextIndex = index + delta;
  if (nextIndex < 0 || nextIndex >= state.online.sources.length) return;
  const ids = state.online.sources.map((source) => source.id);
  const tmp = ids[index];
  ids[index] = ids[nextIndex];
  ids[nextIndex] = tmp;
  try {
    await api.onlineReorderSources(ids);
    await loadOnlineSources();
    onlineSetStatus(t('onlineSourceOrderSaved'));
  } catch (error) { onlineSetStatus(onlineErrorText(error), true); }
}

function renderOnlineSourceForm(host) {
  const source = state.online.sources.find((item) => item.id === state.online.editingSourceId) || {
    id: '', name: '', sourceType: 'declarative', baseUrl: 'https://', enabled: true, auth: { type: 'none', headerName: 'Authorization', prefix: 'Bearer ' },
    search: { method: 'GET', path: '/search', query: { q: '{query}', limit: '{limit}' }, itemsPath: 'data', fields: { id: 'id', title: 'title', artist: 'artist', album: 'album', duration: 'duration', coverUrl: 'coverUrl' } },
    detail: { method: 'GET', path: '/detail/{id}', responsePath: 'data' },
    playUrl: { method: 'GET', path: '/play/{id}', responsePath: 'data.url' },
    mapping: { id: 'id', title: 'title', artist: 'artist', album: 'album', duration: 'duration', coverUrl: 'coverUrl' }
  };
  const form = document.createElement('div');
  form.className = 'online-source-form';
  form.innerHTML = `
    <label>${t('sourceName')}<input id="onlineSourceName" type="text" maxlength="80"></label>
    <label>${t('sourceType')}<select id="onlineSourceType"><option value="declarative">${t('sourceTypeDeclarative')}</option></select></label>
    <label>${t('baseUrl')}<input id="onlineSourceBaseUrl" type="url" placeholder="https://example.com"></label>
    <label>${t('sourceEnabled')}<input id="onlineSourceEnabled" type="checkbox"></label>
    <label>${t('authType')}<select id="onlineAuthType"><option value="none">${t('authNone')}</option><option value="bearer">${t('authBearer')}</option><option value="header">${t('authHeader')}</option></select></label>
    <label>${t('authHeaderName')}<input id="onlineAuthHeader" type="text" maxlength="80"></label>
    <label>${t('authPrefix')}<input id="onlineAuthPrefix" type="text" maxlength="80"></label>
    <label>${t('searchConfig')}<textarea id="onlineSearchConfig" spellcheck="false"></textarea></label>
    <label>${t('detailConfig')}<textarea id="onlineDetailConfig" spellcheck="false"></textarea></label>
    <label>${t('playUrlConfig')}<textarea id="onlinePlayUrlConfig" spellcheck="false"></textarea></label>
    <label>${t('mappingConfig')}<textarea id="onlineMappingConfig" spellcheck="false"></textarea></label>
    <label>${t('loginToken')}<input id="onlineLoginToken" type="password" autocomplete="off"></label>
    <div class="online-source-form-actions">
      <span class="muted small" id="onlineAuthState"></span>
      <button class="mini-btn lg-button" type="button" id="onlineLoginBtn">${t('login')}</button>
      <button class="mini-btn lg-button" type="button" id="onlineLogoutBtn">${t('logout')}</button>
      <button class="mini-btn lg-button" type="button" id="onlineCancelSourceBtn">${t('cancel')}</button>
      <button class="primary-btn lg-button" type="button" id="onlineSaveSourceBtn">${t('saveSource')}</button>
    </div>`;
  host.appendChild(form);
  form.querySelector('#onlineSourceName').value = source.name || '';
  form.querySelector('#onlineSourceType').value = source.sourceType || 'declarative';
  form.querySelector('#onlineSourceBaseUrl').value = source.baseUrl || '';
  form.querySelector('#onlineSourceEnabled').checked = source.enabled !== false;
  form.querySelector('#onlineAuthType').value = (source.auth && source.auth.type) || 'none';
  form.querySelector('#onlineAuthHeader').value = (source.auth && source.auth.headerName) || 'Authorization';
  form.querySelector('#onlineAuthPrefix').value = (source.auth && source.auth.prefix) || 'Bearer ';
  form.querySelector('#onlineSearchConfig').value = onlineSourceConfigText(source, 'search');
  form.querySelector('#onlineDetailConfig').value = onlineSourceConfigText(source, 'detail');
  form.querySelector('#onlinePlayUrlConfig').value = onlineSourceConfigText(source, 'playUrl');
  form.querySelector('#onlineMappingConfig').value = onlineSourceConfigText(source, 'mapping');
  form.querySelector('#onlineCancelSourceBtn').addEventListener('click', () => {
    state.online.editingSourceId = null;
    renderOnlineSettings();
  });
  form.querySelector('#onlineLoginBtn').addEventListener('click', async () => {
    const token = form.querySelector('#onlineLoginToken').value;
    if (!source.id || !token) return;
    try {
      await api.onlineLogin(source.id, { token });
      form.querySelector('#onlineLoginToken').value = '';
      onlineSetStatus(t('onlineLoginDone'));
    } catch (error) { onlineSetStatus(onlineErrorText(error), true); }
  });
  form.querySelector('#onlineLogoutBtn').addEventListener('click', async () => {
    if (!source.id) return;
    try {
      await api.onlineLogout(source.id);
      onlineSetStatus(t('onlineLogoutDone'));
    } catch (error) { onlineSetStatus(onlineErrorText(error), true); }
  });
  form.querySelector('#onlineSaveSourceBtn').addEventListener('click', async () => {
    try {
      const payload = {
        id: source.id || undefined,
        name: form.querySelector('#onlineSourceName').value.trim(),
        sourceType: form.querySelector('#onlineSourceType').value,
        baseUrl: form.querySelector('#onlineSourceBaseUrl').value.trim(),
        enabled: form.querySelector('#onlineSourceEnabled').checked,
        auth: {
          type: form.querySelector('#onlineAuthType').value,
          headerName: form.querySelector('#onlineAuthHeader').value.trim() || 'Authorization',
          prefix: form.querySelector('#onlineAuthPrefix').value
        },
        search: JSON.parse(form.querySelector('#onlineSearchConfig').value || '{}'),
        detail: JSON.parse(form.querySelector('#onlineDetailConfig').value || '{}'),
        playUrl: JSON.parse(form.querySelector('#onlinePlayUrlConfig').value || '{}'),
        mapping: JSON.parse(form.querySelector('#onlineMappingConfig').value || '{}')
      };
      await api.onlineSaveSource(payload);
      state.online.editingSourceId = null;
      await loadOnlineSources();
      onlineSetStatus(t('onlineSourceSaved'));
    } catch {
      onlineSetStatus(t('onlineInvalidSource'), true);
    }
  });
  if (source.id) {
    api.onlineAuthState(source.id).then((auth) => {
      const stateEl = form.querySelector('#onlineAuthState');
      if (stateEl) stateEl.textContent = auth.authenticated ? t('loggedIn') : t('notLoggedIn');
    }).catch(() => {});
  }
}

function onlineSourceDraftTemplate() {
  return {
    id: '',
    name: '',
    sourceType: 'declarative',
    baseUrl: 'https://',
    clientId: '',
    enabled: true,
    platforms: { netease: true, qq: true, kuwo: true, joox: true },
    auth: { type: 'none', headerName: 'Authorization', prefix: 'Bearer ' },
    search: {
      method: 'GET',
      path: '/search',
      query: { q: '{query}', limit: '{limit}' },
      itemsPath: 'data',
      fields: { id: 'id', title: 'title', artist: 'artist', album: 'album', duration: 'duration', coverUrl: 'coverUrl' }
    },
    detail: { method: 'GET', path: '/detail/{id}', responsePath: 'data' },
    playUrl: { method: 'GET', path: '/play/{id}', responsePath: 'data.url' },
    mapping: { id: 'id', title: 'title', artist: 'artist', album: 'album', duration: 'duration', coverUrl: 'coverUrl' },
    _raw: {
      search: '',
      detail: '',
      playUrl: '',
      mapping: ''
    }
  };
}

function cloneOnlineSourceDraft(source) {
  const draft = onlineSourceDraftTemplate();
  if (!source) return draft;
  draft.id = source.id || '';
  draft.name = source.name || '';
  draft.sourceType = source.sourceType || 'declarative';
  draft.baseUrl = source.baseUrl || '';
  draft.clientId = source.clientId || '';
  draft.enabled = source.enabled !== false;
  // MusicSquare 的平台开关：只接受已知平台，缺省视为启用（与来源层 validateSource 一致）
  if (source.sourceType === 'musicsquare') {
    const configured = source.platforms && typeof source.platforms === 'object' ? source.platforms : {};
    draft.platforms = {};
    ONLINE_MUSICSQUARE_PLATFORMS.forEach(([key]) => { draft.platforms[key] = configured[key] !== false; });
  }
  draft.auth = { ...draft.auth, ...(source.auth || {}) };
  ['search', 'detail', 'playUrl', 'mapping'].forEach((key) => {
    draft[key] = deepClone(source[key] || draft[key]);
    draft._raw[key] = JSON.stringify(draft[key], null, 2);
  });
  return draft;
}

function beginOnlineSourceEdit(source) {
  state.online.editingSourceId = source ? source.id : null;
  state.online.draft = cloneOnlineSourceDraft(source);
  state.online.section = 'basic';
  renderOnlineSettings();
}

function onlineField(labelText, control) {
  const row = document.createElement('div');
  row.className = 'online-source-field';
  const label = document.createElement('label');
  label.textContent = labelText;
  row.append(label, control);
  return row;
}

function onlineInput(id, type, value) {
  const input = document.createElement('input');
  input.id = id;
  input.type = type;
  input.value = value == null ? '' : String(value);
  return input;
}

function onlineTextarea(id, value, readOnly) {
  const area = document.createElement('textarea');
  area.id = id;
  area.spellcheck = false;
  area.readOnly = !!readOnly;
  area.value = value || '';
  return area;
}

function onlineSwitch(checked, onChange) {
  const label = document.createElement('label');
  label.className = 'switch online-switch';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = !!checked;
  input.addEventListener('change', () => onChange(input.checked));
  label.appendChild(input);
  return label;
}

function renderOnlineSettings() {
  const host = $('onlineSourcesSettings');
  if (!host) return;
  host.innerHTML = '';
  const layout = document.createElement('div');
  layout.className = 'online-source-layout';
  const nav = document.createElement('div');
  nav.className = 'online-source-nav' + (state.online.navCollapsed ? ' collapsed' : '');
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'online-source-nav-toggle';
  toggle.title = t('collapse');
  toggle.innerHTML = '<svg class="icon icon-sm"><use href="#icon-caret"></use></svg>';
  toggle.addEventListener('click', () => {
    state.online.navCollapsed = !state.online.navCollapsed;
    renderOnlineSettings();
  });
  nav.appendChild(toggle);
  const sections = [
    ['source', 'sourceManagement', 'icon-source'],
    ['basic', 'basicInfo', 'icon-file'],
    ['auth', 'authSection', 'icon-login'],
    ['search', 'searchSection', 'icon-search'],
    ['detail', 'detailSection', 'icon-info'],
    ['playUrl', 'playUrlSection', 'icon-play'],
    ['mapping', 'mappingSection', 'icon-chart'],
    ['advanced', 'advancedSection', 'icon-settings']
  ];
  sections.forEach(([id, labelKey, icon]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'online-source-nav-item' + (state.online.section === id ? ' is-active' : '');
    button.dataset.section = id;
    button.innerHTML = `<svg class="icon icon-sm"><use href="#${icon}"></use></svg><span>${t(labelKey)}</span>`;
    button.addEventListener('click', () => {
      state.online.section = id;
      renderOnlineSettings();
    });
    nav.appendChild(button);
  });
  const editor = document.createElement('div');
  editor.className = 'online-source-editor';
  editor.id = 'onlineSourceEditor';
  layout.append(nav, editor);
  host.appendChild(layout);
  renderOnlineEditor(editor);
}

function renderOnlineEditor(editor) {
  editor.innerHTML = '';
  if (state.online.section === 'source') {
    renderOnlineSourceManager(editor);
    return;
  }
  if (!state.online.draft) state.online.draft = cloneOnlineSourceDraft(null);
  renderOnlineDraftForm(editor);
}

function renderOnlineSourceManager(editor) {
  const list = document.createElement('div');
  list.className = 'online-source-list';
  state.online.sources.forEach((source, index) => {
    const row = document.createElement('div');
    row.className = 'online-source-row';
    const main = document.createElement('div');
    main.className = 'online-source-row-main';
    const name = document.createElement('strong');
    name.textContent = source.name;
    const meta = document.createElement('span');
    meta.textContent = onlineSourceMeta(source);
    main.append(name, meta);
    const actions = document.createElement('div');
    actions.className = 'online-source-actions';
    actions.appendChild(onlineSwitch(source.enabled, async (checked) => {
      try {
        await api.onlineSetSourceEnabled(source.id, checked);
        await loadOnlineSources();
        onlineSetStatus(checked ? t('onlineSourceEnabled') : t('onlineSourceDisabled'));
      } catch (error) { onlineSetStatus(onlineErrorText(error), true); }
    }));
    const up = document.createElement('button');
    up.type = 'button';
    up.className = 'mini-btn lg-button';
    up.textContent = '↑';
    up.disabled = index === 0;
    up.addEventListener('click', () => moveOnlineSource(index, -1));
    const down = document.createElement('button');
    down.type = 'button';
    down.className = 'mini-btn lg-button';
    down.textContent = '↓';
    down.disabled = index === state.online.sources.length - 1;
    down.addEventListener('click', () => moveOnlineSource(index, 1));
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'mini-btn lg-button';
    edit.textContent = t('editSource');
    edit.addEventListener('click', () => beginOnlineSourceEdit(source));
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'mini-btn lg-button';
    del.textContent = t('deleteSource');
    del.addEventListener('click', async () => {
      try {
        await api.onlineDeleteSource(source.id);
        await loadOnlineSources();
        onlineSetStatus(t('onlineSourceDeleted'));
      } catch (error) { onlineSetStatus(onlineErrorText(error), true); }
    });
    actions.append(up, down, edit, del);
    row.append(main, actions);
    list.appendChild(row);
  });
  editor.appendChild(list);
}

function renderOnlineDraftForm(editor) {
  const draft = state.online.draft;
  const form = document.createElement('div');
  form.className = 'online-source-fields';
  const section = state.online.section;
  if (section === 'basic') {
    const name = onlineInput('onlineSourceName', 'text', draft.name);
    name.addEventListener('input', () => { draft.name = name.value; });
    form.appendChild(onlineField(t('sourceName'), name));
    const baseUrl = onlineInput('onlineSourceBaseUrl', 'url', draft.baseUrl);
    baseUrl.addEventListener('input', () => { draft.baseUrl = baseUrl.value; });
    form.appendChild(onlineField(t('baseUrl'), baseUrl));
    const type = document.createElement('select');
    type.className = 'full-select';
    type.innerHTML = `<option value="declarative">${t('sourceTypeDeclarative')}</option>`;
    // 内置 Spotify 源的类型固定，不能被下拉框改成声明式（那会破坏官方 OAuth 适配器）
    if (draft.sourceType && draft.sourceType !== 'declarative') {
      const fixed = document.createElement('option');
      fixed.value = draft.sourceType;
      fixed.textContent = draft.sourceType === 'musicsquare' ? 'MusicSquare' : 'Spotify';
      type.appendChild(fixed);
      // 内置源的官方适配器不能被改成声明式（否则该源立刻失效）
      const declarative = type.querySelector('option[value="declarative"]');
      if (declarative) declarative.disabled = true;
    }
    type.value = draft.sourceType || 'declarative';
    type.addEventListener('change', () => { draft.sourceType = type.value; });
    form.appendChild(onlineField(t('sourceType'), type));
    if (draft.sourceType === 'spotify') {
      const clientId = onlineInput('onlineSourceClientId', 'text', draft.clientId);
      clientId.maxLength = 80;
      clientId.autocomplete = 'off';
      clientId.addEventListener('input', () => { draft.clientId = clientId.value; });
      form.appendChild(onlineField(t('spotifyClientId'), clientId));
      const hint = document.createElement('p');
      hint.className = 'muted small online-source-hint';
      hint.textContent = t('spotifyClientIdHint');
      form.appendChild(hint);
    }
    if (draft.sourceType === 'musicsquare') {
      // 真实能力开关：关掉的平台既不出现在搜索结果里，也不会被拿去解析播放地址
      const platforms = document.createElement('div');
      platforms.className = 'online-musicsquare-platforms';
      ONLINE_MUSICSQUARE_PLATFORMS.forEach(([key, labelKey]) => {
        const row = document.createElement('label');
        row.className = 'online-musicsquare-platform';
        const box = document.createElement('input');
        box.type = 'checkbox';
        box.checked = (draft.platforms || {})[key] !== false;
        box.addEventListener('change', () => {
          draft.platforms = { ...(draft.platforms || {}), [key]: box.checked };
        });
        const text = document.createElement('span');
        text.textContent = t(labelKey);
        row.append(box, text);
        platforms.appendChild(row);
      });
      form.appendChild(onlineField(t('musicSquarePlatforms'), platforms));
      const hint = document.createElement('p');
      hint.className = 'muted small online-source-hint';
      hint.textContent = t('musicSquareHint');
      form.appendChild(hint);
    }
    form.appendChild(onlineField(t('sourceEnabled'), onlineSwitch(draft.enabled, (checked) => { draft.enabled = checked; })));
  } else if (section === 'auth') {
    const authType = document.createElement('select');
    authType.className = 'full-select';
    authType.innerHTML = `<option value="none">${t('authNone')}</option><option value="bearer">${t('authBearer')}</option><option value="header">${t('authHeader')}</option>`;
    authType.value = draft.auth.type || 'none';
    authType.addEventListener('change', () => { draft.auth.type = authType.value; });
    form.appendChild(onlineField(t('authType'), authType));
    const header = onlineInput('onlineAuthHeader', 'text', draft.auth.headerName || 'Authorization');
    header.addEventListener('input', () => { draft.auth.headerName = header.value; });
    form.appendChild(onlineField(t('authHeaderName'), header));
    const prefix = onlineInput('onlineAuthPrefix', 'text', draft.auth.prefix || 'Bearer ');
    prefix.addEventListener('input', () => { draft.auth.prefix = prefix.value; });
    form.appendChild(onlineField(t('authPrefix'), prefix));
    const token = onlineInput('onlineLoginToken', 'password', '');
    token.autocomplete = 'off';
    form.appendChild(onlineField(t('loginToken'), token));
    const authActions = document.createElement('div');
    authActions.className = 'online-source-form-actions';
    const authState = document.createElement('span');
    authState.className = 'muted small';
    authState.textContent = draft.id ? t('notLoggedIn') : '';
    const login = document.createElement('button');
    login.type = 'button';
    login.className = 'mini-btn lg-button';
    login.textContent = t('login');
    login.addEventListener('click', async () => {
      if (!draft.id || !token.value) return;
      try {
        await api.onlineLogin(draft.id, { token: token.value });
        token.value = '';
        authState.textContent = t('loggedIn');
        onlineSetStatus(t('onlineLoginDone'));
      } catch (error) { onlineSetStatus(onlineErrorText(error), true); }
    });
    const logout = document.createElement('button');
    logout.type = 'button';
    logout.className = 'mini-btn lg-button';
    logout.textContent = t('logout');
    logout.addEventListener('click', async () => {
      if (!draft.id) return;
      try {
        await api.onlineLogout(draft.id);
        authState.textContent = t('notLoggedIn');
        onlineSetStatus(t('onlineLogoutDone'));
      } catch (error) { onlineSetStatus(onlineErrorText(error), true); }
    });
    authActions.append(authState, login, logout);
    form.appendChild(authActions);
  } else if (['search', 'detail', 'playUrl', 'mapping'].includes(section)) {
    if (draft.sourceType === 'musicsquare') {
      // MusicSquare 的请求完全由内置适配器决定：不给“改了也不起作用”的 JSON 输入框
      const note = document.createElement('p');
      note.className = 'muted small online-source-hint';
      note.textContent = t('musicSquareHint');
      form.appendChild(note);
    } else {
      const label = section === 'search' ? t('searchConfig') : section === 'detail' ? t('detailConfig') : section === 'playUrl' ? t('playUrlConfig') : t('mappingConfig');
      const area = onlineTextarea(`online${section[0].toUpperCase()}${section.slice(1)}Config`, draft._raw[section]);
      area.addEventListener('input', () => { draft._raw[section] = area.value; });
      form.appendChild(onlineField(label, area));
    }
  } else {
    const sourceId = onlineInput('onlineSourceId', 'text', draft.id || '');
    sourceId.readOnly = true;
    form.appendChild(onlineField(t('sourceId'), sourceId));
    const type = document.createElement('select');
    type.className = 'full-select';
    type.innerHTML = `<option value="declarative">${t('sourceTypeDeclarative')}</option>`;
    type.value = draft.sourceType || 'declarative';
    form.appendChild(onlineField(t('sourceType'), type));
    form.appendChild(onlineField(t('sourceEnabled'), onlineSwitch(draft.enabled, (checked) => { draft.enabled = checked; })));
    const raw = onlineTextarea('onlineRawConfig', JSON.stringify({
      name: draft.name,
      baseUrl: draft.baseUrl,
      auth: draft.auth,
      search: draft.search,
      detail: draft.detail,
      playUrl: draft.playUrl,
      mapping: draft.mapping
    }, null, 2), true);
    form.appendChild(onlineField(t('sourceRawConfig'), raw));
  }
  const actions = document.createElement('div');
  actions.className = 'online-source-form-actions';
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'mini-btn lg-button';
  cancel.textContent = t('cancel');
  cancel.addEventListener('click', () => {
    state.online.draft = null;
    state.online.editingSourceId = null;
    state.online.section = 'source';
    renderOnlineSettings();
  });
  const test = document.createElement('button');
  test.type = 'button';
  test.className = 'mini-btn lg-button';
  test.textContent = t('testConnection');
  test.addEventListener('click', async () => {
    try {
      const result = await api.onlineTestSource(onlineDraftPayload(draft), 'test');
      onlineSetStatus(`${t('connectionSuccess')} · ${(result && result.sample && result.sample.title) || ''}`);
    } catch (error) {
      onlineSetStatus(onlineErrorText(error), true);
    }
  });
  const save = document.createElement('button');
  save.type = 'button';
  save.className = 'primary-btn lg-button';
  save.textContent = t('saveSource');
  save.addEventListener('click', async () => {
    try {
      const payload = onlineDraftPayload(draft);
      const saved = await api.onlineSaveSource(payload);
      state.online.editingSourceId = saved.id;
      state.online.draft = cloneOnlineSourceDraft(saved);
      await loadOnlineSources();
      state.online.section = 'basic';
      renderOnlineSettings();
      onlineSetStatus(t('onlineSourceSaved'));
    } catch {
      onlineSetStatus(t('onlineInvalidSource'), true);
    }
  });
  actions.append(test, cancel, save);
  form.appendChild(actions);
  editor.appendChild(form);
}

function onlineInitEvents() {
  const searchBtn = $('onlineSearchBtn');
  if (searchBtn) searchBtn.addEventListener('click', () => {
    state.online.query = ($('onlineSearchInput') && $('onlineSearchInput').value || '').trim();
    onlineRefreshResults();
  });
  const searchInput = $('onlineSearchInput');
  if (searchInput) searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      state.online.query = searchInput.value.trim();
      onlineRefreshResults();
    }
  });
  document.querySelectorAll('[data-online-type]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.disabled) return;
      state.online.type = button.dataset.onlineType;
      renderOnlineTabs();
      onlineRefreshResults();
    });
  });
  const refreshBtn = $('onlineRefreshBtn');
  if (refreshBtn) refreshBtn.addEventListener('click', () => {
    // 刷新 = 强制重新获取真实数据 + 重新随机组合
    state.online.forceDiscovery = true;
    state.online.category = '';
    loadOnlineSources().then(onlineRefreshResults);
  });
  const addSourceBtn = $('addOnlineSourceBtn');
  if (addSourceBtn) addSourceBtn.addEventListener('click', () => beginOnlineSourceEdit(null));
}

/**
 * 播放键的兜底：音频图可能是在「还没有当前曲目」时建起来的（那时不会挂音源），
 * 或者当前曲目的音源已经被别的操作换掉。这里按需补齐音源（远程一律走 CORS），
 * 否则点播放键会出现「什么都不发生、也没有声音」。
 */
async function ensureCurrentTrackSource() {
  const track = state.currentTrack;
  if (!track) return false;
  let src = track.url || '';
  if (!src && track.sourceId && track.onlineId) src = await resolveRestoredOnlineUrl(track);
  if (!src && !track.sourceId) src = api.toFileUrl(track.path);
  if (!src) return false;
  applyAudioSource(src);
  return true;
}

function togglePlay() {
  if (!state.currentTrack) {
    if (state.tracks.length) playTrack(0);
    else showToast(t('toastNoTrack'));
    return;
  }
  ensureAudioGraph().then(async () => {
    // 用应用自己的播放状态判断，而不是 audioElement.paused：
    // 加载失败的媒体会一直停在「未暂停」状态，照它判断就会把「点播放」变成「暂停」。
    if (state.isPlaying) {
      audioElement.pause();
      return;
    }
    await ensureCurrentTrackSource();
    audioElement.play().catch((error) => {
      console.error('Playback failed', error);
      showToast(state.currentTrack && state.currentTrack.sourceId ? t('onlinePlayBlocked') : t('toastUnsupported'));
    });
  });
}

function setPlayButton(playing) {
  state.isPlaying = playing;
  const icon = $('playBtnIcon');
  swapIcon(icon, playing ? '#icon-pause' : '#icon-play');
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

/* ============================================================================
 * 播放列表侧栏：展开 / 收起
 * ---------------------------------------------------------------------------
 * 收起 = 现在的窄侧栏；展开 = 向右加宽，主内容由 Grid 自动补位。
 * 交互：点顶部小按钮切换展开；鼠标移出侧栏（不含弹窗等外部区域）自动收起。
 * 只改列宽与一个 class，播放队列 / 播放逻辑一行不动。
 * ========================================================================== */
function playlistExpanded() {
  const shell = document.querySelector('.app-shell');
  return !(shell && shell.classList.contains('playlist-collapsed'));
}

function syncPlaylistExpandUI() {
  const expanded = playlistExpanded();
  const btn = $('playlistExpandBtn');
  if (btn) {
    btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    btn.title = expanded ? t('playlistCollapse') : t('playlistExpand');
    btn.dataset.i18nTitle = expanded ? 'playlistCollapse' : 'playlistExpand';
  }
}

function setPlaylistExpanded(expanded) {
  const shell = document.querySelector('.app-shell');
  if (!shell) return;
  shell.classList.toggle('playlist-collapsed', !expanded);
  syncPlaylistExpandUI();
}

/* 自动收起挂起开关：拖拽 / 菜单 / 右键等交互期间不允许误收起 */
const sidebarCollapseCtl = { suspended: false, cancel: null, schedule: null, pointerInside: false };

function suspendSidebarAutoCollapse(suspended) {
  sidebarCollapseCtl.suspended = !!suspended;
  if (suspended) {
    if (typeof sidebarCollapseCtl.cancel === 'function') sidebarCollapseCtl.cancel();
    return;
  }
  if (!sidebarCollapseCtl.pointerInside && typeof sidebarCollapseCtl.schedule === 'function') {
    sidebarCollapseCtl.schedule();
  }
}

function setupPlaylistExpand() {
  const shell = document.querySelector('.app-shell');
  const sidebar = shell && shell.querySelector(':scope > .sidebar');
  const btn = $('playlistExpandBtn');
  if (!shell || !sidebar || !btn) return;

  // 展开后鼠标移出侧栏才收起：用极短延时消抖，快速进出不会抖动
  let collapseTimer = null;
  let pointerInside = false;
  const cancelCollapse = () => {
    if (collapseTimer) {
      window.clearTimeout(collapseTimer);
      collapseTimer = null;
    }
    sidebarCollapseCtl.cancel = null;
  };
  const scheduleCollapse = () => {
    cancelCollapse();
    collapseTimer = window.setTimeout(() => {
      collapseTimer = null;
      sidebarCollapseCtl.cancel = null;
      if (sidebarCollapseCtl.suspended) return;
      if (playlistExpanded() && !pointerInside) setPlaylistExpanded(false);
    }, 160);
    sidebarCollapseCtl.cancel = cancelCollapse;
  };
  sidebarCollapseCtl.schedule = scheduleCollapse;

  btn.addEventListener('click', () => {
    const next = !playlistExpanded();
    cancelCollapse();
    setPlaylistExpanded(next);
    // 点击展开后指针就在按钮上（属于侧栏内），不会立刻被收起
  });

  sidebar.addEventListener('pointerenter', () => { pointerInside = true; sidebarCollapseCtl.pointerInside = true; cancelCollapse(); });
  sidebar.addEventListener('pointerleave', () => { pointerInside = false; sidebarCollapseCtl.pointerInside = false; scheduleCollapse(); });
  sidebar.addEventListener('focusin', cancelCollapse);
  sidebar.addEventListener('focusout', scheduleCollapse);
  window.addEventListener('blur', cancelCollapse);
  syncPlaylistExpandUI();
}

/* ============================================================================
 * 播放进度条：收起 / 向上展开的浮层
 * ---------------------------------------------------------------------------
 * 收起只留一个小按钮；展开后浮在播放栏上方（最高层），不参与布局、不推动内容。
 * 交互：点击切换；指针离开整个进度条区域自动收起（极短消抖）；
 *      拖动 Seek 期间（指针按下拖动或键盘聚焦）一律不收起。
 * 进度条本身仍是原来的 #progress + seekTo，播放/暂停/时间显示逻辑不变。
 * ========================================================================== */
function progressExpanded() {
  const box = $('playerProgress');
  return !!(box && box.classList.contains('is-expanded'));
}

function setProgressExpanded(expanded) {
  const box = $('playerProgress');
  if (!box) return;
  box.classList.toggle('is-expanded', !!expanded);
  const btn = $('progressToggleBtn');
  if (btn) {
    btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    btn.title = expanded ? t('progressCollapse') : t('progressExpand');
    btn.dataset.i18nTitle = expanded ? 'progressCollapse' : 'progressExpand';
  }
}

function setupProgressOverlay() {
  const box = $('playerProgress');
  const btn = $('progressToggleBtn');
  const slider = $('progress');
  if (!box || !btn || !slider) return;
  // 悬停判定用整条底栏：展开后进度条区域会向上长高，若只盯 #playerProgress，
  // 指针仍停在原处就会瞬间落在区域外 → pointerleave → 刚展开就被收起。
  const bar = box.closest('.player-bar') || box;

  let collapseTimer = null;
  let seeking = false;
  let pointerInside = false;
  let lastToggleAt = 0;
  const cancelCollapse = () => {
    if (collapseTimer) {
      window.clearTimeout(collapseTimer);
      collapseTimer = null;
    }
  };
  const scheduleCollapse = () => {
    if (seeking) return;
    cancelCollapse();
    collapseTimer = window.setTimeout(() => {
      collapseTimer = null;
      if (!progressExpanded()) return;
      // 点击后的一小段时间内几何在变（面板向上长高），先不判定离开
      if (Date.now() - lastToggleAt < 420) return;
      // 指针仍在整个进度条区域内、或正在拖动/聚焦滑块，就保持展开
      if (pointerInside || seeking || slider === document.activeElement) return;
      setProgressExpanded(false);
    }, 160);
  };

  btn.addEventListener('click', () => {
    cancelCollapse();
    lastToggleAt = Date.now();
    setProgressExpanded(!progressExpanded());
  });
  bar.addEventListener('pointerenter', () => { pointerInside = true; cancelCollapse(); });
  bar.addEventListener('pointerleave', () => { pointerInside = false; scheduleCollapse(); });
  bar.addEventListener('focusin', cancelCollapse);
  bar.addEventListener('focusout', scheduleCollapse);

  // 拖动 Seek：按下到松开之间不收起；拖动结束仍停在滑块上时保持展开
  const beginSeek = () => { seeking = true; cancelCollapse(); };
  const endSeek = () => { seeking = false; };
  slider.addEventListener('pointerdown', beginSeek);
  window.addEventListener('pointerup', endSeek);
  window.addEventListener('pointercancel', endSeek);
  slider.addEventListener('keydown', (event) => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) beginSeek();
  });
  slider.addEventListener('keyup', endSeek);
  slider.addEventListener('change', endSeek);
  // 拖动手柄离开窗口时回到「未拖动」，避免状态卡住
  window.addEventListener('blur', () => { seeking = false; });

  setProgressExpanded(false);
}

/* ============================================================================
 * 音量：滑杆集成在静音按钮上
 * --------------------------------------------------------------------------
 * - 点按钮 → 向上弹出竖向滑杆（向上 = 音量大）；再点 / Esc / 点空白处收起；
 * - 音量到零即静音：图标切成静音、读数显示「静音」，音量拉起来就自动恢复；
 * - 音量状态仍只落在 state.volume / state.muted 与 audioElement 上，不碰音频链路。
 * ========================================================================== */
function volumeIsMuted() {
  return !!(state.muted || Number(state.volume) <= 0.0005);
}

/** 音量相关 UI 的唯一出口：图标 / 读数 / 提示语 / aria 都在这里同步 */
function updateVolumeUi() {
  const muted = volumeIsMuted();
  const percent = Math.round((Number(state.volume) || 0) * 100);
  const icon = $('muteBtnIcon');
  if (icon) swapIcon(icon, muted ? '#icon-mute' : '#icon-volume');
  const value = $('volumeValue');
  if (value) value.textContent = muted ? t('volumeMuted') : String(percent);
  const popover = $('volumePopover');
  if (popover) {
    popover.setAttribute('aria-hidden', popover.hidden ? 'true' : 'false');
    const slider = $('volume');
    if (slider) slider.setAttribute('aria-label', `${t('volumeAdjust')}（${muted ? t('volumeMuted') : `${percent}%`}）`);
  }
  const button = $('muteBtn');
  if (button) {
    const label = t('volumeAdjust');
    button.classList.toggle('is-muted', muted);
    button.title = muted ? `${label}（${t('volumeMuted')}）` : label;
    button.setAttribute('aria-label', button.title);
    button.setAttribute('aria-expanded', popover && !popover.hidden ? 'true' : 'false');
  }
}

function setMuted(flag) {
  state.muted = !!flag;
  if (audioElement) audioElement.muted = state.muted;
}

function setVolume(value) {
  const next = Math.min(1, Math.max(0, Number(value) || 0));
  state.volume = next;
  if (audioElement) audioElement.volume = next;
  const slider = $('volume');
  if (slider) slider.value = String(Math.round(next * 100));
  // 音量到零 = 静音；从零拉起来就恢复（同一个状态，不额外记一份「上次音量」）
  setMuted(next <= 0.0005);
  updateVolumeUi();
  api.setSettings({ volume: next });
}

function volumePopoverOpen() {
  const popover = $('volumePopover');
  return !!popover && !popover.hidden;
}

function setVolumePopover(open) {
  const popover = $('volumePopover');
  if (!popover) return;
  popover.hidden = !open;
  updateVolumeUi();
  if (open) safeRun('音量滑杆聚焦', () => {
    const slider = $('volume');
    if (slider) slider.focus();
  });
}

function setupVolumeControl() {
  const button = $('muteBtn');
  const popover = $('volumePopover');
  if (!button || !popover) return;
  button.addEventListener('click', (event) => {
    // 按钮只负责开关滑杆；静音由「音量到零」自然得到
    event.stopPropagation();
    setVolumePopover(!volumePopoverOpen());
  });
  // 滑杆内部的点击不要冒泡到文档，否则刚点下去就被外面那层收起
  popover.addEventListener('click', (event) => event.stopPropagation());
  // 拖动滑杆可能把指针带到面板外面再松手：只有「从控件外部按下」的那一次点击才算收起
  let pressInside = false;
  const isInside = (target) => !!(target && target.closest && target.closest('#volumePopover, #muteBtn'));
  document.addEventListener('pointerdown', (event) => { pressInside = isInside(event.target); }, true);
  document.addEventListener('click', (event) => {
    if (!volumePopoverOpen() || pressInside || isInside(event.target)) return;
    setVolumePopover(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && volumePopoverOpen()) {
      setVolumePopover(false);
      button.focus();
    }
  });
  setVolumePopover(false);
}

function clearPlaylist() {
  // 清空必须同时清队列与持久化：Queue Manager 内部会重算兼容投影并写盘
  queueManager.clearActiveQueue();
  clearSelection();
  if (audioElement) {
    audioElement.pause();
    audioElement.removeAttribute('src');
    audioElement.load();
  }
  renderQueueFilterBar();
  renderPlaylist();
  updateNowPlaying();
  setPlayButton(false);
}

function collectEffects() {
  return deepClone(state.effects);
}

function syncMasterFxButton() {
  const btn = $('fxMasterEnabledBtn');
  if (!btn) return;
  const on = state.realtimeEnabled !== false;
  const use = document.getElementById('fxMasterIcon');
  if (use) use.setAttribute('href', on ? '#icon-fx-chain-on' : '#icon-fx-chain-off');
  btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  btn.title = on ? t('realtimeFxOn') : t('realtimeFxOff');
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
  syncMasterFxButton();
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
  applyAdvancedEffectControls();
  applyEqAdvancedControlLabels();
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
  readAdvancedEffectControls();
  readEqAdvancedControls();
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
  const masterButton = $('fxMasterEnabledBtn');
  if (masterButton) {
    masterButton.addEventListener('click', () => {
      state.realtimeEnabled = state.realtimeEnabled === false;
      api.setSettings({ effectsMasterEnabled: state.realtimeEnabled });
      syncMasterFxButton();
      syncDspGraph();
      sendDSPParams();
      updateIRGraph();
    });
  }
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
  syncDspGraph();
  sendDSPParams();
  updateIRGraph();
  showToast(t('toastReset'));
}

async function loadPresets() {
  state.presets = await api.listPresets();
  const deprecated = state.presets.filter((preset) => isDeprecatedPreset(preset));
  for (const preset of deprecated) {
    if (activePresetId === preset.id) activePresetId = null;
    state.presets = await api.deletePreset(preset.id);
  }
  renderPresets();
}

/** 预设默认名称的前缀；实际默认名称为「前缀 + 升序编号」，例如 RlonIR_1 */
const DEFAULT_PRESET_NAME = 'RlonIR_';
const DEPRECATED_PRESET_NAMES = new Set(['RlonIR_3']);

function isDeprecatedPreset(preset) {
  return !!preset && preset.type !== 'pulse' && DEPRECATED_PRESET_NAMES.has(String(preset.name || '').trim());
}

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
  const names = state.presets.filter((p) => p.type !== 'pulse').map((p) => p.name);
  let name = nextNumberedName(DEFAULT_PRESET_NAME, names);
  if (DEPRECATED_PRESET_NAMES.has(name)) name = nextNumberedName(DEFAULT_PRESET_NAME, [...names, name]);
  return name;
}

function uniquePresetName(preferred) {
  const names = new Set(state.presets.filter((p) => p.type !== 'pulse').map((p) => String(p.name || '').trim()));
  let base = String(preferred || '').trim() || suggestedPresetName();
  if (DEPRECATED_PRESET_NAMES.has(base)) base = suggestedPresetName();
  if (!names.has(base)) return base;
  let index = 2;
  while (names.has(`${base} ${index}`)) index++;
  return `${base} ${index}`;
}

/** 当前已开启的预设（由条目最右侧的开关切换） */
let activePresetId = null;
let lastCreatedPresetId = null;

/**
 * 渲染预设列表。
 * 每一行都是一张独立卡片：名称输入框 + 保存 / 重命名 / 删除 + 最右侧开关。
 * 顶部另有一行「新建条目」，点击它的保存即按当前音效新增一条，列表随之增加一行。
 */
function renderPresets() {
  const list = $('presetList');
  if (list) {
    list.innerHTML = '';
    state.presets.filter((preset) => preset.type !== 'pulse' && !isDeprecatedPreset(preset)).forEach((preset) => {
      const isActive = activePresetId === preset.id;
      const row = document.createElement('div');
      // 「正在使用」的条目加蓝边 + 淡蓝底，与未启用的条目一眼区分
      row.className = 'preset-row' + (isActive ? ' active' : '');
      row.dataset.presetId = preset.id;
      row.innerHTML = `
        <input type="text" class="preset-name-input" maxlength="40" spellcheck="false" data-preset-name="${preset.id}" title="${t('rename')}">
        <div class="preset-row-actions">
          <button class="mini-btn lg-button" data-preset-del="${preset.id}" title="${t('delete')}"><svg class="icon icon-sm"><use href="#icon-trash"></use></svg></button>
          <button class="mini-btn lg-button" data-preset-reset="${preset.id}" title="${t('reset')}"><svg class="icon icon-sm"><use href="#icon-reset"></use></svg></button>
          <button class="mini-btn lg-button" data-preset-export="${preset.id}" title="${t('export')}"><svg class="icon icon-sm"><use href="#icon-export"></use></svg></button>
          <button class="mini-btn lg-button" data-preset-import="${preset.id}" title="${t('import')}"><svg class="icon icon-sm"><use href="#icon-import"></use></svg></button>
        </div>
        <label class="switch"><input type="checkbox" data-preset-toggle="${preset.id}"${isActive ? ' checked' : ''}></label>
      `;
      row.querySelector('[data-preset-name]').value = preset.name || DEFAULT_PRESET_NAME;
      list.appendChild(row);
    });

    if (lastCreatedPresetId) {
      const created = list.querySelector(`[data-preset-id="${lastCreatedPresetId}"]`);
      if (created) created.scrollIntoView({ block: 'nearest' });
      lastCreatedPresetId = null;
    }

    list.querySelectorAll('[data-preset-del]').forEach((btn) => {
      btn.addEventListener('click', () => deletePreset(btn.dataset.presetDel));
    });
    list.querySelectorAll('[data-preset-reset]').forEach((btn) => {
      btn.addEventListener('click', () => resetPreset(btn.dataset.presetReset));
    });
    list.querySelectorAll('[data-preset-export]').forEach((btn) => {
      btn.addEventListener('click', () => exportPreset(btn.dataset.presetExport));
    });
    list.querySelectorAll('[data-preset-import]').forEach((btn) => {
      btn.addEventListener('click', () => importPreset(btn.dataset.presetImport));
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
  return createPreset();
}

async function createPreset() {
  const input = $('presetNameInput');
  const name = uniquePresetName(input && input.value);
  const preset = {
    id: `preset-${Date.now()}`,
    name,
    effects: collectEffects(),
    updatedAt: Date.now()
  };
  state.presets = await api.savePreset(preset);
  lastCreatedPresetId = preset.id;
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

/**
 * 单条预设自己的「重置」。
 * 复用与既有全局重置完全同一条默认值规则（defaultEffects），
 * 只是把作用域收到这一条预设上：
 *   - 只把这条预设保存的内容恢复成默认音效；
 *   - 其余预设一律不动；
 *   - 只有这条预设正在被使用时，才顺带把实时音效同步成默认值
 *     （走的是既有 applyPreset 链路，不新增第二套应用逻辑）。
 */
async function resetPreset(id) {
  const preset = state.presets.find((item) => item.id === id);
  if (!preset) return;
  preset.effects = deepClone(defaultEffects);
  preset.updatedAt = Date.now();
  state.presets = await api.savePreset(preset);
  if (activePresetId === id) applyPreset(preset);
  renderPresets();
  showToast(t('toastPresetReset'));
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

/**
 * 导出：只导出这一张预设卡片自己的内容。
 * id 由卡片上的按钮给出；没有给 id 时才退回「当前正在使用的预设」。
 * 导出用的是卡片名称框里看到的那个名字（不另外改动预设数据）。
 */
async function exportPreset(id) {
  const targetId = id || activePresetId;
  const preset = state.presets.find((item) => item.id === targetId);
  if (!preset) {
    showToast(t('toastNoPreset'));
    return;
  }
  const input = document.querySelector(`[data-preset-name="${preset.id}"]`);
  const shown = ((input && input.value) || '').trim();
  await api.exportPreset(shown && shown !== preset.name ? Object.assign({}, preset, { name: shown }) : preset);
  showToast(t('toastPresetExported'));
}

/**
 * 导入：把选中的文件写进这一张预设卡片（只覆盖这一条，卡片本身不换位置）。
 * 其余预设一律不动；只有这条预设正在被使用时，才顺带同步到实时音效。
 */
async function importPreset(id) {
  const preset = state.presets.find((item) => item.id === id);
  if (!preset) {
    showToast(t('toastNoPreset'));
    return;
  }
  const incoming = await api.importPreset();
  if (!incoming || !incoming.effects) return;
  preset.name = incoming.name || preset.name || DEFAULT_PRESET_NAME;
  preset.effects = incoming.effects;
  preset.updatedAt = Date.now();
  state.presets = await api.savePreset(preset);
  if (activePresetId === preset.id) applyPreset(preset);
  renderPresets();
  showToast(t('toastPresetImported'));
}

function applyPreset(preset) {
  if (!preset || !preset.effects) return;
  state.effects = deepMergeEffects(deepClone(defaultEffects), preset.effects);
  applyEffectsToUI();
  syncDspGraph();
  sendDSPParams();
  updateIRGraph();
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
    // 在线曲目加载失败要给出可行动的真实原因（多为上游拒绝跨域 / 反盗链），不要只说「格式不支持」
    const online = !!(state.currentTrack && state.currentTrack.sourceId);
    showToast(online ? t('onlinePlayBlocked') : t('toastUnsupported'));
    setPlayButton(false);
  });
  audioElement.volume = state.volume;
  audioElement.muted = state.muted;
  // 恢复「当前本地曲目」的音源：在线曲目的 path 是 online:... 身份，不是文件路径，
  // 交给 playTrack 用真实解析出来的地址（带 CORS）去加载。
  if (state.currentTrack && !state.currentTrack.sourceId) {
    applyAudioSource(api.toFileUrl(state.currentTrack.path));
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
  refreshAnalysis();
  drawVisualizationCanvases();
  return true;
}

/**
 * 音频分析（读取频谱 / 时域数据，更新响度与每帧指标）。
 * 与「绘制」拆开：翻到第二页时第一页不再绘制，但分析必须继续，
 * 视觉引擎才有实时数据可用 —— 两边共用同一份分析结果，不做第二次 FFT。
 */
function refreshAnalysis() {
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
  return hasSignal;
}

/** 第一页的 10 路可视化绘制（隐藏页不做这一步） */
function drawVisualizationCanvases() {
  const hasSignal = analyser && state.isPlaying;
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
  // 不是频谱显示页时，该页的渲染完全停表（不是隐藏，而是真的不排队）
  if (typeof currentVizPage === 'number' && currentVizPage !== VIZ_PAGE.analysis) return;
  animationFrame = requestAnimationFrame(drawVisualizer);
}

function drawVisualizer() {
  if (document.hidden) {
    animationFrame = null;
    return;
  }
  if (typeof currentVizPage === 'number' && currentVizPage !== VIZ_PAGE.analysis) {
    animationFrame = null;   // 隐藏页：立即停止渲染循环，切回来再启动
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
  // 窗口被最小化 / 被别的窗口完全挡住时，系统会暂停动画；
  // 回到前台要立刻接着跑，否则第二页会停在最后一帧不动。
  if (visualEngine) visualEngine.setWindowVisible(!document.hidden);
  if (!document.hidden && state.isPlaying) startVisualizerLoop();
});

/* ============================================================================
 * 频谱空间分页 + Audio-Reactive Visual Engine
 * --------------------------------------------------------------------------
 * 第三页：现有专业分析（10 路可视化，逻辑不动，只加一处分页门控）。
 * 第二页：沉浸视觉工作区，效果由视觉引擎驱动，音频数据复用现有分析结果。
 * 三页同属一个频谱空间：不新建窗口、不新建分析器、不碰 DSP 与音频链路。
 * 页面顺序按需求对调过：第 1 页在线资源 ↔ 原第 1 页频谱显示（见 VIZ_PAGE）。
 * ========================================================================== */
/* 页面索引 → 语义（改顺序只改这里和 index.html 的 data-viz-page） */
const VIZ_PAGE = { online: 0, visual: 1, analysis: 2 };
let currentVizPage = 0;
let visualEngine = null;
let visualCardEls = new Map();

/** 按注册表生成效果卡片（统一设计语言，尺寸随效果特性自适应） */
function buildVisualCards() {
  const host = document.getElementById('visualCards');
  if (!host || !window.RlonVisualEngine) return;
  host.innerHTML = '';
  visualCardEls = new Map();
  window.RlonVisualEngine.registry.forEach((def) => {
    const card = document.createElement('div');
    card.className = 'vfx-card' + (def.layout && def.layout.span > 1 ? ' vfx-card--wide' : '');
    card.dataset.vfx = def.id;
    card.innerHTML =
      '<div class="vfx-head">'
      + '<button class="fx-caret" type="button"><svg class="icon"><use href="#icon-caret"></use></svg></button>'
      + '<span class="vfx-name"></span>'
      + '<span class="vfx-cat"></span>'
      + '<label class="switch"><input type="checkbox" data-vfx-enable="' + def.id + '"></label>'
      + '</div>'
      + '<div class="vfx-body"></div>';
    card.querySelector('.vfx-name').textContent = t(def.nameKey);
    const catKey = 'vfxCat' + def.category.charAt(0).toUpperCase() + def.category.slice(1);
    card.querySelector('.vfx-cat').textContent = t(catKey);
    const body = card.querySelector('.vfx-body');
    def.parameters.forEach((p) => {
      const row = document.createElement('div');
      row.className = 'param';
      row.dataset.priority = p.priority || 'core';
      const label = document.createElement('label');
      label.textContent = t(p.labelKey);
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = String(p.min);
      slider.max = String(p.max);
      slider.step = String(p.step);
      slider.value = String(p.default);
      slider.dataset.vfxParam = def.id + ':' + p.id;
      const out = document.createElement('span');
      const fmt = (v) => (p.step >= 1 ? String(Math.round(v)) : v.toFixed(2));
      out.textContent = fmt(p.default);
      slider.addEventListener('input', () => {
        const v = Number(slider.value);
        out.textContent = fmt(v);
        if (visualEngine) visualEngine.setParam(def.id, p.id, v);
        persistVisualState();
      });
      row.append(label, slider, out);
      body.appendChild(row);
    });
    const caret = card.querySelector('.fx-caret');
    caret.addEventListener('click', () => {
      const collapsed = card.classList.toggle('collapsed');
      caret.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    });
    const toggle = card.querySelector('[data-vfx-enable]');
    toggle.addEventListener('change', () => {
      if (visualEngine) visualEngine.setEnabled(def.id, toggle.checked);
      card.classList.toggle('is-enabled', toggle.checked);
      updateVisualStats();
      syncVisualScene();
      persistVisualState();
    });
    host.appendChild(card);
    visualCardEls.set(def.id, { card, toggle });
  });
}

function setupVisualParamsPanel() {
  const panel = document.getElementById('visualParamsPanel');
  const workspace = document.querySelector('.visual-workspace');
  const toggle = document.getElementById('visualParamsToggle');
  if (!panel || !workspace || !toggle) return;
  if (panel.dataset.bound === '1') return;
  panel.dataset.bound = '1';
  const storageKey = 'rlondsp.visualParamsCollapsed';
  const apply = (collapsed, persist) => {
    panel.classList.toggle('collapsed', collapsed);
    workspace.classList.toggle('params-collapsed', collapsed);
    toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    if (persist) {
      try { localStorage.setItem(storageKey, collapsed ? '1' : '0'); } catch {}
    }
    window.requestAnimationFrame(() => updateVisualLayout());
  };
  let collapsed = false;
  try { collapsed = localStorage.getItem(storageKey) === '1'; } catch {}
  apply(collapsed, false);
  toggle.addEventListener('click', () => {
    apply(!panel.classList.contains('collapsed'), true);
  });
}

/**
 * 预设条：最左边是「自动」，其余是一条条固定预设（单效果或组合）。
 * 点自动 → 按音乐节拍自动轮换；点某条预设 → 固定用它。
 */
function buildVisualPresets() {
  const host = document.getElementById('visualPresets');
  if (!host || !window.RlonVisualEngine) return;
  host.innerHTML = '';
  const autoChip = document.createElement('button');
  autoChip.type = 'button';
  autoChip.className = 'vfx-chip vfx-chip--auto';
  autoChip.dataset.vfxAuto = '1';
  autoChip.innerHTML = '<svg class="icon"><use href="#icon-loop-random"></use></svg><span data-i18n="vfxModeAuto"></span>';
  autoChip.querySelector('span').textContent = t('vfxModeAuto');
  autoChip.addEventListener('click', () => {
    if (!visualEngine) return;
    if (visualEngine.getMode() === 'auto') visualEngine.setAuto(false);
    else visualEngine.setAuto(true);
    syncVisualScene();
    persistVisualState();
  });
  host.appendChild(autoChip);
  (window.RlonVisualEngine.presets || []).forEach((preset) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'vfx-chip';
    chip.dataset.vfxPreset = preset.id;
    chip.dataset.i18n = preset.labelKey;
    chip.textContent = t(preset.labelKey);
    chip.addEventListener('click', () => {
      if (!visualEngine) return;
      visualEngine.setPreset(preset.id);
      syncVisualScene();
      persistVisualState();
    });
    host.appendChild(chip);
  });
  syncVisualScene();
}

/** 让界面跟上引擎的真实状态：预设条高亮 + 卡片开关（自动模式换组合时也会对上） */
function syncVisualScene() {
  if (!visualEngine) return;
  const bar = document.getElementById('visualPresets');
  if (bar) {
    const mode = visualEngine.getMode();
    const preset = visualEngine.getPreset();
    bar.querySelectorAll('.vfx-chip').forEach((chip) => {
      const active = chip.dataset.vfxAuto === '1'
        ? mode === 'auto'
        : (mode !== 'auto' && chip.dataset.vfxPreset === preset);
      chip.classList.toggle('is-active', active);
    });
  }
  visualCardEls.forEach((el, id) => {
    const fx = visualEngine.instances.get(id);
    if (!fx) return;
    el.toggle.checked = !!fx.enabled;
    el.card.classList.toggle('is-enabled', !!fx.enabled);
  });
  updateVisualStats();
}

/** 卡片密度随可用宽度自适应：窄窗口收紧列宽并隐藏次要参数 */
function updateVisualLayout() {
  const host = document.getElementById('visualCards');
  if (!host) return;
  const w = host.clientWidth;
  const h = host.clientHeight;
  const gap = 8;
  const count = Math.max(1, host.children.length);
  /** 平均分给 cols 列之后，每张卡片能拿到多宽 */
  const share = (cols) => Math.max(120, Math.floor((w - gap * (cols - 1)) / cols));
  // 按窗口宽度先算出「正常情况下能排几列」
  const fit = Math.max(1, Math.min(count, Math.floor((w + gap) / (236 + gap))));
  // 再优先挑一个能把卡片数量整除的列数：每行都排满，右侧不留空白。
  let cols = 0;
  for (let c = Math.min(count, 6); c >= 1; c--) {
    if (count % c === 0 && share(c) >= 195) { cols = c; break; }
  }
  if (!cols) cols = fit;
  host.style.setProperty('--vfx-col', share(cols) + 'px');
  // 竖向自适应：先试着把全部参数都摆下（整块正好铺满，不留滚动条）；
  // 摆不下才逐级收起最不常用的参数，而不是让卡片被裁掉一半。
  const rows = Math.ceil(count / cols);
  const limit = h - gap * (rows - 1);
  let level = 0;
  if (!fits(host, rows, limit, 0)) level = 1;
  if (!fits(host, rows, limit, 1)) level = 2;
  applyParamLevel(host, level);
}

/** 按层级显示参数行：0=全部，1=收起高级，2=再收起次级 */
function applyParamLevel(host, level) {
  host.querySelectorAll('.param').forEach((row) => {
    const priority = row.dataset.priority || 'core';
    const hide = (level >= 2 && priority !== 'core') || (level === 1 && priority === 'advanced');
    row.style.display = hide ? 'none' : '';
  });
}

/** 试摆一次：按 level 显示参数，看看最高的卡片乘行数塞不塞得进可用高度 */
function fits(host, rows, limit, level) {
  applyParamLevel(host, level);
  let tallest = 0;
  host.querySelectorAll('.vfx-card').forEach((card) => {
    if (card.offsetHeight > tallest) tallest = card.offsetHeight;
  });
  // 留 8px 余量：刚好卡满时容易因为取整冒出一条细滚动条，反而更难看
  return tallest * rows <= limit - 8;
}

function updateVisualStats() {
  const el = document.getElementById('visualStats');
  if (!el || !visualEngine) return;
  const s = visualEngine.frameStats();
  el.textContent = 'RUN ' + visualEngine.runningCount() + '  ·  ' + s.frameMs + ' ms  ·  x' + s.scale;
}

/** 视觉效果的启用状态与参数跟随设置一起保存（不丢配置） */
function persistVisualState() {
  if (!visualEngine) return;
  api.setSettings({ visualState: visualEngine.getState() });
}

/**
 * 播放窗口状态过渡动画（最大化 / 还原 / 恢复 / 最小化）。
 * 窗口尺寸的变化由系统瞬间完成，动画只作用在内容层：
 * 起始缩放略大于 1，过渡期间不会在窗口四边露出底色缝隙。
 */
function playWindowAnim(kind) {
  if (!document.body) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cls = kind === 'out' ? 'win-anim-out' : 'win-anim-in';
  document.body.classList.remove('win-anim-in', 'win-anim-out');
  // 强制一次重排，保证连续触发时动画能从头播放
  void document.body.offsetWidth;
  document.body.classList.add(cls);
  window.setTimeout(() => document.body.classList.remove(cls), kind === 'out' ? 260 : 380);
}

function setVizPage(page, animate) {
  const pages = document.querySelectorAll('.viz-page');
  if (!pages.length) return;
  const next = Math.max(0, Math.min(2, Number(page) || 0));
  const prev = currentVizPage;
  currentVizPage = next;
  pages.forEach((el) => {
    const idx = Number(el.dataset.vizPage);
    el.classList.remove('is-in', 'is-out');
    el.style.transform = '';
    el.classList.toggle('is-active', idx === next);
    if (idx === next) el.removeAttribute('aria-hidden');
    else el.setAttribute('aria-hidden', 'true');
  });
  if (animate && prev !== next) {
    const incoming = [...pages].find((el) => Number(el.dataset.vizPage) === next);
    const outgoing = [...pages].find((el) => Number(el.dataset.vizPage) === prev);
    if (incoming) incoming.classList.add('is-in');
    if (outgoing) outgoing.classList.add('is-out');
    window.setTimeout(() => {
      if (incoming) incoming.classList.remove('is-in');
      if (outgoing) outgoing.classList.remove('is-out');
    }, 420);
  }
  document.querySelectorAll('.viz-dot').forEach((dot) => {
    dot.classList.toggle('active', Number(dot.dataset.vizDot) === currentVizPage);
  });
  // 页面生命周期：只有活动页运行自己的渲染，另一页立即停表
  if (visualEngine) visualEngine.setSceneActive(currentVizPage === VIZ_PAGE.visual);
  if (currentVizPage === VIZ_PAGE.analysis && state.isPlaying) startVisualizerLoop();
  // 进入在线资源页：自动显示热门内容（已有数据时只重新随机，不重复请求）
  if (currentVizPage === VIZ_PAGE.online) safeRun('在线资源首页', onlineEnterPage);
  updateVisualLayout();
}

/**
 * 拖动跟手：只给当前页一个很小的水平位移（百分比），松手后由 setVizPage 复位。
 * 位移很小（最多 ±6%）且只在拖动期间存在，因此不会影响静止时的文字清晰度。
 */
function applyPagerDrag(dxPx) {
  const pager = document.getElementById('vizPager');
  const active = document.querySelector('.viz-page.is-active');
  if (!pager || !active) return;
  const width = pager.clientWidth || 1;
  let ratio = dxPx / width;
  if (ratio > 0.06) ratio = 0.06;
  if (ratio < -0.06) ratio = -0.06;
  active.style.transform = 'translate3d(' + (ratio * 100).toFixed(2) + '%, 0, 0)';
}

/**
 * 横向滑动切换页面。
 * - 只在非交互区域起手（滑杆 / 按钮 / 开关 / 下拉上绝不翻页）
 * - 方向锁定：横向位移明显大于纵向才认定为翻页，纵向滚动不受影响
 * - 阈值 + 速度双重判定，避免误触
 */
function setupVizPager() {
  const pager = document.getElementById('vizPager');
  if (!pager) return;
  const THRESHOLD = 60;
  const VELOCITY = 0.35;
  let active = false;
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastT = 0;
  let locked = null;

  const isInteractive = (target) => !!target.closest(
    'input,button,select,textarea,label,.switch,.fx-caret,.viz-dot,a,[contenteditable="true"]'
  );

  pager.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || isInteractive(event.target)) return;
    active = true;
    locked = null;
    pointerId = event.pointerId;
    startX = lastX = event.clientX;
    startY = event.clientY;
    lastT = event.timeStamp;
  });

  pager.addEventListener('pointermove', (event) => {
    if (!active || event.pointerId !== pointerId) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (!locked) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      locked = Math.abs(dx) > Math.abs(dy) * 1.2 ? 'x' : 'y';
      if (locked === 'x') {
        // 指针捕获失败（例如合成事件 / 指针已释放）不影响翻页逻辑
        try { pager.setPointerCapture(pointerId); } catch (error) { /* 忽略 */ }
      } else {
        active = false;   // 纵向滚动优先，不再参与翻页判定
        return;
      }
    }
    // 跟手：当前页随手指做小幅位移（最多 ±6%），松手后平滑复位或翻页
    applyPagerDrag(dx);
    lastX = event.clientX;
    lastT = event.timeStamp;
  });

  const finish = (event) => {
    if (!active || (pointerId !== null && event.pointerId !== pointerId)) return;
    const dx = event.clientX - startX;
    const dt = Math.max(1, event.timeStamp - lastT + 1);
    const velocity = Math.abs(event.clientX - lastX) / dt;
    active = false;
    if (pointerId !== null && pager.hasPointerCapture && pager.hasPointerCapture(pointerId)) {
      try { pager.releasePointerCapture(pointerId); } catch (error) { /* 忽略 */ }
    }
    pointerId = null;
    if (locked !== 'x') return;
    const far = Math.abs(dx) > THRESHOLD;
    const fast = velocity > VELOCITY && Math.abs(dx) > 24;
    // 松手后统一走 setVizPage：够阈值就翻页，不够就平滑吸附回原页
    if ((far || fast) && dx < 0 && currentVizPage < 2) setVizPage(currentVizPage + 1, true);
    else if ((far || fast) && dx > 0 && currentVizPage > 0) setVizPage(currentVizPage - 1, true);
    else setVizPage(currentVizPage, true);
  };

  pager.addEventListener('pointerup', finish);
  pager.addEventListener('pointercancel', finish);
  document.querySelectorAll('.viz-dot').forEach((dot) => {
    dot.addEventListener('click', () => setVizPage(Number(dot.dataset.vizDot), true));
  });
  window.addEventListener('keydown', (event) => {
    const modal = document.getElementById('effectsModal');
    if (modal && !modal.hidden) return;
    if (event.key === 'ArrowRight' && currentVizPage < 2) setVizPage(currentVizPage + 1, true);
    if (event.key === 'ArrowLeft' && currentVizPage > 0) setVizPage(currentVizPage - 1, true);
  });
  window.addEventListener('resize', () => {
    updateVisualLayout();
    const active = document.querySelector('.viz-page.is-active');
    if (active) active.style.transform = '';
  });
}

function initVisualEngine() {
  const canvas = document.getElementById('visualCanvas');
  if (!canvas || !window.RlonVisualEngine) return;
  buildVisualCards();
  buildVisualPresets();
  setupVisualParamsPanel();
  visualEngine = window.RlonVisualEngine.create({
    canvas,
    // 数据全部来自现有分析链路：不做第二次 FFT、不重复计算
    // 第二页期间由引擎每帧调用 refreshAnalysis()，保证分析数据持续更新
    beforeFrame: () => refreshAnalysis(),
    getFreqBytes: () => freqData,
    getTimeData: () => timeData,
    getMetrics: () => vizMetrics,
    onResize: () => updateVisualLayout(),
    // 自动模式换组合 / 切换预设时，界面上的开关与高亮要跟着变
    onSceneChange: () => syncVisualScene()
  });
  if (state.settings.visualState) visualEngine.applyState(state.settings.visualState);
  // 老存档里没有「自动 / 固定」这个选择（mode），以及第一次打开时：
  // 默认进入自动模式，让画面按节拍自动换组合；用户随时可以点某条预设固定下来。
  if (!state.settings.visualState || !state.settings.visualState.mode) {
    visualEngine.setAuto(true);
    persistVisualState();
  }
  visualCardEls.forEach((el, id) => {
    const fx = visualEngine.instances.get(id);
    if (!fx) return;
    el.toggle.checked = !!fx.enabled;
    el.card.classList.toggle('is-enabled', !!fx.enabled);
    el.card.querySelectorAll('.param').forEach((row) => {
      const slider = row.querySelector('input[type=range]');
      if (!slider) return;
      const key = slider.dataset.vfxParam.split(':')[1];
      if (fx.state[key] !== undefined) slider.value = String(fx.state[key]);
    });
  });
  setupVizPager();
  setVizPage(VIZ_PAGE.online, false);   // 启动时第一页（在线资源）为活动页（隐藏页不渲染）
  updateVisualLayout();
  syncVisualScene();
  updateVisualStats();
  window.setInterval(updateVisualStats, 1000);
}

function openSettings() {
  $('themeSelect').value = state.settings.theme;
  $('languageSelect').value = state.settings.language;
  $('closeToTray').checked = state.settings.closeToTray;
  syncAlwaysOnTopUI();
  $('settingsModal').hidden = false;
  // 打开设置时刷新一次版本信息（本地读取，不联网）
  safeRun('版本信息刷新', initUpdateSection);
}

/**
 * 「始终置顶」开关与真实窗口状态保持一致的唯一入口。
 * 界面永远显示 BrowserWindow 的真实状态（isAlwaysOnTop），
 * 所以不会出现「开关是开的、窗口其实没置顶」这种不一致。
 */
async function syncAlwaysOnTopUI() {
  if (!api.getAlwaysOnTop) return;
  try {
    const real = await api.getAlwaysOnTop();
    reflectAlwaysOnTop(!!real);
  } catch (error) {
    console.warn('读取置顶状态失败', error);
  }
}

/**
 * 把真实的窗口置顶状态同步到界面：
 * 标题栏右上角的「图钉」按钮（点亮 = 已置顶）。
 * 界面显示的就是 BrowserWindow 的真实状态，不会出现「按钮亮着其实没置顶」。
 */
function reflectAlwaysOnTop(real) {
  const on = !!real;
  state.settings.alwaysOnTop = on;
  const pin = $('pinBtn');
  if (pin) {
    pin.classList.toggle('active', on);
    const label = t('alwaysOnTop') + ' · ' + (on ? t('on') : t('off'));
    pin.title = label;
    pin.setAttribute('aria-label', label);
    pin.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
}

async function applyAlwaysOnTop(enabled) {
  // 普通模式与迷你模式是同一个窗口，因此这一份状态天然共享
  const wanted = !!enabled;
  if (api.setAlwaysOnTop) {
    const real = await api.setAlwaysOnTop(wanted);
    // 以真实窗口状态为准回写所有入口，界面与系统层级永远一致
    reflectAlwaysOnTop(!!real);
    api.setSettings({ alwaysOnTop: !!real });
    return;
  }
  reflectAlwaysOnTop(wanted);
  api.setSettings({ alwaysOnTop: wanted });
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
  on('playlistSearch', 'input', () => {
    clearSelection();
    renderPlaylist();
  });
  on('clearPlaylistBtn', 'click', clearPlaylist);
  on('trackList', 'click', (event) => {
    const heart = event.target.closest('.track-heart');
    if (heart) {
      const row = heart.closest('.track-item');
      if (row) toggleFavorite(row.dataset.key);
      return;
    }
    const nextBtn = event.target.closest('.track-next');
    if (nextBtn) {
      const row = nextBtn.closest('.track-item');
      if (row) {
        // Shift = 依次插队（FIFO）；默认 = 下一首播放（LIFO）
        queueManager.enqueueNext(row.dataset.key, event.shiftKey ? 'sequence' : 'cut');
        renderPlaylist();
        showToast(event.shiftKey ? t('trackQueuedSequence') : t('trackQueuedNext'));
      }
      return;
    }
    const removeBtn = event.target.closest('.track-remove');
    if (removeBtn) {
      const row = removeBtn.closest('.track-item');
      if (row) removeTrackFromQueue(row.dataset.key);
      return;
    }
  });
  // 只读预览里点歌 = 继续播放并接管该队列
  on('trackList', 'click', (event) => {
    if (event.target.closest('.track-act')) return;
    const row = event.target.closest('.track-item');
    if (!row) return;
    if (previewQueueId()) {
      takeOverPreviewQueue(row.dataset.key);
      return;
    }
    const editable = queueIsEditable(displayedQueue());
    if (editable && (event.ctrlKey || event.metaKey)) {
      toggleSelectedKey(row.dataset.key);
      return;
    }
    if (editable && event.shiftKey) {
      selectRangeTo(row.dataset.key);
      return;
    }
    clearSelection();
    const index = queueManager.indexOfTrackKey(row.dataset.key);
    if (index >= 0) playTrack(index);
  });
  on('locateCurrentBtn', 'click', locateCurrentTrack);
  on('emptyImportFileBtn', 'click', importFiles);
  on('emptyImportFolderBtn', 'click', importFolder);
  on('emptyGoOnlineBtn', 'click', () => setVizPage(VIZ_PAGE.online, true));
  on('queueSelector', 'click', (event) => {
    const del = event.target.closest('.queue-chip-del');
    if (del) {
      const chip = del.closest('.queue-chip');
      // 非当前队列：删除 = 删除整个队列（手动队列受保护，管理端会拒绝）
      if (chip) {
        clearSelection();
        queueManager.removeQueue(chip.dataset.queueId, { archive: true });
        renderQueueFilterBar();
        renderPlaylist();
      }
      return;
    }
    const chip = event.target.closest('.queue-chip');
    if (!chip) return;
    if (chip.id === 'queueAddBtn') {
      queueManager.ensureQueue('queue:manual', { kind: 'manual', sourceType: 'manual', title: t('queueManual') });
      switchQueue('queue:manual');
      return;
    }
    switchQueue(chip.dataset.queueId);
  });
  on('queueViewChips', 'click', (event) => {
    const chip = event.target.closest('.queue-filter-chip');
    if (chip) setQuickView(chip.dataset.view);
  });
  on('queueQualityChips', 'click', (event) => {
    const chip = event.target.closest('.queue-filter-chip');
    if (chip) toggleQuality(chip.dataset.quality);
  });
  on('queueFilterToggle', 'click', () => {
    state.playlistFilter.panelOpen = !state.playlistFilter.panelOpen;
    const panel = $('queueFilterPanel');
    if (!panel) return;
    if (state.playlistFilter.panelOpen) renderQueueFilterBar();
    else panel.hidden = true;
  });
  on('queueFilterClear', 'click', clearPlaylistFilter);
  on('queueFolderClear', 'click', () => setFolder(''));
  on('queueFolderTree', 'click', (event) => {
    const label = event.target.closest('.queue-folder-node__label');
    if (label) setFolder(label.dataset.folder);
  });
  on('queueSelectionPlay', 'click', playSelectedKeys);
  on('queueSelectionAdd', 'click', enqueueSelectedKeys);
  on('queueSelectionFavorite', 'click', favoriteSelectedKeys);
  on('queueSelectionRemove', 'click', removeSelectedKeys);
  on('queueSelectionSelectAll', 'click', selectAllFiltered);
  on('queueSelectionClear', 'click', clearSelection);
  safeRun('播放列队拖拽重排', setupPlaylistDrag);
  safeRun('播放队列选择器初始渲染', renderQueueSelector);
  on('playBtn', 'click', togglePlay);
  on('prevBtn', 'click', playPrevious);
  on('nextBtn', 'click', () => playNext(false));
  on('progress', 'input', (event) => seekTo(Number(event.target.value) / 1000));
  on('volume', 'input', (event) => setVolume(Number(event.target.value) / 100));
  safeRun('播放列表展开交互', setupPlaylistExpand);
  safeRun('播放进度条浮层', setupProgressOverlay);
  on('deviceSelect', 'change', (event) => {
    api.setSettings({ outputDeviceId: event.target.value });
    applyOutputDevice(event.target.value);
  });
  on('effectsBtn', 'click', () => {
    const modal = $('effectsModal');
    if (modal) modal.hidden = false;
  });
  // 图标系统自检：只做登记与比对，不改任何画面。
  // 如果哪天某个按钮引用了不存在的图标，控制台会直接点名，方便定位。
  if (window.RlonIcons) {
    const report = window.RlonIcons.audit();
    if (report.missing.length) {
      console.warn('[RlonDSP 图标] 引用了但没有绘制的图标:', report.missing.join(', '));
    }
  }
  on('closeEffectsBtn', 'click', () => {
    const modal = $('effectsModal');
    if (modal) modal.hidden = true;
  });
  const effectsModal = $('effectsModal');
  if (effectsModal) {
    effectsModal.addEventListener('dblclick', (event) => {
      if (event.target !== effectsModal) return;
      const card = effectsModal.querySelector('.effects-card');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right) {
        effectsModal.hidden = true;
      }
    });
  }
  on('createPresetBtn', 'click', createPreset);
  const presetNameInput = $('presetNameInput');
  if (presetNameInput) {
    // 用户一旦手动改名，就不再自动覆盖
    presetNameInput.addEventListener('input', () => { presetNameInput.dataset.auto = '0'; });
  }
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
  // 最小化：先播放淡出动画，动画结束后再真正最小化（观感连续，不突兀）
  on('winMinBtn', 'click', () => {
    playWindowAnim('out');
    window.setTimeout(() => api.minimize(), 170);
  });
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
      swapIcon(icon, value ? '#icon-win-restore' : '#icon-win-max');
      const btn = $('winMaxBtn');
      if (btn) btn.title = value ? '还原' : '最大化';
    });
  }
  // 最大化 / 还原 / 从任务栏恢复：播放窗口过渡动画
  if (api.onWindowAnim) {
    api.onWindowAnim((kind) => playWindowAnim(kind === 'out' ? 'out' : 'in'));
  }
  on('closeSettingsBtn', 'click', () => {
    const modal = $('settingsModal');
    if (modal) modal.hidden = true;
  });
  on('saveSettingsBtn', 'click', saveSettings);
  onlineInitEvents();
  // 标题栏右上角的图钉按钮：点一下切换置顶（与设置里的开关是同一个状态）
  on('pinBtn', 'click', async () => {
    const now = api.getAlwaysOnTop ? await api.getAlwaysOnTop() : !!state.settings.alwaysOnTop;
    await applyAlwaysOnTop(!now);
  });
  if (api.onAlwaysOnTopChanged) {
    // 以真实窗口状态为准回写界面（例如系统或其它途径改变了置顶状态）
    api.onAlwaysOnTopChanged((value) => {
      reflectAlwaysOnTop(!!value);
    });
  }
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
  // 下载进度由主进程按真实字节数上报：只更新对应那一首的控件，不重排列表
  if (api.onOnlineDownloadProgress) {
    api.onOnlineDownloadProgress(onlineHandleDownloadProgress);
  }
  // 音量滑杆集成在静音按钮上：点按钮弹出 / 收起竖向滑杆（静音由「音量到零」得出）
  safeRun('音量控件初始化', setupVolumeControl);
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
  state.realtimeEnabled = state.settings.effectsMasterEnabled !== false;
  state.volume = state.settings.volume;
  state.mode = state.settings.playbackMode || 'list';
  safeRun('音量滑块初始化', () => {
    const volume = $('volume');
    if (volume) volume.value = String(Math.round(state.volume * 100));
    // 图标 / 读数跟随真实音量（音量 0 在启动时也应显示为静音）
    setMuted(Number(state.volume) <= 0.0005);
    updateVolumeUi();
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
  safeRun('均衡器专业参数构建', buildEqAdvancedControls);
  safeRun('实时音效专业参数构建', buildAdvancedEffectControls);
  applyEffectsToUI();
  safeRun('DSP 图谱同步', syncDspGraph);
  bindUI();
  safeRun('效果卡片折叠初始化', setupEffectCards);
  state.favorites = new Set(await api.getFavorites());
  state.history = await api.getHistory();
  await loadPresets();
  await safeRunAsync('在线源初始化', async () => {
    await loadOnlineSources();
  });
  // 启动后的后台自动发现：不 await、不阻塞主界面 / 播放器 / DSP，
  // 只做一次数据准备；来源层有 5 分钟短期缓存，不会高频请求。
  if (state.online.sourceId) {
    window.setTimeout(() => {
      void safeRunAsync('在线资源后台发现', () => onlineRefreshResults());
    }, 800);
  }
  // 队列恢复必须在第一次渲染之前：Queue 是真相源，播放列表只是它的投影
  await safeRunAsync('播放队列恢复', () => queueManager.init());
  safeRun('播放列表筛选栏渲染', renderQueueFilterBar);
  safeRun('播放列表渲染', renderPlaylist);
  safeRun('正在播放信息同步', updateNowPlaying);
  await safeRunAsync('输出设备枚举', enumerateOutputDevices);
  if (state.settings.outputDeviceId) applyOutputDevice(state.settings.outputDeviceId);
  await safeRunAsync('版本信息初始化', initUpdateSection);
  await safeRunAsync('置顶状态同步', syncAlwaysOnTopUI);
  await safeRunAsync('视觉引擎初始化', initVisualEngine);
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

