import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Link, router, Head } from "@inertiajs/react";
import { LayoutDashboard, FileText, Image, Building2, MessageSquare, Settings, Users, History, LogOut } from "lucide-react";
import { c as cn } from "./cn-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", path: "/admin", icon: /* @__PURE__ */ jsx(LayoutDashboard, { size: 18 }) }]
  },
  {
    label: "Content",
    items: [
      { label: "Site Content", path: "/admin/content", icon: /* @__PURE__ */ jsx(FileText, { size: 18 }) },
      { label: "Media Library", path: "/admin/media", icon: /* @__PURE__ */ jsx(Image, { size: 18 }) }
    ]
  },
  {
    label: "Business",
    items: [{ label: "Projects", path: "/admin/projects", icon: /* @__PURE__ */ jsx(Building2, { size: 18 }) }]
  },
  {
    label: "Communication",
    items: [
      { label: "Contact Submissions", path: "/admin/contacts", icon: /* @__PURE__ */ jsx(MessageSquare, { size: 18 }) }
    ]
  },
  {
    label: "System",
    items: [
      { label: "Settings", path: "/admin/settings", icon: /* @__PURE__ */ jsx(Settings, { size: 18 }), adminOnly: true },
      { label: "Users", path: "/admin/users", icon: /* @__PURE__ */ jsx(Users, { size: 18 }), adminOnly: true },
      { label: "Change Log", path: "/admin/change-log", icon: /* @__PURE__ */ jsx(History, { size: 18 }), adminOnly: true }
    ]
  }
];
function AdminSidebar() {
  const { auth, url } = usePage().props;
  const currentUrl = usePage().url;
  const isAdmin = auth.user?.role === "admin";
  return /* @__PURE__ */ jsxs("aside", { className: "w-64 shrink-0 bg-white border-e border-ink/5 flex flex-col", children: [
    /* @__PURE__ */ jsx("div", { className: "h-16 flex items-center px-6 border-b border-ink/5", children: /* @__PURE__ */ jsx("span", { className: "font-bold text-primary tracking-wide", children: "SKY AMMAN" }) }),
    /* @__PURE__ */ jsx("nav", { className: "flex-1 overflow-y-auto px-3 py-4 space-y-6", children: NAV_GROUPS.map((group) => {
      const visible = group.items.filter((i) => !i.adminOnly || isAdmin);
      if (visible.length === 0) return null;
      return /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted", children: group.label }),
        /* @__PURE__ */ jsx("ul", { className: "space-y-1", children: visible.map((item) => {
          const active = currentUrl === item.path || item.path !== "/admin" && currentUrl.startsWith(item.path);
          return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
            Link,
            {
              href: item.path,
              className: cn(
                "flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors",
                active ? "bg-primary/10 text-primary font-medium" : "text-ink-muted hover:bg-ink/5 hover:text-ink"
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
    /* @__PURE__ */ jsxs("div", { className: "px-4 py-4 border-t border-ink/5 text-xs text-ink-muted", children: [
      /* @__PURE__ */ jsx("div", { className: "font-medium text-ink truncate", children: auth.user?.name }),
      /* @__PURE__ */ jsx("div", { className: "truncate", children: auth.user?.email })
    ] })
  ] });
}
function AdminLayout({ children, title }) {
  const logout = () => {
    router.post("/admin/logout");
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex bg-surface-muted text-ink", dir: "ltr", children: [
    /* @__PURE__ */ jsx(AdminSidebar, {}),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [
      /* @__PURE__ */ jsxs("header", { className: "h-16 bg-white border-b border-ink/5 flex items-center justify-between px-6", children: [
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
function Dashboard() {
  const { auth } = usePage().props;
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Dashboard", children: [
    /* @__PURE__ */ jsx(Head, { title: "Dashboard" }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white border border-ink/5 rounded-lg p-6", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-xl font-semibold mb-2", children: [
        "Welcome, ",
        auth.user?.name,
        "."
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-ink-muted", children: "The admin panel will gain its content sections in upcoming work. For now, the foundation is in place: auth, locale, settings, site content, projects, and contact submissions are wired up." })
    ] })
  ] });
}
export {
  Dashboard as default
};
