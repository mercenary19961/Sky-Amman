<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property string|null $title
 * @property string $url
 * @property int $sort_order
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @method static Builder<static>|TestimonialVideo active()
 * @method static Builder<static>|TestimonialVideo newModelQuery()
 * @method static Builder<static>|TestimonialVideo newQuery()
 * @method static Builder<static>|TestimonialVideo onlyTrashed()
 * @method static Builder<static>|TestimonialVideo ordered()
 * @method static Builder<static>|TestimonialVideo query()
 * @method static Builder<static>|TestimonialVideo whereCreatedAt($value)
 * @method static Builder<static>|TestimonialVideo whereDeletedAt($value)
 * @method static Builder<static>|TestimonialVideo whereId($value)
 * @method static Builder<static>|TestimonialVideo whereIsActive($value)
 * @method static Builder<static>|TestimonialVideo whereSortOrder($value)
 * @method static Builder<static>|TestimonialVideo whereTitle($value)
 * @method static Builder<static>|TestimonialVideo whereUpdatedAt($value)
 * @method static Builder<static>|TestimonialVideo whereUrl($value)
 * @method static Builder<static>|TestimonialVideo withTrashed(bool $withTrashed = true)
 * @method static Builder<static>|TestimonialVideo withoutTrashed()
 * @mixin \Eloquent
 */
class TestimonialVideo extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'url',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
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
