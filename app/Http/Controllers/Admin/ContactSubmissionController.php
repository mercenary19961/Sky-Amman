<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactSubmission;
use App\Services\ChangeLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Single inbox for every public-facing form submission (innovation #3/#4 —
 * lead routing by request_type + optional per-project linkage). Read-only as far
 * as the submission content goes; admins/editors can mark read/unread, archive,
 * and soft-delete. Available to both admins and editors (no `admin` middleware).
 */
class ContactSubmissionController extends Controller
{
    public function index(Request $request): Response
    {
        // `view` splits the inbox from the archive; trash is its own page.
        $view = $request->input('view') === 'archived' ? 'archived' : 'inbox';

        $query = ContactSubmission::with('project:id,title_en')
            ->where('is_archived', $view === 'archived');

        if ($request->filled('request_type')) {
            $query->ofRequestType($request->request_type);
        }

        if ($request->filled('read')) {
            $query->where('is_read', $request->boolean('read'));
        }

        if ($request->filled('search')) {
            $term = '%' . str_replace(['%', '_'], ['\\%', '\\_'], $request->search) . '%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                    ->orWhere('email', 'like', $term)
                    ->orWhere('phone', 'like', $term)
                    ->orWhere('message', 'like', $term);
            });
        }

        $submissions = $query->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (ContactSubmission $s) => $this->toListItem($s));

        return Inertia::render('Admin/Contacts/Index', [
            'submissions'  => $submissions,
            'filters'      => $request->only(['request_type', 'read', 'search', 'view']),
            'view'         => $view,
            'unreadCount'  => ContactSubmission::unarchived()->unread()->count(),
            'archivedCount' => ContactSubmission::where('is_archived', true)->count(),
            'trashedCount' => ContactSubmission::onlyTrashed()->count(),
        ]);
    }

    public function show(int $id): Response
    {
        $submission = ContactSubmission::with(['project:id,slug,title_en', 'readByUser:id,name'])
            ->findOrFail($id);

        // Mark read on open (mirrors the "mark viewed on open" convention).
        if (! $submission->is_read) {
            $submission->update([
                'is_read' => true,
                'read_by' => Auth::id(),
            ]);
            $submission->load('readByUser:id,name');
        }

        return Inertia::render('Admin/Contacts/Show', [
            'submission' => [
                'id'           => $submission->id,
                'name'         => $submission->name,
                'email'        => $submission->email,
                'phone'        => $submission->phone,
                'request_type' => $submission->request_type,
                'subject'      => $submission->subject,
                'message'      => $submission->message,
                'is_read'      => $submission->is_read,
                'is_archived'  => $submission->is_archived,
                'ip_address'   => $submission->ip_address,
                'project'      => $submission->project
                    ? ['id' => $submission->project->id, 'slug' => $submission->project->slug, 'title_en' => $submission->project->title_en]
                    : null,
                'read_by'      => $submission->readByUser?->name,
                'created_at'   => $submission->created_at->toDayDateTimeString(),
                'created_ago'  => $submission->created_at->diffForHumans(),
            ],
        ]);
    }

    public function toggleRead(int $id): RedirectResponse
    {
        $submission = ContactSubmission::findOrFail($id);
        $nowRead = ! $submission->is_read;

        $submission->update([
            'is_read' => $nowRead,
            'read_by' => $nowRead ? Auth::id() : null,
        ]);

        return back()->with('success', $nowRead ? 'Marked as read.' : 'Marked as unread.');
    }

    public function toggleArchive(int $id): RedirectResponse
    {
        $submission = ContactSubmission::findOrFail($id);
        $nowArchived = ! $submission->is_archived;

        $submission->update(['is_archived' => $nowArchived]);

        return back()->with('success', $nowArchived ? 'Archived.' : 'Moved back to inbox.');
    }

    public function destroy(int $id, ChangeLogService $changeLog): RedirectResponse
    {
        $submission = ContactSubmission::findOrFail($id);
        $changeLog->log('contact', $submission->id, 'delete', $submission->attributesToArray(), null, $submission->name);
        $submission->delete();

        return redirect()
            ->route('admin.contacts.index')
            ->with('success', 'Submission moved to trash.');
    }

    public function trash(): Response
    {
        $submissions = ContactSubmission::onlyTrashed()
            ->with('project:id,title_en')
            ->orderByDesc('deleted_at')
            ->paginate(15)
            ->through(fn (ContactSubmission $s) => $this->toListItem($s));

        return Inertia::render('Admin/Contacts/Trash', [
            'submissions' => $submissions,
        ]);
    }

    public function restore(int $id, ChangeLogService $changeLog): RedirectResponse
    {
        $submission = ContactSubmission::onlyTrashed()->findOrFail($id);
        $submission->restore();
        $changeLog->log('contact', $submission->id, 'restore', null, $submission->fresh()->attributesToArray(), $submission->name);

        return redirect()
            ->route('admin.contacts.trash')
            ->with('success', 'Submission restored.');
    }

    public function forceDestroy(int $id): RedirectResponse
    {
        ContactSubmission::onlyTrashed()->findOrFail($id)->forceDelete();

        return redirect()
            ->route('admin.contacts.trash')
            ->with('success', 'Submission permanently deleted.');
    }

    /** Shared row shape for the inbox / archive / trash tables. */
    private function toListItem(ContactSubmission $s): array
    {
        return [
            'id'           => $s->id,
            'name'         => $s->name,
            'email'        => $s->email,
            'phone'        => $s->phone,
            'request_type' => $s->request_type,
            'preview'      => \Illuminate\Support\Str::limit($s->message, 90),
            'is_read'      => $s->is_read,
            'is_archived'  => $s->is_archived,
            'project'      => $s->project ? ['id' => $s->project->id, 'title_en' => $s->project->title_en] : null,
            'created_ago'  => $s->created_at->diffForHumans(),
            'created_at'   => $s->created_at->toDayDateTimeString(),
        ];
    }
}
