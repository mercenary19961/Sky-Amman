<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    private ?array $cachedSettings = null;

    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                ] : null,
            ],
            'locale' => session('locale', 'en'),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'info' => fn () => $request->session()->get('info'),
                'warning' => fn () => $request->session()->get('warning'),
            ],
            'siteSettings' => fn () => $this->getSiteSettings(),
            'turnstileSiteKey' => fn () => config('services.turnstile.site_key'),
            'ziggy' => function () use ($request) {
                $ziggy = new Ziggy;

                if (! $request->user()) {
                    $ziggy = $ziggy->filter(['!admin.*', '!logout']);
                }

                return [
                    ...$ziggy->toArray(),
                    'location' => $request->url(),
                ];
            },
        ]);
    }

    private function getSiteSettings(): array
    {
        if ($this->cachedSettings === null) {
            $this->cachedSettings = Setting::whereIn('key', [
                'company_phone',
                'company_email',
                'company_address_en',
                'company_address_ar',
                'linkedin_url',
                'instagram_url',
                'facebook_url',
                'twitter_url',
                'youtube_url',
                'tiktok_url',
                'google_maps_embed_url',
                'google_maps_place_url',
                'seo_title_en',
                'seo_title_ar',
                'seo_description_en',
                'seo_description_ar',
                'og_image_url',
            ])->pluck('value', 'key')->toArray();
        }

        $isAr = session('locale', 'en') === 'ar';

        return [
            'phone' => $this->cachedSettings['company_phone'] ?? '',
            'email' => $this->cachedSettings['company_email'] ?? '',
            'address' => $this->cachedSettings[$isAr ? 'company_address_ar' : 'company_address_en'] ?? '',
            'linkedin_url' => $this->cachedSettings['linkedin_url'] ?? '',
            'instagram_url' => $this->cachedSettings['instagram_url'] ?? '',
            'facebook_url' => $this->cachedSettings['facebook_url'] ?? '',
            'twitter_url' => $this->cachedSettings['twitter_url'] ?? '',
            'youtube_url' => $this->cachedSettings['youtube_url'] ?? '',
            'tiktok_url' => $this->cachedSettings['tiktok_url'] ?? '',
            'google_maps_embed_url' => $this->cachedSettings['google_maps_embed_url'] ?? '',
            'google_maps_place_url' => $this->cachedSettings['google_maps_place_url'] ?? '',
            'seo_title' => $this->cachedSettings[$isAr ? 'seo_title_ar' : 'seo_title_en'] ?? '',
            'seo_description' => $this->cachedSettings[$isAr ? 'seo_description_ar' : 'seo_description_en'] ?? '',
            'og_image_url' => $this->cachedSettings['og_image_url'] ?? '',
        ];
    }
}
