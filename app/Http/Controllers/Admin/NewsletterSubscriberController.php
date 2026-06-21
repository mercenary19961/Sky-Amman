<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class NewsletterSubscriberController extends Controller
{
    public function index(Request $request): InertiaResponse
    {
        $query = NewsletterSubscriber::query();

        if ($request->filled('search')) {
            $term = '%' . str_replace(['%', '_'], ['\\%', '\\_'], $request->search) . '%';
            $query->where('email', 'like', $term);
        }

        $subscribers = $query
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (NewsletterSubscriber $s) => [
                'id'          => $s->id,
                'email'       => $s->email,
                'is_active'   => $s->is_active,
                'ip_address'  => $s->ip_address,
                'created_at'  => $s->created_at?->toDateTimeString(),
                'created_ago' => $s->created_at?->diffForHumans(),
            ]);

        return Inertia::render('Admin/NewsletterSubscribers', [
            'subscribers' => $subscribers,
            'filters'     => $request->only(['search']),
            'totalCount'  => NewsletterSubscriber::count(),
            'activeCount' => NewsletterSubscriber::where('is_active', true)->count(),
        ]);
    }

    public function destroy(int $id): RedirectResponse
    {
        NewsletterSubscriber::findOrFail($id)->delete();

        return back()->with('success', 'Subscriber removed.');
    }

    public function export(): Response
    {
        $emails = NewsletterSubscriber::where('is_active', true)
            ->orderByDesc('created_at')
            ->pluck('email')
            ->join("\n");

        return response($emails ?: '', 200, [
            'Content-Type'        => 'text/plain; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="newsletter-subscribers.txt"',
        ]);
    }
}
