<?php

use Database\Seeders\ProjectsSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        (new ProjectsSeeder())->run();
    }

    public function down(): void
    {
        // Force-delete all projects (they use soft deletes).
        DB::table('projects')->delete();
    }
};
