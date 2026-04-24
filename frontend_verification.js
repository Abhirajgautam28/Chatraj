const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();
  const outputDir = path.join('/home/jules/verification/screenshots');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    // Screenshot 1: Default Light Theme
    await page.screenshot({ path: path.join(outputDir, 'liquid_1.png'), fullPage: true });

    // Trigger theme toggle to capture the liquid splash mid-transition
    await page.evaluate(() => {
      document.querySelector('[aria-label="Toggle Theme"]')?.click();
    });

    // Wait briefly to capture the animation in progress
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(outputDir, 'liquid_splash.png'), fullPage: true });

    // Wait for transition to complete
    await page.waitForTimeout(1000);

    // Screenshot 2: Dark Theme
    await page.screenshot({ path: path.join(outputDir, 'liquid_2.png'), fullPage: true });

    console.log('Verification screenshots captured successfully.');
  } catch (error) {
    console.error('Failed to capture screenshots:', error);
  } finally {
    await browser.close();
  }
})();
