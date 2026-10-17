/*
 * RlonDSP
 * Copyright © 2026 RlonDSP. All rights reserved.
 * Based on Echomusic open-source project, modified and extended for RlonDSP.
 *
 * 预设操作调整专项测试（本轮任务）
 * ---------------------------------------------------------------------------
 * 静态部分：
 *   1. 顶部全局「保存」「重置」按钮及其事件绑定已彻底移除（不留占位）；
 *   2. 每条预设卡片新增自己的「重置」，位置在【删除】右侧，图标来自既有登记表；
 *   3. 单条重置只作用于这一条预设（不使用全局 resetEffects，且只在它正在使用时同步实时音效）；
 *   4. 预设持久化能力与导入 / 导出 / 新建入口保持不变；
 *   5. 上一条要求（RlonIR_3 消失、限幅在最后）仍然成立。
 *
 * 实机部分（应用在 9234 调试端口运行时才执行，否则自动跳过）：
 *   6. 预设卡片渲染出「删除 + 重置」两个按钮，顺序正确，顶部按钮确实不存在；
 *   7. 点某一条的重置：只把这条恢复默认，其它预设不变；
 *   8. 该预设没被使用时，重置它不会动到正在播放的实时音效。
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HTML = fs.readFileSync(path.join(ROOT, 'src', 'index.html'), 'utf8');
const RENDERER = fs.readFileSync(path.join(ROOT, 'src', 'renderer.js'), 'utf8');

/*
 * 实机部分沿用既有约定：应用在 9234 调试端口上运行时直接连它；
 * 没有实例时按同样方式起一个临时小号（独立配置目录），跑完关掉。
 * 因为多个测试文件会共用同一个实例，这里所有量尺寸 / 读状态都先「等布局」
 * 并「与磁盘对齐一次」，避免把别的测试文件造成的瞬时状态当成失败。
 */
const PORT = 9234;
const EXE = path.join(ROOT, 'release', 'RlonDSP-portable', 'RlonDSP.exe');
const WORK = path.join(ROOT, 'build', 'test-preset-reset');

function functionBody(source, name) {
  const start = source.indexOf(`async function ${name}(`);
  if (start < 0) return '';
  const end = source.indexOf('\n}\n', start);
  return end < 0 ? source.slice(start) : source.slice(start, end + 3);
}

test('顶部全局「保存」「重置」入口已彻底删除', () => {
  assert.ok(!HTML.includes('savePresetBtn'), 'index.html 不应再出现顶部保存按钮');
  assert.ok(!HTML.includes('resetFxBtn'), 'index.html 不应再出现顶部重置按钮');
  assert.ok(!RENDERER.includes("'savePresetBtn'"), 'renderer 不应再绑定顶部保存');
  assert.ok(!RENDERER.includes("'resetFxBtn'"), 'renderer 不应再绑定顶部重置');
  // 同一行的其它入口必须保留
  for (const id of ['fxMasterEnabledBtn', 'createPresetBtn', 'presetListViewport']) {
    assert.ok(HTML.includes(`id="${id}"`), `保留入口：${id}`);
  }
});

test('导入 / 导出已下移到每条预设卡片的重置右侧', () => {
  assert.ok(!HTML.includes('exportPresetBtn'), '顶部不再有导出按钮');
  assert.ok(!HTML.includes('importPresetBtn'), '顶部不再有导入按钮');
  assert.ok(!RENDERER.includes("'exportPresetBtn'"), '顶部导出绑定已移除');
  assert.ok(!RENDERER.includes("'importPresetBtn'"), '顶部导入绑定已移除');

  assert.ok(RENDERER.includes('data-preset-export="${preset.id}"'), '每条预设新增导出按钮');
  assert.ok(RENDERER.includes('data-preset-import="${preset.id}"'), '每条预设新增导入按钮');
  assert.ok(RENDERER.includes('href="#icon-export"') && RENDERER.includes('href="#icon-import"'), '沿用登记表里的导入导出图标');

  const row = RENDERER.slice(RENDERER.indexOf('row.innerHTML = `'), RENDERER.indexOf("row.querySelector('[data-preset-name]')"));
  const order = ['data-preset-del=', 'data-preset-reset=', 'data-preset-export=', 'data-preset-import=']
    .map((key) => row.indexOf(key));
  assert.ok(order.every((at, i) => at >= 0 && (i === 0 || at > order[i - 1])), `按钮顺序应为 删除 → 重置 → 导出 → 导入（实际 ${order.join(',')}）`);

  assert.ok(RENDERER.includes('exportPreset(btn.dataset.presetExport)'), '导出按钮带本卡 id');
  assert.ok(RENDERER.includes('importPreset(btn.dataset.presetImport)'), '导入按钮带本卡 id');
});

