<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChangeLog;
use App\Models\User;
use App\Services\ChangeLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin-only audit history of tracked edits (settings, site content, projects,
 * users) with per-entry Revert. Logging is done by ChangeLogService from the
 * respective controllers; this just lists + reverts + prunes.
 */
class ChangeLogController extends Controller
{
    public function __construct(private ChangeLogService $changeLog)
    {
    }

    /** Page sizes the admin can pick (mirrors the per-page selector). */
    private const PER_PAGE = [10, 20, 50, 100];

    public function index(Request $request): Response
    {
        $query = ChangeLog::query()->with(['changedByUser:id,name', 'revertedByUser:id,name']);

        if ($request->filled('model_type')) {
            $query->where('model_type', $request->model_type);
        }

        if ($request->filled('changed_by')) {
            $query->where('changed_by', $request->changed_by);
        }

        // Action filter (create / update / delete / restore).
        if ($request->filled('action') && in_array($request->action, [
            ChangeLog::ACTION_CREATE, ChangeLog::ACTION_UPDATE,
            ChangeLog::ACTION_DELETE, ChangeLog::ACTION_RESTORE,
        ], true)) {
            $query->where('action', $request->action);
        }

        // Revert status filter.
        if ($request->input('status') === 'reverted') {
            $query->whereNotNull('reverted_at');
        } elseif ($request->input('status') === 'active') {
            $query->whereNull('reverted_at');
        }

        // Free-text search over the human label + the model id.
        if ($request->filled('search')) {
            $term = '%' . str_replace(['%', '_'], ['\\%', '\\_'], (string) $request->search) . '%';
            $query->where(function ($q) use ($term) {
                $q->where('label', 'like', $term)->orWhere('model_id', 'like', $term);
            });
        }

        // Time window — finer-grained presets than before (down to the last hour).
        if ($request->filled('period')) {
            $since = match ($request->period) {
                'hour'  => now()->subHour(),
                'today' => now()->startOfDay(),
                'week'  => now()->subWeek(),
                'month' => now()->subMonth(),
                'year'  => now()->startOfYear(),
                default => null,
            };
            if ($since) {
                $query->where('created_at', '>=', $since);
            }
        }

        $perPage = (int) $request->input('per_page', 20);
        if (! in_array($perPage, self::PER_PAGE, true)) {
            $perPage = 20;
        }

        $logs = $query->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (ChangeLog $log) => [
                'id'               => $log->id,
                'model_type'       => $log->model_type,
                'section'          => ChangeLogService::SECTION_LABELS[$log->model_type] ?? $log->model_type,
                'action'           => $log->action,
                'label'            => $log->label,
                'changes'          => $this->changeLog->diff($log),
                'changed_by'       => $log->changedByUser?->name,
                'created_ago'      => $log->created_at->diffForHumans(),
                'created_at'       => $log->created_at->toDayDateTimeString(),
                'created_time'     => $log->created_at->format('g:i A'),
                // Day bucket for grouped headers (Today / Yesterday / full date).
                'day_key'          => $log->created_at->toDateString(),
                'day_label'        => $this->dayLabel($log->created_at),
                'revertable'       => $this->changeLog->revertable($log),
                'reverted'         => $log->isReverted(),
                'reverted_by'      => $log->revertedByUser?->name,
                'reverted_ago'     => $log->reverted_at?->diffForHumans(),
                'reverted_at'      => $log->reverted_at?->toDayDateTimeString(),
            ]);

        // Only users who actually appear in the log (keeps the filter tidy).
        $userIds = ChangeLog::query()->pluck('changed_by')->filter()->unique()->values();
        $users = User::query()->whereKey($userIds)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/ChangeLog', [
            'logs'          => $logs,
            'users'         => $users,
            'sectionLabels' => ChangeLogService::SECTION_LABELS,
            'perPageOptions' => self::PER_PAGE,
            'filters'       => $request->only(['model_type', 'changed_by', 'action', 'status', 'search', 'period', 'per_page']),
        ]);
    }

    /** Friendly day-group header: "Today" / "Yesterday" / "Monday, Jun 8, 2026". */
    private function dayLabel(\Illuminate\Support\Carbon $date): string
    {
        return match (true) {
            $date->isToday()     => 'Today',
            $date->isYesterday() => 'Yesterday',
            default              => $date->format('l, M j, Y'),
        };
    }

    public function revert(int $id): RedirectResponse
    {
        $log = ChangeLog::findOrFail($id);

        if ($log->isReverted()) {
            return back()->with('error', 'This change has already been reverted.');
        }

        if (! $this->changeLog->revert($log)) {
            return back()->with('error', 'This change can\'t be reverted.');
        }

        return back()->with('success', ($log->label ?? 'Change') . ' reverted.');
    }

    public function destroy(int $id): RedirectResponse
    {
        ChangeLog::findOrFail($id)->delete();

        return back()->with('success', 'Log entry removed.');
    }

    /** Dismiss the persistent "Undo last save" pointer for a section (no revert). */
    public function dismissUndo(string $modelType): RedirectResponse
    {
        session()->forget("undo:{$modelType}");

        return back();
    }
}
