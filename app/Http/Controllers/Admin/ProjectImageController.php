<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\Project;
use App\Models\ProjectImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectImageController extends Controller
{
    public function store(Request $request, int $projectId): JsonResponse
    {
        $request->validate([
            'image' => [
                'required',
                'file',
                'mimes:jpeg,jpg,png,webp',
                'mimetypes:image/jpeg,image/png,image/webp',
                'max:10240',
            ],
        ]);

        $project = Project::findOrFail($projectId);

        $media = Media::storeFile(
            $request->file('image'),
            'projects',
            Auth::id(),
        );

        $sortOrder = (int) $project->images()->max('sort_order') + 1;

        $projectImage = ProjectImage::create([
            'project_id' => $project->id,
            'media_id'   => $media->id,
            'sort_order' => $sortOrder,
        ]);

        return response()->json([
            'id'         => $projectImage->id,
            'sort_order' => $projectImage->sort_order,
            'media'      => [
                'id'                => $media->id,
                'url'               => $media->url,
                'original_filename' => $media->original_filename,
                'alt_text_en'       => $media->alt_text_en,
                'alt_text_ar'       => $media->alt_text_ar,
            ],
        ], 201);
    }

    public function destroy(int $projectId, int $imageId): JsonResponse
    {
        $image = ProjectImage::where('project_id', $projectId)
            ->where('id', $imageId)
            ->firstOrFail();

        $media = $image->media;

        $image->delete();
        $media->delete(); // soft-delete — physical file is preserved

        return response()->json(['ok' => true]);
    }

    public function reorder(Request $request, int $projectId): JsonResponse
    {
        $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'integer',
        ]);

        $project = Project::findOrFail($projectId);
        $ids = $request->input('ids');

        // Verify all IDs belong to this project before writing.
        $ownedIds = $project->images()->pluck('id')->all();
        foreach ($ids as $id) {
            if (! in_array($id, $ownedIds)) {
                abort(403);
            }
        }

        foreach ($ids as $order => $id) {
            ProjectImage::where('id', $id)->update(['sort_order' => $order]);
        }

        return response()->json(['ok' => true]);
    }
}
