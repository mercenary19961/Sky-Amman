import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Plus, Pencil, Trash2, ShieldCheck, ShieldAlert, X, Power, Lock,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Select } from '@/Components/Admin/Select';
import { PasswordField, PASSWORD_RULES } from '@/Components/Admin/PasswordField';
import { cn } from '@/lib/cn';
import type { UsersPageProps, UserListItem, UserRole } from '@/types/admin/user';

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
    [key: string]: string | boolean;
}

const EMPTY: FormData = {
    name: '', email: '', role: 'editor', is_active: true,
    password: '', password_confirmation: '', admin_confirmed: false,
};

export default function Users() {
    const { users, currentUserId } = usePage<UsersPageProps>().props;

    const [panelOpen, setPanelOpen] = useState(false);
    const [editing, setEditing] = useState<UserListItem | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const form = useForm<FormData>({ ...EMPTY });

    function openCreate() {
        setEditing(null);
        form.setData({ ...EMPTY });
        form.clearErrors();
        setPanelOpen(true);
    }

    function openEdit(u: UserListItem) {
        setEditing(u);
        form.setData({
            name: u.name, email: u.email, role: u.role, is_active: u.is_active,
            password: '', password_confirmation: '', admin_confirmed: false,
        });
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

    // Client-side password gate (mirrors the server policy, minus the breach check).
    // On edit a blank password means "keep current", so it's allowed.
    const pwEntered = form.data.password.length > 0;
    const pwMeetsRules = PASSWORD_RULES.every((r) => r.test(form.data.password));
    const pwMatches = form.data.password === form.data.password_confirmation;
    const passwordOk = editing ? (!pwEntered || (pwMeetsRules && pwMatches)) : (pwMeetsRules && pwMatches);

    // Name + email must also be valid before the button lights up.
    const nameOk = form.data.name.trim().length > 0;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.data.email.trim());
    const canSubmit = !form.processing && nameOk && emailOk && passwordOk;

    return (
        <AdminLayout title="Users">
            <Head title="Users" />

            <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-ink-muted">
                    Admin & editor accounts. Editors manage content only; admins also see Settings, Users, and the Change Log.
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
                                                            <ConfirmButton onConfirm={() => destroy(u)} className="text-ink-muted hover:text-red-500 transition-colors" title="Delete">
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
                    <div className="absolute inset-y-0 inset-e-0 w-full max-w-md bg-white dark:bg-zinc-800 shadow-xl flex flex-col">
                        <div className="flex items-center justify-between px-5 h-16 border-b border-ink/5 dark:border-white/10">
                            <h2 className="font-semibold text-ink">{editing ? 'Edit User' : 'Add User'}</h2>
                            <button type="button" onClick={closePanel} className="text-ink-muted hover:text-ink transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
                            <Field label="Name" error={form.errors.name}>
                                <input
                                    type="text"
                                    value={form.data.name}
                                    onChange={e => form.setData('name', e.target.value)}
                                    placeholder="e.g. Sarah Khalil"
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

function ConfirmButton({ onConfirm, children, className, title }: {
    onConfirm: () => void;
    children: React.ReactNode;
    className?: string;
    title?: string;
}) {
    const [pending, setPending] = useState(false);
    if (pending) {
        return (
            <span className="flex items-center gap-1 text-xs">
                <button type="button" onClick={() => { setPending(false); onConfirm(); }} className="text-red-600 font-medium hover:underline">Confirm</button>
                <span className="text-ink-muted">/</span>
                <button type="button" onClick={() => setPending(false)} className="text-ink-muted hover:underline">Cancel</button>
            </span>
        );
    }
    return (
        <button type="button" onClick={() => setPending(true)} className={className} title={title}>
            {children}
        </button>
    );
}
