import { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Undo2, X } from 'lucide-react';
import type { PageProps } from '@/types';
import type { UndoPayload } from '@/types/admin/changelog';

/**
 * One-shot "Undo" toast. After a tracked save, ChangeLogService flashes an
 * `undo` payload (shared by HandleInertiaRequests); this surfaces it bottom-
 * center with a single-click revert. Auto-dismisses after a few seconds.
 * Rendered once in AdminLayout.
 */
export function UndoToast() {
    const page = usePage<PageProps>().props;
    // Revert is admin-only (the route is admin-gated), so only admins get the toast.
    const undo = page.auth.user?.role === 'admin'
        ? ((page.undo as UndoPayload | null | undefined) ?? null)
        : null;
    const [visible, setVisible] = useState(false);
    const [shownId, setShownId] = useState<number | null>(null);

    useEffect(() => {
        if (undo && undo.id !== shownId) {
            setShownId(undo.id);
            setVisible(true);
            const t = setTimeout(() => setVisible(false), 9000);
            return () => clearTimeout(t);
        }
    }, [undo, shownId]);

    if (!visible || !undo) return null;

    const onUndo = () => {
        setVisible(false);
        router.post(`/admin/change-log/${undo.id}/revert`, {}, { preserveScroll: true });
    };

    return (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
            <div className="flex items-center gap-3 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm text-white shadow-lg ring-1 ring-white/10">
                <span>{undo.section} saved.</span>
                <button
                    type="button"
                    onClick={onUndo}
                    className="inline-flex items-center gap-1.5 font-medium text-primary transition-colors hover:text-primary-light"
                >
                    <Undo2 size={14} />
                    Undo
                </button>
                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    className="text-zinc-400 transition-colors hover:text-white"
                    title="Dismiss"
                >
                    <X size={15} />
                </button>
            </div>
        </div>
    );
}
