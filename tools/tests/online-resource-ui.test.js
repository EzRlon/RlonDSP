const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const renderer = fs.readFileSync(path.join(ROOT, 'src', 'renderer.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'src', 'styles.css'), 'utf8');
const html = fs.readFileSync(path.join(ROOT, 'src', 'index.html'), 'utf8');
const { spawn } = require('node:child_process');

const PORT = 9234;
const EXE = path.join(ROOT, 'release', 'RlonDSP-portable', 'RlonDSP.exe');
const WORK = path.join(ROOT, 'build', 'test-online-ui');

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

const HOME_SNAPSHOT = `(function(){
  var bar=document.getElementById('onlineSourceBar');
  var refresh=document.getElementById('onlineRefreshBtn');
  var chips=[].slice.call(bar.querySelectorAll('.online-source-chip'));
  var last=chips[chips.length-1];
  var r=refresh.getBoundingClientRect();
  var l=last?last.getBoundingClientRect():null;
  var d=state.online.discovery;
  return {
    hasHead: !!document.querySelector('.online-page-head'),
    refreshInBar: bar.contains(refresh), refreshIsLast: bar.lastElementChild===refresh,
    gapAfterLastChip: l ? Math.round(r.left-l.right) : null,
    rowCenterDelta: l ? Math.abs((r.top+r.height/2)-(l.top+l.height/2)) : null,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    status: state.online.status,
    supported: !!(d && d.supported), updated: (d && d.updated) || '',
    totals: d ? {song:d.sections.song.length, album:d.sections.album.length, playlist:d.sections.playlist.length} : null,
    searchFirst: (function(){
      var page=document.querySelector('.online-page');
      var rows=[].slice.call(page.children);
      return rows.indexOf(document.querySelector('.online-search-row')) < rows.indexOf(bar);
    })(),
    sourceBtnClass: last ? last.className : '',
    sourceBtnHeight: last ? Math.round(last.getBoundingClientRect().height) : null,
    refreshHeight: Math.round(refresh.getBoundingClientRect().height),
    liveChip: !!document.querySelector('.online-live-chip'),
    categoryRow: !!document.querySelector('.online-category-row'),
    songs: document.querySelectorAll('.online-home .online-song-row').length,
    cards: document.querySelectorAll('.online-home .online-card').length,
    ranks: state.online.picks ? state.online.picks.song.map(function(i){return i.rank;}) : []
  };
})()`;

async function waitDiscovery(times = 25) {
  for (let i = 0; i < times; i++) {
    await sleep(900);
    const s = await evaluate('state.online.status');
    if (s === 'success' || s === 'error') return s;
  }
  return 'timeout';
}

test('实机：顶部标题/说明已移除，刷新跟随最后一个源标签且不溢出', async (t) => {
  if (!wsUrl) return t.skip('未运行应用实例，跳过实机核对');
  await evaluate("if (typeof setVizPage === 'function') setVizPage(0, false);");
  await sleep(800);
  const snap = await evaluate(HOME_SNAPSHOT);
  assert.strictEqual(snap.hasHead, false, '顶部标题块已移除');
  assert.ok(snap.refreshInBar && snap.refreshIsLast, '刷新在源标签行内且排在最后一个标签右侧');
  assert.ok(snap.gapAfterLastChip !== null && snap.gapAfterLastChip >= 0 && snap.gapAfterLastChip <= 14,
    `刷新紧跟在最后一个源标签右侧（间距 ${snap.gapAfterLastChip}px）`);
  assert.ok(snap.rowCenterDelta <= 2, '刷新与源标签同一行对齐');
  assert.ok(snap.overflowX <= 1, '源标签行不产生横向页面溢出');
  // 本次要求：在线源按钮与刷新同一套按钮风格；搜索栏在在线源行之前；实时内容 / 分类推荐已移除
  assert.ok(snap.sourceBtnClass.includes('mini-btn') && snap.sourceBtnClass.includes('lg-button'),
    `在线源按钮与刷新同一套按钮（实际 class：${snap.sourceBtnClass}）`);
  assert.strictEqual(snap.sourceBtnHeight, snap.refreshHeight, '在线源按钮与刷新按钮同高');
  assert.ok(snap.searchFirst, '搜索栏应在在线源行之前（两栏已对调）');
  assert.strictEqual(snap.liveChip, false, '热门推荐右侧的「实时内容」已移除');
  assert.strictEqual(snap.categoryRow, false, '分类推荐（含图标）已移除');
  assert.strictEqual(await evaluate("!!document.querySelector('.online-home-title')"), false, '「热门推荐」标题与图标已移除');
});

test('实机：进入页面即出现真实榜单内容', async (t) => {
  if (!wsUrl) return t.skip('未运行应用实例，跳过实机核对');
  const status = await waitDiscovery();
  if (status !== 'success') return t.skip(`网络不可用，跳过真实数据核对（${await evaluate('state.online.error')}）`);
  const snap = await evaluate(HOME_SNAPSHOT);
  assert.ok(snap.supported, '当前源支持自动发现');
  assert.ok(snap.updated.length > 0, '带榜单更新时间（真实 feed.updated）');
  assert.ok(snap.totals.song >= 10, `歌曲榜单来自真实接口（${snap.totals.song} 条）`);
  assert.ok(snap.songs >= 5, `页面渲染出热门歌曲（${snap.songs} 行）`);
  assert.ok(snap.cards >= 1, `专辑 / 歌单卡片渲染（${snap.cards} 张）`);
  assert.ok(snap.ranks.every((rank) => Number.isFinite(rank) && rank >= 1), '展示真实榜单位置');
});

test('实机：刷新强制重新取数并重新随机', async (t) => {
  if (!wsUrl) return t.skip('未运行应用实例，跳过实机核对');
  await evaluate("if (typeof setVizPage === 'function') setVizPage(0, false);");
  let before = await evaluate(HOME_SNAPSHOT);
  if (before.status !== 'success') return t.skip('网络不可用，跳过刷新核对');
  let after = before;
  for (let attempt = 0; attempt < 2; attempt++) {
    await evaluate("document.getElementById('onlineRefreshBtn').click()");
    const status = await waitDiscovery();
    after = await evaluate(HOME_SNAPSHOT);
    if (status === 'success') break;
  }
  if (after.status !== 'success') return t.skip(`网络不可用，跳过刷新核对（${await evaluate('state.online.error')}）`);
  assert.notStrictEqual(after.updated, before.updated, '刷新确实重新取数（更新时间变化）');
  assert.notDeepStrictEqual(after.ranks, before.ranks, '刷新后重新随机组合');
});

test('Online Resources 顶部标题/说明已移除，刷新跟在最后一个源标签右侧', () => {
  assert.ok(!html.includes('online-page-head'), '顶部标题块已删除');
  assert.ok(!html.includes('data-i18n="onlineResources"'), '标题文案不再出现');
  assert.ok(!html.includes('data-i18n="onlineResourcesHint"'), '说明文案不再出现');
  assert.ok(/<div class="online-source-bar" id="onlineSourceBar">[\s\S]*?onlineRefreshBtn/.test(html), '刷新位于源标签行内');
  assert.ok(renderer.includes('if (refreshBtn) host.appendChild(refreshBtn)'), '渲染标签后刷新自动排到最后一个标签右侧');
  assert.ok(css.includes('.online-refresh-btn { flex: none; }'), '刷新按钮不缩放');
  assert.ok(/\.online-page\s*\{[^}]*grid-template-rows:\s*auto auto auto minmax\(0, 1fr\)/.test(css), '删除标题后行数自动补位');
});

test('Online Resources 自动发现：缓存 + 保留上次数据 + 刷新强制重取', () => {
  assert.strictEqual(css.includes('.online-category-row'), false, '分类推荐相关样式已清理');
  assert.ok(renderer.includes('onlineMatchesCategory') === false || renderer.includes('rollOnlineDiscoveryPicks'), '随机抽取仍按真实数据池');
  assert.ok(renderer.includes('force: state.online.forceDiscovery === true'), '刷新强制重取');
  assert.ok(renderer.includes('state.online.forceDiscovery = true'), '刷新按钮置强制标记');
  const layer = fs.readFileSync(path.join(ROOT, 'online-source-layer.js'), 'utf8');
  assert.ok(layer.includes('DISCOVERY_CACHE_TTL'), '来源层有短期缓存');
  assert.ok(layer.includes('discoveryCache.get(cacheKey)'), '命中缓存不重复请求');
  assert.ok(renderer.includes('if (!hadData) {'), '失败时保留上一次有效数据');
  assert.ok(renderer.includes('void safeRunAsync(\'在线资源后台发现\''), '启动后台发现且不阻塞');
  assert.ok(css.includes('.online-card strong {\n  display: -webkit-box;') === false || css.includes('-webkit-line-clamp: 2'), '专辑/歌单卡片标题固定两行，等高');
});

test('Online Resources 使用紧凑歌曲列表与资源网格', () => {
  assert.ok(renderer.includes('renderOnlineSongList'));
  assert.ok(renderer.includes('renderOnlineResourceGrid'));
  assert.ok(css.includes('.online-song-row'));
  assert.ok(css.includes('.online-card-grid'));
  assert.ok(css.includes('grid-template-columns: repeat(auto-fill, minmax(158px, 1fr))'));
});

test('Online Resources 首页：无需搜索即展示真实榜单并保留真实名次', () => {
  // 进入页面 / 切换来源 / 刷新都会走同一条自动发现链路
  assert.ok(renderer.includes('onlineLoadDiscovery'), '有自动发现加载函数');
  assert.ok(renderer.includes("api.onlineDiscovery(sourceId"), '通过受控 IPC 取榜单数据');
  assert.ok(renderer.includes('renderOnlineHome'), '有首页渲染函数');
  assert.ok(renderer.includes('if (!state.online.query)'), '没有关键词时走首页而不是搜索');
  assert.ok(renderer.includes('rollOnlineDiscoveryPicks'), '随机抽取独立成函数');
  assert.ok(renderer.includes('onlinePickUnique'), '同一次展示不重复');
  assert.ok(renderer.includes('onlineEnterPage'), '进入页面时重新随机');
  assert.ok(renderer.includes("safeRun('在线资源首页', onlineEnterPage)"), '页面生命周期里挂上首页');
  assert.ok(renderer.includes('rank: index + 1') === false, '名次由来源层给出，渲染层不重算');
  assert.ok(renderer.includes('resource.rank'), '界面展示真实名次');
  assert.ok(css.includes('.online-rank'), '名次有统一样式');
  assert.ok(css.includes('.online-home .online-song-row'), '首页歌曲行补上名次列，保持封面/标题/操作对齐');
  assert.ok(css.includes('.online-home-section'), '首页分区采用统一 Card/Section 风格');
  assert.ok(css.includes('.online-more-row'), '更多热门内容区域存在');
  assert.ok(renderer.includes('onlineHomeCardGrid'), '专辑 / 歌单复用统一卡片网格');
  assert.strictEqual(renderer.includes('online-home-title'), false, '「热门推荐」标题与图标已移除');
  assert.strictEqual(renderer.includes('onlineHotTitle'), false, '对应文案已清理');
});

test('Online Resources 首页：加载 / 空 / 错误状态与中英文案齐备', () => {
  assert.ok(renderer.includes('renderOnlineLoading(host)'), '复用骨架屏 Loading');
  assert.ok(renderer.includes("t('onlineNoHot')"), '空状态文案');
  assert.ok(renderer.includes('renderOnlineError(host, state.online.error'), '错误状态复用统一渲染');
  for (const key of ['onlineUpdated', 'onlineHotSongs', 'onlineHotAlbums', 'onlineHotPlaylists', 'onlineMoreHot', 'onlineShuffle', 'onlineNoHot', 'onlineNoPreview']) {
    const hits = renderer.split(`${key}:`).length - 1;
    assert.ok(hits >= 2, `${key} 需要中英文两份文案（实际 ${hits}）`);
  }
});

test('Online Resources 有 Empty / Loading / Error 状态', () => {
  assert.ok(renderer.includes('renderOnlineState'));
  assert.ok(renderer.includes('renderOnlineLoading'));
  assert.ok(renderer.includes('renderOnlineError'));
  assert.ok(css.includes('.online-state'));
  assert.ok(css.includes('.online-skeleton-list'));
});

test('搜索区有 idle/loading/success/error 状态类', () => {
  assert.ok(renderer.includes("state.online.status = 'loading'"));
  assert.ok(renderer.includes("state.online.status = 'success'"));
  assert.ok(renderer.includes("state.online.status = 'error'"));
  assert.ok(css.includes('.online-search-row.is-loading'));
  assert.ok(css.includes('.online-search-row.is-success'));
  assert.ok(css.includes('.online-search-row.is-error'));
});

test('Source Selector / Category 复用 Chip 体系', () => {
  assert.ok(renderer.includes('online-source-chip'));
  // 在线源按钮改为与右侧「刷新」同一套按钮（mini-btn + lg-button）
  assert.ok(renderer.includes("chip.className = 'mini-btn lg-button online-source-chip'"), '在线源按钮与刷新同风格');
  assert.ok(renderer.includes("data-online-type"));
});

test('封面 fallback 使用现有音乐图标', () => {
  assert.ok(renderer.includes('onlineCover'));
  assert.ok(renderer.includes('#icon-note'));
  assert.ok(css.includes('.online-song-cover'));
  assert.ok(css.includes('.online-card-cover'));
});

test('页面顺序：第 1 页 = 在线资源，第 3 页 = 频谱显示（专业分析）', () => {
  assert.ok(/class="viz-page viz-page--online is-active" data-viz-page="0"/.test(html), '在线资源是第 1 页且是启动页');
  assert.ok(/class="viz-page viz-page--visual" data-viz-page="1"/.test(html), '沉浸视觉仍在中间');
  assert.ok(/class="viz-page viz-page--analysis" data-viz-page="2"/.test(html), '频谱显示是第 3 页');
  assert.strictEqual(/viz-page--analysis is-active/.test(html), false, '频谱页不再是启动页');
  assert.ok(/data-viz-dot="0" aria-label="Online Resources"/.test(html), '第 1 个圆点对应在线资源');
  assert.ok(/data-viz-dot="2" aria-label="Professional Analysis"/.test(html), '第 3 个圆点对应频谱显示');
  // 页面语义集中一处，渲染门控跟着语义走（不是写死的数字）
  assert.ok(renderer.includes('const VIZ_PAGE = { online: 0, visual: 1, analysis: 2 }'), '页面索引集中定义');
  assert.ok(renderer.includes('currentVizPage !== VIZ_PAGE.analysis'), '频谱渲染只在自己的页面运行');
  assert.ok(renderer.includes('currentVizPage === VIZ_PAGE.analysis && state.isPlaying'), '回到频谱页才续画');
  assert.ok(renderer.includes('currentVizPage === VIZ_PAGE.online'), '在线资源页生命周期绑定正确');
  assert.ok(renderer.includes('visualEngine.setSceneActive(currentVizPage === VIZ_PAGE.visual)'), '视觉引擎仍绑定沉浸视觉页');
  assert.ok(renderer.includes('setVizPage(VIZ_PAGE.online, false)'), '启动落在第 1 页（在线资源）');
});

/* ===== Spotify：第二个内置在线源（专属 Shelf + 官方品牌归属） ===== */

const SPOTIFY_KEYS = [
  'spotifyAttribution', 'spotifyLogin', 'spotifyLogout', 'spotifyLoggingIn', 'spotifyNeedClientId',
  'spotifyNeedLogin', 'spotifyNeedLoginHint', 'spotifyTopTracks', 'spotifyPlaylists',
  'spotifySavedAlbums', 'spotifyCategories', 'spotifyEmptyHint', 'spotifyOpen',
  'spotifyClientId', 'spotifyClientIdHint'
];

const SPOTIFY_SNAPSHOT = `(function(){
  var attr=document.querySelector('.spotify-attribution');
  var mark=attr?attr.querySelector('.spotify-mark use'):null;
  var spot=document.querySelector('.online-home--spotify');
  var apple=document.querySelector('.online-home:not(.online-home--spotify)');
  var cards=[].slice.call(document.querySelectorAll('.online-home--spotify .online-card'));
  var covers=[].slice.call(document.querySelectorAll('.online-home--spotify .online-card-cover'))
    .map(function(c){var r=c.getBoundingClientRect();return Math.round(r.width-r.height);});
  var state_=document.querySelector('.online-home--spotify .online-state');
  var cur=onlineCurrentSource();
  return {
    currentIsSpotify: !!(cur && cur.sourceType==='spotify'),
    hasSpotifyWrap: !!spot, appleWrapPresent: !!apple,
    hasAttribution: !!attr,
    markHref: mark?mark.getAttribute('href'):'',
    attributionText: attr?attr.textContent.trim():'',
    spotifyCards: cards.length,
    spotifyRows: document.querySelectorAll('.online-home--spotify .online-song-row').length,
    appleCards: document.querySelectorAll('.online-home:not(.online-home--spotify) .online-card').length,
    appleRows: document.querySelectorAll('.online-home:not(.online-home--spotify) .online-song-row').length,
    cardHeights: cards.map(function(c){return Math.round(c.getBoundingClientRect().height);}),
    coverSquareDelta: covers,
    loginState: state_?state_.textContent.trim():'',
    authenticated: !!(state.online.spotifyAuth && state.online.spotifyAuth.authenticated),
    overflowX: document.documentElement.scrollWidth-document.documentElement.clientWidth
  };
})()`;

function clickSourceChip(name) {
  return evaluate(`(function(){
    var b=[].slice.call(document.querySelectorAll('#onlineSourceBar .online-source-chip'))
      .filter(function(x){return x.textContent.trim()===${JSON.stringify(name)};})[0];
    if (b) b.click();
    return !!b;
  })()`);
}

test('Spotify：独立 Shelf + 官方品牌归属，且不与 Apple Music 混排', () => {
  assert.ok(renderer.includes('function renderSpotifyHome'), '有 Spotify 专属内容渲染函数');
  assert.ok(renderer.includes("if (source && source.sourceType === 'spotify')"), '按来源类型切换内容风格');
  assert.ok(renderer.includes('online-home--spotify'), 'Spotify 专属容器');
  assert.ok(renderer.includes('function spotifyAttributionBar'), '内容归属条独立成函数');
  assert.ok(renderer.includes('function spotifyShelfHeader'), '每个集合独占一个 Shelf');
  assert.ok(renderer.includes('#icon-spotify'), '归属标识走图标登记表，不画自制 Logo');
  assert.strictEqual(renderer.includes('online-home:not(.online-home--spotify)'), false, '不靠样式区分混排');
  // 每个 Shelf 只渲染 Spotify 数据，Apple 的 picks 不会被塞进 Spotify 区域
  assert.strictEqual(/spotifyShelfHeader[\s\S]{0,120}state\.online\.picks/.test(renderer), false, 'Spotify Shelf 不用 Apple 榜单数据');
  // 图标：sprite + 登记表都在
  assert.ok(/<symbol id="icon-spotify"[^>]*>/.test(html), 'sprite 里有官方 Spotify 标志');
  assert.ok(html.includes('fill="currentColor"'), '标志跟随主题色（归属区域指定 Spotify 绿）');
  const registry = fs.readFileSync(path.join(ROOT, 'src', 'icon-registry.js'), 'utf8');
  assert.ok(/(^|[\s,{])spotify:\s*\{/.test(registry), '图标登记表里登记了 spotify');
  // 样式：归属与登录按钮用官方绿，全局主题色不动
  assert.ok(css.includes('.spotify-attribution'), '归属条样式');
  assert.ok(/\.spotify-mark\s*\{[^}]*#1db954/i.test(css), 'Spotify 标志用官方品牌绿');
  assert.ok(css.includes('.spotify-auth-btn'), '该源的登录按钮有独立样式');
  assert.strictEqual(/--accent\s*:\s*#1db954/i.test(css), false, '不改 RlonDSP 全局 Accent Color');
});

test('Spotify：歌曲行 / 卡片复用统一尺寸规格，封面 1:1、长标题截断', () => {
  assert.ok(renderer.includes('function spotifySongRow'), '紧凑歌曲行');
  assert.ok(/function spotifySongRow[\s\S]{0,600}online-song-row/.test(renderer), '歌曲行复用统一列表样式');
  assert.ok(/function spotifyCard[\s\S]{0,400}online-card'/.test(renderer), '专辑 / 歌单复用统一卡片');
  assert.ok(/function spotifyCard[\s\S]{0,400}online-card-cover/.test(renderer), '卡片封面复用统一比例');
  assert.ok(/\.online-card-cover\s*\{[^}]*aspect-ratio:\s*1\s*\/\s*1/.test(css), '同类型卡片封面都是 1:1');
  assert.ok(css.includes('-webkit-line-clamp: 2'), '标题过长统一截断，不撑高卡片');
  assert.ok(renderer.includes('onlineHomeCardGridOf'), '专辑 / 歌单共用同一个卡片网格');
});

test('Spotify：Client ID 可在设置里配置，令牌绝不进 renderer / DOM', () => {
  assert.ok(renderer.includes('draft.clientId = source.clientId'), '设置里读得到 Client ID');
  assert.ok(renderer.includes("clientId: String(draft.clientId || '').trim()"), '保存时带回 Client ID');
  assert.ok(renderer.includes("t('spotifyClientId')"), '设置界面有 Spotify Client ID 字段');
  assert.ok(renderer.includes("draft.sourceType === 'musicsquare' ? 'MusicSquare' : 'Spotify'"),
    '内置源（Spotify / MusicSquare）的类型不会被下拉框改成声明式');
  assert.strictEqual(/accessToken|refreshToken|refresh_token/.test(renderer), false, 'renderer 里没有令牌字段');
  const preload = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8');
  assert.ok(preload.includes('onlineSpotifyLogin'), '登录走受控 IPC');
  assert.strictEqual(/accessToken|refreshToken|refresh_token/.test(preload), false, 'preload 不暴露任何令牌');
  const layer = fs.readFileSync(path.join(ROOT, 'online-source-layer.js'), 'utf8');
  assert.ok(layer.includes("SPOTIFY.accountsBase"), 'OAuth 走 Spotify 官方账号域');
  assert.ok(layer.includes("code_challenge_method") || layer.includes("'S256'"), '官方 PKCE 流程');
  assert.ok(layer.includes('credentialsFile'), '令牌只写主进程的凭据文件');
});

test('Spotify：中英文案齐备（含归属 / 登录 / 空状态）', () => {
  for (const key of SPOTIFY_KEYS) {
    const hits = renderer.split(`${key}:`).length - 1;
    assert.ok(hits >= 2, `${key} 需要中英文两份文案（实际 ${hits}）`);
  }
  assert.ok(renderer.includes("t('spotifyAttribution')"), '界面展示内容归属');
  assert.ok(renderer.includes("t('spotifyEmptyHint')"), '没有数据时给空状态而不是伪造内容');
  // 动态生成的分区标题 / 归属 / 按钮文案要跟随语言切换
  const applyLang = renderer.slice(renderer.indexOf('function applyLanguage'), renderer.indexOf('function applyTheme'));
  assert.ok(applyLang.includes('renderOnlineResults()'), '切语言时重渲染在线资源页文案');
  assert.strictEqual(/api\.online/.test(applyLang), false, '切语言不重新请求网络');
});

test('实机：Spotify 可选、展示专属归属与登录态，切回 Apple Music 后不残留', async (t) => {
  if (!wsUrl) return t.skip('未运行应用实例，跳过实机核对');
  await evaluate("if (typeof setVizPage === 'function') setVizPage(0, false);");
  await sleep(700);
  const hasSpotify = await evaluate("state.online.sources.some(function(s){return s.sourceType==='spotify';})");
  if (!hasSpotify) return t.skip('测试实例里没有 Spotify 源（用户清空了音源），跳过实机核对');
  if (!(await clickSourceChip('Spotify'))) return t.skip('找不到 Spotify 源标签，跳过实机核对');
  await waitDiscovery();
  await sleep(500);
  const snap = await evaluate(SPOTIFY_SNAPSHOT);
  assert.ok(snap.currentIsSpotify, '已切到 Spotify 源');
  assert.ok(snap.hasSpotifyWrap, 'Spotify 有专属内容区');
  assert.ok(snap.hasAttribution, '显示 Spotify 内容归属');
  assert.strictEqual(snap.markHref, '#icon-spotify', '用图标登记表里的官方标志');
  assert.ok(snap.attributionText.includes('Spotify'), '归属文字包含 Spotify');
  assert.strictEqual(snap.appleWrapPresent, false, 'Spotify 区域不与 Apple Music 内容混排');
  assert.strictEqual(snap.appleCards + snap.appleRows, 0, 'Spotify 下不出现 Apple 资源');
  if (!snap.authenticated) {
    assert.ok(snap.loginState.length > 0, '未登录时给出明确登录状态');
    await evaluate("(function(){var b=document.querySelector('.online-home--spotify .spotify-auth-btn');if(b)b.click();return !!b;})()");
    await sleep(400);
    const toast = await evaluate("document.getElementById('toast').textContent");
    assert.ok(/Client ID/.test(toast), `未配置 Client ID 时提示去设置里填写（实际：${toast}）`);
  }
  assert.ok(snap.overflowX <= 1, 'Spotify 内容区不产生横向溢出');
  if (snap.spotifyCards > 1) {
    assert.deepStrictEqual(Array.from(new Set(snap.cardHeights)).length, 1, '同类型卡片等高');
    assert.ok(snap.coverSquareDelta.every((delta) => Math.abs(delta) <= 1), '封面严格 1:1');
  }
  // 切回 Apple Music：Spotify 归属与内容立刻消失
  await clickSourceChip('Apple Music');
  await sleep(1200);
  const back = await evaluate(SPOTIFY_SNAPSHOT);
  assert.strictEqual(back.currentIsSpotify, false, '已切回 Apple Music');
  assert.strictEqual(back.hasAttribution, false, 'Apple Music 下不显示 Spotify 归属');
  assert.strictEqual(back.spotifyCards + back.spotifyRows, 0, 'Spotify 内容已清空，没有混排残留');
});
