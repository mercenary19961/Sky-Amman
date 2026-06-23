import { defineConfig, devices } from '@playwright/test';

// E2E config. Playwright boots `php artisan serve` itself (reusing an already
// running dev server locally), then drives a real Chromium against it.
//
// The app must have built assets (`npm run build`) and a seeded DB before the
// run — CI does `migrate:fresh --seed`; locally your dev DB already has them.
// APP_ENV stays `local` so SecurityHeaders skips CSP and assets load over http.
const PORT = 8000;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? [['github'], ['list']] : 'list',

    use: {
        baseURL,
        trace: 'on-first-retry',
    },

    projects: [
        // The mobile-overflow guard runs at a real phone viewport — this is the
        // invariant that would have caught the Self Build horizontal-scroll bug.
        {
            name: 'mobile',
            testMatch: /overflow\.spec\.ts/,
            use: { ...devices['Pixel 5'] },
        },
        // Smoke journeys run on desktop (inline nav, not the hamburger).
        {
            name: 'desktop',
            testMatch: /smoke\.spec\.ts/,
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    webServer: {
        command: 'php artisan serve --host=127.0.0.1 --port=8000',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
