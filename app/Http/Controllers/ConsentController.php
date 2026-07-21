<?php

namespace App\Http\Controllers;

use App\Models\ConsentRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ConsentController extends Controller
{
    /** Cookie name the banner reads to decide whether to show itself. */
    public const COOKIE = 'sky_consent';

    /** Consent is valid for a year, the common CMP default. */
    private const TTL_DAYS = 365;

    /**
     * Persist a visitor's cookie choice.
     *
     * Deliberately NOT Turnstile-gated, unlike the other public POSTs: a consent
     * decision must always be recordable. Making the banner fail on a captcha
     * hiccup would either block the site or record consent that was never given.
     * Rate limiting alone is the abuse control here.
     *
     * Returns JSON (not a redirect) because the banner posts via fetch and must
     * not navigate — an Inertia visit would remount the page under the user.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'string', 'in:'.implode(',', ConsentRecord::ACTIONS)],
            'analytics' => ['required', 'boolean'],
            'marketing' => ['required', 'boolean'],
        ]);

        // Reuse the visitor's existing id so repeat decisions thread together;
        // mint one on first contact. Never trust a client-supplied uid — it
        // comes from our own cookie or nowhere.
        $uid = $request->cookie(self::COOKIE.'_uid');

        if (! is_string($uid) || ! Str::isUuid($uid)) {
            $uid = (string) Str::uuid();
        }

        $categories = [
            'analytics' => $validated['analytics'],
            'marketing' => $validated['marketing'],
        ];

        ConsentRecord::record($uid, $validated['action'], $categories, [
            'locale' => session('locale', 'en'),
            'url' => $request->headers->get('referer'),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // The choice itself is readable by JS (the banner needs it before React
        // hydrates); the uid is httpOnly so page scripts can't fingerprint with
        // it. Both are SameSite=Lax first-party cookies.
        $payload = json_encode($categories + ['v' => ConsentRecord::POLICY_VERSION]);
        $minutes = self::TTL_DAYS * 24 * 60;

        return response()
            ->json(['ok' => true])
            ->cookie(self::COOKIE, $payload, $minutes, null, null, $request->secure(), false)
            ->cookie(self::COOKIE.'_uid', $uid, $minutes, null, null, $request->secure(), true);
    }
}
