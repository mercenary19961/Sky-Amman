import { LinkedinIcon, InstagramIcon } from '@/Components/Layout/SocialIcons';
import type { InstagramPost, SiteContentBundle } from '@/types/home';

interface MediaRoomProps {
    content: SiteContentBundle;
    linkedinUrl: string;
    instagramPosts: InstagramPost[];
}

export function MediaRoom({ content, linkedinUrl, instagramPosts }: MediaRoomProps) {
    const room = content.media_room ?? {};

    // Hide the whole section if neither side has content yet.
    if (!linkedinUrl && instagramPosts.length === 0) return null;

    return (
        <section className="bg-surface py-16 sm:py-24">
            <div className="section-x">
                <h2 className="text-center text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-wide uppercase">
                    {room.title?.content ?? ''}
                </h2>

                <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 max-w-6xl mx-auto">
                    {/* LinkedIn — single-post iframe embed */}
                    {linkedinUrl && (
                        <div>
                            <div className="flex items-center justify-center gap-3 mb-5 text-ink">
                                <LinkedinIcon size={36} />
                                <span className="text-xl sm:text-2xl font-semibold">LinkedIn</span>
                            </div>
                            <div className="rounded-2xl overflow-hidden bg-surface-muted shadow-sm">
                                <iframe
                                    src={linkedinUrl}
                                    title="LinkedIn"
                                    loading="lazy"
                                    className="w-full h-125 border-0"
                                    sandbox="allow-scripts allow-same-origin allow-popups"
                                />
                            </div>
                        </div>
                    )}

                    {/* Instagram — 3x3 grid pulled from the Graph API */}
                    {instagramPosts.length > 0 && (
                        <div>
                            <div className="flex items-center justify-center gap-3 mb-5 text-ink">
                                <InstagramIcon size={36} />
                                <span className="text-xl sm:text-2xl font-semibold">Instagram</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                {instagramPosts.slice(0, 9).map((post) => (
                                    <a
                                        key={post.id}
                                        href={post.permalink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block aspect-square overflow-hidden rounded-md bg-surface-muted group"
                                        aria-label={post.caption ? post.caption.slice(0, 80) : 'Instagram post'}
                                    >
                                        <img
                                            src={post.media_url}
                                            alt=""
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
