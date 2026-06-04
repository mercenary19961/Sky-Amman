<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\SiteContent;
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
        SiteContent::query()
            ->orderBy('page')
            ->orderBy('sort_order')
            ->orderBy('key')
            ->get()
            ->each(function (SiteContent $row) use (&$grouped) {
                $grouped[$row->page][$row->section][] = $row;
            });

        return Inertia::render('Admin/Content', [
            'grouped' => $grouped,
            'pages'   => $pages,
        ]);
    }

    public function update(Request $request, string $page): RedirectResponse
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

        // Update page-level SEO and visibility.
        Page::query()->where('slug', $page)->firstOrFail()->update([
            'is_visible'         => $request->boolean('page_is_visible', true),
            'seo_title_en'       => $request->input('seo_title_en'),
            'seo_title_ar'       => $request->input('seo_title_ar'),
            'seo_description_en' => $request->input('seo_description_en'),
            'seo_description_ar' => $request->input('seo_description_ar'),
            'updated_by'         => Auth::id(),
        ]);

        // Guard: only allow updating rows that belong to this page. Fetch the
        // current rows so we can skip no-op writes (don't bump updated_by /
        // updated_at on rows that didn't actually change).
        $existing = SiteContent::query()
            ->where('page', $page)
            ->whereIn('id', collect($request->rows)->pluck('id'))
            ->get()
            ->keyBy('id');

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

            $current->update([
                'content_en' => $contentEn,
                'content_ar' => $contentAr,
                'is_visible' => $isVisible,
                'updated_by' => Auth::id(),
            ]);
        }

        return redirect()->back()->with('success', 'Content saved.');
    }
}
