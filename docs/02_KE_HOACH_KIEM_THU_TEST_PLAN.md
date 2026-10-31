# KẾ HOẠCH KIỂM THỬ PHẦN MỀM (TEST PLAN)

---

## 1. THÔNG TIN CHUNG

- **Tên dự án:** Kiểm định và Đánh giá Chất lượng Hệ thống Đặt phòng Khách sạn Restful-Booker Platform
- **Tiêu chuẩn áp dụng:** IEEE 829 Standard for Software Test Documentation
- **Sinh viên xây dựng kế hoạch:** Nguyễn Xuân Tú
- **Mã sinh viên:** 23010538
- **Đơn vị:** Trường Đại học Phenikaa
- **Môn học:** Đảm bảo chất lượng và Kiểm thử phần mềm

---

## 2. MỤC TIÊU VÀ PHẠM VI KIỂM THỬ (TEST OBJECTIVES & SCOPE)

### 2.1. Mục tiêu kiểm thử
1. Xác định mức độ tuân thủ của các dịch vụ RESTful API so với tài liệu đặc tả kỹ thuật (API Specifications).
2. Kiểm tra tính toàn vẹn của dữ liệu và khả năng phát hiện lỗi nhập liệu (Input Validation & Error Handling).
3. Đánh giá hiệu năng hệ thống dưới các kịch bản tải mô phỏng hành vi người dùng thật của Booking.com: Thời gian phản hồi (Response Time), Thông lượng (Throughput) và Tỷ lệ lỗi (Error Rate).
4. Tự động hóa kiểm thử giao diện người dùng (UI Automation) theo mô hình Page Object Model (POM) nhằm giảm thiểu thời gian kiểm thử hồi quy (Regression Testing).

### 2.2. Phạm vi kiểm thử (In-Scope)
- **Tầng Dịch vụ API:**
  - Dịch vụ Xác thực (`/auth/login`, `/auth/validate`, `/auth/logout`).
  - Dịch vụ Danh mục Phòng (`/room/`, `/room/{id}`).
  - Dịch vụ Đặt phòng (`/booking/`, `/booking/{id}`, `/booking/summary`).
  - Dịch vụ Hộp thư & Liên hệ (`/message/`, `/message/{id}`).
  - Dịch vụ Báo cáo & Nhận diện (`/report/`, `/branding/`).
- **Tầng Giao diện Web (UI):**
  - Trang chủ hiển thị phòng, banner, bộ lọc tìm kiếm.
  - Hộp thoại (Modal) đặt phòng, chọn ngày nhận/trả phòng và nhập thông tin khách hàng.
  - Form liên hệ và góp ý khách hàng (Contact Us Form).
  - Cổng Quản trị viên (Admin Login & Dashboard CMS).
- **Kiểm thử Hiệu năng (Performance Testing):**
  - Tải người dùng duyệt thông tin khách sạn bình thường (Normal Browsing Load: 10 người dùng đồng thời).
  - Tải cao điểm đặt phòng đồng thời (Peak Concurrent Bookings: 20 người dùng gửi yêu cầu đặt chỗ).
  - Tải thao tác quản trị hệ thống (Admin Authentication: 5 phiên làm việc).

### 2.3. Ngoài phạm vi kiểm thử (Out-of-Scope)
- Cổng thanh toán tài chính thẻ tín dụng thực tế với ngân hàng (Payment Gateway Integration).
- Gửi email SMTP thực tế ra internet (thay vào đó kiểm tra API response và xác nhận nội bộ).

---

## 3. CHIẾN LƯỢC VÀ PHƯƠNG PHÁP KIỂM THỬ (TEST STRATEGY)

Dự án áp dụng mô hình kim tự tháp kiểm thử phần mềm (Testing Pyramid) kết hợp 3 công cụ chuyên sâu:

```
          / \
         /   \       UI End-to-End Testing (Selenium WebDriver + Pytest)
        / ----\      - Kiểm tra luồng người dùng trên trình duyệt Chrome
       /       \     
      / --------\    Performance Testing (Apache JMeter)
     /           \   - Kiểm tra khả năng chịu tải, thông lượng, độ trễ
    /-------------\  API Integration Testing (Postman + Newman)
   /               \ - Kiểm tra toàn diện HTTP status, JSON schema, assertions
```

