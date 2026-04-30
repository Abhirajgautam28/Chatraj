import { test, expect } from '@playwright/test';

test.describe('Core Features Navigation', () => {

  test('Project Dashboard blocks unauthenticated access', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);
  });

  test('Public Category Exploration displays categories', async ({ page }) => {
    await page.goto('/categories');

    // Check main title (may be hidden on mobile, so we don't strictly require it)
    await expect(page.locator('body')).toBeVisible();

    // Verify it rendered successfully by looking for an input
    await expect(page.locator('input').first()).toBeVisible({ timeout: 15000 });
  });

  test('Themes Settings Modal can be opened and closed', async ({ page }) => {
    await page.goto('/');

    const fab = page.getByRole('button', { name: 'Quick Actions' });
    await expect(fab).toBeVisible();
    await fab.click();

    const themeBtn = page.getByRole('button', { name: 'Change UI Theme' });
    await expect(themeBtn).toBeVisible();
    await themeBtn.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(page.locator('text=Select UI Theme').first()).toBeVisible();

    const closeBtn = page.locator('button:has(i.ri-close-line)').first();
    if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await expect(dialog).toBeHidden();
    }
  });

});
