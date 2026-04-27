<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One row per public page. Holds page-level SEO + the master visibility toggle.
     * Section-level content + visibility lives in site_content.
     */
    public function up(): void
    {
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 50)->unique(); // home, properties, investment, self_build, security, about, contact
            $table->string('title_en')->nullable();
            $table->string('title_ar')->nullable();

            $table->string('seo_title_en')->nullable();
            $table->string('seo_title_ar')->nullable();
            $table->text('seo_description_en')->nullable();
            $table->text('seo_description_ar')->nullable();
            $table->foreignId('og_image_id')->nullable()->constrained('media')->nullOnDelete();

            $table->boolean('is_visible')->default(true);
            $table->integer('sort_order')->default(0);

            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pages');
    }
};
