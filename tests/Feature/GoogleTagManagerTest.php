<?php

namespace Tests\Feature;

use Database\Seeders\DefaultSettingsSeeder;
use Database\Seeders\PagesSeeder;
use Database\Seeders\SiteContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
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
        $csp = $this->productionCsp();

        $this->assertStringContainsString('https://www.googletagmanager.com', $csp);
        $this->assertStringContainsString('https://www.google-analytics.com', $csp);
        $this->assertStringContainsString('https://*.analytics.google.com', $csp);
    }

    /**
     * Each approved vendor needs BOTH a script-src host (where the tag loads
     * from) and a connect-src host (where it sends data) — getting only the
     * first is the failure mode that looks like "the tag works but no data".
     *
     * @return array<string, array{string, string}>
     */
    public static function approvedVendors(): array
    {
        return [
            // vendor => [script host, send host]
            'Google Ads' => ['https://www.googleadservices.com', 'https://googleads.g.doubleclick.net'],
            'LinkedIn Insight' => ['https://snap.licdn.com', 'https://px.ads.linkedin.com'],
            'Meta Pixel' => ['https://connect.facebook.net', 'https://www.facebook.com'],
        ];
    }

    #[DataProvider('approvedVendors')]
    public function test_csp_allows_each_approved_marketing_vendor(string $scriptHost, string $sendHost): void
    {
        $csp = $this->productionCsp();

        [$scriptSrc, $connectSrc] = [
            $this->directive($csp, 'script-src'),
            $this->directive($csp, 'connect-src'),
        ];

        $this->assertStringContainsString($scriptHost, $scriptSrc, 'tag would not load');
        $this->assertStringContainsString($sendHost, $connectSrc, 'tag would load but send nothing');
    }

    /** The CSP header is only emitted outside local dev. */
    private function productionCsp(): string
    {
        $this->app['env'] = 'production';

        return (string) $this->get('/')->assertOk()->headers->get('Content-Security-Policy');
    }

    private function directive(string $csp, string $name): string
    {
        foreach (explode(';', $csp) as $directive) {
            if (str_starts_with(trim($directive), $name.' ')) {
                return trim($directive);
            }
        }

        return '';
    }
}
