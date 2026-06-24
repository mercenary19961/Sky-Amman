<?php

namespace Tests\Unit;

use App\Models\Media;
use App\Models\Project;
use App\Models\ProjectImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Project::displayImageUrls() is the single source for a listing's images across
 * the public card/detail AND the admin views, with a 4-tier fallback so a project
 * always shows something. This walks the whole chain:
 *   1. uploaded gallery Media (featured/OG first, deduped);
 *   2. a committed gallery folder /images/projects/{slug}/NN.webp;
 *   3. a single committed render /images/projects/{slug}.webp;
 *   4. the generic placeholder.
 */
class ProjectImagesTest extends TestCase
{
    use RefreshDatabase;

    /** @var string[] files created under public/ to remove afterwards */
    private array $tempFiles = [];
    /** @var string[] dirs created under public/ to remove afterwards */
    private array $tempDirs = [];

    protected function tearDown(): void
    {
        foreach ($this->tempFiles as $f) {
            if (is_file($f)) {
                @unlink($f);
            }
        }
        foreach ($this->tempDirs as $d) {
            if (is_dir($d)) {
                @rmdir($d);
            }
        }

        parent::tearDown();
    }

    private function project(string $slug): Project
    {
        return Project::create([
            'title_en' => 'Villa', 'title_ar' => 'فيلا', 'slug' => $slug,
            'category' => 'ready', 'listing_status' => 'for_sale', 'is_active' => true,
        ]);
    }

    private function media(string $name): Media
    {
        return Media::create([
            'filename' => $name, 'original_filename' => $name,
            'path' => "media/projects/{$name}", 'mime_type' => 'image/webp',
            'size' => 1, 'folder' => 'projects',
        ]);
    }

    private function slug(string $prefix): string
    {
        // Random suffix so a test slug never collides with a committed asset folder.
        return $prefix . '-' . Str::lower(Str::random(8));
    }

    public function test_uploaded_media_lead_with_featured_then_og_then_rest_deduped(): void
    {
        $p = $this->project($this->slug('uploaded'));
        $m1 = $this->media('a.webp');
        $m2 = $this->media('b.webp');
        $m3 = $this->media('c.webp');
        ProjectImage::create(['project_id' => $p->id, 'media_id' => $m1->id, 'sort_order' => 1]);
        ProjectImage::create(['project_id' => $p->id, 'media_id' => $m2->id, 'sort_order' => 2]);
        ProjectImage::create(['project_id' => $p->id, 'media_id' => $m3->id, 'sort_order' => 3]);

        // Featured + OG also live in the gallery → must appear once, up front.
        $p->update(['featured_image_id' => $m2->id, 'og_image_id' => $m3->id]);

        $urls = $p->fresh()->displayImageUrls();

        $this->assertSame([
            route('media.serve', $m2->id, false), // featured leads
            route('media.serve', $m3->id, false), // then OG
            route('media.serve', $m1->id, false), // then the remaining gallery image
        ], $urls);
        $this->assertSame(count($urls), count(array_unique($urls)), 'URLs must be deduped');
    }

    public function test_falls_back_to_committed_folder_when_no_uploads(): void
    {
        $slug = $this->slug('folder');
        $dir = public_path("images/projects/{$slug}");
        mkdir($dir, 0777, true);
        $this->tempDirs[] = $dir;

        // Create out of order to prove the result is sorted.
        foreach (['02.webp', '01.webp'] as $f) {
            $path = "{$dir}/{$f}";
            file_put_contents($path, 'x');
            $this->tempFiles[] = $path;
        }

        $this->assertSame([
            "/images/projects/{$slug}/01.webp",
            "/images/projects/{$slug}/02.webp",
        ], $this->project($slug)->displayImageUrls());
    }

    public function test_falls_back_to_a_single_committed_render(): void
    {
        $slug = $this->slug('render');
        $path = public_path("images/projects/{$slug}.webp");
        file_put_contents($path, 'x');
        $this->tempFiles[] = $path;

        $this->assertSame(
            ["/images/projects/{$slug}.webp"],
            $this->project($slug)->displayImageUrls()
        );
    }

    public function test_falls_back_to_placeholder_when_nothing_exists(): void
    {
        $this->assertSame(
            ['/images/projects/placeholder.svg'],
            $this->project($this->slug('empty'))->displayImageUrls()
        );
    }
}
