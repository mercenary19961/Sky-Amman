import { useEffect, useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/cn';
import type { FeaturedProject } from '@/types/home';

interface ProjectShowcaseProps {
    title: string;
    ctaLabel: string;
    projects: FeaturedProject[];
}

export function ProjectShowcase({ title, ctaLabel, projects }: ProjectShowcaseProps) {
    const { language, isRTL } = useLanguage();

    const N = projects.length;
    const [activeIndex, setActiveIndex] = useState(0);
    // +1 = forward (card slides in from the right), -1 = backward (from the left).
    // AnimatePresence reads this to pick the correct enter/exit direction.
    const [direction, setDirection] = useState(1);

    // Wrap around in both directions so prev at index 0 lands on the last
    // card and next at the last card lands back on the first.
    const goTo = (i: number) => {
        const target = ((i % N) + N) % N;
        if (target !== activeIndex) {
            // Pick the shorter way around the ring so a dot click feels natural.
            const forwardDist = (target - activeIndex + N) % N;
            const backwardDist = (activeIndex - target + N) % N;
            setDirection(forwardDist <= backwardDist ? 1 : -1);
        }
        setActiveIndex(target);
    };
    const next = () => {
        setDirection(1);
        setActiveIndex((activeIndex + 1) % N);
    };
    const prev = () => {
        setDirection(-1);
        setActiveIndex((activeIndex - 1 + N) % N);
    };

    // Number of cards visible at once depends on viewport:
    //   < 768px  → 1 (mobile shows a single card with swipe/buttons)
    //   < 1024px → 2 (tablet shows two side-by-side)
    //   ≥ 1024px → 4 (desktop default)
    // Default to 4 for SSR; client refines on mount + resize.
    const [visibleCount, setVisibleCount] = useState(4);
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const update = () => {
            const w = window.innerWidth;
            setVisibleCount(w >= 1024 ? 4 : w >= 768 ? 2 : 1);
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    // Rotate the array so the active project sits first, then keep only the
    // first N cards visible on the current viewport. framer-motion's `layout`
    // prop on each card animates the positional shift when activeIndex changes.
    const visibleProjects = useMemo(() => {
        const rotated = [...projects.slice(activeIndex), ...projects.slice(0, activeIndex)];
        return rotated.slice(0, Math.min(visibleCount, N));
    }, [projects, activeIndex, N, visibleCount]);

    if (N === 0) return null;

    return (
        <section className="bg-surface py-16 sm:py-24">
            <div className="section-x">
                <h2 className="text-center text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-wide uppercase">
                    {title}
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

                    <motion.div
                        className="flex justify-center gap-6 pb-4 overflow-hidden touch-pan-y cursor-grab active:cursor-grabbing"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.25}
                        onDragEnd={(_, info) => {
                            // Threshold combines distance and velocity so a fast
                            // flick counts even when the offset is small.
                            const swipe = info.offset.x + info.velocity.x * 0.2;
                            const visualDir = isRTL ? -1 : 1;
                            if (swipe < -60 * visualDir) next();
                            else if (swipe > 60 * visualDir) prev();
                        }}
                    >
                        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                            {visibleProjects.map((p) => (
                                <motion.div
                                    key={p.id}
                                    layout
                                    custom={direction}
                                    initial={(d: number) => ({ opacity: 0, x: (isRTL ? -1 : 1) * d * 80 })}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={(d: number) => ({ opacity: 0, x: (isRTL ? -1 : 1) * -d * 80 })}
                                    transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                                >
                                    <ProjectCard
                                        project={p}
                                        language={language}
                                        ctaLabel={ctaLabel}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

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
