import { useEffect, useRef, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Lightbox } from '@/Components/Public/Lightbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import type { GalleryImage, PropertyDetailPageProps, RelatedProject } from '@/types/home';

const STATUS_KEY: Record<string, string> = {
    for_sale: 'properties.card.forSale',
    for_rent: 'properties.card.forRent',
    sold: 'properties.card.sold',
    reserved: 'properties.card.reserved',
};

export default function PropertyDetail() {
    const { props } = usePage<PropertyDetailPageProps>();
    const { language } = useLanguage();
    const { t } = useTranslation();
    const ar = language === 'ar';

    const p = props.project;
    const images = props.images;
    const hero = images[0];
    const thumbs = images.slice(1); // "the rest" shown as squares

    // Lightbox: holds the index of the image being viewed, or null when closed.
    const [lightbox, setLightbox] = useState<number | null>(null);

    const title = ar ? p.title_ar : p.title_en;
    const address = (ar ? p.address_ar : p.address_en) || (ar ? p.location_ar : p.location_en) || '';
    const description = (ar ? p.description_ar : p.description_en) || '';
    const status = p.listing_status ? STATUS_KEY[p.listing_status] : null;

    const unit = ar ? 'م²' : 'm²';
    const builtUpLabel = p.area_sqm != null ? `${p.area_sqm} ${unit}` : null;
    const landLabel = p.land_area_sqm != null ? `${p.land_area_sqm} ${unit}` : null;

    // Detail rows — only the specs that are set AND not hidden by the editor.
    const hidden = p.hidden_specs ?? [];
    const show = (key: string) => !hidden.includes(key);
    const specs: { label: string; value: string }[] = [];
    if (builtUpLabel && show('area_sqm')) specs.push({ label: t('properties.detail.builtUpArea'), value: builtUpLabel });
    if (landLabel && show('land_area_sqm')) specs.push({ label: t('properties.detail.landArea'), value: landLabel });
    if (p.completion_year != null && show('completion_year')) specs.push({ label: t('properties.detail.completionYear'), value: String(p.completion_year) });
    if (p.floors != null && show('floors')) specs.push({ label: t('properties.detail.floors'), value: String(p.floors) });
    if (p.bedrooms != null && show('bedrooms')) specs.push({ label: t('properties.detail.bedrooms'), value: String(p.bedrooms) });
    if (p.bathrooms != null && show('bathrooms')) specs.push({ label: t('properties.detail.bathrooms'), value: String(p.bathrooms) });

    // Per-listing SEO with sensible fallbacks to the project's own content.
    const seoTitle = (ar ? p.seo_title_ar : p.seo_title_en) || `${title} · SkyAmman`;
    const seoDescription = (ar ? p.seo_description_ar : p.seo_description_en) || description;

    // JSON-LD structured data (RealEstateListing). `<` is escaped so a stray
    // "</script>" in the data can't break out of the tag.
    const jsonLd: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: title,
        url: p.url,
    };
    if (seoDescription) jsonLd.description = seoDescription;
    if (p.og_image) jsonLd.image = [p.og_image];
    if (address) {
        jsonLd.address = {
            '@type': 'PostalAddress',
            streetAddress: address,
            addressLocality: 'Amman',
            addressCountry: 'JO',
        };
    }
    if (p.area_sqm != null && show('area_sqm')) {
        jsonLd.floorSize = { '@type': 'QuantitativeValue', value: p.area_sqm, unitCode: 'MTK' };
    }
    const jsonLdHtml = JSON.stringify(jsonLd).replace(/</g, '\\u003c');

    return (
        <PublicLayout>
            <Head title={seoTitle}>
                <meta name="description" content={seoDescription} />
                <link rel="canonical" href={p.url} />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={p.url} />
                {p.og_image && <meta property="og:image" content={p.og_image} />}
            </Head>

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml }} />

            {/* ---------------- TITLE + HERO ---------------- */}
            <section data-nav-bg="light" className="bg-surface">
                <div className="section-x pt-28 sm:pt-32 lg:pt-36">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wide text-primary">
                        {title}
                    </h1>

                    {/* Hero image with a brand-blue blob peeking bottom-end. */}
                    <div className="relative mt-6 sm:mt-8">
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -bottom-5 -inset-e-5 sm:-bottom-8 sm:-inset-e-8 h-2/3 w-2/3 rounded-[64px] bg-primary lg:rounded-[120px]"
                        />
                        <motion.button
                            type="button"
                            onClick={() => hero && setLightbox(0)}
                            aria-label={title}
                            className="group relative z-10 block w-full cursor-zoom-in overflow-hidden rounded-4xl sm:rounded-[56px] lg:rounded-[86px]"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <img
                                src={hero?.url}
                                alt={title}
                                className="aspect-1131/636 w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                                loading="eager"
                            />
                            {status && (
                                <span className="absolute bottom-5 inset-s-5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow-sm sm:bottom-7 sm:inset-s-7">
                                    {t(status)}
                                </span>
                            )}
                        </motion.button>
                    </div>
                </div>
            </section>

            {/* ---------------- INFO ROW ---------------- */}
            <section className="bg-surface py-12 sm:py-16">
                <div className="section-x grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                    {/* Left: title, address, description, CTA */}
                    <div className="flex flex-col">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-wide text-ink">
                            {title}
                        </h2>
                        {address && (
                            <p className="mt-3 text-sm sm:text-base font-semibold text-primary">
                                {address}
                            </p>
                        )}
                        {description && (
                            <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-ink-muted">
                                {description}
                            </p>
                        )}
                        {/* Carries the project so the (future) Contact form can
                            pre-fill + stamp project_id — "Contact about this project". */}
                        <Link
                            href={`/contact?property=${p.slug}`}
                            className="mt-7 inline-flex w-fit items-center justify-center rounded-2xl bg-[#1A3954] px-10 py-4 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#13293d]"
                        >
                            {t('nav.contact')}
                        </Link>
                    </div>

                    {/* Right: Details card */}
                    {specs.length > 0 && (
                        <div className="rounded-[40px] bg-[#E5EBF0] px-7 py-8 sm:px-10 sm:py-10">
                            <h3 className="text-2xl sm:text-3xl font-semibold text-ink">
                                {t('properties.detail.details')}
                            </h3>
                            <dl className="mt-5 divide-y divide-ink/10">
                                {specs.map((s) => (
                                    <div key={s.label} className="flex items-center justify-between py-4">
                                        <dt className="text-base sm:text-lg text-ink">{s.label}</dt>
                                        <dd className="text-base sm:text-lg font-medium text-ink-muted">{s.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    )}
                </div>
            </section>

            {/* ---------------- GALLERY (square thumbnails, horizontal carousel) ---------------- */}
            {thumbs.length > 0 && (
                <section className="bg-surface pb-12 sm:pb-16">
                    <div className="section-x">
                        <GalleryCarousel thumbs={thumbs} title={title} onOpen={(i) => setLightbox(i + 1)} />
                    </div>
                </section>
            )}

            {/* ---------------- MAP ---------------- */}
            {props.mapEmbedUrl && (
                <section className="bg-surface pb-12 sm:pb-16">
                    <div className="section-x">
                        <div className="aspect-1122/439 w-full overflow-hidden rounded-[38px]">
                            <iframe
                                src={props.mapEmbedUrl}
                                title={t('home.location.title')}
                                className="h-full w-full border-0"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* ---------------- RELATED ---------------- */}
            {props.related.length > 0 && (
                <section className="bg-surface pb-20 sm:pb-28">
                    <div className="section-x">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="max-w-xl text-2xl sm:text-3xl lg:text-4xl font-bold uppercase leading-tight text-ink">
                                {t('properties.detail.related.title')}
                            </h2>
                            <Link
                                href="/properties"
                                className="inline-flex w-fit items-center justify-center rounded-2xl bg-[#1A3954] px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#13293d]"
                            >
                                {t('common.viewAll')}
                            </Link>
                        </div>

                        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                            {props.related.slice(0, 3).map((r) => (
                                <RelatedCard key={r.id} project={r} ar={ar} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ---------------- LIGHTBOX ---------------- */}
            <AnimatePresence>
                {lightbox !== null && (
                    <Lightbox
                        images={images}
                        index={lightbox}
                        onClose={() => setLightbox(null)}
                        onChange={setLightbox}
                    />
                )}
            </AnimatePresence>
        </PublicLayout>
    );
}

/**
 * Square thumbnails in a single horizontally-scrolling row. Native overflow
 * gives touch/trackpad swipe; the arrows page through on desktop and hide at
 * each edge.
 */
function GalleryCarousel({
    thumbs,
    title,
    onOpen,
}: {
    thumbs: GalleryImage[];
    title: string;
    onOpen: (index: number) => void;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [edges, setEdges] = useState({ start: true, end: false });

    const update = () => {
        const el = ref.current;
        if (!el) return;
        const max = el.scrollWidth - el.clientWidth;
        const left = Math.abs(el.scrollLeft); // abs() keeps it correct under RTL
        setEdges({ start: left <= 1, end: left >= max - 1 });
    };

    useEffect(() => {
        update();
        const el = ref.current;
        if (!el) return;
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [thumbs.length]);

    const page = (dir: number) => {
        const el = ref.current;
        if (!el) return;
        el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
    };

    return (
        <div className="relative">
            <div
                ref={ref}
                onScroll={update}
                className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x"
            >
                {thumbs.map((img, i) => (
                    <button
                        key={img.id}
                        type="button"
                        onClick={() => onOpen(i)}
                        aria-label={`${title} — image ${i + 2}`}
                        className="group relative aspect-square w-40 shrink-0 cursor-zoom-in snap-start overflow-hidden rounded-3xl sm:w-52 lg:w-64"
                    >
                        <img
                            src={img.url}
                            alt={img.alt}
                            loading="lazy"
                            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                    </button>
                ))}
            </div>

            {/* Arrows (desktop) — fade out at the respective edge. */}
            <button
                type="button"
                onClick={() => page(-1)}
                aria-label="Scroll left"
                className={cn(
                    'absolute inset-s-2 top-1/2 hidden -translate-y-1/2 rounded-full border-2 border-primary bg-white/90 p-2 text-primary shadow-sm transition hover:bg-primary hover:text-white sm:flex cursor-pointer',
                    edges.start && 'pointer-events-none opacity-0',
                )}
            >
                <ChevronLeft className="rtl:rotate-180" />
            </button>
            <button
                type="button"
                onClick={() => page(1)}
                aria-label="Scroll right"
                className={cn(
                    'absolute inset-e-2 top-1/2 hidden -translate-y-1/2 rounded-full border-2 border-primary bg-white/90 p-2 text-primary shadow-sm transition hover:bg-primary hover:text-white sm:flex cursor-pointer',
                    edges.end && 'pointer-events-none opacity-0',
                )}
            >
                <ChevronRight className="rtl:rotate-180" />
            </button>
        </div>
    );
}

function RelatedCard({ project, ar }: { project: RelatedProject; ar: boolean }) {
    const title = ar ? project.title_ar : project.title_en;
    return (
        <Link
            href={`/properties/${project.slug}`}
            className="group relative block aspect-370/208 overflow-hidden rounded-[36px]"
        >
            <img
                src={project.image_url}
                alt={title}
                loading="lazy"
                className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            {/* Bottom gradient + label. */}
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-5 pb-4 pt-12">
                <span className="text-sm font-semibold uppercase tracking-wide text-white">
                    {title}
                </span>
            </div>
        </Link>
    );
}
