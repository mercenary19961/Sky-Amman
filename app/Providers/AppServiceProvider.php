<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

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
