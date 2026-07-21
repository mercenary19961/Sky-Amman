<?php

use App\Models\Page;
use App\Models\SiteContent;
use Database\Seeders\SiteContentSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Ship the Privacy Policy page to production.
     *
     * Seeders do NOT run on Railway deploys — only migrations do. The
     * 2026_06_18_* bootstrap migrations already ran, and the migrations table
     * stops them re-running, so rows added to a seeder AFTER first deploy never
     * reach production on their own. That is exactly what happened here: the
     * page 404'd in production because `pages` had no 'privacy' row, while
     * local dev was fine (the seeder had been run by hand).
     *
     * ⚠️ This deliberately does NOT call PagesSeeder/SiteContentSeeder wholesale
     * like the 2026_06_18_* migrations did. Those ran against an empty database.
     * Re-running them now would updateOrCreate EVERY row and silently overwrite
     * any copy the client has edited through the admin. So this touches only the
     * privacy rows, and skips any that already exist.
     */
    public function up(): void
    {
        if (app()->environment('testing')) {
            return;
        }

        Page::updateOrCreate(
            ['slug' => 'privacy'],
            [
                'title_en' => 'Privacy Policy',
                'title_ar' => 'سياسة الخصوصية',
                'sort_order' => 9,
                'is_visible' => true,
            ],
        );

        // Pull the copy from the seeder so there is one source of truth, but
        // filter to this page only.
        $rows = array_filter(
            SiteContentSeeder::rows(),
            fn (array $row) => $row[0] === 'privacy',
        );

        foreach ($rows as [$page, $section, $key, $en, $ar]) {
            // firstOrCreate, not updateOrCreate: if a row is somehow already
            // present it has been reviewed or edited, and this must not clobber it.
            SiteContent::firstOrCreate(
                ['page' => $page, 'section' => $section, 'key' => $key],
                [
                    'content_en' => $en,
                    'content_ar' => $ar,
                    'type' => strlen($en) > 120 ? 'textarea' : 'text',
                    'is_visible' => true,
                ],
            );
        }
    }

    public function down(): void
    {
        DB::table('site_content')->where('page', 'privacy')->delete();
        DB::table('pages')->where('slug', 'privacy')->delete();
    }
};
