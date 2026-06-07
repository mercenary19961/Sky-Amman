<?php

namespace App\Services;

use App\Models\ChangeLog;
use App\Models\Page;
use App\Models\Project;
use App\Models\Setting;
use App\Models\SiteContent;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;

/**
 * Records admin edits to the `change_logs` table and reverts them. Adapted to
 * Sky Amman's schema (action + old_data/new_data snapshots + reverted_at/by).
 *
 * Tracked sections: settings, site_content, project, user. Each `log()` also
 * flashes an `undo` payload so the post-save toast can offer a one-click revert
 * of the entry just created (see HandleInertiaRequests + UndoToast).
 */
class ChangeLogService
{
    public const SECTION_LABELS = [
        'settings'     => 'Settings',
        'site_content' => 'Site Content',
        'project'      => 'Projects',
        'user'         => 'Users',
    ];

    /** Metadata columns never shown as a diff or written back on revert. */
    private const SKIP_KEYS = ['id', 'created_at', 'updated_at', 'deleted_at', 'password', 'remember_token', 'slug'];

    /**
     * Record a change. Update actions with no real diff are skipped (returns null).
     * Flashes an `undo` payload for the toast on success.
     */
    public function log(string $modelType, string|int $id, string $action, ?array $oldData, ?array $newData, ?string $label = null): ?ChangeLog
    {
        if ($action === ChangeLog::ACTION_UPDATE && empty($this->buildDiff($modelType, $oldData ?? [], $newData ?? []))) {
            return null;
        }

        $log = ChangeLog::create([
            'model_type' => $modelType,
            'model_id'   => (string) $id,
            'action'     => $action,
            'old_data'   => $oldData,
            'new_data'   => $newData,
            'label'      => $label,
            'changed_by' => Auth::id(),
        ]);

        if ($this->revertable($log)) {
            $payload = [
                'id'       => $log->id,
                'section'  => self::SECTION_LABELS[$modelType] ?? $modelType,
                'action'   => $action,
                'label'    => $label,
                'changes'  => $this->diff($log),
                'saved_at' => $log->created_at->toIso8601String(),
            ];

            // Transient toast (all admin pages) + a persistent per-section pointer
            // that backs the inline "Undo last save" button until used/dismissed.
            session()->flash('undo', $payload);
            session()->put("undo:{$modelType}", $payload);
        }

        return $log;
    }

    /** Whether a log entry can be reverted (depends on section + action). */
    public function revertable(ChangeLog $log): bool
    {
        if ($log->isReverted()) {
            return false;
        }

        return match ($log->model_type) {
            'settings', 'site_content' => $log->action === ChangeLog::ACTION_UPDATE,
            'project' => in_array($log->action, [
                ChangeLog::ACTION_CREATE, ChangeLog::ACTION_UPDATE,
                ChangeLog::ACTION_DELETE, ChangeLog::ACTION_RESTORE,
            ], true),
            // Users are hard-deleted, so a delete can't be cleanly restored; only
            // create (→ delete) and update (→ restore fields) are revertable.
            'user' => in_array($log->action, [ChangeLog::ACTION_CREATE, ChangeLog::ACTION_UPDATE], true),
            default => false,
        };
    }

    /** Apply a revert. Returns true on success; stamps reverted_at/by. */
    public function revert(ChangeLog $log): bool
    {
        if (! $this->revertable($log)) {
            return false;
        }

        $ok = match ($log->model_type) {
            'settings'     => $this->revertSettings($log),
            'site_content' => $this->revertSiteContent($log),
            'project'      => $this->revertProject($log),
            'user'         => $this->revertUser($log),
            default        => false,
        };

        if ($ok) {
            $log->update(['reverted_at' => now(), 'reverted_by' => Auth::id()]);

            // Clear the persistent undo pointer if it was for this entry.
            if ((session("undo:{$log->model_type}")['id'] ?? null) === $log->id) {
                session()->forget("undo:{$log->model_type}");
            }
        }

        return $ok;
    }

