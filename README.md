# RlonDSP

RlonDSP 是一款基于 [Echomusic](https://github.com/hoowhoami/EchoMusic) 开源项目分支改造的 Windows 本地实时音效音频播放器，提供专业级实时音效处理与高精度频谱可视化。

## 产品定位

- 纯本地音频播放
- 实时音效处理
- 频谱与波形可视化
- 桌面歌词、系统托盘、全局快捷键

## 运行方式

绿色版：

1. 解压 `RlonDSP-1.0.0-portable-x64.zip`
2. 双击 `RlonDSP.exe`

无需安装，无需配置。

## 主要能力

- 支持 MP3、FLAC、WAV、OGG、M4A 等常见本地音频格式
- 文件夹导入、拖拽导入、播放列表搜索与排序
- 均衡器、压缩、混响、低音增强、立体声增强、虚拟环绕、胆机模拟、降噪、限幅
- IR 脉冲响应卷积模块
- FFT 频谱、波形、峰值、RMS、相位等信息显示
- 深色/浅色主题、中文/英文切换
- 播放列表、收藏、历史、音效预设本地持久化

## 项目结构

- `main.js`：Electron 主进程
- `preload.js`：主窗口预加载桥接
- `src`：渲染进程与 AudioWorklet DSP
- `tools`：构建、打包、检查脚本
- `vendor/echomusic`：上游 Echomusic 参考源码与原生音频模块
- `release`：绿色版与安装版成品

## 上游项目

本项目基于 Echomusic 开源项目分支改造。

- 上游项目：Echomusic
- 原作者/团队：hoowhoami
- 仓库地址：https://github.com/hoowhoami/EchoMusic
- 核心音频播放与音效框架源自 Echomusic，在此向原项目贡献者致以诚挚感谢。

## 许可证

本项目遵循 GPL-3.0-only，与上游 Echomusic 许可证保持兼容。详见 [LICENSE](LICENSE)。

## 致谢

感谢所有开源项目、贡献者与社区的支持。
