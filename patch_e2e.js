const fs = require('fs');
const file = 'frontend/playwright/tests/e2e-coverage.spec.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
    /await page\.click\('button:has-text\("Create Project"\)'\);[\s\S]*?\/\/ Verify we enter the project workspace/,
    `await page.click('button:has-text("Create Project")');\n      await expect(page.locator('text=Create New Project')).toBeHidden({ timeout: 5000 });\n      await page.click('text=E2E Playwright Project');\n      // Verify we enter the project workspace`
);
fs.writeFileSync(file, content);
