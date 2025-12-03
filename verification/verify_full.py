from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        print("Navigating...")
        page.goto("http://localhost:5173")
        page.get_by_text("START GAME").click()

        # Wait for setup phase load
        page.wait_for_timeout(1000)

        print("Entering Battle...")
        page.get_by_text("ENTER BATTLE").click()

        # Check we are in battle
        try:
            page.wait_for_selector("text=PLAYER TURN", timeout=5000)
        except:
            print("Failed to enter battle. Taking screenshot.")
            page.screenshot(path="verification/failed_bypass.png")
            raise

        # 1. Target All
        print("Testing Target All...")
        # The button is named "Attack"
        page.get_by_role("button", name="Attack").click()
        page.get_by_text("Test Target All").click()
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/1_target_all.png")

        # Attack All
        print("Executing Attack All...")
        enemy = page.locator("text=P").first
        enemy.click()
        page.wait_for_timeout(2000)
        page.screenshot(path="verification/1_attack_all_log.png")

        # Restart
        print("Restarting for next test...")
        page.reload()
        page.get_by_text("START GAME").click()
        page.wait_for_timeout(1000)
        page.get_by_text("ENTER BATTLE").click()
        page.wait_for_selector("text=PLAYER TURN", timeout=5000)

        # 2. Projectile Single
        print("Testing Projectile Single...")
        page.get_by_role("button", name="Attack").click()
        page.get_by_text("Test Target Projectile Single").click()
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/2_projectile.png")

        # 3. Self Heal
        print("Testing Self Heal...")
        page.get_by_text("CANCEL ACTION").click()
        page.get_by_role("button", name="Attack").click()
        page.get_by_text("Test Self Heal").click()
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/3_self_heal.png")

        # Execute Heal
        print("Executing Self Heal...")
        page.locator("text=M").first.click()
        page.wait_for_timeout(2000)
        page.screenshot(path="verification/3_heal_log.png")

        browser.close()

if __name__ == "__main__":
    run()
