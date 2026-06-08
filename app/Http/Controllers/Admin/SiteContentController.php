<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\SiteContent;
use App\Services\ChangeLogService;
use Database\Seeders\SiteContentSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SiteContentController extends Controller
{
    public function index(): Response
    {
        $pages = Page::ordered()->get()->keyBy('slug');

        $grouped = [];
        SiteContent::all()
            ->sortBy([
                ['page', 'asc'],
                ['sort_order', 'asc'],
                ['key', 'asc'],
            ])
            ->each(function (SiteContent $row) use (&$grouped) {
                $grouped[$row->page][$row->section][] = $row;
            });

        return Inertia::render('Admin/Content', [
            'grouped'  => $grouped,
            'pages'    => $pages,
            // Persistent "Undo last save" pointer for this section (set by
            // ChangeLogService on the previous save; survives navigation).
            // Admin-only — the revert route is admin-gated (editors would get a
            // button that 403s).
            'undoMeta' => Auth::user()?->isAdmin() ? session('undo:site_content') : null,
        ]);
    }

    public function update(Request $request, string $page, ChangeLogService $changeLog): RedirectResponse
    {
        $request->validate([
            'page_is_visible'    => 'boolean',
            'seo_title_en'       => 'nullable|string|max:255',
            'seo_title_ar'       => 'nullable|string|max:255',
            'seo_description_en' => 'nullable|string|max:500',
            'seo_description_ar' => 'nullable|string|max:500',
            'rows'               => 'required|array',
            'rows.*.id'          => 'required|integer|exists:site_content,id',
            'rows.*.content_en'  => 'nullable|string',
            'rows.*.content_ar'  => 'nullable|string',
            'rows.*.is_visible'  => 'boolean',
        ]);

        // Update page-level SEO and visibility (snapshotting before/after so the
        // change log + revert cover SEO/visibility edits, not just content rows).
        $pageModel = Page::query()->where('slug', $page)->firstOrFail();

        $oldPage = [
            'is_visible'         => (bool) $pageModel->is_visible,
            'seo_title_en'       => $pageModel->seo_title_en,
            'seo_title_ar'       => $pageModel->seo_title_ar,
            'seo_description_en' => $pageModel->seo_description_en,
            'seo_description_ar' => $pageModel->seo_description_ar,
        ];
        $newPage = [
            'is_visible'         => $request->boolean('page_is_visible', true),
            'seo_title_en'       => $request->input('seo_title_en'),
            'seo_title_ar'       => $request->input('seo_title_ar'),
            'seo_description_en' => $request->input('seo_description_en'),
            'seo_description_ar' => $request->input('seo_description_ar'),
        ];

        $pageModel->update([...$newPage, 'updated_by' => Auth::id()]);

        // Guard: only allow updating rows that belong to this page. Fetch the
        // current rows so we can skip no-op writes (don't bump updated_by /
        // updated_at on rows that didn't actually change).
        $existing = SiteContent::query()
            ->where('page', $page)
            ->whereIn('id', collect($request->rows)->pluck('id'))
            ->get()
            ->keyBy('id');

        // Snapshots of changed rows (keyed by id) for the change log + revert.
        $oldRows = [];
        $newRows = [];

        foreach ($request->rows as $row) {
            $current = $existing->get($row['id']);
            if ($current === null) {
                continue;
            }

            $contentEn = strip_tags($row['content_en'] ?? '');
            $contentAr = strip_tags($row['content_ar'] ?? '');
            $isVisible = (bool) ($row['is_visible'] ?? true);

            // Short-circuit unchanged rows.
            if ($current->content_en === $contentEn
                && $current->content_ar === $contentAr
                && (bool) $current->is_visible === $isVisible) {
                continue;
            }

            $label = ucfirst(str_replace('_', ' ', $current->section)) . ' · ' . $current->key;
            $oldRows[$current->id] = [
                'content_en' => $current->content_en,
                'content_ar' => $current->content_ar,
                'is_visible' => (bool) $current->is_visible,
                'label'      => $label,
            ];
            $newRows[$current->id] = [
                'content_en' => $contentEn,
                'content_ar' => $contentAr,
                'is_visible' => $isVisible,
                'label'      => $label,
            ];

            $current->update([
                'content_en' => $contentEn,
                'content_ar' => $contentAr,
                'is_visible' => $isVisible,
                'updated_by' => Auth::id(),
            ]);
        }

        // One entry covering both content rows + page SEO/visibility. log() skips
        // it automatically if nothing actually changed.
        $pageTitle = ucfirst(str_replace('_', ' ', $page));
        $changeLog->log(
            'site_content',
            $page,
            'update',
            ['rows' => $oldRows, 'page' => $oldPage],
            ['rows' => $newRows, 'page' => $newPage],
            $pageTitle . ' content',
        );

        return redirect()->back()->with('success', 'Content saved.');
    }

    /**
     * ADMIN-ONLY safeguard: restore every Site Content row to the shipped default
     * copy (SiteContentSeeder::rows) — the recovery path when an editor's text
     * edits need to be rolled back wholesale. Only rows that actually differ from
     * the default are touched, so it's a no-op when everything is already default.
     *
     * Logged as a single revertable `site_content` change (model_id "all"), so
     * the reset itself can be undone from the Change Log / Undo toast.
     *
     * NOTE: this restores section TEXT + visibility only. Page-level SEO has no
     * seeded defaults yet — once it does, extend this to reset SEO too (CLAUDE.md).
     */
    public function reset(ChangeLogService $changeLog): RedirectResponse
    {
        $existing = SiteContent::all()->keyBy(fn (SiteContent $r) => "{$r->page}|{$r->section}|{$r->key}");

        $oldRows = [];
        $newRows = [];

        foreach (SiteContentSeeder::rows() as [$page, $section, $key, $en, $ar]) {
            $current = $existing->get("{$page}|{$section}|{$key}");

            // Skip rows already matching the default (text + visible).
            if ($current !== null
                && $current->content_en === $en
                && $current->content_ar === $ar
                && (bool) $current->is_visible === true) {
                continue;
            }

            $label = ucfirst(str_replace('_', ' ', $section)) . ' · ' . $key;

            if ($current !== null) {
                $oldRows[$current->id] = [
                    'content_en' => $current->content_en,
                    'content_ar' => $current->content_ar,
                    'is_visible' => (bool) $current->is_visible,
                    'label'      => $label,
                ];
            }

            $row = SiteContent::updateOrCreate(
                ['page' => $page, 'section' => $section, 'key' => $key],
                [
                    'content_en' => $en,
                    'content_ar' => $ar,
                    'type'       => strlen($en) > 120 ? 'textarea' : 'text',
                    'is_visible' => true,
                    'updated_by' => Auth::id(),
                ],
            );

            $newRows[$row->id] = [
                'content_en' => $en,
                'content_ar' => $ar,
                'is_visible' => true,
                'label'      => $label,
            ];
        }

        // No-op when nothing differed from the defaults.
        if (empty($newRows)) {
            return redirect()->back()->with('success', 'Site content is already at the defaults.');
        }

        $changeLog->log(
            'site_content',
            'all',
            'update',
            ['rows' => $oldRows],
            ['rows' => $newRows],
            'Site Content reset to defaults',
        );

        return redirect()->back()->with('success', 'Site content reset to the defaults.');
    }
}
