param([string]$Target)

$ErrorActionPreference = 'SilentlyContinue'

$exe = Join-Path $Target 'RlonDSP.exe'
$desktop = [Environment]::GetFolderPath('Desktop')
$startMenu = Join-Path ([Environment]::GetFolderPath('StartMenu')) 'Programs'
$ws = New-Object -ComObject WScript.Shell

$desktopLink = Join-Path $desktop 'RlonDSP.lnk'
$shortcut = $ws.CreateShortcut($desktopLink)
$shortcut.TargetPath = $exe
$shortcut.WorkingDirectory = $Target
$shortcut.IconLocation = "$exe,0"
$shortcut.Save()

$startFolder = Join-Path $startMenu 'RlonDSP'
if (-not (Test-Path $startFolder)) { New-Item -ItemType Directory -Path $startFolder | Out-Null }
$startLink = Join-Path $startFolder 'RlonDSP.lnk'
$shortcut = $ws.CreateShortcut($startLink)
$shortcut.TargetPath = $exe
$shortcut.WorkingDirectory = $Target
$shortcut.IconLocation = "$exe,0"
$shortcut.Save()

$uninstall = Join-Path $Target 'Uninstall RlonDSP.cmd'
@"
@echo off
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Sleep -Seconds 1; Remove-Item '$desktopLink','$startLink' -Force -ErrorAction SilentlyContinue; Remove-Item '$Target' -Recurse -Force -ErrorAction SilentlyContinue"
"@ | Set-Content -LiteralPath $uninstall -Encoding Unicode
