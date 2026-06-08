<?php

namespace App\Http\Controllers;

use App\Mail\ContactSubmissionReceived;
use App\Models\ContactSubmission;
use App\Models\Page;
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
        // Page-level visibility (innovation #5) + per-page SEO (overrides the
        // site-wide Settings defaults on the client when set).
        $page = Page::getBySlug('contact');
        abort_if($page === null || ! $page->is_visible, 404);

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
            // Per-page SEO (admin-editable; client falls back to site-wide defaults).
            'seo' => [
                'title_en' => $page->seo_title_en,
                'title_ar' => $page->seo_title_ar,
                'description_en' => $page->seo_description_en,
                'description_ar' => $page->seo_description_ar,
            ],
            'url' => route('contact'),
        ]);
    }

    /**
     * Store an inquiry into the single contact inbox and notify the routed
     * recipient(s). Turnstile-gated; all text is stripped of tags before storage.
     */
    public function store(Request $request, TurnstileVerifier $turnstile): RedirectResponse
    {
        // Strip spaces/dashes/parens before validating so "+962 7…" and "07…"
        // both pass the same rule (and normalize cleanly afterwards).
        $request->merge(['phone' => preg_replace('/[\s()\-]/', '', (string) $request->input('phone'))]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:255'],
            // Jordan mobile: "+962 7XXXXXXXX" or "07XXXXXXXX" (962/no-+ also ok).
            'phone' => ['required', 'string', 'regex:/^(?:\+962|962|0)7\d{8}$/'],
            'request_type' => ['required', Rule::in(ContactSubmission::REQUEST_TYPES)],
            'message' => ['required', 'string', 'max:5000'],
            'property' => ['nullable', 'string', 'max:255'],
        ], [
            'phone.regex' => 'Enter a valid Jordan mobile, e.g. +962 7XXXXXXXX or 07XXXXXXXX.',
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
            // Stored canonically as "+9627XXXXXXXX" regardless of entered form.
            'phone' => $this->normalizeJordanPhone($validated['phone']),
            'request_type' => $validated['request_type'],
            'message' => strip_tags($validated['message']),
            'project_id' => $projectId,
            'ip_address' => $request->ip(),
        ]);

        $this->notifyRecipients($submission);

        return back()->with('success', __('contact.form.success'));
    }

    /**
     * Canonicalize a validated Jordan phone to "+9627XXXXXXXX". Input has already
     * been stripped of spaces/dashes and matched against the format rule, so it's
     * one of: +9627…, 9627…, or 07….
     */
    private function normalizeJordanPhone(string $phone): string
    {
        if (str_starts_with($phone, '+962')) {
            return $phone;
        }
        if (str_starts_with($phone, '962')) {
            return '+' . $phone;
        }

        return '+962' . substr($phone, 1); // "07XXXXXXXX" → "+9627XXXXXXXX"
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
