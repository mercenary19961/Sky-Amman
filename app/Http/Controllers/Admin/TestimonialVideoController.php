<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TestimonialVideo;
use App\Services\ChangeLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class TestimonialVideoController extends Controller
{
    /**
     * The Testimonials section shows at least three videos (a 3-up layout).
     * publish() enforces this minimum for the live set; the admin may select
     * more — extra videos become a carousel the visitor pages through.
     */
    private const MIN_ACTIVE = 3;

    public function index(): Response
    {
        return Inertia::render('Admin/TestimonialVideos/Index', [
            'videos' => TestimonialVideo::ordered()->get(['id', 'title', 'url', 'sort_order', 'is_active']),
            'minActive' => self::MIN_ACTIVE,
        ]);
    }

    public function store(Request $request, ChangeLogService $changeLog): RedirectResponse
    {
        $data = $this->validateData($request);

        // New videos enter the library hidden; the admin selects which 3 are
        // live via the draft selection + "Update homepage" (publish) action.
        $video = TestimonialVideo::create([
            'title' => $data['title'] ?? null,
            'url' => $data['url'],
            'is_active' => false,
            'sort_order' => (int) TestimonialVideo::query()->max('sort_order') + 1,
        ]);

        $changeLog->log('testimonial_video', $video->id, 'create', null, $video->attributesToArray(), $video->title ?: $video->url);

        return back()->with('success', 'Video added to the library.');
    }

    public function update(Request $request, int $id, ChangeLogService $changeLog): RedirectResponse
    {
        $video = TestimonialVideo::findOrFail($id);
        $data = $this->validateData($request);
        $old = $video->attributesToArray();

        // Editing only changes the URL/label — active state is managed solely
        // through publish() so the live set is always exactly MAX_ACTIVE.
        $video->update([
            'title' => $data['title'] ?? null,
            'url' => $data['url'],
        ]);

        $changeLog->log('testimonial_video', $video->id, 'update', $old, $video->fresh()->attributesToArray(), $video->title ?: $video->url);

        return back()->with('success', 'Video updated.');
    }

    /**
     * Apply the admin's chosen live set. Requires AT LEAST MIN_ACTIVE ids — this
     * guarantees the homepage always shows the 3-up layout; any extras become a
     * carousel the visitor pages through.
     */
    public function publish(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:' . self::MIN_ACTIVE],
            'ids.*' => ['integer', 'distinct', 'exists:testimonial_videos,id'],
        ]);

        DB::transaction(function () use ($validated) {
            TestimonialVideo::query()->update(['is_active' => false]);
            TestimonialVideo::query()->whereIn('id', $validated['ids'])->update(['is_active' => true]);
        });

        return back()->with('success', 'Homepage videos updated.');
    }

    public function destroy(int $id, ChangeLogService $changeLog): RedirectResponse
    {
        $video = TestimonialVideo::findOrFail($id);

        // Don't let a live video be deleted if doing so would drop the live set
        // below MIN_ACTIVE. Swap it out (or add another) via publish first.
        $activeCount = TestimonialVideo::active()->count();
        if ($video->is_active && $activeCount <= self::MIN_ACTIVE) {
            return back()->with('error', 'This video is live. Swap it out via “Update homepage” before deleting.');
        }

        $changeLog->log('testimonial_video', $video->id, 'delete', $video->attributesToArray(), null, $video->title ?: $video->url);
        $video->delete();

        return back()->with('success', 'Video removed.');
    }

    /**
     * Persist a new order from the admin list (array of video ids, top-first).
     */
    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:testimonial_videos,id'],
        ]);

        foreach ($validated['ids'] as $position => $id) {
            TestimonialVideo::query()->where('id', $id)->update(['sort_order' => $position + 1]);
        }

        return back()->with('success', 'Order updated.');
    }

    /**
     * A url may be a self-hosted path (/video/x.mp4) or an http(s) URL
     * (including YouTube links). Reject anything else so a typo can't slip in.
     */
    private function validateData(Request $request): array
    {
        return Validator::make(
            $request->all(),
            [
                'title' => ['nullable', 'string', 'max:255'],
                'url' => ['required', 'string', 'max:2048', 'regex:/^(https?:\/\/\S+|\/\S*)$/i'],
            ],
            ['url.regex' => 'Enter a valid URL or a path beginning with "/".'],
        )->validate();
    }
}
