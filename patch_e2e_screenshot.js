const fs = require('fs');
const file = 'frontend/playwright/tests/e2e-coverage.spec.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
    /await page\.screenshot\(\{ path: 'chat_page\.png' \}\);/,
    ""
);
content = content.replace(
    /await expect\(page\.locator\('textarea\[placeholder="Type a message\.\.\."\]'\)\)\.toBeVisible\(\{ timeout: 10000 \}\);/,
    "await page.screenshot({ path: 'chat_page_after_goto.png' });\n      await expect(page.locator('textarea[placeholder=\"Type a message...\"]')).toBeVisible({ timeout: 10000 });"
);
fs.writeFileSync(file, content);
