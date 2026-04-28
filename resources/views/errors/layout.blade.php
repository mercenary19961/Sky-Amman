<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title') — Sky Amman</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Outfit', ui-sans-serif, system-ui, sans-serif;
            background: #F5F8FB;
            color: #1A2433;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1.5rem;
            padding: 2rem;
        }
        .code {
            font-size: 5rem;
            font-weight: 700;
            line-height: 1;
            color: #94C4EE;
            letter-spacing: -2px;
        }
        .message {
            font-size: 1.125rem;
            font-weight: 500;
            color: #1A2433;
        }
        .sub {
            font-size: 0.875rem;
            color: #5C6B82;
            max-width: 380px;
            text-align: center;
            line-height: 1.6;
        }
        .home-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.625rem 1.25rem;
            background: #94C4EE;
            color: #fff;
            font-size: 0.875rem;
            font-weight: 500;
            border-radius: 0.375rem;
            text-decoration: none;
            transition: background 0.15s;
        }
        .home-link:hover { background: #5C92B8; }
        .brand {
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.1em;
            color: #94C4EE;
            text-transform: uppercase;
            margin-bottom: 0.5rem;
        }
    </style>
</head>
<body>
    <div class="brand">Sky Amman</div>
    <div class="code">@yield('code')</div>
    <div class="message">@yield('message')</div>
    <div class="sub">@yield('description')</div>
    <a href="/" class="home-link">← Back to homepage</a>
</body>
</html>
