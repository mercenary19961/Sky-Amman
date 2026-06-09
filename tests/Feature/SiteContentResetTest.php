<?php

namespace Tests\Feature;

use App\Models\ChangeLog;
use App\Models\SiteContent;
use App\Models\User;
use Database\Seeders\SiteContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SiteContentResetTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SiteContentSeeder::class);
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin', 'is_active' => true]);
    }

    private function editor(): User
    {
        return User::factory()->create(['role' => 'editor', 'is_active' => true]);
    }

    public function test_admin_reset_restores_edited_content_to_defaults(): void
    {
        $row = SiteContent::where('page', 'home')->where('section', 'hero')->where('key', 'title')->firstOrFail();
        $default = $row->content_en;

        // Simulate an editor mangling the copy + hiding the row.
        $row->update(['content_en' => 'EDITED RUBBISH', 'content_ar' => 'محتوى معدّل', 'is_visible' => false]);

        $this->actingAs($this->admin())
            ->post('/admin/content/reset')
            ->assertRedirect();

        $row->refresh();
        $this->assertSame($default, $row->content_en);
        $this->assertTrue((bool) $row->is_visible);
    }

    public function test_reset_logs_a_revertable_change(): void
    {
        SiteContent::where('page', 'home')->where('section', 'hero')->where('key', 'title')
            ->update(['content_en' => 'EDITED']);

        $this->actingAs($this->admin())->post('/admin/content/reset');

        $log = ChangeLog::where('model_type', 'site_content')->where('model_id', 'all')->latest('id')->first();
        $this->assertNotNull($log);
        $this->assertSame('update', $log->action);
        $this->assertNull($log->reverted_at);
    }

    public function test_reset_is_a_no_op_when_already_default(): void
    {
        $this->actingAs($this->admin())->post('/admin/content/reset');

        // Nothing differed from the seeded defaults → no change-log entry written.
        $this->assertSame(0, ChangeLog::where('model_type', 'site_content')->count());
    }

    public function test_editor_cannot_reset(): void
    {
        SiteContent::where('page', 'home')->where('section', 'hero')->where('key', 'title')
            ->update(['content_en' => 'EDITED']);

        $this->actingAs($this->editor())
            ->post('/admin/content/reset')
            ->assertForbidden();

        $this->assertSame('EDITED', SiteContent::where('page', 'home')->where('section', 'hero')->where('key', 'title')->value('content_en'));
    }

    public function test_guest_cannot_reset(): void
    {
        $this->post('/admin/content/reset')->assertRedirect('/admin/login');
    }
}
