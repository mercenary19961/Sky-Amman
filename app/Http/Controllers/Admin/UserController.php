<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ChangeLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin/editor account management. Admin-only (route group behind the `admin`
 * middleware). Lean + schema-true — passwords are set by the admin directly
 * (no invite/first-login-reset flow).
 *
 * Policies:
 *  - **Admins are self-managed.** You can't edit, deactivate, demote, or delete
 *    another admin account. To remove an admin, that admin first demotes
 *    themselves to editor (which is gated so the last active admin can't).
 *  - **Granting admin is deliberate.** Creating an admin, or promoting an editor
 *    to admin, requires an explicit `admin_confirmed` flag (the UI gates this
 *    behind a type-to-confirm modal; this is the server-side backstop).
 *  - **No self-lockout.** You can't deactivate or delete yourself, and the last
 *    active admin can't be demoted/deactivated.
 */
class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::query()
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role', 'is_active', 'created_at'])
            ->map(fn (User $u) => [
                'id'         => $u->id,
                'name'       => $u->name,
                'email'      => $u->email,
                'role'       => $u->role,
                'is_active'  => $u->is_active,
                'created_at' => $u->created_at->format('M j, Y'),
            ]);

        return Inertia::render('Admin/Users', [
            'users'         => $users,
            'currentUserId' => $request->user()->id,
        ]);
    }

    public function store(Request $request, ChangeLogService $changeLog): RedirectResponse
    {
        $data = $request->validate([
            'name'            => ['required', 'string', 'max:255'],
            'email'           => ['required', 'email', 'max:255', 'unique:users,email'],
            'role'            => ['required', Rule::in(['admin', 'editor'])],
            'is_active'       => ['boolean'],
            'password'        => ['required', 'confirmed', Password::defaults()],
            'admin_confirmed' => ['boolean'],
        ]);

        // Server-side backstop for the type-to-confirm modal.
        if ($data['role'] === 'admin' && ! $request->boolean('admin_confirmed')) {
            return back()->with('error', 'Granting admin access must be confirmed.');
        }

        $user = User::create([
            'name'      => $data['name'],
            'email'     => $data['email'],
            'role'      => $data['role'],
            'is_active' => $request->boolean('is_active', true),
            'password'  => $data['password'], // hashed via the model's 'hashed' cast
        ]);

        $changeLog->log('user', $user->id, 'create', null, $user->attributesToArray(), $user->name);

        return back()->with('success', 'User created.');
    }

    public function update(Request $request, int $id, ChangeLogService $changeLog): RedirectResponse
    {
        $user = User::findOrFail($id);
        $isSelf = $user->id === $request->user()->id;

        // Admins are self-managed — another admin can't touch this account.
        if ($user->role === 'admin' && ! $isSelf) {
            return back()->with('error', 'Admin accounts are self-managed. You can\'t edit another admin.');
        }

        $data = $request->validate([
            'name'            => ['required', 'string', 'max:255'],
            'email'           => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role'            => ['required', Rule::in(['admin', 'editor'])],
            'is_active'       => ['boolean'],
            'password'        => ['nullable', 'confirmed', Password::defaults()],
            'admin_confirmed' => ['boolean'],
        ]);

        $old = $user->attributesToArray();
        $willBeActive = $request->boolean('is_active', true);
        $promoting    = $user->role !== 'admin' && $data['role'] === 'admin';
        $demoting     = $user->role === 'admin' && $data['role'] !== 'admin';

        // Promoting an editor to admin needs the same explicit confirmation.
        if ($promoting && ! $request->boolean('admin_confirmed')) {
            return back()->with('error', 'Granting admin access must be confirmed.');
        }

        // Self-lockout guards.
        if ($isSelf && ! $willBeActive) {
            return back()->with('error', 'You cannot deactivate your own account.');
        }
        if (($demoting || ! $willBeActive) && $this->isLastActiveAdmin($user)) {
            return back()->with('error', 'This is the last active admin — keep at least one.');
        }

        $user->name      = $data['name'];
        $user->email     = $data['email'];
        $user->role      = $data['role'];
        $user->is_active = $willBeActive;

        if (! empty($data['password'])) {
            $user->password = $data['password']; // hashed via cast
        }

        $user->save();

        $changeLog->log('user', $user->id, 'update', $old, $user->fresh()->attributesToArray(), $user->name);

        return back()->with('success', 'User updated.');
    }

    public function toggleStatus(Request $request, int $id, ChangeLogService $changeLog): RedirectResponse
    {
        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return back()->with('error', 'You cannot change your own status.');
        }

        // Admins are self-managed.
        if ($user->role === 'admin') {
            return back()->with('error', 'Admin accounts are self-managed. You can\'t change another admin\'s status.');
        }

        $old = $user->attributesToArray();
        $user->is_active = ! $user->is_active;
        $user->save();

        $changeLog->log('user', $user->id, 'update', $old, $user->fresh()->attributesToArray(), $user->name);

        return back()->with('success', $user->is_active ? 'User activated.' : 'User deactivated.');
    }

    public function destroy(Request $request, int $id, ChangeLogService $changeLog): RedirectResponse
    {
        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        // Admins are self-managed — demote to editor first to remove one.
        if ($user->role === 'admin') {
            return back()->with('error', 'Admin accounts are self-managed. Demote to editor before deleting.');
        }

        $changeLog->log('user', $user->id, 'delete', $user->attributesToArray(), null, $user->name);
        $user->delete();

        return back()->with('success', 'User deleted.');
    }

    /** True when `$user` is an active admin and no other active admin exists. */
    private function isLastActiveAdmin(User $user): bool
    {
        if ($user->role !== 'admin' || ! $user->is_active) {
            return false;
        }

        return User::query()
            ->where('role', 'admin')
            ->where('is_active', true)
            ->where('id', '!=', $user->id)
            ->doesntExist();
    }
}
