import { createFileRoute, redirect } from "@tanstack/react-router";
import { detectPreferredLang } from "@/lib/i18n-context";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    // Server prerender: send to default. Client: detect from storage/navigator.
    if (typeof window === "undefined") {
      throw redirect({ to: "/$lang", params: { lang: "ar" } });
    }
    const lang = detectPreferredLang();
    throw redirect({ to: "/$lang", params: { lang } });
  },
});
