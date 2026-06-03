import { useState } from 'react';
import { motion } from 'framer-motion';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import PublicLayout from '@/Layouts/PublicLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/cn';
import type { SecurityPageProps, ContentValue, SiteContentBundle } from '@/types/home';

/** CMS-first resolver: CMS row when present & visible, else the i18n fallback. */
function makeText(content: SiteContentBundle, t: (k: string) => string) {
    return (section: string, key: string, fallbackKey: string): string => {
        const row: ContentValue | undefined = content?.[section]?.[key];
        if (row && row.is_visible && row.content) return row.content;
        return t(fallbackKey);
    };
}

/**
 * Section-visibility predicate (innovation #5): a section counts as visible
 * unless every one of its CMS rows has been toggled off. Unseeded sections
 * default to visible so missing rows never hide code-only UI.
 */
function sectionVisible(section: Record<string, ContentValue> | undefined): boolean {
    if (!section) return true;
    const rows = Object.values(section);
    if (rows.length === 0) return true;
    return rows.some((r) => r.is_visible);
}

// The three pillars, in display order. Each gets a building backdrop (admin can
// swap these renders later) and reads its copy from `site_content` section `key`.
const PILLARS = [
    { section: 'legal', image: '/images/security/legal.webp' },
    { section: 'financial', image: '/images/security/financial.webp' },
    { section: 'construction', image: '/images/security/construction.webp' },
] as const;

