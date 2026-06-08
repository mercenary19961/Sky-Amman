<?php

namespace App\Http\Controllers;

use App\Models\GalleryImage;
use App\Models\Page;
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
        // Page-level visibility (innovation #5) + per-page SEO (overrides the
        // site-wide Settings defaults on the client when set).
        $page = Page::getBySlug('properties');
        abort_if($page === null || ! $page->is_visible, 404);

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
            // How many gallery tiles to show per view (desktop); the carousel
            // pages through the rest. Admin-editable in Projects Gallery.
            'galleryPerView' => max(1, (int) Setting::get('gallery_count', 6)),
            // Per-page SEO (admin-editable; client falls back to site-wide defaults).
            'seo' => [
                'title_en' => $page->seo_title_en,
                'title_ar' => $page->seo_title_ar,
                'description_en' => $page->seo_description_en,
                'description_ar' => $page->seo_description_ar,
            ],
            'url' => route('properties'),
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

        // Full image set for the hero + thumbnail row + lightbox. Uses the
        // project's uploaded gallery; falls back to a demo set of villa renders
        // until real galleries are uploaded so the gallery/lightbox is testable.
        $images = $project->images
            ->filter(fn (ProjectImage $img) => $img->media !== null)
            ->map(fn (ProjectImage $img) => [
                'id' => "img-{$img->id}",
                'url' => route('media.serve', $img->media_id, false),
                'alt' => $project->title_en,
            ])
            ->values()
            ->all();

        if (empty($images)) {
            $images = collect([
                '/images/properties/detail-hero.webp',
                '/images/properties/properties-hero.webp',
                '/images/properties/find-the-right-space.webp',
                '/images/home/hero-villa-trimmed.webp',
            ])->map(fn (string $url, int $i) => [
                'id' => "demo-{$i}",
                'url' => $url,
                'alt' => $project->title_en,
            ])->all();
        }

        // Related listings — same-category projects first, then the rest, for
        // the "Find homes…" row.
        $related = Project::active()
            ->where('id', '!=', $project->id)
            ->orderByRaw('CASE WHEN category = ? THEN 0 ELSE 1 END', [$project->category])
            ->orderBy('sort_order')
            ->orderBy('id', 'desc')
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
                // Spec keys the editor chose to hide on the detail page.
                'hidden_specs' => $project->hidden_specs ?? [],
                // Per-listing SEO (falls back to title/description on the client).
                'seo_title_en' => $project->seo_title_en,
                'seo_title_ar' => $project->seo_title_ar,
                'seo_description_en' => $project->seo_description_en,
                'seo_description_ar' => $project->seo_description_ar,
                // Absolute URLs for canonical link + OG image + JSON-LD.
                'url' => route('properties.show', $project->slug),
                'og_image' => url($images[0]['url']),
            ],
            'images' => $images,
            'related' => $related,
            'mapEmbedUrl' => Setting::get('google_maps_embed_url', ''),
        ]);
    }

    /**
     * Builds the "Projects Gallery" image set: images from SOLD projects
     * (showcasing completed work) PLUS any images the editor has curated in
     * Admin → Projects Gallery. A sold project with no uploaded gallery falls
     * back to its placeholder render. The whole pool is shuffled on every visit
     * (so the order changes each refresh) and capped; the client shows a window
     * of `gallery_count` tiles and pages through the rest with the arrows.
     */
    private function galleryImages(): array
    {
        if (! (bool) Setting::get('gallery_enabled', true)) {
            return [];
        }

        // Bound the payload — the carousel pages through this; anything beyond
        // rotates in on the next refresh (the pool is re-shuffled each visit).
        $cap = 60;

        // Images from sold projects.
        $soldPool = Project::active()
            ->where('listing_status', 'sold')
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
            });

        // Editor-curated gallery images.
        $editorPool = GalleryImage::ordered()
            ->with('media')
            ->get()
            ->filter(fn (GalleryImage $g) => $g->media !== null)
            ->map(fn (GalleryImage $g) => [
                'id' => "gal-{$g->id}",
                'url' => route('media.serve', $g->media_id, false),
                'alt' => '',
            ]);

        // Fresh random order on every page load.
        return $soldPool->concat($editorPool)->shuffle()->take($cap)->values()->all();
    }
}
