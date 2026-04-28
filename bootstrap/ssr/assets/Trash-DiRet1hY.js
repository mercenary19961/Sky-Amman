import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { ArrowLeft, RotateCcw, Trash2 } from "lucide-react";
import { A as AdminLayout } from "./AdminLayout-BmjI_BP2.js";
import { c as cn } from "./cn-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
const CATEGORY_LABELS = {
  under_development: "Under Development",
  ready: "Ready",
  investment_opportunity: "Investment Opportunity"
};
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
function ProjectsTrash() {
  const { projects } = usePage().props;
  function restore(id) {
    router.post(`/admin/projects/${id}/restore`, {}, { preserveScroll: true });
  }
  function forceDelete(id) {
    router.delete(`/admin/projects/${id}/force`, { preserveScroll: true });
  }
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Trash — Projects", children: [
    /* @__PURE__ */ jsx(Head, { title: "Projects Trash" }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/admin/projects",
          className: "inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { size: 15 }),
            "Back to Projects"
          ]
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "text-ink/20", children: "|" }),
      /* @__PURE__ */ jsxs("span", { className: "text-sm text-ink-muted", children: [
        projects.total,
        " trashed project",
        projects.total !== 1 ? "s" : ""
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg overflow-hidden", children: projects.data.length === 0 ? /* @__PURE__ */ jsx("div", { className: "py-16 text-center text-ink-muted text-sm", children: "Trash is empty." }) : /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-surface-muted border-b border-ink/5", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "text-start px-4 py-3 font-medium text-ink-muted", children: "Title" }),
        /* @__PURE__ */ jsx("th", { className: "text-start px-4 py-3 font-medium text-ink-muted", children: "Category" }),
        /* @__PURE__ */ jsx("th", { className: "text-start px-4 py-3 font-medium text-ink-muted", children: "Deleted" }),
        /* @__PURE__ */ jsx("th", { className: "text-end px-4 py-3 font-medium text-ink-muted", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-ink/5", children: projects.data.map((project) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-surface-muted/50 transition-colors", children: [
        /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
          /* @__PURE__ */ jsx("div", { className: "font-medium text-ink", children: project.title_en }),
          /* @__PURE__ */ jsx("div", { className: "text-ink-muted text-xs mt-0.5", children: project.title_ar })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("span", { className: "text-xs text-ink-muted", children: CATEGORY_LABELS[project.category] }) }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-xs text-ink-muted", children: new Date(project.updated_at).toLocaleDateString() }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-3", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => restore(project.id),
              className: "inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 transition-colors",
              title: "Restore",
              children: [
                /* @__PURE__ */ jsx(RotateCcw, { size: 14 }),
                "Restore"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            ConfirmButton,
            {
              onConfirm: () => forceDelete(project.id),
              className: cn(
                "inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-red-500 transition-colors"
              ),
              children: [
                /* @__PURE__ */ jsx(Trash2, { size: 14 }),
                "Delete forever"
              ]
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
            link.active ? "bg-primary text-white border-primary" : "bg-white dark:bg-zinc-800 border-ink/10 dark:border-white/10 hover:bg-surface-muted"
          )
        },
        i
      ) : /* @__PURE__ */ jsx(
        "span",
        {
          dangerouslySetInnerHTML: { __html: link.label },
          className: "px-3 py-1.5 rounded border text-xs bg-white dark:bg-zinc-800 border-ink/10 dark:border-white/10 text-ink/30 cursor-default"
        },
        i
      )) })
    ] })
  ] });
}
export {
  ProjectsTrash as default
};
