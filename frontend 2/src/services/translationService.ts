import { Language } from "@/types";

// Translation mappings for common product terms
const productTranslations = {
  // Product categories
  electronics: { en: "Electronics", fr: "Électronique", ar: "الإلكترونيات" },
  fashion: { en: "Fashion", fr: "Mode", ar: "الأزياء" },
  home: { en: "Home & Garden", fr: "Maison et Jardin", ar: "المنزل والحديقة" },
  sports: { en: "Sports", fr: "Sport", ar: "الرياضة" },
  books: { en: "Books", fr: "Livres", ar: "الكتب" },
  beauty: { en: "Beauty", fr: "Beauté", ar: "الجمال" },

  // Common product terms
  wireless: { en: "Wireless", fr: "Sans fil", ar: "لاسلكي" },
  bluetooth: { en: "Bluetooth", fr: "Bluetooth", ar: "بلوتوث" },
  headphones: { en: "Headphones", fr: "Écouteurs", ar: "سماعات الرأس" },
  smart: { en: "Smart", fr: "Intelligent", ar: "ذكي" },
  watch: { en: "Watch", fr: "Montre", ar: "ساعة" },
  pro: { en: "Pro", fr: "Pro", ar: "برو" },
  premium: { en: "Premium", fr: "Premium", ar: "بريميوم" },
  cotton: { en: "Cotton", fr: "Coton", ar: "قطن" },
  designer: { en: "Designer", fr: "Designer", ar: "مصمم" },
  sunglasses: {
    en: "Sunglasses",
    fr: "Lunettes de soleil",
    ar: "نظارات شمسية",
  },
  coffee: { en: "Coffee", fr: "Café", ar: "قهوة" },
  maker: { en: "Maker", fr: "Machine", ar: "آلة" },
  deluxe: { en: "Deluxe", fr: "De luxe", ar: "فاخر" },
  yoga: { en: "Yoga", fr: "Yoga", ar: "يوغا" },
  mat: { en: "Mat", fr: "Tapis", ar: "سجادة" },
  programming: { en: "Programming", fr: "Programmation", ar: "البرمجة" },
  guide: { en: "Guide", fr: "Guide", ar: "دليل" },
  book: { en: "Book", fr: "Livre", ar: "كتاب" },
  luxury: { en: "Luxury", fr: "Luxe", ar: "فاخر" },
  face: { en: "Face", fr: "Visage", ar: "وجه" },
  cream: { en: "Cream", fr: "Crème", ar: "كريم" },
  gaming: { en: "Gaming", fr: "Gaming", ar: "ألعاب" },
  laptop: { en: "Laptop", fr: "Ordinateur portable", ar: "حاسوب محمول" },
  charging: { en: "Charging", fr: "Charge", ar: "شحن" },
  pad: { en: "Pad", fr: "Support", ar: "لوحة" },

  // Description terms
  "high-quality": {
    en: "High-quality",
    fr: "Haute qualité",
    ar: "عالي الجودة",
  },
  "noise cancellation": {
    en: "noise cancellation",
    fr: "suppression du bruit",
    ar: "إلغاء الضوضاء",
  },
  "battery life": {
    en: "battery life",
    fr: "autonomie de la batterie",
    ar: "عمر البطارية",
  },
  "perfect for": { en: "Perfect for", fr: "Parfait pour", ar: "مثالي لـ" },
  "music lovers": {
    en: "music lovers",
    fr: "les amateurs de musique",
    ar: "عشاق الموسيقى",
  },
  professionals: { en: "professionals", fr: "professionnels", ar: "المحترفين" },
  "health monitoring": {
    en: "health monitoring",
    fr: "surveillance de la santé",
    ar: "مراقبة الصحة",
  },
  "gps tracking": { en: "GPS tracking", fr: "suivi GPS", ar: "تتبع GPS" },
  "compatible with": {
    en: "compatible with",
    fr: "compatible avec",
    ar: "متوافق مع",
  },
  smartphones: { en: "smartphones", fr: "smartphones", ar: "الهواتف الذكية" },
  comfortable: { en: "Comfortable", fr: "Confortable", ar: "مريح" },
  stylish: { en: "stylish", fr: "élégant", ar: "أنيق" },
  "multiple colors": {
    en: "multiple colors",
    fr: "plusieurs couleurs",
    ar: "ألوان متعددة",
  },
  "organic cotton": {
    en: "organic cotton",
    fr: "coton biologique",
    ar: "قطن عضوي",
  },
  "uv protection": {
    en: "UV protection",
    fr: "protection UV",
    ar: "حماية من الأشعة فوق البنفسجية",
  },
  "polarized lenses": {
    en: "polarized lenses",
    fr: "verres polarisés",
    ar: "عدسات مستقطبة",
  },
  "outdoor activities": {
    en: "outdoor activities",
    fr: "activités de plein air",
    ar: "الأنشطة الخارجية",
  },
  programmable: { en: "Programmable", fr: "Programmable", ar: "قابل للبرمجة" },
  "built-in grinder": {
    en: "built-in grinder",
    fr: "broyeur intégré",
    ar: "مطحنة مدمجة",
  },
  "thermal carafe": {
    en: "thermal carafe",
    fr: "carafe thermique",
    ar: "دورق حراري",
  },
  "perfect coffee": {
    en: "perfect coffee",
    fr: "café parfait",
    ar: "قهوة مثالية",
  },
  "non-slip": { en: "Non-slip", fr: "Antidérapant", ar: "غير قابل للانزلاق" },
  "extra cushioning": {
    en: "extra cushioning",
    fr: "amorti supplémentaire",
    ar: "توسيد إضافي",
  },
  "carrying strap": {
    en: "carrying strap",
    fr: "sangle de transport",
    ar: "حزام حمل",
  },
  "eco-friendly": { en: "Eco-friendly", fr: "Écologique", ar: "صديق للبيئة" },
  durable: { en: "durable", fr: "durable", ar: "متين" },
  comprehensive: { en: "Comprehensive", fr: "Complet", ar: "شامل" },
  "modern programming": {
    en: "modern programming",
    fr: "programmation moderne",
    ar: "البرمجة الحديثة",
  },
  "best practices": {
    en: "best practices",
    fr: "meilleures pratiques",
    ar: "أفضل الممارسات",
  },
  beginners: { en: "beginners", fr: "débutants", ar: "المبتدئين" },
  "anti-aging": { en: "Anti-aging", fr: "Anti-âge", ar: "مضاد للشيخوخة" },
  "natural ingredients": {
    en: "natural ingredients",
    fr: "ingrédients naturels",
    ar: "مكونات طبيعية",
  },
  "spf protection": {
    en: "SPF protection",
    fr: "protection SPF",
    ar: "حماية SPF",
  },
  "all skin types": {
    en: "all skin types",
    fr: "tous types de peau",
    ar: "جميع أنواع البشرة",
  },
  "high-performance": {
    en: "High-performance",
    fr: "Haute performance",
    ar: "عالي الأداء",
  },
  "rtx graphics": {
    en: "RTX graphics",
    fr: "graphiques RTX",
    ar: "رسوميات RTX",
  },
  "professional work": {
    en: "professional work",
    fr: "travail professionnel",
    ar: "العمل المهني",
  },
  "fast wireless": {
    en: "Fast wireless",
    fr: "Sans fil rapide",
    ar: "لاسلكي سريع",
  },
  "qi-enabled": { en: "Qi-enabled", fr: "compatible Qi", ar: "متوافق مع Qi" },
  "sleek design": {
    en: "sleek design",
    fr: "design élégant",
    ar: "تصميم أنيق",
  },
  "led indicators": {
    en: "LED indicators",
    fr: "indicateurs LED",
    ar: "مؤشرات LED",
  },
};

