/*
 * RlonDSP
 * Copyright © 2026 RlonDSP. All rights reserved.
 * Based on Echomusic open-source project, modified and extended for RlonDSP.
 *
 * 统一 DSP 图谱测试：
 *   1. 所有 DSP 可以同时工作，同一种功能可以存在多个独立节点；
 *   2. 只有用户加进图里、且启用未旁通的节点才执行，每个恰好执行一次；
 *   3. 顺序由节点编排决定；延迟如实统计；尾音节点必须标记。
 *
 * 运行方式（项目根目录）：
 *   node --test tools/tests/
 */
const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const { createDspHost, TYPES } = require(path.resolve(__dirname, '..', '..', 'src', 'dsp-host.js'));

/** 登记一套和实际程序一致的 RlonDSP 内置实现 */
function makeHost() {
  const host = createDspHost();
  const defs = [
    ['gain', '总增益', 0, 0],
    ['eq', '均衡器', 0, 0],
    ['bass', '低音增强', 0, 0],
    ['compressor', '压缩器', 0, 0],
    ['clarity', '清晰度增强', 0, 0],
    ['stereo', '立体声增强', 0, 0],
    ['spatial', '空间音效', 0, 512],
    ['tube', '胆机模拟', 0, 0],
    ['ultrasonic', '超高频净化', 0, 0],
    ['reverb', '混响', 0, 24000],
    ['gate', '降噪', 0, 0],
    ['limiter', '限幅', 64, 0],
    ['convolution', '脉冲卷积', 0, 48000],
    ['analyzer', '分析器', 0, 0]
  ];
  defs.forEach(([type, name, latencyFrames, tailFrames]) => {
    host.defineNode({ type, owner: 'rlondsp', name, latencyFrames, tailFrames });
  });
  return host;
}

function provider(id, caps) {
  return {
    id,
    name: id,
    version: '1.0.0',
    capabilities: caps.map((c) => (typeof c === 'string' ? { type: c } : c))
  };
}

function planTypes(host) {
  return host.executionPlan().map((s) => (s.kind === 'node' ? s.type : 'parallel:' + s.branches.map((b) => b.id).join('+')));
}

test('所有 RlonDSP 内置 DSP 可以同时进入同一条链', () => {
  const host = makeHost();
  const chain = ['eq', 'compressor', 'bass', 'clarity', 'stereo', 'spatial', 'reverb', 'convolution', 'limiter', 'gain'];
  chain.forEach((type) => host.addNode({ type }));

  assert.deepStrictEqual(planTypes(host), chain, '执行顺序应与加入顺序一致');
  assert.strictEqual(host.activeNodeIds().length, chain.length);
});

test('同一种功能可以存在多个独立节点，并全部执行', () => {
  const host = makeHost();
  host.addNode({ type: 'eq', id: 'eq_a' });
  host.addNode({ type: 'eq', id: 'eq_b' });
  host.addNode({ type: 'limiter', id: 'lim' });

  assert.deepStrictEqual(planTypes(host), ['eq', 'eq', 'limiter'], '两个均衡器都应执行');
  assert.deepStrictEqual(host.activeNodeIds(), ['eq_a', 'eq_b', 'lim']);
});

test('只有启用的节点才执行，每个节点恰好执行一次', () => {
  const host = makeHost();
  host.addNode({ type: 'eq', id: 'eq_a' });
  host.addNode({ type: 'eq', id: 'eq_b' });
  host.addNode({ type: 'reverb', id: 'rev' });

  host.setEnabled('eq_b', false);
  assert.deepStrictEqual(host.activeNodeIds(), ['eq_a', 'rev'], '停用后不应进入计划');

  const ids = host.activeNodeIds();
  assert.strictEqual(new Set(ids).size, ids.length, '不允许出现重复执行的节点');

  host.setEnabled('eq_b', true);
  assert.deepStrictEqual(host.activeNodeIds(), ['eq_a', 'eq_b', 'rev']);
});

test('旁通（Bypass）的节点不执行，但配置保留', () => {
  const host = makeHost();
  host.addNode({ type: 'tube', id: 'tube1', params: { drive: 0.7 } });
  host.setBypass('tube1', true);

  assert.deepStrictEqual(host.activeNodeIds(), [], '旁通节点不应执行');
  const node = host.listNodes()[0];
  assert.strictEqual(node.bypass, true);
  assert.strictEqual(node.params.drive, 0.7, '旁通不应丢失参数');
});

