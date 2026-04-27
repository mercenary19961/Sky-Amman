<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocaleController extends Controller
{
    /**
     * Persist the user's locale choice in the server session.
     * Hit by a fetch POST from LanguageContext on toggle (no Inertia visit).
     */
    public function set(Request $request, string $locale): JsonResponse
    {
        if (! in_array($locale, ['en', 'ar'], true)) {
            return response()->json(['ok' => false], 422);
        }

        $request->session()->put('locale', $locale);

        return response()->json(['ok' => true, 'locale' => $locale]);
    }
}
