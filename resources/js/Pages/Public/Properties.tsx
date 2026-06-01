import { useMemo, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import type { ContentValue, FeaturedProject, PropertiesPageProps } from '@/types/home';

type CategoryFilter = 'all' | 'under_development' | 'ready' | 'investment_opportunity';

const FILTERS: { key: CategoryFilter; i18n: string }[] = [
    { key: 'all', i18n: 'properties.filters.all' },
    { key: 'under_development', i18n: 'home.showcase.tabs.underDevelopment' },
    { key: 'ready', i18n: 'home.showcase.tabs.ready' },
    { key: 'investment_opportunity', i18n: 'home.showcase.tabs.investmentOpportunity' },
];

/** CMS-first text resolver: returns the CMS row when present & visible, else ''. */
function text(section: Record<string, ContentValue> | undefined, key: string): string {
    const row = section?.[key];
    if (!row || !row.is_visible) return '';
    return row.content ?? '';
}

export default function Properties() {
    const { props } = usePage<PropertiesPageProps>();
    const { language } = useLanguage();
    const { t } = useTranslation();

    const content = language === 'ar' ? props.content_ar : props.content_en;
    const hero = content.hero;
    const bottomCta = content.bottom_cta;

    const [filter, setFilter] = useState<CategoryFilter>('all');
    const projects = useMemo(
        () => (filter === 'all' ? props.projects : props.projects.filter((p) => p.category === filter)),
        [props.projects, filter],
    );

    const seoTitle = props.siteSettings?.seo_title ?? 'Properties · SkyAmman';
    const seoDescription = props.siteSettings?.seo_description ?? '';

    return (
        <PublicLayout>
            <Head title={seoTitle}>
                <meta name="description" content={seoDescription} />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:type" content="website" />
            </Head>

            {/* ---------------- HERO ---------------- */}
            <section data-nav-bg="light" className="bg-surface">
                <div className="section-x pt-28 sm:pt-32 lg:pt-36">
                    {/* Text row: headline left, subtitle + contact CTA right. */}
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs sm:text-sm font-medium tracking-[0.3em] text-ink-muted uppercase">
                                {text(hero, 'label') || t('properties.hero.label')}
                            </p>
                            <h1 className="mt-3 max-w-xl text-4xl sm:text-5xl lg:text-6xl font-bold text-ink leading-[1.05]">
                                {text(hero, 'title') || t('properties.hero.title')}
                            </h1>
                        </div>

                        <div className="lg:max-w-sm lg:text-end">
                            <p className="text-base sm:text-lg text-ink-muted leading-relaxed">
                                {text(hero, 'subtitle') || t('properties.hero.subtitle')}
                            </p>
                            <Link
                                href="/contact"
                                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-ink uppercase transition-colors hover:text-primary"
                            >
                                {t('nav.contact')}
                                <ArrowRight size={18} className="rtl:rotate-180" />
                            </Link>
                        </div>
                    </div>

                    {/* Wide hero image with large rounded top corners (SVG rx=170). */}
                    <motion.div
                        className="mt-10 sm:mt-12 overflow-hidden rounded-t-[48px] sm:rounded-t-[88px] lg:rounded-t-[130px] xl:rounded-t-[170px]"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <img
                            src="/images/properties/properties-hero.webp"
                            alt=""
                            className="w-full h-auto select-none"
                            loading="eager"
                        />
                    </motion.div>
                </div>
            </section>

            {/* ---------------- LISTINGS ---------------- */}
            <section className="bg-surface py-16 sm:py-24">
                <div className="section-x">
                    {/* Filter pills */}
                    <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                        {FILTERS.map(({ key, i18n }) => {
                            const active = filter === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setFilter(key)}
                                    className={cn(
                                        'rounded-full border px-5 py-2 text-sm sm:text-base font-medium transition-colors cursor-pointer',
                                        active
                                            ? 'border-primary bg-primary text-white'
                                            : 'border-primary/40 text-ink-muted hover:border-primary hover:text-primary',
                                    )}
                                >
                                    {t(i18n)}
                                </button>
                            );
                        })}
                    </div>

                    {/* Grid */}
                    {projects.length > 0 ? (
                        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                            {projects.map((p) => (
                                <PropertyCard key={p.id} project={p} language={language} t={t} />
                            ))}
                        </div>
                    ) : (
                        <p className="mt-16 text-center text-ink-muted">
                            {t('properties.empty')}
                        </p>
                    )}
                </div>
            </section>

            {/* ---------------- BOTTOM CTA ---------------- */}
            {(text(bottomCta, 'title') || text(bottomCta, 'subtitle')) && (
                <section className="bg-surface pb-20 sm:pb-28">
                    <div className="section-x">
                        <div className="rounded-[40px] bg-primary px-6 sm:px-12 py-14 sm:py-20 text-center text-white">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                                {text(bottomCta, 'title') || t('properties.bottomCta.title')}
                            </h2>
                            <p className="mt-4 mx-auto max-w-2xl text-sm sm:text-base lg:text-lg text-white/90">
                                {text(bottomCta, 'subtitle') || t('properties.bottomCta.subtitle')}
                            </p>
                            <Link
                                href="/contact"
                                className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm sm:text-base font-semibold text-primary shadow-md transition-colors hover:bg-surface-muted"
                            >
                                {t('nav.contact')}
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}

interface PropertyCardProps {
    project: FeaturedProject;
    language: 'en' | 'ar';
    t: (key: string) => string;
}

function PropertyCard({ project, language, t }: PropertyCardProps) {
    const title = language === 'ar' ? project.title_ar : project.title_en;
    const location = language === 'ar' ? project.location_ar : project.location_en;
    const areaLabel = language === 'ar' ? `${project.area_sqm} م²` : `${project.area_sqm} M²`;

    const statusKey: Record<string, string> = {
        for_sale: 'properties.card.forSale',
        for_rent: 'properties.card.forRent',
        sold: 'properties.card.sold',
        reserved: 'properties.card.reserved',
    };
    const status = project.listing_status ? statusKey[project.listing_status] : null;

    return (
        <article className="flex flex-col overflow-hidden rounded-[40px] bg-[#E5EBF0] p-4">
            <div className="relative h-56 sm:h-64 w-full overflow-hidden rounded-[28px] bg-primary-light/30">
                <img
                    src={project.image_url}
                    alt={title}
                    loading="lazy"
                    className="h-full w-full object-cover object-center"
                />
                {status && (
                    <span className="absolute top-4 inset-s-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm">
                        {t(status)}
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col items-center px-2 pt-5 pb-3 text-center">
                <h3 className="text-base sm:text-lg font-semibold uppercase tracking-wide text-ink">
                    {title}
                </h3>
                {location && <p className="mt-2 text-sm sm:text-base text-ink">{location}</p>}
                {project.area_sqm != null && (
                    <p className="text-sm sm:text-base text-ink">{areaLabel}</p>
                )}

                <Link
                    href={`/properties/${project.slug}`}
                    className="mt-5 inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm sm:text-base font-medium text-primary shadow-sm transition-colors hover:bg-primary hover:text-white"
                >
                    {t('common.exploreMore')}
                </Link>
            </div>
        </article>
    );
}
