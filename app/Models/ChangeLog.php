<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Persistent record of admin edits — drives the Change Log tab + Revert flow.
 * Created by ChangeLogService whenever a tracked model is created/updated/deleted.
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
