# BÁO CÁO NGHIÊN CỨU BOOKING.COM VÀ MÔ PHỎNG TRÊN RESTFUL-BOOKER PLATFORM

---

## THÔNG TIN ĐỀ TÀI & SINH VIÊN

- **Tên đề tài:** Đánh giá và kiểm định chất lượng hệ thống đặt phòng khách sạn mã nguồn mở Restful-booker Platform bằng Postman, JMeter và Selenium
- **Sinh viên thực hiện:** Nguyễn Xuân Tú
- **Mã sinh viên:** 23010538
- **Lớp / Trường:** Trường Đại học Phenikaa
- **Học phần:** Đảm bảo chất lượng và Kiểm thử phần mềm (Software Quality Assurance & Testing)
- **Kho lưu trữ GitHub:** [https://github.com/XuanTu138960](https://github.com/XuanTu138960)

---

## 1. TỔNG QUAN HỆ THỐNG ĐẶT PHÒNG KHÁCH SẠN TRỰC TUYẾN (OTA)

Các nền tảng đặt phòng trực tuyến (Online Travel Agencies - OTA) như **Booking.com**, **Agoda**, **Expedia** đóng vai trò cầu nối thiết yếu giữa khách lưu trú và các cơ sở lưu trú (khách sạn, khu nghỉ dưỡng, homestay). 

Do đặc thù giao dịch tài chính và thương mại trực tiếp, các hệ thống đặt phòng khách sạn trực tuyến có các nghiệp vụ cốt lõi:
1. **Tìm kiếm & Phân loại phòng (Search & Discovery):** Lọc theo khoảng ngày nhận - trả phòng, số lượng khách, loại phòng (Single, Double, Suite), các tiện nghi (WiFi, TV, điều hòa, ăn sáng, hỗ trợ người khuyết tật - Accessible).
2. **Quy trình Đặt phòng (Reservation & Booking Flow):** Thu thập thông tin khách hàng, kiểm tra tính khả dụng (Availability & Conflict check), tính toán tổng chi phí dựa trên số đêm và đơn giá, sinh mã đặt phòng (Booking ID) duy nhất.
3. **Xác thực và Bảo mật Quản trị (Admin Authentication):** Phân quyền truy cập giữa người dùng công khai (Public Guests) và nhân viên/quản lý khách sạn (Admin). Quản trị viên cần token/session hợp lệ để xem doanh thu, chỉnh sửa phòng hoặc xóa dữ liệu.
4. **Quản lý Danh mục Phòng (Room Inventory Management - CMS):** Cho phép Admin tạo mới phòng, cập nhật đơn giá theo mùa, bật/tắt trạng thái phòng và gán tiện ích.
5. **Kênh Chăm sóc & Liên hệ Khách hàng (Customer Messaging & Inquiries):** Tiếp nhận các thắc mắc (Check-in sớm, đón sân bay, hủy đổi phòng) và phản hồi kịp thời.

Chất lượng của phần mềm (tính chính xác dữ liệu, thời gian phản hồi, khả năng chịu tải đồng thời và trải nghiệm giao diện mượt mà) ảnh hưởng trực tiếp đến doanh thu và uy tín thương hiệu.

---

## 2. PHÂN TÍCH NỀN TẢNG BOOKING.COM

### 2.1. Kiến trúc Trải nghiệm Người dùng (UX/UI Patterns) của Booking.com
Booking.com là một trong những nền tảng OTA thành công nhất nhờ áp dụng các quy chuẩn thiết kế tối ưu hóa tỷ lệ chuyển đổi (Conversion Rate Optimization):
- **Bảng tìm kiếm trung tâm (Search Banner):** Sử dụng tông màu xanh dương đậm (`#003580`), viền vàng (`#febb02`) nổi bật thu hút sự chú ý.
- **Thẻ phòng trực quan (Room Card):** Hiển thị hình ảnh thực tế chất lượng cao, nhãn giá niêm yết rõ ràng theo đêm, gắn huy hiệu loại phòng và danh sách tiện ích nổi bật.
- **Luồng Đặt phòng Tối giản (Frictionless Booking Modal):** Cho phép khách điền thông tin ngắn gọn (Họ tên, Email, Số điện thoại) và xác nhận nhanh chóng mà không bắt buộc tạo tài khoản phức tạp.
- **Phản hồi Trạng thái Tức thì (Real-time Feedback):** Bắt lỗi nhập liệu ngay trên form (inline validation) và hiển thị thông báo thành công có mã đặt phòng.

### 2.2. Kiến trúc Kỹ thuật Hệ thống Đặt phòng Lớn
Booking.com vận hành kiến trúc phân tán (Microservices Architecture) với hàng trăm dịch vụ độc lập:
- Service Tìm kiếm & Lọc (Search & Availability Engine).
- Service Đặt chỗ & Khóa phòng (Booking & Lock Service) tránh tình trạng Overbooking.
- Service Xác thực & Định danh (Auth & IAM).
- Service Hộp thư Khách hàng (Customer Messaging Service).
- Cổng API Gateway điều phối giữa giao diện người dùng và các backend services.

---

## 3. MÔ PHỎNG TRÊN RESTFUL-BOOKER PLATFORM

### 3.1. Giới thiệu Restful-Booker Platform
**Restful-Booker Platform** (tác giả Mark Winteringham) là hệ thống mã nguồn mở nổi tiếng toàn cầu, được xây dựng chuyên biệt nhằm phục vụ công tác nghiên cứu, đào tạo và kiểm thử phần mềm tự động (Testing in Microservices).

Hệ thống có kiến trúc tách tầng rõ ràng:
- **Tầng Giao diện Web (Frontend):** Ứng dụng Single Page Application (React) giao tiếp bất đồng bộ qua Fetch/Axios.
- **Tầng Dịch vụ Backend (Backend Services):** Các dịch vụ RESTful (Java Spring Boot) xử lý logic nghiệp vụ độc lập:
  - `auth-service`: Quản lý cấp phát token và kiểm tra quyền hạn quản trị.
  - `room-service`: Quản lý danh mục phòng và giá cả.
  - `booking-service`: Tiếp nhận yêu cầu đặt phòng, kiểm tra trùng lặp lịch và lưu trữ booking.
  - `message-service`: Quản lý tin nhắn phản hồi của khách hàng.
  - `report-service`: Tổng hợp số liệu thống kê lượt đặt phòng và phòng trống.

### 3.2. Bảng đối chiếu mô phỏng giữa Booking.com và Restful-Booker Platform

| Thành phần nghiệp vụ | Nền tảng Booking.com | Restful-Booker Platform (Đề tài mô phỏng) | Đánh giá & Áp dụng kiểm thử |
|---|---|---|---|
| **Xem danh sách phòng** | Grid hiển thị khách sạn & phòng có bộ lọc tiện nghi, loại phòng | Endpoint `GET /room/`, UI hiển thị Room Cards kèm hình ảnh, tiện ích, giá tiền | Kiểm thử API Postman, UI Selenium, Tải JMeter |
| **Tìm kiếm & Lọc** | Lọc theo loại phòng, tiện nghi hỗ trợ tiếp cận | UI Dropdown lọc Real-time theo Loại phòng (Single/Double/Suite) và Accessible | Kiểm thử chức năng Selenium UI |
| **Đặt phòng trực tuyến** | Form nhập thông tin khách hàng, chọn ngày checkin-checkout | Endpoint `POST /booking/`, Modal nhập Firstname, Lastname, Email, Phone, Dates | Kiểm thử API Postman, UI E2E Selenium, Stress test JMeter |
| **Xung đột ngày đặt (Overbooking)** | Khóa ngày phòng đã có khách, thông báo phòng không còn trống | Backend kiểm tra trùng lặp ngày, trả về mã lỗi HTTP `409 Conflict` | Kiểm thử logic biên Postman & JMeter |
| **Gửi liên hệ hỗ trợ** | Hộp thư nhắn tin cho khách sạn / chủ nhà | Endpoint `POST /message/`, Form "Contact Us" với Name, Email, Phone, Subject, Content | Kiểm thử tính hợp lệ (Validation) bằng Postman & Selenium |
| **Đăng nhập Quản trị** | Extranet Booking.com dành cho chủ khách sạn | Endpoint `POST /auth/login`, Cổng Admin Panel với username: `admin` / pass: `password` | Kiểm thử bảo mật (Security testing) bằng Postman & Selenium |
| **Quản lý phòng (CMS)** | Thêm, sửa, xóa phòng trong Extranet | Endpoint `POST /room/`, `DELETE /room/{id}`, Bảng quản trị phòng trực quan | Kiểm thử phân quyền Token Auth |
| **Báo cáo & Thống kê** | Bảng Dashboard doanh thu và công suất phòng | Endpoint `GET /report/`, Dashboard hiển thị tổng số phòng, lượt booking, tin nhắn | Kiểm thử tích hợp hệ thống (Integration testing) |

---

## 4. KẾT LUẬN & Ý NGHĨA NGHIÊN CỨU

Việc nghiên cứu nền tảng Booking.com và mô phỏng trên Restful-Booker Platform tạo tiền đề vững chắc cho việc thiết lập chiến lược kiểm định chất lượng toàn diện:
1. **Kiểm thử API (Postman & Newman):** Đảm bảo các REST API backend phản hồi chính xác mã trạng thái HTTP (200, 201, 400, 403, 409), cấu trúc dữ liệu JSON đúng Schema và độ trễ thấp.
2. **Kiểm thử Hiệu năng (Apache JMeter):** Đánh giá năng lực chịu tải của hệ thống khi có đồng thời 10 - 50 người dùng duyệt phòng, gửi đặt phòng và đăng nhập hệ thống trong các khung giờ cao điểm.
3. **Kiểm thử Tự động Giao diện (Selenium WebDriver):** Đảm bảo luồng trải nghiệm khách hàng (E2E Customer Journey) từ duyệt phòng, chọn ngày, đặt phòng và quản trị diễn ra chính xác, bắt lỗi người dùng nhập sai một cách thân thiện.
