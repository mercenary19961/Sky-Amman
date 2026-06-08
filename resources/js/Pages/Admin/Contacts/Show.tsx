import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft, Mail, MailOpen, Archive, ArchiveRestore, Trash2, Phone, Building2, Globe, Reply,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ConfirmDeleteButton } from '@/Components/Admin/ConfirmDeleteButton';
import { cn } from '@/lib/cn';
import type { ContactShowProps, RequestType } from '@/types/admin/contact';

const WhatsAppIcon = ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

/**
 * Normalize a free-form phone into the digits-only international form wa.me
 * needs (no "+", spaces, dashes, or leading zero). Missing country codes default
 * to Jordan (962): `0770770123` → `962770770123`, `+962 77…` → `96277…`. An
 * explicit "+" or "00" prefix is treated as already-international (kept as-is),
 * so foreign numbers aren't force-prefixed.
 */
function waNumber(raw: string, cc = '962'): string {
    let d = raw.replace(/[^\d+]/g, '');
    if (d.startsWith('+')) return d.slice(1);
    if (d.startsWith('00')) return d.slice(2);
    if (d.startsWith('0')) return cc + d.slice(1);
    if (!d.startsWith(cc)) return cc + d;
    return d;
}

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

    // WhatsApp click-to-chat: opens WhatsApp (app/web) with a pre-filled draft to
    // the submitter's number. Only available when a phone was provided.
    const waText = `Hello ${s.name}, thank you for contacting SkyAmman regarding your inquiry.`;
    const whatsapp = s.phone
        ? `https://wa.me/${waNumber(s.phone)}?text=${encodeURIComponent(waText)}`
        : null;

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
                            {whatsapp && (
                                <a
                                    href={whatsapp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#25D366] text-white rounded font-medium hover:bg-[#1ebe57] transition-colors"
                                >
                                    <WhatsAppIcon size={14} />
                                    WhatsApp
                                </a>
                            )}
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
