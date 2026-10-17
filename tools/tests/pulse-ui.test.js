/*
 * RlonDSP
 * Copyright © 2026 RlonDSP. All rights reserved.
 * Based on Echomusic open-source project, modified and extended for RlonDSP.
 *
 * 「脉冲反馈」UI 统一专项测试
 * ---------------------------------------------------------------------------
 * 目标：确认脉冲反馈标签页与实时音效标签页是同一套 UI 系统，且功能层一行未改。
 *
 * 静态部分（不需要运行应用）：
 *   1. 弹窗尺寸：脉冲反馈不再使用 1180px / 88vh 的复古机架尺寸，与实时音效同一盒子；
 *   2. 功能 id、postMessage 协议字符串全部保留；
 *   3. 页面里的每一段内联脚本都能通过语法编译（渲染流程 / DSP 核心零改动）；
 *   4. 图标：只使用主界面图标登记表里已有的矢量图形；
 *   5. 控件规格：开关 34×19 / 圆钮 13px、按钮 27px、下拉 27px、芯片 24px。
 *
 * 实机部分（应用在 9234 调试端口运行时才执行，否则自动跳过）：
 *   6. 两个标签页的弹窗宽高一致、居中、完整可见、X 可点；
 *   7. 脉冲页面无横向溢出、全部功能 id 存在、图标全部解析成功；
 *   8. 真实渲染一次 IR：统计 / 波形 / 频谱都有输出；
 *   9. 「保存到 RlonDSP」经 postMessage 落库，脉冲预设数量 +1。
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync, spawn } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HTML = fs.readFileSync(path.join(ROOT, 'src', 'ir-studio.html'), 'utf8');
const INDEX = fs.readFileSync(path.join(ROOT, 'src', 'index.html'), 'utf8');
const CSS = fs.readFileSync(path.join(ROOT, 'src', 'styles.css'), 'utf8');
const RENDERER = fs.readFileSync(path.join(ROOT, 'src', 'renderer.js'), 'utf8');

const PORT = 9234;
const EXE = path.join(ROOT, 'release', 'RlonDSP-portable', 'RlonDSP.exe');
const WORK = path.join(ROOT, 'build', 'test-pulse');

/* 改动前就已经被其它模块依赖的 id / 协议字符串：一个都不能少 */
const REQUIRED_IDS = [
  'btn-studio-reset', 'chain', 'rack', 'vu', 'pwr', 'pwr-txt',
  'lcd-rate', 'lcd-len', 'lcd-chain', 'in-rate', 'in-bits', 'in-len', 'in-amp', 'lcd-amp',
  'eq-bands', 'eq-trim', 'eq-en',
  'comp-en', 'comp-thr', 'comp-ratio', 'comp-att', 'comp-rel', 'comp-knee', 'comp-mu', 'comp-sc',
  'bass-en', 'bass-xo', 'bass-dr', 'bass-mode', 'bass-mix', 'bass-env',
  'sur-en', 'sur-w', 'sur-del', 'sur-ap', 'sur-mix',
  'hps-en', 'hps-mode', 'hps-amt', 'hps-fr', 'hps-del',
  'cd-en', 'cd-channel', 'cd-ms',
  'clar-en', 'clar-amt', 'clar-thr', 'clar-fr',
  'ultra-en', 'ultra-fr',
  'tube-en', 'tube-dr', 'tube-bias', 'tube-mix',
  'fdn-en', 'fdn-pre', 'fdn-size', 'fdn-t60', 'fdn-damp', 'fdn-wet',
  'norm-en', 'lcd-norm',
  'wmk-en', 'wmk-msg', 'wmk-depth',
  'btn-render', 'led-render', 'pfill', 'pmsg', 'ppct',
  'result', 'led-ok', 'st-file', 'st-fmt', 'st-peak', 'st-rms', 'st-dur',
  'g1-info', 'g2-info', 'cv-wave', 'cv-spec',
  'btn-dl', 'btn-play', 'btn-save-app', 'rlondsp-pulse-name',
  'mod-imp', 'mod-eq', 'mod-comp', 'mod-bass', 'mod-sur', 'mod-hps',
  'mod-cdelay', 'mod-clar', 'mod-ultra', 'mod-tube', 'mod-fdn', 'mod-norm', 'mod-wmk'
];

