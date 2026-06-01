import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Save, Video as VideoIcon, Eye, EyeOff } from 'lucide-react';
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
    [key: string]: unknown;
}

// Mirror of the public player's YouTube detection — used only for a thumbnail
// preview in the admin list.
const YT_RE = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
function youtubeThumb(url: string): string | null {
    const m = url.match(YT_RE);
    return m ? `https://i.ytimg.com/vi/${m[1]}/default.jpg` : null;
}

export default function TestimonialVideosIndex() {
    const { videos } = usePage<TestimonialVideosProps>().props;

    const move = (index: number, dir: -1 | 1) => {
        const ids = videos.map((v) => v.id);
        const j = index + dir;
        if (j < 0 || j >= ids.length) return;
        [ids[index], ids[j]] = [ids[j], ids[index]];
        router.post('/admin/testimonial-videos/reorder', { ids }, { preserveScroll: true });
    };

    const activeCount = videos.filter((v) => v.is_active).length;

    return (
        <AdminLayout title="Testimonial Videos">
            <Head title="Testimonial Videos" />

            <div className="max-w-4xl space-y-6">
                <p className="text-sm text-ink-muted">
                    These videos rotate in the homepage Testimonials carousel. Paste a{' '}
                    <strong>YouTube link</strong>, a hosted video URL, or a self-hosted path like{' '}
                    <code className="px-1 rounded bg-ink/5">/video/name.mp4</code>. Only{' '}
                    <strong>active</strong> videos appear; drag order with the arrows. The section shows a
                    3-up layout, so 3+ active videos look best ({activeCount} active now).
                </p>

                <AddVideoForm />

                {videos.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-ink/15 p-8 text-center text-ink-muted">
                        No videos yet. Add one above.
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {videos.map((video, i) => (
                            <VideoRow
                                key={video.id}
                                video={video}
                                isFirst={i === 0}
                                isLast={i === videos.length - 1}
                                onMoveUp={() => move(i, -1)}
                                onMoveDown={() => move(i, 1)}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </AdminLayout>
    );
}

function AddVideoForm() {
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [processing, setProcessing] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (processing || !url.trim()) return;
        setProcessing(true);
        router.post(
            '/admin/testimonial-videos',
            { url, title, is_active: true },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setUrl('');
                    setTitle('');
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <form onSubmit={submit} className="rounded-lg border border-ink/10 bg-white p-4 flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
                <label className="block text-xs font-medium text-ink-muted mb-1">Video URL</label>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://youtu.be/… or /video/name.mp4"
                    className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
            </div>
            <div className="sm:w-48">
                <label className="block text-xs font-medium text-ink-muted mb-1">Label (optional)</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Client A"
                    className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
            </div>
            <button
                type="submit"
                disabled={processing || !url.trim()}
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
                <Plus size={16} /> Add
            </button>
        </form>
    );
}

function VideoRow({
    video,
    isFirst,
    isLast,
    onMoveUp,
    onMoveDown,
}: {
    video: VideoItem;
    isFirst: boolean;
    isLast: boolean;
    onMoveUp: () => void;
    onMoveDown: () => void;
}) {
    const [title, setTitle] = useState(video.title ?? '');
    const [url, setUrl] = useState(video.url);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const dirty = title !== (video.title ?? '') || url !== video.url;
    const thumb = youtubeThumb(video.url);

    const save = () => {
        router.put(
            `/admin/testimonial-videos/${video.id}`,
            { url, title, is_active: video.is_active },
            { preserveScroll: true },
        );
    };

    // Toggle active independently of unsaved text edits (sends server's url/title).
    const toggleActive = () => {
        router.put(
            `/admin/testimonial-videos/${video.id}`,
            { url: video.url, title: video.title, is_active: !video.is_active },
            { preserveScroll: true },
        );
    };

    const remove = () => {
        router.delete(`/admin/testimonial-videos/${video.id}`, { preserveScroll: true });
    };

    return (
        <li className={cn('rounded-lg border bg-white p-3 flex gap-3', video.is_active ? 'border-ink/10' : 'border-ink/10 opacity-60')}>
            {/* Reorder */}
            <div className="flex flex-col gap-1 pt-1">
                <button
                    type="button"
                    onClick={onMoveUp}
                    disabled={isFirst}
                    aria-label="Move up"
                    className="p-1 rounded text-ink-muted hover:bg-ink/5 disabled:opacity-30 disabled:cursor-default"
                >
                    <ArrowUp size={16} />
                </button>
                <button
                    type="button"
                    onClick={onMoveDown}
                    disabled={isLast}
                    aria-label="Move down"
                    className="p-1 rounded text-ink-muted hover:bg-ink/5 disabled:opacity-30 disabled:cursor-default"
                >
                    <ArrowDown size={16} />
                </button>
            </div>

            {/* Thumbnail */}
            <div className="w-24 h-16 shrink-0 rounded-md overflow-hidden bg-ink/5 grid place-items-center">
                {thumb ? (
                    <img src={thumb} alt="" className="w-full h-full object-cover" />
                ) : (
                    <VideoIcon size={20} className="text-ink-muted" />
                )}
            </div>

            {/* Fields */}
            <div className="flex-1 min-w-0 flex flex-col gap-2">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Label (optional)"
                    className="w-full rounded-md border border-ink/15 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full rounded-md border border-ink/15 px-3 py-1.5 text-sm font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
            </div>

            {/* Actions */}
            <div className="flex flex-col items-end gap-2 shrink-0">
                <button
                    type="button"
                    onClick={toggleActive}
                    className={cn(
                        'inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-colors',
                        video.is_active
                            ? 'text-emerald-700 hover:bg-emerald-50'
                            : 'text-ink-muted hover:bg-ink/5',
                    )}
                    title={video.is_active ? 'Active — click to hide' : 'Hidden — click to show'}
                >
                    {video.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                    {video.is_active ? 'Active' : 'Hidden'}
                </button>

                <div className="flex items-center gap-1">
                    {dirty && (
                        <button
                            type="button"
                            onClick={save}
                            className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded bg-primary text-white hover:bg-primary-dark transition-colors"
                        >
                            <Save size={14} /> Save
                        </button>
                    )}
                    {confirmDelete ? (
                        <span className="flex items-center gap-1 text-xs">
                            <button type="button" onClick={remove} className="text-red-600 font-medium hover:underline">
                                Confirm
                            </button>
                            <button type="button" onClick={() => setConfirmDelete(false)} className="text-ink-muted hover:underline">
                                Cancel
                            </button>
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setConfirmDelete(true)}
                            aria-label="Delete"
                            className="p-1 rounded text-ink-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>
        </li>
    );
}
