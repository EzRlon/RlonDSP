/*
 * RlonDSP
 * Copyright © 2026 RlonDSP. All rights reserved.
 * Based on Echomusic open-source project, modified and extended for RlonDSP.
 */
const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, dialog, nativeTheme, nativeImage, screen, shell, net } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');

const updateCore = require('./update-core');

app.setName('RlonDSP');

const AUDIO_EXTENSIONS = new Set(['.mp3', '.flac', '.wav', '.ogg', '.m4a', '.aac', '.opus', '.wma', '.aiff', '.ape']);

let mainWindow = null;
let lyricsWindow = null;
let tray = null;
let isQuitting = false;

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => showMainWindow());
}

const userDataDir = app.getPath('userData');
const settingsFile = path.join(userDataDir, 'settings.json');
const favoritesFile = path.join(userDataDir, 'favorites.json');
const historyFile = path.join(userDataDir, 'history.json');
const presetsFile = path.join(userDataDir, 'presets.json');

const defaultSettings = {
  language: 'zh',
  theme: 'system',
  volume: 0.8,
  closeToTray: true,
  minimizeToTray: false,
  desktopLyrics: false,
  outputDeviceId: '',
  playbackMode: 'list',
  autoCheckUpdate: true,
  alwaysOnTop: false
};

async function ensureFiles() {
  await fsp.mkdir(userDataDir, { recursive: true });
  for (const file of [settingsFile, favoritesFile, historyFile, presetsFile]) {
    try {
      await fsp.access(file);
    } catch {
      await fsp.writeFile(file, '[]', 'utf8');
    }
  }
  const raw = await fsp.readFile(settingsFile, 'utf8');
  let obj;
  try {
    obj = JSON.parse(raw);
  } catch {
    obj = {};
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    obj = {};
  }
  await fsp.writeFile(settingsFile, JSON.stringify({ ...defaultSettings, ...obj }, null, 2), 'utf8');
}

