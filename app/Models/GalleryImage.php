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
                if ($p->images->isNotEmpty()) {
                    return $p->images
                        ->filter(fn (ProjectImage $img) => $img->media !== null)
                        ->map(fn (ProjectImage $img) => [
                            'id'     => "img-{$img->id}",
                            'url'    => route('media.serve', $img->media_id, false),
                            'alt'    => $p->title_en,
                            'source' => 'project',
                            'label'  => $p->title_en,
                        ]);
                }

                return [[
                    'id'     => "slug-{$p->slug}",
                    'url'    => "/images/projects/{$p->slug}.svg",
                    'alt'    => $p->title_en,
                    'source' => 'project',
                    'label'  => $p->title_en,
                ]];
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
            ]);

        return $sold->concat($editor)->values();
    }
}
