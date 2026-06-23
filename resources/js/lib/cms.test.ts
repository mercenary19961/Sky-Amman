import { describe, it, expect } from 'vitest';
import { cmsText } from './cms';

describe('cmsText', () => {
    it('returns the CMS content when the row is visible and non-empty', () => {
        expect(cmsText({ content: 'From CMS', is_visible: true }, 'fallback')).toBe('From CMS');
    });

    it('falls back when the entry is missing', () => {
        expect(cmsText(undefined, 'fallback')).toBe('fallback');
    });

    it('falls back when the row is hidden', () => {
        expect(cmsText({ content: 'Hidden value', is_visible: false }, 'fallback')).toBe('fallback');
    });

    it('falls back when the content is an empty string', () => {
        expect(cmsText({ content: '', is_visible: true }, 'fallback')).toBe('fallback');
    });
});
