# BẢNG ĐẶC TẢ KỊCH BẢN KIỂM THỬ CHI TIẾT (TEST CASES SPECIFICATION)

---

## 1. BẢNG TEST CASES KIỂM THỬ API VỚI POSTMAN (16 TEST CASES)

| Mã TC | Tên Test Case | Phương thức | URL Endpoint | Dữ liệu đầu vào (Payload/Headers) | Kết quả mong đợi (Expected Result) | Loại kiểm thử |
|---|---|---|---|---|---|---|
| **TC_API_01** | Đăng nhập Admin thành công | POST | `/auth/login` | Body: `{"username": "admin", "password": "password"}` | HTTP 200 OK, trả về chuỗi `token`, lưu token vào Environment | Positive |
| **TC_API_02** | Đăng nhập sai mật khẩu | POST | `/auth/login` | Body: `{"username": "admin", "password": "wrong"}` | HTTP 403 Forbidden, thông báo `Bad credentials` | Negative |
| **TC_API_03** | Xác thực Token hợp lệ | POST | `/auth/validate` | Body: `{"token": "{{admin_token}}"}` | HTTP 200 OK, xác nhận token còn hiệu lực | Positive |
| **TC_API_04** | Lấy danh sách toàn bộ phòng | GET | `/room/` | Không | HTTP 200 OK, mảng `rooms` không rỗng, chứa các trường giá phòng > 0 | Positive |
| **TC_API_05** | Lấy chi tiết phòng theo ID | GET | `/room/1` | Không | HTTP 200 OK, đối tượng phòng trả về có `roomid` trùng khớp với yêu cầu | Positive |
| **TC_API_06** | Tạo mới phòng (Có token Admin) | POST | `/room/` | Header: `token: {{admin_token}}`, Body: Thông tin phòng | HTTP 201 Created, trả về đối tượng phòng kèm ID tự động tăng | Positive |
| **TC_API_07** | Tạo phòng không có quyền Admin | POST | `/room/` | Header không có token | HTTP 403 Forbidden, từ chối hành động tạo phòng trái phép | Negative |
| **TC_API_08** | Lấy danh sách các đơn đặt phòng | GET | `/booking/` | Không | HTTP 200 OK, trả về mảng `bookings` | Positive |
| **TC_API_09** | Đặt phòng thành công | POST | `/booking/` | Body: `{"roomid": 2, "firstname": "Nguyen", "lastname": "Xuan Tu", ...}` | HTTP 201 Created, sinh `bookingid`, tính đúng tổng tiền `totalprice` | Positive |
| **TC_API_10** | Đặt phòng thiếu trường bắt buộc | POST | `/booking/` | Body: Họ tên trống, email sai định dạng | HTTP 400 Bad Request, trả về danh sách mảng `errors` mô tả lỗi chi tiết | Negative |
| **TC_API_11** | Đặt phòng trùng lặp lịch (Overbooking) | POST | `/booking/` | Body: `roomid` và ngày checkin trùng đơn đã có | HTTP 409 Conflict, thông báo phòng đã được đặt trong khoảng thời gian này | Negative (Conflict) |
| **TC_API_12** | Khách gửi liên hệ thành công | POST | `/message/` | Body: Họ tên, email hợp lệ, sđt, tiêu đề, nội dung | HTTP 201 Created, tạo mới tin nhắn và sinh mã `id` | Positive |
| **TC_API_13** | Gửi liên hệ email không hợp lệ | POST | `/message/` | Body: `email: "invalidemail"` | HTTP 400 Bad Request, từ chối tiếp nhận | Negative |
| **TC_API_14** | Admin đọc danh sách tin nhắn | GET | `/message/` | Header: `token: {{admin_token}}` | HTTP 200 OK, trả về danh sách `messages` | Positive |
| **TC_API_15** | Lấy thông tin nhận diện khách sạn | GET | `/branding/` | Không | HTTP 200 OK, chứa tên khách sạn, địa chỉ, hotline | Positive |
| **TC_API_16** | Xem báo cáo thống kê khách sạn | GET | `/report/` | Không | HTTP 200 OK, trả về `totalRooms`, `totalBookings`, `totalRevenue` | Positive |

---

## 2. BẢNG KỊCH BẢN KIỂM THỬ HIỆU NĂNG VỚI JMETER

| Nhóm luồng (Thread Group) | Số người dùng ảo (Threads) | Thời gian tăng tải (Ramp-up) | Số vòng lặp (Loops) | Tổng số yêu cầu | Danh sách Samplers thực thi | Tiêu chí đánh giá (Assertion & KPI) |
|---|---|---|---|---|---|---|
| **TG01: Duyệt phòng & Khách sạn** | 10 Users | 5 giây | 5 | 50 requests | `HTTP_GET_Rooms_List`<br>`HTTP_GET_Booking_Summary` | Response Code = 200<br>Độ trễ phản hồi < 500ms |
| **TG02: Đặt phòng & Liên hệ đồng thời** | 20 Users | 5 giây | 3 | 60 requests | `HTTP_POST_Room_Booking`<br>`HTTP_POST_Customer_Contact` | Response Code = 201 hoặc 409<br>Không xảy ra lỗi sập dịch vụ (5xx) |
| **TG03: Đăng nhập Admin & Báo cáo** | 5 Users | 2 giây | 2 | 10 requests | `HTTP_POST_Admin_Login`<br>`HTTP_GET_Reports` | Response Code = 200<br>Throughput cao, CPU máy chủ ổn định |

