/*
 * RlonDSP
 * Copyright © 2026 RlonDSP. All rights reserved.
 *
 * MusicSquare 在线源（第三个内置源）专项测试
 * ---------------------------------------------------------------------------
 * 只用桩 fetch，断言的是「上游真实返回结构 → RlonDSP 统一资源结构」的映射：
 *   - 四个平台（网易云 / QQ / 酷我 / JOOX）的搜索、详情、播放地址解析；
 *   - 平台开关、单平台失败、全部失败、非歌曲类型等真实错误路径；
 *   - 项目首页 URL 绝不被当作歌曲 API。
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { createOnlineSourceManager, MUSICSQUARE } = require('../../online-source-layer');

function makeResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => null },
    arrayBuffer: async () => Buffer.from(typeof body === 'string' ? body : JSON.stringify(body))
  };
}

/** 上游返回结构全部取自真实响应（2026-10 实测），不是凭空捏造 */
const UPSTREAM = {
  netease: [
    { name: '晴天', artist: '周杰伦', url: 'https://api.qijieya.cn/meting/?server=netease&type=url&id=186016', pic: 'https://api.qijieya.cn/meting/?server=netease&type=pic&id=1099511', lrc: 'https://api.qijieya.cn/meting/?server=netease&type=lrc&id=186016' }
  ],
  qq: [{ song_title: '晴天', singer_name: '周杰伦', song_mid: '0039MnYb0qxYhV', pay: '付费' }],
  kuwo: {
    data: [{
      song: '晴天', singer: '周杰伦', album: '叶惠美', rid: 'MUSIC_228908', picture: 'https://img1.kuwo.cn/a.jpg', time: '269',
      types: [{ level: 'p', bitrate: '192', format: 'ogg', size: '5.59Mb' }, { level: 'ff', bitrate: '2000', format: 'flac', size: '52.83Mb' }]
    }]
  },
  joox: { code: 200, data: { songs: [{ '歌曲名称': '晴天', '歌手': '周杰倫', '专辑': '葉惠美', '时长': '04:29', '歌曲ID': '97773', songmid: 'ZE2F3FF0FB5C62' }] } }
};

function createHarness(options = {}) {
  const calls = [];
  const fetchImpl = async (url) => {
    const parsed = new URL(url);
    calls.push({ origin: parsed.origin, url: parsed.toString(), search: parsed.searchParams });
    const host = parsed.hostname;
    if (host === 'api.qijieya.cn') return makeResponse(200, options.neteaseFails ? [] : UPSTREAM.netease);
    if (host === 'tang.api.s01s.cn') {
      if (parsed.searchParams.get('mid')) {
        return makeResponse(200, {
          song_mid: parsed.searchParams.get('mid'),
          song_title: '晴天',
          singer_name: '周杰伦',
          song_play_url_standard: 'https://isure.stream.qqmusic.qq.com/C400004.m4a?vkey=1',
          song_size_standard_str: '2920181',
          kbps_standard: '97',
          song_play_url_sq: 'https://isure.stream.qqmusic.qq.com/F000004.flac?vkey=2',
          song_size_sq_str: '26174554',
          kbps_sq: '872',
          song_h5_url: 'https://y.qq.com/n/ryqq/songDetail/0039MnYb0qxYhV'
        });
      }
      return makeResponse(200, options.qqFails ? 'not json' : UPSTREAM.qq);
    }
    if (host === 'oiapi.net') {
      if (parsed.searchParams.get('n')) {
        if (String(parsed.searchParams.get('n')) !== '1') return makeResponse(200, { code: -1, data: [] });
        return makeResponse(200, {
          code: 1,
          data: {
            song: '晴天', singer: '周杰伦', rid: 'MUSIC_228908', level: 'ff', format: 'flac', size: '52.83Mb',
            url: 'https://kw-er.kuwo.cn/trackmedia/F000.flac?bitrate$2000'
          }
        });
      }
      return makeResponse(200, UPSTREAM.kuwo);
    }
    if (host === 'apicx.asia') {
      if (parsed.searchParams.get('mid')) {
        return makeResponse(200, {
          code: 200,
          data: { songmid: parsed.searchParams.get('mid'), '播放链接': { 'MP3 320': 'https://hk.stream.music.joox.com/M800.mp3?vkey=1', '30s 18': 'https://hk.stream.music.joox.com/RS02.mp3?vkey=2' } }
        });
      }
      return makeResponse(200, UPSTREAM.joox);
    }
    return makeResponse(404, {});
  };
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rlondsp-ms-'));
  fs.writeFileSync(path.join(dir, 'online-sources.json'), '[]');
  const manager = createOnlineSourceManager({ userDataDir: dir, fetchImpl });
  return { manager, calls };
}

