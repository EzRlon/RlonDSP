/*
 * RlonDSP
 * Copyright © 2026 RlonDSP. All rights reserved.
 * Based on Echomusic open-source project, modified and extended for RlonDSP.
 *
 * ============================================================================
 * Unified DSP Graph —— 统一 DSP 图谱
 * ============================================================================
 *
 * 设计目标（硬约束）：
 *
 *   1. 所有 DSP 可以同时工作。RlonDSP 内置、Native Engine、Provider、Spatial、
 *      Convolution、Analyzer 都是图中的节点，共同组成同一条实际音频链。
 *   2. 每个 DSP 都是独立节点，拥有自己的状态、参数、启用/旁通、延迟、尾音、
 *      通道要求；用户可以自由启用任意多个节点。
 *   3. 同一种功能可以存在多个节点（例如 EQ_A 与 EQ_B），由用户明确选择；
 *      只要用户加到图里，就允许串联共同工作。
 *   4. 但「用户没有加进来的节点绝不执行」——不存在隐式的重复处理。
 *      每个进入执行计划的节点，恰好执行一次。
 *   5. 节点顺序由图决定，而不是把算法写死成固定顺序。
 *   6. 延迟必须如实统计，必要时对并行分支做延迟补偿，不允许忽略。
 *   7. 尾音（Reverb / Convolution / Spatial 等）必须明确标记，
 *      停止、切歌、跳转时按 drain / reset 语义处理。
 *
 * 三层职责：
 *   Resource     —— 音效资源（IR、脉冲反馈、预设、Provider 文件），只是数据，不是 DSP。
 *   Node         —— 真正的处理单元，进入图谱参与执行。
 *   Provider     —— 第三方 DSP 来源，向图谱贡献「实现」。
 *
 * 本文件不产生音频，只负责「图长什么样、按什么顺序执行、延迟多少」，
 * 因此可以在主线程安全调用，不进入实时音频线程。
 */
