import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    AlertTriangle, Eye, EyeOff, Save, Maximize2, Minimize2,
    ExternalLink, MousePointerClick, ChevronRight,
    Home, Building2, TrendingUp, Hammer, Shield, Info, Mail, PanelBottom,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { cn } from '@/lib/cn';
import type { ContentPageProps, SiteContentRow } from '@/types/admin/content';

// ── Helpers ───────────────────────────────────────────────────────────────────

function toLabel(str: string): string {
    return str
        .replace(/_/g, ' ')
        .replace(/\bcta\b/gi, 'CTA')
        .replace(/\b\w/g, c => c.toUpperCase());
}

// 'footer' is a layout pseudo-page (no public URL of its own) — added here so
// admins can edit shared footer copy from the Content editor. Its preview
// iframe points at the homepage so changes show up at the bottom of the page.
const PAGE_ORDER = ['home', 'properties', 'investment', 'self_build', 'security', 'about', 'contact', 'footer'];

const PAGE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    home:       Home,
    properties: Building2,
    investment: TrendingUp,
    self_build: Hammer,
    security:   Shield,
    about:      Info,
    contact:    Mail,
    footer:     PanelBottom,
};

// Friendlier labels for sections whose seeder key auto-formats awkwardly
// (toLabel just does underscore → space + title case). Falls back to toLabel
// when a (page, section) pair isn't listed here.
const SECTION_LABEL_OVERRIDES: Record<string, Record<string, string>> = {
    home: {
        value_prop:          'Value Proposition',
        showcase:            'Properties for Sale',
        rentals:             'Properties for Rent',
        assurance_legal:     'Assurance · Legal Pillar',
        assurance_financial: 'Assurance · Financial Pillar',
        assurance_safety:    'Assurance · Safety Pillar',
        location:            'Location Map',
    },
    footer: {
        subscribe: 'Newsletter CTA',
        sections:  'Column Headings',
        copyright: 'Copyright Strip',
    },
};

function sectionLabel(page: string, section: string): string {
    return SECTION_LABEL_OVERRIDES[page]?.[section] ?? toLabel(section);
}

const PAGE_URLS: Record<string, string> = {
    home:       '/',
    properties: '/properties',
    investment: '/investment',
    self_build: '/self-build',
    security:   '/security',
    about:      '/about',
    contact:    '/contact',
    footer:     '/', // layout pseudo-page — preview the homepage and scroll to bottom
};

// ── Sub-components ────────────────────────────────────────────────────────────

