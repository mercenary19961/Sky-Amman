# Sky Amman - Project Context

> Quick reference for AI assistants and developers

---

## Project Overview

**Company:** Sky Amman
**Industry:** Real estate consultancy — buy / rent / build / invest in Amman
**Type:** Corporate company profile website with admin CMS
**Stack:** Laravel 12 + Inertia.js + React 19 + TypeScript + TailwindCSS v4
**DB:** MySQL in production, SQLite in local dev
**Mailer:** Resend (Laravel mail driver via `resend/resend-laravel`)
**Architecture:** Single-service monolith (Laravel serves everything via Inertia) with SSR
**Hosting:** Railway (FrankenPHP) behind Cloudflare (DNS + proxy + Turnstile)
**Branch:** `construction_phase`
**Languages:** English (default) + Arabic (manual toggle, no auto-detect)
**Theme:** Light only — no dark mode

---

## Reference Project

The user previously shipped **Nuor Steel** with the same stack. It lives at `c:\Users\sabba\Desktop\projects\nuor-steel\`. When in doubt about a pattern (locale middleware, HandleInertiaRequests shared props, Turnstile wiring, admin layout, Site Content CRUD, UndoService, security headers, Cloudflare trustProxies CIDR list), read the corresponding file in nuor-steel first.

Nuor Steel's `CLAUDE.md` is large (~44k tokens) — read targeted sections via Grep / `offset`+`limit`, never the whole file.

---

## Public Pages (in nav order)

1. **Homepage** — content via `site_content` + Project Showcase carousel pulling from `projects` table
2. **Properties** — listings page, pulls from `projects` filtered by `category`. Filter pills (Projects Under Development / Ready / Investment Opportunities) toggle the category filter.
3. **Investment** — **content-only editorial page** (NOT a listings page). Explains why to invest in Amman, with CTAs. **⚠️ Temporarily hidden from the public nav (2026-06-03) — see Build Progress for how to relist.**
4. **Self Build** — **content-only service page**. Renders a 7-step Process Flow timeline (Land Selection → Legal Verification → Engineering Design → Specifications → Execution → Documentation → Handover) from `site_content` rows.
5. **Security with Sky Amman** — content-only page (financial + legal + construction safety bullets).
6. **About Us** — content-only.
7. **Contact Us** — form-based, single contact submission inbox.

All **lead** forms across the site funnel into a **single Contact Submissions inbox**. A "Contact about this project" CTA on a Property detail page pre-fills the form and stamps `project_id` so the admin sees inquiries-per-project. **Footer newsletter (2026-05-31):** the Footer Subscribe widget is wired — it POSTs to `/newsletter` ([NewsletterController](app/Http/Controllers/NewsletterController.php), Turnstile-gated, rate-limited) and stores the email in the `newsletter_subscribers` table. It's **capture-only** — no campaign/sending system, no admin inbox screen yet (read the table directly if needed).

---

## Database Schema

After reconciling the Figma frames during foundation phase, three originally-planned tables collapsed into one. **Don't try to "fix" this back to separate tables** — the unified shape is honest to the actual UI.

### Tables

- **`users`** — adds `role` enum (admin|editor) + `is_active`
- **`media`** — uploads, soft-deleted, physical file preserved on soft-delete (only force-delete removes the file)
- **`pages`** — one row per public page (7 rows). Holds page-level SEO + master visibility toggle.
- **`site_content`** — bilingual key-value rows keyed by `(page, section, key)`. Optional `media_id` (image-aware), `is_visible` (section-level show/hide), `type` enum (text/textarea/html).
- **`settings`** — key/value with `type` (text/textarea/email/url/number/boolean/json) + `group` for admin grouping.
- **`projects`** — **unified listings table.** `category` enum (`under_development | ready | investment_opportunity`) drives the homepage Project Showcase filter pills. `listing_status` enum (`for_sale | for_rent | sold | reserved`) drives the badge on the card. Detail-page fields (`area_sqm`, `completion_year`, `floors`, `bedrooms`, `bathrooms`) all nullable so investment opportunities + land plots leave them empty. Has per-listing SEO + soft-deletes.
- **`project_images`** — sortable gallery, FK to `projects` + `media`.
- **`contact_submissions`** — single inbox for ALL public forms. Optional `project_id` FK for per-listing inquiries. `request_type` enum: `buy | rent | build | investment | general`. Soft-deleted, has `ip_address` for forensics.
- **`change_logs`** — Undo/Revert system (built — snapshot-based, see innovation #23).

### Tables added after foundation (CMS-managed home/about content)

These back the admin "Content" sidebar group and replaced what were originally hardcoded/seeded-only homepage components.

- **`testimonial_videos`** (migration `2026_06_01_000001`) — homepage testimonial video carousel. `title`, `url` (YouTube/Vimeo/mp4 URL — no file upload, Railway FS is ephemeral), `sort_order`, `is_active`, soft-deleted. Admin: **Testimonial Videos**.
- **`testimonials`** (migration `2026_06_07_000001`, primary-lang made nullable in `…000004`) — homepage client testimonial cards. Bilingual `name_en/ar` + `quote_en/ar`, `media_id` (uploaded photo via `Media`), `sort_order`, `is_active`, soft-deleted. **Bidirectional language fallback** (an AR-only card still renders in EN and vice-versa). Admin: **Testimonials**.
- **`department_members`** (migration `2026_06_07_000003`) — homepage "Head of Departments" cards. Bilingual `name_en/ar` + `role_en/ar`, `media_id` photo, `sort_order`, `is_active`, soft-deleted. Admin: **Head of Departments**.
- **`managed_images`** (migration `2026_06_07_000006`) — **admin-replaceable image slots** (key → `media_id`). A small registry (`ManagedImage::SLOTS`) maps each known structural-image slot to a committed default path; an upload overrides it without a redeploy. Currently the 3 About-page "Crafted" cluster images. Admin: **Page Images**. See innovation #24.
- **`gallery_images`** (migration `2026_06_07_000007`) — editor uploads for the public Properties "Projects Gallery" pool. `media_id`, `sort_order`. Pooled with images from **sold** projects + shuffled each visit; per-image hide via the `gallery_hidden` setting; tile count via `gallery_count`. Admin: **Projects Gallery**. See innovation #25.
- **`newsletter_subscribers`** (migration `2026_05_31_000001`) — footer newsletter capture (email only). No admin UI.
- **`projects.hidden_specs`** (migration `2026_06_07_000005`, nullable JSON array) — per-project list of spec keys to hide on the public detail page (e.g. `["bedrooms","bathrooms","land_area_sqm"]`). Admin toggles each spec's visibility on the project form. Used to store-but-hide the Dabouq villas' 4 bed / 3 bath until the client approves.

### Schema decisions to remember (for future agents)

- **Why `projects` is unified** — the Figma showed Property cards and Investment Opportunities cycling through one carousel with filter pills. The original CLAUDE.md plan had three separate tables; collapsing was the right call.
- **`investment_opportunities` table doesn't exist** — investment is a **category** on `projects`. The `/investment` page is editorial content via `site_content` only.
- **`self_build_packages` table doesn't exist** — Self Build is a service page. The 7 process-flow steps are 7 `site_content` rows under `page='self_build', section='process'`.
- **`floors` + `completion_year`** are on `projects` (caught from the DABOUQ 5 - VILLA D detail frame, not in the original plan).
- **`projects.group`** (nullable string, migration `2026_06_01_000002`) — a development/compound label (e.g. "Dabouq 7") that backs the Properties page's sale-side group sub-filter chips (innovation #17). Still seed-only (no admin-form field yet); set to "Dabouq 7" on every real villa.
- **Two area fields** (2026-06-10): `area_sqm` now means **Built-up Area** (relabelled "Built-up Area" everywhere in the UI — the column name is kept to avoid a 17-file rename) and **`land_area_sqm`** (nullable int, migration `2026_06_10_000001`) is the **Land/plot Area**. Brochures (e.g. DABOUQ-7) list both. Both are shown on the public card + detail, the admin form (two inputs under Property Specs), and the admin show page. `hidden_specs` accepts `land_area_sqm` too.
- **Real catalogue = DABOUQ-7 + DABOUQ-8 villas** (2026-06-10): the demo Dabouq/Abdoun seed was replaced by the real [`ProjectsSeeder`](database/seeders/ProjectsSeeder.php), built from the client brochures — 18 listings total, both in Dabouq/Amman.
  - **Dabouq 7** (group "Dabouq 7", from `DABOUQ-7 008.pdf`): 8 villas. Villas **3,4,5,7,8** = Ready / for-sale with land+built-up areas; villas **1,2,6** = sold (no areas). Each ships a committed render gallery `public/images/projects/dabouq-7-villa-{n}/NN.webp` (4–12 webp, from the client's OneDrive renders).
  - **Dabouq 8** (group "Dabouq 8", from `brochure دابوق8.pdf`): premium 18-villa development, **10 detailed** (villas 1–10), all **Under Development** / for-sale with land+built-up areas + per-villa marketing taglines as descriptions. **No render set yet** — the brochure layers/clips its renders and villas 6–9 have no exterior pages, so auto-extraction wasn't reliable; they show the placeholder until a OneDrive photo set is wired in like Dabouq 7.
  - All villas: 2 floors, **4 bed / 3 bath stored but HIDDEN via `hidden_specs`** (admin reveals later), completion year blank. Every villa carries a shared **`map_embed_url`** (migration `2026_06_10_000002`, nullable) pointing at the Dabouq site (coords 31.981243, 35.795491) — the property detail page prefers `project.map_embed_url` over the site-wide `google_maps_embed_url` setting. The seeder force-removes any stale/demo projects not in the catalogue (detaching their inquiries first).
- **`Project::displayImageUrls()`** — the single source for a project's display images, in order: (1) uploaded gallery Media (via `cardImageUrls()`, featured/OG first); (2) a committed gallery **folder** `/images/projects/{slug}/NN.webp`; (3) a single committed render `/images/projects/{slug}.(webp|svg)`; (4) `/images/projects/placeholder.svg`. Used by the public card carousel/detail/homepage **and** the admin list/show, so seeded render galleries show everywhere (card swiper + detail lightbox) without Media rows — which wouldn't persist since `storage/app/private` is gitignored. Admin uploads (Media) always take precedence over the committed folder.

---

## Architecture Patterns (MUST FOLLOW)

These patterns are proven from Nuor Steel. Follow them exactly.

### Inertia.js
- Controllers use `Inertia::render('Page/Name', [...props])` — no API routes
- Mutations use `router.post/put/delete()` with `preserveScroll`, `onSuccess`, `onFinish`
- Forms with files: use native `FormData` + `forceFormData: true`
- Routing is server-driven via `routes/web.php` — no client-side router
- Auth state: `usePage<PageProps>().props.auth.user` (shared by middleware)
- Site settings: `usePage<PageProps>().props.siteSettings` (shared by middleware)
- `PageProps` interface needs `[key: string]: unknown` for Inertia compatibility
- Inertia `router.post/put` requires `as any` cast for TS interfaces (lack index signatures for `RequestPayload`)
- Flash messages: server `->with('success', '...')` → client reads via `usePage().props.flash`. `ToastContext` auto-shows them.

### CSRF / Session Handling (CRITICAL)
- Global `router.on('httpException')` handler in [resources/js/app.tsx](resources/js/app.tsx) auto-reloads on 419. **Note:** Inertia v3 renamed v2's `'invalid'` event to `'httpException'`; same payload shape (`event.detail.response.status`).
- Language/locale toggle uses POST (CSRF-protected) — the 419 handler ensures graceful recovery
- Production MUST use `SESSION_DRIVER=database` (Railway's filesystem is ephemeral)

### Bilingual Content (EN/AR)
- Locale lives in the **server session** as the single source of truth. **No localStorage anywhere.**
- [LanguageContext](resources/js/contexts/LanguageContext.tsx) seeds from `usePage().props.locale` on hydrate, then issues a `fetch POST /locale/{lang}` (NOT an Inertia visit) to update the session on toggle.
- [SetLocale](app/Http/Middleware/SetLocale.php) middleware reads `session('locale', 'en')` and calls `app()->setLocale()`.
- **Instant language switching pattern:** Pass BOTH locales from controller, let client pick:
  ```php
  // Controller: pass both
  'content_en' => SiteContent::getPage('home', 'en'),
  'content_ar' => SiteContent::getPage('home', 'ar'),
  ```
  ```tsx
  // Component: pick based on client language
  const { language } = useLanguage();
  const content = language === 'ar' ? content_ar : content_en;
  ```
- Apply this pattern to ALL public page controllers
- **CMS content always wins over i18n fallbacks.** Pattern: `content?.section?.key || t('fallback.key')`
- When changing display text: update BOTH i18n files AND `SiteContentSeeder`, then re-run seeder
- RTL: use CSS logical properties (`text-start`, `ms-0`/`me-auto`, `ps-4`/`pe-4`), NOT `text-left`/`flex-end` overrides. Tailwind compound variants like `lg:rtl:items-end` don't work reliably in v4.
- Admin panel is **English only** — no AR toggle in admin UI.

### Theme
- **Light only.** Do not write `dark:` Tailwind variants. Do not create a `ThemeProvider`. No localStorage theme key.
- Brand colors via Tailwind v4 `@theme` tokens in [resources/css/app.css](resources/css/app.css):
  `--color-primary` (sky blue #94C4EE), `--color-primary-deep` (#78AFCE — used for footer / dark sections), `--color-primary-dark` (#5C92B8), `--color-primary-light` (#C8DEF1), `--color-surface`, `--color-surface-muted`, `--color-ink`, `--color-ink-muted`.
- Fonts: `Outfit` (Latin / EN) + `IBM Plex Sans Arabic` (AR), both loaded from Google Fonts via `<link rel="preconnect">` in [resources/views/app.blade.php](resources/views/app.blade.php). RTL font swap via `html[dir="rtl"] body` selector.
- Custom keyframes in [resources/css/app.css](resources/css/app.css): `toast-slide-in` for ToastContext. The Footer cloud layers no longer drift — they slide in once on scroll via framer-motion `whileInView` instead (see Footer innovation note).

### File Storage
- Use [`Media::storeFile()`](app/Models/Media.php) — randomizes filename, stores under `storage/app/private/media/{folder}/`, creates the model row. Never bypass.
- Validate file types server-side using BOTH extension AND MIME type
- Public media served via signed/scoped controller route, NOT direct public access
- **SVG uploads excluded from public media-serving allowlist** (SVGs can carry inline scripts)
- Soft-deleted media keeps the physical file. Only `forceDelete()` removes it.
- For ephemeral hosting: use deterministic filenames for seeded files and commit to git
- Document PDFs (if any): track in git via `.gitignore` exceptions in `storage/app/private/.gitignore`

### Deployment (Railway + Cloudflare)
- Railpack builder with PHP 8.2 + Node 22
- Startup: `migrate --force` → `storage:link` → `optimize:clear` → `optimize` → FrankenPHP
- **Do NOT override with Custom Start Command** — it replaces the entire Railpack startup
- **Use data migrations (not seeders) for essential production data** — seeders don't run automatically on Railway
- `trustProxies(at: ...)` in [bootstrap/app.php](bootstrap/app.php) is **locked to Cloudflare published CIDRs (IPv4 + IPv6) + RFC 1918** (Railway internal hop). Never use wildcard `*` — it allows X-Forwarded-For spoofing.
- Set `SESSION_DRIVER=database` in Railway env variables
- Ephemeral filesystem: media files created at runtime are lost on redeploy — use git-tracked paths for seeded media
- FK constraint warning: seeders/migrations referencing `created_by => 1` fail if users table is empty. Use `null` for nullable FK columns in data seeds.
- Cloudflare cache: static assets are keyed WITHOUT query strings, so `?v=X` does NOT bust edge cache — use Cloudflare dashboard's Custom Purge by URL when verifying new content.

#### Switching to the client's custom domain (checklist)

When the site moves from `sky-amman-production.up.railway.app` to the client's real domain, update only these — **the SSR service needs NO changes** (its `INERTIA_SSR_URL` points at the Railway **private internal** domain `skyammanwebsite.railway.internal:13714`, derived from the SSR service *name*, not from any public/custom domain; the Node sidecar never reads `APP_URL`):

1. **`APP_URL=https://<client-domain>`** on the **main** `Sky-Amman` service — drives canonical tags, `og:url`, `sitemap.xml` URLs, the `robots.txt` `Sitemap:` line, hreflang alternates, emailed reset links, and `asset()` URLs. Baked by `config:cache`, so **redeploy the main app** after changing it. Keep `https://` (pairs with `URL::forceScheme('https')`).
2. **Turnstile keys** (`TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY`) on the main app — Turnstile keys are **domain-bound**; mint new ones for the client's domain in Cloudflare and swap them in.
3. **`og_image_url`** (Admin → Settings → SEO; a DB setting, NOT an env var) — set to the absolute URL on the new domain, e.g. `https://<client-domain>/images/og-image.png`.
4. **Resend** (when email is un-postponed): `MAIL_FROM_ADDRESS` on the new domain + DKIM/SPF/DMARC verification for that domain.
5. **Cloudflare**: add the custom domain, point DNS at the Railway edge, proxy on.

