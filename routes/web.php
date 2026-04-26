<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\LocaleController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('Public/Welcome'))->name('home');

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

// Admin shell — concrete CRUD routes will be added per-resource in later waves.
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', fn () => Inertia::render('Admin/Dashboard'))->name('dashboard');
});
