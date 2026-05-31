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
