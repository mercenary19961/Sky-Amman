import '../css/app.css';
import './bootstrap';
import './i18n';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot, hydrateRoot } from 'react-dom/client';
import type { ComponentType, ReactNode } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ToastProvider } from '@/contexts/ToastContext';

function Providers({ children }: { children: ReactNode }) {
    return (
        <LanguageProvider>
            <ToastProvider>{children}</ToastProvider>
        </LanguageProvider>
    );
}

// Inertia v3 renamed the v2 'invalid' event → 'httpException'. Same payload
// shape (event.detail.response.status), same purpose: catch 419 CSRF expiry
// and reload so the user gets a fresh token instead of a silent failure.
router.on('httpException', (event) => {
    if (event.detail.response.status === 419) {
        event.preventDefault();
        window.location.reload();
    }
});

createInertiaApp({
    title: (title) => (title ? `Sky Amman | ${title}` : 'Sky Amman'),
    progress: false,
    // resolvePageComponent resolves to { default: Component }; Inertia v3's
    // resolver wants the component itself, so unwrap with .then(m => m.default).
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob<{ default: ComponentType }>('./Pages/**/*.tsx'),
        ).then((m) => m.default),
    setup({ el, App, props }) {
        const appElement = (
            <App {...props}>
                {({ Component, props: pageProps, key }) => (
                    <Providers>
                        <Component key={key} {...pageProps} />
                    </Providers>
                )}
            </App>
        );

        if (el.hasChildNodes()) {
            hydrateRoot(el, appElement);
        } else {
            createRoot(el).render(appElement);
        }
    },
});
