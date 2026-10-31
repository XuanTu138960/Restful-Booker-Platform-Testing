"""
AdminLoginPage - Page Object cho Form Đăng nhập Quản trị viên
Sinh viên thực hiện: Nguyễn Xuân Tú (MSV: 23010538)
"""

from selenium.webdriver.common.by import By
from pages.base_page import BasePage


class AdminLoginPage(BasePage):
    # Locators
    ADMIN_MODAL = (By.ID, "admin-modal")
    LOGIN_VIEW = (By.ID, "admin-login-view")
    USERNAME_INPUT = (By.ID, "admin-username")
    PASSWORD_INPUT = (By.ID, "admin-password")
    LOGIN_BTN = (By.ID, "btn-admin-login")
    LOGIN_ALERT = (By.ID, "admin-login-alert")
    CLOSE_BTN = (By.ID, "btn-close-admin-modal")

    def __init__(self, driver):
        super().__init__(driver)

    def is_login_form_visible(self):
        return self.is_visible(self.LOGIN_VIEW)

    def login(self, username, password):
        """Thực hiện đăng nhập với tài khoản quản trị"""
        self.send_keys(self.USERNAME_INPUT, username)
        self.send_keys(self.PASSWORD_INPUT, password)
        self.click(self.LOGIN_BTN)

    def get_alert_text(self):
        return self.get_text(self.LOGIN_ALERT)

    def close_modal(self):
        self.click(self.CLOSE_BTN)
