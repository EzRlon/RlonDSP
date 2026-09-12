/*
 * RlonDSP
 * Copyright © 2026 RlonDSP. All rights reserved.
 * Based on Echomusic open-source project, modified and extended for RlonDSP.
 */
const currentLine = document.getElementById('currentLine');
const nextLine = document.getElementById('nextLine');

window.lyricsApi.onUpdate((payload) => {
  if (!payload) {
    currentLine.textContent = 'RlonDSP';
    nextLine.textContent = '';
    return;
  }
  if (payload.lang === 'zh' || payload.lang === 'en') {
    document.title = payload.lang === 'zh' ? '桌面歌词' : 'Desktop Lyrics';
  }
  if (payload.current !== undefined) currentLine.textContent = payload.current || 'RlonDSP';
  if (payload.next !== undefined) nextLine.textContent = payload.next || '';
});
