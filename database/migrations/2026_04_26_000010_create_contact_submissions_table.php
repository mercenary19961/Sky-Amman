<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Single inbox for ALL public-facing forms.
     * Innovation #4: per-listing inquiries — submissions can carry an optional FK to
     * a property, investment opportunity, or self-build package.
     */
    public function up(): void
    {
        Schema::create('contact_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone', 50)->nullable();
            $table->enum('request_type', ['buy', 'rent', 'build', 'investment', 'general']);
            $table->string('subject')->nullable();
            $table->text('message');

            // Optional listing linkage — only one of these will be set per row.
            $table->foreignId('property_id')->nullable()->constrained('properties')->nullOnDelete();
            $table->foreignId('investment_opportunity_id')->nullable()->constrained('investment_opportunities')->nullOnDelete();
            $table->foreignId('self_build_package_id')->nullable()->constrained('self_build_packages')->nullOnDelete();

            $table->boolean('is_read')->default(false);
            $table->boolean('is_archived')->default(false);
            $table->foreignId('read_by')->nullable()->constrained('users')->nullOnDelete();

            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['request_type', 'is_archived']);
            $table->index('property_id');
            $table->index('investment_opportunity_id');
            $table->index('self_build_package_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_submissions');
    }
};