### 3.1. Kiểm thử API với Postman & Newman
- **Phương pháp:** Kiểm thử hộp đen (Black-box Testing) ở cấp độ giao diện lập trình ứng dụng.
- **Kỹ thuật thiết kế Test Case:** Phân vùng tương đương (Equivalence Partitioning) và Phân tích giá trị biên (Boundary Value Analysis).
- **Tiêu chí chấp nhận:**
  - 100% các request trả về đúng HTTP Status Code theo thiết kế (200, 201, 400, 403, 409).
  - Dữ liệu trả về đúng kiểu dữ liệu JSON, có chứa đầy đủ các trường bắt buộc.
  - Thời gian phản hồi API trung bình nhỏ hơn 500ms.

### 3.2. Kiểm thử Hiệu năng với Apache JMeter
- **Phương pháp:** Kiểm thử tải (Load Testing) và Kiểm thử áp lực (Stress Testing) trên môi trường phân tán.
- **Chỉ số đo lường (Key Performance Indicators - KPIs):**
  - **Response Time (Average, 90th percentile, 95th percentile):** < 1000ms.
  - **Throughput (Số lượng yêu cầu xử lý mỗi giây):** > 20 requests/sec.
  - **Error Rate (Tỷ lệ lỗi do sập server):** 0% lỗi kỹ thuật máy chủ (lỗi 5xx). Lỗi 409 Conflict được ghi nhận như một phản hồi logic đúng đắn khi phòng bị trùng lịch.

### 3.3. Kiểm thử Tự động Giao diện với Selenium WebDriver
- **Mô hình kiến trúc:** **Page Object Model (POM)** tách biệt hoàn toàn giữa cấu trúc Web Elements (Locators) và kịch bản Test (Assertions).
- **Môi trường thực thi:** Python 3.11, Selenium 4, Pytest, Chrome Headless Mode.
- **Tiêu chí chấp nhận:**
  - Tự động hóa 100% các kịch bản người dùng cốt lõi (10 Test Cases).
  - Tự động chụp ảnh màn hình lưu lại minh chứng cho mỗi bước thực hiện.
  - Xuất báo cáo Pytest-HTML trực quan.

---

## 4. MÔI TRƯỜNG KIỂM THỬ (TEST ENVIRONMENT)

| Thành phần | Đặc tả kỹ thuật |
|---|---|
| **Hệ điều hành** | Microsoft Windows 11 (64-bit) |
| **Runtime Backend** | Node.js v24.x LTS / Java OpenJDK Temurin 25 |
| **Cổng ứng dụng (Port)** | `http://localhost:3003` |
| **Công cụ API Testing** | Postman v11.x, Newman v6.2.3 |
| **Công cụ Performance** | Apache JMeter 5.6.3 |
| **Công cụ UI Testing** | Selenium WebDriver 4.51.0, Pytest 9.1.1, Pytest-HTML 4.2.0 |
| **Trình duyệt kiểm thử** | Google Chrome (Latest Version) |

---

## 5. TIÊU CHÍ DỪNG VÀ BÀN GIAO KIỂM THỬ (SUSPENSION & EXIT CRITERIA)

- **Tiêu chí dừng:** Nếu máy chủ Backend không khởi động được hoặc cổng API bị chặn hoàn toàn, quá trình kiểm thử tạm dừng để khắc phục cấu hình mạng.
- **Tiêu chí bàn giao:**
  - 100% các Test Case API trên Postman hoàn thành với kết quả PASSED.
  - Bộ kịch bản JMeter chạy thành công với báo cáo HTML Dashboard được sinh ra đầy đủ.
  - Toàn bộ 10 Test Case Selenium UI chạy thành công (100% PASSED) và có ảnh chụp màn hình chứng minh.
  - Mã nguồn, tài liệu hướng dẫn và báo cáo được đồng bộ hoàn chỉnh lên GitHub.
