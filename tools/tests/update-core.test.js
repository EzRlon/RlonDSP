/*
 * RlonDSP
 * Copyright © 2026 RlonDSP. All rights reserved.
 *
 * 版本更新：纯逻辑单元测试（版本号比较、更新包挑选、校验和解析、Release 解析）。
 * 这些测试不联网、不触碰文件，验证的是「判断新版本」这套规则本身是否正确。
 */
const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const core = require(path.resolve(__dirname, '..', '..', 'update-core.js'));

test('版本号解析：接受 v 前缀与预发布后缀，非法输入返回 null', () => {
  assert.deepStrictEqual(core.parseVersion('1.0.0'), { major: 1, minor: 0, patch: 0, pre: '' });
  assert.deepStrictEqual(core.parseVersion('v2.3.4'), { major: 2, minor: 3, patch: 4, pre: '' });
  assert.strictEqual(core.parseVersion('1.0.0-beta.1').pre, 'beta.1');
  assert.strictEqual(core.parseVersion('1.0'), null);
  assert.strictEqual(core.parseVersion('abc'), null);
  assert.strictEqual(core.parseVersion(''), null);
});

test('版本比较：1.0.0 < 1.1.0 < 1.1.1 < 2.0.0', () => {
  assert.strictEqual(core.compareVersions('1.0.0', '1.1.0'), -1);
  assert.strictEqual(core.compareVersions('1.1.0', '1.0.0'), 1);
  assert.strictEqual(core.compareVersions('1.1.0', '1.1.1'), -1);
  assert.strictEqual(core.compareVersions('2.0.0', '1.9.9'), 1);
  assert.strictEqual(core.compareVersions('1.1.0', '1.1.0'), 0);
  assert.strictEqual(core.compareVersions('v1.1.0', '1.1.0'), 0);
});

test('版本比较：预发布版本低于同号正式版', () => {
  assert.strictEqual(core.compareVersions('1.1.0-beta', '1.1.0'), -1);
  assert.strictEqual(core.compareVersions('1.1.0', '1.1.0-beta'), 1);
});

test('是否提示更新：远程新版才提示，同版或旧版一律不提示（不降级）', () => {
  assert.strictEqual(core.isNewer('1.1.0', '1.0.0'), true);
  assert.strictEqual(core.isNewer('1.0.0', '1.0.0'), false);
  assert.strictEqual(core.isNewer('1.0.0', '1.1.0'), false);
  // 版本号解析不了时绝不当作「有新版本」
  assert.strictEqual(core.isNewer('not-a-version', '1.0.0'), false);
});

test('更新包挑选：Windows 优先安装包，其次便携包', () => {
  const assets = [
    { name: 'RlonDSP-1.1.0-portable-x64.zip', browser_download_url: 'u-zip', size: 10 },
    { name: 'RlonDSP-1.1.0-setup-x64.exe', browser_download_url: 'u-exe', size: 20 }
  ];
  const picked = core.pickAsset(assets, 'win32', 'x64');
  assert.strictEqual(picked.name, 'RlonDSP-1.1.0-setup-x64.exe');

  const onlyZip = core.pickAsset([assets[0]], 'win32', 'x64');
  assert.strictEqual(onlyZip.name, 'RlonDSP-1.1.0-portable-x64.zip');

  assert.strictEqual(core.pickAsset([], 'win32', 'x64'), null);
});

test('校验和解析：支持「<哈希>  文件名」与「文件名: <哈希>」两种写法', () => {
  const hash = 'a'.repeat(64);
  const text = [
    hash + '  RlonDSP-1.1.0-setup-x64.exe',
    'RlonDSP-1.1.0-portable-x64.zip: ' + 'b'.repeat(64)
  ].join('\n');
  assert.strictEqual(core.parseChecksum(text, 'RlonDSP-1.1.0-setup-x64.exe'), hash);
  assert.strictEqual(core.parseChecksum(text, 'RlonDSP-1.1.0-portable-x64.zip'), 'b'.repeat(64));
  assert.strictEqual(core.parseChecksum(text, '不存在.exe'), null);
  assert.strictEqual(core.parseChecksum('', 'x.exe'), null);
});

test('Release 解析：提取版本、说明、附件与校验文件', () => {
  const json = {
    tag_name: 'v1.2.0',
    name: 'RlonDSP v1.2.0',
    body: '## 更新\n- 修复 A\n- 新增 B',
    published_at: '2026-10-01T00:00:00Z',
    html_url: 'https://github.com/EzRlon/RlonDSP/releases/tag/v1.2.0',
    assets: [
      { name: 'RlonDSP-1.2.0-setup-x64.exe', browser_download_url: 'u-exe', size: 123, content_type: 'application/octet-stream' },
      { name: 'SHA256SUMS.txt', browser_download_url: 'u-sum', size: 90 }
    ]
  };
  const release = core.parseRelease(json, 'win32', 'x64');
  assert.strictEqual(release.version, '1.2.0');
  assert.strictEqual(release.tag, 'v1.2.0');
  assert.strictEqual(release.asset.name, 'RlonDSP-1.2.0-setup-x64.exe');
  assert.strictEqual(release.asset.size, 123);
  assert.strictEqual(release.checksumAsset.name, 'SHA256SUMS.txt');
  assert.ok(release.notes.includes('修复 A'));

  assert.strictEqual(core.parseRelease({ tag_name: 'bad' }, 'win32', 'x64'), null);
  assert.strictEqual(core.parseRelease(null, 'win32', 'x64'), null);
});

test('更新说明清洗：去掉标签、限制长度，绝不保留可执行内容', () => {
  const dirty = '<img src=x onerror=alert(1)>修复问题\n<script>alert(2)</script>';
  const clean = core.sanitizeNotes(dirty);
  assert.ok(!clean.includes('<'), '不应保留任何尖括号内容：' + clean);
  assert.ok(clean.includes('修复问题'));
  assert.ok(core.sanitizeNotes('x'.repeat(20000)).length <= 8000);
});
