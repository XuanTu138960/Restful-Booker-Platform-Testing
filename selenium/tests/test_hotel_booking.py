"""
Bộ kịch bản Kiểm thử tự động Giao diện người dùng (UI E2E Automation Tests)
Đề tài: Đánh giá và kiểm định chất lượng hệ thống đặt phòng khách sạn mã nguồn mở Restful-booker Platform bằng Postman, JMeter và Selenium
Mô phỏng quy trình nghiệp vụ Booking.com
Sinh viên thực hiện: Nguyễn Xuân Tú (MSV: 23010538) - Đại học Phenikaa
"""

import time
import pytest
from pages.home_page import HomePage
from pages.booking_page import BookingPage
from pages.admin_login_page import AdminLoginPage
from pages.admin_dashboard_page import AdminDashboardPage


@pytest.mark.usefixtures("app_server")
class TestHotelBookingPlatform:

    def test_01_verify_homepage_and_room_list(self, driver, app_server):
        """TC01: Kiểm tra giao diện trang chủ, logo và danh sách phòng nghỉ ban đầu"""
        home = HomePage(driver)
        home.load(app_server)
        
        # Kiểm tra hiển thị tiêu đề và logo
        assert "Restful-Booker" in driver.title or "Booking.com" in driver.title
        
        # Kiểm tra danh sách phòng được render từ API
        room_count = home.get_room_count()
        assert room_count >= 4, f"Mong đợi tối thiểu 4 phòng, thực tế hiển thị {room_count}"
        home.take_screenshot("tc01_homepage_rooms_list")

    def test_02_filter_rooms_by_type(self, driver, app_server):
        """TC02: Kiểm tra chức năng tìm kiếm và lọc phòng theo loại (Suite)"""
        home = HomePage(driver)
        home.load(app_server)

        # Lọc phòng theo loại Suite
        home.filter_rooms(room_type="Suite")
        time.sleep(0.5)

        room_count = home.get_room_count()
        assert room_count >= 1, "Bộ lọc phải hiển thị các phòng thuộc loại Suite"
        home.take_screenshot("tc02_filter_rooms_suite")

    def test_03_booking_room_successful_flow(self, driver, app_server):
        """TC03: Thực hiện đặt phòng thành công với dữ liệu hợp lệ (End-to-End Booking Flow)"""
        home = HomePage(driver)
        home.load(app_server)

        # Mở modal đặt phòng
        home.click_first_book_now()

        booking = BookingPage(driver)
        assert booking.is_modal_open(), "Modal đặt phòng phải được hiển thị"

        # Điền thông tin khách hàng đặt phòng (mô phỏng người dùng Booking.com)
        booking.fill_booking_details(
            firstname="Nguyen",
            lastname="Xuan Tu",
            email="23010538@st.phenikaa-uni.edu.vn",
            phone="0987654321"
        )
        booking.confirm_booking()

        # Kiểm tra thông báo đặt phòng thành công
        time.sleep(1)
        alert_text = booking.get_alert_text()
        assert "Đặt phòng thành công" in alert_text, f"Mong đợi thông báo thành công, thực tế: {alert_text}"
        assert booking.is_alert_success()
        booking.take_screenshot("tc03_booking_success")

    def test_04_booking_room_negative_missing_fields(self, driver, app_server):
        """TC04: Đặt phòng thất bại khi bỏ trống các trường bắt buộc (Form Validation Check)"""
        home = HomePage(driver)
        home.load(app_server)

        home.click_first_book_now()

        booking = BookingPage(driver)
        assert booking.is_modal_open()

        # Không điền họ tên, nhập email sai và bấm xác nhận
        booking.fill_booking_details(
            firstname=" ",
            lastname=" ",
            email="invalid_email",
            phone="123"
        )
        booking.confirm_booking()

        time.sleep(0.5)
        # Bắt thông báo lỗi validation
        alert_text = booking.get_alert_text()
        assert "tối thiểu" in alert_text or "Email không đúng định dạng" in alert_text
        assert booking.is_alert_danger()
        booking.take_screenshot("tc04_booking_validation_error")

    def test_05_send_contact_message_successful(self, driver, app_server):
        """TC05: Khách hàng gửi tin nhắn liên hệ / yêu cầu hỗ trợ thành công"""
        home = HomePage(driver)
        home.load(app_server)

        # Điền thông tin gửi tin nhắn
        home.submit_contact_form(
            name="Nguyen Xuan Tu",
            email="23010538@st.phenikaa-uni.edu.vn",
            phone="0987654321",
            subject="Yeu cau ho tro phong huong bien",
            description="Cho toi hoi phong Deluxe Ocean View co ban cong rieng khong a?"
        )

        time.sleep(1)
        alert_text = home.get_contact_alert_text()
        assert "Cảm ơn bạn" in alert_text or "thành công" in alert_text
        home.take_screenshot("tc05_contact_message_success")

    def test_06_send_contact_message_invalid_email(self, driver, app_server):
        """TC06: Gửi tin nhắn liên hệ thất bại khi email không đúng định dạng chuẩn"""
        home = HomePage(driver)
        home.load(app_server)

        home.submit_contact_form(
            name="Customer Error",
            email="notanemail",
            phone="0911223344",
            subject="Tieu de tin nhan",
            description="Noi dung thac mac cua khach hang..."
        )

        time.sleep(0.5)
        alert_text = home.get_contact_alert_text()
        assert "Email không hợp lệ" in alert_text or "thất bại" in alert_text
        home.take_screenshot("tc06_contact_invalid_email")

    def test_07_admin_login_success(self, driver, app_server):
        """TC07: Đăng nhập Cổng Quản trị viên (Admin) thành công với tài khoản chuẩn"""
        home = HomePage(driver)
        home.load(app_server)

        home.open_admin_portal()

        admin_login = AdminLoginPage(driver)
        assert admin_login.is_login_form_visible()

        admin_login.login("admin", "password")

        time.sleep(1)
        admin_dashboard = AdminDashboardPage(driver)
        assert admin_dashboard.is_dashboard_visible(), "Bảng điều khiển Admin phải được hiển thị"
        admin_dashboard.take_screenshot("tc07_admin_login_success")

    def test_08_admin_login_wrong_password(self, driver, app_server):
        """TC08: Đăng nhập Quản trị viên thất bại khi nhập sai mật khẩu (Security Check)"""
        home = HomePage(driver)
        home.load(app_server)

        home.open_admin_portal()

        admin_login = AdminLoginPage(driver)
        admin_login.login("admin", "wrong_admin_pass")

        time.sleep(0.5)
        alert_text = admin_login.get_alert_text()
        assert "không đúng" in alert_text or "Bad credentials" in alert_text
        admin_login.take_screenshot("tc08_admin_login_wrong_password")

    def test_09_admin_create_new_room(self, driver, app_server):
        """TC09: Admin tạo thành công phòng khách sạn mới vào hệ thống (Room Management CMS)"""
        home = HomePage(driver)
        home.load(app_server)

        home.open_admin_portal()
        admin_login = AdminLoginPage(driver)
        admin_login.login("admin", "password")

        time.sleep(1)
        admin_dashboard = AdminDashboardPage(driver)
        
        # Thêm phòng mới
        initial_rooms = admin_dashboard.get_room_stat_count()
        admin_dashboard.create_room(
            room_name="501 - Royal VIP Suite (Selenium Test)",
            room_type="Suite",
            price=320
        )

        time.sleep(1)
        alert_text = admin_dashboard.get_room_alert_text()
        assert "thành công" in alert_text, f"Kỳ vọng tạo phòng thành công, thực tế: {alert_text}"
        admin_dashboard.take_screenshot("tc09_admin_create_room")

    def test_10_admin_logout_successful(self, driver, app_server):
        """TC10: Quản trị viên thực hiện đăng xuất an toàn khỏi hệ thống"""
        home = HomePage(driver)
        home.load(app_server)

        home.open_admin_portal()
        admin_login = AdminLoginPage(driver)
        admin_login.login("admin", "password")

        time.sleep(1)
        admin_dashboard = AdminDashboardPage(driver)
        admin_dashboard.logout()

        time.sleep(0.5)
        assert admin_login.is_login_form_visible(), "Form đăng nhập phải xuất hiện lại sau khi đăng xuất"
        admin_dashboard.take_screenshot("tc10_admin_logout_success")
