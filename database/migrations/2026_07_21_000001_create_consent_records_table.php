<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Cookie-consent proof log, backing the self-hosted banner.
     *
     * APPEND-ONLY on purpose: every choice writes a NEW row rather than updating
     * the visitor's previous one. The point of a consent log is to answer "what
     * did this person agree to, and when" after the fact, so overwriting would
     * destroy the very evidence it exists to keep. `uid` (the visitor's cookie
     * id) threads a person's decisions together over time.
     *
     * No FK to users — consent is given by anonymous visitors, not accounts.
     */
    public function up(): void
    {
        Schema::create('consent_records', function (Blueprint $table) {
            $table->id();
            // Opaque per-visitor id from the first-party consent cookie.
            $table->uuid('uid')->index();
            // Which button was pressed. 'custom' = the Customise panel was used.
            $table->enum('action', ['accept_all', 'reject_all', 'custom']);
            // Resolved category outcome. 'necessary' is implicit and always true,
            // so it isn't stored — it can't be declined.
            $table->boolean('analytics')->default(false);
            $table->boolean('marketing')->default(false);
            $table->string('locale', 5)->default('en');
            // Lets you prove WHICH wording someone agreed to. Bump the constant
            // in ConsentRecord whenever the policy or category set changes.
            $table->string('policy_version', 20)->default('1');
            $table->string('url', 2048)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            // Drives the admin trend chart + period filters.
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consent_records');
    }
};
