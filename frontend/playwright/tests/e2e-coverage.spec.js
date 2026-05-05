import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:8080';

const testEmail = `e2e+${Math.random().toString(36).slice(2, 8)}@example.com`;
const testPassword = 'Password123!';

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
test.describe('ChatRaj Full Application E2E Test Suite', () => {

  test.beforeAll(() => {
    // Create a test user directly in the DB to bypass email OTP verification
    console.log('Creating verified test user directly in DB...');
    // We need to run the script from the root directory so it finds its packages and .env correctly
    execSync(`TEST_USER_EMAIL=${testEmail} TEST_USER_PASSWORD=${testPassword} node Backend/scripts/create_test_user.js`, {
      cwd: path.resolve(__dirname, '../../..')
    });
  });

  test('1. Full E2E Flow: Login -> Create Project -> Chat -> Blog -> Profile', async ({ page, request }) => {

    // --- 1. Login ---
    await test.step('Login to the application', async () => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', testPassword);
      await page.click('button[type="submit"]');

      // Ensure we navigate to Home after login
      await expect(page).toHaveURL(`${BASE_URL}/categories`);
      await page.screenshot({ path: 'categories_page.png' });
      await expect(page.locator('text=Explore Domains')).toBeVisible({ timeout: 10000 });
    });

    // --- 2. Dashboard / Create Project ---
      await page.click('text=Frontend Development');
      await expect(page).toHaveURL(/.*\/dashboard\/Frontend%20Development/);
    await test.step('Create a new project', async () => {
      await page.click('button:has-text("New Project")');
      const projectName = 'E2E Project ' + Date.now();
      await page.fill('input[placeholder*="descriptive name"]', projectName);
      await page.click('button:has-text("Create Project")');
      await expect(page.locator('text=Create New Project')).toBeHidden({ timeout: 5000 });
      await page.click('text=' + projectName);
      // Verify we enter the project workspace
      await expect(page).toHaveURL(/.*\/project/);
      await expect(page.locator('text=' + projectName).first()).toBeVisible({ timeout: 10000 });
    });

    // --- 3. ChatRaj / AI Chat ---
    await test.step('Interact with ChatRaj', async () => {

      await page.goto(`${BASE_URL}/chat`);
      await page.screenshot({ path: 'chat_page_after_goto.png' });
      await expect(page.locator('textarea[placeholder="Type a message..."]')).toBeVisible({ timeout: 10000 });

      const chatInput = page.locator('textarea[placeholder="Type a message..."]');
      await chatInput.fill('Hello AI, this is an E2E test!');
      await page.click('button[type="submit"] i.ri-send-plane-2-fill');

      // Wait for AI to start thinking and respond
      await expect(page.locator('text=Hello AI, this is an E2E test!')).toBeVisible({ timeout: 5000 });
      // The AI response could be anything, but we should see a message from the assistant soon.
    });

    // --- 4. Blogs ---
    await test.step('Navigate to Blogs and interact', async () => {
      await page.goto(`${BASE_URL}/blogs`);
      await expect(page.locator('text=Discover Blogs')).toBeVisible({ timeout: 10000 });

      // Attempt to view a blog if any exist
      const readMoreBtn = page.locator('button:has-text("Read More")').first();
      if (await readMoreBtn.isVisible()) {
        await readMoreBtn.click();
        await expect(page).toHaveURL(/\/blogs\//);
      }
    });

    // --- 5. Profile & Settings ---
    // Profile page is not yet implemented
    });

    // --- 6. Logout ---
    await test.step('Logout', async () => {
      await page.goto(`${BASE_URL}/categories`);
      await page.click('button:has-text("Logout")');
      await expect(page).toHaveURL(`${BASE_URL}/login`);
    });

  });
});
