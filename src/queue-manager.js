/*
 * RlonDSP Queue Manager
 * Copyright © 2026 RlonDSP. All rights reserved.
 *
 * 播放队列数据层：Queue 是唯一业务真相源。
 * ---------------------------------------------------------------------------
 * 职责边界：
 *   - 所有队列写入（追加 / 替换 / 清空 / 删除 / 移动 / 切换活动队列 / 记录当前曲目）只走这里；
 *   - state.tracks / state.currentIndex 只是 activeQueue 对现有播放器的**兼容投影**，
 *     由本模块单向写出，任何旧逻辑都不得再直接 push / splice / sort / 替换它们；
 *   - 播放器、audioElement、MediaElementSource、AudioWorklet、analyser、DSP 全部不碰；
 *   - Track 结构与字段一律不改，本模块只在现有 Track 对象上读写既有字段。
 *
 * 身份规则（与持久化一致）：
 *   - 本地曲目：trackKey = path
 *   - 在线曲目：trackKey = `online:<sourceId>:<onlineId>`（sourceId 只是标识，永不作为路径/命令使用）
 *   - 在线播放地址是临时地址：不写盘、不作为身份，播放时继续由现有 onlineResolve 现场解析。
 *
 * 本文件是渲染进程普通脚本（index.html 直接引入），同时导出给 Node 单测使用。
 */
