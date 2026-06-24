import { describe, it, expect } from 'vitest';
import { toWaMeNumber } from './phone';

describe('toWaMeNumber', () => {
    it('strips +, spaces, dashes and parens to bare digits', () => {
        expect(toWaMeNumber('+962 7 9123 4567')).toBe('962791234567');
        expect(toWaMeNumber('+962-79-123-4567')).toBe('962791234567');
        expect(toWaMeNumber('(962) 79 1234567')).toBe('962791234567');
    });

    it('leaves an already-bare number untouched', () => {
        expect(toWaMeNumber('962791234567')).toBe('962791234567');
    });

    it('returns an empty string for empty / nullish / no-digit input', () => {
        expect(toWaMeNumber('')).toBe('');
        expect(toWaMeNumber(null)).toBe('');
        expect(toWaMeNumber(undefined)).toBe('');
        expect(toWaMeNumber('not a phone')).toBe('');
    });
});
