import { test, expect } from '@playwright/test';

test.describe('Blogs Module', () => {

  test('View Public Blogs', async ({ page }) => {
    await page.goto('/blogs');
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });

    // Look for blog cards
    const blogCards = page.locator('div[class*="rounded-xl"]');
    if (await blogCards.count() > 0) {
       // Just verify they rendered
       await expect(blogCards.first()).toBeVisible();
    }
  });

  test('Attempt to Create Blog Unauthenticated', async ({ page }) => {
    // Navigating to blog creation should redirect or show a warning if unauthenticated
    await page.goto('/blogs/create');
    // Depending on auth implementation, it might redirect to login or show an error
    await page.waitForTimeout(1000);
  });

});
