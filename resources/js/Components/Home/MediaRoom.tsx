import { LinkedinIcon, InstagramIcon } from '@/Components/Layout/SocialIcons';
import type { SiteContentBundle } from '@/types/home';

interface MediaRoomProps {
    content: SiteContentBundle;
    embeds: { linkedin: string; instagram: string };
}

export function MediaRoom({ content, embeds }: MediaRoomProps) {
    const room = content.media_room ?? {};

    // If neither embed is configured we hide the section entirely — no point
    // shipping empty iframes.
    if (!embeds.linkedin && !embeds.instagram) return null;

    return (
        <section className="bg-surface py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary text-center tracking-wide">
                    {room.title?.content ?? ''}
                </h2>

                <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {embeds.linkedin && (
                        <div>
                            <div className="flex items-center justify-center gap-2 mb-4 text-ink">
                                <LinkedinIcon size={28} />
                                <span className="text-lg font-semibold">LinkedIn</span>
                            </div>
                            <div className="rounded-2xl overflow-hidden bg-surface-muted shadow-sm">
                                <iframe
                                    src={embeds.linkedin}
                                    title="LinkedIn"
                                    loading="lazy"
                                    className="w-full h-[420px] border-0"
                                    sandbox="allow-scripts allow-same-origin allow-popups"
                                />
                            </div>
                        </div>
                    )}

                    {embeds.instagram && (
                        <div>
                            <div className="flex items-center justify-center gap-2 mb-4 text-ink">
                                <InstagramIcon size={28} />
                                <span className="text-lg font-semibold">Instagram</span>
                            </div>
                            <div className="rounded-2xl overflow-hidden bg-surface-muted shadow-sm">
                                <iframe
                                    src={embeds.instagram}
                                    title="Instagram"
                                    loading="lazy"
                                    className="w-full h-[420px] border-0"
                                    sandbox="allow-scripts allow-same-origin allow-popups"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
