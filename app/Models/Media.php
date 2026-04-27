<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * @property string $path
 * @property string $alt_text_en
 * @property string|null $alt_text_ar
 */
class Media extends Model
{
    use SoftDeletes;

    protected $table = 'media';

    protected $fillable = [
        'filename',
        'original_filename',
        'path',
        'mime_type',
        'size',
        'alt_text_en',
        'alt_text_ar',
        'folder',
        'uploaded_by',
    ];

    protected $appends = ['url'];

    protected static function booted(): void
    {
        // Only delete the physical file on permanent (force) delete, never on soft delete.
        static::forceDeleting(function (Media $media) {
            Storage::delete($media->path);
        });
    }

    public function uploadedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function projectImages(): HasMany
    {
        return $this->hasMany(ProjectImage::class);
    }

    public function getUrlAttribute(): string
    {
        return url("/media/{$this->id}");
    }

    public function getAltTextAttribute(): string
    {
        return app()->getLocale() === 'ar'
            ? ($this->alt_text_ar ?: $this->alt_text_en ?: '')
            : ($this->alt_text_en ?: '');
    }

    public function isImage(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }

    public function isPdf(): bool
    {
        return $this->mime_type === 'application/pdf';
    }

    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->size;
        $units = ['B', 'KB', 'MB', 'GB'];
        $index = 0;

        while ($bytes >= 1024 && $index < count($units) - 1) {
            $bytes /= 1024;
            $index++;
        }

        return round($bytes, 2) . ' ' . $units[$index];
    }

    /**
     * Store an uploaded file under a private folder with a randomized filename
     * and create the media record. Use this everywhere — never bypass with
     * raw Storage calls.
     */
    public static function storeFile(UploadedFile $file, string $folder = 'general', ?int $userId = null, ?string $altEn = null, ?string $altAr = null): self
    {
        $extension = $file->getClientOriginalExtension();
        $filename = Str::random(40) . ($extension ? '.' . $extension : '');
        $path = $file->storeAs("media/{$folder}", $filename, 'local');

        return static::create([
            'filename' => $filename,
            'original_filename' => $file->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
            'size' => $file->getSize() ?: 0,
            'alt_text_en' => $altEn,
            'alt_text_ar' => $altAr,
            'folder' => $folder,
            'uploaded_by' => $userId,
        ]);
    }
}
