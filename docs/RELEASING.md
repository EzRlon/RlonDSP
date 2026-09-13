# 发布流程

## 版本更新（应用内「设置 → 版本更新」）与发布的关系

应用内的更新检查读取的是 **GitHub 的正式 Release**（`releases/latest`），
因此每次发版都要遵守下面两条，更新系统才能正常工作：

1. **版本号必须递增**（`v1.0.0` → `v1.1.0` …）。应用用语义化版本比较，
   同版本或更旧版本不会提示更新，也绝不会提示降级。
2. **必须上传安装包**，文件名保持现有约定：
   - `RlonDSP-<版本>-setup-x64.exe`（已安装版用它自动升级）
   - `RlonDSP-<版本>-portable-x64.zip`（便携版下载入口）

### 可选但推荐：附上校验文件

在 Release 里额外上传一个 `SHA256SUMS.txt`，内容形如：

```
<64 位 SHA-256>  RlonDSP-1.1.0-setup-x64.exe
<64 位 SHA-256>  RlonDSP-1.1.0-portable-x64.zip
```

应用下载完更新包后会比对这份摘要；**校验不通过会直接停止更新**。
没有这个文件时，应用仍会计算并显示更新包的 SHA-256，但无法与官方值比对。

生成命令（项目根目录）：

```powershell
Get-FileHash release\RlonDSP-1.1.0-setup-x64.exe -Algorithm SHA256 |
  ForEach-Object { "$($_.Hash.ToLower())  RlonDSP-1.1.0-setup-x64.exe" } |
  Set-Content release\SHA256SUMS.txt -Encoding ascii
```

本文说明如何为 RlonDSP 构建、打包并发布一个新版本。

---

## 一、版本号规范

版本号采用语义化版本 `主版本.次版本.修订号`：

| 变更类型 | 版本位 | 示例 |
| :--- | :--- | :--- |
| 不兼容的功能变更或架构调整 | 主版本 | `1.0.0 → 2.0.0` |
| 向后兼容的新功能 | 次版本 | `1.0.0 → 1.1.0` |
| 向后兼容的缺陷修复 | 修订号 | `1.0.0 → 1.0.1` |

发布新版本时必须同步修改以下位置，保证版本号一致：

1. `package.json` 的 `version` 字段；
2. `CHANGELOG.md` 新增对应条目；
3. 打包产物文件名（由 electron-builder 的 `artifactName` 自动生成）。

## 二、发布前检查清单

- [ ] 所有改动已提交，工作区干净；
- [ ] `node --check` 通过（`main.js`、`preload.js`、`src/*.js`）；
- [ ] 冒烟测试通过：`node --test tools/tests/smoke.test.js`（应为 4/4 通过）；
- [ ] 手动验证：播放/暂停、切歌、进度、音量、主题切换、语言切换均正常；
- [ ] 手动验证：播放时 10 路可视化全部动起来，暂停时保持最后一帧；
- [ ] 手动验证：实时音效与脉冲反馈弹窗可正常开关并调节参数；
- [ ] 无新增控制台报错；
- [ ] `CHANGELOG.md` 已更新；
- [ ] 上游版权与许可证文件（`NOTICE`、`NOTICE-RlonDSP`、`vendor/echomusic/` 内的许可证）完整未改动；
- [ ] 成品中无旧品牌残留（可运行 `tools/scan_branding.py` 检查）；
- [ ] `docs/images/` 截图与当前界面一致。

## 三、构建步骤

```bash
# 1. 安装依赖
npm install

# 2. 语法检查
node --check main.js
node --check preload.js
node --check src/renderer.js

# 3. 运行冒烟测试
node --test tools/tests/smoke.test.js
```

### 打包方式

RlonDSP 的正式发布包使用 **7-Zip 自解压（SFX）方案**制作，不依赖 electron-builder 的 NSIS 流程。完整的打包配方、逐步命令与验证方法见 **[tools/installer/README.md](../tools/installer/README.md)**。

配方所需的全部文件已长期保存在 `tools/installer/`：

