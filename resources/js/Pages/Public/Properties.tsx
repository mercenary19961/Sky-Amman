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

    // SEO resolution: per-page override → site-wide Settings default → hardcoded.
    const ar = language === 'ar';
    const seoTitle = (ar ? props.seo.title_ar : props.seo.title_en) || props.siteSettings?.seo_title || 'Properties · SkyAmman';
    const seoDescription = (ar ? props.seo.description_ar : props.seo.description_en) || props.siteSettings?.seo_description || '';

    const homeUrl = new URL(props.url).origin + '/';
    const jsonLdHtml = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: t('nav.home'), item: homeUrl },
            { '@type': 'ListItem', position: 2, name: t('nav.properties'), item: props.url },
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
                {props.siteSettings?.og_image_url && <meta property="og:image" content={props.siteSettings.og_image_url} />}
                <link rel="alternate" hrefLang="en" href={props.url} />
                <link rel="alternate" hrefLang="ar" href={props.url} />
                <link rel="alternate" hrefLang="x-default" href={props.url} />
            </Head>

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml }} />

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
                <section className="bg-surface pb-12 sm:pb-16">
                    <div className="section-x">
                        <div
                            className="relative mx-auto block aspect-574/323 w-full max-w-7xl overflow-hidden rounded-[40px] sm:rounded-[80px] lg:rounded-[120px] xl:rounded-[151px]"
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
                        </div>
                    </div>
                </section>
            )}

            {/* ---------------- PROJECTS GALLERY (last section) ---------------- */}
            {/* Pool comes from project galleries (shuffled per visit by the
                controller). Hover-expand row on lg+; responsive grid below,
                where hover isn't available on touch. */}
            {props.galleryImages.length > 0 && (
                <section className="-mb-16 bg-linear-to-b from-white from-80% to-primary-deep pb-20 sm:pb-28">
                    <div className="section-x">
                        <h2 className="text-center text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-wide uppercase">
                            {t('properties.gallery.title')}
                        </h2>

                        <ProjectsGallery images={props.galleryImages} perView={props.galleryPerView} />
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}

/** Per-view tile count: `perView` on desktop, 3 on tablet, 2 on mobile. */
function useGalleryVisible(perView: number): number {
    const [count, setCount] = useState(perView);
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const update = () => {
            const w = window.innerWidth;
            setCount(w >= 1024 ? perView : w >= 640 ? 3 : 2);
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [perView]);
    return count;
}

/**
 * Projects Gallery carousel — a hover-expand row (desktop) / grid (mobile) that
 * shows a window of `visible` tiles and pages through the full shuffled pool with
 * prev/next arrows + dots. When the pool fits in one view, it renders statically
 * with no controls.
 */
function ProjectsGallery({ images, perView }: { images: { id: string; url: string; alt: string }[]; perView: number }) {
    const visible = useGalleryVisible(perView);
    const [active, setActive] = useState(0);
    const N = images.length;
    const showControls = N > visible;

    useEffect(() => { setActive((i) => (N === 0 ? 0 : i % N)); }, [N]);

    const wrap = (i: number) => ((i % N) + N) % N;
    const next = () => setActive((i) => wrap(i + 1));
    const prev = () => setActive((i) => wrap(i - 1));

    const shown = showControls
        ? Array.from({ length: visible }, (_, k) => ({ img: images[wrap(active + k)], pos: wrap(active + k) }))
        : images.map((img, pos) => ({ img, pos }));

    return (
        <div className="relative mt-10 sm:mt-12">
            {showControls && (
                <>
                    <button
                        type="button"
                        onClick={prev}
                        aria-label="Previous images"
                        className="absolute z-20 -inset-s-1 sm:-inset-s-3 lg:-inset-s-5 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-white/90 text-primary shadow-sm transition-colors hover:bg-primary hover:text-white cursor-pointer rtl:rotate-180"
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <button
                        type="button"
                        onClick={next}
                        aria-label="Next images"
                        className="absolute z-20 -inset-e-1 sm:-inset-e-3 lg:-inset-e-5 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-white/90 text-primary shadow-sm transition-colors hover:bg-primary hover:text-white cursor-pointer rtl:rotate-180"
                    >
                        <ChevronRight size={22} />
                    </button>
                </>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:h-115 lg:gap-3">
                {shown.map(({ img, pos }) => (
                    <div
                        key={pos}
                        className="group relative aspect-3/4 overflow-hidden rounded-3xl lg:aspect-auto lg:h-full lg:flex-1 lg:transition-[flex-grow] lg:duration-500 lg:ease-out lg:hover:grow-3"
                    >
                        <img
                            src={img.url}
                            alt={img.alt}
                            loading="lazy"
                            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                ))}
            </div>

            {showControls && (
                <div className="mt-6 flex justify-center items-center gap-2.5">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setActive(i)}
                            aria-label={`Go to image ${i + 1}`}
                            className={cn(
                                'rounded-full transition-all cursor-pointer',
                                i === active ? 'w-3 h-3 bg-primary' : 'w-2.5 h-2.5 bg-primary/25 hover:bg-primary/50',
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
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
    const ar = language === 'ar';
    const unit = ar ? 'م²' : 'm²';

    const statusKey: Record<string, string> = {
        for_sale: 'properties.card.forSale',
        for_rent: 'properties.card.forRent',
        sold: 'properties.card.sold',
        reserved: 'properties.card.reserved',
    };
    const status = project.listing_status ? statusKey[project.listing_status] : null;

    // Swappable image set (featured/OG first); fall back to the single lead image.
    const images = project.images && project.images.length > 0 ? project.images : [project.image_url];
    const [idx, setIdx] = useState(0);
    const multi = images.length > 1;

    // Step through images without following the card link.
    const step = (e: React.MouseEvent, dir: number) => {
        e.preventDefault();
        e.stopPropagation();
        setIdx((i) => (i + dir + images.length) % images.length);
    };

    // Sold listings stay visible (dimmed + SOLD badge) but can't be opened — the
    // detail route 404s for them, so the card is a plain div, not a link.
    const sold = project.listing_status === 'sold';
    const cardClass = cn(
        'group flex flex-col rounded-[52px] bg-[#E5EBF0] p-2 transition-all',
        sold ? 'cursor-default' : 'hover:shadow-lg',
        dimmed && 'opacity-55 hover:opacity-80',
    );
    const Wrapper: React.ElementType = sold ? 'div' : Link;
    const wrapperProps = sold
        ? { className: cardClass }
        : { href: `/properties/${project.slug}`, className: cardClass };

    return (
        // #E5EBF0 card rx=52, near-square image rx=44, white status badge.
        <Wrapper {...wrapperProps}>
            <div className="relative aspect-square w-full overflow-hidden rounded-[44px] bg-primary-light/30">
                <img
                    src={images[idx]}
                    alt={title}
                    loading="lazy"
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                {status && (
                    <span className="absolute top-5 inset-s-5 z-10 rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink shadow-sm">
                        {t(status)}
                    </span>
                )}

                {/* Image swap controls — only when the project has more than one image. */}
                {multi && (
                    <>
                        <button
                            type="button"
                            onClick={(e) => step(e, -1)}
                            aria-label="Previous image"
                            className="absolute inset-s-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-ink opacity-0 shadow-sm transition-all hover:bg-white group-hover:opacity-100 focus:opacity-100 rtl:rotate-180"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={(e) => step(e, 1)}
                            aria-label="Next image"
                            className="absolute inset-e-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-ink opacity-0 shadow-sm transition-all hover:bg-white group-hover:opacity-100 focus:opacity-100 rtl:rotate-180"
                        >
                            <ChevronRight size={18} />
                        </button>
                        {/* Dots */}
                        <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-1.5">
                            {images.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIdx(i); }}
                                    aria-label={`Go to image ${i + 1}`}
                                    className={cn(
                                        'h-2 rounded-full bg-white transition-all',
                                        i === idx ? 'w-5 opacity-100' : 'w-2 opacity-60 hover:opacity-90',
                                    )}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="flex flex-col items-center px-3 pt-4 pb-5 text-center">
                <h3 className="text-base sm:text-lg font-semibold uppercase tracking-wide text-ink">
                    {title}
                </h3>
                {location && <p className="mt-1 text-sm sm:text-base text-ink">{location}</p>}
                {(project.area_sqm != null || project.land_area_sqm != null) && (
                    <p className="text-sm sm:text-base text-ink">
                        {project.area_sqm != null && <span>{ar ? 'بناء' : 'Built'} {project.area_sqm} {unit}</span>}
                        {project.area_sqm != null && project.land_area_sqm != null && <span className="text-ink-muted"> · </span>}
                        {project.land_area_sqm != null && <span>{ar ? 'أرض' : 'Land'} {project.land_area_sqm} {unit}</span>}
                    </p>
                )}
            </div>
        </Wrapper>
    );
}
