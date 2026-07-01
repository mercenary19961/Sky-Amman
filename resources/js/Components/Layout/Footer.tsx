import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { AnimatePresence, motion, useAnimationControls, useInView } from 'framer-motion';
import { Check, Phone } from 'lucide-react';
import type { PageProps, SiteContentBundle, SiteSettings } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { cmsText } from '@/lib/cms';
import { Turnstile, type TurnstileHandle } from '@/Components/Public/Turnstile';

// The real public pages we ship (mirrors Header NAV_ITEMS). "Listings" in the
// design maps to our /properties route.
const MAIN_PAGES = [
    { key: 'home', href: '/' },
    { key: 'listings', href: '/properties' },
    { key: 'selfBuild', href: '/self-build' },
    { key: 'security', href: '/security' },
    { key: 'about', href: '/about' },
    { key: 'contact', href: '/contact' },
] as const;

const SOCIAL_KEYS: { key: string; settingKey: string; comingSoon?: true }[] = [
    { key: 'linkedin', settingKey: 'linkedin_url' },
    { key: 'meta', settingKey: 'facebook_url' },
    { key: 'instagram', settingKey: 'instagram_url' },
    { key: 'youtube', settingKey: 'youtube_url', comingSoon: true },
];

/**
 * Resolve a footer string from the CMS bundle (Site Content editor → "footer"
 * page) with an i18n fallback. CMS wins when the row exists, is visible, and
 * its content for the current locale is non-empty. Nav-link labels and social
 * platform names stay in i18n — they're structural, not admin-editable.
 */
type FooterText = (section: string, key: string, fallbackKey: string) => string;

function makeFooterText(bundle: SiteContentBundle | undefined, t: TFunction): FooterText {
    return (section, key, fallbackKey) => cmsText(bundle?.[section]?.[key], t(fallbackKey));
}

// Each cloud image spans this fraction of the viewport (matches w-[84.8%] in
// the className) and a small margin pushes it fully clear of the edge before
// the off-screen hop, so neither edge of the cloud is ever visible at the wrap.
const CLOUD_WIDTH_VW = 84.8;
const EDGE_MARGIN_VW = 5;

/**
 * A footer cloud cluster that slides in once on scroll, then drifts
 * continuously in `direction` — exiting one edge and re-entering from the
 * other, looping forever. The wrap is seamless: the exit → re-entry hop is an
 * instantaneous keyframe step (duplicate `times` value) while the cloud is
 * fully off-screen, so you never see it jump. The loop's first and last frame
 * are both `x: 0`, so the repeat boundary is invisible too. `times` is weighted
 * by how far each visible leg travels, keeping a constant on-screen speed.
 *
 * The exit offsets are derived from `restLeftVw` (the cloud's CSS `left`, in
 * vw) so a cloud resting anywhere lands FULLY off-screen at the hop — using a
 * fixed offset would leave a cloud whose rest position differs partly on-screen
 * after the wrap, which reads as a sudden pop.
 */
function DriftingCloud({
    src,
    className,
    direction,
    restLeftVw,
    entranceFromX,
    entranceDelay,
    driftDuration,
    inView,
}: {
    src: string;
    className: string;
    direction: 'right' | 'left';
    restLeftVw: number;
    entranceFromX: number;
    entranceDelay: number;
    driftDuration: number;
    // Whether the footer hero is on screen. Observed on the (untransformed) hero
    // container, NOT the cloud itself: the cloud's initial position is shifted
    // ±entranceFromX px off-screen, which on a narrow phone pushes it under an
    // element-based visibility threshold so it would never animate in.
    inView: boolean;
}) {
    const controls = useAnimationControls();

    useEffect(() => {
        if (!inView) return;
        let active = true;
        // Offsets that place the cloud just past each edge relative to its rest:
        //  - off the right: left edge ≥ 100vw  → x = (100 − restLeft) + margin
        //  - off the left:  right edge ≤ 0vw   → x = −(restLeft + width) − margin
        const exitRight = 100 - restLeftVw + EDGE_MARGIN_VW;
        const exitLeft = -(restLeftVw + CLOUD_WIDTH_VW) - EDGE_MARGIN_VW;
        const travel = exitRight - exitLeft;
        // First visible leg: rest → exit edge; then an off-screen hop to the
        // opposite edge; then re-entry → rest. Mirror the offsets per direction.
        const exit = direction === 'right' ? exitRight : exitLeft;
        const wrap = direction === 'right' ? exitLeft : exitRight;
        const split = Math.abs(exit) / travel;
        (async () => {
            // Phase 1 — the existing one-time slide-in.
            await controls.start({
                x: 0,
                opacity: 1,
                transition: { duration: 1.6, ease: 'easeOut', delay: entranceDelay },
            });
            if (!active) return;
            // Phase 2 — continuous drift. Rest → exit → (invisible hop) →
            // re-enter from the far side → back to rest → repeat.
            controls.start({
                x: [0, `${exit}vw`, `${wrap}vw`, 0],
                transition: {
                    duration: driftDuration,
                    ease: 'linear',
                    times: [0, split, split, 1],
                    repeat: Infinity,
                    repeatType: 'loop',
                },
            });
        })();
        return () => {
            active = false;
        };
    }, [inView, controls, direction, entranceDelay, driftDuration]);

    return (
        <motion.img
            src={src}
            alt=""
            aria-hidden="true"
            className={className}
            initial={{ x: entranceFromX, opacity: 0 }}
            animate={controls}
        />
    );
}

