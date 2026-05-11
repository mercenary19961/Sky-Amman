import { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/cn';
import type { FeaturedProject, SiteContentBundle } from '@/types/home';

interface ProjectShowcaseProps {
    content: SiteContentBundle;
    projects: FeaturedProject[];
}

export function ProjectShowcase({ content, projects }: ProjectShowcaseProps) {
    const { language, isRTL } = useLanguage();
    const showcase = content.showcase ?? {};
    const trackRef = useRef<HTMLDivElement>(null);

    // Estimate "pages" of cards for the pagination dot count. We use 4 cards per
    // page on desktop as a sensible default; the active dot updates from scroll.
    const cardsPerPage = 4;
    const pageCount = Math.max(1, Math.ceil(projects.length / cardsPerPage));
    const [activePage, setActivePage] = useState(0);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        const onScroll = () => {
            const card = track.querySelector<HTMLElement>('[data-card]');
            const step = card ? card.offsetWidth + 24 : 280;
            const page = Math.round(track.scrollLeft / (step * cardsPerPage));
            setActivePage(Math.min(pageCount - 1, Math.max(0, page)));
        };
        track.addEventListener('scroll', onScroll, { passive: true });
        return () => track.removeEventListener('scroll', onScroll);
    }, [pageCount]);

    const scrollByOne = (dir: -1 | 1) => {
        const track = trackRef.current;
        if (!track) return;
        const card = track.querySelector<HTMLElement>('[data-card]');
        const step = card ? card.offsetWidth + 24 : 280;
        const visualDir = isRTL ? -dir : dir;
        track.scrollBy({ left: step * visualDir, behavior: 'smooth' });
    };

    if (projects.length === 0) return null;

    return (
        <section className="bg-surface py-16 sm:py-24">
            <div className="section-x">
                <h2 className="text-center text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-wide uppercase">
                    {showcase.title?.content ?? ''}
                </h2>

                <div className="relative mt-12">
                    <button
                        type="button"
                        onClick={() => scrollByOne(-1)}
                        aria-label="Previous"
                        className="absolute inset-s-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center w-11 h-11 rounded-full border-2 border-primary text-primary bg-white shadow-sm hover:bg-primary hover:text-white transition-colors -translate-x-1/2 rtl:translate-x-1/2"
                    >
                        {isRTL ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
                    </button>

                    <div
                        ref={trackRef}
                        className="flex justify-center gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {projects.map((p) => (
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
                        className="absolute inset-e-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center w-11 h-11 rounded-full border-2 border-primary text-primary bg-white shadow-sm hover:bg-primary hover:text-white transition-colors translate-x-1/2 rtl:-translate-x-1/2"
                    >
                        {isRTL ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
                    </button>
                </div>

                {/* Pagination dots */}
                {pageCount > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                        {Array.from({ length: pageCount }).map((_, i) => (
                            <span
                                key={i}
                                className={cn(
                                    'w-2.5 h-2.5 rounded-full transition-colors',
                                    i === activePage ? 'bg-primary' : 'bg-primary/25',
                                )}
                                aria-hidden="true"
                            />
                        ))}
                    </div>
                )}
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
            className="snap-start shrink-0 w-64 sm:w-72 bg-[#E5EBF0] rounded-[62px] p-4 flex flex-col"
        >
            <div className="aspect-square w-full overflow-hidden rounded-4xl bg-primary-light/30">
                <img
                    src={project.image_url}
                    alt={title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="px-2 pt-5 pb-3 flex flex-col items-center text-center flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-ink uppercase tracking-wide">
                    {title}
                </h3>
                {location && <p className="mt-1 text-sm text-ink">{location}</p>}
                {project.area_sqm != null && (
                    <p className="text-sm text-ink">{areaLabel}</p>
                )}

                <Link
                    href={`/properties/${project.slug}`}
                    className="mt-5 inline-flex items-center justify-center rounded-full bg-white text-primary px-6 py-2 text-xs sm:text-sm font-medium shadow-sm hover:bg-primary hover:text-white transition-colors"
                >
                    {ctaLabel}
                </Link>
            </div>
        </article>
    );
}