/* 改动前就已经在用的跨文档协议：字符串必须原样保留 */
const REQUIRED_PROTOCOL = [
  'rlondsp-pulse-save', 'rlondsp-pulse-name-request', 'rlondsp-pulse-name',
  'rlondsp-live-channel-delay', 'rlondsp-theme', 'dsp-core', 'renderIR'
];

function block(html, id, tag) {
  const re = new RegExp(`<${tag}[^>]*id="${id}"[^>]*>([\\s\\S]*?)</${tag}>`);
  const m = html.match(re);
  return m ? m[1] : null;
}

function scriptBlocks(html) {
  return [...html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
}

/** 取统一皮肤样式块（#rlondsp-pulse-ui / -2）里的内容，避免误命中历史机架样式 */
function skinCss(html) {
  return [...html.matchAll(/<style id="rlondsp-pulse-ui[^"]*">([\s\S]*?)<\/style>/g)]
    .map((m) => m[1]).join('\n');
}

test('脉冲反馈与实时音效使用同一套弹窗尺寸规则', () => {
  assert.ok(CSS.includes('.modal-card.effects-card.pulse-mode'), '保留 pulse-mode 选择器');

  const base = CSS.match(/\.modal-card\.effects-card \{([^}]*)\}/);
  const pulse = CSS.match(/\.modal-card\.effects-card\.pulse-mode \{([^}]*)\}/);
  assert.ok(base && pulse, '两个规则都要存在');
  assert.ok(!/1180px|88vh/.test(pulse[1]), '脉冲弹窗不再使用 1180px / 88vh 的复古机架尺寸');
  for (const rule of ['width: 620px', 'max-width: calc(100vw - 32px)', 'max-height: calc(100vh - 158px)']) {
    assert.ok(base[1].includes(rule), `实时音效应有 ${rule}`);
    assert.ok(pulse[1].includes(rule), `脉冲反馈应有 ${rule}`);
  }
  assert.ok(pulse[1].includes('height: calc(100vh - 158px)'), '脉冲反馈需要确定高度以承载内部滚动');
  assert.ok(CSS.includes('top: 44px') && CSS.includes('bottom: 82px'), '客户区居中规则保持');
  assert.ok(RENDERER.includes("card.classList.toggle('pulse-mode'"), '标签切换仍由既有逻辑负责');
});

test('脉冲反馈的功能 id 与协议字符串零改动', () => {
  const missing = REQUIRED_IDS.filter((id) => !HTML.includes(`id="${id}"`));
  assert.deepStrictEqual(missing, [], `缺少功能 id: ${missing.join(', ')}`);
  const lost = REQUIRED_PROTOCOL.filter((token) => !HTML.includes(token));
  assert.deepStrictEqual(lost, [], `缺少协议字符串: ${lost.join(', ')}`);
  assert.ok(RENDERER.includes('rlondsp-pulse-save'), '主程序仍接收保存消息');
  assert.ok(RENDERER.includes('rlondsp-live-channel-delay'), '主程序仍接收实时声道延迟参数');
});

