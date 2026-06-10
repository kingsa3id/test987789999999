import { createFileRoute } from "@tanstack/react-router";
import { siteConfig, type Lang } from "@/config/site";
import { dict, t } from "@/config/i18n";
import { categories, reviews, type Product } from "@/config/catalog";
import { useI18n } from "@/lib/i18n-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import heroImg from "@/assets/hero-appliances.jpg";
import { getPublicSiteData, type PublicProduct, type PublicSettings } from "@/lib/public.functions";
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Star,
  ShieldCheck,
  Truck,
  Award,
  Headphones,
  Facebook,
  Instagram,
  Menu,
  X,
  Globe,
} from "lucide-react";
import { createContext, useContext, useState } from "react";

/* ---------------- Site context (merged config + DB settings) ---------------- */

type SocialLinks = {
  whatsapp_url: string;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
};
type Site = typeof siteConfig & { socialLinks: SocialLinks };
const SiteContext = createContext<Site>({ ...siteConfig, socialLinks: { whatsapp_url: "", instagram_url: "", facebook_url: "", tiktok_url: "" } });
const useSite = () => useContext(SiteContext);

function mergeSite(settings: PublicSettings | undefined): Site {
  const b = settings?.business ?? {};
  const h = settings?.hero ?? {};
  const s = settings?.social ?? {};
  return {
    business: {
      name: b.name ? { ar: b.name, fr: b.name } : siteConfig.business.name,
      tagline: siteConfig.business.tagline,
      phone: b.phone || siteConfig.business.phone,
      phoneDisplay: b.phone || siteConfig.business.phoneDisplay,
      whatsapp: (b.whatsapp || siteConfig.business.whatsapp).replace(/[^\d]/g, ""),
      email: b.email || siteConfig.business.email,
      address: b.address ? { ar: b.address, fr: b.address } : siteConfig.business.address,
      city: b.city ? { ar: b.city, fr: b.city } : siteConfig.business.city,
      mapsEmbed: b.maps_url || siteConfig.business.mapsEmbed,
      social: siteConfig.business.social,
    },
    hero: {
      title: {
        ar: h.title_ar || siteConfig.hero.title.ar,
        fr: h.title_fr || siteConfig.hero.title.fr,
      },
      subtitle: {
        ar: h.desc_ar || siteConfig.hero.subtitle.ar,
        fr: h.desc_fr || siteConfig.hero.subtitle.fr,
      },
    },
    socialLinks: {
      whatsapp_url: (s.whatsapp_url ?? "").trim(),
      instagram_url: (s.instagram_url ?? "").trim(),
      facebook_url: (s.facebook_url ?? "").trim(),
      tiktok_url: (s.tiktok_url ?? "").trim(),
    },
  } as Site;
}

function mapDbProduct(p: PublicProduct): Product {
  const statusMap: Record<string, Product["status"]> = {
    out_of_stock: "out",
    sale: "sale",
    new: "new",
    coming_soon: null,
    in_stock: null,
  };
  return {
    id: p.id,
    category: p.category as Product["category"],
    name: { ar: p.name_ar, fr: p.name_fr },
    description: { ar: p.description_ar ?? "", fr: p.description_fr ?? "" },
    price: p.price ?? 0,
    status: statusMap[p.status] ?? null,
    featured: p.featured,
    image: p.image_signed_url ?? "📦",
  };
}

/* ---------------- Route ---------------- */

export const Route = createFileRoute("/$lang/")({
  loader: async () => {
    try {
      const data = await getPublicSiteData();
      const products: Product[] = data.products.map(mapDbProduct);
      return { products, settings: data.settings as PublicSettings };
    } catch {
      return { products: [] as Product[], settings: {} as PublicSettings };
    }
  },
  errorComponent: ({ error }) => (
    <div className="container-padded py-20 text-center text-destructive">{error.message}</div>
  ),
  notFoundComponent: () => (
    <div className="container-padded py-20 text-center">Not found.</div>
  ),
  head: ({ params }) => {
    const lang = (params.lang as Lang) ?? "ar";
    const title =
      lang === "ar"
        ? `${siteConfig.business.name.ar} — أجهزة منزلية في الجزائر`
        : `${siteConfig.business.name.fr} — Électroménager en Algérie`;
    const description =
      lang === "ar"
        ? "متجر متخصص في الأجهزة المنزلية والإلكترونية في الجزائر: غسالات، ثلاجات، مكيفات، أفران وأكثر. منتجات أصلية، ضمان رسمي وتوصيل سريع."
        : "Magasin spécialisé en électroménager en Algérie : lave-linge, réfrigérateurs, climatiseurs, fours et plus. Produits originaux, garantie et livraison rapide.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: `/${lang}` },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: lang === "ar" ? "ar_DZ" : "fr_DZ" },
      ],
      links: [
        { rel: "canonical", href: `/${lang}` },
        { rel: "alternate", hrefLang: "ar", href: "/ar" },
        { rel: "alternate", hrefLang: "fr", href: "/fr" },
        { rel: "alternate", hrefLang: "x-default", href: "/ar" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            name: t(siteConfig.business.name, lang),
            address: {
              "@type": "PostalAddress",
              streetAddress: t(siteConfig.business.address, lang),
              addressLocality: t(siteConfig.business.city, lang),
              addressCountry: "DZ",
            },
            telephone: siteConfig.business.phone,
            email: siteConfig.business.email,
          }),
        },
      ],
    };
  },
  component: Home,
});

