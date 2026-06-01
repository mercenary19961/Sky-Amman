<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Videos shown in the homepage Testimonials carousel.
     *
     * `url` is a plain string that may be a self-hosted file path
     * (/video/x.mp4), a YouTube link, or another embed URL — the public player
     * picks the renderer. Kept out of site_content because a video is a single
     * locale-agnostic URL + active flag + order, not bilingual copy. A future
     * scheduling feature can hang date columns off this table.
     */
    public function up(): void
    {
        Schema::create('testimonial_videos', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->string('url', 2048);
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_active', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('testimonial_videos');
    }
};
