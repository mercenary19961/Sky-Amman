<?php

namespace Tests\Feature;

use App\Models\GalleryImage;
use App\Models\Media;
use App\Models\Project;
use App\Models\ProjectImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * GalleryImage::pool() feeds the public Projects-Gallery section: images from
 * active *sold* projects, concatenated with editor uploads. It must surface sold
 * work automatically, ignore still-available + inactive listings, and stamp a
 * stable per-item id the admin can hide by.
 */
class GalleryPoolTest extends TestCase
{
    use RefreshDatabase;

    private function media(string $name): Media
    {
        return Media::create([
            'filename' => $name, 'original_filename' => $name,
            'path' => "media/projects/{$name}", 'mime_type' => 'image/webp',
            'size' => 1, 'folder' => 'projects',
        ]);
    }

    private function project(string $slug, string $status, bool $active = true): Project
    {
        return Project::create([
            'title_en' => 'Villa', 'title_ar' => 'فيلا', 'slug' => $slug,
            'category' => 'ready', 'listing_status' => $status, 'is_active' => $active,
        ]);
    }

    public function test_pool_includes_editor_uploads(): void
    {
        $g = GalleryImage::create(['media_id' => $this->media('editor.webp')->id, 'sort_order' => 1]);

        $item = GalleryImage::pool()->firstWhere('id', "gal-{$g->id}");

        $this->assertNotNull($item);
        $this->assertSame('editor', $item['source']);
    }

    public function test_pool_includes_sold_images_but_excludes_available_ones(): void
    {
        $sold = $this->project('sold-' . Str::lower(Str::random(6)), 'sold');
        $soldImg = ProjectImage::create([
            'project_id' => $sold->id, 'media_id' => $this->media('sold.webp')->id, 'sort_order' => 1,
        ]);

        $forSale = $this->project('avail-' . Str::lower(Str::random(6)), 'for_sale');
        $availMedia = $this->media('avail.webp');
        ProjectImage::create(['project_id' => $forSale->id, 'media_id' => $availMedia->id, 'sort_order' => 1]);

        $pool = GalleryImage::pool();

        $this->assertNotNull($pool->firstWhere('id', "img-{$soldImg->id}"));
        // The still-available listing's image must never enter the pool.
        $this->assertTrue($pool->pluck('url')->doesntContain(route('media.serve', $availMedia->id, false)));
    }

    public function test_sold_project_without_media_uses_its_placeholder(): void
    {
        $sold = $this->project('sold-nomedia-' . Str::lower(Str::random(6)), 'sold');

        $item = GalleryImage::pool()->firstWhere('id', "proj-{$sold->id}-0");

        $this->assertNotNull($item);
        $this->assertSame('/images/projects/placeholder.svg', $item['url']);
    }

    public function test_inactive_sold_project_is_excluded(): void
    {
        $sold = $this->project('inactive-' . Str::lower(Str::random(6)), 'sold', active: false);
        $media = $this->media('inactive.webp');
        ProjectImage::create(['project_id' => $sold->id, 'media_id' => $media->id, 'sort_order' => 1]);

        $this->assertTrue(
            GalleryImage::pool()->pluck('url')->doesntContain(route('media.serve', $media->id, false))
        );
    }
}
