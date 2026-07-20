<?php

namespace Tests\Feature;

use Database\Seeders\DefaultSettingsSeeder;
use Database\Seeders\PagesSeeder;
use Database\Seeders\SiteContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The GTM container snippet is opt-in (GTM_CONTAINER_ID) and must never load on
 * the admin panel — staff sessions would otherwise be counted as site traffic
 * and skew every GA4 report.
 */
class GoogleTagManagerTest extends TestCase
{
    use RefreshDatabase;

    private const CONTAINER = 'GTM-THTNDKNV';

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(PagesSeeder::class);
        $this->seed(SiteContentSeeder::class);
        $this->seed(DefaultSettingsSeeder::class);
    }

    public function test_snippet_is_absent_when_no_container_is_configured(): void
    {
        config(['services.gtm.container_id' => null]);

        $this->get('/')
            ->assertOk()
            ->assertDontSee('googletagmanager.com');
    }

    public function test_snippet_renders_on_public_pages_when_configured(): void
    {
        config(['services.gtm.container_id' => self::CONTAINER]);

        $response = $this->get('/')->assertOk();

        // Both halves: the async loader in <head> and the no-JS iframe fallback.
        $response->assertSee('www.googletagmanager.com/gtm.js', false);
        $response->assertSee('www.googletagmanager.com/ns.html?id='.self::CONTAINER, false);
        $response->assertSee(self::CONTAINER, false);
    }

    public function test_snippet_never_renders_on_the_admin_panel(): void
    {
        config(['services.gtm.container_id' => self::CONTAINER]);

        $this->get('/admin/login')
            ->assertOk()
            ->assertDontSee('googletagmanager.com');
    }

    public function test_csp_allows_the_hosts_ga4_actually_sends_hits_to(): void
    {
        // Guards the silent-failure mode: container loads, tags look like they
        // fire, but every measurement request is blocked by connect-src.
        $this->app['env'] = 'production';

        $csp = $this->get('/')->assertOk()->headers->get('Content-Security-Policy');

        $this->assertStringContainsString('https://www.googletagmanager.com', $csp);
        $this->assertStringContainsString('https://www.google-analytics.com', $csp);
        $this->assertStringContainsString('https://*.analytics.google.com', $csp);
    }
}
