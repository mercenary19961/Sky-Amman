<?php

namespace Tests\Feature;

use App\Models\Media;
use App\Models\Project;
use App\Models\ProjectImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProjectShowTest extends TestCase
{
    use RefreshDatabase;

    private function user(string $role = 'admin'): User
    {
        return User::factory()->create(['role' => $role, 'is_active' => true]);
    }

    private function project(): Project
    {
        return Project::create([
            'title_en' => 'Show Villa', 'title_ar' => 'فيلا',
            'slug' => 'show-villa', 'category' => 'ready',
            'listing_status' => 'for_sale', 'is_active' => true,
            'area_sqm' => 320, 'bedrooms' => 4,
        ]);
    }

    public function test_show_renders_project_detail(): void
    {
        $project = $this->project();

        $this->actingAs($this->user())
            ->get("/admin/projects/{$project->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $p) => $p
                ->component('Admin/Projects/Show')
                ->where('project.id', $project->id)
                ->where('project.title_en', 'Show Villa')
                ->where('project.area_sqm', 320));
    }

    public function test_show_flags_featured_and_og_images(): void
    {
        $project = $this->project();

        $m1 = Media::create(['filename' => 'a.webp', 'original_filename' => 'a.webp', 'path' => 'media/projects/a.webp', 'mime_type' => 'image/webp', 'size' => 1, 'folder' => 'projects']);
        $m2 = Media::create(['filename' => 'b.webp', 'original_filename' => 'b.webp', 'path' => 'media/projects/b.webp', 'mime_type' => 'image/webp', 'size' => 1, 'folder' => 'projects']);
        ProjectImage::create(['project_id' => $project->id, 'media_id' => $m1->id, 'sort_order' => 1]);
        ProjectImage::create(['project_id' => $project->id, 'media_id' => $m2->id, 'sort_order' => 2]);
        $project->update(['featured_image_id' => $m1->id, 'og_image_id' => $m2->id]);

        $this->actingAs($this->user())
            ->get("/admin/projects/{$project->id}")
            ->assertInertia(fn (Assert $p) => $p
                ->has('project.images', 2)
                ->where('project.images.0.is_featured', true)
                ->where('project.images.1.is_og', true));
    }

    public function test_editor_can_view_show(): void
    {
        $project = $this->project();

        $this->actingAs($this->user('editor'))
            ->get("/admin/projects/{$project->id}")
            ->assertOk();
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $project = $this->project();

        $this->get("/admin/projects/{$project->id}")->assertRedirect('/admin/login');
    }

    public function test_missing_project_404s(): void
    {
        $this->actingAs($this->user())
            ->get('/admin/projects/99999')
            ->assertNotFound();
    }

    public function test_editor_can_toggle_active(): void
    {
        $project = $this->project(); // starts active

        $this->actingAs($this->user('editor'))
            ->post("/admin/projects/{$project->id}/status", ['is_active' => false])
            ->assertRedirect();

        $this->assertFalse($project->fresh()->is_active);
    }

    public function test_editor_can_mark_sold(): void
    {
        $project = $this->project(); // for_sale

        $this->actingAs($this->user('editor'))
            ->post("/admin/projects/{$project->id}/status", ['listing_status' => 'sold'])
            ->assertRedirect();

        $this->assertSame('sold', $project->fresh()->listing_status);
    }

    public function test_invalid_listing_status_is_rejected(): void
    {
        $project = $this->project();

        $this->actingAs($this->user())
            ->post("/admin/projects/{$project->id}/status", ['listing_status' => 'bogus'])
            ->assertSessionHasErrors('listing_status');

        $this->assertSame('for_sale', $project->fresh()->listing_status);
    }

    public function test_status_change_is_logged(): void
    {
        $project = $this->project();

        $this->actingAs($this->user())
            ->post("/admin/projects/{$project->id}/status", ['listing_status' => 'sold']);

        $this->assertDatabaseHas('change_logs', [
            'model_type' => 'project',
            'model_id'   => (string) $project->id,
            'action'     => 'update',
        ]);
    }

    public function test_guest_cannot_change_status(): void
    {
        $project = $this->project();

        $this->post("/admin/projects/{$project->id}/status", ['is_active' => false])
            ->assertRedirect('/admin/login');

        $this->assertTrue($project->fresh()->is_active);
    }
}