function Home() {
  const { products, settings } = Route.useLoaderData();
  const site = mergeSite(settings);
  return (
    <SiteContext.Provider value={site}>
      <Header />
      <main>
        <Hero />
        <Categories />
        <FeaturedProducts products={products} />
        <AllProducts products={products} />
        <WhyUs />
        <Reviews />
        <MapSection />
        <Contact />
      </main>
      <Footer />
      <FloatingActions />
    </SiteContext.Provider>
  );
}

/* -------------------- HEADER -------------------- */
function Header() {
  const { lang, setLang } = useI18n();
  const site = useSite();
  const [open, setOpen] = useState(false);
  const nav = [
    { id: "categories", label: dict.nav.categories },
    { id: "products", label: dict.nav.products },
    { id: "why", label: dict.nav.why },
    { id: "reviews", label: dict.nav.reviews },
    { id: "contact", label: dict.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="container-padded flex h-16 items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2 font-bold text-lg">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[image:var(--gradient-hero)] text-primary-foreground shadow-[var(--shadow-card)]">
            E
          </span>
          <span className="hidden sm:inline">{t(site.business.name, lang)}</span>
        </a>
        <nav className="hidden md:flex items-center gap-6">
          {nav.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(n.label, lang)}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "ar" ? "fr" : "ar")}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-secondary"
            aria-label="Switch language"
          >
            <Globe className="h-4 w-4" />
            {lang === "ar" ? "FR" : "ع"}
          </button>
          <a
            href={`tel:${site.business.phone}`}
            className="hidden sm:inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-card)] transition-transform hover:scale-[1.02]"
          >
            <Phone className="h-4 w-4" />
            {t(dict.cta.call, lang)}
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border"
            aria-label="menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container-padded flex flex-col py-3">
            {nav.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                onClick={() => setOpen(false)}
                className="py-2 text-sm font-medium text-foreground"
              >
                {t(n.label, lang)}
              </a>
            ))}
            <a
              href={`tel:${site.business.phone}`}
              className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground"
            >
              <Phone className="h-4 w-4" />
              {t(dict.cta.call, lang)}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

/* -------------------- HERO -------------------- */
function Hero() {
  const { lang } = useI18n();
  const site = useSite();
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt=""
          width={1920}
          height={1080}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[image:var(--gradient-overlay)] rtl:[transform:scaleX(-1)]" />
      </div>
      <div className="container-padded relative grid min-h-[78vh] items-center py-20">
        <div className="max-w-2xl text-primary-foreground fade-in-up">
          <Badge className="mb-5 bg-accent/95 text-accent-foreground hover:bg-accent border-0">
            {t({ ar: "🇩🇿 الجزائر", fr: "🇩🇿 Algérie" }, lang)}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight">
            {t(site.hero.title, lang)}
          </h1>
          <p className="mt-5 text-lg text-primary-foreground/85 max-w-xl">
            {t(site.hero.subtitle, lang)}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-[var(--shadow-glow)]">
              <a href={`tel:${site.business.phone}`}>
                <Phone className="h-5 w-5" />
                {t(dict.cta.call, lang)}
              </a>
            </Button>
            {site.socialLinks.whatsapp_url && (
              <Button asChild size="lg" variant="outline" className="bg-whatsapp text-whatsapp-foreground border-0 hover:bg-whatsapp/90">
                <a href={site.socialLinks.whatsapp_url} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5" />
                  {t(dict.cta.whatsapp, lang)}
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------- CATEGORIES -------------------- */
function Categories() {
  const { lang } = useI18n();
  return (
    <Section id="categories" title={dict.sections.categories.title} subtitle={dict.sections.categories.subtitle}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <a
              key={c.id}
              href="#products"
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-center shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/50"
            >
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <Icon className="h-7 w-7" />
              </div>
              <div className="font-semibold text-foreground">{t(c.name, lang)}</div>
            </a>
          );
        })}
      </div>
    </Section>
  );
}