test('页面内联脚本全部可编译（渲染流程与 DSP 核心未被改动）', () => {
  const blocks = scriptBlocks(HTML);
  assert.ok(blocks.length >= 4, '应当包含 dsp-core 与渲染编排等脚本');
  for (const code of blocks) {
    assert.doesNotThrow(() => new Function(code), '内联脚本存在语法错误');
  }
  let head = '';
  try {
    head = execFileSync('git', ['show', 'HEAD:src/ir-studio.html'], { cwd: ROOT, encoding: 'utf8' });
  } catch {
    head = '';
  }
  if (head) {
    assert.strictEqual(block(HTML, 'dsp-core', 'script'), block(head, 'dsp-core', 'script'), 'DSP 核心一字未改');
    const render = (html) => {
      const all = [...html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
      return all.find((code) => code.includes('function startRender')) || '';
    };
    assert.ok(render(head).length > 1000, '历史版本应能取到渲染脚本');
    assert.strictEqual(render(HTML), render(head), '渲染编排 / Worker / 保存 / 试听逻辑一字未改');
  }
});

test('图标只使用主界面图标登记表里已有的矢量图形', () => {
  const uses = [...HTML.matchAll(/<use[^>]*href="#([\w-]+)"/g)].map((m) => m[1]);
  assert.ok(uses.length >= 8, '统一后的页面应当使用矢量图标');
  const declared = new Set([...HTML.matchAll(/<symbol id="([\w-]+)"/g)].map((m) => m[1]));
  const registered = new Set([...INDEX.matchAll(/<symbol id="([\w-]+)"/g)].map((m) => m[1]));
  const registry = fs.readFileSync(path.join(ROOT, 'src', 'icon-registry.js'), 'utf8');
  for (const id of uses) {
    assert.ok(declared.has(id), `页面内缺少 symbol: ${id}`);
    assert.ok(registered.has(id), `主界面 sprite 里没有该图标: ${id}`);
    const key = id.replace(/^icon-/, '');
    const declaredInRegistry = new RegExp(`(^|[\\s,{])['"]?${key}['"]?\\s*:`).test(registry);
    assert.ok(declaredInRegistry, `图标登记表里没有登记: ${id}`);
  }
  // 按钮上一律用矢量图标，不用 emoji / 装饰字符（渲染状态提示里的 ✅❌ 属于既有 JS 标题，不在按钮里）
  const buttons = [...HTML.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/g)].map((m) => m[1]);
  assert.ok(buttons.length >= 4, '应能找到页面按钮');
  for (const label of buttons) {
    assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{25A0}-\u{25FF}]/u.test(label),
      `按钮里不应出现 emoji / 符号字：${label.trim().slice(0, 40)}`);
  }
});

test('开关 / 按钮 / 下拉 / 芯片与实时音效同规格', () => {
  const skin = skinCss(HTML);
  assert.ok(skin.length > 2000, '统一皮肤样式块存在');
  const rock = skin.match(/\.rock\{([^}]*)\}/);
  assert.ok(rock, '存在 .rock 规则');
  assert.ok(rock[1].includes('width:34px') && rock[1].includes('height:19px'), '开关为 34×19');
  const thumb = skin.match(/\.rock::after\{([^}]*)\}/);
  assert.ok(thumb && thumb[1].includes('width:13px') && thumb[1].includes('height:13px'), '开关圆钮 13px');
  const checked = skin.match(/\.rock:checked::after\{([^}]*)\}/);
  assert.ok(checked && checked[1].includes('background:#fff'), '打开态圆钮必须写全底色，避免被旧规则顶到外面');
  assert.ok(/\.btn\.small\{[^}]*height:27px/.test(skin), '面板内按钮 27px');
  assert.ok(/select\{[^}]*height:27px/.test(skin), '下拉与面板内下拉同高');
  assert.ok(/\.chip\{[^}]*height:24px/.test(skin), '芯片 24px');
  assert.ok(skin.includes('.fader-wrap{flex:1 1 0;min-width:0;}'), '推子格宽由栅格决定，不产生横向溢出');
  // 竖推子只画了 background-image（4px 竖轨），必须单独清掉默认底色，
  // 否则深色模式下每根推子背后都是一块纯白底框
  assert.ok(/\.fader-v\{[^}]*background-color:transparent/.test(HTML), '竖推子必须清掉默认白色底');
  // 旧机架在窄窗口媒体查询里给参数行写死了 min-width，会让两列排布的滑杆顶出格子互相压住
  assert.ok(skin.includes('.ctl .slider,.ctl .ctag{min-width:0;}'), '参数行的宽度交给栅格，不受旧固定最小宽度影响');
  // 干净卡片：不再保留旧机架的卡片底栏 / 重投影，相邻卡片之间用一条分割线区分
  assert.ok(/\.header,\.chain,\.panel,\.renderbar,\.graph,\.r-actions-card\{[^}]*box-shadow:none/.test(skin),
    '卡片自身不带底栏与投影');
  assert.ok(skin.includes('.r-actions-card + .r-graphs::before'), '相邻卡片之间补分割线');
  assert.ok(skin.includes('background:var(--lg-content-border);'), '分割线沿用现有内容层描边色');
});

