<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\ChangeLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            'settings.*.value' => 'nullable|string',
        ]);

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
}
