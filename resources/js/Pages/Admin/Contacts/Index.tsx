import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Search, Archive, Trash2, ArchiveRestore, Inbox, Mail, MailOpen, Building2, ChevronRight, Download,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ConfirmDeleteButton as ConfirmButton } from '@/Components/Admin/ConfirmDeleteButton';
import { Select } from '@/Components/Admin/Select';
import { cn } from '@/lib/cn';
import type { ContactIndexProps, ContactListItem, RequestType } from '@/types/admin/contact';

const TYPE_LABELS: Record<RequestType, string> = {
    buy:        'Buy',
    rent:       'Rent',
    build:      'Build',
    investment: 'Investment',
    general:    'General',
};

const TYPE_COLORS: Record<RequestType, string> = {
    buy:        'bg-emerald-100 text-emerald-700',
    rent:       'bg-primary/10 text-primary',
    build:      'bg-amber-100 text-amber-700',
    investment: 'bg-violet-100 text-violet-700',
    general:    'bg-ink/10 text-ink-muted',
};

function Badge({ label, color }: { label: string; color: string }) {
    return (
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', color)}>
            {label}
        </span>
    );
}

export default function ContactsIndex() {
    const { submissions, filters, view, unreadCount, archivedCount, trashedCount } =
        usePage<ContactIndexProps>().props;

    const [search, setSearch] = useState(filters.search ?? '');

    function applyFilter(key: string, value: string) {
        router.get('/admin/contacts', { ...filters, [key]: value || undefined, page: undefined }, {
            preserveState: true,
            replace: true,
        });
    }

    function switchView(next: 'inbox' | 'archived') {
        router.get('/admin/contacts', { view: next === 'inbox' ? undefined : next }, {
            preserveState: false,
            replace: true,
        });
    }

    function toggleRead(id: number) {
        router.post(`/admin/contacts/${id}/read`, {}, { preserveScroll: true });
    }
    function toggleArchive(id: number) {
        router.post(`/admin/contacts/${id}/archive`, {}, { preserveScroll: true });
    }
    function destroy(id: number) {
        router.delete(`/admin/contacts/${id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Contact Submissions">
            <Head title="Contact Submissions" />

            {/* View tabs */}
            <div className="flex items-center gap-1 mb-5 border-b border-ink/5 dark:border-white/10">
                <button
                    type="button"
                    onClick={() => switchView('inbox')}
                    className={cn(
                        'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                        view === 'inbox'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-ink-muted hover:text-ink',
                    )}
                >
                    <Inbox size={16} />
                    Inbox
                    {unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary text-zinc-900 text-xs font-semibold">
                            {unreadCount}
                        </span>
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => switchView('archived')}
                    className={cn(
                        'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                        view === 'archived'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-ink-muted hover:text-ink',
                    )}
                >
                    <Archive size={16} />
                    Archived
                    {archivedCount > 0 && <span className="text-xs text-ink-muted">({archivedCount})</span>}
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <form onSubmit={(e) => { e.preventDefault(); applyFilter('search', search); }} className="flex items-center gap-2">
                    <div className="relative">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search name, email, message…"
                            className="pl-8 pr-3 py-2 text-sm border border-ink/10 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:bg-zinc-800 dark:text-zinc-100 w-64"
                        />
                    </div>
                    <button type="submit" className="px-3 py-2 text-sm bg-white dark:bg-zinc-800 dark:text-zinc-100 border border-ink/10 rounded hover:bg-surface-muted transition-colors">
                        Search
                    </button>
                </form>

                <Select
                    className="w-40"
                    value={filters.request_type ?? ''}
                    onChange={(v) => applyFilter('request_type', v)}
                    options={[
                        { value: '', label: 'All Types' },
                        { value: 'buy', label: 'Buy' },
                        { value: 'rent', label: 'Rent' },
                        { value: 'build', label: 'Build' },
                        { value: 'investment', label: 'Investment' },
                        { value: 'general', label: 'General' },
                    ]}
                />

                <Select
                    className="w-44"
                    value={filters.read ?? ''}
                    onChange={(v) => applyFilter('read', v)}
                    options={[
                        { value: '', label: 'Read & Unread' },
                        { value: '0', label: 'Unread only' },
                        { value: '1', label: 'Read only' },
                    ]}
                />

                <div className="ms-auto flex items-center gap-3">
                    <a
                        href="/admin/contacts/export"
                        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors"
                    >
                        <Download size={15} />
                        Export CSV
                    </a>
                    {trashedCount > 0 && (
                        <Link
                            href="/admin/contacts/trash"
                            className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors"
                        >
                            <Trash2 size={15} />
                            Trash ({trashedCount})
                        </Link>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg overflow-hidden">
                {submissions.data.length === 0 ? (
                    <div className="py-16 text-center text-ink-muted text-sm">
                        {view === 'archived' ? 'No archived submissions.' : 'No submissions in the inbox.'}
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-surface-muted border-b border-ink/5">
                            <tr>
                                <th className="text-start px-4 py-3 font-medium text-ink-muted w-8"></th>
                                <th className="text-start px-4 py-3 font-medium text-ink-muted">From</th>
                                <th className="text-start px-4 py-3 font-medium text-ink-muted">Type</th>
                                <th className="text-start px-4 py-3 font-medium text-ink-muted hidden lg:table-cell">Message</th>
                                <th className="text-start px-4 py-3 font-medium text-ink-muted hidden md:table-cell">Project</th>
                                <th className="text-start px-4 py-3 font-medium text-ink-muted hidden sm:table-cell whitespace-nowrap">When</th>
                                <th className="text-end px-4 py-3 font-medium text-ink-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/5">
                            {submissions.data.map((s: ContactListItem) => (
                                <tr
                                    key={s.id}
                                    className={cn(
                                        'hover:bg-surface-muted/50 transition-colors',
                                        !s.is_read && 'bg-primary/3',
                                    )}
                                >
                                    {/* Unread dot */}
                                    <td className="px-4 py-3">
                                        {!s.is_read && <span className="inline-block w-2 h-2 rounded-full bg-primary" title="Unread" />}
                                    </td>

                                    {/* From */}
                                    <td className="px-4 py-3">
                                        <Link href={`/admin/contacts/${s.id}`} className="block group">
                                            <div className={cn('text-ink group-hover:text-primary transition-colors', !s.is_read ? 'font-semibold' : 'font-medium')}>
                                                {s.name}
                                            </div>
                                            <div className="text-ink-muted text-xs mt-0.5">{s.email}</div>
                                        </Link>
                                    </td>

                                    {/* Type */}
                                    <td className="px-4 py-3">
                                        <Badge label={TYPE_LABELS[s.request_type]} color={TYPE_COLORS[s.request_type]} />
                                    </td>

                                    {/* Message preview */}
                                    <td className="px-4 py-3 hidden lg:table-cell max-w-md">
                                        <Link href={`/admin/contacts/${s.id}`} className="text-ink-muted hover:text-ink transition-colors line-clamp-1">
                                            {s.preview}
                                        </Link>
                                    </td>

                                    {/* Project */}
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        {s.project ? (
                                            <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                                                <Building2 size={12} />
                                                {s.project.title_en}
                                            </span>
                                        ) : (
                                            <span className="text-ink-muted text-xs">—</span>
                                        )}
                                    </td>

                                    {/* When */}
                                    <td className="px-4 py-3 hidden sm:table-cell text-ink-muted whitespace-nowrap" title={s.created_at}>
                                        {s.created_ago}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() => toggleRead(s.id)}
                                                className="text-ink-muted hover:text-primary transition-colors"
                                                title={s.is_read ? 'Mark unread' : 'Mark read'}
                                            >
                                                {s.is_read ? <Mail size={15} /> : <MailOpen size={15} />}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => toggleArchive(s.id)}
                                                className="text-ink-muted hover:text-primary transition-colors"
                                                title={s.is_archived ? 'Move to inbox' : 'Archive'}
                                            >
                                                {s.is_archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                                            </button>
                                            <ConfirmButton
                                                onConfirm={() => destroy(s.id)}
                                                className="text-ink-muted hover:text-red-500 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={15} />
                                            </ConfirmButton>
                                            <Link
                                                href={`/admin/contacts/${s.id}`}
                                                className="text-ink-muted hover:text-primary transition-colors"
                                                title="Open"
                                            >
                                                <ChevronRight size={16} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {submissions.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-ink-muted">
                    <span>Showing {submissions.from}–{submissions.to} of {submissions.total}</span>
                    <div className="flex items-center gap-1">
                        {submissions.links.map((link, i) => (
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
