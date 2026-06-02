import { useRef } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Mail, MapPin, Phone } from 'lucide-react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Turnstile, type TurnstileHandle } from '@/Components/Public/Turnstile';
import { FacebookIcon, InstagramIcon, TwitterIcon } from '@/Components/Layout/SocialIcons';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import type { ContactPageProps, ContentValue } from '@/types/home';

/** CMS-first text resolver: returns the CMS row when present & visible, else ''. */
function text(section: Record<string, ContentValue> | undefined, key: string): string {
    const row = section?.[key];
    if (!row || !row.is_visible) return '';
    return row.content ?? '';
}

export default function Contact() {
    const { props } = usePage<ContactPageProps>();
    const { language } = useLanguage();
    const { t } = useTranslation();
    const ar = language === 'ar';

    const content = ar ? props.content_ar : props.content_en;
    const hero = content.hero;
    const heroTitle = text(hero, 'title') || t('contact.hero.title');
    const heroSubtitle = text(hero, 'subtitle') || t('contact.hero.subtitle');

    const project = props.project;
    const projectTitle = project ? (ar ? project.title_ar : project.title_en) : '';

    const settings = props.siteSettings;
    const turnstileRef = useRef<TurnstileHandle>(null);

    const form = useForm({
        name: '',
        email: '',
        phone: '',
        request_type: project ? 'buy' : 'general',
        message: project ? t('contact.aboutProject', { name: projectTitle }) : '',
        property: project?.slug ?? '',
        'cf-turnstile-response': '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/contact', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('name', 'email', 'phone', 'message');
                form.setData('cf-turnstile-response', '');
                turnstileRef.current?.reset();
            },
            onError: () => {
                form.setData('cf-turnstile-response', '');
                turnstileRef.current?.reset();
            },
        });
    };

    const seoTitle = settings?.seo_title || `${heroTitle} · SkyAmman`;

    const inputClass =
        'mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-ink outline-none transition-colors focus:border-primary';

    return (
        <PublicLayout>
            <Head title={seoTitle}>
                <meta name="description" content={heroSubtitle} />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:type" content="website" />
            </Head>

            <section data-nav-bg="light" className="bg-surface">
                <div className="section-x pt-28 pb-16 sm:pt-32 sm:pb-24 lg:pt-36">
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
                        {/* Left: intro + contact methods + socials + map */}
                        <div className="flex h-full max-w-lg flex-col">
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                                {t('contact.label')}
                            </p>
                            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-ink leading-tight">
                                {heroTitle}
                            </h1>
                            <p className="mt-4 text-base sm:text-lg leading-relaxed text-ink-muted">
                                {heroSubtitle}
                            </p>

                            {project && (
                                <div className="mt-6 inline-flex items-center rounded-full bg-primary-light/50 px-4 py-2 text-sm font-medium text-primary-dark">
                                    {t('contact.aboutProject', { name: projectTitle })}
                                </div>
                            )}

                            <ul className="mt-8 space-y-5">
                                {settings?.phone && (
                                    <ContactMethod icon={<Phone size={18} />}>
                                        <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="transition-colors hover:text-primary" dir="ltr">
                                            {settings.phone}
                                        </a>
                                    </ContactMethod>
                                )}
                                {settings?.email && (
                                    <ContactMethod icon={<Mail size={18} />}>
                                        <a href={`mailto:${settings.email}`} className="transition-colors hover:text-primary">
                                            {settings.email}
                                        </a>
                                    </ContactMethod>
                                )}
                                {settings?.address && (
                                    <ContactMethod icon={<MapPin size={18} />}>
                                        <span>{settings.address}</span>
                                    </ContactMethod>
                                )}
                            </ul>

                            {/* Social links */}
                            <div className="mt-7 flex items-center gap-3">
                                <SocialLink href={settings?.facebook_url} label="Facebook">
                                    <FacebookIcon size={18} />
                                </SocialLink>
                                <SocialLink href={settings?.instagram_url} label="Instagram">
                                    <InstagramIcon size={18} />
                                </SocialLink>
                                <SocialLink href={settings?.twitter_url} label="X">
                                    <TwitterIcon size={18} />
                                </SocialLink>
                            </div>

                            {/* Map — grows to fill the column so its bottom lines up
                                with the form (Send Message) instead of overshooting. */}
                            {settings?.google_maps_embed_url && (
                                <div className="mt-8 min-h-56 flex-1 overflow-hidden rounded-2xl">
                                    <iframe
                                        src={settings.google_maps_embed_url}
                                        title={t('home.location.title')}
                                        className="h-full min-h-56 w-full border-0"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Right: form */}
                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-ink">{t('contact.form.name')}</label>
                                <input
                                    type="text"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    required
                                    className={inputClass}
                                />
                                {form.errors.name && <p className="mt-1 text-sm text-red-600">{form.errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-ink">{t('contact.form.email')}</label>
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        required
                                        className={inputClass}
                                        dir="ltr"
                                    />
                                    {form.errors.email && <p className="mt-1 text-sm text-red-600">{form.errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-ink">
                                        {t('contact.form.phone')} <span className="text-ink-muted">{t('common.optional')}</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={form.data.phone}
                                        onChange={(e) => form.setData('phone', e.target.value)}
                                        className={inputClass}
                                        dir="ltr"
                                    />
                                    {form.errors.phone && <p className="mt-1 text-sm text-red-600">{form.errors.phone}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-ink">{t('contact.form.requestType')}</label>
                                <select
                                    value={form.data.request_type}
                                    onChange={(e) => form.setData('request_type', e.target.value)}
                                    className={inputClass}
                                >
                                    {props.requestTypes.map((rt) => (
                                        <option key={rt} value={rt}>
                                            {t(`contact.form.requestTypes.${rt}`)}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.request_type && <p className="mt-1 text-sm text-red-600">{form.errors.request_type}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-ink">{t('contact.form.message')}</label>
                                <textarea
                                    value={form.data.message}
                                    onChange={(e) => form.setData('message', e.target.value)}
                                    required
                                    rows={6}
                                    className={cn(inputClass, 'resize-none')}
                                />
                                {form.errors.message && <p className="mt-1 text-sm text-red-600">{form.errors.message}</p>}
                            </div>

                            <Turnstile
                                ref={turnstileRef}
                                onVerify={(token) => form.setData('cf-turnstile-response', token)}
                                onExpire={() => form.setData('cf-turnstile-response', '')}
                            />

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="w-full rounded-xl bg-primary-strong px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-strong-hover disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {form.processing ? t('contact.form.sending') : t('contact.form.submit')}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}

/** Circular social icon — a link when the URL is set, a dim placeholder otherwise. */
function SocialLink({ href, label, children }: { href?: string; label: string; children: React.ReactNode }) {
    const base = 'flex h-11 w-11 items-center justify-center rounded-full border transition-colors';
    if (href) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={cn(base, 'border-primary/30 text-primary hover:bg-primary hover:text-white')}
            >
                {children}
            </a>
        );
    }
    return (
        <span aria-label={label} className={cn(base, 'border-ink/10 text-ink/25')}>
            {children}
        </span>
    );
}

function ContactMethod({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <li className="flex items-center gap-4 text-ink">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-primary/30 text-primary">
                {icon}
            </span>
            <div className="text-base">{children}</div>
        </li>
    );
}
