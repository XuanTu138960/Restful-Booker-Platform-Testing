@echo off
setlocal
echo ================================================================
echo   THUC THI KIEM THU HIEU NANG APACHE JMETER
echo   De tai: Restful-Booker Platform Performance Testing
echo   Sinh vien: Nguyen Xuan Tu - MSV: 23010538 (Phenikaa Uni)
echo ================================================================

set JMETER_BIN=C:\Users\Admin\Downloads\apache-jmeter-5.6.3\apache-jmeter-5.6.3\bin\jmeter.bat
set SCRIPT_DIR=%~dp0
set JMX_FILE=%SCRIPT_DIR%restful_booker_performance_test.jmx
set RESULT_CSV=%SCRIPT_DIR%results\test_results.csv
set REPORT_DIR=%SCRIPT_DIR%results\html_dashboard

if exist "%RESULT_CSV%" del /f /q "%RESULT_CSV%"
if exist "%REPORT_DIR%" rmdir /s /q "%REPORT_DIR%"

echo [1/2] Dang chay JMeter Test Plan non-GUI...
call "%JMETER_BIN%" -n -t "%JMX_FILE%" -l "%RESULT_CSV%" -e -o "%REPORT_DIR%"

echo [2/2] Hoan tat! Ket qua da duoc xuat ra:
echo - CSV Metrics: %RESULT_CSV%
echo - HTML Dashboard: %REPORT_DIR%\index.html
echo ================================================================
pause
