<?php

use Database\Seeders\AdminUserSeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Production bootstrap only; tests start from a clean schema and seed
        // their own data, so skip here to keep test isolation.
        if (app()->environment('testing')) {
            return;
        }

        (new AdminUserSeeder())->run();
    }

    public function down(): void
    {
        \App\Models\User::where('email', 'admin@skyamman.com')->forceDelete();
    }
};
