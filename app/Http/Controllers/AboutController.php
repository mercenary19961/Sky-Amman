<?php

namespace App\Http\Controllers;

use App\Models\ManagedImage;
use App\Models\Page;
use App\Models\SiteContent;
use Inertia\Inertia;
use Inertia\Response;

class AboutController extends Controller
{
    /**
     * "About Us" — content-only page (intro, crafted developments, mission,
     * vision, leadership). Both EN + AR bundles are sent so language switching
     * is instant (CLAUDE.md instant-language pattern).
     */
    public function show(): Response
    {
        // Page-level visibility (innovation #5): a 404 when the page is missing
        // or has been toggled off in the admin Site Content editor.
        $page = Page::getBySlug('about');
        abort_if($page === null || ! $page->is_visible, 404);

        return Inertia::render('Public/About', [
            'content_en' => SiteContent::getPage('about', 'en'),
            'content_ar' => SiteContent::getPage('about', 'ar'),
            // Admin-replaceable "Crafted" cluster images (fall back to defaults).
            'craftedImages' => ManagedImage::urls(['about_crafted_1', 'about_crafted_2', 'about_crafted_3']),
            // Per-page SEO (admin-editable; client falls back to page copy).
            'seo' => [
                'title_en' => $page->seo_title_en,
                'title_ar' => $page->seo_title_ar,
                'description_en' => $page->seo_description_en,
                'description_ar' => $page->seo_description_ar,
            ],
            // Absolute URL for canonical / og:url / hreflang / JSON-LD.
            'url' => route('about'),
        ]);
    }
}
