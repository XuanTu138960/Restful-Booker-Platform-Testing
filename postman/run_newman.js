/**
 * Script điều phối thực thi Postman Collection tự động bằng Newman
 * Sinh viên thực hiện: Nguyễn Xuân Tú - MSV: 23010538
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const collectionPath = path.join(__dirname, 'Restful_Booker_Platform_Collection.json');
const envPath = path.join(__dirname, 'Restful_Booker_Platform_Environment.json');
const reportsDir = path.join(__dirname, 'reports');

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const reportFile = path.join(reportsDir, 'newman_cli_report.txt');

console.log('================================================================');
console.log('  CHẠY KIỂM THỬ TỰ ĐỘNG POSTMAN API VỚI NEWMAN RUNNER');
console.log('  Đề tài: Đánh giá chất lượng Restful-Booker Platform');
console.log('  Sinh viên: Nguyễn Xuân Tú - MSV: 23010538 (Phenikaa Uni)');
console.log('================================================================\n');

try {
  const cmd = `npx newman run "${collectionPath}" -e "${envPath}" --color on`;
  console.log(`Đang thực thi: ${cmd}\n`);
  
  const output = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
  console.log(output);
  fs.writeFileSync(reportFile, output, 'utf-8');
  console.log(`\n✅ Báo cáo kết quả kiểm thử Newman đã được lưu tại: ${reportFile}`);
} catch (err) {
  const errOutput = (err.stdout || '') + '\n' + (err.stderr || '');
  console.log(errOutput);
  fs.writeFileSync(reportFile, errOutput, 'utf-8');
  console.log(`\n⚠️ Kiểm thử hoàn thành (có thể có test case assertions failed). Báo cáo đã lưu tại: ${reportFile}`);
}
