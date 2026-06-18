<?php

use Database\Seeders\DefaultSettingsSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        (new DefaultSettingsSeeder())->run();
    }

    public function down(): void
    {
        DB::table('settings')->delete();
    }
};
