import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import ShopContactDetails from "@/components/ShopContactDetails";
import EmbeddedMap from "@/components/EmbeddedMap";
import SEO from "@/components/SEO";
import { Store, Heart, Users, Award } from "lucide-react";

const About = () => {
  const { t, isRTL, language } = useLanguage();

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? "font-arabic" : ""}`}>
      <SEO 
        title="About Mars Shop - متجر مارس | Our Story in Ben Gardane, Tunisia"
        description="Learn about Mars Shop's journey in Ben Gardane, Tunisia. We offer premium quality products with exceptional service. Discover our commitment to quality and customer satisfaction."
        keywords="about Mars Shop, متجر مارس, Ben Gardane, Tunisia, our story, premium products, customer service, local business"
        type="website"
      />
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <img
              src="/mars_shop logo.png"
              alt="Mars Shop Logo"
              className="w-12 h-12 drop-shadow-lg"
            />
            <h1 className="text-4xl script-logo text-mars-600">
              {t("home.title")}
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t("about.subtitle")}
          </p>
        </div>

        {/* About Content */}
        <div className="space-y-8 mb-12">
          {/* Our Story */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Store className="h-6 w-6 text-mars-600" />
                <span>{t("about.ourStory")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">
                {language === "ar"
                  ? "مرحباً بكم في متجر مارس، وجهتكم المتميزة للمنتجات عالية الجودة في بن قردان. نحن متحمسون لتوفير أفضل تجربة تسوق لعملائنا، ونقدم مجموعة مختارة بعناية من الإلكترونيات والأزياء والمنتجات المنزلية وأكثر."
                  : "Welcome to Mars Shop, your premier destination for quality products in Ben Gardane. We are passionate about providing our customers with the best shopping experience, offering a carefully curated selection of electronics, fashion, home goods, and more."}
              </p>
              <p className="text-gray-700 leading-relaxed">
                {language === "ar"
                  ? "منذ تأسيسنا، نحن ملتزمون بالتميز في خدمة العملاء وجودة المنتجات. فريقنا يعمل بلا كلل لضمان أن كل منتج يلبي معاييرنا العالية ويتجاوز توقعاتكم."
                  : "Since our establishment, we have been committed to excellence in customer service and product quality. Our team works tirelessly to ensure that every product meets our high standards and exceeds your expectations."}
              </p>
            </CardContent>
          </Card>

          {/* Our Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="h-12 w-12 text-mars-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("about.quality")}
                </h3>
                <p className="text-gray-600 text-sm">
                  {language === "ar"
                    ? "نحن نختار كل منتج بعناية لضمان أعلى معايير الجودة."
                    : "We carefully select every product to ensure the highest quality standards."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-mars-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("about.service")}
                </h3>
                <p className="text-gray-600 text-sm">
                  {language === "ar"
                    ? "عملاؤنا هم محور كل ما نقوم به. رضاكم هو أولويتنا."
                    : "Our customers are at the heart of everything we do. Your satisfaction is our priority."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Award className="h-12 w-12 text-mars-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("about.trust")}
                </h3>
                <p className="text-gray-600 text-sm">
                  {language === "ar"
                    ? "بناء الثقة من خلال الشفافية والموثوقية والتميز المستمر."
                    : "Building trust through transparency, reliability, and consistent excellence."}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Store Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t("about.storeInfo")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {language === "ar" ? "تفاصيل المتجر" : "Store Details"}
                    </h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>
                        <strong>
                          {language === "ar" ? "الموقع:" : "Location:"}
                        </strong>{" "}
                        {language === "ar"
                          ? "بن قردان، تونس"
                          : "Ben Gardane, Tunisia"}
                      </li>
                      <li>
                        <strong>
                          {language === "ar" ? "ال��غات:" : "Languages:"}
                        </strong>{" "}
                        {language === "ar"
                          ? "العربية، الفرنسية، الإنجليزية"
                          : "Arabic, French, English"}
                      </li>
                      <li>
                        <strong>
                          {language === "ar" ? "العملة:" : "Currency:"}
                        </strong>{" "}
                        {language === "ar"
                          ? "الدينار التونسي (د.ت)"
                          : "Tunisian Dinar (TND)"}
                      </li>
                      <li>
                        <strong>
                          {language === "ar" ? "التوصيل:" : "Shipping:"}
                        </strong>{" "}
                        {language === "ar"
                          ? "توصيل محلي متاح"
                          : "Local delivery available"}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {language === "ar"
                        ? "فئات المنتجات"
                        : "Product Categories"}
                    </h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• {t("category.electronics")}</li>
                      <li>• {t("category.fashion")}</li>
                      <li>• {t("category.home")}</li>
                      <li>• {t("category.sports")}</li>
                      <li>• {t("category.books")}</li>
                      <li>• {t("category.beauty")}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t("about.contactUs")}
          </h2>
          <ShopContactDetails variant="page" />
        </div>
      </div>
    </div>
  );
};

export default About;
