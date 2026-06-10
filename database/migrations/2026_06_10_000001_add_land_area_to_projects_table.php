<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds a separate Land Area column. The existing `area_sqm` now represents the
 * Built-up Area (relabelled in the UI); brochures (e.g. DABOUQ-7) list both.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->unsignedInteger('land_area_sqm')->nullable()->after('area_sqm');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('land_area_sqm');
        });
    }
};
