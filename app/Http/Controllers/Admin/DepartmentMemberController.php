<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DepartmentMember;
use App\Models\Media;
use App\Services\ChangeLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * "Head of Departments" team members shown on the homepage. Same CRUD + drag
 * reorder + show/hide + image-upload pattern as Testimonials, but each entry is
 * a person (bilingual name + role + portrait). Photo is optional — the card
 * falls back to a placeholder until one is uploaded.
 */
class DepartmentMemberController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Departments/Index', [
            'members' => DepartmentMember::ordered()->with('media:id,path,mime_type')->get()
                ->map(fn (DepartmentMember $m) => [
                    'id'         => $m->id,
                    'name_en'    => $m->name_en,
                    'name_ar'    => $m->name_ar,
                    'role_en'    => $m->role_en,
                    'role_ar'    => $m->role_ar,
                    'sort_order' => $m->sort_order,
                    'is_active'  => $m->is_active,
                    'image_url'  => $m->media?->url,
                ]),
        ]);
    }

    public function store(Request $request, ChangeLogService $changeLog): RedirectResponse
    {
        $data = $this->validateData($request);

        $mediaId = $request->hasFile('image')
            ? Media::storeFile($request->file('image'), 'departments', Auth::id())->id
            : null;

        $member = DepartmentMember::create([
            'name_en'    => ($data['name_en'] ?? '') ?: null,
            'name_ar'    => ($data['name_ar'] ?? '') ?: null,
            'role_en'    => ($data['role_en'] ?? '') ?: null,
            'role_ar'    => ($data['role_ar'] ?? '') ?: null,
            'media_id'   => $mediaId,
            'is_active'  => true,
            'sort_order' => (int) DepartmentMember::query()->max('sort_order') + 1,
        ]);

        $changeLog->log('department_member', $member->id, 'create', null, $member->attributesToArray(), $member->name_en ?: $member->name_ar);

        return back()->with('success', 'Team member added.');
    }

    public function update(Request $request, int $id, ChangeLogService $changeLog): RedirectResponse
    {
        $member = DepartmentMember::findOrFail($id);
        $data = $this->validateData($request);
        $old = $member->attributesToArray();

        $attributes = [
            'name_en' => ($data['name_en'] ?? '') ?: null,
            'name_ar' => ($data['name_ar'] ?? '') ?: null,
            'role_en' => ($data['role_en'] ?? '') ?: null,
            'role_ar' => ($data['role_ar'] ?? '') ?: null,
        ];

        // A new upload replaces the photo; the old media row is soft-deleted.
        if ($request->hasFile('image')) {
            $oldMedia = $member->media;
            $attributes['media_id'] = Media::storeFile($request->file('image'), 'departments', Auth::id())->id;
            $oldMedia?->delete();
        }

        $member->update($attributes);

        $changeLog->log('department_member', $member->id, 'update', $old, $member->fresh()->attributesToArray(), $member->name_en ?: $member->name_ar);

        return back()->with('success', 'Team member updated.');
    }

    /** Show/hide a single member on the homepage (immediate). */
    public function toggleActive(int $id, ChangeLogService $changeLog): RedirectResponse
    {
        $member = DepartmentMember::findOrFail($id);
        $old = $member->attributesToArray();
        $member->update(['is_active' => ! $member->is_active]);

        $changeLog->log('department_member', $member->id, 'update', $old, $member->fresh()->attributesToArray(), $member->name_en ?: $member->name_ar);

        return back()->with('success', $member->is_active ? 'Member shown.' : 'Member hidden.');
    }

    public function destroy(int $id, ChangeLogService $changeLog): RedirectResponse
    {
        $member = DepartmentMember::findOrFail($id);
        $changeLog->log('department_member', $member->id, 'delete', $member->attributesToArray(), null, $member->name_en ?: $member->name_ar);
        $member->delete();

        return back()->with('success', 'Team member removed.');
    }

    /** Persist a new order (array of ids, top-first). */
    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids'   => ['required', 'array'],
            'ids.*' => ['integer', 'exists:department_members,id'],
        ]);

        foreach ($validated['ids'] as $position => $id) {
            DepartmentMember::query()->where('id', $id)->update(['sort_order' => $position + 1]);
        }

        return back()->with('success', 'Order updated.');
    }

    /**
     * Name and role each require AT LEAST ONE language; photo is optional (the
     * card shows a placeholder until one is uploaded).
     */
    private function validateData(Request $request): array
    {
        return $request->validate([
            'name_en' => ['nullable', 'required_without:name_ar', 'string', 'max:120'],
            'name_ar' => ['nullable', 'required_without:name_en', 'string', 'max:120'],
            'role_en' => ['nullable', 'required_without:role_ar', 'string', 'max:120'],
            'role_ar' => ['nullable', 'required_without:role_en', 'string', 'max:120'],
            'image'   => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp', 'mimetypes:image/jpeg,image/png,image/webp', 'max:10240'],
        ], [
            'name_en.required_without' => 'Enter the name in at least one language.',
            'name_ar.required_without' => 'Enter the name in at least one language.',
            'role_en.required_without' => 'Enter the role in at least one language.',
            'role_ar.required_without' => 'Enter the role in at least one language.',
        ]);
    }
}
