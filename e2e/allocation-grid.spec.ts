import { test, expect } from '@playwright/test';

test.describe('Allocation Grid', () => {
    const TEST_DESCRIPTION = `ALLOCATION_TEST_${Date.now()}`;
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

        // Click on Allocations Grid tab
        await page.click('button:has-text("Allocations")');

        // Wait for grid to load
        await expect(page.locator('h2', { hasText: 'Fund Allocations' })).toBeVisible({ timeout: 10000 });
    });

    test('should create, edit, and delete an allocation', async ({ page }) => {
        // --- CREATE ---
        console.log('Starting Create Test for Allocation...');
        await page.click('button:has-text("Add Transaction")');

        // Wait for modal
        await expect(page.locator('h3:has-text("Add New Transaction")')).toBeVisible();

        // Fill form - Date
        const dateInput = page.locator('label').filter({ hasText: 'Date' }).locator('..').locator('input[type="date"]');
        await dateInput.fill('2025-01-25');

        // Source Transaction - select first option
        const sourceSelect = page.locator('label').filter({ hasText: 'Source Transaction' }).locator('..').locator('select');
        await sourceSelect.selectOption({ index: 1 }); // First real option (0 is placeholder)

        // Target Project - select first option
        const projectSelect = page.locator('label').filter({ hasText: 'Target Project' }).locator('..').locator('select');
        await projectSelect.selectOption({ index: 1 });

        // Amount
        const amountInput = page.locator('label').filter({ hasText: 'Amount' }).locator('..').locator('input[type="number"]');
        await amountInput.fill('10000');

        // Description
        const descInput = page.locator('label').filter({ hasText: 'Description' }).locator('..').locator('input[type="text"]');
        await descInput.fill(TEST_DESCRIPTION);

        // Submit
        await page.locator('form button[type="submit"]').click();

        // Verify creation
        await expect(page.locator('h3:has-text("Add New Transaction")')).not.toBeVisible({ timeout: 10000 });
        await expect(page.locator('table')).toContainText(TEST_DESCRIPTION, { timeout: 10000 });
        console.log('Allocation Create Test Passed');

        // --- EDIT ---
        console.log('Starting Edit Test for Allocation...');
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
        await editAmountInput.fill('15000');

        // Save
        await row.locator('button').filter({ hasText: /save/i }).click();

        // Verify Update
        await expect(page.locator('table')).toContainText(UPDATED_DESCRIPTION, { timeout: 10000 });
        await expect(page.locator('table')).toContainText('15,000', { timeout: 5000 });
        console.log('Allocation Edit Test Passed');

        // --- DELETE ---
        console.log('Starting Delete Test for Allocation...');
        const updatedRow = page.locator('tr', { hasText: UPDATED_DESCRIPTION });

        // Delete
        page.on('dialog', dialog => dialog.accept());
        await updatedRow.locator('button[title="Delete"]').click();

        // Verify Deletion
        await expect(page.locator('table')).not.toContainText(UPDATED_DESCRIPTION, { timeout: 10000 });
        console.log('Allocation Delete Test Passed');
    });

    test('should display allocation-specific fields', async ({ page }) => {
        // Verify allocations title and subtitle
        await expect(page.locator('h2', { hasText: 'Fund Allocations' })).toBeVisible();
        await expect(page.locator('text=Allocate income transactions to specific projects')).toBeVisible();

        // Verify stats cards
        await expect(page.locator('text=Total Allocated')).toBeVisible();
        await expect(page.locator('text=Total Allocations')).toBeVisible();
        await expect(page.locator('text=Funded Projects')).toBeVisible();
        await expect(page.locator('text=Income Sources')).toBeVisible();

        // Verify column headers
        await expect(page.locator('th:has-text("Source Transaction")')).toBeVisible();
        await expect(page.locator('th:has-text("Target Project")')).toBeVisible();
        await expect(page.locator('th:has-text("Amount")')).toBeVisible();
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
        } else {
            console.log('No allocations found to test inline editing');
        }
    });
});
