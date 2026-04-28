import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Eye, EyeOff, Save } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { cn } from '@/lib/cn';
import type { ContentPageProps, SiteContentRow } from '@/types/admin/content';

// ── Helpers ──────────────────────────────────────────────────────────────────

function toLabel(str: string): string {
    return str
        .replace(/_/g, ' ')
        .replace(/\bcta\b/gi, 'CTA')
        .replace(/\b\w/g, c => c.toUpperCase());
}

const PAGE_ORDER = ['home', 'properties', 'investment', 'self_build', 'security', 'about', 'contact'];

// ── Sub-components ────────────────────────────────────────────────────────────

function RowInput({
    type,
    value,
    onChange,
    dir,
    placeholder,
}: {
    type: SiteContentRow['type'];
    value: string;
    onChange: (v: string) => void;
    dir?: 'rtl' | 'ltr';
    placeholder?: string;
}) {
    const base =
        'w-full px-3 py-2 text-sm border border-ink/10 rounded bg-white dark:bg-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30';

    if (type === 'text') {
        return (
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                dir={dir}
                placeholder={placeholder}
                className={base}
            />
        );
    }

    return (
        <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            dir={dir}
            placeholder={placeholder}
            rows={2}
            className={cn(base, 'resize-y')}
        />
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ContentEditor() {
    const { grouped, pages } = usePage<ContentPageProps>().props;

    const orderedPages = PAGE_ORDER.filter(slug => pages[slug]);

    const [activePage, setActivePage] = useState(orderedPages[0] ?? 'home');
    const [processing, setProcessing] = useState(false);

    // Row values keyed by id
    const [rowValues, setRowValues] = useState<Record<number, { content_en: string; content_ar: string }>>(() => {
        const v: Record<number, { content_en: string; content_ar: string }> = {};
        Object.values(grouped).forEach(sections =>
            Object.values(sections).forEach(rows =>
                rows.forEach(r => { v[r.id] = { content_en: r.content_en ?? '', content_ar: r.content_ar ?? '' }; }),
            ),
        );
        return v;
    });

    // Section visibility per page: [pageSlug][sectionName] = boolean
    const [sectionVisible, setSectionVisible] = useState<Record<string, Record<string, boolean>>>(() => {
        const v: Record<string, Record<string, boolean>> = {};
        Object.entries(grouped).forEach(([page, sections]) => {
            v[page] = {};
            Object.entries(sections).forEach(([section, rows]) => {
                v[page][section] = rows.every(r => r.is_visible);
            });
        });
        return v;
    });

    // Page-level SEO + visibility
    const [pageSeo, setPageSeo] = useState<Record<string, {
        is_visible: boolean;
        seo_title_en: string;
        seo_title_ar: string;
        seo_description_en: string;
        seo_description_ar: string;
    }>>(() => {
        const v: Record<string, { is_visible: boolean; seo_title_en: string; seo_title_ar: string; seo_description_en: string; seo_description_ar: string }> = {};
        Object.values(pages).forEach(p => {
            v[p.slug] = {
                is_visible: p.is_visible,
                seo_title_en: p.seo_title_en ?? '',
                seo_title_ar: p.seo_title_ar ?? '',
                seo_description_en: p.seo_description_en ?? '',
                seo_description_ar: p.seo_description_ar ?? '',
            };
        });
        return v;
    });

    function setRow(id: number, field: 'content_en' | 'content_ar', value: string) {
        setRowValues(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
    }

    function toggleSection(pageSlug: string, section: string) {
        setSectionVisible(prev => ({
            ...prev,
            [pageSlug]: { ...prev[pageSlug], [section]: !prev[pageSlug]?.[section] },
        }));
    }

    function setSeo<K extends keyof typeof pageSeo[string]>(pageSlug: string, key: K, value: typeof pageSeo[string][K]) {
        setPageSeo(prev => ({ ...prev, [pageSlug]: { ...prev[pageSlug], [key]: value } }));
    }

    function savePage() {
        const sections = grouped[activePage] ?? {};
        const rows = Object.entries(sections).flatMap(([section, sectionRows]) => {
            const visible = sectionVisible[activePage]?.[section] ?? true;
            return sectionRows.map(r => ({
                id: r.id,
                content_en: rowValues[r.id]?.content_en ?? '',
                content_ar: rowValues[r.id]?.content_ar ?? '',
                is_visible: visible,
            }));
        });

        const seo = pageSeo[activePage] ?? {};

        setProcessing(true);
        router.put(`/admin/content/${activePage}`, {
            page_is_visible: seo.is_visible,
            seo_title_en: seo.seo_title_en,
            seo_title_ar: seo.seo_title_ar,
            seo_description_en: seo.seo_description_en,
            seo_description_ar: seo.seo_description_ar,
            rows,
        } as any, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    }

    const currentSections = grouped[activePage] ?? {};
    const currentSeo = pageSeo[activePage] ?? { is_visible: true, seo_title_en: '', seo_title_ar: '', seo_description_en: '', seo_description_ar: '' };

    return (
        <AdminLayout title="Site Content">
            <Head title="Site Content" />

            {/* Page tabs */}
            <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
                {orderedPages.map(slug => {
                    const page = pages[slug];
                    return (
                        <button
                            key={slug}
                            type="button"
                            onClick={() => setActivePage(slug)}
                            className={cn(
                                'px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-colors',
                                activePage === slug
                                    ? 'bg-primary text-white'
                                    : 'bg-white dark:bg-zinc-800 border border-ink/10 dark:border-white/10 text-ink-muted hover:text-ink',
                            )}
                        >
                            {page?.title_en ?? toLabel(slug)}
                        </button>
                    );
                })}

                <button
                    type="button"
                    onClick={savePage}
                    disabled={processing}
                    className="ms-auto inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary-dark disabled:opacity-60 transition-colors whitespace-nowrap"
                >
                    <Save size={15} />
                    {processing ? 'Saving…' : 'Save Changes'}
                </button>
            </div>

            {/* SEO + page visibility card */}
            <div className="bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-ink">Page SEO &amp; Visibility</h2>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                            type="checkbox"
                            checked={currentSeo.is_visible}
                            onChange={e => setSeo(activePage, 'is_visible', e.target.checked)}
                            className="w-4 h-4 accent-primary"
                        />
                        Page visible on site
                    </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-ink-muted mb-1">SEO Title (EN)</label>
                        <input
                            type="text"
                            value={currentSeo.seo_title_en}
                            onChange={e => setSeo(activePage, 'seo_title_en', e.target.value)}
                            placeholder="Defaults to site-wide setting if empty"
                            className="w-full px-3 py-2 text-sm border border-ink/10 rounded bg-white dark:bg-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-ink-muted mb-1">SEO Title (AR)</label>
                        <input
                            type="text"
                            value={currentSeo.seo_title_ar}
                            onChange={e => setSeo(activePage, 'seo_title_ar', e.target.value)}
                            dir="rtl"
                            className="w-full px-3 py-2 text-sm border border-ink/10 rounded bg-white dark:bg-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-ink-muted mb-1">SEO Description (EN)</label>
                        <textarea
                            value={currentSeo.seo_description_en}
                            onChange={e => setSeo(activePage, 'seo_description_en', e.target.value)}
                            rows={2}
                            placeholder="Max 500 characters"
                            className="w-full px-3 py-2 text-sm border border-ink/10 rounded bg-white dark:bg-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-ink-muted mb-1">SEO Description (AR)</label>
                        <textarea
                            value={currentSeo.seo_description_ar}
                            onChange={e => setSeo(activePage, 'seo_description_ar', e.target.value)}
                            rows={2}
                            dir="rtl"
                            className="w-full px-3 py-2 text-sm border border-ink/10 rounded bg-white dark:bg-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                        />
                    </div>
                </div>
            </div>

            {/* Content sections */}
            {Object.entries(currentSections).map(([section, rows]) => {
                const visible = sectionVisible[activePage]?.[section] ?? true;

                return (
                    <div
                        key={section}
                        className="bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg mb-4 overflow-hidden"
                    >
                        {/* Section header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-ink/5 dark:border-white/10 bg-surface-muted dark:bg-zinc-900/50">
                            <h3 className="text-sm font-semibold text-ink">{toLabel(section)}</h3>
                            <button
                                type="button"
                                onClick={() => toggleSection(activePage, section)}
                                title={visible ? 'Hide section' : 'Show section'}
                                className={cn(
                                    'flex items-center gap-1.5 text-xs font-medium transition-colors',
                                    visible ? 'text-ink-muted hover:text-ink' : 'text-amber-500 hover:text-amber-600',
                                )}
                            >
                                {visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                {visible ? 'Visible' : 'Hidden'}
                            </button>
                        </div>

                        {/* Rows */}
                        <div className={cn('divide-y divide-ink/5 dark:divide-white/5', !visible && 'opacity-50')}>
                            {rows.map((row: SiteContentRow) => (
                                <div key={row.id} className="grid grid-cols-[160px_1fr_1fr] items-start gap-3 px-5 py-3">
                                    <div className="pt-2 text-xs font-medium text-ink-muted">{toLabel(row.key)}</div>
                                    <RowInput
                                        type={row.type}
                                        value={rowValues[row.id]?.content_en ?? ''}
                                        onChange={v => setRow(row.id, 'content_en', v)}
                                        placeholder="EN"
                                    />
                                    <RowInput
                                        type={row.type}
                                        value={rowValues[row.id]?.content_ar ?? ''}
                                        onChange={v => setRow(row.id, 'content_ar', v)}
                                        dir="rtl"
                                        placeholder="AR"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Bottom save */}
            <div className="flex justify-end mt-2 mb-8">
                <button
                    type="button"
                    onClick={savePage}
                    disabled={processing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary-dark disabled:opacity-60 transition-colors"
                >
                    <Save size={15} />
                    {processing ? 'Saving…' : 'Save Changes'}
                </button>
            </div>
        </AdminLayout>
    );
}
