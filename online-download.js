/*
 * RlonDSP Online Download
 * Copyright © 2026 RlonDSP. All rights reserved.
 *
 * 在线歌曲下载（主进程侧）。只做四件事：
 *   1. 解析真实地址：播放地址一律由 Online Source Layer 现场解析，不信任渲染层传来的字符串；
 *   2. 真实流式下载：边下边写临时文件，先 .part 再原子改名，进度是真实字节数；
 *   3. 真实失败：网络中断 / HTTP 非 2xx / 反盗链返回网页 / 磁盘不可写 / 体积超限 都如实报错并清理残片；
 *   4. 可取消：取消后立刻中断请求并删除临时文件，不留下半截文件冒充成功。
 *
 * 边界：
 *   - 只下载上游公开给出的地址，不绕过 DRM / 付费 / 登录 / 访问控制；
 *   - 不覆盖同名文件（自动加 (1)(2)…），不写渲染层给的路径，落盘目录由主进程决定；
 *   - 渲染进程只能拿到「任务 id + 进度 + 结果」，拿不到流、拿不到任意文件系统句柄。
 */
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const { Readable, Transform, pipeline } = require('node:stream');
const { promisify } = require('node:util');

const pump = promisify(pipeline);

/** 与 main.js / queue-store.js 的音频扩展名保持一致 */
const AUDIO_EXTENSIONS = new Set(['.mp3', '.flac', '.wav', '.ogg', '.m4a', '.aac', '.opus', '.wma', '.aiff', '.ape']);

/** 内容类型 → 扩展名（只在 URL 后缀给不出音频格式时用，避免猜错格式） */
const CONTENT_TYPE_EXT = new Map([
  ['audio/mpeg', '.mp3'],
  ['audio/mp3', '.mp3'],
  ['audio/mp4', '.m4a'],
  ['audio/x-m4a', '.m4a'],
  ['audio/aac', '.aac'],
  ['audio/aacp', '.aac'],
  ['audio/ogg', '.ogg'],
  ['audio/vorbis', '.ogg'],
  ['audio/opus', '.opus'],
  ['audio/flac', '.flac'],
  ['audio/x-flac', '.flac'],
  ['audio/wav', '.wav'],
  ['audio/x-wav', '.wav'],
  ['audio/aiff', '.aiff']
]);

const ERROR_CODES = {
  URL: 'DOWNLOAD_URL_INVALID',
  NETWORK: 'DOWNLOAD_NETWORK_ERROR',
  HTTP: 'DOWNLOAD_HTTP_ERROR',
  TYPE: 'DOWNLOAD_CONTENT_TYPE_INVALID',
  SIZE: 'DOWNLOAD_CONTENT_TOO_LARGE',
  DIR: 'DOWNLOAD_DIR_UNAVAILABLE',
  WRITE: 'DOWNLOAD_WRITE_ERROR',
  INCOMPLETE: 'DOWNLOAD_INCOMPLETE',
  CANCELLED: 'DOWNLOAD_CANCELLED'
};

class DownloadError extends Error {
  constructor(code, safeMessage) {
    super(`${code}: ${safeMessage || 'download failed'}`);
    this.name = 'DownloadError';
    this.code = code;
    this.safeMessage = safeMessage || 'download failed';
  }
}

