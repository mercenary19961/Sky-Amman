import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, User as UserIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/cn';
import type { SiteContentBundle, TestimonialCard } from '@/types/home';

interface TestimonialsProps {
    content: SiteContentBundle;
    // Active, ordered video URLs from the admin Testimonial Videos section.
    videos: string[];
    // Active, ordered client testimonials (image + bilingual name/quote) from
    // the admin Testimonials section.
    testimonials: TestimonialCard[];
}

interface Client {
    name: string;
    quote: string;
    image: string | null;
}

// A direct media file (self-hosted /videos/x.mp4) renders in a <video> tag;
// a YouTube link renders as a lazy-loaded embed; anything else is treated as a
// generic embed URL (e.g. Vimeo) for an <iframe>.
const VIDEO_FILE_RE = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;

/**
 * Extract the 11-char video id from any common YouTube URL shape
 * (watch?v=, youtu.be/, embed/, shorts/, /v/). Returns null for non-YouTube
 * URLs so an admin can paste a normal share/watch link and it Just Works.
 */
function youtubeId(url: string): string | null {
    const m = url.match(
        /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
    );
    return m ? m[1] : null;
}

const youtubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const youtubeEmbed = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?rel=0`;

export function Testimonials({ content, videos, testimonials }: TestimonialsProps) {
    const { language } = useLanguage();
    const ar = language === 'ar';
    const t = content.testimonials ?? {};
    const title = t.title?.content ?? '';

    // Pick the active language per card (AR falls back to EN when blank).
    const clients: Client[] = testimonials
        .map((c) => ({
            name: (ar ? c.name_ar : c.name_en) || c.name_en || '',
            quote: (ar ? c.quote_ar : c.quote_en) || c.quote_en || '',
            image: c.image_url,
        }))
        .filter((c) => c.name || c.quote);

    if (!title && videos.length === 0 && clients.length === 0) return null;

    return (
        <section className="bg-surface py-16 sm:py-24">
            <div className="section-x">
                {title && (
                    <h2 className="text-center text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-wide uppercase">
                        {title}
                    </h2>
                )}

                <TestimonialVideos videos={videos} />

                {/* Client testimonial cards — carousel with prev/next + dots. */}
                {clients.length > 0 && <ClientCardsCarousel clients={clients} />}
            </div>
        </section>
    );
}

/** Visible card count by viewport: 1 (mobile) / 2 (sm) / 4 (lg+). */
function useVisibleCount(): number {
    const [count, setCount] = useState(4);
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const update = () => {
            const w = window.innerWidth;
            setCount(w >= 1024 ? 4 : w >= 640 ? 2 : 1);
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);
    return count;
}

/**
 * Windowed carousel over the client cards. Shows `visible` cards starting at
 * `activeIndex` and wraps around; arrows + dots step by one. When there are no
 * more cards than fit, it renders a plain centred row with no controls.
 */
function ClientCardsCarousel({ clients }: { clients: Client[] }) {
    const visible = useVisibleCount();
    const [activeIndex, setActiveIndex] = useState(0);
    const N = clients.length;
    const showControls = N > visible;

    // Keep activeIndex valid if the list size or viewport changes.
    useEffect(() => {
        setActiveIndex((i) => (N === 0 ? 0 : i % N));
    }, [N]);

    const wrap = (i: number) => ((i % N) + N) % N;
    const next = () => setActiveIndex((i) => wrap(i + 1));
    const prev = () => setActiveIndex((i) => wrap(i - 1));

    const shown = showControls
        ? Array.from({ length: visible }, (_, k) => ({ client: clients[wrap(activeIndex + k)], pos: wrap(activeIndex + k) }))
        : clients.map((client, pos) => ({ client, pos }));

    const cols = showControls ? visible : Math.min(N, 4);

    return (
        <div className="relative mt-14 sm:mt-20">
            {/* Arrows sit outside the grid on lg, overlay on smaller screens. */}
            {showControls && (
                <>
                    <button
                        type="button"
                        onClick={prev}
                        aria-label="Previous testimonials"
                        className="absolute z-20 -inset-s-1 sm:-inset-s-3 lg:-inset-s-5 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-primary text-primary bg-white/90 shadow-sm hover:bg-primary hover:text-white transition-colors cursor-pointer rtl:rotate-180"
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <button
                        type="button"
                        onClick={next}
                        aria-label="Next testimonials"
                        className="absolute z-20 -inset-e-1 sm:-inset-e-3 lg:-inset-e-5 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-primary text-primary bg-white/90 shadow-sm hover:bg-primary hover:text-white transition-colors cursor-pointer rtl:rotate-180"
                    >
                        <ChevronRight size={22} />
                    </button>
                </>
            )}

            <div
                className="grid gap-6 lg:gap-8"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
                <AnimatePresence mode="popLayout" initial={false}>
                    {shown.map(({ client, pos }) => (
                        <motion.div
                            key={pos}
                            layout
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ClientCard client={client} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Pagination dots — one per testimonial (the active window start). */}
            {showControls && (
                <div className="mt-8 flex justify-center items-center gap-3">
                    {clients.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setActiveIndex(i)}
                            aria-label={`Go to testimonial ${i + 1}`}
                            className={cn(
                                'rounded-full transition-all cursor-pointer',
                                i === activeIndex ? 'w-3 h-3 bg-primary' : 'w-2.5 h-2.5 bg-primary/25 hover:bg-primary/50',
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Three-video composition + carousel. The Figma frame was a wide ~2.5:1 crop,
 * but real videos (esp. YouTube) are 16:9 — a wide frame pillarboxes them with
 * black side bars. So every slot is 16:9 (`aspect-video` via the 25/9 container
 * + matched widths): the centre clip fills edge-to-edge. The centre is the
 * active video (on top, with the play overlay); the two side previews show the
 * prev/next videos, faded and peeking out behind. Clicking a side preview — or
 * an arrow / dot — rotates the active video. Slot contents slide + fade on
 * change (framer-motion, direction-aware).
 *
 * Geometry (container 25/9 ≈ 2.78:1): centre w-64% × h-full → 16:9; each side
 * w-50% × h-78% → 16:9, vertically centred (top-11%), peeking left/right.
 */
function TestimonialVideos({ videos }: { videos: string[] }) {
    const N = videos.length;
    const [activeIndex, setActiveIndex] = useState(0);
    // +1 = forward (new content slides in from the right), -1 = backward.
    const [direction, setDirection] = useState(1);

    // Empty state: no videos configured yet → a single placeholder frame.
    if (N === 0) {
        return (
            <div className="relative mx-auto mt-10 sm:mt-12 aspect-25/9">
                <div className="absolute left-[18%] top-0 w-[64%] h-full z-20">
                    <CenterVideo src="" />
                </div>
            </div>
        );
    }

    const wrap = (i: number) => ((i % N) + N) % N;
    const next = () => {
        setDirection(1);
        setActiveIndex((i) => wrap(i + 1));
    };
    const prev = () => {
        setDirection(-1);
        setActiveIndex((i) => wrap(i - 1));
    };
    const goTo = (target: number) => {
        const dest = wrap(target);
        if (dest !== activeIndex) {
            // Pick the shorter way around the ring so a dot click feels natural.
            const forward = wrap(dest - activeIndex);
            const backward = wrap(activeIndex - dest);
            setDirection(forward <= backward ? 1 : -1);
        }
        setActiveIndex(dest);
    };

    const centerIndex = activeIndex;
    const leftIndex = wrap(activeIndex - 1);
    const rightIndex = wrap(activeIndex + 1);
    const multi = N > 1;

    return (
        <>
            <div className="relative mx-auto mt-10 sm:mt-12 aspect-25/9">
                {/* Left preview (previous video) — 16:9, peeks out behind the centre. */}
                <VideoSlot
                    className="left-0 top-[11%] w-[50%] h-[78%] z-10"
                    index={leftIndex}
                    src={videos[leftIndex]}
                    variant="side"
                    direction={direction}
                    onClick={multi ? prev : undefined}
                    ariaLabel="Previous video"
                />

                {/* Right preview (next video). */}
                <VideoSlot
                    className="left-[50%] top-[11%] w-[50%] h-[78%] z-10"
                    index={rightIndex}
                    src={videos[rightIndex]}
                    variant="side"
                    direction={direction}
                    onClick={multi ? next : undefined}
                    ariaLabel="Next video"
                />

                {/* Centre — the active, playable video (16:9, fills edge-to-edge). */}
                <VideoSlot
                    className="left-[18%] top-0 w-[64%] h-full z-20"
                    index={centerIndex}
                    src={videos[centerIndex]}
                    variant="center"
                    direction={direction}
                />

                {/* Arrow controls. */}
                {multi && (
                    <>
                        <button
                            type="button"
                            onClick={prev}
                            aria-label="Previous video"
                            className="absolute z-30 left-2 sm:left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-primary text-primary bg-white/90 shadow-sm hover:bg-primary hover:text-white transition-colors cursor-pointer"
                        >
                            <ChevronLeft size={22} />
                        </button>
                        <button
                            type="button"
                            onClick={next}
                            aria-label="Next video"
                            className="absolute z-30 right-2 sm:right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-primary text-primary bg-white/90 shadow-sm hover:bg-primary hover:text-white transition-colors cursor-pointer"
                        >
                            <ChevronRight size={22} />
                        </button>
                    </>
                )}
            </div>

            {/* Pagination dots (one per video). */}
            {multi && (
                <div className="mt-6 flex justify-center items-center gap-3">
                    {videos.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => goTo(i)}
                            aria-label={`Go to video ${i + 1}`}
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
        </>
    );
}

// Direction-aware slide + fade. Using `variants` (which accept a custom-resolver
// function) keeps this type-safe, unlike passing a function to initial/exit.
const slotVariants = {
    enter: (d: number) => ({ opacity: 0, x: d * 60 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: -d * 60 }),
};

interface VideoSlotProps {
    className: string;
    index: number;
    src: string;
    variant: 'center' | 'side';
    direction: number;
    onClick?: () => void;
    ariaLabel?: string;
}

/**
 * A positioned slot whose content slides + fades when its `index` changes.
 * `index` (not `src`) is the AnimatePresence key so the transition still fires
 * when two slots happen to share the same source video.
 */
function VideoSlot({ className, index, src, variant, direction, onClick, ariaLabel }: VideoSlotProps) {
    return (
        <div className={`absolute ${className}`}>
            <AnimatePresence custom={direction} initial={false} mode="popLayout">
                <motion.div
                    key={index}
                    custom={direction}
                    variants={slotVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: 'spring', stiffness: 260, damping: 32 }}
                    className="absolute inset-0"
                >
                    {variant === 'center' ? (
                        <CenterVideo src={src} />
                    ) : (
                        <button
                            type="button"
                            onClick={onClick}
                            aria-label={ariaLabel}
                            className="block w-full h-full cursor-pointer"
                        >
                            <SidePreview src={src} />
                        </button>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

/**
 * The prominent centre clip. Self-hosted files get a custom play overlay (the
 * Figma play button); embed URLs render as an iframe; an empty URL shows the
 * play-button placeholder so the layout still reads while no video is set.
 */
function CenterVideo({ src }: { src: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [started, setStarted] = useState(false);

    const base = 'relative w-full h-full rounded-[56px] overflow-hidden shadow-lg bg-black';

    if (src && VIDEO_FILE_RE.test(src)) {
        return (
            <div className={base}>
                <video
                    ref={videoRef}
                    src={src}
                    playsInline
                    preload="metadata"
                    controls={started}
                    className="w-full h-full object-cover"
                    onPlay={() => setStarted(true)}
                />
                {!started && (
                    <button
                        type="button"
                        onClick={() => videoRef.current?.play()}
                        aria-label="Play video"
                        className="group absolute inset-0 grid place-items-center cursor-pointer"
                    >
                        <span className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/85 shadow-md flex items-center justify-center transition-transform group-hover:scale-105">
                            <Play size={32} className="text-primary ms-1" fill="currentColor" />
                        </span>
                    </button>
                )}
            </div>
        );
    }

    const ytId = src ? youtubeId(src) : null;
    if (ytId) {
        // Show the YouTube thumbnail + our play button; swap to an autoplaying
        // embed only on click (no iframe cost until the user wants it).
        return (
            <div className={base}>
                {started ? (
                    <iframe
                        src={`${youtubeEmbed(ytId)}&autoplay=1`}
                        title="Testimonials video"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    <>
                        <img
                            src={youtubeThumb(ytId)}
                            alt=""
                            aria-hidden="true"
                            className="w-full h-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => setStarted(true)}
                            aria-label="Play video"
                            className="group absolute inset-0 grid place-items-center cursor-pointer"
                        >
                            <span className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/85 shadow-md flex items-center justify-center transition-transform group-hover:scale-105">
                                <Play size={32} className="text-primary ms-1" fill="currentColor" />
                            </span>
                        </button>
                    </>
                )}
            </div>
        );
    }

    if (src) {
        return (
            <div className={base}>
                <iframe
                    src={src}
                    title="Testimonials video"
                    loading="lazy"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                    allowFullScreen
                />
            </div>
        );
    }

    return (
        <div className={`${base} bg-primary-light/40`}>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/85 shadow-md flex items-center justify-center">
                    <Play size={32} className="text-primary ms-1" fill="currentColor" />
                </div>
            </div>
        </div>
    );
}

/**
 * A faded side preview behind the centre clip. Decorative + non-interactive
 * (click is handled by the wrapping slot button): muted, no controls, first
 * frame only. Falls back to a blank panel for empty / embed sources.
 */
function SidePreview({ src }: { src: string }) {
    if (src && VIDEO_FILE_RE.test(src)) {
        return (
            <video
                src={src}
                muted
                playsInline
                preload="metadata"
                aria-hidden="true"
                className="w-full h-full rounded-[56px] object-cover opacity-60 shadow-md pointer-events-none"
            />
        );
    }
    const ytId = src ? youtubeId(src) : null;
    if (ytId) {
        return (
            <img
                src={youtubeThumb(ytId)}
                alt=""
                aria-hidden="true"
                className="w-full h-full rounded-[56px] object-cover opacity-60 shadow-md pointer-events-none"
            />
        );
    }
    return <div className="w-full h-full rounded-[56px] bg-primary-light/30 opacity-60 shadow-md pointer-events-none" />;
}

function ClientCard({ client }: { client: Client }) {
    return (
        // The blue shape is built from TWO pieces instead of one stretched SVG:
        //   1. a perfect semicircle DOME (aspect-[2/1] + rounded-t-full → radius
        //      = half the width), which stays circular at ANY card height; and
        //   2. a BODY that grows with the quote (flex-1 + content), rounded at
        //      the bottom.
        // Because the dome's height is width-relative (w/2) and the avatar's
        // offset is also width-relative (mt-%), the circle nests in the dome
        // identically no matter how tall the card grows — so the text can never
        // overflow AND the circle never drifts. h-full evens the row heights.
        <div className="relative flex h-full w-full flex-col items-center">
            {/* Dome — top half of the shape, a true semicircle. */}
            <div className="w-full aspect-2/1 rounded-t-full bg-primary" />

            {/* Body — grows to fit the quote. pt clears the avatar that overhangs
                down into it; -mt-px hides the hairline seam with the dome. */}
            <div className="-mt-px w-full flex-1 rounded-b-[56px] bg-primary px-5 sm:px-6 pt-[45%] pb-10 sm:pb-12 text-center">
                <div className="font-bold text-sm sm:text-base text-white">
                    {client.name}
                </div>
                <p className="mt-2 sm:mt-3 text-[10px] sm:text-xs leading-relaxed text-white uppercase tracking-wide font-light">
                    <span className="text-white text-base sm:text-lg font-bold align-top mr-0.5">
                        &ldquo;
                    </span>
                    {client.quote}
                    <span className="text-white text-base sm:text-lg font-bold align-top ml-0.5">
                        &rdquo;
                    </span>
                </p>
            </div>

            {/* Avatar — DOM-last so it sits above the body. Top offset is
                width-relative (mt-%) so it tracks the dome at any height. Shows
                the admin-uploaded photo, or a neutral placeholder when none. */}
            <div className="absolute top-0 left-1/2 mt-[7%] w-[82%] -translate-x-1/2 aspect-square overflow-hidden rounded-full bg-white shadow-[0_14px_28px_-8px_rgba(0,0,0,0.35)]">
                {client.image ? (
                    <img src={client.image} alt={client.name} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                    <div className="grid h-full w-full place-items-center text-primary/40">
                        <UserIcon className="h-1/2 w-1/2" />
                    </div>
                )}
            </div>
        </div>
    );
}