| Variable / setting | Change for new domain? |
|---|---|
| `INERTIA_SSR_URL`, `INERTIA_SSR_ENABLED`, SSR start cmd / port | ❌ No (internal Railway networking) |
| `APP_URL` (main app) | ✅ Yes → **redeploy main app** |
| `TURNSTILE_*` (main app) | ✅ Yes (domain-bound keys) |
| `og_image_url` (DB setting) | ✅ Yes |
| `MAIL_FROM_ADDRESS` + DNS (Resend, when live) | ✅ Yes |

### SSR Sidecar (Railway) — production SSR (LIVE 2026-06-23)

SSR is served by a **second Railway service** ("SSR Service", same repo/branch, identical Railpack build) — only its start command differs.

- **Start command (SSR service only):** `node bootstrap/ssr/ssr.js`. ⚠️ The "don't override the Custom Start Command" rule above is for the **main** app; the SSR service *must* override it (it should run only Node, not migrate/FrankenPHP).
- The sidecar listens on **port 13714** (Inertia default, hardcoded via `createServer` in [resources/js/ssr.tsx](resources/js/ssr.tsx)) and exposes only a **private** domain `skyammanwebsite.railway.internal` (no public domain).
- **Main `Sky-Amman` service env:** `INERTIA_SSR_ENABLED=true` + `INERTIA_SSR_URL=http://skyammanwebsite.railway.internal:13714`. (These go on the MAIN app, not the sidecar.)
- **Graceful fallback:** [app/Ssr/TimeoutHttpGateway.php](app/Ssr/TimeoutHttpGateway.php) — bound over Inertia's stock gateway in [AppServiceProvider](app/Providers/AppServiceProvider.php) — adds connect/response timeouts (`INERTIA_SSR_TIMEOUT=3`, `INERTIA_SSR_CONNECT_TIMEOUT=2`) so a hung/unreachable sidecar falls back to client rendering instead of blocking until Railway's ~15s proxy 502s the whole site. `config/inertia.php` is published with `INERTIA_SSR_ENABLED` defaulting to **false** (SSR off locally / opt-in).
- **⚠️ Gotcha 1 — `node: command not found` at start (Railpack ≥ v0.30.0):** newer Railpack treats Node as a build-only tool and **prunes the `node` binary from the FrankenPHP runtime image** (its deploy merge drops `$packages:mise`). Fix: set **`RAILPACK_DEPLOY_APT_PACKAGES=nodejs`** on the SSR service — installs Debian's Node 18 into the runtime (it provides the `node` command). (Older Railpack kept `$packages:mise` in the merge, which is why HardRock's sidecar ran without this.)
- **⚠️ Gotcha 2 — hostname match + `config:cache` timing:** `INERTIA_SSR_URL`'s host must equal the SSR service's **private domain** exactly (Railway derives it from the service name — confirm under SSR service → Settings → Networking → Private Networking; ours is `skyammanwebsite`, NOT `sky-amman-ssr`). The value is baked at build time by `php artisan config:cache`, so the **main app must redeploy** after the URL is set/changed. A wrong host fails silently → CSR fallback.
- **Verify in prod:** `curl -s https://<domain> | wc -w` jumps from ~1.4k (CSR) to ~4.4k (SSR); `<div id="app">` is filled and `<head>` carries the per-page `og:title`/`description`/`canonical`. The SSR service Deploy Logs should show `Inertia SSR server started.`
- **Local SSR test:** `INERTIA_SSR_ENABLED=true` + `php artisan inertia:start-ssr` in a second terminal (after `npm run build`). Day-to-day dev needs no SSR.

### Mail (Resend)
- **⚠️ Outbound email is POSTPONED (2026-06-06) — no mail is actually sent yet.** The app currently runs on `MAIL_MAILER=log` (no `RESEND_API_KEY`, `from=hello@example.com` placeholder), so every email — **password-reset links, contact-form lead notifications** — is written to `storage/logs/laravel.log` instead of being delivered. This is intentional until deployment. The code is provider-agnostic and complete; **nothing in the app needs changing to "turn it on"** — it's purely env + DNS config at go-live:
  1. Set `MAIL_MAILER=resend` + a valid `RESEND_API_KEY` (note: `RESEND_API_KEY`, not `RESEND_KEY`)
  2. Set a real `MAIL_FROM_ADDRESS` on the SkyAmman domain (not `example.com`)
  3. **Verify the sending domain in Resend (DKIM + SPF + DMARC DNS records)** — required for inbox delivery to Gmail/Outlook; without it external mail is rejected or spam-foldered
  4. Also set `APP_URL` to the real origin so emailed links (e.g. the reset URL) have the correct host
  - **To test the reset/contact flows before then:** trigger the action and read the email + any link from `storage/logs/laravel.log`. Note the forgot-password flow only generates mail for an email that matches an **existing** user (generic response otherwise — anti-enumeration). Creating a user sends **no** email (admin-set password, no invite flow).
