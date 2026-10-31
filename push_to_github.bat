@echo off
setlocal
echo ================================================================
echo   DONG BO MA NGUON LEN GITHUB: XuanTu138960
echo   De tai: Restful-Booker Platform Quality Assurance Suite
echo   Sinh vien: Nguyen Xuan Tu - MSV: 23010538
echo ================================================================

cd /d "%~dp0"

echo [1/3] Kiem tra trang thai Git...
git status

echo [2/3] Cau hinh Remote Origin...
git remote remove origin 2>nul
git remote add origin https://github.com/XuanTu138960/Restful-Booker-Platform-Testing.git
git remote -v

echo [3/3] Dang day ma nguon len GitHub (branch: main)...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo ================================================================
    echo [THANH CONG] Da day toan bo ma nguon va bao cao len GitHub!
    echo URL: https://github.com/XuanTu138960/Restful-Booker-Platform-Testing
    echo ================================================================
) else (
    echo ================================================================
    echo [CHU Y] Neu kho chua ton tai tren GitHub, ban vui long tao kho moi
    echo co ten: Restful-Booker-Platform-Testing tai https://github.com/new
    echo sau do chay lai file nay de day code len!
    echo ================================================================
)
pause
