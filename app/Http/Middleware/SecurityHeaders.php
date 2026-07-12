<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), xr-spatial-tracking=()');

        if (! app()->isLocal()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
            $response->headers->set('Content-Security-Policy', $this->buildCsp());
        }

        return $response;
    }

    /**
     * CSP intentionally not sent in local dev — Vite's HMR origin uses bracketed
     * IPv6 syntax (http://[::1]:5173) that Chrome rejects as invalid. The
     * 'unsafe-inline' on script-src covers the inline JSON-LD blocks rendered
     * for SEO; React escapes all dynamic content and we never use
     * dangerouslySetInnerHTML, so the realistic XSS surface is essentially nil.
     */
    private function buildCsp(): string
    {
        return implode('; ', [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://www.googletagmanager.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: blob: https:",
            "font-src 'self' data: https://fonts.gstatic.com",
            // Turnstile + Google Maps + LinkedIn/Instagram + YouTube embeds.
            "frame-src 'self' https://challenges.cloudflare.com https://www.google.com https://www.linkedin.com https://www.instagram.com https://www.youtube.com https://www.youtube-nocookie.com",
            // Inertia XHRs target self; Turnstile siteverify runs server-side.
            "connect-src 'self' https://cloudflareinsights.com",
            "media-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'self'",
            // Auto-upgrade any stray http:// request to https:// at the browser.
            // Railway terminates TLS at its edge and forwards to the container
            // over http, so request-derived URLs (redirect()->intended(), the
            // Ziggy 'location') can come out http:// even though the page is
            // https — this prevents those from being blocked as mixed content.
            'upgrade-insecure-requests',
        ]);
    }
}
