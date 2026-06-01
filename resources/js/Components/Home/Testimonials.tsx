import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { SiteContentBundle } from '@/types/home';

interface TestimonialsProps {
    content: SiteContentBundle;
    // Active, ordered video URLs from the admin Testimonial Videos section.
    videos: string[];
}

interface Client {
    name: string;
    quote: string;
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

export function Testimonials({ content, videos }: TestimonialsProps) {
    const t = content.testimonials ?? {};
    const title = t.title?.content ?? '';

    const clients: Client[] = [1, 2, 3, 4].map((i) => ({
        name: t[`client_${i}_name`]?.content ?? '',
        quote: t[`client_${i}_quote`]?.content ?? '',
    }));

    if (!title && videos.length === 0 && clients.every((c) => !c.name)) return null;

    const hasClients = clients.some((c) => c.name);

    return (
        <section className="bg-surface py-16 sm:py-24">
            <div className="section-x">
                {title && (
                    <h2 className="text-center text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-wide uppercase">
                        {title}
                    </h2>
                )}

                <TestimonialVideos videos={videos} />

                {/* Client cards row */}
                {hasClients && (
                    <div className="mt-14 sm:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {clients.map(
                            (client, i) =>
                                client.name && <ClientCard key={i} client={client} />,
                        )}
                    </div>
                )}
            </div>
        </section>
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
            <div className="relative mx-auto mt-10 sm:mt-12 max-w-5xl aspect-25/9">
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
            <div className="relative mx-auto mt-10 sm:mt-12 max-w-5xl aspect-25/9">
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
        <div
            className="relative aspect-290/486 w-full max-w-70 mx-auto bg-no-repeat bg-contain bg-top"
            style={{ backgroundImage: 'url(/images/home/testimonial-card.svg)' }}
        >
            {/* Avatar — solid white circle, sits in the dome at top of card.
                Swap to <img> once portrait photos are delivered. */}
            <div
                className="absolute left-1/2 -translate-x-1/2 bg-white rounded-full overflow-hidden shadow-[0_14px_28px_-8px_rgba(0,0,0,0.35)]"
                style={{
                    top: '4.4%',
                    width: '82%',
                    aspectRatio: '1',
                }}
                aria-hidden="true"
            />

            {/* Name + quote in the lower portion of the card. */}
            <div
                className="absolute inset-x-0 px-5 sm:px-6 text-center"
                style={{ top: '60%' }}
            >
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
        </div>
    );
}
