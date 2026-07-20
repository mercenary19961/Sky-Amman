<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ session('locale', 'en') === 'ar' ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {{-- Google Tag Manager. Renders only when GTM_CONTAINER_ID is set, and never
         on /admin/* so staff sessions don't count as site traffic. Placed as high
         in <head> as possible per Google's guidance. GA4 is configured as a tag
         inside the container, not in this codebase. --}}
    @if ($gtmId = config('services.gtm.container_id'))
        @unless (request()->is('admin', 'admin/*'))
            <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','{{ $gtmId }}');</script>
        @endunless
    @endif

    <title inertia>{{ config('app.name', 'SkyAmman') }}</title>

    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="icon" href="/favicon.ico" sizes="any">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=IBM+Plex+Sans+Arabic:wght@100;200;300;400;500;600;700&display=swap" rel="stylesheet" />

    @routes
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>
<body class="font-sans antialiased">
    {{-- GTM no-JS fallback. Must be the first element in <body>. --}}
    @if ($gtmId = config('services.gtm.container_id'))
        @unless (request()->is('admin', 'admin/*'))
            <noscript><iframe src="https://www.googletagmanager.com/ns.html?id={{ $gtmId }}"
                height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
        @endunless
    @endif

    @inertia
</body>
</html>
