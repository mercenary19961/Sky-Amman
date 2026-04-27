<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Unified table for all project listings. The `category` enum drives which
 * filter pill the project appears under on the homepage Project Showcase
 * (`under_development`, `ready`, `investment_opportunity`). The `listing_status`
 * enum drives the badge on the card ("FOR SALE", "FOR RENT", etc.).
 */
class Project extends Model
{
    use SoftDeletes;

    public const CATEGORY_UNDER_DEVELOPMENT = 'under_development';
    public const CATEGORY_READY = 'ready';
    public const CATEGORY_INVESTMENT = 'investment_opportunity';

    protected $fillable = [
        'title_en',
        'title_ar',
        'slug',
        'category',
        'listing_status',
        'short_description_en',
        'short_description_ar',
        'description_en',
        'description_ar',
        'location_en',
        'location_ar',
        'address_en',
        'address_ar',
        'area_sqm',
        'completion_year',
        'floors',
        'bedrooms',
        'bathrooms',
        'featured_image_id',
        'seo_title_en',
        'seo_title_ar',
        'seo_description_en',
        'seo_description_ar',
        'og_image_id',
        'is_active',
        'is_featured',
        'sort_order',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'area_sqm' => 'integer',
            'completion_year' => 'integer',
            'floors' => 'integer',
            'bedrooms' => 'integer',
            'bathrooms' => 'integer',
        ];
    }

    public function featuredImage(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'featured_image_id');
    }

    public function ogImage(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'og_image_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProjectImage::class)->orderBy('sort_order');
    }

    public function inquiries(): HasMany
    {
        return $this->hasMany(ContactSubmission::class, 'project_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function getTitleAttribute(): string
    {
        return app()->getLocale() === 'ar'
            ? ($this->title_ar ?: $this->title_en)
            : $this->title_en;
    }

    public function getShortDescriptionAttribute(): string
    {
        return app()->getLocale() === 'ar'
            ? ($this->short_description_ar ?: $this->short_description_en ?: '')
            : ($this->short_description_en ?: '');
    }

    public function getDescriptionAttribute(): string
    {
        return app()->getLocale() === 'ar'
            ? ($this->description_ar ?: $this->description_en ?: '')
            : ($this->description_en ?: '');
    }

    public function getLocationAttribute(): string
    {
        return app()->getLocale() === 'ar'
            ? ($this->location_ar ?: $this->location_en ?: '')
            : ($this->location_en ?: '');
    }

    public function getAddressAttribute(): string
    {
        return app()->getLocale() === 'ar'
            ? ($this->address_ar ?: $this->address_en ?: '')
            : ($this->address_en ?: '');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('id', 'desc');
    }

    public function scopeInCategory(Builder $query, string $category): Builder
    {
        return $query->where('category', $category);
    }

    public function scopeUnderDevelopment(Builder $query): Builder
    {
        return $query->where('category', self::CATEGORY_UNDER_DEVELOPMENT);
    }

    public function scopeReady(Builder $query): Builder
    {
        return $query->where('category', self::CATEGORY_READY);
    }

    public function scopeInvestmentOpportunity(Builder $query): Builder
    {
        return $query->where('category', self::CATEGORY_INVESTMENT);
    }
}
