import { useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SiteContentBundle } from '@/types/home';

interface AssurancePillarsProps {
    content: SiteContentBundle;
}

interface Pillar {
    number: string;
    title: string;
    bullets: string[];
}

function buildPillar(section: SiteContentBundle[string] | undefined): Pillar {
    if (!section) return { number: '', title: '', bullets: [] };
    const bullets = ['bullet_1', 'bullet_2', 'bullet_3', 'bullet_4']
        .map((k) => section[k]?.content)
        .filter((s): s is string => Boolean(s));
    return {
        number: section.number?.content ?? '',
        title: section.title?.content ?? '',
        bullets,
    };
}

export function AssurancePillars({ content }: AssurancePillarsProps) {
    const { isRTL } = useLanguage();

    const pillars: Pillar[] = [
        buildPillar(content.assurance_financial),
        buildPillar(content.assurance_legal),
        buildPillar(content.assurance_safety),
    ];

    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end end'],
    });

    const [activeIndex, setActiveIndex] = useState(0);

    // Snap to thirds. Bumping the active index drives both the rotation and
    // the cross-fade (single source of truth keeps them in lockstep).
    useMotionValueEvent(scrollYProgress, 'change', (v) => {
        const next = Math.min(2, Math.max(0, Math.floor(v * 3)));
        if (next !== activeIndex) setActiveIndex(next);
    });

    // RTL: counter-clockwise so motion feels natural with right-to-left flow.
    const direction = isRTL ? -1 : 1;
    const rotation = activeIndex * 120 * direction;

    const active = pillars[activeIndex] ?? pillars[0];

    return (
        <>
            {/* Desktop / tablet: pinned scroll. h-[300vh] gives 3 viewports of scroll
                travel; the inner sticky container stays fixed while scroll progress
                drives activeIndex. */}
            <section
                ref={sectionRef}
                className="hidden md:block relative h-[300vh] bg-surface"
                aria-label="Sky Amman assurance pillars"
            >
                <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
                    <PillarVisual
                        rotation={rotation}
                        active={active}
                        activeIndex={activeIndex}
                    />
                </div>
            </section>

            {/* Mobile: tabbed instead of pinned-scroll. Tap to advance pillars. */}
            <section className="md:hidden bg-surface py-12" aria-label="Sky Amman assurance pillars">
                <div className="px-4">
                    <PillarVisual
                        rotation={rotation}
                        active={active}
                        activeIndex={activeIndex}
                        compact
                    />

                    <div className="mt-6 flex items-center justify-center gap-2">
                        {pillars.map((p, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setActiveIndex(i)}
                                aria-label={`Show pillar ${p.number}`}
                                aria-current={i === activeIndex}
                                className={`h-2.5 rounded-full transition-all ${
                                    i === activeIndex ? 'w-8 bg-primary' : 'w-2.5 bg-primary/30'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}

interface PillarVisualProps {
    rotation: number;
    active: Pillar;
    activeIndex: number;
    compact?: boolean;
}

function PillarVisual({ rotation, active, activeIndex, compact = false }: PillarVisualProps) {
    // The half-circle: a rounded shape that occupies the bottom of the viewport.
    // The white inner circle (with number + title) rotates as activeIndex advances.
    const halfCircleSize = compact ? 'h-[420px]' : 'h-[600px] lg:h-[680px]';
    const innerCircleSize = compact ? 'w-44 h-44' : 'w-56 h-56 lg:w-64 lg:h-64';

    return (
        <div className="relative w-full max-w-5xl mx-auto">
            {/* Outer half-circle (decorative, primary fill) */}
            <div
                className={`relative mx-auto rounded-t-full bg-primary/90 overflow-hidden ${halfCircleSize}`}
                style={{ width: compact ? '100%' : '90%', maxWidth: compact ? '100%' : '900px' }}
            >
                {/* Bullet text inside the half circle, below the inner circle */}
                <div className="absolute inset-x-0 bottom-12 sm:bottom-16 flex items-center justify-center px-6 sm:px-12">
                    <AnimatePresence mode="wait">
                        <motion.ul
                            key={`bullets-${activeIndex}`}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.45, ease: 'easeInOut' }}
                            className="space-y-2 text-white text-center text-sm sm:text-base lg:text-lg max-w-2xl"
                        >
                            {active.bullets.map((b, i) => (
                                <li key={i}>{b}</li>
                            ))}
                        </motion.ul>
                    </AnimatePresence>
                </div>
            </div>

            {/* Inner white circle (number + title) — sits on top of the half-circle's
                top edge, rotates as activeIndex advances. */}
            <motion.div
                className={`absolute left-1/2 -translate-x-1/2 -top-12 sm:-top-16 ${innerCircleSize} rounded-full bg-surface shadow-xl flex flex-col items-center justify-center text-center`}
                animate={{ rotate: rotation }}
                transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            >
                {/* Counter-rotate the inner content so text stays upright while the
                    circle "shell" rotates underneath. */}
                <motion.div
                    className="flex flex-col items-center justify-center px-4"
                    animate={{ rotate: -rotation }}
                    transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`label-${activeIndex}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.35 }}
                            className="flex flex-col items-center"
                        >
                            <span className="text-2xl sm:text-3xl font-bold text-primary">
                                {active.number}
                            </span>
                            <span className="mt-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-ink leading-tight">
                                {active.title}
                            </span>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </div>
    );
}