async function readJSON(file, fallback) {
  try {
    const raw = await fsp.readFile(file, 'utf8');
    const value = JSON.parse(raw);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

async function writeJSON(file, value) {
  await fsp.writeFile(file, JSON.stringify(value, null, 2), 'utf8');
}

function isAudioFile(filePath) {
  return AUDIO_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

async function scanFolder(folderPath, out = [], seen = new Set()) {
  let entries;
  try {
    entries = await fsp.readdir(folderPath, { withFileTypes: true });
  } catch {
    return out;
  }
  const real = await fsp.realpath(folderPath).catch(() => folderPath);
  if (seen.has(real)) return out;
  seen.add(real);

  for (const entry of entries) {
    const full = path.join(folderPath, entry.name);
    if (entry.isDirectory()) {
      await scanFolder(full, out, seen);
    } else if (entry.isFile() && isAudioFile(full)) {
      out.push(full);
    }
  }
  return out;
}

async function readMetadata(filePath) {
  if (!readMetadata.parseFile) {
    const musicMetadata = await import('music-metadata');
    readMetadata.parseFile = musicMetadata.parseFile;
  }
  try {
    const meta = await readMetadata.parseFile(filePath, { duration: true });
    const common = meta.common || {};
    let cover = '';
    const picture = common.picture && common.picture[0];
    if (picture && picture.data) {
      const mime = picture.format || 'image/jpeg';
      cover = `data:${mime};base64,${Buffer.from(picture.data).toString('base64')}`;
    }
    return {
      path: filePath,
      title: common.title || path.basename(filePath, path.extname(filePath)),
      artist: common.artist || common.albumartist || '',
      album: common.album || '',
      duration: Number.isFinite(meta.format?.duration) ? meta.format.duration : 0,
      cover,
      sampleRate: meta.format?.sampleRate || 0,
      bitrate: meta.format?.bitrate || 0,
      channels: meta.format?.numberOfChannels || 0,
      bitdepth: meta.format?.bitsPerSample || 0,
      codec: meta.format?.codec || ''
    };
  } catch (error) {
    return {
      path: filePath,
      title: path.basename(filePath, path.extname(filePath)),
      artist: '',
      album: '',
      duration: 0,
      cover: '',
      sampleRate: 0,
      bitrate: 0,
      channels: 0,
      bitdepth: 0,
      codec: ''
    };
  }
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 840,
    minWidth: 1020,
    minHeight: 680,
    title: 'RlonDSP',
    show: false,
    frame: false,
    /* 窗口四角做成圆角：无边框窗口在 Windows 上不会自动圆角，
       所以把窗口底做成“透明的”，由界面自己用圆角把整块内容裁出来。
       底色的 alpha 必须是 0，否则圆角外面会露出这块底色。 */
    transparent: true,
    backgroundColor: '#00000000',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
  mainWindow.once('ready-to-show', () => mainWindow.show());

  // 始终置顶：恢复用户上次的选择（默认关闭）。
  // 用的是 Electron 原生窗口层级能力，普通模式与迷你模式是同一个窗口，
  // 因此这份状态天然共享，不会因为切换尺寸而丢失。
  if (getSettingsSync().alwaysOnTop) mainWindow.setAlwaysOnTop(true);
  // 以真实窗口状态为准回报给界面，避免「开关显示开启、实际没置顶」
  mainWindow.on('always-on-top-changed', (_event, value) => {
    mainWindow?.webContents.send('window:always-on-top-changed', !!value);
  });

  mainWindow.on('maximize', () => mainWindow?.webContents.send('window:maximized', true));
  mainWindow.on('unmaximize', () => mainWindow?.webContents.send('window:maximized', false));
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('window:mini-state', miniMode);
    mainWindow?.webContents.send('window:maximized', !!mainWindow?.isMaximized());
  });

  mainWindow.on('close', (event) => {
    const settings = getSettingsSync();
    if (!isQuitting && settings.closeToTray) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('minimize', (event) => {
    const settings = getSettingsSync();
    if (settings.minimizeToTray && !isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

let settingsCache = null;
function getSettingsSync() {
  if (settingsCache) return settingsCache;
  try {
    settingsCache = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
  } catch {
    settingsCache = { ...defaultSettings };
  }
  return settingsCache;
}

function updateSettingsCache(partial) {
  settingsCache = { ...getSettingsSync(), ...partial };
}

function trayIcon() {
  const iconPath = path.join(__dirname, 'assets', 'tray.png');
  let image = nativeImage.createFromPath(iconPath);
  if (image.isEmpty()) {
    image = nativeImage.createEmpty();
  }
  if (process.platform === 'win32') {
    image = image.resize({ width: 16, height: 16 });
  }
  return image;
}

function createTray() {
  tray = new Tray(trayIcon());
  tray.setToolTip('RlonDSP');
  const menu = Menu.buildFromTemplate([
    { label: '显示主界面', click: () => showMainWindow() },
    { type: 'separator' },
    { label: '播放 / 暂停', click: () => mainWindow?.webContents.send('shortcut:playpause') },
    { label: '上一曲', click: () => mainWindow?.webContents.send('shortcut:previous') },
    { label: '下一曲', click: () => mainWindow?.webContents.send('shortcut:next') },
    { type: 'separator' },
    { label: '退出', click: () => { isQuitting = true; app.quit(); } }
  ]);
  tray.setContextMenu(menu);
  tray.on('click', () => showMainWindow());
  tray.on('double-click', () => showMainWindow());
}

function createApplicationMenu() {
  const template = [
    {
      label: 'Help',
      submenu: [
        {
          label: 'About RlonDSP',
          click: () => mainWindow?.webContents.send('show-about')
        }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function showMainWindow() {
  if (!mainWindow) {
    createMainWindow();
    return;
  }
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function createLyricsWindow() {
  if (lyricsWindow) return;
  const display = screen.getPrimaryDisplay();
  const { width } = display.workAreaSize;
  const { height } = display.workArea;
  lyricsWindow = new BrowserWindow({
    width: 900,
    height: 190,
    x: Math.round((width - 900) / 2),
    y: Math.round(height - 210),
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, 'lyrics-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false
    }
  });
  lyricsWindow.setAlwaysOnTop(true, 'screen-saver');
  lyricsWindow.loadFile(path.join(__dirname, 'src', 'lyrics.html'));
  lyricsWindow.on('closed', () => {
    lyricsWindow = null;
  });
}

function registerShortcuts() {
  const commands = {
    MediaPlayPause: 'shortcut:playpause',
    MediaNextTrack: 'shortcut:next',
    MediaPreviousTrack: 'shortcut:previous',
    'Ctrl+Alt+P': 'shortcut:playpause',
    'Ctrl+Alt+Right': 'shortcut:next',
    'Ctrl+Alt+Left': 'shortcut:previous'
  };
  for (const [accelerator, channel] of Object.entries(commands)) {
    globalShortcut.register(accelerator, () => {
      mainWindow?.webContents.send(channel);
    });
  }
}

app.whenReady().then(async () => {
  await ensureFiles();
  const savedSettings = await readJSON(settingsFile, defaultSettings);
  if (savedSettings.theme) nativeTheme.themeSource = savedSettings.theme;
  createMainWindow();
  createTray();
  createApplicationMenu();
  registerShortcuts();

  app.on('activate', () => showMainWindow());
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

ipcMain.handle('dialog:openFiles', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择本地音乐',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: '音频文件', extensions: ['mp3', 'flac', 'wav', 'ogg', 'm4a', 'aac', 'opus', 'wma', 'aiff', 'ape'] },
      { name: '所有文件', extensions: ['*'] }
    ]
  });
  return result.canceled ? [] : result.filePaths;
});

ipcMain.handle('dialog:openFolder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择本地音乐文件夹',
    properties: ['openDirectory']
  });
  return result.canceled ? '' : result.filePaths[0] || '';
});

ipcMain.handle('dialog:openIRFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择 IR 脉冲响应文件',
    properties: ['openFile'],
    filters: [
      { name: 'IR 音频文件', extensions: ['wav', 'wave', 'aif', 'aiff'] }
    ]
  });
  return result.canceled ? '' : result.filePaths[0] || '';
});

ipcMain.handle('fs:scanFolder', async (_event, folderPath) => {
  if (!folderPath) return [];
  const files = await scanFolder(folderPath);
  return files;
});

ipcMain.handle('meta:read', async (_event, filePath) => readMetadata(filePath));

/* ============================================================================
 * 版本更新
 * --------------------------------------------------------------------------
 * 正式更新源 = 项目在 GitHub 上的 Release（不使用 main 分支的提交）。
 * 所有网络与文件操作都只发生在主进程：
 *   - 渲染进程只能通过 preload 暴露的几个方法调用，拿不到任意 URL、拿不到任何 Token；
 *   - 只允许下载「本次检查返回的那个附件」，且必须落在 userData/updates 目录内；
 *   - 下载完成后做校验：官方 Release 若带 SHA-256 校验文件就比对，没有则计算并如实显示；
 *   - 先下载 → 再校验 → 最后才交给安装程序，绝不先删当前版本再下载。
 * 整个流程与音频系统无关：不改 DSP 图谱、不改音量、不改播放状态、不改预设。
 * ========================================================================== */
const UPDATE_DIR = path.join(userDataDir, 'updates');
let updateSession = { release: null, filePath: '', sha256: '', aborted: false };

/** setup.cmd 会把程序装到 %LOCALAPPDATA%\RlonDSP；不在这里就是便携版 */
function appIsInstalled() {
  const exe = String(app.getPath('exe') || '').toLowerCase();
  const local = String(process.env.LOCALAPPDATA || '').toLowerCase();
  return !!local && exe.startsWith(path.join(local, 'RlonDSP').toLowerCase());
}

function updateMode() {
  return appIsInstalled() ? 'installed' : 'portable';
}

async function fetchUpdateJson(url) {
  const res = await net.fetch(url, {
    headers: { 'User-Agent': 'RlonDSP-Updater', Accept: 'application/vnd.github+json' }
  });
  if (res.status === 404) {
    const error = new Error('release not found');
    error.code = 'notfound';
    throw error;
  }
  if (!res.ok) {
    const error = new Error('http ' + res.status);
    error.code = 'http';
    throw error;
  }
  return res.json();
}

ipcMain.handle('update:info', async () => ({
  version: app.getVersion(),
  mode: updateMode(),
  repo: updateCore.UPDATE_REPO,
  platform: process.platform,
  arch: process.arch
}));

ipcMain.handle('update:check', async () => {
  const currentVersion = app.getVersion();
  try {
    const json = await fetchUpdateJson(updateCore.RELEASES_API);
    const release = updateCore.parseRelease(json, process.platform, process.arch);
    if (!release) return { ok: false, error: 'parse', currentVersion, mode: updateMode() };

    // 有校验文件就顺手取下来，拿到本次更新包的官方 SHA-256
    let assetSha256 = '';
    if (release.checksumAsset && release.checksumAsset.url && release.asset) {
      try {
        const res = await net.fetch(release.checksumAsset.url, { headers: { 'User-Agent': 'RlonDSP-Updater' } });
        if (res.ok) {
          assetSha256 = updateCore.parseChecksum(await res.text(), release.asset.name) || '';
        }
      } catch (error) {
        console.warn('[Updater] 校验文件获取失败', error && error.message);
      }
    }

    updateSession = { release, filePath: '', sha256: '', aborted: false };
    return {
      ok: true,
      currentVersion,
      mode: updateMode(),
      hasUpdate: updateCore.isNewer(release.version, currentVersion),
      latestVersion: release.version,
      notes: updateCore.sanitizeNotes(release.notes),
      publishedAt: release.publishedAt,
      releaseUrl: release.releaseUrl,
      asset: release.asset,
      assetSha256
    };
  } catch (error) {
    console.error('[Updater] 检查更新失败', error && error.message);
    return { ok: false, error: (error && error.code) || 'network', currentVersion, mode: updateMode() };
  }
});

ipcMain.handle('update:download', async (event) => {
  const release = updateSession.release;
  if (!release || !release.asset || !release.asset.url) return { ok: false, error: 'no-release' };
  updateSession.aborted = false;
  const fileName = path.basename(release.asset.name || 'RlonDSP-update.bin');
  const target = path.join(UPDATE_DIR, fileName);
  try {
    await fsp.mkdir(UPDATE_DIR, { recursive: true });
    const res = await net.fetch(release.asset.url, { headers: { 'User-Agent': 'RlonDSP-Updater' } });
    if (!res.ok) return { ok: false, error: 'http' };
    const total = Number(res.headers.get('content-length')) || release.asset.size || 0;
    const hash = crypto.createHash('sha256');
    const handle = await fsp.open(target, 'w');
    let received = 0;
    try {
      const reader = res.body.getReader();
      for (;;) {
        const chunk = await reader.read();
        if (chunk.done) break;
        if (updateSession.aborted) {
          await reader.cancel().catch(() => {});
          break;
        }
        const buf = Buffer.from(chunk.value);
        await handle.write(buf);
        hash.update(buf);
        received += buf.length;
        if (event && event.sender && !event.sender.isDestroyed()) {
          event.sender.send('update:progress', { received, total });
        }
      }
    } finally {
      await handle.close();
    }
    if (updateSession.aborted) {
      await fsp.rm(target, { force: true });
      return { ok: false, error: 'cancelled' };
    }
    const sha256 = hash.digest('hex');
    updateSession.filePath = target;
    updateSession.sha256 = sha256;
    return { ok: true, sha256, size: received, path: target, verified: 'computed' };
  } catch (error) {
    console.error('[Updater] 下载更新包失败', error && error.message);
    await fsp.rm(target, { force: true }).catch(() => {});
    updateSession.filePath = '';
    return { ok: false, error: 'download' };
  }
});

ipcMain.handle('update:cancel', async () => {
  updateSession.aborted = true;
  return { ok: true };
});

ipcMain.handle('update:install', async () => {
  const file = updateSession.filePath;
  if (!file) return { ok: false, error: 'no-file' };
  // 只能安装「刚下载并校验过」的那一个文件，且必须落在 updates 目录内
  const resolved = path.resolve(file);
  const allowedDir = path.resolve(UPDATE_DIR) + path.sep;
  if (!resolved.startsWith(allowedDir)) return { ok: false, error: 'bad-path' };
  if (!fs.existsSync(resolved)) return { ok: false, error: 'missing' };
  if (!/\.exe$/i.test(resolved)) return { ok: false, error: 'bad-type' };
  if (updateMode() !== 'installed') return { ok: false, error: 'portable' };
  try {
    // 当前版本先保持可运行：安装程序自己会把新版本装好并启动，
    // 我们只是退出，绝不主动删除或覆盖任何文件。
    const child = spawn(resolved, [], { detached: true, stdio: 'ignore', cwd: path.dirname(resolved) });
    child.unref();
    isQuitting = true;
    setTimeout(() => app.quit(), 900);
    return { ok: true };
  } catch (error) {
    console.error('[Updater] 启动安装程序失败', error && error.message);
    return { ok: false, error: 'launch' };
  }
});

ipcMain.handle('update:open-release', async () => {
  const url = updateCore.RELEASES_PAGE;
  await shell.openExternal(url);
  return { ok: true, url };
});

ipcMain.handle('settings:get', async () => readJSON(settingsFile, defaultSettings));
ipcMain.handle('settings:set', async (_event, partial) => {
  const current = await readJSON(settingsFile, defaultSettings);
  const next = { ...current, ...partial };
  updateSettingsCache(next);
  await writeJSON(settingsFile, next);
  if (typeof next.theme === 'string') {
    nativeTheme.themeSource = next.theme;
  }
  return next;
});

ipcMain.handle('favorites:get', async () => readJSON(favoritesFile, []));
ipcMain.handle('favorites:set', async (_event, favorites) => {
  await writeJSON(favoritesFile, Array.isArray(favorites) ? favorites : []);
  return favorites;
});

ipcMain.handle('history:get', async () => readJSON(historyFile, []));
ipcMain.handle('history:add', async (_event, item) => {
  const history = await readJSON(historyFile, []);
  const filtered = history.filter((entry) => entry.path !== item.path);
  const next = [{ ...item, time: Date.now() }, ...filtered].slice(0, 200);
  await writeJSON(historyFile, next);
  return next;
});

ipcMain.handle('presets:list', async () => readJSON(presetsFile, []));
ipcMain.handle('presets:save', async (_event, preset) => {
  const presets = await readJSON(presetsFile, []);
  const idx = presets.findIndex((item) => item.id === preset.id);
  if (idx >= 0) presets[idx] = preset;
  else presets.push(preset);
  await writeJSON(presetsFile, presets);
  return presets;
});
ipcMain.handle('presets:delete', async (_event, id) => {
  const presets = await readJSON(presetsFile, []);
  const next = presets.filter((item) => item.id !== id);
  await writeJSON(presetsFile, next);
  return next;
});

ipcMain.handle('presets:export', async (_event, preset) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: '导出音效预设',
    defaultPath: `${preset.name || 'preset'}.json`,
    filters: [{ name: 'JSON 文件', extensions: ['json'] }]
  });
  if (result.canceled || !result.filePath) return false;
  await writeJSON(result.filePath, preset);
  return true;
});

