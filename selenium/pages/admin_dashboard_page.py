"""
AdminDashboardPage - Page Object cho Bảng điều khiển Quản trị viên
Quản lý phòng (Room CMS) và Hộp thư khách hàng (Messages)
Sinh viên thực hiện: Nguyễn Xuân Tú (MSV: 23010538)
"""

from selenium.webdriver.common.by import By
from pages.base_page import BasePage


class AdminDashboardPage(BasePage):
    # Locators
    DASHBOARD_VIEW = (By.ID, "admin-dashboard-view")
    LOGOUT_BTN = (By.ID, "btn-admin-logout")
    STAT_ROOMS = (By.ID, "stat-rooms")
    STAT_BOOKINGS = (By.ID, "stat-bookings")
    
    # Room Management Locators
    TAB_ROOMS = (By.ID, "tab-btn-rooms")
    TAB_MESSAGES = (By.ID, "tab-btn-messages")
    ROOM_NAME_INPUT = (By.ID, "create-room-name")
    ROOM_TYPE_SELECT = (By.ID, "create-room-type")
    ROOM_PRICE_INPUT = (By.ID, "create-room-price")
    CREATE_ROOM_BTN = (By.ID, "btn-create-room")
    ROOM_ALERT = (By.ID, "admin-room-alert")
    ROOM_ROWS = (By.CSS_SELECTOR, "#admin-rooms-tbody tr")
    
    # Messages Locators
    MESSAGES_LIST = (By.ID, "admin-messages-list")
    MESSAGE_ITEMS = (By.CLASS_NAME, "message-item")
    CLOSE_BTN = (By.ID, "btn-close-admin-modal")

    def __init__(self, driver):
        super().__init__(driver)

    def is_dashboard_visible(self):
        return self.is_visible(self.DASHBOARD_VIEW)

    def get_room_stat_count(self):
        return int(self.get_text(self.STAT_ROOMS))

    def create_room(self, room_name, room_type, price):
        """Thêm mới phòng khách sạn"""
        self.send_keys(self.ROOM_NAME_INPUT, room_name)
        select_elem = self.find_visible_element(self.ROOM_TYPE_SELECT)
        for opt in select_elem.find_elements(By.TAG_NAME, "option"):
            if opt.get_attribute("value") == room_type:
                opt.click()
                break
        self.send_keys(self.ROOM_PRICE_INPUT, str(price))
        self.click(self.CREATE_ROOM_BTN)

    def get_room_alert_text(self):
        return self.get_text(self.ROOM_ALERT)

    def switch_to_messages_tab(self):
        self.click(self.TAB_MESSAGES)

    def get_message_count(self):
        items = self.driver.find_elements(*self.MESSAGE_ITEMS)
        return len(items)

    def logout(self):
        self.click(self.LOGOUT_BTN)

    def close_modal(self):
        self.click(self.CLOSE_BTN)