export default function Security() {
    const { props } = usePage<SecurityPageProps>();
    const { language } = useLanguage();
    const { t } = useTranslation();

    const content = language === 'ar' ? props.content_ar : props.content_en;
    const text = makeText(content, t);

    const heroTitle = text('hero', 'title', 'security.hero.title');
    const heroSubtitle = text('hero', 'subtitle', 'security.hero.subtitle');
    const showSubtitle = sectionVisible(content.hero);

    // Drop any pillar whose section has been fully hidden in the admin.
    const visiblePillars = PILLARS.filter((p) => sectionVisible(content[p.section]));

    // State-driven accordion (21st.dev "interactive image accordion" pattern).
    // One pillar is expanded; hovering (desktop) or tapping (touch) moves it.
    // The last pillar (Construction) opens by default to match the Figma. The
    // detail bullets are conditionally RENDERED — they only exist in the DOM for
    // the active pillar, so a collapsed one can never show them.
    const [active, setActive] = useState(2);
    const activeIndex = Math.min(active, visiblePillars.length - 1);

    // --- SEO: admin per-page values win, else fall back to the hero copy. ---
    const ar = language === 'ar';
    const seoTitle = (ar ? props.seo.title_ar : props.seo.title_en) || `${heroTitle} · SkyAmman`;
    const seoDescription = (ar ? props.seo.description_ar : props.seo.description_en) || heroSubtitle;
    const homeUrl = new URL(props.url).origin + '/';

    // BreadcrumbList JSON-LD (Home › Security). `<` escaped so a stray
    // "</script>" in the data can't break out of the tag.
    const jsonLdHtml = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: t('nav.home'), item: homeUrl },
            { '@type': 'ListItem', position: 2, name: heroTitle, item: props.url },
        ],
    }).replace(/</g, '\\u003c');

    return (
        <PublicLayout>
            <Head title={seoTitle}>
                <meta name="description" content={seoDescription} />
                <link rel="canonical" href={props.url} />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={props.url} />
                {/* Same URL serves both locales (session-driven), so all hreflang
                    variants point at the canonical URL. */}
                <link rel="alternate" hrefLang="en" href={props.url} />
                <link rel="alternate" hrefLang="ar" href={props.url} />
                <link rel="alternate" hrefLang="x-default" href={props.url} />
            </Head>

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml }} />

            {/* Brand-blue hero. The villa render sits centered and fades into the
                blue at its edges (radial mask) — per the Figma design. The navbar
                overlays the blue, so it opts into the dark/white treatment. */}
            {/* -mb-16 cancels the Footer's mt-16 on this page only (the section
                is blue, so the footer should sit flush — no white gap). Other
                pages keep the footer's top margin. */}
            <section
                data-nav-bg="dark"
                className="relative isolate -mb-16 min-h-screen overflow-hidden bg-primary-deep"
            >
                {/* Centered villa — masked so only the middle shows and the edges
                    dissolve into the brand blue. */}
                <img
                    src="/images/security/secure-bg.webp"
                    alt=""
                    className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-screen w-full object-cover object-center opacity-90"
                    style={{
                        WebkitMaskImage:
                            'radial-gradient(ellipse 70% 62% at 50% 44%, #000 32%, transparent 80%)',
                        maskImage:
                            'radial-gradient(ellipse 70% 62% at 50% 44%, #000 32%, transparent 80%)',
                    }}
                />
                {/* Subtle #78AFCE wash to keep the photo cohesive with the bg. */}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 bg-primary-deep/30"
                />

                <div className="section-x pt-36 pb-16 sm:pt-40 sm:pb-20 lg:pt-44 lg:pb-28">
                    <header className="max-w-3xl text-white">
                        <h1 className="text-4xl font-light leading-[1.05] drop-shadow-sm sm:text-6xl lg:text-7xl">
                            {heroTitle}
                        </h1>
                        {showSubtitle && (
                            <p className="mt-5 text-lg font-medium text-white/90 drop-shadow-sm sm:text-xl">
                                {heroSubtitle}
                            </p>
                        )}
                    </header>

                    {/* Pillars accordion (21st.dev interactive-image-accordion).
                        One pillar is expanded at a time; the others collapse to
                        narrow bars showing only the rotated title. The active panel
                        is the only one that renders its detail bullets, so a
                        collapsed pillar can never show them. Hover drives it on
                        desktop; tap on touch. lg+ = horizontal row; below lg the
                        panels stack and expand by height. */}
                    <div className="mt-12 flex flex-col gap-4 sm:mt-16 lg:h-112 lg:flex-row lg:gap-4">
                        {visiblePillars.map((pillar, i) => {
                            const isActive = i === activeIndex;
                            const title = text(pillar.section, 'title', `security.${pillar.section}.title`);
                            const items = [1, 2, 3, 4].map((n) =>
                                text(pillar.section, `item_${n}`, `security.${pillar.section}.item_${n}`),
                            );

                            return (
                                <button
                                    type="button"
                                    key={pillar.section}
                                    onMouseEnter={() => setActive(i)}
                                    onFocus={() => setActive(i)}
                                    onClick={() => setActive(i)}
                                    aria-expanded={isActive}
                                    className={cn(
                                        'relative block w-full overflow-hidden rounded-[44px] text-start',
                                        'transition-all duration-500 ease-in-out',
                                        // Mobile: expand by height. lg+: expand by width.
                                        isActive ? 'min-h-90' : 'min-h-20',
                                        'lg:h-full lg:min-h-0 lg:flex-1',
                                        isActive && 'lg:grow-3',
                                    )}
                                >
                                    {isActive ? (
                                        // Expanded — translucent black "glass" (the
                                        // photo is dropped so the page shows through).
                                        <div aria-hidden="true" className="absolute inset-0 bg-black/70" />
                                    ) : (
                                        // Collapsed — photo backdrop + darkening overlay
                                        // so the rotated title stays legible.
                                        <>
                                            <img
                                                src={pillar.image}
                                                alt=""
                                                loading="lazy"
                                                className="absolute inset-0 h-full w-full object-cover"
                                            />
                                            <div
                                                aria-hidden="true"
                                                className="absolute inset-0 bg-linear-to-t from-black/85 via-black/55 to-black/40"
                                            />
                                        </>
                                    )}

                                    {isActive ? (
                                        // Expanded — heading + detail bullets. The card
                                        // grows over 1s; if the text rendered at the narrow
                                        // start width it would wrap then reflow. So we hold
                                        // it invisible and fade it in once the card has
                                        // mostly widened (delay ≈ the width transition).
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3, delay: 0.3 }}
                                            className="relative flex h-full flex-col justify-center gap-5 p-7 sm:gap-6 sm:p-9 lg:p-10"
                                        >
                                            <h2 className="text-2xl font-bold text-white drop-shadow-sm sm:text-3xl lg:text-5xl">
                                                {title}
                                            </h2>
                                            <ul className="space-y-3 sm:space-y-4">
                                                {items.map((item, n) => (
                                                    <li key={n} className="flex items-start gap-3 text-white/95">
                                                        <span className="mt-2 h-2 w-2 flex-none rounded-full bg-white lg:h-2.5 lg:w-2.5" />
                                                        <span className="text-sm leading-relaxed sm:text-base lg:text-xl">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </motion.div>
                                    ) : (
                                        // Collapsed — title only. Horizontal on the short
                                        // mobile bar; rotated 90° on the tall lg bar.
                                        <div className="relative flex h-full items-center justify-center p-4">
                                            <span className="whitespace-nowrap text-lg font-semibold tracking-wide text-white drop-shadow-sm sm:text-xl lg:-rotate-90 lg:text-3xl">
                                                {title}
                                            </span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
