import { test, expect } from '@playwright/test';

test.describe('End-to-End: Catalog Setup and Quoting', () => {
  const testId = Date.now().toString().slice(-4);
  const productName = `Acme Analytics ${testId}`;
  const tierName = 'Growth';
  const featureName = 'Single Sign-On (SSO)';

  test('walks through creating a catalog entry, building a quote, and viewing it', async ({ page }) => {
    // 1. CREATE A CATALOG ENTRY
    await page.goto('/catalog');
    
    // Open new product form
    await page.click('button:has-text("+ New Product")');
    await page.fill('input[id="product-name"]', productName);
    await page.click('button[type="submit"]:has-text("Create Product")');

    // It should navigate or stay on list, click the newly created product
    await page.waitForSelector(`h3:has-text("${productName}")`);
    await page.click(`h3:has-text("${productName}")`);

    // We are on the product details page.
    await expect(page.locator('h1')).toContainText(productName);

    // Create a Tier
    await page.click('button:has-text("+ Add Tier")');
    await page.fill('input[id="tier-name"]', tierName);
    await page.fill('input[id="tier-price"]', '50'); // $50 per seat
    await page.click('button[type="submit"]:has-text("Add Tier")');
    
    // Verify tier created
    await expect(page.locator('td', { hasText: tierName })).toBeVisible();

    // Create a Feature
    await page.click('button:has-text("Feature Matrix")');
    await page.click('button:has-text("+ Add Feature")');
    await page.fill('input[id="feature-name"]', featureName);
    await page.click('button[type="submit"]:has-text("Add Feature")');

    // Make feature an add-on for the Growth tier
    // The table should have the feature, and a select dropdown for the tier.
    // Assuming the only select is for our newly created tier and feature
    await page.selectOption('select', 'add-on');
    await page.click('button:has-text("✓ Save Changes")');

    // Configure Add-on Pricing
    await page.click('button:has-text("Add-on Pricing")');
    await page.click('button:has-text("Set Price")');
    await page.selectOption('select', 'fixed_monthly');
    await page.fill('input[type="number"]', '200'); // $200 fixed monthly
    await page.click('button:has-text("Save")');


    // 2. BUILD A QUOTE
    await page.goto('/quotes/new');

    // Step 1: Details
    await page.fill('input[id="quote-name"]', `Proposal for Beta Corp ${testId}`);
    await page.fill('input[id="customer-name"]', 'Beta Corp');
    await page.click('button:has-text("Next →")');

    // Step 2: Product & Tier
    // Select product
    await page.selectOption('select[id="select-product"]', { label: productName });
    // Select tier
    await page.waitForFunction(() => document.querySelectorAll('#select-tier option').length > 1);
    await page.locator('select[id="select-tier"]').selectOption({ index: 1 });

    // Set seats and term
    await page.fill('input[id="seats"]', '25');
    await page.selectOption('select[id="term-length"]', 'annual');
    await page.click('button:has-text("Next →")');

    // Step 3: Add-ons
    // Check the SSO add-on
    await page.check(`input[type="checkbox"]`);
    await page.click('button:has-text("Next →")');

    // Step 4: Discount
    await page.fill('input[id="overall-discount"]', '0'); // No discount
    await page.click('button:has-text("Next →")');

    // Step 5: Review & Save
    // The subtotal should be: 25 seats * $50 * 12 months * 0.85 = $12,750
    // Plus add-on: $200 * 12 months = $2,400
    // Total = $15,150
    await expect(page.locator('td', { hasText: 'TOTAL' }).locator('xpath=following-sibling::td').first()).toContainText('$15,150.00');

    await page.click('button:has-text("Save & Share Quote")');

    // 3. VIEW THE SAVED QUOTE
    // Should redirect to /quotes/[quoteId]
    await page.waitForURL(/\/quotes\/Q-/);
    await expect(page.locator('h1')).toContainText(`Proposal for Beta Corp ${testId}`);
    
    // Verify breakdown
    await expect(page.locator('td', { hasText: 'TOTAL' }).locator('xpath=following-sibling::td').first()).toContainText('$15,150.00');
  });
});
