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

            {/* Headline block — constrained by section-x padding. */}
            <div className="relative section-x pt-24 sm:pt-32 lg:pt-40 text-center">
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
            </div>

            {/*
              Hero villa — full-bleed: spans the entire section width (outside
              section-x) so it covers the hero instead of floating centered with
              sky on the sides. The "trimmed" variant (1280×443) has its
              transparent top padding cropped, so the building sits flush at the
              top of the <img> box.
            */}
            <div className="relative mt-4 sm:mt-6 lg:mt-8">
                <img
                    src="/images/home/hero-villa-trimmed.webp"
                    alt=""
                    className="w-full h-auto select-none pointer-events-none"
                    loading="eager"
                />

                {/* White fade: solid white at the bottom → transparent toward the
                    top, weighted to the lower half so the building base melts into
                    the page below. */}
                <div
                    className="absolute inset-0 bg-linear-to-t from-white from-0% to-transparent to-55% pointer-events-none"
                    aria-hidden="true"
                />

                {/* CTA pill — lifted up from the bottom so it clears the white
                    fade and stays readable over the building. */}
                <div className="absolute inset-x-0 bottom-[18%] flex justify-center">
                    <Link
                        href="/properties"
                        className="inline-flex items-center justify-center rounded-full bg-primary-deep px-8 py-3 text-sm sm:text-base font-medium text-white shadow-lg hover:bg-primary-dark transition-colors"
                    >
                        {cta}
                    </Link>
                </div>
            </div>
        </section>
    );
}
