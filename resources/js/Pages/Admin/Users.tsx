import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';
import {
    Plus, Pencil, Trash2, ShieldCheck, ShieldAlert, X, Power, Lock,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ConfirmDeleteButton as ConfirmButton } from '@/Components/Admin/ConfirmDeleteButton';
import { Select } from '@/Components/Admin/Select';
import { PasswordField, PASSWORD_RULES } from '@/Components/Admin/PasswordField';
import { cn } from '@/lib/cn';
import type { UsersPageProps, UserListItem, UserRole, Ability } from '@/types/admin/user';

const ROLE_LABELS: Record<UserRole, string> = { admin: 'Admin', editor: 'Editor' };
const ROLE_COLORS: Record<UserRole, string> = {
    admin:  'bg-violet-100 text-violet-700',
    editor: 'bg-primary/10 text-primary',
};

interface FormData {
    name: string;
    email: string;
    role: UserRole;
    is_active: boolean;
    password: string;
    password_confirmation: string;
    admin_confirmed: boolean;
    permissions: string[];
    [key: string]: string | boolean | string[];
}

const EMPTY: FormData = {
    name: '', email: '', role: 'editor', is_active: true,
    password: '', password_confirmation: '', admin_confirmed: false,
    permissions: [],
};

// Stable snapshot of the editable fields, captured when the panel opens, so the
// Save button only enables once something actually changes (admin_confirmed is
// excluded — it's applied at submit time via form.transform). Permissions are
// sorted first so re-checking boxes back to the original set reads as clean.
const snapshotOf = (d: FormData) =>
    JSON.stringify([
        d.name, d.email, d.role, d.is_active, d.password, d.password_confirmation,
        [...d.permissions].sort(),
    ]);

