import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { usePage, Link, Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { u as useLanguage } from "../ssr.js";
import { c as cn } from "./cn-H80jjgLf.js";
import { Users, Building2, CalendarDays, Square, ChevronRight, ChevronLeft, Award, ShieldCheck, Tag, CreditCard } from "lucide-react";
import { useRef, useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "i18next";
import "@inertiajs/react/server";
import "react-dom/server";
import "clsx";
import "tailwind-merge";
const NAV_ITEMS = [
  { key: "home", href: "/" },
  { key: "properties", href: "/properties" },
  { key: "investment", href: "/investment" },
  { key: "selfBuild", href: "/self-build" },
  { key: "security", href: "/security" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" }
];
function Header() {
  const { t } = useTranslation();
  const { toggleLanguage } = useLanguage();
  const { url } = usePage();
  return /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-40 bg-surface/90 backdrop-blur border-b border-ink/5", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6", children: [
    /* @__PURE__ */ jsx(Link, { href: "/", className: "font-bold text-lg text-primary tracking-wide", children: "SKY AMMAN" }),
    /* @__PURE__ */ jsx("nav", { className: "hidden lg:flex items-center gap-6 text-sm", children: NAV_ITEMS.map((item) => {
      const active = url === item.href;
      return /* @__PURE__ */ jsx(
        Link,
        {
          href: item.href,
          className: cn(
            "text-ink-muted hover:text-primary transition-colors",
            active && "text-primary font-medium"
          ),
          children: t(`nav.${item.key}`)
        },
        item.key
      );
    }) }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: toggleLanguage,
        className: "text-sm font-medium text-ink hover:text-primary transition-colors",
        "aria-label": "Toggle language",
        children: t("language.toggle")
      }
    )
  ] }) });
}
const baseProps = (size) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true
});
function LinkedinIcon({ size = 20, className }) {
  return /* @__PURE__ */ jsx("svg", { ...baseProps(size), className, children: /* @__PURE__ */ jsx("path", { d: "M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0z" }) });
}
function InstagramIcon({ size = 20, className }) {
  return /* @__PURE__ */ jsx("svg", { ...baseProps(size), className, children: /* @__PURE__ */ jsx("path", { d: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.05 1.17-.25 1.8-.41 2.23a3.71 3.71 0 01-.9 1.38c-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.71 3.71 0 01-1.38-.9 3.71 3.71 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.87 5.87 0 00-2.13 1.38A5.87 5.87 0 00.63 4.14c-.3.76-.5 1.64-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.73 1.46 1.38 2.13.66.66 1.34 1.07 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.87 5.87 0 002.13-1.38 5.87 5.87 0 001.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.87 5.87 0 00-1.38-2.13A5.87 5.87 0 0019.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zm0 10.16a4 4 0 110-8 4 4 0 010 8zm6.4-11.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" }) });
}
function FacebookIcon({ size = 20, className }) {
  return /* @__PURE__ */ jsx("svg", { ...baseProps(size), className, children: /* @__PURE__ */ jsx("path", { d: "M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" }) });
}
function TwitterIcon({ size = 20, className }) {
  return /* @__PURE__ */ jsx("svg", { ...baseProps(size), className, children: /* @__PURE__ */ jsx("path", { d: "M18.9 1.5h3.68l-8.04 9.19L24 22.5h-7.4l-5.8-7.58-6.63 7.58H.49l8.6-9.83L0 1.5h7.59l5.24 6.93L18.9 1.5zm-1.29 18.8h2.04L6.49 3.6H4.3l13.31 16.7z" }) });
}
function YoutubeIcon({ size = 20, className }) {
  return /* @__PURE__ */ jsx("svg", { ...baseProps(size), className, children: /* @__PURE__ */ jsx("path", { d: "M23.5 6.2a3 3 0 00-2.1-2.13C19.55 3.57 12 3.57 12 3.57s-7.55 0-9.4.5A3 3 0 00.5 6.2C0 8.05 0 12 0 12s0 3.95.5 5.8a3 3 0 002.1 2.13c1.85.5 9.4.5 9.4.5s7.55 0 9.4-.5a3 3 0 002.1-2.13c.5-1.85.5-5.8.5-5.8s0-3.95-.5-5.8zM9.6 15.57V8.43L15.82 12 9.6 15.57z" }) });
}
function TiktokIcon({ size = 20, className }) {
  return /* @__PURE__ */ jsx("svg", { ...baseProps(size), className, children: /* @__PURE__ */ jsx("path", { d: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.9 2.9 0 01-2.9 2.9 2.9 2.9 0 01-2.9-2.9 2.9 2.9 0 012.9-2.9c.3 0 .58.05.85.13V9.4a6.34 6.34 0 00-.85-.06 6.35 6.35 0 100 12.7 6.35 6.35 0 006.35-6.35V8.66a8.27 8.27 0 004.83 1.55V6.74a4.79 4.79 0 01-1.06.05z" }) });
}
const MAIN_PAGES = [
  { key: "home", href: "/" },
  { key: "properties", href: "/properties" },
  { key: "investment", href: "/investment" },
  { key: "selfBuild", href: "/self-build" },
  { key: "security", href: "/security" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" }
];
function Footer() {
  const { t } = useTranslation();
  const { siteSettings } = usePage().props;
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const socials = [
    { url: siteSettings?.linkedin_url, Icon: LinkedinIcon, label: "LinkedIn" },
    { url: siteSettings?.instagram_url, Icon: InstagramIcon, label: "Instagram" },
    { url: siteSettings?.facebook_url, Icon: FacebookIcon, label: "Facebook" },
    { url: siteSettings?.twitter_url, Icon: TwitterIcon, label: "X" },
    { url: siteSettings?.youtube_url, Icon: YoutubeIcon, label: "YouTube" },
    { url: siteSettings?.tiktok_url, Icon: TiktokIcon, label: "TikTok" }
  ].filter((s) => s.url);
  return /* @__PURE__ */ jsxs("footer", { className: "relative bg-primary-deep text-white overflow-hidden mt-16", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute inset-x-0 bottom-0 h-105 sm:h-130 bg-no-repeat bg-bottom bg-contain pointer-events-none opacity-90",
        style: { backgroundImage: "url(/images/home/footer-villa.svg)" },
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute inset-x-0 bottom-0 h-105 sm:h-130 bg-no-repeat bg-bottom bg-contain pointer-events-none animate-cloud-drift",
        style: { backgroundImage: "url(/images/home/footer-clouds.svg)", backgroundSize: "200% auto" },
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-10 grid gap-8 sm:gap-10 sm:grid-cols-2 lg:grid-cols-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold tracking-wide", children: "SKY AMMAN" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-white/85", children: t("footer.tagline") })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold mb-3", children: t("footer.sections.mainPages") }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-2 text-sm text-white/85", children: MAIN_PAGES.map((p) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { href: p.href, className: "hover:text-white", children: t(`nav.${p.key}`) }) }, p.key)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold mb-3", children: t("footer.sections.contact") }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-white/85", children: [
            siteSettings?.phone && /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: `tel:${siteSettings.phone}`, className: "hover:text-white", children: siteSettings.phone }) }),
            siteSettings?.email && /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: `mailto:${siteSettings.email}`, className: "hover:text-white", children: siteSettings.email }) }),
            siteSettings?.address && /* @__PURE__ */ jsx("li", { children: siteSettings.address })
          ] })
        ] }),
        socials.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold mb-3", children: t("footer.sections.followUs") }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: socials.map(({ url, Icon, label }) => /* @__PURE__ */ jsx(
            "a",
            {
              href: url,
              target: "_blank",
              rel: "noopener noreferrer",
              "aria-label": label,
              className: "text-white/85 hover:text-white transition-colors",
              children: /* @__PURE__ */ jsx(Icon, { size: 20 })
            },
            label
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-32 sm:pb-48 text-center select-none", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-6xl sm:text-8xl lg:text-9xl font-extrabold tracking-tight text-white/95 leading-none", children: [
          "SKY",
          /* @__PURE__ */ jsx("span", { className: "font-light", children: "AMMAN" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 text-xs sm:text-sm uppercase tracking-[0.4em] text-white/80", children: "Real Estate Consultancy" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "relative border-t border-white/15", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 text-xs text-white/85 text-center sm:text-start", children: [
        "© ",
        year,
        " Sky Amman. ",
        t("footer.copyright")
      ] }) })
    ] })
  ] });
}
function PublicLayout({ children }) {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col bg-surface text-ink", children: [
    /* @__PURE__ */ jsx(Header, {}),
    /* @__PURE__ */ jsx("main", { className: "flex-1", children }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
function HomeHero({ content }) {
  const hero = content.hero ?? {};
  const title = hero.title?.content ?? "";
  const subtitle = hero.subtitle?.content ?? "";
  const cta = hero.cta?.content ?? "";
  return /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-primary to-surface", "aria-hidden": "true" }),
    /* @__PURE__ */ jsxs("div", { className: "relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-12 sm:pt-32 lg:pt-40 lg:pb-16 text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white drop-shadow-sm leading-tight", children: title }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-base sm:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto", children: subtitle }),
      /* @__PURE__ */ jsxs("div", { className: "relative mt-8 sm:mt-12 lg:mt-16", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: "/images/home/hero-villa.svg",
            alt: "",
            className: "mx-auto w-full max-w-5xl h-auto select-none pointer-events-none",
            loading: "eager"
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 bottom-0 translate-y-1/2 flex justify-center", children: /* @__PURE__ */ jsx(
          Link,
          {
            href: "/properties",
            className: "inline-flex items-center justify-center rounded-full bg-primary-deep px-8 py-3 text-sm sm:text-base font-medium text-white shadow-lg hover:bg-primary-dark transition-colors",
            children: cta
          }
        ) })
      ] })
    ] })
  ] });
}
function InvestmentBanner({ content }) {
  const banner = content.investment_banner ?? {};
  const stats = content.stats ?? {};
  const taglineParts = (banner.tagline?.content ?? "").split(",").map((s) => s.trim());
  const statItems = [
    { Icon: Users, value: stats.clients_value?.content, label: stats.clients_label?.content },
    { Icon: Building2, value: stats.projects_value?.content, label: stats.projects_label?.content },
    { Icon: CalendarDays, value: stats.years_value?.content, label: stats.years_label?.content },
    { Icon: Square, value: stats.sqm_value?.content, label: stats.sqm_label?.content }
  ];
  return /* @__PURE__ */ jsx("section", { className: "relative pt-20 sm:pt-28 pb-16 sm:pb-20 bg-surface", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-5xl sm:text-6xl lg:text-7xl font-bold text-primary leading-tight", children: taglineParts[0] ?? "" }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-center flex-wrap gap-3 sm:gap-4 text-xl sm:text-2xl lg:text-3xl text-ink font-medium", children: [
      /* @__PURE__ */ jsx("span", { children: taglineParts[1] ?? "" }),
      /* @__PURE__ */ jsx(
        "img",
        {
          src: "/images/home/buy-early-strip.svg",
          alt: "",
          className: "h-10 sm:h-14 w-auto select-none pointer-events-none"
        }
      ),
      /* @__PURE__ */ jsx("span", { children: taglineParts[2] ?? "" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-6 sm:mt-8 flex justify-center", children: /* @__PURE__ */ jsx(
      Link,
      {
        href: "/investment",
        className: "inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm sm:text-base font-medium text-white shadow-md hover:bg-primary-deep transition-colors",
        children: banner.cta?.content ?? ""
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 max-w-5xl mx-auto", children: statItems.map(({ Icon, value, label }, i) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
      /* @__PURE__ */ jsx(Icon, { size: 36, strokeWidth: 1.25, className: "text-primary mb-3", "aria-hidden": "true" }),
      /* @__PURE__ */ jsx("div", { className: "text-3xl sm:text-4xl font-bold text-ink", children: value }),
      /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs sm:text-sm uppercase tracking-wider text-ink-muted text-center", children: label })
    ] }, i)) })
  ] }) });
}
function buildPillar(section) {
  if (!section) return { number: "", title: "", bullets: [] };
  const bullets = ["bullet_1", "bullet_2", "bullet_3", "bullet_4"].map((k) => section[k]?.content).filter((s) => Boolean(s));
  return {
    number: section.number?.content ?? "",
    title: section.title?.content ?? "",
    bullets
  };
}
function AssurancePillars({ content }) {
  const { isRTL } = useLanguage();
  const pillars = [
    buildPillar(content.assurance_financial),
    buildPillar(content.assurance_legal),
    buildPillar(content.assurance_safety)
  ];
  const wrapperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [transitionSign, setTransitionSign] = useState(1);
  const activeIndexRef = useRef(0);
  const targetIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const animationTimerRef = useRef(null);
  const ANIMATION_LOCKOUT_MS = 1700;
  const startTransition = (nextIndex) => {
    const sign = nextIndex > activeIndexRef.current ? 1 : -1;
    isAnimatingRef.current = true;
    activeIndexRef.current = nextIndex;
    setTransitionSign(sign);
    setActiveIndex(nextIndex);
    if (animationTimerRef.current !== null) {
      window.clearTimeout(animationTimerRef.current);
    }
    animationTimerRef.current = window.setTimeout(() => {
      isAnimatingRef.current = false;
      if (targetIndexRef.current !== activeIndexRef.current) {
        startTransition(targetIndexRef.current);
      }
    }, ANIMATION_LOCKOUT_MS);
  };
  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  useEffect(() => {
    if (typeof window === "undefined" || !isDesktop) return;
    const handleScroll = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const stickyTravel = wrapper.offsetHeight - window.innerHeight;
      if (stickyTravel <= 0) return;
      const scrolled = -rect.top;
      let next;
      if (scrolled <= 0) {
        next = 0;
      } else {
        const stepSize = stickyTravel / pillars.length;
        next = Math.min(pillars.length - 1, Math.floor(scrolled / stepSize));
      }
      targetIndexRef.current = next;
      if (!isAnimatingRef.current && next !== activeIndexRef.current) {
        startTransition(next);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDesktop, pillars.length]);
  useEffect(() => {
    return () => {
      if (animationTimerRef.current !== null) {
        window.clearTimeout(animationTimerRef.current);
      }
    };
  }, []);
  const direction = isRTL ? -1 : 1;
  const active = pillars[activeIndex] ?? pillars[0];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "section",
      {
        ref: wrapperRef,
        className: "hidden md:block relative h-[240vh] bg-surface",
        "aria-label": "Sky Amman assurance pillars",
        children: /* @__PURE__ */ jsx("div", { className: "sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center", children: /* @__PURE__ */ jsx(
          PillarStage,
          {
            active,
            activeIndex,
            direction,
            transitionSign
          }
        ) })
      }
    ),
    /* @__PURE__ */ jsx("section", { className: "md:hidden bg-surface py-12", "aria-label": "Sky Amman assurance pillars", children: /* @__PURE__ */ jsxs("div", { className: "px-4", children: [
      /* @__PURE__ */ jsx(
        PillarStage,
        {
          active,
          activeIndex,
          direction,
          transitionSign,
          compact: true
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "mt-6 flex items-center justify-center gap-2", children: pillars.map((p, i) => /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            targetIndexRef.current = i;
            if (!isAnimatingRef.current && i !== activeIndexRef.current) {
              startTransition(i);
            }
          },
          "aria-label": `Show pillar ${p.number}`,
          "aria-current": i === activeIndex,
          className: `h-2.5 rounded-full transition-all ${i === activeIndex ? "w-8 bg-primary" : "w-2.5 bg-primary/30"}`
        },
        i
      )) })
    ] }) })
  ] });
}
function PillarStage({ active, activeIndex, direction, transitionSign, compact = false }) {
  const innerSize = compact ? "w-40 h-40" : "w-56 h-56 lg:w-64 lg:h-64";
  const stageMaxWidth = compact ? "100%" : "min(900px, 90vw)";
  const halfCircleRef = useRef(null);
  const [orbitR, setOrbitR] = useState(compact ? 130 : 450);
  useEffect(() => {
    const el = halfCircleRef.current;
    if (!el || typeof window === "undefined") return;
    const update = (h) => {
      setOrbitR(compact ? Math.min(150, h * 0.85) : h);
    };
    update(el.getBoundingClientRect().height);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) update(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [compact]);
  const SAMPLES = 12;
  const ANGLE_RANGE_DEG = 120;
  const times = Array.from({ length: SAMPLES + 1 }, (_, i) => i / SAMPLES);
  const xSign = direction * transitionSign;
  const customData = { xSign, orbitR };
  const variants = {
    // Static start position for the entering circle: the first sample of
    // the incoming arc (bottom-left in LTR-forward, mirrored otherwise).
    initial: ({ xSign: xSign2, orbitR: orbitR2 }) => {
      const startRad = -ANGLE_RANGE_DEG * Math.PI / 180;
      return {
        x: orbitR2 * Math.sin(startRad) * xSign2,
        y: orbitR2 * (1 - Math.cos(startRad)),
        opacity: 0
      };
    },
    // Entering arc: from -ANGLE_RANGE → 0° (riding up the orbit to top).
    enter: ({ xSign: xSign2, orbitR: orbitR2 }) => {
      const xs = [];
      const ys = [];
      const ops = [];
      for (let i = 0; i <= SAMPLES; i++) {
        const t = i / SAMPLES;
        const inRad = (-ANGLE_RANGE_DEG + ANGLE_RANGE_DEG * t) * Math.PI / 180;
        xs.push(orbitR2 * Math.sin(inRad) * xSign2);
        ys.push(orbitR2 * (1 - Math.cos(inRad)));
        ops.push(Math.max(0, Math.min(1, (t - 0.35) / 0.55)));
      }
      return { x: xs, y: ys, opacity: ops };
    },
    // Exiting arc: from top (0°) → +ANGLE_RANGE (riding down the orbit
    // into the fade zone).
    exit: ({ xSign: xSign2, orbitR: orbitR2 }) => {
      const xs = [];
      const ys = [];
      const ops = [];
      for (let i = 0; i <= SAMPLES; i++) {
        const t = i / SAMPLES;
        const outRad = ANGLE_RANGE_DEG * t * Math.PI / 180;
        xs.push(orbitR2 * Math.sin(outRad) * xSign2);
        ys.push(orbitR2 * (1 - Math.cos(outRad)));
        ops.push(Math.max(0, Math.min(1, 1 - (t - 0.35) / 0.55)));
      }
      return { x: xs, y: ys, opacity: ops };
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative w-full mx-auto", style: { maxWidth: stageMaxWidth }, children: [
    /* @__PURE__ */ jsxs("div", { ref: halfCircleRef, className: "relative w-full aspect-2/1", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-0 bg-primary rounded-t-full",
          style: {
            maskImage: "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)"
          }
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 top-[42%] sm:top-[45%] flex items-start justify-center px-6 sm:px-12", children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsx(
        motion.ul,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -10 },
          transition: { duration: 0.5, ease: "easeInOut" },
          className: "space-y-1.5 text-white text-center text-sm sm:text-base lg:text-lg max-w-2xl",
          children: active.bullets.map((b, i) => /* @__PURE__ */ jsx("li", { children: b }, i))
        },
        `bullets-${activeIndex}`
      ) }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: `absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 ${innerSize}`, children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "popLayout", initial: false, custom: customData, children: /* @__PURE__ */ jsxs(
      motion.div,
      {
        className: "absolute inset-0",
        custom: customData,
        variants,
        initial: "initial",
        animate: "enter",
        exit: "exit",
        transition: {
          duration: 1.6,
          ease: "easeInOut",
          times
        },
        children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 rounded-full bg-white shadow-xl border-4 border-primary" }),
          /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none", children: [
            /* @__PURE__ */ jsx("span", { className: "text-2xl sm:text-3xl font-bold text-primary", children: active.number }),
            /* @__PURE__ */ jsx("span", { className: "mt-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-ink leading-tight", children: active.title })
          ] })
        ]
      },
      `pillar-${activeIndex}`
    ) }) })
  ] });
}
function ProjectShowcase({ content, projects }) {
  const { language, isRTL } = useLanguage();
  const showcase = content.showcase ?? {};
  const [filter, setFilter] = useState("under_development");
  const trackRef = useRef(null);
  const filtered = useMemo(
    () => projects.filter((p) => p.category === filter),
    [projects, filter]
  );
  const scrollByOne = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("[data-card]");
    const step = card ? card.offsetWidth + 24 : 320;
    const visualDir = isRTL ? -dir : dir;
    track.scrollBy({ left: step * visualDir, behavior: "smooth" });
  };
  const filterPills = [
    { key: "under_development", labelKey: "filter_under_development" },
    { key: "ready", labelKey: "filter_ready" },
    { key: "investment_opportunity", labelKey: "filter_investment" }
  ];
  return /* @__PURE__ */ jsx("section", { className: "bg-surface-muted py-16 sm:py-24", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-3xl sm:text-4xl lg:text-5xl font-bold text-primary text-center tracking-wide", children: showcase.title?.content ?? "" }),
    /* @__PURE__ */ jsx("div", { className: "mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3", children: filterPills.map(({ key, labelKey }) => /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => setFilter(key),
        className: cn(
          "rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors",
          filter === key ? "bg-primary text-white" : "bg-primary/15 text-primary-dark hover:bg-primary/25"
        ),
        children: showcase[labelKey]?.content ?? ""
      },
      key
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "relative mt-10", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => scrollByOne(-1),
          "aria-label": "Previous",
          className: "absolute start-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md text-primary hover:bg-primary hover:text-white transition-colors -translate-x-1/2 rtl:translate-x-1/2",
          children: isRTL ? /* @__PURE__ */ jsx(ChevronRight, { size: 20 }) : /* @__PURE__ */ jsx(ChevronLeft, { size: 20 })
        }
      ),
      /* @__PURE__ */ jsxs(
        "div",
        {
          ref: trackRef,
          className: "flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          children: [
            filtered.length === 0 && /* @__PURE__ */ jsx("div", { className: "w-full text-center text-ink-muted py-12", children: "— no projects in this category yet —" }),
            filtered.map((p) => /* @__PURE__ */ jsx(
              ProjectCard,
              {
                project: p,
                language,
                ctaLabel: showcase.card_cta?.content ?? ""
              },
              p.id
            ))
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => scrollByOne(1),
          "aria-label": "Next",
          className: "absolute end-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md text-primary hover:bg-primary hover:text-white transition-colors translate-x-1/2 rtl:-translate-x-1/2",
          children: isRTL ? /* @__PURE__ */ jsx(ChevronLeft, { size: 20 }) : /* @__PURE__ */ jsx(ChevronRight, { size: 20 })
        }
      )
    ] })
  ] }) });
}
function ProjectCard({ project, language, ctaLabel }) {
  const title = language === "ar" ? project.title_ar : project.title_en;
  const location = language === "ar" ? project.location_ar : project.location_en;
  const areaLabel = language === "ar" ? `${project.area_sqm} م²` : `${project.area_sqm} M²`;
  return /* @__PURE__ */ jsxs(
    "article",
    {
      "data-card": true,
      className: "snap-start shrink-0 w-[280px] sm:w-[300px] bg-white rounded-3xl shadow-md overflow-hidden flex flex-col",
      children: [
        /* @__PURE__ */ jsx("div", { className: "aspect-[4/3] w-full overflow-hidden bg-primary-light/30", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: project.image_url,
            alt: title,
            loading: "lazy",
            className: "w-full h-full object-cover"
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-5 flex flex-col items-center text-center flex-1", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-base sm:text-lg font-semibold text-ink", children: title }),
          location && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-ink-muted", children: location }),
          project.area_sqm != null && /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-muted", children: areaLabel }),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: `/properties/${project.slug}`,
              className: "mt-4 inline-flex items-center justify-center rounded-full bg-primary px-5 py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-primary-deep transition-colors",
              children: ctaLabel
            }
          )
        ] })
      ]
    }
  );
}
function ValueProposition({ content }) {
  const vp = content.value_prop ?? {};
  const items = [
    { Icon: Award, key: "item_1" },
    { Icon: ShieldCheck, key: "item_2" },
    { Icon: Tag, key: "item_3" },
    { Icon: CreditCard, key: "item_4" }
  ];
  return /* @__PURE__ */ jsx("section", { className: "bg-surface py-16 sm:py-24", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-3xl sm:text-4xl lg:text-5xl font-bold text-primary text-center tracking-wide", children: vp.title?.content ?? "" }),
    /* @__PURE__ */ jsx("div", { className: "mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-5xl mx-auto", children: items.map(({ Icon, key }) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex flex-col items-center text-center",
        children: [
          /* @__PURE__ */ jsx(Icon, { size: 36, strokeWidth: 1.25, className: "text-primary mb-3", "aria-hidden": "true" }),
          /* @__PURE__ */ jsx("div", { className: "rounded-3xl bg-primary-light/30 px-5 py-6 sm:py-8 text-sm sm:text-base text-ink leading-snug min-h-[120px] flex items-center justify-center w-full", children: vp[key]?.content ?? "" })
        ]
      },
      key
    )) })
  ] }) });
}
function MediaRoom({ content, embeds }) {
  const room = content.media_room ?? {};
  if (!embeds.linkedin && !embeds.instagram) return null;
  return /* @__PURE__ */ jsx("section", { className: "bg-surface py-16 sm:py-24", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-3xl sm:text-4xl lg:text-5xl font-bold text-primary text-center tracking-wide", children: room.title?.content ?? "" }),
    /* @__PURE__ */ jsxs("div", { className: "mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto", children: [
      embeds.linkedin && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 mb-4 text-ink", children: [
          /* @__PURE__ */ jsx(LinkedinIcon, { size: 28 }),
          /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold", children: "LinkedIn" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "rounded-2xl overflow-hidden bg-surface-muted shadow-sm", children: /* @__PURE__ */ jsx(
          "iframe",
          {
            src: embeds.linkedin,
            title: "LinkedIn",
            loading: "lazy",
            className: "w-full h-[420px] border-0",
            sandbox: "allow-scripts allow-same-origin allow-popups"
          }
        ) })
      ] }),
      embeds.instagram && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 mb-4 text-ink", children: [
          /* @__PURE__ */ jsx(InstagramIcon, { size: 28 }),
          /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold", children: "Instagram" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "rounded-2xl overflow-hidden bg-surface-muted shadow-sm", children: /* @__PURE__ */ jsx(
          "iframe",
          {
            src: embeds.instagram,
            title: "Instagram",
            loading: "lazy",
            className: "w-full h-[420px] border-0",
            sandbox: "allow-scripts allow-same-origin allow-popups"
          }
        ) })
      ] })
    ] })
  ] }) });
}
function LocationMap({ content, mapEmbedUrl }) {
  const loc = content.location ?? {};
  if (!mapEmbedUrl) return null;
  return /* @__PURE__ */ jsx("section", { className: "bg-surface pt-12 pb-20 sm:pt-16 sm:pb-28", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-3xl sm:text-4xl lg:text-5xl font-bold text-primary text-center tracking-wide", children: loc.title?.content ?? "" }),
    /* @__PURE__ */ jsx("div", { className: "mt-10 rounded-3xl overflow-hidden shadow-md", children: /* @__PURE__ */ jsx(
      "iframe",
      {
        src: mapEmbedUrl,
        title: "Sky Amman office location",
        loading: "lazy",
        referrerPolicy: "no-referrer-when-downgrade",
        allowFullScreen: true,
        className: "w-full h-[420px] sm:h-[500px] border-0 block"
      }
    ) })
  ] }) });
}
function Home() {
  const { props } = usePage();
  const { language } = useLanguage();
  const content = language === "ar" ? props.content_ar : props.content_en;
  const seoTitle = props.siteSettings?.seo_title ?? "Sky Amman";
  const seoDescription = props.siteSettings?.seo_description ?? "";
  return /* @__PURE__ */ jsxs(PublicLayout, { children: [
    /* @__PURE__ */ jsxs(Head, { title: seoTitle, children: [
      /* @__PURE__ */ jsx("meta", { name: "description", content: seoDescription }),
      /* @__PURE__ */ jsx("meta", { property: "og:title", content: seoTitle }),
      /* @__PURE__ */ jsx("meta", { property: "og:description", content: seoDescription }),
      /* @__PURE__ */ jsx("meta", { property: "og:type", content: "website" })
    ] }),
    /* @__PURE__ */ jsx(HomeHero, { content }),
    /* @__PURE__ */ jsx(InvestmentBanner, { content }),
    /* @__PURE__ */ jsx(AssurancePillars, { content }),
    /* @__PURE__ */ jsx(ProjectShowcase, { content, projects: props.featuredProjects }),
    /* @__PURE__ */ jsx(ValueProposition, { content }),
    /* @__PURE__ */ jsx(MediaRoom, { content, embeds: props.mediaEmbeds }),
    /* @__PURE__ */ jsx(
      LocationMap,
      {
        content,
        mapEmbedUrl: props.siteSettings?.google_maps_embed_url ?? ""
      }
    )
  ] });
}
export {
  Home as default
};
