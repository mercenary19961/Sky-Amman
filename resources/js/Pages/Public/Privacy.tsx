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
 * A block is either a standalone paragraph (`{ p }`) or a bullet list
 * (`{ ul }`) with an optional lead paragraph before it. Each string is a key
 * under the section, resolved via `text(section, key)` — so adding a bullet or
 * paragraph is one seeder row plus one key here, with no layout work.
 */
type Block = { p: string } | { lead?: string; ul: string[] };

/**
 * Body sections, in reading order. Each pulls its heading from `{section}.title`.
 * Mirrors the client's 14-section policy (SiteContentSeeder → 'privacy').
 */
const SECTIONS: { key: string; blocks: Block[] }[] = [
    {
        key: 'collect',
        blocks: [
            { lead: 'lead', ul: ['provided_1', 'provided_2', 'provided_3', 'provided_4', 'provided_5', 'provided_6', 'provided_7', 'provided_8', 'provided_9'] },
            { lead: 'auto_lead', ul: ['auto_1', 'auto_2', 'auto_3', 'auto_4', 'auto_5', 'auto_6', 'auto_7', 'auto_8'] },
        ],
    },
    {
        key: 'use',
        blocks: [{ lead: 'lead', ul: ['item_1', 'item_2', 'item_3', 'item_4', 'item_5', 'item_6', 'item_7', 'item_8'] }],
    },
    {
        key: 'inquiries',
        blocks: [{ lead: 'lead', ul: ['item_1', 'item_2', 'item_3', 'item_4'] }],
    },
    {
        key: 'marketing',
        blocks: [{ lead: 'lead', ul: ['item_1', 'item_2', 'item_3', 'item_4'] }, { p: 'outro' }],
    },
    {
        key: 'sharing',
        blocks: [{ p: 'lead' }, { lead: 'lead_2', ul: ['item_1', 'item_2', 'item_3', 'item_4', 'item_5'] }, { p: 'outro' }],
    },
    {
        key: 'cookies',
        blocks: [{ lead: 'lead', ul: ['item_1', 'item_2', 'item_3', 'item_4', 'item_5'] }, { p: 'outro' }, { p: 'outro_2' }],
    },
    {
        key: 'security',
        blocks: [{ p: 'body' }, { p: 'body_2' }],
    },
    {
        key: 'retention',
        blocks: [{ lead: 'lead', ul: ['item_1', 'item_2', 'item_3', 'item_4'] }, { p: 'outro' }],
    },
    {
        key: 'rights',
        blocks: [{ lead: 'lead', ul: ['item_1', 'item_2', 'item_3', 'item_4', 'item_5'] }, { p: 'outro' }],
    },
    {
        key: 'third_party',
        blocks: [{ p: 'body' }, { p: 'body_2' }],
    },
    {
        key: 'children',
        blocks: [{ p: 'body' }],
    },
    {
        key: 'international',
        blocks: [{ p: 'body' }],
    },
    {
        key: 'changes',
        blocks: [{ p: 'body' }, { p: 'body_2' }],
    },
    {
        key: 'contact',
        blocks: [{ p: 'body' }, { p: 'phone' }],
    },
];

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

                    {sectionVisible(content?.intro) && (text('intro', 'body') || text('intro', 'agree')) && (
                        <div className="mt-8 space-y-4">
                            {text('intro', 'body') && (
                                <p className="text-base leading-relaxed text-ink-muted sm:text-lg">
                                    {text('intro', 'body')}
                                </p>
                            )}
                            {text('intro', 'agree') && (
                                <p className="text-base leading-relaxed text-ink-muted sm:text-lg">
                                    {text('intro', 'agree')}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="mt-10 space-y-10">
                        {SECTIONS.filter((s) => sectionVisible(content?.[s.key])).map((section) => {
                            const heading = text(section.key, 'title');

                            // A block renders only if it resolves to some non-empty copy.
                            const hasContent = section.blocks.some((block) => {
                                if ('ul' in block) {
                                    const lead = block.lead ? text(section.key, block.lead) : '';
                                    return !!lead || block.ul.some((k) => text(section.key, k));
                                }
                                return !!text(section.key, block.p);
                            });

                            if (!heading && !hasContent) return null;

                            return (
                                <section key={section.key}>
                                    {heading && (
                                        <h2 className="text-xl font-semibold text-ink sm:text-2xl">{heading}</h2>
                                    )}
                                    <div className="mt-3 space-y-4">
                                        {section.blocks.map((block, bi) => {
                                            if ('ul' in block) {
                                                const lead = block.lead ? text(section.key, block.lead) : '';
                                                const items = block.ul
                                                    .map((k) => text(section.key, k))
                                                    .filter(Boolean);
                                                if (!lead && items.length === 0) return null;
                                                return (
                                                    <div key={bi} className="space-y-3">
                                                        {lead && (
                                                            <p className="text-base leading-relaxed text-ink-muted">
                                                                {lead}
                                                            </p>
                                                        )}
                                                        {items.length > 0 && (
                                                            <ul className="list-disc space-y-2 ps-5 text-base leading-relaxed text-ink-muted marker:text-primary">
                                                                {items.map((it, i) => (
                                                                    <li key={i}>{it}</li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                );
                                            }
                                            const paragraph = text(section.key, block.p);
                                            if (!paragraph) return null;
                                            return (
                                                <p key={bi} className="text-base leading-relaxed text-ink-muted">
                                                    {paragraph}
                                                </p>
                                            );
                                        })}
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
