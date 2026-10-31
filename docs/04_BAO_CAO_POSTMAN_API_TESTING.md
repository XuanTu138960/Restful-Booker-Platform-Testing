# BÁO CÁO KẾT QUẢ KIỂM THỬ API BẰNG POSTMAN & NEWMAN

---

## 1. TỔNG QUAN ĐỢT KIỂM THỬ

- **Công cụ thực hiện:** Postman Collection v2.1.0 & Newman CLI Runner v6.2.3
- **Hệ thống mục tiêu:** Restful-Booker Platform REST API Services
- **Môi trường thực thi:** Localhost (`http://localhost:3003`)
- **Sinh viên thực hiện:** Nguyễn Xuân Tú (MSV: 23010538)
- **Thời gian thực thi:** 1.62 giây

---

## 2. KẾT QUẢ TỔNG HỢP (EXECUTIVE SUMMARY)

```text
┌─────────────────────────┬───────────────────┬──────────────────┐
│                         │          executed │           failed │
├─────────────────────────┼───────────────────┼──────────────────┤
│              iterations │                 1 │                0 │
├─────────────────────────┼───────────────────┼──────────────────┤
│                requests │                16 │                0 │
├─────────────────────────┼───────────────────┼──────────────────┤
│            test-scripts │                16 │                0 │
├─────────────────────────┼───────────────────┼──────────────────┤
│      prerequest-scripts │                 1 │                0 │
├─────────────────────────┼───────────────────┼──────────────────┤
│              assertions │                32 │                0 │
├─────────────────────────┴───────────────────┴──────────────────┤
│ total run duration: 1616ms                                     │
├────────────────────────────────────────────────────────────────┤
│ total data received: 5.05kB (approx)                           │
├────────────────────────────────────────────────────────────────┤
│ average response time: 12ms [min: 4ms, max: 117ms, s.d.: 26ms] │
└────────────────────────────────────────────────────────────────┘
```

- **Tổng số Request thực thi:** 16 requests
- **Tổng số Assertions kiểm tra:** 32 assertions
- **Số Assertions đạt (PASSED):** 32 / 32 (**100%**)
- **Số Assertions thất bại (FAILED):** 0
- **Thời gian phản hồi trung bình (Average Latency):** 12 ms (cực kỳ nhanh, đáp ứng hoàn hảo tiêu chí < 500ms).

---

## 3. CHI TIẾT KẾT QUẢ THEO TỪNG NHÓM DỊCH VỤ

### 3.1. Nhóm Dịch vụ Xác thực (Authentication Services)
1. **TC_API_01: Login Success (Valid Admin Credentials)**
   - Phương thức: `POST /auth/login`
   - Mã trạng thái: `200 OK` (117ms)
   - Assertions:
     - `pm.response.to.have.status(200)`: **PASSED**
     - `pm.expect(pm.response.responseTime).to.be.below(500)`: **PASSED**
     - `pm.expect(jsonData).to.have.property('token')`: **PASSED**
   - Kết luận: Hệ thống sinh token hợp lệ và lưu vào biến môi trường `admin_token`.

2. **TC_API_02: Login Failed (Wrong Password)**
   - Phương thức: `POST /auth/login`
   - Mã trạng thái: `403 Forbidden` (10ms)
   - Assertions:
     - `pm.response.to.have.status(403)`: **PASSED**
     - `pm.expect(jsonData.error).to.eql('Bad credentials')`: **PASSED**

3. **TC_API_03: Validate Auth Token**
   - Phương thức: `POST /auth/validate`
   - Mã trạng thái: `200 OK` (7ms)
   - Assertions:
     - `pm.response.to.have.status(200)`: **PASSED**
     - `Token is validated successfully`: **PASSED**

### 3.2. Nhóm Dịch vụ Danh mục Phòng (Room Management Services)
4. **TC_API_04: Get All Hotel Rooms**
   - Phương thức: `GET /room/`
   - Mã trạng thái: `200 OK` (7ms)
   - Assertions: Mảng phòng hợp lệ, `roomPrice` > 0.
5. **TC_API_05: Get Single Room By ID**
   - Phương thức: `GET /room/1`
   - Mã trạng thái: `200 OK` (5ms)
   - Assertions: Đúng ID phòng `1`.
6. **TC_API_06: Create New Room (Admin Authorized)**
   - Phương thức: `POST /room/`
   - Mã trạng thái: `201 Created` (7ms)
   - Assertions: Trả về ID phòng mới tạo và các tiện ích.
7. **TC_API_07: Create Room Without Token (Negative)**
   - Phương thức: `POST /room/`
   - Mã trạng thái: `403 Forbidden` (6ms)
   - Assertions: Từ chối yêu cầu tạo phòng khi không có token Admin.

### 3.3. Nhóm Dịch vụ Đặt phòng (Booking Engine Services)
8. **TC_API_08: Get All Bookings**
   - Phương thức: `GET /booking/`
   - Mã trạng thái: `200 OK` (5ms)
9. **TC_API_09: Create Booking Success (Valid Information)**
   - Phương thức: `POST /booking/`
   - Mã trạng thái: `201 Created` (6ms)
   - Assertions: Tính toán `totalprice` chính xác và sinh `bookingid`.
10. **TC_API_10: Create Booking Missing Required Fields (Negative)**
    - Phương thức: `POST /booking/`
    - Mã trạng thái: `400 Bad Request` (6ms)
    - Assertions: Trả về danh sách chi tiết các trường bị thiếu hoặc sai định dạng.
11. **TC_API_11: Create Booking Duplicate Dates (Conflict Check)**
    - Phương thức: `POST /booking/`
    - Mã trạng thái: `409 Conflict` (6ms)
    - Assertions: Phát hiện phòng đã được đặt và trả về thông báo xung đột.

### 3.4. Nhóm Hộp thư Khách hàng & Báo cáo (Messages & Reports)
12. **TC_API_12: Send Customer Contact Message Success**
    - Phương thức: `POST /message/`
    - Mã trạng thái: `201 Created` (5ms)
13. **TC_API_13: Send Message Invalid Format (Negative)**
    - Phương thức: `POST /message/`
    - Mã trạng thái: `400 Bad Request` (6ms)
14. **TC_API_14: Get All Messages (Admin Authorized)**
    - Phương thức: `GET /message/`
    - Mã trạng thái: `200 OK` (5ms)
15. **TC_API_15: Get Hotel Branding Info**
    - Phương thức: `GET /branding/`
    - Mã trạng thái: `200 OK` (5ms)
16. **TC_API_16: Get Hotel Statistics Report**
    - Phương thức: `GET /report/`
    - Mã trạng thái: `200 OK` (4ms)

---

## 4. HƯỚNG DẪN TỰ ĐỘNG CHẠY KIỂM THỬ POSTMAN
Người dùng có thể chạy trực tiếp bằng dòng lệnh:
```bash
cd postman
node run_newman.js
```
Hoặc chạy trực tiếp với `newman`:
```bash
npx newman run Restful_Booker_Platform_Collection.json -e Restful_Booker_Platform_Environment.json
```
File báo cáo chi tiết được lưu tự động tại: `postman/reports/newman_cli_report.txt`.