- `MAIL_MAILER=resend`, `RESEND_API_KEY` in env (NOTE: it's `RESEND_API_KEY`, not `RESEND_KEY`)
- `resend/resend-laravel` package auto-registers a `/resend/webhook` route
- In dev, default `MAIL_MAILER=log` — emails write to `storage/logs/laravel.log` so you don't need a real Resend key
- Sending domain DNS-verified before go-live (DKIM, SPF, DMARC) — planned during deployment
- All transactional mail goes through Mailable classes, queued via `ShouldQueue` if volume warrants
- Plain-text + HTML templates for every Mailable

### Auth
- Session-based authentication (not Sanctum API tokens)
- Never use `auth()` helper — always use `Auth::id()` / `Auth::user()` via `use Illuminate\Support\Facades\Auth`
- Admin routes behind `auth` middleware, admin-only routes behind `admin` middleware
- Login throttle: **per-email rate limit (5 attempts / 15 min) layered on top of route-level per-IP `throttle:5,1`** — covers both IP rotation and email fanning
- Turnstile is verified BEFORE `Auth::attempt` so bots can't burn the per-email throttle budget
- 750ms `usleep` on every failed attempt — slows brute force without annoying real users
- `is_active` check post-login (deactivated accounts get logged out + throttle hit)
- Rate-limit ALL public POST endpoints (contact form)
- **Password policy** centralized in [AppServiceProvider](app/Providers/AppServiceProvider.php) `Password::defaults()`: min 10, mixed case, number, symbol, `uncompromised()` (HIBP breach check — fails open offline). Applies to admin user create/edit + password reset. UI helpers in [Components/Admin/PasswordField.tsx](resources/js/Components/Admin/PasswordField.tsx) (show/hide, generator, copy, live checklist + strength meter, match indicator).
- **Forgot/Reset password** (Laravel broker, `password_reset_tokens` table, 60-min expiry): `GET|POST /admin/forgot-password` → [ForgotPasswordController](app/Http/Controllers/Auth/ForgotPasswordController.php) (Turnstile-gated, `throttle:5,1`, **generic response — no user enumeration**); reset-link URL is repointed to the Inertia page via `ResetPassword::createUrlUsing` in AppServiceProvider (`/admin/reset-password/{token}?email=…`). `GET|POST /admin/reset-password` → [ResetPasswordController](app/Http/Controllers/Auth/ResetPasswordController.php) (new password uses `Password::defaults()`, set as plain + hashed by the model cast, rotates `remember_token`). Pages: [ForgotPassword.tsx](resources/js/Pages/Admin/ForgotPassword.tsx) + [ResetPassword.tsx](resources/js/Pages/Admin/ResetPassword.tsx) (reuses `PasswordField`); "Forgot password?" link on the Login page. Mail via Resend (logs to `laravel.log` in dev — set `APP_URL` to the dev origin so the logged link has the right host/port).

### Security
- Server-side validation on ALL endpoints (client-side for UX only)
- Sanitize user content with `strip_tags` before storage
- Validate file types server-side using BOTH extension AND MIME type (`mimes:pdf|mime_types:application/pdf`)
- Use parameterized queries / Eloquent (SQL injection prevention)
- Use `rel="noopener noreferrer"` on external links
- Never use `dangerouslySetInnerHTML` with unsanitized data
- Never expose internal paths, stack traces, or passwords in responses
- Return consistent error shapes (don't leak stack traces in production)
- **Cloudflare Turnstile on ALL public POST forms** (Contact, listing-inquiry forms). Server-side verification via [TurnstileVerifier](app/Services/TurnstileVerifier.php); client widget [`<Turnstile>`](resources/js/Components/Public/Turnstile.tsx) exposes `reset()` via `forwardRef` for re-arming after a failed submission (single-use token semantics). Renders nothing when `TURNSTILE_SITE_KEY` is empty — server-side gate is also disabled, so the form keeps working in dev.
- CSP rebuilt in [SecurityHeaders](app/Http/Middleware/SecurityHeaders.php) middleware: explicit allowlist for Turnstile (`challenges.cloudflare.com`), Cloudflare Insights (`static.cloudflareinsights.com` + `cloudflareinsights.com`), Google Fonts, LinkedIn + Instagram embeds, Google Maps. CSP **skipped in local dev** (`if (!app()->isLocal())`) — Vite's bracketed IPv6 HMR origin breaks Chrome's CSP parser.
- Permissions-Policy includes `xr-spatial-tracking=()` to suppress noisy violation logs from third-party iframes.
- For any URL stored in admin (e.g. social links): parse `host` + `scheme`, don't substring-match (rejects `evil.com/?x=goodsite.com` style spoofs).

### SEO
- Server-rendered SSR for all public pages (crawlers see real HTML)
- `<Head>` from `@inertiajs/react` for `<title>`, meta description, OG tags per page
- **Per-page + per-listing SEO fields** (seo_title, seo_description, og_image_id) on `pages` and `projects` tables — admin-editable
- `sitemap.xml` route generated dynamically (includes all active projects)
- `robots.txt` allows everything except `/admin/*`
- JSON-LD structured data: `Organization` on Home, `RealEstateListing` on each project detail, `BreadcrumbList` on inner pages
- Hreflang `<link rel="alternate">` tags for EN ↔ AR

---

## Frontend Architecture

- **Framework**: Inertia.js — bridges Laravel controllers to React page components
- **Rendering**: SSR via `@inertiajs/react/server` + `hydrateRoot` on client. SSR + client wrap pages with `LanguageProvider` + `ToastProvider` so SSR markup matches client hydration.
- **Data flow**: Controllers pass data as props via `Inertia::render('Page/Name', [...props])`
- **Styling**: TailwindCSS v4 (`@import 'tailwindcss'`) with custom `@theme` tokens, Outfit (EN) + IBM Plex Sans Arabic (AR), light theme only
- **Icons**: `lucide-react` for generic UI icons. **NOT for brand icons** — see Foundation Gotchas below.
- **Animations**: framer-motion (used by [AssurancePillars](resources/js/Components/Home/AssurancePillars.tsx) for scroll-driven scrollytelling — pinned section with orbital arc transitions between three pillars; single-flight transition gate to prevent overlapping animations on fast scroll)
- **i18n**: react-i18next with EN/AR translation files (bundled, not HTTP-loaded). Init at 'en'; `LanguageContext` drives `i18n.changeLanguage()` post-hydrate based on session locale.
- **Build**: `npm run build` runs both client AND SSR (`vite build && vite build --ssr`). Outputs client to `public/build/`, SSR to `bootstrap/ssr/`.
- **SSR safety**: All `window`/`document`/`localStorage` access guarded with `typeof window !== 'undefined'`

---

## Key File Locations

```
resources/js/Pages/Public/         → Public page components (Home.tsx, Properties.tsx)
resources/js/Pages/Admin/          → Admin page components (Login.tsx, Dashboard.tsx)
resources/js/Layouts/              → PublicLayout, AdminLayout
resources/js/Components/Layout/    → Header (transparent + color-aware), Footer (4-col flex columns + Figma Group 27 photo hero), AdminSidebar, SocialIcons (inline brand SVGs — no longer used by Footer but kept for future use)
resources/js/Components/Home/      → HomeHero, InvestmentBanner, AssurancePillars (scrollytelling), ProjectShowcase, ValueProposition, MediaRoom, LocationMap
resources/js/Components/Public/    → Turnstile widget (and future shared public components)
resources/js/types/                → PageProps, User, SiteSettings, Flash interfaces (index.ts) + per-page prop types (home.ts: HomePageProps, FeaturedProject, SiteContentBundle)
resources/js/i18n/                 → en.ts, ar.ts, index.ts (i18next init)
resources/js/contexts/             → LanguageContext, ToastContext (no ThemeContext)
resources/js/lib/                  → cn helper (clsx + tailwind-merge)
resources/js/app.tsx               → Client entry — wraps with Providers, hydrateRoot/createRoot, 'httpException' (419) handler, v3 resolver unwrap
resources/js/ssr.tsx               → SSR entry — same provider tree as client, same v3 resolver unwrap
resources/js/bootstrap.ts          → axios global setup
resources/views/app.blade.php      → Root Blade template (@inertia, @vite, lang/dir on <html>, Google Fonts preconnect for Outfit + IBM Plex Sans Arabic)
resources/css/app.css              → Tailwind import + @theme tokens + RTL font swap + toast-slide-in keyframe

public/images/home/                → Seeded SVGs (buy-early-strip) + Figma-exported footer assets (footer-villa-photo.png, footer-clouds-1.png, skyamman-logo-large.png, checkbox-outline.svg) + hero render (hero-villa-trimmed.webp — the cropped 1280×443 version is what the page actually loads; original 1280×744 hero-villa-photo.webp + legacy hero-villa.svg placeholder kept around but unreferenced)
public/images/projects/            → Seeded SVGs: dabouq-3..6 (placeholder renders until Media Library is live)

app/Models/                        → User, Page, SiteContent, Media, Setting, Project, ProjectImage, ContactSubmission, ChangeLog, Testimonial, TestimonialVideo, DepartmentMember, ManagedImage, GalleryImage
app/Http/Controllers/              → HomeController (homepage with both EN/AR content bundles + featured projects + media embeds), PropertiesController (public Properties listings page — EN/AR bundles + all active projects incl. `group`), LocaleController (POST /locale/{lang})
app/Http/Controllers/Auth/         → LoginController (login/logout + per-email throttle)
app/Http/Middleware/               → HandleInertiaRequests, SetLocale, SecurityHeaders, AdminMiddleware
app/Services/                      → TurnstileVerifier
app/Mail/                          → Mailable classes (none yet)

database/migrations/2026_04_26_*   → 9 foundation migrations
database/seeders/                  → AdminUserSeeder, DefaultSettingsSeeder, PagesSeeder, SiteContentSeeder, ProjectsSeeder, DatabaseSeeder

routes/web.php                     → All routes (public + admin)
bootstrap/app.php                  → Middleware registration, trustProxies CIDRs, admin alias
config/services.php                → Resend + Turnstile config
.npmrc                             → production=false (overrides shell-level NODE_ENV=production)
```

---

## Code Quality Rules

- If a model has a dedicated method (e.g. `Setting::set()`, `Media::storeFile()`), **always use it** — never bypass with raw `::update()` or `::create()` queries
- When the same data is written in multiple places (create, update, restore), all paths must go through the same model method
- Never query inside a loop (`foreach` + `::where()->first()`) — batch-fetch with `whereIn()` or `pluck()` before the loop
- For paginated views, only query related data for the current page's IDs, not the entire table
- Guard against no-op operations — short-circuit early if nothing changed
- Restore/undo operations must use the same model methods as normal updates
- If a service method returns a meaningful value (bool, count, status), **always use it** — don't call-and-ignore

---

## Admin Panel

Single-language (English), single-theme (light). Sidebar groups mirror Nuor Steel's pattern.

### Sidebar structure (current)

**Overview**
- Dashboard

**Content**
- Site Content (bilingual side-by-side EN/AR key-value editor — **text only, no image picker**)
- **Testimonial Videos** — homepage video carousel (title + URL, reorder, publish/active toggle, soft-delete + revert)
- **Testimonials** — homepage client cards (bilingual name + quote, photo upload, reorder, active toggle, char counters)
- **Head of Departments** — homepage team cards (bilingual name + role, photo upload, reorder, active toggle)
- **Page Images** — swap committed structural images per `ManagedImage::SLOTS` (currently the 3 About "Crafted" images); reset → committed default (innovation #24)
- **Projects Gallery** — manage the public Properties gallery pool: upload editor images + per-image hide toggle across sold-project + uploaded images + tile-count setting (innovation #25)

**Business** (CRUD listings)
- **Projects** — single unified CRUD (gallery upload + reorder + delete, category, listing_status, location, area, bedrooms, bathrooms, floors, completion_year, per-listing SEO with OG image picked from gallery, inquiries counter). **All admin-controlled imagery lives here.**

**Communication**
- Contact Submissions (single inbox, optional project linkage)

**System**
- Settings (admin-only) — contact info, social links, default SEO meta, lead routing map, site-wide OG defaults (URL field)
- Users (admin-only) — admin / editor roles
- Change Log + Undo (admin-only) — built; snapshot-based with per-entry revert + one-shot Undo toast (innovation #23)

**Image strategy:** Page-structural / decorative imagery (`hero-villa`, `footer-villa-photo`, `footer-clouds-1`, `skyamman-logo-large`, `buy-early-strip`, etc.) stays committed under [public/images/home/](public/images/home/) — code-managed by default. There is **no standalone Media Library** in the sidebar. Project gallery uploads use [`Media::storeFile()`](app/Models/Media.php) inside the project edit form. **Exception (2026-06-07): the "Page Images" section** lets editors override *registered* structural slots (`ManagedImage::SLOTS` — currently the 3 About "Crafted" images) with an upload, falling back to the committed default otherwise — so a slot stays code-managed until someone explicitly swaps it (innovation #24). The `site_content.media_id` and `pages.og_image_id` columns remain in the schema as nullable but stay unused (cheap optionality if the policy ever changes).

### Admin roles

- **Admin**: Full access (users, settings, change log)
- **Editor**: Content management only (no users / settings / change log). The `adminOnly` flag on sidebar items hides them from editors.

### Innovations (vs. Nuor Steel)

These extend the Nuor playbook for real-estate-specific needs.

1. **Text-only Site Content editor** — `site_content` is bilingual key-value rows with per-row visibility. The schema has an optional `media_id` FK (carried over from initial design) but the admin UI does **not** expose it: structural/decorative imagery is code-managed under `public/images/home/`, not CMS-managed.
2. **SEO per page + per project** — every public page (via `pages` table) and every project (via `projects` table) has editable `seo_title_en/ar`, `seo_description_en/ar`. OG image policy is split: **per-project OG is picked from the project's own gallery** (no separate upload step), while site-wide and per-page OG are plain URL fields (paste a hosted/CDN image URL). Defaults fall back to site-wide Settings.
3. **Lead routing by request type** — Contact form has a `request_type` enum (Buy / Rent / Build / Investment / General). Settings page maps each type → recipient email(s) via the `lead_routing` JSON setting. The Mailable picks recipients dynamically at send time.
4. **Per-project inquiries** — Contact submissions can carry an optional `project_id` FK. "Contact about this project" CTAs pre-fill the form. Admin project listings show an inquiries count badge per row.
5. **Section show/hide toggles** — `site_content` rows have an `is_visible` boolean. The admin Site Content editor exposes per-section toggles ([Content.tsx](resources/js/Pages/Admin/Content.tsx) — `toggleSection`) which, on save, set `is_visible` on every row of that section. Public-side enforcement lives in [Pages/Public/Home.tsx](resources/js/Pages/Public/Home.tsx) via a `sectionVisible(section)` predicate that returns `false` when every row in the section is hidden (defaults to `true` for unseeded sections so missing CMS rows don't accidentally hide code-only UI). Each of the 12 section renders is wrapped in `{sectionVisible(content.X) && <Section />}`. **Note (2026-05-23):** this enforcement only landed for the homepage so far — when building out the other 6 public pages, repeat the pattern there. Page-level visibility (entire page hidden) lives on `pages.is_visible`.
6. **Color-aware transparent navbar (with scroll-hide and conditional gradient)** — [Header](resources/js/Components/Layout/Header.tsx) is `position: fixed` and overlays section content. Sections opt into a navbar tone by setting `data-nav-bg="dark"` (or `"light"`) on their root element. The header samples the section currently overlapping its centerline (32px down) on scroll/resize and swaps logo + link + toggle colors accordingly. Adding a section with a dark hero? Add `data-nav-bg="dark"` to its wrapper. Pages without a top hero must add their own top padding for the navbar height. **Hide on scroll down, reveal on scroll up** is a separate `useEffect` tracking `lastY` with a `SCROLL_DELTA=6` jitter floor and a `TOP_THRESHOLD=80` always-visible band near the top of the page (also handles overscroll bounce); the slide-out is a single transform class swap (`-translate-y-full` ↔ `translate-y-0`) with a 300ms CSS transition — no framer-motion dep needed. **Backdrop gradient** for visual separation on light sections is rendered as an absolute child div with `bg-linear-to-b from-primary to-white` and opacity tied to `isDark` (fades to 0 over `data-nav-bg="dark"` sections so the hero's own gradient stays clean, fades to 1 on light sections). Layering it as a separate element lets opacity transition smoothly between section types; the foreground row needs `relative` to stack above it.
7. **Health badges with deep-link Fix → links** — Dashboard surfaces content gaps (missing project gallery images, **incomplete SEO**, hidden pages/sections, unset social URLs, missing IG Graph API creds). Every "Fix" link carries a `#section-X` hash. **SEO coverage (2026-06-06):** a shared `$seoGaps` closure in [DashboardController](app/Http/Controllers/Admin/DashboardController.php) reports which of the four SEO fields (`seo_title_en/ar`, `seo_description_en/ar`) are empty, applied to **both pages and projects** — `pagesMissingSeo` (visible pages, footer excluded → Fix opens `/admin/content#{slug}`) + `projectsMissingSeo` (active projects → Fix opens `/admin/projects/{id}/edit#section-seo`), each rendered by the `SeoHealthList` component which lists the missing fields inline. A separate **`projectsMissingOg`** badge flags active projects with a null `og_image_id` (per-project OG is picked from the gallery — empty = no social preview image). Site-wide SEO **defaults** (title/description EN+AR + `og_image_url`) are validated on the **Settings** SEO card warning (`Defaults missing: …`), not the Dashboard. The **Content editor** per-page accordion badge mirrors the same four-field check (`No SEO` when all empty, `SEO incomplete` otherwise, with a `title=` listing the gaps; footer excluded). All three checks were title-EN-only before 2026-06-06. Edit pages read the hash in `useEffect` on mount and call `scrollIntoView({ behavior: 'smooth' })`; the Site Content accordion additionally `setExpandedPage(slug)` so the hash both opens the correct page AND scrolls to it (200ms delay to let the accordion DOM expand first). Settings page has `id="section-{group}"` on each group card; project Form has `id="section-seo"` / `id="section-gallery"`. **The social-URL warning's `$socialKeys` array** (in [DashboardController.php](app/Http/Controllers/Admin/DashboardController.php)) mirrors the Footer's "Follow us" column — currently 4 platforms (`linkedin_url`, `facebook_url`, `youtube_url`, `instagram_url`). X (Twitter) and TikTok were removed from the footer (2026-06-21); if you ever add a new platform to the footer, also add its settings key here. **Separate IG creds badge** ("Media Room IG Grid Disabled") fires when `instagram_access_token` or `instagram_user_id` is empty — without those, the Media Room's 3×3 grid silently hides.
8. **Collapsible sidebar + mobile slide-in (ported from Nuor)** — Desktop chevron toggles between full-width (`w-64`) and icon-only (`w-16`); state persists across Inertia visits via a module-level `globalSidebarCollapsed` in [AdminLayout.tsx](resources/js/Layouts/AdminLayout.tsx). Mobile renders the sidebar `fixed` off-screen with a backdrop overlay; the layout's hamburger button slides it in. `useEffect` resets mobile state when the viewport hits `lg`. The page-icon next to the title is auto-resolved from a `PAGE_ICONS` URL→icon map in AdminLayout — adding a new admin route doesn't require touching every page component, just append one entry.
9. **`section-x` utility for centralized side-padding** — every public section wrapper (Header, Footer, and all homepage sections) uses the single `section-x` utility defined as `@utility` in [resources/css/app.css](resources/css/app.css). It uses `padding-inline` (RTL-safe) with explicit media queries — `1rem` mobile, `1.5rem` sm, `2rem` lg, `8rem` at the custom `3xl` breakpoint (`1600px`). Edit the four values in one place to change side-padding site-wide. Custom `3xl` breakpoint exists because the user's laptop is exactly `1536px` (Tailwind's `2xl`) and they wanted margin only on anything *larger* than that.
10. **Brand SVG shapes via path/radius literals** — designer-delivered SVGs like `Rectangle 11.svg` (project cards), `Rectangle 22.svg` (value-prop cards), `Rectangle 54.svg` (dept cards), `Rectangle 59.svg` (testimonial cards), `buy-early-strip.svg`, `quote-open.png` / `quote-close.png` etc. live under [public/images/home/](public/images/home/). For simple rounded rects we replicate the shape in CSS (`rounded-[62px]` matches `rx=62.39`) plus the exact fill color (`bg-[#E5EBF0]`) rather than loading the SVG as a background — one fewer HTTP request. For complex shapes (asymmetric corners on the dept card / testimonial card, leaf strip) the SVG itself is the background-image with `aspect-[w/h]` on the wrapper.
11. **State-driven rotating carousel** — [`ProjectShowcase`](resources/js/Components/Home/ProjectShowcase.tsx) is reused for both Properties for Sale and Properties for Rent. Instead of native horizontal scroll, an `activeIndex` state rotates the projects array (`[...projects.slice(activeIndex), ...projects.slice(0, activeIndex)]`) and only the first N are rendered (visible count: 1 on mobile, 2 on tablet, 4 on lg+, derived from a resize listener). `prev`/`next` wrap modularly; `goTo(i)` picks the shorter ring distance so dot clicks feel natural. Each card is wrapped in a `motion.div` with `layout` inside `<AnimatePresence mode="popLayout">` for direction-aware slide transitions on every navigation. Whole row is also a `motion.div drag="x"` so swipe gestures call `next`/`prev` on dragEnd (threshold = `offset + velocity * 0.2 > 60`). To add another carousel, instantiate `<ProjectShowcase title=… ctaLabel=… projects=… />`.
12. **Header logo dual-state** — [Header.tsx](resources/js/Components/Layout/Header.tsx) renders the white PNG logo when `isDark` (over hero / footer overlap) and falls back to a `SkyAmman` text wordmark in primary color on light sections. When the designer delivers a primary-blue logo variant, swap the `<span>` for an `<img src="/images/logo-primary.png">` — TODO comment marks the spot.
13. **Instagram Graph API integration** — [`InstagramService`](app/Services/InstagramService.php) hits `graph.instagram.com/{user_id}/media` (fields: id, caption, media_type, media_url, thumbnail_url, permalink), normalizes the response (video posts fall back to `thumbnail_url`), caches for 1 hour via `Cache::remember`, and returns `[]` gracefully on missing creds / API failure. `HomeController` injects the service and passes `instagramPosts` to the view; `MediaRoom` renders a 3×3 grid linking each thumbnail to its permalink. Admin Settings → Media Room exposes `instagram_access_token` + `instagram_user_id` text inputs (group `media_room`) — the old `instagram_embed_url` iframe URL field was removed once the Graph API replaced the iframe approach. When credentials are empty the Instagram half of MediaRoom hides — no broken iframes, no console errors — and the Dashboard surfaces an amber "Media Room IG Grid Disabled" badge linking back to the Settings card.
14. **Figma-anchored photo composition (Footer)** — when the designer ships an asset-heavy composition where photos overlap and bleed past the frame (homepage [Footer](resources/js/Components/Layout/Footer.tsx) — villa + 2 cloud clusters + SKYAMMAN logo PNG), the source of truth is the Figma frame exported as SVG (`Group 27.svg`, viewBox 1280×753). Each photo's `<rect x y width height>` becomes percentages of a rebuilt hero with `aspect-1280/450 max-h-140 overflow-hidden` — that's the lower ~60% of the SVG frame, since the upper portion is just empty sky behind the column area. Photos that bleed (villa, logo) get **negative** `top` / `left` and oversized `w` / `h`; `overflow-hidden` does the clipping so only the building / the lower lines of the logo show — same effect the designer achieved via photo transparency. The two cloud clusters animate in once on `whileInView` via framer-motion (slide from off-screen on their own side). Pattern: don't eyeball overlapping photo compositions — export the Figma frame to SVG, read the rect geometry as ground truth, translate 1:1.
    Column layout above the hero: a flex row at `lg+` where the Subscribe column gets `lg:flex-1` to absorb the slack so the nav columns hug the right edge. **(2026-06-10)** the unbuilt "Other pages" column was dropped — the footer now shows **Main** (links to real public routes) + **Follow** only; the Subscribe column is a working **newsletter** widget (POSTs to `/newsletter`). The grid is kept 2-col down to the smallest mobile size so the footer never stacks into a tall single column.
15. **Footer copy in the CMS via a layout pseudo-page** — the Footer's editorial strings (newsletter heading + CTA, column headings, copyright, privacy link) are admin-editable through the same Site Content editor admins use for the 7 public pages. The trick: `'footer'` is seeded as an 8th row in the `pages` table even though it has no public URL. [HandleInertiaRequests.php](app/Http/Middleware/HandleInertiaRequests.php) shares `footerContentEn` + `footerContentAr` on **every** request via `SiteContent::getPage('footer', 'en'|'ar')` so the Footer (a layout component on every page) has access. [Footer.tsx](resources/js/Components/Layout/Footer.tsx) wraps the two bundles with `makeFooterText(bundle, t)` — a small CMS-first / i18n-fallback resolver that returns `bundle[section][key].content` when the row is visible & non-empty, otherwise falls back to `t(fallbackKey)`. Nav-link labels and social platform names stay in i18n (structural, not editor copy). The Content editor recognises `'footer'` because it's listed in `PAGE_ORDER` + `PAGE_ICONS` + `PAGE_URLS` ([Content.tsx](resources/js/Pages/Admin/Content.tsx)); its preview iframe points at `/` (admin scrolls down to see footer changes). Same file also carries a `SECTION_LABEL_OVERRIDES` map for friendlier labels (e.g. `value_prop` → "Value Proposition", `assurance_legal` → "Assurance · Legal Pillar", footer's `subscribe` → "Newsletter CTA") so the auto `toLabel(snake_case)` output doesn't read awkwardly. Pattern is reusable for any other shared layout copy that needs admin control without forcing a public route on it.
16. **Trim transparent padding on delivered renders** — designers commonly ship transparent-bg PNGs/WebPs with the subject anchored to one edge and a wide alpha-only safe area around it (3D renders are the worst offenders — a 1280×744 villa render may only have ~440px of visible content with the rest invisible). When the `<img>` box includes that empty alpha, **CSS margins lie** — you set `mt-10` (40px) but the visible gap above the subject is 40 + (transparent area px), which scales with viewport width and is impossible to tune predictably. Fix: trim the source to the visible content's bounding box before using it. For one-offs, `npx sharp` works in this project — `sharp(src).trim({ threshold: 1 }).webp({ quality: 92 }).toFile(out)` detects the alpha bbox and exports the cropped image. The current hero villa (`hero-villa-trimmed.webp`, 1280×443) was produced this way from the designer's 1280×744 source; CSS `mt-X` on the wrapper now maps 1:1 to the visual gap. Keep the original `_photo.webp` around as the un-trimmed master in case the designer revises it. **Heads-up on Windows:** Vite's dev server can hold the original file open under EPERM — output to a sibling filename and update the `src` rather than overwriting in place.
17. **Two-tier Properties filter (listing-type + development group + availability)** — the [Properties page](resources/js/Pages/Public/Properties.tsx) listings filter is modeled on the designer's `PROJECTS SHOWCASE.svg`, then redesigned for clarity. Three control *types*, each visually distinct so users read the interaction correctly: (a) a **segmented control** (sliding `layoutId` indicator) for the mutually-exclusive **For Sale / For Rent** mode; (b) an **on/off switch** for **"Available only"** (so a toggle never looks like a third tab — the original demo's mistake); (c) light **chips** with an explicit "All" for the **development group** sub-filter. Data model: `listing_status` splits the universe — `for_sale`/`sold`/`reserved` are the "sale" side, `for_rent` the "rent" side. In Sale mode, "Available only" OFF shows the whole sale set but renders `sold`/`reserved` cards **dimmed** (opacity-55, still linked, still badged SOLD/RESERVED); ON narrows to `for_sale`. The **group** sub-filter is backed by a new nullable `projects.group` column (migration `2026_06_01_000002`, e.g. "Dabbouq 7" / "Dabbouq 8"); distinct groups are derived client-side from the sale-side listings. All filtering + 6-per-page pagination is **client-side** (the controller sends the full active list). **`group` has no admin-form field yet** — currently seed-only; add it to the Project edit form when admin management is needed (and `group_ar` if Arabic group labels are wanted — it's a single language-neutral string today).
18. **Figma rounded-image banners: read the rect, crop vs. show-full** — two SVG-delivered banners on Properties share a `1148×646 rx≈150-170` rounded-rect image but render differently, and the difference is dictated by the SVG's *viewBox vs. rect* geometry: (a) the **top hero** (`prop_hero.svg`) has a `442`-tall viewBox over the `646`-tall rect → the bottom is clipped, so it's rounded-TOP-corners only + flat bottom; reproduce with `aspect-574/221` + `rounded-t-[...]` + `object-cover object-top`. (b) the **bottom CTA** (`HERO SECTION.svg`) shows the rect fully → all four corners rounded; reproduce with `aspect-574/323` + `rounded-[...]` (all corners). Corner radius steps responsively (`40→80→120→151/170px`) to stay ~proportional, hitting the SVG's true radius at xl. The CTA SVG layered the image at `fill-opacity 0.74` over a `#94C4EE` card (a blue wash) — but the user dropped the blue backdrop and kept just the image at reduced opacity, so it's a plain `opacity-80` image now, no `bg-primary` behind. Lesson repeated from #14/#16: don't eyeball these — read the rect/viewBox numbers as ground truth.
19. **Footer-connect (bottom fade / flush)** — content-only pages whose last section meets the footer should *blend* into it, not leave the Footer's `mt-16` white gap. Two variants, both ending the page flush against the footer with **`-mb-16` on the last section** (cancels the Footer's `mt-16` — scoped to that page only, so other pages keep the breathing room): (a) **gradient fade** for white pages — `bg-linear-to-b from-white from-90% to-primary-deep` so the bottom ~10% melts into the footer blue (`#78AFCE` = `primary-deep`); used on [Self Build](resources/js/Pages/Public/SelfBuild.tsx) + [Properties](resources/js/Pages/Public/Properties.tsx) (gallery section). (b) **solid match** for already-blue pages — the whole section is `bg-primary-deep` + `min-h-screen`; used on [Security](resources/js/Pages/Public/Security.tsx). Reuse this on any new content page that ends near the footer.
20. **State-driven hover accordion (Security pillars)** — the [Security](resources/js/Pages/Public/Security.tsx) page's 3 pillars use the 21st.dev "interactive image accordion" pattern: a React `active` index (default last), `onMouseEnter`/`onFocus`/`onClick` to move it, panels grow by **width** on lg (`lg:flex-1` → `lg:grow-3`) and by **height** on mobile (`min-h-20` → `min-h-90`), 0.5s `transition-all`. **Key reliability trick:** the expanded detail bullets are **conditionally rendered** (`isActive ? <bullets> : <rotated title>`), so a collapsed pillar literally has no detail DOM — no fragile CSS opacity/visibility that can leak. Active pillar drops its photo for a translucent `bg-black/70` "glass" (page shows through); collapsed shows photo + dark gradient + a `-rotate-90` title. Expanded content fades in with a framer delay (`delay: 0.3`) timed to the width animation so text doesn't wrap-then-reflow at the narrow start width. Section bg is anchored `top-0 h-screen` (not `inset-0 h-full`) so mobile card-expand doesn't rescale it. Page/section visibility enforced (innovation #5).
21. **Polished mobile menu (Header)** — the lg-down hamburger panel ([Header.tsx](resources/js/Components/Layout/Header.tsx)) animates open via `AnimatePresence` + `motion.div height:auto`; each row uses an **explicit per-item entrance** (`initial/animate` with index delay `0.06 + i*0.045`) — *not* framer variant propagation, which left items stuck at `opacity:0`. Active row is a filled `bg-primary-strong` (#356B96) pill with white text + chevron (high contrast on the navbar gradient); inactive rows are dark ink with a chevron that nudges + turns primary on hover. Hairline `divide-ink/6` separators. **Gotcha fixed:** the navbar backdrop gradient must be `top-0 h-24` (bar height) **not** `inset-0`, or on light pages it stretches over the expanded panel and paints out the white menu. RTL-safe (`ps/pe`, `inset-s/e`, `rtl:rotate-180`).
22. **Self Build zigzag process timeline** — [SelfBuild](resources/js/Pages/Public/SelfBuild.tsx) renders the 8 process steps as a vertical zigzag: a central navy (`#1A3954`) line with circular nodes, steps alternating sides via `grid grid-cols-2` (`right = i % 2 === 0`; content in `col-start-1`/`col-start-2`). Each step's 3D icon + label **slides in from its own outer side** on `whileInView` (`x: ±64 → 0`, RTL-aware: physical direction flips in Arabic since the grid mirrors). Step labels are CMS rows `process.step_1..step_8`; icons are transparent webp in `public/images/self-build/`. Hero is a stadium banner — see innovation #14-style navy-pill composition (light-blue pill top-start, navy bottom-end).
23. **Snapshot-based change log + one-shot Undo toast** — instead of a per-field audit table, [ChangeLogService](app/Services/ChangeLogService.php) stores a JSON `old_data`/`new_data` snapshot per tracked save plus an `action`; **field-level diffs are computed at display time**, not stored, so the schema stays tiny (the existing `change_logs` table — no migration). **Tracked sections (`SECTION_LABELS`):** `settings`, `site_content`, `project`, `user`, `testimonial`, `testimonial_video`, `department_member`, `contact`. **Revert is data-shaped per section** (`restoreAttributes` writes a snapshot back onto a model via `fill(Arr::except(SKIP_KEYS))`; settings replay `Setting::set`; site_content replays row updates; soft-deleted models — project / user / testimonial / testimonial_video / contact — revert delete↔restore by action) and a `revertable()` matrix gates which (action, section) pairs can be undone. **Deletes are revertable across the board now** (2026-06-07): every admin-deletable record is soft-deleted (projects, users, testimonials, testimonial videos, contacts), so a delete logs a `delete` entry whose Revert restores it — and the post-save Undo toast appears after a delete too. Settings have no delete (key/value, update-only); contact rows are public-created so only their delete/restore are tracked (a permanent force-delete isn't revertable). Users gained `softDeletes` in migration `2026_06_07_000002` specifically so user deletions are undoable (and to keep created_by/updated_by FK refs valid). The **Undo toast** reuses the *same* revert route: `log()` `session()->flash('undo', …)`, shared by HandleInertiaRequests as a one-shot prop, surfaced by [UndoToast](resources/js/Components/Admin/UndoToast.tsx) in AdminLayout — so "Undo after save" and "Revert from history" are one code path, not two. Beyond the toast, `log()` also writes a **persistent per-section session pointer** (`undo:{modelType}`, carrying the field diffs + timestamp) that survives navigation until the change is reverted or dismissed. The **Site Content editor** consumes it (`SiteContentController` passes `session('undo:site_content')` as `undoMeta`) via a Nuor-style [UndoButton](resources/js/Components/Admin/UndoButton.tsx) pinned **top-right above the preview pane** — "Undo last save" with a changed-field count badge + time-ago, a hover tooltip showing each field's old→new diff, and a confirm modal. Restore reuses the `change-log.revert` route (which clears the pointer); a separate `change-log.undo-dismiss` route (`DELETE /admin/change-log/undo/{modelType}`) clears it without reverting. Logging is opt-in per controller (`$changeLog->log(...)`), so adding a new tracked section is one call + a `revert*` branch.
24. **Admin-replaceable image slots (`ManagedImage`)** — bridges the "structural images are code-managed" rule with "let editors swap a specific photo without a deploy." A tiny registry [`ManagedImage::SLOTS`](app/Models/ManagedImage.php) maps each exposed slot `key` → `[label, default, group]` where `default` is the committed path. `ManagedImage::urls([keys])` resolves each slot to its uploaded `Media` URL if one exists, else the committed default — so the site looks identical out of the box. The **Page Images** admin ([ManagedImageController](app/Http/Controllers/Admin/ManagedImageController.php), `/admin/page-images`) lists slots grouped by `group`, uploads via `Media::storeFile()`, and "reset" deletes the override to fall back to the committed default. Currently only the 3 About-page "Crafted" cluster images; **add a slot = one `SLOTS` entry + read it via `ManagedImage::urls()` in the controller.** Distinct from project galleries (those are listing content, not structural) and from `site_content.media_id` (still unused).
25. **Shuffled Projects-Gallery pool (`GalleryImage`)** — the public Properties "Projects Gallery" section is fed by [`GalleryImage::pool()`](app/Models/GalleryImage.php): images from **active sold projects** (their uploaded `ProjectImage` Media, or the committed render gallery / placeholder via `displayImageUrls()`) **concatenated with editor uploads** (the `gallery_images` table). Each pool item carries a **stable `id`** (`img-{id}` / `proj-{id}-{i}` / `gal-{id}`) so the admin can hide individual tiles by id (`gallery_hidden` JSON setting) regardless of source. The public page filters out hidden ids, **shuffles every visit**, shows `gallery_count` tiles (setting) and pages the rest with arrows. Admin **Projects Gallery** ([GalleryImageController](app/Http/Controllers/Admin/GalleryImageController.php)) renders the same pool in two columns (sold-project + uploaded), per-image hide toggle, upload, and the tile-count input. Rationale: surfaces real delivered work (sold villas) automatically while letting editors top up the pool — no separate "is this a gallery image?" flag needed on projects.

### CMS Approach

- **Hybrid model**: Fixed page structure + editable content (Site Content) + CRUD for projects + Settings
- Side-by-side EN/AR editor for all bilingual content
- Simple active/inactive (`is_visible` for sections/pages, `is_active` for projects) — no draft/publish workflow
- Audit logging via `created_by` / `updated_by` FK columns + persistent Change Log entries

---

## Foundation Gotchas (Worth Remembering)

These were real surprises during foundation phase. Document so they don't bite again.

### `NODE_ENV=production` in shell drops devDependencies

The user's shell has `NODE_ENV=production` set globally. With that, `npm install` silently omits ALL devDependencies (vite, tailwindcss, plugins, types) — leaving you with a half-installed project where `npm run build` fails with "vite is not recognized." Fixed via project-local [.npmrc](.npmrc) with `production=false`. Don't delete that file.

### `lucide-react@1.x` dropped brand icons

Lucide's v1 release dropped trademarked brand icons (LinkedIn, Instagram, Facebook, Twitter, YouTube, TikTok, etc.) since they want to focus on generic UI. Inline SVGs ship in [resources/js/Components/Layout/SocialIcons.tsx](resources/js/Components/Layout/SocialIcons.tsx). Generic UI icons (LayoutDashboard, FileText, X, etc.) still work fine via lucide imports — only brands need the inline route.

### `TrustProxies` header constants live on Symfony's Request class

In Laravel 12 / Symfony 7, the `HEADER_X_FORWARDED_FOR` etc. constants are on `Symfony\Component\HttpFoundation\Request`, NOT on `Illuminate\Http\Middleware\TrustProxies` (which is what most older Laravel docs and AI suggestions reach for). See [bootstrap/app.php](bootstrap/app.php).

### Default admin credentials

`AdminUserSeeder` creates `admin@skyamman.com` / `password`. **Change before any non-local deploy.** It's `updateOrCreate` keyed on email, so changing it locally and re-seeding won't recreate the default — but a fresh prod DB seed will, so set `APP_ENV` checks or override the seed before going live.

### Footer needs real social URLs

`DefaultSettingsSeeder` seeds empty social URL settings. The [Footer](resources/js/Components/Layout/Footer.tsx) "Follow us" column renders text links (Linkedin / Meta / Instagram / Youtube); unset URLs render as dim non-links rather than disappearing, so the column shape stays consistent. **Youtube is marked `comingSoon: true`** — it renders dimmed with a "Coming soon" pill on hover regardless of whether the URL is set. Fill in LinkedIn, Meta (Facebook), and Instagram via Settings before launch. X (Twitter) and TikTok were removed from the footer in 2026-06-21.

### Railway reverse proxy doesn't set HTTPS via trusted headers — use `URL::forceScheme`

Railway terminates SSL at its edge and forwards requests to the container over HTTP. Even with `trustProxies` configured for RFC 1918 + Cloudflare CIDRs (see [bootstrap/app.php](bootstrap/app.php)), Railway's internal proxy IP may not be in those ranges, so `X-Forwarded-Proto: https` is not trusted and `asset()` generates `http://` URLs. The page is served over HTTPS but asset tags point to `http://`, so CSP's `'self'` (which matches the HTTPS origin) blocks all JS/CSS → blank white page.

**Fix (already applied):** [AppServiceProvider](app/Providers/AppServiceProvider.php) calls `URL::forceScheme('https')` when `APP_ENV=production`. This bypasses proxy detection entirely and forces all `asset()` / `route()` helpers to generate `https://` URLs. Also ensure `APP_URL` is set to `https://…` (not `http://`) in Railway Variables so emailed links are correct.

### Inertia v3 differences vs Nuor Steel's v2

`inertiajs/inertia-laravel` is on `^3.0` (Nuor Steel uses `^2.0`). Two real differences bit during the homepage build — don't blindly copy snippets from Nuor:

1. **Event renamed:** The 419/CSRF auto-reload listener is `router.on('httpException', ...)` in v3, not `router.on('invalid', ...)`. Same payload shape (`event.detail.response.status`), same `event.preventDefault()` pattern. Applied in [resources/js/app.tsx](resources/js/app.tsx).
2. **Page resolver must unwrap `.default`:** v3's `resolve` callback expects `Promise<Component>`, but `resolvePageComponent` returns `Promise<{ default: Component }>`. Chain `.then((m) => m.default)` in both [app.tsx](resources/js/app.tsx) and [ssr.tsx](resources/js/ssr.tsx). Without the unwrap you get a runtime "page is not a function" error during hydration.

---

## Testing & CI

Three test layers, all run on every PR by GitHub Actions ([.github/workflows/ci.yml](.github/workflows/ci.yml)). Branch protection on `main` requires the CI jobs to pass, so a red check blocks the merge.

### Layers

- **PHPUnit (backend)** — `php artisan test`. PHPUnit 11 (**NOT Pest**), in-memory SQLite ([phpunit.xml](phpunit.xml)), `RefreshDatabase`. Feature tests cover the lead funnel (contact + newsletter validation/sanitization/lead-routing), auth (login throttle, `is_active`, enumeration), admin authz, the change-log **revert** matrix, and public-route smoke; unit/model tests cover `Setting`, `Project::displayImageUrls()` fallback chain, `GalleryImage::pool()`. ~93 tests in [tests/Feature](tests/Feature) + [tests/Unit](tests/Unit).
- **Vitest (frontend units)** — `npm run test:js` (`test:js:watch` for watch). **Pure TS helpers only** — `node` env, no jsdom ([vitest.config.ts](vitest.config.ts)). Covers the extracted [resources/js/lib](resources/js/lib) helpers: `youtube` (URL→id regex), `carousel` (`wrapIndex`/`shorterDirection` ring math, shared by ProjectShowcase + Testimonials), `phone` (`toWaMeNumber`), `cms` (CMS-first/i18n fallback resolver, used by the Footer), `cn`. Tests co-located as `lib/*.test.ts`. ~20 tests.
- **Playwright (E2E)** — `npm run test:e2e`. Real Chromium against a `php artisan serve` instance Playwright boots itself (reuses a running one locally) — see [playwright.config.ts](playwright.config.ts). Two specs in [tests/e2e](tests/e2e): **`overflow.spec.ts`** = the **mobile horizontal-overflow guard** (`scrollWidth ≤ innerWidth` on every public route at a phone viewport — the invariant that would have caught the Self Build "dig deep" overflow), and **`smoke.spec.ts`** (desktop: Inertia app renders, home→properties nav, contact form present; selectors are href/role-based so CMS copy changes don't break them). First run needs `npx playwright install chromium`.

### CI jobs ([ci.yml](.github/workflows/ci.yml))

- **Frontend** — `npx tsc --noEmit` → `npm run test:js` → `npm run build` (client + SSR).
- **Backend** — `composer install` → `cp .env.example .env` + `key:generate` → `php artisan test`. (No asset build — feature tests stub Vite; see gotcha below.)
- **E2E** — runs inside the official Playwright container (`mcr.microsoft.com/playwright:v1.61.0-noble`, which ships Chromium + its OS deps, so there's no slow `playwright install --with-deps` step). Inside it: setup PHP 8.2 + Node 22 → install deps → `migrate:fresh --seed` on sqlite → `npm run build` → `npx playwright test`. Uploads the HTML report as an artifact on failure. **When you bump `@playwright/test`, bump the image tag to match** (else browser/version mismatch).

### Testing gotchas (learned the hard way)

- **Feature tests MUST stub Vite** — the base [TestCase](tests/TestCase.php) calls `$this->withoutVite()` in `setUp()`. Without it, any test that renders a full Inertia page hits the `@vite` directive in [app.blade.php](resources/views/app.blade.php), which throws `ViteManifestNotFoundException` (→ HTTP 500, so `assertOk()`/`assertInertia()` fail) when `public/build/manifest.json` is absent. It passes **locally** (leftover manifest from `npm run build`) but failed in CI's Backend job, which skips the asset build for speed. `withoutVite()` decouples backend tests from the frontend build.
- **Data-seeding migrations no-op under `testing`** — the production-bootstrap migrations (`2026_06_18_000001..000006`) early-return when `app()->environment('testing')`, so they don't dump the 18-villa catalogue into the test DB. Feature tests seed exactly what they use in `setUp()` (e.g. `PublicSmokeTest` seeds Pages + SiteContent + DefaultSettings).
- **Test env doubles** — Turnstile no-ops (no secret configured), `MAIL_MAILER=array` (assert via `Mail::fake()`), `CACHE_STORE=array` (fresh per test, so the rate-limiter resets between tests). The per-email login throttle is exercised by pre-`RateLimiter::hit`-ing the email key (`login:` + sha1(lower(email))).

---

## Build Progress

### Foundation (DONE — 2026-04-26)
- [x] Database migrations (9 tables: users role, media, pages, site_content, settings, projects, project_images, contact_submissions, change_logs)
- [x] Eloquent models with relationships + dedicated mutator methods (9 models)
- [x] HandleInertiaRequests middleware (shares auth, locale, flash, ziggy, siteSettings, turnstileSiteKey)
- [x] SetLocale middleware + `/locale/{lang}` POST route
- [x] SecurityHeaders middleware (CSP, Permissions-Policy)
- [x] AdminMiddleware (role guard) — registered as `admin` alias
- [x] Session-based auth (LoginController + per-email/per-IP throttle + Turnstile gate + 750ms delay)
- [x] `LanguageContext` (session-cookie pattern, no localStorage)
- [x] `ToastContext` (auto-shows server flash messages)
- [x] Global 419 handler in `app.tsx`
- [x] PublicLayout (Header + Footer)
- [x] AdminLayout (sidebar + topbar with logout)
- [x] AdminSidebar with 6 nav groups, `adminOnly` flag for Settings/Users/Change Log
- [x] i18n bundles (en.ts, ar.ts) covering all 7 pages' fallback strings
- [x] `trustProxies` locked to Cloudflare CIDR list
- [x] Resend mailer config
- [x] TurnstileVerifier service + `<Turnstile>` React component (forwardRef + reset())
- [x] Inline SVG brand icons (lucide v1 dropped them)
- [x] TS + SSR + Inertia pipeline (tsconfig.json, vite.config.ts, app.tsx, ssr.tsx)
- [x] CSS theme tokens + RTL font swap

### Seeders (DONE)
- [x] AdminUserSeeder — admin@skyamman.com
- [x] DefaultSettingsSeeder — 21 rows (contact, social, map, media_room embeds, SEO, lead_routing JSON)
- [x] PagesSeeder — 7 public pages + the `footer` pseudo-page
- [x] SiteContentSeeder — covers all pages + footer
- [x] ProjectsSeeder — **real catalogue: 18 DABOUQ-7 + DABOUQ-8 villas** (built from client brochures; force-removes stale demo projects). See the Schema-decisions block.
- [x] DepartmentMemberSeeder — homepage Head of Departments cards
- [x] TestimonialVideosSeeder — homepage testimonial videos (YouTube URLs)

### Public Pages (vertical builds, one at a time — TODO)
- [x] Homepage — 12 sections wired through HomeController with EN+AR bundles, featured projects from `projects` table split by `listing_status`, Settings-driven map embed, Instagram Graph API for Media Room. Transparent color-aware navbar + Figma-anchored photo-composition footer.
  - **Hero** — 3-tier headline (title / location / subtitle), sky gradient (`from-[#5299CC] via-primary to-surface`), villa SVG, CTA pill
  - **InvestmentBanner** — "Buy Early" / "Save More" / "Gain More" with leaning leaf-shape strip SVG between segments
  - **AboutUs** ("Who We Are?") — single rounded card, photo background slot (`/images/home/about-villa.jpg`), white heading + body
  - **AssurancePillars** — scrollytelling scroll-pinned section (framer-motion orbital arc)
  - **ManagingPartner** — testimonial-style card with quote marks from `quote-open.png` / `quote-close.png`
  - **HeadOfDepartments** — 4-up team cards with avatar circle (placeholder until photos) + asymmetric card shape from `Rectangle 54.svg`
  - **ProjectShowcase ×2** — same component rendered twice (Properties for Sale + Properties for Rent), state-driven rotating carousel from rotated array, framer-motion direction-aware slide transitions, swipe + arrow + click-dot navigation, wrap-around at edges, viewport-aware visible count (1/2/4)
  - **Testimonials** — title + rounded video frame (rx=56 from `Screenshot...svg`) + 4 client cards using domed-top shape from `Rectangle 59.svg`
  - **ValueProposition** — 4-up pillar cards with brand SVG icons + square card shape (`Rectangle 22.svg`, rx=62, `#E5EBF0/75`)
  - **MediaRoom** — LinkedIn single-post iframe (left) + Instagram 3×3 grid (right) backed by [`InstagramService`](app/Services/InstagramService.php) hitting graph.instagram.com with a 1-hour cache
  - **LocationMap** — Google Maps embed
- [x] Properties (listings) — [PropertiesController](app/Http/Controllers/PropertiesController.php) → `Public/Properties` with EN+AR bundles + all active projects. **Hero** matches `prop_hero.svg` (headline left + subtitle/Contact-Us right, then a wide banner cropped to the SVG's `1148×442` window — rounded TOP corners only, flat bottom, `object-cover object-top`). **Two-tier filter** (see innovation #17): segmented For Sale / For Rent control + "Available only" switch + light-blue development **group** chips. **Listings grid** (1/2/3-col) with the `PROJECTS SHOWCASE.svg` card (`#E5EBF0` rx52, square image rx44, white status badge, whole card is the link — no button), client-side pagination 6/page, framer-motion card transitions. **Bottom CTA banner** matches `HERO SECTION.svg` (full `1148×646` rounded image, all corners; image at reduced opacity, centered overlay text — arrow removed per request). A **Projects Gallery** section (hover-expand row, shuffled from project galleries) closes the page and **fades into the footer** (innovation #19).
- [x] Properties **detail** page (`/properties/{slug}`) — [PropertyDetail](resources/js/Pages/Public/PropertyDetail.tsx): title + hero image (blue blob + FOR SALE badge, clickable → lightbox), info row + Details card, horizontal **square thumbnail carousel** + zoomable **Lightbox** ([Components/Public/Lightbox.tsx](resources/js/Components/Public/Lightbox.tsx)), map iframe, related listings (same-category first), per-listing SEO + `RealEstateListing` JSON-LD. "Contact about this project" CTA → `/contact?property={slug}`. (Galleries are empty in dev → falls back to demo villa renders.)
- [x] Investment (content-only editorial) — [InvestmentController](app/Http/Controllers/InvestmentController.php) → `Public/Investment`. **⚠️ PARKED / FULLY DISABLED (2026-06-03):** `/investment` now 404s. **Four** things are disabled, all to re-enable together: (1) the `{ key: 'investment', href: '/investment' }` item in [Header.tsx](resources/js/Components/Layout/Header.tsx) `NAV_ITEMS`; (2) the `use App\Http\Controllers\InvestmentController;` import + the `Route::get('/investment'…)` line in [routes/web.php](routes/web.php); (3) `'investment'` removed from `PAGE_ORDER` in the admin [Content.tsx](resources/js/Pages/Admin/Content.tsx) editor (2026-06-07) so it no longer appears in the Site Content section (its `PAGE_ICONS`/`PAGE_URLS`/`SECTION_LABEL_OVERRIDES` entries are kept, so re-adding the slug to `PAGE_ORDER` is enough). The controller, page component, seeded `site_content`, and `public/images/investment/` assets are all kept intact — **restore those spots to bring the page back.** Reason: parked for content/design review before launch.
- [x] Self Build (content-only with **8-step** Process Flow timeline) — [SelfBuildController](app/Http/Controllers/SelfBuildController.php) → `Public/SelfBuild`, route `GET /self-build`. Hero = stadium-shaped (`rounded-full`) banner image (`12 7.webp`) with navy overlay + two-tone corner pills (light-blue top-start, navy bottom-end) + centered text (light tagline over bold "PROCESS FLOW"). Timeline = central navy line + circular nodes, 8 steps zigzagging left/right with 3D icons (`public/images/self-build/`), each icon **directional slide-in** on `whileInView` (from its own side, RTL-aware). Bottom fades white→`primary-deep` (#78AFCE) into the footer (`-mb-16` cancels footer margin). Added `step_8` "After-Sales Service" to seeder + i18n (steps restructured to `step_1..step_8` keys).
- [x] Security with SkyAmman (content-only) — [Security](resources/js/Pages/Public/Security.tsx): brand-blue (`primary-deep` #78AFCE) bg with a centered, radial-masked villa; **3-pillar state-driven hover accordion** (Legal / Financial / Construction — innovation #20). Footer-connect via solid `bg-primary-deep` section + `-mb-16` (innovation #19). Page + section visibility, SEO (canonical/OG/hreflang/BreadcrumbList JSON-LD).
- [x] About Us (content-only) — [AboutController](app/Http/Controllers/AboutController.php) → `Public/About`, route `GET /about`. Six sections: **Hero** (banner `hero-banner.webp` + `${NAVY}B3` overlay, two diagonal `rounded-full` pills peeking from behind — navy top-start + light-blue bottom-end via inline-% rect geometry, `hidden lg:block`; oversized "ABOUT US" wordmark bottom-start, bold first word + light rest); **Intro** navy card (centered white body); **Crafted** (code-managed 3-image cluster — two small squares + one big box — beside a navy heading + justified body); **Mission / Vision** via shared `CloudBar` component (brand-blue `bg-primary` rounded bar, footer `footer-clouds.webp` tucked into one bottom corner, big faded title sitting ABOVE the bar's top edge in the bar color, **black** body text); **Leadership** closing section that **fades into the footer** (innovation #19: `-mb-16` + `from-white from-35% to-primary-deep`). All sections gated by `sectionVisible`; full SEO (canonical/OG/hreflang/BreadcrumbList JSON-LD). Images code-managed under `public/images/about/` (consistent with image strategy — not CMS).
- [x] Contact Us — [ContactController](app/Http/Controllers/ContactController.php) + [Contact](resources/js/Pages/Public/Contact.tsx): two-column (heading + contact methods + socials [FB/IG/X, 2-col rows] + map on the left, form on the right). Turnstile-gated, **lead routing** by `request_type` → recipient emails (`lead_routing` JSON, fallback `company_email`), `?property={slug}` pre-fill stamps `project_id`, themed [`<Select>`](resources/js/Components/Public/Select.tsx) dropdown, brand-blue focus (`focus:border-primary`, NO ring — Tailwind v4 ring defaults to currentColor/dark). Mailable [ContactSubmissionReceived](app/Mail/ContactSubmissionReceived.php) (HTML + text). **Admin Contact Submissions inbox still TODO.**

### Admin Panel (TODO — in build order)
- [x] Login page (with Turnstile)
- [x] Dashboard with content-health badges (project image/SEO gaps, hidden pages/sections, unset social URLs, missing contact info, missing default SEO title) — every "Fix" link deep-links to its target section via `#section-X` hash anchor
- [x] **Projects CRUD** — list with filters/search/active toggle, Form (Basic Info / Listing Details / Location / Property Specs / SEO / Gallery sections with icon-headed dividers), gallery upload + reorder + delete, per-listing SEO with OG picked from gallery, soft-delete + Trash with restore + force-delete
- [x] **Site Content editor** — bilingual side-by-side accordion (one per public page), text-only, per-row visibility, per-page SEO with amber "No SEO title" badge, hash-anchor deep-linking opens + scrolls to the target page
- [x] **Settings** — 2-column grid of group cards with icon headers + descriptions + group-specific field layouts; live amber warning badges for unset critical values (social URLs not set, phone/email missing, default SEO title missing); lead routing JSON; OG as URL field
- [x] **AdminLayout + AdminSidebar** — collapsible desktop sidebar (chevron toggle, persistent across Inertia visits), mobile slide-in with backdrop, auto-resolved page icon next to title
- [x] **Contact Submissions inbox** — [ContactSubmissionController](app/Http/Controllers/Admin/ContactSubmissionController.php) → `Admin/Contacts/{Index,Show,Trash}`. Editor-accessible (no `admin` middleware). **Inbox / Archived tab split** (unread count badge on the Inbox tab); filters by request type + read/unread + search (name/email/phone/message); 15/page. Row actions: mark read↔unread (`Mail`/`MailOpen` toggle), archive↔inbox, soft-delete. **Detail page** (`/admin/contacts/{id}`) **marks read on open** (stamps `read_by`), shows email/phone/IP/project link, a `mailto:` Reply button, and the full message; mark-read/archive/delete actions repeated in the header. **Trash** with restore + force-delete (force only here). Dashboard "Recent Inquiries" rows now deep-link to the detail page. Per-project linkage surfaces the linked project (→ its edit page). Unread rows tinted + bold. No new migration — uses the existing `is_read`/`is_archived`/`read_by` columns.
- [x] **Users** (admin-only) — [UserController](app/Http/Controllers/Admin/UserController.php) → single `Admin/Users` page (table + slide-over create/edit form + type-to-confirm admin modal). Lean & **schema-true** (no invite/first-login-reset flow — uses the existing `name/email/password/role/is_active` columns; admin sets the password directly). **Policies:** (1) **admins are self-managed** — you can't edit/deactivate/demote/delete *another* admin (locked "Self-managed" row); the removal path is an admin self-demoting to editor first. (2) **Granting admin is deliberate** — creating an admin or promoting editor→admin requires typing the account's email in a confirm modal, backed server-side by an `admin_confirmed` flag. (3) **No self-lockout** — can't deactivate/delete yourself; the last active admin can't be demoted/deactivated. Routes live in the `admin`-middleware group next to Settings. Password hashed via the model's `'hashed'` cast. **Password policy** (centralized in [AppServiceProvider](app/Providers/AppServiceProvider.php) via `Password::defaults()` so every use is consistent): min 10 chars, mixed case, a number, a symbol, and **`uncompromised()`** (HaveIBeenPwned k-anonymity breach check — fails open if the API is unreachable, so local dev is unaffected). **Password UI helpers** in [Components/Admin/PasswordField.tsx](resources/js/Components/Admin/PasswordField.tsx) (reusable): show/hide toggle, one-click crypto-strong **generator** (`window.crypto`, guarantees all classes), copy button, a live **requirements checklist + strength meter**, and a **match indicator** on the confirm field. The exported `PASSWORD_RULES` also drives a client-side submit guard (Save disables until rules pass + confirm matches; on edit a blank password = keep current). The HIBP check is server-only (can't run client-side).
- [x] **Change Log + Undo** (admin-only) — [ChangeLogService](app/Services/ChangeLogService.php) + [ChangeLogController](app/Http/Controllers/Admin/ChangeLogController.php) → `Admin/ChangeLog`. **Tailored to Sky Amman's schema** (not a 1:1 Nuor port — uses `action` + `old_data`/`new_data` snapshots + `reverted_at`/`reverted_by`; no migration needed). Tracks **settings, site_content, projects, users, testimonials, testimonial videos, department members, contact submissions**: each tracked controller calls `$changeLog->log(modelType, id, action, old, new, label)` on store/update/delete/restore (no-op updates are skipped). The log page lists entries (section + action badge + who + field-level diffs computed at display time from the JSON snapshots) with **action/status/search filters + per-page selector + day grouping + precise timestamps** (2026-06-08) plus the section/user/period `Select` filters + pagination. **Per-entry Revert** restores prior state — `revert()` matrix: settings/site_content = update-only; soft-deleted models (projects / users / testimonials / testimonial videos / department members) = create(→soft-delete)/update(→restore fields)/delete(→restore)/restore(→re-delete); contacts = delete(→restore)/restore(→re-delete) only (public-created, force-delete not revertable). **Deletes are undoable everywhere** — users were given `softDeletes` (migration `2026_06_07_000002`) so user deletions revert like the rest. **One-shot Undo toast** (innovation #23): `log()` flashes an `undo` payload shared by [HandleInertiaRequests](app/Http/Middleware/HandleInertiaRequests.php); [UndoToast](resources/js/Components/Admin/UndoToast.tsx) (in AdminLayout) surfaces it bottom-center after a save with a single-click revert that POSTs the same `change-log.revert` route, then auto-dismisses.
- [x] **Content CRUDs (homepage + about imagery)** — five admin sections that promote former seed-only/hardcoded home content to editable records (all under the **Content** sidebar group, editor-accessible, change-log-tracked where soft-deletable):
  - **Testimonial Videos** ([TestimonialVideoController](app/Http/Controllers/Admin/TestimonialVideoController.php), `/admin/testimonial-videos`) — title + URL (YouTube/Vimeo/mp4, no upload), reorder, publish/active toggle, soft-delete. Homepage carousel supports >3 videos with nav + clickable previews.
  - **Testimonials** ([TestimonialController](app/Http/Controllers/Admin/TestimonialController.php), `/admin/testimonials`) — bilingual name + quote (live char counters, tightened limits), required photo upload, reorder, active toggle; **bidirectional language fallback** so single-language cards still render in both locales.
  - **Head of Departments** ([DepartmentMemberController](app/Http/Controllers/Admin/DepartmentMemberController.php), `/admin/department-members`) — bilingual name + role (**both required in EN + AR** as of 2026-06-24), photo upload (optional, but required once a member already has one), reorder, active toggle.
  - **Page Images** ([ManagedImageController](app/Http/Controllers/Admin/ManagedImageController.php), `/admin/page-images`) — swap registered structural-image slots; reset → committed default (innovation #24).
  - **Projects Gallery** ([GalleryImageController](app/Http/Controllers/Admin/GalleryImageController.php), `/admin/gallery`) — manage the public gallery pool: editor uploads + per-image hide toggle + tile-count setting (innovation #25).
- [x] **Reset-to-Default safeguard** (admin-only) — Site Content editor's type-to-confirm "Reset to Default" restores every `site_content` row to `SiteContentSeeder::rows()` (text + visibility), logged as one revertable change. SEO fields intentionally excluded (no seeded defaults yet — see Remaining).
- [x] **Type-to-confirm delete modal** across all admin sections; **publish-confirm modal** when activating a project missing image/description/location.
- [x] **Project show page + card view** — read-only admin project show page with inline active + listing-status controls; list view gained a **card view (default)** with image carousel + a list-view toggle + 8/12/16/24/32 per-page selector.

  **This completes the admin panel.**

### Public-side additions (post-2026-06-04)
- [x] **Floating WhatsApp button** ([resources/js/Components/Public/](resources/js/Components/Public/)) — site-wide, wired to `company_phone`, normalizes to intl `wa.me` format.
- [x] **Phone-required contact form** — Contact now requires a phone, validates Jordan format, and stores canonical `+962…`; admin Contacts gained a **WhatsApp reply** button (alongside `mailto:`) + a "Get directions" map button.
- [x] **Properties Gallery section** (innovation #25) + **per-view count / carousel** + sold-listing handling: sold cards are **non-clickable** and their public detail page 404s; sold-project gallery images resolve via `displayImageUrls()` (no broken SVG).
- [x] **Rate-limiting** extended to locale, media-serve, video, and public page routes (2026-06-09).

### Infrastructure (TODO)
- [x] **Automated test suite + GitHub Actions CI (2026-06-23)** — see the **Testing & CI** section. PHPUnit (~93, feature + unit) + Vitest (~20, JS helpers) + Playwright (E2E + mobile-overflow guard); [ci.yml](.github/workflows/ci.yml) runs all three on every PR (Frontend / Backend / E2E jobs). Branch protection on `main` gates the merge on green.
- [x] SSR setup (build-time + runtime toggle via `INERTIA_SSR_ENABLED`)
- [x] **SSR sidecar live on Railway (2026-06-23)** — separate "SSR Service" running `node bootstrap/ssr/ssr.js` on private `skyammanwebsite.railway.internal:13714`; main app wired via `INERTIA_SSR_ENABLED`/`INERTIA_SSR_URL`; `TimeoutHttpGateway` for graceful CSR fallback. See **SSR Sidecar (Railway)** under Deployment for the two gotchas (Railpack Node prune → `RAILPACK_DEPLOY_APT_PACKAGES=nodejs`; private-hostname match + `config:cache` timing).
- [x] Railway deployment (Railpack startup, env vars) — live at `sky-amman-production.up.railway.app`. MySQL service connected via `${{MySQL.*}}` references. Required env vars: `APP_KEY`, `APP_ENV=production`, `APP_URL=https://…`, `SESSION_DRIVER=database`, `DB_*` from MySQL service, `MAIL_MAILER`, `RESEND_API_KEY`, `TURNSTILE_*`. See Railway HTTPS gotcha in Foundation Gotchas.
- [ ] Cloudflare DNS + proxy + Turnstile site keys
- [ ] Resend domain DNS verification (DKIM/SPF/DMARC)
- [x] Data migrations for production seeding — 6 migration files (`2026_06_18_000001..000006`) call the existing seeders from `up()` so Railway's `migrate --force` on first deploy fully bootstraps the DB (admin user, settings, pages, site content, all 18 Dabouq villas, dept members, testimonial videos). Subsequent deploys skip them entirely (migrations table). Client data changed via admin is never overwritten.
- [x] sitemap.xml + robots.txt routes — [SitemapController](app/Http/Controllers/SitemapController.php) serves both dynamically. `GET /sitemap.xml`: static pages from `pages` table (gated `is_visible`, footer/investment excluded) + active non-sold projects; each URL gets EN/AR/x-default `<xhtml:link hreflang>` alternates. `GET /robots.txt`: `Disallow: /admin/` + `Sitemap:` pointing at the live domain via `url()`. Static `public/robots.txt` deleted so the Laravel route takes over.
- [x] JSON-LD structured data (Organization, RealEstateListing, BreadcrumbList) — `RealEstateAgent` (Organization subtype) on Home with conditional fields (phone, email, logo, sameAs social URLs) populated from siteSettings; `BreadcrumbList` added to Properties + Contact. PropertyDetail already had `RealEstateListing` (unchanged). Investment has its own JSON-LD (unchanged).
- [x] Hreflang tags — `<link rel="alternate" hreflang="en/ar/x-default">` in `<Head>` on all public pages incl. PropertyDetail (all point at the same URL since locale is session-driven).
- [ ] **Instagram Graph API provisioning** — the homepage Media Room 3×3 grid is driven by [`InstagramService`](app/Services/InstagramService.php) which reads `instagram_access_token` + `instagram_user_id` from Settings (group `media_room`). Until those are filled in, the Instagram half of Media Room silently hides. One-time admin setup:
  1. Convert the SkyAmman IG account to **Business** or **Creator**
  2. Link it to a **Facebook Page**
  3. Create a Meta Developer App at developers.facebook.com/apps → add "Instagram Graph API" product → request `instagram_basic` permission
  4. Use Graph API Explorer to mint a short-lived token, then exchange for a **long-lived (60-day) token**; note the IG user ID returned
  5. Paste long-lived token into `instagram_access_token` and user ID into `instagram_user_id`
- [ ] **Instagram long-lived token auto-refresh** — long-lived tokens expire after 60 days. Add a scheduled Laravel task that hits Meta's refresh endpoint nightly when the token is within ~7 days of expiry. Track expiration in a new `instagram_token_expires_at` setting; surface a warning badge on the admin Settings page when within the warning window.

### Remaining
- [ ] Code splitting (verify `manualChunks` chunks under 500kB — already configured, currently vendor-react @ 213kB largest)
- [ ] Replace seeded placeholder content (phone "+962 6 000 0000", empty social URLs) with real values
- [ ] **Seed page SEO defaults + extend "Reset to Default" to cover SEO.** The admin Site Content **"Reset to Default"** safeguard ([SiteContentController::reset](app/Http/Controllers/Admin/SiteContentController.php), admin-only, type-to-confirm "Reset to Default") restores every `site_content` row to [`SiteContentSeeder::rows()`](database/seeders/SiteContentSeeder.php) — **text + visibility only**. Per-page SEO (`seo_title_*`/`seo_description_*` on the `pages` table) is **intentionally NOT reset** because there are no real SEO defaults seeded yet (PagesSeeder seeds empty SEO). **When the real SEO copy is decided:** (1) seed it in `PagesSeeder`, (2) extend `reset()` to also restore each page's SEO fields from those defaults (snapshot old/new into the same change-log entry so it stays revertable). The reset is logged as a single revertable `site_content` change (`model_id = "all"`).
- [ ] Final testing & go-live

> **Last updated:** 2026-06-24 — **Admin UX polish + Head of Departments bilingual rule + two-column Project form.**
> - **Save buttons only light up on a real change.** Added dirty-tracking so the Save button stays greyed/disabled until something actually changes, then re-greys after a successful save — applied to **Settings**, **Users**, **Head of Departments**, and **Testimonials** (the rest — Site Content, Projects form, Projects Gallery, Testimonial Videos — already did this). The modal/drawer forms (Users / Departments / Testimonials) populate via `setData`/`useEffect`, so Inertia's built-in `isDirty` would read dirty the instant they're filled — instead they **capture a baseline snapshot when the panel opens** and compare against it (a newly picked photo also counts as a change).
> - **Login page** ([Login.tsx](resources/js/Pages/Admin/Login.tsx)) gained a show/hide password **eye toggle** (the admin user-create/edit + reset-password forms already had one via [PasswordField](resources/js/Components/Admin/PasswordField.tsx)).
> - **Head of Departments now requires name AND role in BOTH languages** (was "at least one") — the homepage shows them per the visitor's locale, so a missing language fell back oddly. Enforced server-side ([DepartmentMemberController](app/Http/Controllers/Admin/DepartmentMemberController.php)) **and** in the form ([Departments/Index.tsx](resources/js/Pages/Admin/Departments/Index.tsx)). Photo stays optional, but the edit form marks it **required once a member already has one** (there's no remove-photo path, so a member with a photo can't go photo-less — this is signposting). **Migration note:** existing one-language members must get the second language added the next time they're edited; they still render publicly via fallback until then. **(Testimonials keep the looser "at least one language" rule.)**
> - **Project add/edit form restructured to two columns** ([Projects/Form.tsx](resources/js/Pages/Admin/Projects/Form.tsx)): the main fields (Basic Info / Listing Details / Property Specs / SEO) sit in a left `lg:col-span-3` `<form>`; the **Gallery (top) + Location (below)** sit in a right `lg:col-span-2` sidebar, stacking to one column on mobile. **Location moved OUT of the `<form>` element but still saves** — every field is controlled via the Inertia `useForm` `data` and the submit reads that state (not the DOM form), so field placement is purely cosmetic (same reason the gallery already lived outside the form).
> - **CI E2E speedup:** the Playwright job now runs **inside the official `mcr.microsoft.com/playwright:v1.61.0-noble` container** (Chromium + its OS deps pre-baked), which removes the slow `playwright install --with-deps` apt step. `setup-php`/`setup-node` run inside the container. Pin the image tag to the `@playwright/test` version on upgrade. See **Testing & CI**.
>
> **Last updated:** 2026-06-23 — **Automated test suite + GitHub Actions CI.**
> - **Three test layers** added (see the new **Testing & CI** section): **PHPUnit** ~93 feature/unit tests (lead funnel, auth throttle, admin authz, change-log revert, model methods, public smoke), **Vitest** ~20 unit tests over pure helpers extracted into `resources/js/lib` (`youtube`, `carousel`, `phone`, `cms`, `cn`), and **Playwright** E2E (the **mobile horizontal-overflow guard** across all public routes + desktop smoke journeys).
> - **GitHub Actions CI** ([.github/workflows/ci.yml](.github/workflows/ci.yml)) — 3 jobs (Frontend: tsc + Vitest + build; Backend: PHPUnit; E2E: Playwright) on every PR + pushes to `main`. Branch protection requires them green to merge.
> - **Refactor:** extracted the inline `youtubeId`/carousel-`wrap`/`toWaMeNumber`/footer CMS-fallback logic into `resources/js/lib` modules (also de-dups the carousel math shared by ProjectShowcase + Testimonials) so they're unit-testable.
> - **CI gotchas baked in:** base [TestCase](tests/TestCase.php) now `withoutVite()` (feature tests rendering a full page 500 on a missing Vite manifest in CI — the Backend job skips the asset build); data-seeding migrations already no-op under the `testing` env.
>
> **Last updated:** 2026-06-23 — **SSR sidecar live on Railway.**
> - **Production SSR is on.** Stood up a separate Railway "SSR Service" (same repo, start command `node bootstrap/ssr/ssr.js`, private domain `skyammanwebsite.railway.internal:13714`); main app wired via `INERTIA_SSR_ENABLED=true` + `INERTIA_SSR_URL`. Verified: server-rendered `#app` + per-page `og`/`canonical` in raw HTML (curl word count ~1.4k → ~4.4k).
> - **New code:** `app/Ssr/TimeoutHttpGateway.php` (connect/response timeouts → graceful CSR fallback, no 502 on a hung sidecar), bound in `AppServiceProvider`; published `config/inertia.php` (env-driven, SSR off by default, timeout knobs); `INERTIA_SSR_*` documented in `.env.example`.
> - **Two gotchas (documented under Deployment → SSR Sidecar):** (1) Railpack ≥ v0.30.0 prunes Node from the runtime → `node: command not found`; fixed with `RAILPACK_DEPLOY_APT_PACKAGES=nodejs` on the SSR service. (2) `INERTIA_SSR_URL` host must match the sidecar's private domain exactly and is baked at `config:cache` build time, so the main app must redeploy after changing it.
>
> **Last updated:** 2026-06-21 — **Railway deployment live; footer social links updated; HTTPS URL scheme fix.**
> - **Railway deployment live** at `sky-amman-production.up.railway.app`. MySQL service added; session driver set to `database`; all env vars wired. See Infrastructure checklist for the required variable list.
> - **Footer "Follow us" column** updated: removed X (Twitter) and TikTok, added Instagram. New order: LinkedIn → Meta (Facebook) → Instagram → Youtube. Youtube is marked `comingSoon: true` in `SOCIAL_KEYS` ([Footer.tsx](resources/js/Components/Layout/Footer.tsx)) — renders dimmed with a "Coming soon" hover pill regardless of URL. Mobile grid changed from 2-col to 3-col. Subscribe section made more compact (smaller text/buttons/input on mobile). Dashboard `$socialKeys` updated to match (4 platforms: `linkedin_url`, `facebook_url`, `youtube_url`, `instagram_url`).
> - **Railway HTTPS / blank-page fix** — Railway terminates SSL externally; the app receives HTTP internally so `asset()` was generating `http://` URLs, which CSP's `'self'` rejected on the HTTPS page. Fixed by adding `URL::forceScheme('https')` in `AppServiceProvider::boot()` when `APP_ENV=production`. See new gotcha in Foundation Gotchas.
>
> **Last updated:** 2026-06-18 — **Favicon + OG image; sitemap/robots; JSON-LD; footer tablet fix; data migrations for Railway.**
> - **Favicon:** square SVG icon (`public/favicon.svg` + `favicon-32x32.svg` + `favicon-16x16.svg`) + PNG fallbacks (`favicon-32x32.png`, `favicon-16x16.png`) added. `app.blade.php` updated with 4 link tags (SVG first → PNG 32 → PNG 16 → ICO legacy). Gotcha: the designer's "32px" export had a wide `119.85×41.08` viewBox (wordmark, not icon) — use only the square-viewBox icon export as a favicon.
> - **OG image:** `public/images/og-image.png` committed. The `og_image_url` setting in Admin → Settings → SEO must be set to the full absolute URL (e.g. `https://skyamman.com/images/og-image.png`) at deploy time — the seeder leaves it empty since the domain isn't known at seed time.
> - **`og:image` meta tag** added to all 6 public pages (Home, About, Properties, Security, SelfBuild, Contact) via `siteSettings?.og_image_url` — outputs nothing when the setting is unset, so no broken meta tags in dev. PropertyDetail already had per-project OG; Investment has a hardcoded one.
> - **Dynamic sitemap.xml + robots.txt** ([SitemapController](app/Http/Controllers/SitemapController.php)): `GET /sitemap.xml` lists all visible non-investment static pages + active non-sold project detail pages, each with EN/AR/x-default `<xhtml:link hreflang>` alternates and `<lastmod>/<changefreq>/<priority>`. `GET /robots.txt` disallows `/admin/` and points at the sitemap URL. Static `public/robots.txt` deleted so the Laravel route takes over.
> - **JSON-LD structured data:** `RealEstateAgent` organization schema on Home (conditional fields from siteSettings: phone, email, logo URL, sameAs social links); `BreadcrumbList` on Properties + Contact. PropertyDetail already had `RealEstateListing` (unchanged).
> - **Footer tablet fix:** added `sm:grid-cols-3` so the Follow Us column stays on the same row as Main and Subscribe from 640px up (was wrapping to a second row).
> - **Data migrations** (`database/migrations/2026_06_18_000001..000006`): 6 migration files that call existing seeders from `up()`. On Railway's first `migrate --force`, these fully bootstrap the DB (admin user, default settings, 8 pages, all site content, 18 Dabouq villas, 4 dept members, 3 testimonial videos). Subsequent deploys skip them — client data is never overwritten. Verified via `php artisan migrate --pretend`.
>
> **Earlier — 2026-06-10 — Real Dabouq catalogue + Content CRUDs + public/contact polish.** Homepage content that was seed-only or hardcoded is now editor-managed, and the demo projects were replaced with the real client brochures.
> - **Real project catalogue** ([ProjectsSeeder](database/seeders/ProjectsSeeder.php)): demo Dabouq/Abdoun seed replaced by **DABOUQ-7 (8 villas, Ready) + DABOUQ-8 (10 detailed villas, Under Development)** = 18 listings, built from the client PDFs. Dabouq 7 ships committed render galleries (`public/images/projects/dabouq-7-villa-{n}/NN.webp`); Dabouq 8 has no render set yet. New `land_area_sqm` (Built-up + Land areas both shown), `map_embed_url` (per-project map → Dabouq site), `hidden_specs` (4 bed/3 bath stored but hidden). See the Schema-decisions block.
> - **Five new Content CRUDs** (sidebar **Content** group): **Testimonial Videos**, **Testimonials**, **Head of Departments**, **Page Images** (innovation #24), **Projects Gallery** (innovation #25). New tables: `testimonials`, `department_members`, `managed_images`, `gallery_images` (+ existing `testimonial_videos`). All change-log-tracked; soft-deletable ones revert via the existing undo path.
> - **Public/contact polish:** floating **WhatsApp button**, **phone-required** contact form (Jordan format → canonical `+962`), admin **WhatsApp reply** + "Get directions", sold-listing detail pages 404 + non-clickable cards, **rate-limiting** on locale/media/video/public routes, footer dropped the unbuilt "Other pages" column (Main links → real routes), and the **footer newsletter** Subscribe widget is wired (`/newsletter` → `newsletter_subscribers`, capture-only).
> - **Change Log** gained action/status/search filters + per-page selector + day grouping; **Site Content Reset-to-Default** safeguard shipped (admin-only, type-to-confirm); **Assurance pillars** mobile text-clip fix + arrow/dot nav.
>
> **Earlier — 2026-06-06 — Admin panel complete: Change Log + Undo shipped (last admin section). Plus per-page SEO consistency, expanded SEO health checks, save-button polish, Users section, forgot/reset-password.**
> - **Change Log + Undo** ([ChangeLogService](app/Services/ChangeLogService.php) + [ChangeLogController](app/Http/Controllers/Admin/ChangeLogController.php), `GET /admin/change-log`, admin-only): snapshot-based audit history of settings/site_content/projects/users with per-entry **Revert** + a one-shot **Undo toast** after each save (innovation #23). Tailored to the existing `change_logs` schema — no migration. See the Admin Panel checklist + innovation #23. **All admin sections are now built.**
> - **Per-page SEO wired everywhere.** Home, Properties, and Contact previously ignored the `pages` SEO fields (they read only the site-wide Settings defaults) and didn't enforce `pages.is_visible`. All three now follow the same pattern as About/Security/Self Build/Investment: controller does `Page::getBySlug(...)` + `abort_if(!is_visible, 404)` and passes `seo` + `url`; the component resolves **per-page override → site-wide Settings default → hardcoded fallback**, and emits canonical + og:url + hreflang. So the admin Site Content "Page SEO & Visibility" section now actually takes effect on every public page (it was a no-op for those three before).
> - **SEO health checks expanded** (innovation #7): the Dashboard now flags incomplete SEO on **pages** (not just projects), checks **descriptions + Arabic** (not just EN title), and adds a **per-project OG image** badge; Settings + the Content-editor badge mirror the four-field check. See innovation #7.
> - **Site Content Save button** now disables + greys out when there are no unsaved edits ("Saved" / "All changes saved"); the server also skips no-op row writes so unchanged rows don't bump `updated_by`/`updated_at`.
> - **Users admin section** built (admin-only CRUD, self-managed-admin + confirm-to-grant guards, themed `Select`, strong-password policy + `PasswordField` UI helpers) and a **forgot/reset-password flow** (`/admin/forgot-password` + `/admin/reset-password/{token}`, Turnstile-gated, anti-enumeration). See the Admin Panel checklist + the Auth section.
> - **⚠️ Outbound email POSTPONED** — the app is on `MAIL_MAILER=log`, so password-reset links + contact-form notifications are written to `storage/logs/laravel.log`, not delivered. Turning it on is env + DNS only (Resend key + verified domain DKIM/SPF/DMARC + real `MAIL_FROM_ADDRESS`/`APP_URL`) at deploy time — see the **Mail (Resend)** section.
>
> **Earlier — 2026-06-04** — **About Us page shipped (all 7 public pages complete) + Contact Submissions inbox built.** Public-site build phase done.
> - **Contact Submissions inbox** ([ContactSubmissionController](app/Http/Controllers/Admin/ContactSubmissionController.php) → `Admin/Contacts/{Index,Show,Trash}`, `GET /admin/contacts`): Inbox/Archived tab split with unread badge; filters (type / read state / search); detail page **marks read on open** (stamps `read_by`) + `mailto:` Reply + project link; archive + soft-delete + Trash (restore/force-delete). Editor-accessible. Dashboard "Recent Inquiries" rows now deep-link into it. Reuses existing `is_read`/`is_archived`/`read_by` columns — no migration. See the Admin Panel checklist for full details.
> - **About Us** ([About.tsx](resources/js/Pages/Public/About.tsx), `GET /about`): 6 sections — Hero (banner + `${NAVY}B3` overlay + two diagonal `rounded-full` pills peeking from behind via inline-% rect geometry, oversized bottom-start "ABOUT US" wordmark), Intro navy card, Crafted (code-managed 3-image cluster + navy heading/justified body), Mission/Vision via shared `CloudBar` (brand-blue bar + footer cloud in one bottom corner + big faded title sitting ABOVE the bar in the bar color + **black** body text), Leadership closing section fading into the footer (innovation #19). Full SEO + section/page visibility. Images code-managed under `public/images/about/`. AboutController follows the same `Page::getBySlug` + abort_if + EN/AR-bundle pattern as the other content-only pages.
>
> **Earlier — 2026-06-03** — Security + Self Build + Contact + Property-detail pages shipped; Investment parked; Header mobile-menu polish; home hero refresh. New **innovations #19 (footer-connect) / #20 (state-driven hover accordion) / #21 (polished mobile menu) / #22 (Self Build zigzag timeline)**.
> - **Security with SkyAmman** ([Security.tsx](resources/js/Pages/Public/Security.tsx), `GET /security`): brand-blue (`#78AFCE`) bg + centered radial-masked villa; 3-pillar **state-driven hover accordion** (one expanded, photo→`bg-black/70` glass, detail bullets **conditionally rendered** so collapsed pillars never leak them; collapsed = photo + `-rotate-90` title). Bg anchored `top-0 h-screen` so mobile expand doesn't rescale it. Footer-connect (solid bg + `-mb-16`). 17 seeded `site_content` rows. Innovation #20.
> - **Self Build** ([SelfBuild.tsx](resources/js/Pages/Public/SelfBuild.tsx), `GET /self-build`): stadium (`rounded-full`) hero banner (`12 7.webp`) + light-blue/navy corner pills + light tagline over bold "PROCESS FLOW". **8-step zigzag timeline** (central navy line + nodes, alternating sides, 3D icons in `public/images/self-build/`, directional slide-in on `whileInView`). Added `step_8` "After-Sales Service"; steps restructured to `step_1..step_8` keys. Bottom fades into footer (`from-90% to-primary-deep` + `-mb-16`). Innovations #19, #22.
> - **Property detail** ([PropertyDetail.tsx](resources/js/Pages/Public/PropertyDetail.tsx), `GET /properties/{slug}`) + **Contact** ([ContactController](app/Http/Controllers/ContactController.php) + [Contact.tsx](resources/js/Pages/Public/Contact.tsx), `GET|POST /contact`) are live — see the build-progress checklist above for details. Properties listings page now ends with a **Projects Gallery** that fades into the footer (innovation #19); the CTA-banner arrow was removed.
> - **Investment PARKED** ([Investment.tsx](resources/js/Pages/Public/Investment.tsx)): fully built but `/investment` is disabled (nav item + route + import all commented). See the Investment build-progress entry for the 3 spots to uncomment. Reason: content/design review before launch.
> - **Header mobile menu polished** (innovation #21): `AnimatePresence` height-auto open, explicit per-item staggered slide-in (variant propagation was leaving items at `opacity:0`), active row = filled `primary-strong` pill, hairline dividers. Fixed: navbar backdrop gradient constrained to `top-0 h-24` so it no longer paints over the open panel on light pages.
> - **Home hero refresh**: swapped to the wider `Artboard 1.webp` villa (transparent, over the sky gradient), sky gradient set to `from-[#7DB5E2] to-white`, villa darkened via `brightness-75` filter (only the villa pixels, not the gradient). Gotcha: designer webps ship with a baked uniform alpha (~58% opaque) that washes out over white — flatten with `sharp().removeAlpha()` before use; and a vignette-alpha image flattens to dark edges, so prefer the clean full-bleed render.
>
> **Earlier — 2026-06-01 — Properties page (listings) shipped + homepage mobile polish.**
> - **Properties page is live** ([PropertiesController](app/Http/Controllers/PropertiesController.php) + [Pages/Public/Properties.tsx](resources/js/Pages/Public/Properties.tsx), route `GET /properties`). Hero matches `prop_hero.svg` (top-rounded cropped banner), a redesigned **two-tier filter** (segmented For Sale/For Rent + "Available only" switch + development **group** chips backed by the new nullable `projects.group` column), `PROJECTS SHOWCASE.svg` cards (whole-card link, no button), client-side **pagination 6/page**, and a `HERO SECTION.svg` **bottom CTA image banner** (all-corners rounded, image at reduced opacity, centered text + arrow). New **innovations #17 (filter system) + #18 (rounded-image banner geometry)**; `projects.group` added to schema decisions. **Detail page `/properties/{slug}` still TODO** (cards link to it but it 404s). Migration `2026_06_01_000002_add_group_to_projects_table`; `ProjectsSeeder` now assigns groups + marks dabouq-5 `sold` / dabouq-8 `reserved` to demo availability dimming.
> - **Homepage mobile polish:** Head of Departments, Testimonials client cards, and Value Proposition cards all go **2-up on mobile** (testimonials 4-up from `sm`); avatar/circle sizing made fully proportional (then mobile-seated); Properties-for-Sale card image height matched to the Rent card on mobile. **Testimonials client card rebuilt** as a perfect-semicircle **dome (`aspect-2/1 rounded-t-full`) + content-driven body** so long quotes never overflow and the avatar never drifts (replaces the fixed `aspect-290/486` + absolute-% layout). Hero villa now **animates up on load** (framer-motion, ~1.8–3s). Buy-Early leaf strip filled with a masked photo. **Header**: language switcher is now an `AR`/`EN` pill, nav pushed right + all-white on the scrolled (light) state, navbar backdrop gradient deepened to `#5299CC`, and a **mobile hamburger menu** added.
> **Earlier — 2026-05-31 — Header + Hero polish.**
> - **Header** now hides on scroll down and slides back in on scroll up (300ms transform, `SCROLL_DELTA=6` jitter floor, `TOP_THRESHOLD=80` always-visible-near-top band that also catches overscroll bounce). On light sections the header also shows a brand→white backdrop gradient (`bg-linear-to-b from-primary to-white`) layered as an absolute child so it can fade via opacity when `data-nav-bg` flips, leaving the hero's own gradient untouched. Innovation #6 extended with both.
> - **Hero** got a real 3D villa render (`hero-villa-trimmed.webp`) replacing the placeholder SVG. Designer's WebP shipped 1280×744 with ~300px of transparent padding at the top — invisible to CSS, so `mt-X` margin was being silently inflated. Trimmed via `sharp.trim()` to 1280×443 (sibling file because Vite's dev server held the original under EPERM on Windows); the new asset is what the page loads. CSS gap is now ~`mt-4 sm:mt-6 lg:mt-8` and maps 1:1 to the actual visual gap. Width also bumped to `max-w-7xl 3xl:max-w-375` so the villa fills the hero band on large monitors instead of floating in empty sky. New **innovation #16** captures the trim-before-shipping lesson.
>
> Earlier (2026-05-23) — Admin-side alignment with the new homepage Footer:
> - **Settings → Media Room** now exposes the actual fields `InstagramService` reads (`instagram_access_token` + `instagram_user_id`); the dead `instagram_embed_url` iframe input was removed.
> - **Dashboard health** gained a "Media Room IG Grid Disabled" badge for empty IG creds; the social-URL warning's `$socialKeys` array was trimmed to the 5 platforms the Footer actually displays (Instagram URL dropped). Facebook labels in both Settings and Dashboard are now "Meta (Facebook)" to match the Footer's "Meta" terminology.
> - **Footer copy is now CMS-editable** — new "footer" pseudo-page in the `pages` table + 7 seeded rows in `site_content` (subscribe.label/cta, sections.\*, copyright.\*). `HandleInertiaRequests` shares `footerContentEn` + `footerContentAr` on every request; `Footer.tsx` uses a `makeFooterText` helper for CMS-first / i18n-fallback resolution. Admin Content editor lists the Footer accordion under its own `PanelBottom` icon. New innovation **#15** documents the layout-pseudo-page pattern.
> - **Section visibility now actually works.** The toggles in the Content editor have always set `is_visible=false` correctly in DB, but the public homepage was ignoring the flag. `Pages/Public/Home.tsx` now wraps every section render with a `sectionVisible(section)` predicate. Innovation #5 updated to reflect this (replaces the previous claim that it "just worked").
> - **Content editor UX:** the page-selector nav and the live preview pane are both sticky now — nav at `top-16` (clears the admin h-16 top bar), preview at `top-32` (clears nav + admin bar). Friendlier section labels via `SECTION_LABEL_OVERRIDES` in [Content.tsx](resources/js/Pages/Admin/Content.tsx).
>
> Earlier (2026-05-20): Footer column grid forced to 2-col from the smallest mobile width up. Earlier (2026-05-18): Footer rebuilt from `Group 27.svg`. Pending cleanup: unused `cloud-pan` keyframes + `animate-cloud-pan*` utilities in [resources/css/app.css](resources/css/app.css), unreferenced `public/images/home/footer-clouds-2.png`, and orphan `home/stats` rows in the SiteContentSeeder (8 rows seeded but no `<Stats>` component reads them).

---

## Commit Message Convention

Format: `type: short description`

Types:
- `init` — project scaffolding, initial setup
- `feat` — new feature or functionality
- `fix` — bug fix
- `refactor` — code restructure without behavior change
- `style` — visual/UI changes only
- `doc` — documentation updates
- `chore` — dependency updates, config changes, cleanup

Rules:
- Lowercase, no period at the end
- Keep under 72 characters
- Use present tense ("add" not "added")
- Be specific about what changed, not generic ("fix: resolve 419 CSRF error on language toggle" not "fix: fix bug")

## Collaboration — Commit Message Suggestions

After completing any task that touches code, end the reply with a one-line suggested commit message in the project's conventional style (`type(scope): summary`, lowercase subject, imperative mood — e.g. `feat(admin/applications): mark new applications viewed on open`). Do NOT run the commit — just suggest the message so the user can copy/paste it. Skip this when the task was purely exploratory (reading, answering questions) or when no files changed.


---

## Local Development

- **Start**: `php artisan serve` + `npm run dev` (both from project root)
- **URL**: `http://localhost:8000` (Laravel serves everything)
- **Database**: SQLite for local dev (`database/database.sqlite`), MySQL for production. Switch via `DB_CONNECTION` env var.
- **Reset DB**: `php artisan migrate:fresh --seed` — wipes + re-runs all migrations + seeds
- **Default admin**: `admin@skyamman.com` / `password` (created by `AdminUserSeeder`)
- **Admin dashboard**: `http://localhost:8000/admin/login`
- **Build**: `npm run build` (outputs client to `public/build/` + SSR to `bootstrap/ssr/`)
- **Backend tests**: `php artisan test` (PHPUnit, in-memory SQLite — no build or running server needed)
- **JS unit tests**: `npm run test:js` (Vitest; `npm run test:js:watch` for watch mode)
- **E2E tests**: `npm run test:e2e` (Playwright — needs built assets + a seeded DB; boots `php artisan serve` itself or reuses a running one). First run: `npx playwright install chromium`. See the **Testing & CI** section for the full picture.
- **Build deps gotcha**: If `npm install` ever leaves you without vite (because of `NODE_ENV=production`), the project's `.npmrc` should prevent it. If you do hit it, run `npm install --include=dev`.
- **SSR in dev**: Not active — `npm run dev` uses CSR only. SSR applies to production builds.
- **SSR toggle**: Set `INERTIA_SSR_ENABLED=false` in `.env` to disable SSR even in production.
- **Turnstile in dev**: Leave `TURNSTILE_SITE_KEY` empty to disable the widget entirely (server-side `TurnstileVerifier` also no-ops). Or use Cloudflare's official always-pass test keys (`1x00000000000000000000AA` / `1x0000000000000000000000000000000AA`) so the widget renders without polluting prod analytics.
- **Mail in dev**: `MAIL_MAILER=log` writes emails to `storage/logs/laravel.log` — no Resend key needed.
