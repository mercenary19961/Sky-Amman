<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property string $request_type
 * @property string|null $subject
 * @property string $message
 * @property int|null $project_id
 * @property bool $is_read
 * @property bool $is_archived
 * @property int|null $read_by
 * @property string|null $ip_address
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \App\Models\Project|null $project
 * @property-read \App\Models\User|null $readByUser
 * @method static Builder<static>|ContactSubmission newModelQuery()
 * @method static Builder<static>|ContactSubmission newQuery()
 * @method static Builder<static>|ContactSubmission ofRequestType(string $type)
 * @method static Builder<static>|ContactSubmission onlyTrashed()
 * @method static Builder<static>|ContactSubmission query()
 * @method static Builder<static>|ContactSubmission unarchived()
 * @method static Builder<static>|ContactSubmission unread()
 * @method static Builder<static>|ContactSubmission whereCreatedAt($value)
 * @method static Builder<static>|ContactSubmission whereDeletedAt($value)
 * @method static Builder<static>|ContactSubmission whereEmail($value)
 * @method static Builder<static>|ContactSubmission whereId($value)
 * @method static Builder<static>|ContactSubmission whereIpAddress($value)
 * @method static Builder<static>|ContactSubmission whereIsArchived($value)
 * @method static Builder<static>|ContactSubmission whereIsRead($value)
 * @method static Builder<static>|ContactSubmission whereMessage($value)
 * @method static Builder<static>|ContactSubmission whereName($value)
 * @method static Builder<static>|ContactSubmission wherePhone($value)
 * @method static Builder<static>|ContactSubmission whereProjectId($value)
 * @method static Builder<static>|ContactSubmission whereReadBy($value)
 * @method static Builder<static>|ContactSubmission whereRequestType($value)
 * @method static Builder<static>|ContactSubmission whereSubject($value)
 * @method static Builder<static>|ContactSubmission whereUpdatedAt($value)
 * @method static Builder<static>|ContactSubmission withTrashed(bool $withTrashed = true)
 * @method static Builder<static>|ContactSubmission withoutTrashed()
 * @mixin \Eloquent
 */
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
