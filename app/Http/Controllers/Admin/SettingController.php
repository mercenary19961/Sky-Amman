<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\ChangeLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(): Response
    {
        $settings = Setting::orderBy('group')->orderBy('key')
            ->get()
            ->groupBy('group');

        return Inertia::render('Admin/Settings', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request, ChangeLogService $changeLog): RedirectResponse
    {
        $request->validate([
            'settings'         => 'required|array',
            'settings.*.key'   => 'required|string|exists:settings,key',
            'settings.*.value' => 'nullable|string|max:8000',
        ]);

        // Per-type validation (url/email/number/json) — the base rule only checks
        // "is a string". Without this an admin could store e.g. a `javascript:` URL
        // that the footer renders as an href (stored XSS).
        $this->validateByType($request->settings);

        // Snapshot only the keys that actually change, for the audit trail + revert.
        $old = [];
        $new = [];

        foreach ($request->settings as $item) {
            $key = $item['key'];
            $value = $item['value'] ?? '';
            $current = (string) Setting::get($key, '');

            if ($current !== (string) $value) {
                $old[$key] = $current;
                $new[$key] = (string) $value;
            }

            Setting::set($key, $value, Auth::id());
        }

        if (! empty($new)) {
            $changeLog->log('settings', 'all', 'update', $old, $new, 'Settings');
        }

        return redirect()->back()->with('success', 'Settings saved.');
    }

    /**
     * Validate each submitted value against its setting's declared `type`. URLs
     * must be http(s) with a host (rejects javascript:/data: scheme abuse), emails
     * must be valid, numbers numeric, json parseable. Empty values are allowed
     * (clears the setting). Throws a ValidationException keyed to the row's value.
     */
    private function validateByType(array $items): void
    {
        $types = Setting::whereIn('key', array_column($items, 'key'))->pluck('type', 'key');
        $errors = [];

        foreach ($items as $i => $item) {
            $key   = $item['key'];
            $value = trim((string) ($item['value'] ?? ''));
            if ($value === '') {
                continue; // empty clears the setting
            }

            $field = "settings.{$i}.value";

            switch ($types[$key] ?? 'text') {
                case 'url':
                    $scheme = strtolower((string) parse_url($value, PHP_URL_SCHEME));
                    if (! in_array($scheme, ['http', 'https'], true) || ! parse_url($value, PHP_URL_HOST)) {
                        $errors[$field] = "\"{$key}\" must be a valid http(s) URL.";
                    }
                    break;

                case 'email':
                    if (! filter_var($value, FILTER_VALIDATE_EMAIL)) {
                        $errors[$field] = "\"{$key}\" must be a valid email address.";
                    }
                    break;

                case 'number':
                    if (! is_numeric($value)) {
                        $errors[$field] = "\"{$key}\" must be a number.";
                    }
                    break;

                case 'json':
                    json_decode($value);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        $errors[$field] = "\"{$key}\" must be valid JSON.";
                    }
                    break;
            }
        }

        if (! empty($errors)) {
            throw ValidationException::withMessages($errors);
        }
    }
}
