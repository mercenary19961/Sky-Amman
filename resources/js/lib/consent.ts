/**
 * Cookie-consent state helpers.
 *
 * Pure functions kept out of the component so they're unit-testable without a
 * DOM: the banner's "should I show?" decision and the Consent Mode payload
 * shape are the two things most likely to break silently.
 */

export const CONSENT_COOKIE = 'sky_consent';

/** Bump in lockstep with ConsentRecord::POLICY_VERSION (PHP side). */
export const POLICY_VERSION = '1';

export interface ConsentChoice {
    analytics: boolean;
    marketing: boolean;
}

/** What we persist in the cookie: the choice plus the version it was given under. */
export interface StoredConsent extends ConsentChoice {
    v: string;
}

export type ConsentAction = 'accept_all' | 'reject_all' | 'custom';

/**
 * Parse the consent cookie value.
 *
 * Returns null for anything unusable — absent, malformed, or recorded under an
 * older policy version. A version bump therefore re-prompts everyone, which is
 * the point: consent given to different wording isn't consent to this wording.
 */
export function parseConsent(raw: string | null | undefined): StoredConsent | null {
    if (!raw) return null;

    try {
        const parsed: unknown = JSON.parse(decodeURIComponent(raw));

        if (typeof parsed !== 'object' || parsed === null) return null;

        const { analytics, marketing, v } = parsed as Record<string, unknown>;

        if (typeof analytics !== 'boolean' || typeof marketing !== 'boolean') return null;
        if (v !== POLICY_VERSION) return null;

        return { analytics, marketing, v };
    } catch {
        return null;
    }
}

/** Read a cookie by name from a raw document.cookie string. */
export function readCookie(cookieString: string, name: string): string | null {
    const match = cookieString.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));

    return match ? match[1] : null;
}

/** The banner shows only when there's no valid, current-version decision on file. */
export function needsConsent(cookieString: string): boolean {
    return parseConsent(readCookie(cookieString, CONSENT_COOKIE)) === null;
}

/** Map a button press to the categories it implies. */
export function choiceForAction(action: ConsentAction, custom?: ConsentChoice): ConsentChoice {
    if (action === 'accept_all') return { analytics: true, marketing: true };
    if (action === 'reject_all') return { analytics: false, marketing: false };

    return custom ?? { analytics: false, marketing: false };
}

/**
 * Google Consent Mode v2 update payload.
 *
 * Marketing drives the three ad_* signals plus personalization; analytics drives
 * analytics_storage. Keep this aligned with the defaults block in app.blade.php.
 */
export function consentModePayload(choice: ConsentChoice): Record<string, 'granted' | 'denied'> {
    const ad = choice.marketing ? 'granted' : 'denied';
    const analytics = choice.analytics ? 'granted' : 'denied';

    return {
        ad_storage: ad,
        ad_user_data: ad,
        ad_personalization: ad,
        analytics_storage: analytics,
        personalization_storage: ad,
    };
}
