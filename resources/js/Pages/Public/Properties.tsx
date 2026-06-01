import { useEffect, useMemo, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import type { ContentValue, FeaturedProject, PropertiesPageProps } from '@/types/home';

type ListingFilter = 'all' | 'for_sale' | 'for_rent';

const FILTERS: { key: ListingFilter; i18n: string }[] = [
    { key: 'all', i18n: 'properties.filters.all' },
    { key: 'for_sale', i18n: 'properties.filters.forSale' },
    { key: 'for_rent', i18n: 'properties.filters.forRent' },
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

    const [filter, setFilter] = useState<ListingFilter>('all');
    const filtered = useMemo(
        () => (filter === 'all' ? props.projects : props.projects.filter((p) => p.listing_status === filter)),
        [props.projects, filter],
    );

    // Client-side pagination — 6 cards per page.
    const PER_PAGE = 6;
    const [page, setPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    // Reset to page 1 whenever the filter changes (or the result set shrinks).
    useEffect(() => {
        setPage(1);
    }, [filter]);
    const projects = useMemo(
        () => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE),
        [filtered, page],
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

                        <div className="lg:max-w-md lg:text-end">
                            <p className="text-lg sm:text-xl lg:text-2xl text-ink-muted leading-relaxed">
                                {text(hero, 'subtitle') || t('properties.hero.subtitle')}
                            </p>
                            <Link
                                href="/contact"
                                className="mt-4 inline-flex items-center gap-2 text-base sm:text-lg font-semibold tracking-wide text-ink uppercase transition-colors hover:text-primary"
                            >
                                {t('nav.contact')}
                                <ArrowRight size={22} className="rtl:rotate-180" />
                            </Link>
                        </div>
                    </div>

                    {/* Wide hero banner matching prop_hero.svg: the 1148×646
                        rounded rect (rx=170) cropped to a 1148×442 window — so
                        rounded TOP corners, straight sides, flat bottom, with the
                        building filling the frame (object-cover, anchored to top). */}
                    <motion.div
                        className="mt-10 sm:mt-12 aspect-574/221 overflow-hidden rounded-t-[48px] sm:rounded-t-[88px] lg:rounded-t-[130px] xl:rounded-t-[170px]"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <img
                            src="/images/properties/properties-hero.webp"
                            alt=""
                            className="h-full w-full object-cover object-top select-none"
                            loading="eager"
                        />
                    </motion.div>
                </div>
            </section>

            {/* ---------------- LISTINGS ---------------- */}
            <section className="bg-surface py-16 sm:py-24">
                <div className="section-x">
                    {/* Filter pills — navy (#1A3954) rounded-full, active solid /
                        inactive 42% opacity, per PROJECTS SHOWCASE.svg. */}
                    <div className="flex flex-wrap gap-3 sm:gap-4">
                        {FILTERS.map(({ key, i18n }) => {
                            const active = filter === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setFilter(key)}
                                    className={cn(
                                        'rounded-full px-6 py-2 min-w-44 text-center text-sm sm:text-base font-medium text-white transition-colors cursor-pointer',
                                        active ? 'bg-[#1A3954]' : 'bg-[#1A3954]/40 hover:bg-[#1A3954]/60',
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

                    {/* Pagination — 6 per page. */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                aria-label="Previous page"
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 text-primary transition-colors hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-primary cursor-pointer"
                            >
                                <ChevronLeft size={20} className="rtl:rotate-180" />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => setPage(n)}
                                    aria-label={`Page ${n}`}
                                    aria-current={n === page ? 'page' : undefined}
                                    className={cn(
                                        'h-10 w-10 rounded-full text-sm font-medium transition-colors cursor-pointer',
                                        n === page
                                            ? 'bg-primary text-white'
                                            : 'text-ink-muted hover:bg-primary/10 hover:text-primary',
                                    )}
                                >
                                    {n}
                                </button>
                            ))}

                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                aria-label="Next page"
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 text-primary transition-colors hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-primary cursor-pointer"
                            >
                                <ChevronRight size={20} className="rtl:rotate-180" />
                            </button>
                        </div>
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
        // Whole card is the link (the SVG card has no separate button).
        // #E5EBF0 card rx=52, near-square image rx=44, white FOR SALE badge.
        <Link
            href={`/properties/${project.slug}`}
            className="group flex flex-col rounded-[52px] bg-[#E5EBF0] p-2 transition-shadow hover:shadow-lg"
        >
            <div className="relative aspect-square w-full overflow-hidden rounded-[44px] bg-primary-light/30">
                <img
                    src={project.image_url}
                    alt={title}
                    loading="lazy"
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                {status && (
                    <span className="absolute top-5 inset-s-5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink shadow-sm">
                        {t(status)}
                    </span>
                )}
            </div>

            <div className="flex flex-col items-center px-3 pt-4 pb-5 text-center">
                <h3 className="text-base sm:text-lg font-semibold uppercase tracking-wide text-ink">
                    {title}
                </h3>
                {location && <p className="mt-1 text-sm sm:text-base text-ink">{location}</p>}
                {project.area_sqm != null && (
                    <p className="text-sm sm:text-base text-ink">{areaLabel}</p>
                )}
            </div>
        </Link>
    );
}
