import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    LinkedinIcon,
    InstagramIcon,
    FacebookIcon,
    TwitterIcon,
    YoutubeIcon,
    TiktokIcon,
} from './SocialIcons';
import type { PageProps } from '@/types';

const MAIN_PAGES = [
    { key: 'home', href: '/' },
    { key: 'properties', href: '/properties' },
    { key: 'investment', href: '/investment' },
    { key: 'selfBuild', href: '/self-build' },
    { key: 'security', href: '/security' },
    { key: 'about', href: '/about' },
    { key: 'contact', href: '/contact' },
] as const;

export function Footer() {
    const { t } = useTranslation();
    const { siteSettings } = usePage<PageProps>().props;
    const year = new Date().getFullYear();

    const socials = [
        { url: siteSettings?.linkedin_url, Icon: LinkedinIcon, label: 'LinkedIn' },
        { url: siteSettings?.instagram_url, Icon: InstagramIcon, label: 'Instagram' },
        { url: siteSettings?.facebook_url, Icon: FacebookIcon, label: 'Facebook' },
        { url: siteSettings?.twitter_url, Icon: TwitterIcon, label: 'X' },
        { url: siteSettings?.youtube_url, Icon: YoutubeIcon, label: 'YouTube' },
        { url: siteSettings?.tiktok_url, Icon: TiktokIcon, label: 'TikTok' },
    ].filter((s) => s.url);

    return (
        <footer className="bg-primary-light/30 border-t border-ink/5 mt-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid gap-10 lg:grid-cols-4">
                <div>
                    <div className="font-bold text-2xl text-primary tracking-wide">SKY AMMAN</div>
                    <p className="mt-2 text-sm text-ink-muted">{t('footer.tagline')}</p>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-ink mb-3">{t('footer.sections.mainPages')}</h3>
                    <ul className="space-y-2 text-sm text-ink-muted">
                        {MAIN_PAGES.map((p) => (
                            <li key={p.key}>
                                <Link href={p.href} className="hover:text-primary">
                                    {t(`nav.${p.key}`)}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-ink mb-3">{t('footer.sections.contact')}</h3>
                    <ul className="space-y-2 text-sm text-ink-muted">
                        {siteSettings?.phone && (
                            <li>
                                <a href={`tel:${siteSettings.phone}`} className="hover:text-primary">
                                    {siteSettings.phone}
                                </a>
                            </li>
                        )}
                        {siteSettings?.email && (
                            <li>
                                <a href={`mailto:${siteSettings.email}`} className="hover:text-primary">
                                    {siteSettings.email}
                                </a>
                            </li>
                        )}
                        {siteSettings?.address && <li>{siteSettings.address}</li>}
                    </ul>
                </div>

                {socials.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-ink mb-3">{t('footer.sections.followUs')}</h3>
                        <div className="flex items-center gap-3">
                            {socials.map(({ url, Icon, label }) => (
                                <a
                                    key={label}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="text-ink-muted hover:text-primary transition-colors"
                                >
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-ink/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 text-xs text-ink-muted">
                    © {year} Sky Amman. {t('footer.copyright')}
                </div>
            </div>
        </footer>
    );
}
