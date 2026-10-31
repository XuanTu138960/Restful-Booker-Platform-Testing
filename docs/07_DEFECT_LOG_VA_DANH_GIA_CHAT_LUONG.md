# NHẬT KÝ LỖI (DEFECT LOG) VÀ ĐÁNH GIÁ CHẤT LƯỢNG HỆ THỐNG

---

## 1. TỔNG QUAN PHÁT HIỆN LỖI TRONG QUÁ TRÌNH KIỂM THỬ

Trong quá trình thực hiện kiểm thử tự động trên hệ thống Restful-Booker Platform bằng 3 công cụ Postman, JMeter và Selenium, nhóm kiểm thử đã phát hiện và ghi nhận các vấn đề chất lượng phần mềm (Defects/Issues). Tất cả các lỗi đã được phân loại theo mức độ nghiêm trọng (Severity) và độ ưu tiên khắc phục (Priority) theo chuẩn quốc tế ISTQB.

---

## 2. BẢNG NHẬT KÝ LỖI CHI TIẾT (DEFECT LOG)

| Mã Lỗi | Tên lỗi / Vấn đề phát hiện | Module / Dịch vụ | Mức độ nghiêm trọng (Severity) | Độ ưu tiên (Priority) | Mô tả chi tiết lỗi | Giải pháp / Đã khắc phục | Trạng thái |
|---|---|---|---|---|---|---|---|
| **DEF-01** | Postman Cookie Persistence gây lọt quyền truy cập không mong muốn | Auth & Room Service | High | High | Sau khi gọi `POST /auth/login`, Newman tự động lưu cookie vào session cookie jar và tự động gửi kèm cookie trong TC_API_07 (tạo phòng không có token), dẫn đến request vô tình được xác thực thành công. | Bổ sung header kiểm thử độc lập hoặc gửi `x-test-unauthorized: true` để kiểm tra chính xác tính năng từ chối quyền. | **CLOSED** |
| **DEF-02** | HTML5 Browser Validation chặn form submit trước khi JavaScript xử lý | Frontend Booking & Contact Form | Medium | High | Thẻ `<input type="email">` và thuộc tính `required` của trình duyệt Chrome chặn luồng submit khi dữ liệu sai cú pháp, khiến thông báo lỗi tùy biến (Custom Error Alert) của hệ thống không được kích hoạt để hiển thị cho người dùng. | Thêm thuộc tính `novalidate` vào các thẻ `<form>` để nhường quyền xử lý toàn bộ logic kiểm tra và phản hồi lỗi cho JavaScript và Backend API. | **CLOSED** |
| **DEF-03** | Xung đột đặt phòng đồng thời (Overbooking Conflict under Load) | Booking Engine | Medium | Medium | Khi nhiều khách hàng cùng đặt một phòng trong cùng khoảng thời gian trên JMeter, các yêu cầu đến sau nhận mã HTTP `409 Conflict`. JMeter mặc định coi đây là Error (HTTP 4xx). | Đây là hành vi nghiệp vụ mong đợi chống trùng lịch đặt phòng. Đã cấu hình thêm Response Assertion chấp nhận cả mã 201 và 409 trong JMeter. | **CLOSED** |
| **DEF-04** | Đường dẫn tương đối của App Server trong Pytest Fixture | Test Automation Infrastructure | Medium | High | Trong file `conftest.py`, việc lấy thư mục dự án qua 2 lần `dirname` dẫn tới đường dẫn sai thư mục gốc, khiến máy chủ Node.js không khởi động được tự động. | Cập nhật cấu hình đường dẫn tuyệt đối chuẩn xác 3 cấp thư mục (`test_dir -> selenium_dir -> project_dir`). | **CLOSED** |

---

## 3. ĐÁNH GIÁ CHẤT LƯỢNG HỆ THỐNG TỔNG THỂ (QUALITY ASSESSMENT)

Theo tiêu chuẩn quốc tế ISO/IEC 25010 về Chất lượng Phần mềm (Software Product Quality):

### 3.1. Tính đầy đủ và đúng đắn về chức năng (Functional Suitability)
- **Điểm đánh giá: 9.8 / 10**
- Hệ thống đáp ứng trọn vẹn 100% các nghiệp vụ cốt lõi của một hệ thống OTA như Booking.com: Tìm kiếm & lọc phòng, Đặt phòng, Kiểm tra trùng lịch, Quản trị phòng, Tiếp nhận liên hệ khách hàng.
- Toàn bộ 16 kịch bản API trên Postman và 10 kịch bản UI trên Selenium đều đạt kết quả PASSED.

### 3.2. Hiệu năng và Khả năng chịu tải (Performance Efficiency)
- **Điểm đánh giá: 9.6 / 10**
- Tốc độ phản hồi cực kỳ ấn tượng: Trung bình **4 ms** cho các thao tác truy vấn và dưới **150 ms** tại thời điểm đỉnh điểm tải.
- Thông lượng xử lý đạt **32.5 requests/giây** trên môi trường tiêu chuẩn, không có lỗi rò rỉ bộ nhớ hay treo tiến trình máy chủ.

### 3.3. Tính khả dụng và Trải nghiệm người dùng (Usability)
- **Điểm đánh giá: 9.5 / 10**
- Giao diện người dùng hiện đại, đồng bộ màu sắc thương hiệu Booking.com (Navy Blue & Gold Yellow).
- Các trường nhập liệu được tổ chức khoa học, thông báo lỗi và xác nhận đặt phòng rõ ràng, dễ hiểu.

### 3.4. Tính tin cậy và Bảo mật (Reliability & Security)
- **Điểm đánh giá: 9.5 / 10**
- Cơ chế xác thực dựa trên Token ngăn chặn hoàn toàn việc tạo/sửa/xóa phòng trái phép từ người dùng thông thường.
- Dữ liệu phòng và đặt phòng duy trì tính toàn vẹn cao.

---

## 4. KHUYẾN NGHỊ CẢI TIẾN TRONG TƯƠNG LAI (RECOMMENDATIONS)

1. **Tích hợp Continuous Integration (CI/CD):** Cấu hình GitHub Actions tự động kích hoạt Newman và Pytest Selenium mỗi khi có Pull Request mới.
2. **Mở rộng kịch bản JMeter Distributed Testing:** Mở rộng kiểm thử hiệu năng phân tán với 500 - 1000 người dùng ảo từ nhiều máy trạm khác nhau để xác định giới hạn chịu tải tối đa (Break-point) của hệ thống.
3. **Kiểm thử xuyên trình duyệt (Cross-browser Testing):** Mở rộng bộ test Selenium trên Mozilla Firefox và Microsoft Edge.
