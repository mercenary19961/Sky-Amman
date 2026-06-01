<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TestimonialVideo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TestimonialVideoController extends Controller
{
    /**
     * The Testimonials section always shows exactly three videos (a 3-up
     * layout). We can't force a minimum (the admin may still be adding them),
     * but we hard-cap the number that can be ACTIVE so it's never more than 3.
     */
    private const MAX_ACTIVE = 3;

    public function index(): Response
    {
        return Inertia::render('Admin/TestimonialVideos/Index', [
            'videos' => TestimonialVideo::ordered()->get(['id', 'title', 'url', 'sort_order', 'is_active']),
            'maxActive' => self::MAX_ACTIVE,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);

        $wantsActive = $data['is_active'] ?? true;
        $atCap = TestimonialVideo::active()->count() >= self::MAX_ACTIVE;

        // Adding while 3 are already active → save it hidden rather than reject.
        $active = $wantsActive && ! $atCap;

        TestimonialVideo::create([
            'title' => $data['title'] ?? null,
            'url' => $data['url'],
            'is_active' => $active,
            // New videos go to the end of the list.
            'sort_order' => (int) TestimonialVideo::max('sort_order') + 1,
        ]);

        $message = $wantsActive && ! $active
            ? 'Video added as hidden — 3 videos are already active. Hide one to show this.'
            : 'Video added.';

        return back()->with($wantsActive && ! $active ? 'info' : 'success', $message);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $video = TestimonialVideo::findOrFail($id);
        $data = $this->validateData($request);

        $wantsActive = $data['is_active'] ?? false;

        // Block turning a 4th video on.
        if ($wantsActive && ! $video->is_active) {
            $otherActive = TestimonialVideo::where('is_active', true)
                ->where('id', '!=', $video->id)
                ->count();
            if ($otherActive >= self::MAX_ACTIVE) {
                return back()->with('error', 'Only 3 videos can be active. Hide one first.');
            }
        }

        $video->update([
            'title' => $data['title'] ?? null,
            'url' => $data['url'],
            'is_active' => $wantsActive,
        ]);

        return back()->with('success', 'Video updated.');
    }

    public function destroy(int $id): RedirectResponse
    {
        TestimonialVideo::findOrFail($id)->delete();

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
            TestimonialVideo::where('id', $id)->update(['sort_order' => $position + 1]);
        }

        return back()->with('success', 'Order updated.');
    }

    /**
     * A url may be a self-hosted path (/video/x.mp4), an http(s) URL, or a
     * YouTube link — all valid. Reject anything else so a typo can't slip in.
     */
    private function validateData(Request $request): array
    {
        return Validator::make($request->all(), [
            'title' => ['nullable', 'string', 'max:255'],
            'url' => [
                'required',
                'string',
                'max:2048',
                function (string $attribute, mixed $value, callable $fail) {
                    $ok = Str::startsWith($value, '/') || filter_var($value, FILTER_VALIDATE_URL);
                    if (! $ok) {
                        $fail('Enter a valid URL or a path beginning with "/".');
                    }
                },
            ],
            'is_active' => ['boolean'],
        ])->validate();
    }
}
