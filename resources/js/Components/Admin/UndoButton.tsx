import { useState } from 'react';
import { router } from '@inertiajs/react';
import { History, ArrowRight, X } from 'lucide-react';
import type { UndoMeta } from '@/types/admin/changelog';

interface UndoButtonProps {
    /** Section key, e.g. 'site_content' — used for the dismiss endpoint. */
    modelType: string;
    undoMeta: UndoMeta | null;
}

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return new Date(iso).toLocaleDateString();
}

/**
 * Persistent "Undo last save" button (admin-themed port of Nuor's UndoButton).
 * Backed by a session pointer carrying the field diffs, so it survives navigation
 * until the change is reverted or dismissed. Hover shows the diff; clicking opens
 * a confirm modal. Revert reuses the change-log revert route.
 */
export function UndoButton({ modelType, undoMeta }: UndoButtonProps) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [restoring, setRestoring] = useState(false);

    if (!undoMeta || undoMeta.changes.length === 0) {
        return null;
    }

    const count = undoMeta.changes.length;

    const restore = () => {
        router.post(`/admin/change-log/${undoMeta.id}/revert`, {}, {
            preserveScroll: true,
            onStart: () => setRestoring(true),
            onFinish: () => { setRestoring(false); setShowConfirm(false); },
        });
    };

    const dismiss = () => {
        router.delete(`/admin/change-log/undo/${modelType}`, { preserveScroll: true, preserveState: true });
    };

    return (
        <>
            <div className="group/undo relative inline-flex items-center">
                <button
                    type="button"
                    onClick={() => setShowConfirm(true)}
                    className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3.5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                >
                    <History size={15} />
                    <span>Undo last save</span>
                    <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-xs font-semibold text-primary">{count}</span>
                    <span className="ms-0.5 text-xs text-ink-muted">{timeAgo(undoMeta.saved_at)}</span>
                </button>
                <button
                    type="button"
                    onClick={dismiss}
                    title="Dismiss"
                    className="ms-1 rounded-lg p-2 text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink dark:hover:bg-white/5"
                >
                    <X size={14} />
                </button>

                {/* Hover tooltip — the field diffs */}
                <div className="absolute end-0 top-full z-30 mt-2 hidden w-80 group-hover/undo:block">
                    <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-3.5 text-xs text-white shadow-xl">
                        <div className="mb-2.5 flex items-center gap-2">
                            <History size={13} className="text-primary" />
                            <span className="font-medium text-zinc-300">Changes in last save</span>
                            <span className="ms-auto rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                {count} {count === 1 ? 'field' : 'fields'}
                            </span>
                        </div>
                        <ul className="max-h-60 space-y-2 overflow-y-auto">
                            {undoMeta.changes.map((c, i) => (
                                <li key={i} className="border-t border-zinc-700/50 pt-2 first:border-0 first:pt-0">
                                    <p className="mb-1 font-medium text-zinc-300">{c.label}</p>
                                    <div className="flex items-start gap-1.5">
                                        <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded bg-red-500/20 text-[9px] font-bold text-red-400">−</span>
                                        <span className="break-all text-red-300 line-through">{c.old || <span className="italic text-zinc-500">empty</span>}</span>
                                    </div>
                                    <div className="mt-0.5 flex items-start gap-1.5">
                                        <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded bg-emerald-500/20 text-[9px] font-bold text-emerald-400">+</span>
                                        <span className="break-all text-emerald-300">{c.new || <span className="italic text-zinc-500">empty</span>}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Confirm modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => !restoring && setShowConfirm(false)} />
                    <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-800">
                        <div className="mb-4 flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary-strong dark:text-primary">
                                <History size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-ink">Restore previous version?</h3>
                                <p className="mt-1 text-sm text-ink-muted">
                                    {count === 1 ? 'This field' : `These ${count} fields`} will be reverted to their prior values:
                                </p>
                            </div>
                            <button type="button" onClick={() => setShowConfirm(false)} disabled={restoring} className="text-ink-muted hover:text-ink">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-5 max-h-48 space-y-2.5 overflow-y-auto rounded-lg bg-surface-muted p-3 dark:bg-zinc-900/50">
                            {undoMeta.changes.map((c, i) => (
                                <div key={i} className="text-sm">
                                    <p className="mb-0.5 font-medium text-ink">{c.label}</p>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="max-w-35 truncate text-red-600 line-through dark:text-red-400">{c.new || '(empty)'}</span>
                                        <ArrowRight size={12} className="shrink-0 text-ink-muted" />
                                        <span className="max-w-35 truncate text-emerald-700 dark:text-emerald-400">{c.old || '(empty)'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirm(false)}
                                disabled={restoring}
                                className="rounded-lg border border-ink/10 bg-white px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink disabled:opacity-50 dark:border-white/10 dark:bg-zinc-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={restore}
                                disabled={restoring}
                                className="flex items-center gap-2 rounded-lg bg-primary-strong px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-strong-hover disabled:opacity-50"
                            >
                                <History size={15} />
                                {restoring ? 'Restoring…' : 'Restore'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
