import type { SiteContentBundle } from '@/types/home';

interface ManagingPartnerProps {
    content: SiteContentBundle;
}

export function ManagingPartner({ content }: ManagingPartnerProps) {
    const mp = content.managing_partner ?? {};
    const label = mp.label?.content ?? '';
    const name = mp.name?.content ?? '';
    const body1 = mp.body_1?.content ?? '';
    const body2 = mp.body_2?.content ?? '';
    const body3 = mp.body_3?.content ?? '';

    if (!label && !name && !body1 && !body2 && !body3) return null;

    return (
        <section className="bg-surface py-16 sm:py-24">
            <div className="section-x">
                <div className="relative">
                    {/* Title block */}
                    <div className="text-center">
                        {label && (
                            <div className="text-3xl sm:text-4xl lg:text-5xl font-medium text-primary">
                                {label}
                            </div>
                        )}
                        {name && (
                            <div className="mt-2 text-4xl sm:text-5xl lg:text-6xl font-semibold text-primary-dark">
                                {name}
                            </div>
                        )}
                    </div>

                    {/* Body card with decorative quote marks */}
                    <div className="relative mt-10 rounded-3xl bg-surface-muted px-6 sm:px-10 lg:px-14 py-10 sm:py-12 lg:py-14">
                        <img
                            src="/images/home/quote-open.png"
                            alt=""
                            aria-hidden="true"
                            className="absolute -top-8 -left-3 sm:-top-10 sm:left-0 w-16 sm:w-24 h-auto select-none pointer-events-none"
                        />

                        <div className="space-y-5 text-center text-sm sm:text-base lg:text-lg text-ink leading-relaxed max-w-4xl mx-auto">
                            {body1 && <p>{body1}</p>}
                            {body2 && <p>{body2}</p>}
                            {body3 && <p>{body3}</p>}
                        </div>

                        <img
                            src="/images/home/quote-close.png"
                            alt=""
                            aria-hidden="true"
                            className="absolute -bottom-8 -right-3 sm:-bottom-10 sm:right-0 w-16 sm:w-24 h-auto select-none pointer-events-none"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
