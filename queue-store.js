/*
 * RlonDSP Queue Store
 * Copyright © 2026 RlonDSP. All rights reserved.
 *
 * 播放队列持久化（主进程侧）。只做四件事：
 *   1. 结构校验：字段白名单 + 类型校验，绝不把磁盘内容整份塞进运行态对象；
 *   2. 版本校验：version 不匹配或结构损坏时安全回退为空队列，不抛错、不破坏文件；
 *   3. 容量裁剪：队列 ≤ 6、单队列 ≤ 3000 首；超限优先保护 activeQueue，其次 lastActiveQueue，
 *      再淘汰最旧的非活动队列；
 *   4. 串行 + 原子写入：同一文件同一时刻只有一个写在跑，先写临时文件再原子替换，
 *      应用异常退出不会留下半截 JSON。
 *
 * 安全边界（与整体模型一致）：
 *   - 只保存歌曲身份与展示元数据：本地只存 path；在线只存 sourceId / onlineId / 展示字段；
 *   - 在线播放地址是临时地址，不作为长期身份，因此「不写盘」；
 *   - 本地封面（cover dataURL）属可重新读取的大字段，同样不写盘；
 *   - 任何 Token / Cookie / Authorization / 密码类字段一律被白名单挡掉（本文件根本不接受）。
 */
const fsp = require('node:fs/promises');
const path = require('node:path');

/** 与 main.js 的 AUDIO_EXTENSIONS 保持一致（恢复队列时用于校验本地文件类型） */
const AUDIO_EXTENSIONS = new Set(['.mp3', '.flac', '.wav', '.ogg', '.m4a', '.aac', '.opus', '.wma', '.aiff', '.ape']);

const QUEUE_STORE_VERSION = 1;
const MAX_QUEUES = 6;
const MAX_SONGS_PER_QUEUE = 3000;

/** 队列 id 是受控标识：只能出现在 queues.json 里，永远不当作文件路径或 IPC 通道名使用 */
const QUEUE_ID_RE = /^queue:[A-Za-z0-9:_-]{1,72}$/;
const QUEUE_KINDS = new Set(['local', 'online', 'manual', 'history']);
/** 队列来源类型受控枚举：UI 不写死 Apple Music / Spotify，只按实际存在的队列显示 */
const SOURCE_TYPES = new Set(['local', 'manual', 'spotify', 'apple-music', 'history', 'search', 'album', 'playlist', 'artist']);
/** 在线曲目的来源适配器类型（与 online-source-layer.js 的 sourceType 对应） */
const ONLINE_SONG_SOURCE_TYPES = new Set(['declarative', 'spotify', 'musicsquare']);

const LOCAL_SONG_FIELDS = ['kind', 'path', 'title', 'artist', 'album', 'duration', 'sampleRate', 'bitrate', 'channels', 'bitdepth', 'codec'];
const ONLINE_SONG_FIELDS = ['kind', 'sourceType', 'sourceId', 'onlineId', 'title', 'artist', 'album', 'duration', 'coverUrl'];
const QUEUE_FIELDS = ['id', 'kind', 'sourceType', 'sourceId', 'title', 'subtitle', 'currentTrackKey', 'queuedNext', 'createdAt', 'updatedAt', 'dynamic', 'songs'];

function text(value, max) {
  if (typeof value !== 'string') return '';
  const limit = Number.isFinite(max) ? max : 200;
  // 去掉控制字符，避免把奇怪内容写回文件
  return value.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, limit);
}

function num(value, fallback, min, max) {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const lo = Number.isFinite(min) ? min : 0;
  const hi = Number.isFinite(max) ? max : Number.MAX_SAFE_INTEGER;
  return Math.min(hi, Math.max(lo, parsed));
}

function bool(value, fallback) {
  return typeof value === 'boolean' ? value : fallback;
}

/** 队列 id：非法 id 直接丢弃（避免任何形式的外部字符串进入标识位） */
function sanitizeQueueId(value) {
  const id = text(value, 80);
  return QUEUE_ID_RE.test(id) ? id : '';
}

/**
 * 单曲 -> 白名单对象。
 * 本地（kind=local）：只认 path（身份）+ 展示元数据；
 * 在线（kind=online）：只认 sourceId + onlineId（身份）+ 展示元数据。
 * 其余字段（url / cover / token / 任何未知键）一律不落盘。
 */
