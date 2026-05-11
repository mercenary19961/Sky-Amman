import './i18n';

import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { renderToString } from 'react-dom/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
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

createServer((page) =>
    createInertiaApp({
        page,
        render: renderToString,
        title: (title) => (title ? `SkyAmman | ${title}` : 'SkyAmman'),
        // Same v3 unwrap as app.tsx — resolvePageComponent returns
        // Promise<{ default: Component }>; Inertia wants Promise<Component>.
        resolve: (name) =>
            resolvePageComponent(
                `./Pages/${name}.tsx`,
                import.meta.glob<{ default: ComponentType }>('./Pages/**/*.tsx'),
            ).then((m) => m.default),
        setup: ({ App, props }) => (
            <App {...props}>
                {({ Component, props: pageProps, key }) => (
                    <Providers>
                        <Component key={key} {...pageProps} />
                    </Providers>
                )}
            </App>
        ),
    }),
);
