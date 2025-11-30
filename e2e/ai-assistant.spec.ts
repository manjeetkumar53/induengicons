import { test, expect } from '@playwright/test';

test.describe('AI Assistant - Full Functionality Test', () => {
    test.beforeEach(async ({ page }) => {
        // Set longer timeout for AI responses
        test.setTimeout(60000);

        // Login
        await page.goto('http://localhost:3001/admin/login');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'Admin@123456');
        await page.click('button[type="submit"]');

        // Wait for redirect
        await page.waitForURL(/\/admin\/(dashboard|accounting)/, { timeout: 10000 });

        // Navigate to accounting
        await page.goto('http://localhost:3001/admin/accounting');
        await page.waitForTimeout(1000);

        // Click Reports in navigation
        await page.click('button:has-text("Reports")');
        await page.waitForTimeout(1000);

        // Wait for Reports Dashboard to load
        await expect(page.locator('h2:has-text("Financial Reports")')).toBeVisible({ timeout: 10000 });

        // Click AI Assistant tab
        const aiTab = page.locator('button').filter({ hasText: /AI.*Assistant|AI/i });
        await aiTab.click();
        await page.waitForTimeout(1000);
    });

    test('AI Assistant interface renders correctly', async ({ page }) => {
        // Verify header
        await expect(page.locator('h3:has-text("AI Financial Assistant")')).toBeVisible();

        // Verify welcome message
        await expect(page.locator('text=How can I help you today?')).toBeVisible();

        // Verify input field
        const input = page.locator('input[placeholder*="Ask about your finances"]');
        await expect(input).toBeVisible();
        await expect(input).toBeEnabled();

        // Verify submit button
        const submitButton = page.locator('form button[type="submit"]');
        await expect(submitButton).toBeVisible();

        // Verify disclaimer
        await expect(page.locator('text=/AI can make mistakes/i')).toBeVisible();

        // Verify suggested queries
        await expect(page.locator('button:has-text("What is my profit this month?")')).toBeVisible();
        await expect(page.locator('button:has-text("Show me top 5 expenses this year")')).toBeVisible();
        await expect(page.locator('button:has-text("Recent income transactions")')).toBeVisible();
        await expect(page.locator('button:has-text("Summary of all projects")')).toBeVisible();

        console.log('✅ AI Assistant interface renders correctly');
    });

    test('Can send a message and receive AI response', async ({ page }) => {
        const testQuery = 'What is my profit this month?';
        const input = page.locator('input[placeholder*="Ask about your finances"]');

        // Type query
        await input.fill(testQuery);
        await expect(input).toHaveValue(testQuery);

        // Submit
        await page.locator('form button[type="submit"]').click();

        // Verify user message appears
        await expect(page.locator('text=' + testQuery)).toBeVisible({ timeout: 5000 });

        // Verify input is cleared
        await expect(input).toHaveValue('');

        // Wait for AI response (give it 20 seconds)
        await page.waitForTimeout(20000);

        // Check if there are at least 2 messages (user + AI)
        const messages = page.locator('[class*="flex"][class*="items-start"]');
        const messageCount = await messages.count();
        expect(messageCount).toBeGreaterThanOrEqual(2);

        console.log('✅ Message sent and AI response received');
    });

    test('Suggested query works', async ({ page }) => {
        // Click first suggested query
        await page.click('button:has-text("What is my profit this month?")');

        // Verify query appears in chat
        await expect(page.locator('text=What is my profit this month?')).toBeVisible({ timeout: 5000 });

        // Wait for AI response
        await page.waitForTimeout(20000);

        // Verify suggested queries are hidden
        await expect(page.locator('button:has-text("What is my profit this month?")')).not.toBeVisible();

        console.log('✅ Suggested query works');
    });

    test('Submit button is disabled when input is empty', async ({ page }) => {
        const input = page.locator('input[placeholder*="Ask about your finances"]');
        const submitButton = page.locator('form button[type="submit"]');

        // Initially empty - button should be disabled
        await expect(submitButton).toBeDisabled();

        // Type something
        await input.fill('test');
        await expect(submitButton).toBeEnabled();

        // Clear input
        await input.clear();
        await expect(submitButton).toBeDisabled();

        console.log('✅ Submit button state works correctly');
    });

    test('Can send multiple messages in conversation', async ({ page }) => {
        const input = page.locator('input[placeholder*="Ask about your finances"]');

        // First message
        await input.fill('What is my profit this month?');
        await page.locator('form button[type="submit"]').click();
        await page.waitForTimeout(15000);

        // Second message
        await input.fill('Show me recent transactions');
        await page.locator('form button[type="submit"]').click();
        await page.waitForTimeout(15000);

        // Verify both messages are visible
        await expect(page.locator('text=What is my profit this month?')).toBeVisible();
        await expect(page.locator('text=Show me recent transactions')).toBeVisible();

        console.log('✅ Multiple messages work in conversation');
    });

    test('AI Assistant is accessible from accounting page', async ({ page }) => {
        // This test verifies the navigation path
        await page.goto('http://localhost:3001/admin/accounting');

        // Verify we can navigate to AI Assistant
        await page.click('button:has-text("Reports")');
        await page.waitForTimeout(500);

        const aiTab = page.locator('button').filter({ hasText: /AI.*Assistant|AI/i });
        await expect(aiTab).toBeVisible();

        await aiTab.click();
        await expect(page.locator('h3:has-text("AI Financial Assistant")')).toBeVisible({ timeout: 10000 });

        console.log('✅ AI Assistant is accessible from accounting page');
    });
});
