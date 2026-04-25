import asyncio
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(record_video_dir="videos/")
        page = await context.new_page()

        print("Navigating to localhost:5173...")
        await page.goto('http://localhost:5173')
        await page.wait_for_timeout(2000)

        # Open FAB - using a more robust selector targeting the aria-label
        print("Clicking RocketFAB...")
        await page.locator('button[aria-label="Quick Actions"]').click()
        await page.wait_for_timeout(1000)

        # Click "Change UI Theme"
        print("Clicking Change UI Theme...")
        await page.get_by_text("Change UI Theme").click()
        await page.wait_for_timeout(1000)

        print("Selecting Glassmorphism...")
        await page.get_by_text("Glassmorphism").click()

        # Wait slightly to capture the "destruct" transition mid-way (duration is 0.6s)
        await page.wait_for_timeout(300)

        print("Saving destruct screenshot...")
        await page.screenshot(path="screenshot_destruct_mid.png")

        # Wait for reconstruct to finish
        await page.wait_for_timeout(800)

        print("Saving reconstruct screenshot...")
        await page.screenshot(path="screenshot_reconstruct_done.png")

        # Close
        await context.close()
        await browser.close()
        print("Done.")

if __name__ == "__main__":
    asyncio.run(verify())