test('开关规格与实时音效的开关逐项同值', () => {
  // 只把「独立的小数 0.x」写成 .x；不能把 10.5 里的 "0." 也吃掉
  const norm = (text) => text.replace(/\s+/g, '').replace(/(^|[^0-9])0\.(\d)/g, '$1.$2');
  // 同一选择器在样式表里可能出现在多处（含只改过渡的辅助块），把全部声明合起来检索
  const grab = (source, re) => {
    const all = [...source.matchAll(new RegExp(re.source, 'g'))];
    assert.ok(all.length, `找不到规则：${re}`);
    return norm(all.map((m) => m[1]).join(';'));
  };
  const skin = skinCss(HTML);
  const parent = {
    off: grab(CSS, /\.switch input\[type="checkbox"\]\s*\{([^}]*)\}/),
    dark: grab(CSS, /\[data-theme="dark"\] \.switch input\[type="checkbox"\]\s*\{([^}]*)\}/),
    on: grab(CSS, /\.switch input\[type="checkbox"\]:checked\s*\{([^}]*)\}/)
  };
  const pulse = {
    off: grab(skin, /\.rock\s*\{([^}]*)\}/),
    dark: grab(skin, /\[data-theme="dark"\] \.rock\s*\{([^}]*)\}/),
    on: grab(skin, /\.rock:checked\s*\{([^}]*)\}/)
  };
  const pairs = [
    ['off', ['background:rgba(120,128,145,.32)', 'border:1pxsolidvar(--tl-border)', 'box-shadow:inset01px2pxrgba(16,22,36,.16)']],
    ['dark', ['background:rgba(255,255,255,.12)', 'box-shadow:inset01px2pxrgba(0,0,0,.45)']],
    ['on', ['background:var(--accent)', 'border-color:transparent', 'box-shadow:inset01px2pxrgba(0,0,0,.18)']]
  ];
  for (const [state, keys] of pairs) {
    for (const key of keys) {
      assert.ok(parent[state].includes(key), `实时音效开关基准（${state}）：${key}`);
      assert.ok(pulse[state].includes(key), `脉冲反馈开关应与之同值（${state}）：${key}，实际 ${pulse[state]}`);
    }
  }
  // 旧机架留下的深色内阴影不允许再出现在未选中态
  assert.ok(!pulse.off.includes('inset02px3px'), '未选中态不应残留旧机架内阴影');
});

test('按钮与实时音效面板内的按钮逐项同值', () => {
  const norm = (text) => text.replace(/\s+/g, '').replace(/(^|[^0-9])0\.(\d)/g, '$1.$2');
  const skin = skinCss(HTML);
  // 把「选择器里提到该按钮类」的所有规则声明合起来检索（规则可能分散在多处）
  const union = (source, needle) => norm(
    [...source.matchAll(/([^{}]*)\{([^{}]*)\}/g)]
      .filter((m) => m[1].includes(needle))
      .map((m) => m[2])
      .join(';')
  );
  const pulseBtn = union(skin, '.btn');
  const pulseSmall = union(skin, '.btn.small');
  const parentMini = union(CSS, '.mini-btn');
  const parentMiniInCard = union(CSS, '.fx-section .mini-btn');

  // 面板内按钮：27px 高 / 圆角 9 / 内距 0 10 / 字号 10.5 / 间距 5
  for (const key of ['height:27px', 'padding:010px', 'border-radius:9px', 'font-size:10.5px']) {
    assert.ok(parentMiniInCard.includes(key), `实时音效面板内按钮基准：${key}`);
    assert.ok(pulseSmall.includes(key), `脉冲反馈按钮应同值：${key}`);
  }
  assert.ok(parentMini.includes('gap:5px'), '实时音效按钮图标间距 5px');
  assert.ok(pulseSmall.includes('gap:5px'), '面板内按钮间距与基准一致');

  // 表面：微玻璃底 + 微玻璃描边 + 顶部高光
  for (const key of ['background:var(--lg-micro-bg)', 'border:1pxsolidvar(--lg-micro-border)', 'box-shadow:var(--lg-highlight)']) {
    assert.ok(parentMini.includes(key), `实时音效按钮表面基准：${key}`);
    assert.ok(pulseBtn.includes(key), `脉冲反馈按钮表面应同值：${key}`);
  }
  assert.ok(pulseBtn.includes('font-weight:400'), '字重与基准一致');
  assert.ok(norm(skin.match(/\.btn\.primary\{([^}]*)\}/)[1]).includes('font-weight:650'), '主按钮字重与 .primary-btn 一致');
  assert.ok(skin.includes('.btn .pulse-icon{width:15px;height:15px;}'), '按钮图标 15px，与 .icon-sm 一致');
  assert.ok(skin.includes('--tl-inset-pressed:') && skin.includes('--tl-focus-ring:'), '按压 / 焦点沿用主界面触感令牌');
  // 「就绪」状态读数只有指示灯 + 文字，不再带胶囊底座
  const power = norm(skin.match(/\.power\{([^}]*)\}/)[1]);
  assert.ok(power.includes('background:transparent') && power.includes('border:0'), '就绪不再有底座');
});

