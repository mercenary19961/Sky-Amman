<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property string|null $name_en
 * @property string|null $name_ar
 * @property string|null $quote_en
 * @property string|null $quote_ar
 * @property int|null $media_id
 * @property int $sort_order
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \App\Models\Media|null $media
 * @method static Builder<static>|Testimonial active()
 * @method static Builder<static>|Testimonial newModelQuery()
 * @method static Builder<static>|Testimonial newQuery()
 * @method static Builder<static>|Testimonial onlyTrashed()
 * @method static Builder<static>|Testimonial ordered()
 * @method static Builder<static>|Testimonial query()
 * @method static Builder<static>|Testimonial whereCreatedAt($value)
 * @method static Builder<static>|Testimonial whereDeletedAt($value)
 * @method static Builder<static>|Testimonial whereId($value)
 * @method static Builder<static>|Testimonial whereIsActive($value)
 * @method static Builder<static>|Testimonial whereMediaId($value)
 * @method static Builder<static>|Testimonial whereNameAr($value)
 * @method static Builder<static>|Testimonial whereNameEn($value)
 * @method static Builder<static>|Testimonial whereQuoteAr($value)
 * @method static Builder<static>|Testimonial whereQuoteEn($value)
 * @method static Builder<static>|Testimonial whereSortOrder($value)
 * @method static Builder<static>|Testimonial whereUpdatedAt($value)
 * @method static Builder<static>|Testimonial withTrashed(bool $withTrashed = true)
 * @method static Builder<static>|Testimonial withoutTrashed()
 * @mixin \Eloquent
 */
class Testimonial extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name_en',
        'name_ar',
        'quote_en',
        'quote_ar',
        'media_id',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }
}
