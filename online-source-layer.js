/*
 * RlonDSP Online Source Layer
 * main-process only. Renderer never receives credentials or performs third-party requests.
 */
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');

const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const ALLOWED_METHODS = new Set(['GET', 'POST']);
const BLOCKED_HEADERS = new Set(['cookie', 'host', 'set-cookie', 'content-length']);

const ERROR_CODES = {
  CONFIG: 'SOURCE_CONFIG_INVALID',
  URL: 'SOURCE_URL_INVALID',
  NETWORK: 'SOURCE_NETWORK_ERROR',
  HTTP: 'SOURCE_HTTP_ERROR',
  REDIRECT: 'SOURCE_REDIRECT_REJECTED',
  TOO_LARGE: 'SOURCE_RESPONSE_TOO_LARGE',
  RESPONSE: 'SOURCE_RESPONSE_INVALID',
  MAPPING: 'SOURCE_MAPPING_INVALID',
  PLAY_URL: 'SOURCE_PLAY_URL_INVALID',
  AUTH: 'SOURCE_AUTH_ERROR'
};

class OnlineSourceError extends Error {
  constructor(code, safeMessage) {
    super(`${code}: ${safeMessage || 'request failed'}`);
    this.name = 'OnlineSourceError';
    this.code = code;
    this.safeMessage = safeMessage || 'request failed';
  }
}

function fail(code, safeMessage) {
  throw new OnlineSourceError(code, safeMessage);
}

/*
 * 「无需搜索即可浏览」的首页数据源：Apple 公开榜单（Most Played Songs / Albums / Playlists）。
 *   - 真实在线数据，不造假榜、不把搜索结果当推荐；
 *   - 只对 Apple 系音源生效（baseUrl 主机属于 apple.com / applemarketingtools.com）；
 *   - 走现有的 requestJson 通道：同一套 HTTPS 校验、同源校验、重定向拦截、响应大小上限；
 *   - 访问榜单主机时把来源的凭据摘掉（auth 置为 none），令牌只发给用户自己配置的来源主机。
 */
const APPLE_CHARTS = {
  // 用规范主机：旧域名 rss.applemarketingtools.com 会 301 到它，
  // 而主进程取数固定走 redirect:'manual'（跨源跳转一律拦下），
  // 直接请求最终地址就不会再触发「Redirect was cancelled」。
  baseUrl: 'https://rss.marketingtools.apple.com',
  country: 'us',
  limit: 100,
  // 榜单主机对「没有 User-Agent」的请求直接回 400，主进程的 net.fetch 默认不带 UA，
  // 因此这里显式带一个只标识应用的 UA（不含任何凭据）。
  headers: { 'user-agent': 'RlonDSP/1.0 (+online-resources)' },
  feeds: {
    song: '/api/v2/{country}/music/most-played/{limit}/songs.json',
    album: '/api/v2/{country}/music/most-played/{limit}/albums.json',
    playlist: '/api/v2/{country}/music/most-played/{limit}/playlists.json'
  }
};

/* 自动发现短期缓存：同一来源短时间内只取一次，进入页面 / 切页 / 鼠标移动都不重复请求。
   界面点「刷新」时带 force 明确强制重取。 */
const DISCOVERY_CACHE_TTL = 5 * 60 * 1000;

/* 首次运行（还没有 online-sources.json）时内置的默认在线资源：Apple Music。
   用的是 Apple 公开的 iTunes Search / Lookup 接口，无需凭据；
   自动发现（榜单）与详情 / 试听解析都复用同一个来源配置。 */
const DEFAULT_SOURCE = {
  name: 'Apple Music',
  sourceType: 'declarative',
  baseUrl: 'https://itunes.apple.com',
  enabled: true,
  auth: { type: 'none' },
  search: { method: 'GET', path: '/search', query: {}, itemsPath: '', fields: {} },
  detail: { method: 'GET', path: '/lookup', query: { id: '{id}' }, responsePath: 'results.0' },
  playUrl: { method: 'GET', path: '/lookup', query: { id: '{id}' }, responsePath: 'results.0.previewUrl' },
  mapping: {
    items: 'results',
    id: 'trackId',
    title: 'trackName',
    artist: 'artistName',
    album: 'collectionName',
    duration: 'trackTimeMillis',
    cover: 'artworkUrl100',
    playUrl: 'previewUrl'
  }
};

/* 旧默认名迁移：Apple Music Test → Apple Music */
const LEGACY_SOURCE_NAMES = new Map([['Apple Music Test', 'Apple Music']]);

/* ===== Spotify：第二个内置在线源（官方 Web API + OAuth Authorization Code + PKCE） =====
   平台边界（严格按 Spotify 官方平台规则）：
   - 只做搜索 / 浏览 / 元数据展示 / 官方允许的试听（30 秒 preview_url）；
   - 不做 stream-ripping、不下载、不绕 DRM / 权限；
   - Token 只保存在主进程受控存储（safeStorage 加密），绝不进 renderer / DOM / 日志；
   - 推荐类接口（/recommendations、/browse/featured-playlists、/browse/new-releases 等）
     对新建应用已不可用，因此“无需搜索的浏览内容”取【用户自己的】真实数据：
       热门曲目 /me/top/tracks、歌单 /me/playlists、收藏专辑 /me/albums，
       分类 /browse/categories 取不到就整块跳过，不伪造。 */
const SPOTIFY = {
  accountsBase: 'https://accounts.spotify.com',
  apiBase: 'https://api.spotify.com/v1',
  authorizePath: '/authorize',
  tokenPath: '/api/token',
  scopes: ['user-read-private', 'playlist-read-private', 'user-library-read', 'user-top-read'],
  limit: 20
};

const DEFAULT_SPOTIFY_SOURCE = {
  name: 'Spotify',
  sourceType: 'spotify',
  baseUrl: SPOTIFY.apiBase,
  enabled: true,
  clientId: '',
  auth: { type: 'oauth' },
  search: { method: 'GET', path: '/search', query: {}, itemsPath: '', fields: {} },
  detail: { method: 'GET', path: '/tracks/{id}', query: {}, responsePath: '', fields: {} },
  playUrl: { method: 'GET', path: '/tracks/{id}', query: {}, responsePath: 'preview_url', fields: {} },
  mapping: {
    items: '',
    id: 'id',
    title: 'name',
    artist: 'artists.0.name',
    album: 'album.name',
    duration: 'duration_ms',
    cover: 'album.images.0.url',
    playUrl: 'preview_url'
  }
};

/* ===== MusicSquare：第三个内置在线源（Apache-2.0，归属见 NOTICE） =====
   上游项目：https://github.com/CharlesPikachu/musicsquare （站点：https://charlespikachu.github.io/musicsquare/）
   上游本身不托管任何音频，也不提供“自己的歌曲 API”：它的 index.html 把搜索 / 详情
   转发给若干公开的第三方聚合接口，再由浏览器直接播放上游返回的音频地址。
   这里按上游真实实现接入同一批接口，只做两件事：
     1. 搜索：并行请求各平台搜索接口 → 映射成 RlonDSP 统一的资源结构；
     2. 解析：按平台调用各自详情接口，取上游真实返回的播放地址（拿不到就明确失败）。
   边界（与上游一致，不额外扩张）：
     - 站点首页 URL 只作为归属展示，绝不当作歌曲 API；
     - 不绕过 DRM / 付费 / 登录 / 访问控制，不伪造地址、不伪造结果；
     - 这里的解析只返回真实地址；是否下载由用户在界面上显式发起（见 online-download.js）。
   平台能力按上游 index.html 的真实调用核实（2026-10 实测可返回真实音频地址）：
     - netease : api.qijieya.cn/meting     搜索即带 url / pic / lrc
     - qq      : tang.api.s01s.cn          搜索拿 song_mid，详情拿 song_play_url*
     - kuwo    : oiapi.net/api/Kuwo        详情按 msg + 名次 n 取 url
     - joox    : apicx.asia/api/joox_music 详情按 songmid 或 msg + n 取「播放链接」
   资源 id 形如 `<platform>:<上游原始 id>`：provider 是解析详情必需的身份，且保证
   同一首歌在不同平台之间不会互相去重（同名歌在不同平台本就是不同来源）。 */
