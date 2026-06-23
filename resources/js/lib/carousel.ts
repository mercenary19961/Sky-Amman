/**
 * Index math for the wrap-around carousels (ProjectShowcase + testimonial
 * videos). Pure helpers so the ring arithmetic can be unit-tested without
 * mounting a component, and shared instead of re-derived in each carousel.
 */

/** Normalize any (possibly negative or out-of-range) index into [0, n). */
export function wrapIndex(i: number, n: number): number {
    if (n <= 0) return 0;
    return ((i % n) + n) % n;
}

/**
 * Direction for the shorter way around a ring of size `n` when moving from
 * `from` to `to`: 1 = forward, -1 = backward. Ties go forward. Used so a dot
 * click animates the natural (shortest) direction.
 */
export function shorterDirection(from: number, to: number, n: number): 1 | -1 {
    const forward = wrapIndex(to - from, n);
    const backward = wrapIndex(from - to, n);
    return forward <= backward ? 1 : -1;
}