function sanitizeSong(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  if (input.kind === 'online') {
    const sourceId = text(input.sourceId, 72);
    const onlineId = text(input.onlineId, 200);
    const sourceType = text(input.sourceType, 32);
    if (!sourceId || !onlineId) return null;
    if (!ONLINE_SONG_SOURCE_TYPES.has(sourceType)) return null;
    const song = {
      kind: 'online',
      sourceType,
      sourceId,
      onlineId,
      title: text(input.title, 300),
      artist: text(input.artist, 300),
      album: text(input.album, 300),
      duration: num(input.duration, 0, 0, 24 * 3600),
      coverUrl: text(input.coverUrl, 2000)
    };
    if (!/^https?:\/\//i.test(song.coverUrl)) song.coverUrl = '';
    return song;
  }
  const filePath = text(input.path, 4096);
  if (!filePath) return null;
  const song = {
    kind: 'local',
    path: filePath,
    title: text(input.title, 300),
    artist: text(input.artist, 300),
    album: text(input.album, 300),
    duration: num(input.duration, 0, 0, 24 * 3600),
    sampleRate: num(input.sampleRate, 0, 0, 768000),
    bitrate: num(input.bitrate, 0, 0, 100000000),
    channels: num(input.channels, 0, 0, 64),
    bitdepth: num(input.bitdepth, 0, 0, 64),
    codec: text(input.codec, 40)
  };
  // 只接受音频扩展名，避免把任意路径当成可播文件
  if (!AUDIO_EXTENSIONS.has(path.extname(song.path).toLowerCase())) return null;
  return song;
}

/** 队列 -> 白名单对象 */
function sanitizeQueue(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const id = sanitizeQueueId(input.id);
  if (!id) return null;
  const kind = QUEUE_KINDS.has(input.kind) ? input.kind : 'local';
  const sourceId = text(input.sourceId, 72);
  const rawSourceType = text(input.sourceType, 32);
  const sourceType = SOURCE_TYPES.has(rawSourceType) ? rawSourceType : (kind === 'online' ? '' : 'local');
  const songs = [];
  const rawSongs = Array.isArray(input.songs) ? input.songs : [];
  for (const rawSong of rawSongs) {
    if (songs.length >= MAX_SONGS_PER_QUEUE) break;
    const song = sanitizeSong(rawSong);
    if (song) songs.push(song);
  }
  const queuedNext = [];
  const rawQueuedNext = Array.isArray(input.queuedNext) ? input.queuedNext : [];
  for (const item of rawQueuedNext) {
    const key = text(item, 300);
    if (key && !queuedNext.includes(key) && queuedNext.length < 200) queuedNext.push(key);
  }
  const createdAt = num(input.createdAt, 0, 0, Number.MAX_SAFE_INTEGER);
  return {
    id,
    kind,
    sourceType,
    sourceId,
    title: text(input.title, 120),
    subtitle: text(input.subtitle, 200),
    currentTrackKey: text(input.currentTrackKey, 300),
    queuedNext,
    createdAt,
    updatedAt: num(input.updatedAt, createdAt, 0, Number.MAX_SAFE_INTEGER),
    dynamic: bool(input.dynamic, false),
    songs
  };
}

/** 快照 -> 白名单对象（version / activeQueueId / lastActiveQueueId / queues） */
/**
 * 随机播放状态 -> 白名单对象。
 * 只保存能稳定恢复的字段：本轮顺序 / 游标 / 有界历史；其余运行时对象一律丢弃。
 */
function sanitizeShuffle(input) {
  const out = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return out;
  Object.keys(input).forEach((queueId) => {
    const id = sanitizeQueueId(queueId);
    if (!id) return;
    const entry = input[queueId];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return;
    const order = [];
    const rawOrder = Array.isArray(entry.order) ? entry.order : [];
    for (const item of rawOrder) {
      if (order.length >= MAX_SONGS_PER_QUEUE) break;
      const key = text(item, 300);
      if (key && !order.includes(key)) order.push(key);
    }
    const history = [];
    const rawHistory = Array.isArray(entry.history) ? entry.history : [];
    for (const item of rawHistory) {
      const key = text(item, 300);
      if (key && !history.includes(key) && history.length < 200) history.push(key);
    }
    out[id] = {
      order,
      cursor: num(entry.cursor, -1, -1, Math.max(-1, order.length - 1)),
      history
    };
  });
  return out;
}

function sanitizeSnapshot(input) {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const queues = [];
  const rawQueues = Array.isArray(source.queues) ? source.queues : [];
  for (const rawQueue of rawQueues) {
    const queue = sanitizeQueue(rawQueue);
    if (!queue) continue;
    if (queues.some((item) => item.id === queue.id)) continue;
    queues.push(queue);
  }
  return {
    version: QUEUE_STORE_VERSION,
    activeQueueId: sanitizeQueueId(source.activeQueueId),
    lastActiveQueueId: sanitizeQueueId(source.lastActiveQueueId),
    shuffle: sanitizeShuffle(source.shuffle),
    queues
  };
}

/**
 * 容量裁剪：队列 ≤ MAX_QUEUES。
 * 保护顺序：activeQueue → lastActiveQueue → 非活动队列里最旧的（createdAt/updatedAt 最小）。
 */
function trimSnapshot(snapshot) {
  const next = sanitizeSnapshot(snapshot);
  if (!next.queues.length) {
    return { version: QUEUE_STORE_VERSION, activeQueueId: '', lastActiveQueueId: '', shuffle: sanitizeShuffle(next.shuffle), queues: [] };
  }
  const activeId = next.queues.some((queue) => queue.id === next.activeQueueId)
    ? next.activeQueueId
    : next.queues[0].id;
  const lastId = next.queues.some((queue) => queue.id === next.lastActiveQueueId)
    ? next.lastActiveQueueId
    : activeId;
  next.activeQueueId = activeId;
  next.lastActiveQueueId = lastId;
  if (next.queues.length <= MAX_QUEUES) return next;

  const protectedIds = new Set([activeId, lastId]);
  const removable = next.queues
    .filter((queue) => !protectedIds.has(queue.id))
    .sort((left, right) => left.createdAt - right.createdAt || left.updatedAt - right.updatedAt);
  const keep = new Set(protectedIds);
  // 淘汰最旧的非活动队列：从最新的开始保留
  for (const queue of removable.slice().reverse()) {
    if (keep.size >= MAX_QUEUES) break;
    keep.add(queue.id);
  }
  next.queues = next.queues.filter((queue) => keep.has(queue.id));
  // 被淘汰队列的随机状态一并丢弃，避免留下孤儿
  const keptIds = new Set(next.queues.map((queue) => queue.id));
  Object.keys(next.shuffle).forEach((queueId) => {
    if (!keptIds.has(queueId)) delete next.shuffle[queueId];
  });
  return next;
}

/** 本地文件校验：存在 + 是文件 + 音频扩展名；失败只标记不可用，不删除该条目 */
async function markLocalAvailability(queues) {
  const targets = [];
  for (const queue of queues) {
    for (const song of queue.songs) {
      if (song.kind === 'local') targets.push(song);
    }
  }
  let cursor = 0;
  const workers = Array.from({ length: Math.min(32, targets.length) }, async () => {
    while (cursor < targets.length) {
      const song = targets[cursor++];
      try {
        const stat = await fsp.stat(song.path);
        song.available = stat.isFile() && AUDIO_EXTENSIONS.has(path.extname(song.path).toLowerCase());
      } catch {
        song.available = false;
      }
    }
  });
  await Promise.all(workers);
  for (const queue of queues) {
    for (const song of queue.songs) {
      if (song.kind !== 'local') song.available = true;
    }
  }
}

const EMPTY_SNAPSHOT = () => ({ version: QUEUE_STORE_VERSION, activeQueueId: '', lastActiveQueueId: '', queues: [] });

function createQueueStore(options) {
  const opt = options || {};
  const userDataDir = opt.userDataDir;
  const fileName = opt.fileName || 'queues.json';
  const file = path.join(userDataDir, fileName);
  const tempFile = `${file}.tmp`;
  /** 写入串行化：同一文件所有写操作排在同一条链上，绝不并发 */
  let writeChain = Promise.resolve();
  let writeCount = 0;

  /** 读：结构校验 + 版本校验 + 容量裁剪 + 本地路径校验。任何异常都回退为空队列。 */
  async function read() {
    let raw = null;
    try {
      raw = await fsp.readFile(file, 'utf8');
    } catch {
      raw = null;
    }
    let parsed = null;
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = null;   // 文件损坏：不抛错、不删除，交给下次写入覆盖
      }
    }
    const snapshot = trimSnapshot(parsed || EMPTY_SNAPSHOT());
    // 本地文件是否仍在磁盘上：恢复前统一校验（在线条目没有本地文件，恒为可用）
    await markLocalAvailability(snapshot.queues);
    return snapshot;
  }

  /** 原子写：先写临时文件，再整体替换目标文件 */
  async function writeAtomic(payload) {
    await fsp.mkdir(path.dirname(file), { recursive: true });
    await fsp.writeFile(tempFile, payload, 'utf8');
    try {
      await fsp.rename(tempFile, file);
    } catch {
      // 极少数平台/杀软占用目标文件时退化为「复制 + 清理」，始终保持目标文件完整
      await fsp.copyFile(tempFile, file);
      try { await fsp.unlink(tempFile); } catch { /* ignore */ }
    }
  }

  /** 写：校验 + 裁剪 + 串行 + 原子替换；返回实际落盘的白名单快照 */
  function write(input) {
    const snapshot = trimSnapshot(input);
    const payload = `${JSON.stringify(snapshot, null, 2)}\n`;
    writeChain = writeChain.then(async () => {
      await writeAtomic(payload);
      writeCount += 1;
    }).catch((error) => {
      // 写入失败不吞掉链（下一次写还能继续），但把错误交给调用方
      throw error;
    });
    return writeChain.then(() => ({ ok: true, queues: snapshot.queues.length, writes: writeCount }));
  }

  return { file, read, write, sanitizeSnapshot, trimSnapshot };
}

module.exports = {
  createQueueStore,
  sanitizeSnapshot,
  sanitizeShuffle,
  sanitizeQueue,
  sanitizeSong,
  trimSnapshot,
  QUEUE_STORE_VERSION,
  MAX_QUEUES,
  MAX_SONGS_PER_QUEUE,
  AUDIO_EXTENSIONS,
  QUEUE_KINDS,
  SOURCE_TYPES,
  ONLINE_SONG_SOURCE_TYPES,
  LOCAL_SONG_FIELDS,
  ONLINE_SONG_FIELDS,
  QUEUE_FIELDS
};
