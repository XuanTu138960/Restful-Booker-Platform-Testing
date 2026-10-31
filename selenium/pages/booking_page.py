"""
BookingPage - Page Object cho Hộp thoại / Quy trình Đặt phòng Khách sạn
Mô phỏng trải nghiệm người dùng Booking.com & Restful-Booker Platform
Sinh viên thực hiện: Nguyễn Xuân Tú (MSV: 23010538)
"""

from selenium.webdriver.common.by import By
from pages.base_page import BasePage


class BookingPage(BasePage):
    # Locators
    MODAL_OVERLAY = (By.ID, "booking-modal")
    MODAL_TITLE = (By.ID, "modal-room-title")
    CHECKIN_INPUT = (By.ID, "booking-checkin")
    CHECKOUT_INPUT = (By.ID, "booking-checkout")
    FIRSTNAME_INPUT = (By.ID, "booking-firstname")
    LASTNAME_INPUT = (By.ID, "booking-lastname")
    EMAIL_INPUT = (By.ID, "booking-email")
    PHONE_INPUT = (By.ID, "booking-phone")
    CONFIRM_BTN = (By.ID, "btn-confirm-booking")
    CANCEL_BTN = (By.ID, "btn-cancel-booking")
    BOOKING_ALERT = (By.ID, "booking-alert")

    def __init__(self, driver):
        super().__init__(driver)

    def is_modal_open(self):
        """Kiểm tra modal đặt phòng có mở không"""
        return self.is_visible(self.MODAL_TITLE)

    def fill_booking_details(self, firstname, lastname, email, phone, checkin=None, checkout=None):
        """Điền thông tin khách hàng đặt phòng"""
        if checkin:
            self.send_keys(self.CHECKIN_INPUT, checkin)
        if checkout:
            self.send_keys(self.CHECKOUT_INPUT, checkout)
            
        self.send_keys(self.FIRSTNAME_INPUT, firstname)
        self.send_keys(self.LASTNAME_INPUT, lastname)
        self.send_keys(self.EMAIL_INPUT, email)
        self.send_keys(self.PHONE_INPUT, phone)

    def confirm_booking(self):
        """Bấm nút xác nhận đặt phòng"""
        self.click(self.CONFIRM_BTN)

    def cancel_booking(self):
        """Bấm hủy bỏ đặt phòng"""
        self.click(self.CANCEL_BTN)

    def get_alert_text(self):
        """Lấy nội dung thông báo thành công hoặc lỗi"""
        return self.get_text(self.BOOKING_ALERT)

    def is_alert_success(self):
        """Kiểm tra thông báo có thuộc class thành công"""
        alert = self.find_visible_element(self.BOOKING_ALERT)
        return "alert-success" in alert.get_attribute("class")

    def is_alert_danger(self):
        """Kiểm tra thông báo có thuộc class cảnh báo lỗi"""
        alert = self.find_visible_element(self.BOOKING_ALERT)
        return "alert-danger" in alert.get_attribute("class")
