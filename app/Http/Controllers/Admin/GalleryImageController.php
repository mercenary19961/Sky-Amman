<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GalleryImage;
use App\Models\Media;
use App\Models\Project;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Editor-curated images for the public "Projects Gallery" section. The public
 * pool also includes images from sold projects automatically (see
 * PropertiesController::galleryImages); these are the manual additions.
 */
class GalleryImageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Gallery/Index', [
            'images' => GalleryImage::ordered()->with('media:id,path,mime_type')->get()
                ->map(fn (GalleryImage $g) => [
                    'id'        => $g->id,
                    'image_url' => $g->media?->url,
                ])->all(),
            // Sold projects whose images feed the gallery automatically (for the
            // informational note in the admin UI).
            'soldCount' => Project::active()->where('listing_status', 'sold')->count(),
            'settings'  => [
                'enabled' => (bool) Setting::get('gallery_enabled', true),
                'count'   => max(1, (int) Setting::get('gallery_count', 6)),
            ],
        ]);
    }

    /** Display settings for the public gallery section (per-view count + show/hide). */
    public function updateSettings(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'count'   => ['required', 'integer', 'min:1', 'max:24'],
            'enabled' => ['boolean'],
        ]);

        Setting::set('gallery_count', (string) $data['count']);
        Setting::set('gallery_enabled', $request->boolean('enabled') ? '1' : '0');

        return back()->with('success', 'Gallery settings saved.');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'images'   => ['required', 'array', 'min:1'],
            'images.*' => ['file', 'mimes:jpeg,jpg,png,webp', 'mimetypes:image/jpeg,image/png,image/webp', 'max:10240'],
        ]);

        $next = (int) GalleryImage::query()->max('sort_order');
        foreach ($request->file('images') as $file) {
            $media = Media::storeFile($file, 'gallery', Auth::id());
            GalleryImage::create(['media_id' => $media->id, 'sort_order' => ++$next]);
        }

        return back()->with('success', 'Images added to the gallery.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $image = GalleryImage::findOrFail($id);
        $image->media?->delete(); // soft-delete the media (file kept until force-delete)
        $image->delete();

        return back()->with('success', 'Image removed.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids'   => ['required', 'array'],
            'ids.*' => ['integer', 'exists:gallery_images,id'],
        ]);

        foreach ($validated['ids'] as $position => $id) {
            GalleryImage::query()->where('id', $id)->update(['sort_order' => $position + 1]);
        }

        return back()->with('success', 'Order updated.');
    }
}
