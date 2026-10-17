# RlonDSP 实时音效专项审计

日期：2026-09-14  
范围：`实时音效`弹出面板、`src/index.html`、`src/renderer.js`、`src/dsp-worklet.js`、`src/dsp-host.js`  
结论：**FAIL**（未修改代码，仅记录问题）

## 审计方法

- 静态检查：UI 控件 ID、范围、默认值、step、state 映射、DSP 参数使用点。
- 运行时检查：独立 Electron 实例 + CDP，实际点击/修改控件并读取 `state.effects`、`__dspHost.executionPlan()`、设置文件和 Worklet 参数状态。
- 自动测试：`node --test tools/tests/*.test.js`，78 / 78 通过。
- 微基准：Audio Event + Motion Field 600 帧约 19.11 ms，约 0.032 ms/帧（非音频处理线程 `process()` 基准）。

## 问题统计

- 总数：13
- P0：0
- P1：4
- P2：9

## P1 问题

### P1-01 Spatial / 空间感 `surroundRoom` 未进入 DSP

- 效果器：Spatial（虚拟环绕）
- 参数/滑杆：`surroundRoom`（空间感）
- 问题类型：UI 参数存在但 DSP 未使用
- 实际现象：滑杆会写入 `state.effects.surround.roomSize`，但 DSP 的 `stageSpatial` 只读取 `surroundCross`（来自 `crossfeed`）以及 `width/depth/center`；单独移动“空间感”不会改变声音。
- 源码位置：
  - `src/renderer.js:1767`
  - `src/renderer.js:1904`
  - `src/dsp-worklet.js:733`
  - `src/dsp-worklet.js:1223`
- 严重等级：P1
- 是否旧问题：本次审计新发现（V7/V8 DSP 扩展后遗留）
- 当前状态：未修复，记录

### P1-02 Preset 加载后 DSP Graph 未同步

- 效果器：Preset / 全部 DSP
- 参数/滑杆：Preset 开关、Preset 应用
- 问题类型：状态恢复错误
- 实际现象：运行时构造一个启用 Reverb 的 Preset 并加载后，UI/state 显示 Reverb 已启用，但 `__dspHost.executionPlan()` 仍只有 `limiter`，Reverb 没有进入 AudioWorklet 执行计划。
- 复现结果：`before=["limiter"]`，加载含 Reverb Preset 后 `after=["limiter"]`，`containsReverb=false`。
- 源码位置：
  - `src/renderer.js:2372` `applyPreset`
  - 缺少 `syncDspGraph()` 调用；之后只调用 `sendDSPParams()`
- 严重等级：P1
- 是否旧问题：旧问题（既有代码，本次再次确认）
- 当前状态：未修复，记录

### P1-03 旧 Preset 缺少新增高级参数时出现 NaN/状态污染

- 效果器：Preset / Compressor、Reverb、Bass、Stereo、Gate、Limiter、Clarity、Tube、Spatial、EQ
- 参数/滑杆：所有 V7/V8 新增高级参数
- 问题类型：状态恢复错误 / 参数值被错误覆盖
- 实际现象：加载只包含旧字段的 Compressor Preset 后，`state.effects.compressor.knee` 为 `undefined`，对应 UI 显示为 `NaN dB`；后续参数修改会把无效值重新写回。
- 源码位置：
  - `src/renderer.js:2372` `applyPreset`
  - `src/renderer.js:2373-2376` 使用浅层 `Object.assign`，没有对嵌套参数做默认值深合并
- 严重等级：P1
- 是否旧问题：新问题（V7/V8 参数扩展后暴露）
- 当前状态：未修复，记录

### P1-04 Gate `hysteresis` 未参与门限判定

- 效果器：Gate（降噪）
- 参数/滑杆：`gateHysteresis`（迟滞）
- 问题类型：UI 参数存在但 DSP 未使用
- 实际现象：`NoiseGate.update()` 计算了 `closeThresholdLin`，但 `stageGate()` 只使用 `thresholdLin` 判断开关；单独改变 hysteresis 不改变门限行为。
- 源码位置：
  - `src/dsp-worklet.js:336` 计算 `closeThresholdLin`
  - `src/dsp-worklet.js:1387-1404` 未使用 `closeThresholdLin`
  - `src/renderer.js:770` UI 映射到 `fx.gate.hysteresisDB`
- 严重等级：P1
- 是否旧问题：新问题（新增参数未完整接入）
- 当前状态：未修复，记录

## P2 问题

### P2-01 Limiter `lookahead` 无法设为 0

- 参数：`limiterLookahead`
- UI 范围：`min=0.5, max=10, step=0.5`
- DSP 范围：`clampNum(..., 0, 20, 2)`
- 实际现象：DSP 支持 0，但 UI 最小值为 0.5，用户无法测试 0 值。
- 源码位置：`src/index.html:322`、`src/dsp-worklet.js:761`
- 严重等级：P2
- 是否旧问题：范围设计问题
- 当前状态：未修复，记录

### P2-02 Dynamic EQ `range=0` 被 DSP 改成 0.1

- 参数：`dynEqRange`
- UI 范围：`min=0`
- DSP 范围：`clampNum(dq.range, 0.1, 24, 12)`
- 实际现象：滑杆设为 0 时，DSP 实际使用 0.1，0 值不精确。
- 源码位置：`src/index.html` Dynamic EQ 区域、`src/dsp-worklet.js:887`
- 严重等级：P2
- 是否旧问题：新问题（参数扩展后范围不一致）
- 当前状态：未修复，记录

