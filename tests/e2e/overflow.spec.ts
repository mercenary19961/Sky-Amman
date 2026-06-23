import { test, expect } from '@playwright/test';

/**
 * Mobile horizontal-overflow guard. At a phone viewport, no public page should
 * scroll sideways — a stray off-screen element (animation start state, an
 * un-clipped wide image, a fixed-width row) widens the document and produces the
 * "dig deep" sideways scroll that bit the Self Build page. We assert the
 * document never grows wider than the viewport on every public route.
 */
const PUBLIC_ROUTES = ['/', '/properties', '/self-build', '/security', '/about', '/contact'];

for (const route of PUBLIC_ROUTES) {
    test(`no horizontal overflow on ${route}`, async ({ page }) => {
        await page.goto(route, { waitUntil: 'networkidle' });
        // Let fonts/images and entrance animations settle so the measurement is
        // the resting layout, not a mid-animation frame.
        await page.waitForTimeout(800);

        const { scrollWidth, innerWidth } = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth,
        }));

        // 2px of sub-pixel slack; more than that is a genuine overflow.
        expect(
            scrollWidth,
            `${route} overflows horizontally: scrollWidth ${scrollWidth} > innerWidth ${innerWidth}`,
        ).toBeLessThanOrEqual(innerWidth + 2);
    });
}
