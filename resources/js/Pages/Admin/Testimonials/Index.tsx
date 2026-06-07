import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash2, Pencil, GripVertical, Quote, Eye, EyeOff, X, User as UserIcon, ImagePlus } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ConfirmDeleteButton } from '@/Components/Admin/ConfirmDeleteButton';
import { cn } from '@/lib/cn';

interface TestimonialItem {
    id: number;
    name_en: string;
    name_ar: string | null;
    quote_en: string;
    quote_ar: string | null;
    sort_order: number;
    is_active: boolean;
    image_url: string | null;
}

interface TestimonialsProps {
    testimonials: TestimonialItem[];
    [key: string]: unknown;
}

type EditingState = TestimonialItem | 'new' | null;

// Keep in sync with TestimonialController::validateData (server-side max).
const NAME_MAX = 80;
const QUOTE_MAX = 200;

/** Field label with a live "used / max" counter that warns as it fills up. */
function LabelWithCount({ label, value, max }: { label: string; value: string; max: number }) {
    const len = value.length;
    return (
        <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-xs font-medium text-ink-muted">{label}</label>
            <span
                className={cn(
                    'text-[11px] tabular-nums',
                    len >= max ? 'text-red-500 font-medium' : len >= max * 0.85 ? 'text-amber-500' : 'text-ink-muted',
                )}
            >
                {len}/{max}
            </span>
        </div>
    );
}

