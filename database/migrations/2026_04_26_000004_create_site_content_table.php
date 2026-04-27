<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Per-section bilingual content rows. Innovations:
     *  - media_id: optional image attached to the row (innovation #1, image-aware site content)
     *  - is_visible: section-level show/hide toggle (innovation #5)
     */
    public function up(): void
    {
        Schema::create('site_content', function (Blueprint $table) {
            $table->id();
            $table->string('page', 50);    // matches pages.slug (string FK; not constrained for flexibility)
            $table->string('section', 50);
            $table->string('key', 50);
            $table->text('content_en')->nullable();
            $table->text('content_ar')->nullable();
            $table->enum('type', ['text', 'textarea', 'html'])->default('text');
            $table->foreignId('media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->boolean('is_visible')->default(true);
            $table->integer('sort_order')->default(0);
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['page', 'section', 'key']);
            $table->index(['page', 'section']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_content');
    }
};
