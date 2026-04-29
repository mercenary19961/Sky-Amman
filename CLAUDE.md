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
3. **Investment** — **content-only editorial page** (NOT a listings page). Explains why to invest in Amman, with CTAs.
4. **Self Build** — **content-only service page**. Renders a 7-step Process Flow timeline (Land Selection → Legal Verification → Engineering Design → Specifications → Execution → Documentation → Handover) from `site_content` rows.
5. **Security with Sky Amman** — content-only page (financial + legal + construction safety bullets).
6. **About Us** — content-only.
7. **Contact Us** — form-based, single contact submission inbox.

All forms across the site funnel into a **single Contact Submissions inbox** (no newsletter). A "Contact about this project" CTA on a Property detail page pre-fills the form and stamps `project_id` so the admin sees inquiries-per-project.

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
- **`change_logs`** — Undo/Revert system (port `UndoService` from Nuor when ready).

### Schema decisions to remember (for future agents)

- **Why `projects` is unified** — the Figma showed Property cards and Investment Opportunities cycling through one carousel with filter pills. The original CLAUDE.md plan had three separate tables; collapsing was the right call.
- **`investment_opportunities` table doesn't exist** — investment is a **category** on `projects`. The `/investment` page is editorial content via `site_content` only.
- **`self_build_packages` table doesn't exist** — Self Build is a service page. The 7 process-flow steps are 7 `site_content` rows under `page='self_build', section='process'`.
- **`floors` + `completion_year`** are on `projects` (caught from the DABOUQ 5 - VILLA D detail frame, not in the original plan).

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
- Custom keyframes in [resources/css/app.css](resources/css/app.css): `toast-slide-in` for ToastContext, `cloud-drift` for the Footer parallax cloud layer (90s linear infinite, 200% bg-width for seamless loop).

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

### Mail (Resend)
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
resources/js/Pages/Public/         → Public page components (Home.tsx)
resources/js/Pages/Admin/          → Admin page components (Login.tsx, Dashboard.tsx)
resources/js/Layouts/              → PublicLayout, AdminLayout
resources/js/Components/Layout/    → Header (transparent + color-aware), Footer (parallax villa+clouds), AdminSidebar, SocialIcons (inline brand SVGs)
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
resources/css/app.css              → Tailwind import + @theme tokens + RTL font swap + cloud-drift / toast-slide-in keyframes

public/images/home/                → Seeded SVGs: hero-villa, footer-villa, footer-clouds, buy-early-strip
public/images/projects/            → Seeded SVGs: dabouq-3..6 (placeholder renders until Media Library is live)

app/Models/                        → User, Page, SiteContent, Media, Setting, Project, ProjectImage, ContactSubmission, ChangeLog
app/Http/Controllers/              → HomeController (homepage with both EN/AR content bundles + featured projects + media embeds), LocaleController (POST /locale/{lang})
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

**Business** (CRUD listings)
- **Projects** — single unified CRUD (gallery upload + reorder + delete, category, listing_status, location, area, bedrooms, bathrooms, floors, completion_year, per-listing SEO with OG image picked from gallery, inquiries counter). **All admin-controlled imagery lives here.**

**Communication**
- Contact Submissions (single inbox, optional project linkage)

**System**
- Settings (admin-only) — contact info, social links, default SEO meta, lead routing map, site-wide OG defaults (URL field)
- Users (admin-only) — admin / editor roles
- Change Log + Undo (admin-only) — port the `UndoService` + `ChangeLogService` from Nuor Steel when ready

**Image strategy:** Page-structural / decorative imagery (`hero-villa`, `footer-villa`, `footer-clouds`, `buy-early-strip`, etc.) stays committed under [public/images/home/](public/images/home/) — code-managed, never admin-managed. There is **no standalone Media Library** in the sidebar. Project gallery uploads use [`Media::storeFile()`](app/Models/Media.php) inside the project edit form. The `site_content.media_id` and `pages.og_image_id` columns remain in the schema as nullable but stay unused (cheap optionality if the policy ever changes).

### Admin roles

- **Admin**: Full access (users, settings, change log)
- **Editor**: Content management only (no users / settings / change log). The `adminOnly` flag on sidebar items hides them from editors.

### Innovations (vs. Nuor Steel)

These extend the Nuor playbook for real-estate-specific needs.

