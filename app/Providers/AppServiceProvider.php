<?php

namespace App\Providers;

use App\Ssr\TimeoutHttpGateway;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Inertia\Ssr\Gateway;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        // Override Inertia's SSR gateway with one that applies connect/response
        // timeouts, so a hung/unreachable SSR sidecar (sky-amman-ssr) falls back
        // to client-side rendering instead of blocking until Railway's proxy
        // 502s the whole site. Bound in boot() (not register()) so it wins over
        // Inertia's own register()-time binding regardless of provider order.
        $this->app->bind(Gateway::class, TimeoutHttpGateway::class);

        // Strong password policy for every `Password::defaults()` use (admin
        // user create/edit). Min 10 chars, mixed case, a number, a symbol, and
        // checked against the HaveIBeenPwned breach corpus (k-anonymity; fails
        // open if the API is unreachable, so local dev is unaffected).
        Password::defaults(fn () => Password::min(10)
            ->mixedCase()
            ->numbers()
            ->symbols()
            ->uncompromised());

        // Point the password-reset email link at our Inertia reset page (token in
        // the path, email as a query param so the form can prefill it).
        ResetPassword::createUrlUsing(fn (object $notifiable, string $token) => route('password.reset', [
            'token' => $token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ]));
    }
}
