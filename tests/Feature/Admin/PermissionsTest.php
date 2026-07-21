<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Per-editor grants for the admin-only sections.
 *
 * The invariant under test: the sidebar is a convenience, the ROUTE is the gate.
 * Every case here drives real HTTP so a missing `can:` guard fails loudly.
 */
class PermissionsTest extends TestCase
{
    use RefreshDatabase;

    private function editor(array $permissions = []): User
    {
        return User::factory()->create([
            'role' => 'editor',
            'is_active' => true,
            'permissions' => $permissions,
        ]);
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin', 'is_active' => true]);
    }

    /** @return array<string, array{string, string}> */
    public static function gatedRoutes(): array
    {
        return [
            'cookie consent' => ['consent.view', '/admin/consent'],
            'change log' => ['change_log.view', '/admin/change-log'],
            'settings' => ['settings.view', '/admin/settings'],
        ];
    }

    #[DataProvider('gatedRoutes')]
    public function test_an_ungranted_editor_is_refused(string $ability, string $url): void
    {
        $this->actingAs($this->editor())->get($url)->assertForbidden();
    }

    #[DataProvider('gatedRoutes')]
    public function test_a_granted_editor_is_admitted(string $ability, string $url): void
    {
        $this->actingAs($this->editor([$ability]))->get($url)->assertOk();
    }

    #[DataProvider('gatedRoutes')]
    public function test_an_admin_never_needs_a_grant(string $ability, string $url): void
    {
        // Gate::before short-circuits, so an admin's stored permissions are moot.
        $this->actingAs($this->admin())->get($url)->assertOk();
    }

    public function test_a_grant_for_one_section_does_not_leak_into_another(): void
    {
        $editor = $this->editor(['consent.view']);

        $this->actingAs($editor)->get('/admin/consent')->assertOk();
        $this->actingAs($editor)->get('/admin/settings')->assertForbidden();
        $this->actingAs($editor)->get('/admin/change-log')->assertForbidden();
    }

    public function test_view_access_does_not_confer_write_access(): void
    {
        // The sharp edge of per-verb guards: reading settings must not imply
        // saving them, so the two routes carry different abilities.
        $editor = $this->editor(['settings.view']);

        $this->actingAs($editor)->get('/admin/settings')->assertOk();
        $this->actingAs($editor)->put('/admin/settings', [])->assertForbidden();
    }

    public function test_users_and_auth_can_never_be_granted(): void
    {
        // The escalation boundary: an editor who could manage accounts could
        // promote themselves. No ability exists for it, and inventing one in the
        // payload must not help.
        $this->assertArrayNotHasKey('users.view', User::ABILITIES);

        $editor = $this->editor(['users.view', 'users.edit']);

        $this->actingAs($editor)->get('/admin/users')->assertForbidden();
        $this->actingAs($editor)->post('/admin/users', [])->assertForbidden();
    }

    public function test_an_unknown_ability_is_discarded_on_save(): void
    {
        $admin = $this->admin();
        $target = $this->editor();

        $this->actingAs($admin)->put("/admin/users/{$target->id}", [
            'name' => $target->name,
            'email' => $target->email,
            'role' => 'editor',
            'is_active' => true,
            'permissions' => ['consent.view', 'not.a.real.ability'],
        ])->assertRedirect();

        $this->assertSame(['consent.view'], $target->fresh()->permissions);
    }

    public function test_granting_a_dependent_ability_pulls_in_its_parent(): void
    {
        $admin = $this->admin();
        $target = $this->editor();

        // "Edit settings" without "view settings" is incoherent — the server
        // repairs it rather than storing a state the UI can't represent.
        $this->actingAs($admin)->put("/admin/users/{$target->id}", [
            'name' => $target->name,
            'email' => $target->email,
            'role' => 'editor',
            'is_active' => true,
            'permissions' => ['settings.edit'],
        ])->assertRedirect();

        $stored = $target->fresh()->permissions;

        $this->assertContains('settings.view', $stored);
        $this->assertContains('settings.edit', $stored);
    }

    public function test_promoting_to_admin_clears_stored_grants(): void
    {
        $admin = $this->admin();
        $target = $this->editor(['consent.view']);

        $this->actingAs($admin)->put("/admin/users/{$target->id}", [
            'name' => $target->name,
            'email' => $target->email,
            'role' => 'admin',
            'is_active' => true,
            'admin_confirmed' => true,
            'permissions' => ['consent.view'],
        ])->assertRedirect();

        // Dead data otherwise: it would silently reactivate on a later demotion.
        $this->assertNull($target->fresh()->permissions);
    }

    public function test_hasPermission_rejects_an_unknown_ability(): void
    {
        // A typo'd guard string should lock the door, not open it.
        $this->assertFalse($this->editor(['consent.view'])->hasPermission('consent.viwe'));
    }

    public function test_change_log_delete_is_separate_from_revert(): void
    {
        $editor = $this->editor(['change_log.view', 'change_log.revert']);

        $this->actingAs($editor)->delete('/admin/change-log/1')->assertForbidden();
    }

    public function test_the_undo_affordance_follows_the_revert_grant(): void
    {
        // Surfacing Undo to someone who can't revert just hands them a 403 button.
        $this->assertTrue($this->editor(['change_log.view', 'change_log.revert'])->hasPermission('change_log.revert'));
        $this->assertFalse($this->editor(['change_log.view'])->hasPermission('change_log.revert'));
    }

    public function test_abilities_are_shared_with_the_frontend(): void
    {
        $editor = $this->editor(['consent.view']);

        $this->actingAs($editor)->get('/admin')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('auth.user.abilities', ['consent.view']));
    }

    public function test_an_admin_is_shared_every_ability(): void
    {
        $this->actingAs($this->admin())->get('/admin')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('auth.user.abilities', array_keys(User::ABILITIES)));
    }
}
