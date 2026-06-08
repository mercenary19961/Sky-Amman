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
    [key: string]: unknown;
}

export default function GalleryIndex() {
    const { images, soldCount } = usePage<GalleryProps>().props;

    const [items, setItems] = useState<GalleryItem[]>(images);
    useEffect(() => setItems(images), [images]);
    const [uploading, setUploading] = useState(false);

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
                    plus any images you add below. The displayed set is shuffled on every visit, so it changes on each refresh.
                </p>

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
