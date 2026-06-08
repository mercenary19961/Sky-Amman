import { Head, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Trash2, Eye, EyeOff } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ConfirmDeleteButton } from '@/Components/Admin/ConfirmDeleteButton';
import { cn } from '@/lib/cn';

interface GalleryItem {
    id: string;                    // stable pool key (img-… / slug-… / gal-…)
    url: string;
    source: 'project' | 'editor';
    label: string;
    gallery_id: number | null;     // only editor uploads can be deleted
    hidden: boolean;
}

interface GalleryProps {
    images: GalleryItem[];
    soldCount: number;
    settings: { enabled: boolean; count: number };
    [key: string]: unknown;
}

export default function GalleryIndex() {
    const { images, soldCount, settings } = usePage<GalleryProps>().props;
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

    const toggle = (item: GalleryItem) =>
        router.post('/admin/gallery/toggle', { id: item.id }, { preserveScroll: true });
    const remove = (item: GalleryItem) =>
        router.delete(`/admin/gallery/${item.gallery_id}`, { preserveScroll: true });

    const visibleCount = images.filter((i) => !i.hidden).length;

    return (
        <AdminLayout title="Projects Gallery">
            <Head title="Projects Gallery" />

            <div className="max-w-5xl">
                <p className="mb-4 max-w-2xl text-sm text-ink-muted">
                    The public “Projects Gallery” on the Properties page shows images from your{' '}
                    <strong className="text-ink dark:text-zinc-200">{soldCount} sold project{soldCount === 1 ? '' : 's'}</strong>{' '}
                    plus any images you upload. Hide individual images with the eye toggle; the order is shuffled on every
                    visit and visitors page through them with the arrows.{' '}
                    <span className="text-ink-muted">{visibleCount} shown · {images.length} total</span>
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

                {images.length === 0 ? (
                    <p className="text-sm text-ink-muted">No gallery images yet. Mark a project as sold or upload images above.</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((item) => (
                            <GalleryCard key={item.id} item={item} onToggle={() => toggle(item)} onDelete={() => remove(item)} />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function GalleryCard({ item, onToggle, onDelete }: { item: GalleryItem; onToggle: () => void; onDelete: () => void }) {
    return (
        <div
            className={cn(
                'group relative aspect-square overflow-hidden rounded-lg border border-ink/5 dark:border-white/10 bg-surface-muted',
                item.hidden && 'opacity-50',
            )}
        >
            <img src={item.url} alt="" className="h-full w-full object-cover" />

            {/* Source badge */}
            <span
                className={cn(
                    'absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[10px] font-medium',
                    item.source === 'project' ? 'bg-primary/90 text-white' : 'bg-zinc-700/80 text-zinc-100',
                )}
            >
                {item.source === 'project' ? item.label : 'Uploaded'}
            </span>

            {/* Hidden marker */}
            {item.hidden && (
                <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Hidden
                </span>
            )}

            {/* Controls */}
            <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                <button
                    type="button"
                    onClick={onToggle}
                    title={item.hidden ? 'Hidden — click to show' : 'Shown — click to hide'}
                    className="rounded bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
                >
                    {item.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                {item.source === 'editor' && (
                    <ConfirmDeleteButton
                        onConfirm={onDelete}
                        className="rounded bg-black/50 p-1.5 text-white transition-colors hover:bg-red-500"
                        title="Delete image"
                        heading="Delete this image?"
                        description="This uploaded image will be permanently removed from the gallery."
                    >
                        <Trash2 size={14} />
                    </ConfirmDeleteButton>
                )}
            </div>
        </div>
    );
}