/**
 * Newsletter sign-up. The checkbox + label is a toggle: clicking it reveals an
 * email field that POSTs to /newsletter (captured in the newsletter_subscribers
 * table — a full campaign system comes later). Turnstile-gated like every public
 * POST form; the widget mounts only once the form is expanded. The "Contact Us"
 * CTA below is part of the original footer design and is left untouched.
 */
function NewsletterSignup({ t, ft, siteSettings }: { t: TFunction; ft: FooterText; siteSettings?: SiteSettings }) {
    const [expanded, setExpanded] = useState(false);
    const [email, setEmail] = useState('');
    const [processing, setProcessing] = useState(false);
    const [token, setToken] = useState('');
    const turnstileRef = useRef<TurnstileHandle>(null);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (processing || !email.trim()) return;
        setProcessing(true);
        router.post(
            '/newsletter',
            { email, 'cf-turnstile-response': token },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEmail('');
                    setExpanded(false);
                },
                onFinish: () => {
                    setProcessing(false);
                    setToken('');
                    turnstileRef.current?.reset();
                },
            },
        );
    };

    return (
        <div className="lg:flex-1">
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="group flex items-center gap-3 text-start cursor-pointer"
            >
                <span className="relative grid place-items-center w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110">
                    <img
                        src="/images/home/checkbox-outline.svg"
                        alt=""
                        aria-hidden="true"
                        className="w-5 h-5 select-none"
                    />
                    {/* Filled check when open; a faint preview check on hover while closed. */}
                    <Check
                        className={`absolute w-3 h-3 text-white transition-opacity duration-200 ${
                            expanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                        }`}
                        strokeWidth={3}
                        aria-hidden="true"
                    />
                </span>
                <span className="text-xs sm:text-sm font-semibold transition-opacity duration-200 group-hover:opacity-80">
                    {ft('subscribe', 'label', 'footer.subscribe.label')}
                </span>
            </button>

            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.form
                        onSubmit={submit}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="overflow-hidden"
                    >
                        <div className="mt-5 flex flex-col gap-3 max-w-xs">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('footer.subscribe.placeholder')}
                                className="rounded-full bg-white/95 text-ink px-4 py-2 text-xs placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-white"
                            />
                            <Turnstile ref={turnstileRef} onVerify={setToken} onExpire={() => setToken('')} />
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center rounded-full bg-white text-primary px-5 py-1.5 text-xs font-medium hover:bg-surface-muted transition-colors disabled:opacity-60"
                            >
                                {processing ? t('footer.subscribe.submitting') : t('footer.subscribe.submit')}
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <Link
                href="/contact"
                className="mt-4 inline-flex items-center justify-center rounded-full bg-white text-primary px-5 py-1.5 text-xs font-medium hover:bg-surface-muted transition-colors"
            >
                {ft('subscribe', 'cta', 'footer.subscribe.cta')}
            </Link>

            {siteSettings?.phone && (
                <a
                    href={`tel:${siteSettings.phone.replace(/\s+/g, '')}`}
                    dir="ltr"
                    className="mt-5 flex items-center gap-2 text-xs sm:text-sm text-white/90 hover:text-white transition-colors w-fit"
                >
                    <Phone size={15} className="shrink-0" />
                    {siteSettings.phone}
                </a>
            )}
        </div>
    );
}

