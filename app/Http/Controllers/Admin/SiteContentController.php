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
        SiteContent::orderBy('page')
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
        Page::where('slug', $page)->firstOrFail()->update([
            'is_visible'         => $request->boolean('page_is_visible', true),
            'seo_title_en'       => $request->input('seo_title_en'),
            'seo_title_ar'       => $request->input('seo_title_ar'),
            'seo_description_en' => $request->input('seo_description_en'),
            'seo_description_ar' => $request->input('seo_description_ar'),
            'updated_by'         => Auth::id(),
        ]);

        // Guard: only allow updating rows that belong to this page.
        $validIds = SiteContent::where('page', $page)
            ->whereIn('id', collect($request->rows)->pluck('id'))
            ->pluck('id')
            ->flip();

        foreach ($request->rows as $row) {
            if (! $validIds->has($row['id'])) {
                continue;
            }
            SiteContent::where('id', $row['id'])->update([
                'content_en' => strip_tags($row['content_en'] ?? ''),
                'content_ar' => strip_tags($row['content_ar'] ?? ''),
                'is_visible'  => $row['is_visible'] ?? true,
                'updated_by'  => Auth::id(),
            ]);
        }

        return redirect()->back()->with('success', 'Content saved.');
    }
}
