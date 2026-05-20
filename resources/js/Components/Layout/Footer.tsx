import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { motion } from 'framer-motion';
import type { PageProps, SiteContentBundle, SiteSettings } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

const MAIN_PAGES = [
    { key: 'home', href: '/' },
    // "Listings" in the design maps to our /properties route.
    { key: 'listings', href: '/properties' },
    { key: 'blog', href: '#' },
    { key: 'about', href: '/about' },
    { key: 'contact', href: '/contact' },
] as const;

// Pages from the design that don't exist yet — rendered as dead links so the
// footer matches the mockup. Swap href → real route as each page ships.
const OTHER_PAGES = [
    { key: 'listing', href: '#' },
    { key: 'blog', href: '#' },
    { key: 'agent', href: '#' },
    { key: 'privacy', href: '#' },
    { key: 'notFound', href: '#' },
] as const;

const SOCIAL_KEYS = [
    { key: 'linkedin', settingKey: 'linkedin_url' },
    { key: 'youtube', settingKey: 'youtube_url' },
    { key: 'x', settingKey: 'twitter_url' },
    { key: 'meta', settingKey: 'facebook_url' },
    { key: 'tiktok', settingKey: 'tiktok_url' },
] as const;

/**
 * Resolve a footer string from the CMS bundle (Site Content editor → "footer"
 * page) with an i18n fallback. CMS wins when the row exists, is visible, and
 * its content for the current locale is non-empty. Nav-link labels and social
 * platform names stay in i18n — they're structural, not admin-editable.
 */
type FooterText = (section: string, key: string, fallbackKey: string) => string;

function makeFooterText(bundle: SiteContentBundle | undefined, t: TFunction): FooterText {
    return (section, key, fallbackKey) => {
        const entry = bundle?.[section]?.[key];
        if (entry && entry.is_visible && entry.content) return entry.content;
        return t(fallbackKey);
    };
}