test('表面令牌跟随主界面的环境自适应覆盖', () => {
  const skin = skinCss(HTML);
  assert.ok(skin.includes('@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))'),
    '无模糊环境的令牌覆盖已对齐');
  assert.ok(skin.includes('@media (prefers-reduced-transparency: reduce)'), '减少透明效果的令牌覆盖已对齐');
  const parent = fs.readFileSync(path.join(ROOT, 'src', 'glass-components.css'), 'utf8');
  for (const value of ['rgba(255, 255, 255, 0.30)', 'rgba(255, 255, 255, 0.52)', 'rgba(255, 255, 255, 0.62)']) {
    assert.ok(parent.replace(/\s+/g, '').includes(value.replace(/\s+/g, '')), `主界面基准值：${value}`);
  }
  const squashed = skin.replace(/\s+/g, '');
  for (const value of ['--lg-micro-bg:rgba(255,255,255,.30)', '--lg-bg-panel:rgba(255,255,255,.52)', '--lg-bg-content:rgba(255,255,255,.62)']) {
    assert.ok(squashed.includes(value.replace(/\s+/g, '')), `脉冲反馈应跟随同值：${value}`);
  }
});

test('脉冲反馈不再有「预设」子模块，保存用的名称位仍在', () => {
  assert.ok(!HTML.includes('pulseNameCard'), '预设子卡片已整块移除');
  assert.ok(!HTML.includes('<span>PRESET</span>'), '界面不再出现预设标题');
  assert.ok(!HTML.includes('<span class="ctag">PULSE&nbsp;NAME</span>'), '界面不再出现名称行');
  assert.ok(!HTML.includes('data-i18n-ph'), '占位文字桥接无残留');
  assert.ok(!HTML.includes('applyPlaceholders'), '占位桥接代码已清掉');
  assert.ok(/<input type="hidden" id="rlondsp-pulse-name"/.test(HTML), '保存流程需要的名称位保留为隐藏数据位');
});

