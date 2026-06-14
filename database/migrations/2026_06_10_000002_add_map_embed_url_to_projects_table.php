<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Per-project Google Maps embed URL. When set, the property detail page uses it
 * instead of the site-wide `google_maps_embed_url` setting — so each development
 * can point at its own location (e.g. all Dabouq 7/8 villas share one map).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('map_embed_url', 2048)->nullable()->after('address_ar');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('map_embed_url');
        });
    }
};
