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

test('the footer privacy link reaches a real page', async ({ page }) => {
    // Guards the original bug: the link existed as href="#" for months. A page
    // nobody can reach is the same as no page, and the cookie banner points at
    // this URL too — so a 404 here breaks the consent flow's disclosure.
    await page.goto('/');

    const link = page.locator('footer a[href="/privacy"]');
    await expect(link).toBeVisible();

    await link.click();
    await expect(page).toHaveURL(/\/privacy$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('contact page shows the inquiry form', async ({ page }) => {
    await page.goto('/contact');

    await expect(page.locator('form')).toBeVisible();
    // At least one text field + a submit control exist.
    expect(await page.getByRole('textbox').count()).toBeGreaterThan(0);
    await expect(page.getByRole('button').first()).toBeVisible();
});
