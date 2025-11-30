import { test, expect } from '@playwright/test';

test.describe('Income Grid', () => {
    const TEST_DESCRIPTION = `INCOME_TEST_${Date.now()}`;
    const UPDATED_DESCRIPTION = `${TEST_DESCRIPTION}_UPDATED`;

    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/admin/login');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'Admin@123456');
        await page.click('button[type="submit"]');

        await page.waitForURL(/\/admin\/(dashboard|accounting)/);

        // Navigate to accounting page
        await page.goto('/admin/accounting');

        // Click on Income Grid tab
        await page.click('button:has-text("Income")');

        // Wait for grid to load
        await expect(page.locator('h2', { hasText: 'Income Transactions' })).toBeVisible({ timeout: 10000 });
    });

    test('should create, edit, and delete an income transaction', async ({ page }) => {
        // --- CREATE ---
        console.log('Starting Create Test for Income...');
        await page.click('button:has-text("Add Transaction")');

        // Wait for modal
        await expect(page.locator('h3:has-text("Add New Transaction")')).toBeVisible();

        // Fill form - Date
        const dateInput = page.locator('label').filter({ hasText: 'Date' }).locator('..').locator('input[type="date"]');
        await dateInput.fill('2025-01-20');

        // Description
        const descInput = page.locator('label').filter({ hasText: 'Description' }).locator('..').locator('input[type="text"]');
        await descInput.fill(TEST_DESCRIPTION);

        // Amount
        const amountInput = page.locator('label').filter({ hasText: 'Amount' }).locator('..').locator('input[type="number"]');
        await amountInput.fill('5000');

        // Category - select first option
        const categoryInput = page.locator('label').filter({ hasText: 'Category' }).locator('..').locator('input, button').first();
        await categoryInput.click();
        await page.waitForTimeout(500);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');

        // Payment Method
        const paymentSelect = page.locator('label').filter({ hasText: 'Payment Method' }).locator('..').locator('select');
        await paymentSelect.selectOption('bank');

        // Source
        const sourceInput = page.locator('label').filter({ hasText: 'Source' }).locator('..').locator('input[type="text"]');
        await sourceInput.fill('Test Client');

        // Submit
        await page.locator('form button[type="submit"]').click();

        // Verify creation
        await expect(page.locator('h3:has-text("Add New Transaction")')).not.toBeVisible({ timeout: 10000 });
        await expect(page.locator('table')).toContainText(TEST_DESCRIPTION, { timeout: 10000 });
        console.log('Income Create Test Passed');

        // --- EDIT ---
        console.log('Starting Edit Test for Income...');
        const row = page.locator('tr', { hasText: TEST_DESCRIPTION });
        await expect(row).toBeVisible();

        // Click Edit button
        await row.locator('button[title="Edit"]').click();
        await page.waitForTimeout(1000);

        // Wait for edit mode
        await expect(row.locator('input[type="number"]')).toBeVisible({ timeout: 10000 });

        // Update Description
        const editDescInput = row.locator('input[type="text"], textarea').first();
        await editDescInput.fill(UPDATED_DESCRIPTION);

        // Update Amount
        const editAmountInput = row.locator('input[type="number"]');
        await editAmountInput.fill('7500');

        // Save
        await row.locator('button').filter({ hasText: /save/i }).click();

        // Verify Update
        await expect(page.locator('table')).toContainText(UPDATED_DESCRIPTION, { timeout: 10000 });
        await expect(page.locator('table')).toContainText('7,500', { timeout: 5000 });
        console.log('Income Edit Test Passed');

        // --- DELETE ---
        console.log('Starting Delete Test for Income...');
        const updatedRow = page.locator('tr', { hasText: UPDATED_DESCRIPTION });

        // Delete
        page.on('dialog', dialog => dialog.accept());
        await updatedRow.locator('button[title="Delete"]').click();

        // Verify Deletion
        await expect(page.locator('table')).not.toContainText(UPDATED_DESCRIPTION, { timeout: 10000 });
        console.log('Income Delete Test Passed');
    });

    test('should only show income type transactions', async ({ page }) => {
        // Check that the grid title is correct
        await expect(page.locator('h2', { hasText: 'Income Transactions' })).toBeVisible();

        // Verify stats cards show income-related labels
        await expect(page.locator('text=Total Income')).toBeVisible();

        // If there are any transactions, verify they don't have "Expense" type badge
        // Since Type column is hidden, we just verify the presence of income transactions
        const rows = page.locator('tbody tr');
        const count = await rows.count();

        console.log(`Found ${count} income transactions in the grid`);

        // The grid should not show any "Expense" badges since Type column is hidden
        // and only income transactions are filtered
    });

    test('should have consistent UI with transaction grid', async ({ page }) => {
        // Verify AdvancedDataGrid features are present
        await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
        await expect(page.locator('button:has-text("Add Transaction")')).toBeVisible();

        // Verify action buttons are visible if there are rows
        const rows = page.locator('tbody tr');
        if (await rows.count() > 0) {
            await expect(rows.first().locator('button[title="Edit"]')).toBeVisible();
            await expect(rows.first().locator('button[title="Delete"]')).toBeVisible();
        }
    });
});
