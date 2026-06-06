<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\TurnstileVerifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * "Forgot password" — emails a signed reset link via the Laravel password
 * broker (mailer = Resend; logs in dev). Turnstile-gated and rate-limited like
 * every public POST. The response is always generic so it can't be used to
 * enumerate which emails have accounts.
 */
class ForgotPasswordController extends Controller
{
    public function __construct(private TurnstileVerifier $turnstile)
    {
    }

    public function show(): Response
    {
        return Inertia::render('Admin/ForgotPassword');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'cf-turnstile-response' => ['nullable', 'string'],
        ]);

        if (! $this->turnstile->verify($request->input('cf-turnstile-response'), $request->ip())) {
            throw ValidationException::withMessages([
                'cf-turnstile-response' => ['Bot check failed. Please reload the page and try again.'],
            ]);
        }

        // Fire-and-forget: send the link if the account exists, but always return
        // the same message (no user enumeration).
        Password::sendResetLink($request->only('email'));

        return back()->with('success', 'If an account exists for that email, a password reset link is on its way.');
    }
}
