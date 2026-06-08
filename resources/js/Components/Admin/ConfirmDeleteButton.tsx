import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteButtonProps {
    /** Runs once the user types the confirm word and clicks the action. */
    onConfirm: () => void;
    /** Trigger content (usually an icon, or icon + label). */
    children: ReactNode;
    /** Classes for the trigger button (keeps each call site's existing styling). */
    className?: string;
    /** Trigger tooltip. */
    title?: string;
    /** Modal heading. */
    heading?: string;
    /** Modal body copy (defaults from itemLabel). */
    description?: ReactNode;
    /** Friendly name of the thing being deleted, woven into the default copy. */
    itemLabel?: string;
    /** Confirm-button label. */
    actionLabel?: string;
    /** Word the user must type to enable the action (case-insensitive). */
    confirmWord?: string;
}

/**
 * Destructive-action trigger that opens a small modal requiring the user to TYPE
 * a confirm word (default "delete") before the action button enables. Replaces
 * the old one-click inline "Confirm / Cancel" so deletes can't happen by a
 * stray double-click. Drop-in: keeps the {onConfirm, children, className, title}
 * shape the previous inline ConfirmButton used.
 */
export function ConfirmDeleteButton({
    onConfirm,
    children,
    className,
    title,
    heading = 'Delete this item?',
    description,
    itemLabel,
    actionLabel = 'Delete',
    confirmWord = 'delete',
}: ConfirmDeleteButtonProps) {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setText('');
            const t = setTimeout(() => inputRef.current?.focus(), 60);
            return () => clearTimeout(t);
        }
    }, [open]);

    const ready = text.trim().toLowerCase() === confirmWord.toLowerCase();

    const confirm = () => {
        if (!ready) return;
        setOpen(false);
        onConfirm();
    };

    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className={className} title={title}>
                {children}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
                        <motion.div
                            className="relative w-full max-w-md rounded-xl bg-white dark:bg-zinc-800 p-6 shadow-xl"
                            initial={{ scale: 0.96, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.96, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <div className="mb-4 flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-600 dark:text-red-400">
                                    <AlertTriangle size={20} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-ink">{heading}</h3>
                                    <p className="mt-1 text-sm text-ink-muted">
                                        {description ?? (
                                            <>This will delete {itemLabel ? <strong className="text-ink">{itemLabel}</strong> : 'this item'}. This can&rsquo;t be undone from here.</>
                                        )}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="text-ink-muted hover:text-ink transition-colors"
                                    aria-label="Cancel"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <label className="block text-sm text-ink-muted mb-1.5">
                                Type <strong className="font-semibold text-ink">{confirmWord}</strong> to confirm
                            </label>
                            <input
                                ref={inputRef}
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && confirm()}
                                placeholder={confirmWord}
                                autoComplete="off"
                                className="w-full rounded-md border border-ink/15 dark:border-white/15 bg-white dark:bg-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40"
                            />

                            <div className="mt-5 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="px-4 py-2 text-sm rounded-md text-ink-muted hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={confirm}
                                    disabled={!ready}
                                    className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Trash2 size={15} />
                                    {actionLabel}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
