<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Bilingual key-value content rows for a section of a public page.
 *
 * Innovation #1: optional `media_id` lets a single content row carry text + an
 * image (hero bg, illustration). Innovation #5: `is_visible` lets admin hide an
 * entire section without a code deploy.
 *
 * @property int $id
 * @property string $page
 * @property string $section
 * @property string $key
 * @property string|null $content_en
 * @property string|null $content_ar
 * @property string $type
 * @property int|null $media_id
 * @property bool $is_visible
 * @property int $sort_order
 * @property int|null $updated_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read string $content
 * @property-read \App\Models\Media|null $media
 * @property-read \App\Models\User|null $updatedByUser
 * @method static Builder<static>|SiteContent newModelQuery()
 * @method static Builder<static>|SiteContent newQuery()
 * @method static Builder<static>|SiteContent query()
 * @method static Builder<static>|SiteContent visible()
 * @method static Builder<static>|SiteContent whereContentAr($value)
 * @method static Builder<static>|SiteContent whereContentEn($value)
 * @method static Builder<static>|SiteContent whereCreatedAt($value)
 * @method static Builder<static>|SiteContent whereId($value)
 * @method static Builder<static>|SiteContent whereIsVisible($value)
 * @method static Builder<static>|SiteContent whereKey($value)
 * @method static Builder<static>|SiteContent whereMediaId($value)
 * @method static Builder<static>|SiteContent wherePage($value)
 * @method static Builder<static>|SiteContent whereSection($value)
 * @method static Builder<static>|SiteContent whereSortOrder($value)
 * @method static Builder<static>|SiteContent whereType($value)
 * @method static Builder<static>|SiteContent whereUpdatedAt($value)
 * @method static Builder<static>|SiteContent whereUpdatedBy($value)
 * @mixin \Eloquent
 */
class SiteContent extends Model
{
    protected $table = 'site_content';

    protected $fillable = [
        'page',
        'section',
        'key',
        'content_en',
        'content_ar',
        'type',
        'media_id',
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

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'media_id');
    }

    public function updatedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function getContentAttribute(): string
    {
        return app()->getLocale() === 'ar'
            ? ($this->content_ar ?: $this->content_en ?: '')
            : ($this->content_en ?: '');
    }

    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('is_visible', true);
    }

    /**
     * Fetch a single content value by (page, section, key) for a locale.
     */
    public static function getContent(string $page, string $section, string $key, string $locale = 'en'): ?string
    {
        $row = static::query()
            ->where('page', $page)
            ->where('section', $section)
            ->where('key', $key)
            ->first();

        if (! $row) {
            return null;
        }

        return $locale === 'ar' ? ($row->content_ar ?: $row->content_en) : $row->content_en;
    }

    /**
     * Fetch all rows for a page as a nested array: [section][key] => content.
     * Includes media attachments and visibility flags so the controller can
     * decide what to render.
     */
    public static function getPage(string $page, string $locale = 'en'): array
    {
        $rows = static::with('media')
            ->where('page', $page)
            ->orderBy('sort_order')
            ->get();

        $result = [];
        foreach ($rows as $row) {
            $result[$row->section][$row->key] = [
                'content' => $locale === 'ar' ? ($row->content_ar ?: $row->content_en) : $row->content_en,
                'media' => $row->media ? [
                    'id' => $row->media->id,
                    'url' => $row->media->url,
                    'alt' => $row->media->alt_text,
                ] : null,
                'is_visible' => (bool) $row->is_visible,
            ];
        }

        return $result;
    }
}
