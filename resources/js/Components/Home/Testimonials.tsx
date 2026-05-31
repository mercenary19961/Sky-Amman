import { useRef, useState } from 'react';
import { Play } from 'lucide-react';
import type { SiteContentBundle } from '@/types/home';

interface TestimonialsProps {
    content: SiteContentBundle;
}

interface Client {
    name: string;
    quote: string;
}

// A direct media file (self-hosted /videos/x.mp4) renders in a <video> tag;
// anything else is treated as an embed URL (YouTube/Vimeo) for an <iframe>.
const VIDEO_FILE_RE = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;

export function Testimonials({ content }: TestimonialsProps) {
    const t = content.testimonials ?? {};
    const title = t.title?.content ?? '';
    // Three-video composition (Figma "Desktop.svg"): a prominent centre clip
    // flanked by two smaller, faded side previews. The side slots fall back to
    // the centre video so a single configured URL still fills the whole layout.
    const centerUrl = t.video_url?.content ?? '';
    const leftUrl = t.video_url_left?.content || centerUrl;
    const rightUrl = t.video_url_right?.content || centerUrl;

    const clients: Client[] = [1, 2, 3, 4].map((i) => ({
        name: t[`client_${i}_name`]?.content ?? '',
        quote: t[`client_${i}_quote`]?.content ?? '',
    }));

    if (!title && !centerUrl && clients.every((c) => !c.name)) return null;

    const hasClients = clients.some((c) => c.name);

    return (
        <section className="bg-surface py-16 sm:py-24">
            <div className="section-x">
                {title && (
                    <h2 className="text-center text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-wide uppercase">
                        {title}
                    </h2>
                )}

                {/* Three-video composition. Geometry re-anchored to the bounding
                    box of the Figma frames (full frame 1280×611; the three clips
                    span y 186→542, so the box is 1280×356). Centre clip on top
                    (z-20) with the play overlay; side previews behind (z-10),
                    faded, peeking out left and right. */}
                <div className="relative mx-auto mt-10 sm:mt-12 max-w-6xl aspect-1280/356">
                    <SidePreview src={leftUrl} className="left-[0.86%] top-[12.08%] w-[52.66%] h-[75.56%]" />
                    <SidePreview src={rightUrl} className="left-[45.16%] top-[12.08%] w-[52.66%] h-[75.56%]" />
                    <CenterVideo src={centerUrl} className="left-[14.77%] top-0 w-[69.69%] h-full" />
                </div>

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
 * The prominent centre clip. Self-hosted files get a custom play overlay (the
 * Figma play button); embed URLs render as an iframe; an empty URL shows the
 * play-button placeholder so the layout still reads while no video is set.
 */
function CenterVideo({ src, className }: { src: string; className: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [started, setStarted] = useState(false);

    const wrap = `absolute z-20 rounded-[56px] overflow-hidden shadow-lg bg-black ${className}`;

    if (src && VIDEO_FILE_RE.test(src)) {
        return (
            <div className={wrap}>
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

    if (src) {
        return (
            <div className={wrap}>
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
        <div className={`${wrap} bg-primary-light/40`}>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/85 shadow-md flex items-center justify-center">
                    <Play size={32} className="text-primary ms-1" fill="currentColor" />
                </div>
            </div>
        </div>
    );
}

/**
 * A faded side preview behind the centre clip. Decorative + non-interactive:
 * muted, no controls, shows the first frame. Only renders for self-hosted files.
 */
function SidePreview({ src, className }: { src: string; className: string }) {
    if (!src || !VIDEO_FILE_RE.test(src)) return null;
    return (
        <video
            src={src}
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
            className={`absolute z-10 rounded-[56px] object-cover opacity-60 pointer-events-none shadow-md ${className}`}
        />
    );
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
