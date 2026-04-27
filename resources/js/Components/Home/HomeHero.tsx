import { Link } from '@inertiajs/react';
import type { SiteContentBundle } from '@/types/home';

interface HomeHeroProps {
    content: SiteContentBundle;
}

export function HomeHero({ content }: HomeHeroProps) {
    const hero = content.hero ?? {};
    const title = hero.title?.content ?? '';
    const subtitle = hero.subtitle?.content ?? '';
    const cta = hero.cta?.content ?? '';

    return (
        <section className="relative overflow-hidden">
            {/* Sky gradient: primary → white, top to bottom */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary to-surface" aria-hidden="true" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-12 sm:pt-32 lg:pt-40 lg:pb-16 text-center">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white drop-shadow-sm leading-tight">
                    {title}
                </h1>
                <p className="mt-4 text-base sm:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto">
                    {subtitle}
                </p>

                <div className="relative mt-8 sm:mt-12 lg:mt-16">
                    <img
                        src="/images/home/hero-villa.svg"
                        alt=""
                        className="mx-auto w-full max-w-5xl h-auto select-none pointer-events-none"
                        loading="eager"
                    />

                    {/* CTA pill overlaps the bottom edge of the villa image */}
                    <div className="absolute inset-x-0 bottom-0 translate-y-1/2 flex justify-center">
                        <Link
                            href="/properties"
                            className="inline-flex items-center justify-center rounded-full bg-primary-deep px-8 py-3 text-sm sm:text-base font-medium text-white shadow-lg hover:bg-primary-dark transition-colors"
                        >
                            {cta}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
