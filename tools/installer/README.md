# 安装包打包配方

这个文件夹保存的是 **RlonDSP 发布安装包（.exe）与便携包（.zip）所需的全部配方文件**。
没有它们，将来重新打包时就得从头摸索；有了它们，照下面的步骤即可复现出与正式发布完全一致的包。

---

## 一、文件夹内容

| 文件 | 用途 |
| :--- | :--- |
| `sfx-config.bin` | 7-Zip 自解压外壳的配置：安装包标题、安装提示语、安装后自动运行 `setup.cmd` |
| `setup.cmd` | 安装入口脚本：把程序复制到 `%LOCALAPPDATA%\RlonDSP`，然后调用 `setup.ps1`，最后启动程序 |
| `setup.ps1` | 创建桌面快捷方式与开始菜单快捷方式，并生成「Uninstall RlonDSP.cmd」卸载程序 |
| `VersionPatcher.cs` | 改写可执行文件"文件属性"的工具源码（把 7-Zip 的信息改成 RlonDSP） |
| `VersionPatcher.exe` | 上面这个工具编译好的可执行版本 |

## 二、外部依赖

| 依赖 | 说明 |
| :--- | :--- |
| 7-Zip | 提供自解压外壳模块 `C:\Program Files\7-Zip\7z.sfx`，以及压缩命令 `7z.exe` |
| .NET Framework 编译器 | 仅在需要重新编译 `VersionPatcher.cs` 时使用：`C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe` |

## 三、打包步骤

以下命令均在项目根目录执行。假设要打包的版本是 `1.0.0`。

### 步骤 1：搭打包台

```powershell
$root = 'C:\path\to\RlonDSP'
$stage = "$root\build\pack-stage"

New-Item -ItemType Directory -Force -Path $stage | Out-Null
Copy-Item -LiteralPath "$root\release\RlonDSP-portable" -Destination "$stage\RlonDSP" -Recurse -Force
Copy-Item -LiteralPath "$root\tools\installer\setup.cmd" -Destination $stage -Force
Copy-Item -LiteralPath "$root\tools\installer\setup.ps1" -Destination $stage -Force
```

> `setup.cmd` 与 `setup.ps1` 必须放在打包台**根目录**，因为自解压配置里写的是直接运行 `setup.cmd`。
> 程序本体放在 `RlonDSP\` 子文件夹里，`setup.cmd` 会把这个文件夹的内容整体复制到用户目录。

### 步骤 2：打包便携版 zip

```powershell
Push-Location "$root\release"
New-Item -ItemType Directory -Force -Path 'new-packages' | Out-Null
& 'C:\Program Files\7-Zip\7z.exe' a -tzip -mx=9 -y `
  'new-packages\RlonDSP-1.0.0-portable-x64.zip' 'RlonDSP-portable'
Pop-Location
```

> 必须切到 `release\` 目录再压缩，这样压缩包内的顶层文件夹才会是 `RlonDSP-portable\`。

### 步骤 3：生成安装包数据

```powershell
Push-Location "$root\build\pack-stage"
& 'C:\Program Files\7-Zip\7z.exe' a -t7z -mx=9 -y "$root\build\pack-stage.7z" '*'
Pop-Location
```

> 必须**切到打包台内部**再压缩。若在项目根目录执行并传入 `build\pack-stage\*`，压缩包内会多套一层路径，安装脚本将找不到程序。

### 步骤 4：改写自解压外壳的属性

```powershell
Copy-Item 'C:\Program Files\7-Zip\7z.sfx' "$root\build\sfx-stub.sfx" -Force
& "$root\tools\installer\VersionPatcher.exe" "$root\build\sfx-stub.sfx" '1.0.0.0'
```

改写后该文件的属性会显示为：产品名 RlonDSP、公司 RlonDSP、版本 1.0.0.0、版权 Copyright © 2026 RlonDSP。

### 步骤 5：拼装安装包

```powershell
$parts = @(
  "$root\build\sfx-stub.sfx",
  "$root\tools\installer\sfx-config.bin",
  "$root\build\pack-stage.7z"
)
$out = "$root\release\new-packages\RlonDSP-1.0.0-setup-x64.exe"
$fs = [System.IO.File]::Create($out)
foreach ($p in $parts) { $b = [System.IO.File]::ReadAllBytes($p); $fs.Write($b, 0, $b.Length) }
$fs.Close()
```

顺序不能变：**外壳模块 → 配置 → 数据包**。

### 步骤 6：验证

```powershell
# 完整性
& 'C:\Program Files\7-Zip\7z.exe' t "$root\release\new-packages\RlonDSP-1.0.0-setup-x64.exe"
& 'C:\Program Files\7-Zip\7z.exe' t "$root\release\new-packages\RlonDSP-1.0.0-portable-x64.zip"

# 文件属性
(Get-Item "$root\release\new-packages\RlonDSP-1.0.0-setup-x64.exe").VersionInfo |
  Select-Object ProductName, CompanyName, FileVersion, LegalCopyright

# 包内源码是否与当前源码一致
& 'C:\Program Files\7-Zip\7z.exe' e -so "$root\release\new-packages\RlonDSP-1.0.0-setup-x64.exe" `
  "RlonDSP\resources\app\src\renderer.js" | Out-Null
```

两个包都必须报 `Everything is Ok`，且包内 `renderer.js` 的字节数应与 `src\renderer.js` 相同。

## 四、安装后的效果

用户运行安装包后会发生：

1. 程序被复制到 `%LOCALAPPDATA%\RlonDSP`；
2. 桌面出现 `RlonDSP` 快捷方式；
3. 开始菜单出现 `RlonDSP` 文件夹与快捷方式；
4. 安装目录内生成「Uninstall RlonDSP.cmd」，双击即可卸载（删除快捷方式与程序目录）。

## 五、重新编译版本属性工具

只有在修改了 `VersionPatcher.cs` 时才需要：

```powershell
cd tools\installer
& 'C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe' /nologo /target:exe /out:VersionPatcher.exe VersionPatcher.cs
```

---

<div align="center">

最后更新：2026-09-13 · 对应 RlonDSP v1.0.0

</div>