test('单卡导入 / 导出只作用于这一条预设', () => {
  const exp = functionBody(RENDERER, 'exportPreset');
  assert.ok(exp.includes('state.presets.find((item) => item.id === targetId)'), '导出按卡片 id 取预设');
  assert.ok(exp.includes('api.exportPreset('), '导出沿用既有导出通道');

  const imp = functionBody(RENDERER, 'importPreset');
  assert.ok(imp.includes('state.presets.find((item) => item.id === id)'), '导入按卡片 id 取预设');
  assert.ok(imp.includes('preset.effects = incoming.effects'), '导入只覆盖这一条预设的内容');
  assert.ok(imp.includes('state.presets = await api.savePreset(preset)'), '写回的是这一条');
  assert.ok(imp.includes('if (activePresetId === preset.id) applyPreset(preset)'), '只有该卡正在使用时才同步实时音效');
  assert.ok(!imp.includes('preset-${Date.now()}'), '不再新建第二条预设');
});

test('每条预设卡片在【删除】右侧新增自己的【重置】', () => {
  assert.ok(RENDERER.includes('data-preset-reset="${preset.id}"'), '预设行里新增重置按钮');
  assert.ok(RENDERER.includes("title=\"${t('reset')}\""), '重置按钮沿用既有 i18n 文案');
  assert.ok(RENDERER.includes('href="#icon-reset"'), '重置按钮使用登记表里的 reset 图标');

  // 位置：删除在前、重置紧随其后，且都在同一组操作按钮里
  const row = RENDERER.slice(RENDERER.indexOf('row.innerHTML = `'), RENDERER.indexOf('row.querySelector(\'[data-preset-name]\')'));
  const delAt = row.indexOf('data-preset-del=');
  const resetAt = row.indexOf('data-preset-reset=');
  assert.ok(delAt >= 0 && resetAt > delAt, '重置必须排在删除右侧');

  assert.ok(RENDERER.includes("list.querySelectorAll('[data-preset-reset]')"), '重置按钮被统一绑定');
  assert.ok(RENDERER.includes('resetPreset(btn.dataset.presetReset)'), '点击调用单条重置');
});

test('单条重置只影响这一条预设', () => {
  const body = functionBody(RENDERER, 'resetPreset');
  assert.ok(body.length > 100, '存在 resetPreset 实现');
  assert.ok(body.includes('preset.effects = deepClone(defaultEffects)'), '复用既有默认值规则');
  assert.ok(body.includes('api.savePreset(preset)'), '只写回这一条预设');
  assert.ok(body.includes('if (activePresetId === id) applyPreset(preset)'), '只有该预设正在使用时才同步实时音效');
  assert.ok(!body.includes('resetEffects('), '不得调用全局重置');
  assert.ok(!/state\.effects\s*=/.test(body), '不得直接改写整条实时音效状态');
  assert.ok(RENDERER.includes('async function deletePreset(id)'), '删除能力保持');
  assert.ok(RENDERER.includes('async function createPreset()'), '新建能力保持');
});

