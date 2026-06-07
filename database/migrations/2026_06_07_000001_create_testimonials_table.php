<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Client testimonials shown in the homepage Testimonials carousel (the
     * card row below the testimonial videos). Unlike site_content, these are a
     * variable-length, admin-managed list (create / edit / reorder / show-hide)
     * each carrying a portrait image + bilingual name + quote — so they live in
     * their own table with a media_id avatar, not as fixed bilingual rows.
     */
    public function up(): void
    {
        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->text('quote_en');
            $table->text('quote_ar')->nullable();
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
        Schema::dropIfExists('testimonials');
    }
};