test('主题与语言桥接保持（浅色 / 深色 / 中文 / 英文）', () => {
  assert.ok(HTML.includes("d.type==='rlondsp-theme'"), '接收主程序主题消息');
  assert.ok(HTML.includes('[data-theme="dark"]'), '深色主题令牌存在');
  assert.ok(HTML.includes('__rlondspApplyLang'), '语言切换入口存在');
  assert.ok(HTML.includes("'PULSE FEEDBACK':'脉冲反馈'"), '新增标题文案已进词典');
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

function evaluate(expression, timeout = 40000) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    const timer = setTimeout(() => {
      try { ws.close(); } catch {}
      reject(new Error('页面执行超时'));
    }, timeout);
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

const inner = (body) => evaluate(`(function(){
  var f=document.getElementById('irStudioFrame');
  var d=f.contentDocument;
  if(!d) throw new Error('脉冲反馈页面不可访问');
  ${body}
})()`);

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

test('实机：两个标签页弹窗同宽同高、居中、X 完整可见', async (t) => {
  if (!wsUrl) return t.skip('未运行应用实例，跳过实机核对');
  const measure = `(function(){
    var card=document.querySelector('.effects-card');
    var scrim=document.getElementById('effectsModal');
    var close=document.getElementById('closeEffectsBtn');
    var r=card.getBoundingClientRect(), s=scrim.getBoundingClientRect(), c=close.getBoundingClientRect();
    return {mode: card.classList.contains('pulse-mode'), w:r.width, h:r.height,
      dx:(r.left+r.right)/2-(s.left+s.width/2), dy:(r.top+r.bottom)/2-(s.top+s.height/2),
      inside: r.left>=s.left-0.5 && r.right<=s.right+0.5 && r.top>=s.top-0.5 && r.bottom<=s.bottom+0.5,
      closeInside: c.width>0 && c.height>0 && c.right<=r.right+0.5 && c.top>=r.top-0.5};
  })()`;
  // 其它用例可能中途关闭弹窗：测量前确保弹窗打开且已排版，量到 0 就重试
  const measureTab = async (tab) => {
    let last = null;
    for (let i = 0; i < 6; i++) {
      await evaluate(`document.getElementById('effectsModal').hidden=false; selectFxTab('${tab}');`);
      await sleep(400);
      last = await evaluate(measure);
      if (last && last.w > 100) return last;
    }
    return last;
  };
  const realtime = await measureTab('realtime');
  const pulse = await measureTab('pulse');

  assert.ok(Math.abs(realtime.w - pulse.w) < 1, `宽度一致，实际 ${realtime.w} vs ${pulse.w}`);
  assert.ok(Math.abs(realtime.h - pulse.h) < 1, `高度一致，实际 ${realtime.h} vs ${pulse.h}`);
  assert.ok(Math.abs(pulse.dx) <= 1 && Math.abs(pulse.dy) <= 1, '脉冲弹窗居中');
  assert.ok(pulse.inside, '脉冲弹窗完整落在客户区里');
  assert.ok(pulse.closeInside, 'X 关闭按钮完整可见');
});

test('实机：脉冲页面无横向溢出、功能 id 与图标完整', async (t) => {
  if (!wsUrl) return t.skip('未运行应用实例，跳过实机核对');
  // 其它用例可能把弹窗关掉 / 切过页签：先确保弹窗打开且停在脉冲页再量尺寸
  await evaluate("document.getElementById('effectsModal').hidden=false; selectFxTab('pulse');");
  await sleep(900);
  const report = await inner(`
    var de=d.documentElement;
    return {
      missing: ${JSON.stringify(REQUIRED_IDS)}.filter(function(id){ return !d.getElementById(id); }),
      unresolved: Array.prototype.slice.call(d.querySelectorAll('use')).map(function(u){
        return String(u.getAttribute('href')).slice(1);
      }).filter(function(id){ return !d.getElementById(id); }),
      scrollW: d.body.scrollWidth, clientW: de.clientWidth,
      rockW: d.querySelector('.rock').getBoundingClientRect().width,
      rockH: d.querySelector('.rock').getBoundingClientRect().height,
      faderW: d.querySelector('#eq-bands input').getBoundingClientRect().width,
      faderH: d.querySelector('#eq-bands input').getBoundingClientRect().height
    };
  `);
  assert.deepStrictEqual(report.missing, [], '功能 id 不应缺失');
  assert.deepStrictEqual(report.unresolved, [], '图标全部解析成功');
  assert.ok(report.scrollW <= report.clientW + 1, `不应出现横向滚动（${report.scrollW} > ${report.clientW}）`);
  assert.strictEqual(Math.round(report.rockW), 34, '开关宽度与实时音效一致');
  assert.strictEqual(Math.round(report.rockH), 19, '开关高度与实时音效一致');
  assert.strictEqual(Math.round(report.faderH), 138, '均衡推子长度与实时音效一致');
});

test('实机：不同窗口尺寸 / 缩放比下弹窗仍居中、完整可见、无横向溢出', async (t) => {
  if (!wsUrl) return t.skip('未运行应用实例，跳过实机核对');

  // 一次连接里完成「改视口 → 量尺寸 → 还原」，避免 override 失效
  const session = await new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const waiting = new Map();
    ws.addEventListener('error', () => reject(new Error('无法连接应用调试端口')));
    ws.addEventListener('open', () => resolve({
      send(method, params) {
        return new Promise((res, rej) => {
          const mid = ++id;
          const timer = setTimeout(() => { waiting.delete(mid); rej(new Error(method + ' 超时')); }, 20000);
          waiting.set(mid, (msg) => {
            clearTimeout(timer);
            if (msg.error) rej(new Error(JSON.stringify(msg.error)));
            else res(msg.result);
          });
          ws.send(JSON.stringify({ id: mid, method, params: params || {} }));
        });
      },
      close() { try { ws.close(); } catch {} }
    }));
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      const slot = waiting.get(msg.id);
      if (!slot) return;
      waiting.delete(msg.id);
      slot(msg);
    });
  });

  const measure = `(function(){
    var card=document.querySelector('.effects-card');
    var scrim=document.getElementById('effectsModal');
    var close=document.getElementById('closeEffectsBtn');
    var f=document.getElementById('irStudioFrame');
    var d=f.contentDocument;
    var r=card.getBoundingClientRect(), s=scrim.getBoundingClientRect(), c=close.getBoundingClientRect();
    return {w:r.width, h:r.height,
      dx:(r.left+r.right)/2-(s.left+s.width/2), dy:(r.top+r.bottom)/2-(s.top+s.height/2),
      inside: r.left>=s.left-0.5 && r.right<=s.right+0.5 && r.top>=s.top-0.5 && r.bottom<=s.bottom+0.5,
      closeInside: c.width>0 && c.height>0 && c.right<=r.right+0.5 && c.top>=r.top-0.5,
      scrollW: d.body.scrollWidth, clientW: d.documentElement.clientWidth,
      scrollable: d.documentElement.scrollHeight > f.clientHeight};
  })()`;

  try {
    await session.send('Emulation.setDeviceMetricsOverride', { width: 0, height: 0, deviceScaleFactor: 0, mobile: false });
    await evaluate("document.getElementById('effectsModal').hidden=false; selectFxTab('pulse');");
    await sleep(800);
    for (const [w, h, dpr] of [[1320, 840, 1], [1024, 700, 1], [820, 600, 1.5], [1500, 1000, 1.25]]) {
      await session.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: dpr, mobile: false });
      await sleep(450);
      // 并行用例可能刚把弹窗关掉：量到不可见就重新打开再量一次
      let m = await session.send('Runtime.evaluate', { expression: measure, returnByValue: true }).then((r) => r.result.value);
      for (let retry = 0; retry < 3 && !(m.closeInside && m.w > 100); retry++) {
        await evaluate("document.getElementById('effectsModal').hidden=false; selectFxTab('pulse');");
        await sleep(450);
        m = await session.send('Runtime.evaluate', { expression: measure, returnByValue: true }).then((r) => r.result.value);
      }
      assert.ok(Math.abs(m.dx) <= 1 && Math.abs(m.dy) <= 1, `${w}×${h}@${dpr} 弹窗应居中（dx=${m.dx}, dy=${m.dy}）`);
      assert.ok(m.inside, `${w}×${h}@${dpr} 弹窗应完整落在客户区内`);
      assert.ok(m.closeInside, `${w}×${h}@${dpr} X 关闭按钮应完整可见`);
      assert.ok(m.scrollW <= m.clientW + 1, `${w}×${h}@${dpr} 脉冲页面不应横向溢出`);
      assert.ok(m.scrollable, `${w}×${h}@${dpr} 内容超高时页面应可滚动`);
    }
  } finally {
    await session.send('Emulation.clearDeviceMetricsOverride').catch(() => {});
    await evaluate("selectFxTab('realtime'); document.getElementById('effectsModal').hidden=true;");
    session.close();
  }
});

