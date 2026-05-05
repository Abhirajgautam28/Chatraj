import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:8080';

// User credentials read from environment variables or use defaults if not provided
const USER_A_EMAIL = process.env.USER_A_EMAIL || 'abhirajgautam28@gmail.com';
const USER_A_PASS = process.env.USER_A_PASS || '12345678';

const USER_B_EMAIL = process.env.USER_B_EMAIL || 'abhirajgautam42@gmail.com';
const USER_B_PASS = process.env.USER_B_PASS || '87654321';

// Dynamic email for registration
const NEW_USER_EMAIL = `abhirajgautam2+${Math.random().toString(36).slice(2, 8)}@gmail.com`;

test.describe('ChatRaj Full Application E2E Test Suite - Continuous Flow', () => {
  // Use serial mode to run tests sequentially, but we'll actually put everything in one massive test
  test.describe.configure({ mode: 'serial' });

  test('One massive continuous production gate execution', async ({ browser }) => {
    // Open contexts for two users
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // Setup explicit long timeouts
    test.setTimeout(0); // indefinite for the whole massive test

    const rnd = Math.random().toString(36).slice(2, 8);
    const projectName = `ProdGate-Project-${rnd}`;

    // --- 1. Registration Flow (User A) ---
    console.log(`\n======================================================`);
    console.log(`[START] Step 1: Registration Flow`);
    console.log(`======================================================\n`);
    await pageA.goto(`${BASE_URL}/register`);

    await expect(pageA.locator('text=Create an Account').first()).toBeVisible({ timeout: 15000 });

    await pageA.locator('input[type="text"]').nth(0).fill('Automated');
    await pageA.locator('input[type="text"]').nth(1).fill('Tester');
    await pageA.locator('input[type="email"]').first().fill(NEW_USER_EMAIL);
    await pageA.locator('input[type="password"]').nth(0).fill('Password123!');
    await pageA.locator('input[type="password"]').nth(1).fill('Password123!');

    await pageA.click('button[type="submit"]');

    console.log('\n======================================================');
    console.log('🤖 PLAYWRIGHT WAITING: Please check your email for the OTP.');
    console.log(`An OTP was sent to: ${NEW_USER_EMAIL}`);
    console.log('Please paste it into the browser window manually.');
    console.log('Wait is indefinite (timeout 0) so take your time.');
    console.log('After verifying, you should be redirected to the categories or dashboard.');
    console.log('======================================================\n');

    // Wait strictly until user bypasses it and lands on the dashboard or categories page
    await pageA.waitForURL(/.*(dashboard|login|categories|welcome-chatraj)/, { timeout: 0 });

    // --- 2. Login Flow (User A) ---
    console.log(`\n======================================================`);
    console.log(`[START] Step 2: Login Flow (User A)`);
    console.log(`======================================================\n`);
    await contextA.clearCookies(); // Start fresh
    await pageA.goto(`${BASE_URL}/login`);

    const emailInput = pageA.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible({ timeout: 15000 });

    await emailInput.fill(USER_A_EMAIL);
    await pageA.locator('input[type="password"]').first().fill(USER_A_PASS);
    await pageA.click('button[type="submit"]');

    // Wait for successful login
    await pageA.waitForURL(/.*(categories|welcome-chatraj|dashboard)/, { timeout: 0 });

    // --- 3. Content Creation - Create Blog (User A) ---
    console.log(`\n======================================================`);
    console.log(`[START] Step 3: Content Creation - Create Blog`);
    console.log(`======================================================\n`);
    await pageA.goto(`${BASE_URL}/blogs/create`);

    const titleInput = pageA.getByPlaceholder('Blog Title');
    await expect(titleInput).toBeVisible({ timeout: 15000 });

    const blogTitle = `Automated Production Gate Blog ${rnd}`;
    await titleInput.fill(blogTitle);
    await pageA.locator('textarea').first().fill('This is a highly useful blog created by the Playwright automated production gate suite. It verifies the blog creation flow in real-time.');
    await pageA.click('button[type="submit"]');

    // Wait for successful creation and redirection
    await pageA.waitForURL(/.*blogs/, { timeout: 15000 });

    // --- 4. Create Project & Workspace Interaction (User A) ---
    console.log(`\n======================================================`);
    console.log(`[START] Step 4: Create Project & Workspace`);
    console.log(`======================================================\n`);
    await pageA.goto(`${BASE_URL}/categories`);

    const createBtn = pageA.locator('button:has-text("Create"), button:has-text("New Project")').first();
    await expect(createBtn).toBeVisible({ timeout: 15000 });

    await createBtn.click();

    const nameInput = pageA.locator('input[type="text"]').first();
    await expect(nameInput).toBeVisible();
    await nameInput.fill(projectName);
    await pageA.click('button[type="submit"]');

    await pageA.waitForURL(/.*project\//, { timeout: 15000 });

    const chatInput = pageA.locator('input[placeholder*="message"], textarea[placeholder*="message"]').first();
    await expect(chatInput).toBeVisible({ timeout: 15000 });

    await chatInput.fill('Hello from Playwright User A! This is a real-time production test.');
    await pageA.keyboard.press('Enter');

    // --- 5. Real-Time Collaboration (User B joins User A) ---
    console.log(`\n======================================================`);
    console.log(`[START] Step 5: Real-Time Collaboration (User B)`);
    console.log(`======================================================\n`);
    await pageB.goto(`${BASE_URL}/login`);

    const emailInputB = pageB.locator('input[type="email"]').first();
    await expect(emailInputB).toBeVisible({ timeout: 15000 });

    await emailInputB.fill(USER_B_EMAIL);
    await pageB.locator('input[type="password"]').first().fill(USER_B_PASS);
    await pageB.click('button[type="submit"]');

    await pageB.waitForURL(/.*(categories|welcome-chatraj|dashboard)/, { timeout: 0 });

    const projectUrl = pageA.url();
    await pageB.goto(projectUrl);

    // Verify User A's message is visible to User B upon joining
    const expectedMessageUserA = pageB.locator('text=Hello from Playwright User A! This is a real-time production test.').first();
    await expect(expectedMessageUserA).toBeVisible({ timeout: 15000 });

    const chatInputB = pageB.locator('input[placeholder*="message"], textarea[placeholder*="message"]').first();
    await expect(chatInputB).toBeVisible({ timeout: 15000 });

    await chatInputB.fill('Hello User A, User B is here in real-time confirming connection!');
    await pageB.keyboard.press('Enter');

    // Verify User A receives it in real-time
    const expectedMessageUserB = pageA.locator('text=Hello User A, User B is here in real-time confirming connection!').first();
    await expect(expectedMessageUserB).toBeVisible({ timeout: 15000 });

    // --- 6. Final Logout (Both Users) ---
    console.log(`\n======================================================`);
    console.log(`[START] Step 6: Final Logout`);
    console.log(`======================================================\n`);

    // User A logout
    await pageA.goto(`${BASE_URL}/categories`);
    const logoutBtnA = pageA.locator('button:has(i.ri-logout-box-line), button:has(i.ri-logout-box-r-line)').first();
    await expect(logoutBtnA).toBeVisible({ timeout: 5000 });
    await logoutBtnA.click();
    await pageA.waitForURL(/.*login|.*\//, { timeout: 15000 });

    // User B logout
    await pageB.goto(`${BASE_URL}/categories`);
    const logoutBtnB = pageB.locator('button:has(i.ri-logout-box-line), button:has(i.ri-logout-box-r-line)').first();
    await expect(logoutBtnB).toBeVisible({ timeout: 5000 });
    await logoutBtnB.click();
    await pageB.waitForURL(/.*login|.*\//, { timeout: 15000 });

    console.log('\n======================================================');
    console.log('✅ ALL TESTS PASSED. PRODUCTION GATE IS GREEN.');
    console.log('======================================================\n');

    // Clean up contexts
    await contextA.close();
    await contextB.close();
  });

});
