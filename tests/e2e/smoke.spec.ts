import { test, expect } from '@playwright/test';

/**
 * Desktop smoke journeys: the Inertia app actually boots and renders (catches
 * blank-page regressions — CSP, SSR/CSR hydration, JSX/Babel parse errors),
 * primary navigation works, and the contact form is present. Selectors are
 * href/role-based, not copy-based, so they survive CMS wording changes.
 */

test('homepage renders the Inertia app', async ({ page }) => {
    await page.goto('/');

    const app = page.locator('#app');
    await expect(app).not.toBeEmpty();
    // A real nav link proves the React tree mounted, not just an empty shell.
    await expect(page.locator('a[href="/properties"]').first()).toBeVisible();
});

test('can navigate from home to the properties listing', async ({ page }) => {
    await page.goto('/');

    await page.locator('a[href="/properties"]').first().click();

    await expect(page).toHaveURL(/\/properties$/);
    await expect(page.getByRole('heading').first()).toBeVisible();
});

test('contact page shows the inquiry form', async ({ page }) => {
    await page.goto('/contact');

    await expect(page.locator('form')).toBeVisible();
    // At least one text field + a submit control exist.
    expect(await page.getByRole('textbox').count()).toBeGreaterThan(0);
    await expect(page.getByRole('button').first()).toBeVisible();
});
