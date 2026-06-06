<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProjectRequest;
use App\Http\Requests\Admin\UpdateProjectRequest;
use App\Models\Project;
use App\Services\ChangeLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Project::withCount(['images', 'inquiries'])
            ->with('featuredImage:id');

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('listing_status')) {
            $query->where('listing_status', $request->listing_status);
        }

        if ($request->filled('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        if ($request->filled('search')) {
            $term = '%' . str_replace(['%', '_'], ['\\%', '\\_'], $request->search) . '%';
            $query->where(function ($q) use ($term) {
                $q->where('title_en', 'like', $term)
                    ->orWhere('title_ar', 'like', $term);
            });
        }

        $projects = $query->ordered()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Projects/Index', [
            'projects'     => $projects,
            'filters'      => $request->only(['category', 'listing_status', 'active', 'search']),
            'trashedCount' => Project::onlyTrashed()->count(),
        ]);
    }

    public function trash(): Response
    {
        $projects = Project::onlyTrashed()
            ->withCount('images')
            ->orderByDesc('deleted_at')
            ->paginate(15);

        return Inertia::render('Admin/Projects/Trash', [
            'projects' => $projects,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Projects/Form', [
            'item' => null,
        ]);
    }

    public function store(StoreProjectRequest $request, ChangeLogService $changeLog): RedirectResponse
    {
        $data = $request->validated();

        $slug = Str::slug($data['title_en']);
        $base = $slug;
        $i = 1;
        while (Project::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }
        $data['slug'] = $slug;

        foreach (['short_description_en', 'short_description_ar', 'description_en', 'description_ar'] as $field) {
            if (isset($data[$field])) {
                $data[$field] = strip_tags($data[$field]);
            }
        }

        $data['created_by'] = Auth::id();
        $data['updated_by'] = Auth::id();

        $project = Project::create($data);

        $changeLog->log('project', $project->id, 'create', null, $project->attributesToArray(), $project->title_en);

        return redirect()
            ->route('admin.projects.edit', $project->id)
            ->with('success', 'Project created. Upload images and complete the details below.');
    }

    public function edit(int $id): Response
    {
        $project = Project::with(['images' => fn ($q) => $q->with('media:id,original_filename,alt_text_en,alt_text_ar,path,mime_type')])
            ->findOrFail($id);

        return Inertia::render('Admin/Projects/Form', [
            'item' => array_merge($project->toArray(), [
                'images' => $project->images->map(fn ($img) => [
                    'id'         => $img->id,
                    'sort_order' => $img->sort_order,
                    'media'      => [
                        'id'                => $img->media->id,
                        'url'               => $img->media->url,
                        'original_filename' => $img->media->original_filename,
                        'alt_text_en'       => $img->media->alt_text_en,
                        'alt_text_ar'       => $img->media->alt_text_ar,
                    ],
                ])->values(),
            ]),
        ]);
    }

    public function update(UpdateProjectRequest $request, int $id, ChangeLogService $changeLog): RedirectResponse
    {
        $project = Project::findOrFail($id);
        $old = $project->attributesToArray();
        $data = $request->validated();

        foreach (['short_description_en', 'short_description_ar', 'description_en', 'description_ar'] as $field) {
            if (isset($data[$field])) {
                $data[$field] = strip_tags($data[$field]);
            }
        }

        $data['updated_by'] = Auth::id();

        $project->update($data);

        $changeLog->log('project', $project->id, 'update', $old, $project->fresh()->attributesToArray(), $project->title_en);

        return redirect()->back()->with('success', 'Project updated.');
    }

    public function destroy(int $id, ChangeLogService $changeLog): RedirectResponse
    {
        $project = Project::findOrFail($id);
        $changeLog->log('project', $project->id, 'delete', $project->attributesToArray(), null, $project->title_en);
        $project->delete();

        return redirect()
            ->route('admin.projects.index')
            ->with('success', 'Project moved to trash.');
    }

    public function restore(int $id, ChangeLogService $changeLog): RedirectResponse
    {
        $project = Project::onlyTrashed()->findOrFail($id);
        $project->restore();

        $changeLog->log('project', $project->id, 'restore', null, $project->attributesToArray(), $project->title_en);

        return redirect()
            ->route('admin.projects.trash')
            ->with('success', 'Project restored.');
    }

    public function forceDestroy(int $id): RedirectResponse
    {
        $project = Project::onlyTrashed()->findOrFail($id);
        $project->forceDelete();

        return redirect()
            ->route('admin.projects.trash')
            ->with('success', 'Project permanently deleted.');
    }
}
