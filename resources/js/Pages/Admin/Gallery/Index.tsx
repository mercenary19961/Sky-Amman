import { Head, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
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
import { Upload, Trash2, GripVertical } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ConfirmDeleteButton } from '@/Components/Admin/ConfirmDeleteButton';
import { cn } from '@/lib/cn';

interface GalleryItem {
    id: number;
    image_url: string | null;
}

interface GalleryProps {
    images: GalleryItem[];
    soldCount: number;
    settings: { enabled: boolean; count: number };
    [key: string]: unknown;
}

export default function GalleryIndex() {
    const { images, soldCount, settings } = usePage<GalleryProps>().props;

    const [items, setItems] = useState<GalleryItem[]>(images);
    useEffect(() => setItems(images), [images]);
    const [uploading, setUploading] = useState(false);

    // Display settings (per-view count + show/hide the whole section).
    const [count, setCount] = useState(settings.count);
    const [enabled, setEnabled] = useState(settings.enabled);
    const [savingSettings, setSavingSettings] = useState(false);
    useEffect(() => { setCount(settings.count); setEnabled(settings.enabled); }, [settings.count, settings.enabled]);
    const settingsDirty = count !== settings.count || enabled !== settings.enabled;

    const saveSettings = () => {
        if (!settingsDirty || savingSettings) return;
        setSavingSettings(true);
        router.post('/admin/gallery/settings', { count, enabled }, {
            preserveScroll: true,
            onFinish: () => setSavingSettings(false),
        });
    };

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const onDrop = useCallback((accepted: File[]) => {
        if (accepted.length === 0 || uploading) return;
        setUploading(true);
        router.post('/admin/gallery', { images: accepted }, {
            preserveScroll: true,
            forceFormData: true,
            onFinish: () => setUploading(false),
        });
    }, [uploading]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
        disabled: uploading,
    });

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex((v) => v.id === active.id);
        const newIndex = items.findIndex((v) => v.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        setItems(reordered);
        router.post('/admin/gallery/reorder', { ids: reordered.map((v) => v.id) }, { preserveScroll: true, preserveState: true });
    };

    const remove = (item: GalleryItem) => router.delete(`/admin/gallery/${item.id}`, { preserveScroll: true });

    return (
        <AdminLayout title="Projects Gallery">
            <Head title="Projects Gallery" />

            <div className="max-w-5xl">
                <p className="mb-4 max-w-2xl text-sm text-ink-muted">
                    The public “Projects Gallery” on the Properties page automatically shows images from your{' '}
                    <strong className="text-ink dark:text-zinc-200">{soldCount} sold project{soldCount === 1 ? '' : 's'}</strong>,
                    plus any images you add below. The order is shuffled on every visit, and visitors can page through
                    them with the arrows.
                </p>

                {/* Display settings */}
                <div className="mb-6 flex flex-wrap items-end gap-4 rounded-lg border border-ink/5 dark:border-white/10 bg-white dark:bg-zinc-800 p-4">
                    <label className="flex items-center gap-2 text-sm text-ink dark:text-zinc-100">
                        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-4 w-4 accent-primary" />
                        Show gallery section
                    </label>
                    <div>
                        <label className="block text-xs font-medium text-ink-muted mb-1">Tiles shown per view</label>
                        <input
                            type="number"
                            min={1}
                            max={24}
                            value={count}
                            onChange={(e) => setCount(Math.min(24, Math.max(1, parseInt(e.target.value || '1', 10))))}
                            className="w-24 rounded-md border border-ink/15 dark:border-white/15 bg-white dark:bg-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={saveSettings}
                        disabled={!settingsDirty || savingSettings}
                        className={cn(
                            'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                            settingsDirty && !savingSettings
                                ? 'bg-primary-strong text-white hover:bg-primary-strong-hover'
                                : 'bg-ink/5 dark:bg-white/10 text-ink-muted cursor-not-allowed',
                        )}
                    >
                        {savingSettings ? 'Saving…' : 'Save settings'}
                    </button>
                    <p className="w-full text-[11px] text-ink-muted">
                        On desktop up to this many tiles show at once; on smaller screens it auto-reduces. Extra images
                        page in with the arrows.
                    </p>
                </div>

                {/* Dropzone */}
                <div
                    {...getRootProps()}
                    className={cn(
                        'mb-6 cursor-pointer rounded-lg border-2 border-dashed p-10 text-center transition-colors',
                        isDragActive ? 'border-primary bg-primary/5' : 'border-ink/15 dark:border-white/15 hover:border-primary/40 hover:bg-black/5 dark:hover:bg-white/5',
                        uploading && 'opacity-60 cursor-wait',
                    )}
                >
                    <input {...getInputProps()} />
                    <Upload size={26} className="mx-auto mb-2 text-ink-muted" />
                    <div className="text-sm text-ink dark:text-zinc-100">
                        {uploading ? 'Uploading…' : isDragActive ? 'Drop the images here' : 'Drag & drop images, or click to browse'}
                    </div>
                    <div className="mt-1 text-xs text-ink-muted">JPEG, PNG, WebP — max 10 MB each</div>
                    <div className="mt-0.5 text-[11px] text-ink-muted">Square or portrait images (e.g. ~1200×1200) look best — tiles are cropped to fit.</div>
                </div>

                {items.length === 0 ? (
                    <p className="text-sm text-ink-muted">No curated images yet. Sold-project images still appear automatically.</p>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={items.map((v) => v.id)} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {items.map((item) => (
                                    <GalleryCard key={item.id} item={item} onDelete={() => remove(item)} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </AdminLayout>
    );
}

function GalleryCard({ item, onDelete }: { item: GalleryItem; onDelete: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group relative aspect-square overflow-hidden rounded-lg border border-ink/5 dark:border-white/10 bg-surface-muted',
                isDragging && 'opacity-60 scale-95 z-10',
            )}
        >
            {item.image_url && <img src={item.image_url} alt="" className="h-full w-full object-cover" />}

            {/* Drag handle */}
            <button
                type="button"
                {...attributes}
                {...listeners}
                aria-label="Drag to reorder"
                className="absolute top-1.5 left-1.5 rounded bg-black/50 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            >
                <GripVertical size={14} />
            </button>

            {/* Delete */}
            <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <ConfirmDeleteButton
                    onConfirm={onDelete}
                    className="rounded bg-black/50 p-1 text-white hover:bg-red-500"
                    title="Remove image"
                    heading="Remove this image?"
                    description="It will be removed from the projects gallery."
                >
                    <Trash2 size={14} />
                </ConfirmDeleteButton>
            </div>
        </div>
    );
}
