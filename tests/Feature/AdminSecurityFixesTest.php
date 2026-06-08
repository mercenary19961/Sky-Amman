<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use Database\Seeders\DefaultSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class AdminSecurityFixesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        RateLimiter::clear('login:' . sha1('ghost@example.com'));
        RateLimiter::clear('login:' . sha1('real@example.com'));
    }

    private const GENERIC = "These credentials don't match our records.";

    // ── #1 Login enumeration ────────────────────────────────────────────────

    public function test_unknown_email_returns_generic_message(): void
    {
        $this->from('/admin/login')
            ->post('/admin/login', ['email' => 'ghost@example.com', 'password' => 'whatever123'])
            ->assertSessionHasErrors(['email' => self::GENERIC]);
    }

    public function test_wrong_password_returns_the_same_generic_message(): void
    {
        User::factory()->create(['email' => 'real@example.com', 'role' => 'admin', 'is_active' => true]);

        $this->from('/admin/login')
            ->post('/admin/login', ['email' => 'real@example.com', 'password' => 'wrong-password-x'])
            // Same message + same key as the unknown-email case → no enumeration.
            ->assertSessionHasErrors(['email' => self::GENERIC]);
    }

    // ── #3 Settings type validation ─────────────────────────────────────────

    public function test_javascript_url_setting_is_rejected(): void
    {
        $this->seed(DefaultSettingsSeeder::class);
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);

        $this->actingAs($admin)
            ->from('/admin/settings')
            ->put('/admin/settings', ['settings' => [['key' => 'linkedin_url', 'value' => 'javascript:alert(1)']]])
            ->assertSessionHasErrors('settings.0.value');

        $this->assertSame('', (string) Setting::get('linkedin_url'));
    }

    public function test_valid_https_url_setting_is_accepted(): void
    {
        $this->seed(DefaultSettingsSeeder::class);
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);

        $this->actingAs($admin)
            ->put('/admin/settings', ['settings' => [['key' => 'linkedin_url', 'value' => 'https://www.linkedin.com/company/skyamman']]])
            ->assertSessionHasNoErrors();

        $this->assertSame('https://www.linkedin.com/company/skyamman', Setting::get('linkedin_url'));
    }

    public function test_malformed_email_setting_is_rejected(): void
    {
        $this->seed(DefaultSettingsSeeder::class);
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);

        $this->actingAs($admin)
            ->from('/admin/settings')
            ->put('/admin/settings', ['settings' => [['key' => 'company_email', 'value' => 'not-an-email']]])
            ->assertSessionHasErrors('settings.0.value');
    }
}
