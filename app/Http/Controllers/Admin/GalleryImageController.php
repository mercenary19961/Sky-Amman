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
        $hidden = json_decode((string) Setting::get('gallery_hidden', '[]'), true) ?: [];

        // The full pool (sold-project images + editor uploads), each flagged with
        // its current hidden state so any single image can be shown/hidden.
        $images = GalleryImage::pool()->map(fn (array $img) => [
            'id'         => $img['id'],
            'url'        => $img['url'],
            'source'     => $img['source'],
            'label'      => $img['label'],
            'gallery_id' => $img['gallery_id'] ?? null,
            'hidden'     => in_array($img['id'], $hidden, true),
            'size_bytes'  => $img['size_bytes'] ?? null,
            'mime_type'   => $img['mime_type'] ?? null,
        ])->all();

        return Inertia::render('Admin/Gallery/Index', [
            'images'    => $images,
            'soldCount' => Project::active()->where('listing_status', 'sold')->count(),
            'settings'  => [
                'enabled' => (bool) Setting::get('gallery_enabled', true),
                'count'   => min(6, max(4, (int) Setting::get('gallery_count', 6))),
            ],
        ]);
    }

    /** Show/hide a single image (any pool image, including sold-project ones). */
    public function toggleHidden(Request $request): RedirectResponse
    {
        $id = $request->validate(['id' => ['required', 'string']])['id'];

        $hidden = json_decode((string) Setting::get('gallery_hidden', '[]'), true) ?: [];
        $hidden = in_array($id, $hidden, true)
            ? array_values(array_diff($hidden, [$id]))
            : [...$hidden, $id];

        Setting::set('gallery_hidden', json_encode(array_values($hidden)));

        return back()->with('success', 'Gallery updated.');
    }

    /** Display settings for the public gallery section (per-view count + show/hide). */
    public function updateSettings(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'count'   => ['required', 'integer', 'min:4', 'max:6'],
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

}