1. **Text-only Site Content editor** — `site_content` is bilingual key-value rows with per-row visibility. The schema has an optional `media_id` FK (carried over from initial design) but the admin UI does **not** expose it: structural/decorative imagery is code-managed under `public/images/home/`, not CMS-managed.
2. **SEO per page + per project** — every public page (via `pages` table) and every project (via `projects` table) has editable `seo_title_en/ar`, `seo_description_en/ar`. OG image policy is split: **per-project OG is picked from the project's own gallery** (no separate upload step), while site-wide and per-page OG are plain URL fields (paste a hosted/CDN image URL). Defaults fall back to site-wide Settings.
3. **Lead routing by request type** — Contact form has a `request_type` enum (Buy / Rent / Build / Investment / General). Settings page maps each type → recipient email(s) via the `lead_routing` JSON setting. The Mailable picks recipients dynamically at send time.
4. **Per-project inquiries** — Contact submissions can carry an optional `project_id` FK. "Contact about this project" CTAs pre-fill the form. Admin project listings show an inquiries count badge per row.
5. **Section show/hide toggles** — `site_content` rows have an `is_visible` boolean. Admin can hide an entire homepage section (e.g. "Stats") without a code deploy. Public pages skip rendering when `is_visible=false`. Page-level visibility lives on `pages.is_visible`.
6. **Color-aware transparent navbar** — [Header](resources/js/Components/Layout/Header.tsx) is `position: fixed` and overlays section content. Sections opt into a navbar tone by setting `data-nav-bg="dark"` (or `"light"`) on their root element. The header samples the section currently overlapping its centerline (32px down) on scroll/resize and swaps logo + link + toggle colors accordingly. Adding a section with a dark hero? Add `data-nav-bg="dark"` to its wrapper. Pages without a top hero must add their own top padding for the navbar height.
7. **Health badges with deep-link Fix → links** — Dashboard surfaces content gaps (missing project images/SEO, hidden pages/sections, unset social URLs, missing contact info, missing default SEO title). Every "Fix" link carries a `#section-X` hash. Edit pages read the hash in `useEffect` on mount and call `scrollIntoView({ behavior: 'smooth' })`; the Site Content accordion additionally `setExpandedPage(slug)` so the hash both opens the correct page AND scrolls to it (200ms delay to let the accordion DOM expand first). Settings page has `id="section-{group}"` on each group card; project Form has `id="section-seo"` / `id="section-gallery"`.
8. **Collapsible sidebar + mobile slide-in (ported from Nuor)** — Desktop chevron toggles between full-width (`w-64`) and icon-only (`w-16`); state persists across Inertia visits via a module-level `globalSidebarCollapsed` in [AdminLayout.tsx](resources/js/Layouts/AdminLayout.tsx). Mobile renders the sidebar `fixed` off-screen with a backdrop overlay; the layout's hamburger button slides it in. `useEffect` resets mobile state when the viewport hits `lg`. The page-icon next to the title is auto-resolved from a `PAGE_ICONS` URL→icon map in AdminLayout — adding a new admin route doesn't require touching every page component, just append one entry.

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

`DefaultSettingsSeeder` seeds empty social URL settings. The [Footer](resources/js/Components/Layout/Footer.tsx) only renders icons for configured platforms — empty values are filtered out. Fill them in via Settings before launch (LinkedIn, Instagram are the priorities).

### Inertia v3 differences vs Nuor Steel's v2

`inertiajs/inertia-laravel` is on `^3.0` (Nuor Steel uses `^2.0`). Two real differences bit during the homepage build — don't blindly copy snippets from Nuor:

1. **Event renamed:** The 419/CSRF auto-reload listener is `router.on('httpException', ...)` in v3, not `router.on('invalid', ...)`. Same payload shape (`event.detail.response.status`), same `event.preventDefault()` pattern. Applied in [resources/js/app.tsx](resources/js/app.tsx).
2. **Page resolver must unwrap `.default`:** v3's `resolve` callback expects `Promise<Component>`, but `resolvePageComponent` returns `Promise<{ default: Component }>`. Chain `.then((m) => m.default)` in both [app.tsx](resources/js/app.tsx) and [ssr.tsx](resources/js/ssr.tsx). Without the unwrap you get a runtime "page is not a function" error during hydration.

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
- [x] PagesSeeder — 7 pages
- [x] SiteContentSeeder — 68 rows covering all pages
- [x] ProjectsSeeder — 4 DABOUQ villa projects (mix of under_development / ready / investment) — featured for the homepage Project Showcase carousel

