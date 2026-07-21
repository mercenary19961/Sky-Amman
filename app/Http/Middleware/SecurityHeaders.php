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
            'script-src '.implode(' ', $this->scriptSrc()),
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            // Wide-open https: also covers every marketing pixel/beacon, which is
            // why no vendor needs an img-src entry below.
            "img-src 'self' data: blob: https:",
            "font-src 'self' data: https://fonts.gstatic.com",
            'frame-src '.implode(' ', $this->frameSrc()),
            'connect-src '.implode(' ', $this->connectSrc()),
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

    /**
     * Where scripts may LOAD from.
     *
     * ⚠️ Marketing tags are added/removed by the marketing team in the GTM UI,
     * but a strict CSP means each vendor still needs its hosts listed in these
     * three methods or the browser blocks it — silently, from GTM's point of
     * view (Tag Assistant reports "fired successfully" either way). Approved
     * vendors: Google (GA4 + Ads), LinkedIn, Meta. Anything else needs adding.
     *
     * @return list<string>
     */
    private function scriptSrc(): array
    {
        return [
            "'self'",
            "'unsafe-inline'",
            'https://challenges.cloudflare.com',
            'https://static.cloudflareinsights.com',
            // GTM container itself + Google Ads conversion/remarketing tags.
            'https://www.googletagmanager.com',
            'https://www.googleadservices.com',
            'https://googleads.g.doubleclick.net',
            // LinkedIn Insight Tag. NOTE: this is snap.licdn.com, NOT the
            // www.linkedin.com already in frame-src (that one is the post embed).
            'https://snap.licdn.com',
            // Meta (Facebook) Pixel.
            'https://connect.facebook.net',
        ];
    }

    /**
     * Which origins may be embedded as iframes.
     *
     * @return list<string>
     */
    private function frameSrc(): array
    {
        return [
            "'self'",
            // Turnstile + Google Maps + LinkedIn/Instagram + YouTube embeds.
            'https://challenges.cloudflare.com',
            'https://www.google.com',
            'https://www.linkedin.com',
            'https://www.instagram.com',
            'https://www.youtube.com',
            'https://www.youtube-nocookie.com',
            // GTM's <noscript> fallback iframe + its Preview/debug overlay.
            'https://www.googletagmanager.com',
            'https://tagassistant.google.com',
            // Google Ads conversion linker.
            'https://td.doubleclick.net',
            // Meta Pixel's iframe fallback.
            'https://www.facebook.com',
        ];
    }

    /**
     * Where the page may SEND data (fetch / XHR / sendBeacon).
     *
     * This is the directive that silently kills analytics when it's wrong: a tag
     * loads fine via script-src and reports success, then every measurement it
     * sends is blocked here. Vendors send to different hosts than they load from.
     *
     * @return list<string>
     */
    private function connectSrc(): array
    {
        return [
            // Inertia XHRs target self; Turnstile siteverify runs server-side.
            "'self'",
            'https://cloudflareinsights.com',
            // GA4 measurement endpoints (incl. regional, e.g. region1.*).
            'https://www.google-analytics.com',
            'https://*.google-analytics.com',
            'https://*.analytics.google.com',
            'https://www.googletagmanager.com',
            'https://tagassistant.google.com',
            // Google Ads conversions + remarketing audience pings. The audience
            // ping targets the visitor's country TLD (google.jo for most traffic
            // here) — add other TLDs if reporting looks short in a new market.
            'https://googleads.g.doubleclick.net',
            'https://stats.g.doubleclick.net',
            'https://www.google.com',
            'https://www.google.jo',
            // LinkedIn Insight Tag beacons.
            'https://px.ads.linkedin.com',
            'https://px4.ads.linkedin.com',
            // Meta Pixel.
            'https://www.facebook.com',
            'https://connect.facebook.net',
        ];
    }
}
