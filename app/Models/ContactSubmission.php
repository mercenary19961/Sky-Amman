<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContactSubmission extends Model
{
    use SoftDeletes;

    public const REQUEST_TYPES = ['buy', 'rent', 'build', 'investment', 'general'];

    protected $fillable = [
        'name',
        'email',
        'phone',
        'request_type',
        'subject',
        'message',
        'project_id',
        'is_read',
        'is_archived',
        'read_by',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
            'is_archived' => 'boolean',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function readByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'read_by');
    }

    public function scopeUnread(Builder $query): Builder
    {
        return $query->where('is_read', false);
    }

    public function scopeUnarchived(Builder $query): Builder
    {
        return $query->where('is_archived', false);
    }

    public function scopeOfRequestType(Builder $query, string $type): Builder
    {
        return $query->where('request_type', $type);
    }
}
