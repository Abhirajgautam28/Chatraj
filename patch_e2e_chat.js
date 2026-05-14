const fs = require('fs');
const file = 'frontend/playwright/tests/e2e-coverage.spec.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
    /await page\.goto\(`\$\{BASE_URL\}\/chatraj`\);/g,
    "await page.goto(`${BASE_URL}/chat`);"
);
content = content.replace(
    /await expect\(page\.locator\('text=Welcome to ChatRaj AI'\)\)\.toBeVisible\(\{ timeout: 10000 \}\);/g,
    "await expect(page.locator('text=How can I help you today?').first()).toBeVisible({ timeout: 10000 });"
);
fs.writeFileSync(file, content);
