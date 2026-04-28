import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Star, ImageIcon, Trash2, Upload } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ProjectImageItem } from '@/types/admin/project';

interface UploadingFile {
    key: string;
    filename: string;
    progress: number;
    error: string | null;
}

interface ProjectGalleryProps {
    projectId: number;
    images: ProjectImageItem[];
    featuredImageId: number | null;
    ogImageId: number | null;
    onImagesChange: (images: ProjectImageItem[]) => void;
    onFeaturedChange: (id: number | null) => void;
    onOgChange: (id: number | null) => void;
}

function SortableImage({
    image,
    isFeatured,
    isOg,
    onSetFeatured,
    onSetOg,
    onDelete,
}: {
    image: ProjectImageItem;
    isFeatured: boolean;
    isOg: boolean;
    onSetFeatured: () => void;
    onSetOg: () => void;
    onDelete: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: image.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const [confirmDelete, setConfirmDelete] = useState(false);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group relative bg-surface-muted rounded-lg overflow-hidden border-2 transition-all',
                isDragging ? 'opacity-50 scale-95 border-primary' : 'border-transparent',
                isFeatured && 'ring-2 ring-primary',
            )}
        >
            <div className="aspect-4/3">
                <img
                    src={image.media.url}
                    alt={image.media.alt_text_en ?? image.media.original_filename}
                    className="w-full h-full object-cover"
                    draggable={false}
                />
            </div>

            {/* Drag handle */}
            <button
                type="button"
                {...attributes}
                {...listeners}
                className="absolute top-1.5 left-1.5 p-1 rounded bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                title="Drag to reorder"
            >
                <GripVertical size={14} />
            </button>

            {/* Badges */}
            <div className="absolute top-1.5 right-1.5 flex flex-col gap-1">
                {isFeatured && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary text-white">
                        Featured
                    </span>
                )}
                {isOg && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500 text-white">
                        OG
                    </span>
                )}
            </div>

            {/* Action bar */}
            <div className="absolute inset-x-0 bottom-0 bg-black/60 flex items-center justify-around py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    type="button"
                    onClick={onSetFeatured}
                    title={isFeatured ? 'Featured image' : 'Set as featured'}
                    className={cn(
                        'p-1.5 rounded transition-colors',
                        isFeatured ? 'text-primary' : 'text-white hover:text-primary',
                    )}
                >
                    <Star size={13} fill={isFeatured ? 'currentColor' : 'none'} />
                </button>

                <button
                    type="button"
                    onClick={onSetOg}
                    title={isOg ? 'OG image' : 'Set as OG image'}
                    className={cn(
                        'p-1.5 rounded transition-colors',
                        isOg ? 'text-amber-400' : 'text-white hover:text-amber-400',
                    )}
                >
                    <ImageIcon size={13} />
                </button>

                {confirmDelete ? (
                    <span className="flex items-center gap-1 text-[10px]">
                        <button
                            type="button"
                            onClick={onDelete}
                            className="text-red-400 font-medium hover:text-red-300"
                        >
                            Delete
                        </button>
                        <span className="text-white/50">/</span>
                        <button
                            type="button"
                            onClick={() => setConfirmDelete(false)}
                            className="text-white/70 hover:text-white"
                        >
                            Keep
                        </button>
                    </span>
                ) : (
                    <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="p-1.5 rounded text-white hover:text-red-400 transition-colors"
                        title="Delete image"
                    >
                        <Trash2 size={13} />
                    </button>
                )}
            </div>
        </div>
    );
}

export function ProjectGallery({
    projectId,
    images,
    featuredImageId,
    ogImageId,
    onImagesChange,
    onFeaturedChange,
    onOgChange,
}: ProjectGalleryProps) {
    const [uploading, setUploading] = useState<UploadingFile[]>([]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const uploadFile = useCallback(async (file: File) => {
        const key = `${Date.now()}-${file.name}`;

        setUploading(prev => [...prev, { key, filename: file.name, progress: 0, error: null }]);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await (window as any).axios.post(
                `/admin/projects/${projectId}/images`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (e: ProgressEvent) => {
                        const pct = Math.round((e.loaded * 100) / (e.total ?? 1));
                        setUploading(prev =>
                            prev.map(u => u.key === key ? { ...u, progress: pct } : u),
                        );
                    },
                },
            );

            onImagesChange([...images, response.data as ProjectImageItem]);
            setUploading(prev => prev.filter(u => u.key !== key));
        } catch {
            setUploading(prev =>
                prev.map(u => u.key === key ? { ...u, error: 'Upload failed. Try again.' } : u),
            );
        }
    }, [projectId, onImagesChange]);

    const onDrop = useCallback((accepted: File[]) => {
        accepted.forEach(uploadFile);
    }, [uploadFile]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
        maxSize: 10 * 1024 * 1024,
        multiple: true,
    });

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = images.findIndex(img => img.id === active.id);
        const newIndex = images.findIndex(img => img.id === over.id);
        const reordered = arrayMove(images, oldIndex, newIndex).map((img, i) => ({
            ...img,
            sort_order: i,
        }));

        onImagesChange(reordered);

        // Persist order to backend (fire-and-forget).
        (window as any).axios.post(`/admin/projects/${projectId}/images/reorder`, {
            ids: reordered.map(img => img.id),
        }).catch(() => {
            // Revert on failure — re-fetch or show toast. For now just log.
            console.error('Reorder failed');
        });
    }

    function deleteImage(imageId: number) {
        (window as any).axios.delete(`/admin/projects/${projectId}/images/${imageId}`)
            .then(() => {
                const updated = images.filter(img => img.id !== imageId);
                onImagesChange(updated);
                if (featuredImageId === images.find(img => img.id === imageId)?.media.id) {
                    onFeaturedChange(updated[0]?.media.id ?? null);
                }
                if (ogImageId === images.find(img => img.id === imageId)?.media.id) {
                    onOgChange(null);
                }
            })
            .catch(() => console.error('Delete failed'));
    }

    return (
        <div>
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={cn(
                    'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                    isDragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-ink/15 hover:border-primary/40 hover:bg-surface-muted',
                )}
            >
                <input {...getInputProps()} />
                <Upload size={20} className="mx-auto mb-2 text-ink-muted" />
                <p className="text-sm text-ink-muted">
                    {isDragActive ? 'Drop images here…' : 'Drag & drop images, or click to browse'}
                </p>
                <p className="text-xs text-ink/40 mt-1">JPEG, PNG, WebP — max 10 MB each</p>
            </div>

            {/* Uploading queue */}
            {uploading.length > 0 && (
                <div className="mt-3 space-y-2">
                    {uploading.map(u => (
                        <div key={u.key} className="flex items-center gap-3 text-sm">
                            <span className="truncate text-ink-muted flex-1">{u.filename}</span>
                            {u.error ? (
                                <span className="text-red-500 text-xs">{u.error}</span>
                            ) : (
                                <div className="w-32 h-1.5 bg-ink/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-150"
                                        style={{ width: `${u.progress}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Sortable grid */}
            {images.length > 0 && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={images.map(img => img.id)} strategy={rectSortingStrategy}>
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {images.map(image => (
                                <SortableImage
                                    key={image.id}
                                    image={image}
                                    isFeatured={featuredImageId === image.media.id}
                                    isOg={ogImageId === image.media.id}
                                    onSetFeatured={() => onFeaturedChange(
                                        featuredImageId === image.media.id ? null : image.media.id,
                                    )}
                                    onSetOg={() => onOgChange(
                                        ogImageId === image.media.id ? null : image.media.id,
                                    )}
                                    onDelete={() => deleteImage(image.id)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}
