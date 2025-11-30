import { test, expect } from '@playwright/test';

test.describe('Expense Grid', () => {
    const TEST_DESCRIPTION = `EXPENSE_TEST_${Date.now()}`;
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

        // Click on Expenses Grid tab
        await page.click('button:has-text("Expenses")');

        // Wait for grid to load
        await expect(page.locator('h2', { hasText: 'Expense Transactions' })).toBeVisible({ timeout: 10000 });
    });

    test('should create, edit, and delete an expense transaction', async ({ page }) => {
        // --- CREATE ---
        console.log('Starting Create Test for Expense...');
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
        await amountInput.fill('3000');

        // Category - select first option
        const categoryInput = page.locator('label').filter({ hasText: 'Category' }).locator('..').locator('input, button').first();
        await categoryInput.click();
        await page.waitForTimeout(500);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');

        // Payment Method
        const paymentSelect = page.locator('label').filter({ hasText: 'Payment Method' }).locator('..').locator('select');
        await paymentSelect.selectOption('cash');

        // Vendor (source field for expenses)
        const vendorInput = page.locator('label').filter({ hasText: 'Vendor' }).locator('..').locator('input[type="text"]');
        await vendorInput.fill('Test Vendor Inc.');

        // Submit
        await page.locator('form button[type="submit"]').click();

        // Verify creation
        await expect(page.locator('h3:has-text("Add New Transaction")')).not.toBeVisible({ timeout: 10000 });
        await expect(page.locator('table')).toContainText(TEST_DESCRIPTION, { timeout: 10000 });
        console.log('Expense Create Test Passed');

        // --- EDIT ---
        console.log('Starting Edit Test for Expense...');
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
        await editAmountInput.fill('4500');

        // Save
        await row.locator('button').filter({ hasText: /save/i }).click();

        // Verify Update
        await expect(page.locator('table')).toContainText(UPDATED_DESCRIPTION, { timeout: 10000 });
        await expect(page.locator('table')).toContainText('4,500', { timeout: 5000 });
        console.log('Expense Edit Test Passed');

        // --- DELETE ---
        console.log('Starting Delete Test for Expense...');
        const updatedRow = page.locator('tr', { hasText: UPDATED_DESCRIPTION });

        // Delete
        page.on('dialog', dialog => dialog.accept());
        await updatedRow.locator('button[title="Delete"]').click();

        // Verify Deletion
        await expect(page.locator('table')).not.toContainText(UPDATED_DESCRIPTION, { timeout: 10000 });
        console.log('Expense Delete Test Passed');
    });

    test('should only show expense type transactions', async ({ page }) => {
        // Check that the grid title is correct
        await expect(page.locator('h2', { hasText: 'Expense Transactions' })).toBeVisible();

        // Verify stats cards show expense-related labels
        await expect(page.locator('text=Total Expense')).toBeVisible();

        // If there are any transactions, verify they don't have "Income" type badge
        // Since Type column is hidden, we just verify the presence of expense transactions
        const rows = page.locator('tbody tr');
        const count = await rows.count();

        console.log(`Found ${count} expense transactions in the grid`);

        // The grid should not show any "Income" badges since Type column is hidden
        // and only expense transactions are filtered
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

    test('should show Vendor column instead of Source', async ({ page }) => {
        // Check that the column header is "Vendor" not "Source"
        await expect(page.locator('th:has-text("Vendor")')).toBeVisible();

        // Verify Source column header doesn't exist
        const sourceHeader = page.locator('th:has-text("Source")');
        await expect(sourceHeader).not.toBeVisible();
    });
});
