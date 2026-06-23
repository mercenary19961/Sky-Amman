/**
 * CMS-first / i18n-fallback resolver shared by layout copy (e.g. the Footer,
 * which pulls editable strings from the Site Content "footer" pseudo-page).
 * Extracted so the precedence rule is testable in one place.
 */

/** The shape of a Site Content bundle entry (structurally a subset of ContentValue). */
export interface CmsEntry {
    content: string;
    is_visible: boolean;
}

/**
 * Return the CMS entry's content when the row exists, is visible, and has
 * non-empty content for the current locale; otherwise the caller's fallback
 * (typically an i18n string). CMS always wins over the fallback.
 */
export function cmsText(entry: CmsEntry | undefined, fallback: string): string {
    if (entry && entry.is_visible && entry.content) return entry.content;
    return fallback;
}
