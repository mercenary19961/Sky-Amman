import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { PasswordField, PASSWORD_RULES } from '@/Components/Admin/PasswordField';
import type { FormEvent } from 'react';
import type { PageProps } from '@/types';

interface ResetPasswordProps extends PageProps {
    token: string;
    email: string;
}

export default function ResetPassword() {
    const { token, email } = usePage<ResetPasswordProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const rulesOk = PASSWORD_RULES.every((r) => r.test(data.password));
    const matches = data.password.length > 0 && data.password === data.password_confirmation;
    const canSubmit = !processing && rulesOk && matches;

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/reset-password');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-muted px-4" dir="ltr">
            <Head title="Reset password" />
            <div className="w-full max-w-md bg-white shadow rounded-lg p-8">
                <div className="text-center mb-6">
                    <div className="font-bold text-xl text-primary tracking-wide">SKY AMMAN</div>
                    <p className="text-sm text-ink-muted mt-1">Choose a new password</p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={data.email}
                            readOnly
                            className="w-full px-3 py-2 border border-ink/10 rounded bg-surface-muted text-ink-muted focus:outline-none"
                        />
                        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                    </div>

                    <PasswordField
                        label="New password"
                        value={data.password}
                        onChange={(v) => setData('password', v)}
                        error={errors.password}
                        withMeter
                        withGenerate
                    />

                    <PasswordField
                        label="Confirm password"
                        value={data.password_confirmation}
                        onChange={(v) => setData('password_confirmation', v)}
                        matchAgainst={data.password}
                    />

                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="w-full bg-primary-strong hover:bg-primary-strong-hover text-white font-medium py-2 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {processing ? 'Resetting…' : 'Reset password'}
                    </button>
                </form>

                <Link
                    href="/admin/login"
                    className="mt-6 flex items-center justify-center gap-1.5 text-sm text-ink-muted hover:text-primary transition-colors"
                >
                    <ArrowLeft size={15} />
                    Back to sign in
                </Link>
            </div>
        </div>
    );
}
