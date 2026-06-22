import { usePage } from '@inertiajs/react';
import { Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { PageProps } from '@/types';

/**
 * Floating phone-number "cloud" (bottom-left on every public page). It pops up
 * from the bottom of the viewport, holds for ~5s, then drifts up and fades away
 * like a cloud floating off — looping on a long cycle so it re-draws attention
 * occasionally without nagging (the show/hide + reduced-motion handling live in
 * the `animate-phone-cloud` keyframes in app.css). Tapping it dials the editable
 * `company_phone` setting. Sits opposite the WhatsApp button so the two never
 * overlap. Hidden when no phone is set.
 */
export function PhoneCloud() {
    const { siteSettings } = usePage<PageProps>().props;
    const { language } = useLanguage();

    const phone = siteSettings?.phone?.trim();
    if (!phone) return null;

    const ar = language === 'ar';
    const tel = phone.replace(/\s+/g, '');
    const label = ar ? 'اتصل بنا' : 'Call us';

    return (
        <a
            href={`tel:${tel}`}
            aria-label={`${label}: ${phone}`}
            className="animate-phone-cloud fixed bottom-4 left-4 md:bottom-6 md:left-6 z-50 will-change-transform"
        >
            {/* Slim pill that just wraps the number. The inner span carries the
                gentle idle bob so it composes with the slide-in transform above. */}
            <span className="animate-cloud-bob inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-[0_8px_22px_rgba(28,58,84,0.20)]">
                {/* Phone icon with a soft "ringing" ping. */}
                <span className="relative flex h-4 w-4 items-center justify-center text-primary-dark">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
                    <Phone size={13} className="relative" />
                </span>
                <span dir="ltr" className="text-sm font-bold tracking-tight text-[#1A3954]">
                    {phone}
                </span>
            </span>
        </a>
    );
}
