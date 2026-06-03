import { Head, Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import type { InvestmentPageProps, ContentValue, SiteContentBundle } from '@/types/home';

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

// Navy used for the decorative pills + image overlays (matches the Figma #1A3954).
const NAVY = '#1A3954';

export default function Investment() {
    const { props } = usePage<InvestmentPageProps>();
    const { language } = useLanguage();
    const { t } = useTranslation();
    const ar = language === 'ar';

    const content = ar ? props.content_ar : props.content_en;
    const text = makeText(content, t);

    // Hero heading — bold main + lighter "(BUY/ RENT OR BUILD)?" suffix. Split on
    // the parenthesis (present in both locales) so the weight change is automatic.
    const heroTitle = text('hero', 'title', 'investment.hero.title');
    // Line breaks come from the content itself (newline-separated), so each
    // locale controls its own wrapping. A line wrapped in parentheses (the EN
    // "(BUY/ RENT OR BUILD)?") renders in a lighter weight.
    const heroLines = heroTitle.split('\n').map((l) => l.trim()).filter(Boolean);
    const heroCta = text('hero', 'cta', 'investment.hero.cta');

    const edHeading = text('editorial', 'heading', 'investment.editorial.heading');
    const edAccent = text('editorial', 'heading_accent', 'investment.editorial.heading_accent');
    const edBody = text('editorial', 'body', 'investment.editorial.body');

    const ctaHeading = text('cta', 'heading', 'investment.cta.heading');
    const ctaButton = text('cta', 'button', 'investment.cta.button');

    // --- SEO: admin per-page values win, else fall back to the page copy. ---
    const seoTitle = (ar ? props.seo.title_ar : props.seo.title_en) || `${ar ? 'الاستثمار' : 'Investment'} · SkyAmman`;
    const seoDescription = (ar ? props.seo.description_ar : props.seo.description_en) || edBody;
    const homeUrl = new URL(props.url).origin + '/';

    const jsonLdHtml = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: t('nav.home'), item: homeUrl },
            { '@type': 'ListItem', position: 2, name: t('nav.investment'), item: props.url },
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
                <meta property="og:image" content={`${homeUrl}images/investment/hero.webp`} />
                {/* Same URL serves both locales (session-driven). */}
                <link rel="alternate" hrefLang="en" href={props.url} />
                <link rel="alternate" hrefLang="ar" href={props.url} />
                <link rel="alternate" hrefLang="x-default" href={props.url} />
            </Head>

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml }} />

            {/* ---------------- HERO ---------------- */}
            {sectionVisible(content.hero) && (
                <section data-nav-bg="light" className="bg-surface">
                    <div className="section-x pt-28 pb-12 sm:pt-32 sm:pb-16 lg:pt-44">
                        <div className="relative">
                            {/* Decorative navy pill (Figma "Rectangle 38": 688×329
                                stadium) peeking above the top-end corner. */}
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -top-16 inset-e-0 z-0 hidden h-80 w-[65%] max-w-206 rounded-full lg:block"
                                style={{ backgroundColor: NAVY }}
                            />
                            <div className="relative isolate min-h-115 overflow-hidden rounded-4xl sm:min-h-140 sm:rounded-[80px] sm:aspect-1253/705 lg:rounded-[120px]">
                                <img
                                    src="/images/investment/hero.webp"
                                    alt=""
                                    className="absolute inset-0 h-full w-full object-cover object-center"
                                    loading="eager"
                                />
                                {/* Slight darkening so the white heading stays legible. */}
                                <div aria-hidden="true" className="absolute inset-0 bg-black/30" />
                                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
                                    <h1 className="max-w-5xl text-4xl font-bold uppercase leading-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.55)] sm:text-6xl lg:text-7xl">
                                        {heroLines.map((line, i) => (
                                            <span key={i} className={line.startsWith('(') ? 'block font-light' : 'block'}>
                                                {line}
                                            </span>
                                        ))}
                                    </h1>
                                    <Link
                                        href="/contact"
                                        className="mt-8 inline-flex items-center gap-3 rounded-3xl bg-primary px-10 py-4 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark sm:mt-10 sm:px-12 sm:py-5 sm:text-2xl"
                                    >
                                        {heroCta}
                                        <ArrowRight size={26} className="rtl:rotate-180" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ---------------- EDITORIAL (image cluster + text) ---------------- */}
            {sectionVisible(content.editorial) && (
                <section className="bg-surface py-12 sm:py-16 lg:py-20">
                    <div className="section-x grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
                        {/* Amman city cluster: one tall image + two stacked. */}
                        <div className="grid w-full grid-cols-2 grid-rows-2 gap-4 sm:gap-5">
                            <div className="row-span-2 overflow-hidden rounded-[40px]">
                                <img src="/images/investment/city-1.webp" alt="" loading="lazy" className="h-full w-full object-cover object-center" />
                            </div>
                            <div className="overflow-hidden rounded-4xl aspect-311/208">
                                <img src="/images/investment/city-2.webp" alt="" loading="lazy" className="h-full w-full object-cover object-center" />
                            </div>
                            <div className="overflow-hidden rounded-4xl aspect-311/208">
                                <img src="/images/investment/city-3.webp" alt="" loading="lazy" className="h-full w-full object-cover object-center" />
                            </div>
                        </div>

                        {/* Two-tone heading + body. */}
                        <div className="max-w-2xl">
                            <h2 className="text-3xl font-bold leading-snug sm:text-4xl lg:text-5xl">
                                <span className="text-ink">{edHeading} </span>
                                <span className="text-primary">{edAccent}</span>
                            </h2>
                            <p className="mt-6 text-xl leading-relaxed text-ink-muted sm:text-2xl lg:text-3xl">
                                {edBody}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* ---------------- BOTTOM CTA BANNER ---------------- */}
            {sectionVisible(content.cta) && (
                <section className="bg-surface pb-16 sm:pb-24">
                    <div className="section-x">
                        <div className="relative">
                            {/* Decorative navy pill peeking behind the bottom-start edge. */}
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -bottom-16 -inset-s-6 z-0 hidden h-96 w-[80%] max-w-248 rounded-4xl sm:rounded-[70px] lg:rounded-[97px] lg:block"
                                style={{ backgroundColor: NAVY }}
                            />
                            <div className="relative isolate min-h-105 overflow-hidden rounded-4xl sm:min-h-100 sm:rounded-[70px] sm:aspect-1247/486 lg:rounded-[97px]">
                                <img
                                    src="/images/investment/banner.webp"
                                    alt=""
                                    className="absolute inset-0 h-full w-full object-cover object-center"
                                    loading="lazy"
                                />
                                <div aria-hidden="true" className="absolute inset-0 bg-black/35" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6 text-center sm:p-10">
                                    <h2 className="max-w-3xl text-xl font-bold leading-snug text-white drop-shadow-sm sm:text-3xl lg:text-4xl">
                                        {ctaHeading}
                                    </h2>
                                    <Link
                                        href="/self-build"
                                        className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark sm:text-base"
                                    >
                                        {ctaButton}
                                        <ArrowRight size={18} className="rtl:rotate-180" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}
