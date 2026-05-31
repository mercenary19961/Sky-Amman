<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

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
