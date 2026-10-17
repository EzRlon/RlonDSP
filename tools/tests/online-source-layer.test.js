const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { createOnlineSourceManager } = require('../../online-source-layer');

function makeResponse(status, body, location) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => (name.toLowerCase() === 'location' ? location || null : null) },
    arrayBuffer: async () => Buffer.from(typeof body === 'string' ? body : JSON.stringify(body))
  };
}

function validSource(overrides = {}) {
  return {
    name: 'Test Source',
    sourceType: 'declarative',
    baseUrl: 'https://music.example.com',
    enabled: true,
    auth: { type: 'bearer', headerName: 'Authorization', prefix: 'Bearer ' },
    search: {
      method: 'GET',
      path: '/search',
      query: { q: '{query}', limit: '{limit}' },
      itemsPath: 'data',
      fields: { id: 'id', title: 'title', artist: 'artist', album: 'album', duration: 'duration', coverUrl: 'cover' }
    },
    detail: { method: 'GET', path: '/detail/{id}', responsePath: 'data' },
    playUrl: { method: 'GET', path: '/play/{id}', responsePath: 'data.url' },
    mapping: { id: 'id', title: 'title', artist: 'artist', album: 'album', duration: 'duration', coverUrl: 'cover' },
    ...overrides
  };
}

test('Online Source CRUD / enable / reorder / persistence', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rlondsp-online-'));
  // 先写一个已存在的空配置：模拟用户自己管理音源（不会触发默认源写入）
  fs.writeFileSync(path.join(dir, 'online-sources.json'), '[]');
  const manager = createOnlineSourceManager({ userDataDir: dir });
  await manager.init();
  const a = await manager.saveSource(validSource({ name: 'A' }));
  const b = await manager.saveSource(validSource({ name: 'B' }));
  assert.strictEqual((await manager.listSources()).length, 2);
  assert.ok(fs.existsSync(path.join(dir, 'online-sources.json')));
  await manager.setEnabled(a.id, false);
  assert.strictEqual((await manager.listSources()).find((s) => s.id === a.id).enabled, false);
  await manager.reorder([b.id, a.id]);
  assert.deepStrictEqual((await manager.listSources()).map((s) => s.name), ['B', 'A']);
  await manager.deleteSource(a.id);
  assert.strictEqual((await manager.listSources()).length, 1);
});

test('Online Source rejects unsafe URLs and cross-origin paths', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rlondsp-online-'));
  const manager = createOnlineSourceManager({ userDataDir: dir });
  await manager.init();
  await assert.rejects(() => manager.saveSource(validSource({ baseUrl: 'file:///tmp/music' })));
  await assert.rejects(() => manager.saveSource(validSource({ baseUrl: 'https://user:pass@example.com' })));
  await assert.rejects(() => manager.saveSource(validSource({ search: { ...validSource().search, path: 'https://evil.example/x' } })));
});

test('Online Source search/resolve normalizes resources and resolves play URL', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rlondsp-online-'));
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    if (String(url).includes('/search')) {
      return makeResponse(200, { data: [{ id: 's1', title: 'Song', artist: 'Artist', album: 'Album', duration: 123, cover: 'https://img.example/c.jpg' }] });
    }
    if (String(url).includes('/play/')) return makeResponse(200, { data: { url: 'https://cdn.example/song.mp3' } });
    return makeResponse(404, {});
  };
  const manager = createOnlineSourceManager({ userDataDir: dir, fetchImpl });
  await manager.init();
  const source = await manager.saveSource(validSource());
  const items = await manager.search(source.id, { query: 'Song', type: 'song', limit: 10 });
  assert.strictEqual(items.length, 1);
  assert.strictEqual(items[0].title, 'Song');
  assert.strictEqual(items[0].sourceId, source.id);
  const playUrl = await manager.resolvePlayUrl(source.id, { id: 's1' });
  assert.strictEqual(playUrl, 'https://cdn.example/song.mp3');
  assert.ok(calls.every((call) => new URL(call.url).origin === 'https://music.example.com'));
});

