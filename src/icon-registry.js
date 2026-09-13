/*
 * RlonDSP
 * Copyright © 2026 RlonDSP. All rights reserved.
 * Based on Echomusic open-source project, modified and extended for RlonDSP.
 *
 * RlonDSP Tactile Vector Icon System —— 图标登记表（Icon Registry）
 * ---------------------------------------------------------------------------
 * 这里不负责“画图”，只负责“管理”：整个软件里每一个图标叫什么、属于哪一类、
 * 代表什么功能、视觉尺寸大概占多大、线条是粗是细，全部登记在这一处。
 *
 * 图形本体仍然是 index.html 里那套 <symbol> 矢量图（SVG sprite）：
 *   - 纯矢量，任意分辨率都不糊；
 *   - 用 currentColor 着色，自动跟随主题；
 *   - 只用 stroke / fill / opacity / transform 做状态变化，不产生位图。
 *
 * 对外提供：
 *   RlonIcons.svg(id, opts)   生成一个 <svg class="icon"><use .../></svg>
 *   RlonIcons.iconId(el)      从一个元素上读出它在用哪个图标
 *   RlonIcons.audit()         自检：缺图 / 没登记的图 / 登记了但没画出来的图
 *   RlonIcons.list()          列出全部登记项（调试或文档用）
 */
