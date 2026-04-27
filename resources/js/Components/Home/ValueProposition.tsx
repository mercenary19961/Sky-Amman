import { Award, ShieldCheck, Tag, CreditCard } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SiteContentBundle } from '@/types/home';

interface ValuePropositionProps {
    content: SiteContentBundle;
}

export function ValueProposition({ content }: ValuePropositionProps) {
    const vp = content.value_prop ?? {};

    const items: { Icon: LucideIcon; key: string }[] = [
        { Icon: Award, key: 'item_1' },
        { Icon: ShieldCheck, key: 'item_2' },
        { Icon: Tag, key: 'item_3' },
        { Icon: CreditCard, key: 'item_4' },
    ];

    return (
        <section className="bg-surface py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary text-center tracking-wide">
                    {vp.title?.content ?? ''}
                </h2>

                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-5xl mx-auto">
                    {items.map(({ Icon, key }) => (
                        <div
                            key={key}
                            className="flex flex-col items-center text-center"
                        >
                            <Icon size={36} strokeWidth={1.25} className="text-primary mb-3" aria-hidden="true" />
                            <div className="rounded-3xl bg-primary-light/30 px-5 py-6 sm:py-8 text-sm sm:text-base text-ink leading-snug min-h-[120px] flex items-center justify-center w-full">
                                {vp[key]?.content ?? ''}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