---

## 3. BẢNG TEST CASES KIỂM THỬ TỰ ĐỘNG GIAO DIỆN (SELENIUM UI - 10 TEST CASES)

| Mã TC | Tên chức năng kiểm thử | Các bước thực hiện (Steps) | Dữ liệu đầu vào (Test Data) | Kết quả mong đợi (Expected Result) | Trạng thái thực thi |
|---|---|---|---|---|---|
| **TC01** | Kiểm tra hiển thị Trang chủ & Danh sách phòng | 1. Mở trình duyệt đến trang chủ<br>2. Kiểm tra logo và danh sách phòng | URL: `http://localhost:3003` | Tiêu đề chứa "Restful-Booker", danh sách hiển thị tối thiểu 4 phòng nghỉ | **PASSED** |
| **TC02** | Lọc danh sách phòng theo loại Suite | 1. Chọn dropdown loại phòng = "Suite"<br>2. Bấm nút "Tìm kiếm phòng" | Type = "Suite" | Danh sách phòng chỉ hiển thị các phòng có nhãn "Suite" | **PASSED** |
| **TC03** | Quy trình Đặt phòng hoàn chỉnh thành công | 1. Bấm nút "Đặt phòng ngay" tại phòng đầu tiên<br>2. Điền họ, tên, email, sđt hợp lệ<br>3. Bấm "Xác nhận đặt phòng" | Firstname: Nguyen<br>Lastname: Xuan Tu<br>Email: 23010538@st.phenikaa-uni.edu.vn<br>Phone: 0987654321 | Hộp thoại hiển thị thông báo "Đặt phòng thành công!", sinh mã đặt phòng và tổng tiền | **PASSED** |
| **TC04** | Đặt phòng thất bại khi bỏ trống các trường bắt buộc | 1. Mở modal đặt phòng<br>2. Bỏ trống họ tên, nhập email sai cú pháp<br>3. Bấm "Xác nhận đặt phòng" | Firstname: " "<br>Lastname: " "<br>Email: "invalid_email"<br>Phone: "123" | Xuất hiện thông báo cảnh báo màu đỏ: "Họ tên tối thiểu 3 ký tự" hoặc "Email không đúng định dạng" | **PASSED** |
| **TC05** | Khách hàng gửi tin nhắn liên hệ thành công | 1. Cuộn đến phần Contact Us<br>2. Điền đầy đủ Name, Email, Phone, Subject, Content<br>3. Bấm "Gửi tin nhắn liên hệ" | Name: Nguyen Xuan Tu<br>Email: 23010538@st.phenikaa-uni.edu.vn<br>Phone: 0987654321<br>Subject: Ho tro huong bien | Hiển thị thông báo màu xanh "Cảm ơn bạn! Tin nhắn đã được gửi thành công" | **PASSED** |
| **TC06** | Gửi tin nhắn thất bại khi nhập sai định dạng email | 1. Cuộn đến form liên hệ<br>2. Nhập Email = "notanemail"<br>3. Bấm gửi | Email: "notanemail" | Hiển thị thông báo lỗi màu đỏ: "Email không hợp lệ" | **PASSED** |
| **TC07** | Đăng nhập Cổng Quản trị Admin thành công | 1. Bấm nút "Admin Panel" trên thanh header<br>2. Nhập username = "admin", password = "password"<br>3. Bấm "Đăng nhập Admin" | Username: `admin`<br>Password: `password` | Ẩn form đăng nhập, hiển thị Bảng điều khiển Quản trị (Admin Dashboard CMS) | **PASSED** |
| **TC08** | Đăng nhập Admin thất bại khi nhập sai mật khẩu | 1. Mở form đăng nhập Admin<br>2. Nhập sai password = "wrong_admin_pass"<br>3. Bấm đăng nhập | Username: `admin`<br>Password: `wrong_admin_pass` | Xuất hiện thông báo cảnh báo: "Tên đăng nhập hoặc mật khẩu không đúng" | **PASSED** |
| **TC09** | Admin tạo thành công phòng mới vào hệ thống | 1. Đăng nhập Admin<br>2. Tại tab Quản lý Phòng, điền tên phòng, loại phòng, giá tiền<br>3. Bấm "Tạo phòng mới" | Room Name: 501 - Royal VIP Suite<br>Type: Suite<br>Price: 320 | Bảng danh sách phòng được cập nhật thêm phòng 501, hiển thị thông báo thành công | **PASSED** |
| **TC10** | Quản trị viên thực hiện đăng xuất an toàn | 1. Tại giao diện Admin Dashboard<br>2. Bấm nút "Đăng xuất" | Thao tác Click | Phiên làm việc kết thúc, xóa token và giao diện trở về form đăng nhập | **PASSED** |
