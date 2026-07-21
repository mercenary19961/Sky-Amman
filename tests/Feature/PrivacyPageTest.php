<?php

namespace Tests\Feature;

use App\Models\Page;
use Database\Seeders\DefaultSettingsSeeder;
use Database\Seeders\PagesSeeder;
use Database\Seeders\SiteContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrivacyPageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(PagesSeeder::class);
        $this->seed(SiteContentSeeder::class);
        $this->seed(DefaultSettingsSeeder::class);
    }

    public function test_the_privacy_page_renders(): void
    {
        $this->get('/privacy')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Privacy')
                ->has('content_en.collect')
                ->has('content_ar.collect')
            );
    }

    // NOTE: that the footer + cookie banner actually LINK here can't be asserted
    // at this layer — both are React, and a feature test receives the Inertia
    // JSON payload rather than rendered markup. That check lives in
    // tests/e2e/smoke.spec.ts, which drives a real browser.

    public function test_it_is_excluded_from_the_sitemap(): void
    {
        // It ships `noindex`; advertising it would contradict that.
        $this->get('/sitemap.xml')
            ->assertOk()
            ->assertDontSee('/privacy');
    }

    public function test_hiding_the_page_in_admin_404s_it(): void
    {
        Page::where('slug', 'privacy')->update(['is_visible' => false]);

        $this->get('/privacy')->assertNotFound();
    }
}
