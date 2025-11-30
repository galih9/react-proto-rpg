from playwright.sync_api import sync_playwright

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        page.goto("http://localhost:5173")
        page.wait_for_timeout(1000)

        # Click Start Game
        page.get_by_text("START GAME").click()
        page.wait_for_timeout(1000)

        # Take screenshot of Setup Phase
        page.screenshot(path="verification/setup_phase.png")
        print("Setup screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_changes()
