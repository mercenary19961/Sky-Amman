<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProjectRequest;
use App\Http\Requests\Admin\UpdateProjectRequest;
use App\Models\Project;
use App\Models\ProjectImage;
use App\Services\ChangeLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Project::withCount(['images', 'inquiries'])
            ->with(['images.media:id,path,mime_type', 'featuredImage:id', 'ogImage:id']);

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

        // Per-page is admin-selectable (card grid reads nicer at multiples of 4).
        $perPage = (int) $request->input('per_page', 12);
        if (! in_array($perPage, [8, 12, 16, 24, 32], true)) {
            $perPage = 12;
        }

        $projects = $query->ordered()->paginate($perPage)->withQueryString()
            ->through(fn (Project $p) => [
                'id'              => $p->id,
                'title_en'        => $p->title_en,
                'title_ar'        => $p->title_ar,
                'category'        => $p->category,
                'listing_status'  => $p->listing_status,
                'is_active'       => $p->is_active,
                'images_count'    => $p->images_count,
                'inquiries_count' => $p->inquiries_count,
                // Ordered image URLs (featured/OG first) for the card carousel +
                // list thumbnail; falls back to the committed render / placeholder.
                'images'          => $p->displayImageUrls(),
            ]);

        return Inertia::render('Admin/Projects/Index', [
            'projects'     => $projects,
            'filters'      => $request->only(['category', 'listing_status', 'active', 'search']) + ['per_page' => $perPage],
            'trashedCount' => Project::onlyTrashed()->count('*'), // '*' is count's default — explicit to silence intelephense P1005
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
            'item'               => null,
            'committedImageUrls' => [],
        ]);
    }

    public function store(StoreProjectRequest $request, ChangeLogService $changeLog): RedirectResponse
    {
        $data = $request->validated();

        $slug = Str::slug($data['title_en']);
        $base = $slug;
        $i = 1;
        // '=', 'and' are where()'s defaults — explicit only to silence intelephense P1005.
        while (Project::where('slug', '=', $slug, 'and')->exists()) {
            $slug = $base . '-' . $i++;
        }
        $data['slug'] = $slug;

        foreach (['title_en', 'title_ar', 'short_description_en', 'short_description_ar', 'description_en', 'description_ar'] as $field) {
            if (isset($data[$field])) {
                $data[$field] = strip_tags($data[$field]);
            }
        }

        // A brand-new project has no gallery yet, so it can't reference a
        // featured/OG image — those are picked from its own uploaded gallery later.
        $data['featured_image_id'] = null;
        $data['og_image_id'] = null;

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
        $project = Project::with(['images' => fn ($q) => $q->with('media:id,original_filename,alt_text_en,alt_text_ar,path,mime_type,size')])
            ->findOrFail($id);

        $hasUploadedImages = $project->images->isNotEmpty();

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
                        'mime_type'         => $img->media->mime_type,
                        'size_bytes'        => $img->media->size,
                    ],
                ])->values(),
            ]),
            // Committed render gallery (seeded .webp files with no Media record).
            // Only passed when there are no uploaded images — once an admin uploads,
            // displayImageUrls() returns those instead, so this list is irrelevant.
            'committedImageUrls' => $hasUploadedImages ? [] : collect($project->displayImageUrls())
                ->filter(fn (string $url) => !str_ends_with($url, 'placeholder.svg'))
                ->map(function (string $url) {
                    $urlPath = parse_url($url, PHP_URL_PATH) ?? $url;
                    $fsPath  = public_path(ltrim($urlPath, '/'));
                    $ext     = strtolower(pathinfo($urlPath, PATHINFO_EXTENSION));
                    $mime    = match ($ext) {
                        'webp'        => 'image/webp',
                        'jpg', 'jpeg' => 'image/jpeg',
                        'png'         => 'image/png',
                        'svg'         => 'image/svg+xml',
                        default       => null,
                    };
                    return [
                        'url'        => $url,
                        'size_bytes' => file_exists($fsPath) ? filesize($fsPath) : null,
                        'mime_type'  => $mime,
                    ];
                })
                ->values()
                ->all(),
        ]);
    }

    /** Read-only project detail view (the card/row links here). */
    public function show(int $id): Response
    {
        $project = Project::withCount('inquiries')
            ->with([
                'images.media:id,path,mime_type,original_filename',
                'createdBy:id,name',
                'updatedBy:id,name',
            ])
            ->findOrFail($id);

        $images = $project->images
            ->filter(fn (ProjectImage $img) => $img->media !== null)
            ->map(fn (ProjectImage $img) => [
                'id'          => $img->id,
                'url'         => route('media.serve', $img->media_id, false),
                'filename'    => $img->media->original_filename,
                'is_featured' => $img->media_id === $project->featured_image_id,
                'is_og'       => $img->media_id === $project->og_image_id,
            ])
            ->values()
            ->all();

        // No uploaded gallery yet → show the committed render / placeholder.
        if (empty($images)) {
            $images = collect($project->displayImageUrls())->map(fn (string $url, int $i) => [
                'id'          => -($i + 1),
                'url'         => $url,
                'filename'    => 'Render',
                'is_featured' => false,
                'is_og'       => false,
            ])->all();
        }

        return Inertia::render('Admin/Projects/Show', [
            'project' => [
                'id'                   => $project->id,
                'slug'                 => $project->slug,
                'title_en'             => $project->title_en,
                'title_ar'             => $project->title_ar,
                'category'             => $project->category,
                'listing_status'       => $project->listing_status,
                'group'                => $project->group,
                'is_active'            => $project->is_active,
                'short_description_en' => $project->short_description_en,
                'short_description_ar' => $project->short_description_ar,
                'description_en'       => $project->description_en,
                'description_ar'       => $project->description_ar,
                'location_en'          => $project->location_en,
                'location_ar'          => $project->location_ar,
                'address_en'           => $project->address_en,
                'address_ar'           => $project->address_ar,
                'area_sqm'             => $project->area_sqm,            // built-up area
                'land_area_sqm'        => $project->land_area_sqm,
                'completion_year'      => $project->completion_year,
                'floors'               => $project->floors,
                'bedrooms'             => $project->bedrooms,
                'bathrooms'            => $project->bathrooms,
                'hidden_specs'         => $project->hidden_specs ?? [],
                'seo_title_en'         => $project->seo_title_en,
                'seo_title_ar'         => $project->seo_title_ar,
                'seo_description_en'   => $project->seo_description_en,
                'seo_description_ar'   => $project->seo_description_ar,
                'images'               => $images,
                'inquiries_count'      => $project->inquiries_count,
                'created_by'           => $project->createdBy?->name,
                'updated_by'           => $project->updatedBy?->name,
                'created_at'           => $project->created_at?->toDayDateTimeString(),
                'updated_at'           => $project->updated_at?->toDayDateTimeString(),
                'public_url'           => route('properties.show', $project->slug),
            ],
        ]);
    }

    public function update(UpdateProjectRequest $request, int $id, ChangeLogService $changeLog): RedirectResponse
    {
        $project = Project::findOrFail($id);
        $old = $project->attributesToArray();
        $data = $request->validated();

        foreach (['title_en', 'title_ar', 'short_description_en', 'short_description_ar', 'description_en', 'description_ar'] as $field) {
            if (isset($data[$field])) {
                $data[$field] = strip_tags($data[$field]);
            }
        }

        // The featured/OG image must be one of THIS project's own gallery images
        // (the UI only offers those). Reject a tampered id pointing elsewhere.
        $ownMediaIds = $project->images()->pluck('media_id')->all();
        foreach (['featured_image_id', 'og_image_id'] as $field) {
            if (! empty($data[$field]) && ! in_array($data[$field], $ownMediaIds)) {
                throw ValidationException::withMessages([
                    $field => 'The selected image must belong to this project\'s gallery.',
                ]);
            }
        }

        $data['updated_by'] = Auth::id();

        $project->update($data);

        $changeLog->log('project', $project->id, 'update', $old, $project->fresh()->attributesToArray(), $project->title_en);

        return redirect()->back()->with('success', 'Project updated.');
    }

    /**
     * Quick status changes from the project show page — toggle active state and/or
     * set the listing status (e.g. mark as sold) without opening the full form.
     * Only the provided fields are touched; the change is logged (revertable).
     */
    public function updateStatus(Request $request, int $id, ChangeLogService $changeLog): RedirectResponse
    {
        $project = Project::findOrFail($id);

        $data = $request->validate([
            'is_active'      => ['sometimes', 'boolean'],
            'listing_status' => ['sometimes', 'nullable', Rule::in(['for_sale', 'for_rent', 'sold', 'reserved'])],
        ]);

        $old = $project->attributesToArray();
        $project->fill($data);

        if (! $project->isDirty()) {
            return redirect()->back();
        }

        $project->updated_by = Auth::id();
        $project->save();

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
