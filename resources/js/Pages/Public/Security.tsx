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
    { section: 'legal', image: '/images/properties/detail-hero.webp' },
    { section: 'financial', image: '/images/properties/properties-hero.webp' },
    { section: 'construction', image: '/images/properties/find-the-right-space.webp' },
] as const;

export default function Security() {
    const { props } = usePage<SecurityPageProps>();
    const { language } = useLanguage();
    const { t } = useTranslation();

    const content = language === 'ar' ? props.content_ar : props.content_en;
    const text = makeText(content, t);

    const heroTitle = text('hero', 'title', 'security.hero.title');
    const heroSubtitle = text('hero', 'subtitle', 'security.hero.subtitle');

    // Active panel (the one expanded on lg+). Construction matches the design's
    // default-open state; hovering any panel takes over.
    const [active, setActive] = useState(2);

    const seoTitle = `${heroTitle} · SkyAmman`;

    return (
        <PublicLayout>
            <Head title={seoTitle}>
                <meta name="description" content={heroSubtitle} />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:type" content="website" />
            </Head>

            {/* Hero — villa render backdrop with a brand-sky gradient wash. The
                navbar overlays this, so it opts into the dark/white treatment. */}
            <section data-nav-bg="dark" className="relative isolate overflow-hidden">
                <img
                    src="/images/security/secure-bg.webp"
                    alt=""
                    className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
                />
                {/* Sky-blue gradient wash — strong at top (under the navbar),
                    fading toward the cards so the photo reads through. */}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 bg-linear-to-b from-[#5299CC]/95 via-primary/70 to-primary/30"
                />

                <div className="section-x pt-36 pb-16 sm:pt-40 sm:pb-20 lg:pt-44 lg:pb-24">
                    <header className="max-w-2xl text-white">
                        <h1 className="text-4xl font-bold leading-[1.1] drop-shadow-sm sm:text-5xl lg:text-6xl">
                            {heroTitle}
                        </h1>
                        <p className="mt-4 text-lg font-medium text-white/90 drop-shadow-sm sm:text-xl">
                            {heroSubtitle}
                        </p>
                    </header>

                    {/* Pillars accordion. Mobile: stacked full cards (touch has no
                        hover). lg+: horizontal accordion — the active panel grows,
                        the others collapse to vertical-title bars. */}
                    <div className="mt-12 flex flex-col gap-4 sm:mt-16 lg:h-115 lg:flex-row">
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
                                        'group relative block w-full overflow-hidden rounded-4xl text-start',
                                        'transition-all duration-500 ease-in-out',
                                        'min-h-56 lg:h-full lg:min-h-0',
                                        isActive ? 'lg:grow-3' : 'lg:grow',
                                    )}
                                >
                                    <img
                                        src={pillar.image}
                                        alt=""
                                        loading="lazy"
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    {/* Darkening overlay — heavier on collapsed bars
                                        so the vertical title reads, lighter when open. */}
                                    <div
                                        aria-hidden="true"
                                        className={cn(
                                            'absolute inset-0 transition-colors duration-500',
                                            'bg-linear-to-t from-black/85 via-black/55 to-black/30',
                                            isActive ? 'lg:from-black/80 lg:via-black/50 lg:to-black/10' : 'lg:from-black/75 lg:via-black/65 lg:to-black/55',
                                        )}
                                    />

                                    {/* Collapsed vertical title — lg only, hidden when active. */}
                                    <div
                                        className={cn(
                                            'absolute inset-0 hidden items-center justify-center',
                                            !isActive && 'lg:flex',
                                        )}
                                    >
                                        <span className="rotate-180 text-2xl font-semibold tracking-wide text-white [writing-mode:vertical-rl]">
                                            {title}
                                        </span>
                                    </div>

                                    {/* Expanded content — always shown on mobile; on lg
                                        fades in only for the active panel. */}
                                    <div
                                        className={cn(
                                            'relative flex h-full flex-col justify-center gap-5 p-7 transition-opacity duration-300 sm:p-9',
                                            isActive ? 'lg:opacity-100' : 'lg:pointer-events-none lg:opacity-0',
                                        )}
                                    >
                                        <h2 className="text-2xl font-bold text-white drop-shadow-sm sm:text-3xl">
                                            {title}
                                        </h2>
                                        <ul className="space-y-3">
                                            {items.map((item, n) => (
                                                <li key={n} className="flex items-start gap-3 text-white/95">
                                                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-white" />
                                                    <span className="text-sm leading-relaxed sm:text-base">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
