<?php

use Database\Seeders\SiteContentSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        (new SiteContentSeeder())->run();
    }

    public function down(): void
    {
        DB::table('site_content')->delete();
    }
};
