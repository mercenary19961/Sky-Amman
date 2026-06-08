import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft, Mail, MailOpen, Archive, ArchiveRestore, Trash2, Phone, Building2, Globe, Reply,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ConfirmDeleteButton } from '@/Components/Admin/ConfirmDeleteButton';
import { cn } from '@/lib/cn';
import type { ContactShowProps, RequestType } from '@/types/admin/contact';

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

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <span className="mt-0.5 text-ink-muted shrink-0">{icon}</span>
            <div className="min-w-0">
                <div className="text-xs text-ink-muted">{label}</div>
                <div className="text-sm text-ink wrap-break-word">{children}</div>
            </div>
        </div>
    );
}

export default function ContactShow() {
    const { submission: s } = usePage<ContactShowProps>().props;

    const toggleRead = () => router.post(`/admin/contacts/${s.id}/read`, {}, { preserveScroll: true });
    const toggleArchive = () => router.post(`/admin/contacts/${s.id}/archive`, {}, { preserveScroll: true });
    const destroy = () => router.delete(`/admin/contacts/${s.id}`);

    const mailto = `mailto:${s.email}?subject=${encodeURIComponent('Re: your inquiry to SkyAmman')}`;

    return (
        <AdminLayout title="Submission">
            <Head title={`Submission · ${s.name}`} />

            <div className="mb-5">
                <Link href="/admin/contacts" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors">
                    <ArrowLeft size={15} />
                    Back to inbox
                </Link>
            </div>

            <div className="max-w-3xl">
                {/* Header card */}
                <div className="bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg overflow-hidden">
                    <div className="flex flex-wrap items-start justify-between gap-4 p-5 border-b border-ink/5 dark:border-white/10">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h2 className="text-lg font-semibold text-ink">{s.name}</h2>
                                <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', TYPE_COLORS[s.request_type])}>
                                    {TYPE_LABELS[s.request_type]}
                                </span>
                                {!s.is_read && <span className="inline-block w-2 h-2 rounded-full bg-primary" title="Unread" />}
                            </div>
                            <div className="text-sm text-ink-muted mt-1">{s.created_at} · {s.created_ago}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href={mailto}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-zinc-900 rounded font-medium hover:bg-primary-dark transition-colors"
                            >
                                <Reply size={14} />
                                Reply
                            </a>
                            <button type="button" onClick={toggleRead} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-ink/10 dark:border-white/10 rounded text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors" title={s.is_read ? 'Mark unread' : 'Mark read'}>
                                {s.is_read ? <Mail size={14} /> : <MailOpen size={14} />}
                                {s.is_read ? 'Unread' : 'Read'}
                            </button>
                            <button type="button" onClick={toggleArchive} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-ink/10 dark:border-white/10 rounded text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors">
                                {s.is_archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                                {s.is_archived ? 'Unarchive' : 'Archive'}
                            </button>
                            <ConfirmDeleteButton
                                onConfirm={destroy}
                                className="inline-flex items-center justify-center p-1.5 text-ink-muted hover:text-red-500 transition-colors"
                                title="Delete"
                                heading="Delete this submission?"
                                itemLabel={s.name}
                                description="The submission will be moved to Trash. You can restore it from there."
                            >
                                <Trash2 size={15} />
                            </ConfirmDeleteButton>
                        </div>
                    </div>

                    {/* Contact details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 border-b border-ink/5 dark:border-white/10">
                        <Field icon={<Mail size={15} />} label="Email">
                            <a href={mailto} className="hover:text-primary transition-colors">{s.email}</a>
                        </Field>
                        {s.phone && (
                            <Field icon={<Phone size={15} />} label="Phone">
                                <a href={`tel:${s.phone}`} className="hover:text-primary transition-colors">{s.phone}</a>
                            </Field>
                        )}
                        {s.project && (
                            <Field icon={<Building2 size={15} />} label="About project">
                                <Link href={`/admin/projects/${s.project.id}/edit`} className="hover:text-primary transition-colors">
                                    {s.project.title_en}
                                </Link>
                            </Field>
                        )}
                        {s.ip_address && (
                            <Field icon={<Globe size={15} />} label="IP address">
                                <span className="font-mono text-xs">{s.ip_address}</span>
                            </Field>
                        )}
                    </div>

                    {/* Message */}
                    <div className="p-5">
                        {s.subject && <div className="font-medium text-ink mb-2">{s.subject}</div>}
                        <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{s.message}</p>
                    </div>
                </div>

                {s.read_by && (
                    <p className="mt-3 text-xs text-ink-muted">Read by {s.read_by}.</p>
                )}
            </div>
        </AdminLayout>
    );
}
