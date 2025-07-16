import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, LanguageOption, Translations } from "@/types";

const languages: LanguageOption[] = [
  {
    code: "en",
    name: "English",
    flag: "https://flagcdn.com/24x18/us.png",
    rtl: false,
  },
  {
    code: "fr",
    name: "Français",
    flag: "https://flagcdn.com/24x18/fr.png",
    rtl: false,
  },
  {
    code: "ar",
    name: "العربية",
    flag: "https://flagcdn.com/24x18/sa.png",
    rtl: true,
  },
];

const translations: Translations = {
  // Navigation
  "nav.home": { en: "Home", fr: "Accueil", ar: "الرئيسية" },
  "nav.marketplace": { en: "Marketplace", fr: "Marché", ar: "السوق" },
  "nav.about": { en: "About", fr: "À propos", ar: "حول المتجر" },
  "nav.cart": { en: "Cart", fr: "Panier", ar: "السلة" },
  "nav.account": { en: "Account", fr: "Compte", ar: "الحساب" },
  "nav.admin": { en: "Admin", fr: "Admin", ar: "الإدارة" },

  // Home page
  "home.title": { en: "Mars Shop", fr: "Mars Shop", ar: "متجر مارس" },
  "home.subtitle": {
    en: "Your Premier Marketplace",
    fr: "Votre Marché Premier",
    ar: "السوق الرائد",
  },
  "home.selectLanguage": {
    en: "Select Language",
    fr: "Choisir la langue",
    ar: "اختر اللغة",
  },
  "home.continue": {
    en: "Continue to Marketplace",
    fr: "Continuer vers le marché",
    ar: "متابعة إلى السوق",
  },

  // About page
  "about.subtitle": {
    en: "Premium quality products with exceptional service in Ben Gardane",
    fr: "Produits de qualité premium avec un service exceptionnel à Ben Gardane",
    ar: "منتجات عالية الجودة مع خدمة استثنائية في بن قردان",
  },
  "about.ourStory": {
    en: "Our Story",
    fr: "Notre Histoire",
    ar: "قصتنا",
  },
  "about.quality": {
    en: "Quality First",
    fr: "Qualité d'Abord",
    ar: "الجودة أولاً",
  },
  "about.service": {
    en: "Customer Service",
    fr: "Service Client",
    ar: "خدمة العملاء",
  },
  "about.trust": {
    en: "Trust & Reliability",
    fr: "Confiance et Fiabilité",
    ar: "الثقة والموثوقية",
  },
  "about.storeInfo": {
    en: "Store Information",
    fr: "Informations du Magasin",
    ar: "معلومات المتجر",
  },
  "about.contactUs": {
    en: "Contact Us",
    fr: "Contactez-nous",
    ar: "اتصل بنا",
  },

  // Contact
  "contact.visitUs": {
    en: "Visit Us",
    fr: "Visitez-nous",
    ar: "زوروا متجرنا",
  },
  "contact.location": {
    en: "Our Location",
    fr: "Notre Emplacement",
    ar: "موقعنا",
  },
  "contact.getInTouch": {
    en: "Get In Touch",
    fr: "Prenez Contact",
    ar: "تواصل معنا",
  },

  // Common buttons and actions
  "common.save": { en: "Save", fr: "Enregistrer", ar: "حفظ" },
  "common.cancel": { en: "Cancel", fr: "Annuler", ar: "إلغاء" },
  "common.delete": { en: "Delete", fr: "Supprimer", ar: "حذف" },
  "common.edit": { en: "Edit", fr: "Modifier", ar: "تعديل" },
  "common.view": { en: "View", fr: "Voir", ar: "عرض" },
  "common.add": { en: "Add", fr: "Ajouter", ar: "إضافة" },
  "common.remove": { en: "Remove", fr: "Supprimer", ar: "إزالة" },
  "common.close": { en: "Close", fr: "Fermer", ar: "إغلاق" },
  "common.open": { en: "Open", fr: "Ouvrir", ar: "فتح" },
  "common.loading": {
    en: "Loading...",
    fr: "Chargement...",
    ar: "جاري التحميل...",
  },
  "common.search": { en: "Search", fr: "Rechercher", ar: "بحث" },
  "common.filter": { en: "Filter", fr: "Filtrer", ar: "تصفية" },
  "common.clear": { en: "Clear", fr: "Effacer", ar: "مسح" },
  "common.submit": { en: "Submit", fr: "Soumettre", ar: "إرسال" },
  "common.back": { en: "Back", fr: "Retour", ar: "العودة" },
  "common.next": { en: "Next", fr: "Suivant", ar: "التالي" },
  "common.previous": { en: "Previous", fr: "Précédent", ar: "السابق" },
  "common.yes": { en: "Yes", fr: "Oui", ar: "نعم" },
  "common.no": { en: "No", fr: "Non", ar: "لا" },

  // Map and directions
  "map.directions": { en: "Directions", fr: "Itinéraire", ar: "الاتجاهات" },
  "map.viewLarger": {
    en: "View Larger",
    fr: "Voir Plus Grand",
    ar: "عرض أكبر",
  },
  "map.getDirections": {
    en: "Get Directions",
    fr: "Obtenir l'itinéraire",
    ar: "الحصول على الاتجاهات",
  },
  "map.openInGoogleMaps": {
    en: "Open in Google Maps",
    fr: "Ouvrir dans Google Maps",
    ar: "فتح في خرائط جوجل",
  },
  "map.loading": {
    en: "Loading map...",
    fr: "Chargement de la carte...",
    ar: "جاري تحميل الخريطة...",
  },
  "map.storeLocation": {
    en: "Loading store location...",
    fr: "Chargement de l'emplacement du magasin...",
    ar: "جاري تحميل موقع المتجر...",
  },

  // Social media and contact
  "social.facebook": {
    en: "Facebook Page",
    fr: "Page Facebook",
    ar: "صفحة فيسبوك",
  },
  "social.email": { en: "Email", fr: "Email", ar: "البريد الإلكتروني" },
  "social.whatsapp": { en: "WhatsApp", fr: "WhatsApp", ar: "واتساب" },
  "social.followUs": {
    en: "Follow us for updates",
    fr: "Suivez-nous pour les mises à jour",
    ar: "تابعونا للحصول على التحديثات",
  },
  "social.emailUs": {
    en: "Email Us",
    fr: "Envoyez-nous un email",
    ar: "راسلونا",
  },
  "social.directContact": {
    en: "Direct Contact",
    fr: "Contact Direct",
    ar: "اتصال مباشر",
  },
  "social.socialMedia": {
    en: "Social Media",
    fr: "Réseaux Sociaux",
    ar: "وسائل التواصل الاجتماعي",
  },
  "social.phoneNumbers": {
    en: "Phone Numbers",
    fr: "Numéros de téléphone",
    ar: "أرقام الهاتف",
  },

  // Marketplace
  "marketplace.searchPlaceholder": {
    en: "Search products...",
    fr: "Rechercher des produits...",
    ar: "البحث عن المنتجات...",
  },
  "marketplace.allCategories": {
    en: "All Categories",
    fr: "Toutes les catégories",
    ar: "جميع الفئات",
  },
  "marketplace.noProducts": {
    en: "No products found",
    fr: "Aucun produit trouvé",
    ar: "لم يتم العثور على منتجات",
  },
  "marketplace.addToCart": {
    en: "Add to Cart",
    fr: "Ajouter au panier",
    ar: "أضف إلى السلة",
  },
  "marketplace.viewDetails": {
    en: "View Details",
    fr: "Voir les détails",
    ar: "عرض التفاصيل",
  },
  "marketplace.featuredProducts": {
    en: "Featured Products",
    fr: "Produits en vedette",
    ar: "المنتجات المميزة",
  },
  "marketplace.categories": {
    en: "Categories",
    fr: "Catégories",
    ar: "الفئات",
  },
  "marketplace.sortBy": {
    en: "Sort by",
    fr: "Trier par",
    ar: "ترتيب حسب",
  },
  "marketplace.featuredFirst": {
    en: "Featured First",
    fr: "Vedette d'abord",
    ar: "المميز أولاً",
  },
  "marketplace.newest": {
    en: "Newest First",
    fr: "Le plus récent d'abord",
    ar: "الأحدث أولاً",
  },
  "marketplace.priceLowHigh": {
    en: "Price: Low to High",
    fr: "Prix: Bas à Élevé",
    ar: "السعر: من الأقل إلى الأعلى",
  },
  "marketplace.priceHighLow": {
    en: "Price: High to Low",
    fr: "Prix: Élevé à Bas",
    ar: "السعر: من الأعلى إلى الأقل",
  },
  "marketplace.nameAZ": {
    en: "Name A-Z",
    fr: "Nom A-Z",
    ar: "الاسم أ-ي",
  },
  "marketplace.activeFilters": {
    en: "Active filters:",
    fr: "Filtres actifs:",
    ar: "المرشحات النشطة:",
  },
  "marketplace.clearAll": {
    en: "Clear all",
    fr: "Tout effacer",
    ar: "مسح الكل",
  },
  "marketplace.tryAdjusting": {
    en: "Try adjusting your search criteria or browse our categories.",
    fr: "Essayez d'ajuster vos critères de recherche ou parcourez nos catégories.",
    ar: "جرب تعديل معايير البحث أو تصفح فئاتنا.",
  },
  "marketplace.viewAll": {
    en: "View All Products",
    fr: "Voir Tous les Produits",
    ar: "عرض جميع المنتجات",
  },
  "marketplace.shopByCategory": {
    en: "Shop by Category",
    fr: "Acheter par Catégorie",
    ar: "تسوق حسب الفئة",
  },

  // Product details
  "product.price": { en: "Price", fr: "Prix", ar: "السعر" },
  "currency.symbol": { en: "TND", fr: "TND", ar: "د.ت" },
  "product.stock": { en: "In Stock", fr: "En stock", ar: "متوفر" },
  "product.outOfStock": {
    en: "Out of Stock",
    fr: "Rupture de stock",
    ar: "غير متوفر",
  },
  "product.quantity": { en: "Quantity", fr: "Quantité", ar: "الكمية" },
  "product.orderNow": {
    en: "Order Now",
    fr: "Commander maintenant",
    ar: "اطلب الآن",
  },
  "product.description": { en: "Description", fr: "Description", ar: "الوصف" },
  "product.category": { en: "Category", fr: "Catégorie", ar: "الفئة" },
  "product.featured": { en: "Featured", fr: "En vedette", ar: "مميز" },

  // Categories
  "category.electronics": {
    en: "Electronics",
    fr: "Électronique",
    ar: "الإلكترونيات",
  },
  "category.fashion": { en: "Fashion", fr: "Mode", ar: "الأزياء" },
  "category.home": {
    en: "Home & Garden",
    fr: "Maison et Jardin",
    ar: "المنزل والحديقة",
  },
  "category.sports": { en: "Sports", fr: "Sport", ar: "الرياضة" },
  "category.books": { en: "Books", fr: "Livres", ar: "الكتب" },
  "category.beauty": { en: "Beauty", fr: "Beauté", ar: "الجمال" },

  // Order form
  "order.title": {
    en: "Place Your Order",
    fr: "Passer votre commande",
    ar: "اطلب الآن",
  },
  "order.name": { en: "Full Name", fr: "Nom complet", ar: "الاسم الكامل" },
  "order.phone": {
    en: "Phone Number",
    fr: "Numéro de téléphone",
    ar: "رقم الهاتف",
  },
  "order.address": { en: "Address", fr: "Adresse", ar: "العنوان" },
  "order.addToCart": {
    en: "Add to Cart",
    fr: "Ajouter au panier",
    ar: "أضف إلى السلة",
  },
  "order.placeOrder": {
    en: "Place Order",
    fr: "Passer la commande",
    ar: "تأكيد الطلب",
  },
  "order.success": {
    en: "Order received! We will contact you soon.",
    fr: "Commande reçue ! Nous vous contacterons bientôt.",
    ar: "تم استلام الطلب! سنتواصل معك قريباً.",
  },

  // Cart
  "cart.title": { en: "Shopping Cart", fr: "Panier", ar: "سلة التسوق" },
  "cart.empty": {
    en: "Your cart is empty",
    fr: "Votre panier est vide",
    ar: "سلة التسوق فارغة",
  },
  "cart.total": { en: "Total", fr: "Total", ar: "المجموع" },
  "cart.checkout": { en: "Checkout", fr: "Finaliser", ar: "إتمام الشراء" },
  "cart.remove": { en: "Remove", fr: "Supprimer", ar: "حذف" },
  "cart.items": { en: "items", fr: "articles", ar: "عنصر" },
  "cart.item": { en: "item", fr: "article", ar: "عنصر" },
  "cart.continueShopping": {
    en: "Continue Shopping",
    fr: "Continuer les achats",
    ar: "متابعة التسوق",
  },

  // Account
  "account.login": { en: "Login", fr: "Se connecter", ar: "تسجيل الدخول" },
  "account.register": { en: "Register", fr: "S'inscrire", ar: "إنشاء حساب" },
  "account.logout": { en: "Logout", fr: "Se déconnecter", ar: "تسجيل الخروج" },
  "account.profile": { en: "Profile", fr: "Profil", ar: "الملف الشخصي" },
  "account.email": { en: "Email", fr: "Email", ar: "البريد الإلكتروني" },
  "account.save": { en: "Save", fr: "Enregistrer", ar: "حفظ" },
  "account.password": { en: "Password", fr: "Mot de passe", ar: "كلمة المرور" },
  "account.confirmPassword": {
    en: "Confirm Password",
    fr: "Confirmer le mot de passe",
    ar: "تأك��د كلمة المرور",
  },
  "account.forgotPassword": {
    en: "Forgot Password?",
    fr: "Mot de passe oublié ?",
    ar: "نسيت كلمة المرور؟",
  },
  "account.createAccount": {
    en: "Create Account",
    fr: "Créer un compte",
    ar: "إنشاء حساب",
  },
  "account.alreadyHaveAccount": {
    en: "Already have an account?",
    fr: "Vous avez déjà un compte ?",
    ar: "هل لديك حساب؟",
  },
  "account.noAccount": {
    en: "Don't have an account?",
    fr: "Vous n'avez pas de compte ?",
    ar: "ليس لديك حساب؟",
  },

  // Admin
  "admin.dashboard": {
    en: "Dashboard",
    fr: "Tableau de bord",
    ar: "لوحة التحكم",
  },
  "admin.products": { en: "Products", fr: "Produits", ar: "المنتجات" },
  "admin.orders": { en: "Orders", fr: "Commandes", ar: "الطلبات" },
  "admin.users": { en: "Users", fr: "Utilisateurs", ar: "المستخدمون" },
  "admin.userNote": { en: "Note", fr: "Note", ar: "ملاحظة" },
  "admin.userDetails": { en: "User Details", fr: "Détails de l'utilisateur", ar: "تفاصيل المستخدم" },
  "admin.deleteUser": { en: "Delete User", fr: "Supprimer l'utilisateur", ar: "حذف المستخدم" },
  "admin.editNote": { en: "Edit Note", fr: "Modifier la note", ar: "تعديل الملاحظة" },
  "admin.settings": { en: "Settings", fr: "Paramètres", ar: "الإعدادات" },
  "admin.totalRevenue": {
    en: "Total Revenue",
    fr: "Revenus totaux",
    ar: "إجمالي الإيرادات",
  },
  "admin.totalOrders": {
    en: "Total Orders",
    fr: "Commandes totales",
    ar: "إجمالي الطلبات",
  },
  "admin.totalProducts": {
    en: "Total Products",
    fr: "Produits totaux",
    ar: "إجمالي المنتجات",
  },
  "admin.totalUsers": {
    en: "Total Users",
    fr: "Utilisateurs totaux",
    ar: "إجمالي المستخدمين",
  },
  "admin.recentOrders": {
    en: "Recent Orders",
    fr: "Commandes récentes",
    ar: "الطلبات الأخيرة",
  },
  "admin.mostDemanded": {
    en: "Most Demanded Products",
    fr: "Produits les plus demandés",
    ar: "المنتجات الأكثر طلباً",
  },

  // Status
  "status.pending": { en: "Pending", fr: "En attente", ar: "معلق" },
  "status.confirmed": { en: "Confirmed", fr: "Confirmé", ar: "مؤكد" },
  "status.processing": { en: "Processing", fr: "En cours", ar: "قيد المعالجة" },
  "status.shipped": { en: "Shipped", fr: "Expédié", ar: "تم الشحن" },
  "status.delivered": { en: "Delivered", fr: "Livré", ar: "تم الت��ليم" },
  "status.cancelled": { en: "Cancelled", fr: "Annulé", ar: "ملغي" },

  // Time and dates
  "time.today": { en: "Today", fr: "Aujourd'hui", ar: "اليوم" },
  "time.yesterday": { en: "Yesterday", fr: "Hier", ar: "أمس" },
  "time.thisWeek": { en: "This week", fr: "Cette semaine", ar: "هذا الأسبوع" },
  "time.thisMonth": { en: "This month", fr: "Ce mois", ar: "هذا الشهر" },

  // Messages
  "message.welcome": { en: "Welcome!", fr: "Bienvenue !", ar: "مرحباً!" },
  "message.thankyou": { en: "Thank you!", fr: "Merci !", ar: "شكراً لك!" },
  "message.success": { en: "Success!", fr: "Succès !", ar: "نجح!" },
  "message.error": { en: "Error", fr: "Erreur", ar: "خطأ" },
  "message.warning": { en: "Warning", fr: "Attention", ar: "تحذير" },
  "message.info": { en: "Information", fr: "Information", ar: "معلومات" },

  // Footer and general
  "footer.copyright": {
    en: "Mars Shop © 2024 - Premium Marketplace",
    fr: "Mars Shop © 2024 - Marché Premium",
    ar: "متجر مارس © 2024 - السوق المتميز",
  },
  "footer.allRightsReserved": {
    en: "All rights reserved",
    fr: "Tous droits réservés",
    ar: "جميع الحقوق محفوظة",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  languages: LanguageOption[];
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("mars-shop-language");
    return (saved as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("mars-shop-language", language);
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const isRTL = languages.find((l) => l.code === language)?.rtl || false;

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        languages,
        t,
        isRTL,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
