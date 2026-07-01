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

/**
 * Thumbnail URL for a video id. Defaults to `maxresdefault` (1280×720) so the
 * large public testimonial frame stays crisp; callers rendering a small preview
 * can ask for `hqdefault` (480×360). Note: not every video has a maxres thumb —
 * `i.ytimg.com` returns a 404 for those, so consumers should `onError`-fall back
 * to `youtubeThumb(id, 'hqdefault')`.
 */
export const youtubeThumb = (
    id: string,
    quality: 'hqdefault' | 'sddefault' | 'maxresdefault' = 'maxresdefault',
) => `https://i.ytimg.com/vi/${id}/${quality}.jpg`;
export const youtubeEmbed = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
