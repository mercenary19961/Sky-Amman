<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Feature tests that render a full Inertia page hit the `@vite` directive
        // in app.blade.php, which throws if public/build/manifest.json is missing.
        // Stub Vite so the suite doesn't depend on a prior `npm run build` (the
        // CI backend job intentionally skips the asset build for speed).
        $this->withoutVite();
    }
}
