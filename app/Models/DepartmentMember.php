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
 * @property string|null $role_en
 * @property string|null $role_ar
 * @property int|null $media_id
 * @property int $sort_order
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \App\Models\Media|null $media
 * @method static Builder<static>|DepartmentMember active()
 * @method static Builder<static>|DepartmentMember newModelQuery()
 * @method static Builder<static>|DepartmentMember newQuery()
 * @method static Builder<static>|DepartmentMember onlyTrashed()
 * @method static Builder<static>|DepartmentMember ordered()
 * @method static Builder<static>|DepartmentMember query()
 * @method static Builder<static>|DepartmentMember whereCreatedAt($value)
 * @method static Builder<static>|DepartmentMember whereDeletedAt($value)
 * @method static Builder<static>|DepartmentMember whereId($value)
 * @method static Builder<static>|DepartmentMember whereIsActive($value)
 * @method static Builder<static>|DepartmentMember whereMediaId($value)
 * @method static Builder<static>|DepartmentMember whereNameAr($value)
 * @method static Builder<static>|DepartmentMember whereNameEn($value)
 * @method static Builder<static>|DepartmentMember whereRoleAr($value)
 * @method static Builder<static>|DepartmentMember whereRoleEn($value)
 * @method static Builder<static>|DepartmentMember whereSortOrder($value)
 * @method static Builder<static>|DepartmentMember whereUpdatedAt($value)
 * @method static Builder<static>|DepartmentMember withTrashed(bool $withTrashed = true)
 * @method static Builder<static>|DepartmentMember withoutTrashed()
 * @mixin \Eloquent
 */
class DepartmentMember extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name_en',
        'name_ar',
        'role_en',
        'role_ar',
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
