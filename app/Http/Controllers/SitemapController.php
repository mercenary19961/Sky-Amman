<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\Project;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    // Page slug → public URL path. This is an ALLOWLIST — a new `pages` row is
    // not advertised until it's added here. Deliberately absent: `footer` (no
    // public URL), `investment` (parked), and `privacy` (it ships `noindex`,
    // so listing it would tell Google to crawl a page we asked it to skip).
    private const PAGE_PATHS = [
        'home'       => '/',
        'properties' => '/properties',
        'self_build' => '/self-build',
        'security'   => '/security',
        'about'      => '/about',
        'contact'    => '/contact',
    ];

    public function sitemap(): Response
    {
        $visibleSlugs = Page::whereIn('slug', array_keys(self::PAGE_PATHS))
            ->where('is_visible', true)
            ->pluck('updated_at', 'slug');

        $staticUrls = collect(self::PAGE_PATHS)
            ->filter(fn($_, $slug) => $visibleSlugs->has($slug))
            ->map(fn($path, $slug) => [
                'loc'        => url($path),
                'lastmod'    => $visibleSlugs[$slug]->toAtomString(),
                'changefreq' => 'weekly',
                'priority'   => $slug === 'home' ? '1.0' : '0.8',
            ])
            ->values();

        // Sold projects 404 on the public detail page — exclude them.
        $projectUrls = Project::active()
            ->where('listing_status', '!=', 'sold')
            ->get(['slug', 'updated_at'])
            ->map(fn($p) => [
                'loc'        => url("/properties/{$p->slug}"),
                'lastmod'    => $p->updated_at->toAtomString(),
                'changefreq' => 'monthly',
                'priority'   => '0.7',
            ]);

        $urls = $staticUrls->concat($projectUrls);

        return response()
            ->view('sitemap', ['urls' => $urls])
            ->header('Content-Type', 'application/xml; charset=utf-8');
    }

    public function robots(): Response
    {
        $content = implode("\n", [
            'User-agent: *',
            'Disallow: /admin/',
            '',
            'Sitemap: ' . url('/sitemap.xml'),
        ]);

        return response($content, 200)->header('Content-Type', 'text/plain');
    }
}
