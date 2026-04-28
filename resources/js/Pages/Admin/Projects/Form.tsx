import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { AlertTriangle, ArrowLeft, Save } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ProjectGallery } from '@/Components/Admin/ProjectGallery';
import { cn } from '@/lib/cn';
import type { ProjectFormProps, ProjectFormItem, ProjectImageItem } from '@/types/admin/project';

type FormData = Omit<ProjectFormItem, 'id' | 'slug' | 'images'>;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-medium text-ink-muted mb-1">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

function Input({
    value,
    onChange,
    placeholder,
    type = 'text',
    className,
}: {
    value: string | number | null;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
    className?: string;
}) {
    return (
        <input
            type={type}
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
                'w-full px-3 py-2 text-sm border border-ink/10 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:bg-zinc-700 dark:text-zinc-100',
                className,
            )}
        />
    );
}

function Textarea({
    value,
    onChange,
    placeholder,
    rows = 3,
}: {
    value: string | null;
    onChange: (v: string) => void;
    placeholder?: string;
    rows?: number;
}) {
    return (
        <textarea
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-3 py-2 text-sm border border-ink/10 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:bg-zinc-700 dark:text-zinc-100 resize-y"
        />
    );
}

function SectionHeader({ title, description, warning }: { title: string; description?: string; warning?: string }) {
    return (
        <div className="mb-4">
            <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-ink">{title}</h2>
                {warning && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                        <AlertTriangle size={10} />
                        {warning}
                    </span>
                )}
            </div>
            {description && <p className="text-xs text-ink-muted mt-0.5">{description}</p>}
        </div>
    );
}

function Section({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg p-5 mb-4">
            {children}
        </div>
    );
}

function BilingualRow({ children }: { children: React.ReactNode }) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

function initialData(item: ProjectFormItem | null): FormData {
    return {
        title_en:             item?.title_en             ?? '',
        title_ar:             item?.title_ar             ?? '',
        category:             item?.category             ?? 'under_development',
        listing_status:       item?.listing_status       ?? null,
        short_description_en: item?.short_description_en ?? '',
        short_description_ar: item?.short_description_ar ?? '',
        description_en:       item?.description_en       ?? '',
        description_ar:       item?.description_ar       ?? '',
        location_en:          item?.location_en          ?? '',
        location_ar:          item?.location_ar          ?? '',
        address_en:           item?.address_en           ?? '',
        address_ar:           item?.address_ar           ?? '',
        area_sqm:             item?.area_sqm             ?? null,
        completion_year:      item?.completion_year      ?? null,
        floors:               item?.floors               ?? null,
        bedrooms:             item?.bedrooms             ?? null,
        bathrooms:            item?.bathrooms            ?? null,
        featured_image_id:    item?.featured_image_id    ?? null,
        seo_title_en:         item?.seo_title_en         ?? '',
        seo_title_ar:         item?.seo_title_ar         ?? '',
        seo_description_en:   item?.seo_description_en   ?? '',
        seo_description_ar:   item?.seo_description_ar   ?? '',
        og_image_id:          item?.og_image_id          ?? null,
        is_active:            item?.is_active            ?? true,
        is_featured:          item?.is_featured          ?? false,
        sort_order:           item?.sort_order           ?? 0,
    };
}

