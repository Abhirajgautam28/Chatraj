const fs = require('fs');
const file = 'frontend/playwright/tests/e2e-coverage.spec.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /await pageB\.goto\(projectUrl\);\n    await expect\(pageB\)\.toHaveURL\(\/.*\\\/project\/\);\n    await pageB\.waitForTimeout\(2000\);/,
    "await pageB.goto(`${BASE_URL}/categories`);\n    await pageB.click('text=Frontend Development');\n    await pageB.waitForTimeout(2000);\n    await pageB.click('text=' + projectName);\n    await expect(pageB).toHaveURL(/.*\\/project/);\n    await pageB.waitForTimeout(2000);"
);

// Fallback replacement if the above fails
content = content.replace(
    /await pageB\.goto\(projectUrl\);\n    await pageB\.waitForTimeout\(2000\);/,
    "await pageB.goto(`${BASE_URL}/categories`);\n    await pageB.click('text=Frontend Development');\n    await pageB.waitForTimeout(2000);\n    await pageB.click('text=' + projectName);\n    await expect(pageB).toHaveURL(/.*\\/project/);\n    await pageB.waitForTimeout(2000);"
);

fs.writeFileSync(file, content);
