<?php

namespace Tests\Feature;

use Database\Seeders\DefaultSettingsSeeder;
use Database\Seeders\PagesSeeder;
use Database\Seeders\SiteContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

/**
 * The site must name ONE canonical host regardless of which hostname a request
 * arrives on. Laravel builds url()/route() from the request, so before this was
 * pinned the old *.up.railway.app domain served a fully self-canonicalising
 * duplicate of the site, competing with www.skyamman.com in search.
 */
class CanonicalHostTest extends TestCase
{
    use RefreshDatabase;

    private const CANONICAL = 'https://www.skyamman.com';

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(PagesSeeder::class);
        $this->seed(SiteContentSeeder::class);
        $this->seed(DefaultSettingsSeeder::class);
    }

    /**
     * Reproduce what AppServiceProvider does under APP_ENV=production.
     *
     * BOTH calls are needed and they do different jobs: forceRootUrl pins the
     * HOST, while the scheme is still taken from the incoming request — so
     * without forceScheme a pinned https root still emits `http://`.
     */
    private function pinCanonicalHost(): void
    {
        config(['app.url' => self::CANONICAL]);
        URL::forceRootUrl(self::CANONICAL);
        URL::forceScheme('https');
    }

    public function test_the_sitemap_names_the_canonical_host_from_any_origin(): void
    {
        $this->pinCanonicalHost();

        $body = $this->get('http://sky-amman-production.up.railway.app/sitemap.xml')
            ->assertOk()
            ->getContent();

        $this->assertStringContainsString(self::CANONICAL, (string) $body);
        $this->assertStringNotContainsString('up.railway.app', (string) $body);
    }

    public function test_robots_points_at_the_canonical_sitemap_from_any_origin(): void
    {
        $this->pinCanonicalHost();

        $body = (string) $this->get('http://sky-amman-production.up.railway.app/robots.txt')
            ->assertOk()
            ->getContent();

        $this->assertStringContainsString('Sitemap: '.self::CANONICAL, $body);
        $this->assertStringNotContainsString('up.railway.app', $body);
    }

    public function test_page_urls_use_the_canonical_host(): void
    {
        // `url` is what the public pages render as <link rel="canonical">,
        // og:url and the hreflang alternates.
        $this->pinCanonicalHost();

        $this->get('http://sky-amman-production.up.railway.app/about')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('url', self::CANONICAL.'/about'));
    }

    public function test_without_pinning_the_request_host_leaks(): void
    {
        // Documents the bug this guards against: default Laravel behaviour is
        // to canonicalise whatever host was used, which is how a stray domain
        // became an indexable duplicate.
        $body = (string) $this->get('http://sky-amman-production.up.railway.app/robots.txt')
            ->assertOk()
            ->getContent();

        $this->assertStringContainsString('up.railway.app', $body);
    }
}
