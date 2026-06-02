import { useState } from 'react';
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

    // State-driven accordion (21st.dev "interactive image accordion" pattern).
    // One pillar is always expanded; hovering (desktop) or tapping (touch) moves
    // it. Construction is open by default to match the Figma. The detail bullets
    // are conditionally RENDERED — they only exist in the DOM for the active
    // pillar, so there's no chance of them showing on a collapsed one.
    const [active, setActive] = useState(2);

    const seoTitle = `${heroTitle} · SkyAmman`;

    return (
        <PublicLayout>
            <Head title={seoTitle}>
                <meta name="description" content={heroSubtitle} />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:type" content="website" />
            </Head>

            {/* Brand-blue hero. The villa render sits centered and fades into the
                blue at its edges (radial mask) — per the Figma design. The navbar
                overlays the blue, so it opts into the dark/white treatment. */}
            <section
                data-nav-bg="dark"
                className="relative isolate overflow-hidden bg-linear-to-b from-[#7FB4DD] via-primary to-primary-light"
            >
                {/* Centered villa — masked so only the middle shows and the edges
                    dissolve into the brand blue. */}
                <img
                    src="/images/security/secure-bg.webp"
                    alt=""
                    className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-center opacity-90"
                    style={{
                        WebkitMaskImage:
                            'radial-gradient(ellipse 70% 62% at 50% 44%, #000 32%, transparent 80%)',
                        maskImage:
                            'radial-gradient(ellipse 70% 62% at 50% 44%, #000 32%, transparent 80%)',
                    }}
                />
                {/* Subtle blue tint to keep the photo cohesive with the bg. */}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 bg-linear-to-b from-primary/25 via-transparent to-primary-light/40"
                />

                <div className="section-x pt-36 pb-16 sm:pt-40 sm:pb-20 lg:pt-44 lg:pb-28">
                    <header className="max-w-3xl text-white">
                        <h1 className="text-4xl font-light leading-[1.05] drop-shadow-sm sm:text-6xl lg:text-7xl">
                            {heroTitle}
                        </h1>
                        <p className="mt-5 text-lg font-medium text-white/90 drop-shadow-sm sm:text-xl">
                            {heroSubtitle}
                        </p>
                    </header>

                    {/* Pillars accordion (21st.dev interactive-image-accordion).
                        One pillar is expanded at a time; the others collapse to
                        narrow bars showing only the rotated title. The active panel
                        is the only one that renders its detail bullets, so a
                        collapsed pillar can never show them. Hover drives it on
                        desktop; tap on touch. lg+ = horizontal row; below lg the
                        panels stack and expand by height. */}
                    <div className="mt-12 flex flex-col gap-4 sm:mt-16 lg:h-112 lg:flex-row lg:gap-4">
                        {PILLARS.map((pillar, i) => {
                            const isActive = i === active;
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
                                        'transition-all duration-700 ease-in-out',
                                        // Mobile: expand by height. lg+: expand by width.
                                        isActive ? 'min-h-90' : 'min-h-20',
                                        'lg:h-full lg:min-h-0 lg:flex-1',
                                        isActive && 'lg:grow-3',
                                    )}
                                >
                                    {/* Photo backdrop. */}
                                    <img
                                        src={pillar.image}
                                        alt=""
                                        loading="lazy"
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                    {/* Darkening overlay for text legibility. */}
                                    <div
                                        aria-hidden="true"
                                        className="absolute inset-0 bg-linear-to-t from-black/85 via-black/55 to-black/40"
                                    />

                                    {isActive ? (
                                        // Expanded — heading + detail bullets.
                                        <div className="relative flex h-full flex-col justify-center gap-5 p-7 sm:gap-6 sm:p-9 lg:p-10">
                                            <h2 className="text-2xl font-bold text-white drop-shadow-sm sm:text-3xl lg:text-4xl">
                                                {title}
                                            </h2>
                                            <ul className="space-y-3 sm:space-y-4">
                                                {items.map((item, n) => (
                                                    <li key={n} className="flex items-start gap-3 text-white/95">
                                                        <span className="mt-2 h-2 w-2 flex-none rounded-full bg-white" />
                                                        <span className="text-sm leading-relaxed sm:text-base">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        // Collapsed — title only. Horizontal on the short
                                        // mobile bar; rotated 90° on the tall lg bar.
                                        <div className="relative flex h-full items-center justify-center p-4">
                                            <span className="whitespace-nowrap text-lg font-semibold tracking-wide text-white drop-shadow-sm sm:text-xl lg:-rotate-90 lg:text-2xl">
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
