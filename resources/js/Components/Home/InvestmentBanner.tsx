import { Link } from '@inertiajs/react';
import type { SiteContentBundle } from '@/types/home';

interface InvestmentBannerProps {
    content: SiteContentBundle;
}

export function InvestmentBanner({ content }: InvestmentBannerProps) {
    const banner = content.investment_banner ?? {};

    // Tagline arrives as a single string ("Buy Early, Save More, Gain More").
    // Split on comma to render the inline strip image between segments.
    const taglineParts = (banner.tagline?.content ?? '').split(',').map((s) => s.trim());

    return (
        <section className="relative pt-20 sm:pt-28 pb-16 sm:pb-20 bg-surface">
            <div className="section-x text-center">
                {/* Buy Early headline with inline strip image */}
                <h2 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold text-primary leading-tight">
                    {taglineParts[0] ?? ''}
                </h2>

                <div className="mt-4 flex items-center justify-center flex-wrap gap-3 sm:gap-4 text-xl sm:text-2xl lg:text-3xl text-ink font-medium">
                    <span>{taglineParts[1] ?? ''}</span>
                    {/* Leaf strip shape filled with the buy-early image: the SVG
                        masks a div whose background is the webp, so the photo only
                        shows through the leaf silhouette. */}
                    <span
                        className="block h-12 sm:h-16 w-40 sm:w-56 select-none pointer-events-none"
                        style={{
                            backgroundImage: 'url(/images/home/buy-early.webp)',
                            backgroundSize: '100% 100%',
                            WebkitMaskImage: 'url(/images/home/buy-early-strip-mask.svg)',
                            maskImage: 'url(/images/home/buy-early-strip-mask.svg)',
                            WebkitMaskRepeat: 'no-repeat',
                            maskRepeat: 'no-repeat',
                            WebkitMaskSize: '100% 100%',
                            maskSize: '100% 100%',
                        }}
                        aria-hidden="true"
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
            </div>
        </section>
    );
}
