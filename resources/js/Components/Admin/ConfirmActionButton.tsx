import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type Tone = 'danger' | 'warning';

interface ConfirmActionButtonProps {
    /** Runs once the user types the confirm word and clicks the action. */
    onConfirm: () => void;
    /** Trigger content (icon + label). */
    children: ReactNode;
    /** Classes for the trigger button. */
    className?: string;
    /** Trigger tooltip. */
    title?: string;
    /** Modal heading. */
    heading: string;
    /** Modal body copy. */
    description?: ReactNode;
    /** Confirm-button label. */
    actionLabel: string;
    /** Optional icon inside the confirm button. */
    actionIcon?: ReactNode;
    /** Word the user must type to enable the action (case-insensitive). */
    confirmWord: string;
    /** Visual tone of the warning chrome + action button. */
    tone?: Tone;
    /** Disable the trigger entirely. */
    disabled?: boolean;
}

const TONES: Record<Tone, { chip: string; ring: string; action: string }> = {
    danger: {
        chip: 'bg-red-500/15 text-red-600 dark:text-red-400',
        ring: 'focus:ring-red-500/40',
        action: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
        chip: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
        ring: 'focus:ring-amber-500/40',
        action: 'bg-amber-600 hover:bg-amber-700',
    },
};

/**
 * Generic type-to-confirm action trigger. Opens a modal requiring the user to
 * TYPE a confirm word before the action enables — the same safeguard as
 * ConfirmDeleteButton, but tone/icon/label configurable for non-delete actions
 * (e.g. "Reset to Default"). Leaves ConfirmDeleteButton untouched for deletes.
 */
export function ConfirmActionButton({
    onConfirm,
    children,
    className,
    title,
    heading,
    description,
    actionLabel,
    actionIcon,
    confirmWord,
    tone = 'warning',
    disabled = false,
}: ConfirmActionButtonProps) {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const t = TONES[tone];

    useEffect(() => {
        if (open) {
            setText('');
            const timer = setTimeout(() => inputRef.current?.focus(), 60);
            return () => clearTimeout(timer);
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
            <button type="button" onClick={() => setOpen(true)} className={className} title={title} disabled={disabled}>
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
                                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', t.chip)}>
                                    <AlertTriangle size={20} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-ink">{heading}</h3>
                                    {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
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
                                className={cn(
                                    'w-full rounded-md border border-ink/15 dark:border-white/15 bg-white dark:bg-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2',
                                    t.ring,
                                )}
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
                                    className={cn(
                                        'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                                        t.action,
                                    )}
                                >
                                    {actionIcon}
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