function RowInput({
    type, value, onChange, dir, placeholder,
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

    // Which page accordion is open — only one at a time
    const [expandedPage, setExpandedPage] = useState<string | null>(orderedPages[0] ?? null);

    useEffect(() => {
        const hash = window.location.hash.slice(1);
        if (!hash || !orderedPages.includes(hash)) return;
        setExpandedPage(hash);
        setTimeout(() => {
            document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
    }, []);

    // Which page is currently saving
    const [processing, setProcessing] = useState<string | null>(null);

    // Preview state
    const [iframeKey, setIframeKey] = useState(0);
    const [previewExpanded, setPreviewExpanded] = useState(false);
    const [previewInteractive, setPreviewInteractive] = useState(false);

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

    // Section visibility per page
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
        const v: Record<string, {
            is_visible: boolean;
            seo_title_en: string;
            seo_title_ar: string;
            seo_description_en: string;
            seo_description_ar: string;
        }> = {};
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

    function setSeo<K extends keyof typeof pageSeo[string]>(
        pageSlug: string,
        key: K,
        value: typeof pageSeo[string][K],
    ) {
        setPageSeo(prev => ({ ...prev, [pageSlug]: { ...prev[pageSlug], [key]: value } }));
    }

    function toggleAccordion(slug: string) {
        const opening = expandedPage !== slug;
        setExpandedPage(opening ? slug : null);
        if (opening) setPreviewInteractive(false);
    }

    function openPage(slug: string) {
        setExpandedPage(slug);
        setPreviewInteractive(false);
    }

    function savePage(slug: string) {
        const sections = grouped[slug] ?? {};
        const rows = Object.entries(sections).flatMap(([section, sectionRows]) => {
            const visible = sectionVisible[slug]?.[section] ?? true;
            return sectionRows.map(r => ({
                id: r.id,
                content_en: rowValues[r.id]?.content_en ?? '',
                content_ar: rowValues[r.id]?.content_ar ?? '',
                is_visible: visible,
            }));
        });

        const seo = pageSeo[slug] ?? {};
        setProcessing(slug);
        router.put(`/admin/content/${slug}`, {
            page_is_visible: seo.is_visible,
            seo_title_en: seo.seo_title_en,
            seo_title_ar: seo.seo_title_ar,
            seo_description_en: seo.seo_description_en,
            seo_description_ar: seo.seo_description_ar,
            rows,
        } as any, {
            preserveScroll: true,
            onSuccess: () => setIframeKey(k => k + 1),
            onFinish: () => setProcessing(null),
        });
    }

    const previewSlug = expandedPage ?? orderedPages[0] ?? 'home';
    const previewUrl = PAGE_URLS[previewSlug] ?? '/';
    const previewLabel = pages[previewSlug]?.title_en ?? toLabel(previewSlug);

    return (
        <AdminLayout title="Site Content">
            <Head title="Site Content" />

            {/* Quick-nav page selector */}
            <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
                {orderedPages.map(slug => (
                    <button
                        key={slug}
                        type="button"
                        onClick={() => openPage(slug)}
                        className={cn(
                            'px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-colors',
                            expandedPage === slug
                                ? 'bg-primary text-zinc-900'
                                : 'bg-white dark:bg-zinc-800 border border-ink/10 dark:border-white/10 text-ink-muted hover:text-ink',
                        )}
                    >
                        {pages[slug]?.title_en ?? toLabel(slug)}
                    </button>
                ))}
            </div>

            {/* Split layout */}
            <div className="flex gap-4 items-start">

                {/* ── Left: accordion list ── */}
                <div className={cn(
                    'min-w-0 transition-all duration-300 space-y-2',
                    previewExpanded ? 'w-full xl:w-[30%]' : 'w-full xl:w-[55%]',
                )}>
                    {orderedPages.map(slug => {
                        const page = pages[slug];
                        const isOpen = expandedPage === slug;
                        const sections = grouped[slug] ?? {};
                        const sectionCount = Object.keys(sections).length;
                        const rowCount = Object.values(sections).flat().length;
                        const seo = pageSeo[slug] ?? { is_visible: true, seo_title_en: '', seo_title_ar: '', seo_description_en: '', seo_description_ar: '' };
                        const isSaving = processing === slug;

                        return (
                            <div
                                key={slug}
                                id={slug}
                                className="bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg overflow-hidden"
                            >
                                {/* Accordion header */}
                                <button
                                    type="button"
                                    onClick={() => toggleAccordion(slug)}
                                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-surface-muted dark:hover:bg-zinc-700/50 transition-colors"
                                >
                                    <ChevronRight
                                        size={16}
                                        className={cn(
                                            'shrink-0 text-ink-muted transition-transform duration-200',
                                            isOpen && 'rotate-90',
                                        )}
                                    />
                                    {(() => { const SlugIcon = PAGE_ICONS[slug]; return SlugIcon ? <SlugIcon size={14} className="shrink-0 text-ink-muted" /> : null; })()}
                                    <span className="font-semibold text-ink text-sm flex-1 text-start">
                                        {page?.title_en ?? toLabel(slug)}
                                    </span>
                                    <span className="text-xs text-ink-muted">
                                        {sectionCount} section{sectionCount !== 1 ? 's' : ''} · {rowCount} fields
                                    </span>
                                    {!seo.is_visible && (
                                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                                            Hidden
                                        </span>
                                    )}
                                    {seo.is_visible && !seo.seo_title_en.trim() && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                                            <AlertTriangle size={10} />
                                            No SEO title
                                        </span>
                                    )}
                                    {isOpen && (
                                        <div
                                            onClick={e => { e.stopPropagation(); savePage(slug); }}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={e => e.key === 'Enter' && savePage(slug)}
                                            className={cn(
                                                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors',
                                                isSaving
                                                    ? 'bg-primary/50 text-white cursor-not-allowed'
                                                    : 'bg-primary text-zinc-900 hover:bg-primary-dark',
                                            )}
                                        >
                                            <Save size={12} />
                                            {isSaving ? 'Saving…' : 'Save'}
                                        </div>
                                    )}
                                </button>

                                {/* Accordion body */}
                                {isOpen && (
                                    <div className="border-t border-ink/5 dark:border-white/10">
                                        {/* SEO + visibility */}
                                        <div className="p-5 border-b border-ink/5 dark:border-white/10">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                                                    Page SEO &amp; Visibility
                                                </h3>
                                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={seo.is_visible}
                                                        onChange={e => setSeo(slug, 'is_visible', e.target.checked)}
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
                                                        value={seo.seo_title_en}
                                                        onChange={e => setSeo(slug, 'seo_title_en', e.target.value)}
                                                        placeholder="Defaults to site-wide setting if empty"
                                                        className="w-full px-3 py-2 text-sm border border-ink/10 rounded bg-white dark:bg-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-ink-muted mb-1">SEO Title (AR)</label>
                                                    <input
                                                        type="text"
                                                        value={seo.seo_title_ar}
                                                        onChange={e => setSeo(slug, 'seo_title_ar', e.target.value)}
                                                        dir="rtl"
                                                        className="w-full px-3 py-2 text-sm border border-ink/10 rounded bg-white dark:bg-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-ink-muted mb-1">SEO Description (EN)</label>
                                                    <textarea
                                                        value={seo.seo_description_en}
                                                        onChange={e => setSeo(slug, 'seo_description_en', e.target.value)}
                                                        rows={2}
                                                        placeholder="Max 500 characters"
                                                        className="w-full px-3 py-2 text-sm border border-ink/10 rounded bg-white dark:bg-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-ink-muted mb-1">SEO Description (AR)</label>
                                                    <textarea
                                                        value={seo.seo_description_ar}
                                                        onChange={e => setSeo(slug, 'seo_description_ar', e.target.value)}
                                                        rows={2}
                                                        dir="rtl"
                                                        className="w-full px-3 py-2 text-sm border border-ink/10 rounded bg-white dark:bg-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content sections */}
                                        {Object.entries(sections).map(([section, rows]) => {
                                            const visible = sectionVisible[slug]?.[section] ?? true;
                                            return (
                                                <div
                                                    key={section}
                                                    className="border-b border-ink/5 dark:border-white/10 last:border-b-0"
                                                >
                                                    <div className="flex items-center justify-between px-5 py-2.5 bg-surface-muted dark:bg-zinc-900/40">
                                                        <h4 className="text-xs font-semibold text-ink">{sectionLabel(slug, section)}</h4>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleSection(slug, section)}
                                                            className={cn(
                                                                'flex items-center gap-1.5 text-xs font-medium transition-colors',
                                                                visible ? 'text-ink-muted hover:text-ink' : 'text-amber-500 hover:text-amber-600',
                                                            )}
                                                        >
                                                            {visible ? <Eye size={13} /> : <EyeOff size={13} />}
                                                            {visible ? 'Visible' : 'Hidden'}
                                                        </button>
                                                    </div>
                                                    <div className={cn(
                                                        'divide-y divide-ink/5 dark:divide-white/5',
                                                        !visible && 'opacity-50',
                                                    )}>
                                                        {rows.map((row: SiteContentRow) => (
                                                            <div
                                                                key={row.id}
                                                                className="grid grid-cols-[110px_1fr_1fr] items-start gap-3 px-5 py-2.5"
                                                            >
                                                                <div className="pt-2 text-xs font-medium text-ink-muted">
                                                                    {toLabel(row.key)}
                                                                </div>
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

                                        {/* Bottom save + collapse */}
                                        <div className="flex items-center justify-between px-5 py-4">
                                            <button
                                                type="button"
                                                onClick={() => setExpandedPage(null)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-700 border border-ink/10 dark:border-white/10 text-ink-muted rounded text-sm font-medium hover:text-ink transition-colors"
                                            >
                                                <ChevronRight size={14} className="-rotate-90" />
                                                Collapse
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => savePage(slug)}
                                                disabled={isSaving}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-zinc-900 rounded text-sm font-medium hover:bg-primary-dark disabled:opacity-60 transition-colors"
                                            >
                                                <Save size={14} />
                                                {isSaving ? 'Saving…' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* ── Right: live preview ── */}
                <div className={cn(
                    // self-stretch overrides the parent's items-start so this
                    // column matches the left accordion's full height — gives
                    // the inner `sticky top-4` block room to actually stick
                    // instead of scrolling out of view with its container.
                    'hidden xl:block xl:self-stretch shrink-0 transition-all duration-300',
                    previewExpanded ? 'xl:w-[70%]' : 'xl:w-[45%]',
                )}>
                    {/* top-20 (5rem) clears the AdminLayout's sticky top bar
                        (h-16 = 4rem) and adds 1rem breathing room so the preview
                        chrome doesn't hide behind it when scrolled. */}
                    <div className="sticky top-20">
                        <div
                            className="bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg overflow-hidden"
                            style={{ height: 'calc(100vh - 6rem)' }}
                        >
                            {/* Preview chrome */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-ink/5 dark:border-white/10 bg-surface-muted dark:bg-zinc-900/50">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Eye size={14} className="text-ink-muted shrink-0" />
                                    <span className="text-sm font-medium text-ink truncate">{previewLabel}</span>
                                    <span className="text-xs text-ink-muted shrink-0">{previewUrl}</span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0 ms-2">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewExpanded(v => !v)}
                                        title={previewExpanded ? 'Collapse preview' : 'Expand preview'}
                                        className="text-ink-muted hover:text-ink transition-colors"
                                    >
                                        {previewExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                                    </button>
                                    <a
                                        href={previewUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Open in new tab"
                                        className="text-ink-muted hover:text-ink transition-colors"
                                    >
                                        <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>

                            {/* iframe + scroll-trap overlay */}
                            <div
                                className="relative"
                                style={{ height: 'calc(100% - 2.875rem)' }}
                                onMouseLeave={() => setPreviewInteractive(false)}
                            >
                                {!previewInteractive && (
                                    <div
                                        className="absolute inset-0 z-10 cursor-pointer"
                                        onClick={() => setPreviewInteractive(true)}
                                    >
                                        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/80 text-amber-400 text-xs font-medium rounded-full whitespace-nowrap">
                                            <MousePointerClick size={12} />
                                            Click to interact with preview
                                        </div>
                                    </div>
                                )}
                                <iframe
                                    key={iframeKey}
                                    src={previewUrl}
                                    className="w-full h-full border-0"
                                    title={`Preview: ${previewLabel}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