function FooterColumns({ t, ft, siteSettings }: { t: TFunction; ft: FooterText; siteSettings?: SiteSettings }) {
    return (
        <div className="grid grid-cols-2 gap-8 sm:gap-12 lg:flex lg:items-start lg:gap-32">
            {/* Column 1 — Newsletter sign-up (visual; CTA routes to /contact).
                lg:flex-1 lets it absorb the slack so the other 3 columns bunch on the right. */}
            <div className="lg:flex-1">
                <div className="flex items-center gap-3">
                    <img
                        src="/images/home/checkbox-outline.svg"
                        alt=""
                        aria-hidden="true"
                        className="w-7 h-7 select-none"
                    />
                    <span className="text-lg sm:text-xl font-semibold">
                        {ft('subscribe', 'label', 'footer.subscribe.label')}
                    </span>
                </div>
                <Link
                    href="/contact"
                    className="mt-6 inline-flex items-center justify-center rounded-full bg-white text-primary px-8 py-2.5 text-sm font-medium hover:bg-surface-muted transition-colors"
                >
                    {ft('subscribe', 'cta', 'footer.subscribe.cta')}
                </Link>
            </div>

            {/* Column 2 — Main pages */}
            <div>
                <h3 className="text-sm font-semibold mb-3 text-white">
                    {ft('sections', 'main_pages', 'footer.sections.mainPages')}
                </h3>
                <ul className="space-y-2 text-sm text-white/85">
                    {MAIN_PAGES.map((p) => (
                        <li key={p.key}>
                            <Link href={p.href} className="hover:text-white transition-colors">
                                {t(`footer.mainPages.${p.key}`)}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Column 3 — Other pages (placeholder until those routes exist) */}
            <div>
                <h3 className="text-sm font-semibold mb-3 text-white">
                    {ft('sections', 'other_pages', 'footer.sections.otherPages')}
                </h3>
                <ul className="space-y-2 text-sm text-white/85">
                    {OTHER_PAGES.map((p) => (
                        <li key={p.key}>
                            <a href={p.href} className="hover:text-white transition-colors">
                                {t(`footer.otherPages.${p.key}`)}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Column 4 — Follow us (text links to social URLs from Settings) */}
            <div>
                <h3 className="text-sm font-semibold mb-3 text-white">
                    {ft('sections', 'follow_us', 'footer.sections.followUs')}
                </h3>
                <ul className="space-y-2 text-sm text-white/85">
                    {SOCIAL_KEYS.map(({ key, settingKey }) => {
                        const url = (siteSettings as Record<string, string | undefined>)?.[settingKey];
                        return (
                            <li key={key}>
                                {url ? (
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-white transition-colors"
                                    >
                                        {t(`footer.socials.${key}`)}
                                    </a>
                                ) : (
                                    <span className="text-white/55">
                                        {t(`footer.socials.${key}`)}
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

export function Footer() {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const { siteSettings, footerContentEn, footerContentAr } = usePage<PageProps>().props;
    const footerContent = language === 'ar' ? footerContentAr : footerContentEn;
    const ft = makeFooterText(footerContent, t);
    const year = new Date().getFullYear();

    return (
        <footer className="relative bg-primary-deep text-white overflow-hidden mt-16">
            {/* Top — columns area on clean sky (no clouds behind text) */}
            <div className="section-x pt-14 sm:pt-20 pb-10">
                <FooterColumns t={t} ft={ft} siteSettings={siteSettings} />
            </div>

            {/* Copyright */}
            <div className="section-x pb-6 text-xs text-white/85">
                © {year} {ft('copyright', 'text', 'footer.copyright')} ·{' '}
                <a href="#" className="hover:text-white">
                    {ft('copyright', 'privacy_policy', 'footer.privacyPolicy')}
                </a>
            </div>

            {/*
              Photo hero — corresponds to the lower portion of Figma Group 27.
              The SVG composition (1280×753) places the villa, two cloud clusters
              and the SKYAMMAN logo overlapping each other; the upper ~40% of that
              frame is just empty sky where the columns live. We crop to the lower
              ~60% here so the hero stays a sensible height across viewports.

              Hero aspect picked at 1280:450 (≈2.84:1). The photo elements are
              positioned with percentages re-anchored to that cropped frame; some
              extend above (top = negative %) — they're clipped by overflow-hidden,
              which is exactly how the design "places" the villa & logo so only
              their lower portions show.
            */}
            <div className="relative w-full aspect-1280/450 max-h-140 overflow-hidden">
                {/* z-10 — bottom-right cloud cluster (footer-clouds-1.png), bleeds off right */}
                <motion.img
                    src="/images/home/footer-clouds-1.png"
                    alt=""
                    aria-hidden="true"
                    className="absolute left-[38%] top-[55%] w-[84.8%] h-[86.2%] z-10 select-none pointer-events-none object-contain object-top-left"
                    initial={{ x: 220, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 1.6, ease: 'easeOut', delay: 0.1 }}
                />

                {/* z-20 — villa photo. Anchored so its bottom aligns with the hero
                    bottom; the upper half of the photo (sky) is clipped by the hero. */}
                <img
                    src="/images/home/footer-villa-photo.png"
                    alt=""
                    aria-hidden="true"
                    className="absolute right-[19.5%] top-[-48.9%] w-[93.5%] h-[149.6%] z-20 object-contain object-bottom select-none pointer-events-none"
                />

                {/* z-30 — bottom-LEFT cloud cluster (same footer-clouds-1.png reused),
                    wraps the villa from the left */}
                <motion.img
                    src="/images/home/footer-clouds-1.png"
                    alt=""
                    aria-hidden="true"
                    className="absolute left-[-15%] top-[30%] w-[84.8%] h-[86.2%] z-30 select-none pointer-events-none object-contain object-top-left"
                    initial={{ x: -220, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 1.6, ease: 'easeOut', delay: 0.25 }}
                />

                {/* z-40 — SKYAMMAN logo, center-right, overlaps the villa */}
                <img
                    src="/images/home/skyamman-logo-large.png"
                    alt="SkyAmman — Real Estate Consultancy"
                    className="absolute left-[42%] top-[1%] w-[38%] h-[65%] z-40 object-contain select-none pointer-events-none"
                />
            </div>
        </footer>
    );
}
