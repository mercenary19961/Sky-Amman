import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import PublicLayout from '@/Layouts/PublicLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/cn';
import type { AboutPageProps, ContentValue, SiteContentBundle } from '@/types/home';

const NAVY = '#1A3954';

/** CMS-first resolver: CMS row when present & visible, else the i18n fallback. */
function makeText(content: SiteContentBundle, t: (k: string) => string) {
    return (section: string, key: string, fallbackKey: string): string => {
        const row: ContentValue | undefined = content?.[section]?.[key];
        if (row && row.is_visible && row.content) return row.content;
        return t(fallbackKey);
    };
}

/** A section is visible unless every one of its CMS rows is toggled off. */
function sectionVisible(section: Record<string, ContentValue> | undefined): boolean {
    if (!section) return true;
    const rows = Object.values(section);
    if (rows.length === 0) return true;
    return rows.some((r) => r.is_visible);
}

export default function About() {
    const { props } = usePage<AboutPageProps>();
    const { language } = useLanguage();
    const { t } = useTranslation();
    const ar = language === 'ar';

    const content = ar ? props.content_ar : props.content_en;
    const text = makeText(content, t);

    const heroTitle = text('hero', 'title', 'about.hero.title');
    const [heroFirst, ...heroRest] = heroTitle.split(' ');
    const heroRestStr = heroRest.join(' ');

    const introBody = text('intro', 'body', 'about.intro.body');
    const craftedTitle = text('crafted', 'title', 'about.crafted.title');
    const craftedBody = text('crafted', 'body', 'about.crafted.body');
    const missionTitle = text('mission', 'title', 'about.mission.title');
    const missionBody = text('mission', 'body', 'about.mission.body');
    const visionTitle = text('vision', 'title', 'about.vision.title');
    const visionBody = text('vision', 'body', 'about.vision.body');
    const leadershipTitle = text('leadership', 'title', 'about.leadership.title');
    const leadershipBody = text('leadership', 'body', 'about.leadership.body');

    // --- SEO ---
    const seoTitle = (ar ? props.seo.title_ar : props.seo.title_en) || `${ar ? 'من نحن' : 'About Us'} · SkyAmman`;
    const seoDescription = (ar ? props.seo.description_ar : props.seo.description_en) || introBody;
    const homeUrl = new URL(props.url).origin + '/';
    const jsonLdHtml = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: t('nav.home'), item: homeUrl },
            { '@type': 'ListItem', position: 2, name: t('nav.about'), item: props.url },
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
                <link rel="alternate" hrefLang="en" href={props.url} />
                <link rel="alternate" hrefLang="ar" href={props.url} />
                <link rel="alternate" hrefLang="x-default" href={props.url} />
            </Head>

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml }} />

            {/* ---------------- HERO ---------------- */}
            {sectionVisible(content.hero) && (
                <section data-nav-bg="light" className="overflow-hidden bg-surface">
                    <div className="section-x pt-28 pb-20 sm:pt-32 sm:pb-28 lg:pt-40 lg:pb-36">
                        {/* Wrapper sized to the banner; the two pills sit BEHIND it
                            (z-0) and peek diagonally — navy top-start, light-blue
                            bottom-end — per Desktop.svg rect geometry. */}
                        <div className="relative">
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute z-0 hidden rounded-full lg:block"
                                style={{ top: '-8%', insetInlineStart: '-7%', width: '64%', height: '88%', backgroundColor: NAVY }}
                            />
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute z-0 hidden rounded-full bg-primary lg:block"
                                style={{ top: '24%', insetInlineStart: '43%', width: '64%', height: '88%' }}
                            />
                            <div className="relative z-10 min-h-44 overflow-hidden rounded-[40px] sm:min-h-52 sm:rounded-[80px] lg:min-h-0 lg:aspect-1241/422 lg:rounded-[150px]">
                                <img
                                    src="/images/about/hero-banner.webp"
                                    alt=""
                                    className="absolute inset-0 h-full w-full object-cover object-center"
                                    loading="eager"
                                />
                                <div aria-hidden="true" className="absolute inset-0" style={{ backgroundColor: `${NAVY}B3` }} />
                                <div className="absolute inset-0 flex items-end justify-start p-6 sm:p-10 lg:p-14">
                                    <h1 className="text-start text-6xl uppercase leading-none text-white drop-shadow-sm sm:text-8xl lg:text-[11rem] xl:text-[12rem]">
                                        <span className="font-bold">{heroFirst}</span>
                                        {heroRestStr && <span className="font-light"> {heroRestStr}</span>}
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ---------------- INTRO CARD ---------------- */}
            {sectionVisible(content.intro) && (
                <section className="bg-surface pb-12 sm:pb-16">
                    <div className="section-x">
                        <div
                            className="rounded-[36px] px-8 py-10 sm:rounded-[60px] sm:px-14 sm:py-14 lg:rounded-[90px] lg:px-20 lg:py-16"
                            style={{ backgroundColor: NAVY }}
                        >
                            <p className="mx-auto max-w-4xl text-center text-lg leading-relaxed text-white sm:text-xl lg:text-2xl">
                                {introBody}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* ---------------- CRAFTED (cluster + text) ---------------- */}
            {sectionVisible(content.crafted) && (
                <section className="bg-surface py-12 sm:py-16 lg:py-20">
                    <div className="section-x grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
                        {/* Image cluster: one tall + two stacked. */}
                        <div className="grid w-full grid-cols-2 grid-rows-2 gap-3 sm:gap-4">
                            <div className="row-span-2 overflow-hidden rounded-[36px]">
                                <img src="/images/about/crafted-1.webp" alt="" loading="lazy" className="h-full w-full object-cover object-center" />
                            </div>
                            <div className="overflow-hidden rounded-3xl aspect-200/182">
                                <img src="/images/about/crafted-2.webp" alt="" loading="lazy" className="h-full w-full object-cover object-center" />
                            </div>
                            <div className="overflow-hidden rounded-3xl aspect-200/182">
                                <img src="/images/about/crafted-3.webp" alt="" loading="lazy" className="h-full w-full object-cover object-center" />
                            </div>
                        </div>

                        <div className="max-w-xl">
                            <h2 className="text-2xl font-bold leading-snug text-ink sm:text-3xl lg:text-4xl">
                                {craftedTitle}
                            </h2>
                            <p className="mt-5 text-base leading-relaxed text-ink-muted sm:text-lg">
                                {craftedBody}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* ---------------- MISSION / VISION ---------------- */}
            {sectionVisible(content.mission) && (
                <CloudBar title={missionTitle} body={missionBody} side="start" />
            )}
            {sectionVisible(content.vision) && (
                <CloudBar title={visionTitle} body={visionBody} side="end" />
            )}

            {/* ---------------- LEADERSHIP (fades into footer) ---------------- */}
            {sectionVisible(content.leadership) && (
                <section className="-mb-16 bg-linear-to-b from-white from-35% to-primary-deep pt-12 pb-24 sm:pt-16 sm:pb-32">
                    <div className="section-x text-center">
                        <h2 className="mx-auto max-w-3xl text-3xl font-bold leading-tight text-ink sm:text-4xl lg:text-5xl">
                            {leadershipTitle}
                        </h2>
                        <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-ink-muted sm:text-xl lg:text-2xl">
                            {leadershipBody}
                        </p>
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}

/**
 * Mission / Vision band — brand-blue rounded bar with the footer cloud bleeding
 * in from one side, a big faded title overlapping the top edge, and white body
 * text. `side` controls which edge the cloud + title lean toward.
 */
function CloudBar({ title, body, side }: { title: string; body: string; side: 'start' | 'end' }) {
    return (
        <section className="bg-surface py-10 sm:py-12">
            <div className="section-x">
                <div className="relative mt-8 sm:mt-12">
                    {/* Large faded title, overlapping the top of the bar. */}
                    <h2
                        className={cn(
                            'absolute -top-6 z-20 text-5xl font-bold uppercase text-primary-light sm:-top-9 sm:text-7xl lg:-top-12 lg:text-8xl',
                            side === 'start' ? 'inset-s-2 text-start sm:inset-s-8' : 'inset-e-2 text-end sm:inset-e-8',
                        )}
                    >
                        {title}
                    </h2>
                    <div className="relative isolate overflow-hidden rounded-[40px] bg-primary sm:rounded-[70px] lg:rounded-[97px]">
                        <img
                            src="/images/home/footer-clouds.webp"
                            alt=""
                            aria-hidden="true"
                            className={cn(
                                'pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-80',
                                side === 'start' ? 'object-left' : 'object-right',
                            )}
                        />
                        <p className="mx-auto max-w-4xl px-8 py-10 text-center text-base leading-relaxed text-white sm:px-14 sm:py-12 sm:text-lg lg:text-xl">
                            {body}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
