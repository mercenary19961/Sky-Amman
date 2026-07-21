<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string $role
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @method static Builder<static>|User active()
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static Builder<static>|User newModelQuery()
 * @method static Builder<static>|User newQuery()
 * @method static Builder<static>|User onlyTrashed()
 * @method static Builder<static>|User query()
 * @method static Builder<static>|User whereCreatedAt($value)
 * @method static Builder<static>|User whereDeletedAt($value)
 * @method static Builder<static>|User whereEmail($value)
 * @method static Builder<static>|User whereEmailVerifiedAt($value)
 * @method static Builder<static>|User whereId($value)
 * @method static Builder<static>|User whereIsActive($value)
 * @method static Builder<static>|User whereName($value)
 * @method static Builder<static>|User wherePassword($value)
 * @method static Builder<static>|User whereRememberToken($value)
 * @method static Builder<static>|User whereRole($value)
 * @method static Builder<static>|User whereUpdatedAt($value)
 * @method static Builder<static>|User withTrashed(bool $withTrashed = true)
 * @method static Builder<static>|User withoutTrashed()
 * @mixin \Eloquent
 */
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * Grantable abilities for the admin-only sections, in display order.
     *
     * This registry is the single source of truth: gates are defined from it
     * (AppServiceProvider), the UserController validates against it, and the
     * admin UI renders from it. Adding a section = one entry here + a `can:`
     * guard on its routes + an `ability` on its sidebar item.
     *
     * ⚠️ Users & Auth is deliberately ABSENT and must stay that way. An editor
     * who can manage users can create an admin or promote themselves, so making
     * it grantable would let the permission system escalate past its own
     * boundary. It stays behind the `admin` middleware.
     *
     * `requires` encodes implication: you cannot edit what you cannot see, so
     * granting a dependent ability implies its parent (enforced server-side in
     * UserController::normalisePermissions(), mirrored in the UI).
     *
     * @var array<string, array{group: string, label: string, description: string, requires?: string}>
     */
    public const ABILITIES = [
        'consent.view' => [
            'group' => 'Cookie Consent',
            'label' => 'View consent log',
            // No edit/delete counterpart on purpose: the consent log is an
            // append-only evidence trail with no mutation path in the app.
            'description' => 'Read the cookie-consent records and opt-in analytics. Contains visitor IP addresses.',
        ],
        'change_log.view' => [
            'group' => 'Change Log',
            'label' => 'View history',
            'description' => 'See who changed what across the admin panel.',
        ],
        'change_log.revert' => [
            'group' => 'Change Log',
            'label' => 'Revert changes',
            'description' => 'Roll a record back to an earlier snapshot. Can overwrite newer edits by other people.',
            'requires' => 'change_log.view',
        ],
        'change_log.delete' => [
            'group' => 'Change Log',
            'label' => 'Delete entries',
            'description' => 'Permanently remove history rows. This destroys the audit trail for those changes.',
            'requires' => 'change_log.view',
        ],
        'settings.view' => [
            'group' => 'Settings',
            'label' => 'View settings',
            'description' => 'Read site settings, including contact details and API credentials.',
        ],
        'settings.edit' => [
            'group' => 'Settings',
            'label' => 'Edit settings',
            'description' => 'Change site settings, lead routing and SEO defaults.',
            'requires' => 'settings.view',
        ],
        'content.reset' => [
            'group' => 'Site Content',
            'label' => 'Reset to defaults',
            'description' => 'Restore every content row to the shipped defaults. Affects the whole public site.',
        ],
    ];

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
        'permissions',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'permissions' => 'array',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Does this account hold `$ability`?
     *
     * Admins short-circuit to true — the grant list only ever describes what an
     * EDITOR may additionally reach, so an admin's stored permissions are
     * irrelevant (and are nulled on save). Unknown ability strings return false:
     * a typo in a route guard locks the door rather than opening it.
     *
     * @return bool
     */
    public function hasPermission(string $ability): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        if (! array_key_exists($ability, self::ABILITIES)) {
            return false;
        }

        return in_array($ability, $this->permissions ?? [], true);
    }

    /**
     * Every ability this account effectively holds — what the frontend needs to
     * decide which sidebar items to render.
     *
     * @return list<string>
     */
    public function effectiveAbilities(): array
    {
        if ($this->isAdmin()) {
            return array_keys(self::ABILITIES);
        }

        return array_values(array_intersect(
            $this->permissions ?? [],
            array_keys(self::ABILITIES),
        ));
    }

    public function isEditor(): bool
    {
        return $this->role === 'editor';
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
