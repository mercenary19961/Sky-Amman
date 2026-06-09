import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft, Pencil, ExternalLink, ChevronLeft, ChevronRight, Star, Share2,
    MapPin, Ruler, CalendarDays, Layers, BedDouble, Bath, MessageSquare, EyeOff,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Select } from '@/Components/Admin/Select';
import { cn } from '@/lib/cn';
import type { ProjectShowProps, ProjectCategory, ProjectListingStatus } from '@/types/admin/project';

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
    under_development: 'Under Development',
    ready: 'Ready',
    investment_opportunity: 'Investment Opportunity',
};
const CATEGORY_COLORS: Record<ProjectCategory, string> = {
    under_development: 'bg-primary/10 text-primary',
    ready: 'bg-emerald-100 text-emerald-700',
    investment_opportunity: 'bg-amber-100 text-amber-700',
};
const STATUS_LABELS: Record<ProjectListingStatus, string> = {
    for_sale: 'For Sale', for_rent: 'For Rent', sold: 'Sold', reserved: 'Reserved',
};
const STATUS_COLORS: Record<ProjectListingStatus, string> = {
    for_sale: 'bg-emerald-100 text-emerald-700',
    for_rent: 'bg-primary/10 text-primary',
    sold: 'bg-ink/10 text-ink-muted',
    reserved: 'bg-orange-100 text-orange-700',
};

function Badge({ label, color }: { label: string; color: string }) {
    return <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', color)}>{label}</span>;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-lg border border-ink/5 dark:border-white/10 bg-white dark:bg-zinc-800 p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">{title}</h2>
            {children}
        </div>
    );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <div className="text-xs text-ink-muted">{label}</div>
            <div className="text-sm text-ink dark:text-zinc-100 wrap-break-word">{value || <span className="text-ink-muted">—</span>}</div>
        </div>
    );
}

