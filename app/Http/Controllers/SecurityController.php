<?php

namespace App\Http\Controllers;

use App\Models\SiteContent;
use Inertia\Inertia;
use Inertia\Response;

class SecurityController extends Controller
{
    /**
     * "Security With SkyAmman" — a content-only page built around three
     * hover-expanding pillars (Legal / Financial / Construction security).
     * Both EN + AR bundles are sent so language switching is instant
     * (CLAUDE.md instant-language pattern).
     */
    public function show(): Response
    {
        return Inertia::render('Public/Security', [
            'content_en' => SiteContent::getPage('security', 'en'),
            'content_ar' => SiteContent::getPage('security', 'ar'),
        ]);
    }
}
