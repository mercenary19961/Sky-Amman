import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import PublicLayout from '@/Layouts/PublicLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import type { PropertyDetailPageProps, RelatedProject } from '@/types/home';

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
    const title = ar ? p.title_ar : p.title_en;
    const address = (ar ? p.address_ar : p.address_en) || (ar ? p.location_ar : p.location_en) || '';
    const description = (ar ? p.description_ar : p.description_en) || '';
    const status = p.listing_status ? STATUS_KEY[p.listing_status] : null;

    const areaLabel = p.area_sqm != null ? (ar ? `${p.area_sqm} م²` : `${p.area_sqm} SQM`) : null;

    // Detail rows — only the specs that are actually set.
    const specs: { label: string; value: string }[] = [];
    if (areaLabel) specs.push({ label: t('properties.detail.livingSpace'), value: areaLabel });
    if (p.completion_year != null) specs.push({ label: t('properties.detail.completionYear'), value: String(p.completion_year) });
    if (p.floors != null) specs.push({ label: t('properties.detail.floors'), value: String(p.floors) });
    if (p.bedrooms != null) specs.push({ label: t('properties.detail.bedrooms'), value: String(p.bedrooms) });
    if (p.bathrooms != null) specs.push({ label: t('properties.detail.bathrooms'), value: String(p.bathrooms) });

    const seoTitle = `${title} · SkyAmman`;

    return (
        <PublicLayout>
            <Head title={seoTitle}>
                <meta name="description" content={description} />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:type" content="website" />
            </Head>

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
                            className="absolute -bottom-5 -inset-e-5 sm:-bottom-8 sm:-inset-e-8 h-2/3 w-2/3 rounded-[64px] bg-primary lg:rounded-[120px]"
                        />
                        <motion.div
                            className="relative overflow-hidden rounded-4xl sm:rounded-[56px] lg:rounded-[86px]"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <img
                                src={p.hero_url}
                                alt={title}
                                className="aspect-1131/636 w-full object-cover object-center"
                                loading="eager"
                            />
                            {status && (
                                <span className="absolute bottom-5 inset-s-5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow-sm sm:bottom-7 sm:inset-s-7">
                                    {t(status)}
                                </span>
                            )}
                        </motion.div>
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
                        <Link
                            href="/contact"
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

            {/* ---------------- GALLERY BANNERS ---------------- */}
            {props.gallery.length > 0 && (
                <section className="bg-surface pb-12 sm:pb-16">
                    <div className="section-x flex flex-col gap-4 sm:gap-6">
                        {props.gallery.map((img) => (
                            <div key={img.id} className="h-40 w-full overflow-hidden rounded-4xl sm:h-52 lg:h-60">
                                <img
                                    src={img.url}
                                    alt={img.alt}
                                    loading="lazy"
                                    className="h-full w-full object-cover object-center"
                                />
                            </div>
                        ))}
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
        </PublicLayout>
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
