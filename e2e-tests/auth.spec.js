import { test, expect } from '@playwright/test';

test.describe('Authentication & Profile Flows', () => {
  let rnd;
  let testUser;

  test.beforeEach(() => {
    rnd = Math.random().toString(36).slice(2, 8);
    testUser = {
      firstName: 'E2E',
      lastName: 'Tester',
      email: `e2e+${rnd}@example.com`,
      password: 'Password123!',
    };
  });

  test('User Registration should display correct elements', async ({ page }) => {
    await page.goto('/register');

    await expect(page.locator('text=Create an Account').first()).toBeVisible();

    await page.locator('input[type="text"]').nth(0).fill(testUser.firstName);
    await page.locator('input[type="text"]').nth(1).fill(testUser.lastName);
    await page.locator('input[type="email"]').first().fill(testUser.email);
    await page.locator('input[type="password"]').nth(0).fill(testUser.password);
    await page.locator('input[type="password"]').nth(1).fill(testUser.password);

    await page.click('button[type="submit"]');

    // Wait for the OTP modal to appear or a successful registration flow
    const otpModal = page.locator('text=Enter OTP').first();
    const loginRedirect = page.locator('text=Login').first();
    await expect(otpModal.or(loginRedirect)).toBeVisible({ timeout: 15000 });
  });

  test('User Login attempts form submission', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 15000 });

    await page.locator('input[type="email"]').first().fill(testUser.email);
    await page.locator('input[type="password"]').first().fill('wrong-password');

    await page.click('button[type="submit"]');

    // Due to recaptha or varied API responses (e.g., 'User not found' vs generic error),
    // we verify the state updates. The button will either show Recaptcha modal or a text-red-500 div.
    const errorDiv = page.locator('.text-red-500').first();
    const recapthaModal = page.locator('text=Please verify').first();

    await expect(errorDiv.or(recapthaModal)).toBeVisible({ timeout: 10000 });
  });
});
