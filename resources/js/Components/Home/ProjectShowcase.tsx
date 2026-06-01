import { useState } from 'react';
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
    // +1 = forward (new card slides in from the right), -1 = backward.
    const [direction, setDirection] = useState(1);

    const goTo = (i: number) => {
        const target = ((i % N) + N) % N;
        if (target !== activeIndex) {
            // Pick the shorter way around the ring so a dot click feels natural.
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

    if (N === 0) return null;
    const project = projects[activeIndex];

    // Direction-aware slide + fade for the single card. `variants` accept a
    // custom resolver, keeping this type-safe. RTL flips the travel direction.
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

            {/* Full-width wrapper so the arrows can sit in the side padding,
                OUTSIDE the card. The card itself stays within section-x, so it
                lines up with every other section regardless of the arrows. */}
            <div className="relative mt-10 sm:mt-12">
                <div className="section-x overflow-hidden">
                    <motion.div
                        className="cursor-grab active:cursor-grabbing touch-pan-y"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            const swipe = info.offset.x + info.velocity.x * 0.2;
                            const visualDir = isRTL ? -1 : 1;
                            if (swipe < -60 * visualDir) next();
                            else if (swipe > 60 * visualDir) prev();
                        }}
                    >
                        <AnimatePresence mode="wait" custom={direction} initial={false}>
                            <motion.div
                                key={project.id}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                            >
                                <ProjectCard project={project} language={language} ctaLabel={ctaLabel} />
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
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
        <article className="bg-surface-muted rounded-[40px] p-4 sm:p-6 lg:p-8">
            {/* Wide banner image — fixed responsive height so it stays a sensible
                size at full width; object-cover + object-center keeps any uploaded
                photo cropped from the middle. */}
            <div className="overflow-hidden rounded-[28px] h-56 sm:h-72 lg:h-80 3xl:h-96 bg-primary-light/30">
                <img
                    src={project.image_url}
                    alt={title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center"
                />
            </div>

            {/* Details */}
            <div className="text-center mt-5 sm:mt-6">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-ink uppercase tracking-wide">
                    {title}
                </h3>
                {location && <p className="mt-2 text-sm sm:text-base lg:text-lg text-ink">{location}</p>}
                {project.area_sqm != null && (
                    <p className="text-sm sm:text-base lg:text-lg text-ink">{areaLabel}</p>
                )}
            </div>

            {/* Full-width CTA */}
            <Link
                href={`/properties/${project.slug}`}
                className="mt-5 sm:mt-6 block w-full text-center rounded-full bg-white text-primary py-3 sm:py-3.5 text-sm sm:text-base font-medium shadow-sm hover:bg-primary hover:text-white transition-colors"
            >
                {ctaLabel}
            </Link>
        </article>
    );
}
