import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

    // Pinned-scroll driver — same shape as Nuor Steel's core values pattern.
    // The wrapper takes 300vh of height; the inner section sticks to the top
    // and stays fixed while we map the consumed scroll into a discrete step.
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const check = () => setIsDesktop(window.innerWidth >= 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined' || !isDesktop) return;

        const handleScroll = () => {
            const wrapper = wrapperRef.current;
            if (!wrapper) return;

            const rect = wrapper.getBoundingClientRect();
            const stickyTravel = wrapper.offsetHeight - window.innerHeight;
            if (stickyTravel <= 0) return;

            const scrolled = -rect.top;
            if (scrolled <= 0) {
                setActiveIndex(0);
                return;
            }

            const stepSize = stickyTravel / pillars.length;
            const next = Math.min(pillars.length - 1, Math.floor(scrolled / stepSize));
            setActiveIndex(next);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isDesktop, pillars.length]);

    // RTL flips both the orbital direction and the rim-spin so motion feels
    // natural with right-to-left flow.
    const direction: 1 | -1 = isRTL ? -1 : 1;
    const active = pillars[activeIndex] ?? pillars[0];

    return (
        <>
            {/* Desktop / tablet: pinned-scroll. */}
            <section
                ref={wrapperRef}
                className="hidden md:block relative h-[300vh] bg-surface"
                aria-label="Sky Amman assurance pillars"
            >
                <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
                    <PillarStage active={active} activeIndex={activeIndex} direction={direction} />
                </div>
            </section>

            {/* Mobile: tab buttons advance the active pillar. */}
            <section className="md:hidden bg-surface py-12" aria-label="Sky Amman assurance pillars">
                <div className="px-4">
                    <PillarStage active={active} activeIndex={activeIndex} direction={direction} compact />

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

interface PillarStageProps {
    active: Pillar;
    activeIndex: number;
    direction: 1 | -1;
    compact?: boolean;
}

/**
 * The visual stage. Three behaviours coordinate per pillar transition:
 *
 *  1. The half-circle backdrop (true semicircle, aspect 2:1) stays fixed but
 *     fades from solid primary at top to transparent at the bottom edge,
 *     matching the Figma frame's "blends into white" treatment.
 *
 *  2. The small white circle traces a short orbital arc (right-and-up, then
 *     back) on each step — this is the "circle moving on an orbit" the user
 *     asked for. The orbital wrapper is keyed on activeIndex so each step
 *     re-runs the keyframe sequence cleanly.
 *
 *  3. Inside the small circle, the disc visually spins 360° clockwise (or
 *     counter-clockwise in RTL) per step. A primary-coloured rim notch makes
 *     the rotation perceptible — a perfectly symmetric circle would otherwise
 *     hide the spin. Content is overlaid on top (not inside the rotating
 *     disc) so the number + title stay upright while the disc spins behind
 *     them; the content cross-fades at mid-rotation.
 */
function PillarStage({ active, activeIndex, direction, compact = false }: PillarStageProps) {
    const innerSize = compact ? 'w-40 h-40' : 'w-56 h-56 lg:w-64 lg:h-64';
    const stageMaxWidth = compact ? '100%' : 'min(900px, 90vw)';

    // Sweep magnitude scales with size; capped so the circle stays anchored.
    const sweepX = compact ? 36 : 60;
    const sweepY = compact ? -10 : -16;

    return (
        <div className="relative w-full mx-auto" style={{ maxWidth: stageMaxWidth }}>
            {/* True half-circle: aspect 2:1 + rounded-t-full = perfect semicircle.
                The mask gradient in the bottom 45% gives the fade-to-white. */}
            <div className="relative w-full aspect-[2/1]">
                <div
                    className="absolute inset-0 bg-primary rounded-t-full"
                    style={{
                        maskImage:
                            'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
                        WebkitMaskImage:
                            'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
                    }}
                />

                {/* Bullets — sit in the upper-middle of the half-circle. */}
                <div className="absolute inset-x-0 top-[42%] sm:top-[45%] flex items-start justify-center px-6 sm:px-12">
                    <AnimatePresence mode="wait">
                        <motion.ul
                            key={`bullets-${activeIndex}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            className="space-y-1.5 text-white text-center text-sm sm:text-base lg:text-lg max-w-2xl"
                        >
                            {active.bullets.map((b, i) => (
                                <li key={i}>{b}</li>
                            ))}
                        </motion.ul>
                    </AnimatePresence>
                </div>
            </div>

            {/* Centering anchor — the small circle's center lands on the
                half-circle's top edge. */}
            <div className={`absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 ${innerSize}`}>
                {/* Orbital sweep wrapper — keyed on activeIndex so each step
                    triggers a fresh keyframe traversal (right + up, then back). */}
                <motion.div
                    key={`orbit-${activeIndex}`}
                    className="absolute inset-0"
                    initial={{ x: 0, y: 0 }}
                    animate={{
                        x: [0, sweepX * direction, 0],
                        y: [0, sweepY, 0],
                    }}
                    transition={{ duration: 0.95, ease: 'easeInOut', times: [0, 0.5, 1] }}
                >
                    {/* Rotating disc — full primary border to match the Figma
                        frame. The 360° spin still runs (drives the disc behind
                        the content) but it's intentionally invisible on a
                        symmetric circle; the orbital arc + content fade carry
                        the perceived motion. */}
                    <motion.div
                        key={`disc-${activeIndex}`}
                        className="absolute inset-0 rounded-full bg-white shadow-xl border-4 border-primary"
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 * direction }}
                        transition={{ duration: 0.95, ease: 'easeInOut' }}
                    />


                    {/* Content overlay — does NOT rotate. Cross-fades at
                        mid-rotation so the swap reads as part of the spin. */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`label-${activeIndex}`}
                                initial={{ opacity: 0, scale: 0.92 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.04 }}
                                transition={{ duration: 0.4, delay: 0.3, ease: 'easeInOut' }}
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
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
