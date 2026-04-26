<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TurnstileVerifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    private const MAX_ATTEMPTS = 5;
    private const DECAY_SECONDS = 900; // 15 minutes per-email window

    public function __construct(private TurnstileVerifier $turnstile)
    {
    }

    public function showLoginForm(): Response
    {
        return Inertia::render('Admin/Login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'cf-turnstile-response' => 'nullable|string',
        ]);

        $key = $this->throttleKey($request);

        if (RateLimiter::tooManyAttempts($key, self::MAX_ATTEMPTS)) {
            $seconds = RateLimiter::availableIn($key);
            $minutes = max(1, (int) ceil($seconds / 60));
            throw ValidationException::withMessages([
                'email' => ["Too many login attempts for this email. Please try again in {$minutes} minute(s)."],
            ])->status(429);
        }

        // Verify Turnstile BEFORE Auth::attempt so bots can't burn the per-email
        // throttle budget (5 attempts / 15 min) with random passwords.
        if (! $this->turnstile->verify($request->input('cf-turnstile-response'), $request->ip())) {
            throw ValidationException::withMessages([
                'cf-turnstile-response' => ['Bot check failed. Please reload the page and try again.'],
            ]);
        }

        $existingUser = User::where('email', $request->input('email'))->first();

        if (! $existingUser) {
            RateLimiter::hit($key, self::DECAY_SECONDS);
            usleep(750_000);

            throw ValidationException::withMessages([
                'email' => ['No account found with this email address.'],
            ]);
        }

        if (! Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            RateLimiter::hit($key, self::DECAY_SECONDS);
            usleep(750_000);

            throw ValidationException::withMessages([
                'password' => ['Incorrect password. Please try again.'],
            ]);
        }

        $user = Auth::user();

        if (! $user->is_active) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            RateLimiter::hit($key, self::DECAY_SECONDS);
            usleep(750_000);

            throw ValidationException::withMessages([
                'email' => ['This account has been deactivated. Please contact your administrator.'],
            ]);
        }

        RateLimiter::clear($key);
        $request->session()->regenerate();

        return redirect()->intended('/admin');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/admin/login');
    }

    /**
     * Per-email throttle key. Stops an attacker rotating IPs against a single
     * known admin email — IP-keyed throttling alone can be bypassed with a
     * residential proxy pool.
     */
    private function throttleKey(Request $request): string
    {
        return 'login:' . sha1(Str::lower((string) $request->input('email')));
    }
}
