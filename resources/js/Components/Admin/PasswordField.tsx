import { useState } from 'react';
import { Eye, EyeOff, Wand2, Copy, Check, X } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Mirrors the server policy in AppServiceProvider (Password::defaults). The
 *  HaveIBeenPwned "uncompromised" check can't run client-side, so it's enforced
 *  on submit only — the rest give live feedback here. */
export const PASSWORD_RULES: { key: string; label: string; test: (p: string) => boolean }[] = [
    { key: 'len',    label: 'At least 10 characters', test: (p) => p.length >= 10 },
    { key: 'upper',  label: 'An uppercase letter',    test: (p) => /[A-Z]/.test(p) },
    { key: 'lower',  label: 'A lowercase letter',     test: (p) => /[a-z]/.test(p) },
    { key: 'number', label: 'A number',               test: (p) => /[0-9]/.test(p) },
    { key: 'symbol', label: 'A symbol',               test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const inputClass =
    'w-full rounded border border-ink/10 bg-white px-3 py-2 pe-24 text-sm text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-white/10 dark:bg-zinc-700 dark:text-zinc-100';

/** Crypto-strong password guaranteed to satisfy every rule above. */
function generatePassword(length = 16): string {
    const sets = {
        upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
        lower: 'abcdefghijkmnopqrstuvwxyz',
        number: '23456789',
        symbol: '!@#$%^&*()-_=+[]{}',
    };
    const all = sets.upper + sets.lower + sets.number + sets.symbol;
    const rand = (n: number) => {
        if (typeof window !== 'undefined' && window.crypto) {
            const a = new Uint32Array(1);
            window.crypto.getRandomValues(a);
            return a[0] % n;
        }
        return Math.floor(Math.random() * n);
    };
    const pick = (s: string) => s[rand(s.length)];

    // One from each class, then fill, then shuffle so the leading chars aren't predictable.
    const chars = [pick(sets.upper), pick(sets.lower), pick(sets.number), pick(sets.symbol)];
    while (chars.length < length) chars.push(pick(all));
    for (let i = chars.length - 1; i > 0; i--) {
        const j = rand(i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
}

interface PasswordFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    hint?: string;
    placeholder?: string;
    autoComplete?: string;
    /** Show the live requirements checklist + strength meter (use on the main field). */
    withMeter?: boolean;
    /** Show the "generate strong password" button (use on the main field). */
    withGenerate?: boolean;
    /** When set, shows a live match indicator against this value (use on the confirm field). */
    matchAgainst?: string;
}

export function PasswordField({
    label, value, onChange, error, hint, placeholder, autoComplete = 'new-password',
    withMeter = false, withGenerate = false, matchAgainst,
}: PasswordFieldProps) {
    const [show, setShow] = useState(false);
    const [copied, setCopied] = useState(false);

    const passed = PASSWORD_RULES.filter((r) => r.test(value)).length;
    const strength = value.length === 0 ? 0 : passed;
    const strengthLabel = strength <= 2 ? 'Weak' : strength <= 4 ? 'Fair' : 'Strong';
    const strengthColor = strength <= 2 ? 'bg-red-500' : strength <= 4 ? 'bg-amber-500' : 'bg-emerald-500';
    const strengthText = strength <= 2 ? 'text-red-500' : strength <= 4 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400';

    async function copy() {
        if (!value || typeof navigator === 'undefined' || !navigator.clipboard) return;
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            /* clipboard unavailable — no-op */
        }
    }

    function generate() {
        onChange(generatePassword());
        setShow(true);
    }

    const matchShown = matchAgainst !== undefined && value.length > 0;
    const matches = matchAgainst === value;

    return (
        <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">{label}</label>
            <div className="relative">
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    className={inputClass}
                />
                <div className="absolute inset-y-0 inset-e-2 flex items-center gap-1">
                    {withGenerate && (
                        <button
                            type="button"
                            onClick={generate}
                            title="Generate strong password"
                            className="rounded p-1 text-ink-muted transition-colors hover:text-primary"
                        >
                            <Wand2 size={15} />
                        </button>
                    )}
                    {value && (
                        <button
                            type="button"
                            onClick={copy}
                            title={copied ? 'Copied' : 'Copy'}
                            className="rounded p-1 text-ink-muted transition-colors hover:text-primary"
                        >
                            {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setShow((s) => !s)}
                        title={show ? 'Hide' : 'Show'}
                        className="rounded p-1 text-ink-muted transition-colors hover:text-primary"
                    >
                        {show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                </div>
            </div>

            {/* Strength meter + checklist */}
            {withMeter && value.length > 0 && (
                <div className="mt-2">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10 dark:bg-white/10">
                            <div className={cn('h-full rounded-full transition-all duration-300', strengthColor)} style={{ width: `${(strength / PASSWORD_RULES.length) * 100}%` }} />
                        </div>
                        <span className={cn('text-xs font-medium', strengthText)}>{strengthLabel}</span>
                    </div>
                    <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                        {PASSWORD_RULES.map((r) => {
                            const ok = r.test(value);
                            return (
                                <li key={r.key} className={cn('flex items-center gap-1.5 text-xs', ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-muted')}>
                                    {ok ? <Check size={12} className="flex-none" /> : <X size={12} className="flex-none opacity-50" />}
                                    {r.label}
                                </li>
                            );
                        })}
                    </ul>
                    <p className="mt-1 text-xs text-ink-muted">Also checked against known data breaches on save.</p>
                </div>
            )}

            {/* Confirm-field match indicator */}
            {matchShown && (
                <p className={cn('mt-1 flex items-center gap-1 text-xs', matches ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500')}>
                    {matches ? <Check size={12} /> : <X size={12} />}
                    {matches ? 'Passwords match' : "Passwords don't match"}
                </p>
            )}

            {hint && !error && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
