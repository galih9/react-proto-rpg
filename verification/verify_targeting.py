from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        # 1. Start Game
        page.goto("http://localhost:5173")
        page.get_by_text("START GAME").click()

        # 2. Setup (Drag Raka to (0,0))
        # Raka is "M" (based on id p1)
        raka_drag = page.locator("text=M").first

        # In setup phase, there is a grid.
        # Let's try to drag to the first drop target.
        # We can find drop targets by class if needed or just coordinates.
        # The grid is usually 5 columns.
        target_tile = page.locator(".grid > div").first

        raka_drag.drag_to(target_tile)

        # 3. Enter Battle
        page.get_by_text("ENTER BATTLE").click()

        # 4. Select Raka (now on board)
        page.wait_for_timeout(1000)

        # Need to be careful: "M" might appear multiple times if not unique,
        # but p1 is unique char usually.
        raka = page.locator("text=M").first
        raka.click()

        # 5. Open Skills
        # Maybe the menu takes time to animate or appear.
        # "SKILLS" might be case sensitive?
        # The menu component is FloatingActionMenu.
        # It likely has an icon or text.
        # Let us look for the button that opens skills.
        # Usually it is labeled "SKILL" or has an icon.
        # I will take a screenshot first if this fails to debug.
        try:
            page.get_by_role("button", name="SKILL").click(timeout=5000)
        except:
            print("Failed to click SKILL button. Taking debug screenshot.")
            page.screenshot(path="verification/debug_menu.png")
            raise


        # 6. Select "Test Target All"
        page.get_by_text("Test Target All").click()

        # 7. Verify Targeting Mode
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/targeting_all.png")

        # 8. Test Click to Attack (on an enemy)
        enemy = page.locator("text=P").last
        enemy.click()

        page.wait_for_timeout(2000)
        page.screenshot(path="verification/attack_all_log.png")

        browser.close()

if __name__ == "__main__":
    run()