// Product name translations
const productNameTranslations: Record<
  string,
  { en: string; fr: string; ar: string }
> = {
  "Wireless Bluetooth Headphones": {
    en: "Wireless Bluetooth Headphones",
    fr: "Écouteurs Bluetooth Sans Fil",
    ar: "سماعات بلوتوث لاسلكية",
  },
  "Smart Watch Pro": {
    en: "Smart Watch Pro",
    fr: "Montre Intelligente Pro",
    ar: "ساعة ذكية برو",
  },
  "Premium Cotton T-Shirt": {
    en: "Premium Cotton T-Shirt",
    fr: "T-Shirt en Coton Premium",
    ar: "تي شيرت قطني بريميوم",
  },
  "Designer Sunglasses": {
    en: "Designer Sunglasses",
    fr: "Lunettes de Soleil Design",
    ar: "نظارات شمسية مصممة",
  },
  "Coffee Maker Deluxe": {
    en: "Coffee Maker Deluxe",
    fr: "Machine à Café Deluxe",
    ar: "آلة قهوة فاخرة",
  },
  "Yoga Mat Pro": {
    en: "Yoga Mat Pro",
    fr: "Tapis de Yoga Pro",
    ar: "سجادة يوغا برو",
  },
  "Programming Guide Book": {
    en: "Programming Guide Book",
    fr: "Livre Guide de Programmation",
    ar: "كتاب دليل البرمجة",
  },
  "Luxury Face Cream": {
    en: "Luxury Face Cream",
    fr: "Crème de Visage Luxe",
    ar: "كريم وجه فاخر",
  },
  "Gaming Laptop": {
    en: "Gaming Laptop",
    fr: "Ordinateur Portable Gaming",
    ar: "حاسوب محمول للألعاب",
  },
  "Wireless Charging Pad": {
    en: "Wireless Charging Pad",
    fr: "Socle de Charge Sans Fil",
    ar: "لوحة شحن لاسلكية",
  },
};

