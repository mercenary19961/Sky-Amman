<?php

namespace App\Http\Controllers;

use App\Models\Project;
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
        ]);
    }
}