export default function Users() {
    const { users, currentUserId, abilities } = usePage<UsersPageProps>().props;

    // Registry grouped for display, preserving the server's ordering.
    const abilityGroups = abilities.reduce<Record<string, Ability[]>>((acc, a) => {
        (acc[a.group] ??= []).push(a);
        return acc;
    }, {});

    const [panelOpen, setPanelOpen] = useState(false);
    const [editing, setEditing] = useState<UserListItem | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const form = useForm<FormData>({ ...EMPTY });
    // Baseline snapshot taken when the panel opens; drives the dirty check below.
    const baseline = useRef(snapshotOf(EMPTY));

    function openCreate() {
        setEditing(null);
        form.setData({ ...EMPTY });
        baseline.current = snapshotOf(EMPTY);
        form.clearErrors();
        setPanelOpen(true);
    }

    function openEdit(u: UserListItem) {
        setEditing(u);
        const data: FormData = {
            name: u.name, email: u.email, role: u.role, is_active: u.is_active,
            password: '', password_confirmation: '', admin_confirmed: false,
            permissions: u.permissions ?? [],
        };
        form.setData(data);
        baseline.current = snapshotOf(data);
        form.clearErrors();
        setPanelOpen(true);
    }

    function closePanel() {
        setPanelOpen(false);
        setConfirmOpen(false);
        setConfirmText('');
    }

    // Is this save granting admin access (new admin, or editor → admin)?
    const grantingAdmin = form.data.role === 'admin' && (!editing || editing.role !== 'admin');

    function submit(adminConfirmed: boolean) {
        form.transform((data) => ({ ...data, admin_confirmed: adminConfirmed }));
        const opts = {
            preserveScroll: true,
            onSuccess: () => closePanel(),
        };
        if (editing) form.put(`/admin/users/${editing.id}`, opts);
        else form.post('/admin/users', opts);
    }

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (grantingAdmin) {
            setConfirmText('');
            setConfirmOpen(true);
            return;
        }
        submit(false);
    }

    function toggleStatus(u: UserListItem) {
        router.post(`/admin/users/${u.id}/toggle`, {}, { preserveScroll: true });
    }
    function destroy(u: UserListItem) {
        router.delete(`/admin/users/${u.id}`, { preserveScroll: true });
    }

    const confirmReady = confirmText.trim().toLowerCase() === form.data.email.trim().toLowerCase();

    /**
     * Toggle a grant, keeping the `requires` chain coherent so the UI can't show
     * a state the server would silently rewrite (it re-applies this on save).
     * Granting pulls in parents; revoking drops anything that depended on it.
     */
    function toggleAbility(key: string, on: boolean) {
        const next = new Set(form.data.permissions);

        if (on) {
            next.add(key);
            let parent = abilities.find((a) => a.key === key)?.requires;
            while (parent) {
                next.add(parent);
                parent = abilities.find((a) => a.key === parent)?.requires;
            }
        } else {
            next.delete(key);
            // Cascade: anything requiring this (directly or transitively) goes too.
            let changed = true;
            while (changed) {
                changed = false;
                for (const a of abilities) {
                    if (a.requires && next.has(a.key) && !next.has(a.requires)) {
                        next.delete(a.key);
                        changed = true;
                    }
                }
            }
        }

        form.setData('permissions', [...next]);
    }

    // Client-side password gate (mirrors the server policy, minus the breach check).
    // On edit a blank password means "keep current", so it's allowed.
    const pwEntered = form.data.password.length > 0;
    const pwMeetsRules = PASSWORD_RULES.every((r) => r.test(form.data.password));
    const pwMatches = form.data.password === form.data.password_confirmation;
    const passwordOk = editing ? (!pwEntered || (pwMeetsRules && pwMatches)) : (pwMeetsRules && pwMatches);

    // Name + email must also be valid before the button lights up.
    const nameOk = form.data.name.trim().length > 0;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.data.email.trim());
    // …and only once something actually changed since the panel opened.
    const isDirty = snapshotOf(form.data) !== baseline.current;
    const canSubmit = !form.processing && isDirty && nameOk && emailOk && passwordOk;

    return (
        <AdminLayout title="Users & Auth">
            <Head title="Users & Auth" />

            <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-ink-muted">
                    Admin &amp; editor accounts. Editors manage content; admins reach everything. Grant an
                    editor extra sections from the Authorization panel when editing them.
                </p>
                <button
                    type="button"
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-zinc-900 rounded text-sm font-medium hover:bg-primary-dark transition-colors shrink-0"
                >
                    <Plus size={16} />
                    Add User
                </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-surface-muted border-b border-ink/5">
                        <tr>
                            <th className="text-start px-4 py-3 font-medium text-ink-muted">Name</th>
                            <th className="text-start px-4 py-3 font-medium text-ink-muted">Role</th>
                            <th className="text-center px-4 py-3 font-medium text-ink-muted">Active</th>
                            <th className="text-start px-4 py-3 font-medium text-ink-muted hidden sm:table-cell">Created</th>
                            <th className="text-end px-4 py-3 font-medium text-ink-muted">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/5">
                        {users.map((u) => {
                            const isSelf = u.id === currentUserId;
                            // Another admin's row is self-managed → read-only here.
                            const locked = u.role === 'admin' && !isSelf;
                            return (
                                <tr key={u.id} className="hover:bg-surface-muted/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-ink flex items-center gap-2">
                                            {u.name}
                                            {isSelf && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-ink/10 text-ink-muted">You</span>}
                                        </div>
                                        <div className="text-ink-muted text-xs mt-0.5">{u.email}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium', ROLE_COLORS[u.role])}>
                                            {u.role === 'admin' ? <ShieldCheck size={11} /> : <ShieldAlert size={11} />}
                                            {ROLE_LABELS[u.role]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={cn('inline-block w-2 h-2 rounded-full', u.is_active ? 'bg-emerald-500' : 'bg-ink/20')} title={u.is_active ? 'Active' : 'Inactive'} />
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell text-ink-muted whitespace-nowrap">{u.created_at}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-3">
                                            {locked ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-ink-muted" title="Admin accounts are self-managed">
                                                    <Lock size={12} />
                                                    Self-managed
                                                </span>
                                            ) : (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(u)}
                                                        className="text-ink-muted hover:text-primary transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    {!isSelf && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleStatus(u)}
                                                                className="text-ink-muted hover:text-primary transition-colors"
                                                                title={u.is_active ? 'Deactivate' : 'Activate'}
                                                            >
                                                                <Power size={15} />
                                                            </button>
                                                            <ConfirmButton
                                                                onConfirm={() => destroy(u)}
                                                                className="text-ink-muted hover:text-red-500 transition-colors"
                                                                title="Delete"
                                                                heading="Delete this user?"
                                                                itemLabel={u.name}
                                                                description="This user account will be permanently deleted and cannot be restored."
                                                            >
                                                                <Trash2 size={15} />
                                                            </ConfirmButton>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Slide-over create/edit panel */}
            {panelOpen && (
                <div className="fixed inset-0 z-40">
                    <div className="absolute inset-0 bg-black/40" onClick={closePanel} />
                    {/* Wider than a standard slide-over because it now holds two
                        columns: account details and the authorization matrix. */}
                    <div className="absolute inset-y-0 inset-e-0 w-full max-w-3xl bg-white dark:bg-zinc-800 shadow-xl flex flex-col">
                        <div className="flex items-center justify-between px-5 h-16 border-b border-ink/5 dark:border-white/10">
                            <h2 className="font-semibold text-ink">{editing ? 'Edit User' : 'Add User'}</h2>
                            <button type="button" onClick={closePanel} className="text-ink-muted hover:text-ink transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 grid gap-6 lg:grid-cols-2 lg:gap-8 items-start">
                          <div className="space-y-4">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                                Account
                            </h3>

                            <Field label="Name" error={form.errors.name}>
                                <input
                                    type="text"
                                    value={form.data.name}
                                    onChange={e => form.setData('name', e.target.value)}
                                    placeholder="First Last"
                                    maxLength={255}
                                    className={inputClass}
                                />
                            </Field>

                            <Field label="Email" error={form.errors.email}>
                                <input
                                    type="email"
                                    value={form.data.email}
                                    onChange={e => form.setData('email', e.target.value)}
                                    placeholder="name@example.com"
                                    maxLength={255}
                                    className={inputClass}
                                />
                            </Field>

                            <Field label="Role" error={form.errors.role}>
                                <Select
                                    value={form.data.role}
                                    onChange={(v) => form.setData('role', v as UserRole)}
                                    options={[
                                        { value: 'editor', label: 'Editor — content only' },
                                        { value: 'admin', label: 'Admin — full access' },
                                    ]}
                                />
                                {grantingAdmin && (
                                    <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                        <ShieldCheck size={12} />
                                        Grants full access — you'll confirm this on save.
                                    </p>
                                )}
                            </Field>

                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_active}
                                    onChange={e => form.setData('is_active', e.target.checked)}
                                    className="w-4 h-4 accent-primary"
                                />
                                Active (can sign in)
                            </label>

                            <div className="space-y-3 pt-2 border-t border-ink/5 dark:border-white/10">
                                <PasswordField
                                    label={editing ? 'New password' : 'Password'}
                                    value={form.data.password}
                                    onChange={(v) => form.setData('password', v)}
                                    error={form.errors.password}
                                    hint={editing ? 'Leave blank to keep current password' : undefined}
                                    placeholder={editing ? 'Leave blank to keep current' : 'Use a strong password or generate one'}
                                    withMeter
                                    withGenerate
                                />
                                <PasswordField
                                    label="Confirm password"
                                    value={form.data.password_confirmation}
                                    onChange={(v) => form.setData('password_confirmation', v)}
                                    placeholder="Re-enter the password"
                                    matchAgainst={form.data.password}
                                />
                            </div>
                          </div>

                          {/* ── Authorization ─────────────────────────────── */}
                          <div className="space-y-4 lg:border-s lg:border-ink/5 lg:dark:border-white/10 lg:ps-8">
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                                    Authorization
                                </h3>
                                <p className="mt-1 text-xs text-ink-muted">
                                    Extra sections this editor may reach. Everything else in the panel is
                                    already open to editors.
                                </p>
                            </div>

                            {form.data.role === 'admin' ? (
                                <div className="rounded-lg bg-violet-50 dark:bg-violet-500/10 p-4">
                                    <p className="flex items-center gap-1.5 text-sm font-medium text-violet-700 dark:text-violet-300">
                                        <ShieldCheck size={14} />
                                        Full access
                                    </p>
                                    <p className="mt-1 text-xs text-violet-700/80 dark:text-violet-300/80">
                                        Admins reach every section, so there is nothing to grant. Switching
                                        this account back to Editor starts it with no admin-section access.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {Object.entries(abilityGroups).map(([group, items]) => (
                                        <div key={group}>
                                            <p className="text-xs font-medium text-ink mb-1.5">{group}</p>
                                            <div className="space-y-1.5">
                                                {items.map((a) => {
                                                    const checked = form.data.permissions.includes(a.key);
                                                    return (
                                                        <label
                                                            key={a.key}
                                                            className="flex gap-2.5 rounded-lg p-2.5 bg-zinc-50 dark:bg-zinc-700/40 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700/70 transition-colors"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={(e) => toggleAbility(a.key, e.target.checked)}
                                                                className="mt-0.5 w-4 h-4 shrink-0 accent-primary"
                                                            />
                                                            <span className="min-w-0">
                                                                <span className="block text-sm text-ink">{a.label}</span>
                                                                <span className="block text-xs text-ink-muted leading-relaxed">
                                                                    {a.description}
                                                                </span>
                                                                {a.requires && checked && (
                                                                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-ink-muted">
                                                                        <Lock size={10} />
                                                                        includes “{abilities.find((x) => x.key === a.requires)?.label}”
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}

                                    <p className="text-xs text-ink-muted flex gap-1.5">
                                        <ShieldAlert size={13} className="shrink-0 mt-0.5" />
                                        <span>
                                            Users &amp; Auth can’t be granted — an editor who manages accounts
                                            could promote themselves to admin.
                                        </span>
                                    </p>
                                </div>
                            )}
                          </div>
                        </form>

                        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-ink/5 dark:border-white/10">
                            <button type="button" onClick={closePanel} className="px-4 py-2 text-sm text-ink-muted hover:text-ink transition-colors">
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={!canSubmit}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-zinc-900 rounded text-sm font-medium hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                            >
                                {form.processing ? 'Saving…' : editing ? 'Save Changes' : 'Create User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Type-to-confirm admin grant */}
            {confirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmOpen(false)} />
                    <div className="relative w-full max-w-md bg-white dark:bg-zinc-800 rounded-lg shadow-xl p-6">
                        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 mb-3">
                            <ShieldCheck size={20} />
                            <h3 className="font-semibold text-ink">Confirm admin access</h3>
                        </div>
                        <p className="text-sm text-ink-muted">
                            You're about to grant <strong className="text-ink">full admin access</strong> to{' '}
                            <strong className="text-ink">{form.data.email || 'this account'}</strong>. Admins can manage
                            settings, users, and all content. To confirm, type the email address below.
                        </p>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={e => setConfirmText(e.target.value)}
                            placeholder={form.data.email}
                            autoFocus
                            className={cn(inputClass, 'mt-4')}
                        />
                        <div className="flex items-center justify-end gap-3 mt-5">
                            <button type="button" onClick={() => setConfirmOpen(false)} className="px-4 py-2 text-sm text-ink-muted hover:text-ink transition-colors">
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={!confirmReady || form.processing}
                                onClick={() => { setConfirmOpen(false); submit(true); }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded text-sm font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ShieldCheck size={15} />
                                Grant admin access
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

const inputClass =
    'w-full px-3 py-2 text-sm border border-ink/10 rounded bg-white dark:bg-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30';

function Field({ label, error, hint, children }: {
    label: string;
    error?: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-ink-muted mb-1">{label}</label>
            {children}
            {hint && !error && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

