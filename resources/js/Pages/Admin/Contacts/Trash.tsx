import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, RotateCcw, Trash2 } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { cn } from '@/lib/cn';
import type { ContactTrashProps, ContactListItem, RequestType } from '@/types/admin/contact';

const TYPE_LABELS: Record<RequestType, string> = {
    buy:        'Buy',
    rent:       'Rent',
    build:      'Build',
    investment: 'Investment',
    general:    'General',
};

function ConfirmButton({ onConfirm, children, className, title }: {
    onConfirm: () => void;
    children: React.ReactNode;
    className?: string;
    title?: string;
}) {
    const [pending, setPending] = useState(false);
    if (pending) {
        return (
            <span className="flex items-center gap-1 text-xs">
                <button type="button" onClick={() => { setPending(false); onConfirm(); }} className="text-red-600 font-medium hover:underline">Confirm</button>
                <span className="text-ink-muted">/</span>
                <button type="button" onClick={() => setPending(false)} className="text-ink-muted hover:underline">Cancel</button>
            </span>
        );
    }
    return (
        <button type="button" onClick={() => setPending(true)} className={className} title={title}>
            {children}
        </button>
    );
}

export default function ContactsTrash() {
    const { submissions } = usePage<ContactTrashProps>().props;

    const restore = (id: number) => router.post(`/admin/contacts/${id}/restore`, {}, { preserveScroll: true });
    const forceDestroy = (id: number) => router.delete(`/admin/contacts/${id}/force`, { preserveScroll: true });

    return (
        <AdminLayout title="Trash · Contact Submissions">
            <Head title="Trash · Contact Submissions" />

            <div className="mb-5">
                <Link href="/admin/contacts" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors">
                    <ArrowLeft size={15} />
                    Back to inbox
                </Link>
            </div>

            <div className="bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg overflow-hidden">
                {submissions.data.length === 0 ? (
                    <div className="py-16 text-center text-ink-muted text-sm">Trash is empty.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-surface-muted border-b border-ink/5">
                            <tr>
                                <th className="text-start px-4 py-3 font-medium text-ink-muted">From</th>
                                <th className="text-start px-4 py-3 font-medium text-ink-muted">Type</th>
                                <th className="text-start px-4 py-3 font-medium text-ink-muted hidden lg:table-cell">Message</th>
                                <th className="text-start px-4 py-3 font-medium text-ink-muted hidden sm:table-cell whitespace-nowrap">When</th>
                                <th className="text-end px-4 py-3 font-medium text-ink-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/5">
                            {submissions.data.map((s: ContactListItem) => (
                                <tr key={s.id} className="hover:bg-surface-muted/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-ink">{s.name}</div>
                                        <div className="text-ink-muted text-xs mt-0.5">{s.email}</div>
                                    </td>
                                    <td className="px-4 py-3 text-ink-muted">{TYPE_LABELS[s.request_type]}</td>
                                    <td className="px-4 py-3 hidden lg:table-cell max-w-md">
                                        <span className="text-ink-muted line-clamp-1">{s.preview}</span>
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell text-ink-muted whitespace-nowrap" title={s.created_at}>
                                        {s.created_ago}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() => restore(s.id)}
                                                className="inline-flex items-center gap-1.5 text-ink-muted hover:text-primary transition-colors text-xs"
                                                title="Restore"
                                            >
                                                <RotateCcw size={14} />
                                                Restore
                                            </button>
                                            <ConfirmButton
                                                onConfirm={() => forceDestroy(s.id)}
                                                className="text-ink-muted hover:text-red-500 transition-colors"
                                                title="Delete permanently"
                                            >
                                                <Trash2 size={15} />
                                            </ConfirmButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

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
