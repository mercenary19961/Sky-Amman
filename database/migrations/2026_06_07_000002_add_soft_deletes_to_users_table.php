<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Soft-delete users so an accidental deletion can be reverted from the Change
     * Log (innovation #23) — same as projects. Keeping the row also preserves the
     * created_by / updated_by / changed_by FK references that point at the user.
     * The email unique index now spans trashed rows, which is intentional: it
     * stops a deleted user's email being reused in a way that would clash on undo.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
