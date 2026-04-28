<?php

namespace App\Http\Controllers;

use App\Models\Media;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class MediaServeController extends Controller
{
    // SVG excluded: SVGs can carry inline scripts that execute when served as
    // image/svg+xml on the site origin, enabling stored XSS.
    private const ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/pdf',
    ];

    public function show(int $id): Response
    {
        $media = Media::findOrFail($id);

        if (! in_array($media->mime_type, self::ALLOWED_MIME_TYPES, true)) {
            abort(403);
        }

        if (! Storage::exists($media->path)) {
            abort(404);
        }

        return response()->file(
            Storage::path($media->path),
            [
                'Content-Type'            => $media->mime_type,
                'Cache-Control'           => 'public, max-age=86400',
                'X-Content-Type-Options'  => 'nosniff',
            ]
        );
    }
}
