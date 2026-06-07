<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\Testimonial;
use App\Services\ChangeLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Client testimonials shown in the homepage Testimonials carousel. Mirrors the
 * Testimonial Videos section's CRUD + drag-reorder + show/hide pattern, but each
 * entry carries a portrait image (via Media::storeFile) + bilingual name/quote
 * instead of a single video URL, and the live set is a free-length list the
 * public carousel pages through (no fixed count).
 */
class TestimonialController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Testimonials/Index', [
            'testimonials' => Testimonial::ordered()->with('media:id,path,mime_type')->get()
                ->map(fn (Testimonial $t) => [
                    'id'         => $t->id,
                    'name_en'    => $t->name_en,
                    'name_ar'    => $t->name_ar,
                    'quote_en'   => $t->quote_en,
                    'quote_ar'   => $t->quote_ar,
                    'sort_order' => $t->sort_order,
                    'is_active'  => $t->is_active,
                    'image_url'  => $t->media?->url,
                ]),
        ]);
    }

    public function store(Request $request, ChangeLogService $changeLog): RedirectResponse
    {
        $data = $this->validateData($request);

        $mediaId = null;
        if ($request->hasFile('image')) {
            $mediaId = Media::storeFile($request->file('image'), 'testimonials', Auth::id())->id;
        }

        $testimonial = Testimonial::create([
            'name_en'    => $data['name_en'],
            'name_ar'    => $data['name_ar'] ?? null,
            'quote_en'   => $data['quote_en'],
            'quote_ar'   => $data['quote_ar'] ?? null,
            'media_id'   => $mediaId,
            'is_active'  => true,
            'sort_order' => (int) Testimonial::query()->max('sort_order') + 1,
        ]);

        $changeLog->log('testimonial', $testimonial->id, 'create', null, $testimonial->attributesToArray(), $testimonial->name_en);

        return back()->with('success', 'Testimonial added.');
    }

    public function update(Request $request, int $id, ChangeLogService $changeLog): RedirectResponse
    {
        $testimonial = Testimonial::findOrFail($id);
        $data = $this->validateData($request);
        $old = $testimonial->attributesToArray();

        $attributes = [
            'name_en'  => $data['name_en'],
            'name_ar'  => $data['name_ar'] ?? null,
            'quote_en' => $data['quote_en'],
            'quote_ar' => $data['quote_ar'] ?? null,
        ];

        // A new upload replaces the avatar; the old media row is soft-deleted
        // (the physical file is preserved until force-delete — see Media model).
        if ($request->hasFile('image')) {
            $oldMedia = $testimonial->media;
            $attributes['media_id'] = Media::storeFile($request->file('image'), 'testimonials', Auth::id())->id;
            $oldMedia?->delete();
        }

        $testimonial->update($attributes);

        $changeLog->log('testimonial', $testimonial->id, 'update', $old, $testimonial->fresh()->attributesToArray(), $testimonial->name_en);

        return back()->with('success', 'Testimonial updated.');
    }

    /** Show/hide a single testimonial on the homepage (immediate). */
    public function toggleActive(int $id, ChangeLogService $changeLog): RedirectResponse
    {
        $testimonial = Testimonial::findOrFail($id);
        $old = $testimonial->attributesToArray();
        $testimonial->update(['is_active' => ! $testimonial->is_active]);

        $changeLog->log('testimonial', $testimonial->id, 'update', $old, $testimonial->fresh()->attributesToArray(), $testimonial->name_en);

        return back()->with('success', $testimonial->is_active ? 'Testimonial shown.' : 'Testimonial hidden.');
    }

    public function destroy(int $id, ChangeLogService $changeLog): RedirectResponse
    {
        $testimonial = Testimonial::findOrFail($id);
        $changeLog->log('testimonial', $testimonial->id, 'delete', $testimonial->attributesToArray(), null, $testimonial->name_en);
        $testimonial->delete();

        return back()->with('success', 'Testimonial removed.');
    }

    /** Persist a new order (array of ids, top-first). */
    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids'   => ['required', 'array'],
            'ids.*' => ['integer', 'exists:testimonials,id'],
        ]);

        foreach ($validated['ids'] as $position => $id) {
            Testimonial::query()->where('id', $id)->update(['sort_order' => $position + 1]);
        }

        return back()->with('success', 'Order updated.');
    }

    private function validateData(Request $request): array
    {
        // Tight limits keep cards uniform — a long quote breaks the carousel UI.
        // Mirror these in the form (NAME_MAX / QUOTE_MAX in Testimonials/Index.tsx).
        return $request->validate([
            'name_en'  => ['required', 'string', 'max:80'],
            'name_ar'  => ['nullable', 'string', 'max:80'],
            'quote_en' => ['required', 'string', 'max:200'],
            'quote_ar' => ['nullable', 'string', 'max:200'],
            'image'    => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp', 'mimetypes:image/jpeg,image/png,image/webp', 'max:10240'],
        ]);
    }
}
