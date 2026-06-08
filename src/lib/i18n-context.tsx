import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useNavigate, useParams, useRouterState } from "@tanstack/react-router";
import { DEFAULT_LANG, LANGS, type Lang } from "@/config/site";

interface I18nCtx {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children, lang }: { children: ReactNode; lang: Lang }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    try {
      localStorage.setItem("preferred-lang", lang);
    } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = dir;
    }
  }, [lang, dir]);

  const setLang = (l: Lang) => {
    const next = pathname.replace(/^\/(ar|fr)/, `/${l}`);
    navigate({ to: next || `/${l}` });
  };

  return <Ctx.Provider value={{ lang, dir, setLang }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export function detectPreferredLang(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  try {
    const stored = localStorage.getItem("preferred-lang");
    if (stored && (LANGS as string[]).includes(stored)) return stored as Lang;
  } catch {}
  const nav = navigator.language?.toLowerCase() ?? "";
  if (nav.startsWith("fr")) return "fr";
  if (nav.startsWith("ar")) return "ar";
  return DEFAULT_LANG;
}
