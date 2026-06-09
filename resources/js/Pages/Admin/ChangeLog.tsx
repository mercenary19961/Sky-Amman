import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    Undo2, Trash2, ArrowRight, FileText, Building2, Users as UsersIcon,
    Settings as SettingsIcon, History, Quote, Video, MessageSquare, Contact,
    Search, X, RotateCcw,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ConfirmDeleteButton as ConfirmButton } from '@/Components/Admin/ConfirmDeleteButton';
import { ConfirmActionButton } from '@/Components/Admin/ConfirmActionButton';
import { Select } from '@/Components/Admin/Select';
import { cn } from '@/lib/cn';
import type { ChangeLogPageProps, ChangeLogItem, ChangeAction } from '@/types/admin/changelog';

const ACTION_COLORS: Record<ChangeAction, string> = {
    create:  'bg-emerald-100 text-emerald-700',
    update:  'bg-primary/10 text-primary',
    delete:  'bg-red-100 text-red-700',
    restore: 'bg-amber-100 text-amber-700',
};

const SECTION_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    settings:          SettingsIcon,
    site_content:      FileText,
    project:           Building2,
    user:              UsersIcon,
    testimonial:       Quote,
    testimonial_video: Video,
    department_member: Contact,
    contact:           MessageSquare,
};

const ACTION_OPTIONS = [
    { value: '', label: 'All actions' },
    { value: 'create', label: 'Created' },
    { value: 'update', label: 'Updated' },
    { value: 'delete', label: 'Deleted' },
    { value: 'restore', label: 'Restored' },
];

const STATUS_OPTIONS = [
    { value: '', label: 'Any status' },
    { value: 'active', label: 'Not reverted' },
    { value: 'reverted', label: 'Reverted' },
];

