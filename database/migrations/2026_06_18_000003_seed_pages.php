<?php

use Database\Seeders\PagesSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        (new PagesSeeder())->run();
    }

    public function down(): void
    {
        DB::table('pages')->delete();
    }
};
