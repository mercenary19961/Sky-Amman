<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Admin-replaceable image slots. Each known slot (see SLOTS) maps to an uploaded
 * media record; when none is set the committed default path is used, so the site
 * looks the same out of the box but editors can swap specific images without a
 * deploy. Add a new entry to SLOTS to expose another image to the admin.
 */
class ManagedImage extends Model
{
    protected $fillable = ['key', 'media_id'];

    /**
     * Registry of replaceable slots: key => [label, default, group].
     * `default` is the committed fallback served when no upload exists.
     */
    public const SLOTS = [
        'about_crafted_1' => [
            'label'   => 'Crafted — large image (right)',
            'default' => '/images/about/crafted-1.webp',
            'group'   => 'About Us',
        ],
        'about_crafted_2' => [
            'label'   => 'Crafted — top small image (start)',
            'default' => '/images/about/crafted-2.webp',
            'group'   => 'About Us',
        ],
        'about_crafted_3' => [
            'label'   => 'Crafted — bottom small image (start)',
            'default' => '/images/about/crafted-3.webp',
            'group'   => 'About Us',
        ],
    ];

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }

    /** The default (committed) path for a slot, or null if the key is unknown. */
    public static function defaultFor(string $key): ?string
    {
        return self::SLOTS[$key]['default'] ?? null;
    }

    /**
     * Resolve a set of slot keys to their current URLs (uploaded media → URL,
     * else the committed default). Returns [key => url].
     */
    public static function urls(array $keys): array
    {
        $rows = self::query()->whereIn('key', $keys)->with('media:id,path,mime_type')->get()->keyBy('key');

        $out = [];
        foreach ($keys as $key) {
            $out[$key] = $rows->get($key)?->media?->url ?? self::defaultFor($key);
        }

        return $out;
    }
}