(function (global) {
  'use strict';

  const DEFAULT_QUEUE_ID = 'queue:local';
  const MANUAL_QUEUE_ID = 'queue:manual';
  const HISTORY_QUEUE_PREFIX = 'queue:history:';
  const QUEUE_KINDS = ['local', 'online', 'manual', 'history'];
  /** 来源类型受控枚举：UI 不写死 Apple Music / Spotify，只按实际存在的队列显示 */
  const SOURCE_TYPES = ['local', 'manual', 'spotify', 'apple-music', 'history', 'search', 'album', 'playlist', 'artist'];
  /** history 队列最多保留几条（archive-on-delete），超出淘汰最旧的 */
  const MAX_HISTORY_QUEUES = 2;
  const MAX_QUEUES = 6;
  const MAX_SONGS_PER_QUEUE = 3000;
  /** Shuffle 历史有界（防止长会话无限增长） */
  const MAX_SHUFFLE_HISTORY = 200;
  /** 保存合并窗口：连续追加时合并成一次写盘（主进程侧仍会再串行化一次） */
  const SAVE_DEBOUNCE_MS = 400;

  /** 在线曲目的稳定身份（sourceId + onlineId）；与 normalizeOnlineTrack 生成的 id 同形 */
  function onlineTrackKey(track) {
    const sourceId = String((track && track.sourceId) || '').trim();
    const onlineId = String((track && (track.onlineId || '')) || '').trim();
    if (!sourceId || !onlineId) return '';
    return `online:${sourceId}:${onlineId}`;
  }

  /** 统一身份：本地=path，在线=sourceId+onlineId */
  function trackKey(track) {
    if (!track || typeof track !== 'object') return '';
    const online = onlineTrackKey(track);
    if (online) return online;
    return String(track.path || '');
  }

  function isOnlineTrack(track) {
    return !!onlineTrackKey(track);
  }

  function sanitizeId(value, max) {
    const id = String(value == null ? '' : value).replace(/[\u0000-\u001f\u007f]/g, '').trim();
    return id.slice(0, Number.isFinite(max) ? max : 72);
  }

  /** 队列 id：受控格式，杜绝任意字符串进入标识位 */
  function isQueueId(value) {
    return /^queue:[A-Za-z0-9:_-]{1,72}$/.test(String(value || ''));
  }

  function numberOr(value, fallback) {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function createQueue(id, options) {
    const opt = options || {};
    const stamp = numberOr(opt.now, 0) || Date.now();
    const createdAt = numberOr(opt.createdAt, stamp);
    return {
      id: isQueueId(id) ? id : DEFAULT_QUEUE_ID,
      kind: QUEUE_KINDS.includes(opt.kind) ? opt.kind : 'local',
      sourceType: typeof opt.sourceType === 'string' ? opt.sourceType : 'local',
      sourceId: sanitizeId(opt.sourceId, 72),
      title: sanitizeId(opt.title, 120),
      subtitle: sanitizeId(opt.subtitle, 200),
      songs: [],
      currentTrackKey: '',
      queuedNext: [],
      createdAt,
      updatedAt: numberOr(opt.updatedAt, createdAt),
      dynamic: !!opt.dynamic,
      /** 只读队列（历史快照）：接管时必须新建 active Queue，绝不共享可变 songs 引用 */
      readonly: !!opt.readonly
    };
  }

  function createQueueManager(options) {
    const opt = options || {};
    const state = opt.state || null;
    const storage = opt.storage || null;
    const readMetadata = typeof opt.readMetadata === 'function' ? opt.readMetadata : null;
    const onProjection = typeof opt.onProjection === 'function' ? opt.onProjection : null;
    const getPlayMode = typeof opt.getPlayMode === 'function' ? opt.getPlayMode : () => 'list';
    const random = typeof opt.random === 'function' ? opt.random : Math.random;
    const now = typeof opt.now === 'function' ? opt.now : () => Date.now();

    let queues = [];
    let activeQueueId = DEFAULT_QUEUE_ID;
    let lastActiveQueueId = DEFAULT_QUEUE_ID;
    let ready = false;
    let flushTimer = null;
    let writeChain = Promise.resolve();
    let pendingSnapshot = null;
    let saveCount = 0;
    /** 随机播放状态：queueId -> { order:[key], cursor, history:[key] }（有界，可持久化） */
    const shuffleStates = new Map();
    /** 「最近添加」侧表：queueId -> Map<key, seq>。只记录追加先后，不改 Track 字段。 */
    const addedSequences = new Map();
    let addedSequenceCounter = 1;

    /* ---------------- 内部工具 ---------------- */

    function getQueue(id) {
      const target = String(id || '');
      return queues.find((queue) => queue.id === target) || null;
    }

    function getActiveQueue() {
      return getQueue(activeQueueId) || queues[0] || null;
    }

    function indexOfKey(queue, key) {
      if (!queue || !key) return -1;
      return queue.songs.findIndex((track) => trackKey(track) === key);
    }

    function addedSequenceOf(queueId, key) {
      const map = addedSequences.get(String(queueId || ''));
      if (!map) return 0;
      return map.get(String(key || '')) || 0;
    }

    function recordAddedSequence(queue, key) {
      if (!queue || !key) return;
      const map = addedSequences.get(queue.id);
      if (!map || map.has(key)) return;
      map.set(key, addedSequenceCounter++);
    }

    /** 侧表按队列真实顺序重建：重启后「最近添加」精度为当前 Queue 的相对导入顺序 */
    function resetAddedSequence(queue) {
      if (!queue) return;
      const map = new Map();
      queue.songs.forEach((track) => {
        const key = trackKey(track);
        if (key && !map.has(key)) map.set(key, addedSequenceCounter++);
      });
      addedSequences.set(queue.id, map);
    }

    /** 兼容投影：state.tracks / state.currentIndex 由 activeQueue 单向算出 */
    function syncProjection() {
      if (!state) return;
      const queue = getActiveQueue();
      const songs = queue ? queue.songs : [];
      state.tracks = songs;
      const key = queue ? String(queue.currentTrackKey || '') : '';
      const index = key ? indexOfKey(queue, key) : -1;
      state.currentIndex = index;
      state.currentTrack = index >= 0 ? songs[index] : null;
      if (onProjection) {
        try { onProjection(queue); } catch (error) { /* 投影通知失败不影响数据层 */ }
      }
    }

    function markChanged() {
      syncProjection();
      scheduleSave();
    }

    /** 目标队列：默认活动队列；显式指定 id 时不存在就新建（kind 受控） */
    function resolveQueue(options) {
      const opts = options || {};
      const explicitId = sanitizeId(opts.queueId, 80);
      if (!explicitId || explicitId === activeQueueId) {
        const active = getActiveQueue();
        if (active) return active;
      }
      if (isQueueId(explicitId)) {
        const matched = getQueue(explicitId);
        if (matched) return matched;
        const created = createQueue(explicitId, { ...opts, now: now() });
        resetAddedSequence(created);
        queues.unshift(created);
        return created;
      }
      const active = getActiveQueue();
      if (active) return active;
      const fallback = createQueue(DEFAULT_QUEUE_ID, { kind: 'local', now: now() });
      resetAddedSequence(fallback);
      queues.push(fallback);
      return fallback;
    }

    /* ---------------- Shuffle（随机播放池） ----------------
     * order   : 本轮随机顺序（key 列表，无重复、无孤儿）
     * cursor  : 当前播放位置在本轮 order 中的下标（-1 = 尚未开始）
     * history : 已播放过的 key（有界），Shuffle 的「上一首」按它回退
     * 队列增删移时统一走 syncShuffle()：既不会重复、也不会留下已删除的 key。 */

    function shuffleOf(queueId) {
      const id = String(queueId || '');
      let entry = shuffleStates.get(id);
      if (!entry) {
        entry = { order: [], cursor: -1, history: [] };
        shuffleStates.set(id, entry);
      }
      return entry;
    }

    function buildShuffleOrder(keys, currentKey) {
      const rest = keys.filter((key) => key !== currentKey);
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.min(i, Math.max(0, Math.floor(random() * (i + 1))));
        const swap = rest[i];
        rest[i] = rest[j];
        rest[j] = swap;
      }
      return currentKey && keys.includes(currentKey) ? [currentKey, ...rest] : rest;
    }

    /** 队列变化后同步随机池：清孤儿 / 去重 / 把新歌补进本轮剩余部分 / 修正 cursor */
    function syncShuffle(queue, entry) {
      const keys = queue.songs.map(trackKey).filter(Boolean);
      const valid = new Set(keys);
      const seen = new Set();
      const nextOrder = [];
      entry.order.forEach((key) => {
        if (!valid.has(key) || seen.has(key)) return;
        seen.add(key);
        nextOrder.push(key);
      });
      const cursorKey = entry.cursor >= 0 ? nextOrder[entry.cursor] : '';
      const missing = keys.filter((key) => !seen.has(key));
      if (missing.length) {
        const insertAt = cursorKey ? nextOrder.indexOf(cursorKey) + 1 : nextOrder.length;
        nextOrder.splice(Math.max(0, insertAt), 0, ...missing);
      }
      entry.order = nextOrder;
      entry.history = entry.history.filter((key, index, list) => valid.has(key) && list.indexOf(key) === index).slice(-MAX_SHUFFLE_HISTORY);
      if (cursorKey) entry.cursor = nextOrder.indexOf(cursorKey);
      else if (entry.cursor >= nextOrder.length) entry.cursor = nextOrder.length - 1;
      return entry;
    }

    /** 队列被清空 / 删除 / 整体替换：随机状态一并清理 */
    function resetShuffle(queueId, options) {
      const id = String(queueId || '');
      if (!id) return;
      if (options && options.drop) shuffleStates.delete(id);
      else shuffleStates.set(id, { order: [], cursor: -1, history: [] });
    }

    /* ---------------- queuedNext（下一首播放 / 依次插队） ----------------
     * 只保存 key：既保证身份稳定，也不会把曲目对象复制成两份。
     * 'cut'      = 立即插队（LIFO：后插入的先播）
     * 'sequence' = 依次插队（FIFO：先插入的先播） */

    function enqueueNext(target, mode, options) {
      const queue = resolveQueue(options);
      const key = typeof target === 'string' ? String(target) : trackKey(target);
      if (!key || indexOfKey(queue, key) < 0) return false;
      const next = queue.queuedNext.filter((item) => item !== key);
      if (mode === 'sequence') next.push(key);
      else next.unshift(key);
      queue.queuedNext = next.slice(0, 200);
      queue.updatedAt = now();
      markChanged();
      return true;
    }

    function peekQueuedNext(queueId) {
      const queue = queueId ? getQueue(queueId) : getActiveQueue();
      if (!queue) return '';
      // 顺带丢掉已经不在队列里的 key，避免消费到已删除的曲目
      const next = queue.queuedNext.filter((key) => indexOfKey(queue, key) >= 0);
      if (next.length !== queue.queuedNext.length) queue.queuedNext = next;
      return next[0] || '';
    }

    /** 消费队首（返回被消费的 key；队列为空/无插队时返回 ''） */
    function takeQueuedNext(queueId) {
      const queue = queueId ? getQueue(queueId) : getActiveQueue();
      if (!queue) return '';
      const key = peekQueuedNext(queue.id);
      if (!key) return '';
      queue.queuedNext = queue.queuedNext.filter((item) => item !== key);
      queue.updatedAt = now();
      markChanged();
      return key;
    }

    function listQueuedNext(queueId) {
      const queue = queueId ? getQueue(queueId) : getActiveQueue();
      if (!queue) return [];
      return queue.queuedNext.filter((key) => indexOfKey(queue, key) >= 0);
    }

    /* ---------------- 播放决策（只决定「下一首是谁」） ----------------
     * 本函数只返回 key：播放动作仍然完全交给现有 playTrack / audioElement。 */

    function nextKey(options) {
      const opts = options || {};
      const queue = getActiveQueue();
      if (!queue || !queue.songs.length) return null;
      const currentKey = String(queue.currentTrackKey || '');
      const mode = String(getPlayMode() || 'list');

      // 1) 插队优先：只要 queuedNext 里有有效曲目就先消费它
      const queued = takeQueuedNext(queue.id);
      if (queued) return { key: queued, source: 'queued-next' };

      // 2) 单曲循环（自动切歌时原地）
      if (mode === 'single' && opts.automatic) {
        const key = currentKey || trackKey(queue.songs[0]);
        return { key, source: 'single' };
      }

      // 3) 随机：按本轮随机池顺序前进，一轮之内不重复
      if (mode === 'random') {
        const entry = syncShuffle(queue, shuffleOf(queue.id));
        if (!entry.order.length) {
          entry.order = buildShuffleOrder(queue.songs.map(trackKey).filter(Boolean), currentKey);
          entry.cursor = entry.order.length ? 0 : -1;
        }
        let guard = entry.order.length + 1;
        while (guard-- > 0) {
          const nextCursor = entry.cursor + 1;
          if (nextCursor >= entry.order.length) {
            // 一轮放完：重开一轮（把当前曲目排在最前，避免立刻重复上一首）
            const keys = queue.songs.map(trackKey).filter(Boolean);
            entry.order = buildShuffleOrder(keys, currentKey);
            entry.cursor = entry.order.length ? 0 : -1;
            if (!entry.order.length) return null;
            const first = entry.order[0];
            if (first === currentKey && entry.order.length > 1) { entry.cursor = 1; continue; }
            if (currentKey) pushShuffleHistory(entry, currentKey);
            return { key: entry.order[entry.cursor], source: 'shuffle-cycle' };
          }
          entry.cursor = nextCursor;
          const candidate = entry.order[entry.cursor];
          if (!candidate) continue;
          if (indexOfKey(queue, candidate) < 0) continue;
          if (candidate === currentKey && entry.order.length > 1) continue;
          if (currentKey) pushShuffleHistory(entry, currentKey);
          return { key: candidate, source: 'shuffle' };
        }
        return null;
      }

      // 4) 普通顺序：按真实 Queue 顺序前进，到底回头（保持既有循环播放语义）
      const index = currentKey ? indexOfKey(queue, currentKey) : -1;
      const nextIndex = index + 1 >= queue.songs.length ? 0 : index + 1;
      const track = queue.songs[nextIndex];
      return track ? { key: trackKey(track), source: 'sequential' } : null;
    }

    function pushShuffleHistory(entry, key) {
      if (!key) return;
      entry.history = entry.history.filter((item) => item !== key);
      entry.history.push(key);
      if (entry.history.length > MAX_SHUFFLE_HISTORY) entry.history = entry.history.slice(-MAX_SHUFFLE_HISTORY);
    }

    function previousKey() {
      const queue = getActiveQueue();
      if (!queue || !queue.songs.length) return null;
      const currentKey = String(queue.currentTrackKey || '');
      const mode = String(getPlayMode() || 'list');

      if (mode === 'random') {
        // 随机模式：按真实播放历史回退（跳过已被删除的曲目）
        const entry = syncShuffle(queue, shuffleOf(queue.id));
        while (entry.history.length) {
          const key = entry.history.pop();
          if (indexOfKey(queue, key) < 0) continue;
          const position = entry.order.indexOf(key);
          if (position >= 0) entry.cursor = position;
          return { key, source: 'shuffle-history' };
        }
        const fallback = queue.songs[queue.songs.length - 1];
        return fallback ? { key: trackKey(fallback), source: 'shuffle-fallback' } : null;
      }

      if (mode === 'single') {
        const key = currentKey || trackKey(queue.songs[0]);
        return { key, source: 'single' };
      }

      const index = currentKey ? indexOfKey(queue, currentKey) : -1;
      const prevIndex = index - 1 < 0 ? queue.songs.length - 1 : index - 1;
      const track = queue.songs[prevIndex];
      return track ? { key: trackKey(track), source: 'sequential' } : null;
    }

    /* ---------------- 持久化入口（串行 + 合并） ---------------- */

    function scheduleSave() {
      if (!ready || !storage || flushTimer) return;
      flushTimer = setTimeout(() => {
        flushTimer = null;
        void flush();
      }, SAVE_DEBOUNCE_MS);
    }

    /** 落盘：所有写排在同一条链上，同一时刻只有一个写操作（主进程还会再加一层原子写） */
    function flush() {
      if (!ready || !storage) return Promise.resolve(false);
      pendingSnapshot = snapshot();
      writeChain = writeChain.then(async () => {
        const payload = pendingSnapshot;
        pendingSnapshot = null;
        if (!payload) return;
        await storage.save(payload);
        saveCount += 1;
      }).catch(() => { /* 写失败不阻断后续写；磁盘文件保持上一次完整快照 */ });
      return writeChain.then(() => true);
    }

    /** 白名单快照：只保存队列上下文与歌曲身份，绝不写入 token / 本地 cover / 在线临时 URL */
    function snapshot() {
      const shuffle = {};
      shuffleStates.forEach((entry, queueId) => {
        if (!entry.order.length && !entry.history.length) return;
        shuffle[queueId] = {
          order: entry.order.slice(0, MAX_SONGS_PER_QUEUE),
          cursor: entry.cursor,
          history: entry.history.slice(-MAX_SHUFFLE_HISTORY)
        };
      });
      return {
        version: 1,
        activeQueueId,
        lastActiveQueueId,
        shuffle,
        queues: queues.map((queue) => ({
          id: queue.id,
          kind: queue.kind,
          sourceType: queue.sourceType,
          sourceId: queue.sourceId,
          title: queue.title,
          subtitle: queue.subtitle,
          currentTrackKey: queue.currentTrackKey,
          queuedNext: queue.queuedNext.slice(0, 200),
          createdAt: queue.createdAt,
          updatedAt: queue.updatedAt,
          dynamic: queue.dynamic,
          songs: queue.songs.map((track) => (isOnlineTrack(track)
            ? {
              kind: 'online',
              sourceType: sanitizeId(track.sourceType, 32),
              sourceId: sanitizeId(track.sourceId, 72),
              onlineId: sanitizeId(track.onlineId, 200),
              title: sanitizeId(track.title, 300),
              artist: sanitizeId(track.artist, 300),
              album: sanitizeId(track.album, 300),
              duration: numberOr(track.duration, 0),
              coverUrl: /^https?:\/\//i.test(String(track.cover || '')) ? String(track.cover).slice(0, 2000) : ''
            }
            : {
              kind: 'local',
              path: sanitizeId(track.path, 4096),
              title: sanitizeId(track.title, 300),
              artist: sanitizeId(track.artist, 300),
              album: sanitizeId(track.album, 300),
              duration: numberOr(track.duration, 0),
              sampleRate: numberOr(track.sampleRate, 0),
              bitrate: numberOr(track.bitrate, 0),
              channels: numberOr(track.channels, 0),
              bitdepth: numberOr(track.bitdepth, 0),
              codec: sanitizeId(track.codec, 40)
            }))
        }))
      };
    }

    /* ---------------- 恢复 ---------------- */

    /** 把磁盘快照还原成运行态队列：字段白名单在这里再过一遍，不做全量 spread */
    function restoreQueue(rawQueue) {
      if (!rawQueue || typeof rawQueue !== 'object') return null;
      const id = isQueueId(rawQueue.id) ? rawQueue.id : '';
      if (!id) return null;
      const queue = createQueue(id, {
        kind: rawQueue.kind,
        sourceType: rawQueue.sourceType,
        sourceId: rawQueue.sourceId,
        title: rawQueue.title,
        subtitle: rawQueue.subtitle,
        dynamic: rawQueue.dynamic,
        createdAt: numberOr(rawQueue.createdAt, now()),
        updatedAt: numberOr(rawQueue.updatedAt, now())
      });
      queue.readonly = rawQueue.kind === 'history';
      const rawSongs = Array.isArray(rawQueue.songs) ? rawQueue.songs : [];
      for (const rawSong of rawSongs) {
        if (queue.songs.length >= MAX_SONGS_PER_QUEUE) break;
        const track = restoreSong(rawSong);
        if (track) queue.songs.push(track);
      }
      queue.currentTrackKey = String(rawQueue.currentTrackKey || '');
      if (queue.currentTrackKey && indexOfKey(queue, queue.currentTrackKey) < 0) queue.currentTrackKey = '';
      queue.queuedNext = Array.isArray(rawQueue.queuedNext)
        ? rawQueue.queuedNext.map((item) => String(item || '')).filter((item) => item && item.length <= 300).slice(0, 200)
        : [];
      return queue;
    }

    /** 单曲恢复：只接受白名单字段，逐个字段取值，不用 Object.assign / 展开 */
    function restoreSong(rawSong) {
      if (!rawSong || typeof rawSong !== 'object') return null;
      if (rawSong.kind === 'online') {
        const sourceId = sanitizeId(rawSong.sourceId, 72);
        const onlineId = sanitizeId(rawSong.onlineId, 200);
        if (!sourceId || !onlineId) return null;
        const cover = /^https?:\/\//i.test(String(rawSong.coverUrl || '')) ? String(rawSong.coverUrl).slice(0, 2000) : '';
        return {
          id: `online:${sourceId}:${onlineId}`,
          onlineId,
          sourceId,
          sourceType: sanitizeId(rawSong.sourceType, 32) || 'declarative',
          resourceType: 'song',
          title: sanitizeId(rawSong.title, 300) || onlineId,
          artist: sanitizeId(rawSong.artist, 300),
          album: sanitizeId(rawSong.album, 300),
          duration: numberOr(rawSong.duration, 0),
          cover,
          path: `online:${sourceId}:${onlineId}`,
          /** 播放地址不落盘、不恢复：播放时由现有 onlineResolve 现场解析 */
          url: ''
        };
      }
      const filePath = sanitizeId(rawSong.path, 4096);
      if (!filePath) return null;
      return {
        path: filePath,
        title: sanitizeId(rawSong.title, 300) || filePath.split(/[\\/]/).pop() || filePath,
        artist: sanitizeId(rawSong.artist, 300),
        album: sanitizeId(rawSong.album, 300),
        duration: numberOr(rawSong.duration, 0),
        cover: '',
        sampleRate: numberOr(rawSong.sampleRate, 0),
        bitrate: numberOr(rawSong.bitrate, 0),
        channels: numberOr(rawSong.channels, 0),
        bitdepth: numberOr(rawSong.bitdepth, 0),
        codec: sanitizeId(rawSong.codec, 40)
      };
    }

    /**
     * 本地曲目展示字段补全：只补可重新读取的字段，逐个 try/catch。
     * 单个文件读失败 / 文件已删除，都不会破坏整个队列（条目保留，标记 available=false）。
     */
    async function hydrateQueue(queueId) {
      if (!readMetadata) return 0;
      const queue = getQueue(queueId || activeQueueId);
      if (!queue) return 0;
      const targets = queue.songs.filter((track) => !isOnlineTrack(track) && track.path && (
        !track.duration || !track.title
        || (!track.sampleRate && !track.bitrate && !track.channels && !track.bitdepth && !track.codec)
      ));
      if (!targets.length) return 0;
      let cursor = 0;
      let changed = 0;
      const workers = Array.from({ length: Math.min(4, targets.length) }, async () => {
        while (cursor < targets.length) {
          const track = targets[cursor++];
          try {
            const meta = await readMetadata(track.path);
            if (!meta || typeof meta !== 'object') continue;
            const needsBasicFields = !track.duration || !track.title;
            if (needsBasicFields) {
              if (meta.title) track.title = String(meta.title).slice(0, 300);
              if (meta.artist) track.artist = String(meta.artist).slice(0, 300);
              if (meta.album) track.album = String(meta.album).slice(0, 300);
              if (Number.isFinite(meta.duration) && meta.duration > 0) track.duration = meta.duration;
              if (typeof meta.cover === 'string' && meta.cover) track.cover = meta.cover;
            }
            if (Number.isFinite(meta.sampleRate)) track.sampleRate = meta.sampleRate;
            if (Number.isFinite(meta.bitrate)) track.bitrate = meta.bitrate;
            if (Number.isFinite(meta.channels)) track.channels = meta.channels;
            if (Number.isFinite(meta.bitdepth)) track.bitdepth = meta.bitdepth;
            if (meta.codec) track.codec = String(meta.codec).slice(0, 40);
            changed += 1;
          } catch (error) {
            // 该文件不可读：保留队列条目，不抛出
          }
        }
      });
      await Promise.all(workers);
      if (changed) {
        queue.updatedAt = now();
        syncProjection();
        // 只补了展示字段：不回写磁盘（磁盘里本来就是身份 + 元数据，避免无意义写放大）
      }
      return changed;
    }

    /** 启动恢复：读磁盘 → 白名单还原 → 裁剪 → 生成兼容投影 → 补全本地展示字段 */
    async function init() {
      let raw = null;
      if (storage) {
        try { raw = await storage.load(); } catch (error) { raw = null; }
      }
      const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
      const rawQueues = Array.isArray(source.queues) ? source.queues : [];
      queues = rawQueues.map(restoreQueue).filter(Boolean).slice(0, MAX_QUEUES);
      if (!queues.length) queues = [createQueue(DEFAULT_QUEUE_ID, { kind: 'local', now: now() })];
      addedSequences.clear();
      addedSequenceCounter = 1;
      queues.forEach(resetAddedSequence);
      activeQueueId = queues.some((queue) => queue.id === source.activeQueueId) ? source.activeQueueId : queues[0].id;
      lastActiveQueueId = queues.some((queue) => queue.id === source.lastActiveQueueId) ? source.lastActiveQueueId : activeQueueId;
      // 随机池恢复：只接受白名单字段，键必须是本队列真实存在的曲目
      shuffleStates.clear();
      const rawShuffle = source.shuffle && typeof source.shuffle === 'object' && !Array.isArray(source.shuffle) ? source.shuffle : {};
      Object.keys(rawShuffle).forEach((queueId) => {
        const queue = getQueue(queueId);
        const entry = rawShuffle[queueId];
        if (!queue || !entry || typeof entry !== 'object') return;
        const valid = new Set(queue.songs.map(trackKey));
        const order = (Array.isArray(entry.order) ? entry.order : [])
          .map((key) => String(key || ''))
          .filter((key, index, list) => valid.has(key) && list.indexOf(key) === index);
        const history = (Array.isArray(entry.history) ? entry.history : [])
          .map((key) => String(key || ''))
          .filter((key, index, list) => valid.has(key) && list.indexOf(key) === index)
          .slice(-MAX_SHUFFLE_HISTORY);
        const cursor = Math.max(-1, Math.min(order.length - 1, numberOr(entry.cursor, -1)));
        shuffleStates.set(queue.id, { order, cursor, history });
      });
      ready = true;
      syncProjection();
      await hydrateQueue(activeQueueId);
      return {
        queueCount: queues.length,
        activeQueueId,
        trackCount: getActiveQueue() ? getActiveQueue().songs.length : 0,
        currentTrackKey: getActiveQueue() ? getActiveQueue().currentTrackKey : ''
      };
    }

    /* ---------------- 对外业务写入口 ---------------- */

    /** 追加（去重：本地按 path，在线按 sourceId+onlineId）；返回真实新增数量 */
    function appendTracks(tracks, options) {
      const list = Array.isArray(tracks) ? tracks.filter(Boolean) : [];
      if (!list.length) return 0;
      const queue = resolveQueue(options);
      const opts = options || {};
      let added = 0;
      list.forEach((track) => {
        const key = trackKey(track);
        if (!key || indexOfKey(queue, key) >= 0) return;
        if (queue.songs.length >= MAX_SONGS_PER_QUEUE) return;
        queue.songs.push(track);
        recordAddedSequence(queue, key);
        added += 1;
      });
      if (added) {
        if (opts.kind && QUEUE_KINDS.includes(opts.kind)) queue.kind = opts.kind;
        if (opts.sourceId) queue.sourceId = sanitizeId(opts.sourceId, 72);
        if (opts.sourceType) queue.sourceType = sanitizeId(opts.sourceType, 32);
        if (opts.title && !queue.title) queue.title = sanitizeId(opts.title, 120);
        queue.dynamic = !!opts.dynamic;
        queue.updatedAt = now();
        // 新歌补进本轮随机池的剩余部分，保证本轮不会漏播
        syncShuffle(queue, shuffleOf(queue.id));
        markChanged();
      }
      return added;
    }

    /** 追加单曲（在线加入用）：返回该曲目在活动队列中的索引；已存在则返回现有索引 */
    function appendTrack(track, options) {
      const key = trackKey(track);
      if (!key) return -1;
      const queue = resolveQueue(options);
      const existing = indexOfKey(queue, key);
      if (existing >= 0) return existing;
      const added = appendTracks([track], options);
      if (!added) return -1;
      return indexOfKey(queue, key);
    }

    /** 替换整个队列内容（保留队列身份与 currentTrackKey 合法性） */
    function replaceTracks(tracks, options) {
      const queue = resolveQueue(options);
      const list = Array.isArray(tracks) ? tracks.filter(Boolean).slice(0, MAX_SONGS_PER_QUEUE) : [];
      queue.songs = list;
      resetAddedSequence(queue);
      if (queue.currentTrackKey && indexOfKey(queue, queue.currentTrackKey) < 0) queue.currentTrackKey = '';
      const validKeys = new Set(list.map(trackKey));
      queue.queuedNext = queue.queuedNext.filter((key) => validKeys.has(key));
      queue.updatedAt = now();
      syncShuffle(queue, shuffleOf(queue.id));
      markChanged();
      return queue.songs.length;
    }

    /** 移除单曲（本地按 path / 在线按 sourceId+onlineId） */
    function removeTrack(key, options) {
      const queue = resolveQueue(options);
      const target = String(key || '');
      if (!target) return false;
      const index = indexOfKey(queue, target);
      if (index < 0) return false;
      queue.songs.splice(index, 1);
      const map = addedSequences.get(queue.id);
      if (map) map.delete(target);
      queue.queuedNext = queue.queuedNext.filter((item) => item !== target);
      if (queue.currentTrackKey === target) queue.currentTrackKey = '';
      queue.updatedAt = now();
      const entry = shuffleOf(queue.id);
      entry.order = entry.order.filter((key) => key !== target);
      entry.history = entry.history.filter((key) => key !== target);
      syncShuffle(queue, entry);
      markChanged();
      return true;
    }

    /**
     * 拖拽重排：按 key 定位后搬运，真实修改 Queue 顺序并持久化。
     * currentTrackKey 是稳定身份，重排不会让它丢失。
     */
    function moveTrack(key, toIndex, options) {
      const queue = resolveQueue(options);
      const target = String(key || '');
      const from = indexOfKey(queue, target);
      if (from < 0) return false;
      const destination = Math.max(0, Math.min(queue.songs.length - 1, numberOr(toIndex, from)));
      if (from === destination) return false;
      const [moved] = queue.songs.splice(from, 1);
      queue.songs.splice(destination, 0, moved);
      queue.updatedAt = now();
      // 随机池跟着新顺序走：把该 key 移到「新的前一首」之后，避免孤儿/重复
      const entry = syncShuffle(queue, shuffleOf(queue.id));
      const orderIndex = entry.order.indexOf(target);
      if (orderIndex >= 0) entry.order.splice(orderIndex, 1);
      if (destination === 0) entry.order.unshift(target);
      else {
        const anchor = trackKey(queue.songs[destination - 1]);
        const anchorIndex = entry.order.indexOf(anchor);
        if (anchorIndex >= 0) entry.order.splice(anchorIndex + 1, 0, target);
        else entry.order.push(target);
      }
      if (queue.currentTrackKey) entry.cursor = entry.order.indexOf(queue.currentTrackKey);
      markChanged();
      return true;
    }

    /** 清空队列（内存 + 持久化一起清） */
    function clearActiveQueue() {
      const queue = getActiveQueue();
      if (!queue) return false;
      queue.songs = [];
      resetAddedSequence(queue);
      queue.currentTrackKey = '';
      queue.queuedNext = [];
      queue.updatedAt = now();
      resetShuffle(queue.id);
      markChanged();
      void flush();
      return true;
    }

    /** 清空指定队列（历史/非活动队列也走同一条路径） */
    function clearQueue(queueId) {
      const queue = getQueue(queueId);
      if (!queue) return false;
      queue.songs = [];
      resetAddedSequence(queue);
      queue.currentTrackKey = '';
      queue.queuedNext = [];
      queue.updatedAt = now();
      resetShuffle(queue.id);
      markChanged();
      return true;
    }

    /* ---------------- Queue 管理（create / ensure / activate / remove） ---------------- */

    /** 创建或取回一个队列；sourceType/sourceId 只作标识，UI 按实际存在的队列显示 */
    function ensureQueue(id, meta) {
      const options2 = meta || {};
      const target = sanitizeId(id, 80);
      const existing = isQueueId(target) ? getQueue(target) : null;
      if (existing) {
        if (options2.title) existing.title = sanitizeId(options2.title, 120);
        if (options2.subtitle != null) existing.subtitle = sanitizeId(options2.subtitle, 200);
        if (options2.sourceType) existing.sourceType = sanitizeId(options2.sourceType, 32);
        return existing;
      }
      const created = createQueue(isQueueId(target) ? target : DEFAULT_QUEUE_ID, {
        kind: options2.kind,
        sourceType: options2.sourceType,
        sourceId: options2.sourceId,
        title: options2.title,
        subtitle: options2.subtitle,
        dynamic: options2.dynamic,
        now: now()
      });
      resetAddedSequence(created);
      queues.unshift(created);
      markChanged();
      return created;
    }

    function makeHistoryId() {
      const stamp = new Date(now()).toISOString().replace(/[^0-9]/g, '').slice(0, 14);
      let id = `${HISTORY_QUEUE_PREFIX}${stamp}`;
      let suffix = 1;
      while (getQueue(id)) {
        id = `${HISTORY_QUEUE_PREFIX}${stamp}-${suffix++}`;
      }
      return id;
    }

    function trimHistoryQueues() {
      const historyQueues = queues.filter((queue) => queue.kind === 'history');
      if (historyQueues.length <= MAX_HISTORY_QUEUES) return;
      const removable = historyQueues
        .slice()
        .sort((a, b) => a.createdAt - b.createdAt || a.updatedAt - b.updatedAt)
        .slice(0, historyQueues.length - MAX_HISTORY_QUEUES)
        .map((queue) => queue.id);
      queues = queues.filter((queue) => !removable.includes(queue.id));
      removable.forEach((id) => resetShuffle(id, { drop: true }));
    }

    /**
     * 删除队列：手动队列受保护，活动队列与本地队列不允许删除（清空请用 clearQueue）。
     * 删除前把它快照成只读历史队列（有界），这样「最近队列」是真实数据而不是假条目。
     */
    function removeQueue(id, options) {
      const queue = getQueue(id);
      if (!queue) return false;
      if (queue.id === MANUAL_QUEUE_ID) return false;
      if (queue.id === activeQueueId) return false;
      if (queue.id === DEFAULT_QUEUE_ID) return false;
      if (options && options.archive && queue.songs.length) {
        const snapshotQueue = createQueue(makeHistoryId(), {
          kind: 'history',
          sourceType: 'history',
          sourceId: queue.sourceId,
          title: queue.title,
          subtitle: queue.subtitle,
          readonly: true,
          now: now()
        });
        snapshotQueue.songs = queue.songs.map((track) => ({ ...track }));
        snapshotQueue.currentTrackKey = queue.currentTrackKey;
        queues.unshift(snapshotQueue);
      }
      queues = queues.filter((item) => item.id !== queue.id);
      addedSequences.delete(queue.id);
      if (lastActiveQueueId === queue.id) {
        lastActiveQueueId = getActiveQueue() ? getActiveQueue().id : DEFAULT_QUEUE_ID;
      }
      resetShuffle(queue.id, { drop: true });
      trimHistoryQueues();
      markChanged();
      return true;
    }

    /** 记录当前曲目：currentTrackKey 是唯一身份，currentIndex 只由它反查 */
    function setCurrentTrackKey(key, queueId) {
      const queue = queueId ? getQueue(queueId) : getActiveQueue();
      if (!queue) return false;
      const target = String(key || '');
      const valid = target && indexOfKey(queue, target) >= 0;
      queue.currentTrackKey = valid ? target : '';
      queue.updatedAt = now();
      markChanged();
      return valid;
    }

    /** 由运行时索引换出稳定身份（仅投影层允许按索引操作） */
    function keyAtIndex(index) {
      const queue = getActiveQueue();
      if (!queue) return '';
      const track = queue.songs[Number(index)];
      return track ? trackKey(track) : '';
    }

    function indexOfTrackKey(key) {
      return indexOfKey(getActiveQueue(), String(key || ''));
    }

    /** 切换活动队列：只切指针 + 重新生成投影；只读队列不允许成为活动队列 */
    function setActiveQueue(id) {
      const queue = getQueue(id);
      if (!queue || queue.readonly) return false;
      if (queue.id === activeQueueId) return true;
      lastActiveQueueId = activeQueueId;
      activeQueueId = queue.id;
      queue.updatedAt = now();
      // 切进来的队列：随机池 cursor 对齐它自己的 currentTrackKey
      if (queue.currentTrackKey) {
        const entry = syncShuffle(queue, shuffleOf(queue.id));
        const position = entry.order.indexOf(queue.currentTrackKey);
        if (position >= 0) entry.cursor = position;
      }
      markChanged();
      return true;
    }

    /**
     * 接管只读队列（历史队列）：新建 active Queue 并深拷贝曲目，
     * 绝不共享可变 songs 引用，原历史队列保持只读不变。
     */
    function takeOverQueue(id, options) {
      const source = getQueue(id);
      if (!source) return null;
      const targetId = isQueueId((options && options.queueId) || '') ? options.queueId : MANUAL_QUEUE_ID;
      let target = getQueue(targetId);
      if (!target || target.readonly) {
        target = createQueue(targetId, {
          kind: (options && options.kind) || 'manual',
          sourceType: source.sourceType,
          sourceId: source.sourceId,
          title: source.title,
          subtitle: source.subtitle,
          now: now()
        });
        queues.unshift(target);
      }
      target.songs = source.songs.map((track) => ({ ...track }));
      resetAddedSequence(target);
      target.currentTrackKey = sourcesKeyInCopy(source.currentTrackKey, target.songs);
      target.queuedNext = source.queuedNext.slice();
      target.updatedAt = now();
      lastActiveQueueId = activeQueueId;
      activeQueueId = target.id;
      markChanged();
      return target;
    }

    function sourcesKeyInCopy(key, songs) {
      const target = String(key || '');
      if (!target) return '';
      return songs.some((track) => trackKey(track) === target) ? target : '';
    }

    /** 顶部剩余量：当前曲目之后还有几首（没有当前曲目时等于总数） */
    function remainingCount(queueId) {
      const queue = queueId ? getQueue(queueId) : getActiveQueue();
      if (!queue) return 0;
      const key = String(queue.currentTrackKey || '');
      const index = key ? indexOfKey(queue, key) : -1;
      if (index < 0) return queue.songs.length;
      return Math.max(0, queue.songs.length - index - 1);
    }

    function getShuffleInfo(queueId) {
      const queue = queueId ? getQueue(queueId) : getActiveQueue();
      if (!queue) return { order: [], cursor: -1, history: [] };
      const entry = syncShuffle(queue, shuffleOf(queue.id));
      return { order: entry.order.slice(), cursor: entry.cursor, history: entry.history.slice() };
    }

    function listQueues() {
      return queues.map((queue) => ({
        id: queue.id,
        kind: queue.kind,
        sourceType: queue.sourceType,
        sourceId: queue.sourceId,
        title: queue.title,
        subtitle: queue.subtitle,
        count: queue.songs.length,
        remaining: remainingCount(queue.id),
        readonly: !!queue.readonly,
        active: queue.id === activeQueueId,
        currentTrackKey: queue.currentTrackKey,
        updatedAt: queue.updatedAt
      }));
    }

    function getState() {
      const queue = getActiveQueue();
      return {
        activeQueueId,
        lastActiveQueueId,
        queues: queues.length,
        tracks: queue ? queue.songs.length : 0,
        currentTrackKey: queue ? queue.currentTrackKey : '',
        saves: saveCount
      };
    }

    return {
      init,
      hydrateQueue,
      appendTracks,
      appendTrack,
      replaceTracks,
      removeTrack,
      moveTrack,
      clearActiveQueue,
      clearQueue,
      ensureQueue,
      removeQueue,
      setCurrentTrackKey,
      keyAtIndex,
      indexOfTrackKey,
      setActiveQueue,
      takeOverQueue,
      enqueueNext,
      peekQueuedNext,
      takeQueuedNext,
      listQueuedNext,
      nextKey,
      previousKey,
      getShuffleInfo,
      remainingCount,
      listQueues,
      getActiveQueue,
      getQueue,
      getActiveQueueId: () => activeQueueId,
      getLastActiveQueueId: () => lastActiveQueueId,
      getState,
      snapshot,
      syncProjection,
      flush,
      isOnlineTrack,
      trackKey,
      addedSequence: addedSequenceOf
    };
  }

  const api = {
    createQueueManager,
    trackKey,
    onlineTrackKey,
    isOnlineTrack,
    isQueueId,
    DEFAULT_QUEUE_ID,
    MANUAL_QUEUE_ID,
    HISTORY_QUEUE_PREFIX,
    QUEUE_KINDS,
    SOURCE_TYPES,
    MAX_QUEUES,
    MAX_SONGS_PER_QUEUE,
    MAX_SHUFFLE_HISTORY
  };

  global.RlonQueueManager = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