ipcMain.handle('presets:import', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '导入音效预设',
    properties: ['openFile'],
    filters: [{ name: 'JSON 文件', extensions: ['json'] }]
  });
  if (result.canceled || !result.filePaths[0]) return null;
  try {
    return await readJSON(result.filePaths[0], null);
  } catch {
    return null;
  }
});

ipcMain.handle('lyrics:read', async (_event, audioPath) => {
  const candidates = [
    audioPath.replace(/\.[^.]+$/, '.lrc'),
    audioPath.replace(/\.[^.]+$/, '.LRC')
  ];
  for (const candidate of candidates) {
    try {
      return await fsp.readFile(candidate, 'utf8');
    } catch {
      // keep looking
    }
  }
  return '';
});

ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:maximize', () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.on('window:close', () => mainWindow?.close());

/* ============================================================================
 * 始终置顶（Always on Top）
 * --------------------------------------------------------------------------
 * 只用 Electron 的原生窗口能力：BrowserWindow.setAlwaysOnTop / isAlwaysOnTop。
 * 渲染进程不接触 BrowserWindow：只能通过下面两个固定通道请求读/写，
 * 传进来的值也强制转成布尔，不接受任何窗口对象或 Electron API。
 * 不使用轮询、focus()、moveTop() 或外部脚本抢占窗口层级。
 * ========================================================================== */
