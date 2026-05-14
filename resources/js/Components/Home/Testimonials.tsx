import { Play } from 'lucide-react';
import type { SiteContentBundle } from '@/types/home';

interface TestimonialsProps {
    content: SiteContentBundle;
}

interface Client {
    name: string;
    quote: string;
}

export function Testimonials({ content }: TestimonialsProps) {
    const t = content.testimonials ?? {};
    const title = t.title?.content ?? '';
    const videoUrl = t.video_url?.content ?? '';

    const clients: Client[] = [1, 2, 3, 4].map((i) => ({
        name: t[`client_${i}_name`]?.content ?? '',
        quote: t[`client_${i}_quote`]?.content ?? '',
    }));

    if (!title && !videoUrl && clients.every((c) => !c.name)) return null;

    const hasClients = clients.some((c) => c.name);

    return (
        <section className="bg-surface py-16 sm:py-24">
            <div className="section-x">
                {title && (
                    <h2 className="text-center text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-wide uppercase">
                        {title}
                    </h2>
                )}

                {/* Video — rounded-[56px] rectangle from the design SVG. Embeds the
                    configured iframe URL; falls back to a play-button placeholder
                    when no URL is set yet. */}
                <div className="mt-10 sm:mt-12 mx-auto max-w-5xl relative aspect-[1116/446] rounded-[56px] overflow-hidden bg-primary-light/40 shadow-sm">
                    {videoUrl ? (
                        <iframe
                            src={videoUrl}
                            title="Testimonials video"
                            loading="lazy"
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            sandbox="allow-scripts allow-same-origin allow-popups"
                            allowFullScreen
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/85 shadow-md flex items-center justify-center">
                                <Play size={32} className="text-primary ms-1" fill="currentColor" />
                            </div>
                        </div>
                    )}
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

function ClientCard({ client }: { client: Client }) {
    return (
        <div
            className="relative aspect-[290/486] w-full max-w-[280px] mx-auto bg-no-repeat bg-contain bg-top"
            style={{ backgroundImage: 'url(/images/home/testimonial-card.svg)' }}
        >
            {/* Avatar — solid white circle, sits in the dome at top of card.
                Swap to <img> once portrait photos are delivered. */}
            <div
                className="absolute left-1/2 -translate-x-1/2 bg-white rounded-full overflow-hidden"
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
                <div className="font-bold text-sm sm:text-base text-ink">
                    {client.name}
                </div>
                <p className="mt-2 sm:mt-3 text-[10px] sm:text-xs leading-relaxed text-ink uppercase tracking-wide">
                    <span className="text-primary text-base sm:text-lg font-bold align-top mr-0.5">
                        &ldquo;
                    </span>
                    {client.quote}
                    <span className="text-primary text-base sm:text-lg font-bold align-top ml-0.5">
                        &rdquo;
                    </span>
                </p>
            </div>
        </div>
    );
}