test('实机：真实渲染一次脉冲，统计 / 波形 / 频谱都有输出', async (t) => {
  if (!wsUrl) return t.skip('未运行应用实例，跳过实机核对');
  await inner("d.getElementById('btn-render').click(); return 1;");
  let report = null;
  for (let i = 0; i < 40; i++) {
    await sleep(1000);
    report = await inner(`
      var cvW=d.getElementById('cv-wave'), cvS=d.getElementById('cv-spec');
      function ink(c){ var px=c.getContext('2d').getImageData(0,0,c.width,c.height).data; var n=0;
        for(var k=3;k<px.length;k+=4){ if(px[k]>8) n++; } return n; }
      return {shown:d.getElementById('result').classList.contains('show'),
        file:d.getElementById('st-file').textContent, peak:d.getElementById('st-peak').textContent,
        rms:d.getElementById('st-rms').textContent, dur:d.getElementById('st-dur').textContent,
        waveInk:ink(cvW), specInk:ink(cvS)};
    `);
    if (report && report.shown) break;
  }
  assert.ok(report && report.shown, '渲染完成后结果区应显示');
  assert.ok(/\.wav/.test(report.file), `输出文件名应可读，实际 ${report.file}`);
  assert.ok(/dBFS/.test(report.peak) && /dBFS/.test(report.rms), '峰值 / RMS 统计已写入');
  assert.ok(/s/.test(report.dur), '时长统计已写入');
  assert.ok(report.waveInk > 50, `波形画布应有内容，实际 ${report.waveInk}`);
  assert.ok(report.specInk > 500, `频谱画布应有内容，实际 ${report.specInk}`);
});

