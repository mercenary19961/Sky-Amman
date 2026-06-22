import { User as UserIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SiteContentBundle, DepartmentMemberCard } from '@/types/home';

interface HeadOfDepartmentsProps {
    content: SiteContentBundle;
    // Active, ordered team members (image + bilingual name/role) from the admin
    // Head of Departments section.
    members: DepartmentMemberCard[];
}

interface Member {
    name: string;
    role: string;
    image: string | null;
}

export function HeadOfDepartments({ content, members }: HeadOfDepartmentsProps) {
    const { language } = useLanguage();
    const ar = language === 'ar';
    const dept = content.departments ?? {};
    const title = dept.title?.content ?? '';

    // Pick the active language per field; a field filled in only one language is
    // used for both (bidirectional fallback).
    const cards: Member[] = members
        .map((m) => ({
            name: (ar ? m.name_ar || m.name_en : m.name_en || m.name_ar) || '',
            role: (ar ? m.role_ar || m.role_en : m.role_en || m.role_ar) || '',
            image: m.image_url,
        }))
        .filter((m) => m.name || m.role);

    if (!title && cards.length === 0) return null;

    return (
        <section className="bg-surface py-16 sm:py-24">
            <div className="section-x">
                {title && (
                    <h2 className="text-center text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-wide uppercase">
                        {title}
                    </h2>
                )}

                {cards.length > 0 && (
                    <div className="mt-10 sm:mt-12 lg:mt-14 grid grid-cols-2 lg:grid-cols-4 gap-y-10 sm:gap-y-12 gap-x-6 lg:gap-x-8 3xl:gap-x-12">
                        {cards.map((member, idx) => (
                            <DeptCard key={idx} member={member} ar={ar} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function DeptCard({ member, ar }: { member: Member; ar: boolean }) {
    return (
        // Everything is sized as a % of the card width (pt, circle, text
        // padding) so the geometry is IDENTICAL at every viewport. The card SVG
        // has a big top-left corner radius (65/257 ≈ 25% of the width), so the
        // avatar is sized + nudged toward the supported side so its base rests
        // on the card's flat top edge instead of floating over the rounded-away
        // corner. pt = half the circle width (overhang by half).
        <div className="relative mx-auto w-full max-w-72 lg:max-w-80 pt-[30%]">
            {/* Avatar circle — 60% of the card width, centered. At this size it
                rests on the card's flat top edge and aligns above the centered
                name (it no longer floats over the rounded top-left corner the
                way the old 74% circle did). Shows the uploaded photo, or a
                primary-fill placeholder with a person icon when none is set. */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] aspect-square overflow-hidden rounded-full bg-primary shadow-md z-10">
                {member.image ? (
                    <img src={member.image} alt={member.name} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                    <div className="grid h-full w-full place-items-center text-white/70">
                        <UserIcon className="h-1/3 w-1/3" />
                    </div>
                )}
            </div>

            {/* Asymmetric rounded card from Rectangle 54.svg */}
            <div
                className="relative aspect-257/199 w-full bg-no-repeat bg-contain bg-top"
                style={{ backgroundImage: 'url(/images/home/dept-card.svg)' }}
            >
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-[12%] px-[8%] text-center">
                    {/* English names run longer and wrapped to two lines on the
                        narrow 2-col mobile cards, so they get a smaller mobile
                        size; Arabic stays at text-xs (fits fine). sm/lg are the
                        same for both. */}
                    <div className={`font-bold ${ar ? 'text-xs' : 'text-[10px]'} sm:text-base lg:text-lg text-ink`}>
                        {member.name}
                    </div>
                    <div className="mt-1 text-xs sm:text-sm lg:text-base text-primary">
                        {member.role}
                    </div>
                </div>
            </div>
        </div>
    );
}