    // ── Revert implementations ──────────────────────────────────────────────

    private function revertSettings(ChangeLog $log): bool
    {
        foreach (($log->old_data ?? []) as $key => $value) {
            Setting::set($key, (string) $value, Auth::id());
        }

        return true;
    }

    private function revertSiteContent(ChangeLog $log): bool
    {
        $old = $log->old_data ?? [];
        // Combined shape {rows, page}; fall back to the legacy flat rows map.
        $rows = array_key_exists('rows', $old) ? ($old['rows'] ?? []) : $old;
        $page = $old['page'] ?? [];

        foreach ($rows as $id => $fields) {
            SiteContent::query()->where('id', $id)->update([
                'content_en' => $fields['content_en'] ?? null,
                'content_ar' => $fields['content_ar'] ?? null,
                'is_visible' => $fields['is_visible'] ?? true,
                'updated_by' => Auth::id(),
            ]);
        }

        if (! empty($page)) {
            Page::query()->where('slug', $log->model_id)->update([
                'is_visible'         => $page['is_visible'] ?? true,
                'seo_title_en'       => $page['seo_title_en'] ?? null,
                'seo_title_ar'       => $page['seo_title_ar'] ?? null,
                'seo_description_en' => $page['seo_description_en'] ?? null,
                'seo_description_ar' => $page['seo_description_ar'] ?? null,
                'updated_by'         => Auth::id(),
            ]);
        }

        return true;
    }

    private function revertProject(ChangeLog $log): bool
    {
        return match ($log->action) {
            ChangeLog::ACTION_CREATE => (bool) Project::query()->whereKey($log->model_id)->first()?->delete(),
            ChangeLog::ACTION_RESTORE => (bool) Project::query()->whereKey($log->model_id)->first()?->delete(),
            ChangeLog::ACTION_DELETE => (bool) Project::withTrashed()->whereKey($log->model_id)->first()?->restore(),
            ChangeLog::ACTION_UPDATE => $this->restoreAttributes(Project::query()->whereKey($log->model_id)->first(), $log->old_data),
            default => false,
        };
    }

    private function revertUser(ChangeLog $log): bool
    {
        return match ($log->action) {
            ChangeLog::ACTION_CREATE => (bool) User::query()->whereKey($log->model_id)->first()?->delete(),
            ChangeLog::ACTION_UPDATE => $this->restoreAttributes(User::query()->whereKey($log->model_id)->first(), $log->old_data),
            default => false,
        };
    }

    /** Write a snapshot's non-metadata fields back onto a model. */
    private function restoreAttributes(?object $model, ?array $oldData): bool
    {
        if ($model === null || empty($oldData)) {
            return false;
        }

        $model->fill(Arr::except($oldData, self::SKIP_KEYS));
        if (in_array('updated_by', $model->getFillable(), true)) {
            $model->updated_by = Auth::id();
        }
        $model->save();

        return true;
    }

    // ── Diff for display ────────────────────────────────────────────────────

    /**
     * Human-readable field changes for a log entry: [{label, old, new}].
     */
    public function diff(ChangeLog $log): array
    {
        return $this->buildDiff($log->model_type, $log->old_data ?? [], $log->new_data ?? []);
    }

    private function buildDiff(string $modelType, array $old, array $new): array
    {
        return match ($modelType) {
            'site_content' => $this->diffSiteContent($old, $new),
            'settings'     => $this->diffKeyValue($old, $new),
            default        => $this->diffAttributes($old, $new),
        };
    }

