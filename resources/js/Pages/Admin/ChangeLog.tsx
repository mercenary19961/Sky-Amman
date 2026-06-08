import { Head, Link, router, usePage } from '@inertiajs/react';
import { Undo2, Trash2, ArrowRight, FileText, Building2, Users as UsersIcon, Settings as SettingsIcon, History, Quote, Video, MessageSquare, Contact } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ConfirmDeleteButton as ConfirmButton } from '@/Components/Admin/ConfirmDeleteButton';
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

export default function ChangeLog() {
    const { logs, users, sectionLabels, filters } = usePage<ChangeLogPageProps>().props;

    function applyFilter(key: string, value: string) {
        router.get('/admin/change-log', { ...filters, [key]: value || undefined, page: undefined }, {
            preserveState: true,
            replace: true,
        });
    }

    function revert(id: number) {
        router.post(`/admin/change-log/${id}/revert`, {}, { preserveScroll: true });
    }
    function destroy(id: number) {
        router.delete(`/admin/change-log/${id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Change Log">
            <Head title="Change Log" />

            <div className="flex flex-wrap items-center gap-3 mb-6">
                <p className="text-sm text-ink-muted flex-1 min-w-48">
                    Every tracked edit to settings, site content, projects, and users. Revert restores the previous state.
                </p>

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
                    options={[
                        { value: '', label: 'Any time' },
                        { value: 'today', label: 'Today' },
                        { value: 'week', label: 'Past week' },
                        { value: 'month', label: 'Past month' },
                    ]}
                />
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
                        <tbody className="divide-y divide-ink/5">
                            {logs.data.map((log: ChangeLogItem) => {
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

                                        {/* When */}
                                        <td className="px-4 py-3 hidden sm:table-cell text-ink-muted whitespace-nowrap" title={log.created_at}>
                                            {log.created_ago}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-3">
                                                {log.reverted ? (
                                                    <span className="text-xs text-ink-muted whitespace-nowrap">Reverted{log.reverted_by ? ` by ${log.reverted_by}` : ''}</span>
                                                ) : log.revertable ? (
                                                    <ConfirmButton
                                                        onConfirm={() => revert(log.id)}
                                                        className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-primary transition-colors"
                                                        title="Revert this change"
                                                    >
                                                        <Undo2 size={14} />
                                                        Revert
                                                    </ConfirmButton>
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
                    </table>
                )}
            </div>

            {logs.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-ink-muted">
                    <span>Showing {logs.from}–{logs.to} of {logs.total}</span>
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
                </div>
            )}
        </AdminLayout>
    );
}
