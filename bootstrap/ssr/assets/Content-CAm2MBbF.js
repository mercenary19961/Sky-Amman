import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Save, Eye, EyeOff } from "lucide-react";
import { A as AdminLayout } from "./AdminLayout-DnPfbuel.js";
import { c as cn } from "./cn-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
function toLabel(str) {
  return str.replace(/_/g, " ").replace(/\bcta\b/gi, "CTA").replace(/\b\w/g, (c) => c.toUpperCase());
}
const PAGE_ORDER = ["home", "properties", "investment", "self_build", "security", "about", "contact"];
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
  const [activePage, setActivePage] = useState(orderedPages[0] ?? "home");
  const [processing, setProcessing] = useState(false);
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
  function savePage() {
    const sections = grouped[activePage] ?? {};
    const rows = Object.entries(sections).flatMap(([section, sectionRows]) => {
      const visible = sectionVisible[activePage]?.[section] ?? true;
      return sectionRows.map((r) => ({
        id: r.id,
        content_en: rowValues[r.id]?.content_en ?? "",
        content_ar: rowValues[r.id]?.content_ar ?? "",
        is_visible: visible
      }));
    });
    const seo = pageSeo[activePage] ?? {};
    setProcessing(true);
    router.put(`/admin/content/${activePage}`, {
      page_is_visible: seo.is_visible,
      seo_title_en: seo.seo_title_en,
      seo_title_ar: seo.seo_title_ar,
      seo_description_en: seo.seo_description_en,
      seo_description_ar: seo.seo_description_ar,
      rows
    }, {
      preserveScroll: true,
      onFinish: () => setProcessing(false)
    });
  }
  const currentSections = grouped[activePage] ?? {};
  const currentSeo = pageSeo[activePage] ?? { is_visible: true, seo_title_en: "", seo_title_ar: "", seo_description_en: "", seo_description_ar: "" };
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Site Content", children: [
    /* @__PURE__ */ jsx(Head, { title: "Site Content" }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 mb-6 overflow-x-auto pb-1", children: [
      orderedPages.map((slug) => {
        const page = pages[slug];
        return /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setActivePage(slug),
            className: cn(
              "px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-colors",
              activePage === slug ? "bg-primary text-white" : "bg-white dark:bg-zinc-800 border border-ink/10 dark:border-white/10 text-ink-muted hover:text-ink"
            ),
            children: page?.title_en ?? toLabel(slug)
          },
          slug
        );
      }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: savePage,
          disabled: processing,
          className: "ms-auto inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary-dark disabled:opacity-60 transition-colors whitespace-nowrap",
          children: [
            /* @__PURE__ */ jsx(Save, { size: 15 }),
            processing ? "Saving…" : "Save Changes"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg p-5 mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-ink", children: "Page SEO & Visibility" }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: currentSeo.is_visible,
              onChange: (e) => setSeo(activePage, "is_visible", e.target.checked),
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
              value: currentSeo.seo_title_en,
              onChange: (e) => setSeo(activePage, "seo_title_en", e.target.value),
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
              value: currentSeo.seo_title_ar,
              onChange: (e) => setSeo(activePage, "seo_title_ar", e.target.value),
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
              value: currentSeo.seo_description_en,
              onChange: (e) => setSeo(activePage, "seo_description_en", e.target.value),
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
              value: currentSeo.seo_description_ar,
              onChange: (e) => setSeo(activePage, "seo_description_ar", e.target.value),
              rows: 2,
              dir: "rtl",
              className: "w-full px-3 py-2 text-sm border border-ink/10 rounded bg-white dark:bg-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
            }
          )
        ] })
      ] })
    ] }),
    Object.entries(currentSections).map(([section, rows]) => {
      const visible = sectionVisible[activePage]?.[section] ?? true;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg mb-4 overflow-hidden",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-5 py-3 border-b border-ink/5 dark:border-white/10 bg-surface-muted dark:bg-zinc-900/50", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-ink", children: toLabel(section) }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => toggleSection(activePage, section),
                  title: visible ? "Hide section" : "Show section",
                  className: cn(
                    "flex items-center gap-1.5 text-xs font-medium transition-colors",
                    visible ? "text-ink-muted hover:text-ink" : "text-amber-500 hover:text-amber-600"
                  ),
                  children: [
                    visible ? /* @__PURE__ */ jsx(Eye, { size: 14 }) : /* @__PURE__ */ jsx(EyeOff, { size: 14 }),
                    visible ? "Visible" : "Hidden"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: cn("divide-y divide-ink/5 dark:divide-white/5", !visible && "opacity-50"), children: rows.map((row) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[160px_1fr_1fr] items-start gap-3 px-5 py-3", children: [
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
            ] }, row.id)) })
          ]
        },
        section
      );
    }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end mt-2 mb-8", children: /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: savePage,
        disabled: processing,
        className: "inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary-dark disabled:opacity-60 transition-colors",
        children: [
          /* @__PURE__ */ jsx(Save, { size: 15 }),
          processing ? "Saving…" : "Save Changes"
        ]
      }
    ) })
  ] });
}
export {
  ContentEditor as default
};