test('Online Source rejects oversized/non-JSON and cross-origin redirects', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rlondsp-online-'));
  let mode = 'large';
  const fetchImpl = async () => {
    if (mode === 'large') return makeResponse(200, 'x'.repeat(2 * 1024 * 1024 + 1));
    if (mode === 'redirect') return makeResponse(302, {}, 'https://evil.example/x');
    return makeResponse(200, 'not-json');
  };
  const manager = createOnlineSourceManager({ userDataDir: dir, fetchImpl });
  await manager.init();
  const source = await manager.saveSource(validSource());
  await assert.rejects(() => manager.search(source.id, { query: 'x' }));
  mode = 'redirect';
  await assert.rejects(() => manager.search(source.id, { query: 'x' }));
  mode = 'json';
  await assert.rejects(() => manager.search(source.id, { query: 'x' }));
});

test('Online Source credentials stay in main storage and are not returned', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rlondsp-online-'));
  const manager = createOnlineSourceManager({ userDataDir: dir });
  await manager.init();
  const source = await manager.saveSource(validSource());
  await manager.login(source.id, { token: 'secret-token', displayName: 'Tester' });
  const state = await manager.getAuthState(source.id);
  assert.strictEqual(state.authenticated, true);
  assert.strictEqual(state.displayName, 'Tester');
  assert.strictEqual(JSON.stringify(state).includes('secret-token'), false);
  const listed = JSON.stringify(await manager.listSources());
  assert.strictEqual(listed.includes('secret-token'), false);
  await manager.logout(source.id);
  assert.strictEqual((await manager.getAuthState(source.id)).authenticated, false);
});

test('内置来源已移除：列表里只剩用户自己的音源', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rlondsp-online-'));
  const manager = createOnlineSourceManager({ userDataDir: dir });
  await manager.init();
  // 首次运行会写入默认在线资源：Apple Music（默认源）+ Spotify + MusicSquare（三个内置源）
  const listed = await manager.listSources();
  assert.deepStrictEqual(listed.map((s) => s.name), ['Apple Music', 'Spotify', 'MusicSquare'], '默认在线资源为 Apple Music → Spotify → MusicSquare');
  assert.ok(listed.every((s) => s.id !== 'builtin-mock'), '不应再出现内置 Mock 音源');
  assert.strictEqual(listed[0].sourceType, 'declarative', 'Apple Music 仍是声明式源');
  assert.strictEqual(listed[1].sourceType, 'spotify', 'Spotify 是第二个内置源');
  assert.strictEqual(listed[1].baseUrl, 'https://api.spotify.com/v1', 'Spotify 固定指向官方 Web API');
  assert.strictEqual(listed[1].auth.type, 'oauth', 'Spotify 只允许官方 OAuth');
  assert.strictEqual(listed[2].sourceType, 'musicsquare', 'MusicSquare 是第三个内置源');
  assert.deepStrictEqual(listed[2].platforms, { netease: true, qq: true, kuwo: true, joox: true }, 'MusicSquare 默认启用四个真实平台');
  assert.ok(listed[0].baseUrl.includes('itunes.apple.com'), '默认源指向 Apple 公开接口');
  assert.deepStrictEqual(listed[0].search.query, { term: '{query}', media: 'music', entity: 'song', limit: '{limit}' }, '默认源搜索参数已规范化');
  // 旧默认名迁移：Apple Music Test → Apple Music，配置本身不变
  const oldDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rlondsp-online-'));
  fs.writeFileSync(path.join(oldDir, 'online-sources.json'),
    JSON.stringify([{ ...validSource({ name: 'Apple Music Test' }), id: 'src-legacy-1' }]));
  const oldManager = createOnlineSourceManager({ userDataDir: oldDir });
  await oldManager.init();
  const migrated = await oldManager.listSources();
  assert.deepStrictEqual(migrated.map((s) => s.name), ['Apple Music', 'Spotify', 'MusicSquare'],
    '旧默认名自动迁移为 Apple Music，并在其后补上 Spotify 与 MusicSquare');
  assert.strictEqual(migrated[0].baseUrl, 'https://music.example.com', '迁移只改名字，不动其它配置');
  // 用户自己删光音源（空列表）时保持为空，不再强行塞回内置源
  const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rlondsp-online-'));
  fs.writeFileSync(path.join(emptyDir, 'online-sources.json'), '[]');
  const emptyManager = createOnlineSourceManager({ userDataDir: emptyDir });
  await emptyManager.init();
  assert.deepStrictEqual(await emptyManager.listSources(), [], '空配置保持为空');
});

