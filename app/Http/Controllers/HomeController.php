<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Setting;
use App\Models\SiteContent;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Renders the public homepage. Both EN and AR content bundles are sent so the
     * client can swap languages without an HTTP round-trip (instant-language
     * pattern from CLAUDE.md).
     */
    public function index(): Response
    {
        $featuredProjects = Project::active()
            ->featured()
            ->ordered()
            ->take(12)
            ->get(['id', 'slug', 'title_en', 'title_ar', 'category', 'listing_status', 'location_en', 'location_ar', 'area_sqm'])
            ->map(fn (Project $p) => [
                'id' => $p->id,
                'slug' => $p->slug,
                'title_en' => $p->title_en,
                'title_ar' => $p->title_ar,
                'category' => $p->category,
                'listing_status' => $p->listing_status,
                'location_en' => $p->location_en,
                'location_ar' => $p->location_ar,
                'area_sqm' => $p->area_sqm,
                // Placeholder image path — falls back to /images/projects/{slug}.svg
                // until the Media Library is live and admin can attach real renders.
                'image_url' => "/images/projects/{$p->slug}.svg",
            ])
            ->values();

        return Inertia::render('Public/Home', [
            'content_en' => SiteContent::getPage('home', 'en'),
            'content_ar' => SiteContent::getPage('home', 'ar'),
            'featuredProjects' => $featuredProjects,
            'mediaEmbeds' => [
                'linkedin' => Setting::get('linkedin_embed_url', ''),
                'instagram' => Setting::get('instagram_embed_url', ''),
            ],
        ]);
    }
}
