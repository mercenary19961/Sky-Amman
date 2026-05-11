import { useEffect, useState } from 'react';
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

    // Sections opt in to a navbar theme by setting `data-nav-bg="dark"` on
    // their root (= "this section's background is dark, so the navbar should
    // render light/white content while it's overlapping me"). Default tone is
    // "light" — dark text/logo on a light page background.
    const [navBg, setNavBg] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const SAMPLE_Y = 32; // px — sampled at the vertical center of the navbar

        const updateNavBg = () => {
            const sections = document.querySelectorAll<HTMLElement>('[data-nav-bg]');
            let bg: 'light' | 'dark' = 'light';
            for (const section of sections) {
                const rect = section.getBoundingClientRect();
                if (rect.top <= SAMPLE_Y && rect.bottom > SAMPLE_Y) {
                    const v = section.dataset.navBg;
                    if (v === 'dark' || v === 'light') {
                        bg = v;
                        break;
                    }
                }
            }
            setNavBg(bg);
        };

        updateNavBg();
        window.addEventListener('scroll', updateNavBg, { passive: true });
        window.addEventListener('resize', updateNavBg);
        return () => {
            window.removeEventListener('scroll', updateNavBg);
            window.removeEventListener('resize', updateNavBg);
        };
    }, []);

    const isDark = navBg === 'dark';

    return (
        // position: fixed so the navbar overlays section content (including
        // the hero's gradient) instead of taking layout space. Pages without a
        // top hero need to add their own top padding for the navbar.
        <header className="fixed top-0 inset-x-0 z-40">
            <div className="section-x h-24 flex items-center justify-between gap-6">
                <Link
                    href="/"
                    className="flex items-center transition-opacity duration-200"
                    aria-label="SkyAmman"
                >
                    {isDark ? (
                        // White logo for dark/blue sections (hero, footer overlap).
                        <img
                            src="/images/logo-white.png"
                            alt="SkyAmman"
                            className="h-16 sm:h-20 w-auto select-none"
                        />
                    ) : (
                        // TODO: swap to /images/logo-primary.png once the designer
                        // delivers the light-blue variant for white backgrounds.
                        <span className="font-bold text-lg tracking-wide text-primary">
                            SKY AMMAN
                        </span>
                    )}
                </Link>

                <nav className="hidden lg:flex items-center gap-6 text-sm mb-3">
                    {NAV_ITEMS.map((item) => {
                        const active = url === item.href;
                        return (
                            <Link
                                key={item.key}
                                href={item.href}
                                className={cn(
                                    'transition-colors duration-200',
                                    isDark
                                        ? active
                                            ? 'text-white font-medium'
                                            : 'text-white/80 hover:text-white'
                                        : active
                                            ? 'text-primary font-medium'
                                            : 'text-ink-muted hover:text-primary',
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
                    className={cn(
                        'text-sm font-medium transition-colors duration-200 mb-3',
                        isDark ? 'text-white hover:text-white/80' : 'text-ink hover:text-primary',
                    )}
                    aria-label="Toggle language"
                >
                    {t('language.toggle')}
                </button>
            </div>
        </header>
    );
}
