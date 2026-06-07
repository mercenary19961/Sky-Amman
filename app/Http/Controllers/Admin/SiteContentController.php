<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\SiteContent;
use App\Services\ChangeLogService;
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
            'undoMeta' => session('undo:site_content'),
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
}
