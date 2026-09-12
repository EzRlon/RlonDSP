/*
 * RlonDSP
 * Copyright © 2026 RlonDSP. All rights reserved.
 * Based on Echomusic open-source project, modified and extended for RlonDSP.
 *
 * 最小自动测试（冒烟测试）——只检查最关键的四件事是否还正常：
 *   1. 播放 / 暂停
 *   2. 切歌（下一曲）
 *   3. 音量调节
 *   4. 主题切换（深色 / 浅色）
 *
 * 运行方式（在项目根目录执行）：
 *   node --test tools/tests/
 *
 * 说明：
 * - 不使用任何第三方库，只用系统自带的测试工具。
 * - 测试会自己开一个"临时小号"软件实例（独立的临时数据文件夹 + 独立端口），
 *   跑完自动关掉并删除临时数据，不会动你正在使用的软件、歌单、历史、设置。
 * - 如果连不上应用，测试会直接报失败并给出提示，不会假装通过。
 */
const test = require('node:test');
const assert = require('node:assert');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const EXE = path.join(ROOT, 'release', 'RlonDSP-portable', 'RlonDSP.exe');
const PORT = 9234;
const ENDPOINT = `http://127.0.0.1:${PORT}/json`;
const WORK = path.join(ROOT, 'build', 'test-run');

let child = null;
let wsUrl = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function findEndpoint() {
  try {
    const res = await fetch(ENDPOINT);
    const list = await res.json();
    const page = list.find((item) => item.type === 'page');
    return page ? page.webSocketDebuggerUrl : null;
  } catch {
    return null;
  }
}

async function startApp() {
  const existing = await findEndpoint();
  if (existing) return existing;
  if (!fs.existsSync(EXE)) return null;
  const dataDir = path.join(WORK, 'userdata');
  fs.mkdirSync(dataDir, { recursive: true });
  child = spawn(
    EXE,
    [`--remote-debugging-port=${PORT}`, '--remote-allow-origins=*', `--user-data-dir=${dataDir}`],
    { cwd: path.dirname(EXE), stdio: 'ignore' }
  );
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    const url = await findEndpoint();
    if (url) return url;
  }
  return null;
}

function evaluate(expression) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    const timer = setTimeout(() => {
      try { ws.close(); } catch {}
      reject(new Error('页面执行超时'));
    }, 15000);
    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression, awaitPromise: true, returnByValue: true, userGesture: true }
      }));
    });
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id !== 1) return;
      clearTimeout(timer);
      try { ws.close(); } catch {}
      if (msg.result && msg.result.exceptionDetails) {
        reject(new Error(msg.result.exceptionDetails.text || '页面执行出错'));
      } else {
        resolve(msg.result && msg.result.result ? msg.result.result.value : undefined);
      }
    });
    ws.addEventListener('error', () => {
      clearTimeout(timer);
      reject(new Error('无法连接应用调试端口'));
    });
  });
}

function writeWav(file, freq, seconds, sampleRate = 44100) {
  const n = Math.floor(sampleRate * seconds);
  const data = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) {
    const v = Math.sin((2 * Math.PI * freq * i) / sampleRate) * 0.35;
    data.writeInt16LE(Math.round(v * 32767), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([header, data]));
}

let wavA = '';
let wavB = '';

test.before(async () => {
  wsUrl = await startApp();
  if (!wsUrl) {
    throw new Error('无法启动或连接应用。请确认 release\\RlonDSP-portable\\RlonDSP.exe 存在，或先关闭正在运行的软件再重试。');
  }
  fs.mkdirSync(WORK, { recursive: true });
  wavA = path.join(WORK, 'test-a.wav');
  wavB = path.join(WORK, 'test-b.wav');
  writeWav(wavA, 440, 10);
  writeWav(wavB, 660, 10);
  await evaluate(`addPaths(${JSON.stringify([wavA, wavB])})`);
  for (let i = 0; i < 40; i++) {
    await sleep(300);
    const n = await evaluate('state.tracks.length');
    if (typeof n === 'number' && n >= 2) break;
  }
  const total = await evaluate('state.tracks.length');
  assert.ok(total >= 2, `测试音频应至少导入 2 首，实际 ${total}`);
  await evaluate('ensureAudioGraph().then(function () { audioElement.muted = true; })');
});

test.after(async () => {
  try {
    if (child && child.pid && process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(child.pid), '/t', '/f']);
    } else if (child) {
      child.kill();
    }
  } catch {}
  await sleep(800);
  try { fs.rmSync(WORK, { recursive: true, force: true }); } catch {}
});

test('主题切换：深色 → 浅色', async () => {
  await evaluate("applyTheme('dark')");
  assert.strictEqual(await evaluate('document.documentElement.dataset.theme'), 'dark');
  await evaluate("applyTheme('light')");
  assert.strictEqual(await evaluate('document.documentElement.dataset.theme'), 'light');
});

test('音量调节：设为 42%', async () => {
  const original = await evaluate('state.volume');
  await evaluate('setVolume(0.42)');
  const value = await evaluate('state.volume');
  const shown = await evaluate("document.getElementById('volume').value");
  assert.ok(Math.abs(value - 0.42) < 0.001, `内部音量应为 0.42，实际 ${value}`);
  assert.strictEqual(shown, '42');
  await evaluate(`setVolume(${Number(original)})`);
});

test('播放 / 暂停', async () => {
  await evaluate('setCurrentIndex(0)');
  await evaluate('togglePlay()');
  await sleep(1500);
  assert.strictEqual(await evaluate('state.isPlaying'), true, '点击播放后应处于播放状态');
  await evaluate('togglePlay()');
  await sleep(900);
  assert.strictEqual(await evaluate('state.isPlaying'), false, '再次点击后应处于暂停状态');
});

test('切歌：下一曲应换到另一首', async () => {
  if (await evaluate('state.isPlaying')) {
    await evaluate('togglePlay()');
    await sleep(500);
  }
  const before = await evaluate('state.currentIndex');
  await evaluate('playNext(false)');
  await sleep(1200);
  const after = await evaluate('state.currentIndex');
  assert.notStrictEqual(after, before, `切歌后当前曲目应改变，实际仍为 ${after}`);
});