(function (global) {
  'use strict';

  /** DSP 功能类型 */
  var TYPES = [
    'gain',        // 总增益
    'eq',          // 均衡器
    'bass',        // 低音增强
    'compressor',  // 压缩器
    'clarity',     // 清晰度增强
    'stereo',      // 立体声增强
    'spatial',     // 空间音效 / 环绕
    'tube',        // 胆机模拟
    'ultrasonic',  // 超高频净化
    'clipper',     // 削波 / 饱和
    'reverb',      // 混响
    'gate',        // 降噪
    'limiter',     // 限幅
    'convolution', // 脉冲响应卷积
    'channel-delay', // 差分环绕（声道延迟 / Haas 效应）
    'delay',       // 延迟 / 回声
    'chorus',      // 合唱
    'flanger',     // 镶边
    'analyzer'     // 分析（不影响声音，但同样作为节点存在）
  ];

  var TYPE_SET = {};
  for (var ti = 0; ti < TYPES.length; ti++) TYPE_SET[TYPES[ti]] = true;

  /** 实现来源种类 */
  var IMPLEMENTATIONS = ['builtin', 'native', 'provider'];

  function now() {
    return (typeof Date !== 'undefined' && Date.now) ? Date.now() : 0;
  }

  function isPlainObject(v) {
    return !!v && typeof v === 'object' && !Array.isArray(v);
  }

  function numberOr(v, fallback) {
    var n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  /**
   * 创建统一 DSP 图谱。
   * @param {{onChange?:Function, onLog?:Function}} options
   */
  function createDspHost(options) {
    var opts = isPlainObject(options) ? options : {};

    // 实现注册表：(type + '@' + owner) -> 实现描述
    var implementations = {};
    // 节点：id -> 节点实例
    var nodes = {};
    // 执行顺序（主链与并行分支都按这个数组的顺序解析）
    var order = [];
    // 并行分支的混合增益：branchId -> { gain, compensated }
    var branchMixes = {};
    // Provider：id -> 记录
    var providers = {};
    var providerOrder = [];
    // 资源：id -> 记录（资源不是 DSP）
    var resources = {};
    var events = [];
    var seq = 0;
    var nodeSeq = 0;

    function log(type, detail) {
      var entry = { seq: ++seq, at: now(), type: type, detail: detail || null };
      events.push(entry);
      if (events.length > 300) events.shift();
      if (typeof opts.onLog === 'function') {
        try { opts.onLog(entry); } catch (e) { /* 日志失败不影响图 */ }
      }
      return entry;
    }

    function changed() {
      if (typeof opts.onChange === 'function') {
        try { opts.onChange(snapshot()); } catch (e) { /* 同上 */ }
      }
    }

    // ── 实现注册表 ────────────────────────────────────────────

    function implKey(type, owner) {
      return type + '@' + owner;
    }

    /**
     * 注册一种「实现」。同一种功能类型可以有多个实现来源：
     *   rlondsp（内置）、native（原生引擎）、provider:<id>（第三方）。
     * 它们互不排斥，用户加了哪个节点就执行哪个。
     */
    function defineNode(descriptor) {
      if (!isPlainObject(descriptor)) throw new Error('节点实现描述必须是对象');
      var type = String(descriptor.type || '').trim();
      var owner = String(descriptor.owner || '').trim();
      if (!TYPE_SET[type]) throw new Error('未知的 DSP 类型: ' + type);
      if (!owner) throw new Error('缺少 owner（实现来源）');

      var key = implKey(type, owner);
      implementations[key] = {
        type: type,
        owner: owner,
        name: descriptor.name || type,
        implementation: descriptor.implementation || 'builtin',
        params: isPlainObject(descriptor.params) ? descriptor.params : {},
        channels: isPlainObject(descriptor.channels) ? descriptor.channels : { in: 2, out: 2 },
        latencyFrames: numberOr(descriptor.latencyFrames, 0),
        tailFrames: numberOr(descriptor.tailFrames, 0),
        preferredBlockSize: numberOr(descriptor.preferredBlockSize, 128),
        realtimeSafe: descriptor.realtimeSafe !== false,
        capabilities: Array.isArray(descriptor.capabilities) ? descriptor.capabilities.slice() : [],
        requiresDrain: descriptor.requiresDrain === true || numberOr(descriptor.tailFrames, 0) > 0
      };
      log('implementation-defined', { type: type, owner: owner, implementation: implementations[key].implementation });
      changed();
      return implementations[key];
    }

    function listImplementations() {
      var out = [];
      for (var k in implementations) {
        if (!Object.prototype.hasOwnProperty.call(implementations, k)) continue;
        var i = implementations[k];
        out.push({
          type: i.type, owner: i.owner, name: i.name, implementation: i.implementation,
          latencyFrames: i.latencyFrames, tailFrames: i.tailFrames,
          channels: i.channels, realtimeSafe: i.realtimeSafe, capabilities: i.capabilities.slice()
        });
      }
      return out;
    }

    // ── 节点 CRUD ─────────────────────────────────────────────

    function nextNodeId(type) {
      nodeSeq++;
      return type + '#' + nodeSeq;
    }

    /**
     * 往图里加一个 DSP 节点。
     * 注意：同一种类型可以加多个（例如两个均衡器），它们是彼此独立的节点。
     */
    function addNode(descriptor) {
      if (!isPlainObject(descriptor)) throw new Error('节点描述必须是对象');
      var type = String(descriptor.type || '').trim();
      if (!TYPE_SET[type]) return { ok: false, reason: 'unknown-type', errors: ['未知的 DSP 类型: ' + type] };

      var owner = String(descriptor.owner || 'rlondsp').trim();
      var impl = implementations[implKey(type, owner)];
      if (!impl) {
        return { ok: false, reason: 'no-implementation', errors: ['没有该来源的实现: ' + type + ' @ ' + owner] };
      }

      var id = String(descriptor.id || '').trim() || nextNodeId(type);
      if (nodes[id]) return { ok: false, reason: 'duplicate-id', errors: ['节点 id 已存在: ' + id] };

      var params = {};
      for (var p in impl.params) {
        if (Object.prototype.hasOwnProperty.call(impl.params, p)) params[p] = impl.params[p];
      }
      if (isPlainObject(descriptor.params)) {
        for (var q in descriptor.params) {
          if (Object.prototype.hasOwnProperty.call(descriptor.params, q)) params[q] = descriptor.params[q];
        }
      }

      var node = {
        id: id,
        type: type,
        owner: owner,
        name: descriptor.name || impl.name,
        implementation: impl.implementation,
        enabled: descriptor.enabled !== false,
        bypass: descriptor.bypass === true,
        params: params,
        channels: { in: impl.channels.in, out: impl.channels.out },
        latencyFrames: impl.latencyFrames,
        tailFrames: impl.tailFrames,
        preferredBlockSize: impl.preferredBlockSize,
        realtimeSafe: impl.realtimeSafe,
        requiresDrain: impl.requiresDrain,
        capabilities: impl.capabilities.slice(),
        branch: descriptor.branch ? String(descriptor.branch) : null,
        state: 'ready',
        failure: null,
        providerId: impl.implementation === 'provider' ? owner.replace(/^provider:/, '') : null
      };

      nodes[id] = node;
      var pos = Number.isInteger(descriptor.position) ? descriptor.position : order.length;
      pos = Math.max(0, Math.min(order.length, pos));
      order.splice(pos, 0, id);

      log('node-added', { id: id, type: type, owner: owner, position: pos });
      changed();
      return { ok: true, node: node };
    }

    function removeNode(id) {
      if (!nodes[id]) return { ok: false, reason: 'not-found' };
      var node = nodes[id];
      delete nodes[id];
      var idx = order.indexOf(id);
      if (idx >= 0) order.splice(idx, 1);
      log('node-removed', { id: id, type: node.type });
      changed();
      return { ok: true, removed: { id: id, type: node.type, owner: node.owner } };
    }

    function moveNode(id, position) {
      if (!nodes[id]) return { ok: false, reason: 'not-found' };
      var from = order.indexOf(id);
      if (from < 0) return { ok: false, reason: 'not-in-order' };
      var to = Math.max(0, Math.min(order.length - 1, Number(position) || 0));
      order.splice(from, 1);
      order.splice(to, 0, id);
      log('node-moved', { id: id, from: from, to: to });
      changed();
      return { ok: true, order: order.slice() };
    }

    function setEnabled(id, enabled) {
      if (!nodes[id]) return { ok: false, reason: 'not-found' };
      nodes[id].enabled = enabled !== false;
      log('node-enabled', { id: id, enabled: nodes[id].enabled });
      changed();
      return { ok: true, node: nodes[id] };
    }

    function setBypass(id, bypass) {
      if (!nodes[id]) return { ok: false, reason: 'not-found' };
      nodes[id].bypass = bypass === true;
      log('node-bypass', { id: id, bypass: nodes[id].bypass });
      changed();
      return { ok: true, node: nodes[id] };
    }

    function setParam(id, name, value) {
      if (!nodes[id]) return { ok: false, reason: 'not-found' };
      nodes[id].params[String(name)] = value;
      log('node-param', { id: id, name: String(name) });
      changed();
      return { ok: true };
    }

    function setBranch(id, branch) {
      if (!nodes[id]) return { ok: false, reason: 'not-found' };
      nodes[id].branch = branch ? String(branch) : null;
      log('node-branch', { id: id, branch: nodes[id].branch });
      changed();
      return { ok: true };
    }

    function setBranchMix(branch, mix) {
      if (!branch) return { ok: false, reason: 'invalid-branch' };
      branchMixes[String(branch)] = {
        gain: numberOr(isPlainObject(mix) ? mix.gain : mix, 1),
        delayFrames: numberOr(isPlainObject(mix) ? mix.delayFrames : 0, 0)
      };
      changed();
      return { ok: true };
    }

    function listNodes() {
      return order.map(function (id) {
        var n = nodes[id];
        return {
          id: n.id, type: n.type, owner: n.owner, name: n.name,
          implementation: n.implementation, enabled: n.enabled, bypass: n.bypass,
          params: JSON.parse(JSON.stringify(n.params)),
          channels: n.channels, latencyFrames: n.latencyFrames, tailFrames: n.tailFrames,
          preferredBlockSize: n.preferredBlockSize, realtimeSafe: n.realtimeSafe,
          requiresDrain: n.requiresDrain, capabilities: n.capabilities.slice(),
          branch: n.branch, state: n.state, failure: n.failure, providerId: n.providerId
        };
      });
    }

    // ── 执行计划 ──────────────────────────────────────────────

    /**
     * 生成执行计划：
     *   - 只有 enabled 且未 bypass 的节点会进入计划；
     *   - 每个节点在计划里恰好出现一次（不存在隐式重复）；
     *   - 相邻且属于同一分支标签的节点，组成一个并行段落（分支 + 混合）；
     *   - 其余节点按加入顺序串联。
     */
    function executionPlan() {
      var steps = [];
      var i = 0;
      while (i < order.length) {
        var node = nodes[order[i]];
        if (!node || !node.enabled || node.bypass) { i++; continue; }

        if (node.branch) {
          // 收集相邻的同一段落里的所有分支节点
          var group = {};
          var groupOrder = [];
          var j = i;
          while (j < order.length) {
            var n2 = nodes[order[j]];
            if (!n2 || !n2.enabled || n2.bypass) { j++; continue; }
            if (!n2.branch) break;
            if (!group[n2.branch]) { group[n2.branch] = []; groupOrder.push(n2.branch); }
            group[n2.branch].push({
              id: n2.id, type: n2.type, owner: n2.owner, name: n2.name,
              implementation: n2.implementation, params: n2.params,
              latencyFrames: n2.latencyFrames, tailFrames: n2.tailFrames
            });
            j++;
          }
          if (groupOrder.length) {
            // 并行段落：延迟取最长分支，其余分支补延迟以对齐
            var maxLatency = 0;
            var maxTail = 0;
            groupOrder.forEach(function (b) {
              var lat = 0;
              var tail = 0;
              group[b].forEach(function (x) { lat += x.latencyFrames; tail += x.tailFrames; });
              if (lat > maxLatency) maxLatency = lat;
              if (tail > maxTail) maxTail = tail;
            });
            steps.push({
              kind: 'parallel',
              latencyFrames: maxLatency,
              tailFrames: maxTail,
              branches: groupOrder.map(function (b) {
                var lat = 0;
                group[b].forEach(function (x) { lat += x.latencyFrames; });
                var mix = branchMixes[b] || { gain: 1, delayFrames: 0 };
                return {
                  id: b,
                  nodes: group[b],
                  latencyFrames: lat,
                  compensationFrames: maxLatency - lat,
                  mixGain: mix.gain
                };
              })
            });
            i = j;
            continue;
          }
        }

        steps.push({
          kind: 'node',
          id: node.id, type: node.type, owner: node.owner, name: node.name,
          implementation: node.implementation, params: node.params,
          latencyFrames: node.latencyFrames, tailFrames: node.tailFrames
        });
        i++;
      }
      return steps;
    }

    /** 计划里实际会执行的节点 id（顺序即执行顺序） */
    function activeNodeIds() {
      var ids = [];
      executionPlan().forEach(function (s) {
        if (s.kind === 'node') ids.push(s.id);
        else s.branches.forEach(function (b) { b.nodes.forEach(function (n) { ids.push(n.id); }); });
      });
      return ids;
    }

    /** 整图延迟（帧）。并行段落取最长分支，并给出其它分支需要补偿的帧数。 */
    function totalLatencyFrames() {
      var total = 0;
      executionPlan().forEach(function (s) { total += s.latencyFrames; });
      return total;
    }

    /** 整图尾音（帧）。串联相加、并行取最长，与延迟同样的算法。 */
    function totalTailFrames() {
      var total = 0;
      executionPlan().forEach(function (s) { total += s.tailFrames; });
      return total;
    }

    /** 需要做尾音处理的节点（停止 / 切歌 / 跳转时必须 drain） */
    function drainNodes() {
      return listNodes().filter(function (n) { return n.enabled && !n.bypass && n.requiresDrain; })
        .map(function (n) { return { id: n.id, type: n.type, tailFrames: n.tailFrames }; });
    }

    // ── 校验 ─────────────────────────────────────────────────

    function validate() {
      var errors = [];
      var warnings = [];
      var seen = {};
      var prev = null;

      executionPlan().forEach(function (step) {
        if (step.kind === 'node') {
          if (seen[step.id]) errors.push('节点重复进入执行计划: ' + step.id);
          seen[step.id] = true;
          if (prev && prev.channels && step.channels && prev.channels.out !== step.channels.in) {
            warnings.push('通道数不匹配: ' + prev.id + '(' + prev.channels.out + ') → ' + step.id + '(' + step.channels.in + ')');
          }
        }
      });

      listNodes().forEach(function (n) {
        if (n.enabled && !n.bypass && !n.realtimeSafe) {
          warnings.push('节点声明为非实时安全: ' + n.id + '（' + n.name + '）');
        }
        if (n.failure) warnings.push('节点处于故障状态: ' + n.id);
      });

      return { ok: errors.length === 0, errors: errors, warnings: warnings };
    }

    // ── Provider ─────────────────────────────────────────────

    function validateManifest(manifest) {
      var errors = [];
      if (!isPlainObject(manifest)) return ['清单必须是对象'];
      if (!String(manifest.id || '').trim()) errors.push('缺少 id');
      if (!String(manifest.name || '').trim()) errors.push('缺少 name');
      if (!String(manifest.version || '').trim()) errors.push('缺少 version');
      if (!Array.isArray(manifest.capabilities) || manifest.capabilities.length === 0) {
        errors.push('capabilities 必须是非空数组');
      } else {
        for (var i = 0; i < manifest.capabilities.length; i++) {
          var cap = manifest.capabilities[i];
          if (!isPlainObject(cap)) { errors.push('capabilities[' + i + '] 必须是对象'); continue; }
          var type = String(cap.type || cap.kind || '').trim();
          if (!type) errors.push('capabilities[' + i + '] 缺少 type');
          else if (!TYPE_SET[type]) errors.push('capabilities[' + i + '] 未知类型: ' + type);
        }
      }
      return errors;
    }

    /**
     * 注册第三方 Provider。
     * 与旧版不同：Provider 之间**不再互斥**，多个 Provider 可以各自贡献同类型实现，
     * 用户加了哪个节点就执行哪个。
     */
    function registerProvider(manifest, api) {
      var errors = validateManifest(manifest);
      if (errors.length) {
        log('provider-rejected', { id: manifest && manifest.id, errors: errors });
        return { ok: false, reason: 'invalid-manifest', errors: errors };
      }
      var id = String(manifest.id).trim();
      if (providers[id]) {
        return { ok: false, reason: 'duplicate-id', errors: ['id 已存在'] };
      }

      var record = {
        id: id, name: manifest.name, version: manifest.version,
        author: manifest.author || '', description: manifest.description || '',
        capabilities: [], api: api || null, enabled: true, state: 'active',
        failure: null, registeredAt: now(), contributed: []
      };
      providers[id] = record;
      providerOrder.push(id);

      // 把清单里的能力登记为「实现」，节点需要时由用户显式加入
      manifest.capabilities.forEach(function (cap) {
        var type = String(cap.type || cap.kind).trim();
        record.capabilities.push(type);
        defineNode({
          type: type,
          owner: 'provider:' + id,
          name: cap.name || (manifest.name + ' · ' + type),
          implementation: 'provider',
          params: cap.params || {},
          channels: cap.channels || { in: 2, out: 2 },
          latencyFrames: numberOr(cap.latencyFrames, 0),
          tailFrames: numberOr(cap.tailFrames, 0),
          realtimeSafe: cap.realtimeSafe !== false,
          capabilities: cap.capabilities || []
        });
      });

      log('provider-registered', { id: id, capabilities: record.capabilities.slice() });
      changed();
      return { ok: true, provider: { id: id, capabilities: record.capabilities.slice() } };
    }

    function unregisterProvider(id, reason) {
      var record = providers[id];
      if (!record) return { ok: false, reason: 'not-found' };

      // 移除由该 Provider 贡献的实现，并摘掉对应的节点
      record.capabilities.forEach(function (type) {
        delete implementations[implKey(type, 'provider:' + id)];
      });
      var removed = [];
      order.slice().forEach(function (nodeId) {
        if (nodes[nodeId] && nodes[nodeId].providerId === id) {
          removeNode(nodeId);
          removed.push(nodeId);
        }
      });
      disableProviderApi(record);
      delete providers[id];
      var idx = providerOrder.indexOf(id);
      if (idx >= 0) providerOrder.splice(idx, 1);
      log('provider-unregistered', { id: id, reason: reason || 'manual', removedNodes: removed });
      changed();
      return { ok: true, removedNodes: removed };
    }

    function disableProviderApi(record) {
      if (!record.api) return;
      try {
        if (typeof record.api.dispose === 'function') record.api.dispose();
      } catch (e) {
        log('provider-dispose-error', { id: record.id, error: String(e && e.message || e) });
      }
    }

    /**
     * Provider 出错：隔离它，把它贡献的节点移出执行计划（改为停用并标记故障），
     * 其它节点完全不受影响 —— 这就是「安全回退」：不是关掉整条链，而是只摘掉坏的那一段。
     */
    function reportFailure(id, error) {
      var record = providers[id];
      if (!record) return { ok: false, reason: 'not-found' };
      record.enabled = false;
      record.state = 'failed';
      record.failure = { at: now(), message: String(error && error.message || error || '未知错误') };

      var affected = [];
      order.slice().forEach(function (nodeId) {
        var n = nodes[nodeId];
        if (n && n.providerId === id) {
          n.enabled = false;
          n.state = 'failed';
          n.failure = record.failure;
          affected.push(nodeId);
        }
      });
      disableProviderApi(record);
      log('provider-failed', { id: id, message: record.failure.message, disabledNodes: affected });
      changed();
      return { ok: true, disabledNodes: affected };
    }

    function setProviderEnabled(id, enabled) {
      var record = providers[id];
      if (!record) return { ok: false, reason: 'not-found' };
      record.enabled = enabled !== false;
      record.state = record.enabled ? 'active' : 'disabled';
      if (!record.enabled) record.failure = null;
      order.forEach(function (nodeId) {
        var n = nodes[nodeId];
        if (n && n.providerId === id) {
          n.enabled = record.enabled;
          n.state = record.enabled ? 'ready' : 'disabled';
          if (record.enabled) n.failure = null;
        }
      });
      changed();
      return { ok: true };
    }

    function guard(id, fn) {
      return function () {
        try {
          return fn.apply(null, arguments);
        } catch (e) {
          reportFailure(id, e);
          return undefined;
        }
      };
    }

    function listProviders() {
      return providerOrder.map(function (id) {
        var r = providers[id];
        return {
          id: r.id, name: r.name, version: r.version, author: r.author,
          description: r.description, enabled: r.enabled, state: r.state,
          failure: r.failure, capabilities: r.capabilities.slice()
        };
      });
    }

    // ── 资源（Resource 不是 DSP） ─────────────────────────────

    function addResource(resource) {
      if (!isPlainObject(resource)) throw new Error('资源必须是对象');
      var id = String(resource.id || '').trim();
      if (!id) throw new Error('资源缺少 id');
      var kind = String(resource.kind || '').trim();
      if (!kind) throw new Error('资源缺少 kind');
      resources[id] = {
        id: id, kind: kind, name: resource.name || id,
        bytes: numberOr(resource.bytes, 0),
        sampleRate: numberOr(resource.sampleRate, 0),
        channels: numberOr(resource.channels, 0),
        frames: numberOr(resource.frames, 0),
        createdAt: resource.createdAt || now(),
        source: resource.source || 'local',
        data: resource.data === undefined ? null : resource.data
      };
      log('resource-added', { id: id, kind: kind });
      changed();
      return resources[id];
    }

    function removeResource(id) {
      if (!resources[id]) return { ok: false, reason: 'not-found' };
      delete resources[id];
      log('resource-removed', { id: id });
      changed();
      return { ok: true };
    }

    function listResources(kind) {
      var out = [];
      for (var k in resources) {
        if (!Object.prototype.hasOwnProperty.call(resources, k)) continue;
        if (kind && resources[k].kind !== kind) continue;
        var r = resources[k];
        out.push({
          id: r.id, kind: r.kind, name: r.name, bytes: r.bytes,
          sampleRate: r.sampleRate, channels: r.channels, frames: r.frames,
          createdAt: r.createdAt, source: r.source
        });
      }
      return out;
    }

    // ── 快照 / 事件 ──────────────────────────────────────────

    function snapshot() {
      return {
        nodes: listNodes(),
        plan: executionPlan(),
        activeNodeIds: activeNodeIds(),
        totalLatencyFrames: totalLatencyFrames(),
        totalTailFrames: totalTailFrames(),
        drainNodes: drainNodes(),
        providers: listProviders(),
        resources: listResources(),
        implementations: listImplementations()
      };
    }

    var host = {
      TYPES: TYPES.slice(),
      IMPLEMENTATIONS: IMPLEMENTATIONS.slice(),

      // 实现层
      defineNode: defineNode,
      listImplementations: listImplementations,

      // 节点层
      addNode: addNode,
      removeNode: removeNode,
      moveNode: moveNode,
      setEnabled: setEnabled,
      setBypass: setBypass,
      setParam: setParam,
      setBranch: setBranch,
      setBranchMix: setBranchMix,
      listNodes: listNodes,

      // 图谱层
      executionPlan: executionPlan,
      activeNodeIds: activeNodeIds,
      totalLatencyFrames: totalLatencyFrames,
      totalTailFrames: totalTailFrames,
      drainNodes: drainNodes,
      validate: validate,

      // Provider
      registerProvider: registerProvider,
      unregisterProvider: unregisterProvider,
      setProviderEnabled: setProviderEnabled,
      reportFailure: reportFailure,
      guard: guard,
      listProviders: listProviders,

      // 资源
      addResource: addResource,
      removeResource: removeResource,
      listResources: listResources,

      snapshot: snapshot,
      events: function () { return events.slice(); }
    };

    return host;
  }

  var api = { createDspHost: createDspHost, TYPES: TYPES };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.RlonDspHost = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
