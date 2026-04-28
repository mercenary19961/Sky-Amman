import { jsx, jsxs } from "react/jsx-runtime";
import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import { usePage, createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import { renderToString } from "react-dom/server";
import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { X } from "lucide-react";
const en = {
  common: {
    contactUs: "Contact Us",
    learnMore: "Learn More",
    exploreMore: "Explore More",
    viewAll: "View All",
    readMore: "Read More",
    send: "Send",
    submit: "Submit",
    cancel: "Cancel",
    save: "Save",
    loading: "Loading…",
    required: "Required",
    optional: "Optional"
  },
  nav: {
    home: "Home",
    properties: "Properties",
    investment: "Investment",
    selfBuild: "Self Build",
    security: "Security With Sky Amman",
    about: "About Us",
    contact: "Contact Us",
    login: "Admin Login"
  },
  language: {
    toggle: "العربية"
  },
  home: {
    hero: {
      title: "Buy, Rent or Build a Property in Amman",
      subtitle: "With Security, Credibility and Transparency",
      cta: "Explore Projects"
    },
    investmentBanner: {
      tagline: "Buy Early, Save More, Gain More",
      cta: "Investment Opportunities"
    },
    stats: {
      clients: "Clients",
      projects: "Projects Delivered",
      years: "Years Experience",
      sqm: "m² Developed"
    },
    assurance: {
      financial: {
        title: "Financial Assurance",
        bullets: [
          "Contracts are drafted and verified by a dedicated legal department",
          "All payments are officially documented",
          "Full support through the property registration process",
          "Legal verification of land ownership before project initiation"
        ]
      },
      legal: {
        title: "Legal Assurance",
        bullets: [
          "Client payments are protected until ownership registration",
          "Flexible financing solutions through banking partners",
          "Full transparency in pricing and payment schedules",
          "No hidden costs or unexpected obligations"
        ]
      },
      safety: {
        title: "Construction Safety & Quality",
        bullets: [
          "Projects executed under certified engineering supervision",
          "Approved execution partners recognized by official authorities",
          "Strict adherence to technical specifications",
          "Use of trusted and verified suppliers"
        ]
      }
    },
    secureCta: {
      title: "Secure Investment"
    },
    showcase: {
      title: "Project Showcase",
      tabs: {
        underDevelopment: "Projects Under Development",
        ready: "Ready Projects",
        investmentOpportunity: "Investment Opportunities"
      }
    },
    valueProposition: {
      title: "Value Proposition",
      items: [
        { title: "Over 30 Years Of Experience In Real Estate" },
        { title: "Legally, Financially, And Structurally Secured Projects" },
        { title: "Lower Prices With Early Purchase" },
        { title: "Flexible Payment Plans" }
      ]
    },
    mediaRoom: {
      title: "Media Room",
      linkedinHeading: "LinkedIn",
      instagramHeading: "Instagram"
    },
    location: {
      title: "Our Location"
    }
  },
  properties: {
    hero: {
      label: "PROPERTIES",
      title: "Spaces that work for you",
      subtitle: "Browse residential and commercial properties with clarity and ease"
    },
    bottomCta: {
      title: "Find The Right Space, Made Simple",
      subtitle: "Explore residential and commercial properties with clear details and guided support."
    },
    card: {
      forSale: "FOR SALE",
      forRent: "FOR RENT",
      sold: "SOLD",
      reserved: "RESERVED"
    },
    detail: {
      details: "Details",
      livingSpace: "Living Space",
      completionYear: "Completion Year",
      floors: "Floors",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      related: {
        title: "FIND HOMES THAT PERFECTLY MATCH YOUR LIFESTYLE"
      }
    }
  },
  investment: {
    hero: {
      title: "WHY TO INVEST IN AMMAN THROUGH PROPERTIES (BUY/ RENT OR BUILD)?"
    },
    editorial: {
      heading: "Amman Continues To Position Itself As One Of The Most Stable And Promising Real Estate Markets In The Region",
      body: "Its strategic location, political stability, and growing infrastructure make it an attractive destination for both local and international investors."
    },
    cta: {
      heading: "For Investors Seeking A Balanced Market With Steady Appreciation And Controlled Risk, Sky Amman Provides A Reliable Investment Environment.",
      button: "Self Build Service"
    }
  },
  selfBuild: {
    hero: {
      title: "BUILD YOUR PROPERTY, YOUR VISION"
    },
    process: {
      title: "Process Flow",
      steps: [
        "Land Selection",
        "Legal Verification",
        "Engineering Design",
        "Specifications",
        "Execution",
        "Documentation",
        "Handover"
      ]
    }
  },
  security: {
    hero: {
      title: "Security With Sky Amman"
    }
  },
  about: {
    hero: {
      title: "About Us"
    }
  },
  contact: {
    hero: {
      title: "Get in Touch",
      subtitle: "Tell us what you are looking for and we will reach out shortly."
    },
    form: {
      name: "Name",
      email: "Email",
      phone: "Phone",
      requestType: "Request Type",
      subject: "Subject",
      message: "Message",
      requestTypes: {
        buy: "Buy",
        rent: "Rent",
        build: "Build",
        investment: "Investment",
        general: "General Inquiry"
      },
      submit: "Send Message",
      success: "Thank you — we received your message and will get back to you soon."
    }
  },
  footer: {
    tagline: "Real Estate Consultancy",
    sections: {
      mainPages: "Main Pages",
      followUs: "Follow Us",
      contact: "Contact"
    },
    copyright: "All rights reserved."
  }
};
const ar = {
  common: {
    contactUs: "اتصل بنا",
    learnMore: "اعرف المزيد",
    exploreMore: "استكشف المزيد",
    viewAll: "عرض الكل",
    readMore: "اقرأ المزيد",
    send: "إرسال",
    submit: "إرسال",
    cancel: "إلغاء",
    save: "حفظ",
    loading: "جارٍ التحميل…",
    required: "مطلوب",
    optional: "اختياري"
  },
  nav: {
    home: "الرئيسية",
    properties: "العقارات",
    investment: "الاستثمار",
    selfBuild: "البناء الذاتي",
    security: "الأمان مع سكاي عمان",
    about: "من نحن",
    contact: "اتصل بنا",
    login: "تسجيل دخول الإدارة"
  },
  language: {
    toggle: "English"
  },
  home: {
    hero: {
      title: "اشترِ، استأجر أو ابنِ عقاراً في عمّان",
      subtitle: "بأمان ومصداقية وشفافية",
      cta: "استكشف المشاريع"
    },
    investmentBanner: {
      tagline: "اشترِ مبكراً، وفّر أكثر، اربح أكثر",
      cta: "فرص الاستثمار"
    },
    stats: {
      clients: "عميل",
      projects: "مشروع منجز",
      years: "عام من الخبرة",
      sqm: "م² تم تطويرها"
    },
    assurance: {
      financial: {
        title: "الضمان المالي",
        bullets: [
          "تتم صياغة العقود والتحقق منها من قبل دائرة قانونية متخصصة",
          "جميع المدفوعات موثّقة رسمياً",
          "دعم كامل خلال إجراءات تسجيل العقار",
          "التحقق القانوني من ملكية الأرض قبل بدء المشروع"
        ]
      },
      legal: {
        title: "الضمان القانوني",
        bullets: [
          "مدفوعات العميل محمية حتى تسجيل الملكية",
          "حلول تمويل مرنة عبر شركاء مصرفيين",
          "شفافية كاملة في الأسعار وجداول الدفع",
          "لا توجد تكاليف خفية أو التزامات غير متوقعة"
        ]
      },
      safety: {
        title: "سلامة وجودة البناء",
        bullets: [
          "تنفيذ المشاريع تحت إشراف هندسي معتمد",
          "شركاء تنفيذ معتمدون من الجهات الرسمية",
          "الالتزام الصارم بالمواصفات الفنية",
          "استخدام موردين موثوقين ومعتمدين"
        ]
      }
    },
    secureCta: {
      title: "استثمار آمن"
    },
    showcase: {
      title: "معرض المشاريع",
      tabs: {
        underDevelopment: "مشاريع قيد التطوير",
        ready: "مشاريع جاهزة",
        investmentOpportunity: "فرص الاستثمار"
      }
    },
    valueProposition: {
      title: "القيمة المضافة",
      items: [
        { title: "أكثر من 30 عاماً من الخبرة في العقارات" },
        { title: "مشاريع آمنة قانونياً ومالياً وإنشائياً" },
        { title: "أسعار أقل عند الشراء المبكر" },
        { title: "خطط دفع مرنة" }
      ]
    },
    mediaRoom: {
      title: "الغرفة الإعلامية",
      linkedinHeading: "لينكد إن",
      instagramHeading: "إنستغرام"
    },
    location: {
      title: "موقعنا"
    }
  },
  properties: {
    hero: {
      label: "العقارات",
      title: "مساحات تناسبك",
      subtitle: "تصفّح عقارات سكنية وتجارية بوضوح وسهولة"
    },
    bottomCta: {
      title: "ابحث عن المساحة المثالية بسهولة",
      subtitle: "استكشف العقارات السكنية والتجارية بتفاصيل واضحة ودعم متكامل."
    },
    card: {
      forSale: "للبيع",
      forRent: "للإيجار",
      sold: "تم البيع",
      reserved: "محجوز"
    },
    detail: {
      details: "التفاصيل",
      livingSpace: "المساحة",
      completionYear: "سنة الإنجاز",
      floors: "الطوابق",
      bedrooms: "غرف النوم",
      bathrooms: "الحمامات",
      related: {
        title: "اعثر على منازل تناسب أسلوب حياتك"
      }
    }
  },
  investment: {
    hero: {
      title: "لماذا الاستثمار في عمّان عبر العقارات (شراء / إيجار / بناء)؟"
    },
    editorial: {
      heading: "تواصل عمّان ترسيخ موقعها كواحدة من أكثر أسواق العقارات استقراراً وواعدية في المنطقة",
      body: "موقعها الاستراتيجي واستقرارها السياسي وبنيتها التحتية المتنامية تجعلها وجهة جاذبة للمستثمرين المحليين والدوليين على حدٍّ سواء."
    },
    cta: {
      heading: "للمستثمرين الباحثين عن سوق متوازن مع نمو مستقر ومخاطر متحكَّم بها، توفر سكاي عمان بيئة استثمارية موثوقة.",
      button: "خدمة البناء الذاتي"
    }
  },
  selfBuild: {
    hero: {
      title: "ابنِ عقارك، حقّق رؤيتك"
    },
    process: {
      title: "مراحل العمل",
      steps: [
        "اختيار الأرض",
        "التحقق القانوني",
        "التصميم الهندسي",
        "المواصفات",
        "التنفيذ",
        "التوثيق",
        "التسليم"
      ]
    }
  },
  security: {
    hero: {
      title: "الأمان مع سكاي عمان"
    }
  },
  about: {
    hero: {
      title: "من نحن"
    }
  },
  contact: {
    hero: {
      title: "تواصل معنا",
      subtitle: "أخبرنا بما تبحث عنه وسنتواصل معك قريباً."
    },
    form: {
      name: "الاسم",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      requestType: "نوع الطلب",
      subject: "الموضوع",
      message: "الرسالة",
      requestTypes: {
        buy: "شراء",
        rent: "إيجار",
        build: "بناء",
        investment: "استثمار",
        general: "استفسار عام"
      },
      submit: "إرسال الرسالة",
      success: "شكراً لك — تم استلام رسالتك وسنعود إليك قريباً."
    }
  },
  footer: {
    tagline: "استشارات عقارية",
    sections: {
      mainPages: "الصفحات الرئيسية",
      followUs: "تابعنا",
      contact: "التواصل"
    },
    copyright: "جميع الحقوق محفوظة."
  }
};
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar }
  },
  lng: "en",
  fallbackLng: "en",
  supportedLngs: ["en", "ar"],
  interpolation: {
    escapeValue: false
  },
  returnObjects: true
});
async function resolvePageComponent(path, pages) {
  for (const p of Array.isArray(path) ? path : [path]) {
    const page = pages[p];
    if (typeof page === "undefined") {
      continue;
    }
    return typeof page === "function" ? page() : page;
  }
  throw new Error(`Page not found: ${path}`);
}
const LanguageContext = createContext(void 0);
function LanguageProvider({ children }) {
  const { i18n: i18n2 } = useTranslation();
  const serverLocale = usePage().props.locale ?? "en";
  const [language, setLanguageState] = useState(serverLocale);
  const isRTL = language === "ar";
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = isRTL ? "rtl" : "ltr";
      document.documentElement.lang = language;
    }
    i18n2.changeLanguage(language);
  }, [language, isRTL, i18n2]);
  const syncLocale = (lang) => {
    if (typeof document === "undefined") return;
    const xsrf = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1];
    fetch(`/locale/${lang}`, {
      method: "POST",
      headers: {
        "X-XSRF-TOKEN": xsrf ? decodeURIComponent(xsrf) : "",
        Accept: "application/json"
      },
      credentials: "same-origin"
    }).catch(() => {
    });
  };
  const toggleLanguage = () => {
    const next = language === "en" ? "ar" : "en";
    setLanguageState(next);
    syncLocale(next);
  };
  const setLanguage = (lang) => {
    setLanguageState(lang);
    syncLocale(lang);
  };
  return /* @__PURE__ */ jsx(LanguageContext.Provider, { value: { language, isRTL, toggleLanguage, setLanguage }, children });
}
function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (ctx === void 0) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
const ToastContext = createContext(void 0);
const TOAST_DURATION = 4e3;
const typeStyles = {
  success: "bg-emerald-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-sky-600 text-white",
  warning: "bg-amber-500 text-white"
};
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const flash = usePage().props.flash;
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const addToast = useCallback(
    (message, type = "info") => {
      const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => removeToast(id), TOAST_DURATION);
    },
    [removeToast]
  );
  useEffect(() => {
    if (flash?.success) addToast(flash.success, "success");
    if (flash?.error) addToast(flash.error, "error");
    if (flash?.info) addToast(flash.info, "info");
    if (flash?.warning) addToast(flash.warning, "warning");
  }, [flash, addToast]);
  const value = {
    toast: addToast,
    success: (m) => addToast(m, "success"),
    error: (m) => addToast(m, "error"),
    info: (m) => addToast(m, "info"),
    warning: (m) => addToast(m, "warning")
  };
  return /* @__PURE__ */ jsxs(ToastContext.Provider, { value, children: [
    children,
    /* @__PURE__ */ jsx("div", { className: "fixed bottom-4 end-4 z-50 flex flex-col gap-2", children: toasts.map((t) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: `animate-toast-in flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[280px] max-w-[420px] ${typeStyles[t.type]}`,
        children: [
          /* @__PURE__ */ jsx("span", { className: "flex-1 text-sm font-medium", children: t.message }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => removeToast(t.id),
              className: "shrink-0 opacity-80 hover:opacity-100",
              "aria-label": "Dismiss",
              children: /* @__PURE__ */ jsx(X, { size: 16 })
            }
          )
        ]
      },
      t.id
    )) })
  ] });
}
function Providers({ children }) {
  return /* @__PURE__ */ jsx(LanguageProvider, { children: /* @__PURE__ */ jsx(ToastProvider, { children }) });
}
createServer(
  (page) => createInertiaApp({
    page,
    render: renderToString,
    title: (title) => title ? `Sky Amman | ${title}` : "Sky Amman",
    // Same v3 unwrap as app.tsx — resolvePageComponent returns
    // Promise<{ default: Component }>; Inertia wants Promise<Component>.
    resolve: (name) => resolvePageComponent(
      `./Pages/${name}.tsx`,
      /* @__PURE__ */ Object.assign({ "./Pages/Admin/Dashboard.tsx": () => import("./assets/Dashboard-CX6u6iUS.js"), "./Pages/Admin/Login.tsx": () => import("./assets/Login-CmcIwHqM.js"), "./Pages/Admin/Projects/Form.tsx": () => import("./assets/Form-DsnbGxH-.js"), "./Pages/Admin/Projects/Index.tsx": () => import("./assets/Index-CDT3SXJO.js"), "./Pages/Admin/Projects/Trash.tsx": () => import("./assets/Trash-DFjtMqo6.js"), "./Pages/Public/Home.tsx": () => import("./assets/Home-CGTfc6lS.js") })
    ).then((m) => m.default),
    setup: ({ App, props }) => /* @__PURE__ */ jsx(App, { ...props, children: ({ Component, props: pageProps, key }) => /* @__PURE__ */ jsx(Providers, { children: /* @__PURE__ */ jsx(Component, { ...pageProps }, key) }) })
  })
);
export {
  useLanguage as u
};
