<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * An editor-uploaded image for the public "Projects Gallery" section. These are
 * pooled with images from sold projects and shuffled on every visit.
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
}
