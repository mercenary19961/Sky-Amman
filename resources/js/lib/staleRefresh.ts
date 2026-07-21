import { router } from '@inertiajs/react';

// Pages bake their content into the server response, so a tab left open for hours
// keeps showing whatever was current when it first loaded. The HTML is served
// `no-cache`, so a plain re-fetch always returns current DB content — we just
// need to trigger one when a tab has been sitting open too long. This lets a
// content change reach already-open tabs without a manual reload.
//
// Public tabs: refreshed on refocus OR on a foreground interval (a kiosk/display
// left open still updates within the window).
//
// Admin tabs: refreshed ONLY on refocus (never while foregrounded), and ONLY when
// nothing looks unsaved — auto-reloading over a half-edited form would wipe work.
// Dirtiness is detected generically from the DOM (see readFormSignature), and any
// uncertainty biases toward NOT reloading.

const MAX_AGE_MS = 3 * 60 * 60 * 1000; // refresh a tab left open longer than 3h
const CHECK_EVERY_MS = 5 * 60 * 1000;  // re-evaluate staleness every 5 min

// A signature of every form control's current value/checked/selected state. If it
// differs from the snapshot taken at page load, the user has edited something.
// Covers the high-stakes cases (typed text, selects, checkboxes, picked-but-
// unsaved files, aria toggles, rich-text). It can't see purely-React state with
// no DOM reflection (a button-only toggle, a drag reorder); those are low-effort
// to redo and, combined with refocus-only admin reloads, a negligible window.
// A DOM that changed shape between snapshots reads as "dirty", which is the safe
// direction (skip the reload).
function readFormSignature(): string {
    const parts: string[] = [];
    const controls = document.querySelectorAll<HTMLElement>(
        'input, textarea, select, [contenteditable="true"], [aria-checked], [aria-pressed]',
    );
    controls.forEach((el, i) => {
        if (el instanceof HTMLInputElement) {
            if (el.type === 'file') parts.push(`${i}:f:${el.files?.length ?? 0}`);
            else if (el.type === 'checkbox' || el.type === 'radio') parts.push(`${i}:c:${el.checked}`);
            else parts.push(`${i}:v:${el.value}`);
        } else if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
            parts.push(`${i}:v:${el.value}`);
        } else if (el.isContentEditable) {
            parts.push(`${i}:e:${el.textContent ?? ''}`);
        } else {
            const s = el.getAttribute('aria-checked') ?? el.getAttribute('aria-pressed');
            if (s !== null) parts.push(`${i}:a:${s}`);
        }
    });
    return parts.join('|');
}

export function initStaleTabRefresh(): void {
    if (typeof window === 'undefined') return;

    let loadedAt = Date.now();
    let reloading = false;
    let baselineSig = '';

    const inAdmin = () => window.location.pathname.startsWith('/admin');
    const isStale = () => Date.now() - loadedAt > MAX_AGE_MS;

    // Take the "clean" baseline after React has committed the new page's DOM.
    const resnapshot = () => {
        if (!inAdmin()) return; // only admin needs the unsaved-changes baseline
        requestAnimationFrame(() => { baselineSig = readFormSignature(); });
    };

    // Never pull the page out from under someone mid-typing.
    const isBusy = () => {
        const el = document.activeElement as HTMLElement | null;
        if (!el) return false;
        return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
            || el.tagName === 'SELECT' || el.isContentEditable;
    };

    // Admin is safe to refresh only when nothing looks unsaved. An empty baseline
    // (never snapshotted) with any controls present reads as dirty → skip.
    const adminHasUnsavedChanges = () => isBusy() || readFormSignature() !== baselineSig;

    // Every real navigation lands a fresh page: restart the clock and rebaseline.
    router.on('navigate', () => { loadedAt = Date.now(); resnapshot(); });

    const refresh = (trigger: 'focus' | 'interval') => {
        if (reloading || !isStale()) return;
        if (inAdmin()) {
            if (trigger !== 'focus' || adminHasUnsavedChanges()) return;
        } else if (isBusy()) {
            return;
        }
        reloading = true;
        // `reload()` preserves scroll and component state by default, so fresh
        // content flows in smoothly. If a deploy changed the asset version in the
        // meantime, Inertia escalates this to a full hard reload on its own. On
        // failure `reloading` clears but the clock isn't reset, so the next tick
        // simply retries.
        router.reload({ onFinish: () => { reloading = false; } });
    };

    // Primary trigger, zero disruption: the visitor returns to a tab they left
    // open past the window.
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') refresh('focus');
    });

    // Foreground backstop — public only (admin stays refocus-only for safety).
    window.setInterval(() => refresh('interval'), CHECK_EVERY_MS);

    resnapshot();
}