export default function ProjectForm() {
    const { item } = usePage<ProjectFormProps>().props;
    const isEdit = item !== null;

    const [data, setData] = useState<FormData>(() => initialData(item));
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    // Gallery state lives here so the form can read og_image_id / featured_image_id
    // from the gallery's "set as OG / set as featured" buttons.
    const [images, setImages] = useState<ProjectImageItem[]>(item?.images ?? []);

    function set<K extends keyof FormData>(key: K, value: FormData[K]) {
        setData(prev => ({ ...prev, [key]: value }));
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);

        const payload = {
            ...data,
            // Send nulls for empty numeric fields so Laravel casts correctly.
            area_sqm:        data.area_sqm        || null,
            completion_year: data.completion_year || null,
            floors:          data.floors          || null,
            bedrooms:        data.bedrooms        || null,
            bathrooms:       data.bathrooms       || null,
            listing_status:  data.listing_status  || null,
        } as any;

        if (isEdit) {
            router.put(`/admin/projects/${item.id}`, payload, {
                preserveScroll: true,
                onError: (errs) => { setErrors(errs); setProcessing(false); },
                onSuccess: () => setProcessing(false),
            });
        } else {
            router.post('/admin/projects', payload, {
                onError: (errs) => { setErrors(errs); setProcessing(false); },
                onSuccess: () => setProcessing(false),
            });
        }
    }

    return (
        <AdminLayout title={isEdit ? `Edit: ${item.title_en}` : 'New Project'}>
            <Head title={isEdit ? `Edit: ${item.title_en}` : 'New Project'} />

            {/* Breadcrumb + save */}
            <div className="flex items-center justify-between mb-6">
                <Link
                    href="/admin/projects"
                    className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors"
                >
                    <ArrowLeft size={15} />
                    Projects
                </Link>
                <button
                    type="button"
                    form="project-form"
                    onClick={submit}
                    disabled={processing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-zinc-900 rounded text-sm font-medium hover:bg-primary-dark disabled:opacity-60 transition-colors"
                >
                    <Save size={15} />
                    {processing ? 'Saving…' : 'Save Changes'}
                </button>
            </div>

            <form id="project-form" onSubmit={submit}>

                {/* ── Basic Info ── */}
                <Section>
                    <SectionHeader title="Basic Info" />
                    <div className="space-y-3">
                        <BilingualRow>
                            <Field label="Title (EN)" error={errors.title_en}>
                                <Input value={data.title_en} onChange={v => set('title_en', v)} placeholder="Project title in English" />
                            </Field>
                            <Field label="Title (AR)" error={errors.title_ar}>
                                <Input value={data.title_ar} onChange={v => set('title_ar', v)} placeholder="عنوان المشروع بالعربية" />
                            </Field>
                        </BilingualRow>
                        <BilingualRow>
                            <Field label="Short Description (EN)" error={errors.short_description_en}>
                                <Textarea value={data.short_description_en} onChange={v => set('short_description_en', v)} placeholder="Brief summary…" rows={2} />
                            </Field>
                            <Field label="Short Description (AR)" error={errors.short_description_ar}>
                                <Textarea value={data.short_description_ar} onChange={v => set('short_description_ar', v)} placeholder="ملخص قصير…" rows={2} />
                            </Field>
                        </BilingualRow>
                        <BilingualRow>
                            <Field label="Description (EN)" error={errors.description_en}>
                                <Textarea value={data.description_en} onChange={v => set('description_en', v)} placeholder="Full description…" rows={5} />
                            </Field>
                            <Field label="Description (AR)" error={errors.description_ar}>
                                <Textarea value={data.description_ar} onChange={v => set('description_ar', v)} placeholder="الوصف الكامل…" rows={5} />
                            </Field>
                        </BilingualRow>
                    </div>
                </Section>

                {/* ── Listing Details ── */}
                <Section>
                    <SectionHeader title="Listing Details" />
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field label="Category" error={errors.category}>
                                <select
                                    value={data.category}
                                    onChange={e => set('category', e.target.value as FormData['category'])}
                                    className="w-full px-3 py-2 text-sm border border-ink/10 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:bg-zinc-700 dark:text-zinc-100"
                                >
                                    <option value="under_development">Under Development</option>
                                    <option value="ready">Ready</option>
                                    <option value="investment_opportunity">Investment Opportunity</option>
                                </select>
                            </Field>
                            <Field label="Listing Status" error={errors.listing_status}>
                                <select
                                    value={data.listing_status ?? ''}
                                    onChange={e => set('listing_status', (e.target.value || null) as FormData['listing_status'])}
                                    className="w-full px-3 py-2 text-sm border border-ink/10 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:bg-zinc-700 dark:text-zinc-100"
                                >
                                    <option value="">— None —</option>
                                    <option value="for_sale">For Sale</option>
                                    <option value="for_rent">For Rent</option>
                                    <option value="sold">Sold</option>
                                    <option value="reserved">Reserved</option>
                                </select>
                            </Field>
                        </div>
                        <div className="flex flex-wrap items-center gap-5">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={e => set('is_active', e.target.checked)}
                                    className="w-4 h-4 accent-primary"
                                />
                                Active (visible on site)
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_featured}
                                    onChange={e => set('is_featured', e.target.checked)}
                                    className="w-4 h-4 accent-primary"
                                />
                                Featured (shown in homepage carousel)
                            </label>
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-medium text-ink-muted">Sort Order</label>
                                <input
                                    type="number"
                                    value={data.sort_order}
                                    onChange={e => set('sort_order', parseInt(e.target.value, 10) || 0)}
                                    min={0}
                                    className="w-20 px-2 py-1.5 text-sm border border-ink/10 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:bg-zinc-700 dark:text-zinc-100"
                                />
                            </div>
                        </div>
                    </div>
                </Section>

                {/* ── Location ── */}
                <Section>
                    <SectionHeader title="Location" description="Location shows on the project card. Address shows on the detail page." />
                    <div className="space-y-3">
                        <BilingualRow>
                            <Field label="Location (EN)" error={errors.location_en}>
                                <Input value={data.location_en} onChange={v => set('location_en', v)} placeholder="Jordan - Amman" />
                            </Field>
                            <Field label="Location (AR)" error={errors.location_ar}>
                                <Input value={data.location_ar} onChange={v => set('location_ar', v)} placeholder="الأردن - عمّان" />
                            </Field>
                        </BilingualRow>
                        <BilingualRow>
                            <Field label="Address (EN)" error={errors.address_en}>
                                <Input value={data.address_en} onChange={v => set('address_en', v)} placeholder="Amman - Dabouq" />
                            </Field>
                            <Field label="Address (AR)" error={errors.address_ar}>
                                <Input value={data.address_ar} onChange={v => set('address_ar', v)} placeholder="عمّان - دابوق" />
                            </Field>
                        </BilingualRow>
                    </div>
                </Section>

                {/* ── Property Specs ── */}
                <Section>
                    <SectionHeader title="Property Specs" description="Leave blank for investment opportunities or land plots." />
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <Field label="Area (m²)" error={errors.area_sqm}>
                            <Input type="number" value={data.area_sqm} onChange={v => set('area_sqm', v ? parseInt(v, 10) : null)} placeholder="850" />
                        </Field>
                        <Field label="Floors" error={errors.floors}>
                            <Input type="number" value={data.floors} onChange={v => set('floors', v ? parseInt(v, 10) : null)} placeholder="3" />
                        </Field>
                        <Field label="Bedrooms" error={errors.bedrooms}>
                            <Input type="number" value={data.bedrooms} onChange={v => set('bedrooms', v ? parseInt(v, 10) : null)} placeholder="4" />
                        </Field>
                        <Field label="Bathrooms" error={errors.bathrooms}>
                            <Input type="number" value={data.bathrooms} onChange={v => set('bathrooms', v ? parseInt(v, 10) : null)} placeholder="5" />
                        </Field>
                        <Field label="Completion Year" error={errors.completion_year}>
                            <Input type="number" value={data.completion_year} onChange={v => set('completion_year', v ? parseInt(v, 10) : null)} placeholder="2026" />
                        </Field>
                    </div>
                </Section>

                {/* ── SEO ── */}
                <Section>
                    <SectionHeader
                        title="SEO"
                        description={isEdit ? 'OG image is picked from the gallery below.' : 'Save the project first, then upload images and set the OG image from the gallery.'}
                        warning={isEdit && !(data.seo_title_en ?? '').trim() ? 'Missing SEO title' : undefined}
                    />
                    <div className="space-y-3">
                        <BilingualRow>
                            <Field label="SEO Title (EN)" error={errors.seo_title_en}>
                                <Input value={data.seo_title_en} onChange={v => set('seo_title_en', v)} placeholder="Defaults to project title if empty" />
                            </Field>
                            <Field label="SEO Title (AR)" error={errors.seo_title_ar}>
                                <Input value={data.seo_title_ar} onChange={v => set('seo_title_ar', v)} placeholder="يرجع إلى عنوان المشروع إذا تُرك فارغاً" />
                            </Field>
                        </BilingualRow>
                        <BilingualRow>
                            <Field label="SEO Description (EN)" error={errors.seo_description_en}>
                                <Textarea value={data.seo_description_en} onChange={v => set('seo_description_en', v)} placeholder="Max 500 characters" rows={2} />
                            </Field>
                            <Field label="SEO Description (AR)" error={errors.seo_description_ar}>
                                <Textarea value={data.seo_description_ar} onChange={v => set('seo_description_ar', v)} placeholder="حد أقصى 500 حرف" rows={2} />
                            </Field>
                        </BilingualRow>

                        {isEdit && data.og_image_id && (
                            <div className="flex items-center gap-3 pt-1">
                                <span className="text-xs text-ink-muted">OG Image:</span>
                                <img
                                    src={images.find(img => img.media.id === data.og_image_id)?.media.url ?? ''}
                                    alt="OG"
                                    className="w-16 h-10 object-cover rounded border border-ink/10"
                                />
                                <button
                                    type="button"
                                    onClick={() => set('og_image_id', null)}
                                    className="text-xs text-red-500 hover:underline"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>
                </Section>

            </form>{/* form closes before gallery — gallery uses fetch, not form submit */}

            {/* ── Gallery (edit only) ── */}
            {isEdit && (
                <Section>
                    <SectionHeader
                        title="Gallery"
                        description="Drag to reorder. First image is the card thumbnail. Set one as OG to use it for social sharing previews."
                        warning={images.length === 0 ? 'No images uploaded' : undefined}
                    />
                    <ProjectGallery
                        projectId={item.id}
                        images={images}
                        featuredImageId={data.featured_image_id}
                        ogImageId={data.og_image_id}
                        onImagesChange={setImages}
                        onFeaturedChange={id => set('featured_image_id', id)}
                        onOgChange={id => set('og_image_id', id)}
                    />
                    {images.length > 0 && (
                        <p className="mt-3 text-xs text-ink-muted">
                            Changes to featured image and OG image are saved with the{' '}
                            <button
                                type="button"
                                onClick={submit}
                                className="text-primary hover:underline"
                            >
                                Save Changes
                            </button>{' '}
                            button above.
                        </p>
                    )}
                </Section>
            )}

            {/* Bottom save */}
            <div className="flex justify-end mt-2 mb-8">
                <button
                    type="button"
                    onClick={submit}
                    disabled={processing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-zinc-900 rounded text-sm font-medium hover:bg-primary-dark disabled:opacity-60 transition-colors"
                >
                    <Save size={15} />
                    {processing ? 'Saving…' : 'Save Changes'}
                </button>
            </div>
        </AdminLayout>
    );
}
