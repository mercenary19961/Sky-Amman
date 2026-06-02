<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectImage;
use App\Models\Setting;
use App\Models\SiteContent;
use Inertia\Inertia;
use Inertia\Response;

class PropertiesController extends Controller
{
    /**
     * Public Properties listings page. Pulls all active projects from the
     * unified `projects` table; the client filters them by `category` via the
     * filter pills. Both EN + AR content bundles are sent so language switching
     * is instant (CLAUDE.md instant-language pattern).
     */
    public function index(): Response
    {
        $projects = Project::active()
            ->ordered()
            ->get(['id', 'slug', 'title_en', 'title_ar', 'category', 'listing_status', 'group', 'location_en', 'location_ar', 'area_sqm'])
            ->map(fn (Project $p) => [
                'id' => $p->id,
                'slug' => $p->slug,
                'title_en' => $p->title_en,
                'title_ar' => $p->title_ar,
                'category' => $p->category,
                'listing_status' => $p->listing_status,
                'group' => $p->group,
                'location_en' => $p->location_en,
                'location_ar' => $p->location_ar,
                'area_sqm' => $p->area_sqm,
                // Placeholder image path until the Media Library is live.
                'image_url' => "/images/projects/{$p->slug}.svg",
            ]);

        return Inertia::render('Public/Properties', [
            'content_en' => SiteContent::getPage('properties', 'en'),
            'content_ar' => SiteContent::getPage('properties', 'ar'),
            'projects' => $projects,
            'galleryImages' => $this->galleryImages(),
        ]);
    }

    /**
     * Single property detail page. Loads one active project by slug with its
     * gallery, a handful of related listings, and the site map embed. All
     * bilingual fields are sent raw so the client swaps language instantly.
     */
    public function show(string $slug): Response
    {
        $project = Project::active()
            ->where('slug', $slug)
            ->with(['images.media'])
            ->firstOrFail();

        // Gallery banners — uploaded gallery images (placeholder shown as the
        // hero when none exist yet).
        $gallery = $project->images
            ->filter(fn (ProjectImage $img) => $img->media !== null)
            ->map(fn (ProjectImage $img) => [
                'id' => $img->id,
                'url' => route('media.serve', $img->media_id, false),
                'alt' => $project->title_en,
            ])
            ->values()
            ->all();

        $heroUrl = $gallery[0]['url'] ?? "/images/projects/{$project->slug}.svg";

        // Related listings — other active projects (for the "Find homes…" row).
        $related = Project::active()
            ->where('id', '!=', $project->id)
            ->ordered()
            ->take(6)
            ->get(['id', 'slug', 'title_en', 'title_ar', 'listing_status'])
            ->map(fn (Project $p) => [
                'id' => $p->id,
                'slug' => $p->slug,
                'title_en' => $p->title_en,
                'title_ar' => $p->title_ar,
                'listing_status' => $p->listing_status,
                'image_url' => "/images/projects/{$p->slug}.svg",
            ])
            ->all();

        return Inertia::render('Public/PropertyDetail', [
            'project' => [
                'id' => $project->id,
                'slug' => $project->slug,
                'title_en' => $project->title_en,
                'title_ar' => $project->title_ar,
                'listing_status' => $project->listing_status,
                'address_en' => $project->address_en,
                'address_ar' => $project->address_ar,
                'location_en' => $project->location_en,
                'location_ar' => $project->location_ar,
                'description_en' => $project->description_en,
                'description_ar' => $project->description_ar,
                'area_sqm' => $project->area_sqm,
                'completion_year' => $project->completion_year,
                'floors' => $project->floors,
                'bedrooms' => $project->bedrooms,
                'bathrooms' => $project->bathrooms,
                'hero_url' => $heroUrl,
            ],
            'gallery' => $gallery,
            'related' => $related,
            'mapEmbedUrl' => Setting::get('google_maps_embed_url', ''),
        ]);
    }

    /**
     * Builds the "Projects Gallery" image set. The pool is every active
     * project's gallery images, falling back to each project's placeholder
     * render when it has no uploaded gallery yet. `gallery_mode` decides between
     * a random subset per visit (`shuffle`) or an admin-ordered manual list.
     */
    private function galleryImages(): array
    {
        if (! (bool) Setting::get('gallery_enabled', true)) {
            return [];
        }

        $count = max(1, (int) Setting::get('gallery_count', 6));
        $mode = Setting::get('gallery_mode', 'shuffle');

        $pool = Project::active()
            ->ordered()
            ->with(['images.media'])
            ->get()
            ->flatMap(function (Project $p) {
                if ($p->images->isNotEmpty()) {
                    return $p->images
                        ->filter(fn (ProjectImage $img) => $img->media !== null)
                        ->map(fn (ProjectImage $img) => [
                            'id' => "img-{$img->id}",
                            'url' => route('media.serve', $img->media_id, false),
                            'alt' => $p->title_en,
                        ]);
                }

                // No uploaded gallery → use the project's placeholder render.
                return [[
                    'id' => "slug-{$p->slug}",
                    'url' => "/images/projects/{$p->slug}.svg",
                    'alt' => $p->title_en,
                ]];
            })
            ->values();

        if ($mode === 'manual') {
            $manual = json_decode((string) Setting::get('gallery_manual', '[]'), true) ?: [];
            $byId = $pool->keyBy('id');

            return collect($manual)
                ->map(fn ($id) => $byId->get($id))
                ->filter()
                ->take($count)
                ->values()
                ->all();
        }

        // Shuffle: a fresh random subset on every page load.
        return $pool->shuffle()->take($count)->values()->all();
    }
}
