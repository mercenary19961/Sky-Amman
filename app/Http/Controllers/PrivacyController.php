<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\SiteContent;
use Inertia\Inertia;
use Inertia\Response;

class PrivacyController extends Controller
{
    /**
     * Privacy Policy — content-only page, same shape as About / Security.
     *
     * Linked from the footer AND from the cookie banner, so it is the one
     * content page that should stay visible: hiding it in the admin leaves two
     * dead links rather than just removing a nav item.
     */
    public function show(): Response
    {
        $page = Page::getBySlug('privacy');
        abort_if($page === null || ! $page->is_visible, 404);

        return Inertia::render('Public/Privacy', [
            'content_en' => SiteContent::getPage('privacy', 'en'),
            'content_ar' => SiteContent::getPage('privacy', 'ar'),
            'seo' => [
                'title_en' => $page->seo_title_en,
                'title_ar' => $page->seo_title_ar,
                'description_en' => $page->seo_description_en,
                'description_ar' => $page->seo_description_ar,
            ],
            'url' => route('privacy'),
        ]);
    }
}