### Public Pages (vertical builds, one at a time — TODO)
- [x] Homepage — 8 sections (Hero, InvestmentBanner, AssurancePillars scrollytelling, ProjectShowcase, ValueProposition, MediaRoom, LocationMap) wired through HomeController with EN+AR bundles, featured projects from `projects` table, and Settings-driven map / media-room embeds. Transparent color-aware navbar + parallax villa-and-clouds footer.
- [ ] Properties (listings + detail) — pulls from `projects` filtered by category
- [ ] Investment (content-only editorial)
- [ ] Self Build (content-only with 7-step Process Flow timeline)
- [ ] Security with Sky Amman (content-only)
- [ ] About Us (content-only)
- [ ] Contact Us (with Turnstile + lead routing)

### Admin Panel (TODO — in build order)
- [x] Login page (with Turnstile)
- [x] Dashboard with content-health badges (project image/SEO gaps, hidden pages/sections, unset social URLs, missing contact info, missing default SEO title) — every "Fix" link deep-links to its target section via `#section-X` hash anchor
- [x] **Projects CRUD** — list with filters/search/active toggle, Form (Basic Info / Listing Details / Location / Property Specs / SEO / Gallery sections with icon-headed dividers), gallery upload + reorder + delete, per-listing SEO with OG picked from gallery, soft-delete + Trash with restore + force-delete
- [x] **Site Content editor** — bilingual side-by-side accordion (one per public page), text-only, per-row visibility, per-page SEO with amber "No SEO title" badge, hash-anchor deep-linking opens + scrolls to the target page
- [x] **Settings** — 2-column grid of group cards with icon headers + descriptions + group-specific field layouts; live amber warning badges for unset critical values (social URLs not set, phone/email missing, default SEO title missing); lead routing JSON; OG as URL field
- [x] **AdminLayout + AdminSidebar** — collapsible desktop sidebar (chevron toggle, persistent across Inertia visits), mobile slide-in with backdrop, auto-resolved page icon next to title
- [ ] Contact Submissions inbox (with per-project linkage) — depends on public Contact form being live
- [ ] Users (admin-only)
- [ ] Change Log + Undo (admin-only) — port `UndoService` + `ChangeLogService` from Nuor (last)

### Infrastructure (TODO)
- [x] SSR setup (build-time + runtime toggle via `INERTIA_SSR_ENABLED`)
- [ ] Railway deployment (Railpack startup, env vars)
- [ ] Cloudflare DNS + proxy + Turnstile site keys
- [ ] Resend domain DNS verification (DKIM/SPF/DMARC)
- [ ] Data migrations for production seeding
- [ ] sitemap.xml + robots.txt routes
- [ ] JSON-LD structured data (Organization, RealEstateListing, BreadcrumbList)
- [ ] Hreflang tags

### Remaining
- [ ] Code splitting (verify `manualChunks` chunks under 500kB — already configured, currently vendor-react @ 213kB largest)
- [ ] Replace seeded placeholder content (phone "+962 6 000 0000", empty social URLs) with real values
- [ ] Final testing & go-live

> **Last updated:** 2026-04-29 — admin panel core shipped (Projects CRUD, Site Content editor, Settings, Dashboard health badges) with collapsible sidebar + hash-anchor deep-linking patterns. Remaining admin work: Contact Submissions inbox (gated on public Contact form), Users, Change Log/Undo.

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
- **Build deps gotcha**: If `npm install` ever leaves you without vite (because of `NODE_ENV=production`), the project's `.npmrc` should prevent it. If you do hit it, run `npm install --include=dev`.
- **SSR in dev**: Not active — `npm run dev` uses CSR only. SSR applies to production builds.
- **SSR toggle**: Set `INERTIA_SSR_ENABLED=false` in `.env` to disable SSR even in production.
- **Turnstile in dev**: Leave `TURNSTILE_SITE_KEY` empty to disable the widget entirely (server-side `TurnstileVerifier` also no-ops). Or use Cloudflare's official always-pass test keys (`1x00000000000000000000AA` / `1x0000000000000000000000000000000AA`) so the widget renders without polluting prod analytics.
- **Mail in dev**: `MAIL_MAILER=log` writes emails to `storage/logs/laravel.log` — no Resend key needed.