const PERIOD_OPTIONS = [
    { value: '', label: 'Any time' },
    { value: 'hour', label: 'Last hour' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Past week' },
    { value: 'month', label: 'Past month' },
    { value: 'year', label: 'This year' },
];

export default function ChangeLog() {
    const { logs, users, sectionLabels, filters, perPageOptions } = usePage<ChangeLogPageProps>().props;

    // Local search box state, debounced into the query string.
    const [search, setSearch] = useState(filters.search ?? '');
    useEffect(() => { setSearch(filters.search ?? ''); }, [filters.search]);
    useEffect(() => {
        const current = filters.search ?? '';
        if (search === current) return;
        const t = setTimeout(() => applyFilter('search', search), 350);
        return () => clearTimeout(t);
    }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

    const hasFilters = Boolean(
        filters.model_type || filters.changed_by || filters.action ||
        filters.status || filters.search || filters.period,
    );

    function applyFilter(key: string, value: string) {
        router.get('/admin/change-log', { ...filters, [key]: value || undefined, page: undefined }, {
            preserveState: true,
            replace: true,
        });
    }

    function resetFilters() {
        router.get('/admin/change-log', {}, { preserveState: true, replace: true });
    }

    function revert(id: number) {
        router.post(`/admin/change-log/${id}/revert`, {}, { preserveScroll: true });
    }
    function destroy(id: number) {
        router.delete(`/admin/change-log/${id}`, { preserveScroll: true });
    }

    // Collapse the (date-desc) rows into day buckets so the table reads as a timeline.
    const groups = useMemo(() => {
        const out: { key: string; label: string; items: ChangeLogItem[] }[] = [];
        for (const log of logs.data) {
            const last = out[out.length - 1];
            if (last && last.key === log.day_key) last.items.push(log);
            else out.push({ key: log.day_key, label: log.day_label, items: [log] });
        }
        return out;
    }, [logs.data]);

    return (
        <AdminLayout title="Change Log">
            <Head title="Change Log" />

            <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="text-sm text-ink-muted flex-1 min-w-48">
                    Every tracked edit to settings, content, projects, testimonials, team, contacts and users.{' '}
                    <span className="text-ink dark:text-zinc-200 font-medium">{logs.total}</span> matching entr{logs.total === 1 ? 'y' : 'ies'}.
                </p>

                {/* Search */}
                <div className="relative">
                    <Search size={15} className="pointer-events-none absolute inset-s-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search label or id…"
                        className="w-52 rounded border border-ink/10 dark:border-white/10 bg-white dark:bg-zinc-700 dark:text-zinc-100 ps-8 pe-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="absolute inset-e-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                            aria-label="Clear search"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Filter row */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
                <Select
                    className="w-44"
                    value={filters.model_type ?? ''}
                    onChange={(v) => applyFilter('model_type', v)}
                    options={[
                        { value: '', label: 'All sections' },
                        ...Object.entries(sectionLabels).map(([value, label]) => ({ value, label })),
                    ]}
                />
                <Select
                    className="w-40"
                    value={filters.action ?? ''}
                    onChange={(v) => applyFilter('action', v)}
                    options={ACTION_OPTIONS}
                />
                <Select
                    className="w-40"
                    value={filters.status ?? ''}
                    onChange={(v) => applyFilter('status', v)}
                    options={STATUS_OPTIONS}
                />
                <Select
                    className="w-44"
                    value={filters.changed_by ?? ''}
                    onChange={(v) => applyFilter('changed_by', v)}
                    options={[
                        { value: '', label: 'Anyone' },
                        ...users.map((u) => ({ value: String(u.id), label: u.name })),
                    ]}
                />
                <Select
                    className="w-40"
                    value={filters.period ?? ''}
                    onChange={(v) => applyFilter('period', v)}
                    options={PERIOD_OPTIONS}
                />
                {hasFilters && (
                    <button
                        type="button"
                        onClick={resetFilters}
                        className="inline-flex items-center gap-1.5 rounded border border-ink/10 dark:border-white/10 px-3 py-2 text-xs text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors"
                    >
                        <RotateCcw size={13} />
                        Reset
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg overflow-hidden">
                {logs.data.length === 0 ? (
                    <div className="py-16 text-center text-ink-muted text-sm">No changes recorded for this filter.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-surface-muted border-b border-ink/5">
                            <tr>
                                <th className="text-start px-4 py-3 font-medium text-ink-muted">Change</th>
                                <th className="text-start px-4 py-3 font-medium text-ink-muted hidden lg:table-cell">Details</th>
                                <th className="text-start px-4 py-3 font-medium text-ink-muted hidden sm:table-cell whitespace-nowrap">When</th>
                                <th className="text-end px-4 py-3 font-medium text-ink-muted">Actions</th>
                            </tr>
                        </thead>
                        {groups.map((group) => (
                            <tbody key={group.key} className="divide-y divide-ink/5">
                                {/* Day header */}
                                <tr className="bg-surface-muted/50 border-t border-ink/5">
                                    <td colSpan={4} className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                                        {group.label}
                                    </td>
                                </tr>

                                {group.items.map((log) => {
                                    const Icon = SECTION_ICONS[log.model_type] ?? History;
                                    return (
                                        <tr key={log.id} className={cn('hover:bg-surface-muted/50 transition-colors align-top', log.reverted && 'opacity-60')}>
                                            {/* Change summary */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-ink-muted"><Icon size={14} /></span>
                                                    <span className="font-medium text-ink">{log.section}</span>
                                                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize', ACTION_COLORS[log.action])}>
                                                        {log.action}
                                                    </span>
                                                </div>
                                                {log.label && <div className="text-xs text-ink-muted mt-1">{log.label}</div>}
                                                <div className="text-xs text-ink-muted mt-1">by {log.changed_by ?? 'system'}</div>
                                            </td>

                                            {/* Field diffs */}
                                            <td className="px-4 py-3 hidden lg:table-cell max-w-md">
                                                {log.changes.length === 0 ? (
                                                    <span className="text-xs text-ink-muted">—</span>
                                                ) : (
                                                    <ul className="space-y-1">
                                                        {log.changes.slice(0, 4).map((c, i) => (
                                                            <li key={i} className="text-xs flex items-center gap-1.5 flex-wrap">
                                                                <span className="font-medium text-ink">{c.label}:</span>
                                                                <span className="text-ink-muted line-through decoration-ink/30">{c.old}</span>
                                                                <ArrowRight size={10} className="text-ink-muted shrink-0" />
                                                                <span className="text-ink">{c.new}</span>
                                                            </li>
                                                        ))}
                                                        {log.changes.length > 4 && (
                                                            <li className="text-xs text-ink-muted">+{log.changes.length - 4} more</li>
                                                        )}
                                                    </ul>
                                                )}
                                            </td>

                                            {/* When — exact time + relative (full timestamp on hover) */}
                                            <td className="px-4 py-3 hidden sm:table-cell whitespace-nowrap" title={log.created_at}>
                                                <div className="text-ink">{log.created_time}</div>
                                                <div className="text-xs text-ink-muted">{log.created_ago}</div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-3">
                                                    {log.reverted ? (
                                                        <span className="text-xs text-ink-muted whitespace-nowrap" title={log.reverted_at ?? undefined}>
                                                            Reverted{log.reverted_by ? ` by ${log.reverted_by}` : ''}
                                                            {log.reverted_ago ? ` · ${log.reverted_ago}` : ''}
                                                        </span>
                                                    ) : log.revertable ? (
                                                        <ConfirmActionButton
                                                            onConfirm={() => revert(log.id)}
                                                            className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-primary transition-colors"
                                                            title="Revert this change"
                                                            heading="Revert this change?"
                                                            description="This restores the previous state of this record. It will be logged as a new entry, so it stays auditable."
                                                            actionLabel="Revert"
                                                            actionIcon={<Undo2 size={15} />}
                                                            tone="warning"
                                                            confirmWord="revert"
                                                        >
                                                            <Undo2 size={14} />
                                                            Revert
                                                        </ConfirmActionButton>
                                                    ) : (
                                                        <span className="text-xs text-ink-muted/60" title="This action can't be reverted">audit only</span>
                                                    )}
                                                    <ConfirmButton onConfirm={() => destroy(log.id)} className="text-ink-muted hover:text-red-500 transition-colors" title="Remove log entry">
                                                        <Trash2 size={14} />
                                                    </ConfirmButton>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        ))}
                    </table>
                )}
            </div>

            {/* Footer: per-page selector + range + numbered links */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-ink-muted">
                <div className="flex items-center gap-2">
                    <span>Rows</span>
                    <Select
                        className="w-20"
                        dropUp
                        value={String(filters.per_page ?? 20)}
                        onChange={(v) => applyFilter('per_page', v)}
                        options={perPageOptions.map((n) => ({ value: String(n), label: String(n) }))}
                    />
                    {logs.total > 0 && <span className="whitespace-nowrap">Showing {logs.from}–{logs.to} of {logs.total}</span>}
                </div>

                {logs.last_page > 1 && (
                    <div className="flex items-center gap-1">
                        {logs.links.map((link, i) => (
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={cn(
                                        'px-3 py-1.5 rounded border text-xs transition-colors',
                                        link.active
                                            ? 'bg-primary text-zinc-900 border-primary'
                                            : 'bg-white dark:bg-zinc-800 border-ink/10 dark:border-white/10 hover:bg-surface-muted',
                                    )}
                                />
                            ) : (
                                <span
                                    key={i}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className="px-3 py-1.5 rounded border text-xs bg-white dark:bg-zinc-800 border-ink/10 dark:border-white/10 text-ink/30 cursor-default"
                                />
                            )
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
