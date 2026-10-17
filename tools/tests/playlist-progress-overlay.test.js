/*
 * RlonDSP
 * Copyright © 2026 RlonDSP. All rights reserved.
 * Based on Echomusic open-source project, modified and extended for RlonDSP.
 *
 * 播放列表展开/收起 + 播放进度条浮层 专项测试
 * ---------------------------------------------------------------------------
 * 静态：入口、交互实现、CSS 定位与模糊层、i18n 双语文案、在线音乐卡片已移除。
 * 实机：点击展开、移出自动收起、拖动 Seek 不收起、上方内容零重排、展开后在最顶层。
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HTML = fs.readFileSync(path.join(ROOT, 'src', 'index.html'), 'utf8');
const CSS = fs.readFileSync(path.join(ROOT, 'src', 'styles.css'), 'utf8');
const RENDERER = fs.readFileSync(path.join(ROOT, 'src', 'renderer.js'), 'utf8');

const PORT = 9234;
const EXE = path.join(ROOT, 'release', 'RlonDSP-portable', 'RlonDSP.exe');
const WORK = path.join(ROOT, 'build', 'test-playlist-progress');

test('播放列表：顶部有展开按钮，交互与列宽规则齐备', () => {
  assert.ok(HTML.includes('id="playlistExpandBtn"'), '侧栏顶部有展开按钮');
  // 把手依附在整张播放列表卡片右侧边缘（不是头部、不是独立按钮行）
  assert.ok(/<ul class="track-list lg-content" id="trackList"><\/ul>[\s\S]*?class="playlist-handle[\s\S]*?playlistExpandBtn/.test(HTML), '把手是侧栏卡片的最后一个子元素');
  assert.ok(!/sidebar-head[\s\S]{0,200}playlistExpandBtn/.test(HTML), '把手不再放在播放列表头部');
  assert.ok(/\.playlist-handle\s*\{[^}]*position:\s*absolute/.test(CSS), '把手绝对定位依附卡片边缘');
  assert.ok(/\.playlist-handle\s*\{[^}]*right:\s*0/.test(CSS), '贴在卡片右侧边缘');
  assert.ok(/\.playlist-handle\s*\{[^}]*top:\s*50%/.test(CSS) && /\.playlist-handle\s*\{[^}]*translateY\(-50%\)/.test(CSS), '位于右侧边缘竖直正中');
  assert.ok(RENDERER.includes('function setupPlaylistExpand()'), '有交互实现');
  assert.ok(RENDERER.includes("sidebar.addEventListener('pointerenter'"), '指针进入保持展开');
  assert.ok(RENDERER.includes("sidebar.addEventListener('pointerleave'"), '指针离开准备收起');
  assert.ok(RENDERER.includes('window.setTimeout(') && RENDERER.includes('}, 160);'), '收起带极短消抖');
  assert.ok(RENDERER.includes("shell.classList.toggle('playlist-collapsed'"), '只切换一个 class');
  assert.ok(CSS.includes('.app-shell.playlist-collapsed'), '收起态有独立列宽规则');
  assert.ok(/\.app-shell\.playlist-collapsed\s*\{[^}]*grid-template-columns:\s*16px/.test(CSS), '收起后只剩 16px 把手，主内容补位');
  assert.ok(/\.app-shell\.playlist-collapsed > \.sidebar > \*:not\(\.playlist-handle\)\s*\{[^}]*translateX\(calc\(-1 \* var\(--playlist-w\)\)\)/.test(CSS),
    '收起时内容整幅向左滑出（按播放列表宽度平移，不留残影）');
  assert.ok(/\.app-shell > \.sidebar\s*\{[^}]*padding-right:\s*16px/.test(CSS), '右侧留出把手专属区域，内容不被压住');
});

test('播放列表：在线音乐卡片已整块移除', () => {
  assert.ok(!HTML.includes('onlineMusicBtn'), 'HTML 不再有在线音乐卡片');
  assert.ok(!HTML.includes('online-music-card'), 'HTML 不再有卡片样式类');
  assert.ok(!RENDERER.includes('onlineMusicBtn'), 'renderer 不再引用该入口');
  assert.ok(!CSS.includes('.online-music-card'), 'CSS 不再保留死样式');
  assert.ok(HTML.includes('id="trackList"'), '播放列表本身保留');
});

test('空播放列表与右侧主内容融为一体（无蓝色底），两侧仅靠分割线区分', () => {
  // 侧栏不再铺蓝紫渐变（浅色 / 深色都不铺）
  const lightRule = /\.app-shell > \.sidebar \{[\s\S]{0,300}?background-image: none;/.test(CSS);
  const darkRule = CSS.match(/\[data-theme="dark"\] \.app-shell > \.sidebar \{\s*\/\*[^*]*\*\/\s*background-image: none;?\s*\}/);
  assert.ok(lightRule, '浅色主题下侧栏不铺渐变');
  assert.ok(darkRule, '深色主题下侧栏同样不铺渐变');
  assert.ok(!/\.app-shell > \.sidebar[\s\S]{0,400}?radial-gradient\(900px 320px/.test(CSS), '不再残留任何蓝紫径向渐变');
  // 空列表不再铺更实的内容底 / 不画方框
  assert.ok(/#trackList:empty\s*\{[^}]*background:\s*transparent/.test(CSS), '空列表背景透明');
  assert.ok(/#trackList:empty\s*\{[^}]*border-color:\s*transparent/.test(CSS), '空列表不画边框');
  // 两侧仍以侧栏右侧分割线区分
  assert.ok(/\.app-shell > \.sidebar\s*\{[^}]*border-width:\s*0 1px 0 0/.test(CSS), '保留侧栏右侧 1px 分割线');
});

test('播放进度条：把手基准停靠 + 展开走真实布局（非浮层）', () => {
  assert.ok(HTML.includes('id="playerProgress"') && HTML.includes('id="progressToggleBtn"') && HTML.includes('id="progressPanel"'));
  // 进度条区域在 DOM 上先于播放控制（展开后位于其上方）
  assert.ok(HTML.indexOf('id="playerProgress"') > 0 && HTML.indexOf('id="playerProgress"') < HTML.indexOf('class="transport"'),
    '进度条区域位于播放/暂停控制上方');
  // 原有 id 全部保留：播放/暂停、Seek、时间显示逻辑一行未动
  for (const id of ['progress', 'currentTime', 'totalTime', 'playBtn', 'volume']) {
    assert.ok(HTML.includes(`id="${id}"`), `保留原有元素：${id}`);
  }
  assert.ok(RENDERER.includes("on('progress', 'input', (event) => seekTo(Number(event.target.value) / 1000))"), 'Seek 绑定未变');
  // 展开是真实布局：面板参与布局、底栏随之变高 → 上方功能区自动补位（不再是浮层）
  assert.ok(/\.progress-panel\s*\{[^}]*position:\s*relative/.test(CSS), '进度条面板参与布局，不是浮层');
  assert.ok(/\.progress-panel\s*\{[^}]*max-height:\s*0/.test(CSS), '收起时面板高度归零');
  assert.ok(/\.player-progress\.is-expanded \.progress-panel\s*\{[^}]*max-height:\s*120px/.test(CSS), '展开时在布局里向上撑开');
  assert.ok(/\.player-bar\s*\{[^}]*flex-direction:\s*column/.test(CSS) && /\.player-bar\s*\{[^}]*min-height:\s*82px/.test(CSS),
    '底栏改为可增高的列布局：展开后底栏变高，内容区自动补位');
  assert.ok(/\.player-bar\s*\{[^}]*align-items:\s*stretch/.test(CSS), '底栏子项拉伸到整幅宽度，进度条才按卡片整幅居中');
  // 收起态不再自带旧版的白色玻璃底：那层底只在收起的第一帧被整体画出来，就是「白闪」的来源
  assert.ok(/\.progress-panel\s*\{[^}]*background:\s*transparent/.test(CSS), '收起态不铺白色底（避免收起瞬间闪出白色低栏）');
  assert.ok(/\.progress-panel\s*\{[^}]*box-shadow:\s*none/.test(CSS), '收起态不画阴影');
  assert.ok(/\.progress-panel\s*\{[^}]*backdrop-filter:\s*none/.test(CSS), '收起态不叠第二层毛玻璃（玻璃由底栏提供）');
  assert.ok(/\.progress-panel\s*\{[^}]*border:\s*1px solid transparent/.test(CSS), '边框只改颜色，收起 / 展开几何一致');
  assert.ok(/backdrop-filter: blur\(var\(--lg-control-blur\)\)/.test(fs.readFileSync(path.join(ROOT, 'src', 'glass-components.css'), 'utf8')),
    '毛玻璃令牌仍由玻璃体系统一提供');
  assert.ok(/\.progress-panel::after\s*\{[^}]*backdrop-filter/.test(CSS), '底部有独立模糊保护层');
  assert.ok(/\.progress-panel::after\s*\{[^}]*mask-image/.test(CSS), '模糊层向下渐隐、无硬边');
  // 底部保护层进入收起态时要延迟到动画结束再显示，否则第一帧就会补出一条白色低栏
  assert.ok(/\.progress-panel::after\s*\{[^}]*transition:\s*opacity 0s linear[^}]*\}/.test(CSS),
    '底部保护层在收起瞬间不出现（延迟到收起动画结束）');
  // 把手以「自身最下底边」为基准：bottom:0 + translateY(100%) 让下底边永远贴住基准线
  assert.ok(/\.progress-toggle\s*\{[^}]*position:\s*absolute/.test(CSS), '把手绝对定位但不占布局');
  assert.ok(/\.progress-toggle\s*\{[^}]*bottom:\s*0/.test(CSS) && /\.progress-toggle\s*\{[^}]*transform:\s*translateX\(-50%\)/.test(CSS),
    '把手以最下底边为基准停靠在进度条区下沿（收起时即底栏最外边的上边缘）');
  assert.ok(/\.player-progress\.is-expanded \.progress-panel\s*\{[^}]*padding:\s*10px 14px 24px/.test(CSS),
    '展开时面板下内距留出把手那一行，把手不会压住进度条内容');
  assert.ok(/\.progress-toggle\s*\{[^}]*left:\s*50%/.test(CSS), '把手水平正中');
  // 与播放列表把手统一：同一厚度 / 同一长度 / 同一圆角 / 同一图标尺寸，只是横过来
  assert.ok(/\.playlist-handle\s*\{[^}]*width:\s*16px/.test(CSS) && /\.playlist-handle\s*\{[^}]*height:\s*56px/.test(CSS),
    '播放列表把手基准尺寸 16×56');
  assert.ok(/\.progress-toggle\s*\{[^}]*width:\s*56px/.test(CSS) && /\.progress-toggle\s*\{[^}]*height:\s*16px/.test(CSS),
    '进度把手尺寸与之统一（56×16）');
  assert.ok(/\.progress-toggle\s*\{[^}]*border-radius:\s*8px 8px 0 0/.test(CSS), '圆角与播放列表把手同为 8px');
  assert.ok(/\.progress-toggle-icon\s*\{[^}]*width:\s*13px/.test(CSS) && /\.playlist-handle-icon\s*\{[^}]*width:\s*13px/.test(CSS),
    '图标尺寸统一为 13px');
  assert.ok(/\.playlist-handle\s*\{[^}]*top:\s*50%/.test(CSS) && /\.progress-toggle\s*\{[^}]*left:\s*50%/.test(CSS),
    '两个把手都贴在各自卡片的对应边缘正中');
  assert.ok(CSS.includes('body.mini-mode .progress-toggle { display: none; }'), '迷你模式不显示把手（避免压播放键）');
  assert.ok(/\.progress-toggle\s*\{[^}]*border-radius:\s*8px 8px 0 0/.test(CSS), '把手圆角只在上方两侧（8px，与播放列表把手一致）');
  assert.ok(/\.player-main\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) auto minmax\(0, 1fr\)/.test(CSS), '底栏主行用独立中央格，控制组真正居中');
});

test('播放进度条：交互实现与 i18n 齐备', () => {
  assert.ok(RENDERER.includes('function setupProgressOverlay()'), '有点击/移出交互实现');
  assert.ok(RENDERER.includes('let seeking = false;'), '拖动 Seek 状态');
  assert.ok(RENDERER.includes("slider.addEventListener('pointerdown', beginSeek)"), '按下开始拖动');
  assert.ok(RENDERER.includes("window.addEventListener('pointerup', endSeek)"), '松开结束拖动');
  assert.ok(RENDERER.includes('if (seeking) return;'), '拖动期间不排收起');
  // 移出自动收起的判定区域是整条底栏：展开时进度区会向上长高，
  // 若只盯 #playerProgress，指针停在原处就会被判为「已离开」而秒收。
  assert.ok(RENDERER.includes("bar.addEventListener('pointerleave'"), '移出底栏自动收起');
  // 把手不再有任何白色底/边框/阴影：底栏随专辑变色时不能出现白块（只保留 ^ 图标与可点区域）
  // 必须匹配带优先级的复合选择器（.player-progress > .progress-toggle），否则会被 .lg-button 盖回白底
  const toggleCss = (CSS.match(/^\.player-progress\s*>\s*\.progress-toggle\s*\{([^}]*)\}/m) || [])[1] || '';
  assert.ok(/background:\s*none/.test(toggleCss), '把手无白底');
  assert.ok(/border:\s*0/.test(toggleCss), '把手无边框');
  assert.ok(/box-shadow:\s*none/.test(toggleCss), '把手无阴影（含白色内高光）');
  assert.ok(!/lg-micro-border/.test(toggleCss), '把手不再引用白色描边令牌');
  for (const key of ['playlistExpand', 'playlistCollapse', 'progressExpand', 'progressCollapse']) {
    const hits = RENDERER.split(`${key}:`).length - 1;
    assert.ok(hits >= 2, `${key} 需要中英文两份文案（实际 ${hits}）`);
  }
  assert.ok(RENDERER.includes('data-i18n-title'), '标题文案跟随语言切换');
});

test('音量：滑杆集成在静音按钮上（竖向弹出），音量到零显示为静音', () => {
  // 结构：滑杆挂在静音按钮的弹出层里，底栏不再直接排一条横向滑杆
  assert.ok(/id="volumeWrap"[\s\S]{0,400}id="muteBtn"[\s\S]{0,400}id="volumePopover"[\s\S]{0,300}id="volume"/.test(HTML),
    '音量滑杆挂在静音按钮的弹出层里');
  assert.strictEqual(/<div class="player-right">\s*<input[^>]*id="volume"/.test(HTML), false, '底栏里不再有独立横向滑杆');
  assert.ok(/\.volume-popover\s*\{[^}]*position:\s*absolute/.test(CSS), '弹出层是浮层');
  assert.ok(/\.volume-popover\s*\{[^}]*bottom:\s*calc\(100% \+ 10px\)/.test(CSS), '向上弹出（贴在按钮上方）');
  assert.ok(/\.volume-popover\s*\{[^}]*flex-direction:\s*column/.test(CSS), '竖向排布');
  assert.ok(/\.volume-popover\[hidden\]\s*\{\s*display:\s*none/.test(CSS), '收起时真的不渲染（盖过 display:flex）');
  assert.ok(/\.volume-popover input\[type="range"\]\s*\{[^}]*writing-mode:\s*vertical-lr/.test(CSS), '滑杆是竖向的');
  assert.ok(/\.volume-popover input\[type="range"\]\s*\{[^}]*width:\s*10px[^}]*height:\s*112px/.test(CSS), '竖向滑杆高 > 宽');
  // 交互：按钮开关弹出层；静音态由真实音量推导
  assert.ok(RENDERER.includes('function setupVolumeControl'), '有音量控件交互实现');
  assert.ok(RENDERER.includes('function updateVolumeUi'), '音量 UI 只有一个出口');
  assert.ok(RENDERER.includes('function volumeIsMuted'), '静音态由真实音量推导');
  assert.ok(RENDERER.includes('setMuted(next <= 0.0005)'), '音量到零 → 静音');
  assert.strictEqual(RENDERER.includes('function toggleMute'), false, '旧的「点按钮直接静音」已移除（按钮改为开关滑杆）');
  for (const key of ['volumeAdjust', 'volumeMuted']) {
    const hits = RENDERER.split(`${key}:`).length - 1;
    assert.ok(hits >= 2, `${key} 需要中英文两份文案（实际 ${hits}）`);
  }
});

/* ------------------------------------------------------------------ 实机部分 */

