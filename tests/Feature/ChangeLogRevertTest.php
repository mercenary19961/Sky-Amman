<?php

namespace Tests\Feature;

use App\Models\ChangeLog;
use App\Models\ContactSubmission;
use App\Models\Project;
use App\Models\Setting;
use App\Models\User;
use App\Services\ChangeLogService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The Change Log's per-entry Revert is the admin's safety net. ChangeLogFilterTest
 * covers the listing/filters; this covers the actual restore-from-history matrix:
 * settings + project updates roll values back, deletes restore soft-deleted rows,
 * non-revertable (action, section) pairs are refused, and a reverted entry can't
 * be reverted twice. Plus the admin-only route guard.
 */
class ChangeLogRevertTest extends TestCase
{
    use RefreshDatabase;

    private ChangeLogService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(ChangeLogService::class);
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin', 'is_active' => true]);
    }

    public function test_reverting_a_settings_update_restores_the_old_value(): void
    {
        $this->actingAs($this->admin());
        Setting::set('company_phone', 'NEW');

        $log = $this->service->log('settings', 'all', ChangeLog::ACTION_UPDATE,
            ['company_phone' => 'OLD'], ['company_phone' => 'NEW'], 'Settings');

        $this->assertNotNull($log);
        $this->assertTrue($this->service->revert($log));
        $this->assertSame('OLD', Setting::get('company_phone'));
        $this->assertTrue($log->fresh()->isReverted());
    }

    public function test_reverting_a_project_update_restores_its_fields(): void
    {
        $this->actingAs($this->admin());
        $project = Project::create([
            'title_en' => 'New Name', 'title_ar' => 'اسم', 'slug' => 'rv-villa',
            'category' => 'ready', 'listing_status' => 'for_sale', 'is_active' => true,
        ]);

        $log = $this->service->log('project', $project->id, ChangeLog::ACTION_UPDATE,
            ['title_en' => 'Old Name', 'title_ar' => 'اسم'],
            ['title_en' => 'New Name', 'title_ar' => 'اسم'],
            'Villa');

        $this->assertTrue($this->service->revert($log));
        $this->assertSame('Old Name', $project->fresh()->title_en);
    }

    public function test_reverting_a_project_delete_restores_the_record(): void
    {
        $this->actingAs($this->admin());
        $project = Project::create([
            'title_en' => 'Doomed', 'title_ar' => 'محكوم', 'slug' => 'del-villa',
            'category' => 'ready', 'listing_status' => 'for_sale', 'is_active' => true,
        ]);
        $id = $project->id;
        $snapshot = $project->toArray();
        $project->delete();
        $this->assertSoftDeleted('projects', ['id' => $id]);

        $log = $this->service->log('project', $id, ChangeLog::ACTION_DELETE, $snapshot, null, 'Doomed');

        $this->assertTrue($this->service->revert($log));
        $this->assertDatabaseHas('projects', ['id' => $id, 'deleted_at' => null]);
    }

    public function test_reverting_a_contact_delete_restores_it(): void
    {
        $this->actingAs($this->admin());
        $contact = ContactSubmission::create([
            'name' => 'Lead', 'email' => 'lead@example.com', 'phone' => '+962770770123',
            'request_type' => 'general', 'message' => 'Hi',
        ]);
        $id = $contact->id;
        $snapshot = $contact->toArray();
        $contact->delete();

        $log = $this->service->log('contact', $id, ChangeLog::ACTION_DELETE, $snapshot, null, 'Lead');

        $this->assertTrue($this->service->revert($log));
        $this->assertDatabaseHas('contact_submissions', ['id' => $id, 'deleted_at' => null]);
    }

    public function test_settings_create_is_not_revertable(): void
    {
        $this->actingAs($this->admin());

        // Settings only ever update (key/value, no create/delete) → a create entry
        // sits outside the revert matrix.
        $log = $this->service->log('settings', 'x', ChangeLog::ACTION_CREATE, null, ['k' => 'v'], 'Settings');

        $this->assertFalse($this->service->revertable($log));
        $this->assertFalse($this->service->revert($log));
    }

    public function test_an_already_reverted_entry_cannot_be_reverted_again(): void
    {
        $this->actingAs($this->admin());
        Setting::set('company_email', 'new@example.com');

        $log = $this->service->log('settings', 'all', ChangeLog::ACTION_UPDATE,
            ['company_email' => 'old@example.com'], ['company_email' => 'new@example.com'], 'Settings');

        $this->assertTrue($this->service->revert($log));
        $this->assertFalse($this->service->revert($log->fresh()));
    }

    public function test_only_admins_can_revert_via_the_route(): void
    {
        $admin = $this->admin();
        $this->actingAs($admin);
        Setting::set('company_phone', 'NEW');
        $log = $this->service->log('settings', 'all', ChangeLog::ACTION_UPDATE,
            ['company_phone' => 'OLD'], ['company_phone' => 'NEW'], 'Settings');

        // Editors are blocked by the admin middleware — value stays put.
        $editor = User::factory()->create(['role' => 'editor', 'is_active' => true]);
        $this->actingAs($editor)
            ->post("/admin/change-log/{$log->id}/revert")
            ->assertForbidden();
        $this->assertSame('NEW', Setting::get('company_phone'));

        // Admin can.
        $this->actingAs($admin)
            ->post("/admin/change-log/{$log->id}/revert")
            ->assertRedirect();
        $this->assertSame('OLD', Setting::get('company_phone'));
    }
}
