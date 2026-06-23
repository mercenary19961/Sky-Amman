import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
    it('merges conflicting tailwind classes so the later one wins', () => {
        expect(cn('px-2', 'px-4')).toBe('px-4');
    });

    it('drops falsy conditional values', () => {
        expect(cn('a', false, null, undefined, 'c')).toBe('a c');
    });
});
