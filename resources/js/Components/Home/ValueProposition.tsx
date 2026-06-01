import type { SiteContentBundle } from '@/types/home';

interface ValuePropositionProps {
    content: SiteContentBundle;
}

// Brand-supplied icons for each pillar, paired with their content keys. The
// rounded-square card behind them (Rectangle 22) is replicated via CSS so we
// don't need a second background asset per card.
const ITEMS = [
    { key: 'item_1', icon: '/images/home/value-prop/prime-locations.svg' },
    { key: 'item_2', icon: '/images/home/value-prop/legally-secured.svg' },
    { key: 'item_3', icon: '/images/home/value-prop/lower-prices.svg' },
    { key: 'item_4', icon: '/images/home/value-prop/flexible-payments.svg' },
] as const;

export function ValueProposition({ content }: ValuePropositionProps) {
    const vp = content.value_prop ?? {};

    return (
        <section className="bg-surface py-16 sm:py-24">
            <div className="section-x">
                <h2 className="text-center text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-wide uppercase">
                    {vp.title?.content ?? ''}
                </h2>

                <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 3xl:gap-16">
                    {ITEMS.map(({ key, icon }) => (
                        <div key={key} className="flex flex-col items-center text-center">
                            <img
                                src={icon}
                                alt=""
                                aria-hidden="true"
                                className="w-16 h-16 sm:w-20 sm:h-20 select-none pointer-events-none mb-4 sm:mb-5"
                            />

                            {/* Rectangle 22: square card, rx=62, brand blue tint.
                                Fills its grid cell so the cards close the gaps. */}
                            <div className="aspect-square w-full rounded-[62px] bg-primary flex items-center justify-center px-4 sm:px-8 py-6 text-white text-base sm:text-2xl 3xl:text-3xl leading-snug">
                                {vp[key]?.content ?? ''}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