### P2-03 Tube `drive=0` 仍非透明

- 参数：`tubeDrive`
- UI 范围：`min=0`
- DSP 映射：`tubeDrive = 1 + drive * 2`
- 实际现象：drive 为 0 时仍以 `d=1` 执行 `Math.tanh()`，效果器启用且 mix=1 时并非干声透明。
- 源码位置：`src/dsp-worklet.js:746`、`src/dsp-worklet.js:1249`
- 严重等级：P2
- 是否旧问题：旧问题（既有映射）
- 当前状态：未修复，记录

### P2-04 Limiter `oversampling` 单独调整无效果

- 参数：`limiterOversample`
- 实际现象：`limOversample` 只在 `truePeak=true` 时参与检测；单独改 oversampling 不会改变声音。
- 源码位置：`src/dsp-worklet.js:754-755`、`src/dsp-worklet.js:1615`
- 严重等级：P2
- 是否旧问题：新问题（参数依赖关系不直观）
- 当前状态：未修复，记录

### P2-05 Preset / Reset 未刷新 IR Web Audio 图

- 参数：IR / Convolution 相关参数
- 实际现象：`applyPreset()` 和 `resetEffects()` 只调用 `applyEffectsToUI()` 与 `sendDSPParams()`，没有调用 `updateIRGraph()`；IR 的 dry/wet、predelay、滤波可能保持旧状态。
- 源码位置：`src/renderer.js:2158-2161`、`src/renderer.js:2372-2378`、`src/renderer.js:2509`
- 严重等级：P2
- 是否旧问题：旧问题
- 当前状态：未修复，记录

### P2-06 Reset 后 DSP Graph Plan 仍是旧计划

- 参数：Reset
- 实际现象：Reset 后 UI/state 回到默认，但 `__dspHost.executionPlan()` 仍是 Reset 前的节点列表；当前主要被 `enabled` 参数兜底，部分节点不会实际处理，但 Graph 状态不一致。
- 复现结果：Reset 前 `["reverb","limiter"]`，Reset 后仍为 `["reverb","limiter"]`。
- 源码位置：`src/renderer.js:2158-2161`
- 严重等级：P2
- 是否旧问题：旧问题
- 当前状态：未修复，记录

### P2-07 高级参数 select 选项不随语言切换刷新

- 参数：`compAutoRelease`、`limiterTruePeak`、`limiterSoftClip`、`limiterAutoRelease`、`tubeOversample`、`limiterOversample`、EQ Filter Type 等
- 实际现象：动态生成的 option 文本使用构建时的 `t()` 值，没有 `data-i18n`；切换中英文后选项文字保持旧语言。
- 源码位置：`src/renderer.js` `buildAdvancedEffectControls()` / `buildEqAdvancedControls()`，`src/renderer.js:1159-1165` `applyLanguage()`
- 严重等级：P2
- 是否旧问题：新问题
- 当前状态：未修复，记录

### P2-08 参数更新在音频线程存在分配

- 参数：所有通过 `params` 消息更新的 DSP 参数
- 实际现象：`applyParams()` 中多次 `Array.from`、对象展开和 `new Float32Array`，参数快速变化时可能在音频线程产生 GC 抖动。
- 源码位置：`src/dsp-worklet.js:540-660`、`src/dsp-worklet.js:714`
- 严重等级：P2
- 是否旧问题：既有结构问题，V7/V8 参数扩展后放大
- 当前状态：未修复，记录

### P2-09 True Peak 过采样为线性插值近似

- 参数：`limiterTruePeak`、`limiterOversample`
- 实际现象：当前实现只在当前/上一样点之间做线性插值取峰值，没有完整抗混叠/多相 oversampling 滤波器；参数可用，但不等于专业 True Peak 检测。
- 源码位置：`src/dsp-worklet.js:1603-1661`
- 严重等级：P2
- 是否旧问题：新问题（算法精度限制）
- 当前状态：未修复，记录

## 已修复问题回归

以下旧问题在本轮自动测试中重新验证通过：

- Reverb `wet=0` 不再被默认值覆盖。
- Limiter `ceilingDB=0` 有效。
- Noise Gate 音频线程不再逐采样创建临时对象。
- Dynamic EQ Range 进入动态增益归一化。
- Clipper Soft 模式阈值附近连续过渡。
- AudioWorklet `process` 阶段没有动态箭头函数 / `new Float32Array` 回归。
- DSP V7 整合包新增测试 10/10 通过，Visual Engine V8 新增测试 3/3 通过。

## 自动测试结果

- `node --test tools/tests/*.test.js`：78 / 78 通过。
- 运行时总开关验证：OFF 时 `activeNodeIds=0`，ON 时恢复为 1；SVG、`aria-pressed` 同步。
- 设置持久化验证：关闭总开关后 `settings.json` 写入 `effectsMasterEnabled:false`。
- 未发现 NaN / Infinity 出现在正常参数路径；未发现崩溃。

## 已知限制

- 本轮未对每个单参数做独立听感 A/B 试听，仅完成静态映射、运行时状态验证和既有 DSP 自动测试回归。
- Preset/Reset 的两个 Graph 同步问题已通过运行时复现确认。
