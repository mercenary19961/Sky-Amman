import { Head, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
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
    size_bytes: number | null;
    mime_type: string | null;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mimeLabel(mime: string): string {
    const map: Record<string, string> = {
        'image/jpeg': 'JPEG',
        'image/png': 'PNG',
        'image/webp': 'WebP',
        'image/gif': 'GIF',
        'image/svg+xml': 'SVG',
    };
    return map[mime] ?? mime.split('/')[1]?.toUpperCase() ?? 'Image';
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

    const projectImages = images.filter((i) => i.source === 'project');
    const editorImages = images.filter((i) => i.source === 'editor');

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

    return (
        <AdminLayout title="Projects Gallery">
            <Head title="Projects Gallery" />

            <div className="flex flex-col gap-6 lg:flex-row">
                {/* ── Left: intro + options + upload + uploaded images ── */}
                <div className="lg:w-2/5 space-y-6">
                    <p className="text-sm text-ink-muted">
                        The public “Projects Gallery” on the Properties page shows images from your{' '}
                        <strong className="text-ink dark:text-zinc-200">{soldCount} sold project{soldCount === 1 ? '' : 's'}</strong>{' '}
                        plus the images you upload here. Hide individual images with the eye toggle; the order is shuffled
                        on every visit and visitors page through them with the arrows.
                    </p>

                    {/* Display settings */}
                    <div className="rounded-lg border border-ink/5 dark:border-white/10 bg-white dark:bg-zinc-800 p-4">
                        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">Display options</h2>
                        <div className="flex flex-wrap items-end gap-4">
                            <label className="flex items-center gap-2 text-sm text-ink dark:text-zinc-100">
                                <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-4 w-4 accent-primary" />
                                Show gallery section
                            </label>
                            <div>
                                <label className="block text-xs font-medium text-ink-muted mb-1">Tiles per view</label>
                                <input
                                    type="number"
                                    min={4}
                                    max={6}
                                    value={count}
                                    onChange={(e) => setCount(Math.min(6, Math.max(4, parseInt(e.target.value || '4', 10))))}
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
                                {savingSettings ? 'Saving…' : 'Save'}
                            </button>
                        </div>
                        <p className="mt-2 text-[11px] text-ink-muted">
                            On desktop up to this many tiles show at once; smaller screens auto-reduce. Extra images page
                            in with the arrows. Min 4, max 6.
                        </p>
                    </div>

                    {/* Dropzone */}
                    <div
                        {...getRootProps()}
                        className={cn(
                            'cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
                            isDragActive ? 'border-primary bg-primary/5' : 'border-ink/15 dark:border-white/15 hover:border-primary/40 hover:bg-black/5 dark:hover:bg-white/5',
                            uploading && 'opacity-60 cursor-wait',
                        )}
                    >
                        <input {...getInputProps()} />
                        <Upload size={24} className="mx-auto mb-2 text-ink-muted" />
                        <div className="text-sm text-ink dark:text-zinc-100">
                            {uploading ? 'Uploading…' : isDragActive ? 'Drop the images here' : 'Drag & drop images, or click to browse'}
                        </div>
                        <div className="mt-1 text-xs text-ink-muted">JPEG, PNG, WebP — max 10 MB each</div>
                        <div className="mt-0.5 text-[11px] text-ink-muted">Square or portrait (e.g. ~1200×1200) look best — tiles are cropped to fit.</div>
                    </div>

                    {/* Uploaded images */}
                    <GallerySection
                        title="Your uploads"
                        items={editorImages}
                        perPage={6}
                        columnsClass="grid-cols-2"
                        emptyText="No uploads yet — drop images above."
                        onToggle={toggle}
                        onDelete={remove}
                    />
                </div>

                {/* ── Right: sold-project images ── */}
                <div className="lg:w-3/5">
                    <GallerySection
                        title="From sold projects"
                        icon={Building2}
                        items={projectImages}
                        perPage={9}
                        columnsClass="grid-cols-2 sm:grid-cols-3"
                        emptyText="No sold projects with images yet."
                        onToggle={toggle}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}

/** A titled image grid with simple client-side pagination. */
function GallerySection({
    title, icon: Icon, items, perPage, columnsClass, emptyText, onToggle, onDelete,
}: {
    title: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    items: GalleryItem[];
    perPage: number;
    columnsClass: string;
    emptyText: string;
    onToggle: (item: GalleryItem) => void;
    onDelete?: (item: GalleryItem) => void;
}) {
    const [page, setPage] = useState(1);
    const pages = Math.max(1, Math.ceil(items.length / perPage));
    useEffect(() => { if (page > pages) setPage(1); }, [pages, page]);

    const start = (page - 1) * perPage;
    const shown = items.slice(start, start + perPage);
    const hiddenCount = items.filter((i) => i.hidden).length;

    return (
        <div>
            <div className="mb-3 flex items-center gap-2">
                {Icon && <Icon size={15} className="text-ink-muted" />}
                <h2 className="text-sm font-semibold text-ink dark:text-zinc-100">{title}</h2>
                <span className="text-xs text-ink-muted">
                    {items.length}{hiddenCount > 0 ? ` · ${hiddenCount} hidden` : ''}
                </span>
            </div>

            {items.length === 0 ? (
                <p className="rounded-lg border border-dashed border-ink/10 dark:border-white/10 p-6 text-center text-sm text-ink-muted">
                    {emptyText}
                </p>
            ) : (
                <>
                    <div className={cn('grid gap-3', columnsClass)}>
                        {shown.map((item) => (
                            <GalleryCard key={item.id} item={item} onToggle={() => onToggle(item)} onDelete={onDelete ? () => onDelete(item) : undefined} />
                        ))}
                    </div>

                    {pages > 1 && (
                        <div className="mt-4 flex items-center justify-center gap-3 text-sm text-ink-muted">
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 dark:border-white/10 transition-colors hover:text-ink disabled:opacity-40 disabled:hover:text-ink-muted"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span>Page {page} of {pages}</span>
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                                disabled={page === pages}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 dark:border-white/10 transition-colors hover:text-ink disabled:opacity-40 disabled:hover:text-ink-muted"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function GalleryCard({ item, onToggle, onDelete }: { item: GalleryItem; onToggle: () => void; onDelete?: () => void }) {
    const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

    return (
        <div
            className={cn(
                'group relative aspect-square overflow-hidden rounded-lg border border-ink/5 dark:border-white/10 bg-surface-muted',
                item.hidden && 'opacity-50',
            )}
        >
            <img
                src={item.url}
                alt=""
                className="h-full w-full object-cover"
                onLoad={(e) => {
                    const img = e.currentTarget;
                    setDims({ w: img.naturalWidth, h: img.naturalHeight });
                }}
            />

            {/* Source / project label */}
            {item.source === 'project' && (
                <span className="absolute top-1.5 left-1.5 max-w-[80%] truncate rounded bg-primary/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {item.label}
                </span>
            )}

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
                {onDelete && (
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

            {/* Hover metadata overlay */}
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/80 via-black/40 to-transparent p-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {dims && (
                    <p className="text-[11px] text-white leading-snug">
                        <span className="text-white/60">Dimensions: </span>{dims.w} × {dims.h}
                    </p>
                )}
                {item.size_bytes != null && (
                    <p className="text-[11px] text-white leading-snug">
                        <span className="text-white/60">Size: </span>{formatBytes(item.size_bytes)}
                    </p>
                )}
                {item.mime_type && (
                    <p className="text-[11px] text-white leading-snug">
                        <span className="text-white/60">Type: </span>{mimeLabel(item.mime_type)}
                    </p>
                )}
            </div>
        </div>
    );
}
