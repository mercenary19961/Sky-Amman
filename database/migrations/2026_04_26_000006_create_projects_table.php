<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Unified table for all project listings — Sky Amman shows everything from this
     * single table on the homepage Project Showcase carousel and on /properties.
     *
     * `category` is the structural classification (drives which filter pill the
     * project lives under). `listing_status` is the commercial badge ("FOR SALE",
     * "FOR RENT") that appears on the card.
     */
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('title_en');
            $table->string('title_ar');
            $table->string('slug')->unique();

            $table->enum('category', ['under_development', 'ready', 'investment_opportunity']);
            $table->enum('listing_status', ['for_sale', 'for_rent', 'sold', 'reserved'])->nullable();

            $table->text('short_description_en')->nullable();
            $table->text('short_description_ar')->nullable();
            $table->text('description_en')->nullable();
            $table->text('description_ar')->nullable();

            $table->string('location_en')->nullable();   // "Jordan - Amman" (card line)
            $table->string('location_ar')->nullable();
            $table->string('address_en')->nullable();    // "Amman - Dabouq - yazan abusahwish ST." (detail page)
            $table->string('address_ar')->nullable();

            // Detail-page spec fields. All nullable — investment opportunities and
            // land plots leave most of these unset; villas fill them all in.
            $table->unsignedInteger('area_sqm')->nullable();
            $table->unsignedSmallInteger('completion_year')->nullable();
            $table->unsignedTinyInteger('floors')->nullable();
            $table->unsignedTinyInteger('bedrooms')->nullable();
            $table->unsignedTinyInteger('bathrooms')->nullable();

            $table->foreignId('featured_image_id')->nullable()->constrained('media')->nullOnDelete();

            // Innovation #2: per-listing SEO
            $table->string('seo_title_en')->nullable();
            $table->string('seo_title_ar')->nullable();
            $table->text('seo_description_en')->nullable();
            $table->text('seo_description_ar')->nullable();
            $table->foreignId('og_image_id')->nullable()->constrained('media')->nullOnDelete();

            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->integer('sort_order')->default(0);

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category', 'is_active']);
            $table->index('listing_status');
            $table->index('is_featured');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
