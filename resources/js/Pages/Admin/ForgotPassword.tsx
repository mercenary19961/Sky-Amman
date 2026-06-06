import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Turnstile, type TurnstileHandle } from '@/Components/Public/Turnstile';
import type { FormEvent } from 'react';
import type { PageProps } from '@/types';

export default function ForgotPassword() {
    const turnstileRef = useRef<TurnstileHandle>(null);
    const { flash } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors, setError, reset } = useForm({
        email: '',
        'cf-turnstile-response': '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/forgot-password', {
            onError: () => {
                turnstileRef.current?.reset();
                setData('cf-turnstile-response', '');
            },
            onSuccess: () => {
                reset('email');
                turnstileRef.current?.reset();
                setData('cf-turnstile-response', '');
            },
        } as Parameters<typeof post>[1]);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-muted px-4" dir="ltr">
            <Head title="Forgot password" />
            <div className="w-full max-w-sm bg-white shadow rounded-lg p-8">
                <div className="text-center mb-6">
                    <div className="font-bold text-xl text-primary tracking-wide">SKY AMMAN</div>
                    <p className="text-sm text-ink-muted mt-1">Reset your password</p>
                </div>

                {flash?.success ? (
                    <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {flash.success}
                    </div>
                ) : (
                    <form onSubmit={submit} className="space-y-4">
                        <p className="text-sm text-ink-muted">
                            Enter your account email and we'll send you a link to set a new password.
                        </p>

                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                autoComplete="email"
                                className="w-full px-3 py-2 border border-ink/10 rounded focus:outline-none focus:border-primary"
                                required
                            />
                            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                        </div>

                        <Turnstile
                            ref={turnstileRef}
                            onVerify={(token) => setData('cf-turnstile-response', token)}
                            onError={() => setError('cf-turnstile-response' as never, 'Bot check failed. Please reload.')}
                            onExpire={() => setData('cf-turnstile-response', '')}
                        />
                        {errors['cf-turnstile-response'] && (
                            <p className="text-xs text-red-600">{errors['cf-turnstile-response']}</p>
                        )}

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-primary-strong hover:bg-primary-strong-hover text-white font-medium py-2 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Sending…' : 'Send reset link'}
                        </button>
                    </form>
                )}

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
