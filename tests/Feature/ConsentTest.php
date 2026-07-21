<?php

namespace Tests\Feature;

use App\Http\Controllers\ConsentController;
use App\Models\ConsentRecord;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ConsentTest extends TestCase
{
    use RefreshDatabase;

    /** @return array<string, array{string, bool, bool}> */
    public static function decisions(): array
    {
        return [
            // action => [analytics, marketing]
            'accept all' => ['accept_all', true, true],
            'reject all' => ['reject_all', false, false],
            'custom' => ['custom', true, false],
        ];
    }

    #[DataProvider('decisions')]
    public function test_a_decision_is_recorded(string $action, bool $analytics, bool $marketing): void
    {
        $this->postJson('/consent', compact('action', 'analytics', 'marketing'))
            ->assertOk()
            ->assertJson(['ok' => true]);

        $this->assertDatabaseHas('consent_records', [
            'action' => $action,
            'analytics' => $analytics,
            'marketing' => $marketing,
            'policy_version' => ConsentRecord::POLICY_VERSION,
        ]);
    }

    public function test_the_choice_cookie_is_readable_by_javascript(): void
    {
        // The banner and the Consent Mode block both read this cookie from
        // document.cookie, so it must be neither httpOnly nor encrypted.
        $response = $this->postJson('/consent', [
            'action' => 'accept_all', 'analytics' => true, 'marketing' => true,
        ])->assertOk();

        $cookie = collect($response->headers->getCookies())
            ->firstWhere(fn ($c) => $c->getName() === ConsentController::COOKIE);

        $this->assertNotNull($cookie, 'consent cookie was not set');
        $this->assertFalse($cookie->isHttpOnly(), 'consent cookie must be readable by JS');
        $this->assertStringContainsString('"analytics":true', (string) $cookie->getValue());
    }

    public function test_the_visitor_id_cookie_stays_httponly(): void
    {
        $response = $this->postJson('/consent', [
            'action' => 'reject_all', 'analytics' => false, 'marketing' => false,
        ])->assertOk();

        $uid = collect($response->headers->getCookies())
            ->firstWhere(fn ($c) => $c->getName() === ConsentController::COOKIE.'_uid');

        $this->assertNotNull($uid);
        $this->assertTrue($uid->isHttpOnly(), 'visitor id must not be exposed to page scripts');
    }

    public function test_repeat_decisions_append_rather_than_overwrite(): void
    {
        // The log is evidence: an earlier decision must survive a later one.
        $this->postJson('/consent', ['action' => 'accept_all', 'analytics' => true, 'marketing' => true])->assertOk();
        $this->postJson('/consent', ['action' => 'reject_all', 'analytics' => false, 'marketing' => false])->assertOk();

        $this->assertSame(2, ConsentRecord::count());
    }

    public function test_an_invalid_action_is_rejected(): void
    {
        $this->postJson('/consent', ['action' => 'sneaky', 'analytics' => true, 'marketing' => true])
            ->assertStatus(422);

        $this->assertSame(0, ConsentRecord::count());
    }

    public function test_a_forged_visitor_id_is_ignored(): void
    {
        // uid comes from our own cookie or is minted fresh — never from input.
        $this->postJson('/consent', [
            'action' => 'accept_all', 'analytics' => true, 'marketing' => true,
            'uid' => 'attacker-controlled',
        ])->assertOk();

        $this->assertNotSame('attacker-controlled', ConsentRecord::first()?->uid);
    }

    public function test_an_editor_cannot_read_the_consent_log(): void
    {
        // It holds visitor IPs, so it sits behind the admin gate like Users.
        $editor = User::factory()->create(['role' => 'editor', 'is_active' => true]);

        $this->actingAs($editor)->get('/admin/consent')->assertForbidden();
    }

    public function test_a_guest_cannot_read_the_consent_log(): void
    {
        $this->get('/admin/consent')->assertRedirect('/admin/login');
    }

    public function test_the_admin_log_renders_stats(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);

        ConsentRecord::record('11111111-1111-1111-1111-111111111111', 'accept_all', ['analytics' => true, 'marketing' => true]);
        ConsentRecord::record('22222222-2222-2222-2222-222222222222', 'reject_all', ['analytics' => false, 'marketing' => false]);

        $this->actingAs($admin)->get('/admin/consent')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Consent/Index')
                ->where('stats.total', 2)
                ->where('stats.actions.accept_all.count', 1)
                ->where('stats.actions.reject_all.count', 1)
                // Whole percentages arrive JSON-decoded as int, not float.
                ->where('stats.actions.accept_all.pct', 50)
                ->where('stats.categories.analytics', 50)
                ->has('records.data', 2)
            );
    }

    public function test_stats_do_not_divide_by_zero_when_empty(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);

        $this->actingAs($admin)->get('/admin/consent')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('stats.total', 0)
                ->where('stats.actions.accept_all.pct', 0)
            );
    }
}
