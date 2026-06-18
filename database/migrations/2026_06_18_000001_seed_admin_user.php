<?php

use Database\Seeders\AdminUserSeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        (new AdminUserSeeder())->run();
    }

    public function down(): void
    {
        \App\Models\User::where('email', 'admin@skyamman.com')->forceDelete();
    }
};
