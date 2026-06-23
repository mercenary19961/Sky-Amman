<?php

use Database\Seeders\PagesSeeder;
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

        (new PagesSeeder())->run();
    }

    public function down(): void
    {
        DB::table('pages')->delete();
    }
};
