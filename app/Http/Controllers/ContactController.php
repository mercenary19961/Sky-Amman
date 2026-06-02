<?php

namespace App\Http\Controllers;

use App\Mail\ContactSubmissionReceived;
use App\Models\ContactSubmission;
use App\Models\Project;
use App\Models\Setting;
use App\Models\SiteContent;
use App\Services\TurnstileVerifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    /**
     * Public Contact page. A `?property={slug}` query (set by the "Contact about
     * this project" CTA on a property detail page) pre-fills the form and stamps
     * the inquiry with that project. Both EN/AR bundles are sent (instant-language).
     */
    public function show(Request $request): Response
    {
        $project = null;
        if ($slug = $request->query('property')) {
            $p = Project::active()->where('slug', $slug)->first(['id', 'slug', 'title_en', 'title_ar']);
            if ($p) {
                $project = [
                    'id' => $p->id,
                    'slug' => $p->slug,
                    'title_en' => $p->title_en,
                    'title_ar' => $p->title_ar,
                ];
            }
        }

        return Inertia::render('Public/Contact', [
            'content_en' => SiteContent::getPage('contact', 'en'),
            'content_ar' => SiteContent::getPage('contact', 'ar'),
            'requestTypes' => ContactSubmission::REQUEST_TYPES,
            'project' => $project,
        ]);
    }

    /**
     * Store an inquiry into the single contact inbox and notify the routed
     * recipient(s). Turnstile-gated; all text is stripped of tags before storage.
     */
    public function store(Request $request, TurnstileVerifier $turnstile): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'request_type' => ['required', Rule::in(ContactSubmission::REQUEST_TYPES)],
            'message' => ['required', 'string', 'max:5000'],
            'property' => ['nullable', 'string', 'max:255'],
        ]);

        if (! $turnstile->verify($request->input('cf-turnstile-response'), $request->ip())) {
            return back()->with('error', __('contact.form.verifyFailed'));
        }

        $projectId = ! empty($validated['property'])
            ? Project::active()->where('slug', $validated['property'])->value('id')
            : null;

        $submission = ContactSubmission::create([
            'name' => strip_tags($validated['name']),
            'email' => $validated['email'],
            'phone' => ! empty($validated['phone']) ? strip_tags($validated['phone']) : null,
            'request_type' => $validated['request_type'],
            'message' => strip_tags($validated['message']),
            'project_id' => $projectId,
            'ip_address' => $request->ip(),
        ]);

        $this->notifyRecipients($submission);

        return back()->with('success', __('contact.form.success'));
    }

    /**
     * Resolve recipients from the `lead_routing` setting by request type
     * (comma/space-separated emails), falling back to the company email.
     */
    private function notifyRecipients(ContactSubmission $submission): void
    {
        $routing = json_decode((string) Setting::get('lead_routing', '{}'), true) ?: [];
        $raw = $routing[$submission->request_type] ?? '';

        $recipients = collect(preg_split('/[,\s]+/', (string) $raw))
            ->map(fn ($e) => trim($e))
            ->filter()
            ->values();

        if ($recipients->isEmpty()) {
            $fallback = Setting::get('company_email', '');
            if ($fallback) {
                $recipients = collect([$fallback]);
            }
        }

        if ($recipients->isEmpty()) {
            return;
        }

        Mail::to($recipients->all())->send(new ContactSubmissionReceived($submission));
    }
}
