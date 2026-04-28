import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-DnPfbuel.js";
import "lucide-react";
import "./cn-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
function Dashboard() {
  const { auth } = usePage().props;
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Dashboard", children: [
    /* @__PURE__ */ jsx(Head, { title: "Dashboard" }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg p-6", children: [
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
