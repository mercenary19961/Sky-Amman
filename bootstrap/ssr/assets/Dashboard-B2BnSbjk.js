import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head, Link } from "@inertiajs/react";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from "recharts";
import { Plus, FileText, Settings, Building2, MessageSquare, MailOpen, AlertTriangle, Image, ExternalLink, Search, Share2, EyeOff } from "lucide-react";
import { A as AdminLayout } from "./AdminLayout-DnPfbuel.js";
import { c as cn } from "./cn-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
const CATEGORY_LABELS = {
  under_development: "Under Development",
  ready: "Ready",
  investment_opportunity: "Investment"
};
const TYPE_LABELS = {
  buy: "Buy",
  rent: "Rent",
  build: "Build",
  investment: "Investment",
  general: "General"
};
const SOCIAL_LABELS = {
  linkedin_url: "LinkedIn",
  instagram_url: "Instagram",
  facebook_url: "Facebook",
  twitter_url: "X (Twitter)",
  youtube_url: "YouTube",
  tiktok_url: "TikTok"
};
const TYPE_COLORS = {
  buy: "bg-sky-500",
  rent: "bg-violet-500",
  build: "bg-amber-500",
  investment: "bg-emerald-500",
  general: "bg-zinc-400"
};
const CATEGORY_COLORS = {
  under_development: "bg-amber-500",
  ready: "bg-emerald-500",
  investment_opportunity: "bg-sky-500"
};
function formatDateLabel(dateStr) {
  const d = /* @__PURE__ */ new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = false,
  warning = false
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "rounded-lg border p-5 flex items-start gap-4",
        warning ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50" : "bg-white dark:bg-zinc-800 border-ink/5 dark:border-white/10"
      ),
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(
              "shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
              warning ? "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400" : accent ? "bg-primary/10 text-primary" : "bg-zinc-100 dark:bg-zinc-700 text-ink-muted"
            ),
            children: /* @__PURE__ */ jsx(Icon, { size: 18 })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("div", { className: cn("text-2xl font-bold tabular-nums", warning && "text-amber-700 dark:text-amber-400"), children: value }),
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-ink", children: label }),
          sub && /* @__PURE__ */ jsx("div", { className: "text-xs text-ink-muted mt-0.5", children: sub })
        ] })
      ]
    }
  );
}
function SectionCard({ title, children, className }) {
  return /* @__PURE__ */ jsxs("div", { className: cn("bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg", className), children: [
    /* @__PURE__ */ jsx("div", { className: "px-5 py-3.5 border-b border-ink/5 dark:border-white/10", children: /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-ink", children: title }) }),
    /* @__PURE__ */ jsx("div", { className: "p-5", children })
  ] });
}
function BarRow({ label, count, max, colorClass }) {
  const pct = max > 0 ? Math.round(count / max * 100) : 0;
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsx("div", { className: "w-24 shrink-0 text-xs text-ink-muted text-right", children: label }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 bg-zinc-100 dark:bg-zinc-700 rounded-full h-2 overflow-hidden", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: cn("h-full rounded-full transition-all duration-500", colorClass),
        style: { width: `${pct}%` }
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "w-6 shrink-0 text-xs font-medium tabular-nums text-ink", children: count })
  ] });
}
function HealthItem({ items, editPath, label }) {
  if (items.length === 0) return null;
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-ink-muted mb-1.5", children: label }),
    /* @__PURE__ */ jsx("ul", { className: "space-y-1", children: items.map((item) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsx("span", { className: "text-sm text-ink truncate flex-1", children: item.title_en }),
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: `${editPath}${item.id}/edit`,
          className: "shrink-0 text-[11px] text-primary hover:underline flex items-center gap-0.5",
          children: [
            "Fix ",
            /* @__PURE__ */ jsx(ExternalLink, { size: 10 })
          ]
        }
      )
    ] }, item.id)) })
  ] });
}
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 text-white text-xs px-3 py-2 rounded shadow-lg", children: [
    /* @__PURE__ */ jsx("div", { className: "font-medium", children: label ? formatDateLabel(label) : "" }),
    /* @__PURE__ */ jsxs("div", { className: "text-zinc-300", children: [
      payload[0].value,
      " ",
      payload[0].value === 1 ? "inquiry" : "inquiries"
    ] })
  ] });
}
function Dashboard() {
  const { stats, dailyInquiries, inquiriesByType, projectsByCategory, contentHealth, recentInquiries } = usePage().props;
  const maxInquiryType = Math.max(...inquiriesByType.map((r) => r.count), 1);
  const maxCategory = Math.max(...projectsByCategory.map((r) => r.count), 1);
  const totalHealthIssues = contentHealth.projectsMissingImages.length + contentHealth.projectsMissingSeo.length + contentHealth.emptySocialKeys.length + contentHealth.hiddenPages.length + contentHealth.hiddenSections.length;
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Dashboard", children: [
    /* @__PURE__ */ jsx(Head, { title: "Dashboard" }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-6 flex-wrap", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/admin/projects/create",
          className: "inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary-dark transition-colors",
          children: [
            /* @__PURE__ */ jsx(Plus, { size: 15 }),
            "Add Project"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/admin/content",
          className: "inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-ink/10 dark:border-white/10 text-ink rounded text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors",
          children: [
            /* @__PURE__ */ jsx(FileText, { size: 15 }),
            "Edit Content"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/admin/settings",
          className: "inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-ink/10 dark:border-white/10 text-ink rounded text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors",
          children: [
            /* @__PURE__ */ jsx(Settings, { size: 15 }),
            "Settings"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Active Projects",
          value: stats.activeProjects,
          sub: `${stats.totalProjects} total`,
          icon: Building2,
          accent: true
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Total Inquiries",
          value: stats.totalInquiries,
          sub: `${stats.unreadInquiries} unread`,
          icon: MessageSquare
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "This Week",
          value: stats.inquiriesThisWeek,
          sub: "new inquiries",
          icon: MailOpen
        }
      ),
      stats.projectsWithoutImages > 0 ? /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Missing Images",
          value: stats.projectsWithoutImages,
          sub: "active projects",
          icon: AlertTriangle,
          warning: true
        }
      ) : /* @__PURE__ */ jsx(
        StatCard,
        {
          label: "Image Coverage",
          value: stats.activeProjects,
          sub: "all have images",
          icon: Image,
          accent: true
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4", children: [
      /* @__PURE__ */ jsx(SectionCard, { title: "Inquiries — Last 30 Days", className: "lg:col-span-2", children: stats.totalInquiries === 0 ? /* @__PURE__ */ jsx("div", { className: "h-44 flex items-center justify-center text-sm text-ink-muted", children: "No inquiries yet. They'll show up here once the contact form goes live." }) : /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 176, children: /* @__PURE__ */ jsxs(AreaChart, { data: dailyInquiries, margin: { top: 4, right: 4, left: -20, bottom: 0 }, children: [
        /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "inquiryGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ jsx("stop", { offset: "5%", stopColor: "#94C4EE", stopOpacity: 0.4 }),
          /* @__PURE__ */ jsx("stop", { offset: "95%", stopColor: "#94C4EE", stopOpacity: 0 })
        ] }) }),
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(0,0,0,0.06)" }),
        /* @__PURE__ */ jsx(
          XAxis,
          {
            dataKey: "date",
            tickFormatter: formatDateLabel,
            tick: { fontSize: 10, fill: "#9ca3af" },
            tickLine: false,
            axisLine: false,
            interval: 6
          }
        ),
        /* @__PURE__ */ jsx(
          YAxis,
          {
            allowDecimals: false,
            tick: { fontSize: 10, fill: "#9ca3af" },
            tickLine: false,
            axisLine: false
          }
        ),
        /* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(ChartTooltip, {}) }),
        /* @__PURE__ */ jsx(
          Area,
          {
            type: "monotone",
            dataKey: "count",
            stroke: "#94C4EE",
            strokeWidth: 2,
            fill: "url(#inquiryGradient)",
            dot: false,
            activeDot: { r: 4, fill: "#94C4EE" }
          }
        )
      ] }) }) }),
      /* @__PURE__ */ jsx(SectionCard, { title: "By Request Type", children: inquiriesByType.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-muted", children: "No inquiries yet." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: inquiriesByType.map((row) => /* @__PURE__ */ jsx(
        BarRow,
        {
          label: TYPE_LABELS[row.type] ?? row.type,
          count: row.count,
          max: maxInquiryType,
          colorClass: TYPE_COLORS[row.type] ?? "bg-zinc-400"
        },
        row.type
      )) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4", children: [
      /* @__PURE__ */ jsxs(SectionCard, { title: "Projects by Category", children: [
        projectsByCategory.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-muted", children: "No projects yet." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: projectsByCategory.map((row) => /* @__PURE__ */ jsx(
          BarRow,
          {
            label: CATEGORY_LABELS[row.category] ?? row.category,
            count: row.count,
            max: maxCategory,
            colorClass: CATEGORY_COLORS[row.category] ?? "bg-zinc-400"
          },
          row.category
        )) }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 pt-4 border-t border-ink/5 dark:border-white/10", children: /* @__PURE__ */ jsxs(
          Link,
          {
            href: "/admin/projects",
            className: "text-xs text-primary hover:underline flex items-center gap-1",
            children: [
              "Manage projects ",
              /* @__PURE__ */ jsx(ExternalLink, { size: 10 })
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          title: `Content Health${totalHealthIssues > 0 ? ` · ${totalHealthIssues} issue${totalHealthIssues !== 1 ? "s" : ""}` : ""}`,
          className: "lg:col-span-2",
          children: totalHealthIssues === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-emerald-600 dark:text-emerald-400", children: [
            /* @__PURE__ */ jsx("svg", { viewBox: "0 0 20 20", fill: "currentColor", className: "w-5 h-5", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Everything looks good." })
          ] }) : /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-5", children: [
            contentHealth.projectsMissingImages.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-2", children: [
                /* @__PURE__ */ jsx(Image, { size: 13 }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold uppercase tracking-wide", children: "No Gallery Images" })
              ] }),
              /* @__PURE__ */ jsx(
                HealthItem,
                {
                  items: contentHealth.projectsMissingImages,
                  editPath: "/admin/projects/",
                  label: ""
                }
              )
            ] }),
            contentHealth.projectsMissingSeo.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-2", children: [
                /* @__PURE__ */ jsx(Search, { size: 13 }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold uppercase tracking-wide", children: "Missing SEO Title" })
              ] }),
              /* @__PURE__ */ jsx(
                HealthItem,
                {
                  items: contentHealth.projectsMissingSeo,
                  editPath: "/admin/projects/",
                  label: ""
                }
              )
            ] }),
            contentHealth.emptySocialKeys.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-2", children: [
                /* @__PURE__ */ jsx(Share2, { size: 13 }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold uppercase tracking-wide", children: "Social Links Not Set" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: contentHealth.emptySocialKeys.map((key) => /* @__PURE__ */ jsx(
                Link,
                {
                  href: "/admin/settings",
                  className: "text-[11px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-ink-muted hover:text-primary transition-colors",
                  children: SOCIAL_LABELS[key] ?? key
                },
                key
              )) })
            ] }),
            (contentHealth.hiddenPages.length > 0 || contentHealth.hiddenSections.length > 0) && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-2", children: [
                /* @__PURE__ */ jsx(EyeOff, { size: 13 }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold uppercase tracking-wide", children: "Hidden from Site" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
                contentHealth.hiddenPages.map((p) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                  /* @__PURE__ */ jsxs("span", { className: "text-sm text-ink", children: [
                    p.title_en,
                    " ",
                    /* @__PURE__ */ jsx("span", { className: "text-xs text-ink-muted", children: "(page)" })
                  ] }),
                  /* @__PURE__ */ jsxs(Link, { href: "/admin/content", className: "shrink-0 text-[11px] text-primary hover:underline flex items-center gap-0.5", children: [
                    "Fix ",
                    /* @__PURE__ */ jsx(ExternalLink, { size: 10 })
                  ] })
                ] }, p.slug)),
                contentHealth.hiddenSections.map((s) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                  /* @__PURE__ */ jsxs("span", { className: "text-sm text-ink capitalize", children: [
                    s.section.replace(/_/g, " "),
                    " ",
                    /* @__PURE__ */ jsxs("span", { className: "text-xs text-ink-muted", children: [
                      "on ",
                      s.page
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs(Link, { href: "/admin/content", className: "shrink-0 text-[11px] text-primary hover:underline flex items-center gap-0.5", children: [
                    "Fix ",
                    /* @__PURE__ */ jsx(ExternalLink, { size: 10 })
                  ] })
                ] }, `${s.page}-${s.section}`))
              ] })
            ] })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsx(SectionCard, { title: "Recent Inquiries", children: recentInquiries.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-muted", children: "No inquiries yet. They'll appear here once visitors submit the contact form." }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto -mx-5 -mb-5", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-ink/5 dark:border-white/10 text-xs font-medium text-ink-muted", children: [
        /* @__PURE__ */ jsx("th", { className: "text-start px-5 py-2.5 font-medium", children: "Name" }),
        /* @__PURE__ */ jsx("th", { className: "text-start px-3 py-2.5 font-medium", children: "Type" }),
        /* @__PURE__ */ jsx("th", { className: "text-start px-3 py-2.5 font-medium hidden sm:table-cell", children: "Project" }),
        /* @__PURE__ */ jsx("th", { className: "text-start px-3 py-2.5 font-medium hidden md:table-cell", children: "When" }),
        /* @__PURE__ */ jsx("th", { className: "text-end px-5 py-2.5 font-medium", children: "Status" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-ink/5 dark:divide-white/5", children: recentInquiries.map((inq) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors", children: [
        /* @__PURE__ */ jsxs("td", { className: "px-5 py-3", children: [
          /* @__PURE__ */ jsx("div", { className: "font-medium text-ink", children: inq.name }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-ink-muted", children: inq.email })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsx("span", { className: "capitalize text-ink-muted", children: TYPE_LABELS[inq.request_type] ?? inq.request_type }) }),
        /* @__PURE__ */ jsx("td", { className: "px-3 py-3 hidden sm:table-cell text-ink-muted", children: inq.project?.title_en ?? "—" }),
        /* @__PURE__ */ jsx("td", { className: "px-3 py-3 hidden md:table-cell text-ink-muted whitespace-nowrap", children: inq.created_at }),
        /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-end", children: inq.is_read ? /* @__PURE__ */ jsx("span", { className: "text-xs text-ink-muted", children: "Read" }) : /* @__PURE__ */ jsx("span", { className: "inline-block w-2 h-2 rounded-full bg-primary", title: "Unread" }) })
      ] }, inq.id)) })
    ] }) }) })
  ] });
}
export {
  Dashboard as default
};
