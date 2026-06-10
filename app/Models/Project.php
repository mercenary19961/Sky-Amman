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
 *
 * @property int $id
 * @property string $title_en
 * @property string $title_ar
 * @property string $slug
 * @property string $category
 * @property string|null $listing_status
 * @property string|null $short_description_en
 * @property string|null $short_description_ar
 * @property string|null $description_en
 * @property string|null $description_ar
 * @property string|null $location_en
 * @property string|null $location_ar
 * @property string|null $address_en
 * @property string|null $address_ar
 * @property int|null $area_sqm
 * @property int|null $completion_year
 * @property int|null $floors
 * @property int|null $bedrooms
 * @property int|null $bathrooms
 * @property int|null $featured_image_id
 * @property string|null $seo_title_en
 * @property string|null $seo_title_ar
 * @property string|null $seo_description_en
 * @property string|null $seo_description_ar
 * @property int|null $og_image_id
 * @property bool $is_active
 * @property bool $is_featured
 * @property int $sort_order
 * @property int|null $created_by
 * @property int|null $updated_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property string|null $group
 * @property array<array-key, mixed>|null $hidden_specs
 * @property-read \App\Models\User|null $createdBy
 * @property-read \App\Models\Media|null $featuredImage
 * @property-read string $address
 * @property-read string $description
 * @property-read string $location
 * @property-read string $short_description
 * @property-read string $title
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ProjectImage> $images
 * @property-read int|null $images_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ContactSubmission> $inquiries
 * @property-read int|null $inquiries_count
 * @property-read \App\Models\Media|null $ogImage
 * @property-read \App\Models\User|null $updatedBy
 * @method static Builder<static>|Project active()
 * @method static Builder<static>|Project featured()
 * @method static Builder<static>|Project inCategory(string $category)
 * @method static Builder<static>|Project investmentOpportunity()
 * @method static Builder<static>|Project newModelQuery()
 * @method static Builder<static>|Project newQuery()
 * @method static Builder<static>|Project onlyTrashed()
 * @method static Builder<static>|Project ordered()
 * @method static Builder<static>|Project query()
 * @method static Builder<static>|Project ready()
 * @method static Builder<static>|Project underDevelopment()
 * @method static Builder<static>|Project whereAddressAr($value)
 * @method static Builder<static>|Project whereAddressEn($value)
 * @method static Builder<static>|Project whereAreaSqm($value)
 * @method static Builder<static>|Project whereBathrooms($value)
 * @method static Builder<static>|Project whereBedrooms($value)
 * @method static Builder<static>|Project whereCategory($value)
 * @method static Builder<static>|Project whereCompletionYear($value)
 * @method static Builder<static>|Project whereCreatedAt($value)
 * @method static Builder<static>|Project whereCreatedBy($value)
 * @method static Builder<static>|Project whereDeletedAt($value)
 * @method static Builder<static>|Project whereDescriptionAr($value)
 * @method static Builder<static>|Project whereDescriptionEn($value)
 * @method static Builder<static>|Project whereFeaturedImageId($value)
 * @method static Builder<static>|Project whereFloors($value)
 * @method static Builder<static>|Project whereGroup($value)
 * @method static Builder<static>|Project whereHiddenSpecs($value)
 * @method static Builder<static>|Project whereId($value)
 * @method static Builder<static>|Project whereIsActive($value)
 * @method static Builder<static>|Project whereIsFeatured($value)
 * @method static Builder<static>|Project whereListingStatus($value)
 * @method static Builder<static>|Project whereLocationAr($value)
 * @method static Builder<static>|Project whereLocationEn($value)
 * @method static Builder<static>|Project whereOgImageId($value)
 * @method static Builder<static>|Project whereSeoDescriptionAr($value)
 * @method static Builder<static>|Project whereSeoDescriptionEn($value)
 * @method static Builder<static>|Project whereSeoTitleAr($value)
 * @method static Builder<static>|Project whereSeoTitleEn($value)
 * @method static Builder<static>|Project whereShortDescriptionAr($value)
 * @method static Builder<static>|Project whereShortDescriptionEn($value)
 * @method static Builder<static>|Project whereSlug($value)
 * @method static Builder<static>|Project whereSortOrder($value)
 * @method static Builder<static>|Project whereTitleAr($value)
 * @method static Builder<static>|Project whereTitleEn($value)
 * @method static Builder<static>|Project whereUpdatedAt($value)
 * @method static Builder<static>|Project whereUpdatedBy($value)
 * @method static Builder<static>|Project withTrashed(bool $withTrashed = true)
 * @method static Builder<static>|Project withoutTrashed()
 * @mixin \Eloquent
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
        'group',
        'short_description_en',
        'short_description_ar',
        'description_en',
        'description_ar',
        'location_en',
        'location_ar',
        'address_en',
        'address_ar',
        'area_sqm',          // built-up area (m²) — labelled "Built-up Area" in the UI
        'land_area_sqm',     // land/plot area (m²)
        'completion_year',
        'floors',
        'bedrooms',
        'bathrooms',
        'hidden_specs',
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
            'land_area_sqm' => 'integer',
            'completion_year' => 'integer',
            'floors' => 'integer',
            'bedrooms' => 'integer',
            'bathrooms' => 'integer',
            'hidden_specs' => 'array',
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

    /**
     * Ordered list of this project's image URLs for card carousels: the featured
     * (lead) image first, then the OG pick, then the rest of the gallery (deduped).
     * Returns real uploaded images only (no placeholder) — callers add their own
     * fallback. Eager-load images.media + featuredImage + ogImage to avoid N+1.
     */
    public function cardImageUrls(): array
    {
        $urls = [];
        $seen = [];
        $push = function (?int $mediaId) use (&$urls, &$seen) {
            if ($mediaId === null || isset($seen[$mediaId])) {
                return;
            }
            $seen[$mediaId] = true;
            $urls[] = route('media.serve', $mediaId, false);
        };

        if ($this->featuredImage) {
            $push($this->featured_image_id);
        }
        if ($this->ogImage) {
            $push($this->og_image_id);
        }
        foreach ($this->images as $img) {
            if ($img->media !== null) {
                $push($img->media_id);
            }
        }

        return $urls;
    }

    /**
     * Image URLs for display, with a committed-file fallback so a project always
     * shows something. Order of preference:
     *  1. uploaded gallery Media (admin), featured/OG first;
     *  2. a committed gallery folder /images/projects/{slug}/NN.webp (seeded renders);
     *  3. a single committed render /images/projects/{slug}.(webp|svg);
     *  4. a generic placeholder.
     */
    public function displayImageUrls(): array
    {
        $urls = $this->cardImageUrls();
        if (! empty($urls)) {
            return $urls;
        }

        $dir = public_path("images/projects/{$this->slug}");
        if (is_dir($dir)) {
            $files = glob($dir . '/*.webp') ?: [];
            sort($files);
            if (! empty($files)) {
                return array_map(fn (string $f) => "/images/projects/{$this->slug}/" . basename($f), $files);
            }
        }

        foreach (["images/projects/{$this->slug}.webp", "images/projects/{$this->slug}.svg"] as $rel) {
            if (is_file(public_path($rel))) {
                return ["/{$rel}"];
            }
        }

        return ['/images/projects/placeholder.svg'];
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
