<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class VideoController extends Controller
{
    private const MIME = [
        'mp4' => 'video/mp4',
        'webm' => 'video/webm',
        'ogg' => 'video/ogg',
        'mov' => 'video/quicktime',
    ];

    /**
     * Stream a code-managed video from public/videos with HTTP Range support.
     *
     * Why a route instead of the static path: PHP's built-in dev server
     * (`php artisan serve`) ignores Range requests (returns 200 + full body, no
     * Accept-Ranges), which stops HTML5 <video> from playing locally. Symfony's
     * BinaryFileResponse handles Range when the response goes through PHP, so
     * playback works in dev and prod alike.
     */
    public function show(Request $request, string $filename): BinaryFileResponse
    {
        // Allowlist filename: no path traversal, video extensions only.
        if (! preg_match('/^[A-Za-z0-9._-]+\.(mp4|webm|ogg|mov)$/i', $filename)) {
            abort(404);
        }

        $path = public_path('videos/'.$filename);
        if (! is_file($path)) {
            abort(404);
        }

        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        // response()->file() returns a BinaryFileResponse; Laravel calls
        // prepare($request) on it, which negotiates the Range header → 206.
        return response()->file($path, [
            'Content-Type' => self::MIME[$ext] ?? 'application/octet-stream',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}
