import type { SiteContentBundle } from '@/types/home';

interface HeadOfDepartmentsProps {
    content: SiteContentBundle;
}

interface Member {
    name: string;
    role: string;
}

export function HeadOfDepartments({ content }: HeadOfDepartmentsProps) {
    const dept = content.departments ?? {};
    const title = dept.title?.content ?? '';

    const members: Member[] = [1, 2, 3, 4].map((i) => ({
        name: dept[`member_${i}_name`]?.content ?? '',
        role: dept[`member_${i}_role`]?.content ?? '',
    }));

    if (!title && members.every((m) => !m.name)) return null;

    return (
        <section className="bg-surface py-16 sm:py-24">
            <div className="section-x">
                {title && (
                    <h2 className="text-center text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-wide uppercase">
                        {title}
                    </h2>
                )}

                <div className="mt-10 sm:mt-12 lg:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 sm:gap-y-12 gap-x-6 lg:gap-x-8 3xl:gap-x-12">
                    {members.map(
                        (member, idx) =>
                            member.name && <DeptCard key={idx} member={member} />,
                    )}
                </div>
            </div>
        </section>
    );
}

function DeptCard({ member }: { member: Member }) {
    return (
        // pt reserves ~half the circle's height so the avatar can overhang the
        // card top WITHOUT colliding with the section title. Everything is sized
        // in % of the card so it scales with the (now full-width) cells.
        <div className="relative mx-auto w-full max-w-44 sm:max-w-52 lg:max-w-none pt-[37%]">
            {/* Avatar circle — ~card-width, sitting half over the card top. Solid
                primary fill for now; swap to <img> when portraits are delivered. */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[74%] aspect-square rounded-full bg-primary shadow-md z-10"
                aria-hidden="true"
            />

            {/* Asymmetric rounded card from Rectangle 54.svg */}
            <div
                className="relative aspect-257/199 w-full bg-no-repeat bg-contain bg-top"
                style={{ backgroundImage: 'url(/images/home/dept-card.svg)' }}
            >
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 sm:pb-6 lg:pb-8 px-3 sm:px-4 text-center">
                    <div className="font-bold text-xs sm:text-sm lg:text-base text-ink">
                        {member.name}
                    </div>
                    <div className="mt-1 text-[10px] sm:text-xs lg:text-sm text-primary">
                        {member.role}
                    </div>
                </div>
            </div>
        </div>
    );
}
