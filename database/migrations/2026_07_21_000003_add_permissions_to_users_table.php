<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Per-editor grants for the admin-only sections.
     *
     * A JSON array of ability strings (see User::ABILITIES), NOT a pivot table:
     * the ability set is a fixed, code-defined registry rather than user-created
     * data, there are under a dozen of them, and they're always read as a whole
     * for the current user. A pivot would add a join to every request for no gain.
     *
     * NULL / empty = the editor default (no admin-section access), so existing
     * rows need no backfill. Ignored entirely for admins, who bypass every gate.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->json('permissions')->nullable()->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('permissions');
        });
    }
};