/* -------------------- PRODUCTS -------------------- */
function ProductCard({ product }: { product: Product }) {
  const { lang } = useI18n();
  const site = useSite();
  const out = product.status === "out";
  const isImageUrl = typeof product.image === "string" && product.image.startsWith("http");
  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border-border p-0 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]">
      <div className="relative aspect-square bg-[image:var(--gradient-hero)] bg-secondary flex items-center justify-center overflow-hidden">
        {isImageUrl ? (
          <img
            src={product.image}
            alt={t(product.name, lang)}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="text-6xl sm:text-7xl transition-transform duration-500 group-hover:scale-110">
            {product.image}
          </div>
        )}
        <div className="absolute top-2 start-2 sm:top-3 sm:start-3 flex flex-col gap-1.5">
          {product.status === "new" && (
            <Badge className="bg-success text-success-foreground border-0 text-[10px] sm:text-xs">{t(dict.badges.new, lang)}</Badge>
          )}
          {product.status === "sale" && (
            <Badge className="bg-destructive text-destructive-foreground border-0 text-[10px] sm:text-xs">{t(dict.badges.sale, lang)}</Badge>
          )}
          {product.status === "out" && (
            <Badge className="bg-muted text-muted-foreground border-0 text-[10px] sm:text-xs">{t(dict.badges.out, lang)}</Badge>
          )}
          {product.featured && (
            <Badge className="bg-accent text-accent-foreground border-0 text-[10px] sm:text-xs">{t(dict.badges.featured, lang)}</Badge>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="font-semibold text-foreground line-clamp-1">{t(product.name, lang)}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2 min-h-10">{t(product.description, lang)}</p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-xl font-bold text-primary">
            {product.price.toLocaleString("fr-FR")} {t(dict.currency, lang)}
          </span>
          {product.oldPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {product.oldPrice.toLocaleString("fr-FR")}
            </span>
          )}
        </div>
        <a
          href={
            out
              ? "#contact"
              : site.socialLinks.whatsapp_url
                ? `${site.socialLinks.whatsapp_url}${site.socialLinks.whatsapp_url.includes("?") ? "&" : "?"}text=${encodeURIComponent(t(product.name, lang))}`
                : "#contact"
          }
          target={out || !site.socialLinks.whatsapp_url ? undefined : "_blank"}
          rel="noopener noreferrer"
          className={`mt-auto inline-flex h-10 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors ${
            out
              ? "bg-muted text-muted-foreground cursor-not-allowed pointer-events-none"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          {t(dict.cta.orderNow, lang)}
        </a>
      </div>
    </Card>
  );
}

function FeaturedProducts({ products }: { products: Product[] }) {
  const featured = products.filter((p) => p.featured).slice(0, 4);
  if (featured.length === 0) return null;
  return (
    <Section id="featured" title={dict.sections.featured.title} subtitle={dict.sections.featured.subtitle} tinted>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 items-stretch">
        {featured.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </Section>
  );
}

function AllProducts({ products }: { products: Product[] }) {
  const { lang } = useI18n();
  return (
    <Section id="products" title={dict.sections.products.title} subtitle={dict.sections.products.subtitle}>
      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 md:p-16 text-center text-muted-foreground">
          <p className="text-lg font-medium">
            {lang === "ar" ? "لا توجد منتجات متاحة حالياً" : "Aucun produit disponible actuellement"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 items-stretch">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </Section>
  );
}

/* -------------------- WHY US -------------------- */
function WhyUs() {
  const { lang } = useI18n();
  const icons = [ShieldCheck, Award, Truck, Headphones];
  return (
    <Section id="why" title={dict.sections.why.title} subtitle={dict.sections.why.subtitle} tinted>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {dict.sections.why.items.map((item, i) => {
          const Icon = icons[i];
          return (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1"
            >
              <div className="mb-4 inline-grid h-12 w-12 place-items-center rounded-xl bg-[image:var(--gradient-hero)] text-primary-foreground">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-foreground">{t(item.title, lang)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t(item.desc, lang)}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* -------------------- REVIEWS -------------------- */
function Reviews() {
  const { lang } = useI18n();
  return (
    <Section id="reviews" title={dict.sections.reviews.title} subtitle={dict.sections.reviews.subtitle}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {reviews.map((r) => (
          <Card key={r.id} className="p-6 border-border shadow-[var(--shadow-card)]">
            <div className="flex gap-1 text-accent mb-3">
              {Array.from({ length: r.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="text-foreground leading-relaxed">"{t(r.text, lang)}"</p>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="font-semibold text-foreground">{r.name}</div>
              <div className="text-sm text-muted-foreground">{t(r.city, lang)}</div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

/* -------------------- MAP -------------------- */
function MapSection() {
  const site = useSite();
  return (
    <Section id="map" title={dict.sections.map.title} subtitle={dict.sections.map.subtitle} tinted>
      <div className="overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-card)] aspect-[16/8]">
        <iframe
          src={site.business.mapsEmbed}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Map"
        />
      </div>
    </Section>
  );
}

/* -------------------- CONTACT -------------------- */
function Contact() {
  const { lang } = useI18n();
  const site = useSite();
  const items = [
    {
      icon: Phone,
      label: dict.sections.contact.phoneLabel,
      value: site.business.phoneDisplay,
      href: `tel:${site.business.phone}`,
    },
    ...(site.socialLinks.whatsapp_url
      ? [{
          icon: MessageCircle,
          label: dict.sections.contact.whatsappLabel,
          value: site.business.phoneDisplay,
          href: site.socialLinks.whatsapp_url,
        }]
      : []),
    {
      icon: Mail,
      label: dict.sections.contact.emailLabel,
      value: site.business.email,
      href: `mailto:${site.business.email}`,
    },
    {
      icon: MapPin,
      label: dict.sections.contact.addressLabel,
      value: t(site.business.address, lang),
      href: "#map",
    },
  ];
  return (
    <Section id="contact" title={dict.sections.contact.title} subtitle={dict.sections.contact.subtitle}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <a
              key={i}
              href={it.href}
              className="group rounded-2xl border border-border bg-card p-6 text-center shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-accent/60"
            >
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <Icon className="h-6 w-6" />
              </div>
              <div className="text-sm text-muted-foreground">{t(it.label, lang)}</div>
              <div className="mt-1 font-semibold text-foreground break-all">{it.value}</div>
            </a>
          );
        })}
      </div>
    </Section>
  );
}

/* -------------------- FOOTER -------------------- */
function Footer() {
  const { lang } = useI18n();
  const site = useSite();
  return (
    <footer className="mt-20 bg-primary text-primary-foreground">
      <div className="container-padded grid grid-cols-1 md:grid-cols-3 gap-10 py-14">
        <div>
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-accent-foreground">E</span>
            {t(site.business.name, lang)}
          </div>
          <p className="mt-3 text-sm text-primary-foreground/80">{t(site.business.tagline, lang)}</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">{t(dict.footer.contactUs, lang)}</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/85">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> {site.business.phoneDisplay}</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> {site.business.email}</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {t(site.business.address, lang)}</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">{t(dict.footer.follow, lang)}</h4>
          <div className="flex gap-3">
            {site.socialLinks.facebook_url && (
              <a href={site.socialLinks.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            )}
            {site.socialLinks.instagram_url && (
              <a href={site.socialLinks.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {site.socialLinks.tiktok_url && (
              <a href={site.socialLinks.tiktok_url} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="grid h-10 w-10 place-items-center rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground transition-colors">
                <TikTokIcon className="h-5 w-5" />
              </a>
            )}
            {site.socialLinks.whatsapp_url && (
              <a href={site.socialLinks.whatsapp_url} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid h-10 w-10 place-items-center rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="container-padded py-5 text-center text-sm text-primary-foreground/70">
          © {new Date().getFullYear()} {t(site.business.name, lang)}. {t(dict.footer.rights, lang)}
        </div>
      </div>
    </footer>
  );
}

/* -------------------- FLOATING ACTIONS -------------------- */
function FloatingActions() {
  const { lang } = useI18n();
  const site = useSite();
  return (
    <div className="fixed bottom-5 end-5 z-50 flex flex-col gap-3">
      {site.socialLinks.whatsapp_url && (
        <a
          href={site.socialLinks.whatsapp_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t(dict.cta.whatsapp, lang)}
          className="grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-[var(--shadow-elegant)] floating transition-transform hover:scale-110"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
      )}
      <a
        href={`tel:${site.business.phone}`}
        aria-label={t(dict.cta.call, lang)}
        className="md:hidden grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-foreground shadow-[var(--shadow-elegant)] transition-transform hover:scale-110"
      >
        <Phone className="h-6 w-6" />
      </a>
    </div>
  );
}

/* TikTok inline icon (lucide has no TikTok glyph) */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.59a8.16 8.16 0 0 0 4.77 1.52V6.67a4.79 4.79 0 0 1-1.84-.02z" />
    </svg>
  );
}

/* -------------------- Section helper -------------------- */
function Section({
  id,
  title,
  subtitle,
  tinted,
  children,
}: {
  id: string;
  title: { ar: string; fr: string };
  subtitle: { ar: string; fr: string };
  tinted?: boolean;
  children: React.ReactNode;
}) {
  const { lang } = useI18n();
  return (
    <section id={id} className={`py-16 md:py-24 ${tinted ? "bg-secondary/50" : ""}`}>
      <div className="container-padded">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t(title, lang)}</h2>
          <p className="mt-3 text-muted-foreground">{t(subtitle, lang)}</p>
        </div>
        {children}
      </div>
    </section>
  );
}
