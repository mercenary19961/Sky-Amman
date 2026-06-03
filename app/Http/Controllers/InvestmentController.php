<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\SiteContent;
use Inertia\Inertia;
use Inertia\Response;

class InvestmentController extends Controller
{
    /**
     * "Investment" — a content-only editorial page (NOT a listings page).
     * Explains why to invest in Amman. Both EN + AR bundles are sent so language
     * switching is instant (CLAUDE.md instant-language pattern).
     */
    public function show(): Response
    {
        // Page-level visibility (innovation #5): a 404 when the page is missing
        // or has been toggled off in the admin Site Content editor.
        $page = Page::getBySlug('investment');
        abort_if($page === null || ! $page->is_visible, 404);

        return Inertia::render('Public/Investment', [
            'content_en' => SiteContent::getPage('investment', 'en'),
            'content_ar' => SiteContent::getPage('investment', 'ar'),
            // Per-page SEO (admin-editable; client falls back to hero copy).
            'seo' => [
                'title_en' => $page->seo_title_en,
                'title_ar' => $page->seo_title_ar,
                'description_en' => $page->seo_description_en,
                'description_ar' => $page->seo_description_ar,
            ],
            // Absolute URL for canonical / og:url / hreflang / JSON-LD.
            'url' => route('investment'),
        ]);
    }
}
