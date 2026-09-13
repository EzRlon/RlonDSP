/*
 * RlonDSP
 * Copyright © 2026 RlonDSP. All rights reserved.
 *
 * 版本更新：纯逻辑部分（版本号解析与比较、Release 解析、更新包挑选、校验和解析）。
 * 这里不依赖 Electron，也不做任何网络/文件操作，方便单独写单元测试；
 * 真正的联网、下载、校验与安装放在主进程 main.js 里完成。
 */
'use strict';

/** 正式更新源：项目在 GitHub 上的 Release（不使用 main 分支的提交） */
const UPDATE_REPO = 'EzRlon/RlonDSP';
const RELEASES_API = 'https://api.github.com/repos/' + UPDATE_REPO + '/releases/latest';
const RELEASES_PAGE = 'https://github.com/' + UPDATE_REPO + '/releases';

/**
 * 解析语义化版本号：1.2.3 / v1.2.3 / 1.2.3-beta.1
 * 解析失败返回 null（调用方必须按「检查失败」处理，不能当成最新版）。
 */
function parseVersion(value) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)(?:[-+]([0-9A-Za-z.\-]+))?$/.exec(String(value == null ? '' : value).trim());
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    pre: match[4] || ''
  };
}

/**
 * 比较两个版本号：a > b 返回 1，a < b 返回 -1，相等返回 0。
 * 任一版本号无法解析时返回 null —— 由调用方报告「检查失败」，
 * 绝不能因为解析不出来就当成「已是最新」。
 * 预发布版本按语义化版本规则排在正式版本之前（1.1.0-beta < 1.1.0）。
 */
function compareVersions(a, b) {
  const va = parseVersion(a);
  const vb = parseVersion(b);
  if (!va || !vb) return null;
  const keys = ['major', 'minor', 'patch'];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (va[key] !== vb[key]) return va[key] < vb[key] ? -1 : 1;
  }
  if (va.pre === vb.pre) return 0;
  if (!va.pre) return 1;
  if (!vb.pre) return -1;
  return va.pre < vb.pre ? -1 : 1;
}

/** 远程版本是否比当前版本新（相同或更旧都返回 false，绝不会提示降级） */
function isNewer(remote, current) {
  const result = compareVersions(remote, current);
  return result === null ? false : result > 0;
}

/** 从 Release 的附件里挑出与当前平台/架构匹配的更新包 */
function pickAsset(assets, platform, arch) {
  const list = (assets || []).filter((asset) => asset && asset.name);
  const find = (re) => list.find((asset) => re.test(asset.name));
  const is64 = arch !== 'ia32' && arch !== 'x86';
  if (platform === 'win32') {
    // 已安装版优先用安装包；否则退回便携压缩包
    return (is64 ? find(/setup.*x64.*\.exe$/i) : null)
      || find(/setup.*\.exe$/i)
      || find(/\.exe$/i)
      || find(/portable.*\.zip$/i)
      || find(/\.zip$/i)
      || null;
  }
  return find(/\.(zip|tar\.gz|dmg|AppImage)$/i) || null;
}

/** 校验和文件（SHA256SUMS.txt / checksums.txt 之类），有就用来验证更新包 */
function pickChecksumAsset(assets) {
  const list = (assets || []).filter((asset) => asset && asset.name);
  return list.find((asset) => /^(sha256sums|checksums)(\.txt)?$/i.test(asset.name))
    || list.find((asset) => /sha256.*\.txt$/i.test(asset.name))
    || null;
}

/**
 * 从校验和文本里取出指定文件名的 SHA-256。
 * 支持两种常见写法：
 *   <64 位十六进制>  <文件名>
 *   <文件名>: <64 位十六进制>
 */
function parseChecksum(text, fileName) {
  if (!text || !fileName) return null;
  const lines = String(text).split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const hexFirst = /^([0-9a-f]{64})\s+\*?(.+)$/i.exec(line);
    if (hexFirst && hexFirst[2].trim() === fileName) return hexFirst[1].toLowerCase();
    const nameFirst = /^(.+?)\s*:\s*([0-9a-f]{64})$/i.exec(line);
    if (nameFirst && nameFirst[1].trim() === fileName) return nameFirst[2].toLowerCase();
  }
  return null;
}

/**
 * 把 GitHub Release 的 JSON 解析成界面需要的结构。
 * 只挑我们真正要用的字段，绝不把远程 HTML 直接交给页面执行。
 */
function parseRelease(json, platform, arch) {
  if (!json || typeof json !== 'object') return null;
  const tag = String(json.tag_name || '').trim();
  const parsed = parseVersion(tag);
  if (!parsed) return null;
  const assets = Array.isArray(json.assets) ? json.assets : [];
  const asset = pickAsset(assets, platform, arch);
  const checksumAsset = pickChecksumAsset(assets);
  return {
    version: tag.replace(/^v/, ''),
    tag: tag,
    name: String(json.name || tag),
    notes: String(json.body || ''),
    publishedAt: String(json.published_at || ''),
    prerelease: !!json.prerelease,
    releaseUrl: String(json.html_url || RELEASES_PAGE),
    asset: asset ? {
      name: String(asset.name),
      url: String(asset.browser_download_url || ''),
      size: Number(asset.size) || 0,
      contentType: String(asset.content_type || '')
    } : null,
    checksumAsset: checksumAsset ? {
      name: String(checksumAsset.name),
      url: String(checksumAsset.browser_download_url || '')
    } : null
  };
}

/** 把 Release 说明转成纯文本，并去掉可能被误当标签的内容（前端只按纯文本渲染） */
function sanitizeNotes(text) {
  return String(text == null ? '' : text)
    .replace(/<[^>]*>/g, '')
    .replace(/\r\n/g, '\n')
    .slice(0, 8000);
}

module.exports = {
  UPDATE_REPO,
  RELEASES_API,
  RELEASES_PAGE,
  parseVersion,
  compareVersions,
  isNewer,
  pickAsset,
  pickChecksumAsset,
  parseChecksum,
  parseRelease,
  sanitizeNotes
};
