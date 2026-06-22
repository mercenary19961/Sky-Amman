<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Collection;

/**
 * An editor-uploaded image for the public "Projects Gallery" section. These are
 * pooled with images from sold projects and shuffled on every visit.
 *
 * @property int $id
 * @property int $media_id
 * @property int $sort_order
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Media|null $media
 * @method static Builder<static>|GalleryImage newModelQuery()
 * @method static Builder<static>|GalleryImage newQuery()
 * @method static Builder<static>|GalleryImage ordered()
 * @method static Builder<static>|GalleryImage query()
 * @method static Builder<static>|GalleryImage whereCreatedAt($value)
 * @method static Builder<static>|GalleryImage whereId($value)
 * @method static Builder<static>|GalleryImage whereMediaId($value)
 * @method static Builder<static>|GalleryImage whereSortOrder($value)
 * @method static Builder<static>|GalleryImage whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class GalleryImage extends Model
{
    protected $fillable = ['media_id', 'sort_order'];

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }

    /**
     * The full Projects-Gallery pool, unshuffled and unfiltered: images from
     * active sold projects (or their placeholder render) plus editor uploads.
     * Each item: id (stable pool key), url, alt, source ('project'|'editor'),
     * label, and gallery_id for editor rows. Used by both the public page (which
     * filters out hidden ids + shuffles) and the admin manager.
     */
    public static function pool(): Collection
    {
        $sold = Project::active()
            ->where('listing_status', 'sold')
            ->with(['images.media'])
            ->get()
            ->flatMap(function (Project $p) {
                $mediaImages = $p->images
                    ->filter(fn (ProjectImage $img) => $img->media !== null)
                    ->map(fn (ProjectImage $img) => [
                        'id'        => "img-{$img->id}",
                        'url'       => route('media.serve', $img->media_id, false),
                        'alt'       => $p->title_en,
                        'source'    => 'project',
                        'label'     => $p->title_en,
                        'size_bytes' => $img->media->size,
                        'mime_type'  => $img->media->mime_type,
                    ]);

                if ($mediaImages->isNotEmpty()) {
                    return $mediaImages;
                }

                // No uploaded Media → use the committed render gallery
                // (/images/projects/{slug}/NN.webp), or the placeholder.
                return collect($p->displayImageUrls())->map(function (string $url, int $i) use ($p) {
                    $urlPath = parse_url($url, PHP_URL_PATH) ?? $url;
                    $fsPath  = public_path(ltrim($urlPath, '/'));
                    $ext     = strtolower(pathinfo($urlPath, PATHINFO_EXTENSION));
                    $mime    = match ($ext) {
                        'webp'         => 'image/webp',
                        'jpg', 'jpeg'  => 'image/jpeg',
                        'png'          => 'image/png',
                        'svg'          => 'image/svg+xml',
                        'gif'          => 'image/gif',
                        default        => null,
                    };

                    return [
                        'id'         => "proj-{$p->id}-{$i}",
                        'url'        => $url,
                        'alt'        => $p->title_en,
                        'source'     => 'project',
                        'label'      => $p->title_en,
                        'size_bytes'  => file_exists($fsPath) ? filesize($fsPath) : null,
                        'mime_type'   => $mime,
                    ];
                });
            });

        $editor = self::ordered()
            ->with('media')
            ->get()
            ->filter(fn (GalleryImage $g) => $g->media !== null)
            ->map(fn (GalleryImage $g) => [
                'id'         => "gal-{$g->id}",
                'url'        => route('media.serve', $g->media_id, false),
                'alt'        => '',
                'source'     => 'editor',
                'label'      => 'Uploaded',
                'gallery_id' => $g->id,
                'size_bytes'  => $g->media->size,
                'mime_type'   => $g->media->mime_type,
            ]);

        return $sold->concat($editor)->values();
    }
}