    /**
     * Combined site-content diff: bilingual content rows (keyed by id) + the
     * page-level SEO/visibility meta. Falls back to the legacy flat rows map.
     */
    private function diffSiteContent(array $old, array $new): array
    {
        $oldRows = array_key_exists('rows', $old) ? ($old['rows'] ?? []) : $old;
        $newRows = array_key_exists('rows', $new) ? ($new['rows'] ?? []) : $new;
        $oldPage = $old['page'] ?? [];
        $newPage = $new['page'] ?? [];

        $changes = [];

        foreach ($newRows as $id => $fields) {
            $prev  = $oldRows[$id] ?? [];
            $label = $fields['label'] ?? "Row #{$id}";

            foreach (['content_en' => ' (EN)', 'content_ar' => ' (AR)'] as $key => $suffix) {
                $a = (string) ($prev[$key] ?? '');
                $b = (string) ($fields[$key] ?? '');
                if ($a !== $b) {
                    $changes[] = ['label' => $label . $suffix, 'old' => $this->truncate($a), 'new' => $this->truncate($b)];
                }
            }

            if (($prev['is_visible'] ?? null) !== ($fields['is_visible'] ?? null)) {
                $changes[] = [
                    'label' => $label . ' — Visible',
                    'old'   => $this->boolText($prev['is_visible'] ?? null),
                    'new'   => $this->boolText($fields['is_visible'] ?? null),
                ];
            }
        }

        // Page-level SEO + visibility.
        $pageLabels = [
            'seo_title_en'       => 'SEO Title (EN)',
            'seo_title_ar'       => 'SEO Title (AR)',
            'seo_description_en' => 'SEO Description (EN)',
            'seo_description_ar' => 'SEO Description (AR)',
        ];
        foreach ($pageLabels as $key => $label) {
            $a = (string) ($oldPage[$key] ?? '');
            $b = (string) ($newPage[$key] ?? '');
            if ($a !== $b) {
                $changes[] = ['label' => $label, 'old' => $this->truncate($a), 'new' => $this->truncate($b)];
            }
        }

        if (array_key_exists('is_visible', $newPage) && (bool) ($oldPage['is_visible'] ?? true) !== (bool) $newPage['is_visible']) {
            $changes[] = [
                'label' => 'Page visibility',
                'old'   => ($oldPage['is_visible'] ?? true) ? 'Visible' : 'Hidden',
                'new'   => $newPage['is_visible'] ? 'Visible' : 'Hidden',
            ];
        }

        return $changes;
    }

    /** Flat key→value maps (settings). */
    private function diffKeyValue(array $old, array $new): array
    {
        $changes = [];
        foreach ($new as $key => $value) {
            $a = (string) ($old[$key] ?? '');
            $b = (string) ($value ?? '');
            if ($a !== $b) {
                $changes[] = ['label' => $this->humanize($key), 'old' => $this->truncate($a), 'new' => $this->truncate($b)];
            }
        }

        return $changes;
    }

    /** Flat model attribute snapshots (project, user). Handles create/delete (null side). */
    private function diffAttributes(array $old, array $new): array
    {
        $keys = array_diff(array_unique([...array_keys($old), ...array_keys($new)]), self::SKIP_KEYS);
        $changes = [];

        foreach ($keys as $key) {
            $a = $this->scalar($old[$key] ?? null);
            $b = $this->scalar($new[$key] ?? null);
            if ($a !== $b) {
                $changes[] = ['label' => $this->humanize($key), 'old' => $this->truncate($a), 'new' => $this->truncate($b)];
            }
        }

        return $changes;
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private function humanize(string $key): string
    {
        $key = preg_replace('/_en$/', ' (EN)', $key) ?? $key;
        $key = preg_replace('/_ar$/', ' (AR)', $key) ?? $key;

        return ucwords(str_replace('_', ' ', $key));
    }

    private function scalar(mixed $value): string
    {
        if (is_bool($value)) {
            return $value ? 'Yes' : 'No';
        }
        if (is_array($value)) {
            return json_encode($value) ?: '';
        }

        return (string) ($value ?? '');
    }

    private function boolText(mixed $value): string
    {
        return $value ? 'Visible' : 'Hidden';
    }

    private function truncate(string $value, int $length = 80): string
    {
        $value = trim($value);
        if ($value === '') {
            return '—';
        }

        return mb_strlen($value) <= $length ? $value : mb_substr($value, 0, $length) . '…';
    }
}
