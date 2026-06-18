<?php

use Database\Seeders\DepartmentMemberSeeder;
use Database\Seeders\TestimonialVideosSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        (new DepartmentMemberSeeder())->run();
        (new TestimonialVideosSeeder())->run();
    }

    public function down(): void
    {
        DB::table('department_members')->delete();
        DB::table('testimonial_videos')->delete();
    }
};
