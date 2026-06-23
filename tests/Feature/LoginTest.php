<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Admin login: the happy path, the deactivated-account guard, a wrong password,
 * and the per-email lockout. (Login enumeration / generic-message behaviour is
 * covered in AdminSecurityFixesTest.)
 */
class LoginTest extends TestCase
{
    use RefreshDatabase;

    /** Mirror LoginController::throttleKey so we can pre-load the per-email limit. */
    private function emailKey(string $email): string
    {
        return 'login:' . sha1(Str::lower($email));
    }

    public function test_active_admin_can_log_in(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@skyamman.test',
            'role' => 'admin',
            'is_active' => true,
        ]);

        // The factory's default password is "password".
        $this->post('/admin/login', ['email' => 'admin@skyamman.test', 'password' => 'password'])
            ->assertRedirect('/admin');

        $this->assertAuthenticatedAs($user);
    }

    public function test_deactivated_account_cannot_log_in(): void
    {
        User::factory()->create([
            'email' => 'inactive@skyamman.test',
            'role' => 'admin',
            'is_active' => false,
        ]);

        $this->from('/admin/login')
            ->post('/admin/login', ['email' => 'inactive@skyamman.test', 'password' => 'password'])
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_wrong_password_does_not_authenticate(): void
    {
        User::factory()->create([
            'email' => 'real@skyamman.test',
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->from('/admin/login')
            ->post('/admin/login', ['email' => 'real@skyamman.test', 'password' => 'definitely-wrong'])
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_per_email_throttle_locks_out_even_with_correct_password(): void
    {
        $email = 'target@skyamman.test';
        User::factory()->create(['email' => $email, 'role' => 'admin', 'is_active' => true]);

        // Pre-fill the per-email throttle to its cap (5) so a single request trips
        // the lockout — isolates the controller's per-email limiter from the
        // per-IP route throttle (which starts fresh each test).
        $key = $this->emailKey($email);
        for ($i = 0; $i < 5; $i++) {
            RateLimiter::hit($key, 900);
        }

        // Correct credentials, but the email is locked out → an error and no auth.
        // (If the lockout weren't firing, the right password would log in cleanly.)
        $this->from('/admin/login')
            ->post('/admin/login', ['email' => $email, 'password' => 'password'])
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    }
}
