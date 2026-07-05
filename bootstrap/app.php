<?php

use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\SetLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Symfony\Component\HttpFoundation\Request as SymfonyRequest;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Cloudflare CIDR list — locking trustProxies prevents X-Forwarded-For
        // spoofing from arbitrary clients. Wildcard '*' would let anyone forge
        // the originating IP for rate-limit / audit logs. RFC 1918 ranges cover
        // Railway's internal hop. Update from https://www.cloudflare.com/ips/
        // when CF publishes new ranges.
        $middleware->trustProxies(at: [
            // RFC 1918 private (Railway internal)
            '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16',
            // Cloudflare IPv4
            '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22',
            '103.31.4.0/22', '141.101.64.0/18', '108.162.192.0/18',
            '190.93.240.0/20', '188.114.96.0/20', '197.234.240.0/22',
            '198.41.128.0/17', '162.158.0.0/15', '104.16.0.0/13',
            '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22',
            // Cloudflare IPv6
            '2400:cb00::/32', '2606:4700::/32', '2803:f800::/32',
            '2405:b500::/32', '2405:8100::/32', '2a06:98c0::/29',
            '2c0f:f248::/32',
        ], headers: SymfonyRequest::HEADER_X_FORWARDED_FOR | SymfonyRequest::HEADER_X_FORWARDED_HOST | SymfonyRequest::HEADER_X_FORWARDED_PORT | SymfonyRequest::HEADER_X_FORWARDED_PROTO);

        $middleware->web(append: [
            SetLocale::class,
            SecurityHeaders::class,
            HandleInertiaRequests::class,
        ]);

        // Already-authenticated users hitting a `guest` route (/admin/login,
        // forgot/reset-password) belong in the admin panel. Without this,
        // RedirectIfAuthenticated::defaultRedirectUri() finds the PUBLIC route
        // named 'home' and dumps logged-in admins on the homepage.
        $middleware->redirectUsersTo('/admin');

        $middleware->alias([
            'admin' => AdminMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
