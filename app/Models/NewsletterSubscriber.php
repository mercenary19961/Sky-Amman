<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property string $email
 * @property bool $is_active
 * @property string|null $ip_address
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber whereIpAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber withoutTrashed()
 * @mixin \Eloquent
 */
class NewsletterSubscriber extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'email',
        'is_active',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Record a sign-up idempotently. Re-subscribing an existing (or previously
     * unsubscribed/soft-deleted) address restores + reactivates it rather than
     * erroring on the unique constraint, so the public form can always report
     * success without leaking whether the address was already on the list.
     *
     * Always go through this method — never NewsletterSubscriber::create() —
     * so the normalize + restore + reactivate logic stays in one place.
     */
    public static function subscribe(string $email, ?string $ipAddress = null): self
    {
        $email = strtolower(trim($email));

        $subscriber = static::withTrashed()->firstOrNew(['email' => $email]);

        if ($subscriber->trashed()) {
            $subscriber->restore();
        }

        $subscriber->is_active = true;
        if ($ipAddress !== null) {
            $subscriber->ip_address = $ipAddress;
        }
        $subscriber->save();

        return $subscriber;
    }
}
