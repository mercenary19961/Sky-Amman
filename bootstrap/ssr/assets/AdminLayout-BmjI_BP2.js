import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Link, router } from "@inertiajs/react";
import { LayoutDashboard, FileText, Building2, MessageSquare, Settings, Users, History, LogOut } from "lucide-react";
import { c as cn } from "./cn-H80jjgLf.js";
const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", path: "/admin", icon: /* @__PURE__ */ jsx(LayoutDashboard, { size: 18 }), built: true }
    ]
  },
  {
    label: "Content",
    items: [
      { label: "Site Content", path: "/admin/content", icon: /* @__PURE__ */ jsx(FileText, { size: 18 }), built: false }
    ]
  },
  {
    label: "Business",
    items: [
      { label: "Projects", path: "/admin/projects", icon: /* @__PURE__ */ jsx(Building2, { size: 18 }), built: true }
    ]
  },
  {
    label: "Communication",
    items: [
      { label: "Contact Submissions", path: "/admin/contacts", icon: /* @__PURE__ */ jsx(MessageSquare, { size: 18 }), built: false }
    ]
  },
  {
    label: "System",
    items: [
      { label: "Settings", path: "/admin/settings", icon: /* @__PURE__ */ jsx(Settings, { size: 18 }), adminOnly: true, built: false },
      { label: "Users", path: "/admin/users", icon: /* @__PURE__ */ jsx(Users, { size: 18 }), adminOnly: true, built: false },
      { label: "Change Log", path: "/admin/change-log", icon: /* @__PURE__ */ jsx(History, { size: 18 }), adminOnly: true, built: false }
    ]
  }
];
function AdminSidebar() {
  const { auth } = usePage().props;
  const currentUrl = usePage().url;
  const isAdmin = auth.user?.role === "admin";
  return /* @__PURE__ */ jsxs("aside", { className: "w-64 shrink-0 bg-white dark:bg-zinc-800 border-e border-ink/5 dark:border-white/10 flex flex-col", children: [
    /* @__PURE__ */ jsx("div", { className: "h-16 flex items-center px-6 border-b border-ink/5 dark:border-white/10", children: /* @__PURE__ */ jsx("span", { className: "font-bold text-primary tracking-wide", children: "SKY AMMAN" }) }),
    /* @__PURE__ */ jsx("nav", { className: "flex-1 overflow-y-auto px-3 py-4 space-y-6", children: NAV_GROUPS.map((group) => {
      const visible = group.items.filter((i) => !i.adminOnly || isAdmin);
      if (visible.length === 0) return null;
      return /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted", children: group.label }),
        /* @__PURE__ */ jsx("ul", { className: "space-y-1", children: visible.map((item) => {
          if (!item.built) {
            return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-3 px-3 py-2 rounded text-sm text-ink-muted/50 cursor-default select-none", children: [
              /* @__PURE__ */ jsx("span", { className: "opacity-50", children: item.icon }),
              /* @__PURE__ */ jsx("span", { className: "flex-1", children: item.label }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-medium px-1.5 py-0.5 rounded bg-ink/10 dark:bg-white/10 text-ink-muted", children: "Soon" })
            ] }) }, item.path);
          }
          const active = currentUrl === item.path || item.path !== "/admin" && currentUrl.startsWith(item.path);
          return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
            Link,
            {
              href: item.path,
              className: cn(
                "flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors",
                active ? "bg-primary/10 text-primary font-medium" : "text-ink-muted hover:bg-ink/5 dark:hover:bg-white/5 hover:text-ink"
              ),
              children: [
                item.icon,
                /* @__PURE__ */ jsx("span", { children: item.label })
              ]
            }
          ) }, item.path);
        }) })
      ] }, group.label);
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "px-4 py-4 border-t border-ink/5 dark:border-white/10 text-xs text-ink-muted", children: [
      /* @__PURE__ */ jsx("div", { className: "font-medium text-ink truncate", children: auth.user?.name }),
      /* @__PURE__ */ jsx("div", { className: "truncate", children: auth.user?.email })
    ] })
  ] });
}
function AdminLayout({ children, title }) {
  const logout = () => {
    router.post("/admin/logout");
  };
  return /* @__PURE__ */ jsxs("div", { className: "dark min-h-screen flex bg-surface-muted text-ink", dir: "ltr", children: [
    /* @__PURE__ */ jsx(AdminSidebar, {}),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [
      /* @__PURE__ */ jsxs("header", { className: "h-16 bg-white dark:bg-zinc-800 border-b border-ink/5 dark:border-white/10 flex items-center justify-between px-6", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-lg font-semibold", children: title }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: logout,
            className: "flex items-center gap-2 text-sm text-ink-muted hover:text-primary transition-colors",
            children: [
              /* @__PURE__ */ jsx(LogOut, { size: 16 }),
              "Sign out"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("main", { className: "flex-1 overflow-y-auto p-6", children })
    ] })
  ] });
}
export {
  AdminLayout as A
};
