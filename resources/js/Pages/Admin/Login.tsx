import { Head, Link, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Turnstile, type TurnstileHandle, type TurnstileStatus } from '@/Components/Public/Turnstile';
import type { FormEvent } from 'react';

export default function Login() {
    const turnstileRef = useRef<TurnstileHandle>(null);
    const [showPassword, setShowPassword] = useState(false);
    // Gate submit until the challenge resolves ('disabled' = no site key in dev).
    const [turnstileStatus, setTurnstileStatus] = useState<TurnstileStatus>('pending');
    const turnstileReady = turnstileStatus === 'ready' || turnstileStatus === 'disabled';

    const { data, setData, post, processing, errors, reset } = useForm({
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
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                autoComplete="current-password"
                                className="w-full px-3 py-2 pr-10 border border-ink/10 rounded focus:outline-none focus:border-primary"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                aria-pressed={showPassword}
                                tabIndex={-1}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-muted hover:text-ink transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-ink-muted">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                            Remember me
                        </label>
                        <Link href="/admin/forgot-password" className="text-sm text-primary hover:underline">
                            Forgot password?
                        </Link>
                    </div>

                    <Turnstile
                        ref={turnstileRef}
                        onVerify={(token) => setData('cf-turnstile-response', token)}
                        // The widget now renders its own error note + retry, so
                        // no duplicate "please reload" message here.
                        onExpire={() => setData('cf-turnstile-response', '')}
                        onStatusChange={setTurnstileStatus}
                    />
                    {errors['cf-turnstile-response'] && (
                        <p className="text-xs text-red-600">{errors['cf-turnstile-response']}</p>
                    )}

                    <button
                        type="submit"
                        disabled={processing || !turnstileReady}
                        className="w-full bg-primary-strong hover:bg-primary-strong-hover text-white font-medium py-2 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {processing ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
}
