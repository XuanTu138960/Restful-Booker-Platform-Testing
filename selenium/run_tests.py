"""
Script dieu phoi thuc thi bo kiem thu tu dong Selenium voi Pytest
Xuat bao cao chi tiet Pytest-HTML va chup anh minh chung
Sinh vien thuc hien: Nguyen Xuan Tu (MSV: 23010538) - Dai hoc Phenikaa
"""

import os
import sys
import subprocess

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def main():
    print("=" * 65)
    print("  KHOI CHAY KIEM THU TU DONG GIAO DIEN (SELENIUM WEBDRIVER)")
    print("  De tai: Danh gia chat luong Restful-Booker Platform")
    print("  Mo phong nghiep vu Booking.com")
    print("  Sinh vien: Nguyen Xuan Tu - MSV: 23010538 (Phenikaa Uni)")
    print("=" * 65 + "\n")

    current_dir = os.path.dirname(os.path.abspath(__file__))
    reports_dir = os.path.join(current_dir, "reports")
    screenshots_dir = os.path.join(current_dir, "screenshots")
    os.makedirs(reports_dir, exist_ok=True)
    os.makedirs(screenshots_dir, exist_ok=True)

    report_html = os.path.join(reports_dir, "selenium_report.html")

    pytest_cmd = [
        sys.executable, "-m", "pytest",
        os.path.join(current_dir, "tests"),
        "-v",
        f"--html={report_html}",
        "--self-contained-html"
    ]

    print(f"Dang thuc thi: {' '.join(pytest_cmd)}\n")
    result = subprocess.run(pytest_cmd, cwd=current_dir)

    print("\n" + "=" * 65)
    if result.returncode == 0:
        print("[THANH CONG] TAT CA TEST CASES DA PASSED 100%!")
    else:
        print(f"[CANH BAO] Ket qua tra ve ma: {result.returncode}")
    
    print(f"Bao cao HTML da xuat ra tai: {report_html}")
    print(f"Thu muc anh minh chung: {screenshots_dir}")
    print("=" * 65)

if __name__ == "__main__":
    main()
