<?php

use Database\Seeders\SiteContentSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Production bootstrap only; tests start from a clean schema and seed
        // their own data, so skip here to keep test isolation.
        if (app()->environment('testing')) {
            return;
        }

        (new SiteContentSeeder())->run();
    }

    public function down(): void
    {
        DB::table('site_content')->delete();
    }
};
