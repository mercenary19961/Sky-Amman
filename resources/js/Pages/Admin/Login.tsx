import { Head, useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { Turnstile, type TurnstileHandle } from '@/Components/Public/Turnstile';
import type { FormEvent } from 'react';

export default function Login() {
    const turnstileRef = useRef<TurnstileHandle>(null);

    const { data, setData, post, processing, errors, setError, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        'cf-turnstile-response': '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/login', {
            onError: () => {
                turnstileRef.current?.reset();
                setData('cf-turnstile-response', '');
                reset('password');
            },
        } as Parameters<typeof post>[1]);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-muted px-4" dir="ltr">
            <Head title="Admin Login" />
            <div className="w-full max-w-sm bg-white shadow rounded-lg p-8">
                <div className="text-center mb-6">
                    <div className="font-bold text-xl text-primary tracking-wide">SKY AMMAN</div>
                    <p className="text-sm text-ink-muted mt-1">Admin sign in</p>
                </div>

                <form onSubmit={submit} className="space-y-4">
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

                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="current-password"
                            className="w-full px-3 py-2 border border-ink/10 rounded focus:outline-none focus:border-primary"
                            required
                        />
                        {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                    </div>

                    <label className="flex items-center gap-2 text-sm text-ink-muted">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        Remember me
                    </label>

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
                        {processing ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
}
