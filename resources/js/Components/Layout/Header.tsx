import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/cn';
import type { PageProps } from '@/types';

const NAV_ITEMS = [
    { key: 'home', href: '/' },
    { key: 'properties', href: '/properties' },
    { key: 'investment', href: '/investment' },
    { key: 'selfBuild', href: '/self-build' },
    { key: 'security', href: '/security' },
    { key: 'about', href: '/about' },
    { key: 'contact', href: '/contact' },
] as const;

export function Header() {
    const { t } = useTranslation();
    const { toggleLanguage } = useLanguage();
    const { url } = usePage<PageProps>();

    return (
        <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur border-b border-ink/5">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
                <Link href="/" className="font-bold text-lg text-primary tracking-wide">
                    SKY AMMAN
                </Link>

                <nav className="hidden lg:flex items-center gap-6 text-sm">
                    {NAV_ITEMS.map((item) => {
                        const active = url === item.href;
                        return (
                            <Link
                                key={item.key}
                                href={item.href}
                                className={cn(
                                    'text-ink-muted hover:text-primary transition-colors',
                                    active && 'text-primary font-medium',
                                )}
                            >
                                {t(`nav.${item.key}`)}
                            </Link>
                        );
                    })}
                </nav>

                <button
                    type="button"
                    onClick={toggleLanguage}
                    className="text-sm font-medium text-ink hover:text-primary transition-colors"
                    aria-label="Toggle language"
                >
                    {t('language.toggle')}
                </button>
            </div>
        </header>
    );
}
