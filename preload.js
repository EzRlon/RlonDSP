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
  getHistory: () => ipcRenderer.invoke('history:get'),
  addHistory: (item) => ipcRenderer.invoke('history:add', item),
  listPresets: () => ipcRenderer.invoke('presets:list'),
  savePreset: (preset) => ipcRenderer.invoke('presets:save', preset),
  deletePreset: (id) => ipcRenderer.invoke('presets:delete', id),
  exportPreset: (preset) => ipcRenderer.invoke('presets:export', preset),
  importPreset: () => ipcRenderer.invoke('presets:import'),
  readLyrics: (audioPath) => ipcRenderer.invoke('lyrics:read', audioPath),
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
