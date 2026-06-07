<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Testimonials originally made name_en / quote_en NOT NULL, but the form now
     * accepts a single language (name + quote each need only one of EN/AR). An
     * AR-only testimonial stores null for the EN columns, so they must be nullable.
     */
    public function up(): void
    {
        Schema::table('testimonials', function (Blueprint $table) {
            $table->string('name_en')->nullable()->change();
            $table->text('quote_en')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('testimonials', function (Blueprint $table) {
            $table->string('name_en')->nullable(false)->change();
            $table->text('quote_en')->nullable(false)->change();
        });
    }
};
