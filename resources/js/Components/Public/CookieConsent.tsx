import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Cookie, ShieldCheck } from 'lucide-react';
import {
    CONSENT_COOKIE,
    POLICY_VERSION,
    choiceForAction,
    consentModePayload,
    needsConsent,
    type ConsentAction,
    type ConsentChoice,
} from '@/lib/consent';

declare global {
    interface Window {
        dataLayer?: unknown[];
    }
}

/**
 * Self-hosted cookie-consent banner.
 *
 * Replaces a third-party CMP (CookieYes/Cookiebot): no vendor account, no page
 * or traffic cap, no extra CSP host, and a real Arabic translation — the free
 * tiers of both vendors are single-language.
 *
 * Consent Mode v2 does the actual gating. The defaults block in app.blade.php
 * denies everything before GTM loads; this component only sends the 'update'.
 * That means every tag inside GTM (GA4, Meta, LinkedIn, Google Ads) honours the
 * choice through one mechanism, with no per-vendor blocking code here.
 */
export function CookieConsent() {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);
    const [panelOpen, setPanelOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [custom, setCustom] = useState<ConsentChoice>({ analytics: false, marketing: false });

    // Decide AFTER mount, never during render: the server has no document, and
    // SSR markup must match the client's first paint or hydration mismatches.
    useEffect(() => {
        if (typeof document === 'undefined') return;

        setVisible(needsConsent(document.cookie));
    }, []);

    const submit = async (action: ConsentAction) => {
        if (saving) return;

        const choice = choiceForAction(action, custom);

        setSaving(true);

        // Tell Google immediately. Doing this before the network round-trip means
        // a slow or failed POST never costs the visitor the consent they just
        // granted — the server call is the audit record, not the mechanism.
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(['consent', 'update', consentModePayload(choice)]);

        // Optimistic local cookie so a failed POST still suppresses the banner
        // for this visit rather than nagging on every page.
        const oneYear = 60 * 60 * 24 * 365;
        const value = encodeURIComponent(JSON.stringify({ ...choice, v: POLICY_VERSION }));
        document.cookie = `${CONSENT_COOKIE}=${value};path=/;max-age=${oneYear};SameSite=Lax`;

        setVisible(false);

        try {
            const token = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1];

            await fetch('/consent', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...(token ? { 'X-XSRF-TOKEN': decodeURIComponent(token) } : {}),
                },
                body: JSON.stringify({ action, ...choice }),
            });
        } catch {
            // Consent already applied client-side; losing the audit row is
            // preferable to blocking the visitor on a network error.
        } finally {
            setSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '110%' }}
                    transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                    className="fixed inset-x-0 bottom-0 z-[60] section-x pb-4 sm:pb-6"
                    role="dialog"
                    aria-live="polite"
                    aria-label={t('consent.title')}
                >
                    <div className="mx-auto max-w-5xl rounded-2xl bg-white shadow-[0_8px_40px_rgba(15,42,66,0.18)] ring-1 ring-ink/10">
                        <div className="p-5 sm:p-6">
                            <div className="flex items-start gap-3">
                                <span className="mt-0.5 shrink-0 rounded-full bg-primary-light/60 p-2 text-primary-dark">
                                    <Cookie size={18} />
                                </span>
                                <div className="min-w-0">
                                    <h2 className="text-base font-semibold text-ink sm:text-lg">
                                        {t('consent.title')}
                                    </h2>
                                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                                        {t('consent.body')}
                                    </p>
                                    <a
                                        href="/privacy"
                                        className="mt-1 inline-block text-sm font-medium text-primary-dark underline underline-offset-2 hover:text-primary-strong"
                                    >
                                        {t('consent.privacyLink')}
                                    </a>
                                </div>
                            </div>

                            {/* Category panel — rendered only when open, so a
                                collapsed banner has no toggle DOM to leak. */}
                            <AnimatePresence initial={false}>
                                {panelOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-4 space-y-2 border-t border-ink/8 pt-4">
                                            <CategoryRow
                                                icon={<ShieldCheck size={16} />}
                                                label={t('consent.categories.necessary.label')}
                                                description={t('consent.categories.necessary.description')}
                                                lockedLabel={t('consent.categories.necessary.always')}
                                            />
                                            <CategoryRow
                                                label={t('consent.categories.analytics.label')}
                                                description={t('consent.categories.analytics.description')}
                                                checked={custom.analytics}
                                                onChange={(v) => setCustom((c) => ({ ...c, analytics: v }))}
                                            />
                                            <CategoryRow
                                                label={t('consent.categories.marketing.label')}
                                                description={t('consent.categories.marketing.description')}
                                                checked={custom.marketing}
                                                onChange={(v) => setCustom((c) => ({ ...c, marketing: v }))}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setPanelOpen((o) => !o)}
                                    className="rounded-full px-5 py-2.5 text-sm font-medium text-ink-muted ring-1 ring-ink/15 transition hover:bg-surface-muted hover:text-ink"
                                >
                                    {panelOpen ? t('consent.back') : t('consent.customise')}
                                </button>

                                {/* Reject is visually equal to Accept on purpose:
                                    a refusal that is harder than acceptance is
                                    the classic dark pattern regulators cite. */}
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() => submit('reject_all')}
                                    className="rounded-full px-5 py-2.5 text-sm font-medium text-ink ring-1 ring-ink/15 transition hover:bg-surface-muted disabled:opacity-60"
                                >
                                    {t('consent.rejectAll')}
                                </button>

                                {panelOpen ? (
                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={() => submit('custom')}
                                        className="rounded-full bg-primary-dark px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-strong disabled:opacity-60"
                                    >
                                        {t('consent.save')}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={() => submit('accept_all')}
                                        className="rounded-full bg-primary-dark px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-strong disabled:opacity-60"
                                    >
                                        {t('consent.acceptAll')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

interface CategoryRowProps {
    label: string;
    description: string;
    icon?: React.ReactNode;
    checked?: boolean;
    onChange?: (value: boolean) => void;
    lockedLabel?: string;
}

function CategoryRow({ label, description, icon, checked, onChange, lockedLabel }: CategoryRowProps) {
    const locked = onChange === undefined;

    return (
        <div className="flex items-start justify-between gap-4 rounded-xl bg-surface-muted/60 p-3">
            <div className="min-w-0">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                    {icon}
                    {label}
                </span>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{description}</p>
            </div>

            {locked ? (
                <span className="shrink-0 whitespace-nowrap rounded-full bg-primary-light/70 px-2.5 py-1 text-[11px] font-medium text-primary-dark">
                    {lockedLabel}
                </span>
            ) : (
                <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    aria-label={label}
                    onClick={() => onChange(!checked)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                        checked ? 'bg-primary-dark' : 'bg-ink/20'
                    }`}
                >
                    {/* Knob travels on the inline axis so it reads correctly in RTL. */}
                    <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                            checked ? 'start-[22px]' : 'start-0.5'
                        }`}
                    />
                </button>
            )}
        </div>
    );
}
