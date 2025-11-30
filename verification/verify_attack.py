
import time
from playwright.sync_api import sync_playwright

def verify_attack_menu():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5173")

        # Start Game
        page.get_by_role("button", name="START GAME").click()

        # Setup: Drag Unit to Tile
        page.wait_for_selector(".bg-slate-700")
        unit = page.locator(".bg-slate-700 > div").first
        target_tile = page.locator(".grid > div").first
        unit.drag_to(target_tile)

        # Enter Battle
        page.get_by_role("button", name="ENTER BATTLE").click()
        page.wait_for_selector("text=PLAYER TURN")

        # Select Unit to open menu
        target_tile.click()

        # Verify Menu is visible
        page.wait_for_selector("text=Attack")

        # Click "Attack"
        page.get_by_role("button", name="Attack").click()

        # Select Skill "Basic Attack"
        page.get_by_role("button", name="Basic Attack").click()

        # Select Target (Enemy)
        # We need to find an enemy tile.
        # Enemy is usually on the right side.
        # In grid 5x5: indices 3,4, 8,9 ...
        # Enemy unit has .bg-red-100 tile? No, tile zone is ENEMY.
        # DraggableUnit for enemy.
        # Let's just click any enemy unit.
        # Enemy units have red border or something?
        # Let's find by text? "Enemy" or name?
        # Names are random/constant.
        # In `constants.ts` or `useGameLogic.ts`:
        # `const enemies = units.filter((u) => u.type === "ENEMY" ...)`
        # Let's just click the 4th tile (index 3).

        enemy_tile = page.locator(".grid > div").nth(3)
        enemy_tile.click()

        # Immediately screenshot to verify menu hidden during attack
        page.screenshot(path="verification/attack_executing.png")

        # Wait for attack animation (1.5s approx)
        time.sleep(2)

        # Verify menu reappears (points should be > 0? Starts at 2. Attack costs 2.
        # Points -> 0.
        # Turn ends -> Enemy Turn -> Player Turn.
        # Wait for Player Turn.

        page.wait_for_selector("text=PLAYER TURN", timeout=10000)

        # Click unit again to verify menu works
        target_tile.click()
        page.wait_for_selector("text=Attack")

        page.screenshot(path="verification/attack_restored.png")

        browser.close()

if __name__ == "__main__":
    verify_attack_menu()