// Auto-translate function
export const autoTranslateProduct = (
  product: any,
  targetLanguage: Language,
) => {
  if (targetLanguage === "en") return product;

  const translateText = (text: string, targetLang: Language): string => {
    if (!text) return text;

    // Check for exact product name match
    if (productNameTranslations[text]) {
      return productNameTranslations[text][targetLang] || text;
    }

    let translatedText = text;

    // Replace terms in the text
    Object.entries(productTranslations).forEach(([key, translations]) => {
      const regex = new RegExp(`\\b${key}\\b`, "gi");
      if (translations[targetLang]) {
        translatedText = translatedText.replace(
          regex,
          translations[targetLang],
        );
      }
    });

    return translatedText;
  };

  return {
    ...product,
    name: translateText(product.name, targetLanguage),
    description: translateText(product.description, targetLanguage),
  };
};

// Translate category name
export const translateCategory = (
  categoryId: string,
  targetLanguage: Language,
): string => {
  const categoryTranslations: Record<
    string,
    { en: string; fr: string; ar: string }
  > = {
    electronics: { en: "Electronics", fr: "Électronique", ar: "الإلكترونيات" },
    fashion: { en: "Fashion", fr: "Mode", ar: "الأزياء" },
    home: {
      en: "Home & Garden",
      fr: "Maison et Jardin",
      ar: "المنزل والحديقة",
    },
    sports: { en: "Sports", fr: "Sport", ar: "الرياضة" },
    books: { en: "Books", fr: "Livres", ar: "الكتب" },
    beauty: { en: "Beauty", fr: "Beauté", ar: "الجمال" },
  };

  return categoryTranslations[categoryId]?.[targetLanguage] || categoryId;
};

// Marketplace specific translations
export const marketplaceTranslations = {
  "Welcome to Mars Shop": {
    en: "Welcome to Mars Shop",
    fr: "Bienvenue chez Mars Shop",
    ar: "مرحباً بكم في متجر مارس",
  },
  "Discover amazing products from our curated marketplace. Quality guaranteed, fast delivery.":
    {
      en: "Discover amazing products from our curated marketplace. Quality guaranteed, fast delivery.",
      fr: "Découvrez des produits incroyables de notre marché sélectionné. Qualité garantie, livraison rapide.",
      ar: "اكتشف منتجات مذهلة من سوقنا المختار بعناية. جودة مضمونة، توصيل سريع.",
    },
  "Featured Products": {
    en: "Featured Products",
    fr: "Produits en Vedette",
    ar: "المنتجات المميزة",
  },
  Hot: {
    en: "Hot",
    fr: "Chaud",
    ar: "ساخن",
  },
  "Sort by": {
    en: "Sort by",
    fr: "Trier par",
    ar: "ترتيب حسب",
  },
  "Featured First": {
    en: "Featured First",
    fr: "Vedette d'abord",
    ar: "المميز أولاً",
  },
  "Newest First": {
    en: "Newest First",
    fr: "Le plus récent d'abord",
    ar: "الأحدث أولاً",
  },
  "Price: Low to High": {
    en: "Price: Low to High",
    fr: "Prix: Bas à Élevé",
    ar: "السعر: من الأقل إلى الأعلى",
  },
  "Price: High to Low": {
    en: "Price: High to Low",
    fr: "Prix: Élevé à Bas",
    ar: "السعر: من الأعلى إلى الأقل",
  },
  "Name A-Z": {
    en: "Name A-Z",
    fr: "Nom A-Z",
    ar: "الاسم أ-ي",
  },
  "Active filters:": {
    en: "Active filters:",
    fr: "Filtres actifs:",
    ar: "المرشحات النشطة:",
  },
  "Search:": {
    en: "Search:",
    fr: "Recherche:",
    ar: "البحث:",
  },
  "Category:": {
    en: "Category:",
    fr: "Catégorie:",
    ar: "الفئة:",
  },
  "Clear all": {
    en: "Clear all",
    fr: "Tout effacer",
    ar: "مسح الكل",
  },
  "Try adjusting your search criteria or browse our categories.": {
    en: "Try adjusting your search criteria or browse our categories.",
    fr: "Essayez d'ajuster vos critères de recherche ou parcourez nos catégories.",
    ar: "جرب تعديل معايير البحث أو تصفح فئاتنا.",
  },
  "View All Products": {
    en: "View All Products",
    fr: "Voir Tous les Produits",
    ar: "عرض جميع المنتجات",
  },
  "Shop by Category": {
    en: "Shop by Category",
    fr: "Acheter par Catégorie",
    ar: "تسوق حسب الفئة",
  },
};

export const translateMarketplaceText = (
  text: string,
  language: Language,
): string => {
  return (
    marketplaceTranslations[text as keyof typeof marketplaceTranslations]?.[
      language
    ] || text
  );
};