test('Test connection returns mapping sample and structured success', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rlondsp-online-'));
  const fetchImpl = async () => makeResponse(200, {
    data: [{
      id: 'c1',
      title: 'Connected Song',
      artist: 'Artist',
      album: 'Album',
      duration: 30000,
      coverUrl: 'https://img.example/cover.jpg',
      playUrl: 'https://audio.example/preview.m4a'
    }]
  });
  const manager = createOnlineSourceManager({ userDataDir: dir, fetchImpl });
  await manager.init();
  const source = await manager.saveSource(validSource({ name: 'Apple Music Test' }));
  const result = await manager.testConnection({ id: source.id });
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.sample.title, 'Connected Song');
  assert.strictEqual(result.sample.duration, 30);
  assert.strictEqual(result.sample.playUrl, '[resolved]');
});

test('Online Source errors expose structured stages without secrets', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rlondsp-online-'));
  const mode = { value: 'network' };
  const fetchImpl = async () => {
    if (mode.value === 'network') throw new Error('socket');
    if (mode.value === 'http') return makeResponse(500, {});
    if (mode.value === 'mapping') return makeResponse(200, { results: [{ title: 'missing id' }] });
    if (mode.value === 'play') return makeResponse(200, { data: { url: 'file:///bad' } });
    return makeResponse(200, {});
  };
  const manager = createOnlineSourceManager({ userDataDir: dir, fetchImpl });
  await manager.init();
  const source = await manager.saveSource(validSource());
  await assert.rejects(() => manager.search(source.id, { query: 'x' }), (error) => error.code === 'SOURCE_NETWORK_ERROR');
  mode.value = 'http';
  await assert.rejects(() => manager.search(source.id, { query: 'x' }), (error) => error.code === 'SOURCE_HTTP_ERROR');
  mode.value = 'mapping';
  await assert.rejects(() => manager.search(source.id, { query: 'x' }), (error) => error.code === 'SOURCE_MAPPING_INVALID');
  mode.value = 'play';
  await assert.rejects(() => manager.resolvePlayUrl(source.id, { id: 's1' }), (error) => error.code === 'SOURCE_PLAY_URL_INVALID');
});

