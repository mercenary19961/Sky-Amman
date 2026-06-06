<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Completes a password reset from the emailed link. Validates the token via the
 * Laravel broker and applies the same strong-password policy as user creation
 * (Password::defaults()). The new password is set as plain text and hashed by
 * the User model's 'hashed' cast (consistent with the rest of the app).
 */
class ResetPasswordController extends Controller
{
    public function show(Request $request, string $token): Response
    {
        return Inertia::render('Admin/ResetPassword', [
            'token' => $token,
            'email' => (string) $request->query('email', ''),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => $password, // hashed via the model's 'hashed' cast
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return redirect()->route('login')->with('success', 'Your password has been reset — you can sign in now.');
        }

        // Invalid/expired token or unknown email — surface a single field error.
        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }
}