let wsUrl = null;
let child = null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findEndpoint() {
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json`);
    const list = await res.json();
    const page = list.find((item) => item.type === 'page');
    return page ? page.webSocketDebuggerUrl : null;
  } catch {
    return null;
  }
}

/** 需要真实鼠标 / 键盘输入时用这个会话（只能发 Runtime.evaluate 的 evaluate() 不够） */
async function openSession() {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const waiting = new Map();
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    const slot = waiting.get(msg.id);
    if (!slot) return;
    waiting.delete(msg.id);
    slot(msg);
  });
  return new Promise((resolve, reject) => {
    ws.addEventListener('error', () => reject(new Error('无法连接应用调试端口')));
    ws.addEventListener('open', () => resolve({
      send(method, params) {
        return new Promise((res, rej) => {
          const mid = ++id;
          const timer = setTimeout(() => { waiting.delete(mid); rej(new Error(method + ' 超时')); }, 20000);
          waiting.set(mid, (msg) => { clearTimeout(timer); msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result); });
          ws.send(JSON.stringify({ id: mid, method, params: params || {} }));
        });
      },
      close() { try { ws.close(); } catch { /* ignore */ } }
    }));
  });
}

/** 元素在视口里的位置（真实鼠标点击需要绝对坐标） */
async function elementBox(selector) {
  const raw = await evaluate(`(function(){
    var el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return JSON.stringify({ x: 0, y: 0, w: 0, h: 0, cx: 0, cy: 0 });
    var r = el.getBoundingClientRect();
    return JSON.stringify({ x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 });
  })()`);
  return JSON.parse(raw || '{}');
}

function evaluate(expression, timeout = 40000) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    const timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error('页面执行超时')); }, timeout);
    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true, userGesture: true } }));
    });
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id !== 1) return;
      clearTimeout(timer);
      try { ws.close(); } catch {}
      if (msg.result && msg.result.exceptionDetails) reject(new Error(msg.result.exceptionDetails.text || '页面执行出错'));
      else resolve(msg.result && msg.result.result ? msg.result.result.value : undefined);
    });
    ws.addEventListener('error', () => { clearTimeout(timer); reject(new Error('无法连接应用调试端口')); });
  });
}

test.before(async () => {
  wsUrl = await findEndpoint();
  if (wsUrl) return;
  if (!fs.existsSync(EXE)) return;
  const dataDir = path.join(WORK, 'userdata');
  fs.mkdirSync(dataDir, { recursive: true });
  child = spawn(EXE, [`--remote-debugging-port=${PORT}`, '--remote-allow-origins=*', `--user-data-dir=${dataDir}`],
    { cwd: path.dirname(EXE), stdio: 'ignore' });
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    wsUrl = await findEndpoint();
    if (wsUrl) return;
  }
});

test.after(async () => {
  try {
    if (child && child.pid && process.platform === 'win32') spawn('taskkill', ['/pid', String(child.pid), '/t', '/f']);
    else if (child) child.kill();
  } catch {}
  await sleep(500);
  try { fs.rmSync(WORK, { recursive: true, force: true }); } catch {}
});

const PANEL_SNAPSHOT = `(function(){
  var box=document.getElementById('playerProgress');
  var panel=document.getElementById('progressPanel');
  var bar=document.querySelector('.player-bar');
  var transport=document.querySelector('.transport');
  var handle=document.getElementById('progressToggleBtn');
  var main=document.querySelector('.main-panel');
  var card=document.querySelector('.viz-card');
  var rect=function(el){ var r=el.getBoundingClientRect(); return {x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)}; };
  var cs=getComputedStyle(panel);
  return {
    expanded: box.classList.contains('is-expanded'),
    panelOpacity: cs.opacity, panelPointer: cs.pointerEvents, panelPosition: cs.position,
    bar: rect(bar), transport: rect(transport), main: rect(main), card: rect(card), panel: rect(panel),
    handle: (function(){ var h=handle.getBoundingClientRect(); return {x:Math.round(h.left),y:Math.round(h.top),w:Math.round(h.width),h:Math.round(h.height),bottom:Math.round(h.bottom)}; })(),
    sliderBottom: Math.round(document.getElementById('progress').getBoundingClientRect().bottom),
    panelBlur: cs.backdropFilter || cs.webkitBackdropFilter,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth
  };
})()`;

test('实机：进度条点击向上展开，底栏变高、上方功能区自动补位（非浮层）', async (t) => {
  if (!wsUrl) return t.skip('未运行应用实例，跳过实机核对');
  // 先归零到收起状态（避免受其它用例影响）
  for (let i = 0; i < 6; i++) {
    const st = await evaluate(`(function(){
      return {expanded: document.getElementById('playerProgress').classList.contains('is-expanded'),
              h: Math.round(document.querySelector('.player-bar').getBoundingClientRect().height)};
    })()`);
    if (!st.expanded && st.h < 90) break;
    if (st.expanded) await evaluate("document.getElementById('progressToggleBtn').click()");
    await sleep(400);
  }
  const before = await evaluate(PANEL_SNAPSHOT);
  assert.strictEqual(before.expanded, false, '默认收起');
  assert.strictEqual(before.panelOpacity, '0', '收起时进度条内容不可见');
  assert.ok(Math.abs(before.bar.h - 82) <= 2, `收起时底栏保持 82px（实际 ${before.bar.h}）`);
  // 收起时整条把手必须落在底栏内部：不再向上探出压住上方内容
  assert.ok(before.handle.y >= before.bar.y - 1,
    `把手不越出底栏上沿（handleTop=${before.handle.y} / barTop=${before.bar.y}）`);
  assert.ok(before.handle.bottom <= before.bar.y + 24,
    `把手收在底栏顶部带内（bottom=${before.handle.bottom}）`);

  // 真实场景下点击时光标就在把手/面板上：这里显式标记指针在区域内，
  // 否则测试环境的真实光标位置会在展开后触发 pointerleave 自动收起
  await evaluate("document.getElementById('playerProgress').dispatchEvent(new PointerEvent('pointerenter', {bubbles:true}));");
  await evaluate("document.getElementById('progressToggleBtn').click()");
  await sleep(500);
  const after = await evaluate(PANEL_SNAPSHOT);
  assert.strictEqual(after.expanded, true, '点击后展开');
  assert.strictEqual(after.panelOpacity, '1', '展开后进度条可见');
  assert.strictEqual(after.panelPosition, 'relative', '进度条在布局里，不是浮层');
  assert.ok(after.bar.h > before.bar.h + 20, `展开后底栏向上变高（${before.bar.h} → ${after.bar.h}）`);
  // 展开只允许底栏向上长高：主行高度不变（不再被压在 50px），控制组不下移、不抖动
  const mainRowBefore = await evaluate("Math.round(document.querySelector('.player-main').getBoundingClientRect().height)");
  assert.ok(mainRowBefore >= 60, `展开后主行不被压缩（${mainRowBefore}px）`);
  assert.ok(Math.abs(after.transport.y - before.transport.y) <= 1,
    `控制组位置稳定（${before.transport.y} → ${after.transport.y}）`);
  assert.ok(after.card.h < before.card.h - 10, `上方功能区自动补位（内容区 ${before.card.h} → ${after.card.h}）`);
  // 面板是底栏向上长出来的那一段：它必须整体落在主行上方，不压住主行
  const mainRowTop = await evaluate("Math.round(document.querySelector('.player-main').getBoundingClientRect().top)");
  assert.ok(after.panel.y + after.panel.h <= mainRowTop + 1,
    `进度面板不与主行重叠（面板 bottom=${after.panel.y + after.panel.h} / 主行 top=${mainRowTop}）`);
  assert.ok(after.handle.y >= after.sliderBottom - 1, `展开时把手落在面板下沿、不压住进度条内容（把手 top=${after.handle.y} / 滑块 bottom=${after.sliderBottom}）`);
  // 主行（播放控制）随底栏变高整体下移，自身尺寸不变 —— 说明是布局补位而不是覆盖
  assert.strictEqual(after.transport.w, before.transport.w, '播放控制组宽度不变');
  assert.strictEqual(after.transport.h, before.transport.h, '播放控制组高度不变');
  // 展开时面板本身不再叠第二层白底/模糊（底栏已是玻璃层），毛玻璃由底栏提供
  const blurOwner = await evaluate(`(function(){
    var cs=getComputedStyle(document.querySelector('.player-bar'));
    return cs.backdropFilter || cs.webkitBackdropFilter || '';
  })()`);
  assert.ok((after.panelBlur || '').includes('blur') || (blurOwner || '').includes('blur'), '进度条区域带毛玻璃');
  assert.ok(after.overflowX <= 1, '不产生横向溢出');

  // 收起后上方功能区回到原位
  await evaluate("document.getElementById('progressToggleBtn').click()");
  await sleep(500);
  const restored = await evaluate(PANEL_SNAPSHOT);
  await evaluate("document.querySelector('.player-bar').dispatchEvent(new PointerEvent('pointerleave', {bubbles:true}));");
  await sleep(300);
  assert.strictEqual(restored.expanded, false, '再次点击收起');
  assert.ok(Math.abs(restored.bar.h - before.bar.h) <= 2, '收起后底栏高度回到原位');
  assert.ok(Math.abs(restored.main.h - before.main.h) <= 2, '收起后上方功能区自动补回原位');
});

test('实机：收起进度条不会闪出白色低栏（旧版白底不再被画出来）', async (t) => {
  if (!wsUrl) return t.skip('未运行应用实例，跳过实机核对');
  await evaluate("if (document.getElementById('playerProgress').classList.contains('is-expanded')) document.getElementById('progressToggleBtn').click();");
  await sleep(300);
  await evaluate("document.getElementById('progressToggleBtn').click()");
  await sleep(400);
  assert.strictEqual(await evaluate("document.getElementById('playerProgress').classList.contains('is-expanded')"), true, '已展开');

  // 收起并连续采样：白色低栏只可能出现在收起动画的前几帧
  const raw = await evaluate(`(async function () {
    var panel = document.getElementById('progressPanel');
    var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
    var nums = function (value) { return (String(value || '').match(/[0-9.]+/g) || []).map(Number); };
    var read = function (at) {
      var cs = getComputedStyle(panel);
      var p = nums(cs.backgroundColor);
      var alpha = p.length > 3 ? p[3] : 1;
      var opacity = Number(cs.opacity);
      var white = (p[0] > 200 && p[1] > 200 && p[2] > 200) ? alpha * opacity : 0;
      var after = getComputedStyle(panel, '::after');
      var a = nums(after.backgroundColor);
      var aAlpha = a.length > 3 ? a[3] : 1;
      var afterWhite = after.display === 'none' ? 0 : aAlpha * Number(after.opacity) * opacity;
      return { at: at, bg: cs.backgroundColor, opacity: Number(opacity.toFixed(3)), shadow: cs.boxShadow.slice(0, 24),
               afterDisplay: after.display, white: Number(white.toFixed(3)), afterWhite: Number(afterWhite.toFixed(3)) };
    };
    var samples = [];
    document.getElementById('progressToggleBtn').click();
    samples.push(read(0));
    var marks = [16, 40, 80, 140, 220];
    for (var i = 0; i < marks.length; i++) {
      await sleep(marks[i] - samples[samples.length - 1].at);
      samples.push(read(marks[i]));
    }
    return JSON.stringify(samples);
  })()`, 30000);
  const samples = JSON.parse(raw || '[]');
  assert.ok(samples.length >= 5, '收起过程中取到多点采样');
  assert.strictEqual(samples[0].bg, 'rgba(0, 0, 0, 0)', '收起第一帧面板就是透明的（不再整体画出白色底）');
  const flash = samples.reduce((max, item) => Math.max(max, item.white + item.afterWhite), 0);
  assert.ok(flash <= 0.03, `收起全程没有白色低栏（最强白色贡献 ${flash.toFixed(3)}：${JSON.stringify(samples)}）`);
  assert.ok(samples.every((item) => item.afterDisplay === 'none' || item.afterWhite <= 0.03),
    '底部模糊保护层不会在收起瞬间补出白边');
  assert.strictEqual(await evaluate("document.getElementById('playerProgress').classList.contains('is-expanded')"), false, '最终回到收起态');
});

test('实机：底栏对齐 —— 控制组居中、按钮与音量同一水平线、把手贴顶边', async (t) => {
  if (!wsUrl) return t.skip('未运行应用实例，跳过实机核对');
  // 对齐检查基于收起状态（把手贴底栏最外边）
  for (let i = 0; i < 6; i++) {
    const st = await evaluate(`(function(){
      return {expanded: document.getElementById('playerProgress').classList.contains('is-expanded'),
              h: Math.round(document.querySelector('.player-bar').getBoundingClientRect().height)};
    })()`);
    if (!st.expanded && st.h < 90) break;
    if (st.expanded) await evaluate("document.getElementById('progressToggleBtn').click()");
    await sleep(400);
  }
  const geo = await evaluate(`(function(){
    var bar=document.querySelector('.player-bar');
    var transport=document.querySelector('.transport');
    var play=document.getElementById('playBtn');
    var prev=document.getElementById('prevBtn');
    var next=document.getElementById('nextBtn');
    var mode=document.getElementById('modeBtn');
    var mute=document.getElementById('muteBtn');
    var handle=document.getElementById('progressToggleBtn');
    var b=bar.getBoundingClientRect();
    var rect=function(el){ return el.getBoundingClientRect(); };
    var cy=function(el){ var r=rect(el); return r.top+r.height/2; };
    return {barCenterX: b.left + b.width/2,
            transportCenterX: cy ? (rect(transport).left + rect(transport).width/2) : null,
            buttonCenters: [prev,play,next,mode].map(function(el){ return Math.round(cy(el)*10)/10; }),
            muteCenter: Math.round(cy(mute)*10)/10,
            handle: {left: Math.round(rect(handle).left), centerX: Math.round(rect(handle).left+rect(handle).width/2), top: Math.round(rect(handle).top - b.top), bottom: Math.round(rect(handle).bottom)},
            barTop: Math.round(b.top),
            handleGapToPlay: Math.round(rect(play).top - rect(handle).bottom),
            overlapWithPlay: (function(){
              var h=rect(handle), p=rect(play);
              return (Math.min(h.right,p.right)-Math.max(h.left,p.left) > 0.5) && (Math.min(h.bottom,p.bottom)-Math.max(h.top,p.top) > 0.5);
            })(),
            bar: {left: Math.round(b.left), width: Math.round(b.width)},
            overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth};
  })()`);
  // 控制组水平正中（以整条底栏可用区域为基准）
  const deltaX = Math.abs(geo.transportCenterX - geo.barCenterX);
  assert.ok(deltaX <= 2, `播放控制组应在底栏水平正中（偏差 ${Math.round(deltaX)}px）`);
  // 四个传输按钮圆心 Y 一致
  assert.ok(Math.max(...geo.buttonCenters) - Math.min(...geo.buttonCenters) <= 1,
    `上一首/播放/下一首/循环圆心 Y 一致（${geo.buttonCenters.join('/')}）`);
  // 与右侧音量按钮同一水平线（横向音量滑杆已收进按钮，不再单独占位）
  assert.ok(Math.abs(geo.buttonCenters[1] - geo.muteCenter) <= 1.5,
    `播放按钮与音量按钮同一水平线（播放 ${geo.buttonCenters[1]} / 音量 ${geo.muteCenter}）`);
  // 把手收在底栏内部（不再向上露出压住上方内容），也不占布局、不压低控制组
  assert.ok(geo.handle.top >= -1,
    `把手不越出底栏上沿（handleTop=${geo.handle.top}）`);
  assert.ok(geo.handle.bottom <= geo.barTop + 24,
    `把手收在底栏顶部带内（bottom=${geo.handle.bottom} / barTop=${geo.barTop}）`);
  assert.ok(geo.overlapWithPlay === false, '把手不得与播放键重叠（实测之前重叠 4px）');
  assert.ok(geo.handleGapToPlay >= 4, `把手与播放键之间保留稳定间隙（实际 ${geo.handleGapToPlay}px）`);
  // 与播放列表把手尺寸统一（16 厚 × 56 长）
  const sizePair = await evaluate(`(function(){
    var p=document.getElementById('progressToggleBtn').getBoundingClientRect();
    var l=document.getElementById('playlistExpandBtn').getBoundingClientRect();
    return {progress:{w:Math.round(p.width),h:Math.round(p.height)}, list:{w:Math.round(l.width),h:Math.round(l.height)}};
  })()`);
  assert.strictEqual(sizePair.progress.w, sizePair.list.h, `进度把手长度应等于播放列表把手长度（${sizePair.progress.w} vs ${sizePair.list.h}）`);
  assert.strictEqual(sizePair.progress.h, sizePair.list.w, `进度把手厚度应等于播放列表把手厚度（${sizePair.progress.h} vs ${sizePair.list.w}）`);
  assert.ok(Math.abs(geo.handle.centerX - geo.barCenterX) <= 2, '把手位于底栏上边缘水平正中');
  assert.ok(geo.overflowX <= 1, '底栏不产生横向溢出');
  // 主行必须铺满整条卡片，否则左右区域会被挤向中间、进度条也不是按卡片整幅居中
  const rowGeo = await evaluate(`(function(){
    var bar=document.querySelector('.player-bar').getBoundingClientRect();
    var main=document.querySelector('.player-main').getBoundingClientRect();
    var panel=document.getElementById('progressPanel').getBoundingClientRect();
    return {barW:Math.round(bar.width), mainW:Math.round(main.width),
            mainDx:Math.round((main.left+main.width/2)-(bar.left+bar.width/2)),
            panelDx:Math.round((panel.left+panel.width/2)-(bar.left+bar.width/2))};
  })()`);
  assert.ok(Math.abs(rowGeo.mainW - rowGeo.barW) <= 2, `主行应铺满整条底栏（${rowGeo.mainW} / ${rowGeo.barW}）`);
  assert.ok(Math.abs(rowGeo.mainDx) <= 1, '主行相对卡片居中');
  assert.ok(Math.abs(rowGeo.panelDx) <= 1, `展开的进度条应相对卡片居中（偏差 ${rowGeo.panelDx}px）`);
});

test('实机：点静音按钮弹出竖向音量滑杆；音量到零显示为静音', async (t) => {
  if (!wsUrl) return t.skip('未运行应用实例，跳过实机核对');
  const session = await openSession();
  const click = async (x, y) => {
    await session.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await session.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  };
  const popoverHidden = () => evaluate("document.getElementById('volumePopover').hidden");
  const popoverRendered = () => evaluate("!!document.getElementById('volumePopover').offsetParent");
  try {
    await evaluate("setVolume(0.8), setVolumePopover(false)");
    await sleep(250);
    assert.strictEqual(await popoverHidden(), true, '默认收起');
    assert.strictEqual(await popoverRendered(), false, '收起时不渲染（不会一直浮在底栏上方）');
    assert.strictEqual(await evaluate("!!document.querySelector('.player-right > input[type=range]')"), false, '底栏里不再有独立横向滑杆');
    assert.strictEqual(await evaluate("!!document.getElementById('volume').closest('.volume-popover')"), true, '滑杆就在静音按钮的弹出层里');

    const button = await elementBox('#muteBtn');
    await click(button.cx, button.cy);
    await sleep(350);
    assert.strictEqual(await popoverHidden(), false, '点按钮弹出滑杆');
    assert.strictEqual(await popoverRendered(), true, '弹出层真的渲染出来');
    const slider = await elementBox('#volume');
    assert.ok(slider.h > slider.w * 3, `滑杆是竖向的（${Math.round(slider.w)}×${Math.round(slider.h)}）`);
    assert.ok(slider.cy < button.cy, '滑杆在按钮上方（向上弹出）');
    assert.ok(Math.abs(slider.cx - button.cx) <= 1.5, '滑杆与按钮同一竖线');

    // 真实鼠标点滑杆顶部 → 音量大；点到底部 → 音量归零并显示为静音
    await click(slider.cx, slider.y + 6);
    await sleep(200);
    const high = Number(await evaluate('state.volume'));
    assert.ok(high > 0.6, `点顶部音量变大（实际 ${high}）`);
    assert.strictEqual(await evaluate("document.getElementById('muteBtnIcon').getAttribute('href')"), '#icon-volume', '有声时是音量图标');

    await click(slider.cx, slider.y + slider.h - 6);
    await sleep(200);
    assert.strictEqual(Number(await evaluate('state.volume')), 0, '点底部音量归零');
    assert.strictEqual(await evaluate('state.muted'), true, '音量零 = 静音');
    assert.strictEqual(await evaluate("document.getElementById('muteBtnIcon').getAttribute('href')"), '#icon-mute', '图标切到静音');
    assert.strictEqual(await evaluate("document.getElementById('volumeValue').textContent"), await evaluate("t('volumeMuted')"), '读数显示静音');

    // 往上拉回来 → 立刻不再静音
    await click(slider.cx, slider.y + slider.h * 0.4);
    await sleep(200);
    assert.ok(Number(await evaluate('state.volume')) > 0.3, '往上拖音量恢复');
    assert.strictEqual(await evaluate('state.muted'), false, '不再静音');
    assert.strictEqual(await evaluate("document.getElementById('muteBtnIcon').getAttribute('href')"), '#icon-volume', '图标回到音量');

    // Esc 收起
    await session.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await session.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await sleep(250);
    assert.strictEqual(await popoverHidden(), true, 'Esc 收起');

    // 点底栏空白处收起（点在底栏自身的内边距上，不会误触内容区）
    const bar = await elementBox('.player-bar');
    await click(button.cx, button.cy);
    await sleep(250);
    assert.strictEqual(await popoverHidden(), false, '再次点开');
    await click(bar.x + 8, bar.cy);
    await sleep(300);
    assert.strictEqual(await popoverHidden(), true, '点空白处收起');
  } finally {
    await evaluate("setVolume(0.8), setVolumePopover(false)");
    session.close();
  }
});

test('实机：拖动 Seek 不会误收起，移出后自动收起', async (t) => {
  if (!wsUrl) return t.skip('未运行应用实例，跳过实机核对');
  // 先归零到收起状态，再点开
  await evaluate("if (document.getElementById('playerProgress').classList.contains('is-expanded')) document.getElementById('progressToggleBtn').click();");
  await sleep(250);
  await evaluate("document.getElementById('progressToggleBtn').click()");
  await sleep(300);
  assert.strictEqual(await evaluate("document.getElementById('playerProgress').classList.contains('is-expanded')"), true);

  // 拖动中把指针移出：不得收起
  await evaluate(`(function(){
    var box=document.getElementById('playerProgress');
    var slider=document.getElementById('progress');
    box.dispatchEvent(new PointerEvent('pointerenter', {bubbles:true}));
    slider.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true}));
    slider.value='500';
    slider.dispatchEvent(new Event('input', {bubbles:true}));
    box.dispatchEvent(new PointerEvent('pointerleave', {bubbles:true}));
  })()`);
  await sleep(400);
  assert.strictEqual(await evaluate("document.getElementById('playerProgress').classList.contains('is-expanded')"), true, '拖动 Seek 期间保持展开');
  await evaluate("window.dispatchEvent(new PointerEvent('pointerup', {bubbles:true}))");

  // 松开且指针已移出 → 自动收起
  await evaluate(`(function(){
    var box=document.getElementById('playerProgress');
    box.dispatchEvent(new PointerEvent('pointerleave', {bubbles:true}));
  })()`);
  await sleep(500);
  assert.strictEqual(await evaluate("document.getElementById('playerProgress').classList.contains('is-expanded')"), false, '鼠标移出后自动收起');
  // 并行跑的冒烟用例可能在播放并刷新滑块，这里只确认滑块仍是有效数值
  const sliderValue = await evaluate("document.getElementById('progress').value");
  assert.ok(Number.isFinite(Number(sliderValue)), `Seek 之后滑块仍是有效数值（${sliderValue}）`);
});

test('实机：播放列表展开/收起 + 右侧内容自动补位', async (t) => {
  if (!wsUrl) return t.skip('未运行应用实例，跳过实机核对');
  // 先把侧栏恢复成展开态，避免受其它用例影响
  await evaluate("(function(){var s=document.querySelector('.app-shell'); if(s.classList.contains('playlist-collapsed')) document.getElementById('playlistExpandBtn').click();})()");
  await sleep(400);
  const read = `(function(){
    var shell=document.querySelector('.app-shell');
    var side=shell.querySelector(':scope > .sidebar');
    var main=shell.querySelector(':scope > .main-panel');
    var handle=document.getElementById('playlistExpandBtn');
    var r=function(el){ var b=el.getBoundingClientRect(); return {x:Math.round(b.left),w:Math.round(b.width)}; };
    var sb=side.getBoundingClientRect(), hb=handle.getBoundingClientRect();
    // 把手区域是否压住了列表 / 工具按钮（应完全不再重叠）
    var overlapped = ['.sidebar-search', '.sidebar-tools', '#trackList', '.sidebar-head'].filter(function(sel){
      var el = side.querySelector(sel);
      if (!el) return false;
      var b = el.getBoundingClientRect();
      return Math.min(b.right, hb.right) - Math.max(b.left, hb.left) > 0.5;
    });
    return {expanded: !shell.classList.contains('playlist-collapsed'), sidebar: r(side), main: r(main), overlapped: overlapped,
            // 把手是否贴在卡片右侧边缘的竖直正中
            handleAtEdge: Math.abs(hb.right - sb.right) <= 2,
            handleCentered: Math.abs((hb.top + hb.height/2) - (sb.top + sb.height/2)) <= 2,
            taller: Math.round(sb.height / sb.width)};
  })()`;
  const before = await evaluate(read);
  assert.strictEqual(before.expanded, true, '默认展开（播放列表可见）');
  assert.strictEqual(await evaluate("!!document.getElementById('onlineMusicBtn')"), false, '在线音乐卡片不存在');
  assert.ok(before.handleAtEdge, '把手贴在播放列表卡片右侧边缘');
  assert.ok(before.handleCentered, '把手位于右侧边缘竖直正中');
  assert.ok(before.taller >= 2, `播放列表卡片应为窄高比例（高/宽=${before.taller}）`);
  assert.deepStrictEqual(before.overlapped, [], `把手不得压住任何列表内容（实际重叠：${before.overlapped.join(',')}）`);

  // 点击把手 → 整张播放列表收起（只剩细把手），右侧内容补位
  await evaluate("document.getElementById('playlistExpandBtn').click()");
  await sleep(450);
  const collapsed = await evaluate(read);
  assert.strictEqual(collapsed.expanded, false, '点击后整张播放列表收起');
  assert.ok(collapsed.sidebar.w <= 20, `收起后只剩细把手（${collapsed.sidebar.w}px）`);
  assert.ok(Math.abs(collapsed.main.x - (collapsed.sidebar.x + collapsed.sidebar.w)) <= 2, '主内容紧贴侧栏右侧，无空隙无遮挡');
  assert.ok(collapsed.main.w > collapsed.sidebar.w * 10, '主内容占满释放出来的空间');

  // 再点一次 → 重新展开，几何完全回到初始
  await evaluate("document.getElementById('playlistExpandBtn').click()");
  await sleep(450);
  const after = await evaluate(read);
  assert.strictEqual(after.expanded, true, '再次点击重新展开');
  assert.ok(after.sidebar.w >= 230, `展开后恢复完整侧栏宽度（${after.sidebar.w}px）`);
  assert.ok(Math.abs(after.main.x - (after.sidebar.x + after.sidebar.w)) <= 2, '主内容紧贴侧栏右侧');
  assert.deepStrictEqual(after.overlapped, [], '展开后把手同样不压内容');
  assert.ok(after.handleAtEdge && after.handleCentered, '展开后把手仍在卡片右边缘正中');

  // 鼠标移出侧栏 → 自动收起
  await evaluate("document.querySelector('.app-shell > .sidebar').dispatchEvent(new PointerEvent('pointerleave', {bubbles:true}))");
  await sleep(500);
  const auto = await evaluate(read);
  assert.strictEqual(auto.expanded, false, '鼠标移出后自动收起');
  assert.ok(Math.abs(auto.sidebar.w - collapsed.sidebar.w) <= 1, '自动收起后宽度与手动收起一致');
  // 收尾：恢复成展开，方便人工测试
  await evaluate("document.getElementById('playlistExpandBtn').click()");
  await sleep(300);
});

test('实机：不同窗口尺寸 / 缩放比下浮层完整可见且不溢出', async (t) => {
  if (!wsUrl) return t.skip('未运行应用实例，跳过实机核对');
  const session = await new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const waiting = new Map();
    ws.addEventListener("error", () => reject(new Error("无法连接应用调试端口")));
    ws.addEventListener("open", () => resolve({
      send(method, params) {
        return new Promise((res, rej) => {
          const mid = ++id;
          const timer = setTimeout(() => { waiting.delete(mid); rej(new Error(method + " 超时")); }, 20000);
          waiting.set(mid, (msg) => { clearTimeout(timer); msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result); });
          ws.send(JSON.stringify({ id: mid, method, params: params || {} }));
        });
      },
      close() { try { ws.close(); } catch {} }
    }));
    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      const slot = waiting.get(msg.id);
      if (!slot) return;
      waiting.delete(msg.id);
      slot(msg);
    });
  });
  try {
    await session.send("Runtime.evaluate", { expression: "if (!document.getElementById('playerProgress').classList.contains('is-expanded')) document.getElementById('progressToggleBtn').click();" });
    for (const [w, h, dpr] of [[1320, 840, 1], [1024, 700, 1], [1600, 1000, 1.25]]) {
      await session.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: dpr, mobile: false });
      await sleep(500);
      const r = await session.send("Runtime.evaluate", { returnByValue: true, expression: `(function(){
        var panel=document.getElementById('progressPanel');
        var p=panel.getBoundingClientRect();
        return {left:Math.round(p.left), right:Math.round(p.right), top:Math.round(p.top),
                vw:document.documentElement.clientWidth, vh:document.documentElement.clientHeight,
                overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth};
      })()` });
      const v = r.result.value;
      assert.ok(v.left >= 0 && v.right <= v.vw + 1, `${w}x${h}@${dpr} 浮层横向完整可见（${v.left}..${v.right} / ${v.vw}）`);
      assert.ok(v.top >= 0, `${w}x${h}@${dpr} 浮层不超出窗口上沿`);
      assert.ok(v.overflowX <= 1, `${w}x${h}@${dpr} 不产生横向溢出`);
    }
  } finally {
    await session.send("Emulation.clearDeviceMetricsOverride").catch(() => {});
    await session.send("Runtime.evaluate", { expression: "document.getElementById('progressToggleBtn').click();" }).catch(() => {});
    session.close();
  }
});
