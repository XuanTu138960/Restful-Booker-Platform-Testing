"""
Pytest Fixtures & Configuration cho Selenium Automation Testing
Sinh viên thực hiện: Nguyễn Xuân Tú (MSV: 23010538)
"""

import pytest
import os
import subprocess
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager


@pytest.fixture(scope="session")
def app_server():
    """Khởi chạy ứng dụng Restful-Booker Platform cục bộ trước khi test và tắt sau khi xong"""
    # project_dir là thư mục gốc Restful-Booker-Platform-Testing
    test_dir = os.path.dirname(os.path.abspath(__file__))               # selenium/tests
    selenium_dir = os.path.dirname(test_dir)                            # selenium
    project_dir = os.path.dirname(selenium_dir)                         # Restful-Booker-Platform-Testing
    server_path = os.path.join(project_dir, "app", "server.js")
    
    # Khởi động server Node.js
    proc = subprocess.Popen(["node", server_path], cwd=project_dir, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(2)  # Đợi server sẵn sàng tiếp nhận request
    
    yield "http://localhost:3003"
    
    # Dọn dẹp tiến trình server sau khi hoàn thành toàn bộ test session
    proc.terminate()
    try:
        proc.wait(timeout=3)
    except subprocess.TimeoutExpired:
        proc.kill()


@pytest.fixture(scope="function")
def driver(request):
    """Khởi tạo Chrome WebDriver cho từng test case"""
    chrome_options = Options()
    chrome_options.add_argument("--headless=new")  # Chạy headless siêu tốc độ và ổn định
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--ignore-certificate-errors")

    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
    except Exception:
        # Fallback tới chromedriver mặc định trong hệ thống nếu có
        driver = webdriver.Chrome(options=chrome_options)

    driver.implicitly_wait(5)
    
    yield driver

    # Tự động chụp ảnh khi test case kết thúc
    test_name = request.node.name
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    screenshots_dir = os.path.join(current_dir, "screenshots")
    os.makedirs(screenshots_dir, exist_ok=True)
    screenshot_file = os.path.join(screenshots_dir, f"{test_name}.png")
    try:
        driver.save_screenshot(screenshot_file)
    except Exception:
        pass

    driver.quit()
