import { describe, it, expect } from 'vitest';
import { youtubeId, youtubeThumb, youtubeEmbed } from './youtube';

describe('youtubeId', () => {
    it('parses the id from every common URL shape', () => {
        const id = 'dQw4w9WgXcQ';
        const urls = [
            `https://www.youtube.com/watch?v=${id}`,
            `https://youtube.com/watch?v=${id}`,
            `https://youtu.be/${id}`,
            `https://www.youtube.com/embed/${id}`,
            `https://www.youtube.com/shorts/${id}`,
            `https://www.youtube.com/v/${id}`,
            // extra query params before/after the v= value
            `https://www.youtube.com/watch?feature=share&v=${id}`,
            `https://www.youtube.com/watch?v=${id}&t=42s`,
        ];

        for (const url of urls) {
            expect(youtubeId(url)).toBe(id);
        }
    });

    it('returns null for non-YouTube or malformed URLs', () => {
        expect(youtubeId('https://vimeo.com/123456789')).toBeNull();
        expect(youtubeId('https://example.com/video.mp4')).toBeNull();
        expect(youtubeId('not a url')).toBeNull();
        expect(youtubeId('')).toBeNull();
        // id shorter than 11 chars must not match
        expect(youtubeId('https://youtu.be/tooShort')).toBeNull();
    });

    it('builds thumb and embed URLs from an id', () => {
        // Defaults to maxres so the large public frame stays crisp.
        expect(youtubeThumb('abc12345678')).toBe('https://i.ytimg.com/vi/abc12345678/maxresdefault.jpg');
        // Callers can request a smaller thumb for fallback / small previews.
        expect(youtubeThumb('abc12345678', 'hqdefault')).toBe('https://i.ytimg.com/vi/abc12345678/hqdefault.jpg');
        expect(youtubeEmbed('abc12345678')).toBe('https://www.youtube-nocookie.com/embed/abc12345678?rel=0');
    });
});
