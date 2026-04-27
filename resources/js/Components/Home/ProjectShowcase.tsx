import { useMemo, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/cn';
import type { FeaturedProject, SiteContentBundle } from '@/types/home';

interface ProjectShowcaseProps {
    content: SiteContentBundle;
    projects: FeaturedProject[];
}

type CategoryFilter = 'under_development' | 'ready' | 'investment_opportunity';

export function ProjectShowcase({ content, projects }: ProjectShowcaseProps) {
    const { language, isRTL } = useLanguage();
    const showcase = content.showcase ?? {};

    const [filter, setFilter] = useState<CategoryFilter>('under_development');
    const trackRef = useRef<HTMLDivElement>(null);

    const filtered = useMemo(
        () => projects.filter((p) => p.category === filter),
        [projects, filter],
    );

    const scrollByOne = (dir: -1 | 1) => {
        const track = trackRef.current;
        if (!track) return;
        const card = track.querySelector<HTMLElement>('[data-card]');
        const step = card ? card.offsetWidth + 24 : 320;
        // Flip the visual direction in RTL so "next" still feels like "forward".
        const visualDir = isRTL ? -dir : dir;
        track.scrollBy({ left: step * visualDir, behavior: 'smooth' });
    };

    const filterPills: { key: CategoryFilter; labelKey: string }[] = [
        { key: 'under_development', labelKey: 'filter_under_development' },
        { key: 'ready', labelKey: 'filter_ready' },
        { key: 'investment_opportunity', labelKey: 'filter_investment' },
    ];

    return (
        <section className="bg-surface-muted py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary text-center tracking-wide">
                    {showcase.title?.content ?? ''}
                </h2>

                {/* Filter pills */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                    {filterPills.map(({ key, labelKey }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setFilter(key)}
                            className={cn(
                                'rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors',
                                filter === key
                                    ? 'bg-primary text-white'
                                    : 'bg-primary/15 text-primary-dark hover:bg-primary/25',
                            )}
                        >
                            {showcase[labelKey]?.content ?? ''}
                        </button>
                    ))}
                </div>

                {/* Carousel */}
                <div className="relative mt-10">
                    <button
                        type="button"
                        onClick={() => scrollByOne(-1)}
                        aria-label="Previous"
                        className="absolute start-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md text-primary hover:bg-primary hover:text-white transition-colors -translate-x-1/2 rtl:translate-x-1/2"
                    >
                        {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>

                    <div
                        ref={trackRef}
                        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {filtered.length === 0 && (
                            <div className="w-full text-center text-ink-muted py-12">
                                — no projects in this category yet —
                            </div>
                        )}
                        {filtered.map((p) => (
                            <ProjectCard
                                key={p.id}
                                project={p}
                                language={language}
                                ctaLabel={showcase.card_cta?.content ?? ''}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => scrollByOne(1)}
                        aria-label="Next"
                        className="absolute end-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md text-primary hover:bg-primary hover:text-white transition-colors translate-x-1/2 rtl:-translate-x-1/2"
                    >
                        {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>
            </div>
        </section>
    );
}

interface ProjectCardProps {
    project: FeaturedProject;
    language: 'en' | 'ar';
    ctaLabel: string;
}

function ProjectCard({ project, language, ctaLabel }: ProjectCardProps) {
    const title = language === 'ar' ? project.title_ar : project.title_en;
    const location = language === 'ar' ? project.location_ar : project.location_en;
    const areaLabel = language === 'ar' ? `${project.area_sqm} م²` : `${project.area_sqm} M²`;

    return (
        <article
            data-card
            className="snap-start shrink-0 w-[280px] sm:w-[300px] bg-white rounded-3xl shadow-md overflow-hidden flex flex-col"
        >
            <div className="aspect-[4/3] w-full overflow-hidden bg-primary-light/30">
                <img
                    src={project.image_url}
                    alt={title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="p-4 sm:p-5 flex flex-col items-center text-center flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-ink">{title}</h3>
                {location && <p className="mt-1 text-sm text-ink-muted">{location}</p>}
                {project.area_sqm != null && (
                    <p className="text-sm text-ink-muted">{areaLabel}</p>
                )}

                <Link
                    href={`/properties/${project.slug}`}
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-5 py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-primary-deep transition-colors"
                >
                    {ctaLabel}
                </Link>
            </div>
        </article>
    );
}
