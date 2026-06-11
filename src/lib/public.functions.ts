import { createServerFn } from "@tanstack/react-start";

const SIGNED_URL_TTL = 60 * 60 * 24 * 7; // 7 days

export type PublicProduct = {
  id: string;
  name_ar: string;
  name_fr: string;
  description_ar: string | null;
  description_fr: string | null;
  price: number | null;
  category: string;
  status: string;
  featured: boolean;
  image_url: string | null;
  image_signed_url: string | null;
  sort_order: number;
};

export type PublicSettings = {
  business?: {
    name?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    address?: string;
    city?: string;
    maps_url?: string;
  };
  hero?: { title_ar?: string; title_fr?: string; desc_ar?: string; desc_fr?: string };
  social?: {
    whatsapp_url?: string;
    instagram_url?: string;
    facebook_url?: string;
    tiktok_url?: string;
  };
  branding?: { logo_path?: string | null };
};

export type PublicSiteData = {
  products: PublicProduct[];
  settings: PublicSettings;
  logoUrl: string | null;
};


export const getPublicSiteData = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const [{ data: productRows }, { data: settingRows }] = await Promise.all([
    supabaseAdmin
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabaseAdmin.from("settings").select("*"),
  ]);

  const products: PublicProduct[] = await Promise.all(
    (productRows ?? []).map(async (p) => {
      let signed: string | null = null;
      if (p.image_url && !p.image_url.startsWith("http")) {
        const { data } = await supabaseAdmin.storage
          .from("product-images")
          .createSignedUrl(p.image_url, SIGNED_URL_TTL);
        signed = data?.signedUrl ?? null;
      } else if (p.image_url) {
        signed = p.image_url;
      }
      return { ...p, image_signed_url: signed } as PublicProduct;
    }),
  );

  const settings: PublicSettings = {};
  for (const row of settingRows ?? []) {
    (settings as Record<string, unknown>)[row.key] = row.value as Record<string, string>;
  }

  return { products, settings };
});
