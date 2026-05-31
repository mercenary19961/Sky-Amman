<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Newsletter sign-ups captured by the footer "Subscribe" widget.
     *
     * Standalone from contact_submissions: those are inbound inquiries, these
     * are a marketing list. Kept deliberately small for now — a full newsletter
     * system (campaigns, double opt-in, unsubscribe links) lands later; this
     * table just durably captures the address so none are lost in the interim.
     */
    public function up(): void
    {
        Schema::create('newsletter_subscribers', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->boolean('is_active')->default(true);
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('newsletter_subscribers');
    }
};
