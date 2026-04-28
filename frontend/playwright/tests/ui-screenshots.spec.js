import { test } from '@playwright/test';

test('capture UI screenshots', async ({ page }) => {
  // Home
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test-results/playwright-screenshots/home.png', fullPage: true });

  // Open FAB and theme modal
  const fab = page.getByRole('button', { name: 'Quick Actions' });
  await fab.click();
  await page.getByRole('button', { name: 'Change UI Theme' }).click();
  await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 });

  // Select a theme (Material UI) and capture
  const materialBtn = page.getByRole('button', { name: 'Material UI' });
  await materialBtn.click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'test-results/playwright-screenshots/home-material-theme.png', fullPage: true });

  // Login page
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test-results/playwright-screenshots/login.png', fullPage: true });

  // Register page
  await page.goto('/register');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test-results/playwright-screenshots/register.png', fullPage: true });
});
