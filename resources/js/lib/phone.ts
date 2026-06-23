/**
 * Reduce a stored phone number to the bare digits wa.me expects — no "+",
 * spaces, dashes or parens. Our canonical numbers are already the international
 * "+962 7…" form, so stripping non-digits yields a valid wa.me target. Returns
 * '' for empty / no-digit input (callers hide the button in that case).
 */
export function toWaMeNumber(phone: string | null | undefined): string {
    return (phone ?? '').replace(/\D/g, '');
}
