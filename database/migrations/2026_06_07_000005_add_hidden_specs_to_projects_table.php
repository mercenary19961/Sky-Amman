<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Lets an editor hide individual spec rows on the property detail page even
     * when a value is set (e.g. keep the completion year stored but don't show
     * it). A JSON array of spec keys to hide — null/empty means show all that
     * have values, preserving the previous behaviour.
     */
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->json('hidden_specs')->nullable()->after('bathrooms');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('hidden_specs');
        });
    }
};
