import { describe, it, expect } from 'vitest';
import { wrapIndex, shorterDirection } from './carousel';

describe('wrapIndex', () => {
    it('leaves an in-range index unchanged', () => {
        expect(wrapIndex(0, 5)).toBe(0);
        expect(wrapIndex(3, 5)).toBe(3);
    });

    it('wraps past the end back to the start', () => {
        expect(wrapIndex(5, 5)).toBe(0);
        expect(wrapIndex(6, 5)).toBe(1);
        expect(wrapIndex(12, 5)).toBe(2);
    });

    it('wraps negative indices to the end', () => {
        expect(wrapIndex(-1, 5)).toBe(4);
        expect(wrapIndex(-6, 5)).toBe(4);
    });

    it('is safe for an empty ring', () => {
        expect(wrapIndex(3, 0)).toBe(0);
        expect(wrapIndex(-1, 0)).toBe(0);
    });
});

describe('shorterDirection', () => {
    it('goes forward when forward is the shorter way', () => {
        // 0 -> 1 around a ring of 5: forward 1, backward 4 → forward.
        expect(shorterDirection(0, 1, 5)).toBe(1);
    });

    it('goes backward when backward is the shorter way', () => {
        // 0 -> 4 around a ring of 5: forward 4, backward 1 → backward.
        expect(shorterDirection(0, 4, 5)).toBe(-1);
    });

    it('breaks an exact tie by going forward', () => {
        // 0 -> 3 around a ring of 6: forward 3, backward 3 → forward (tie).
        expect(shorterDirection(0, 3, 6)).toBe(1);
    });

    it('handles wrap-around endpoints', () => {
        // 4 -> 0 around a ring of 5: forward 1 (4→0), backward 4 → forward.
        expect(shorterDirection(4, 0, 5)).toBe(1);
    });
});
