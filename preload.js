/*
 * RlonDSP
 * Copyright © 2026 RlonDSP. All rights reserved.
 * Based on Echomusic open-source project, modified and extended for RlonDSP.
 */
const { contextBridge, ipcRenderer, webUtils } = require('electron');
const { pathToFileURL } = require('node:url');

contextBridge.exposeInMainWorld('rlonDsp', {
  openFiles: () => ipcRenderer.invoke('dialog:openFiles'),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  openIRFile: () => ipcRenderer.invoke('dialog:openIRFile'),
  scanFolder: (folderPath) => ipcRenderer.invoke('fs:scanFolder', folderPath),
  readMetadata: (filePath) => ipcRenderer.invoke('meta:read', filePath),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (partial) => ipcRenderer.invoke('settings:set', partial),
  // 版本更新（网络与文件操作全部在主进程完成，这里只做安全转发）
  updateInfo: () => ipcRenderer.invoke('update:info'),
  checkUpdate: () => ipcRenderer.invoke('update:check'),
  downloadUpdate: () => ipcRenderer.invoke('update:download'),
  cancelUpdate: () => ipcRenderer.invoke('update:cancel'),
  installUpdate: () => ipcRenderer.invoke('update:install'),
  openReleasePage: () => ipcRenderer.invoke('update:open-release'),
  onUpdateProgress: (callback) => ipcRenderer.on('update:progress', (_event, value) => callback(value)),
  getFavorites: () => ipcRenderer.invoke('favorites:get'),
  setFavorites: (favorites) => ipcRenderer.invoke('favorites:set', favorites),
  queuesGet: () => ipcRenderer.invoke('queues:get'),
  queuesSet: (snapshot) => ipcRenderer.invoke('queues:set', snapshot),
  getHistory: () => ipcRenderer.invoke('history:get'),
  addHistory: (item) => ipcRenderer.invoke('history:add', item),
  listPresets: () => ipcRenderer.invoke('presets:list'),
  savePreset: (preset) => ipcRenderer.invoke('presets:save', preset),
  deletePreset: (id) => ipcRenderer.invoke('presets:delete', id),
  exportPreset: (preset) => ipcRenderer.invoke('presets:export', preset),
  importPreset: () => ipcRenderer.invoke('presets:import'),
  readLyrics: (audioPath) => ipcRenderer.invoke('lyrics:read', audioPath),
  onlineSources: () => ipcRenderer.invoke('online:sources:list'),
  onlineSaveSource: (source) => ipcRenderer.invoke('online:sources:save', source),
  onlineDeleteSource: (id) => ipcRenderer.invoke('online:sources:delete', { id }),
  onlineSetSourceEnabled: (id, enabled) => ipcRenderer.invoke('online:sources:enable', { id, enabled }),
  onlineReorderSources: (ids) => ipcRenderer.invoke('online:sources:reorder', { ids }),
  onlineTestSource: (source, testQuery) => ipcRenderer.invoke('online:sources:test', { source, testQuery }),
  onlineAuthState: (sourceId) => ipcRenderer.invoke('online:auth:state', { sourceId }),
  onlineLogin: (sourceId, credentials) => ipcRenderer.invoke('online:auth:login', { sourceId, credentials }),
  onlineLogout: (sourceId) => ipcRenderer.invoke('online:auth:logout', { sourceId }),
  onlineSpotifyLogin: (sourceId) => ipcRenderer.invoke('online:auth:spotify:login', { sourceId }),
  onlineOpenExternal: (url) => ipcRenderer.invoke('online:open-external', { url: String(url || '') }),
  onlineSearch: (sourceId, payload) => ipcRenderer.invoke('online:search', { sourceId, ...payload }),
  onlineBrowse: (sourceId, payload) => ipcRenderer.invoke('online:browse', { sourceId, ...payload }),
  onlineDiscovery: (sourceId, payload) => ipcRenderer.invoke('online:discovery', { sourceId, ...(payload || {}) }),
  onlineDetail: (sourceId, payload) => ipcRenderer.invoke('online:detail', { sourceId, ...payload }),
  onlineResolve: (sourceId, payload) => ipcRenderer.invoke('online:resolve', { sourceId, ...payload }),
  // 在线歌曲下载：只暴露「开始 / 取消 / 打开所在目录 / 显示文件」，落盘路径与流都在主进程
  onlineDownloadStart: (payload) => ipcRenderer.invoke('online:download:start', payload),
  onlineDownloadCancel: (taskId) => ipcRenderer.invoke('online:download:cancel', { id: String(taskId || '') }),
  onlineDownloadReveal: (filePath) => ipcRenderer.invoke('online:download:reveal', { filePath: String(filePath || '') }),
  onlineDownloadFolder: () => ipcRenderer.invoke('online:download:folder'),
  onOnlineDownloadProgress: (callback) => ipcRenderer.on('online:download:progress', (_event, value) => callback(value)),
  getPathForFile: (file) => webUtils.getPathForFile(file),
  toFileUrl: (filePath) => pathToFileURL(filePath).href,
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  toggleMini: () => ipcRenderer.send('window:toggle-mini'),
  // 始终置顶：只暴露固定通道，渲染进程拿不到 BrowserWindow
  getAlwaysOnTop: () => ipcRenderer.invoke('window:get-always-on-top'),
  setAlwaysOnTop: (value) => ipcRenderer.invoke('window:set-always-on-top', !!value),
  onAlwaysOnTopChanged: (callback) => ipcRenderer.on('window:always-on-top-changed', (_event, value) => callback(!!value)),
  onMiniState: (callback) => ipcRenderer.on('window:mini-state', (_event, value) => callback(value)),
  onMaximized: (callback) => ipcRenderer.on('window:maximized', (_event, value) => callback(value)),
  onWindowAnim: (callback) => ipcRenderer.on('window:anim', (_event, kind) => callback(kind)),
  showLyrics: () => ipcRenderer.send('lyrics:show'),
  hideLyrics: () => ipcRenderer.send('lyrics:hide'),
  updateLyrics: (payload) => ipcRenderer.send('lyrics:update', payload),
  openLicense: () => ipcRenderer.invoke('app:open-license'),
  onShortcut: (callback) => {
    ipcRenderer.on('shortcut:playpause', () => callback('playpause'));
    ipcRenderer.on('shortcut:next', () => callback('next'));
    ipcRenderer.on('shortcut:previous', () => callback('previous'));
  },
  onShowAbout: (callback) => ipcRenderer.on('show-about', () => callback())
});
