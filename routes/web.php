<?php

use App\Http\Controllers\Admin\ChangeLogController;
use App\Http\Controllers\Admin\ConsentController as AdminConsentController;
use App\Http\Controllers\Admin\ContactSubmissionController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\ProjectImageController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\SiteContentController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\DepartmentMemberController;
use App\Http\Controllers\Admin\GalleryImageController;
use App\Http\Controllers\Admin\NewsletterSubscriberController;
use App\Http\Controllers\Admin\ManagedImageController;
use App\Http\Controllers\Admin\TestimonialController;
use App\Http\Controllers\Admin\TestimonialVideoController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\ConsentController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\PrivacyController;
use App\Http\Controllers\PropertiesController;
// Investment page parked — route + import disabled for now (see CLAUDE.md). Re-enable both to relist.
// use App\Http\Controllers\InvestmentController;
use App\Http\Controllers\SelfBuildController;
use App\Http\Controllers\AboutController;
use App\Http\Controllers\SecurityController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\VideoController;
use App\Http\Controllers\MediaServeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Crawlers — no throttle, no session, no Inertia.
Route::get('/sitemap.xml', [SitemapController::class, 'sitemap'])->name('sitemap');
Route::get('/robots.txt', [SitemapController::class, 'robots'])->name('robots');

// Public pages get a generous per-IP ceiling (defense-in-depth for the dynamic
// DB/Instagram-backed routes if the origin is hit directly, bypassing Cloudflare).
// 120/min is far above human browsing; it only bites scraping/flood traffic.
Route::middleware('throttle:120,1')->group(function () {
    Route::get('/', [HomeController::class, 'index'])->name('home');
    Route::get('/properties', [PropertiesController::class, 'index'])->name('properties');
    Route::get('/properties/{slug}', [PropertiesController::class, 'show'])
        ->where('slug', '[a-z0-9-]+')
        ->name('properties.show');
    Route::get('/self-build', [SelfBuildController::class, 'show'])->name('self-build');
    Route::get('/security', [SecurityController::class, 'show'])->name('security');
    Route::get('/about', [AboutController::class, 'show'])->name('about');
    Route::get('/contact', [ContactController::class, 'show'])->name('contact');
    Route::get('/privacy', [PrivacyController::class, 'show'])->name('privacy');
});

// Investment — content-only editorial page (why invest in Amman).
// PARKED for now — route disabled (see CLAUDE.md). Uncomment + restore the import
// to relist (add it inside the throttled public-pages group above).
// Route::get('/investment', [InvestmentController::class, 'show'])->name('investment');