async function createSource(manager, overrides = {}) {
  return manager.saveSource({
    name: 'MusicSquare',
    sourceType: 'musicsquare',
    baseUrl: 'https://charlespikachu.github.io/musicsquare/',
    enabled: true,
    platforms: { netease: true, qq: true, kuwo: true, joox: true },
    ...overrides
  });
}

test('MusicSquare：搜索聚合四个平台，结果带平台归属与真实上游 id', async () => {
  const { manager, calls } = createHarness();
  await manager.init();
  const source = await createSource(manager);
  const items = await manager.search(source.id, { query: '周杰伦', type: 'song', limit: 10 });

  assert.strictEqual(items.length, 4, '四个平台各出一条真实结果');
  assert.deepStrictEqual(items.map((item) => item.provider), ['netease', 'qq', 'kuwo', 'joox'], '平台顺序稳定');
  assert.deepStrictEqual(items.map((item) => item.id), [
    'netease:186016', 'qq:0039MnYb0qxYhV', 'kuwo:MUSIC_228908', 'joox:ZE2F3FF0FB5C62'
  ], '资源 id 带平台前缀，同名歌在不同平台不会互相去重');
  assert.ok(items.every((item) => item.sourceType === 'musicsquare' && item.sourceId === source.id), '归属统一来源');
  assert.ok(items.every((item) => item.type === 'song' && item.title === '晴天'), '都是歌曲条目');
  // 网易云搜索阶段就带真实播放地址 / 封面 / 歌词；其它平台按需解析
  assert.ok(items[0].playUrl.startsWith('https://api.qijieya.cn/meting/'), '网易云复用上游真实地址');
  assert.ok(items[0].coverUrl.startsWith('https://api.qijieya.cn/meting/'), '网易云封面来自上游');
  assert.strictEqual(items[1].playUrl, '', 'QQ 搜索阶段不给地址（详情才有）');
  // 酷我的清晰度 / 体积取上游 types 里最高码率那一档（真实字段，不是估算）
  assert.strictEqual(items[2].quality, 'FLAC 2000k');
  assert.strictEqual(items[2].sizeBytes, Math.round(52.83 * 1024 * 1024));
  assert.strictEqual(items[2].duration, 269);
  assert.strictEqual(items[3].duration, 269, 'JOOX 的 mm:ss 时长被换算成秒');

  // 归属展示：首页 URL 只作展示，任何请求都打到真实平台主机
  const origins = new Set(calls.map((call) => call.origin));
  assert.ok(!origins.has('https://charlespikachu.github.io'), '项目首页 URL 绝不被当作歌曲 API');
  for (const origin of origins) {
    assert.ok(Object.values(MUSICSQUARE.platforms).some((platform) => platform.host === origin), `请求只发往平台主机：${origin}`);
  }
});

test('MusicSquare：平台可单独关闭，关闭的平台既不搜索也不解析', async () => {
  const { manager, calls } = createHarness();
  await manager.init();
  const source = await createSource(manager, { platforms: { netease: true, qq: true, kuwo: false, joox: false } });
  assert.deepStrictEqual(source.platforms, { netease: true, qq: true, kuwo: false, joox: false }, '平台开关被规范化保存');

  const items = await manager.search(source.id, { query: '周杰伦', type: 'song', limit: 10 });
  assert.deepStrictEqual(items.map((item) => item.provider), ['netease', 'qq'], '只返回启用平台的结果');
  assert.ok(calls.every((call) => call.origin !== 'https://oiapi.net' && call.origin !== 'https://apicx.asia'), '关闭的平台不发起任何请求');

  await assert.rejects(
    () => manager.resolvePlayUrl(source.id, { id: 'kuwo:MUSIC_228908', title: '晴天', artist: '周杰伦' }),
    /SOURCE_PLAY_URL_INVALID|SOURCE_CONFIG_INVALID/,
    '关闭的平台不再解析地址'
  );
});

test('MusicSquare：单个平台失效不影响其它平台，全部失效才是网络错误', async () => {
  const partial = createHarness({ neteaseFails: false, qqFails: true });
  await partial.manager.init();
  const source = await createSource(partial.manager);
  const items = await partial.manager.search(source.id, { query: '周杰伦', type: 'song', limit: 10 });
  assert.ok(items.length >= 3, '一个平台返回非 JSON 时其它平台结果照常返回');
  assert.ok(!items.some((item) => item.provider === 'qq'), '失效平台不产生任何条目');

  const allFail = createHarness({ qqFails: true });
  await allFail.manager.init();
  const source2 = await createSource(allFail.manager, { platforms: { netease: false, qq: true, kuwo: false, joox: false } });
  await assert.rejects(
    () => allFail.manager.search(source2.id, { query: '周杰伦', type: 'song' }),
    /SOURCE_NETWORK_ERROR/,
    '全部平台失效时返回真实网络错误，而不是空结果'
  );
});

