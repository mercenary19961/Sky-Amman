import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head, router } from "@inertiajs/react";
import { useState } from "react";
import { ChevronRight, Save, Eye, EyeOff, Minimize2, Maximize2, ExternalLink, MousePointerClick } from "lucide-react";
import { A as AdminLayout } from "./AdminLayout-DnPfbuel.js";
import { c as cn } from "./cn-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
function toLabel(str) {
  return str.replace(/_/g, " ").replace(/\bcta\b/gi, "CTA").replace(/\b\w/g, (c) => c.toUpperCase());
}
const PAGE_ORDER = ["home", "properties", "investment", "self_build", "security", "about", "contact"];
const PAGE_URLS = {
  home: "/",
  properties: "/properties",
  investment: "/investment",
  self_build: "/self-build",
  security: "/security",
  about: "/about",
  contact: "/contact"
};
function RowInput({
  type,
  value,
  onChange,
  dir,
  placeholder
}) {
  const base = "w-full px-3 py-2 text-sm border border-ink/10 rounded bg-white dark:bg-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30";
  if (type === "text") {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type: "text",
        value,
        onChange: (e) => onChange(e.target.value),
        dir,
        placeholder,
        className: base
      }
    );
  }
  return /* @__PURE__ */ jsx(
    "textarea",
    {
      value,
      onChange: (e) => onChange(e.target.value),
      dir,
      placeholder,
      rows: 2,
      className: cn(base, "resize-y")
    }
  );
}
function ContentEditor() {
  const { grouped, pages } = usePage().props;
  const orderedPages = PAGE_ORDER.filter((slug) => pages[slug]);
  const [expandedPage, setExpandedPage] = useState(orderedPages[0] ?? null);
  const [processing, setProcessing] = useState(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [previewInteractive, setPreviewInteractive] = useState(false);
  const [rowValues, setRowValues] = useState(() => {
    const v = {};
    Object.values(grouped).forEach(
      (sections) => Object.values(sections).forEach(
        (rows) => rows.forEach((r) => {
          v[r.id] = { content_en: r.content_en ?? "", content_ar: r.content_ar ?? "" };
        })
      )
    );
    return v;
  });
  const [sectionVisible, setSectionVisible] = useState(() => {
    const v = {};
    Object.entries(grouped).forEach(([page, sections]) => {
      v[page] = {};
      Object.entries(sections).forEach(([section, rows]) => {
        v[page][section] = rows.every((r) => r.is_visible);
      });
    });
    return v;
  });
  const [pageSeo, setPageSeo] = useState(() => {
    const v = {};
    Object.values(pages).forEach((p) => {
      v[p.slug] = {
        is_visible: p.is_visible,
        seo_title_en: p.seo_title_en ?? "",
        seo_title_ar: p.seo_title_ar ?? "",
        seo_description_en: p.seo_description_en ?? "",
        seo_description_ar: p.seo_description_ar ?? ""
      };
    });
    return v;
  });
  function setRow(id, field, value) {
    setRowValues((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }
  function toggleSection(pageSlug, section) {
    setSectionVisible((prev) => ({
      ...prev,
      [pageSlug]: { ...prev[pageSlug], [section]: !prev[pageSlug]?.[section] }
    }));
  }
  function setSeo(pageSlug, key, value) {
    setPageSeo((prev) => ({ ...prev, [pageSlug]: { ...prev[pageSlug], [key]: value } }));
  }
  function toggleAccordion(slug) {
    const opening = expandedPage !== slug;
    setExpandedPage(opening ? slug : null);
    if (opening) setPreviewInteractive(false);
  }
  function openPage(slug) {
    setExpandedPage(slug);
    setPreviewInteractive(false);
  }
  function savePage(slug) {
    const sections = grouped[slug] ?? {};
    const rows = Object.entries(sections).flatMap(([section, sectionRows]) => {
      const visible = sectionVisible[slug]?.[section] ?? true;
      return sectionRows.map((r) => ({
        id: r.id,
        content_en: rowValues[r.id]?.content_en ?? "",
        content_ar: rowValues[r.id]?.content_ar ?? "",
        is_visible: visible
      }));
    });
    const seo = pageSeo[slug] ?? {};
    setProcessing(slug);
    router.put(`/admin/content/${slug}`, {
      page_is_visible: seo.is_visible,
      seo_title_en: seo.seo_title_en,
      seo_title_ar: seo.seo_title_ar,
      seo_description_en: seo.seo_description_en,
      seo_description_ar: seo.seo_description_ar,
      rows
    }, {
      preserveScroll: true,
      onSuccess: () => setIframeKey((k) => k + 1),
      onFinish: () => setProcessing(null)
    });
  }
  const previewSlug = expandedPage ?? orderedPages[0] ?? "home";
  const previewUrl = PAGE_URLS[previewSlug] ?? "/";
  const previewLabel = pages[previewSlug]?.title_en ?? toLabel(previewSlug);
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Site Content", children: [
    /* @__PURE__ */ jsx(Head, { title: "Site Content" }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 mb-4 overflow-x-auto pb-1", children: orderedPages.map((slug) => /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => openPage(slug),
        className: cn(
          "px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-colors",
          expandedPage === slug ? "bg-primary text-white" : "bg-white dark:bg-zinc-800 border border-ink/10 dark:border-white/10 text-ink-muted hover:text-ink"
        ),
        children: pages[slug]?.title_en ?? toLabel(slug)
      },
      slug
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-4 items-start", children: [
      /* @__PURE__ */ jsx("div", { className: cn(
        "min-w-0 transition-all duration-300 space-y-2",
        previewExpanded ? "w-full xl:w-[30%]" : "w-full xl:w-[55%]"
      ), children: orderedPages.map((slug) => {
        const page = pages[slug];
        const isOpen = expandedPage === slug;
        const sections = grouped[slug] ?? {};
        const sectionCount = Object.keys(sections).length;
        const rowCount = Object.values(sections).flat().length;
        const seo = pageSeo[slug] ?? { is_visible: true, seo_title_en: "", seo_title_ar: "", seo_description_en: "", seo_description_ar: "" };
        const isSaving = processing === slug;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: "bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg overflow-hidden",
            children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => toggleAccordion(slug),
                  className: "w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-surface-muted dark:hover:bg-zinc-700/50 transition-colors",
                  children: [
                    /* @__PURE__ */ jsx(
                      ChevronRight,
                      {
                        size: 16,
                        className: cn(
                          "shrink-0 text-ink-muted transition-transform duration-200",
                          isOpen && "rotate-90"
                        )
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { className: "font-semibold text-ink text-sm flex-1 text-start", children: page?.title_en ?? toLabel(slug) }),
                    /* @__PURE__ */ jsxs("span", { className: "text-xs text-ink-muted", children: [
                      sectionCount,
                      " section",
                      sectionCount !== 1 ? "s" : "",
                      " · ",
                      rowCount,
                      " fields"
                    ] }),
                    !seo.is_visible && /* @__PURE__ */ jsx("span", { className: "text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400", children: "Hidden" }),
                    isOpen && /* @__PURE__ */ jsxs(
                      "div",
                      {
                        onClick: (e) => {
                          e.stopPropagation();
                          savePage(slug);
                        },
                        role: "button",
                        tabIndex: 0,
                        onKeyDown: (e) => e.key === "Enter" && savePage(slug),
                        className: cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors",
                          isSaving ? "bg-primary/50 text-white cursor-not-allowed" : "bg-primary text-white hover:bg-primary-dark"
                        ),
                        children: [
                          /* @__PURE__ */ jsx(Save, { size: 12 }),
                          isSaving ? "Saving…" : "Save"
                        ]
                      }
                    )
                  ]
                }
              ),
              isOpen && /* @__PURE__ */ jsxs("div", { className: "border-t border-ink/5 dark:border-white/10", children: [
                /* @__PURE__ */ jsxs("div", { className: "p-5 border-b border-ink/5 dark:border-white/10", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
                    /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wider text-ink-muted", children: "Page SEO & Visibility" }),
                    /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: "checkbox",
                          checked: seo.is_visible,
                          onChange: (e) => setSeo(slug, "is_visible", e.target.checked),
                          className: "w-4 h-4 accent-primary"
                        }
                      ),
                      "Page visible on site"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-ink-muted mb-1", children: "SEO Title (EN)" }),
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: "text",
                          value: seo.seo_title_en,
                          onChange: (e) => setSeo(slug, "seo_title_en", e.target.value),
                          placeholder: "Defaults to site-wide setting if empty",
                          className: "w-full px-3 py-2 text-sm border border-ink/10 rounded bg-white dark:bg-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-ink-muted mb-1", children: "SEO Title (AR)" }),
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: "text",
                          value: seo.seo_title_ar,
                          onChange: (e) => setSeo(slug, "seo_title_ar", e.target.value),
                          dir: "rtl",
                          className: "w-full px-3 py-2 text-sm border border-ink/10 rounded bg-white dark:bg-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-ink-muted mb-1", children: "SEO Description (EN)" }),
                      /* @__PURE__ */ jsx(
                        "textarea",
                        {
                          value: seo.seo_description_en,
                          onChange: (e) => setSeo(slug, "seo_description_en", e.target.value),
                          rows: 2,
                          placeholder: "Max 500 characters",
                          className: "w-full px-3 py-2 text-sm border border-ink/10 rounded bg-white dark:bg-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-ink-muted mb-1", children: "SEO Description (AR)" }),
                      /* @__PURE__ */ jsx(
                        "textarea",
                        {
                          value: seo.seo_description_ar,
                          onChange: (e) => setSeo(slug, "seo_description_ar", e.target.value),
                          rows: 2,
                          dir: "rtl",
                          className: "w-full px-3 py-2 text-sm border border-ink/10 rounded bg-white dark:bg-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                        }
                      )
                    ] })
                  ] })
                ] }),
                Object.entries(sections).map(([section, rows]) => {
                  const visible = sectionVisible[slug]?.[section] ?? true;
                  return /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: "border-b border-ink/5 dark:border-white/10 last:border-b-0",
                      children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-5 py-2.5 bg-surface-muted dark:bg-zinc-900/40", children: [
                          /* @__PURE__ */ jsx("h4", { className: "text-xs font-semibold text-ink", children: toLabel(section) }),
                          /* @__PURE__ */ jsxs(
                            "button",
                            {
                              type: "button",
                              onClick: () => toggleSection(slug, section),
                              className: cn(
                                "flex items-center gap-1.5 text-xs font-medium transition-colors",
                                visible ? "text-ink-muted hover:text-ink" : "text-amber-500 hover:text-amber-600"
                              ),
                              children: [
                                visible ? /* @__PURE__ */ jsx(Eye, { size: 13 }) : /* @__PURE__ */ jsx(EyeOff, { size: 13 }),
                                visible ? "Visible" : "Hidden"
                              ]
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsx("div", { className: cn(
                          "divide-y divide-ink/5 dark:divide-white/5",
                          !visible && "opacity-50"
                        ), children: rows.map((row) => /* @__PURE__ */ jsxs(
                          "div",
                          {
                            className: "grid grid-cols-[110px_1fr_1fr] items-start gap-3 px-5 py-2.5",
                            children: [
                              /* @__PURE__ */ jsx("div", { className: "pt-2 text-xs font-medium text-ink-muted", children: toLabel(row.key) }),
                              /* @__PURE__ */ jsx(
                                RowInput,
                                {
                                  type: row.type,
                                  value: rowValues[row.id]?.content_en ?? "",
                                  onChange: (v) => setRow(row.id, "content_en", v),
                                  placeholder: "EN"
                                }
                              ),
                              /* @__PURE__ */ jsx(
                                RowInput,
                                {
                                  type: row.type,
                                  value: rowValues[row.id]?.content_ar ?? "",
                                  onChange: (v) => setRow(row.id, "content_ar", v),
                                  dir: "rtl",
                                  placeholder: "AR"
                                }
                              )
                            ]
                          },
                          row.id
                        )) })
                      ]
                    },
                    section
                  );
                }),
                /* @__PURE__ */ jsx("div", { className: "flex justify-end px-5 py-4", children: /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => savePage(slug),
                    disabled: isSaving,
                    className: "inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary-dark disabled:opacity-60 transition-colors",
                    children: [
                      /* @__PURE__ */ jsx(Save, { size: 14 }),
                      isSaving ? "Saving…" : "Save Changes"
                    ]
                  }
                ) })
              ] })
            ]
          },
          slug
        );
      }) }),
      /* @__PURE__ */ jsx("div", { className: cn(
        "hidden xl:block shrink-0 transition-all duration-300",
        previewExpanded ? "xl:w-[70%]" : "xl:w-[45%]"
      ), children: /* @__PURE__ */ jsx("div", { className: "sticky top-4", children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg overflow-hidden",
          style: { height: "calc(100vh - 6rem)" },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-ink/5 dark:border-white/10 bg-surface-muted dark:bg-zinc-900/50", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
                /* @__PURE__ */ jsx(Eye, { size: 14, className: "text-ink-muted shrink-0" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-ink truncate", children: previewLabel }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-ink-muted shrink-0", children: previewUrl })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 shrink-0 ms-2", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setPreviewExpanded((v) => !v),
                    title: previewExpanded ? "Collapse preview" : "Expand preview",
                    className: "text-ink-muted hover:text-ink transition-colors",
                    children: previewExpanded ? /* @__PURE__ */ jsx(Minimize2, { size: 14 }) : /* @__PURE__ */ jsx(Maximize2, { size: 14 })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: previewUrl,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    title: "Open in new tab",
                    className: "text-ink-muted hover:text-ink transition-colors",
                    children: /* @__PURE__ */ jsx(ExternalLink, { size: 14 })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs(
              "div",
              {
                className: "relative",
                style: { height: "calc(100% - 2.875rem)" },
                onMouseLeave: () => setPreviewInteractive(false),
                children: [
                  !previewInteractive && /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "absolute inset-0 z-10 cursor-pointer",
                      onClick: () => setPreviewInteractive(true),
                      children: /* @__PURE__ */ jsxs("div", { className: "absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/80 text-amber-400 text-xs font-medium rounded-full whitespace-nowrap", children: [
                        /* @__PURE__ */ jsx(MousePointerClick, { size: 12 }),
                        "Click to interact with preview"
                      ] })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "iframe",
                    {
                      src: previewUrl,
                      className: "w-full h-full border-0",
                      title: `Preview: ${previewLabel}`
                    },
                    iframeKey
                  )
                ]
              }
            )
          ]
        }
      ) }) })
    ] })
  ] });
}
export {
  ContentEditor as default
};
