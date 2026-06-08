import type { Lang } from "./site";

export const dict = {
  nav: {
    home: { ar: "الرئيسية", fr: "Accueil" },
    categories: { ar: "الفئات", fr: "Catégories" },
    products: { ar: "المنتجات", fr: "Produits" },
    why: { ar: "لماذا نحن", fr: "Pourquoi nous" },
    reviews: { ar: "آراء العملاء", fr: "Avis" },
    contact: { ar: "اتصل بنا", fr: "Contact" },
  },
  cta: {
    call: { ar: "اتصل الآن", fr: "Appeler" },
    whatsapp: { ar: "واتساب", fr: "WhatsApp" },
    viewAll: { ar: "عرض الكل", fr: "Voir tout" },
    orderNow: { ar: "اطلب الآن", fr: "Commander" },
  },
  sections: {
    categories: {
      title: { ar: "تسوّق حسب الفئة", fr: "Achetez par catégorie" },
      subtitle: {
        ar: "اختر من بين تشكيلتنا الواسعة من الأجهزة المنزلية والإلكترونية",
        fr: "Choisissez parmi notre large gamme d'appareils ménagers et électroniques",
      },
    },
    featured: {
      title: { ar: "منتجات مميزة", fr: "Produits en vedette" },
      subtitle: {
        ar: "اختياراتنا الأفضل هذا الأسبوع",
        fr: "Nos meilleures sélections de la semaine",
      },
    },
    products: {
      title: { ar: "كل المنتجات", fr: "Tous nos produits" },
      subtitle: {
        ar: "تصفح كامل التشكيلة المتوفرة",
        fr: "Parcourez l'ensemble du catalogue",
      },
    },
    why: {
      title: { ar: "لماذا تختارنا؟", fr: "Pourquoi nous choisir ?" },
      subtitle: {
        ar: "نلتزم بتقديم أفضل تجربة شراء لأجهزتك المنزلية",
        fr: "Nous nous engageons à offrir la meilleure expérience d'achat",
      },
      items: [
        {
          title: { ar: "منتجات أصلية 100%", fr: "Produits 100% originaux" },
          desc: {
            ar: "نتعامل فقط مع موزعين معتمدين لضمان جودة وأصالة كل قطعة.",
            fr: "Nous travaillons uniquement avec des distributeurs agréés.",
          },
        },
        {
          title: { ar: "ضمان رسمي", fr: "Garantie officielle" },
          desc: {
            ar: "كل منتج يأتي بضمان معتمد من الشركة المصنعة.",
            fr: "Chaque produit est couvert par la garantie constructeur.",
          },
        },
        {
          title: { ar: "توصيل سريع", fr: "Livraison rapide" },
          desc: {
            ar: "نوصل طلبك إلى جميع ولايات الجزائر في أسرع وقت.",
            fr: "Livraison rapide dans toutes les wilayas d'Algérie.",
          },
        },
        {
          title: { ar: "دعم العملاء", fr: "Support client" },
          desc: {
            ar: "فريقنا متاح للإجابة على جميع استفساراتك قبل وبعد الشراء.",
            fr: "Notre équipe est disponible avant et après votre achat.",
          },
        },
      ],
    },
    reviews: {
      title: { ar: "ماذا يقول عملاؤنا", fr: "Ce que disent nos clients" },
      subtitle: { ar: "تجارب حقيقية لعملاء راضين", fr: "Vraies expériences de clients satisfaits" },
    },
    map: {
      title: { ar: "موقعنا", fr: "Notre emplacement" },
      subtitle: { ar: "تفضّل بزيارة متجرنا في الجزائر العاصمة", fr: "Venez nous rendre visite à Alger" },
    },
    contact: {
      title: { ar: "تواصل معنا", fr: "Contactez-nous" },
      subtitle: {
        ar: "نحن هنا لمساعدتك في اختيار الجهاز المناسب",
        fr: "Nous sommes là pour vous aider à choisir l'appareil idéal",
      },
      phoneLabel: { ar: "الهاتف", fr: "Téléphone" },
      whatsappLabel: { ar: "واتساب", fr: "WhatsApp" },
      emailLabel: { ar: "البريد الإلكتروني", fr: "E-mail" },
      addressLabel: { ar: "العنوان", fr: "Adresse" },
    },
  },
  badges: {
    new: { ar: "جديد", fr: "Nouveau" },
    sale: { ar: "تخفيض", fr: "Promo" },
    out: { ar: "غير متوفر", fr: "Rupture" },
    featured: { ar: "مميز", fr: "Vedette" },
  },
  footer: {
    rights: { ar: "جميع الحقوق محفوظة.", fr: "Tous droits réservés." },
    follow: { ar: "تابعنا", fr: "Suivez-nous" },
    quickLinks: { ar: "روابط سريعة", fr: "Liens rapides" },
    contactUs: { ar: "اتصل بنا", fr: "Contact" },
  },
  currency: { ar: "د.ج", fr: "DA" },
} as const;

export function t<T>(value: { ar: T; fr: T }, lang: Lang): T {
  return value[lang];
}
