"""
HomePage - Page Object cho Trang chủ Khách sạn & Form Liên hệ
Mô phỏng trải nghiệm người dùng Booking.com
Sinh viên thực hiện: Nguyễn Xuân Tú (MSV: 23010538)
"""

from selenium.webdriver.common.by import By
from pages.base_page import BasePage


class HomePage(BasePage):
    # Locators
    LOGO = (By.CLASS_NAME, "logo-title")
    SEARCH_TYPE_SELECT = (By.ID, "filter-type")
    SEARCH_ACCESSIBLE_SELECT = (By.ID, "filter-accessible")
    SEARCH_BTN = (By.ID, "btn-search-rooms")
    ROOM_CARDS = (By.CLASS_NAME, "room-card")
    FIRST_BOOK_BTN = (By.CSS_SELECTOR, ".room-card:first-child .btn-book-room")
    
    # Contact Form Locators
    CONTACT_NAME = (By.ID, "contact-name")
    CONTACT_EMAIL = (By.ID, "contact-email")
    CONTACT_PHONE = (By.ID, "contact-phone")
    CONTACT_SUBJECT = (By.ID, "contact-subject")
    CONTACT_DESC = (By.ID, "contact-description")
    CONTACT_SUBMIT_BTN = (By.ID, "btn-submit-contact")
    CONTACT_ALERT = (By.ID, "contact-alert")

    # Admin Button
    ADMIN_PANEL_BTN = (By.ID, "btn-open-admin")

    def __init__(self, driver):
        super().__init__(driver)

    def load(self, base_url="http://localhost:3003"):
        self.navigate_to(base_url)
        self.find_visible_element(self.LOGO)

    def get_room_count(self):
        """Đếm số lượng phòng hiển thị trên giao diện"""
        cards = self.driver.find_elements(*self.ROOM_CARDS)
        return len(cards)

    def filter_rooms(self, room_type="ALL", accessible="ALL"):
        """Lọc phòng theo loại hoặc tiện ích"""
        if room_type != "ALL":
            select_elem = self.find_visible_element(self.SEARCH_TYPE_SELECT)
            for option in select_elem.find_elements(By.TAG_NAME, "option"):
                if option.get_attribute("value") == room_type:
                    option.click()
                    break
        self.click(self.SEARCH_BTN)

    def click_first_book_now(self):
        """Bấm nút đặt phòng đầu tiên"""
        self.scroll_to_element(self.FIRST_BOOK_BTN)
        self.click(self.FIRST_BOOK_BTN)

    def submit_contact_form(self, name, email, phone, subject, description):
        """Điền và gửi form liên hệ hỗ trợ khách hàng"""
        self.scroll_to_element(self.CONTACT_NAME)
        self.send_keys(self.CONTACT_NAME, name)
        self.send_keys(self.CONTACT_EMAIL, email)
        self.send_keys(self.CONTACT_PHONE, phone)
        self.send_keys(self.CONTACT_SUBJECT, subject)
        self.send_keys(self.CONTACT_DESC, description)
        self.click(self.CONTACT_SUBMIT_BTN)

    def get_contact_alert_text(self):
        """Lấy nội dung thông báo kết quả gửi liên hệ"""
        return self.get_text(self.CONTACT_ALERT)

    def open_admin_portal(self):
        """Bấm mở cổng đăng nhập Admin"""
        self.click(self.ADMIN_PANEL_BTN)
