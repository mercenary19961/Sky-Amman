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
    className?: string;
    buttonClassName?: string;
}

/**
 * Themed dropdown — a styled replacement for the native <select> so the open
 * option list matches the site theme (brand hover/selected states) instead of
 * the OS default. Closes on outside click / Escape.
 */
export function Select({ value, onChange, options, className, buttonClassName }: SelectProps) {
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
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className={cn(
                    'flex w-full items-center justify-between gap-2 text-start',
                    buttonClassName,
                    open && 'border-primary',
                )}
            >
                <span className="truncate">{selected?.label}</span>
                <ChevronDown
                    size={18}
                    className={cn('flex-none text-ink-muted transition-transform', open && 'rotate-180')}
                />
            </button>

            {open && (
                <ul
                    role="listbox"
                    className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-ink/10 bg-white py-1 shadow-lg"
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
                                    'flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-colors',
                                    active ? 'bg-primary/10 font-medium text-primary' : 'text-ink hover:bg-surface-muted',
                                )}
                            >
                                <span>{o.label}</span>
                                {active && <Check size={16} className="text-primary" />}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
