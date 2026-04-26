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

router.on('invalid', (event) => {
    if (event.detail.response.status === 419) {
        event.preventDefault();
        window.location.reload();
    }
});

createInertiaApp({
    title: (title) => (title ? `Sky Amman | ${title}` : 'Sky Amman'),
    progress: false,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob<{ default: ComponentType }>('./Pages/**/*.tsx'),
        ),
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