test('顺序由编排决定：移动节点会改变执行顺序', () => {
  const host = makeHost();
  host.addNode({ type: 'eq', id: 'a' });
  host.addNode({ type: 'reverb', id: 'b' });
  host.addNode({ type: 'limiter', id: 'c' });
  assert.deepStrictEqual(host.activeNodeIds(), ['a', 'b', 'c']);

  host.moveNode('c', 0);
  assert.deepStrictEqual(host.activeNodeIds(), ['c', 'a', 'b'], '限幅应被移到最前');
});

test('延迟如实统计：串联相加，并行取最长并对齐分支', () => {
  const host = makeHost();
  host.addNode({ type: 'eq' });          // 0
  host.addNode({ type: 'limiter' });     // 64
  host.addNode({ type: 'reverb' });      // 0 延迟、24000 尾音
  assert.strictEqual(host.totalLatencyFrames(), 64);

  // 建两条并行分支：一条 0 延迟，一条 64 延迟
  host.addNode({ type: 'eq', id: 'brA1', branch: 'A' });
  host.addNode({ type: 'limiter', id: 'brB1', branch: 'B' });
  const plan = host.executionPlan();
  const parallel = plan.find((s) => s.kind === 'parallel');
  assert.ok(parallel, '应识别出并行段落');

  const branchA = parallel.branches.find((b) => b.id === 'A');
  const branchB = parallel.branches.find((b) => b.id === 'B');
  assert.strictEqual(branchA.latencyFrames, 0);
  assert.strictEqual(branchB.latencyFrames, 64);
  assert.strictEqual(branchA.compensationFrames, 64, '短分支必须补足延迟以对齐');
  assert.strictEqual(branchB.compensationFrames, 0);
  assert.strictEqual(parallel.latencyFrames, 64, '并行段落延迟取最长分支');
});

test('尾音（Tail）节点被正确标记，供停止/切歌时 drain', () => {
  const host = makeHost();
  host.addNode({ type: 'eq' });
  host.addNode({ type: 'reverb' });
  host.addNode({ type: 'convolution' });

  const drains = host.drainNodes();
  assert.deepStrictEqual(drains.map((d) => d.type), ['reverb', 'convolution']);
  assert.strictEqual(host.totalTailFrames(), 24000 + 48000, '尾音长度应可累计');
});

test('Provider 与内置实现可以共存，同类型互不排斥', () => {
  const host = makeHost();
  host.registerProvider(provider('acme', ['eq', 'limiter']), {});
  host.registerProvider(provider('bravo', ['eq']), {});   // 第二个 Provider 也可以提供 eq

  // 三个 EQ 来源同时可用
  assert.ok(host.addNode({ type: 'eq', owner: 'rlondsp', id: 'eq_rlondsp' }).ok);
  assert.ok(host.addNode({ type: 'eq', owner: 'provider:acme', id: 'eq_acme' }).ok);
  assert.ok(host.addNode({ type: 'eq', owner: 'provider:bravo', id: 'eq_bravo' }).ok);

  assert.deepStrictEqual(host.activeNodeIds(), ['eq_rlondsp', 'eq_acme', 'eq_bravo']);
  const owners = host.listNodes().map((n) => n.owner);
  assert.deepStrictEqual(owners, ['rlondsp', 'provider:acme', 'provider:bravo']);
});

test('用户没加进图的实现不会执行（不存在隐式重复处理）', () => {
  const host = makeHost();
  host.registerProvider(provider('acme', ['eq']), {});
  host.addNode({ type: 'eq', owner: 'rlondsp' });          // 只加内置 EQ

  assert.deepStrictEqual(host.activeNodeIds().length, 1);
  assert.deepStrictEqual(planTypes(host), ['eq']);
  const owners = host.listNodes().map((n) => n.owner);
  assert.ok(!owners.includes('provider:acme'), 'Provider 的 EQ 未加入图，不应执行');
});

test('Provider 出错时只摘掉它自己贡献的节点，其它 DSP 不受影响', () => {
  const host = makeHost();
  host.registerProvider(provider('flaky', ['reverb']), { dispose() {} });

  host.addNode({ type: 'eq', id: 'eq1' });
  host.addNode({ type: 'reverb', owner: 'provider:flaky', id: 'rev_provider' });
  host.addNode({ type: 'limiter', id: 'lim1' });
  assert.deepStrictEqual(host.activeNodeIds(), ['eq1', 'rev_provider', 'lim1']);

  const r = host.reportFailure('flaky', new Error('卷积核加载失败'));
  assert.strictEqual(r.ok, true);
  assert.deepStrictEqual(r.disabledNodes, ['rev_provider']);

  assert.deepStrictEqual(host.activeNodeIds(), ['eq1', 'lim1'], '内置节点应继续工作');
  assert.strictEqual(host.listProviders()[0].state, 'failed');
});

