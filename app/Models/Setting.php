<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $key
 * @property string|null $value
 * @property string $type
 * @property string $group
 * @property int|null $updated_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User|null $updatedByUser
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting whereGroup($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting whereKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting whereUpdatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting whereValue($value)
 * @mixin \Eloquent
 */
class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'updated_by',
    ];

    public function updatedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        $row = static::where('key', $key)->first();
        return $row ? $row->value : $default;
    }

    public static function set(string $key, mixed $value, ?int $userId = null): self
    {
        return static::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'updated_by' => $userId],
        );
    }

    public static function getGroup(string $group): array
    {
        return static::where('group', $group)
            ->pluck('value', 'key')
            ->toArray();
    }

    /**
     * Decode a JSON-typed setting (e.g. the lead-routing map). Returns
     * an empty array if the key is missing or unparsable.
     */
    public static function getJson(string $key): array
    {
        $raw = static::get($key);
        if (! $raw) {
            return [];
        }
        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : [];
    }
}
