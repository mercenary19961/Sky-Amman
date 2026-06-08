import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Option {
    value: string;
    label: string;
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    /** Wrapper class — use this to size/position (e.g. width). */
    className?: string;
    /** Override the trigger button styles entirely. */
    buttonClassName?: string;
    disabled?: boolean;
    /** Open the option list upward (e.g. when the trigger sits near the page bottom). */
    dropUp?: boolean;
}

/**
 * Admin-themed dropdown — a styled replacement for the native <select> so the
 * open option list matches the admin (dark) theme instead of the OS default.
 * Closes on outside click / Escape. Use this for ALL dropdowns in the admin
 * panel; the public-site equivalent lives in Components/Public/Select.tsx.
 */
export function Select({ value, onChange, options, placeholder, className, buttonClassName, disabled, dropUp }: SelectProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const selected = options.find((o) => o.value === value);

    useEffect(() => {
        if (!open || typeof document === 'undefined') return;
        const onDown = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    return (
        <div ref={ref} className={cn('relative', className)}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className={cn(
                    'flex w-full items-center justify-between gap-2 rounded border px-3 py-2 text-start text-sm transition-colors',
                    'border-ink/10 bg-white text-ink dark:border-white/10 dark:bg-zinc-700 dark:text-zinc-100',
                    'focus:outline-none focus:ring-2 focus:ring-primary/30',
                    'disabled:cursor-not-allowed disabled:opacity-60',
                    open && 'border-primary ring-2 ring-primary/30',
                    buttonClassName,
                )}
            >
                <span className={cn('truncate', !selected && 'text-ink-muted')}>
                    {selected?.label ?? placeholder ?? 'Select…'}
                </span>
                <ChevronDown size={16} className={cn('flex-none text-ink-muted transition-transform', open && 'rotate-180')} />
            </button>

            {open && (
                <ul
                    role="listbox"
                    className={cn(
                        'absolute z-30 max-h-64 w-full overflow-auto rounded-lg border border-ink/10 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-zinc-800',
                        dropUp ? 'bottom-full mb-1.5' : 'mt-1.5',
                    )}
                >
                    {options.map((o) => {
                        const active = o.value === value;
                        return (
                            <li
                                key={o.value}
                                role="option"
                                aria-selected={active}
                                onClick={() => {
                                    onChange(o.value);
                                    setOpen(false);
                                }}
                                className={cn(
                                    'flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition-colors',
                                    active
                                        ? 'bg-primary/10 font-medium text-primary'
                                        : 'text-ink hover:bg-surface-muted dark:text-zinc-100 dark:hover:bg-zinc-700',
                                )}
                            >
                                <span>{o.label}</span>
                                {active && <Check size={15} className="flex-none text-primary" />}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
