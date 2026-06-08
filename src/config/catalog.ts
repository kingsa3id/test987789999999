import {
  WashingMachine,
  Refrigerator,
  Snowflake,
  Microwave,
  AirVent,
  Utensils,
  ChefHat,
  Coffee,
  type LucideIcon,
} from "lucide-react";

export type CategoryId =
  | "washing"
  | "fridge"
  | "freezer"
  | "oven"
  | "ac"
  | "dishwasher"
  | "kitchen"
  | "small";

export interface Category {
  id: CategoryId;
  name: { ar: string; fr: string };
  icon: LucideIcon;
}

export const categories: Category[] = [
  { id: "washing", name: { ar: "غسالات", fr: "Machines à laver" }, icon: WashingMachine },
  { id: "fridge", name: { ar: "ثلاجات", fr: "Réfrigérateurs" }, icon: Refrigerator },
  { id: "freezer", name: { ar: "مجمدات", fr: "Congélateurs" }, icon: Snowflake },
  { id: "oven", name: { ar: "أفران", fr: "Fours" }, icon: Microwave },
  { id: "ac", name: { ar: "مكيفات", fr: "Climatiseurs" }, icon: AirVent },
  { id: "dishwasher", name: { ar: "غسالات أطباق", fr: "Lave-vaisselle" }, icon: Utensils },
  { id: "kitchen", name: { ar: "أجهزة المطبخ", fr: "Cuisine" }, icon: ChefHat },
  { id: "small", name: { ar: "أجهزة صغيرة", fr: "Petits appareils" }, icon: Coffee },
];

export type ProductStatus = "new" | "sale" | "out" | null;

export interface Product {
  id: string;
  category: CategoryId;
  name: { ar: string; fr: string };
  description: { ar: string; fr: string };
  price: number;
  oldPrice?: number;
  status: ProductStatus;
  featured: boolean;
  image: string; // emoji or url fallback
}

// Placeholder gradient + emoji thumbnails — Phase 2 swaps for uploaded images.
export const products: Product[] = [
  {
    id: "p1",
    category: "washing",
    name: { ar: "غسالة أوتوماتيكية 9 كغ", fr: "Lave-linge automatique 9 kg" },
    description: {
      ar: "غسالة أمامية بسعة 9 كغ مع 14 برنامج غسيل وتقنية توفير الطاقة.",
      fr: "Lave-linge frontal 9 kg, 14 programmes et technologie éco-énergie.",
    },
    price: 89000,
    oldPrice: 105000,
    status: "sale",
    featured: true,
    image: "🌀",
  },
  {
    id: "p2",
    category: "fridge",
    name: { ar: "ثلاجة بابين No Frost", fr: "Réfrigérateur 2 portes No Frost" },
    description: {
      ar: "ثلاجة 450 لتر بنظام No Frost وموزع للمياه.",
      fr: "Réfrigérateur 450 L No Frost avec distributeur d'eau.",
    },
    price: 145000,
    status: "new",
    featured: true,
    image: "🧊",
  },
  {
    id: "p3",
    category: "ac",
    name: { ar: "مكيف هواء انفرتر 12000 BTU", fr: "Climatiseur Inverter 12000 BTU" },
    description: {
      ar: "مكيف انفرتر موفر للطاقة مع تبريد وتدفئة سريعة.",
      fr: "Climatiseur Inverter, économe en énergie, froid et chaud.",
    },
    price: 78000,
    status: "new",
    featured: true,
    image: "❄️",
  },
  {
    id: "p4",
    category: "oven",
    name: { ar: "فرن كهربائي 65 لتر", fr: "Four électrique 65 L" },
    description: {
      ar: "فرن كهربائي بحجم كبير مع شواية ومروحة دوران للهواء.",
      fr: "Four électrique grande capacité avec grill et chaleur tournante.",
    },
    price: 42000,
    status: null,
    featured: false,
    image: "🔥",
  },
  {
    id: "p5",
    category: "dishwasher",
    name: { ar: "غسالة أطباق 14 طقم", fr: "Lave-vaisselle 14 couverts" },
    description: {
      ar: "غسالة أطباق هادئة بـ 8 برامج غسيل ذكية.",
      fr: "Lave-vaisselle silencieux avec 8 programmes intelligents.",
    },
    price: 95000,
    status: null,
    featured: true,
    image: "🍽️",
  },
  {
    id: "p6",
    category: "freezer",
    name: { ar: "مجمد عمودي 300 لتر", fr: "Congélateur vertical 300 L" },
    description: {
      ar: "مجمد عمودي بـ 7 أدراج وتجميد سريع.",
      fr: "Congélateur vertical 7 tiroirs avec congélation rapide.",
    },
    price: 68000,
    status: "sale",
    oldPrice: 79000,
    featured: false,
    image: "🥶",
  },
  {
    id: "p7",
    category: "kitchen",
    name: { ar: "خلاط متعدد الوظائف", fr: "Robot multifonction" },
    description: {
      ar: "خلاط احترافي 1200 واط مع ملحقات متعددة.",
      fr: "Robot professionnel 1200 W avec accessoires complets.",
    },
    price: 18500,
    status: "new",
    featured: false,
    image: "🍳",
  },
  {
    id: "p8",
    category: "small",
    name: { ar: "ماكينة قهوة إسبريسو", fr: "Machine à café espresso" },
    description: {
      ar: "ماكينة قهوة إيطالية بمضخة 15 بار.",
      fr: "Machine à café italienne, pompe 15 bars.",
    },
    price: 24500,
    status: null,
    featured: true,
    image: "☕",
  },
  {
    id: "p9",
    category: "washing",
    name: { ar: "غسالة علوية 12 كغ", fr: "Lave-linge top 12 kg" },
    description: {
      ar: "غسالة علوية بسعة كبيرة مناسبة للعائلات.",
      fr: "Lave-linge top grande capacité pour familles.",
    },
    price: 72000,
    status: "out",
    featured: false,
    image: "🧺",
  },
];

export const reviews = [
  {
    id: 1,
    name: "Karim B.",
    city: { ar: "الجزائر", fr: "Alger" },
    rating: 5,
    text: {
      ar: "خدمة ممتازة وتوصيل سريع، الثلاجة وصلت في حالة ممتازة. أنصح بشدة!",
      fr: "Service excellent et livraison rapide, le frigo est arrivé en parfait état. Je recommande !",
    },
  },
  {
    id: 2,
    name: "Amina K.",
    city: { ar: "وهران", fr: "Oran" },
    rating: 5,
    text: {
      ar: "أسعار تنافسية ومنتجات أصلية. تجربة شراء رائعة.",
      fr: "Prix compétitifs et produits authentiques. Une superbe expérience.",
    },
  },
  {
    id: 3,
    name: "Yacine M.",
    city: { ar: "قسنطينة", fr: "Constantine" },
    rating: 5,
    text: {
      ar: "فريق دعم محترف ساعدني في اختيار المكيف المناسب لمنزلي.",
      fr: "Une équipe pro qui m'a aidé à choisir le bon climatiseur.",
    },
  },
];
