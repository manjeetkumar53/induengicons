import { test, expect } from '@playwright/test';

test.describe('Transaction Grid', () => {
    const TEST_DESCRIPTION = `TEST_ENTRY_${Date.now()}`;
    const UPDATED_DESCRIPTION = `${TEST_DESCRIPTION}_UPDATED`;

    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/admin/login');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'Admin@123456');
        await page.click('button[type="submit"]');

        // Wait for redirect to dashboard or accounting
        await page.waitForURL(/\/admin\/(dashboard|accounting)/);

        // Navigate to accounting page
        await page.goto('/admin/accounting');

        // Wait for grid to load
        await expect(page.locator('h2', { hasText: 'All Transactions' })).toBeVisible();
    });

    test('should create, edit, and delete a transaction', async ({ page }) => {
        // --- CREATE ---
        console.log('Starting Create Test...');
        await page.click('button:has-text("Add Transaction")');

        // Wait for modal to appear
        await expect(page.locator('h3:has-text("Add New Transaction")')).toBeVisible();

        // Fill form fields - use more specific selectors
        // Type (badge/select for transaction type)
        const typeSelect = page.locator('label').filter({ hasText: 'Type' }).locator('..').locator('select');
        await typeSelect.selectOption('expense');

        // Date
        const dateInput = page.locator('label').filter({ hasText: 'Date' }).locator('..').locator('input[type="date"]');
        await dateInput.fill('2025-01-15');

        // Description (text input, not textarea)
        const descInput = page.locator('label').filter({ hasText: 'Description' }).locator('..').locator('input[type="text"]');
        await descInput.fill(TEST_DESCRIPTION);

        // Amount
        const amountInput = page.locator('label').filter({ hasText: 'Amount' }).locator('..').locator('input[type="number"]');
        await amountInput.fill('1000');

        // Category - just select the first option
        const categoryInput = page.locator('label').filter({ hasText: 'Category' }).locator('..').locator('input, button').first();
        await categoryInput.click();
        await page.waitForTimeout(500); // Wait for dropdown
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');

        // Payment Method
        const paymentSelect = page.locator('label').filter({ hasText: 'Payment Method' }).locator('..').locator('select');
        await paymentSelect.selectOption('cash');

        // Submit form - look for submit button in the modal
        await page.locator('form button[type="submit"]').click();

        // Wait for modal to close and verify creation
        await expect(page.locator('h3:has-text("Add New Transaction")')).not.toBeVisible({ timeout: 10000 });
        await expect(page.locator('table')).toContainText(TEST_DESCRIPTION, { timeout: 10000 });
        console.log('Create Test Passed');

        // --- EDIT ---
        console.log('Starting Edit Test...');
        // Find the row with our test description
        const row = page.locator('tr', { hasText: TEST_DESCRIPTION });
        await expect(row).toBeVisible();

        // Click Edit button
        await row.locator('button[title="Edit"]').click();
        await page.waitForTimeout(1000); // Wait for edit mode to activate

        // Wait for row to be in edit mode by checking for editable input
        await expect(row.locator('input[type="number"]')).toBeVisible({ timeout: 10000 });

        // Update Description - find the text input in the row
        const editDescInput = row.locator('input[type="text"], textarea').first();
        await editDescInput.fill(UPDATED_DESCRIPTION);

        // Update Amount
        const editAmountInput = row.locator('input[type="number"]');
        await editAmountInput.fill('1500');

        // Save - use more flexible selector
        await row.locator('button').filter({ hasText: /save/i }).click();

        // Verify Update
        await expect(page.locator('table')).toContainText(UPDATED_DESCRIPTION, { timeout: 10000 });
        await expect(page.locator('table')).toContainText('1,500', { timeout: 5000 });
        console.log('Edit Test Passed');

        // --- DELETE ---
        console.log('Starting Delete Test...');
        // Find the updated row
        const updatedRow = page.locator('tr', { hasText: UPDATED_DESCRIPTION });

        // Click Delete button
        page.on('dialog', dialog => dialog.accept());
        await updatedRow.locator('button[title="Delete"]').click();

        // Verify Deletion
        await expect(page.locator('table')).not.toContainText(UPDATED_DESCRIPTION, { timeout: 10000 });
        console.log('Delete Test Passed');
    });

    test('should show both income and expense transactions', async ({ page }) => {
        // Check that the grid title is "All Transactions"
        await expect(page.locator('h2', { hasText: 'All Transactions' })).toBeVisible();

        // Verify stats cards show combined data
        await expect(page.locator('text=Total Income')).toBeVisible();
        await expect(page.locator('text=Total Expenses')).toBeVisible();
        await expect(page.locator('text=Net Amount')).toBeVisible();

        // Verify Type column is visible
        await expect(page.locator('th:has-text("Type")')).toBeVisible();
    });

    test('should have sticky actions column', async ({ page }) => {
        // Check if the actions column header has the sticky class
        const actionsHeader = page.locator('th:has-text("Actions")');
        await expect(actionsHeader).toHaveClass(/sticky/);
        await expect(actionsHeader).toHaveCSS('right', '0px');

        // Check if a row's action cell has the sticky class
        const firstRowActionCell = page.locator('tbody tr').first().locator('td').last();
        if (await firstRowActionCell.count() > 0) {
            await expect(firstRowActionCell).toHaveClass(/sticky/);
            await expect(firstRowActionCell).toHaveCSS('right', '0px');
        }
    });

    test('should support inline editing', async ({ page }) => {
        // Check if there are any rows
        const rows = page.locator('tbody tr');
        const count = await rows.count();

        if (count > 0) {
            // Click edit on first row
            await rows.first().locator('button[title="Edit"]').click();

            // Verify row enters edit mode
            await expect(rows.first().locator('input[type="number"]')).toBeVisible({ timeout: 5000 });

            // Verify save and cancel buttons appear
            await expect(rows.first().locator('button').filter({ hasText: /save/i })).toBeVisible();
            await expect(rows.first().locator('button').filter({ hasText: /cancel/i })).toBeVisible();

            // Cancel editing
            await rows.first().locator('button').filter({ hasText: /cancel/i }).click();
        }
    });

    test('should have consistent UI with other grids', async ({ page }) => {
        // Verify AdvancedDataGrid features are present
        await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
        await expect(page.locator('button:has-text("Add Transaction")').or(page.locator('button:has-text("Add")'))).toBeVisible();

        // Verify action buttons are visible if there are rows
        const rows = page.locator('tbody tr');
        if (await rows.count() > 0) {
            await expect(rows.first().locator('button[title="Edit"]')).toBeVisible();
            await expect(rows.first().locator('button[title="Delete"]')).toBeVisible();
        }
    });
});