export default function TestimonialsIndex() {
    const { testimonials } = usePage<TestimonialsProps>().props;

    // Order/list mirror for optimistic drag reordering.
    const [items, setItems] = useState<TestimonialItem[]>(testimonials);
    useEffect(() => setItems(testimonials), [testimonials]);

    const [editing, setEditing] = useState<EditingState>(null);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex((v) => v.id === active.id);
        const newIndex = items.findIndex((v) => v.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        setItems(reordered);
        router.post(
            '/admin/testimonials/reorder',
            { ids: reordered.map((v) => v.id) },
            { preserveScroll: true, preserveState: true },
        );
    };

    const toggle = (t: TestimonialItem) =>
        router.post(`/admin/testimonials/${t.id}/toggle`, {}, { preserveScroll: true });
    const remove = (t: TestimonialItem) =>
        router.delete(`/admin/testimonials/${t.id}`, { preserveScroll: true });

    const activeCount = items.filter((t) => t.is_active).length;

    return (
        <AdminLayout title="Testimonials">
            <Head title="Testimonials" />

            <div className="max-w-5xl">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <p className="text-sm text-ink-muted max-w-xl">
                        Client testimonials shown in the homepage carousel below the testimonial videos. Each has a
                        photo and a bilingual name + quote. Add as many as you like — the homepage shows every{' '}
                        <strong className="text-ink dark:text-zinc-200">Showing</strong> one and lets visitors page
                        through them with the arrows. Drag the handle to reorder.
                        <span className="block mt-1 text-ink-muted">
                            {activeCount} showing · {items.length} total
                        </span>
                    </p>
                    <button
                        type="button"
                        onClick={() => setEditing('new')}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary-strong px-4 py-2 text-sm font-medium text-white hover:bg-primary-strong-hover transition-colors shrink-0"
                    >
                        <Plus size={16} /> Add testimonial
                    </button>
                </div>

                {items.length === 0 ? (
                    <button
                        type="button"
                        onClick={() => setEditing('new')}
                        className="w-full rounded-lg border-2 border-dashed border-ink/15 dark:border-white/15 p-12 text-center text-ink-muted hover:border-primary/40 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                        <Quote size={28} className="mx-auto mb-2 opacity-60" />
                        <div className="text-sm">No testimonials yet — add your first one</div>
                    </button>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={items.map((v) => v.id)} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {items.map((t) => (
                                    <SortableCard
                                        key={t.id}
                                        item={t}
                                        onToggle={() => toggle(t)}
                                        onEdit={() => setEditing(t)}
                                        onDelete={() => remove(t)}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>

            <FormDrawer editing={editing} onClose={() => setEditing(null)} />
        </AdminLayout>
    );
}

function Avatar({ url, name, className }: { url: string | null; name: string; className?: string }) {
    if (url) {
        return <img src={url} alt={name} draggable={false} className={cn('object-cover', className)} />;
    }
    return (
        <div className={cn('grid place-items-center bg-primary/15 text-primary', className)}>
            <UserIcon size={22} />
        </div>
    );
}

function SortableCard({
    item,
    onToggle,
    onEdit,
    onDelete,
}: {
    item: TestimonialItem;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group relative rounded-lg overflow-hidden border bg-white dark:bg-zinc-800 transition-all',
                item.is_active ? 'border-ink/5 dark:border-white/10' : 'border-ink/5 dark:border-white/10 opacity-70',
                isDragging && 'opacity-60 scale-95 z-10',
            )}
        >
            <div className="p-4 flex items-start gap-3">
                <Avatar url={item.image_url} name={item.name_en} className="h-14 w-14 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate text-ink dark:text-zinc-100">{item.name_en}</div>
                    <p className="mt-0.5 text-xs text-ink-muted line-clamp-3">{item.quote_en}</p>
                </div>

                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    aria-label="Drag to reorder"
                    className="p-1 rounded text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:bg-black/5 dark:hover:bg-white/5"
                >
                    <GripVertical size={14} />
                </button>
            </div>

            <div className="px-4 pb-3 flex items-center justify-between gap-2 border-t border-ink/5 dark:border-white/10 pt-2.5">
                <span
                    className={cn(
                        'inline-flex items-center gap-1.5 text-xs font-medium',
                        item.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-muted',
                    )}
                >
                    <span className={cn('w-1.5 h-1.5 rounded-full', item.is_active ? 'bg-emerald-500' : 'bg-zinc-400')} />
                    {item.is_active ? 'Showing' : 'Hidden'}
                </span>

                <div className="flex items-center gap-0.5">
                    <button
                        type="button"
                        onClick={onToggle}
                        title={item.is_active ? 'Showing — click to hide' : 'Hidden — click to show'}
                        className="p-1.5 rounded text-ink-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-ink dark:hover:text-zinc-100 transition-colors"
                    >
                        {item.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                    <button
                        type="button"
                        onClick={onEdit}
                        title="Edit"
                        className="p-1.5 rounded text-ink-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-primary transition-colors"
                    >
                        <Pencil size={15} />
                    </button>
                    <ConfirmDeleteButton
                        onConfirm={onDelete}
                        title="Delete"
                        className="p-1.5 rounded text-ink-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        heading="Delete this testimonial?"
                        itemLabel={item.name_en}
                        description="This testimonial will be permanently removed from the homepage."
                    >
                        <Trash2 size={15} />
                    </ConfirmDeleteButton>
                </div>
            </div>
        </div>
    );
}

function FormDrawer({ editing, onClose }: { editing: EditingState; onClose: () => void }) {
    const open = editing !== null;
    const isNew = editing === 'new';
    const item = editing && editing !== 'new' ? editing : null;

    const [nameEn, setNameEn] = useState('');
    const [nameAr, setNameAr] = useState('');
    const [quoteEn, setQuoteEn] = useState('');
    const [quoteAr, setQuoteAr] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setNameEn(item?.name_en ?? '');
        setNameAr(item?.name_ar ?? '');
        setQuoteEn(item?.quote_en ?? '');
        setQuoteAr(item?.quote_ar ?? '');
        setFile(null);
        setPreview(item?.image_url ?? null);
        if (fileRef.current) fileRef.current.value = '';
    }, [editing]); // eslint-disable-line react-hooks/exhaustive-deps

    const onPickFile = (f: File | null) => {
        setFile(f);
        setPreview(f ? URL.createObjectURL(f) : item?.image_url ?? null);
    };

    // A testimonial needs a photo, a name, and a quote. Name/quote each only need
    // ONE language — the public card falls back to the filled one for the other.
    const hasPhoto = !!file || !!preview;
    const hasName = nameEn.trim() !== '' || nameAr.trim() !== '';
    const hasQuote = quoteEn.trim() !== '' || quoteAr.trim() !== '';
    const canSubmit = hasPhoto && hasName && hasQuote && !processing;

    const missing = [
        !hasPhoto && 'a photo',
        !hasName && 'a name',
        !hasQuote && 'a quote',
    ].filter(Boolean) as string[];

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setProcessing(true);

        const data: Record<string, string | File> = {
            name_en: nameEn,
            name_ar: nameAr,
            quote_en: quoteEn,
            quote_ar: quoteAr,
        };
        if (file) data.image = file;

        const opts = {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: onClose,
            onFinish: () => setProcessing(false),
        };

        if (isNew) {
            router.post('/admin/testimonials', data, opts);
        } else if (item) {
            // Multipart can't use PUT directly — spoof the method.
            router.post(`/admin/testimonials/${item.id}`, { ...data, _method: 'put' }, opts);
        }
    };

    const inputCls =
        'w-full rounded-md border border-ink/15 dark:border-white/15 bg-white dark:bg-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40';

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.aside
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-zinc-800 border-s border-ink/5 dark:border-white/10 shadow-xl flex flex-col"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
                    >
                        <div className="h-16 flex items-center justify-between px-5 border-b border-ink/5 dark:border-white/10">
                            <h2 className="font-semibold text-ink dark:text-zinc-100">
                                {isNew ? 'Add testimonial' : 'Edit testimonial'}
                            </h2>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-1.5 rounded text-ink-muted hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={submit} className="flex-1 overflow-y-auto p-5 space-y-5">
                            {/* Photo */}
                            <div>
                                <label className="block text-xs font-medium text-ink-muted mb-1.5">
                                    Photo <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-4">
                                    <Avatar
                                        url={preview}
                                        name={nameEn || 'Testimonial'}
                                        className="h-20 w-20 shrink-0 rounded-full border border-ink/10 dark:border-white/10"
                                    />
                                    <div className="flex flex-col gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => fileRef.current?.click()}
                                            className="inline-flex items-center gap-1.5 rounded-md border border-ink/15 dark:border-white/15 px-3 py-1.5 text-sm text-ink dark:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <ImagePlus size={15} /> {preview ? 'Change photo' : 'Upload photo'}
                                        </button>
                                        <span className="text-[11px] text-ink-muted">JPG, PNG or WebP · max 10MB</span>
                                    </div>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                                    />
                                </div>
                            </div>

                            <div className="-mb-2 flex items-center gap-1.5 text-xs font-medium text-ink-muted">
                                Name <span className="text-red-500">*</span>
                                <span className="font-normal text-[11px] text-ink-muted/80">— at least one language</span>
                            </div>
                            <div>
                                <LabelWithCount label="Name (EN)" value={nameEn} max={NAME_MAX} />
                                <input
                                    type="text"
                                    value={nameEn}
                                    onChange={(e) => setNameEn(e.target.value)}
                                    maxLength={NAME_MAX}
                                    autoFocus
                                    placeholder="e.g. Ahmad Al-Masri"
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <LabelWithCount label="Name (AR)" value={nameAr} max={NAME_MAX} />
                                <input
                                    type="text"
                                    value={nameAr}
                                    onChange={(e) => setNameAr(e.target.value)}
                                    maxLength={NAME_MAX}
                                    dir="rtl"
                                    placeholder="اسم العميل"
                                    className={inputCls}
                                />
                            </div>
                            <div className="-mb-2 flex items-center gap-1.5 text-xs font-medium text-ink-muted">
                                Quote <span className="text-red-500">*</span>
                                <span className="font-normal text-[11px] text-ink-muted/80">— at least one language</span>
                            </div>
                            <div>
                                <LabelWithCount label="Quote (EN)" value={quoteEn} max={QUOTE_MAX} />
                                <textarea
                                    value={quoteEn}
                                    onChange={(e) => setQuoteEn(e.target.value)}
                                    maxLength={QUOTE_MAX}
                                    rows={3}
                                    placeholder="What the client said…"
                                    className={cn(inputCls, 'resize-y')}
                                />
                                <p className="mt-1 text-[11px] text-ink-muted">
                                    Keep it short — one or two sentences read best on the card. If you fill only one
                                    language, it&rsquo;s shown for both on the site.
                                </p>
                            </div>
                            <div>
                                <LabelWithCount label="Quote (AR)" value={quoteAr} max={QUOTE_MAX} />
                                <textarea
                                    value={quoteAr}
                                    onChange={(e) => setQuoteAr(e.target.value)}
                                    maxLength={QUOTE_MAX}
                                    rows={3}
                                    dir="rtl"
                                    placeholder="ما قاله العميل…"
                                    className={cn(inputCls, 'resize-y')}
                                />
                            </div>

                            <p className="text-xs text-ink-muted">
                                New testimonials are shown on the homepage right away. Use the eye toggle on the card to
                                hide one without deleting it.
                            </p>

                            {missing.length > 0 && (
                                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                    Add {missing.join(', ')} to continue.
                                </p>
                            )}
                        </form>

                        <div className="p-5 border-t border-ink/5 dark:border-white/10 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm rounded-md text-ink-muted hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={submit}
                                disabled={!canSubmit}
                                className="px-4 py-2 text-sm font-medium rounded-md bg-primary-strong text-white hover:bg-primary-strong-hover transition-colors disabled:opacity-50"
                            >
                                {isNew ? 'Add' : 'Save'}
                            </button>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