const MUSICSQUARE = {
  homepage: 'https://charlespikachu.github.io/musicsquare/',
  userAgent: 'RlonDSP/1.0 (+online-resources)',
  limit: 20,
  /* JOOX 的公开 token 与上游站点一致（上游 index.html 里就是明文常量），不是用户凭据 */
  jooxToken: 'f84ao9lMF_q7husBWRfgUw',
  jooxBr: '4',
  platforms: {
    netease: { label: '网易云音乐', host: 'https://api.qijieya.cn', searchPath: '/meting/', urlPath: '/meting/' },
    qq: { label: 'QQ 音乐', host: 'https://tang.api.s01s.cn', searchPath: '/music_open_api.php' },
    kuwo: { label: '酷我音乐', host: 'https://oiapi.net', searchPath: '/api/Kuwo' },
    joox: { label: 'JOOX', host: 'https://apicx.asia', searchPath: '/api/joox_music' }
  }
};

const DEFAULT_MUSICSQUARE_SOURCE = {
  name: 'MusicSquare',
  sourceType: 'musicsquare',
  baseUrl: MUSICSQUARE.homepage,
  enabled: true,
  auth: { type: 'none' },
  platforms: { netease: true, qq: true, kuwo: true, joox: true }
};

function base64Url(buffer) {
  return Buffer.from(buffer).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function isAppleMusicHost(value) {
  let host = '';
  try {
    host = new URL(String(value || '')).hostname.toLowerCase();
  } catch {
    return false;
  }
  return host === 'apple.com' || host.endsWith('.apple.com') || host === 'applemarketingtools.com' || host.endsWith('.applemarketingtools.com');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeId() {
  return `src_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function assertString(value, name, min, max) {
  if (typeof value !== 'string' || value.length < min || value.length > max) {
    fail(ERROR_CODES.CONFIG, `${name} invalid`);
  }
  return value;
}

function validateHttpUrl(value, name, options) {
  let url;
  try {
    url = new URL(String(value || ''));
  } catch {
    fail(ERROR_CODES.URL, `${name} invalid`);
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') fail(ERROR_CODES.URL, `${name} protocol not allowed`);
  if (url.username || url.password) fail(ERROR_CODES.URL, `${name} credentials not allowed`);
  if (url.hash) fail(ERROR_CODES.URL, `${name} hash not allowed`);
  // 声明式源的 baseUrl / 模板仍禁止 query（配置面必须干净）；
  // 但上游直接给出的**完整音频地址**普遍带签名参数（vkey / token / sign），
  // 这类地址只有受控适配器（MusicSquare）才允许带 query。
  if (url.search && !(options && options.allowQuery)) fail(ERROR_CODES.URL, `${name} query not allowed`);
  return url;
}

function validateConfig(config, name) {
  const out = {
    method: String((config && config.method) || 'GET').toUpperCase(),
    path: String((config && config.path) || '/'),
    query: (config && config.query) || {},
    body: (config && config.body) || null,
    itemsPath: (config && config.itemsPath) || '',
    responsePath: (config && config.responsePath) || '',
    fields: (config && config.fields) || {}
  };
  if (!ALLOWED_METHODS.has(out.method)) fail(ERROR_CODES.CONFIG, `${name}.method not allowed`);
  if (!out.path.startsWith('/')) fail(ERROR_CODES.CONFIG, `${name}.path must be relative`);
  if (out.path.length > 500) fail(ERROR_CODES.CONFIG, `${name}.path too long`);
  if (typeof out.query !== 'object' || Array.isArray(out.query)) fail(ERROR_CODES.CONFIG, `${name}.query invalid`);
  for (const [key, value] of Object.entries(out.query)) {
    if (typeof key !== 'string' || key.length > 80) fail(ERROR_CODES.CONFIG, `${name}.query key invalid`);
    if (typeof value !== 'string' || value.length > 240) fail(ERROR_CODES.CONFIG, `${name}.query value invalid`);
  }
  return out;
}

function validateSource(input, existingId) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail(ERROR_CODES.CONFIG, 'source invalid');
  const source = clone(input);
  source.id = existingId || (source.id ? String(source.id) : makeId());
  source.name = assertString(source.name, 'source.name', 1, 80).trim();
  source.sourceType = String(source.sourceType || 'declarative');
  if (!['declarative', 'spotify', 'musicsquare'].includes(source.sourceType)) fail(ERROR_CODES.CONFIG, 'sourceType not supported');
  if (source.sourceType === 'spotify') {
    // Spotify：baseUrl 固定指向官方 API，Client ID 由用户在设置里填写（非机密）
    source.clientId = String(source.clientId || '').slice(0, 80);
    source.baseUrl = SPOTIFY.apiBase;
    source.enabled = source.enabled !== false;
    source.auth = { type: 'oauth' };
    source.search = validateConfig(source.search || {}, 'source.search');
    source.detail = validateConfig(source.detail || {}, 'source.detail');
    source.playUrl = validateConfig(source.playUrl || {}, 'source.playUrl');
    source.mapping = source.mapping && typeof source.mapping === 'object' && !Array.isArray(source.mapping)
      ? clone(source.mapping)
      : clone(DEFAULT_SPOTIFY_SOURCE.mapping);
    return source;
  }
  if (source.sourceType === 'musicsquare') {
    // MusicSquare：固定指向上游公开接口集合，没有用户凭据；请求主机由平台适配器决定，
    // baseUrl 仅是归属展示（上游站点首页），绝不会被当作歌曲 API 使用。
    source.baseUrl = MUSICSQUARE.homepage;
    source.enabled = source.enabled !== false;
    source.auth = { type: 'none' };
    const inputPlatforms = (source.platforms && typeof source.platforms === 'object' && !Array.isArray(source.platforms))
      ? source.platforms
      : DEFAULT_MUSICSQUARE_SOURCE.platforms;
    source.platforms = {};
    for (const key of Object.keys(MUSICSQUARE.platforms)) {
      source.platforms[key] = inputPlatforms[key] !== false;
    }
    // 声明式配置对该适配器无意义：留空对象，避免界面里出现“能改但不起作用”的 JSON
    source.search = {};
    source.detail = {};
    source.playUrl = {};
    source.mapping = {};
    return source;
  }
  const base = validateHttpUrl(source.baseUrl, 'source.baseUrl');
  const basePath = base.pathname.replace(/\/+$/, '');
  source.baseUrl = base.origin + basePath;
  source.enabled = source.enabled !== false;
  source.auth = source.auth && typeof source.auth === 'object' ? source.auth : { type: 'none' };
  source.auth.type = ['none', 'bearer', 'header'].includes(source.auth.type) ? source.auth.type : 'none';
  source.auth.headerName = String(source.auth.headerName || 'Authorization').slice(0, 80);
  source.auth.prefix = String(source.auth.prefix || 'Bearer ').slice(0, 80);
  if (BLOCKED_HEADERS.has(source.auth.headerName.toLowerCase())) fail(ERROR_CODES.CONFIG, 'auth.headerName not allowed');
  source.search = validateConfig(source.search || {}, 'source.search');
  source.detail = validateConfig(source.detail || {}, 'source.detail');
  source.playUrl = validateConfig(source.playUrl || {}, 'source.playUrl');
  source.mapping = source.mapping && typeof source.mapping === 'object' && !Array.isArray(source.mapping)
    ? clone(source.mapping)
    : {};
  if (!source.search.itemsPath && source.mapping.items) source.search.itemsPath = String(source.mapping.items);
  if (source.sourceType === 'declarative'
    && source.baseUrl.includes('itunes.apple.com')
    && source.search.path === '/search'
    && Object.keys(source.search.query || {}).length === 0) {
    source.search.query = { term: '{query}', media: 'music', entity: 'song', limit: '{limit}' };
  }
  return source;
}

function sanitizeSource(source) {
  const out = clone(source);
  if (out.auth) {
    delete out.auth.token;
    delete out.auth.headers;
  }
  return out;
}

function jsonPath(value, pathText) {
  if (!pathText) return value;
  let current = value;
  for (const part of String(pathText).split('.')) {
    if (current == null) return undefined;
    const index = /^\d+$/.test(part) ? Number(part) : part;
    current = current[index];
  }
  return current;
}

function fillPathTemplate(text, vars) {
  return String(text).replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key) => encodeURIComponent(vars[key] == null ? '' : vars[key]));
}

function fillValueTemplate(text, vars) {
  return String(text).replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key) => String(vars[key] == null ? '' : vars[key]));
}

function pickField(item, mapping, fallback) {
  if (!mapping) return fallback;
  return jsonPath(item, mapping);
}

function normalizeResource(item, source, type) {
  const mapping = source.mapping || {};
  const fields = source.search.fields || {};
  const id = String(pickField(item, mapping.id || fields.id, item && (item.id || item.songId || item.hash)) || '');
  const title = String(pickField(item, mapping.title || fields.title, item && (item.title || item.name)) || '');
  const durationRaw = Number(pickField(item, mapping.duration || fields.duration, item && item.duration) || 0);
  const duration = durationRaw > 10000 ? durationRaw / 1000 : durationRaw;
  const playUrl = String(pickField(item, mapping.playUrl || fields.playUrl, item && (item.playUrl || item.url)) || '');
  return {
    id,
    type: type || 'song',
    sourceId: source.id,
    sourceType: source.sourceType,
    title,
    name: title,
    artist: String(pickField(item, mapping.artist || fields.artist, item && item.artist) || ''),
    album: String(pickField(item, mapping.album || fields.album, item && item.album) || ''),
    duration,
    coverUrl: String(pickField(item, mapping.coverUrl || mapping.cover || fields.coverUrl || fields.cover, item && (item.coverUrl || item.cover)) || ''),
    playUrl,
    raw: item
  };
}

function createOnlineSourceManager(options) {
  const userDataDir = options.userDataDir;
  const fetchImpl = options.fetchImpl || null;
  const safeStorage = options.safeStorage || null;
  const sourcesFile = path.join(userDataDir, 'online-sources.json');
  const credentialsFile = path.join(userDataDir, 'online-credentials.json');
  let sources = [];
  let credentials = {};
  // 自动发现缓存（每个管理器实例独立，不跨实例泄漏）
  const discoveryCache = new Map();

  function getFetch() {
    if (fetchImpl) return fetchImpl;
    const electron = require('electron');
    return electron.net.fetch.bind(electron.net);
  }

  async function readJson(file, fallback) {
    try {
      const raw = await fsp.readFile(file, 'utf8');
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  async function writeJson(file, value) {
    await fsp.mkdir(path.dirname(file), { recursive: true });
    await fsp.writeFile(file, JSON.stringify(value, null, 2), 'utf8');
  }

  function encryptCredentials(value) {
    const raw = JSON.stringify(value);
    if (safeStorage && typeof safeStorage.isEncryptionAvailable === 'function' && safeStorage.isEncryptionAvailable()) {
      return { encrypted: true, data: safeStorage.encryptString(raw).toString('base64') };
    }
    return { encrypted: false, data: Buffer.from(raw, 'utf8').toString('base64') };
  }

  function decryptCredentials(value) {
    if (!value || typeof value.data !== 'string') return {};
    try {
      const raw = value.encrypted && safeStorage && typeof safeStorage.decryptString === 'function'
        ? safeStorage.decryptString(Buffer.from(value.data, 'base64'))
        : Buffer.from(value.data, 'base64').toString('utf8');
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  async function init() {
    await fsp.mkdir(userDataDir, { recursive: true });
    let loaded = await readJson(sourcesFile, null);
    if (!Array.isArray(loaded)) {
      // 首次运行：写入默认在线资源 Apple Music → Spotify → MusicSquare
      loaded = [
        validateSource(DEFAULT_SOURCE),
        validateSource(DEFAULT_SPOTIFY_SOURCE),
        validateSource(DEFAULT_MUSICSQUARE_SOURCE)
      ];
      await writeJson(sourcesFile, loaded);
    }
    let renamedAny = false;
    sources = Array.isArray(loaded)
      ? loaded
        .filter((source) => source && source.id)
        .map((source) => {
          let normalized;
          try {
            normalized = validateSource(source, source.id);
          } catch {
            normalized = sanitizeSource(source);
          }
          // 旧默认名迁移（只改名字，不动任何其它配置）
          const renamed = LEGACY_SOURCE_NAMES.get(String(normalized.name || ''));
          if (renamed) {
            normalized.name = renamed;
            renamedAny = true;
          }
          return normalized;
        })
      : [];
    if (renamedAny) await writeJson(sourcesFile, sources);
    // 内置在线源：Apple Music 之后补上 Spotify。
    // 只对「已有配置但还没有 Spotify」的旧版本做一次迁移补齐；
    // 空列表代表用户自己删光了音源，保持空（与 Apple Music 的既有行为一致），不强行塞回来。
    if (Array.isArray(loaded) && loaded.length && !sources.some((source) => source.sourceType === 'spotify')) {
      const spotify = validateSource(DEFAULT_SPOTIFY_SOURCE);
      // 「Apple Music 之后」：优先按官方主机识别，旧配置改名后也能按名字识别
      const appleAt = sources.findIndex((source) => /itunes\.apple\.com/.test(String(source.baseUrl || ''))
        || /^apple music$/i.test(String(source.name || '').trim()));
      if (appleAt >= 0) sources.splice(appleAt + 1, 0, spotify);
      else sources.unshift(spotify);
      await writeJson(sourcesFile, sources);
    }
    // MusicSquare：与 Spotify 同样的「一次性补齐」迁移，排在 Spotify 之后；
    // 用户自己删光了音源时同样不强行塞回来。
    if (Array.isArray(loaded) && loaded.length && !sources.some((source) => source.sourceType === 'musicsquare')) {
      const musicsquare = validateSource(DEFAULT_MUSICSQUARE_SOURCE);
      const spotifyAt = sources.findIndex((source) => source.sourceType === 'spotify');
      const appleAt = sources.findIndex((source) => /itunes\.apple\.com/.test(String(source.baseUrl || '')));
      if (spotifyAt >= 0) sources.splice(spotifyAt + 1, 0, musicsquare);
      else if (appleAt >= 0) sources.splice(appleAt + 1, 0, musicsquare);
      else sources.push(musicsquare);
      await writeJson(sourcesFile, sources);
    }
    credentials = decryptCredentials(await readJson(credentialsFile, null));
  }

  async function listSources() {
    return sources.map(sanitizeSource);
  }

  async function saveSource(input) {
    const existing = input && input.id ? sources.find((source) => source.id === input.id) : null;
    const source = validateSource(input, existing ? existing.id : null);
    const index = sources.findIndex((item) => item.id === source.id);
    if (index >= 0) sources[index] = source;
    else sources.push(source);
    await writeJson(sourcesFile, sources);
    return sanitizeSource(source);
  }

  async function deleteSource(id) {
    sources = sources.filter((source) => source.id !== id);
    delete credentials[id];
    await writeJson(sourcesFile, sources);
    await writeJson(credentialsFile, encryptCredentials(credentials));
    return true;
  }

  async function setEnabled(id, enabled) {
    const source = sources.find((item) => item.id === id);
    if (!source) fail(ERROR_CODES.CONFIG, 'source not found');
    source.enabled = !!enabled;
    await writeJson(sourcesFile, sources);
    return sanitizeSource(source);
  }

  async function reorder(ids) {
    if (!Array.isArray(ids)) fail(ERROR_CODES.CONFIG, 'ids invalid');
    const map = new Map(sources.map((source) => [source.id, source]));
    const next = ids.map((id) => map.get(String(id))).filter(Boolean);
    sources.forEach((source) => { if (!next.includes(source)) next.push(source); });
    sources = next;
    await writeJson(sourcesFile, sources);
    return sources.map(sanitizeSource);
  }

  async function getAuthState(id) {
    const auth = credentials[id];
    return {
      authenticated: !!(auth && (auth.token || auth.headers || auth.accessToken)),
      displayName: auth && auth.displayName ? String(auth.displayName).slice(0, 80) : ''
    };
  }

  async function login(id, payload) {
    const source = sources.find((item) => item.id === id);
    if (!source) fail(ERROR_CODES.CONFIG, 'source not found');
    if (!payload || typeof payload !== 'object') fail(ERROR_CODES.AUTH, 'credentials invalid');
    const token = typeof payload.token === 'string' ? payload.token.slice(0, 4096) : '';
    const displayName = typeof payload.displayName === 'string' ? payload.displayName.slice(0, 80) : '';
    if (!token) fail(ERROR_CODES.AUTH, 'token required');
    credentials[id] = { token, displayName };
    await writeJson(credentialsFile, encryptCredentials(credentials));
    return { authenticated: true, displayName };
  }

  async function logout(id) {
    delete credentials[id];
    await writeJson(credentialsFile, encryptCredentials(credentials));
    return { authenticated: false, displayName: '' };
  }

  /* ---------------- Spotify：OAuth(PKCE) + 官方 Web API ---------------- */

  function spotifyConfig(source) {
    const clientId = String((source && source.clientId) || '').trim();
    if (!clientId) fail(ERROR_CODES.CONFIG, 'spotify client id missing');
    return clientId;
  }

  async function spotifyForm(url, form) {
    const fetchFn = getFetch();
    let response;
    try {
      response = await fetchFn(url, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded', 'accept': 'application/json' },
        body: new URLSearchParams(form).toString()
      });
    } catch {
      fail(ERROR_CODES.NETWORK, 'network request failed');
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > MAX_RESPONSE_BYTES) fail(ERROR_CODES.TOO_LARGE, 'response too large');
    let json;
    try {
      json = JSON.parse(buffer.toString('utf8'));
    } catch {
      fail(ERROR_CODES.RESPONSE, 'response is not JSON');
    }
    if (!response.ok || json.error) {
      fail(String(json.error || '').includes('invalid_grant') ? ERROR_CODES.AUTH : ERROR_CODES.HTTP, `HTTP ${response.status}`);
    }
    return json;
  }

  /** 取得可用的访问令牌（过期就用 refresh_token 换新；全程只在主进程内） */
  async function spotifyAccessToken(source) {
    const clientId = spotifyConfig(source);
    const cred = credentials[source.id];
    if (!cred || !cred.accessToken) fail(ERROR_CODES.AUTH, 'spotify not logged in');
    if (cred.expiresAt && Date.now() < cred.expiresAt - 30000) return cred.accessToken;
    if (!cred.refreshToken) fail(ERROR_CODES.AUTH, 'spotify refresh token missing');
    const json = await spotifyForm(`${SPOTIFY.accountsBase}${SPOTIFY.tokenPath}`, {
      grant_type: 'refresh_token',
      refresh_token: cred.refreshToken,
      client_id: clientId
    });
    credentials[source.id] = {
      ...cred,
      accessToken: json.access_token,
      refreshToken: json.refresh_token || cred.refreshToken,
      expiresAt: Date.now() + (Number(json.expires_in) || 3600) * 1000
    };
    await writeJson(credentialsFile, encryptCredentials(credentials));
    return credentials[source.id].accessToken;
  }

  /** Spotify 登录：官方 Authorization Code + PKCE，回调走本机回环地址 */
  async function spotifyLogin(id) {
    const source = findSource(id);
    if (!source || source.sourceType !== 'spotify') fail(ERROR_CODES.CONFIG, 'not a spotify source');
    const clientId = spotifyConfig(source);
    const openExternal = typeof options.openExternal === 'function' ? options.openExternal : null;
    if (!openExternal) fail(ERROR_CODES.CONFIG, 'openExternal unavailable');

    const verifier = base64Url(require('node:crypto').randomBytes(64));
    const challenge = base64Url(require('node:crypto').createHash('sha256').update(verifier).digest());
    const state = base64Url(require('node:crypto').randomBytes(16));

    const http = require('node:http');
    let server;
    const codePromise = new Promise((resolve, reject) => {
      server = http.createServer((req, res) => {
        const url = new URL(req.url || '/', 'http://127.0.0.1');
        if (url.pathname !== '/callback') {
          res.writeHead(404).end('not found');
          return;
        }
        const code = url.searchParams.get('code') || '';
        const returnedState = url.searchParams.get('state') || '';
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
          .end('<!doctype html><meta charset="utf-8"><title>RlonDSP</title><p>Spotify 登录完成，可以关闭此窗口。</p>');
        if (returnedState !== state) reject(new OnlineSourceError(ERROR_CODES.AUTH, 'spotify state mismatch'));
        else if (!code) reject(new OnlineSourceError(ERROR_CODES.AUTH, 'spotify code missing'));
        else resolve(code);
      });
    });
    await new Promise((resolve, reject) => {
      server.once('error', () => reject(new OnlineSourceError(ERROR_CODES.NETWORK, 'loopback server failed')));
      server.listen(0, '127.0.0.1', resolve);
    });
    const port = server.address().port;
    const redirectUri = `http://127.0.0.1:${port}/callback`;
    const authorize = new URL(`${SPOTIFY.accountsBase}${SPOTIFY.authorizePath}`);
    authorize.searchParams.set('client_id', clientId);
    authorize.searchParams.set('response_type', 'code');
    authorize.searchParams.set('redirect_uri', redirectUri);
    authorize.searchParams.set('code_challenge_method', 'S256');
    authorize.searchParams.set('code_challenge', challenge);
    authorize.searchParams.set('state', state);
    authorize.searchParams.set('scope', SPOTIFY.scopes.join(' '));

    const timer = setTimeout(() => {
      try { server.close(); } catch { /* ignore */ }
    }, 180000);
    try {
      await openExternal(authorize.toString());
      const code = await codePromise;
      const json = await spotifyForm(`${SPOTIFY.accountsBase}${SPOTIFY.tokenPath}`, {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: verifier
      });
      let displayName = '';
      try {
        const me = await requestJson({ ...source, baseUrl: SPOTIFY.apiBase },
          { method: 'GET', path: '/me', query: {}, headers: { 'user-agent': 'RlonDSP/1.0 (+online-resources)' }, bearer: json.access_token },
          {});
        displayName = String((me && (me.display_name || me.id)) || '').slice(0, 80);
      } catch { displayName = ''; }
      credentials[source.id] = {
        accessToken: json.access_token,
        refreshToken: json.refresh_token || '',
        expiresAt: Date.now() + (Number(json.expires_in) || 3600) * 1000,
        displayName
      };
      await writeJson(credentialsFile, encryptCredentials(credentials));
      return { authenticated: true, displayName };
    } catch (error) {
      fail(error && error.code ? error.code : ERROR_CODES.AUTH, 'spotify login failed');
    } finally {
      clearTimeout(timer);
      try { server.close(); } catch { /* ignore */ }
    }
  }

  /* Spotify 各接口 → RlonDSP 统一的资源结构（保留 provider 归属与官方链接） */
  function spotifyAccount(source) {
    return String((credentials[source.id] && credentials[source.id].displayName) || '').slice(0, 80);
  }

  function spotifyImage(images) {
    const list = Array.isArray(images) ? images : [];
    const best = list.find((item) => item && /^https:\/\//i.test(String(item.url || ''))) || list[0];
    return best ? String(best.url || '') : '';
  }

  function spotifyResource(source, raw, type) {
    const item = raw || {};
    const artists = Array.isArray(item.artists) ? item.artists.map((a) => String((a && a.name) || '')).filter(Boolean) : [];
    const owner = item.owner ? String(item.owner.display_name || item.owner.id || '') : '';
    const title = String(item.name || '');
    const preview = /^https:\/\//i.test(String(item.preview_url || '')) ? String(item.preview_url) : '';
    const external = item.external_urls && /^https:\/\/open\.spotify\.com\//i.test(String(item.external_urls.spotify || ''))
      ? String(item.external_urls.spotify)
      : (type === 'playlist' ? '' : '');
    return {
      id: String(item.id || ''),
      type,
      sourceId: source.id,
      sourceType: source.sourceType,
      provider: 'spotify',
      title,
      name: title,
      artist: artists.join(', ') || owner,
      album: String((item.album && item.album.name) || ''),
      duration: Number(item.duration_ms || 0) / 1000,
      coverUrl: spotifyImage((item.album && item.album.images) || item.images),
      playUrl: preview,
      externalUrl: external
    };
  }

  async function spotifyGet(source, path, query) {
    const token = await spotifyAccessToken(source);
    return requestJson(
      { ...source, baseUrl: SPOTIFY.apiBase },
      {
        method: 'GET',
        path,
        query: query || {},
        headers: { 'user-agent': 'RlonDSP/1.0 (+online-resources)' },
        bearer: token
      },
      {}
    );
  }

  async function spotifySearch(source, payload) {
    const query = String((payload && payload.query) || '').trim();
    if (!query) fail(ERROR_CODES.CONFIG, 'spotify query required');
    const type = ['song', 'artist', 'album', 'playlist'].includes(payload && payload.type) ? payload.type : 'song';
    const limit = Math.max(1, Math.min(50, Number(payload && payload.limit) || SPOTIFY.limit));
    const kind = type === 'song' ? 'track' : type;
    const json = await spotifyGet(source, '/search', { q: query, type: kind, limit });
    const bucket = `${kind}s`;
    const items = (json && json[bucket] && Array.isArray(json[bucket].items)) ? json[bucket].items : [];
    const mapped = items
      .map((item) => spotifyResource(source, item, type === 'song' ? 'song' : type))
      .filter((item) => item.id && item.title);
    if (!mapped.length) fail(ERROR_CODES.MAPPING, 'no mapped results');
    return mapped;
  }

  async function spotifyDiscovery(source) {
    const sections = { song: [], album: [], playlist: [], category: [] };
    let got = false;
    // 用户自己的真实内容：热门曲目 / 歌单 / 收藏专辑（都需要用户授权，取不到就整块跳过）
    const jobs = [
      ['song', '/me/top/tracks', { limit: SPOTIFY.limit, time_range: 'short_term' }, 'items', 'song'],
      ['playlist', '/me/playlists', { limit: SPOTIFY.limit }, 'items', 'playlist'],
      ['album', '/me/albums', { limit: SPOTIFY.limit }, 'items', 'album']
    ];
    for (const [key, path, query, listKey, type] of jobs) {
      try {
        const json = await spotifyGet(source, path, query);
        const raw = Array.isArray(json && json[listKey]) ? json[listKey] : (Array.isArray(json && json.items) ? json.items : []);
        sections[key] = raw
          // 只有「收藏专辑」返回的是 { added_at, album:{...} } 外壳，需要拆一层；
          // 热门曲目本身就是 track，直接映射（早前误按 album 拆包会把歌名换成专辑名）。
          .map((entry) => spotifyResource(source, type === 'album' && entry && entry.album ? entry.album : entry, type))
          .filter((item) => item.id && item.title);
        if (sections[key].length) got = true;
      } catch { /* 单个 Shelf 取不到就跳过，不伪造 */ }
    }
    try {
      const json = await spotifyGet(source, '/browse/categories', { limit: Math.min(50, SPOTIFY.limit) });
      sections.category = (Array.isArray(json && json.categories && json.categories.items) ? json.categories.items : [])
        .map((item) => spotifyResource(source, item, 'playlist'))
        .filter((item) => item.id && item.title);
    } catch { sections.category = []; }
    if (!got) fail(ERROR_CODES.AUTH, 'spotify has no browsable content');
    return {
      ok: true,
      supported: true,
      provider: 'spotify',
      country: '',
      account: spotifyAccount(source),
      updated: new Date().toISOString(),
      sections
    };
  }

  /* ---------------- MusicSquare 适配器（多平台聚合，见文件顶部 MUSICSQUARE 说明） ---------------- */

  /** 该来源启用的平台（按 MUSICSQUARE.platforms 的固定顺序，界面与结果顺序都稳定） */
  function musicsquareEnabledPlatforms(source) {
    const configured = (source && source.platforms) || {};
    return Object.keys(MUSICSQUARE.platforms).filter((key) => configured[key] !== false);
  }

  /** 资源 id 形如 `<platform>:<上游原始 id>`（provider 是解析详情必需的身份） */
  function musicsquareSplitId(value) {
    const raw = String(value || '');
    const at = raw.indexOf(':');
    if (at <= 0 || at === raw.length - 1) return { provider: '', nativeId: '' };
    return { provider: raw.slice(0, at), nativeId: raw.slice(at + 1) };
  }

  /** 平台请求：固定走平台主机，凭据一律摘掉（第三方主机永远拿不到用户令牌） */
  function musicsquareRequest(source, provider, path, query) {
    const platform = MUSICSQUARE.platforms[provider];
    if (!platform) fail(ERROR_CODES.CONFIG, 'musicsquare platform not supported');
    return requestJson(
      { ...source, baseUrl: platform.host, auth: { type: 'none' } },
      { method: 'GET', path, query, headers: { 'user-agent': MUSICSQUARE.userAgent } },
      {}
    );
  }

  function musicsquareResource(source, provider, nativeId, index, query) {
    return {
      id: `${provider}:${nativeId}`,
      type: 'song',
      sourceId: source.id,
      sourceType: 'musicsquare',
      provider,
      providerLabel: MUSICSQUARE.platforms[provider].label,
      providerIndex: index + 1,
      query,
      title: '',
      name: '',
      artist: '',
      album: '',
      duration: 0,
      coverUrl: '',
      // 上游搜索阶段多数平台不给播放地址：这里留空，播放/下载时按需解析
      playUrl: '',
      quality: '',
      sizeBytes: 0,
      externalUrl: ''
    };
  }

  /** 上游的时长是 'mm:ss'（JOOX）或整秒字符串（酷我）：按真实文本解析，解析不了就 0 */
  function musicsquareDuration(value) {
    const raw = String(value == null ? '' : value).trim();
    const clock = raw.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
    if (clock) {
      const minutes = Number(clock[1]);
      const seconds = Number(clock[2]);
      return Number.isFinite(minutes) && Number.isFinite(seconds) ? minutes * 60 + seconds : 0;
    }
    const numeric = Number(raw);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
  }

  /** 上游的体积是 '52.83Mb' / '5,784,123' 之类的文本：只为展示与下载预估，精度按 1024 标注 */
  function musicsquareBytes(value) {
    const raw = String(value == null ? '' : value).trim().replace(/,/g, '');
    if (!raw) return 0;
    const matched = raw.match(/^([\d.]+)\s*(tb|gb|mb|kb|b)?$/i);
    if (!matched) return 0;
    const amount = Number(matched[1]);
    if (!Number.isFinite(amount) || amount < 0) return 0;
    const unit = (matched[2] || 'b').toLowerCase();
    const factor = unit === 'tb' ? 1024 ** 4 : unit === 'gb' ? 1024 ** 3 : unit === 'mb' ? 1024 ** 2 : unit === 'kb' ? 1024 : 1;
    return Math.round(amount * factor);
  }

  function musicsquareQualityText(bitrate, format) {
    const kbps = String(bitrate || '').trim();
    const kind = String(format || '').trim().toUpperCase();
    if (kbps && kind) return `${kind} ${kbps}k`;
    return kind || (kbps ? `${kbps}k` : '');
  }

  /** 逐平台搜索 → 统一资源结构；条目缺少必需字段的一律丢弃，不做补位 */
  async function musicsquarePlatformSearch(source, provider, query, limit) {
    const platform = MUSICSQUARE.platforms[provider];
    if (provider === 'netease') {
      // meting 的搜索响应里已经带上了播放 / 封面 / 歌词地址，播放时直接复用真实地址
      const json = await musicsquareRequest(source, provider, platform.searchPath, {
        type: 'search', id: query, limit: String(limit), server: 'netease'
      });
      if (!Array.isArray(json)) fail(ERROR_CODES.MAPPING, 'musicsquare netease items invalid');
      return json.map((item, index) => {
        const resource = musicsquareResource(source, provider, '', index, query);
        const playUrl = String((item && item.url) || '');
        let nativeId = '';
        try {
          nativeId = new URL(playUrl).searchParams.get('id') || '';
        } catch { nativeId = ''; }
        if (!nativeId) return null;
        resource.id = `${provider}:${nativeId}`;
        resource.title = String((item && item.name) || '');
        resource.name = resource.title;
        resource.artist = String((item && item.artist) || '');
        resource.coverUrl = String((item && item.pic) || '');
        resource.playUrl = /^https?:\/\//i.test(playUrl) ? playUrl : '';
        resource.lyricUrl = /^https?:\/\//i.test(String((item && item.lrc) || '')) ? String(item.lrc) : '';
        return resource.title ? resource : null;
      }).filter(Boolean);
    }
    if (provider === 'qq') {
      // 搜索只给 song_mid 与付费标记；播放地址在详情接口里（song_play_url*）
      const json = await musicsquareRequest(source, provider, platform.searchPath, { msg: query, type: 'json' });
      const items = Array.isArray(json) ? json : (Array.isArray(json && json.data) ? json.data : []);
      if (!Array.isArray(items)) fail(ERROR_CODES.MAPPING, 'musicsquare qq items invalid');
      return items.slice(0, limit).map((item, index) => {
        const nativeId = String((item && (item.song_mid || item.songmid)) || '');
        if (!nativeId) return null;
        const resource = musicsquareResource(source, provider, nativeId, index, query);
        resource.title = String((item && (item.song_title || item.song_name)) || '');
        resource.name = resource.title;
        resource.artist = String((item && item.singer_name) || '');
        resource.paywalled = !!(item && item.pay);
        return resource.title ? resource : null;
      }).filter(Boolean);
    }
    if (provider === 'kuwo') {
      const json = await musicsquareRequest(source, provider, platform.searchPath, { msg: query, page: '1', limit: String(limit) });
      const items = Array.isArray(json && json.data) ? json.data : [];
      return items.slice(0, limit).map((item, index) => {
        const nativeId = String((item && item.rid) || '');
        if (!nativeId) return null;
        const resource = musicsquareResource(source, provider, nativeId, index, query);
        resource.title = String((item && item.song) || '');
        resource.name = resource.title;
        resource.artist = String((item && item.singer) || '');
        resource.album = String((item && item.album) || '');
        resource.coverUrl = String((item && item.picture) || '');
        resource.duration = musicsquareDuration(item && item.time);
        // 上游给的是同一首歌的多个清晰度：取最高码率那一档作为展示的清晰度与体积预估
        const variants = Array.isArray(item && item.types) ? item.types : [];
        const best = variants
          .map((variant) => ({ bitrate: Number(variant && variant.bitrate) || 0, format: variant && variant.format, size: variant && variant.size }))
          .sort((a, b) => b.bitrate - a.bitrate)[0];
        if (best) {
          resource.quality = musicsquareQualityText(best.bitrate, best.format);
          resource.sizeBytes = musicsquareBytes(best.size);
        }
        return resource.title ? resource : null;
      }).filter(Boolean);
    }
    // joox
    const json = await musicsquareRequest(source, provider, platform.searchPath, {
      msg: query, token: MUSICSQUARE.jooxToken, br: MUSICSQUARE.jooxBr
    });
    const songs = json && json.code === 200 && json.data && Array.isArray(json.data.songs) ? json.data.songs : [];
    return songs.slice(0, limit).map((item, index) => {
      const nativeId = String((item && (item.songmid || item['歌曲ID'])) || '');
      if (!nativeId) return null;
      const resource = musicsquareResource(source, provider, nativeId, index, query);
      resource.title = String((item && item['歌曲名称']) || '');
      resource.name = resource.title;
      resource.artist = String((item && item['歌手']) || '');
      resource.album = String((item && item['专辑']) || '');
      resource.duration = musicsquareDuration(item && item['时长']);
      return resource.title ? resource : null;
    }).filter(Boolean);
  }

  async function musicsquareSearch(source, payload) {
    const query = typeof (payload && payload.query) === 'string' ? payload.query.trim().slice(0, 120) : '';
    if (!query) fail(ERROR_CODES.CONFIG, 'musicsquare query required');
    const type = (payload && payload.type) || 'song';
    if (type !== 'song') fail(ERROR_CODES.CONFIG, 'musicsquare supports song search only');
    const limit = Math.max(1, Math.min(50, Number(payload && payload.limit) || MUSICSQUARE.limit));
    const platforms = musicsquareEnabledPlatforms(source);
    if (!platforms.length) fail(ERROR_CODES.CONFIG, 'musicsquare has no enabled platform');
    const settled = await Promise.all(platforms.map(async (provider) => {
      try {
        return { provider, items: await musicsquarePlatformSearch(source, provider, query, limit) };
      } catch {
        // 单个平台失效不影响其它平台，但失败会记录在下面的归类里
        return { provider, items: null };
      }
    }));
    const merged = [];
    const failed = [];
    for (const entry of settled) {
      if (Array.isArray(entry.items)) merged.push(...entry.items);
      else failed.push(entry.provider);
    }
    // 平台顺序固定（与设置里的顺序一致），平台内保持上游返回的名次
    merged.sort((a, b) => (platforms.indexOf(a.provider) - platforms.indexOf(b.provider))
      || (a.providerIndex - b.providerIndex));
    if (!merged.length) {
      // 全部平台都失败 = 真实网络 / 上游故障；部分平台失败但拿到结果则按真实结果返回
      if (failed.length === platforms.length) fail(ERROR_CODES.NETWORK, 'musicsquare upstream unavailable');
      fail(ERROR_CODES.MAPPING, 'no mapped results');
    }
    return merged.slice(0, 100);
  }

  /** QQ：按上游优先级挑最高可用清晰度（sq → pq → accom → hq → standard → fq → 普通） */
  function musicsquarePickQQUrl(detail) {
    const candidates = [
      ['song_play_url_sq', 'song_size_sq_str', 'kbps_sq', 'FLAC'],
      ['song_play_url_pq', 'song_size_pq_str', 'kbps_pq', 'FLAC'],
      ['song_play_url_accom', 'song_size_accom_str', 'kbps_accom', 'OGG'],
      ['song_play_url_hq', 'song_size_hq_str', 'kbps_hq', 'M4A'],
      ['song_play_url_standard', 'song_size_standard_str', 'kbps_standard', 'M4A'],
      ['song_play_url_fq', 'song_size_fq_str', 'kbps_fq', 'M4A'],
      ['song_play_url', 'song_size_str', 'kbps', 'M4A']
    ];
    for (const [urlKey, sizeKey, kbpsKey, format] of candidates) {
      const url = String(detail[urlKey] || '');
      if (!/^https?:\/\//i.test(url)) continue;
      return {
        url,
        quality: musicsquareQualityText(detail[kbpsKey], format),
        sizeBytes: musicsquareBytes(detail[sizeKey])
      };
    }
    return { url: '', quality: '', sizeBytes: 0 };
  }

  /** JOOX：上游给一份「播放链接」字典，按可用清晰度挑一个真实地址 */
  function musicsquarePickJooxUrl(links) {
    const map = links && typeof links === 'object' ? links : {};
    const order = ['无损FLAC', 'Hi-Res无损', 'MP3 320', 'OGG 320', 'AAC 192', 'OGG 192', 'MP3 128', 'AAC 96', 'AAC 48', '母带无损', 'Atmos全景声', '30s 18'];
    for (const name of order) {
      const url = String(map[name] || '');
      if (/^https?:\/\//i.test(url)) return { url, quality: name };
    }
    return { url: '', quality: '' };
  }

  /**
   * MusicSquare 播放地址解析：只返回上游真实给出的地址。
   * - netease：搜索阶段就带真实地址（播放时用 search 里带的，缺失则按 id 重建 meting 地址）；
   * - qq / joox：按 song_mid / songmid 调详情接口（重启后 offline id 仍可用）；
   * - kuwo：上游详情必须按「关键词 + 名次 n」取，所以先用关键词搜一次、按 rid 定位名次，
   *   再取该名次的详情；定位不到就明确失败，绝不猜一首歌的地址。
   */
  async function musicsquareResolve(source, payload) {
    const { provider, nativeId } = musicsquareSplitId(payload && payload.id);
    const platform = MUSICSQUARE.platforms[provider];
    if (!nativeId || !platform) fail(ERROR_CODES.PLAY_URL, 'musicsquare id invalid');
    if ((source.platforms || {})[provider] === false) fail(ERROR_CODES.PLAY_URL, 'musicsquare platform disabled');
    const title = String((payload && (payload.title || payload.name)) || '').trim().slice(0, 200);
    const artist = String((payload && payload.artist) || '').trim().slice(0, 200);
    if (provider === 'netease') {
      if (payload && /^https?:\/\//i.test(String(payload.playUrl || ''))) {
        return validateHttpUrl(payload.playUrl, 'playUrl', { allowQuery: true }).toString();
      }
      const url = new URL(`${platform.host}${platform.urlPath}`);
      url.searchParams.set('server', 'netease');
      url.searchParams.set('type', 'url');
      url.searchParams.set('id', nativeId);
      return url.toString();
    }
    if (provider === 'qq') {
      const json = await musicsquareRequest(source, provider, platform.searchPath, {
        msg: (payload && payload.query) || [title, artist].filter(Boolean).join(' ') || nativeId,
        type: 'json',
        mid: nativeId
      });
      const detail = json && typeof json === 'object' && !Array.isArray(json) ? json : null;
      if (!detail || String(detail.song_mid || '') !== nativeId) fail(ERROR_CODES.PLAY_URL, 'qq track not found upstream');
      const best = musicsquarePickQQUrl(detail);
      if (!best.url) fail(ERROR_CODES.PLAY_URL, 'qq play url unavailable');
      return validateHttpUrl(best.url, 'playUrl', { allowQuery: true }).toString();
    }
    if (provider === 'kuwo') {
      const query = String((payload && payload.query) || [title, artist].filter(Boolean).join(' ') || nativeId).trim().slice(0, 120);
      const list = await musicsquareRequest(source, provider, platform.searchPath, { msg: query, page: '1', limit: '10' });
      const items = Array.isArray(list && list.data) ? list.data : [];
      const index = items.findIndex((item) => String((item && item.rid) || '') === nativeId);
      if (index < 0) fail(ERROR_CODES.PLAY_URL, 'kuwo track not found upstream');
      const detailJson = await musicsquareRequest(source, provider, platform.searchPath, { msg: query, n: String(index + 1), br: '1' });
      const detail = detailJson && detailJson.data && !Array.isArray(detailJson.data) ? detailJson.data : null;
      const url = String((detail && detail.url) || '');
      if (!/^https?:\/\//i.test(url)) fail(ERROR_CODES.PLAY_URL, 'kuwo play url unavailable');
      if (String(detail.rid || '') !== nativeId) fail(ERROR_CODES.PLAY_URL, 'kuwo track mismatch');
      return validateHttpUrl(url, 'playUrl', { allowQuery: true }).toString();
    }
    // joox
    const json = await musicsquareRequest(source, provider, platform.searchPath, {
      mid: nativeId, token: MUSICSQUARE.jooxToken, br: MUSICSQUARE.jooxBr
    });
    const detail = json && json.code === 200 && json.data ? json.data : null;
    if (!detail) fail(ERROR_CODES.PLAY_URL, 'joox detail unavailable');
    // 上游按 songmid 返回详情：对不上就是不同一首歌，宁可失败也不返回别人的地址
    if (String((detail && detail.songmid) || '') && String(detail.songmid) !== nativeId) fail(ERROR_CODES.PLAY_URL, 'joox track mismatch');
    const best = musicsquarePickJooxUrl(detail['播放链接']);
    if (!best.url) fail(ERROR_CODES.PLAY_URL, 'joox play url unavailable');
    return validateHttpUrl(best.url, 'playUrl', { allowQuery: true }).toString();
  }

  function buildHeaders(source, extra) {
    const headers = { 'accept': 'application/json' };
    const auth = credentials[source.id];
    if (auth && auth.token && source.auth.type === 'bearer') headers[source.auth.headerName] = `${source.auth.prefix}${auth.token}`;
    if (auth && auth.token && source.auth.type === 'header') headers[source.auth.headerName] = auth.token;
    // 少量按请求附加的安全头（例如榜单主机要求的 User-Agent）：
    // 仍然过一遍禁用名单与长度限制，凭据类头一律不允许从这里塞进来。
    if (extra && typeof extra === 'object') {
      for (const [key, value] of Object.entries(extra)) {
        const name = String(key || '').toLowerCase();
        if (!name || BLOCKED_HEADERS.has(name) || name === 'authorization') continue;
        if (typeof value !== 'string' || !value || value.length > 200) continue;
        headers[key] = value;
      }
    }
    return headers;
  }

  function buildUrl(source, config, vars) {
    const base = validateHttpUrl(source.baseUrl, 'source.baseUrl');
    const pathText = fillPathTemplate(config.path, vars);
    if (pathText.startsWith('http://') || pathText.startsWith('https://')) fail(ERROR_CODES.URL, 'absolute path not allowed');
    const basePath = base.pathname.replace(/\/+$/, '');
    const url = new URL(basePath + pathText, base.origin);
    if (url.origin !== base.origin) fail(ERROR_CODES.URL, 'cross-origin request blocked');
    for (const [key, value] of Object.entries(config.query || {})) {
      url.searchParams.set(key, fillValueTemplate(value, vars));
    }
    return url;
  }

  async function requestJson(source, config, vars) {
    const fetchFn = getFetch();
    let url = buildUrl(source, config, vars);
    const body = config.body ? JSON.stringify(config.body, (key, value) => (
      typeof value === 'string' ? fillValueTemplate(value, vars) : value
    )) : undefined;
    const headers = buildHeaders(source, config.headers);
    // 内部适配器（Spotify 等）用受控字段附加 Bearer：只存在于主进程的请求头里，
    // 不回传 renderer、不写日志。声明式源依旧无法通过 extra headers 塞入 authorization。
    if (typeof config.bearer === 'string' && config.bearer) headers.authorization = `Bearer ${config.bearer}`;
    if (body && !headers['content-type']) headers['content-type'] = 'application/json';
    let response;
    for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect++) {
      try {
        response = await fetchFn(url.toString(), {
          method: config.method,
          headers,
          body,
          redirect: 'manual'
        });
      } catch {
        fail(ERROR_CODES.NETWORK, 'network request failed');
      }
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      const location = response.headers.get('location');
      if (!location) fail(ERROR_CODES.REDIRECT, 'redirect without location');
      url = new URL(location, url);
      if (url.origin !== new URL(source.baseUrl).origin) fail(ERROR_CODES.REDIRECT, 'cross-origin redirect blocked');
      if (redirect === MAX_REDIRECTS) fail(ERROR_CODES.REDIRECT, 'too many redirects');
    }
    if (!response.ok) {
      fail(response.status === 401 || response.status === 403 ? ERROR_CODES.AUTH : ERROR_CODES.HTTP, `HTTP ${response.status}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > MAX_RESPONSE_BYTES) fail(ERROR_CODES.TOO_LARGE, 'response too large');
    let json;
    try {
      json = JSON.parse(buffer.toString('utf8'));
    } catch {
      fail(ERROR_CODES.RESPONSE, 'response is not JSON');
    }
    return json;
  }

  function findSource(id) {
    return sources.find((item) => item.id === id);
  }

  async function searchSource(source, payload) {
    if (!source || !source.enabled) fail(ERROR_CODES.CONFIG, 'source unavailable');
    const query = typeof payload?.query === 'string' ? payload.query.slice(0, 200) : '';
    const type = ['song', 'artist', 'album', 'playlist'].includes(payload?.type) ? payload.type : 'song';
    const page = Math.max(1, Math.min(100, Number(payload?.page) || 1));
    const json = await requestJson(source, source.search, { query, type, page, limit: payload?.limit || 30 });
    const itemsPath = source.search.itemsPath || (source.mapping && source.mapping.items) || 'data';
    const items = jsonPath(json, itemsPath) || jsonPath(json, 'data');
    if (!Array.isArray(items)) fail(ERROR_CODES.MAPPING, 'response items invalid');
    const normalized = items.slice(0, 100).map((item) => normalizeResource(item, source, type));
    for (const item of normalized) {
      if (!item.id || !item.title) fail(ERROR_CODES.MAPPING, 'required mapping field missing');
    }
    return normalized;
  }

  async function search(id, payload) {
    const source = findSource(id);
    if (source && source.sourceType === 'spotify') return spotifySearch(source, payload || {});
    if (source && source.sourceType === 'musicsquare') return musicsquareSearch(source, payload || {});
    return searchSource(source, payload || {});
  }

  async function getDetail(id, payload) {
    const source = findSource(id);
    if (!source || !source.enabled) fail(ERROR_CODES.CONFIG, 'source unavailable');
    const resourceId = assertString(payload?.id, 'resource.id', 1, 200);
    if (source.sourceType === 'musicsquare') {
      // MusicSquare 没有独立的详情端点：详情就是「这条资源 + 上游真实地址」。
      // 解析不到地址时保留其它真实字段，只把 playUrl 留空（界面据此显示不可播放 / 不可下载）。
      const base = {
        id: resourceId,
        type: 'song',
        sourceId: source.id,
        sourceType: source.sourceType,
        provider: String(payload?.provider || musicsquareSplitId(resourceId).provider).slice(0, 32),
        providerLabel: MUSICSQUARE.platforms[musicsquareSplitId(resourceId).provider]?.label || '',
        title: String(payload?.title || '').slice(0, 300),
        name: String(payload?.title || '').slice(0, 300),
        artist: String(payload?.artist || '').slice(0, 300),
        album: String(payload?.album || '').slice(0, 300),
        duration: Number(payload?.duration) || 0,
        coverUrl: /^https?:\/\//i.test(String(payload?.coverUrl || '')) ? String(payload.coverUrl) : '',
        playUrl: '',
        quality: String(payload?.quality || '').slice(0, 40),
        sizeBytes: Number(payload?.sizeBytes) || 0,
        externalUrl: ''
      };
      try {
        const url = await musicsquareResolve(source, { ...payload, id: resourceId });
        return { ...base, playUrl: url };
      } catch {
        return base;
      }
    }
    if (source.sourceType === 'spotify') {
      const type = ['song', 'album', 'artist', 'playlist'].includes(payload?.type) ? payload.type : 'song';
      const path = type === 'song' ? '/tracks/' : (type === 'album' ? '/albums/' : (type === 'artist' ? '/artists/' : '/playlists/'));
      const json = await spotifyGet(source, `${path}${encodeURIComponent(resourceId)}`, {});
      const detail = spotifyResource(source, json, type === 'song' ? 'song' : type);
      if (!detail.id) fail(ERROR_CODES.MAPPING, 'spotify detail invalid');
      return detail;
    }
    const json = await requestJson(source, source.detail, { id: resourceId });
    const value = jsonPath(json, source.detail.responsePath) || jsonPath(json, 'data') || json;
    return normalizeResource(value, source, payload?.type || 'song');
  }

  async function resolvePlayUrl(id, payload) {
    const source = findSource(id);
    if (!source || !source.enabled) fail(ERROR_CODES.CONFIG, 'source unavailable');
    const resourceId = assertString(payload?.id, 'resource.id', 1, 200);
    if (source.sourceType === 'musicsquare') {
      return musicsquareResolve(source, { ...payload, id: resourceId });
    }
    if (source.sourceType === 'spotify') {
      // 只允许 Spotify 官方提供的 30 秒试听地址；没有就明确失败，绝不伪造/不绕权限
      if (typeof payload?.playUrl === 'string' && /^https:\/\//i.test(payload.playUrl)) {
        return validateHttpUrl(payload.playUrl, 'playUrl').toString();
      }
      const json = await spotifyGet(source, `/tracks/${encodeURIComponent(resourceId)}`, {});
      const preview = json && json.preview_url;
      if (!/^https:\/\//i.test(String(preview || ''))) fail(ERROR_CODES.PLAY_URL, 'spotify preview unavailable');
      return validateHttpUrl(preview, 'playUrl').toString();
    }
    if (typeof payload?.playUrl === 'string' && payload.playUrl) {
      try {
        return validateHttpUrl(payload.playUrl, 'playUrl').toString();
      } catch {
        fail(ERROR_CODES.PLAY_URL, 'invalid play url');
      }
    }
    const json = await requestJson(source, source.playUrl, { id: resourceId });
    const raw = jsonPath(json, source.playUrl.responsePath) || jsonPath(json, 'data.url') || jsonPath(json, 'url');
    let url;
    try {
      url = validateHttpUrl(raw, 'playUrl');
    } catch {
      fail(ERROR_CODES.PLAY_URL, 'invalid play url');
    }
    return url.toString();
  }

  /**
   * 首页自动发现：一次取回真实榜单（歌曲 / 专辑 / 歌单）。
   * - 不支持的来源返回 supported:false + 空分区（界面显示「暂无可用热门内容」），不伪造数据；
   * - 榜单只读公开数据，请求时不带用户凭据；
   * - 返回项保留 sourceId / sourceType / 原始资源 id，rank 为榜单里的真实名次（原始顺序 +1），
   *   随机只发生在展示层，这里不改写任何服务器数据。
   */
  async function getDiscovery(id, payload) {
    const source = findSource(id);
    if (!source) fail(ERROR_CODES.CONFIG, 'source not found');
    if (!source.enabled) fail(ERROR_CODES.CONFIG, 'source unavailable');
    if (source.sourceType === 'spotify') {
      const cacheKey = `${source.id}:spotify`;
      const cached = discoveryCache.get(cacheKey);
      if (!(payload && payload.force) && cached && Date.now() - cached.at < DISCOVERY_CACHE_TTL) return cached.value;
      const result = await spotifyDiscovery(source);
      discoveryCache.set(cacheKey, { at: Date.now(), value: result });
      return result;
    }
    if (!isAppleMusicHost(source.baseUrl)) {
      return {
        ok: true,
        supported: false,
        provider: '',
        country: '',
        updated: '',
        sections: { song: [], album: [], playlist: [] }
      };
    }
    const wanted = String((source.discovery && source.discovery.country) || '');
    const country = /^[a-z]{2}$/i.test(wanted) ? wanted.toLowerCase() : APPLE_CHARTS.country;
    const limit = Math.max(10, Math.min(APPLE_CHARTS.limit, Number(payload && payload.limit) || APPLE_CHARTS.limit));
    // 短期缓存：同一来源短时间内只取一次；界面点刷新时带 force 强制重取
    const cacheKey = `${source.id}:${country}:${limit}`;
    const cached = discoveryCache.get(cacheKey);
    if (!(payload && payload.force) && cached && Date.now() - cached.at < DISCOVERY_CACHE_TTL) {
      return cached.value;
    }
    // 访问榜单主机时摘掉来源凭据：令牌只发给用户自己配置的主机
    const chartsSource = { ...source, baseUrl: APPLE_CHARTS.baseUrl, auth: { type: 'none' } };
    const sections = { song: [], album: [], playlist: [] };
    let updated = '';
    for (const type of ['song', 'album', 'playlist']) {
      const json = await requestJson(
        chartsSource,
        { method: 'GET', path: APPLE_CHARTS.feeds[type], query: {}, headers: APPLE_CHARTS.headers },
        { country, limit }
      );
      const feed = json && json.feed;
      if (!feed || !Array.isArray(feed.results)) fail(ERROR_CODES.MAPPING, 'chart feed invalid');
      if (type === 'song' && !feed.results.length) fail(ERROR_CODES.MAPPING, 'chart feed empty');
      if (!updated && feed.updated) updated = String(feed.updated).slice(0, 80);
      sections[type] = feed.results
        .slice(0, limit)
        .map((item, index) => ({
          rank: index + 1,
          id: String(item.id || ''),
          type,
          sourceId: source.id,
          sourceType: source.sourceType,
          title: String(item.name || ''),
          name: String(item.name || ''),
          artist: String(item.artistName || ''),
          album: '',
          duration: 0,
          coverUrl: String(item.artworkUrl100 || ''),
          playUrl: '',
          // 真实分类：直接取榜单返回的 genres（没有就留空，不编造分类）
          genres: Array.isArray(item.genres)
            ? item.genres
              .map((genre) => String((genre && genre.name) || ''))
              .filter((name) => name && name !== 'Music')
              .slice(0, 3)
            : [],
          externalUrl: /^https:\/\//i.test(String(item.url || '')) ? String(item.url).slice(0, 500) : ''
        }))
        .filter((item) => item.id && item.title);
    }
    const result = { ok: true, supported: true, provider: 'apple-charts', country, updated, sections };
    discoveryCache.set(cacheKey, { at: Date.now(), value: result });
    return result;
  }

  async function testConnection(input) {
    const source = input && !input.baseUrl ? findSource(input.id) : validateSource(input);
    if (!source) fail(ERROR_CODES.CONFIG, 'source not found');
    const query = typeof input?.testQuery === 'string' && input.testQuery ? input.testQuery.slice(0, 80) : 'test';
    if (source.sourceType === 'musicsquare') {
      // 真实连通性检查：直接搜一次上游，拿到真实结果才算通过（不伪造 sample）
      const results = await musicsquareSearch(source, { query, type: 'song', limit: 10 });
      const first = results[0];
      return {
        ok: true,
        sample: {
          id: first.id,
          title: first.title,
          artist: first.artist,
          album: first.album,
          duration: first.duration,
          coverUrl: first.coverUrl,
          playUrl: first.playUrl ? '[resolved]' : ''
        }
      };
    }
    const results = await searchSource(source, { query, type: 'song', limit: 10 });
    if (!results.length) fail(ERROR_CODES.MAPPING, 'no mapped results');
    const first = results[0];
    if (source.mapping && source.mapping.playUrl && !first.playUrl) fail(ERROR_CODES.MAPPING, 'playUrl mapping missing');
    return {
      ok: true,
      sample: {
        id: first.id,
        title: first.title,
        artist: first.artist,
        album: first.album,
        duration: first.duration,
        coverUrl: first.coverUrl,
        playUrl: first.playUrl ? '[resolved]' : ''
      }
    };
  }

  async function getArtists(id, payload) {
    return search(id, { ...(payload || {}), type: 'artist' });
  }

  async function getAlbums(id, payload) {
    return search(id, { ...(payload || {}), type: 'album' });
  }

  async function getPlaylists(id, payload) {
    return search(id, { ...(payload || {}), type: 'playlist' });
  }

  return {
    init,
    listSources,
    saveSource,
    deleteSource,
    setEnabled,
    reorder,
    getAuthState,
    login,
    logout,
    spotifyLogin,
    search,
    getArtists,
    getAlbums,
    getPlaylists,
    getDetail,
    resolvePlayUrl,
    getDiscovery,
    testConnection,
    validateSource: (input) => validateSource(input)
  };
}

module.exports = {
  createOnlineSourceManager,
  validateSource: (input) => validateSource(input),
  sanitizeSource,
  MUSICSQUARE
};
