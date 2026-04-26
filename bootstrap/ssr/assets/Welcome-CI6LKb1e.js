import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Head } from "@inertiajs/react";
function Welcome() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Welcome" }),
    /* @__PURE__ */ jsx("main", { className: "min-h-screen flex items-center justify-center bg-white text-gray-900", children: /* @__PURE__ */ jsxs("div", { className: "text-center px-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-4xl font-semibold mb-3", children: "Sky Amman" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Foundation scaffolded. Pages coming soon." })
    ] }) })
  ] });
}
export {
  Welcome as default
};
