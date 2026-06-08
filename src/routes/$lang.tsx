import { createFileRoute, Outlet, notFound } from "@tanstack/react-router";
import { I18nProvider } from "@/lib/i18n-context";
import { LANGS, type Lang } from "@/config/site";

export const Route = createFileRoute("/$lang")({
  beforeLoad: ({ params }) => {
    if (!(LANGS as readonly string[]).includes(params.lang)) {
      throw notFound();
    }
  },
  component: LangLayout,
});

function LangLayout() {
  const { lang } = Route.useParams();
  const dir = lang === "ar" ? "rtl" : "ltr";
  return (
    <I18nProvider lang={lang as Lang}>
      <div dir={dir} lang={lang} className="min-h-screen bg-background text-foreground">
        <Outlet />
      </div>
    </I18nProvider>
  );
}
