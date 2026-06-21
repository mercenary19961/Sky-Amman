<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactSubmission;
use App\Models\Page;
use App\Models\Project;
use App\Models\Setting;
use App\Models\SiteContent;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // ── Stat cards ────────────────────────────────────────────────────────
        $activeProjects       = Project::active()->count();
        $totalProjects        = Project::count();
        $inquiriesThisWeek    = ContactSubmission::where('created_at', '>=', now()->startOfWeek())->count();
        $totalInquiries       = ContactSubmission::count();
        $unreadInquiries      = ContactSubmission::unread()->count();
        $projectsWithoutImages = Project::active()->doesntHave('images')->count();

        // ── Inquiries last 30 days (fills zeros for missing days) ─────────────
        $start = now()->subDays(29)->startOfDay();
        $rawCounts = ContactSubmission::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', $start)
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('count', 'date');

        $dailyInquiries = [];
        for ($d = $start->copy(); $d->lte(now()); $d->addDay()) {
            $key = $d->format('Y-m-d');
            $dailyInquiries[] = ['date' => $key, 'count' => (int) ($rawCounts[$key] ?? 0)];
        }

        // ── Breakdowns ────────────────────────────────────────────────────────
        $inquiriesByType = ContactSubmission::selectRaw('request_type, COUNT(*) as count')
            ->groupBy('request_type')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($r) => ['type' => $r->request_type, 'count' => (int) $r->count]);

        $projectsByCategory = Project::selectRaw('category, COUNT(*) as count')
            ->groupBy('category')
            ->get()
            ->map(fn ($r) => ['category' => $r->category, 'count' => (int) $r->count]);

        // ── Content health ────────────────────────────────────────────────────
        $projectsMissingImages = Project::active()
            ->doesntHave('images')
            ->orderBy('sort_order')
            ->take(8)
            ->get(['id', 'title_en'])
            ->map(fn ($p) => ['id' => $p->id, 'title_en' => $p->title_en]);

        // Which SEO fields (title/description, EN + AR) are empty on a record.
        $seoGaps = function ($m): array {
            $gaps = [];
            if (blank($m->seo_title_en))       $gaps[] = 'Title';
            if (blank($m->seo_description_en)) $gaps[] = 'Description';
            if (blank($m->seo_title_ar))       $gaps[] = 'Title (AR)';
            if (blank($m->seo_description_ar)) $gaps[] = 'Desc (AR)';

            return $gaps;
        };

        // Pages with incomplete SEO. Footer is a layout pseudo-page (no public
        // URL), so it's excluded; hidden pages aren't indexed so they're skipped.
        $pagesMissingSeo = Page::query()
            ->where('is_visible', true)
            ->where('slug', '!=', 'footer')
            ->orderBy('sort_order')
            ->get(['slug', 'title_en', 'seo_title_en', 'seo_title_ar', 'seo_description_en', 'seo_description_ar'])
            ->map(fn ($p) => ['slug' => $p->slug, 'title_en' => $p->title_en, 'missing' => $seoGaps($p)])
            ->filter(fn ($p) => count($p['missing']) > 0)
            ->values();

        $projectsMissingSeo = Project::active()
            ->orderBy('sort_order')
            ->get(['id', 'title_en', 'seo_title_en', 'seo_title_ar', 'seo_description_en', 'seo_description_ar'])
            ->map(fn ($p) => ['id' => $p->id, 'title_en' => $p->title_en, 'missing' => $seoGaps($p)])
            ->filter(fn ($p) => count($p['missing']) > 0)
            ->take(8)
            ->values();

        // Per-project OG image (picked from the gallery) — empty means social
        // shares of that listing get no preview image.
        $projectsMissingOg = Project::active()
            ->whereNull('og_image_id')
            ->orderBy('sort_order')
            ->take(8)
            ->get(['id', 'title_en'])
            ->map(fn ($p) => ['id' => $p->id, 'title_en' => $p->title_en]);

        // Matches the social URLs the public Footer's "Follow us" column actually renders.
        $socialKeys = ['linkedin_url', 'facebook_url', 'youtube_url', 'instagram_url'];
        $emptySocialKeys = Setting::whereIn('key', $socialKeys)
            ->where(fn ($q) => $q->whereNull('value')->orWhere('value', ''))
            ->pluck('key')
            ->values();

        // Without these the homepage Media Room's Instagram grid silently hides — surface it.
        $instagramCredKeys = ['instagram_access_token', 'instagram_user_id'];
        $missingInstagramCreds = Setting::whereIn('key', $instagramCredKeys)
            ->where(fn ($q) => $q->whereNull('value')->orWhere('value', ''))
            ->pluck('key')
            ->values();

        $hiddenPages = Page::where('is_visible', false)
            ->get(['slug', 'title_en'])
            ->map(fn ($p) => ['slug' => $p->slug, 'title_en' => $p->title_en]);

        $hiddenSections = SiteContent::where('is_visible', false)
            ->select('page', 'section')
            ->distinct()
            ->get()
            ->map(fn ($r) => ['page' => $r->page, 'section' => $r->section]);

        // ── Recent inquiries ──────────────────────────────────────────────────
        $recentInquiries = ContactSubmission::with('project:id,title_en')
            ->orderByDesc('created_at')
            ->take(5)
            ->get(['id', 'name', 'email', 'request_type', 'is_read', 'project_id', 'created_at'])
            ->map(fn ($r) => [
                'id'           => $r->id,
                'name'         => $r->name,
                'email'        => $r->email,
                'request_type' => $r->request_type,
                'is_read'      => $r->is_read,
                'project_id'   => $r->project_id,
                'project'      => $r->project ? ['id' => $r->project->id, 'title_en' => $r->project->title_en] : null,
                'created_at'   => $r->created_at->diffForHumans(),
            ]);

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'activeProjects'        => $activeProjects,
                'totalProjects'         => $totalProjects,
                'inquiriesThisWeek'     => $inquiriesThisWeek,
                'totalInquiries'        => $totalInquiries,
                'unreadInquiries'       => $unreadInquiries,
                'projectsWithoutImages' => $projectsWithoutImages,
            ],
            'dailyInquiries'    => $dailyInquiries,
            'inquiriesByType'   => $inquiriesByType,
            'projectsByCategory' => $projectsByCategory,
            'contentHealth' => [
                'projectsMissingImages' => $projectsMissingImages,
                'pagesMissingSeo'       => $pagesMissingSeo,
                'projectsMissingSeo'    => $projectsMissingSeo,
                'projectsMissingOg'     => $projectsMissingOg,
                'emptySocialKeys'       => $emptySocialKeys,
                'missingInstagramCreds' => $missingInstagramCreds,
                'hiddenPages'           => $hiddenPages,
                'hiddenSections'        => $hiddenSections,
            ],
            'recentInquiries' => $recentInquiries,
        ]);
    }
}
