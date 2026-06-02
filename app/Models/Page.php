<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Per-public-page metadata: SEO fields, master visibility toggle, nav order.
 * Section-level content + visibility lives in SiteContent.
 */
class Page extends Model
{
    protected $fillable = [
        'slug',
        'title_en',
        'title_ar',
        'seo_title_en',
        'seo_title_ar',
        'seo_description_en',
        'seo_description_ar',
        'og_image_id',
        'is_visible',
        'sort_order',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'is_visible' => 'boolean',
        ];
    }

    public function ogImage(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'og_image_id');
    }

    public function updatedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function getTitleAttribute(): string
    {
        return app()->getLocale() === 'ar'
            ? ($this->title_ar ?: $this->title_en ?: '')
            : ($this->title_en ?: '');
    }

    public function getSeoTitleResolvedAttribute(): ?string
    {
        return app()->getLocale() === 'ar'
            ? ($this->seo_title_ar ?: $this->seo_title_en)
            : $this->seo_title_en;
    }

    public function getSeoDescriptionResolvedAttribute(): ?string
    {
        return app()->getLocale() === 'ar'
            ? ($this->seo_description_ar ?: $this->seo_description_en)
            : $this->seo_description_en;
    }

    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('is_visible', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }

    public static function getBySlug(string $slug): ?self
    {
        return static::query()->where('slug', $slug)->first();
    }
}
