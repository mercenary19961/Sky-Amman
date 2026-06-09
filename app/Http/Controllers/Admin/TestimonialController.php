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
        $data = $this->validateData($request, imageRequired: true);

        $mediaId = Media::storeFile($request->file('image'), 'testimonials', Auth::id())->id;

        $testimonial = Testimonial::create([
            'name_en'    => strip_tags($data['name_en'] ?? '') ?: null,
            'name_ar'    => strip_tags($data['name_ar'] ?? '') ?: null,
            'quote_en'   => strip_tags($data['quote_en'] ?? '') ?: null,
            'quote_ar'   => strip_tags($data['quote_ar'] ?? '') ?: null,
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
            'name_en'  => strip_tags($data['name_en'] ?? '') ?: null,
            'name_ar'  => strip_tags($data['name_ar'] ?? '') ?: null,
            'quote_en' => strip_tags($data['quote_en'] ?? '') ?: null,
            'quote_ar' => strip_tags($data['quote_ar'] ?? '') ?: null,
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

    /**
     * @param bool $imageRequired  true on create (a new testimonial needs a photo);
     *                             false on update (the existing photo is kept).
     *
     * Name and quote each require AT LEAST ONE language — the public card falls
     * back to the filled language for the empty one. Tight char limits keep cards
     * uniform (mirror NAME_MAX / QUOTE_MAX in Testimonials/Index.tsx).
     */
    private function validateData(Request $request, bool $imageRequired = false): array
    {
        return $request->validate([
            'name_en'  => ['nullable', 'required_without:name_ar', 'string', 'max:80'],
            'name_ar'  => ['nullable', 'required_without:name_en', 'string', 'max:80'],
            'quote_en' => ['nullable', 'required_without:quote_ar', 'string', 'max:200'],
            'quote_ar' => ['nullable', 'required_without:quote_en', 'string', 'max:200'],
            'image'    => [$imageRequired ? 'required' : 'nullable', 'file', 'mimes:jpeg,jpg,png,webp', 'mimetypes:image/jpeg,image/png,image/webp', 'max:10240'],
        ], [
            'name_en.required_without'  => 'Enter the name in at least one language.',
            'name_ar.required_without'  => 'Enter the name in at least one language.',
            'quote_en.required_without' => 'Enter the quote in at least one language.',
            'quote_ar.required_without' => 'Enter the quote in at least one language.',
            'image.required'            => 'Please upload a photo.',
        ]);
    }
}