test('自动发现首页：Apple 榜单取回真实内容、带真实名次且不泄露凭据', async () => {
  const chartsCalls = [];
  const chartsFetch = async (url, options) => {
    chartsCalls.push({ url: String(url), headers: JSON.stringify((options && options.headers) || {}) });
    const u = String(url);
    if (u.includes('/songs.json')) {
      return makeResponse(200, { feed: { updated: 'Mon, 14 Sep 2026 22:22:19 +0000', results: [
        { id: 's1', name: 'Song One', artistName: 'Artist One', artworkUrl100: 'https://img.example/1.jpg', url: 'https://music.apple.com/song/1' },
        { id: 's2', name: 'Song Two', artistName: 'Artist Two', artworkUrl100: '', url: '' }
      ] } });
    }
    if (u.includes('/albums.json')) {
      return makeResponse(200, { feed: { results: [{ id: 'al1', name: 'Album One', artistName: 'Artist One', artworkUrl100: 'https://img.example/al.jpg', url: '' }] } });
    }
    if (u.includes('/playlists.json')) {
      return makeResponse(200, { feed: { results: [{ id: 'pl1', name: 'Playlist One', artworkUrl100: '', url: 'https://music.apple.com/playlist/pl1' }] } });
    }
    return makeResponse(404, {});
  };
  const appleDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rlondsp-online-'));
  const applyleManager = createOnlineSourceManager({ userDataDir: appleDir, fetchImpl: chartsFetch });
  await applyleManager.init();
  const appleSource = await applyleManager.saveSource({
    name: 'Apple Music Test',
    sourceType: 'declarative',
    baseUrl: 'https://itunes.apple.com',
    enabled: true,
    auth: { type: 'bearer', headerName: 'Authorization', prefix: 'Bearer ' },
    search: { method: 'GET', path: '/search', query: {}, itemsPath: 'results', fields: {} },
    detail: { method: 'GET', path: '/detail/{id}', responsePath: 'data' },
    playUrl: { method: 'GET', path: '/play/{id}', responsePath: 'data.url' },
    mapping: { id: 'trackId', title: 'trackName', artist: 'artistName', album: 'collectionName', duration: 'trackTimeMillis', cover: 'artworkUrl100', playUrl: 'previewUrl' }
  });
  // 先登录一个令牌：榜单请求不允许把它带到榜单主机上
  await applyleManager.login(appleSource.id, { token: 'secret-token' });
  const discovery = await applyleManager.getDiscovery(appleSource.id, { limit: 25 });
  assert.strictEqual(discovery.supported, true);
  assert.strictEqual(discovery.updated, 'Mon, 14 Sep 2026 22:22:19 +0000');
  assert.deepStrictEqual(
    discovery.sections.song.map((item) => [item.rank, item.id, item.title, item.artist]),
    [[1, 's1', 'Song One', 'Artist One'], [2, 's2', 'Song Two', 'Artist Two']]
  );
  assert.strictEqual(discovery.sections.song[0].sourceId, appleSource.id, '保留原始来源 id');
  assert.strictEqual(discovery.sections.song[0].sourceType, 'declarative', '保留来源类型');
  assert.strictEqual(discovery.sections.song[0].coverUrl, 'https://img.example/1.jpg');
  assert.strictEqual(discovery.sections.album[0].rank, 1);
  assert.strictEqual(discovery.sections.playlist[0].title, 'Playlist One');
  assert.strictEqual(discovery.sections.song.some((item) => item.id === 's2' && !item.title), false);
  assert.strictEqual(chartsCalls.length, 3, '歌曲 / 专辑 / 歌单 各请求一次');
  assert.ok(chartsCalls.every((call) => call.url.startsWith('https://rss.marketingtools.apple.com/api/v2/us/music/most-played/25/')),
    `榜单请求应指向 Apple 公开榜单：${chartsCalls.map((c) => c.url).join(', ')}`);
  assert.ok(chartsCalls.every((call) => !/authorization/i.test(call.headers)), '榜单请求不带任何用户凭据');

  // 非 Apple 来源：不伪造内容，返回空分区
  const plainDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rlondsp-online-'));
  const plainManager = createOnlineSourceManager({ userDataDir: plainDir });
  await plainManager.init();
  const plain = await plainManager.saveSource(validSource());
  const none = await plainManager.getDiscovery(plain.id);
  assert.strictEqual(none.supported, false);
  assert.deepStrictEqual(none.sections, { song: [], album: [], playlist: [] });

  // 榜单异常：结构化错误，不静默成功
  const badDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rlondsp-online-'));
  const badManager = createOnlineSourceManager({ userDataDir: badDir, fetchImpl: async () => makeResponse(200, { feed: {} }) });
  await badManager.init();
  const bad = await badManager.saveSource(validSource({ baseUrl: 'https://itunes.apple.com' }));
  await assert.rejects(() => badManager.getDiscovery(bad.id), (error) => error.code === 'SOURCE_MAPPING_INVALID');
});

test('Legacy mapping.items / iTunes style config is normalized and searchable', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rlondsp-online-'));
  const fetchImpl = async () => makeResponse(200, {
    resultCount: 1,
    results: [{
      trackId: 123,
      trackName: 'iTunes Song',
      artistName: 'Artist',
      collectionName: 'Album',
      trackTimeMillis: 30000,
      artworkUrl100: 'https://img.example/cover.jpg',
      previewUrl: 'https://audio.example/preview.m4a'
    }]
  });
  const manager = createOnlineSourceManager({ userDataDir: dir, fetchImpl });
  await manager.init();
  const saved = await manager.saveSource({
    name: 'Apple Music Test',
    sourceType: 'declarative',
    baseUrl: 'https://itunes.apple.com',
    enabled: true,
    search: { method: 'GET', path: '/search', query: {}, itemsPath: '', fields: {} },
    detail: { method: 'GET', path: '/detail/{id}', responsePath: 'data' },
    playUrl: { method: 'GET', path: '/play/{id}', responsePath: 'data.url' },
    mapping: { items: 'results', id: 'trackId', title: 'trackName', artist: 'artistName', album: 'collectionName', duration: 'trackTimeMillis', cover: 'artworkUrl100', playUrl: 'previewUrl' }
  });
  assert.strictEqual(saved.search.itemsPath, 'results');
  assert.strictEqual(saved.search.query.term, '{query}');
  const items = await manager.search(saved.id, { query: 'test', type: 'song' });
  assert.strictEqual(items[0].duration, 30);
  assert.strictEqual(items[0].coverUrl, 'https://img.example/cover.jpg');
  assert.strictEqual(items[0].playUrl, 'https://audio.example/preview.m4a');
  const resolved = await manager.resolvePlayUrl(saved.id, { id: items[0].id, playUrl: items[0].playUrl });
  assert.strictEqual(resolved, 'https://audio.example/preview.m4a');
});

