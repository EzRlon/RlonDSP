const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lyricsApi', {
  onUpdate: (callback) => {
    ipcRenderer.on('lyrics:update', (_event, payload) => callback(payload));
  }
});
