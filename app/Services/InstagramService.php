<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Fetches the most recent posts from the configured Instagram Business / Creator
 * account via the Instagram Graph API. Results are cached for one hour to stay
 * well within Meta's rate limits and to keep the homepage fast.
 *
 * Admin setup (one-time, lives in CLAUDE.md too):
 *  1. Convert the IG account to a Business or Creator account.
 *  2. Link it to a Facebook Page.
 *  3. Create a Meta Developer App at https://developers.facebook.com/apps
 *  4. Add the "Instagram Graph API" product and request `instagram_basic` permission.
 *  5. Use the Graph API Explorer to mint a short-lived token, then exchange
 *     it for a long-lived (60-day) token. Note the IG user ID returned.
 *  6. Paste the long-lived token into Setting `instagram_access_token` and the
 *     user ID into `instagram_user_id` (admin Settings page).
 *
 * Long-lived tokens expire after 60 days; the admin needs to refresh manually
 * for now. A scheduled refresh task can be added later.
 */
class InstagramService
{
    private const CACHE_KEY = 'instagram.recent_media';
    private const CACHE_TTL_SECONDS = 3600; // 1 hour
    private const API_BASE = 'https://graph.instagram.com';
    private const REQUEST_TIMEOUT = 8;

    /**
     * Returns the most recent N posts for the configured account. Each post:
     *   [
     *     'id'         => string,
     *     'caption'    => string,
     *     'media_type' => 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM',
     *     'media_url'  => string (image URL or video thumbnail),
     *     'permalink'  => string (link to the post on instagram.com),
     *   ]
     * Returns an empty array when credentials are missing or the API call fails.
     */
    public function getRecentMedia(int $count = 9): array
    {
        $cacheKey = self::CACHE_KEY.".{$count}";

        return Cache::remember($cacheKey, self::CACHE_TTL_SECONDS, function () use ($count) {
            return $this->fetchFromApi($count);
        });
    }

    /**
     * Wipes the cached media so the next call hits the API fresh. Useful from
     * the admin Settings page after pasting a new token.
     */
    public function clearCache(): void
    {
        // Forget the common counts; cheaper than tracking every variant.
        for ($n = 1; $n <= 24; $n++) {
            Cache::forget(self::CACHE_KEY.".{$n}");
        }
    }

    private function fetchFromApi(int $count): array
    {
        $token = Setting::get('instagram_access_token');
        $userId = Setting::get('instagram_user_id');

        if (empty($token) || empty($userId)) {
            return [];
        }

        try {
            $response = Http::timeout(self::REQUEST_TIMEOUT)
                ->get(self::API_BASE."/{$userId}/media", [
                    'access_token' => $token,
                    'fields' => 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
                    'limit' => $count,
                ]);

            if (! $response->successful()) {
                Log::warning('Instagram API request failed', [
                    'status' => $response->status(),
                    'body' => $response->json(),
                ]);

                return [];
            }

            $data = $response->json('data') ?? [];

            return collect($data)
                ->map(fn (array $item) => [
                    'id' => $item['id'] ?? '',
                    'caption' => $item['caption'] ?? '',
                    'media_type' => $item['media_type'] ?? 'IMAGE',
                    // Videos return a separate thumbnail URL — fall back to that
                    // so the grid stays image-only without inline video playback.
                    'media_url' => ($item['media_type'] ?? '') === 'VIDEO'
                        ? ($item['thumbnail_url'] ?? '')
                        : ($item['media_url'] ?? ''),
                    'permalink' => $item['permalink'] ?? '',
                ])
                ->filter(fn (array $item) => $item['media_url'] !== '')
                ->take($count)
                ->values()
                ->all();
        } catch (\Throwable $e) {
            Log::error('Instagram fetch threw', ['error' => $e->getMessage()]);

            return [];
        }
    }
}
