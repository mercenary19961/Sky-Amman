import { jsx, jsxs } from "react/jsx-runtime";
import { usePage, Link, Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { u as useLanguage } from "../ssr.js";
import { c as cn } from "./cn-H80jjgLf.js";
import "i18next";
import "@inertiajs/react/server";
import "react-dom/server";
import "react";
import "lucide-react";
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
  return /* @__PURE__ */ jsxs("footer", { className: "bg-primary-light/30 border-t border-ink/5 mt-16", children: [
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid gap-10 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "font-bold text-2xl text-primary tracking-wide", children: "SKY AMMAN" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-ink-muted", children: t("footer.tagline") })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-ink mb-3", children: t("footer.sections.mainPages") }),
        /* @__PURE__ */ jsx("ul", { className: "space-y-2 text-sm text-ink-muted", children: MAIN_PAGES.map((p) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { href: p.href, className: "hover:text-primary", children: t(`nav.${p.key}`) }) }, p.key)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-ink mb-3", children: t("footer.sections.contact") }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-ink-muted", children: [
          siteSettings?.phone && /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: `tel:${siteSettings.phone}`, className: "hover:text-primary", children: siteSettings.phone }) }),
          siteSettings?.email && /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: `mailto:${siteSettings.email}`, className: "hover:text-primary", children: siteSettings.email }) }),
          siteSettings?.address && /* @__PURE__ */ jsx("li", { children: siteSettings.address })
        ] })
      ] }),
      socials.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-ink mb-3", children: t("footer.sections.followUs") }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: socials.map(({ url, Icon, label }) => /* @__PURE__ */ jsx(
          "a",
          {
            href: url,
            target: "_blank",
            rel: "noopener noreferrer",
            "aria-label": label,
            className: "text-ink-muted hover:text-primary transition-colors",
            children: /* @__PURE__ */ jsx(Icon, { size: 20 })
          },
          label
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "border-t border-ink/5", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 text-xs text-ink-muted", children: [
      "© ",
      year,
      " Sky Amman. ",
      t("footer.copyright")
    ] }) })
  ] });
}
function PublicLayout({ children }) {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col bg-surface text-ink", children: [
    /* @__PURE__ */ jsx(Header, {}),
    /* @__PURE__ */ jsx("main", { className: "flex-1", children }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
function Welcome() {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs(PublicLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: t("home.hero.title") }),
    /* @__PURE__ */ jsx("section", { className: "min-h-[80vh] flex items-center justify-center px-4", children: /* @__PURE__ */ jsxs("div", { className: "text-center max-w-3xl", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm font-semibold tracking-widest text-primary uppercase mb-3", children: [
        "Sky Amman — ",
        t("footer.tagline")
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "text-4xl md:text-5xl font-bold leading-tight mb-4 text-ink", children: t("home.hero.title") }),
      /* @__PURE__ */ jsx("p", { className: "text-lg text-ink-muted", children: t("home.hero.subtitle") })
    ] }) })
  ] });
}
export {
  Welcome as default
};
