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
        // Trust all proxies. The site sits DIRECTLY behind Railway's edge (the
        // custom domain www.skyamman.com is a Railway CNAME — Cloudflare was
        // removed during the domain switchover, so the old CF CIDR allowlist no
        // longer matched anything and Laravel stopped trusting Railway's
        // X-Forwarded-Proto/For, seeing every request as http with the proxy IP
        // as the client). '*' is safe here because the container is only
        // reachable through Railway's edge — an external client cannot connect
        // to it directly to forge X-Forwarded-* headers. This restores https
        // scheme detection (fixes request-derived URLs like intended()) AND real
        // client-IP resolution (rate limiting + contact-submission ip_address).
        $middleware->trustProxies(at: '*', headers: SymfonyRequest::HEADER_X_FORWARDED_FOR | SymfonyRequest::HEADER_X_FORWARDED_HOST | SymfonyRequest::HEADER_X_FORWARDED_PORT | SymfonyRequest::HEADER_X_FORWARDED_PROTO);

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
