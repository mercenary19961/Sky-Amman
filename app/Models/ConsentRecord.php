<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * One row per consent decision. See the migration for why this is append-only.
 */
class ConsentRecord extends Model
{
    use HasFactory;

    /**
     * Bump when the banner wording or the category set changes, so old records
     * stay attributable to the text they were actually shown.
     */
    public const POLICY_VERSION = '1';

    public const ACTIONS = ['accept_all', 'reject_all', 'custom'];

    protected $fillable = [
        'uid', 'action', 'analytics', 'marketing',
        'locale', 'policy_version', 'url', 'ip_address', 'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'analytics' => 'boolean',
            'marketing' => 'boolean',
        ];
    }

    /**
     * Record a decision. The single write path — the controller never calls
     * create() directly, matching Setting::set() / Media::storeFile().
     *
     * @param  array{analytics: bool, marketing: bool}  $categories
     */
    public static function record(string $uid, string $action, array $categories, array $context = []): self
    {
        return self::create([
            'uid' => $uid,
            'action' => $action,
            'analytics' => $categories['analytics'],
            'marketing' => $categories['marketing'],
            'locale' => $context['locale'] ?? 'en',
            'policy_version' => self::POLICY_VERSION,
            'url' => $context['url'] ?? null,
            'ip_address' => $context['ip'] ?? null,
            'user_agent' => $context['user_agent'] ?? null,
        ]);
    }

    /**
     * Headline stats for the admin page, over the last $days days.
     *
     * Rates are share-of-decisions, so they always sum to 100% across the three
     * actions. Category opt-in rates are independent of each other (a 'custom'
     * decision can accept analytics but refuse marketing), so those are counted
     * separately rather than derived from the action split.
     *
     * @return array<string, mixed>
     */
    public static function stats(int $days = 30): array
    {
        $since = Carbon::now()->subDays($days);

        $rows = self::query()->where('created_at', '>=', $since);

        $total = (clone $rows)->count();
        $countBy = fn (string $action) => (clone $rows)->where('action', $action)->count();
        $pct = fn (int $n) => $total > 0 ? round($n * 100 / $total, 1) : 0.0;

        $acceptAll = $countBy('accept_all');
        $rejectAll = $countBy('reject_all');
        $custom = $countBy('custom');

        return [
            'total' => $total,
            'days' => $days,
            'actions' => [
                'accept_all' => ['count' => $acceptAll, 'pct' => $pct($acceptAll)],
                'reject_all' => ['count' => $rejectAll, 'pct' => $pct($rejectAll)],
                'custom' => ['count' => $custom, 'pct' => $pct($custom)],
            ],
            'categories' => [
                'analytics' => $pct((clone $rows)->where('analytics', true)->count()),
                'marketing' => $pct((clone $rows)->where('marketing', true)->count()),
            ],
            'locales' => [
                'en' => $pct((clone $rows)->where('locale', 'en')->count()),
                'ar' => $pct((clone $rows)->where('locale', 'ar')->count()),
            ],
            'trend' => self::trend($since, $days),
        ];
    }

    /**
     * Daily decision counts, zero-filled so the chart has no gaps.
     *
     * Grouped in PHP rather than SQL: date functions differ between SQLite (dev
     * + tests) and MySQL (production), and the row count here is small.
     *
     * @return list<array{date: string, total: int}>
     */
    private static function trend(Carbon $since, int $days): array
    {
        $counts = self::query()
            ->where('created_at', '>=', $since)
            ->get(['created_at'])
            ->countBy(fn (self $r) => $r->created_at->toDateString());

        return collect(range($days - 1, 0))
            ->map(function (int $ago) use ($counts) {
                $date = Carbon::now()->subDays($ago)->toDateString();

                return ['date' => $date, 'total' => (int) $counts->get($date, 0)];
            })
            ->values()
            ->all();
    }
}
