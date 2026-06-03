<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\SiteContent;
use Inertia\Inertia;
use Inertia\Response;

class SelfBuildController extends Controller
{
    /**
     * "Self Build" — a content-only service page built around a vertical
     * Process Flow timeline (8 steps). Both EN + AR bundles are sent so language
     * switching is instant (CLAUDE.md instant-language pattern).
     */
    public function show(): Response
    {
        // Page-level visibility (innovation #5): a 404 when the page is missing
        // or has been toggled off in the admin Site Content editor.
        $page = Page::getBySlug('self_build');
        abort_if($page === null || ! $page->is_visible, 404);

        return Inertia::render('Public/SelfBuild', [
            'content_en' => SiteContent::getPage('self_build', 'en'),
            'content_ar' => SiteContent::getPage('self_build', 'ar'),
            // Per-page SEO (admin-editable; client falls back to hero copy).
            'seo' => [
                'title_en' => $page->seo_title_en,
                'title_ar' => $page->seo_title_ar,
                'description_en' => $page->seo_description_en,
                'description_ar' => $page->seo_description_ar,
            ],
            // Absolute URL for canonical / og:url / hreflang / JSON-LD.
            'url' => route('self-build'),
        ]);
    }
}
