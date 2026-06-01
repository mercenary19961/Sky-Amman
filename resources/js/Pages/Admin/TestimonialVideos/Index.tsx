import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState, type FormEvent } from 'react';
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
import { Plus, Trash2, Pencil, Play, GripVertical, Video as VideoIcon, Eye, EyeOff, X, Check } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { cn } from '@/lib/cn';

interface VideoItem {
    id: number;
    title: string | null;
    url: string;
    sort_order: number;
    is_active: boolean;
}

interface TestimonialVideosProps {
    videos: VideoItem[];
    maxActive: number;
    [key: string]: unknown;
}

const VIDEO_FILE_RE = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;
const YT_RE = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
const youtubeId = (url: string): string | null => url.match(YT_RE)?.[1] ?? null;

type EditingState = VideoItem | 'new' | null;

const sortedKey = (ids: Iterable<number>) => [...ids].sort((a, b) => a - b).join(',');

export default function TestimonialVideosIndex() {
    const { videos, maxActive } = usePage<TestimonialVideosProps>().props;

    // Order/list mirror for optimistic drag reordering.
    const [items, setItems] = useState<VideoItem[]>(videos);
    useEffect(() => setItems(videos), [videos]);

    // The LIVE active set (what the homepage shows right now).
    const liveKey = sortedKey(videos.filter((v) => v.is_active).map((v) => v.id));

    // The DRAFT selection the admin is editing. Toggling a card changes only
    // this — nothing goes live until "Update homepage" (publish) is clicked.
    const [draft, setDraft] = useState<Set<number>>(() => new Set(videos.filter((v) => v.is_active).map((v) => v.id)));
    // Resync to live whenever the published set changes (after a publish).
    useEffect(() => {
        setDraft(new Set(videos.filter((v) => v.is_active).map((v) => v.id)));
    }, [liveKey]); // eslint-disable-line react-hooks/exhaustive-deps
    // Drop ids that no longer exist (after a delete) without clobbering edits.
    useEffect(() => {
        setDraft((prev) => new Set([...prev].filter((id) => videos.some((v) => v.id === id))));
    }, [videos]);

    const [editing, setEditing] = useState<EditingState>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const selectedCount = draft.size;
    const draftKey = sortedKey(draft);
    const dirty = draftKey !== liveKey;
    const exactly = selectedCount === maxActive;
    const canPublish = dirty && exactly;

    const toggleDraft = (id: number) =>
        setDraft((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else if (next.size < maxActive) next.add(id);
            return next;
        });

    const publish = () => {
        if (!canPublish) return;
        router.post('/admin/testimonial-videos/publish', { ids: [...draft] }, { preserveScroll: true });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex((v) => v.id === active.id);
        const newIndex = items.findIndex((v) => v.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        setItems(reordered);
        router.post(
            '/admin/testimonial-videos/reorder',
            { ids: reordered.map((v) => v.id) },
            { preserveScroll: true, preserveState: true },
        );
    };

    const remove = (v: VideoItem) => router.delete(`/admin/testimonial-videos/${v.id}`, { preserveScroll: true });

    const statusNote = !dirty
        ? 'live'
        : selectedCount < maxActive
          ? `select ${maxActive - selectedCount} more, then update`
          : 'unsaved — click Update homepage';

    return (
        <AdminLayout title="Testimonial Videos">
            <Head title="Testimonial Videos" />

            <div className="max-w-5xl">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <p className="text-sm text-ink-muted max-w-xl">
                        Build a library of videos, then choose exactly{' '}
                        <strong className="text-ink dark:text-zinc-200">{maxActive}</strong> to show on the homepage.
                        Toggle the eye on each card to stage your pick, then{' '}
                        <strong className="text-ink dark:text-zinc-200">Update homepage</strong> to apply it. Paste a
                        YouTube link, a hosted URL, or a path like{' '}
                        <code className="px-1 rounded bg-white/10">/video/name.mp4</code>.
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={publish}
                            disabled={!canPublish}
                            title={
                                !dirty
                                    ? 'No changes to apply'
                                    : !exactly
                                      ? `Select exactly ${maxActive} videos first`
                                      : 'Apply to the homepage'
                            }
                            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Check size={16} /> Update homepage
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditing('new')}
                            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
                        >
                            <Plus size={16} /> Add video
                        </button>
                    </div>
                </div>

                {/* Selection status: green only at exactly the target, else amber. */}
                <div
                    className={cn(
                        'mb-6 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium',
                        exactly && !dirty
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : dirty
                              ? 'bg-amber-500/15 text-amber-400'
                              : 'bg-emerald-500/15 text-emerald-400',
                    )}
                >
                    <span
                        className={cn('w-2 h-2 rounded-full', exactly && !dirty ? 'bg-emerald-400' : 'bg-amber-400')}
                    />
                    {selectedCount} of {maxActive} selected — {statusNote}
                </div>

                {items.length === 0 ? (
                    <button
                        type="button"
                        onClick={() => setEditing('new')}
                        className="w-full rounded-lg border-2 border-dashed border-white/15 p-12 text-center text-ink-muted hover:border-primary/40 hover:bg-white/5 transition-colors"
                    >
                        <VideoIcon size={28} className="mx-auto mb-2 opacity-60" />
                        <div className="text-sm">No videos yet — add your first one</div>
                    </button>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={items.map((v) => v.id)} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {items.map((video) => (
                                    <SortableVideoCard
                                        key={video.id}
                                        video={video}
                                        selected={draft.has(video.id)}
                                        selectDisabled={!draft.has(video.id) && draft.size >= maxActive}
                                        onToggle={() => toggleDraft(video.id)}
                                        onEdit={() => setEditing(video)}
                                        onPreview={() => setPreview(video.url)}
                                        onDelete={() => remove(video)}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>

            <VideoFormDrawer editing={editing} onClose={() => setEditing(null)} />
            <PreviewModal url={preview} onClose={() => setPreview(null)} />
        </AdminLayout>
    );
}

function VideoThumb({ url }: { url: string }) {
    const yt = youtubeId(url);
    if (yt) {
        return (
            <img
                src={`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`}
                alt=""
                draggable={false}
                className="w-full h-full object-cover"
            />
        );
    }
    if (VIDEO_FILE_RE.test(url)) {
        return <video src={url} muted playsInline preload="metadata" className="w-full h-full object-cover" />;
    }
    return (
        <div className="w-full h-full grid place-items-center text-white/40">
            <VideoIcon size={28} />
        </div>
    );
}

function SortableVideoCard({
    video,
    selected,
    selectDisabled,
    onToggle,
    onEdit,
    onPreview,
    onDelete,
}: {
    video: VideoItem;
    selected: boolean;
    selectDisabled: boolean;
    onToggle: () => void;
    onEdit: () => void;
    onPreview: () => void;
    onDelete: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: video.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const [confirmDelete, setConfirmDelete] = useState(false);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group relative rounded-lg overflow-hidden border bg-white dark:bg-zinc-800 transition-all',
                selected ? 'border-emerald-500/60 ring-1 ring-emerald-500/40' : 'border-ink/5 dark:border-white/10',
                isDragging && 'opacity-60 scale-95 z-10',
                !selected && 'opacity-75',
            )}
        >
            <div className="relative aspect-video bg-zinc-900">
                <VideoThumb url={video.url} />

                <button
                    type="button"
                    onClick={onPreview}
                    aria-label="Preview video"
                    className="absolute inset-0 grid place-items-center bg-black/0 hover:bg-black/30 transition-colors"
                >
                    <span className="w-12 h-12 rounded-full bg-white/90 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                        <Play size={20} className="text-primary ms-0.5" fill="currentColor" />
                    </span>
                </button>

                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    aria-label="Drag to reorder"
                    className="absolute top-1.5 left-1.5 p-1 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                >
                    <GripVertical size={14} />
                </button>

                <span
                    className={cn(
                        'absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold',
                        selected ? 'bg-emerald-500 text-white' : 'bg-zinc-600 text-zinc-200',
                    )}
                >
                    {selected ? 'Showing' : 'Hidden'}
                </span>
            </div>

            <div className="p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <div className="text-sm font-medium truncate text-ink dark:text-zinc-100">
                        {video.title || 'Untitled'}
                    </div>
                    <div className="text-xs text-ink-muted truncate font-mono">{video.url}</div>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                    <button
                        type="button"
                        onClick={onToggle}
                        disabled={selectDisabled}
                        title={
                            selectDisabled
                                ? 'Already 3 selected — deselect one first'
                                : selected
                                  ? 'Showing — click to remove from selection'
                                  : 'Hidden — click to select'
                        }
                        className="p-1.5 rounded text-ink-muted hover:bg-white/5 hover:text-ink dark:hover:text-zinc-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                        {selected ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                    <button
                        type="button"
                        onClick={onEdit}
                        title="Edit"
                        className="p-1.5 rounded text-ink-muted hover:bg-white/5 hover:text-primary transition-colors"
                    >
                        <Pencil size={15} />
                    </button>
                    {confirmDelete ? (
                        <span className="flex items-center gap-1 text-xs ps-1">
                            <button type="button" onClick={onDelete} className="text-red-500 font-medium hover:underline">
                                Delete
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(false)}
                                className="text-ink-muted hover:underline"
                            >
                                Keep
                            </button>
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setConfirmDelete(true)}
                            title="Delete"
                            className="p-1.5 rounded text-ink-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={15} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function VideoFormDrawer({ editing, onClose }: { editing: EditingState; onClose: () => void }) {
    const open = editing !== null;
    const isNew = editing === 'new';
    const video = editing && editing !== 'new' ? editing : null;

    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        setUrl(video?.url ?? '');
        setTitle(video?.title ?? '');
    }, [editing]); // eslint-disable-line react-hooks/exhaustive-deps

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (processing || !url.trim()) return;
        setProcessing(true);
        const payload = { url, title };
        const opts = {
            preserveScroll: true,
            onSuccess: onClose,
            onFinish: () => setProcessing(false),
        };
        if (isNew) router.post('/admin/testimonial-videos', payload, opts);
        else if (video) router.put(`/admin/testimonial-videos/${video.id}`, payload, opts);
    };

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
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white dark:bg-zinc-800 border-s border-ink/5 dark:border-white/10 shadow-xl flex flex-col"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
                    >
                        <div className="h-16 flex items-center justify-between px-5 border-b border-ink/5 dark:border-white/10">
                            <h2 className="font-semibold text-ink dark:text-zinc-100">
                                {isNew ? 'Add video' : 'Edit video'}
                            </h2>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-1.5 rounded text-ink-muted hover:bg-white/5 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={submit} className="flex-1 overflow-y-auto p-5 space-y-5">
                            <div>
                                <label className="block text-xs font-medium text-ink-muted mb-1.5">Video URL</label>
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    autoFocus
                                    placeholder="https://youtu.be/… or /video/name.mp4"
                                    className="w-full rounded-md border border-ink/15 dark:border-white/15 bg-white dark:bg-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                                <p className="mt-1.5 text-xs text-ink-muted">
                                    YouTube link, hosted video URL, or a path beginning with “/”.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-ink-muted mb-1.5">Label (optional)</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Client A"
                                    className="w-full rounded-md border border-ink/15 dark:border-white/15 bg-white dark:bg-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                            </div>

                            <p className="text-xs text-ink-muted">
                                New videos start hidden — select them on the grid and click “Update homepage” to show them.
                            </p>

                            {url.trim() && (
                                <div className="rounded-lg overflow-hidden border border-ink/5 dark:border-white/10 aspect-video bg-zinc-900">
                                    <VideoThumb url={url} />
                                </div>
                            )}
                        </form>

                        <div className="p-5 border-t border-ink/5 dark:border-white/10 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm rounded-md text-ink-muted hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={submit}
                                disabled={processing || !url.trim()}
                                className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
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

function PreviewModal({ url, onClose }: { url: string | null; onClose: () => void }) {
    const yt = url ? youtubeId(url) : null;
    return (
        <AnimatePresence>
            {url && (
                <motion.div
                    className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden bg-black shadow-2xl"
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {yt ? (
                            <iframe
                                src={`https://www.youtube.com/embed/${yt}?rel=0&autoplay=1`}
                                title="Video preview"
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            // eslint-disable-next-line jsx-a11y/media-has-caption
                            <video src={url} controls autoPlay playsInline className="w-full h-full object-contain" />
                        )}
                    </motion.div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close preview"
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
