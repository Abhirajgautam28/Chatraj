const fs = require('fs');
const file = 'frontend/playwright/tests/e2e-coverage.spec.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
    /await page\.fill\('input\[placeholder\*="descriptive name"\]', 'E2E Playwright Project'\);/g,
    `const projectName = 'E2E Project ' + Date.now();\n      await page.fill('input[placeholder*="descriptive name"]', projectName);`
);
content = content.replace(
    /await page\.click\('text=E2E Playwright Project'\);/g,
    `await page.click('text=' + projectName);`
);
content = content.replace(
    /await expect\(page\.locator\('text=E2E Playwright Project'\)\.first\(\)\)\.toBeVisible\(\{ timeout: 10000 \}\);/g,
    `await expect(page.locator('text=' + projectName).first()).toBeVisible({ timeout: 10000 });`
);
fs.writeFileSync(file, content);
