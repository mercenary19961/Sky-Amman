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

    public function index(Request $request): Response
    {
        $query = ChangeLog::query()->with(['changedByUser:id,name', 'revertedByUser:id,name']);

        if ($request->filled('model_type')) {
            $query->where('model_type', $request->model_type);
        }

        if ($request->filled('changed_by')) {
            $query->where('changed_by', $request->changed_by);
        }

        if ($request->filled('period')) {
            $since = match ($request->period) {
                'today' => now()->startOfDay(),
                'week'  => now()->subWeek(),
                'month' => now()->subMonth(),
                default => null,
            };
            if ($since) {
                $query->where('created_at', '>=', $since);
            }
        }

        $logs = $query->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (ChangeLog $log) => [
                'id'              => $log->id,
                'model_type'      => $log->model_type,
                'section'         => ChangeLogService::SECTION_LABELS[$log->model_type] ?? $log->model_type,
                'action'          => $log->action,
                'label'           => $log->label,
                'changes'         => $this->changeLog->diff($log),
                'changed_by'      => $log->changedByUser?->name,
                'created_ago'     => $log->created_at->diffForHumans(),
                'created_at'      => $log->created_at->toDayDateTimeString(),
                'revertable'      => $this->changeLog->revertable($log),
                'reverted'        => $log->isReverted(),
                'reverted_by'     => $log->revertedByUser?->name,
                'reverted_ago'    => $log->reverted_at?->diffForHumans(),
            ]);

        // Only users who actually appear in the log (keeps the filter tidy).
        $userIds = ChangeLog::query()->pluck('changed_by')->filter()->unique()->values();
        $users = User::query()->whereKey($userIds)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/ChangeLog', [
            'logs'          => $logs,
            'users'         => $users,
            'sectionLabels' => ChangeLogService::SECTION_LABELS,
            'filters'       => $request->only(['model_type', 'changed_by', 'period']),
        ]);
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
