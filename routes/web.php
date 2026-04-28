<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\ProjectImageController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\SiteContentController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\MediaServeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');

// Public media serving — scoped to image/pdf MIME types, SVG excluded.
Route::get('/media/{id}', [MediaServeController::class, 'show'])
    ->name('media.serve')
    ->where('id', '[0-9]+');

// Locale toggle — hit by LanguageContext via fetch POST (not an Inertia visit).
Route::post('/locale/{locale}', [LocaleController::class, 'set'])
    ->whereIn('locale', ['en', 'ar'])
    ->name('locale.set');

// Auth (admin login). Per-IP throttle layered with the per-email throttle in
// LoginController to defend against both IP rotation and email fanning.
Route::middleware('guest')->group(function () {
    Route::get('/admin/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/admin/login', [LoginController::class, 'login'])
        ->middleware('throttle:5,1')
        ->name('login.submit');
});

Route::post('/admin/logout', [LoginController::class, 'logout'])
    ->middleware('auth')
    ->name('logout');

Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Site Content — editors and admins can manage content.
    Route::get('/content', [SiteContentController::class, 'index'])->name('content.index');
    Route::put('/content/{page}', [SiteContentController::class, 'update'])->name('content.update');

    // Settings — admin only.
    Route::middleware('admin')->group(function () {
        Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
        Route::put('/settings', [SettingController::class, 'update'])->name('settings.update');
    });

    // Projects — literal paths (trash, create) must come before the {id} wildcard.
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::get('/projects/trash', [ProjectController::class, 'trash'])->name('projects.trash');
    Route::get('/projects/create', [ProjectController::class, 'create'])->name('projects.create');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{id}/edit', [ProjectController::class, 'edit'])->name('projects.edit')->where('id', '[0-9]+');
    Route::put('/projects/{id}', [ProjectController::class, 'update'])->name('projects.update')->where('id', '[0-9]+');
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy'])->name('projects.destroy')->where('id', '[0-9]+');
    Route::post('/projects/{id}/restore', [ProjectController::class, 'restore'])->name('projects.restore')->where('id', '[0-9]+');
    Route::delete('/projects/{id}/force', [ProjectController::class, 'forceDestroy'])->name('projects.force-destroy')->where('id', '[0-9]+');

    // Project images — JSON API used by the gallery dropzone widget.
    Route::post('/projects/{id}/images', [ProjectImageController::class, 'store'])->name('projects.images.store')->where('id', '[0-9]+');
    Route::post('/projects/{id}/images/reorder', [ProjectImageController::class, 'reorder'])->name('projects.images.reorder')->where('id', '[0-9]+');
    Route::delete('/projects/{id}/images/{imageId}', [ProjectImageController::class, 'destroy'])->name('projects.images.destroy')->where(['id' => '[0-9]+', 'imageId' => '[0-9]+']);
});
