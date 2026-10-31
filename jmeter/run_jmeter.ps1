# Script PowerShell thuc thi JMeter kiem thu hieu nang
$jmeterBin = "C:\Users\Admin\Downloads\apache-jmeter-5.6.3\apache-jmeter-5.6.3\bin\jmeter.bat"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$jmxFile = Join-Path $scriptDir "restful_booker_performance_test.jmx"
$resultCsv = Join-Path $scriptDir "results\test_results.csv"
$reportDir = Join-Path $scriptDir "results\html_dashboard"

if (Test-Path $resultCsv) { Remove-Item -Force $resultCsv }
if (Test-Path $reportDir) { Remove-Item -Recurse -Force $reportDir }

Write-Host "================================================================"
Write-Host "  KHOI CHAY KIEM THU HIEU NANG VOI APACHE JMETER 5.6.3"
Write-Host "  De tai: Danh gia chat luong Restful-Booker Platform"
Write-Host "  Sinh vien: Nguyen Xuan Tu - MSV: 23010538 (Phenikaa Uni)"
Write-Host "================================================================"

& $jmeterBin -n -t $jmxFile -l $resultCsv -e -o $reportDir

Write-Host "`n[HOAN TAT] Kiem thu hieu nang thanh cong!"
Write-Host "File ket qua CSV: $resultCsv"
Write-Host "HTML Dashboard Report: $reportDir\index.html"
