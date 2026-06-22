<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\Project;
use App\Models\ProjectImage;
use App\Services\ChangeLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectImageController extends Controller
{
    public function store(Request $request, int $projectId, ChangeLogService $changeLog): JsonResponse
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

        $changeLog->log(
            'project_image',
            $projectImage->id,
            'create',
            null,
            [
                'project_image_id' => $projectImage->id,
                'project_id'       => $project->id,
                'media_id'         => $media->id,
                'filename'         => $media->original_filename,
                'sort_order'       => $sortOrder,
            ],
            $project->title_en . ' · ' . $media->original_filename,
        );

        return response()->json([
            'id'         => $projectImage->id,
            'sort_order' => $projectImage->sort_order,
            'media'      => [
                'id'                => $media->id,
                'url'               => $media->url,
                'original_filename' => $media->original_filename,
                'alt_text_en'       => $media->alt_text_en,
                'alt_text_ar'       => $media->alt_text_ar,
                'mime_type'         => $media->mime_type,
                'size_bytes'        => $media->size,
            ],
        ], 201);
    }

    public function destroy(int $projectId, int $imageId, ChangeLogService $changeLog): JsonResponse
    {
        // '=', 'and' are where()'s defaults — explicit to silence intelephense P1005.
        $image = ProjectImage::with('project:id,title_en')
            ->where('project_id', '=', $projectId, 'and')
            ->where('id', '=', $imageId, 'and')
            ->firstOrFail();

        $media = $image->media;

        $changeLog->log(
            'project_image',
            $image->id,
            'delete',
            [
                'project_image_id' => $image->id,
                'project_id'       => $image->project_id,
                'media_id'         => $image->media_id,
                'filename'         => $media->original_filename,
                'sort_order'       => $image->sort_order,
            ],
            null,
            $image->project->title_en . ' · ' . $media->original_filename,
        );

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
            // '=', 'and' are where()'s defaults — explicit to silence intelephense P1005.
            ProjectImage::where('id', '=', $id, 'and')->update(['sort_order' => $order]);
        }

        return response()->json(['ok' => true]);
    }
}
