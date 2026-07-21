import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, ShieldAlert } from 'lucide-react';
import type { PageProps } from '@/types';

declare global {
    interface Window {
        turnstile?: {
            render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
            reset: (widgetId: string) => void;
            remove: (widgetId: string) => void;
        };
    }
}

interface TurnstileRenderOptions {
    sitekey: string;
    callback: (token: string) => void;
    'error-callback'?: (code?: string) => void;
    'expired-callback'?: () => void;
    theme?: 'light' | 'dark' | 'auto';
    size?: 'normal' | 'compact';
}

/**
 * - `disabled` — no site key configured (dev). The gate is OFF; never block a form.
 * - `pending`  — challenge running. NO token yet, so submitting now would fail.
 * - `ready`    — token in hand.
 * - `error`    — script blocked or the widget errored. Needs user action.
 */
export type TurnstileStatus = 'disabled' | 'pending' | 'ready' | 'error';

export interface TurnstileHandle {
    reset: () => void;
}

interface TurnstileProps {
    onVerify: (token: string) => void;
    onError?: (code?: string) => void;
    onExpire?: () => void;
    /** Report readiness so the parent can gate its submit button. */
    onStatusChange?: (status: TurnstileStatus) => void;
    theme?: 'light' | 'dark' | 'auto';
    className?: string;
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptLoading: Promise<void> | null = null;

function ensureScript(): Promise<void> {
    if (typeof window === 'undefined') return Promise.resolve();
    if (window.turnstile) return Promise.resolve();
    if (scriptLoading) return scriptLoading;

    scriptLoading = new Promise((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(`script[src^="${SCRIPT_SRC}"]`);
        if (existing) {
            existing.addEventListener('load', () => resolve());
            existing.addEventListener('error', () => reject(new Error('Failed to load Turnstile')));
            return;
        }
        const s = document.createElement('script');
        s.src = SCRIPT_SRC;
        s.async = true;
        s.defer = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Failed to load Turnstile'));
        document.head.appendChild(s);
    });

    return scriptLoading;
}

/**
 * Cloudflare Turnstile widget. Single-use token semantics: after a failed server
 * submission burns the token, parents call `reset()` via ref to re-arm.
 *
 * ⚠️ The widget solves ASYNCHRONOUSLY, and a FIRST-TIME visitor takes noticeably
 * longer than a returning one (no prior Cloudflare state, sometimes a real
 * interactive challenge). If a form can be submitted before `callback` fires,
 * `cf-turnstile-response` is still empty, the server rejects it, and the user
 * sees a failure on their first attempt that mysteriously "fixes itself" on the
 * second. That is a race in OUR form, not a Cloudflare fault — which is why this
 * component reports `status` and every consumer gates its submit button on it.
 *
 * If TURNSTILE_SITE_KEY isn't configured, the widget renders nothing and reports
 * `disabled` so forms stay usable in dev — server-side TurnstileVerifier is the
 * authoritative gate either way.
 */
export const Turnstile = forwardRef<TurnstileHandle, TurnstileProps>(function Turnstile(
    { onVerify, onError, onExpire, onStatusChange, theme = 'light', className },
    ref,
) {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const siteKey = usePage<PageProps>().props.turnstileSiteKey as string | undefined;
    const [status, setStatus] = useState<TurnstileStatus>(siteKey ? 'pending' : 'disabled');
    // `attempt` bumps to force a fresh mount after an error, without a page reload.
    const [attempt, setAttempt] = useState(0);

    // Held in a ref so status reporting never lands in the effect's dep array —
    // an inline parent callback would otherwise tear the widget down every render.
    const statusRef = useRef(onStatusChange);
    statusRef.current = onStatusChange;

    const report = useCallback((next: TurnstileStatus) => {
        setStatus(next);
        statusRef.current?.(next);
    }, []);

    useImperativeHandle(ref, () => ({
        reset: () => {
            if (widgetIdRef.current && window.turnstile) {
                window.turnstile.reset(widgetIdRef.current);
                // A reset discards the old token: we're pending again until the
                // widget re-solves, so the parent must re-block its submit.
                report('pending');
            }
        },
    }));

    useEffect(() => {
        if (!siteKey) {
            report('disabled');
            return;
        }
        if (!containerRef.current || status === 'error') return;

        let mounted = true;

        ensureScript()
            .then(() => {
                if (!mounted || !containerRef.current || !window.turnstile) return;
                widgetIdRef.current = window.turnstile.render(containerRef.current, {
                    sitekey: siteKey,
                    theme,
                    callback: (token) => {
                        report('ready');
                        onVerify(token);
                    },
                    'error-callback': (code) => {
                        // Stop CF's internal retry loop spamming siteverify.
                        report('error');
                        onError?.(code);
                    },
                    'expired-callback': () => {
                        // Turnstile auto-refreshes, but the old token is dead now.
                        report('pending');
                        onExpire?.();
                    },
                });
            })
            .catch((err) => {
                console.warn('Turnstile failed to load', err);
                report('error');
                onError?.('script-load-failed');
            });

        return () => {
            mounted = false;
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                } catch {
                    /* widget already removed */
                }
                widgetIdRef.current = null;
            }
        };
    // siteKey + theme are stable per page; callbacks are intentionally omitted so
    // a parent re-render doesn't tear down and re-render the widget. `attempt`
    // drives the manual retry below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [siteKey, theme, attempt]);

    if (!siteKey) return null;

    return (
        <div className={className}>
            <div ref={containerRef} />

            {status === 'pending' && (
                <p className="mt-2 text-xs text-ink-muted" aria-live="polite">
                    {t('turnstile.pending')}
                </p>
            )}

            {/* Only place a "reload the page" hint is genuinely the right advice:
                the widget is dead and cannot re-solve on its own. Retry is offered
                first because it recovers without losing anything already typed. */}
            {status === 'error' && (
                <div
                    role="alert"
                    className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800"
                >
                    <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                    <div className="min-w-0">
                        <p>{t('turnstile.error')}</p>
                        <button
                            type="button"
                            onClick={() => {
                                widgetIdRef.current = null;
                                setStatus('pending');
                                statusRef.current?.('pending');
                                setAttempt((n) => n + 1);
                            }}
                            className="mt-1.5 inline-flex items-center gap-1 font-medium text-amber-900 underline underline-offset-2 hover:text-amber-950"
                        >
                            <RefreshCw size={12} />
                            {t('turnstile.retry')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});
