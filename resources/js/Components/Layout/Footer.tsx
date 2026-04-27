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
        <footer className="relative bg-primary-deep text-white overflow-hidden mt-16">
            {/* Layer 1: villa silhouette (back) */}
            <div
                className="absolute inset-x-0 bottom-0 h-105 sm:h-130 bg-no-repeat bg-bottom bg-contain pointer-events-none opacity-90"
                style={{ backgroundImage: 'url(/images/home/footer-villa.svg)' }}
                aria-hidden="true"
            />

            {/* Layer 2: clouds (front of villa, drifting horizontally) */}
            <div
                className="absolute inset-x-0 bottom-0 h-105 sm:h-130 bg-no-repeat bg-bottom bg-contain pointer-events-none animate-cloud-drift"
                style={{ backgroundImage: 'url(/images/home/footer-clouds.svg)', backgroundSize: '200% auto' }}
                aria-hidden="true"
            />

            <div className="relative">
                {/* Top: 3-column links + socials */}
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-10 grid gap-8 sm:gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <div className="text-xl font-bold tracking-wide">SKY AMMAN</div>
                        <p className="mt-2 text-sm text-white/85">{t('footer.tagline')}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold mb-3">
                            {t('footer.sections.mainPages')}
                        </h3>
                        <ul className="space-y-2 text-sm text-white/85">
                            {MAIN_PAGES.map((p) => (
                                <li key={p.key}>
                                    <Link href={p.href} className="hover:text-white">
                                        {t(`nav.${p.key}`)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold mb-3">
                            {t('footer.sections.contact')}
                        </h3>
                        <ul className="space-y-2 text-sm text-white/85">
                            {siteSettings?.phone && (
                                <li>
                                    <a href={`tel:${siteSettings.phone}`} className="hover:text-white">
                                        {siteSettings.phone}
                                    </a>
                                </li>
                            )}
                            {siteSettings?.email && (
                                <li>
                                    <a href={`mailto:${siteSettings.email}`} className="hover:text-white">
                                        {siteSettings.email}
                                    </a>
                                </li>
                            )}
                            {siteSettings?.address && <li>{siteSettings.address}</li>}
                        </ul>
                    </div>

                    {socials.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold mb-3">
                                {t('footer.sections.followUs')}
                            </h3>
                            <div className="flex items-center gap-3">
                                {socials.map(({ url, Icon, label }) => (
                                    <a
                                        key={label}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={label}
                                        className="text-white/85 hover:text-white transition-colors"
                                    >
                                        <Icon size={20} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Big logo lockup over the villa */}
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-32 sm:pb-48 text-center select-none">
                    <div className="text-6xl sm:text-8xl lg:text-9xl font-extrabold tracking-tight text-white/95 leading-none">
                        SKY<span className="font-light">AMMAN</span>
                    </div>
                    <div className="mt-2 text-xs sm:text-sm uppercase tracking-[0.4em] text-white/80">
                        Real Estate Consultancy
                    </div>
                </div>

                {/* Copyright strip */}
                <div className="relative border-t border-white/15">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 text-xs text-white/85 text-center sm:text-start">
                        © {year} Sky Amman. {t('footer.copyright')}
                    </div>
                </div>
            </div>
        </footer>
    );
}
