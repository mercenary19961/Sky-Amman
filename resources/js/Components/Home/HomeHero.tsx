import { Link } from '@inertiajs/react';
import type { SiteContentBundle } from '@/types/home';

interface HomeHeroProps {
    content: SiteContentBundle;
}

export function HomeHero({ content }: HomeHeroProps) {
    const hero = content.hero ?? {};
    const title = hero.title?.content ?? '';
    const location = hero.location?.content ?? '';
    const subtitle = hero.subtitle?.content ?? '';
    const cta = hero.cta?.content ?? '';

    return (
        <section className="relative overflow-hidden" data-nav-bg="dark">
            {/* Sky gradient: deep sky blue at top, fading through primary into
                white near the villa — matches the target picker (#5299CC). */}
            <div className="absolute inset-0 bg-linear-to-b from-[#5299CC] via-primary to-surface" aria-hidden="true" />

            <div className="relative section-x pt-24 pb-12 sm:pt-32 lg:pt-40 lg:pb-16 text-center">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white drop-shadow-sm leading-tight">
                    {title}
                </h1>
                {location && (
                    <p className="mt-2 sm:mt-3 text-xl sm:text-2xl lg:text-3xl font-semibold text-white drop-shadow-sm">
                        {location}
                    </p>
                )}
                <p className="mt-4 text-base sm:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto">
                    {subtitle}
                </p>

                {/*
                  Hero villa — uses the "trimmed" variant (1280×443) whose
                  transparent top padding has been cropped off so the visible
                  building sits flush with the top of the <img> box. CSS margin
                  is the actual distance to the subtitle rather than being
                  swallowed by invisible alpha. Width: max-w-7xl matches the
                  photo's 1280px native frame; at 3xl+ (≥1600px viewport) we
                  scale it up to ~1500px so the villa fills the hero band on
                  very large monitors instead of floating in empty sky.
                */}
                <div className="relative mt-4 sm:mt-6 lg:mt-8">
                    <img
                        src="/images/home/hero-villa-trimmed.webp"
                        alt=""
                        className="mx-auto w-full max-w-7xl 3xl:max-w-375 h-auto select-none pointer-events-none"
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