export default function ProjectShow() {
    const { project: p } = usePage<ProjectShowProps>().props;
    const [idx, setIdx] = useState(0);

    const images = p.images;
    const multi = images.length > 1;
    const step = (dir: number) => setIdx((i) => (i + dir + images.length) % images.length);

    // Quick status changes (no full form). Reuses the lightweight status endpoint.
    const [saving, setSaving] = useState(false);
    const patchStatus = (payload: { is_active?: boolean; listing_status?: string }) => {
        setSaving(true);
        router.post(`/admin/projects/${p.id}/status`, payload, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    const specs = [
        { key: 'area_sqm', icon: Ruler, label: 'Area', value: p.area_sqm != null ? `${p.area_sqm} m²` : null },
        { key: 'completion_year', icon: CalendarDays, label: 'Completion year', value: p.completion_year },
        { key: 'floors', icon: Layers, label: 'Floors', value: p.floors },
        { key: 'bedrooms', icon: BedDouble, label: 'Bedrooms', value: p.bedrooms },
        { key: 'bathrooms', icon: Bath, label: 'Bathrooms', value: p.bathrooms },
    ].filter((s) => s.value != null && s.value !== '');

    return (
        <AdminLayout title={p.title_en}>
            <Head title={p.title_en} />

            {/* Top bar */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <Link href="/admin/projects" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors">
                    <ArrowLeft size={15} /> Back to projects
                </Link>
                <div className="flex items-center gap-2">
                    <a
                        href={p.public_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-ink/10 dark:border-white/10 px-3 py-2 text-sm text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors"
                    >
                        <ExternalLink size={15} /> View on site
                    </a>
                    <Link
                        href={`/admin/projects/${p.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-md bg-primary-strong px-4 py-2 text-sm font-medium text-white hover:bg-primary-strong-hover transition-colors"
                    >
                        <Pencil size={15} /> Edit
                    </Link>
                </div>
            </div>

            {/* Title + badges */}
            <div className="mb-5">
                <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl font-bold text-ink dark:text-zinc-100">{p.title_en}</h1>
                    <Badge label={CATEGORY_LABELS[p.category]} color={CATEGORY_COLORS[p.category]} />
                    {p.listing_status && <Badge label={STATUS_LABELS[p.listing_status]} color={STATUS_COLORS[p.listing_status]} />}
                    <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                        <span className={cn('w-1.5 h-1.5 rounded-full', p.is_active ? 'bg-emerald-500' : 'bg-zinc-400')} />
                        {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
                <p className="mt-1 text-base text-ink-muted" dir="rtl">{p.title_ar}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left: gallery */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="rounded-lg border border-ink/5 dark:border-white/10 bg-white dark:bg-zinc-800 overflow-hidden">
                        <div className="relative aspect-video bg-surface-muted">
                            {images.length > 0 ? (
                                <img src={images[idx].url} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm text-ink-muted">No images uploaded</div>
                            )}

                            {/* Featured / OG markers on the current image */}
                            {images[idx] && (images[idx].is_featured || images[idx].is_og) && (
                                <div className="absolute top-2 inset-s-2 flex gap-1.5">
                                    {images[idx].is_featured && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-zinc-800 shadow-sm">
                                            <Star size={11} className="fill-amber-400 text-amber-400" /> Featured
                                        </span>
                                    )}
                                    {images[idx].is_og && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-zinc-800 shadow-sm">
                                            <Share2 size={11} className="text-primary" /> OG
                                        </span>
                                    )}
                                </div>
                            )}

                            {multi && (
                                <>
                                    <button type="button" onClick={() => step(-1)} aria-label="Previous image"
                                        className="absolute inset-s-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/65 rtl:rotate-180">
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button type="button" onClick={() => step(1)} aria-label="Next image"
                                        className="absolute inset-e-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/65 rtl:rotate-180">
                                        <ChevronRight size={18} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {multi && (
                            <div className="flex gap-2 overflow-x-auto p-3">
                                {images.map((img, i) => (
                                    <button
                                        key={img.id}
                                        type="button"
                                        onClick={() => setIdx(i)}
                                        className={cn(
                                            'relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors',
                                            i === idx ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100',
                                        )}
                                    >
                                        <img src={img.url} alt="" className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Descriptions */}
                    {(p.short_description_en || p.short_description_ar || p.description_en || p.description_ar) && (
                        <Card title="Description">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-3">
                                    <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">English</div>
                                    {p.short_description_en && <p className="text-sm font-medium text-ink dark:text-zinc-100">{p.short_description_en}</p>}
                                    {p.description_en && <p className="text-sm text-ink-muted whitespace-pre-wrap">{p.description_en}</p>}
                                </div>
                                <div className="space-y-3" dir="rtl">
                                    <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">العربية</div>
                                    {p.short_description_ar && <p className="text-sm font-medium text-ink dark:text-zinc-100">{p.short_description_ar}</p>}
                                    {p.description_ar && <p className="text-sm text-ink-muted whitespace-pre-wrap">{p.description_ar}</p>}
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* SEO */}
                    <Card title="SEO">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="SEO Title (EN)" value={p.seo_title_en} />
                            <Field label="SEO Title (AR)" value={p.seo_title_ar} />
                            <Field label="SEO Description (EN)" value={p.seo_description_en} />
                            <Field label="SEO Description (AR)" value={p.seo_description_ar} />
                        </div>
                    </Card>
                </div>

                {/* Right: facts */}
                <div className="space-y-5">
                    <Card title="Status & visibility">
                        <div className="space-y-4">
                            {/* Active toggle */}
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-sm text-ink dark:text-zinc-100">Active</div>
                                    <div className="text-xs text-ink-muted">Shown on the public site</div>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={p.is_active}
                                    disabled={saving}
                                    onClick={() => patchStatus({ is_active: !p.is_active })}
                                    className={cn(
                                        'relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50',
                                        p.is_active ? 'bg-emerald-500' : 'bg-ink/20 dark:bg-white/20',
                                    )}
                                >
                                    <span className={cn(
                                        'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                                        p.is_active && 'translate-x-5',
                                    )} />
                                </button>
                            </div>

                            {/* Listing status */}
                            <div>
                                <label className="block text-xs text-ink-muted mb-1.5">Listing status</label>
                                <Select
                                    value={p.listing_status ?? ''}
                                    onChange={(v) => patchStatus({ listing_status: v })}
                                    disabled={saving}
                                    placeholder="Set status…"
                                    options={[
                                        { value: 'for_sale', label: 'For Sale' },
                                        { value: 'for_rent', label: 'For Rent' },
                                        { value: 'sold', label: 'Sold' },
                                        { value: 'reserved', label: 'Reserved' },
                                    ]}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card title="Location">
                        <div className="space-y-3">
                            <Field label="Location (EN)" value={p.location_en} />
                            <Field label="Location (AR)" value={p.location_ar} />
                            <Field label="Address (EN)" value={p.address_en} />
                            <Field label="Address (AR)" value={p.address_ar} />
                            {p.public_url && (
                                <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                                    <MapPin size={13} /> {p.group ? `Development: ${p.group}` : 'No development group'}
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card title="Specifications">
                        {specs.length === 0 ? (
                            <p className="text-sm text-ink-muted">No specs set.</p>
                        ) : (
                            <ul className="space-y-2.5">
                                {specs.map((s) => {
                                    const Icon = s.icon;
                                    const hidden = p.hidden_specs.includes(s.key);
                                    return (
                                        <li key={s.key} className="flex items-center justify-between gap-2 text-sm">
                                            <span className="inline-flex items-center gap-2 text-ink-muted">
                                                <Icon size={15} /> {s.label}
                                            </span>
                                            <span className="inline-flex items-center gap-2 text-ink dark:text-zinc-100 font-medium">
                                                {s.value}
                                                {hidden && (
                                                    <span className="inline-flex items-center gap-1 rounded bg-ink/5 dark:bg-white/10 px-1.5 py-0.5 text-[10px] text-ink-muted" title="Hidden on the public detail page">
                                                        <EyeOff size={10} /> hidden
                                                    </span>
                                                )}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </Card>

                    <Card title="Details">
                        <div className="space-y-3">
                            <Link
                                href={`/admin/contacts?search=${encodeURIComponent(p.title_en)}`}
                                className="flex items-center justify-between text-sm hover:text-primary transition-colors"
                            >
                                <span className="inline-flex items-center gap-2 text-ink-muted"><MessageSquare size={15} /> Inquiries</span>
                                <span className="font-medium text-ink dark:text-zinc-100">{p.inquiries_count}</span>
                            </Link>
                            <Field label="Slug" value={<code className="text-xs">{p.slug}</code>} />
                            <Field label="Created" value={p.created_at ? `${p.created_at}${p.created_by ? ` · ${p.created_by}` : ''}` : null} />
                            <Field label="Last updated" value={p.updated_at ? `${p.updated_at}${p.updated_by ? ` · ${p.updated_by}` : ''}` : null} />
                        </div>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
