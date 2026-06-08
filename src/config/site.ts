// Centralized business + UI content. Phase 2 will move this to the database
// so the admin dashboard can edit every field. Keep field names stable.

export type Lang = "ar" | "fr";
export const LANGS: Lang[] = ["ar", "fr"];
export const DEFAULT_LANG: Lang = "ar";

export const siteConfig = {
  business: {
    name: { ar: "إلكترو هوم الجزائر", fr: "Electro Home Algérie" },
    tagline: {
      ar: "متجرك الأول للأجهزة المنزلية في الجزائر",
      fr: "Votre magasin de référence pour l'électroménager en Algérie",
    },
    phone: "+213555000000",
    phoneDisplay: "+213 555 00 00 00",
    whatsapp: "213555000000",
    email: "contact@example.com",
    address: {
      ar: "شارع الرئيسي 123، الجزائر العاصمة",
      fr: "123 Rue Principale, Alger",
    },
    city: { ar: "الجزائر العاصمة", fr: "Alger" },
    mapsEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d51221.51395796706!2d3.0080699999999998!3d36.7538!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128fb26977ea659f%3A0x128fb269a48f5b9b!2sAlger!5e0!3m2!1sfr!2sdz!4v1700000000000",
    social: {
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
      tiktok: "https://tiktok.com",
    },
  },
  hero: {
    title: {
      ar: "أجهزة منزلية فاخرة لراحة عائلتك",
      fr: "Des appareils premium pour votre famille",
    },
    subtitle: {
      ar: "نقدم لكم تشكيلة واسعة من الأجهزة المنزلية الأصلية بضمان رسمي وتوصيل سريع لجميع ولايات الجزائر.",
      fr: "Une large gamme d'appareils originaux avec garantie officielle et livraison rapide partout en Algérie.",
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;
