import { useEffect, useMemo, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import type { ContentValue, FeaturedProject, PropertiesPageProps } from '@/types/home';

type Mode = 'sale' | 'rent';

// Listing statuses that belong to the "for sale" universe (vs. for_rent).
// `for_sale` = available; `sold` / `reserved` = not currently available.
const SALE_STATUSES = ['for_sale', 'sold', 'reserved'];

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

    // Two-tier filter (per PROJECTS SHOWCASE.svg):
    //  • mode: Sale vs Rent (mutually exclusive).
    //  • Sale mode adds light-blue group sub-pills + an "Available For Sale"
    //    toggle. Rent mode has no availability concept.
    const [mode, setMode] = useState<Mode>('sale');
    const [group, setGroup] = useState<string | null>(null);
    const [availableOnly, setAvailableOnly] = useState(false);

    // Distinct developments across the sale-side listings (for the sub-pills).
    const saleGroups = useMemo(() => {
        const set = new Set<string>();
        props.projects.forEach((p) => {
            if (p.group && p.listing_status && SALE_STATUSES.includes(p.listing_status)) {
                set.add(p.group);
            }
        });
        return Array.from(set);
    }, [props.projects]);

    // Resolve the visible cards. In sale mode WITHOUT the availability toggle,
    // sold / reserved listings are kept but flagged `dimmed` (rendered faded).
    const filtered = useMemo(() => {
        if (mode === 'rent') {
            return props.projects
                .filter((p) => p.listing_status === 'for_rent')
                .map((project) => ({ project, dimmed: false }));
        }
        let list = props.projects.filter(
            (p) => p.listing_status && SALE_STATUSES.includes(p.listing_status),
        );
        if (group) list = list.filter((p) => p.group === group);
        if (availableOnly) list = list.filter((p) => p.listing_status === 'for_sale');
        return list.map((project) => ({
            project,
            dimmed: !availableOnly && project.listing_status !== 'for_sale',
        }));
    }, [props.projects, mode, group, availableOnly]);

    // Switching modes clears the sale-only sub-filters.
    const selectMode = (m: Mode) => {
        setMode(m);
        if (m === 'rent') {
            setGroup(null);
            setAvailableOnly(false);
        }
    };

    // Client-side pagination — 6 cards per page.
    const PER_PAGE = 6;
    const [page, setPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    // Reset to page 1 whenever any filter changes.
    useEffect(() => {
        setPage(1);
    }, [mode, group, availableOnly]);
    const pageItems = useMemo(
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
                    {/* Filter bar: a segmented Sale/Rent control + an
                        "Available only" switch; group chips appear below in Sale
                        mode. Clean, with clearly distinct controls per type. */}
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            {/* Segmented control — mutually-exclusive mode. */}
                            <div className="inline-flex w-fit rounded-full bg-surface-muted p-1.5">
                                {(['sale', 'rent'] as const).map((m) => {
                                    const active = mode === m;
                                    return (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => selectMode(m)}
                                            className="relative rounded-full px-6 sm:px-8 py-2.5 text-sm sm:text-base font-medium transition-colors cursor-pointer"
                                        >
                                            {active && (
                                                <motion.span
                                                    layoutId="propMode"
                                                    className="absolute inset-0 rounded-full bg-[#1A3954]"
                                                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                                                />
                                            )}
                                            <span className={cn('relative z-10', active ? 'text-white' : 'text-ink-muted')}>
                                                {t(m === 'sale' ? 'properties.filters.forSale' : 'properties.filters.forRent')}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Available-only switch (Sale mode only). */}
                            {mode === 'sale' && (
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={availableOnly}
                                    onClick={() => setAvailableOnly((v) => !v)}
                                    className="inline-flex items-center gap-3 cursor-pointer"
                                >
                                    <span
                                        className={cn(
                                            'relative h-6 w-11 rounded-full transition-colors',
                                            availableOnly ? 'bg-primary' : 'bg-ink/20',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
                                                availableOnly ? 'inset-s-5.5' : 'inset-s-0.5',
                                            )}
                                        />
                                    </span>
                                    <span className="text-sm sm:text-base font-medium text-ink">
                                        {t('properties.filters.availableForSale')}
                                    </span>
                                </button>
                            )}
                        </div>

                        {/* Group chips (Sale mode only). */}
                        {mode === 'sale' && saleGroups.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <span className="me-1 text-sm font-medium text-ink-muted">
                                    {t('properties.filters.development')}:
                                </span>
                                <Chip active={group === null} onClick={() => setGroup(null)}>
                                    {t('properties.filters.allGroups')}
                                </Chip>
                                {saleGroups.map((g) => (
                                    <Chip key={g} active={group === g} onClick={() => setGroup(group === g ? null : g)}>
                                        {g}
                                    </Chip>
                                ))}
                            </div>
                        )}

                        {/* Result count. */}
                        <p className="text-sm text-ink-muted">
                            {t('properties.resultCount', { count: filtered.length })}
                        </p>
                    </div>

                    {/* Grid */}
                    {pageItems.length > 0 ? (
                        <motion.div layout className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                            <AnimatePresence mode="popLayout">
                                {pageItems.map(({ project, dimmed }) => (
                                    <motion.div
                                        key={project.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.96 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.96 }}
                                        transition={{ duration: 0.25, ease: 'easeOut' }}
                                        className="h-full"
                                    >
                                        <PropertyCard project={project} dimmed={dimmed} language={language} t={t} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
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

            {/* ---------------- BOTTOM CTA BANNER ---------------- */}
            {/* Per HERO SECTION.svg: a 1148×646 rounded image (rx≈151, all
                corners) at 74% opacity over a brand-blue card — giving the blue
                wash — with centered text and an arrow link on the trailing edge. */}
            {(text(bottomCta, 'title') || text(bottomCta, 'subtitle')) && (
                <section className="bg-surface pb-20 sm:pb-28">
                    <div className="section-x">
                        <Link
                            href="/contact"
                            aria-label={text(bottomCta, 'title') || t('properties.bottomCta.title')}
                            className="group relative mx-auto block aspect-574/323 w-full max-w-7xl overflow-hidden rounded-[40px] sm:rounded-[80px] lg:rounded-[120px] xl:rounded-[151px]"
                        >
                            {/* Banner image — slightly reduced opacity so it
                                softens against the page background. */}
                            <img
                                src="/images/properties/find-the-right-space.webp"
                                alt=""
                                loading="lazy"
                                className="absolute inset-0 h-full w-full object-cover"
                            />

                            {/* Centered text. */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center text-white">
                                <h2 className="max-w-3xl text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] drop-shadow-sm">
                                    {text(bottomCta, 'title') || t('properties.bottomCta.title')}
                                </h2>
                                <p className="mt-4 sm:mt-6 max-w-2xl text-base sm:text-xl lg:text-2xl text-white/95 drop-shadow-sm">
                                    {text(bottomCta, 'subtitle') || t('properties.bottomCta.subtitle')}
                                </p>
                            </div>

                            {/* Arrow on the trailing edge. */}
                            <span className="absolute top-1/2 inset-e-6 sm:inset-e-10 lg:inset-e-16 -translate-y-1/2 text-white transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                                <ArrowRight className="h-7 w-7 sm:h-9 sm:w-9 rtl:rotate-180" />
                            </span>
                        </Link>
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}

/** Lightweight group filter chip — active = primary fill, idle = soft outline. */
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer',
                active
                    ? 'border-primary bg-primary text-white'
                    : 'border-ink/15 text-ink-muted hover:border-primary hover:text-primary',
            )}
        >
            {active && <Check size={15} />}
            {children}
        </button>
    );
}

interface PropertyCardProps {
    project: FeaturedProject;
    language: 'en' | 'ar';
    t: (key: string) => string;
    dimmed?: boolean;
}

function PropertyCard({ project, language, t, dimmed = false }: PropertyCardProps) {
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
            className={cn(
                'group flex flex-col rounded-[52px] bg-[#E5EBF0] p-2 transition-all hover:shadow-lg',
                // Sold / reserved listings (shown when "Available For Sale" is
                // off) are faded to signal they're not currently available.
                dimmed && 'opacity-55 hover:opacity-80',
            )}
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
