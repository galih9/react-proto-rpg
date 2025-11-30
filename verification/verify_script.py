
import time
from playwright.sync_api import sync_playwright

def verify_hide_menu():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5173")

        # Start Game
        page.get_by_role("button", name="START GAME").click()

        # Setup: Drag Unit to Tile
        # We need to find the draggable unit and a target tile.
        # Draggable units are in the staging area.
        # Target tile is a blue tile (PLAYER zone).

        # Locate the unit (assuming it has text "Player 1" or similar, or just first draggable)
        # DraggableUnit has displayName.
        # Staging area is `.bg-slate-700`.

        # Wait for units to appear
        page.wait_for_selector(".bg-slate-700")

        # Drag Logic
        unit = page.locator(".bg-slate-700 > div").first
        target_tile = page.locator(".grid > div").first # First tile is usually (0,0) which is PLAYER zone.

        unit.drag_to(target_tile)

        # Enter Battle
        page.get_by_role("button", name="ENTER BATTLE").click()

        # Wait for Battle Interface
        page.wait_for_selector("text=PLAYER TURN")

        # Select Unit to open menu
        # The unit is now on the grid.
        # We can click the unit on the grid.
        target_tile.click()

        # Verify Menu is visible
        page.wait_for_selector("text=Guard")

        # Click "Wait" and immediately screenshot
        # "Wait" button: role button, name "Wait"
        page.get_by_role("button", name="Wait").click()

        # Take screenshot immediately (should NOT see menu)
        # We might need to be very fast.
        page.screenshot(path="verification/menu_hidden.png")

        # Check if "Guard" or "Wait" text is NOT visible in the screenshot area?
        # Actually, let's just inspect the screenshot manually.

        # Wait for turn to process (Wait takes 200ms + state update)
        time.sleep(1)

        # If it's single player unit, turn passes to Enemy then back to Player?
        # Or if points > 0, it stays Player turn.
        # Points start at 2 (1 unit). Wait costs 1.
        # So points become 1. Same actor?
        # Points = 2. Wait -> 1.
        # If points > 0, it advances to NEXT actor.
        # If 1 actor: (0+1)%1 = 0. Same actor.
        # So menu should reappear.

        page.screenshot(path="verification/menu_restored.png")

        browser.close()

if __name__ == "__main__":
    verify_hide_menu()