/* ===== Spotify：第二个内置在线源 ===== */

test('Spotify 内置源：排在 Apple Music 之后，官方 API / OAuth 约束不可被改写', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rlondsp-spotify-'));
  const manager = createOnlineSourceManager({ userDataDir: dir });
  await manager.init();
  const list = await manager.listSources();
  assert.deepStrictEqual(list.map((s) => s.name), ['Apple Music', 'Spotify', 'MusicSquare'],
    '顺序：Apple Music → Spotify → MusicSquare（Spotify 仍在 Apple Music 之后，位置不变）');
  const spotify = list[1];
  assert.strictEqual(spotify.sourceType, 'spotify');
  assert.strictEqual(spotify.baseUrl, 'https://api.spotify.com/v1', '固定指向 Spotify 官方 Web API');
  assert.strictEqual(spotify.auth.type, 'oauth', '只允许官方 OAuth');
  assert.strictEqual(spotify.enabled, true);
  assert.strictEqual(spotify.clientId, '', 'Client ID 由用户填写（非机密）');

  // 任何想把 Spotify 源改成第三方主机 / 声明式凭据的尝试，都会被服务端强制修正
  const saved = await manager.saveSource({
    ...spotify,
    baseUrl: 'https://evil.example.com',
    auth: { type: 'bearer', token: 'should-not-stick' },
    clientId: 'client-1234'
  });
  assert.strictEqual(saved.baseUrl, 'https://api.spotify.com/v1');
  assert.strictEqual(saved.auth.type, 'oauth');
  assert.strictEqual(saved.clientId, 'client-1234');
  assert.strictEqual(JSON.stringify(saved).includes('should-not-stick'), false, '不保存声明式令牌字段');

  // 内置源删掉后，重启会按顺序补回（停用它请用开关）
  await manager.deleteSource(spotify.id);
  const restarted = createOnlineSourceManager({ userDataDir: dir });
  await restarted.init();
  assert.deepStrictEqual((await restarted.listSources()).map((s) => s.name), ['Apple Music', 'Spotify', 'MusicSquare']);
});

test('Spotify：未填 Client ID / 未登录都是结构化错误，绝不伪造播放地址', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rlondsp-spotify-'));
  const manager = createOnlineSourceManager({ userDataDir: dir, fetchImpl: async () => makeResponse(200, {}) });
  await manager.init();
  const spotify = (await manager.listSources()).find((s) => s.sourceType === 'spotify');

  // 还没填 Client ID：连授权窗口都不会弹，直接给配置错误
  await assert.rejects(() => manager.spotifyLogin(spotify.id), (error) => error.code === 'SOURCE_CONFIG_INVALID');

  await manager.saveSource({ ...spotify, clientId: 'client-1234' });
  assert.strictEqual((await manager.getAuthState(spotify.id)).authenticated, false);
  // 未登录：数据类操作统一是 AUTH 阶段错误，不会被伪装成网络 / mapping 失败
  await assert.rejects(() => manager.search(spotify.id, { query: 'x', type: 'song' }), (error) => error.code === 'SOURCE_AUTH_ERROR');
  await assert.rejects(() => manager.getDiscovery(spotify.id), (error) => error.code === 'SOURCE_AUTH_ERROR');
  await assert.rejects(() => manager.resolvePlayUrl(spotify.id, { id: 't1' }), (error) => error.code === 'SOURCE_AUTH_ERROR');
});

