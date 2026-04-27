import type { SiteContentBundle } from '@/types/home';

interface LocationMapProps {
    content: SiteContentBundle;
    mapEmbedUrl: string;
}

export function LocationMap({ content, mapEmbedUrl }: LocationMapProps) {
    const loc = content.location ?? {};

    if (!mapEmbedUrl) return null;

    return (
        <section className="bg-surface pt-12 pb-20 sm:pt-16 sm:pb-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary text-center tracking-wide">
                    {loc.title?.content ?? ''}
                </h2>

                <div className="mt-10 rounded-3xl overflow-hidden shadow-md">
                    <iframe
                        src={mapEmbedUrl}
                        title="Sky Amman office location"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                        className="w-full h-[420px] sm:h-[500px] border-0 block"
                    />
                </div>
            </div>
        </section>
    );
}
