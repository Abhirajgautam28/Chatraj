const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:5173');
  // Wait for React to mount and animations to start
  await page.waitForTimeout(2000);

  await page.screenshot({ path: '/home/jules/verification/screenshots/liquid_1.png', fullPage: true });

  // Click theme toggle button to test splash animation
  // Assuming theme button has a standard class or icon. Let's find it.
  const themeBtn = await page.$('.ri-moon-line, .ri-sun-line');
  if (themeBtn) {
    await themeBtn.click();
    await page.waitForTimeout(500); // mid transition
    await page.screenshot({ path: '/home/jules/verification/screenshots/liquid_splash.png' });
    await page.waitForTimeout(1000); // finished transition
    await page.screenshot({ path: '/home/jules/verification/screenshots/liquid_2.png', fullPage: true });
  }

  await browser.close();
  console.log("Screenshots captured successfully.");
})();
