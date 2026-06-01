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
    public function index(): Response
    {
        return Inertia::render('Admin/TestimonialVideos/Index', [
            'videos' => TestimonialVideo::ordered()->get(['id', 'title', 'url', 'sort_order', 'is_active']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);

        TestimonialVideo::create([
            'title' => $data['title'] ?? null,
            'url' => $data['url'],
            'is_active' => $data['is_active'] ?? true,
            // New videos go to the end of the list.
            'sort_order' => (int) TestimonialVideo::max('sort_order') + 1,
        ]);

        return back()->with('success', 'Video added.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $video = TestimonialVideo::findOrFail($id);
        $data = $this->validateData($request);

        $video->update([
            'title' => $data['title'] ?? null,
            'url' => $data['url'],
            'is_active' => $data['is_active'] ?? false,
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
