import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

    // Pinned-scroll driver. h-[240vh] gives 140vh of pinned travel — enough
    // room for each transition to fully play out (~47vh per pillar) without
    // the user feeling the page is "stuck".
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isDesktop, setIsDesktop] = useState(false);
    // Per-transition direction sign: +1 when advancing (scroll down / next
    // pillar), -1 when regressing (scroll up / previous pillar). This flips
    // the orbital arc so the motion mirrors the user's scroll direction —
    // clockwise on the way down, counter-clockwise on the way back up.
    const [transitionSign, setTransitionSign] = useState<1 | -1>(1);

    // Single-flight transition gate. Fast scrolling shouldn't kick off
    // overlapping animations — instead, scroll updates the latest target and
    // we chain to it once the running transition finishes. Refs avoid stale
    // closures across the scroll handler / setTimeout / state cycle.
    const activeIndexRef = useRef(0);
    const targetIndexRef = useRef(0);
    const isAnimatingRef = useRef(false);
    const animationTimerRef = useRef<number | null>(null);

    // Should match the longest running animation (orbital arc duration).
    const ANIMATION_LOCKOUT_MS = 1700;

    const startTransition = (nextIndex: number) => {
        const sign: 1 | -1 = nextIndex > activeIndexRef.current ? 1 : -1;
        isAnimatingRef.current = true;
        activeIndexRef.current = nextIndex;
        // Both state updates batch into one render so the entering motion.div
        // and the exiting one (captured by AnimatePresence) see the same sign.
        setTransitionSign(sign);
        setActiveIndex(nextIndex);

        if (animationTimerRef.current !== null) {
            window.clearTimeout(animationTimerRef.current);
        }
        animationTimerRef.current = window.setTimeout(() => {
            isAnimatingRef.current = false;
            // Scroll may have moved on while we were animating. Chain to the
            // latest target — skipping intermediate pillars keeps fast scrolls
            // responsive without ever overlapping animations.
            if (targetIndexRef.current !== activeIndexRef.current) {
                startTransition(targetIndexRef.current);
            }
        }, ANIMATION_LOCKOUT_MS);
    };

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
            let next: number;
            if (scrolled <= 0) {
                next = 0;
            } else {
                const stepSize = stickyTravel / pillars.length;
                next = Math.min(pillars.length - 1, Math.floor(scrolled / stepSize));
            }

            targetIndexRef.current = next;

            // Only kick off a transition if nothing is currently running and
            // the target actually differs from what's on screen. Otherwise the
            // post-lockout chain check picks it up.
            if (!isAnimatingRef.current && next !== activeIndexRef.current) {
                startTransition(next);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
        // startTransition reads only refs, so no need to depend on it here.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDesktop, pillars.length]);

    useEffect(() => {
        return () => {
            if (animationTimerRef.current !== null) {
                window.clearTimeout(animationTimerRef.current);
            }
        };
    }, []);

    // RTL flips the orbital direction so motion stays natural with the
    // right-to-left reading flow.
    const direction: 1 | -1 = isRTL ? -1 : 1;
    const active = pillars[activeIndex] ?? pillars[0];

    // Jump to a specific pillar (used by the mobile dots + arrows). Routes
    // through the same single-flight gate as the scroll driver.
    const goTo = (i: number) => {
        targetIndexRef.current = i;
        if (!isAnimatingRef.current && i !== activeIndexRef.current) {
            startTransition(i);
        }
    };
    const goPrev = () => goTo((activeIndex - 1 + pillars.length) % pillars.length);
    const goNext = () => goTo((activeIndex + 1) % pillars.length);

    return (
        <>
            {/* Desktop / tablet: pinned-scroll. */}
            <section
                ref={wrapperRef}
                className="hidden md:block relative h-[240vh] bg-surface"
                aria-label="SkyAmman assurance pillars"
            >
                <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
                    <PillarStage
                        active={active}
                        activeIndex={activeIndex}
                        direction={direction}
                        transitionSign={transitionSign}
                    />
                </div>
            </section>

            {/* Mobile: a self-sizing card (no arc mask, so text never clips) with
                arrow + dot navigation between the three pillars. */}
            <section className="md:hidden bg-surface py-12" aria-label="SkyAmman assurance pillars">
                <div className="px-4">
                    <div className="relative mx-auto max-w-sm">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIndex}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -14 }}
                                transition={{ duration: 0.4, ease: 'easeInOut' }}
                                className="flex flex-col items-center"
                            >
                                {/* Number + title circle, straddling the panel top. */}
                                <div className="relative z-10 grid h-28 w-28 place-content-center rounded-full border-4 border-primary bg-white px-3 text-center shadow-xl">
                                    <span className="text-2xl font-bold text-primary">{active.number}</span>
                                    <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-ink leading-tight">
                                        {active.title}
                                    </span>
                                </div>

                                {/* Panel grows to fit the bullets — no fade clipping. */}
                                <div className="-mt-14 w-full rounded-4xl bg-primary px-6 pb-8 pt-20">
                                    <ul className="space-y-3 text-center text-base text-white">
                                        {active.bullets.map((b, i) => (
                                            <li key={i}>{b}</li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Prev · dots · next */}
                    <div className="mt-6 flex items-center justify-center gap-4">
                        <button
                            type="button"
                            onClick={goPrev}
                            aria-label="Previous pillar"
                            className="grid h-9 w-9 place-content-center rounded-full border border-primary/40 text-primary transition-colors hover:bg-primary hover:text-white"
                        >
                            <ChevronLeft size={18} className="rtl:rotate-180" />
                        </button>

                        <div className="flex items-center gap-2">
                            {pillars.map((p, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => goTo(i)}
                                    aria-label={`Show pillar ${p.number}`}
                                    aria-current={i === activeIndex}
                                    className={`h-2.5 rounded-full transition-all ${
                                        i === activeIndex ? 'w-8 bg-primary' : 'w-2.5 bg-primary/30'
                                    }`}
                                />
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={goNext}
                            aria-label="Next pillar"
                            className="grid h-9 w-9 place-content-center rounded-full border border-primary/40 text-primary transition-colors hover:bg-primary hover:text-white"
                        >
                            <ChevronRight size={18} className="rtl:rotate-180" />
                        </button>
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
    /**
     * Per-transition sign: +1 advancing (clockwise in LTR), -1 regressing
     * (counter-clockwise in LTR). Combined with `direction` (language) to
     * produce the final orbital sign — RTL flips both, so the visual feel is:
     *
     *   LTR + advance  → clockwise (out top→right, in left→top)
     *   LTR + regress  → counter-clockwise (out top→left, in right→top)
     *   RTL + advance  → counter-clockwise (mirrored to RTL reading)
     *   RTL + regress  → clockwise
     */
    transitionSign: 1 | -1;
    compact?: boolean;
}

/**
 * Visual stage. Two layers per pillar transition:
 *
 *  1. The half-circle backdrop (true semicircle, aspect 2/1) with a
 *     fade-to-white mask at the bottom. Bullets cross-fade on activeIndex.
 *
 *  2. The small white circle managed by AnimatePresence with mode="popLayout".
 *     The OUTGOING circle traces the half-circle's actual arc clockwise from
 *     top → past the right edge → down into the bottom-right fade zone, and
 *     fades out along the way. The INCOMING circle simultaneously emerges
 *     from the bottom-left fade zone and rides the same arc up to the top.
 *     Both circles co-exist mid-transition, traveling clockwise on the same
 *     orbit.
 *
 *     The orbit radius equals the half-circle's rendered height (measured at
 *     runtime via ResizeObserver) so the small circle's path tracks the
 *     half-circle's outer edge exactly. Position is parameterised by angle
 *     θ from "straight up": x = R·sin(θ), y = R·(1 − cos(θ)). Sampling at
 *     ~10° increments produces a path indistinguishable from a continuous
 *     circular arc when framer-motion linearly interpolates between samples.
 */
function PillarStage({ active, activeIndex, direction, transitionSign, compact = false }: PillarStageProps) {
    const innerSize = compact ? 'w-40 h-40' : 'w-56 h-56 lg:w-64 lg:h-64';
    const stageMaxWidth = compact ? '100%' : 'min(900px, 90vw)';

    // Measure the half-circle's rendered height; that becomes the orbit radius.
    const halfCircleRef = useRef<HTMLDivElement>(null);
    const [orbitR, setOrbitR] = useState(compact ? 130 : 450);

    useEffect(() => {
        const el = halfCircleRef.current;
        if (!el || typeof window === 'undefined') return;
        const update = (h: number) => {
            // Cap mobile orbit so the small circle doesn't overshoot the
            // tight half-circle on small viewports.
            setOrbitR(compact ? Math.min(150, h * 0.85) : h);
        };
        update(el.getBoundingClientRect().height);
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) update(entry.contentRect.height);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [compact]);

    // Dense keyframes for smooth arc — 12 samples over a 120° arc ≈ 10° per
    // step, well below where linear interpolation reads as faceted.
    const SAMPLES = 12;
    const ANGLE_RANGE_DEG = 120;
    const times = Array.from({ length: SAMPLES + 1 }, (_, i) => i / SAMPLES);

    // Combined custom data passed to AnimatePresence and the motion.div.
    // Variants below read this at animation-evaluation time, NOT at render
    // time, so even an exiting child (already removed from JSX) uses the
    // current transitionSign — fixes the stale-prop bug on first transition
    // and direction reversals.
    const xSign = direction * transitionSign;
    const customData = { xSign, orbitR };

    type CustomData = typeof customData;

    const variants = {
        // Static start position for the entering circle: the first sample of
        // the incoming arc (bottom-left in LTR-forward, mirrored otherwise).
        initial: ({ xSign, orbitR }: CustomData) => {
            const startRad = (-ANGLE_RANGE_DEG * Math.PI) / 180;
            return {
                x: orbitR * Math.sin(startRad) * xSign,
                y: orbitR * (1 - Math.cos(startRad)),
                opacity: 0,
            };
        },
        // Entering arc: from -ANGLE_RANGE → 0° (riding up the orbit to top).
        enter: ({ xSign, orbitR }: CustomData) => {
            const xs: number[] = [];
            const ys: number[] = [];
            const ops: number[] = [];
            for (let i = 0; i <= SAMPLES; i++) {
                const t = i / SAMPLES;
                const inRad = ((-ANGLE_RANGE_DEG + ANGLE_RANGE_DEG * t) * Math.PI) / 180;
                xs.push(orbitR * Math.sin(inRad) * xSign);
                ys.push(orbitR * (1 - Math.cos(inRad)));
                // Invisible for first ~35% (still in fade zone), then fades in.
                ops.push(Math.max(0, Math.min(1, (t - 0.35) / 0.55)));
            }
            return { x: xs, y: ys, opacity: ops };
        },
        // Exiting arc: from top (0°) → +ANGLE_RANGE (riding down the orbit
        // into the fade zone).
        exit: ({ xSign, orbitR }: CustomData) => {
            const xs: number[] = [];
            const ys: number[] = [];
            const ops: number[] = [];
            for (let i = 0; i <= SAMPLES; i++) {
                const t = i / SAMPLES;
                const outRad = (ANGLE_RANGE_DEG * t * Math.PI) / 180;
                xs.push(orbitR * Math.sin(outRad) * xSign);
                ys.push(orbitR * (1 - Math.cos(outRad)));
                // Solid for first ~35% (still near top, visible), then fades out.
                ops.push(Math.max(0, Math.min(1, 1 - (t - 0.35) / 0.55)));
            }
            return { x: xs, y: ys, opacity: ops };
        },
    } as const;

    return (
        <div className="relative w-full mx-auto" style={{ maxWidth: stageMaxWidth }}>
            {/* True half-circle: aspect 2/1 + rounded-t-full = perfect semicircle. */}
            <div ref={halfCircleRef} className="relative w-full aspect-2/1">
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
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                            className="space-y-1.5 text-white text-center text-base sm:text-lg lg:text-xl max-w-2xl"
                        >
                            {active.bullets.map((b, i) => (
                                <li key={i}>{b}</li>
                            ))}
                        </motion.ul>
                    </AnimatePresence>
                </div>
            </div>

            {/* Centering anchor — small circle's resting center sits on the
                half-circle's top edge. */}
            <div className={`absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 ${innerSize}`}>
                <AnimatePresence mode="popLayout" initial={false} custom={customData}>
                    <motion.div
                        key={`pillar-${activeIndex}`}
                        className="absolute inset-0"
                        custom={customData}
                        variants={variants}
                        initial="initial"
                        animate="enter"
                        exit="exit"
                        transition={{
                            duration: 1.6,
                            ease: 'easeInOut',
                            times,
                        }}
                    >
                        {/* White disc with full primary border. */}
                        <div className="absolute inset-0 rounded-full bg-white shadow-xl border-4 border-primary" />

                        {/* Number + title centered inside. */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
                            <span className="text-2xl sm:text-3xl font-bold text-primary">
                                {active.number}
                            </span>
                            <span className="mt-2 text-sm sm:text-base font-semibold uppercase tracking-wider text-ink leading-tight">
                                {active.title}
                            </span>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