/** 文件名里的非法字符与保留字符统一替换掉；空名字 / 全是点的名字一律拒绝 */
function sanitizeFileName(value, fallback) {
  const cleaned = String(value == null ? '' : value)
    // Windows 保留字符 + 控制字符
    .replace(/[\\/:*?"<>|\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s.]+|[\s.]+$/g, '')
    .slice(0, 120)
    .replace(/[\s.]+$/g, '');
  if (!cleaned) return fallback;
  // Windows 保留设备名（CON / PRN / AUX / NUL / COM1 …）加前缀避开
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(cleaned)) return `_${cleaned}`;
  return cleaned;
}

function extensionFromUrl(value) {
  let pathname = '';
  try {
    pathname = new URL(String(value || '')).pathname;
  } catch {
    return '';
  }
  const ext = path.extname(pathname).toLowerCase();
  return AUDIO_EXTENSIONS.has(ext) ? ext : '';
}

function extensionFromContentType(value) {
  const raw = String(value || '').split(';')[0].trim().toLowerCase();
  return CONTENT_TYPE_EXT.get(raw) || '';
}

function isAudioContentType(value) {
  const raw = String(value || '').split(';')[0].trim().toLowerCase();
  return raw.startsWith('audio/') || raw === 'application/octet-stream' || raw === '';
}

function createOnlineDownloader(options) {
  const fetchImpl = options.fetchImpl;
  const resolveUrl = options.resolveUrl;
  const downloadsDir = options.downloadsDir;
  const onProgress = typeof options.onProgress === 'function' ? options.onProgress : () => {};
  const maxBytes = Number(options.maxBytes) > 0 ? Number(options.maxBytes) : 512 * 1024 * 1024;
  const now = () => Date.now();
  const tasks = new Map();

  function makeTaskId() {
    return `dl_${now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /** 同名不覆盖：`歌名.mp3` → `歌名 (1).mp3` → `歌名 (2).mp3` … */
  async function uniqueTarget(baseName, ext) {
    for (let index = 0; index < 200; index += 1) {
      const suffix = index === 0 ? '' : ` (${index})`;
      const candidate = path.join(downloadsDir, `${baseName}${suffix}${ext}`);
      try {
        await fsp.access(candidate, fs.constants.F_OK);
      } catch {
        return candidate;
      }
    }
    throw new DownloadError(ERROR_CODES.WRITE, 'too many same-name files');
  }

  function emit(task, patch) {
    Object.assign(task.state, patch);
    onProgress({ ...task.state });
  }

  async function cleanup(partPath) {
    if (!partPath) return;
    try {
      await fsp.rm(partPath, { force: true });
    } catch { /* 清理失败不改变主流程结论 */ }
  }

  /**
   * 开始一次下载。
   * request: { sourceId, id, type, title, artist, provider, query, playUrl }
   * 返回：{ id, filePath, bytes, contentType, extension }
   */
  async function start(request) {
    const payload = request && typeof request === 'object' ? request : {};
    const taskId = makeTaskId();
    const controller = new AbortController();
    const task = {
      controller,
      state: {
        id: taskId,
        sourceId: String(payload.sourceId || ''),
        resourceId: String(payload.id || ''),
        title: String(payload.title || ''),
        artist: String(payload.artist || ''),
        status: 'resolving',
        received: 0,
        total: 0,
        percent: 0
      }
    };
    tasks.set(taskId, task);
    emit(task, {});

    let partPath = '';
    try {
      // 目录先确认可用：权限 / 路径问题在真正写盘前就报出来
      try {
        await fsp.mkdir(downloadsDir, { recursive: true });
      } catch {
        throw new DownloadError(ERROR_CODES.DIR, 'download folder unavailable');
      }

      let url;
      try {
        url = await resolveUrl(payload);
      } catch (error) {
        // 地址解析失败要如实区分：取消是取消，解析不出地址是「没有可用地址」，
        // 并把上游给的真实原因（例如 kuwo track not found upstream）带上，方便定位。
        if (controller.signal.aborted) throw new DownloadError(ERROR_CODES.CANCELLED, 'cancelled');
        const reason = String((error && (error.safeMessage || error.message)) || 'play url unavailable');
        throw new DownloadError(ERROR_CODES.URL, reason.slice(0, 160));
      }
      if (!/^https?:\/\//i.test(String(url || ''))) throw new DownloadError(ERROR_CODES.URL, 'play url invalid');

      emit(task, { status: 'downloading' });
      let response;
      try {
        response = await fetchImpl(url, { method: 'GET', redirect: 'follow', signal: controller.signal });
      } catch (error) {
        if (controller.signal.aborted) throw new DownloadError(ERROR_CODES.CANCELLED, 'cancelled');
        throw new DownloadError(ERROR_CODES.NETWORK, 'network request failed');
      }
      if (!response.ok) throw new DownloadError(ERROR_CODES.HTTP, `HTTP ${response.status}`);

      const contentType = String(response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
      if (!isAudioContentType(contentType)) {
        // 上游常见的反盗链：返回 text/html 的提示页，必须当成失败而不是存成音频
        throw new DownloadError(ERROR_CODES.TYPE, `unexpected content type ${contentType || 'unknown'}`);
      }
      const total = Number(response.headers.get('content-length')) || 0;
      if (total > maxBytes) throw new DownloadError(ERROR_CODES.SIZE, 'file too large');
      const extension = extensionFromUrl(url) || extensionFromContentType(contentType);
      if (!extension) throw new DownloadError(ERROR_CODES.TYPE, 'unknown audio format');

      const baseName = sanitizeFileName(
        [payload.artist, payload.title].filter(Boolean).join(' - '),
        sanitizeFileName(payload.title || payload.id || 'online-track', 'online-track')
      );
      const target = await uniqueTarget(baseName, extension);
      partPath = `${target}.part`;
      emit(task, { total, percent: 0, fileName: path.basename(target) });

      let received = 0;
      let lastEmit = 0;
      const counter = new Transform({
        transform(chunk, _encoding, callback) {
          received += chunk.length;
          if (received > maxBytes) {
            callback(new DownloadError(ERROR_CODES.SIZE, 'file too large'));
            return;
          }
          const stamp = now();
          // 进度事件节流：约 10 次/秒，避免 IPC 被小分片打满
          if (stamp - lastEmit >= 100 || (total && received >= total)) {
            lastEmit = stamp;
            emit(task, { received, percent: total ? Math.min(100, Math.round((received / total) * 100)) : 0 });
          }
          callback(null, chunk);
        }
      });

      let nodeStream;
      try {
        nodeStream = Readable.fromWeb(response.body);
      } catch {
        throw new DownloadError(ERROR_CODES.NETWORK, 'response body unavailable');
      }
      // 上一次异常退出可能留下同名残片：先清掉再用 'wx' 独占创建，避免把旧内容接在新内容后面
      await cleanup(partPath);
      try {
        await pump(nodeStream, counter, fs.createWriteStream(partPath, { flags: 'wx' }));
      } catch (error) {
        if (controller.signal.aborted || (error && error.code === ERROR_CODES.CANCELLED)) {
          throw new DownloadError(ERROR_CODES.CANCELLED, 'cancelled');
        }
        if (error instanceof DownloadError) throw error;
        if (error && (error.code === 'EACCES' || error.code === 'EPERM' || error.code === 'EROFS')) {
          throw new DownloadError(ERROR_CODES.WRITE, 'cannot write download file');
        }
        if (error && error.code === 'ENOSPC') throw new DownloadError(ERROR_CODES.WRITE, 'disk full');
        throw new DownloadError(ERROR_CODES.NETWORK, 'download interrupted');
      }
      if (received <= 0) throw new DownloadError(ERROR_CODES.INCOMPLETE, 'empty response');
      if (total && received !== total) throw new DownloadError(ERROR_CODES.INCOMPLETE, 'incomplete download');
      if (controller.signal.aborted) throw new DownloadError(ERROR_CODES.CANCELLED, 'cancelled');

      try {
        await fsp.rename(partPath, target);
      } catch {
        throw new DownloadError(ERROR_CODES.WRITE, 'cannot finalize download file');
      }
      partPath = '';
      emit(task, { status: 'done', received, total: total || received, percent: 100, filePath: target });
      return { id: taskId, filePath: target, bytes: received, contentType, extension };
    } catch (error) {
      await cleanup(partPath);
      const failure = error instanceof DownloadError
        ? error
        : new DownloadError(ERROR_CODES.NETWORK, 'download failed');
      // 报错前把真实结果写回渲染层：取消 / 失败都要有明确终态
      emit(task, {
        status: failure.code === ERROR_CODES.CANCELLED ? 'cancelled' : 'error',
        error: failure.code,
        errorMessage: failure.safeMessage
      });
      throw failure;
    } finally {
      tasks.delete(taskId);
    }
  }

  /** 取消：中断请求 → 由 start 的失败路径清理 .part 并上报 cancelled */
  function cancel(id) {
    const task = tasks.get(String(id || ''));
    if (!task) return false;
    task.controller.abort();
    return true;
  }

  function cancelAll() {
    for (const task of tasks.values()) task.controller.abort();
  }

  return {
    start,
    cancel,
    cancelAll,
    isActive: (id) => tasks.has(String(id || '')),
    activeCount: () => tasks.size,
    downloadsDir
  };
}

module.exports = {
  createOnlineDownloader,
  DownloadError,
  DOWNLOAD_ERROR_CODES: ERROR_CODES,
  sanitizeFileName
};
