const currentLine = document.getElementById('currentLine');
const nextLine = document.getElementById('nextLine');

window.lyricsApi.onUpdate((payload) => {
  if (!payload) {
    currentLine.textContent = 'RlonDSP';
    nextLine.textContent = '';
    return;
  }
  currentLine.textContent = payload.current || 'RlonDSP';
  nextLine.textContent = payload.next || '';
});
