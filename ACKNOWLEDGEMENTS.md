# 开源引用与鸣谢

RlonDSP 建立在众多优秀开源项目之上。本文件分为两部分：

- **Attribution（必需署名）**：本项目实际使用或派生于的第三方组件，逐一标注名称、链接、许可证与用途。
- **Thanks（致谢）**：对灵感来源、社区与贡献者的感谢。

> 本文件为必需署名的集中说明。各组件更详细的许可证条款条款见其官方仓库与分发目录内的 `LICENSE` 文件。

---

## 一、Attribution（必需署名）

### 1. 上游项目

#### Echomusic

| 项目 | 内容 |
| :--- | :--- |
| 名称 | Echomusic |
| 作者 | hoowhoami |
| 仓库 | https://github.com/hoowhoami/EchoMusic |
| 许可证 | **GPL-3.0-only** |
| 用途 | 本项目的分支来源。提供音频播放管线、原生音频模块、音效 DSP 框架与预设体系的参考实现 |
| 引用形式 | 参考源码保留于 `vendor/echomusic/`；成品中的音频播放与音效框架源自上游 |

RlonDSP 是 Echomusic 的分支作品，非官方修改版。上游的版权声明、作者信息与许可证在项目的任何分发形式中均完整保留，未被删除或修改。详见 [NOTICE](NOTICE) 与 [NOTICE-RlonDSP](NOTICE-RlonDSP)。

由于上游原生音频模块以 **GPL-3.0-only** 分发，RlonDSP 作为衍生作品同样以 GPL-3.0-only 发布。

#### dsp-ir-1200

| 项目 | 内容 |
| :--- | :--- |
| 名称 | RLONMUSIC DSP-IR 1200 |
| 作者 | EzRlon |
| 仓库 | https://github.com/EzRlon/dsp-ir-1200 |
| 许可证 | GPL-3.0 |
| 用途 | 脉冲反馈模块的 13 级 DSP 处理链参考实现（9 段 EQ / 压缩器 / 超级低音 / 3D 环绕 / 耳机环绕 / 清晰度 / 超声波滤波 / 胆机模拟 / FDN 混响 / 峰值归一化 / WAV 导出） |
| 引用形式 | 依据上游许可证迁移 DSP 处理逻辑并集成至 `src/ir-generator.js` 与 `src/ir-studio.html` |

### 2. 运行时与框架

#### Electron

| 项目 | 内容 |
| :--- | :--- |
| 名称 | Electron |
| 版本 | 43.6.0（Chromium 150） |
| 官网 | https://www.electronjs.org/ |
| 仓库 | https://github.com/electron/electron |
| 许可证 | MIT |
| 用途 | 桌面应用运行时：窗口、托盘、菜单、全局快捷键、IPC |

Copyright © Electron contributors. 许可证全文随成品分发于 `LICENSE.electron.txt`。

#### Chromium

| 项目 | 内容 |
| :--- | :--- |
| 名称 | Chromium |
| 版本 | 150 |
| 官网 | https://www.chromium.org/ |
| 许可证 | BSD-3-Clause 及若干第三方许可证 |
| 用途 | 渲染引擎；Canvas 2D、CSS 合成、Web Audio API 的底层实现 |

完整第三方许可证清单随成品分发于 `LICENSES.chromium.html`。

#### FFmpeg

| 项目 | 内容 |
| :--- | :--- |
| 名称 | FFmpeg（Electron 内置构建） |
| 官网 | https://ffmpeg.org/ |
| 许可证 | LGPL-2.1-or-later（Electron 分发版本） |
| 用途 | 媒体解码：MP3 / FLAC / WAV / OGG / M4A / AAC 等格式的音源解码 |
| 引用形式 | 以 `ffmpeg.dll` 形式随 Electron 运行时分发，未单独修改或重新编译 |

> 本项目未调用任何外部 FFmpeg 命令行程序，音频解码完全在 Electron 运行时内部完成。

### 3. 功能依赖

#### music-metadata

| 项目 | 内容 |
| :--- | :--- |
| 名称 | music-metadata |
| 版本 | ^11.0.0 |
| 作者 | Borewit |
| 仓库 | https://github.com/Borewit/music-metadata |
| 许可证 | MIT |
| 用途 | 解析本地音频文件的标签、封面、时长、采样率、比特率等技术元数据 |

#### electron-builder

| 项目 | 内容 |
| :--- | :--- |
| 名称 | electron-builder |
| 版本 | ^26.0.12 |
| 官网 | https://www.electron.build/ |
| 仓库 | https://github.com/electron-userland/electron-builder |
| 许可证 | MIT |
| 用途 | 便携版与安装包的构建、打包与图标嵌入 |

#### 7-Zip（打包辅助）

| 项目 | 内容 |
| :--- | :--- |
| 名称 | 7-Zip |
| 官网 | https://www.7-zip.org/ |
| 许可证 | LGPL-2.1-or-later（含 unRAR 限制条款） |
| 用途 | 生成便携版压缩包与安装包自解压外壳，**仅用于构建阶段**，不随程序分发 |

### 4. 前端依赖说明

RlonDSP 的界面层**未使用任何第三方前端框架、UI 组件库或 CSS 框架**，全部由原生 HTML / CSS / JavaScript 实现，因此不存在相关署名义务。

`vendor/echomusic/app-src/` 目录下保留的是上游 Echomusic 的参考源码快照，其中包含的上游项目自有的前端依赖（如 Vue、Vite 等）**仅作参考留存，不参与 RlonDSP 的构建与运行**。这些依赖的许可证归属与上游项目保持一致。

---

## 二、Thanks（致谢）

### 设计灵感

- **Apple Human Interface Guidelines — Liquid Glass 材质体系**：RlonDSP 的玻璃材质分级、同心圆角、动态高光与光线折射感，均受到 Apple 液态玻璃设计语言的启发。本项目为独立实现，与 Apple Inc. 无任何隶属或合作关系。
- **专业音频仪表设计惯例**：频谱分析仪、示波器、极坐标声场、LUFS 响度表、相位相关度表等可视化形态，参考了专业音频工作站与硬件机架仪表的通行表达方式（如 FL Studio、iZotope、FabFilter 等产品的界面语言）。

### 开源社区

- 感谢 **Electron、Chromium、Web Audio 工作组** 为桌面端实时音频处理提供了稳定基础。
- 感谢 **Echomusic 项目及其贡献者** 开源了完整的本地音频播放与音效框架。
- 感谢 **music-metadata** 项目作者 Borewit 及其贡献者，让本地音乐库的元数据解析变得简单可靠。
- 感谢 **dsp-ir-1200** 项目，为脉冲响应生成提供了清晰的 DSP 处理链参考。
- 感谢所有在公开渠道分享音频 DSP 算法、可视化实现与界面设计经验的开发者。

### 贡献者

<!-- 欢迎在此处添加你的名字 -->

- RlonDSP 主要作者：**EzRlon**
- 上游 Echomusic 作者与贡献者：**hoowhoami** 及 Echomusic 社区
- 项目贡献者：_虚位以待_

> 如果你的工作被本项目使用但未被列出，请提交 Issue，我们会尽快补充署名。

---

## 三、合规声明

1. 本项目的所有音频处理均在本地完成，**不接入任何云端 API，不上传任何音频或用户数据**。
2. 上游项目的版权声明、作者信息与许可证文件在任何分发形式中均完整保留。
3. 本项目未修改上游源码中的版权声明与许可证条款。
4. 若您再分发本项目，请遵守 GPL-3.0-only 的相关条款，并同样保留上游署名。

<div align="center">

最后更新：2026-09-13

</div>
