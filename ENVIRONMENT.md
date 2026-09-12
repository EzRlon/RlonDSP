# 开发环境说明

本文说明 RlonDSP 的构建与调试环境要求。所有工具均为通用工具，不依赖任何本机专属路径。

---

## 一、必需工具

| 工具 | 版本要求 | 用途 |
| :--- | :--- | :--- |
| Node.js | 18 及以上 | 运行开发脚本、执行打包 |
| npm | 随 Node.js 提供 | 安装依赖、执行 npm 脚本 |
| Windows 10 / 11 x64 | — | 目标平台；打包产物仅面向 Windows |

## 二、可选工具

| 工具 | 用途 |
| :--- | :--- |
| Python 3.10+ | 运行 `tools/` 下的辅助脚本（图标生成、PE 修补、资源清理、品牌扫描） |
| 7-Zip | 生成便携版压缩包的自解压外壳 |
| GitHub CLI（`gh`） | 发布 Release、管理仓库 |
| Git | 版本控制 |

## 三、安装与启动

```bash
npm install          # 安装开发依赖
npm start            # 启动调试
npm run dist:portable  # 打包便携版
npm run dist:nsis      # 打包安装包
```

> 程序运行不需要 Node.js 与 npm；二者仅在开发、构建与打包阶段使用。

## 四、目录约定

| 路径 | 说明 |
| :--- | :--- |
| `src/` | 渲染进程源码（界面、DSP、脉冲反馈、歌词） |
| `assets/` | 应用图标与托盘图标 |
| `tools/` | 构建、打包、检查、测试脚本 |
| `docs/` | 文档与截图 |
| `vendor/echomusic/` | 上游 Echomusic 参考源码与原生音频模块 |
| `build/` | 本地临时目录（不入版本库） |
| `release/` | 打包产物目录（不入版本库） |

## 五、调试方式

程序支持通过 Chromium 调试端口进行界面状态检查：

```bash
# 以调试端口启动
RlonDSP.exe --remote-debugging-port=9233 --remote-allow-origins=*

# 在另一个终端中查看可调试目标
curl http://127.0.0.1:9233/json/list
```

配合 `tools/dev_eval.js` 可在运行中的窗口内执行表达式，便于验证界面状态与参数绑定：

```bash
node tools/dev_eval.js <调试目标地址> "<表达式>"
```

## 六、参考项目

本项目基于 [Echomusic](https://github.com/hoowhoami/EchoMusic) 分支改造。上游参考源码保存在 `vendor/echomusic/`，其中包含：

| 目录 | 内容 |
| :--- | :--- |
| `vendor/echomusic/app-src/` | 上游项目的构建产物与源码快照，**仅作参考留存，不参与本项目的构建与运行** |
| `vendor/echomusic/runtime/` | 上游运行时资源与原生音频模块（体积较大，按需在本地准备，不入版本库） |

> 上游的版权声明、作者信息与许可证文件均完整保留，不得删除或修改。

## 七、网络说明

- 程序运行**全程离线**，不发起任何网络请求，不接入云端 API。
- 仅 `npm install` 与 `gh` 相关命令需要网络。

---

<div align="center">

最后更新：2026-09-13

</div>
