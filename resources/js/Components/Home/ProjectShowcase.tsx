import { useEffect, useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/cn';
import type { FeaturedProject } from '@/types/home';

interface ProjectShowcaseProps {
    title: string;
    ctaLabel: string;
    projects: FeaturedProject[];
    // `single` = one wide card per slide (Properties for Rent). Default is the
    // multi-card grid that fills the row (Properties for Sale).
    single?: boolean;
}

export function ProjectShowcase({ title, ctaLabel, projects, single = false }: ProjectShowcaseProps) {
    const { language, isRTL } = useLanguage();

    const N = projects.length;
    const [activeIndex, setActiveIndex] = useState(0);
    // +1 = forward (new content slides in from the right), -1 = backward.
    const [direction, setDirection] = useState(1);

    // Grid mode shows 1 / 2 / 4 cards by viewport; single mode always shows 1.
    const [visibleCount, setVisibleCount] = useState(4);
    useEffect(() => {
        if (single || typeof window === 'undefined') return;
        const update = () => {
            const w = window.innerWidth;
            setVisibleCount(w >= 1024 ? 4 : w >= 768 ? 2 : 1);
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [single]);

    const goTo = (i: number) => {
        const target = ((i % N) + N) % N;
        if (target !== activeIndex) {
            const forward = (target - activeIndex + N) % N;
            const backward = (activeIndex - target + N) % N;
            setDirection(forward <= backward ? 1 : -1);
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

    // Rotate so the active project sits first, then keep the first N visible.
    const visibleProjects = useMemo(() => {
        const rotated = [...projects.slice(activeIndex), ...projects.slice(0, activeIndex)];
        return rotated.slice(0, Math.min(single ? 1 : visibleCount, N));
    }, [projects, activeIndex, N, visibleCount, single]);

    const onDragEnd = (_: unknown, info: PanInfo) => {
        // Combine distance + velocity so a fast flick counts even when short.
        const swipe = info.offset.x + info.velocity.x * 0.2;
        const visualDir = isRTL ? -1 : 1;
        if (swipe < -60 * visualDir) next();
        else if (swipe > 60 * visualDir) prev();
    };

    if (N === 0) return null;

    // Direction-aware slide + fade. `variants` accept a custom resolver (type-safe).
    const slideVariants = {
        enter: (d: number) => ({ opacity: 0, x: (isRTL ? -1 : 1) * d * 80 }),
        center: { opacity: 1, x: 0 },
        exit: (d: number) => ({ opacity: 0, x: (isRTL ? -1 : 1) * -d * 80 }),
    };

    return (
        <section className="bg-surface py-16 sm:py-24">
            <div className="section-x">
                <h2 className="text-center text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-wide uppercase">
                    {title}
                </h2>
            </div>

            {/* Full-width wrapper so arrows sit in the side padding, OUTSIDE the
                cards. The cards stay within section-x, lining up with every other
                section regardless of the arrows. */}
            <div className="relative mt-10 sm:mt-12">
                <div className="section-x overflow-hidden">
                    {single ? (
                        <motion.div
                            className="cursor-grab active:cursor-grabbing touch-pan-y"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={onDragEnd}
                        >
                            <AnimatePresence mode="wait" custom={direction} initial={false}>
                                <motion.div
                                    key={projects[activeIndex].id}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                >
                                    <SingleProjectCard
                                        project={projects[activeIndex]}
                                        language={language}
                                        ctaLabel={ctaLabel}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="flex gap-6 lg:gap-8 cursor-grab active:cursor-grabbing touch-pan-y"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={onDragEnd}
                        >
                            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                                {visibleProjects.map((p) => (
                                    <motion.div
                                        key={p.id}
                                        layout
                                        custom={direction}
                                        variants={slideVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                                        className="flex-1 min-w-0"
                                    >
                                        <GridProjectCard project={p} language={language} ctaLabel={ctaLabel} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>

                {N > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={prev}
                            aria-label="Previous"
                            className="absolute top-1/2 -translate-y-1/2 inset-s-1 sm:inset-s-3 lg:inset-s-6 3xl:inset-s-12 z-10 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-primary text-primary bg-white/90 shadow-sm hover:bg-primary hover:text-white transition-colors cursor-pointer"
                        >
                            {isRTL ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
                        </button>
                        <button
                            type="button"
                            onClick={next}
                            aria-label="Next"
                            className="absolute top-1/2 -translate-y-1/2 inset-e-1 sm:inset-e-3 lg:inset-e-6 3xl:inset-e-12 z-10 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-primary text-primary bg-white/90 shadow-sm hover:bg-primary hover:text-white transition-colors cursor-pointer"
                        >
                            {isRTL ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
                        </button>
                    </>
                )}
            </div>

            {/* Pagination dots (one per project). */}
            {N > 1 && (
                <div className="section-x mt-8 flex justify-center items-center gap-3">
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
        </section>
    );
}

interface CardProps {
    project: FeaturedProject;
    language: 'en' | 'ar';
    ctaLabel: string;
}

/** Multi-card grid card (Properties for Sale) — fills its flex cell. */
function GridProjectCard({ project, language, ctaLabel }: CardProps) {
    const title = language === 'ar' ? project.title_ar : project.title_en;
    const location = language === 'ar' ? project.location_ar : project.location_en;
    const areaLabel = language === 'ar' ? `${project.area_sqm} م²` : `${project.area_sqm} M²`;

    return (
        <article className="w-full bg-[#E5EBF0] rounded-[62px] p-4 flex flex-col">
            {/* Mobile: short banner (h-56) to match the single Rent card.
                sm+: restore the square grid image. */}
            <div className="h-56 w-full sm:h-auto sm:aspect-square overflow-hidden rounded-4xl bg-primary-light/30">
                <img
                    src={project.image_url}
                    alt={title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center"
                />
            </div>

            <div className="px-2 pt-5 pb-4 flex flex-col items-center text-center flex-1">
                <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold text-ink uppercase tracking-wide">
                    {title}
                </h3>
                {location && <p className="mt-2 text-sm sm:text-base text-ink">{location}</p>}
                {project.area_sqm != null && <p className="text-sm sm:text-base text-ink">{areaLabel}</p>}

                <Link
                    href={`/properties/${project.slug}`}
                    className="mt-5 inline-flex items-center justify-center rounded-full bg-white text-primary px-6 lg:px-8 py-2.5 text-sm sm:text-base font-medium shadow-sm hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
                >
                    {ctaLabel}
                </Link>
            </div>
        </article>
    );
}

/** Single wide card (Properties for Rent) — banner image + details + full CTA. */
function SingleProjectCard({ project, language, ctaLabel }: CardProps) {
    const title = language === 'ar' ? project.title_ar : project.title_en;
    const location = language === 'ar' ? project.location_ar : project.location_en;
    const areaLabel = language === 'ar' ? `${project.area_sqm} م²` : `${project.area_sqm} M²`;

    return (
        <article className="bg-surface-muted rounded-[40px] p-4 sm:p-6 lg:p-8">
            {/* Fixed responsive height; object-cover + object-center keeps any
                uploaded photo cropped from the middle. */}
            <div className="overflow-hidden rounded-[28px] h-56 sm:h-72 lg:h-80 3xl:h-96 bg-primary-light/30">
                <img
                    src={project.image_url}
                    alt={title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center"
                />
            </div>

            <div className="text-center mt-5 sm:mt-6">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-ink uppercase tracking-wide">
                    {title}
                </h3>
                {location && <p className="mt-2 text-sm sm:text-base lg:text-lg text-ink">{location}</p>}
                {project.area_sqm != null && (
                    <p className="text-sm sm:text-base lg:text-lg text-ink">{areaLabel}</p>
                )}
            </div>

            <Link
                href={`/properties/${project.slug}`}
                className="mt-5 sm:mt-6 block w-full text-center rounded-full bg-white text-primary py-3 sm:py-3.5 text-sm sm:text-base font-medium shadow-sm hover:bg-primary hover:text-white transition-colors"
            >
                {ctaLabel}
            </Link>
        </article>
    );
}
