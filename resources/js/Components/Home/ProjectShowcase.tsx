import { useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
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

    const N = projects.length;
    const [activeIndex, setActiveIndex] = useState(0);

    // Wrap around in both directions so prev at index 0 lands on the last
    // card and next at the last card lands back on the first.
    const goTo = (i: number) => setActiveIndex(((i % N) + N) % N);
    const next = () => goTo(activeIndex + 1);
    const prev = () => goTo(activeIndex - 1);

    // Rotate the array so the active project sits first, then keep only the
    // first 4 cards visible on big screens. framer-motion's `layout` prop on
    // each card animates the positional shift; cards entering/leaving the
    // visible window fade in/out via `AnimatePresence`.
    const VISIBLE_MAX = 4;
    const visibleProjects = useMemo(() => {
        const rotated = [...projects.slice(activeIndex), ...projects.slice(0, activeIndex)];
        return rotated.slice(0, Math.min(VISIBLE_MAX, N));
    }, [projects, activeIndex, N]);

    if (N === 0) return null;

    return (
        <section className="bg-surface py-16 sm:py-24">
            <div className="section-x">
                <h2 className="text-center text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-wide uppercase">
                    {showcase.title?.content ?? ''}
                </h2>

                <div className="relative mt-12">
                    <button
                        type="button"
                        onClick={prev}
                        aria-label="Previous"
                        className="absolute inset-s-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-primary text-primary bg-white shadow-sm hover:bg-primary hover:text-white transition-colors sm:-translate-x-1/2 sm:rtl:translate-x-1/2"
                    >
                        {isRTL ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
                    </button>

                    <div className="flex justify-center gap-6 pb-4 overflow-hidden">
                        {visibleProjects.map((p) => (
                            <motion.div
                                key={p.id}
                                layout
                                transition={{ type: 'spring', stiffness: 280, damping: 32 }}
                            >
                                <ProjectCard
                                    project={p}
                                    language={language}
                                    ctaLabel={showcase.card_cta?.content ?? ''}
                                />
                            </motion.div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={next}
                        aria-label="Next"
                        className="absolute inset-e-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-primary text-primary bg-white shadow-sm hover:bg-primary hover:text-white transition-colors sm:translate-x-1/2 sm:rtl:-translate-x-1/2"
                    >
                        {isRTL ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
                    </button>
                </div>

                {/* Clickable pagination dots (one per card). */}
                {N > 1 && (
                    <div className="mt-8 flex justify-center items-center gap-3">
                        {projects.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => goTo(i)}
                                aria-label={`Go to project ${i + 1}`}
                                className={cn(
                                    'rounded-full transition-all cursor-pointer',
                                    i === activeIndex
                                        ? 'w-3 h-3 bg-primary'
                                        : 'w-2.5 h-2.5 bg-primary/25 hover:bg-primary/50',
                                )}
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
        <article className="shrink-0 w-[85vw] sm:w-72 md:w-60 lg:w-[clamp(12rem,20vw,19rem)] bg-[#E5EBF0] rounded-[62px] p-4 flex flex-col">
            <div className="aspect-square w-full overflow-hidden rounded-4xl bg-primary-light/30">
                <img
                    src={project.image_url}
                    alt={title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="px-2 pt-5 pb-4 flex flex-col items-center text-center flex-1">
                <h3 className="text-sm sm:text-base md:text-sm lg:text-base xl:text-lg 3xl:text-2xl font-semibold text-ink uppercase tracking-wide whitespace-nowrap">
                    {title}
                </h3>
                {location && (
                    <p className="mt-2 text-sm sm:text-base text-ink">{location}</p>
                )}
                {project.area_sqm != null && (
                    <p className="text-sm sm:text-base text-ink">{areaLabel}</p>
                )}

                <Link
                    href={`/properties/${project.slug}`}
                    className="mt-5 inline-flex items-center justify-center rounded-full bg-white text-primary px-5 sm:px-6 lg:px-7 xl:px-9 py-2 sm:py-2.5 xl:py-3 text-sm sm:text-base xl:text-lg font-medium shadow-sm hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
                >
                    {ctaLabel}
                </Link>
            </div>
        </article>
    );
}
