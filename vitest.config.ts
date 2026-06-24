/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import path from 'path';

// Vitest config for the pure front-end helpers in resources/js/lib. These have
// no DOM dependency, so the default `node` environment is enough (no jsdom). The
// `@` alias mirrors vite.config.ts so test imports resolve the same way.
export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
    test: {
        environment: 'node',
        include: ['resources/js/**/*.{test,spec}.{ts,tsx}'],
    },
});
