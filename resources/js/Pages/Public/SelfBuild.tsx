import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import PublicLayout from '@/Layouts/PublicLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/cn';
import type { SelfBuildPageProps, ContentValue, SiteContentBundle } from '@/types/home';

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

const NAVY = '#1A3954';

// The process-flow steps, in order. Each reads its label from `site_content`
// (section `process`, key `step_N`) and has a matching 3D icon.
const STEPS = [
    { key: 'step_1', image: 'land-selection.webp' },
    { key: 'step_2', image: 'legal-verification.webp' },
    { key: 'step_3', image: 'engineering-design.webp' },
    { key: 'step_4', image: 'specifications.webp' },
    { key: 'step_5', image: 'execution.webp' },
    { key: 'step_6', image: 'documentation.webp' },
    { key: 'step_7', image: 'handover.webp' },
    { key: 'step_8', image: 'after-sales.webp' },
] as const;

export default function SelfBuild() {
    const { props } = usePage<SelfBuildPageProps>();
    const { language } = useLanguage();
    const { t } = useTranslation();
    const ar = language === 'ar';

    const content = ar ? props.content_ar : props.content_en;
    const text = makeText(content, t);

    const heroTagline = text('hero', 'title', 'selfBuild.hero.title');
    const processTitle = text('process', 'title', 'selfBuild.process.title');

    // --- SEO: admin per-page values win, else fall back to the page copy. ---
    const seoTitle = (ar ? props.seo.title_ar : props.seo.title_en) || `${processTitle} · SkyAmman`;
    const seoDescription = (ar ? props.seo.description_ar : props.seo.description_en) || heroTagline;
    const homeUrl = new URL(props.url).origin + '/';

    const jsonLdHtml = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: t('nav.home'), item: homeUrl },
            { '@type': 'ListItem', position: 2, name: t('nav.selfBuild'), item: props.url },
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

            {/* ---------------- HERO BANNER ---------------- */}
            {sectionVisible(content.hero) && (
                <section data-nav-bg="light" className="overflow-hidden bg-surface">
                    <div className="section-x pt-28 pb-10 sm:pt-32 sm:pb-14 lg:pt-40">
                        <div className="relative">
                            {/* Decorative pills: light-blue peeking top-start, navy
                                peeking bottom-end (per the design). */}
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -top-14 -inset-s-16 z-0 hidden h-80 w-[68%] max-w-4xl rounded-full bg-primary lg:block"
                            />
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -bottom-14 -inset-e-16 z-0 hidden h-80 w-[68%] max-w-4xl rounded-full bg-[#1A3954] lg:block"
                            />
                            <div className="relative isolate min-h-64 overflow-hidden rounded-full sm:min-h-72 lg:min-h-0 lg:aspect-1130/312">
                                <img
                                    src="/images/self-build/hero.webp"
                                    alt=""
                                    className="absolute inset-0 h-full w-full object-cover object-center"
                                    loading="eager"
                                />
                                <div aria-hidden="true" className="absolute inset-0" style={{ backgroundColor: `${NAVY}A6` }} />
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center sm:gap-3">
                                    <p className="text-2xl font-light uppercase text-white drop-shadow-sm sm:text-4xl lg:text-7xl">
                                        {heroTagline}
                                    </p>
                                    <h1 className="text-2xl font-bold uppercase text-white drop-shadow-sm sm:text-4xl lg:text-7xl">
                                        {processTitle}
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ---------------- PROCESS FLOW TIMELINE ---------------- */}
            {/* Bottom fades from white into the footer blue (#78AFCE / primary-deep)
                and -mb-16 cancels the footer's top margin so they connect flush. */}
            {sectionVisible(content.process) && (
                <section className="-mb-16 bg-linear-to-b from-white from-90% to-primary-deep pb-20 sm:pb-28">                    <div className="section-x">
                        <div className="relative mx-auto max-w-6xl py-6">
                            {/* Central vertical line. */}
                            <div
                                aria-hidden="true"
                                className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 rounded-full"
                                style={{ backgroundColor: NAVY }}
                            />

                            <div className="relative flex flex-col gap-10 sm:gap-14">
                                {STEPS.map((step, i) => {
                                    const right = i % 2 === 0;
                                    const label = text('process', step.key, `selfBuild.process.${step.key}`);
                                    // Slide in from the step's own (outer) side. Flip the
                                    // physical direction in RTL since the grid mirrors.
                                    const slideFrom = right ? 64 : -64;
                                    const fromX = ar ? -slideFrom : slideFrom;

                                    return (
                                        <div key={step.key} className="relative grid grid-cols-2">
                                            {/* Node on the central line. */}
                                            <span
                                                aria-hidden="true"
                                                className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 bg-white"
                                                style={{ borderColor: NAVY }}
                                            />

                                            {/* Icon + label — slides in from its own side. */}
                                            <motion.div
                                                initial={{ opacity: 0, x: fromX }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true, amount: 0.5 }}
                                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                                className={cn(
                                                    'flex flex-col items-center text-center',
                                                    right ? 'col-start-2 ps-4 sm:ps-8' : 'col-start-1 pe-4 sm:pe-8',
                                                )}
                                            >
                                                <img
                                                    src={`/images/self-build/${step.image}`}
                                                    alt=""
                                                    loading="lazy"
                                                    className="h-auto w-56 object-contain sm:w-96 lg:w-lg"
                                                />
                                                <span className="mt-2 text-base font-semibold text-ink sm:text-lg lg:text-xl">
                                                    {label}
                                                </span>
                                            </motion.div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}
