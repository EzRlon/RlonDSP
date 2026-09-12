@echo off
setlocal
set "TARGET=%LOCALAPPDATA%\RlonDSP"
if not exist "%TARGET%" mkdir "%TARGET%"
xcopy /E /I /Y "%~dp0RlonDSP\*" "%TARGET%\" >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup.ps1" "%TARGET%"
start "" "%TARGET%\RlonDSP.exe"
