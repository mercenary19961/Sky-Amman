<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\Project;
use App\Models\Setting;
use App\Models\SiteContent;
use App\Models\Testimonial;
use App\Models\TestimonialVideo;
use App\Services\InstagramService;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Renders the public homepage. Both EN and AR content bundles are sent so the
     * client can swap languages without an HTTP round-trip (instant-language
     * pattern from CLAUDE.md).
     */
    public function __construct(private readonly InstagramService $instagram)
    {
    }

    public function index(): Response
    {
        // Page-level visibility (innovation #5) + per-page SEO (overrides the
        // site-wide Settings defaults on the client when set).
        $page = Page::getBySlug('home');
        abort_if($page === null || ! $page->is_visible, 404);

        $featured = Project::active()
            ->featured()
            ->ordered()
            ->take(24)
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
            ]);

        // Split featured listings by status so each homepage carousel pulls from
        // its own slice of the unified projects table.
        $featuredProjects = $featured->where('listing_status', 'for_sale')->values();
        $featuredRentals = $featured->where('listing_status', 'for_rent')->values();

        return Inertia::render('Public/Home', [
            'content_en' => SiteContent::getPage('home', 'en'),
            'content_ar' => SiteContent::getPage('home', 'ar'),
            'featuredProjects' => $featuredProjects,
            'featuredRentals' => $featuredRentals,
            // Testimonials carousel — the (max 3) active videos in admin order.
            'testimonialVideos' => TestimonialVideo::active()->ordered()->limit(3)->pluck('url')->all(),
            // Client testimonial cards (image + bilingual name/quote), admin order.
            'testimonials' => Testimonial::active()->ordered()->with('media:id,path,mime_type')->get()
                ->map(fn (Testimonial $t) => [
                    'name_en'   => $t->name_en,
                    'name_ar'   => $t->name_ar,
                    'quote_en'  => $t->quote_en,
                    'quote_ar'  => $t->quote_ar,
                    'image_url' => $t->media?->url,
                ])->all(),
            'mediaEmbeds' => [
                'linkedin' => Setting::get('linkedin_embed_url', ''),
            ],
            // Instagram grid is now driven by the Graph API via InstagramService
            // (cached 1h); the old instagram_embed_url setting is no longer used.
            'instagramPosts' => $this->instagram->getRecentMedia(9),
            // Per-page SEO (admin-editable; client falls back to site-wide defaults).
            'seo' => [
                'title_en' => $page->seo_title_en,
                'title_ar' => $page->seo_title_ar,
                'description_en' => $page->seo_description_en,
                'description_ar' => $page->seo_description_ar,
            ],
            'url' => route('home'),
        ]);
    }
}
