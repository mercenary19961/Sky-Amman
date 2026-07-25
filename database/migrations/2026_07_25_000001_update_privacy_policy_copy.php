<?php

use App\Models\SiteContent;
use Database\Seeders\SiteContentSeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Replace the placeholder Privacy Policy copy with the client-provided
     * official policy (docx, 2026-07-25) — English as delivered plus a matching
     * Arabic translation.
     *
     * Seeders do NOT run on Railway deploys — only migrations do (see the
     * 2026_07_21_000002 migration for the full explanation). So this ships the
     * new copy to production directly from SiteContentSeeder::rows(), the single
     * source of truth, filtered to the privacy page.
     *
     * Unlike the initial privacy migration, this deliberately OVERWRITES the
     * existing rows (updateOrCreate): the placeholder was pending sign-off and is
     * being intentionally replaced, so any earlier value is superseded. It also
     * PRUNES rows whose keys no longer exist in the new structure (the old
     * `collect.form`, `cookies.necessary`, … placeholder keys), so no stale copy
     * lingers in the admin editor.
     */
    public function up(): void
    {
        if (app()->environment('testing')) {
            return;
        }

        $rows = array_filter(
            SiteContentSeeder::rows(),
            fn (array $row) => $row[0] === 'privacy',
        );

        $keep = [];
        foreach ($rows as [$page, $section, $key, $en, $ar]) {
            SiteContent::updateOrCreate(
                ['page' => $page, 'section' => $section, 'key' => $key],
                [
                    'content_en' => $en,
                    'content_ar' => $ar,
                    'type' => strlen($en) > 120 ? 'textarea' : 'text',
                    'is_visible' => true,
                ],
            );
            $keep[] = $section.'|'.$key;
        }

        // Remove placeholder rows the new policy no longer uses. site_content is
        // not soft-deleted, so delete() removes the row permanently.
        SiteContent::where('page', 'privacy')->get()->each(function (SiteContent $row) use ($keep): void {
            if (! in_array($row->section.'|'.$row->key, $keep, true)) {
                $row->delete();
            }
        });
    }

    /**
     * Not reversible: the pre-update placeholder copy is not retained. Rolling
     * back leaves the client's official policy in place, which is the safe state.
     */
    public function down(): void
    {
        // no-op
    }
};
