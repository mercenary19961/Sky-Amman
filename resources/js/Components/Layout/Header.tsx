import { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Menu, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/cn';
import type { PageProps } from '@/types';

const NAV_ITEMS = [
    { key: 'home', href: '/' },
    { key: 'properties', href: '/properties' },
    // Investment temporarily hidden — re-add this item to relist it (see CLAUDE.md).
    // { key: 'investment', href: '/investment' },
    { key: 'selfBuild', href: '/self-build' },
    { key: 'security', href: '/security' },
    { key: 'about', href: '/about' },
    { key: 'contact', href: '/contact' },
] as const;

export function Header() {
    const { t } = useTranslation();
    const { language, toggleLanguage } = useLanguage();
    const { url } = usePage<PageProps>();

    // Sections opt in to a navbar theme by setting `data-nav-bg="dark"` on
    // their root (= "this section's background is dark, so the navbar should
    // render light/white content while it's overlapping me"). Default tone is
    // "light" — dark text/logo on a light page background.
    const [navBg, setNavBg] = useState<'light' | 'dark'>('light');

    // Hide-on-scroll-down / reveal-on-scroll-up.
    const [hidden, setHidden] = useState(false);

    // Mobile hamburger menu open/closed (below lg).
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close the mobile menu whenever the route changes (Inertia visit).
    useEffect(() => {
        setMobileOpen(false);
    }, [url]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const TOP_THRESHOLD = 80; // always show within this many px of the top
        const SCROLL_DELTA = 6;   // ignore jitters smaller than this

        let lastY = window.scrollY;

        const onScroll = () => {
            const currentY = window.scrollY;

            // Near the top → always visible (handles overscroll bounce too).
            if (currentY < TOP_THRESHOLD) {
                setHidden(false);
                lastY = currentY;
                return;
            }

            const delta = currentY - lastY;
            if (Math.abs(delta) < SCROLL_DELTA) return; // skip jitter, don't update lastY

            setHidden(delta > 0); // scrolling down → hide, up → reveal
            lastY = currentY;
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

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
        // Transform-based slide so the navbar disappears when scrolling down
        // and re-enters from the top when scrolling up.
        <header
            className={cn(
                'fixed top-0 inset-x-0 z-40 transition-transform duration-300 ease-out',
                hidden ? '-translate-y-full' : 'translate-y-0',
            )}
        >
            {/* Backdrop gradient — brand sky-blue at top fading to white at
                bottom so the navbar reads as a distinct band on light page
                sections. Fades out on sections marked data-nav-bg="dark"
                (hero / footer overlap) so the underlying section gradient
                stays clean there. */}
            <div
                aria-hidden="true"
                className={cn(
                    // Bar height only (h-24) so it never bleeds into the expanded
                    // mobile menu panel below — keeps that panel a clean white.
                    'absolute inset-x-0 top-0 h-24 pointer-events-none bg-linear-to-b from-[#5299CC] to-white transition-opacity duration-300',
                    isDark ? 'opacity-0' : 'opacity-100',
                )}
            />
            <div className="relative section-x h-24 flex items-center justify-between gap-6">
                <Link
                    href="/"
                    className="flex items-center transition-opacity duration-200"
                    aria-label="SkyAmman"
                >
                    {/* White logo in both states — over dark/blue sections directly,
                        and over light sections on the navbar's blue backdrop gradient. */}
                    <img
                        src="/images/logo-white.png"
                        alt="SkyAmman"
                        className="h-16 sm:h-20 w-auto select-none"
                    />
                </Link>

                {/* Nav + language button grouped on the right; justify-between
                    on the parent keeps the logo pinned left. */}
                <div className="flex items-center gap-6">
                    <nav className="hidden lg:flex items-center gap-6 text-sm">
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
                                                ? 'text-white font-semibold'
                                                : 'text-white hover:text-white/80',
                                    )}
                                >
                                    {t(`nav.${item.key}`)}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Language switcher pill — shows the language you'll switch
                        TO ("AR" while in English, "EN" while in Arabic). */}
                    <button
                        type="button"
                        onClick={toggleLanguage}
                        className={cn(
                            'rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors duration-200',
                            isDark
                                ? 'border-white/60 text-white hover:bg-white hover:text-primary'
                                : 'border-white/80 text-white hover:bg-white hover:text-primary',
                        )}
                        aria-label="Toggle language"
                    >
                        {language === 'en' ? 'AR' : 'EN'}
                    </button>

                    {/* Hamburger — only below lg, toggles the mobile menu. */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen((o) => !o)}
                        className={cn(
                            'lg:hidden inline-flex items-center justify-center rounded-md p-1.5 transition-colors duration-200',
                            isDark ? 'text-white hover:text-white/80' : 'text-white hover:text-white/80',
                        )}
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu panel — drops below the bar on lg-down when the
                hamburger is open. Solid white surface so links read clearly
                over any section. Items stagger in; the active row gets a brand
                pill + left accent bar + chevron. */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        key="mobile-panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="lg:hidden overflow-hidden border-t border-ink/5 bg-white shadow-xl"
                    >
                        <nav className="section-x flex flex-col divide-y divide-ink/6 py-3">
                            {NAV_ITEMS.map((item, i) => {
                                const active = url === item.href;
                                return (
                                    <motion.div
                                        key={item.key}
                                        initial={{ opacity: 0, x: -14 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.25, delay: 0.06 + i * 0.045, ease: 'easeOut' }}
                                    >
                                        <Link
                                            href={item.href}
                                            aria-current={active ? 'page' : undefined}
                                            className={cn(
                                                'group flex items-center justify-between rounded-xl py-3.5 ps-5 pe-3 text-base transition-colors duration-200',
                                                active
                                                    ? 'bg-primary-strong font-semibold text-white shadow-md'
                                                    : 'text-ink hover:bg-white/60 hover:text-primary-strong',
                                            )}
                                        >
                                            <span>{t(`nav.${item.key}`)}</span>
                                            <ChevronRight
                                                size={18}
                                                className={cn(
                                                    'flex-none transition-transform duration-200 rtl:rotate-180',
                                                    active
                                                        ? 'text-white'
                                                        : 'text-ink/40 group-hover:translate-x-0.5 group-hover:text-primary-strong rtl:group-hover:-translate-x-0.5',
                                                )}
                                            />
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
