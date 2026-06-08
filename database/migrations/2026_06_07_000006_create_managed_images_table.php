<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Admin-replaceable "page image" slots — specific decorative/structural
     * images that are normally code-managed (committed under public/images) but
     * that we want editors to be able to swap without a deploy (e.g. the About
     * page "Crafted Developments" cluster). Each row maps a known slot key to an
     * uploaded media record; an empty/missing row falls back to the committed
     * default. The slot registry lives in the ManagedImage model.
     */
    public function up(): void
    {
        Schema::create('managed_images', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->foreignId('media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('managed_images');
    }
};