test('上一条要求仍成立：RlonIR_3 不存在、限幅在最后', () => {
  assert.ok(RENDERER.includes("DEPRECATED_PRESET_NAMES = new Set(['RlonIR_3'])"));
  assert.ok(!HTML.includes('RlonIR_3'), '界面里不再出现 RlonIR_3');
  const ids = [...HTML.matchAll(/class="fx-section" id="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(ids.length > 0);
  assert.strictEqual(ids[ids.length - 1], 'limiterParams', '限幅仍是最后一项');
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

/** 等「实时音效」页真正布局好（预设行有实际宽度）再量尺寸，避免量到隐藏状态 */
async function waitForPresetLayout(attempts = 12) {
  for (let i = 0; i < attempts; i++) {
    await evaluate("document.getElementById('effectsModal').hidden=false; selectFxTab('realtime');");
    await sleep(250);
    const ready = await evaluate(`(function(){
      var vp=document.getElementById('presetListViewport');
      var rows=[].slice.call(document.querySelectorAll('#presetList .preset-row'));
      return vp.clientHeight > 0 && rows.every(function(r){ return r.getBoundingClientRect().width > 40; });
    })()`);
    if (ready) return true;
  }
  return false;
}

/** 把内存里的预设列表与磁盘对齐，避免并行操作导致视图过期 */
async function resyncPresets() {
  await evaluate("api.listPresets().then(function(list){ state.presets = list; renderPresets(); return list.length; })");
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

test.before(async () => {
  wsUrl = await findEndpoint();
  if (wsUrl) return;
  if (!fs.existsSync(EXE)) return;
  const dataDir = path.join(WORK, 'userdata');
  fs.mkdirSync(dataDir, { recursive: true });
  child = spawn(EXE, [`--remote-debugging-port=${PORT}`, '--remote-allow-origins=*', `--user-data-dir=${dataDir}`],
    { cwd: path.dirname(EXE), stdio: 'ignore' });
  for (let i = 0; i < 60; i++) {
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

test('实机：预设卡片有【删除】【重置】，顶部按钮消失', async (t) => {
  if (!wsUrl) return t.skip('未运行应用实例，跳过实机核对');
  await waitForPresetLayout();

  const report = await evaluate(`(function(){
    var rows=[].slice.call(document.querySelectorAll('#presetList .preset-row'));
    return {
      save: !!document.getElementById('savePresetBtn'),
      reset: !!document.getElementById('resetFxBtn'),
      exportTop: !!document.getElementById('exportPresetBtn'),
      importTop: !!document.getElementById('importPresetBtn'),
      rows: rows.length,
      actions: rows.map(function(r){
        var pick=function(sel){ return r.querySelector(sel); };
        var del=pick('[data-preset-del]'), res=pick('[data-preset-reset]');
        var exp=pick('[data-preset-export]'), imp=pick('[data-preset-import]');
        if(!del||!res||!exp||!imp) return null;
        if(del.getBoundingClientRect().width <= 0) return null;
        return [del,res,exp,imp].map(function(b){ return Math.round(b.getBoundingClientRect().left); });
      })
    };
  })()`);
  assert.strictEqual(report.save, false, '顶部保存按钮不存在');
  assert.strictEqual(report.reset, false, '顶部重置按钮不存在');
  assert.strictEqual(report.exportTop, false, '顶部导出按钮不存在');
  assert.strictEqual(report.importTop, false, '顶部导入按钮不存在');
  const measured = report.actions.filter(Boolean);
  if (report.rows > 0) {
    for (const lefts of measured) {
      assert.ok(lefts[0] > 0 && lefts.every((x, i) => i === 0 || x > lefts[i - 1]),
        `每条预设应为 删除 → 重置 → 导出 → 导入 且自左向右排列（实际 ${lefts.join(',')}）`);
    }
  }
});

test('实机：重置只作用于这一条预设', async (t) => {
  if (!wsUrl) return t.skip('未运行应用实例，跳过实机核对');
  const created = [];
  try {
    // 造两条预设：先让实时音效处于非默认状态，两条都保存成这样的内容
    const setup = await evaluate(`(function(){
      var sw=document.getElementById('fxCompressor');
      sw.checked=false; sw.dispatchEvent(new Event('change',{bubbles:true}));
      var ratio=document.getElementById('compRatio');
      ratio.value='9'; ratio.dispatchEvent(new Event('input',{bubbles:true}));
      return state.effects.enabled.compressor;
    })()`);
    assert.strictEqual(setup, false, '前置：实时音效已被改成非默认');

    for (const name of ['ResetScope_A', 'ResetScope_B']) {
      await evaluate(`(function(){
        var input=document.getElementById('presetNameInput');
        input.value=${JSON.stringify('')} + arguments[0];
        input.dataset.auto='0';
        document.getElementById('createPresetBtn').click();
      })("${name}")`);
      await sleep(700);
    }
    await resyncPresets(); // 并行测试可能改过内存视图，按磁盘为准再读
    const list = await evaluate("state.presets.filter(function(p){return p.name==='ResetScope_A'||p.name==='ResetScope_B';}).map(function(p){return {id:p.id,name:p.name,effects:p.effects};})");
    assert.strictEqual(list.length, 2, '两条测试预设已建立');
    list.forEach((p) => created.push(p.id));
    const [a, b] = list;
    assert.strictEqual(a.effects.enabled.compressor, false, '预设 A 保存的是非默认状态');

    // A 打开（成为当前使用的预设），再点 A 自己的重置
    await evaluate(`(function(){
      var t=document.querySelector('[data-preset-toggle="${a.id}"]');
      t.checked=true; t.dispatchEvent(new Event('change',{bubbles:true}));
    })()`);
    await sleep(500);
    await evaluate(`document.querySelector('[data-preset-reset="${a.id}"]').click()`);
    await sleep(900);
    await resyncPresets();

    const afterA = await evaluate(`(function(){
      var found=state.presets.filter(function(p){return p.name==='ResetScope_A'||p.name==='ResetScope_B';});
      return {
        a: found.find(function(p){return p.name==='ResetScope_A';}),
        b: found.find(function(p){return p.name==='ResetScope_B';}),
        defaults: defaultEffects,
        live: state.effects,
        active: activePresetId
      };
    })()`);
    assert.strictEqual(JSON.stringify(afterA.a.effects), JSON.stringify(afterA.defaults), 'A 被恢复成默认值');
    assert.strictEqual(JSON.stringify(afterA.b.effects), JSON.stringify(b.effects), 'B 的内容完全没被动过');
    assert.strictEqual(afterA.active, a.id, '重置不会取消当前使用的预设');
    assert.strictEqual(JSON.stringify(afterA.live), JSON.stringify(afterA.defaults), '当前使用的预设被重置后实时音效同步为默认');

    // 把实时音效再改回非默认，然后重置「没在使用」的 B：实时音效必须不受影响
    await evaluate(`(function(){
      var sw=document.getElementById('fxCompressor');
      sw.checked=false; sw.dispatchEvent(new Event('change',{bubbles:true}));
    })()`);
    await sleep(400);
    const liveBefore = await evaluate("JSON.stringify(state.effects)");
    await evaluate(`document.querySelector('[data-preset-reset="${b.id}"]').click()`);
    await sleep(900);
    await resyncPresets();
    const afterB = await evaluate(`(function(){
      var found=state.presets.filter(function(p){return p.name==='ResetScope_A'||p.name==='ResetScope_B';});
      return {
        a: found.find(function(p){return p.name==='ResetScope_A';}),
        b: found.find(function(p){return p.name==='ResetScope_B';}),
        defaults: defaultEffects,
        live: JSON.stringify(state.effects),
        active: activePresetId
      };
    })()`);
    assert.strictEqual(JSON.stringify(afterB.b.effects), JSON.stringify(afterB.defaults), 'B 被恢复成默认值');
    assert.strictEqual(JSON.stringify(afterB.a.effects), JSON.stringify(afterA.a.effects), 'A 不受 B 的重置影响');
    assert.strictEqual(afterB.live, liveBefore, '没在使用的预设被重置时，实时音效保持原样');
    assert.strictEqual(afterB.active, a.id, '当前使用中的预设不变');
  } finally {
    for (const id of created) {
      await evaluate(`api.deletePreset(${JSON.stringify(id)})`).catch(() => {});
    }
    await evaluate("renderPresets()").catch(() => {});
  }
});

test('实机：预设变多只滚动预设区，弹窗外框不变且新建自动定位', async (t) => {
  if (!wsUrl) return t.skip('未运行应用实例，跳过实机核对');
  const created = [];
  try {
    // 其它测试文件可能把弹窗切到脉冲页或临时关掉，这里先恢复到「实时音效」页再量尺寸
    await waitForPresetLayout();
    for (let i = 1; i <= 8; i++) {
      await evaluate(`(function(){
        var input=document.getElementById('presetNameInput');
        input.value='Scroll_${i}'; input.dataset.auto='0';
        document.getElementById('createPresetBtn').click();
      })()`);
      await sleep(400);
    }
    // 并行测试会切页签 / 改窗口尺寸，所以整段「新建 → 量尺寸」在稳定的一次里完成，不达标就重试
    let report = null;
    for (let attempt = 1; attempt <= 4 && !report; attempt++) {
      await waitForPresetLayout();
      await resyncPresets();
      created.length = 0;
      created.push(...await evaluate("state.presets.filter(function(p){return /^Scroll_[0-9]+$/.test(p.name);}).map(function(p){return p.id;})"));
      const h1 = await evaluate(`(function(){
        var h=Math.round(document.querySelector('.effects-card').getBoundingClientRect().height);
        var input=document.getElementById('presetNameInput');
        input.value='Scroll_${8 + attempt}'; input.dataset.auto='0';
        document.getElementById('createPresetBtn').click();
        return h;
      })()`);
      await sleep(600);
      const measured = await evaluate(`(function(){
        var vp=document.getElementById('presetListViewport');
        var rows=[].slice.call(document.querySelectorAll('#presetList .preset-row'));
        var box=vp.getBoundingClientRect();
        var last=rows[rows.length-1] ? rows[rows.length-1].getBoundingClientRect() : null;
        return {
          rows: rows.length,
          scrollH: vp.scrollHeight,
          viewportH: vp.clientHeight,
          scrollable: vp.scrollHeight > vp.clientHeight + 1,
          lastVisible: !!last && last.bottom <= box.bottom + 1 && last.top >= box.top - 1,
          popupH: Math.round(document.querySelector('.effects-card').getBoundingClientRect().height)
        };
      })()`);
      if (measured.rows >= 8 && measured.viewportH > 0 && measured.lastVisible && measured.popupH === h1) {
        report = Object.assign({ popupBefore: h1 }, measured);
      } else {
        await sleep(400);
      }
    }
    assert.ok(report, '未能在稳定状态下量到预设区尺寸（可能被并行测试反复打断）');
    assert.ok(report.rows >= 8, `预设行应渲染出来，实际 ${report.rows}`);
    assert.ok(report.viewportH > 0, `预设区应可见并有高度，实际 ${report.viewportH}`);
    assert.ok(report.scrollable, `预设数量超出后应只让预设区纵向滚动（内容 ${report.scrollH} / 可视 ${report.viewportH}）`);
    assert.ok(report.lastVisible, '新建的预设应自动滚动到可见位置');
    assert.strictEqual(report.popupH, report.popupBefore, '弹窗外框大小不应随预设数量变化');
  } finally {
    for (const id of created) {
      await evaluate(`api.deletePreset(${JSON.stringify(id)})`).catch(() => {});
    }
    await evaluate("renderPresets()").catch(() => {});
  }
});