| 文件 | 用途 |
| :--- | :--- |
| `sfx-config.bin` | 自解压外壳配置（标题、提示语、安装后运行 `setup.cmd`） |
| `setup.cmd` / `setup.ps1` | 安装逻辑：复制到用户目录、创建快捷方式、生成卸载程序 |
| `VersionPatcher.cs` / `VersionPatcher.exe` | 把安装包的文件属性改写为 RlonDSP |

`package.json` 中仍保留 electron-builder 的配置（`npm run dist:portable` / `dist:nsis`），可作为替代打包途径，但**发布到 GitHub Release 的产物以 SFX 配方为准**。

## 四、同步发布目录

本项目采用"源码 + 成品副本"的结构：成品运行时直接读取 `release/RlonDSP-portable/resources/app/` 下的源码副本。因此**修改源码后必须同步该副本**，否则打包出的程序仍是旧代码。

需要同步的文件：

| 源文件 | 目标 |
| :--- | :--- |
| `main.js` | `release/RlonDSP-portable/resources/app/main.js` |
| `preload.js` | `release/RlonDSP-portable/resources/app/preload.js` |
| `lyrics-preload.js` | `release/RlonDSP-portable/resources/app/lyrics-preload.js` |
| `package.json` | `release/RlonDSP-portable/resources/app/package.json` |
| `src/**/*` | `release/RlonDSP-portable/resources/app/src/**/*` |
| `assets/**/*` | `release/RlonDSP-portable/resources/app/assets/**/*` |
| `LICENSE`、`NOTICE`、`NOTICE-RlonDSP` | `release/RlonDSP-portable/` 根目录 |

同步完成后必须启动程序确认界面无异常，再执行打包。

## 五、图标与版本信息

主程序 exe 的图标与版本信息通过辅助工具写入：

| 步骤 | 工具 | 说明 |
| :--- | :--- | :--- |
| 生成图标 | `tools/make_icons.py` | 由脚本生成 `assets/icon.ico`、`icon.png`、托盘图标 |
| 嵌入图标 | `tools/IconPatcher.exe` | 将图标写入主程序 exe 的资源段 |
| 修补版本信息 | `tools/patch_pe.py` | 修改 exe 中的产品名、版本号、版权字段 |
| 品牌残留扫描 | `tools/scan_branding.py` | 检查成品中是否残留旧品牌字符串 |

## 六、发布到 GitHub

1. 确认版本号、构建产物与文档均已就绪；
2. 提交并推送源码；
3. 创建并推送标签；
4. 创建 Release 并上传便携版与安装包；
5. 检查 Release 页面的标题、说明、附件名称与大小。

对应命令：

```bash
git add -A
git commit -m "chore: release v1.0.0"
git push origin main

git tag -a v1.0.0 -m "RlonDSP v1.0.0"
git push origin v1.0.0

gh release create v1.0.0 \
  "release/RlonDSP-1.0.0-portable-x64.zip" \
  "release/RlonDSP-1.0.0-setup-x64.exe" \
  --title "RlonDSP v1.0.0" \
  --notes-file CHANGELOG.md
```

## 七、发布后检查

- [ ] Release 页面的安装包与便携版均可正常下载；
- [ ] 下载后的便携版解压即可运行，安装版可正常安装与卸载；
- [ ] 程序内「关于」页面显示的版本号与 Release 一致；
- [ ] README 中的下载链接可正常跳转；
- [ ] 上游署名与许可证在成品与仓库中均完整可见。

## 八、回滚方案

如发布后发现严重问题：

1. 立即将 Release 标记为 Pre-release，或在说明中标注已知问题；
2. 若问题影响核心功能，撤回对应产物并重新构建；
3. 保留源码回滚锚点（如 `optimize-baseline` 标签）与本地备份目录，便于快速还原；
4. 在 `CHANGELOG.md` 中记录问题与修复版本。

> 注意：回滚源码时不要使用会覆盖工作区未提交改动的强制命令，优先针对具体文件手动还原。

---

<div align="center">

最后更新：2026-09-13 · 对应版本 v1.0.0

</div>
