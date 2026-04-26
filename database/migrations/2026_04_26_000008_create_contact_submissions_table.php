<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Single inbox for ALL public-facing forms.
     *
     * Innovation #4: per-listing inquiries — submissions can carry an optional FK
     * to a project. "Contact about this project" CTAs on Properties detail page
     * pre-fill the form and stamp project_id so admin sees inquiries-per-project.
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

            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();

            $table->boolean('is_read')->default(false);
            $table->boolean('is_archived')->default(false);
            $table->foreignId('read_by')->nullable()->constrained('users')->nullOnDelete();

            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['request_type', 'is_archived']);
            $table->index('project_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_submissions');
    }
};
