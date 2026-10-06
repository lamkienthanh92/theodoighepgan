# Theo dõi dinh dưỡng trẻ ghép gan

Ứng dụng web theo dõi tình trạng dinh dưỡng của trẻ ghép gan tại các mốc trước ghép, 1, 3, 6, 12 và 24 tháng sau ghép. Ứng dụng được xây dựng từ kết quả luận văn chuyên khoa cấp II *"Tình trạng dinh dưỡng bệnh nhi trước và sau ghép gan tại Bệnh viện Nhi Đồng 2"* (Trần Ngọc Lưu, Đại học Y Dược TP. Hồ Chí Minh, 2026).

> **Phiên bản thử nghiệm**, sẽ được hoàn thiện trong đề án sáng kiến cải tiến của Bệnh viện Nhi Đồng 2.

## Chức năng

- **Tự tính Z-score theo chuẩn WHO** từ ngày sinh, giới, ngày đo, cân nặng và chiều dài/chiều cao:

  | Chỉ số | Độ tuổi | Chuẩn |
  |---|---|---|
  | Cân nặng theo tuổi (WAZ) | 0–10 tuổi | WHO 2006 (0–5 tuổi), WHO 2007 (5–10 tuổi) |
  | Chiều dài/chiều cao theo tuổi (LAZ/HAZ) | 0–19 tuổi | Chiều dài nằm < 2 tuổi, chiều cao đứng 2–5 tuổi, WHO 2007 từ 5 tuổi |
  | Cân nặng theo chiều dài/chiều cao (WLZ/WHZ) | 0–5 tuổi | WHO 2006 |
  | BMI theo tuổi (BMIZ) | 5–19 tuổi | WHO 2007 |

- **Phân loại theo tuổi**: nhẹ cân, thấp còi, gầy còm (mức nặng khi < −3SD), thừa cân, béo phì; MUAC < 12,5 cm ở trẻ 6–59 tháng; thiếu máu theo ngưỡng WHO 2024; thiếu vitamin D (25(OH)D < 30 và 30–50 nmol/L).
- **Biểu đồ diễn tiến** từng chỉ số, so với hành lang tham chiếu (trung bình ước lượng GEE và KTC 95%) của 62 trẻ ghép gan trong nghiên cứu.
- **Cảnh báo và nhắc việc**: WAZ giảm ≥ 0,5 SD trong tháng đầu, thấp còi mới xuất hiện sau ghép, albumin < 35 g/L, INR > 1,5, nuôi ăn đường ruột sau 24 giờ, số đo ngoài cửa sổ của mốc (T1: ngày 21–40, T3: 75–105, T6: 150–210), mốc tái khám sắp đến hoặc đã quá hạn.
- **Tổng quan** nhóm bệnh nhi đang theo dõi và số liệu tham chiếu của nghiên cứu.

## Chạy thử trên máy

Ứng dụng là trang web tĩnh, không cần cài đặt:

```bash
python3 -m http.server 8000
# mở http://localhost:8000
```

Kiểm tra bộ tính Z-score (cần Node.js):

```bash
npm test
```

Tạo bản một file duy nhất (gộp CSS, JS, logo) để gửi hoặc mở trực tiếp:

```bash
python3 scripts/build_single.py   # → dist/theo-doi-dinh-duong.html
```

## Đưa lên GitHub

1. Tạo repository mới trên GitHub (khuyến nghị để **Private** trong giai đoạn thử nghiệm).
2. Tải toàn bộ thư mục này lên:
   ```bash
   git init
   git add .
   git commit -m "Phiên bản thử nghiệm"
   git branch -M main
   git remote add origin https://github.com/<tài-khoản>/theo-doi-dinh-duong-ghep-gan.git
   git push -u origin main
   ```
3. Bật GitHub Pages: **Settings → Pages → Source: GitHub Actions**. Mỗi lần đẩy mã lên nhánh `main`, workflow sẽ chạy kiểm tra Z-score rồi đưa trang lên.

## Cấu trúc thư mục

```
index.html                 Trang chính
assets/css/style.css       Giao diện (nền trắng)
assets/js/who-lms.js       Bảng tham số L, M, S của WHO
assets/js/zscore.js        Bộ tính Z-score (LMS, có điều chỉnh khi |z| > 3)
assets/js/app.js           Giao diện và logic theo dõi (React 18)
assets/img/                Logo Bệnh viện Nhi Đồng 2, Đại học Y Dược TP. HCM
tests/zscore.test.js       Kiểm tra với giá trị tham chiếu của WHO
scripts/build_single.py    Gộp thành một file HTML
.github/workflows/         Kiểm tra tự động và đưa lên GitHub Pages
```

## Nguồn dữ liệu chuẩn và độ chính xác

- Tham số L, M, S lấy từ bảng z-score chính thức của WHO: *WHO Child Growth Standards* (2006) cho trẻ 0–5 tuổi và *WHO Growth Reference* (2007) cho trẻ 5–19 tuổi (who.int).
- Z-score tính theo công thức LMS; chỉ số dựa trên cân nặng được điều chỉnh khi |z| > 3 theo hướng dẫn của WHO.
- Kết quả trùng khớp đến 2 chữ số thập phân với ví dụ chuẩn của phần mềm WHO AnthroPlus (xem `tests/zscore.test.js`).
- Ứng dụng tính theo tuổi tháng có nội suy (WHO Anthro tính theo ngày), sai lệch khoảng ±0,01–0,02 SD, không ảnh hưởng đến phân loại lâm sàng.
- Trẻ trên 2 tuổi đo nằm: nhập chiều dài đã trừ 0,7 cm.

## Lưu ý khi sử dụng

- Dữ liệu chỉ lưu trong trình duyệt của máy đang dùng (localStorage), không gửi đi đâu. **Chỉ nhập mã bệnh nhi đã ẩn danh**, không nhập họ tên hay số hồ sơ.
- Dữ liệu sức khỏe là dữ liệu cá nhân nhạy cảm theo Nghị định 13/2023/NĐ-CP. Khi đưa vào sử dụng chính thức cần triển khai trên máy chủ của bệnh viện, có đăng nhập và phân quyền, thông qua phòng Công nghệ thông tin.
- Hành lang tham chiếu mô tả nhóm 62 trẻ trong nghiên cứu, không phải chuẩn tăng trưởng. Cảnh báo chỉ mang tính nhắc nhở, không thay thế quyết định lâm sàng.

## Hướng phát triển (đề án sáng kiến cải tiến)

- Lưu trữ trên máy chủ bệnh viện, đăng nhập và phân quyền người dùng.
- Kết nối hồ sơ bệnh án điện tử để lấy số đo và xét nghiệm tự động.
- Bổ sung MUAC theo tuổi, khẩu phần ăn và thành phần cơ thể.
- Cộng dồn dữ liệu các ca ghép mới cho nghiên cứu theo dõi dài hạn.

## Trích dẫn

Trần Ngọc Lưu. *Tình trạng dinh dưỡng bệnh nhi trước và sau ghép gan tại Bệnh viện Nhi Đồng 2*. Luận văn chuyên khoa cấp II, Đại học Y Dược TP. Hồ Chí Minh; 2026. Người hướng dẫn: PGS.TS Bùi Quang Vinh, BSCKII Nguyễn Hồng Vân Khánh.

## Giấy phép

Mã nguồn: MIT. Logo thuộc quyền của Bệnh viện Nhi Đồng 2 và Đại học Y Dược TP. Hồ Chí Minh. Bảng tham số tăng trưởng thuộc Tổ chức Y tế Thế giới.