function FooterColumns({ t, ft, siteSettings }: { t: TFunction; ft: FooterText; siteSettings?: SiteSettings }) {
    return (
        <div className="grid grid-cols-3 gap-4 sm:gap-8 lg:flex lg:items-start lg:gap-32">
            {/* Column 1 — Newsletter sign-up. lg:flex-1 lets it absorb the slack so
                the other 3 columns bunch on the right. */}
            <NewsletterSignup t={t} ft={ft} siteSettings={siteSettings} />

            {/* Column 2 — Main pages */}
            <div>
                <h3 className="text-sm font-semibold mb-3 text-white">
                    {ft('sections', 'main_pages', 'footer.sections.mainPages')}
                </h3>
                <ul className="space-y-2 text-sm text-white/85">
                    {MAIN_PAGES.map((p) => (
                        <li key={p.key}>
                            <Link href={p.href} className="hover:text-white transition-colors">
                                {t(`footer.mainPages.${p.key}`)}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Column 3 — Follow us (text links to social URLs from Settings) */}
            <div>
                <h3 className="text-sm font-semibold mb-3 text-white">
                    {ft('sections', 'follow_us', 'footer.sections.followUs')}
                </h3>
                <ul className="space-y-2 text-sm text-white/85">
                    {SOCIAL_KEYS.map(({ key, settingKey, comingSoon }) => {
                        const url = !comingSoon && (siteSettings as Record<string, string | undefined>)?.[settingKey];
                        return (
                            <li key={key} className={comingSoon ? 'group/cs' : undefined}>
                                {url ? (
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-white transition-colors"
                                    >
                                        {t(`footer.socials.${key}`)}
                                    </a>
                                ) : (
                                    <span className={`inline-flex items-center gap-2 ${comingSoon ? 'cursor-default' : ''}`}>
                                        <span className="text-white/55">{t(`footer.socials.${key}`)}</span>
                                        {comingSoon && (
                                            <span className="opacity-0 group-hover/cs:opacity-100 transition-opacity duration-200 text-[11px] bg-white/20 text-white/70 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                Coming soon
                                            </span>
                                        )}
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

export function Footer() {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const { siteSettings, footerContentEn, footerContentAr } = usePage<PageProps>().props;
    const footerContent = language === 'ar' ? footerContentAr : footerContentEn;
    const ft = makeFooterText(footerContent, t);
    const year = new Date().getFullYear();

    // Drives the cloud slide-in. Observed on the photo-hero container (never
    // transformed) so it fires reliably at any viewport width — see DriftingCloud.
    const heroRef = useRef<HTMLDivElement>(null);
    const heroInView = useInView(heroRef, { once: true, amount: 0.2 });

    return (
        <footer className="relative bg-primary-deep text-white overflow-hidden mt-16">
            {/* Top — columns area on clean sky (no clouds behind text) */}
            <div className="section-x pt-14 sm:pt-20 pb-10">
                <FooterColumns t={t} ft={ft} siteSettings={siteSettings} />
            </div>

            {/* Copyright */}
            <div className="section-x pb-6 text-xs text-white/85">
                © {year} {ft('copyright', 'text', 'footer.copyright')} ·{' '}
                <a href="#" className="hover:text-white">
                    {ft('copyright', 'privacy_policy', 'footer.privacyPolicy')}
                </a>
            </div>

            {/*
              Photo hero — corresponds to the lower portion of Figma Group 27.
              The SVG composition (1280×753) places the villa, two cloud clusters
              and the SKYAMMAN logo overlapping each other; the upper ~40% of that
              frame is just empty sky where the columns live. We crop to the lower
              ~60% here so the hero stays a sensible height across viewports.

              Hero aspect picked at 1280:450 (≈2.84:1). The photo elements are
              positioned with percentages re-anchored to that cropped frame; some
              extend above (top = negative %) — they're clipped by overflow-hidden,
              which is exactly how the design "places" the villa & logo so only
              their lower portions show.
            */}
            <div ref={heroRef} className="relative w-full aspect-1280/520 max-h-160 overflow-hidden">
                {/* z-30 — bottom-right cloud cluster (footer-clouds.webp), bleeds off right.
                    Slides in once, then drifts continuously across the screen. Sits in
                    front of the apartment (z-20), same as the left cluster. */}
                <DriftingCloud
                    src="/images/home/footer-clouds.webp"
                    className="absolute left-[38%] top-[55%] w-[84.8%] h-[86.2%] z-30 select-none pointer-events-none object-contain object-top-left"
                    direction="right"
                    restLeftVw={38}
                    entranceFromX={220}
                    entranceDelay={0.1}
                    driftDuration={42}
                    inView={heroInView}
                />

                {/* z-20 — villa photo. The band is sized (aspect 1280/673 + a matching
                    max-h) to the villa's exact height so the FULL villa fits with no top
                    clipping AND no empty headroom — it sits flush under the copyright. */}
                <img
                    src="/images/home/footer-apartment-padded.webp"
                    alt=""
                    aria-hidden="true"
                    className="absolute right-[20.5%] top-0 w-[93.5%] h-full z-20 object-contain object-bottom select-none pointer-events-none"
                />

                {/* z-30 — bottom-LEFT cloud cluster (same footer-clouds.webp reused),
                    wraps the villa from the left. Different duration than the right
                    cluster so the two drift out of sync. */}
                <DriftingCloud
                    src="/images/home/footer-clouds.webp"
                    className="absolute left-[-15%] top-[30%] w-[84.8%] h-[86.2%] z-30 select-none pointer-events-none object-contain object-top-left"
                    direction="left"
                    restLeftVw={-15}
                    entranceFromX={-220}
                    entranceDelay={0.25}
                    driftDuration={68}
                    inView={heroInView}
                />

                {/* z-40 — SKYAMMAN wordmark, center-right, overlaps the villa.
                    Wide single-line lockup (~3.85:1), shown in full via h-auto
                    (natural aspect) so top-% anchors its real top edge — no bleed. */}
                <img
                    src="/images/home/skyamman-logo-large.webp"
                    alt="SkyAmman — Real Estate Consultancy"
                    className="absolute left-[51%] top-[4%] w-[42%] h-auto z-40 object-contain select-none pointer-events-none"
                />
            </div>
        </footer>
    );
}
