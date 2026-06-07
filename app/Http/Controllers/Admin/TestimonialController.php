<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\Testimonial;
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

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);

        $mediaId = null;
        if ($request->hasFile('image')) {
            $mediaId = Media::storeFile($request->file('image'), 'testimonials', Auth::id())->id;
        }

        Testimonial::create([
            'name_en'    => $data['name_en'],
            'name_ar'    => $data['name_ar'] ?? null,
            'quote_en'   => $data['quote_en'],
            'quote_ar'   => $data['quote_ar'] ?? null,
            'media_id'   => $mediaId,
            'is_active'  => true,
            'sort_order' => (int) Testimonial::query()->max('sort_order') + 1,
        ]);

        return back()->with('success', 'Testimonial added.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $testimonial = Testimonial::findOrFail($id);
        $data = $this->validateData($request);

        $attributes = [
            'name_en'  => $data['name_en'],
            'name_ar'  => $data['name_ar'] ?? null,
            'quote_en' => $data['quote_en'],
            'quote_ar' => $data['quote_ar'] ?? null,
        ];

        // A new upload replaces the avatar; the old media row is soft-deleted
        // (the physical file is preserved until force-delete — see Media model).
        if ($request->hasFile('image')) {
            $old = $testimonial->media;
            $attributes['media_id'] = Media::storeFile($request->file('image'), 'testimonials', Auth::id())->id;
            $old?->delete();
        }

        $testimonial->update($attributes);

        return back()->with('success', 'Testimonial updated.');
    }

    /** Show/hide a single testimonial on the homepage (immediate). */
    public function toggleActive(int $id): RedirectResponse
    {
        $testimonial = Testimonial::findOrFail($id);
        $testimonial->update(['is_active' => ! $testimonial->is_active]);

        return back()->with('success', $testimonial->is_active ? 'Testimonial shown.' : 'Testimonial hidden.');
    }

    public function destroy(int $id): RedirectResponse
    {
        Testimonial::findOrFail($id)->delete();

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
        return $request->validate([
            'name_en'  => ['required', 'string', 'max:255'],
            'name_ar'  => ['nullable', 'string', 'max:255'],
            'quote_en' => ['required', 'string', 'max:2000'],
            'quote_ar' => ['nullable', 'string', 'max:2000'],
            'image'    => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp', 'mimetypes:image/jpeg,image/png,image/webp', 'max:10240'],
        ]);
    }
}
