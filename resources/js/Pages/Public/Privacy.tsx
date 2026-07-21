import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import PublicLayout from '@/Layouts/PublicLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SecurityPageProps, ContentValue, SiteContentBundle } from '@/types/home';

/** CMS-first resolver: CMS row when present & visible, else the literal fallback. */
function makeText(content: SiteContentBundle) {
    return (section: string, key: string, fallback = ''): string => {
        const row: ContentValue | undefined = content?.[section]?.[key];
        if (row && row.is_visible && row.content) return row.content;
        return fallback;
    };
}

/** Section-visibility predicate (innovation #5). */
function sectionVisible(section: Record<string, ContentValue> | undefined): boolean {
    if (!section) return true;
    const rows = Object.values(section);
    if (rows.length === 0) return true;
    return rows.some((r) => r.is_visible);
}

/**
 * Body sections, in reading order. Each pulls its heading from `{section}.title`
 * and its paragraphs from the listed keys — so adding a paragraph is one seeder
 * row plus one key here, with no layout work.
 */
const SECTIONS = [
    { key: 'collect', paragraphs: ['form', 'newsletter', 'technical', 'consent'] },
    { key: 'use', paragraphs: ['body'] },
    { key: 'cookies', paragraphs: ['necessary', 'analytics', 'marketing', 'manage'] },
    { key: 'sharing', paragraphs: ['body', 'hosting', 'analytics', 'marketing'] },
    { key: 'retention', paragraphs: ['body'] },
    { key: 'rights', paragraphs: ['body'] },
    { key: 'contact', paragraphs: ['body'] },
] as const;

export default function Privacy() {
    const { props } = usePage<SecurityPageProps>();
    const { language } = useLanguage();
    const { t } = useTranslation();

    const isAr = language === 'ar';
    const content = isAr ? props.content_ar : props.content_en;
    const text = makeText(content);

    const title = text('hero', 'title', t('footer.privacyPolicy'));
    const updated = text('hero', 'updated');

    const seoTitle = (isAr ? props.seo?.title_ar : props.seo?.title_en)
        || props.siteSettings?.default_seo_title
        || title;
    const seoDescription = (isAr ? props.seo?.description_ar : props.seo?.description_en)
        || text('intro', 'body')
        || props.siteSettings?.default_seo_description
        || '';

    return (
        <PublicLayout>
            <Head title={seoTitle}>
                <meta name="description" content={seoDescription} />
                <link rel="canonical" href={props.url} />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={props.url} />
                {props.siteSettings?.og_image_url && (
                    <meta property="og:image" content={props.siteSettings.og_image_url} />
                )}
                <link rel="alternate" hrefLang="en" href={props.url} />
                <link rel="alternate" hrefLang="ar" href={props.url} />
                <link rel="alternate" hrefLang="x-default" href={props.url} />
                {/* A policy page has no business in search results competing with
                    the listings; it exists to be linked to, not found. */}
                <meta name="robots" content="noindex, follow" />
            </Head>

            {/* No hero image: this is a document, and the page has no top banner
                for the fixed navbar to overlay — hence the explicit top padding. */}
            <article className="section-x bg-surface pt-32 pb-20 sm:pt-36 lg:pt-40">
                <div className="mx-auto max-w-3xl">
                    <header className="border-b border-ink/10 pb-6">
                        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">{title}</h1>
                        {updated && <p className="mt-2 text-sm text-ink-muted">{updated}</p>}
                    </header>

                    {sectionVisible(content?.intro) && text('intro', 'body') && (
                        <p className="mt-8 text-base leading-relaxed text-ink-muted sm:text-lg">
                            {text('intro', 'body')}
                        </p>
                    )}

                    <div className="mt-10 space-y-10">
                        {SECTIONS.filter((s) => sectionVisible(content?.[s.key])).map((section) => {
                            const heading = text(section.key, 'title');
                            const paragraphs = section.paragraphs
                                .map((p) => text(section.key, p))
                                .filter(Boolean);

                            if (!heading && paragraphs.length === 0) return null;

                            return (
                                <section key={section.key}>
                                    {heading && (
                                        <h2 className="text-xl font-semibold text-ink sm:text-2xl">{heading}</h2>
                                    )}
                                    <div className="mt-3 space-y-3">
                                        {paragraphs.map((p, i) => (
                                            <p key={i} className="text-base leading-relaxed text-ink-muted">
                                                {p}
                                            </p>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </div>
            </article>
        </PublicLayout>
    );
}