test('Provider 的内部异常会被 guard 自动隔离', () => {
  const host = makeHost();
  host.registerProvider(provider('boom', ['spatial']), {});
  const safe = host.guard('boom', () => { throw new Error('空间音效崩溃'); });
  assert.strictEqual(safe(), undefined);
  assert.strictEqual(host.listProviders()[0].state, 'failed');
});

test('清单不合法时拒绝注册', () => {
  const host = makeHost();
  assert.strictEqual(host.registerProvider({ id: '', name: 'x', version: '1', capabilities: [{ type: 'eq' }] }, {}).ok, false);
  assert.strictEqual(host.registerProvider({ id: 'p', name: 'x', version: '1', capabilities: [] }, {}).ok, false);
  const bad = host.registerProvider(provider('p2', ['not-a-dsp']), {});
  assert.strictEqual(bad.ok, false);
  assert.ok(bad.errors.some((e) => e.indexOf('未知类型') >= 0));
});

test('资源不是 DSP：登记 IR / 脉冲反馈不会改变图', () => {
  const host = makeHost();
  host.addNode({ type: 'convolution' });
  const before = host.activeNodeIds();

  host.addResource({ id: 'ir-1', kind: 'ir', name: '大厅脉冲', bytes: 96000, sampleRate: 48000, channels: 2 });
  host.addResource({ id: 'pulse-1', kind: 'pulse', name: '自定义脉冲反馈', bytes: 480000 });

  assert.strictEqual(host.listResources().length, 2);
  assert.deepStrictEqual(host.activeNodeIds(), before, '资源不应影响执行计划');
});

test('未知类型 / 重复 id 会被拒绝', () => {
  const host = makeHost();
  const bad = host.addNode({ type: '不存在的类型' });
  assert.strictEqual(bad.ok, false);
  assert.strictEqual(bad.reason, 'unknown-type');

  host.addNode({ type: 'eq', id: 'dup' });
  const again = host.addNode({ type: 'eq', id: 'dup' });
  assert.strictEqual(again.ok, false);
  assert.strictEqual(again.reason, 'duplicate-id');
});

test('没有实现的来源会被拒绝（例如声明了但未注册的 Provider）', () => {
  const host = makeHost();
  const r = host.addNode({ type: 'eq', owner: 'provider:不存在' });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.reason, 'no-implementation');
});

test('校验会报告计划内重复与非实时安全节点', () => {
  const host = makeHost();
  host.defineNode({ type: 'tube', owner: 'native', name: '原生胆机', realtimeSafe: false });
  host.addNode({ type: 'eq' });
  host.addNode({ type: 'tube', owner: 'native' });

  const v = host.validate();
  assert.strictEqual(v.ok, true, '不应有硬错误');
  assert.ok(v.warnings.some((w) => w.indexOf('非实时安全') >= 0), '非实时安全节点应给出警告');
});

test('用户要求的完整链路示例可以成立', () => {
  const host = makeHost();
  host.registerProvider(provider('third-party', ['eq']), {});
  const chain = [
    ['eq', 'rlondsp'],
    ['compressor', 'rlondsp'],
    ['bass', 'rlondsp'],
    ['clarity', 'rlondsp'],
    ['stereo', 'rlondsp'],
    ['spatial', 'rlondsp'],
    ['reverb', 'rlondsp'],
    ['convolution', 'rlondsp'],
    ['eq', 'provider:third-party'],
    ['limiter', 'rlondsp'],
    ['gain', 'rlondsp']
  ];
  chain.forEach(([type, owner], i) => {
    const r = host.addNode({ type, owner, id: 'n' + i });
    assert.strictEqual(r.ok, true, type + '@' + owner + ' 应能加入图谱');
  });

  assert.deepStrictEqual(
    planTypes(host),
    ['eq', 'compressor', 'bass', 'clarity', 'stereo', 'spatial', 'reverb', 'convolution', 'eq', 'limiter', 'gain']
  );
  assert.strictEqual(host.validate().ok, true);
  assert.ok(host.totalLatencyFrames() > 0, '限幅器的前瞻延迟应被统计');
});

test('移除 Provider 会摘掉它的节点，但保留其它节点', () => {
  const host = makeHost();
  host.registerProvider(provider('temp', ['reverb']), {});
  host.addNode({ type: 'eq', id: 'keep' });
  host.addNode({ type: 'reverb', owner: 'provider:temp', id: 'drop' });

  const r = host.unregisterProvider('temp');
  assert.deepStrictEqual(r.removedNodes, ['drop']);
  assert.deepStrictEqual(host.activeNodeIds(), ['keep']);
});
