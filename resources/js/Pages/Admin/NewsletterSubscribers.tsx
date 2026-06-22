import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Search, Trash2, Download, Users } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ConfirmDeleteButton } from '@/Components/Admin/ConfirmDeleteButton';
import { cn } from '@/lib/cn';
import type { NewsletterSubscribersProps } from '@/types/admin/newsletter';

export default function NewsletterSubscribers() {
    const { subscribers, filters, totalCount, activeCount } =
        usePage<NewsletterSubscribersProps>().props;

    const [search, setSearch] = useState(filters.search ?? '');

    function applySearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/admin/newsletter', { search: search || undefined }, {
            preserveState: true,
            replace: true,
        });
    }

    function destroy(id: number) {
        router.delete(`/admin/newsletter/${id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Newsletter Subscribers">
            <Head title="Newsletter Subscribers" />

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-ink/5 dark:border-white/10 p-4">
                    <div className="text-2xl font-bold">{totalCount}</div>
                    <div className="text-sm text-ink-muted mt-0.5">Total subscribers</div>
                </div>
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-ink/5 dark:border-white/10 p-4">
                    <div className="text-2xl font-bold text-emerald-600">{activeCount}</div>
                    <div className="text-sm text-ink-muted mt-0.5">Active</div>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-ink/5 dark:border-white/10 overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center gap-3 p-4 border-b border-ink/5 dark:border-white/10">
                    <form onSubmit={applySearch} className="relative flex-1 max-w-xs">
                        <Search
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
                        />
                        <input
                            type="search"
                            placeholder="Search email…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-ink/10 dark:border-white/10 bg-surface dark:bg-zinc-700 focus:outline-none focus:border-primary"
                        />
                    </form>
                    <a
                        href="/admin/newsletter/export"
                        className="ml-auto inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-ink/10 dark:border-white/10 hover:bg-ink/5 dark:hover:bg-white/5 transition-colors text-ink-muted"
                    >
                        <Download size={15} />
                        <span className="hidden sm:inline">Export emails</span>
                    </a>
                </div>

                {/* Table */}
                {subscribers.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Users size={36} className="text-ink-muted/30 mb-3" />
                        <p className="text-sm text-ink-muted">
                            {filters.search ? 'No subscribers match your search.' : 'No subscribers yet.'}
                        </p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-ink/5 dark:border-white/10 text-xs uppercase tracking-wider text-ink-muted">
                                <th className="px-4 py-3 text-left font-medium">Email</th>
                                <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Subscribed</th>
                                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Status</th>
                                <th className="px-4 py-3 w-12" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/5 dark:divide-white/5">
                            {subscribers.data.map((sub) => (
                                <tr
                                    key={sub.id}
                                    className="hover:bg-ink/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                                >
                                    <td className="px-4 py-3 font-medium">{sub.email}</td>
                                    <td className="px-4 py-3 text-ink-muted hidden sm:table-cell">
                                        <span title={sub.created_at ?? undefined}>{sub.created_ago}</span>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <span className={cn(
                                            'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                                            sub.is_active
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-ink/10 text-ink-muted',
                                        )}>
                                            {sub.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <ConfirmDeleteButton
                                            onConfirm={() => destroy(sub.id)}
                                            heading="Remove subscriber?"
                                            description={`Remove ${sub.email} from the newsletter list? This can be undone by the user re-subscribing.`}
                                            actionLabel="Remove"
                                            confirmWord="remove"
                                            className="inline-flex items-center justify-center p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-ink-muted hover:text-red-600 transition-colors"
                                            title="Remove subscriber"
                                        >
                                            <Trash2 size={15} />
                                        </ConfirmDeleteButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {subscribers.last_page > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-ink/5 dark:border-white/10">
                        <p className="text-xs text-ink-muted">
                            {subscribers.from}–{subscribers.to} of {subscribers.total}
                        </p>
                        <div className="flex gap-1 flex-wrap">
                            {subscribers.links.map((link, i) =>
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className={cn(
                                            'px-2.5 py-1 text-xs rounded border transition-colors',
                                            link.active
                                                ? 'bg-primary text-white border-primary'
                                                : 'border-ink/10 dark:border-white/10 text-ink-muted hover:bg-ink/5 dark:hover:bg-white/5',
                                        )}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        className="px-2.5 py-1 text-xs rounded border border-ink/5 dark:border-white/5 text-ink-muted/40"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ),
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