ipcMain.handle('window:get-always-on-top', () => !!mainWindow && mainWindow.isAlwaysOnTop());
ipcMain.handle('window:set-always-on-top', (_event, value) => {
  if (!mainWindow) return false;
  const wanted = !!value;
  mainWindow.setAlwaysOnTop(wanted);
  // 少数情况下系统会把首次设置吞掉（窗口尚未完成显示/层级初始化），
  // 这里在极短时间内核对一次真实状态并补齐；只核对，不做任何轮询。
  if (mainWindow.isAlwaysOnTop() !== wanted) mainWindow.setAlwaysOnTop(wanted);
  return mainWindow.isAlwaysOnTop();
});

let miniMode = false;
let miniPrevBounds = null;
ipcMain.on('window:toggle-mini', () => {
  if (!mainWindow) return;
  if (!miniMode) {
    miniPrevBounds = mainWindow.getBounds();
    miniMode = true;
    mainWindow.setMinimumSize(320, 64);
    mainWindow.setResizable(false);
    const b = mainWindow.getBounds();
    mainWindow.setBounds({
      x: b.x + Math.round((b.width - 360) / 2),
      y: b.y,
      width: 360,
      height: 64
    });
    mainWindow.webContents.send('window:mini-state', true);
  } else {
    miniMode = false;
    mainWindow.setResizable(true);
    mainWindow.setMinimumSize(1020, 680);
    if (miniPrevBounds) mainWindow.setBounds(miniPrevBounds);
    mainWindow.webContents.send('window:mini-state', false);
  }
});

ipcMain.on('lyrics:show', () => createLyricsWindow());
ipcMain.on('lyrics:hide', () => {
  if (lyricsWindow) lyricsWindow.close();
});
ipcMain.on('lyrics:update', (_event, payload) => {
  lyricsWindow?.webContents.send('lyrics:update', payload);
});

ipcMain.on('native-theme:set', (_event, value) => {
  if (['system', 'light', 'dark'].includes(value)) {
    nativeTheme.themeSource = value;
  }
});

ipcMain.handle('app:open-license', async () => {
  const licensePath = path.join(__dirname, 'LICENSE');
  await shell.openPath(licensePath);
  return true;
});
