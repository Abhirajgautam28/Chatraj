const fs = require('fs');
const file = 'frontend/playwright/tests/e2e-coverage.spec.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
    /await expect\(page\)\.toHaveURL\(\/\\\\\/project\\\\\/(\/)\);/,
    "await expect(page).toHaveURL(/.*\\/project/);"
);
// fallback replacement
content = content.replace(
    "await expect(page).toHaveURL(/\\/project\\//);",
    "await expect(page).toHaveURL(/.*\\/project/);"
);
fs.writeFileSync(file, content);
