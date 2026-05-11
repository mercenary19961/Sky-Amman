import { Link } from '@inertiajs/react';
import { Users, Building2, CalendarDays, Square } from 'lucide-react';
import type { SiteContentBundle } from '@/types/home';

interface InvestmentBannerProps {
    content: SiteContentBundle;
}

export function InvestmentBanner({ content }: InvestmentBannerProps) {
    const banner = content.investment_banner ?? {};
    const stats = content.stats ?? {};

    // Tagline arrives as a single string ("Buy Early, Save More, Gain More").
    // Split on comma to render the inline strip image between segments.
    const taglineParts = (banner.tagline?.content ?? '').split(',').map((s) => s.trim());

    const statItems = [
        { Icon: Users, value: stats.clients_value?.content, label: stats.clients_label?.content },
        { Icon: Building2, value: stats.projects_value?.content, label: stats.projects_label?.content },
        { Icon: CalendarDays, value: stats.years_value?.content, label: stats.years_label?.content },
        { Icon: Square, value: stats.sqm_value?.content, label: stats.sqm_label?.content },
    ];

    return (
        <section className="relative pt-20 sm:pt-28 pb-16 sm:pb-20 bg-surface">
            <div className="section-x text-center">
                {/* Buy Early headline with inline strip image */}
                <h2 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold text-primary leading-tight">
                    {taglineParts[0] ?? ''}
                </h2>

                <div className="mt-4 flex items-center justify-center flex-wrap gap-3 sm:gap-4 text-xl sm:text-2xl lg:text-3xl text-ink font-medium">
                    <span>{taglineParts[1] ?? ''}</span>
                    <img
                        src="/images/home/buy-early-strip.svg"
                        alt=""
                        className="h-12 sm:h-16 w-40 sm:w-56 select-none pointer-events-none"
                    />
                    <span>{taglineParts[2] ?? ''}</span>
                </div>

                <div className="mt-6 sm:mt-8 flex justify-center">
                    <Link
                        href="/investment"
                        className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm sm:text-base font-medium text-white shadow-md hover:bg-primary-deep transition-colors"
                    >
                        {banner.cta?.content ?? ''}
                    </Link>
                </div>

                {/* Stats — 4-up on desktop, 2x2 on mobile */}
                <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 max-w-5xl mx-auto">
                    {statItems.map(({ Icon, value, label }, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <Icon size={36} strokeWidth={1.25} className="text-primary mb-3" aria-hidden="true" />
                            <div className="text-3xl sm:text-4xl font-bold text-ink">{value}</div>
                            <div className="mt-1 text-xs sm:text-sm uppercase tracking-wider text-ink-muted text-center">
                                {label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
