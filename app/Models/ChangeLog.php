<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Persistent record of admin edits — drives the Change Log tab + Revert flow.
 *
 * Created by ChangeLogService whenever a tracked model is created/updated/deleted.
 *
 * @property int $id
 * @property string $model_type
 * @property string $model_id
 * @property string $action
 * @property array<array-key, mixed>|null $old_data
 * @property array<array-key, mixed>|null $new_data
 * @property string|null $label
 * @property int|null $changed_by
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon|null $reverted_at
 * @property int|null $reverted_by
 * @property-read \App\Models\User|null $changedByUser
 * @property-read \App\Models\User|null $revertedByUser
 * @method static Builder<static>|ChangeLog forModel(string $modelType, string|int $modelId)
 * @method static Builder<static>|ChangeLog newModelQuery()
 * @method static Builder<static>|ChangeLog newQuery()
 * @method static Builder<static>|ChangeLog notReverted()
 * @method static Builder<static>|ChangeLog query()
 * @method static Builder<static>|ChangeLog whereAction($value)
 * @method static Builder<static>|ChangeLog whereChangedBy($value)
 * @method static Builder<static>|ChangeLog whereCreatedAt($value)
 * @method static Builder<static>|ChangeLog whereId($value)
 * @method static Builder<static>|ChangeLog whereLabel($value)
 * @method static Builder<static>|ChangeLog whereModelId($value)
 * @method static Builder<static>|ChangeLog whereModelType($value)
 * @method static Builder<static>|ChangeLog whereNewData($value)
 * @method static Builder<static>|ChangeLog whereOldData($value)
 * @method static Builder<static>|ChangeLog whereRevertedAt($value)
 * @method static Builder<static>|ChangeLog whereRevertedBy($value)
 * @mixin \Eloquent
 */
class ChangeLog extends Model
{
    public const UPDATED_AT = null;

    public const ACTION_CREATE = 'create';
    public const ACTION_UPDATE = 'update';
    public const ACTION_DELETE = 'delete';
    public const ACTION_RESTORE = 'restore';

    protected $fillable = [
        'model_type',
        'model_id',
        'action',
        'old_data',
        'new_data',
        'label',
        'changed_by',
        'reverted_at',
        'reverted_by',
    ];

    protected function casts(): array
    {
        return [
            'old_data' => 'array',
            'new_data' => 'array',
            'created_at' => 'datetime',
            'reverted_at' => 'datetime',
        ];
    }

    public function changedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    public function revertedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reverted_by');
    }

    public function isReverted(): bool
    {
        return $this->reverted_at !== null;
    }

    public function scopeNotReverted(Builder $query): Builder
    {
        return $query->whereNull('reverted_at');
    }

    public function scopeForModel(Builder $query, string $modelType, int|string $modelId): Builder
    {
        return $query->where('model_type', $modelType)->where('model_id', $modelId);
    }
}