test('实机：保存到 RlonDSP 经 postMessage 落库', async (t) => {
  if (!wsUrl) return t.skip('未运行应用实例，跳过实机核对');
  // 保存要求先有渲染结果（lastWav）；单独跑这一条时先补一次渲染
  await evaluate("selectFxTab('pulse');");
  await sleep(800);
  if (!/COMPLETE/.test(await inner("return d.getElementById('pmsg').textContent;"))) {
    await inner("d.getElementById('btn-render').click(); return 1;");
    for (let i = 0; i < 40; i++) {
      await sleep(1000);
      if (await inner("return d.getElementById('result').classList.contains('show');")) break;
    }
  }
  // 用「id 集合是否出现新成员」判定，避免把上一轮残留 / 迟到消息算成本轮结果
  const ids = "state.presets.filter(function(p){return p.type==='pulse';}).map(function(p){return p.id;})";
  const before = await evaluate(ids);
  // 先确认 renderer 真的把保存消息交给了主程序（协议层，确定性证据）
  const sent = await evaluate(`(function(){
    var got=null, orig=window.postMessage;
    window.postMessage=function(m,t){ if(m && m.type==='rlondsp-pulse-save') got=m; return orig.apply(window, arguments); };
    document.getElementById('irStudioFrame').contentDocument.getElementById('btn-save-app').click();
    window.postMessage=orig;
    return got ? {type:got.type, name:got.name, sr:got.sampleRate, bytes:(got.wavBase64||'').length} : null;
  })()`);
  assert.ok(sent && sent.bytes > 1000, '保存消息应携带真实 WAV 数据交给主程序');
  // 面板提示 2.6 秒后会被还原，所以点击后立刻读一次，失败时能直接看出是哪一步没通
  await sleep(400);
  const flash = await inner("return d.getElementById('pmsg').textContent;");
  let added = [];
  // 保存要经过 postMessage → main → 写盘 → 回读，给足时间再判定
  for (let i = 0; i < 24 && added.length === 0; i++) {
    await sleep(500);
    const now = await evaluate(ids);
    added = now.filter((id) => !before.includes(id));
  }
  const onDisk = await evaluate("api.listPresets().then(function(list){return list.map(function(p){return p.id;}).filter(function(id){return /^(pulse-|probe-|big-)/.test(id);});})");
  assert.ok(added.length >= 1, `应新增一条脉冲预设（提示：${flash}；落盘条数：${onDisk.length}）`);
  for (const id of added) {
    const stored = await evaluate(`api.listPresets().then(function(list){return list.some(function(p){return p.id===${JSON.stringify(id)} && !!p.name;});})`);
    assert.ok(stored, `新预设应带名称落盘：${id}`);
  }
  for (const id of added) await evaluate(`api.deletePreset(${JSON.stringify(id)})`);
});
