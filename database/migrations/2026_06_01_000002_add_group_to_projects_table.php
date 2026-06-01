<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds a nullable `group` to projects — a development/compound label (e.g.
 * "Dabbouq 7") used by the Properties page's "Properties for Sale" sub-group
 * filter pills. Sale listings sharing a group are filtered together.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('group')->nullable()->after('listing_status');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('group');
        });
    }
};
