<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Per-public-page metadata: SEO fields, master visibility toggle, nav order.
 *
 * Section-level content + visibility lives in SiteContent.
 *
 * @property int $id
 * @property string $slug
 * @property string|null $title_en
 * @property string|null $title_ar
 * @property string|null $seo_title_en
 * @property string|null $seo_title_ar
 * @property string|null $seo_description_en
 * @property string|null $seo_description_ar
 * @property int|null $og_image_id
 * @property bool $is_visible
 * @property int $sort_order
 * @property int|null $updated_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read string|null $seo_description_resolved
 * @property-read string|null $seo_title_resolved
 * @property-read string $title
 * @property-read \App\Models\Media|null $ogImage
 * @property-read \App\Models\User|null $updatedByUser
 * @method static Builder<static>|Page newModelQuery()
 * @method static Builder<static>|Page newQuery()
 * @method static Builder<static>|Page ordered()
 * @method static Builder<static>|Page query()
 * @method static Builder<static>|Page visible()
 * @method static Builder<static>|Page whereCreatedAt($value)
 * @method static Builder<static>|Page whereId($value)
 * @method static Builder<static>|Page whereIsVisible($value)
 * @method static Builder<static>|Page whereOgImageId($value)
 * @method static Builder<static>|Page whereSeoDescriptionAr($value)
 * @method static Builder<static>|Page whereSeoDescriptionEn($value)
 * @method static Builder<static>|Page whereSeoTitleAr($value)
 * @method static Builder<static>|Page whereSeoTitleEn($value)
 * @method static Builder<static>|Page whereSlug($value)
 * @method static Builder<static>|Page whereSortOrder($value)
 * @method static Builder<static>|Page whereTitleAr($value)
 * @method static Builder<static>|Page whereTitleEn($value)
 * @method static Builder<static>|Page whereUpdatedAt($value)
 * @method static Builder<static>|Page whereUpdatedBy($value)
 * @mixin \Eloquent
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
