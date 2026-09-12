# RlonDSP 开发环境

## 当前工具链

- Node.js: `C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`
- pnpm: `C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd`
- Python: `C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
- 7-Zip: `C:\Program Files\7-Zip\7z.exe`
- Windows 编译：`C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe`

## 参考项目

- EchoMusic 安装包：`C:\Users\Administrator\AppData\Local\echo-music-updater\pending\EchoMusic-2.3.2-beta.3-Windows-Setup-x64.exe`
- EchoMusic 参考源码：`vendor\echomusic\app-src`
- EchoMusic app.asar：`vendor\echomusic\runtime\resources\app.asar`

## 本项目结构

- `main.js`：Electron 主进程
- `preload.js`：主窗口预加载桥接
- `lyrics-preload.js`：桌面歌词窗口预加载桥接
- `src`：渲染进程、AudioWorklet DSP、界面
- `assets`：图标资源
- `tools`：打包、图标/版本修补、asar 解包、环境检查脚本
- `release`：绿色版、安装版成品

## 打包工具

- `tools/asar_extract.py`：读取 Electron asar
- `tools/patch_pe.py`：替换 exe 版本信息字符串
- `tools/IconPatcher.exe`：替换 exe 图标
- `tools/prune_node_modules.py`：裁剪应用依赖
- `tools/make_icons.py`：生成图标
- `tools/scan_branding.py`：扫描残留品牌字符串

## 可用技能

当前会话可用技能包括：computer-use、visualize、documents、pdf、presentations、spreadsheets、imagegen、plugin-creator、skill-creator、skill-installer、template-creator、openai-docs。

本阶段以 Electron/Web Audio 开发为主，暂不需要额外安装技能。如需自动化控制 Windows 窗口或浏览器做交互验证，可调用 computer-use 技能。

## 备注

- 当前环境网络受限，下载依赖需要额外授权。
- 最终程序必须保持纯本地播放器定位，不接入 EchoMusic 的在线音乐 API。
