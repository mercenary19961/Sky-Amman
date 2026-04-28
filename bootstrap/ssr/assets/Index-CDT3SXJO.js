import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { Plus, Search, Archive, Pencil, Trash2 } from "lucide-react";
import { A as AdminLayout } from "./AdminLayout-zP93-eAg.js";
import { c as cn } from "./cn-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
const CATEGORY_LABELS = {
  under_development: "Under Development",
  ready: "Ready",
  investment_opportunity: "Investment Opportunity"
};
const CATEGORY_COLORS = {
  under_development: "bg-primary/10 text-primary",
  ready: "bg-emerald-100 text-emerald-700",
  investment_opportunity: "bg-amber-100 text-amber-700"
};
const STATUS_LABELS = {
  for_sale: "For Sale",
  for_rent: "For Rent",
  sold: "Sold",
  reserved: "Reserved"
};
const STATUS_COLORS = {
  for_sale: "bg-emerald-100 text-emerald-700",
  for_rent: "bg-primary/10 text-primary",
  sold: "bg-ink/10 text-ink-muted",
  reserved: "bg-orange-100 text-orange-700"
};
function Badge({ label, color }) {
  return /* @__PURE__ */ jsx("span", { className: cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", color), children: label });
}
function ConfirmButton({
  onConfirm,
  children,
  className
}) {
  const [pending, setPending] = useState(false);
  if (pending) {
    return /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-xs", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            setPending(false);
            onConfirm();
          },
          className: "text-red-600 font-medium hover:underline",
          children: "Confirm"
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "text-ink-muted", children: "/" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setPending(false),
          className: "text-ink-muted hover:underline",
          children: "Cancel"
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setPending(true), className, children });
}
function ProjectsIndex() {
  const { projects, filters, trashedCount } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? "");
  function applyFilter(key, value) {
    router.get("/admin/projects", { ...filters, [key]: value || void 0, page: void 0 }, {
      preserveState: true,
      replace: true
    });
  }
  function submitSearch(e) {
    e.preventDefault();
    applyFilter("search", search);
  }
  function deleteProject(id) {
    router.delete(`/admin/projects/${id}`, { preserveScroll: true });
  }
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Projects", children: [
    /* @__PURE__ */ jsx(Head, { title: "Projects" }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3 mb-6", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/admin/projects/create",
          className: "inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary-dark transition-colors",
          children: [
            /* @__PURE__ */ jsx(Plus, { size: 16 }),
            "Add Project"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("form", { onSubmit: submitSearch, className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Search, { size: 14, className: "absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: search,
              onChange: (e) => setSearch(e.target.value),
              placeholder: "Search by title…",
              className: "pl-8 pr-3 py-2 text-sm border border-ink/10 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("button", { type: "submit", className: "px-3 py-2 text-sm bg-white border border-ink/10 rounded hover:bg-surface-muted transition-colors", children: "Search" })
      ] }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          value: filters.category ?? "",
          onChange: (e) => applyFilter("category", e.target.value),
          className: "px-3 py-2 text-sm border border-ink/10 rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary/30",
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "All Categories" }),
            /* @__PURE__ */ jsx("option", { value: "under_development", children: "Under Development" }),
            /* @__PURE__ */ jsx("option", { value: "ready", children: "Ready" }),
            /* @__PURE__ */ jsx("option", { value: "investment_opportunity", children: "Investment Opportunity" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "select",
        {
          value: filters.listing_status ?? "",
          onChange: (e) => applyFilter("listing_status", e.target.value),
          className: "px-3 py-2 text-sm border border-ink/10 rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary/30",
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "All Statuses" }),
            /* @__PURE__ */ jsx("option", { value: "for_sale", children: "For Sale" }),
            /* @__PURE__ */ jsx("option", { value: "for_rent", children: "For Rent" }),
            /* @__PURE__ */ jsx("option", { value: "sold", children: "Sold" }),
            /* @__PURE__ */ jsx("option", { value: "reserved", children: "Reserved" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "select",
        {
          value: filters.active ?? "",
          onChange: (e) => applyFilter("active", e.target.value),
          className: "px-3 py-2 text-sm border border-ink/10 rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary/30",
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Active & Inactive" }),
            /* @__PURE__ */ jsx("option", { value: "1", children: "Active only" }),
            /* @__PURE__ */ jsx("option", { value: "0", children: "Inactive only" })
          ]
        }
      ),
      trashedCount > 0 && /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/admin/projects/trash",
          className: "ms-auto inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors",
          children: [
            /* @__PURE__ */ jsx(Archive, { size: 15 }),
            "Trash (",
            trashedCount,
            ")"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-white border border-ink/5 rounded-lg overflow-hidden", children: projects.data.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "py-16 text-center text-ink-muted text-sm", children: [
      "No projects found.",
      " ",
      /* @__PURE__ */ jsx(Link, { href: "/admin/projects/create", className: "text-primary hover:underline", children: "Add the first one." })
    ] }) : /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-surface-muted border-b border-ink/5", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "text-start px-4 py-3 font-medium text-ink-muted w-12" }),
        /* @__PURE__ */ jsx("th", { className: "text-start px-4 py-3 font-medium text-ink-muted", children: "Title" }),
        /* @__PURE__ */ jsx("th", { className: "text-start px-4 py-3 font-medium text-ink-muted", children: "Category" }),
        /* @__PURE__ */ jsx("th", { className: "text-start px-4 py-3 font-medium text-ink-muted", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "text-center px-4 py-3 font-medium text-ink-muted", children: "Active" }),
        /* @__PURE__ */ jsx("th", { className: "text-center px-4 py-3 font-medium text-ink-muted", children: "Images" }),
        /* @__PURE__ */ jsx("th", { className: "text-center px-4 py-3 font-medium text-ink-muted", children: "Inquiries" }),
        /* @__PURE__ */ jsx("th", { className: "text-end px-4 py-3 font-medium text-ink-muted", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-ink/5", children: projects.data.map((project) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-surface-muted/50 transition-colors", children: [
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: project.featured_image ? /* @__PURE__ */ jsx(
          "img",
          {
            src: project.featured_image.url,
            alt: "",
            className: "w-10 h-10 object-cover rounded"
          }
        ) : /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded bg-surface-muted flex items-center justify-center text-ink-muted", children: /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
          /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
          /* @__PURE__ */ jsx("circle", { cx: "9", cy: "9", r: "2" }),
          /* @__PURE__ */ jsx("path", { d: "m21 15-5-5L5 21" })
        ] }) }) }),
        /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
          /* @__PURE__ */ jsx("div", { className: "font-medium text-ink", children: project.title_en }),
          /* @__PURE__ */ jsx("div", { className: "text-ink-muted text-xs mt-0.5", children: project.title_ar })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(
          Badge,
          {
            label: CATEGORY_LABELS[project.category],
            color: CATEGORY_COLORS[project.category]
          }
        ) }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: project.listing_status ? /* @__PURE__ */ jsx(
          Badge,
          {
            label: STATUS_LABELS[project.listing_status],
            color: STATUS_COLORS[project.listing_status]
          }
        ) : /* @__PURE__ */ jsx("span", { className: "text-ink-muted text-xs", children: "—" }) }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-center", children: /* @__PURE__ */ jsx("span", { className: cn(
          "inline-block w-2 h-2 rounded-full",
          project.is_active ? "bg-emerald-500" : "bg-ink/20"
        ) }) }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-center text-ink-muted", children: project.images_count }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-center text-ink-muted", children: project.inquiries_count }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-3", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              href: `/admin/projects/${project.id}/edit`,
              className: "text-ink-muted hover:text-primary transition-colors",
              title: "Edit",
              children: /* @__PURE__ */ jsx(Pencil, { size: 15 })
            }
          ),
          /* @__PURE__ */ jsx(
            ConfirmButton,
            {
              onConfirm: () => deleteProject(project.id),
              className: "text-ink-muted hover:text-red-500 transition-colors",
              children: /* @__PURE__ */ jsx(Trash2, { size: 15 })
            }
          )
        ] }) })
      ] }, project.id)) })
    ] }) }),
    projects.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between text-sm text-ink-muted", children: [
      /* @__PURE__ */ jsxs("span", { children: [
        "Showing ",
        projects.from,
        "–",
        projects.to,
        " of ",
        projects.total
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: projects.links.map((link, i) => link.url ? /* @__PURE__ */ jsx(
        Link,
        {
          href: link.url,
          dangerouslySetInnerHTML: { __html: link.label },
          className: cn(
            "px-3 py-1.5 rounded border text-xs transition-colors",
            link.active ? "bg-primary text-white border-primary" : "bg-white border-ink/10 hover:bg-surface-muted"
          )
        },
        i
      ) : /* @__PURE__ */ jsx(
        "span",
        {
          dangerouslySetInnerHTML: { __html: link.label },
          className: "px-3 py-1.5 rounded border text-xs bg-white border-ink/10 text-ink/30 cursor-default"
        },
        i
      )) })
    ] })
  ] });
}
export {
  ProjectsIndex as default
};
