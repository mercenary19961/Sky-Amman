/**
 * YouTube URL helpers, extracted from the testimonial video player so the
 * regex-heavy id parsing can be unit-tested in isolation.
 */

/**
 * Extract the 11-char video id from any common YouTube URL shape
 * (watch?v=, youtu.be/, embed/, shorts/, /v/). Returns null for non-YouTube
 * URLs so an admin can paste a normal share/watch link and it Just Works.
 */
export function youtubeId(url: string): string | null {
    const m = url.match(
        /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
    );
    return m ? m[1] : null;
}

export const youtubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const youtubeEmbed = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
