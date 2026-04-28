import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Save } from "lucide-react";
import { A as AdminLayout } from "./AdminLayout-DnPfbuel.js";
import "./cn-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
const GROUP_LABELS = {
  contact: "Contact Info",
  social: "Social Links",
  map: "Map",
  media_room: "Media Room",
  seo: "SEO Defaults",
  leads: "Lead Routing"
};
const GROUP_ORDER = ["contact", "social", "map", "media_room", "seo", "leads"];
const SETTING_LABELS = {
  company_phone: "Phone",
  company_email: "Email",
  company_address_en: "Address (EN)",
  company_address_ar: "Address (AR)",
  linkedin_url: "LinkedIn URL",
  instagram_url: "Instagram URL",
  facebook_url: "Facebook URL",
  twitter_url: "X (Twitter) URL",
  youtube_url: "YouTube URL",
  tiktok_url: "TikTok URL",
  google_maps_embed_url: "Google Maps Embed URL",
  google_maps_place_url: "Google Maps Place URL",
  linkedin_embed_url: "LinkedIn Embed URL",
  instagram_embed_url: "Instagram Embed URL",
  seo_title_en: "SEO Title (EN)",
  seo_title_ar: "SEO Title (AR)",
  seo_description_en: "SEO Description (EN)",
  seo_description_ar: "SEO Description (AR)",
  og_image_url: "OG Image URL",
  lead_routing: "Lead Routing"
};
const LEAD_TYPES = [
  { key: "buy", label: "Buy inquiries" },
  { key: "rent", label: "Rent inquiries" },
  { key: "build", label: "Build inquiries" },
  { key: "investment", label: "Investment inquiries" },
  { key: "general", label: "General inquiries" }
];
function inputClass(multiline = false) {
  return `w-full px-3 py-2 text-sm border border-ink/10 rounded bg-white dark:bg-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/30${multiline ? " resize-y" : ""}`;
}
function Label({ children }) {
  return /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-ink-muted mb-1", children });
}
function Settings() {
  const { settings } = usePage().props;
  const [processing, setProcessing] = useState(false);
  const [values, setValues] = useState(() => {
    const v = {};
    Object.values(settings).flat().forEach((s) => {
      v[s.key] = s.value ?? "";
    });
    return v;
  });
  const [leadRouting, setLeadRouting] = useState(() => {
    try {
      const parsed = JSON.parse(values["lead_routing"] || "{}");
      return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  });
  function setValue(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }
  function setLead(type, email) {
    setLeadRouting((prev) => ({ ...prev, [type]: email }));
  }
  function save() {
    const allValues = {
      ...values,
      lead_routing: JSON.stringify(leadRouting)
    };
    const payload = Object.entries(allValues).map(([key, value]) => ({ key, value }));
    setProcessing(true);
    router.put("/admin/settings", { settings: payload }, {
      preserveScroll: true,
      onFinish: () => setProcessing(false)
    });
  }
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Settings", children: [
    /* @__PURE__ */ jsx(Head, { title: "Settings" }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end mb-6", children: /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: save,
        disabled: processing,
        className: "inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary-dark disabled:opacity-60 transition-colors",
        children: [
          /* @__PURE__ */ jsx(Save, { size: 15 }),
          processing ? "Saving…" : "Save All Settings"
        ]
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4", children: GROUP_ORDER.filter((g) => settings[g]).map((group) => {
      const rows = settings[group] ?? [];
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg p-5",
          children: [
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-ink mb-4", children: GROUP_LABELS[group] ?? group }),
            group === "leads" ? (
              // Lead routing — special UI: 5 email fields
              /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-muted", children: "Route each request type to a specific recipient email. Leave blank to fall back to the company email." }),
                LEAD_TYPES.map(({ key, label }) => /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(Label, { children: label }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "email",
                      value: leadRouting[key] ?? "",
                      onChange: (e) => setLead(key, e.target.value),
                      placeholder: "Defaults to company email",
                      className: inputClass()
                    }
                  )
                ] }, key))
              ] })
            ) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: rows.map((setting) => {
              const label = SETTING_LABELS[setting.key] ?? setting.key;
              const isAr = setting.key.endsWith("_ar");
              const isMultiline = setting.type === "textarea";
              const isUrl = setting.type === "url";
              const isEmail = setting.type === "email";
              return /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { children: label }),
                isMultiline ? /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    value: values[setting.key] ?? "",
                    onChange: (e) => setValue(setting.key, e.target.value),
                    rows: 2,
                    dir: isAr ? "rtl" : "ltr",
                    className: inputClass(true)
                  }
                ) : /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: isUrl ? "url" : isEmail ? "email" : "text",
                    value: values[setting.key] ?? "",
                    onChange: (e) => setValue(setting.key, e.target.value),
                    dir: isAr ? "rtl" : "ltr",
                    className: inputClass()
                  }
                )
              ] }, setting.key);
            }) })
          ]
        },
        group
      );
    }) }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end mt-4 mb-8", children: /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: save,
        disabled: processing,
        className: "inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary-dark disabled:opacity-60 transition-colors",
        children: [
          /* @__PURE__ */ jsx(Save, { size: 15 }),
          processing ? "Saving…" : "Save All Settings"
        ]
      }
    ) })
  ] });
}
export {
  Settings as default
};
