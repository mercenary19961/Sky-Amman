<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ManagedImage;
use App\Models\Media;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Manages the replaceable "page image" slots (ManagedImage::SLOTS). Editors can
 * upload a replacement for any slot or reset it back to the committed default.
 */
class ManagedImageController extends Controller
{
    public function index(): Response
    {
        $rows = ManagedImage::query()->with('media:id,path,mime_type')->get()->keyBy('key');

        $slots = collect(ManagedImage::SLOTS)->map(fn ($meta, $key) => [
            'key'      => $key,
            'label'    => $meta['label'],
            'group'    => $meta['group'],
            'default'  => $meta['default'],
            'current'  => $rows->get($key)?->media?->url,  // null = using default
        ])->values();

        return Inertia::render('Admin/PageImages/Index', [
            'slots' => $slots,
        ]);
    }

    public function update(Request $request, string $key): RedirectResponse
    {
        abort_unless(array_key_exists($key, ManagedImage::SLOTS), 404);

        $request->validate([
            'image' => ['required', 'file', 'mimes:jpeg,jpg,png,webp', 'mimetypes:image/jpeg,image/png,image/webp', 'max:10240'],
        ]);

        $slot = ManagedImage::firstOrNew(['key' => $key]);
        $oldMedia = $slot->media;

        $slot->media_id = Media::storeFile($request->file('image'), 'page-images', Auth::id())->id;
        $slot->save();

        $oldMedia?->delete(); // soft-delete the replaced media (file kept until force-delete)

        return back()->with('success', 'Image updated.');
    }

    /** Reset a slot back to its committed default (clears the uploaded override). */
    public function reset(string $key): RedirectResponse
    {
        abort_unless(array_key_exists($key, ManagedImage::SLOTS), 404);

        $slot = ManagedImage::query()->where('key', $key)->first();
        if ($slot) {
            $slot->media?->delete();
            $slot->delete();
        }

        return back()->with('success', 'Image reset to default.');
    }
}
