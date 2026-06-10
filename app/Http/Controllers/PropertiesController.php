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
            ->with(['images.media:id,path,mime_type', 'featuredImage:id', 'ogImage:id'])
            ->get(['id', 'slug', 'title_en', 'title_ar', 'category', 'listing_status', 'group', 'location_en', 'location_ar', 'area_sqm', 'land_area_sqm', 'featured_image_id', 'og_image_id'])
            ->map(function (Project $p) {
                $images = $p->displayImageUrls();

                return [
                    'id' => $p->id,
                    'slug' => $p->slug,
                    'title_en' => $p->title_en,
                    'title_ar' => $p->title_ar,
                    'category' => $p->category,
                    'listing_status' => $p->listing_status,
                    'group' => $p->group,
                    'location_en' => $p->location_en,
                    'location_ar' => $p->location_ar,
                    'area_sqm' => $p->area_sqm,            // built-up area
                    'land_area_sqm' => $p->land_area_sqm,
                    // Full swappable image set (featured/OG first). image_url is the
                    // lead image, kept for back-compat (homepage card / OG fallback).
                    'images' => $images,
                    'image_url' => $images[0],
                ];
            });

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
            ->with(['images.media', 'featuredImage:id', 'ogImage:id'])
            ->firstOrFail();

        // Full image set for the hero + thumbnail row + lightbox. Uses the
        // project's uploaded gallery; falls back to a demo set of villa renders
        // until real galleries are uploaded so the gallery/lightbox is testable.
        // The featured (lead) image is floated to the front, then the OG pick.
        $featuredId = $project->featured_image_id;
        $ogId = $project->og_image_id;
        $images = $project->images
            ->filter(fn (ProjectImage $img) => $img->media !== null)
            ->sortBy(fn (ProjectImage $img) => $img->media_id === $featuredId ? 0 : ($img->media_id === $ogId ? 1 : 2))
            ->map(fn (ProjectImage $img) => [
                'id' => "img-{$img->id}",
                'url' => route('media.serve', $img->media_id, false),
                'alt' => $project->title_en,
            ])
            ->values()
            ->all();

        if (empty($images)) {
            // No uploaded gallery yet → fall back to the committed render (or placeholder).
            $images = collect($project->displayImageUrls())->map(fn (string $url, int $i) => [
                'id' => "fallback-{$i}",
                'url' => $url,
                'alt' => $project->title_en,
            ])->all();
        }

        // Related listings — same-category projects first, then the rest, for
        // the "Find homes…" row.
        $related = Project::active()
            ->where('id', '!=', $project->id)
            ->with(['images.media:id,path,mime_type', 'featuredImage:id', 'ogImage:id'])
            ->orderByRaw('CASE WHEN category = ? THEN 0 ELSE 1 END', [$project->category])
            ->orderBy('sort_order')
            ->orderBy('id', 'desc')
            ->take(6)
            ->get(['id', 'slug', 'title_en', 'title_ar', 'listing_status', 'featured_image_id', 'og_image_id'])
            ->map(fn (Project $p) => [
                'id' => $p->id,
                'slug' => $p->slug,
                'title_en' => $p->title_en,
                'title_ar' => $p->title_ar,
                'listing_status' => $p->listing_status,
                'image_url' => $p->displayImageUrls()[0],
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
                'area_sqm' => $project->area_sqm,            // built-up area
                'land_area_sqm' => $project->land_area_sqm,
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
                // Absolute URLs for canonical link + OG image + JSON-LD. OG prefers
                // the admin's chosen OG image, else the project's lead image.
                'url' => route('properties.show', $project->slug),
                'og_image' => url($project->ogImage ? route('media.serve', $ogId, false) : $images[0]['url']),
            ],
            'images' => $images,
            'related' => $related,
            'mapEmbedUrl' => Setting::get('google_maps_embed_url', ''),
        ]);
    }

    /**
     * The public "Projects Gallery" image set: the full pool (sold-project images
     * + editor uploads, see GalleryImage::pool) minus any images the editor hid
     * (the `gallery_hidden` setting), shuffled on every visit (so the order
     * changes each refresh) and capped. The client shows a window of
     * `gallery_count` tiles and pages through the rest with the arrows.
     */
    private function galleryImages(): array
    {
        if (! (bool) Setting::get('gallery_enabled', true)) {
            return [];
        }

        $hidden = json_decode((string) Setting::get('gallery_hidden', '[]'), true) ?: [];

        return GalleryImage::pool()
            ->reject(fn (array $img) => in_array($img['id'], $hidden, true))
            ->map(fn (array $img) => ['id' => $img['id'], 'url' => $img['url'], 'alt' => $img['alt']])
            ->shuffle()
            ->take(60) // bound the payload; surplus rotates in on the next refresh
            ->values()
            ->all();
    }
}
