# RlonDSP V7 DSP 优化交付报告

## 本次实际修改

- `src/dsp-worklet.js`
  - Unified DSP Graph 的 serial execution plan 现在会真正驱动 AudioWorklet 内置 DSP 的执行顺序。
  - Reverb 改为 L/R 两个独立 FDN 状态，避免左右内部状态串扰。
  - Reverb 最大延迟/Predelay 缓冲一次分配，运行期调整有效长度，减少实时内存重新分配。
  - 修复 Reverb `wet=0`、`predelay=0`、`damping=0` 等 0 值被默认值覆盖的问题。
  - 修复 Limiter `ceilingDB=0`、lookahead/release 等 0/非法值解析问题。
  - Noise Gate 去除逐采样对象返回，改为直接更新标量状态。
  - Dynamic EQ Range 真正参与动态增益归一化。
  - Clipper Soft 模式改为连续阈值过渡，避免阈值附近的突变。
  - 多段压缩实时路径去除逐采样临时数组。
  - DSP stage 实时路径不再创建闭包/临时 TypedArray。

- `package.json`
  - 将项目 license 元数据统一为 `GPL-3.0-only`，与仓库 `LICENSE` 和 README 当前声明一致。

- `tools/tests/dsp-v7-optimization.test.js`
  - 新增 V7 优化验证：Graph 顺序、Reverb L/R 独立状态、0 值参数、Noise Gate 分配、Dynamic EQ Range、Clipper 连续性等。

## 已完成的本地验证

### JavaScript 语法

- `src/dsp-worklet.js` PASS
- `src/dsp-host.js` PASS
- `src/renderer.js` PASS

### DSP / Graph 自动化测试

- 原有 `dsp-engine.test.js` PASS
- 原有 `dsp-host.test.js` PASS
- 新增 `dsp-v7-optimization.test.js` PASS
- 总计 53 项自动化测试 PASS

## 尚未在本环境完成

- Windows Electron 真机播放测试
- Windows AudioWorklet 实时音频回放长时间压力测试
- Release/portable 安装包重新构建

原因：当前交付环境不是 Windows，上传源码包中也没有可直接启动的 `release\\RlonDSP-portable\\RlonDSP.exe`。

因此本报告不会把“Windows 真机 PASS”伪装成已经完成。

## 重要边界

当前 AudioWorklet 已支持由 Graph 驱动的串行内置 DSP 节点执行。
`parallel` branch 仍未在 AudioWorklet 中实现；收到 parallel plan 时会安全拒绝该计划并回退到原有串行路径，而不是悄悄改变 branch 语义。

当前 renderer 默认图谱没有创建 parallel branch，因此不会影响现有正常播放链路。

## 建议的 Windows 最终验收

在 Windows 项目根目录执行：

```text
npm install
node --check src/dsp-worklet.js
node --test tools/tests/*.test.js
npm start
```

然后使用真实音乐完成：

1. 播放
2. 单独启用每个 DSP
3. 同时启用多个 DSP
4. 改变 DSP 顺序并听取变化
5. 开启/关闭 Reverb、Delay、Chorus、Flanger
6. 快速拖动参数，确认无爆音/明显卡顿
7. 反复播放、暂停、切歌、跳转
8. 长时间播放，观察是否出现破音、停顿、崩溃
