// Kiểm tra bộ tính Z-score với giá trị tham chiếu từ phần mềm WHO (gói R anthroplus) và bảng WHO.
// Chạy: node tests/zscore.test.js
const fs = require('fs'), vm = require('vm'), path = require('path');
const ctx = {}; vm.createContext(ctx);
for (const f of ['who-lms.js', 'zscore.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', f), 'utf8'), ctx);
const { whoZ, zLMS, interp, WHO_LMS } = vm.runInContext('({whoZ, zLMS, interp, WHO_LMS})', ctx);
let fail = 0;
function eq(label, got, exp, tol = 0.011) {
  const ok = got != null && Math.abs(got - exp) <= tol;
  if (!ok) fail++;
  console.log(`${ok ? '✓' : '✗'} ${label}: ${got} (mong đợi ${exp})`);
}
// WHO 2007 – ví dụ trong tài liệu anthroplus (WHO)
let r = whoZ('M', 100, 30, 100); eq('Nam 100 tháng, HAZ', r.haz, -5.04); eq('Nam 100 tháng, WAZ', r.waz, 0.87); eq('Nam 100 tháng, BMIZ', r.whz, 5.03);
r = whoZ('F', 110, 40, 90); eq('Nữ 110 tháng, HAZ', r.haz, -7.06); eq('Nữ 110 tháng, WAZ', r.waz, 1.78); eq('Nữ 110 tháng, BMIZ', r.whz, 7.37);
// WHO 2006 – giá trị tại median trong bảng phải cho z = 0
eq('Nam 12 tháng, cân nặng median 9,6479 kg', whoZ('M', 12, 9.6479, 75.7488).waz, 0);
eq('Nam 12 tháng, chiều dài median 75,7488 cm', whoZ('M', 12, 9.6479, 75.7488).haz, 0);
eq('Nữ 36 tháng, chiều cao median 95,0515 cm', whoZ('F', 36, 13.8503, 95.0515).haz, 0);
eq('WFL nam 75 cm, median 9,5032 kg', zLMS(9.5032, interp(WHO_LMS.wfl_M, 75), true), 0);
// WHO 2006 – ngưỡng −2SD trong bảng (làm tròn 0,1 kg/cm nên dung sai lớn hơn)
eq('WFH nữ 100 cm, 12,8 kg ≈ −2SD', zLMS(12.8, interp(WHO_LMS.wfh_F, 100), true), -2, 0.06);
eq('LFA nam 12 tháng, 71,0 cm ≈ −2SD', whoZ('M', 12, null, 71.0).haz, -2, 0.03);
console.log(fail ? `\n${fail} kiểm tra không đạt` : '\nTất cả kiểm tra đạt');
process.exit(fail ? 1 : 0);