test('MusicSquare：播放地址按平台真实解析（QQ 详情 / JOOX 播放链接 / 酷我名次 / 网易云地址）', async () => {
  const { manager } = createHarness();
  await manager.init();
  const source = await createSource(manager);

  const qq = await manager.resolvePlayUrl(source.id, { id: 'qq:0039MnYb0qxYhV', type: 'song', title: '晴天', artist: '周杰伦' });
  assert.ok(qq.startsWith('https://isure.stream.qqmusic.qq.com/'), `QQ 取上游详情里的真实地址（${qq}）`);
  assert.ok(qq.includes('F000004.flac'), '优先取无损档');

  const joox = await manager.resolvePlayUrl(source.id, { id: 'joox:ZE2F3FF0FB5C62', type: 'song', title: '晴天', artist: '周杰倫' });
  assert.ok(joox.startsWith('https://hk.stream.music.joox.com/'), 'JOOX 取播放链接字典里的真实地址');

  const kuwo = await manager.resolvePlayUrl(source.id, { id: 'kuwo:MUSIC_228908', type: 'song', title: '晴天', artist: '周杰伦' });
  assert.ok(kuwo.startsWith('https://kw-er.kuwo.cn/trackmedia/'), '酷我按名次取详情并校验 rid');

  const netease = await manager.resolvePlayUrl(source.id, { id: 'netease:186016', type: 'song', playUrl: 'https://api.qijieya.cn/meting/?server=netease&type=url&id=186016' });
  assert.ok(netease.startsWith('https://api.qijieya.cn/meting/'), '网易云复用搜索阶段拿到的真实地址');
  const netease2 = await manager.resolvePlayUrl(source.id, { id: 'netease:186016', type: 'song' });
  assert.ok(netease2.includes('type=url') && netease2.includes('id=186016'), '没有地址时按真实 id 重建上游地址');
});

test('MusicSquare：解析不到真实地址时明确失败，绝不编造', async () => {
  const { manager } = createHarness();
  await manager.init();
  const source = await createSource(manager);
  // 酷我：这个 rid 不在上游搜索结果里
  await assert.rejects(
    () => manager.resolvePlayUrl(source.id, { id: 'kuwo:MUSIC_999999', type: 'song', title: '不存在的歌', artist: '谁' }),
    /SOURCE_PLAY_URL_INVALID/,
    '定位不到上游条目就报错'
  );
  // 非法 id：没有平台前缀
  await assert.rejects(
    () => manager.resolvePlayUrl(source.id, { id: '228908', type: 'song' }),
    /SOURCE_PLAY_URL_INVALID/,
    '缺少平台前缀的 id 直接拒绝'
  );
});

test('MusicSquare：只支持歌曲搜索，非歌曲类型如实报错', async () => {
  const { manager } = createHarness();
  await manager.init();
  const source = await createSource(manager);
  await assert.rejects(
    () => manager.search(source.id, { query: '周杰伦', type: 'album' }),
    /SOURCE_CONFIG_INVALID/,
    '上游没有专辑接口，不伪造专辑结果'
  );
  await assert.rejects(
    () => manager.search(source.id, { query: '   ', type: 'song' }),
    /SOURCE_CONFIG_INVALID/,
    '空关键词不发起请求'
  );
});

test('MusicSquare：连通性测试用真实搜索，不做假样本', async () => {
  const { manager } = createHarness();
  await manager.init();
  const source = await createSource(manager);
  const result = await manager.testConnection(source);
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.sample.title, '晴天');
  assert.strictEqual(result.sample.id, 'netease:186016');
});

test('MusicSquare：没有榜单能力时如实返回 supported:false，不发任何请求', async () => {
  const { manager, calls } = createHarness();
  await manager.init();
  const source = await createSource(manager);
  calls.length = 0;
  const discovery = await manager.getDiscovery(source.id, {});
  assert.strictEqual(discovery.supported, false);
  assert.deepStrictEqual(discovery.sections, { song: [], album: [], playlist: [] });
  assert.strictEqual(calls.length, 0, '不支持的来源不访问任何上游');
});
