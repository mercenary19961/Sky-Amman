import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink, Play, User as UserIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/cn';
import { youtubeId, youtubeThumb, youtubeEmbed } from '@/lib/youtube';
import { wrapIndex, shorterDirection } from '@/lib/carousel';
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

export function Testimonials({ content, videos, testimonials }: TestimonialsProps) {
    const { language } = useLanguage();
    const ar = language === 'ar';
    const t = content.testimonials ?? {};
    const title = t.title?.content ?? '';

    // Pick the active language per card; if a field is filled in only one
    // language, that one is used for both (bidirectional fallback).
    const clients: Client[] = testimonials
        .map((c) => ({
            name: (ar ? c.name_ar || c.name_en : c.name_en || c.name_ar) || '',
            quote: (ar ? c.quote_ar || c.quote_en : c.quote_en || c.quote_ar) || '',
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

/**
 * True below the `sm` (640px) breakpoint. Defaults to false (desktop) so the
 * SSR/first-hydration markup matches, then corrects on mount — same pattern as
 * useVisibleCount. Used to drop the YouTube player's in-player fullscreen button
 * on mobile, where it renders a poor cropped/portrait view.
 */
function useIsMobile(): boolean {
    const [mobile, setMobile] = useState(false);
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const update = () => setMobile(window.innerWidth < 640);
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);
    return mobile;
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

    const wrap = (i: number) => wrapIndex(i, N);
    const next = () => setActiveIndex((i) => wrap(i + 1));
    const prev = () => setActiveIndex((i) => wrap(i - 1));

    const shown = showControls
        ? Array.from({ length: visible }, (_, k) => ({ client: clients[wrap(activeIndex + k)], pos: wrap(activeIndex + k) }))
        : clients.map((client, pos) => ({ client, pos }));

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

            {/* Cards are capped at a fixed max width and centred, so the layout
                looks the same whether there are 1 or many testimonials — the card
                (and its width-relative dome/avatar) never balloons to fill the row. */}
            <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
                <AnimatePresence mode="popLayout" initial={false}>
                    {shown.map(({ client, pos }) => (
                        <motion.div
                            key={pos}
                            layout
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-65 basis-full sm:basis-[calc(50%-0.75rem)] lg:basis-[calc(25%-1.5rem)]"
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
            <div className="relative mx-auto mt-10 sm:mt-12 aspect-video sm:aspect-25/9">
                <div className="absolute left-0 w-full sm:left-[18%] sm:w-[64%] top-0 h-full z-20">
                    <CenterVideo src="" />
                </div>
            </div>
        );
    }

    const wrap = (i: number) => wrapIndex(i, N);
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
            setDirection(shorterDirection(activeIndex, dest, N));
        }
        setActiveIndex(dest);
    };

    const centerIndex = activeIndex;
    const leftIndex = wrap(activeIndex - 1);
    const rightIndex = wrap(activeIndex + 1);

    // A YouTube "watch" URL for the active video, used by the mobile-only link
    // below the player (mobile drops the embed's broken fullscreen button, so
    // this is how phone users open the video full-screen natively). Only shown
    // for YouTube sources — self-hosted files keep their working native controls.
    const activeYtId = videos[centerIndex] ? youtubeId(videos[centerIndex]) : null;
    const watchUrl = activeYtId ? `https://www.youtube.com/watch?v=${activeYtId}` : null;
    // Whenever there's more than one video the user can swap: the side previews
    // become clickable (rotate that video into the playable centre) and dots
    // appear. The overlay arrows are reserved for when there are MORE videos
    // than the three shown on screen (N > 3) — with exactly three, every video
    // is already visible, so clicking a side preview is enough.
    const canSwap = N > 1;
    const multi = N > 3;

    return (
        <>
            {/* overflow-x-clip: the slide animation translates each slot by ±60px,
                which on narrow screens pushes a slot past the viewport edge and
                momentarily widens the page — that shifted the fixed WhatsApp
                button + header and fired phantom scroll/resize events. Clipping
                horizontally contains it; overflow-y stays visible so the centre
                video's drop-shadow isn't cut off (clip, unlike hidden, allows a
                visible cross-axis). */}
            {/* Mobile shows ONE full-width video (16:9); from sm up it becomes the
                wide 3-up composition (centre + two peeking side previews). */}
            <div className="relative mx-auto mt-10 sm:mt-12 aspect-video sm:aspect-25/9 overflow-x-clip">
                {/* Left preview (previous video) — sm+ only, peeks behind centre. */}
                <VideoSlot
                    className="hidden sm:block left-0 top-[11%] w-[50%] h-[78%] z-10"
                    index={leftIndex}
                    src={videos[leftIndex]}
                    variant="side"
                    direction={direction}
                    onClick={canSwap ? prev : undefined}
                    ariaLabel="Previous video"
                />

                {/* Right preview (next video) — sm+ only. */}
                <VideoSlot
                    className="hidden sm:block left-[50%] top-[11%] w-[50%] h-[78%] z-10"
                    index={rightIndex}
                    src={videos[rightIndex]}
                    variant="side"
                    direction={direction}
                    onClick={canSwap ? next : undefined}
                    ariaLabel="Next video"
                />

                {/* Centre — the active, playable video. Full width on mobile, 64%
                    centred from sm up (leaving room for the side previews). */}
                <VideoSlot
                    className="left-0 w-full sm:left-[18%] sm:w-[64%] top-0 h-full z-20"
                    index={centerIndex}
                    src={videos[centerIndex]}
                    variant="center"
                    direction={direction}
                />

                {/* Overlaid arrow controls — sm+ only (mobile uses the buttons
                    below). Shown when there are more videos than the three on
                    screen at once. */}
                {multi && (
                    <>
                        <button
                            type="button"
                            onClick={prev}
                            aria-label="Previous video"
                            className="absolute z-30 left-2 sm:left-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-primary text-primary bg-white/90 shadow-sm hover:bg-primary hover:text-white transition-colors cursor-pointer"
                        >
                            <ChevronLeft size={22} />
                        </button>
                        <button
                            type="button"
                            onClick={next}
                            aria-label="Next video"
                            className="absolute z-30 right-2 sm:right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-primary text-primary bg-white/90 shadow-sm hover:bg-primary hover:text-white transition-colors cursor-pointer"
                        >
                            <ChevronRight size={22} />
                        </button>
                    </>
                )}
            </div>

            {/* Mobile-only "Watch on YouTube" link — replaces the embed's
                fullscreen button (disabled on mobile) with the native YouTube
                experience. */}
            {watchUrl && (
                <div className="sm:hidden mt-4 flex justify-center">
                    <a
                        href={watchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                    >
                        Watch on YouTube
                        <ExternalLink size={15} />
                    </a>
                </div>
            )}

            {/* Controls below the video: prev/next buttons (mobile only — sm+ swaps
                via the clickable side previews / overlaid arrows) flanking the
                pagination dots (all sizes). */}
            {canSwap && (
                <div className="mt-6 flex justify-center items-center gap-4">
                    <button
                        type="button"
                        onClick={prev}
                        aria-label="Previous video"
                        className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full border-2 border-primary text-primary bg-white hover:bg-primary hover:text-white transition-colors cursor-pointer rtl:rotate-180"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-3">
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

                    <button
                        type="button"
                        onClick={next}
                        aria-label="Next video"
                        className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full border-2 border-primary text-primary bg-white hover:bg-primary hover:text-white transition-colors cursor-pointer rtl:rotate-180"
                    >
                        <ChevronRight size={20} />
                    </button>
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
            {/* Default (sync) mode — NOT popLayout. The two slides are already
                absolutely positioned over the same box, so they can overlap
                during the transition without popLayout pulling the outgoing
                slide out of document flow (which nudged the page scroll and made
                the fixed header flicker hidden→shown on every swap). */}
            <AnimatePresence custom={direction} initial={false}>
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
    const isMobile = useIsMobile();

    // Moderate rounding: a heavy radius (the old 56px) cropped the corners
    // exactly where YouTube parks its controls (fullscreen/CC), making them
    // look misplaced. rounded-3xl keeps a soft card look without clipping them.
    const base = 'relative w-full h-full rounded-3xl overflow-hidden shadow-lg bg-black';

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
                        // fs=0 + no allowFullScreen on mobile: the YouTube
                        // in-player fullscreen renders a cropped portrait view on
                        // phones. Mobile users get a "Watch on YouTube" link
                        // instead (native fullscreen). Desktop keeps fullscreen.
                        src={`${youtubeEmbed(ytId)}&autoplay=1${isMobile ? '&fs=0' : ''}`}
                        title="Testimonials video"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen={!isMobile}
                    />
                ) : (
                    <>
                        <img
                            src={youtubeThumb(ytId)}
                            onError={(e) => {
                                // Not every video has a maxres thumb (YouTube 404s
                                // those) — fall back to hqdefault once.
                                const img = e.currentTarget;
                                if (!img.dataset.thumbFallback) {
                                    img.dataset.thumbFallback = '1';
                                    img.src = youtubeThumb(ytId, 'hqdefault');
                                }
                            }}
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
                className="w-full h-full rounded-3xl object-cover opacity-60 shadow-md pointer-events-none"
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
                className="w-full h-full rounded-3xl object-cover opacity-60 shadow-md pointer-events-none"
            />
        );
    }
    return <div className="w-full h-full rounded-3xl bg-primary-light/30 opacity-60 shadow-md pointer-events-none" />;
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