(function () {
  'use strict';

  /**
   * 分类：用于文档、自检与后续批量调整，不参与渲染。
   *   transport  播放控制
   *   library    歌曲库操作
   *   file       文件 / 文件夹
   *   edit       编辑类（保存 / 删除 / 重置 / 导出 / 导入）
   *   view       视图 / 页面
   *   audio      音频与 DSP 语义
   *   window     窗口级控制（保持系统原生行为，只登记不改行为）
   */
  const ICONS = {
    /* ---------------------------------------------------------- 播放控制 */
    play: { cat: 'transport', zh: '播放', en: 'Play', semantics: '开始播放', optical: 0.62, weight: 'solid' },
    pause: { cat: 'transport', zh: '暂停', en: 'Pause', semantics: '暂停播放', optical: 0.62, weight: 'solid', pair: 'play' },
    prev: { cat: 'transport', zh: '上一首', en: 'Previous', semantics: '切换到上一首', optical: 0.66 },
    next: { cat: 'transport', zh: '下一首', en: 'Next', semantics: '切换到下一首', optical: 0.66 },
    'loop-list': { cat: 'transport', zh: '列表循环', en: 'Repeat all', semantics: '整个列表循环播放', optical: 0.72, toggle: true },
    'loop-single': { cat: 'transport', zh: '单曲循环', en: 'Repeat one', semantics: '只循环当前这一首', optical: 0.72, toggle: true, pair: 'loop-list' },
    'loop-random': { cat: 'transport', zh: '随机播放', en: 'Shuffle', semantics: '随机顺序播放', optical: 0.72, toggle: true },
    volume: { cat: 'transport', zh: '音量', en: 'Volume', semantics: '音量大小', optical: 0.7, togglesTo: 'mute' },
    mute: { cat: 'transport', zh: '静音', en: 'Mute', semantics: '静音 / 取消静音', optical: 0.7, pair: 'volume' },

    /* ---------------------------------------------------------- 歌曲库 */
    search: { cat: 'library', zh: '搜索', en: 'Search', semantics: '在播放列表里搜索歌曲', optical: 0.68 },
    note: { cat: 'library', zh: '歌词', en: 'Lyrics', semantics: '打开桌面歌词', optical: 0.7 },
    list: { cat: 'library', zh: '列表', en: 'List', semantics: '播放列表', optical: 0.68 },
    sort: { cat: 'library', zh: '排序', en: 'Sort', semantics: '播放列表排序方式', optical: 0.66 },
    trash: { cat: 'library', zh: '清空 / 删除', en: 'Clear / Delete', semantics: '清空播放列表或删除该条目', optical: 0.62 },
    plus: { cat: 'library', zh: '添加', en: 'Add', semantics: '新增一条（预设等）', optical: 0.56 },

    /* ---------------------------------------------------------- 文件 */
    file: { cat: 'file', zh: '文件', en: 'File', semantics: '单个音频文件', optical: 0.62 },
    folder: { cat: 'file', zh: '文件夹', en: 'Folder', semantics: '文件夹', optical: 0.66 },
    'import-file': { cat: 'file', zh: '导入文件', en: 'Import file', semantics: '把音频文件导入播放列表', optical: 0.66 },
    'import-folder': { cat: 'file', zh: '导入文件夹', en: 'Import folder', semantics: '把整个文件夹的音乐导入播放列表', optical: 0.68 },

    /* ---------------------------------------------------------- 编辑类 */
    save: { cat: 'edit', zh: '保存', en: 'Save', semantics: '保存当前设置 / 预设', optical: 0.62 },
    reset: { cat: 'edit', zh: '重置', en: 'Reset', semantics: '恢复默认参数', optical: 0.62 },
    edit: { cat: 'edit', zh: '重命名', en: 'Rename', semantics: '重命名条目', optical: 0.62 },
    export: { cat: 'edit', zh: '导出', en: 'Export', semantics: '导出到文件', optical: 0.66 },
    import: { cat: 'edit', zh: '导入', en: 'Import', semantics: '从文件导入', optical: 0.66 },
    close: { cat: 'edit', zh: '关闭', en: 'Close', semantics: '关闭当前弹窗 / 面板', optical: 0.5 },
    info: { cat: 'edit', zh: '关于', en: 'About', semantics: '关于本软件', optical: 0.62 },

    /* ---------------------------------------------------------- 视图 / 页面 */
    caret: { cat: 'view', zh: '展开 / 收起', en: 'Expand / Collapse', semantics: '展开或收起一个分区', optical: 0.45 },
    chart: { cat: 'view', zh: '图表', en: 'Chart', semantics: '数据图表', optical: 0.66 },
    wave: { cat: 'view', zh: '波形', en: 'Waveform', semantics: '波形视图', optical: 0.74 },
    pulse: { cat: 'view', zh: '脉冲', en: 'Pulse', semantics: '脉冲 / 频谱能量', optical: 0.74 },
    meter: { cat: 'view', zh: '电平表', en: 'Meter', semantics: '电平显示', optical: 0.66 },
    vector: { cat: 'view', zh: '矢量示波', en: 'Vector scope', semantics: '矢量 / 声场视图', optical: 0.7 },
    spectrum: { cat: 'view', zh: '频谱', en: 'Spectrum', semantics: '频谱分析视图', optical: 0.7, planned: true },
    visualizer: { cat: 'view', zh: '沉浸视觉', en: 'Visualizer', semantics: '动态视觉画面', optical: 0.74, planned: true },

    /* ---------------------------------------------------------- 音频 / DSP */
    effects: { cat: 'audio', zh: '实时音效', en: 'Sound effects', semantics: '打开实时音效（DSP）面板', optical: 0.66 },
    eq: { cat: 'audio', zh: '均衡器', en: 'Equalizer', semantics: '均衡器 / 频段调节', optical: 0.66 },
    dsp: { cat: 'audio', zh: '音效链路', en: 'DSP chain', semantics: '音效处理链路（推子造型，专业音频语义）', optical: 0.7 },
    spatial: { cat: 'audio', zh: '空间音效', en: 'Spatial audio', semantics: '空间 / 三维声场处理', optical: 0.72, planned: true },
    ir: { cat: 'audio', zh: '脉冲反馈', en: 'Impulse response', semantics: '脉冲响应 / 卷积混响', optical: 0.74, planned: true },
    plugin: { cat: 'audio', zh: '插件', en: 'Plugin', semantics: '外部音效引擎或插件', optical: 0.7, planned: true },
    settings: { cat: 'audio', zh: '设置', en: 'Settings', semantics: '打开设置面板', optical: 0.68 },
    device: { cat: 'audio', zh: '输出设备', en: 'Output device', semantics: '音频输出设备', optical: 0.68 },
    ab: { cat: 'audio', zh: 'A/B 对比', en: 'A/B compare', semantics: 'A/B 效果对比', optical: 0.72 },
    audition: { cat: 'audio', zh: '试听', en: 'Audition', semantics: '试听当前脉冲 / 预设', optical: 0.62 },

    /* ---------------------------------------------------------- 窗口级（保持原生行为） */
    pin: { cat: 'window', zh: '置顶', en: 'Always on top', semantics: '窗口始终保持在最前', optical: 0.6, toggle: true },
    'win-min': { cat: 'window', zh: '最小化', en: 'Minimize', semantics: '最小化窗口', optical: 0.5 },
    'win-max': { cat: 'window', zh: '最大化', en: 'Maximize', semantics: '最大化窗口', optical: 0.48 },
    'win-restore': { cat: 'window', zh: '还原', en: 'Restore', semantics: '还原窗口大小', optical: 0.5, pair: 'win-max' },
    'win-mini': { cat: 'window', zh: '迷你模式', en: 'Mini mode', semantics: '切换到迷你窗口', optical: 0.62, toggle: true },
    brand: { cat: 'window', zh: 'RlonDSP 标志', en: 'RlonDSP mark', semantics: '软件标识（纯矢量，不是图片）', optical: 1 }
  };

  /** 登记表里键名 → 真正的 symbol id（统一加前缀，避免和业务 id 撞名） */
  function toSymbolId(key) {
    return 'icon-' + key;
  }

  function spriteRoot() {
    return document.getElementById('iconSprite');
  }

  function list() {
    return Object.keys(ICONS).map((key) => Object.assign({ id: toSymbolId(key), key }, ICONS[key]));
  }

  function get(id) {
    const key = String(id || '').replace(/^#/, '').replace(/^icon-/, '');
    return ICONS[key] ? Object.assign({ id: toSymbolId(key), key }, ICONS[key]) : null;
  }

  function has(id) {
    const root = spriteRoot();
    return !!(root && root.querySelector('#' + toSymbolId(String(id || '').replace(/^#/, '').replace(/^icon-/, ''))));
  }

  /**
   * 生成图标（返回一个 <svg class="icon"><use href="#icon-x"/></svg>）。
   * opts.size 只是登记用的视觉尺寸提示（xs/sm/md/lg），真正的像素尺寸仍由 CSS 控制，
   * 因此不会改变任何现有布局。
   */
  function svg(id, opts) {
    const options = opts || {};
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    el.setAttribute('class', 'icon' + (options.size ? ' icon-' + options.size : ''));
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('focusable', 'false');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#' + toSymbolId(String(id).replace(/^#/, '').replace(/^icon-/, '')));
    el.appendChild(use);
    return el;
  }

  /** 自检：把“引用了但没画”“画了但没登记”都找出来（只在控制台提示，不影响使用） */
  function audit() {
    const root = spriteRoot();
    const drawn = root ? Array.from(root.querySelectorAll('symbol[id]')).map((s) => s.id) : [];
    const registered = list().map((i) => i.id);
    const referenced = new Set();
    document.querySelectorAll('use').forEach((u) => {
      const href = u.getAttribute('href') || u.getAttribute('xlink:href') || '';
      if (href.startsWith('#icon-')) referenced.add(href.slice(1));
    });
    return {
      drawn: drawn.length,
      registered: registered.length,
      referenced: referenced.size,
      missing: Array.from(referenced).filter((id) => drawn.indexOf(id) < 0),
      unregistered: drawn.filter((id) => registered.indexOf(id) < 0),
      unreferenced: registered.filter((id) => drawn.indexOf(id) >= 0 && !referenced.has(id))
    };
  }

  window.RlonIcons = { list, get, has, svg, audit };
})();
