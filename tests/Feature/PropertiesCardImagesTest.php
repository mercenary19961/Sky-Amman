<?php

namespace Tests\Feature;

use App\Models\Media;
use App\Models\Project;
use App\Models\ProjectImage;
use Database\Seeders\PagesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PropertiesCardImagesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PagesSeeder::class); // 'properties' page must exist + be visible
    }

    private function media(string $name): Media
    {
        return Media::create([
            'filename'          => $name,
            'original_filename' => $name,
            'path'              => "media/projects/{$name}",
            'mime_type'         => 'image/webp',
            'size'              => 1,
            'folder'            => 'projects',
        ]);
    }

    public function test_card_uses_uploaded_images_with_featured_first(): void
    {
        $project = Project::create([
            'title_en' => 'Test Villa', 'title_ar' => 'فيلا',
            'slug' => 'test-villa', 'category' => 'ready',
            'listing_status' => 'for_sale', 'is_active' => true,
        ]);

        $m1 = $this->media('one.webp');
        $m2 = $this->media('two.webp');
        ProjectImage::create(['project_id' => $project->id, 'media_id' => $m1->id, 'sort_order' => 1]);
        ProjectImage::create(['project_id' => $project->id, 'media_id' => $m2->id, 'sort_order' => 2]);

        // Make the SECOND gallery image the featured one — it must lead the array.
        $project->update(['featured_image_id' => $m2->id]);

        $this->get('/properties')->assertInertia(fn (Assert $p) => $p
            ->has('projects', 1)
            ->has('projects.0.images', 2)
            ->where('projects.0.images.0', route('media.serve', $m2->id, false))
            ->where('projects.0.image_url', route('media.serve', $m2->id, false)));
    }

    public function test_card_falls_back_to_placeholder_without_images(): void
    {
        Project::create([
            'title_en' => 'No Images', 'title_ar' => 'بدون صور',
            'slug' => 'no-images', 'category' => 'ready',
            'listing_status' => 'for_sale', 'is_active' => true,
        ]);

        $this->get('/properties')->assertInertia(fn (Assert $p) => $p
            ->has('projects.0.images', 1)
            ->where('projects.0.images.0', '/images/projects/no-images.svg'));
    }
}
