import { jsx, jsxs } from "react/jsx-runtime";
import { usePage, useForm, Head } from "@inertiajs/react";
import { forwardRef, useRef, useState, useImperativeHandle, useEffect } from "react";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptLoading = null;
function ensureScript() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptLoading) return scriptLoading;
  scriptLoading = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src^="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Turnstile")));
      return;
    }
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Turnstile"));
    document.head.appendChild(s);
  });
  return scriptLoading;
}
const Turnstile = forwardRef(function Turnstile2({ onVerify, onError, onExpire, theme = "light", className }, ref) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const siteKey = usePage().props.turnstileSiteKey;
  const [errored, setErrored] = useState(false);
  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
    }
  }));
  useEffect(() => {
    if (!siteKey || !containerRef.current || errored) return;
    let mounted = true;
    ensureScript().then(() => {
      if (!mounted || !containerRef.current || !window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        callback: onVerify,
        "error-callback": (code) => {
          setErrored(true);
          onError?.(code);
        },
        "expired-callback": () => {
          onExpire?.();
        }
      });
    }).catch((err) => {
      console.warn("Turnstile failed to load", err);
      setErrored(true);
      onError?.("script-load-failed");
    });
    return () => {
      mounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, theme, errored]);
  if (!siteKey) return null;
  return /* @__PURE__ */ jsx("div", { ref: containerRef, className });
});
function Login() {
  const turnstileRef = useRef(null);
  const { data, setData, post, processing, errors, setError, reset } = useForm({
    email: "",
    password: "",
    remember: false,
    "cf-turnstile-response": ""
  });
  const submit = (e) => {
    e.preventDefault();
    post("/admin/login", {
      onError: () => {
        turnstileRef.current?.reset();
        setData("cf-turnstile-response", "");
        reset("password");
      }
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex items-center justify-center bg-surface-muted px-4", dir: "ltr", children: [
    /* @__PURE__ */ jsx(Head, { title: "Admin Login" }),
    /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm bg-white shadow rounded-lg p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-6", children: [
        /* @__PURE__ */ jsx("div", { className: "font-bold text-xl text-primary tracking-wide", children: "SKY AMMAN" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-muted mt-1", children: "Admin sign in" })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1", children: "Email" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "email",
              value: data.email,
              onChange: (e) => setData("email", e.target.value),
              autoComplete: "email",
              className: "w-full px-3 py-2 border border-ink/10 rounded focus:outline-none focus:border-primary",
              required: true
            }
          ),
          errors.email && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-600 mt-1", children: errors.email })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1", children: "Password" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "password",
              value: data.password,
              onChange: (e) => setData("password", e.target.value),
              autoComplete: "current-password",
              className: "w-full px-3 py-2 border border-ink/10 rounded focus:outline-none focus:border-primary",
              required: true
            }
          ),
          errors.password && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-600 mt-1", children: errors.password })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-ink-muted", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: data.remember,
              onChange: (e) => setData("remember", e.target.checked)
            }
          ),
          "Remember me"
        ] }),
        /* @__PURE__ */ jsx(
          Turnstile,
          {
            ref: turnstileRef,
            onVerify: (token) => setData("cf-turnstile-response", token),
            onError: () => setError("cf-turnstile-response", "Bot check failed. Please reload."),
            onExpire: () => setData("cf-turnstile-response", "")
          }
        ),
        errors["cf-turnstile-response"] && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-600", children: errors["cf-turnstile-response"] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: processing,
            className: "w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
            children: processing ? "Signing in…" : "Sign in"
          }
        )
      ] })
    ] })
  ] });
}
export {
  Login as default
};
