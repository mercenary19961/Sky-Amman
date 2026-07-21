<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ConsentRecord;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConsentController extends Controller
{
    /** Selectable windows for the stats header. */
    private const PERIODS = [7, 30, 90];

    /**
     * Cookie-consent log + opt-in analytics.
     *
     * Read-only by design: the log is evidence, so there is no edit or delete
     * path. If retention pruning is ever needed it belongs in a scheduled
     * command, not a button an admin can click by accident.
     */
    public function index(Request $request): Response
    {
        $days = (int) $request->query('days', 30);

        if (! in_array($days, self::PERIODS, true)) {
            $days = 30;
        }

        $records = ConsentRecord::query()
            ->when(
                in_array($request->query('action'), ConsentRecord::ACTIONS, true),
                fn ($q) => $q->where('action', $request->query('action'))
            )
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (ConsentRecord $r) => [
                'id' => $r->id,
                'action' => $r->action,
                'analytics' => $r->analytics,
                'marketing' => $r->marketing,
                'locale' => $r->locale,
                'policy_version' => $r->policy_version,
                'ip_address' => $r->ip_address,
                'url' => $r->url,
                'created_at' => $r->created_at?->toIso8601String(),
            ]);

        return Inertia::render('Admin/Consent/Index', [
            'stats' => ConsentRecord::stats($days),
            'records' => $records,
            'filters' => [
                'days' => $days,
                'action' => $request->query('action'),
            ],
            'periods' => self::PERIODS,
        ]);
    }
}
