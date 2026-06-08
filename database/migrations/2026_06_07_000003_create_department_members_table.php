<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * "Head of Departments" team members shown on the homepage. Moved out of
     * site_content (which is text-only) into their own table so each member can
     * carry a portrait image (via Media) alongside a bilingual name + role, and
     * be created / edited / reordered / shown-hidden from the admin — same shape
     * as the testimonials table. All text columns are nullable: name and role
     * each only need ONE language (the public card falls back to the filled one).
     */
    public function up(): void
    {
        Schema::create('department_members', function (Blueprint $table) {
            $table->id();
            $table->string('name_en')->nullable();
            $table->string('name_ar')->nullable();
            $table->string('role_en')->nullable();
            $table->string('role_ar')->nullable();
            $table->foreignId('media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_active', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('department_members');
    }
};
