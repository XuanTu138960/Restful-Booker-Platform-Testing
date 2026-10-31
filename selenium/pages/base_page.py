"""
BasePage - Lớp cơ sở cung cấp các hàm tiện ích Selenium WebDriver chung
Áp dụng mẫu thiết kế Page Object Model (POM)
Sinh viên thực hiện: Nguyễn Xuân Tú (MSV: 23010538)
"""

import os
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException


class BasePage:
    def __init__(self, driver, timeout=10):
        self.driver = driver
        self.timeout = timeout
        self.wait = WebDriverWait(driver, timeout)

    def navigate_to(self, url):
        """Điều hướng trình duyệt đến URL chỉ định"""
        self.driver.get(url)

    def find_element(self, locator):
        """Tìm phần tử trên trang với Explicit Wait"""
        return self.wait.until(EC.presence_of_element_located(locator))

    def find_clickable_element(self, locator):
        """Tìm phần tử có thể click được"""
        return self.wait.until(EC.element_to_be_clickable(locator))

    def find_visible_element(self, locator):
        """Tìm phần tử hiển thị trực quan trên DOM"""
        return self.wait.until(EC.visibility_of_element_located(locator))

    def click(self, locator):
        """Thực hiện click vào phần tử"""
        element = self.find_clickable_element(locator)
        element.click()

    def send_keys(self, locator, text, clear_first=True):
        """Nhập nội dung vào ô input"""
        element = self.find_visible_element(locator)
        if clear_first:
            element.clear()
        element.send_keys(text)

    def get_text(self, locator):
        """Lấy văn bản hiển thị của phần tử"""
        element = self.find_visible_element(locator)
        return element.text.strip()

    def is_visible(self, locator, timeout=5):
        """Kiểm tra phần tử có hiển thị không"""
        try:
            WebDriverWait(self.driver, timeout).until(EC.visibility_of_element_located(locator))
            return True
        except TimeoutException:
            return False

    def scroll_to_element(self, locator):
        """Cuộn màn hình đến phần tử"""
        element = self.find_element(locator)
        self.driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", element)
        time.sleep(0.3)

    def take_screenshot(self, name):
        """Chụp ảnh màn hình minh chứng và lưu vào thư mục screenshots"""
        current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        screenshot_dir = os.path.join(current_dir, "screenshots")
        os.makedirs(screenshot_dir, exist_ok=True)
        file_path = os.path.join(screenshot_dir, f"{name}.png")
        self.driver.save_screenshot(file_path)
        return file_path
