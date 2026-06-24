<?php

namespace Tests\Feature;

use Database\Seeders\DefaultSettingsSeeder;
use Database\Seeders\PagesSeeder;
use Database\Seeders\SiteContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Smoke test: every public route renders without error. This is the cheap
 * guardrail that catches "the whole page is broken" regressions — SSR/CSP
 * blank pages, JSX/Babel parse errors, route or controller breakage, etc.
 */
class PublicSmokeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // The public pages read page rows, bilingual CMS content and site
        // settings (data migrations are skipped under `testing`, so seed here).
        $this->seed(PagesSeeder::class);
        $this->seed(SiteContentSeeder::class);
        $this->seed(DefaultSettingsSeeder::class);
    }

    /** @return array<string, array{string}> */
    public static function publicRoutes(): array
    {
        return [
            'home' => ['/'],
            'properties' => ['/properties'],
            'self build' => ['/self-build'],
            'security' => ['/security'],
            'about' => ['/about'],
            'contact' => ['/contact'],
            'sitemap.xml' => ['/sitemap.xml'],
            'robots.txt' => ['/robots.txt'],
        ];
    }

    #[DataProvider('publicRoutes')]
    public function test_public_route_returns_ok(string $path): void
    {
        $this->get($path)->assertOk();
    }

    public function test_homepage_renders_the_home_component(): void
    {
        $this->get('/')->assertInertia(fn ($page) => $page->component('Public/Home'));
    }
}