// Contact form submission — Turnstile-gated server-side; tight 5/min anti-spam
// limit (kept separate from the public-pages group so the limits don't stack).
Route::post('/contact', [ContactController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('contact.submit');

// Public media serving — scoped to image/pdf MIME types, SVG excluded.
// Generous per-IP/per-user ceiling: image-heavy admin pages (the Gallery loads
// 100+ tiles) must not 429, but a direct-origin scraping flood gets capped.
// (Cloudflare edge-caches these, so origin rarely sees repeat hits.)
Route::get('/media/{id}', [MediaServeController::class, 'show'])
    ->middleware('throttle:600,1')
    ->name('media.serve')
    ->where('id', '[0-9]+');

// Code-managed video streaming with Range support (see VideoController).
// Generous — seeking fires several Range requests per play.
Route::get('/video/{filename}', [VideoController::class, 'show'])
    ->middleware('throttle:120,1')
    ->where('filename', '[A-Za-z0-9._-]+\.(mp4|webm|ogg|mov)')
    ->name('video.serve');

// Locale toggle — hit by LanguageContext via fetch POST (not an Inertia visit).
// The only public write that wasn't rate-limited; capped to stop session-write spam.
Route::post('/locale/{locale}', [LocaleController::class, 'set'])
    ->middleware('throttle:30,1')
    ->whereIn('locale', ['en', 'ar'])
    ->name('locale.set');

// Newsletter sign-up — footer "Subscribe" widget. Rate-limited like all public POSTs.
Route::post('/newsletter', [NewsletterController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('newsletter.subscribe');

// Cookie-consent choice from the banner. A looser limit than the lead forms:
// this is one click by an ordinary visitor, and a throttled-out consent POST
// means the banner can't record a decision the visitor already made.
Route::post('/consent', [ConsentController::class, 'store'])
    ->middleware('throttle:20,1')
    ->name('consent.store');

// Auth (admin login). Per-IP throttle layered with the per-email throttle in
// LoginController to defend against both IP rotation and email fanning.
Route::middleware('guest')->group(function () {
    Route::get('/admin/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/admin/login', [LoginController::class, 'login'])
        ->middleware('throttle:5,1')
        ->name('login.submit');

    // Password reset — Turnstile-gated request, then a tokenized reset form.
    // Both POSTs are rate-limited like every public form.
    Route::get('/admin/forgot-password', [ForgotPasswordController::class, 'show'])->name('password.request');
    Route::post('/admin/forgot-password', [ForgotPasswordController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('password.email');
    Route::get('/admin/reset-password/{token}', [ResetPasswordController::class, 'show'])->name('password.reset');
    Route::post('/admin/reset-password', [ResetPasswordController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('password.update');
});

Route::post('/admin/logout', [LoginController::class, 'logout'])
    ->middleware('auth')
    ->name('logout');

Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Site Content — editors and admins can manage content.
    Route::get('/content', [SiteContentController::class, 'index'])->name('content.index');
    Route::put('/content/{page}', [SiteContentController::class, 'update'])->name('content.update');

    // Testimonial videos — content management (editors + admins).
    Route::get('/testimonial-videos', [TestimonialVideoController::class, 'index'])->name('testimonial-videos.index');
    Route::post('/testimonial-videos', [TestimonialVideoController::class, 'store'])->name('testimonial-videos.store');
    Route::post('/testimonial-videos/reorder', [TestimonialVideoController::class, 'reorder'])->name('testimonial-videos.reorder');
    Route::post('/testimonial-videos/publish', [TestimonialVideoController::class, 'publish'])->name('testimonial-videos.publish');
    Route::put('/testimonial-videos/{id}', [TestimonialVideoController::class, 'update'])->name('testimonial-videos.update')->where('id', '[0-9]+');
    Route::delete('/testimonial-videos/{id}', [TestimonialVideoController::class, 'destroy'])->name('testimonial-videos.destroy')->where('id', '[0-9]+');

    // Projects Gallery — editor-curated images (pooled with sold-project images).
    Route::get('/gallery', [GalleryImageController::class, 'index'])->name('gallery.index');
    Route::post('/gallery/settings', [GalleryImageController::class, 'updateSettings'])->name('gallery.settings');
    Route::post('/gallery/toggle', [GalleryImageController::class, 'toggleHidden'])->name('gallery.toggle');
    Route::post('/gallery', [GalleryImageController::class, 'store'])->name('gallery.store');
    Route::delete('/gallery/{id}', [GalleryImageController::class, 'destroy'])->name('gallery.destroy')->where('id', '[0-9]+');

    // Page images — replaceable decorative image slots (About "Crafted" cluster, …).
    Route::get('/page-images', [ManagedImageController::class, 'index'])->name('page-images.index');
    Route::post('/page-images/{key}', [ManagedImageController::class, 'update'])->name('page-images.update');
    Route::delete('/page-images/{key}', [ManagedImageController::class, 'reset'])->name('page-images.reset');

    // Head of Departments team members (image + bilingual name/role).
    Route::get('/department-members', [DepartmentMemberController::class, 'index'])->name('department-members.index');
    Route::post('/department-members', [DepartmentMemberController::class, 'store'])->name('department-members.store');
    Route::post('/department-members/reorder', [DepartmentMemberController::class, 'reorder'])->name('department-members.reorder');
    Route::post('/department-members/{id}/toggle', [DepartmentMemberController::class, 'toggleActive'])->name('department-members.toggle')->where('id', '[0-9]+');
    Route::put('/department-members/{id}', [DepartmentMemberController::class, 'update'])->name('department-members.update')->where('id', '[0-9]+');
    Route::delete('/department-members/{id}', [DepartmentMemberController::class, 'destroy'])->name('department-members.destroy')->where('id', '[0-9]+');

    // Client testimonials (image + bilingual name/quote) — content management.
    Route::get('/testimonials', [TestimonialController::class, 'index'])->name('testimonials.index');
    Route::post('/testimonials', [TestimonialController::class, 'store'])->name('testimonials.store');
    Route::post('/testimonials/reorder', [TestimonialController::class, 'reorder'])->name('testimonials.reorder');
    Route::post('/testimonials/{id}/toggle', [TestimonialController::class, 'toggleActive'])->name('testimonials.toggle')->where('id', '[0-9]+');
    // Image upload needs multipart, so update is POST + _method spoofing from the client.
    Route::put('/testimonials/{id}', [TestimonialController::class, 'update'])->name('testimonials.update')->where('id', '[0-9]+');
    Route::delete('/testimonials/{id}', [TestimonialController::class, 'destroy'])->name('testimonials.destroy')->where('id', '[0-9]+');

    // Newsletter Subscribers — capture-only list (editors + admins).
    Route::get('/newsletter', [NewsletterSubscriberController::class, 'index'])->name('newsletter.index');
    Route::get('/newsletter/export', [NewsletterSubscriberController::class, 'export'])->name('newsletter.export');
    Route::delete('/newsletter/{id}', [NewsletterSubscriberController::class, 'destroy'])->name('newsletter.destroy')->where('id', '[0-9]+');

    // Contact Submissions — single inbox for all public forms (editors + admins).
    // Literal segments (`trash`, `export`) must precede the {id} wildcard.
    Route::get('/contacts', [ContactSubmissionController::class, 'index'])->name('contacts.index');
    Route::get('/contacts/export', [ContactSubmissionController::class, 'export'])->name('contacts.export');
    Route::get('/contacts/trash', [ContactSubmissionController::class, 'trash'])->name('contacts.trash');
    Route::get('/contacts/{id}', [ContactSubmissionController::class, 'show'])->name('contacts.show')->where('id', '[0-9]+');
    Route::post('/contacts/{id}/read', [ContactSubmissionController::class, 'toggleRead'])->name('contacts.read')->where('id', '[0-9]+');
    Route::post('/contacts/{id}/archive', [ContactSubmissionController::class, 'toggleArchive'])->name('contacts.archive')->where('id', '[0-9]+');
    Route::delete('/contacts/{id}', [ContactSubmissionController::class, 'destroy'])->name('contacts.destroy')->where('id', '[0-9]+');
    Route::post('/contacts/{id}/restore', [ContactSubmissionController::class, 'restore'])->name('contacts.restore')->where('id', '[0-9]+');
    Route::delete('/contacts/{id}/force', [ContactSubmissionController::class, 'forceDestroy'])->name('contacts.force-destroy')->where('id', '[0-9]+');

    // Settings + Users — admin only.
    Route::middleware('admin')->group(function () {
        // Reset all Site Content text back to the shipped defaults (safeguard).
        Route::post('/content/reset', [SiteContentController::class, 'reset'])->name('content.reset');

        Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
        Route::put('/settings', [SettingController::class, 'update'])->name('settings.update');

        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{id}', [UserController::class, 'update'])->name('users.update')->where('id', '[0-9]+');
        Route::post('/users/{id}/toggle', [UserController::class, 'toggleStatus'])->name('users.toggle')->where('id', '[0-9]+');
        Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('users.destroy')->where('id', '[0-9]+');

        // Cookie-consent log. Admin-only: it holds visitor IPs and is the
        // evidence trail, so it sits with the other System-group screens.
        Route::get('/consent', [AdminConsentController::class, 'index'])->name('consent.index');

        // Change Log + Revert (audit history).
        Route::get('/change-log', [ChangeLogController::class, 'index'])->name('change-log.index');
        Route::delete('/change-log/undo/{modelType}', [ChangeLogController::class, 'dismissUndo'])->name('change-log.undo-dismiss')->where('modelType', '[a-z_]+');
        Route::post('/change-log/{id}/revert', [ChangeLogController::class, 'revert'])->name('change-log.revert')->where('id', '[0-9]+');
        Route::delete('/change-log/{id}', [ChangeLogController::class, 'destroy'])->name('change-log.destroy')->where('id', '[0-9]+');
    });

    // Projects — literal paths (trash, create) must come before the {id} wildcard.
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::get('/projects/trash', [ProjectController::class, 'trash'])->name('projects.trash');
    Route::get('/projects/create', [ProjectController::class, 'create'])->name('projects.create');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{id}/edit', [ProjectController::class, 'edit'])->name('projects.edit')->where('id', '[0-9]+');
    Route::get('/projects/{id}', [ProjectController::class, 'show'])->name('projects.show')->where('id', '[0-9]+');
    Route::post('/projects/{id}/status', [ProjectController::class, 'updateStatus'])->name('projects.status')->where('id', '[0-9]+');
    Route::put('/projects/{id}', [ProjectController::class, 'update'])->name('projects.update')->where('id', '[0-9]+');
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy'])->name('projects.destroy')->where('id', '[0-9]+');
    Route::post('/projects/{id}/restore', [ProjectController::class, 'restore'])->name('projects.restore')->where('id', '[0-9]+');
    Route::delete('/projects/{id}/force', [ProjectController::class, 'forceDestroy'])->name('projects.force-destroy')->where('id', '[0-9]+');

    // Project images — JSON API used by the gallery dropzone widget.
    Route::post('/projects/{id}/images', [ProjectImageController::class, 'store'])->name('projects.images.store')->where('id', '[0-9]+');
    Route::post('/projects/{id}/images/reorder', [ProjectImageController::class, 'reorder'])->name('projects.images.reorder')->where('id', '[0-9]+');
    Route::delete('/projects/{id}/images/{imageId}', [ProjectImageController::class, 'destroy'])->name('projects.images.destroy')->where(['id' => '[0-9]+', 'imageId' => '[0-9]+']);
});
