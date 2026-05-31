<?php

namespace App\Http\Controllers;

use App\Models\NewsletterSubscriber;
use App\Services\TurnstileVerifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    /**
     * Capture a newsletter sign-up from the footer widget.
     *
     * Stores the address only — a full newsletter system (campaigns,
     * double opt-in, unsubscribe) comes later. Turnstile-gated like every other
     * public POST form; the verifier no-ops when no secret is configured (dev).
     */
    public function store(Request $request, TurnstileVerifier $turnstile): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email:rfc', 'max:255'],
        ]);

        if (! $turnstile->verify($request->input('cf-turnstile-response'), $request->ip())) {
            return back()->with('error', __('newsletter.verifyFailed'));
        }

        NewsletterSubscriber::subscribe($validated['email'], $request->ip());

        return back()->with('success', __('newsletter.success'));
    }
}