test('Spotify：官方 OAuth(PKCE) 回调 → 只用官方接口 → 令牌不外泄、无 preview 不伪造', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rlondsp-spotify-'));
  const calls = [];
  let tokenRounds = 0;
  const track = (id, withPreview) => ({
    id,
    name: `Track ${id}`,
    artists: [{ name: 'Artist One' }],
    album: { name: 'Album One', images: [{ url: 'https://img/t1.jpg' }] },
    duration_ms: 30000,
    preview_url: withPreview ? 'https://p.scdn.co/t1.mp3' : null,
    external_urls: { spotify: `https://open.spotify.com/track/${id}` }
  });
  const fetchImpl = async (url, init) => {
    const href = String(url);
    calls.push({ url: href, method: (init && init.method) || 'GET', headers: (init && init.headers) || {} });
    if (href === 'https://accounts.spotify.com/api/token') {
      tokenRounds += 1;
      // 第一次：授权码换令牌（故意给很短的寿命，逼出 refresh_token 续期）；之后：续期
      return tokenRounds === 1
        ? makeResponse(200, { access_token: 'AT-1', refresh_token: 'RT-1', expires_in: 10, token_type: 'Bearer' })
        : makeResponse(200, { access_token: 'AT-2', refresh_token: 'RT-2', expires_in: 3600, token_type: 'Bearer' });
    }
    if (href.startsWith('https://api.spotify.com/v1/me/top/tracks')) return makeResponse(200, { items: [track('t1', true)] });
    if (href.startsWith('https://api.spotify.com/v1/me/playlists')) {
      return makeResponse(200, { items: [{ id: 'p1', name: 'My Playlist', owner: { display_name: 'Rlon Tester' }, images: [{ url: 'https://img/p1.jpg' }], external_urls: { spotify: 'https://open.spotify.com/playlist/p1' } }] });
    }
    if (href.startsWith('https://api.spotify.com/v1/me/albums')) {
      return makeResponse(200, { items: [{ album: { id: 'a1', name: 'Album One', artists: [{ name: 'Artist One' }], images: [{ url: 'https://img/a1.jpg' }], external_urls: { spotify: 'https://open.spotify.com/album/a1' } } }] });
    }
    if (href.startsWith('https://api.spotify.com/v1/me')) return makeResponse(200, { id: 'me', display_name: 'Rlon Tester' });
    if (href.startsWith('https://api.spotify.com/v1/browse/categories')) {
      return makeResponse(200, { categories: { items: [{ id: 'c1', name: 'Pop', icons: [{ url: 'https://img/c1.jpg' }] }] } });
    }
    if (href.startsWith('https://api.spotify.com/v1/search')) return makeResponse(200, { tracks: { items: [track('t1', true), track('t2', false)] } });
    if (href.startsWith('https://api.spotify.com/v1/tracks/t2')) return makeResponse(200, track('t2', false));
    if (href.startsWith('https://api.spotify.com/v1/tracks/t1')) return makeResponse(200, track('t1', true));
    return makeResponse(404, { error: { status: 404 } });
  };

  const opened = [];
  const manager = createOnlineSourceManager({
    userDataDir: dir,
    fetchImpl,
    // 只替掉「打开系统浏览器」这一步：真实回环回调仍然打在 main 的本地服务器上
    openExternal: async (authorizeUrl) => {
      opened.push(authorizeUrl);
      const parsed = new URL(authorizeUrl);
      const redirect = parsed.searchParams.get('redirect_uri');
      const state = parsed.searchParams.get('state');
      await fetch(`${redirect}?code=AUTH-CODE&state=${state}`);
    }
  });
  await manager.init();
  const spotify = (await manager.listSources()).find((s) => s.sourceType === 'spotify');
  await manager.saveSource({ ...spotify, clientId: 'client-1234' });

  const auth = await manager.spotifyLogin(spotify.id);
  assert.strictEqual(auth.authenticated, true);
  assert.strictEqual(auth.displayName, 'Rlon Tester');
  assert.strictEqual(opened.length, 1);

  const authorize = new URL(opened[0]);
  assert.strictEqual(authorize.origin, 'https://accounts.spotify.com', '只在官方账号域登录');
  assert.strictEqual(authorize.pathname, '/authorize');
  assert.strictEqual(authorize.searchParams.get('response_type'), 'code');
  assert.strictEqual(authorize.searchParams.get('code_challenge_method'), 'S256', '官方 PKCE');
  assert.ok(String(authorize.searchParams.get('code_challenge')).length >= 40, '带 PKCE challenge');
  assert.ok(/^http:\/\/127\.0\.0\.1:\d+\/callback$/.test(String(authorize.searchParams.get('redirect_uri'))), '回环回调，不暴露本机端口之外的东西');
  assert.ok(!/user-modify|streaming|user-library-modify/.test(String(authorize.searchParams.get('scope'))), '不申请写权限 / 不越权');
  assert.strictEqual((await manager.getAuthState(spotify.id)).authenticated, true);

  const items = await manager.search(spotify.id, { query: 'track', type: 'song' });
  assert.strictEqual(items.length, 2);
  assert.strictEqual(items[0].provider, 'spotify', '保留 Spotify 内容归属');
  assert.strictEqual(items[0].title, 'Track t1');
  assert.strictEqual(items[0].artist, 'Artist One');
  assert.strictEqual(items[0].album, 'Album One');
  assert.strictEqual(items[0].coverUrl, 'https://img/t1.jpg');
  assert.strictEqual(items[0].playUrl, 'https://p.scdn.co/t1.mp3', '可播资源用官方 30 秒 preview');
  assert.strictEqual(items[0].externalUrl, 'https://open.spotify.com/track/t1', '保留官方回链');
  assert.strictEqual(items[1].playUrl, '', '没有官方 preview 的曲目不带任何播放地址');

  const apiCalls = calls.filter((call) => call.url.startsWith('https://api.spotify.com/'));
  assert.ok(apiCalls.length >= 2, '登录后至少发生一次账号请求 + 一次搜索请求');
  assert.strictEqual(apiCalls[0].headers.authorization, 'Bearer AT-1', '登录后第一件事是取账号信息');
  assert.ok(apiCalls.slice(1).every((call) => call.headers.authorization === 'Bearer AT-2'), '过期令牌用 refresh_token 续期');
  assert.strictEqual(tokenRounds, 2, '一次授权码 + 一次续期');
  const grants = calls.filter((call) => call.url === 'https://accounts.spotify.com/api/token')
    .map((call) => String(call.headers['content-type'] || ''));
  assert.ok(grants.every((type) => type.startsWith('application/x-www-form-urlencoded')), '令牌请求走官方表单格式');

  const discovery = await manager.getDiscovery(spotify.id, { force: true });
  assert.strictEqual(discovery.supported, true);
  assert.strictEqual(discovery.provider, 'spotify');
  assert.strictEqual(discovery.account, 'Rlon Tester');
  assert.deepStrictEqual(discovery.sections.song.map((item) => [item.title, item.artist]), [['Track t1', 'Artist One']]);
  assert.deepStrictEqual(discovery.sections.playlist.map((item) => item.title), ['My Playlist']);
  assert.deepStrictEqual(discovery.sections.album.map((item) => item.title), ['Album One']);
  assert.deepStrictEqual(discovery.sections.category.map((item) => item.title), ['Pop']);
  assert.ok(discovery.sections.song.every((item) => item.sourceId === spotify.id && item.sourceType === 'spotify'), '保留原始来源信息');
  const paths = calls.filter((call) => call.url.startsWith('https://api.spotify.com/')).map((call) => new URL(call.url).pathname);
  const allowed = new Set(['/v1/me', '/v1/me/top/tracks', '/v1/me/playlists', '/v1/me/albums', '/v1/browse/categories', '/v1/search', '/v1/tracks/t1', '/v1/tracks/t2']);
  assert.ok(paths.every((p) => allowed.has(p)), `只调用官方允许的接口：${paths.join(', ')}`);
  assert.strictEqual(paths.some((p) => /recommendations|featured-playlists|new-releases/.test(p)), false,
    '推荐类受限接口不参与，也不伪造榜单');

  const resolved = await manager.resolvePlayUrl(spotify.id, { id: 't1', playUrl: items[0].playUrl });
  assert.strictEqual(resolved, 'https://p.scdn.co/t1.mp3');
  await assert.rejects(() => manager.resolvePlayUrl(spotify.id, { id: 't2' }), (error) => error.code === 'SOURCE_PLAY_URL_INVALID',
    '无可播地址时明确失败，不返回伪造地址');

  // 凭据只在主进程：界面拿到的来源列表与登录态里都没有任何令牌
  // （Client ID 是公开信息、也是设置界面里要填的字段，不是凭据，因此允许出现在来源列表里）
  const listed = JSON.stringify(await manager.listSources());
  assert.strictEqual(/AT-1|AT-2|RT-1|RT-2|AUTH-CODE/.test(listed), false, 'renderer 侧拿不到令牌');
  assert.strictEqual(JSON.stringify(await manager.getAuthState(spotify.id)).includes('AT-'), false);
  const atRest = fs.readFileSync(path.join(dir, 'online-credentials.json'), 'utf8');
  assert.strictEqual(/AT-1|AT-2|RT-1|RT-2|AUTH-CODE/.test(atRest), false, '磁盘上不是明文令牌');
  const decoded = Buffer.from(JSON.parse(atRest).data, 'base64').toString('utf8');
  assert.ok(decoded.includes('AT-2') && decoded.includes('Rlon Tester'), '令牌只落在主进程的凭据存储里');
});
