const { contextBridge, ipcRenderer, webUtils } = require('electron');
const { pathToFileURL } = require('node:url');

contextBridge.exposeInMainWorld('rlonDsp', {
  openFiles: () => ipcRenderer.invoke('dialog:openFiles'),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  scanFolder: (folderPath) => ipcRenderer.invoke('fs:scanFolder', folderPath),
  readMetadata: (filePath) => ipcRenderer.invoke('meta:read', filePath),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (partial) => ipcRenderer.invoke('settings:set', partial),
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
  showLyrics: () => ipcRenderer.send('lyrics:show'),
  hideLyrics: () => ipcRenderer.send('lyrics:hide'),
  updateLyrics: (payload) => ipcRenderer.send('lyrics:update', payload),
  onShortcut: (callback) => {
    ipcRenderer.on('shortcut:playpause', () => callback('playpause'));
    ipcRenderer.on('shortcut:next', () => callback('next'));
    ipcRenderer.on('shortcut:previous', () => callback('previous'));
  }
});
