import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import EmbeddedMap from "./EmbeddedMap";
import { useState } from "react";

interface ShopContactDetailsProps {
  variant?: "homepage" | "page";
  className?: string;
}

const ShopContactDetails = ({
  variant = "page",
  className = "",
}: ShopContactDetailsProps) => {
  const { t, isRTL } = useLanguage();

  const openMap = () => {
    const address = "46V9+79C, Ben Gardane";
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapUrl, "_blank");
  };

  const openFacebook = () => {
    window.open(
      "https://www.facebook.com/profile.php?id=100063647216088",
      "_blank",
    );
  };

  const openGmail = () => {
    window.open("mailto:Marsabdesslem93@gmail.com", "_blank");
  };

  const openWhatsApp = () => {
    const phoneNumber = "+21623694558";
    const message = encodeURIComponent(
      "Hello! I'm interested in your products.",
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  if (variant === "homepage") {
    // Two locations
    const locations = [
      {
        label: "Mars Shop Main Store",
        src: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3340.7019808000423!2d11.215803174771134!3d33.14319316518443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13ab05006cc96a19%3A0x4ae6d89302a6e6ed!2sBoutique%20mars%20shop!5e0!3m2!1sen!2stn!4v1752267108648!5m2!1sen!2stn"
      },
      {
        label: "Mars Shop Second Location",
        src: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3340.563019019839!2d11.153922!3d33.135722!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDA4JzA4LjYiTiAxMcKwMDknMTQuMSJF!5e0!3m2!1sen!2stn!4v1752267108648!5m2!1sen!2stn"
      }
    ];
    const [selectedLocation, setSelectedLocation] = useState(0);
    return (
      <div className="flex justify-center mt-8 mb-8">
        <Card className="max-w-4xl w-full mx-auto rounded-2xl shadow-2xl border-2 border-amber-500 p-0">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t("contact.visitUs")}
                </h3>
                {/* Location Switch Buttons */}
                <div className="flex justify-center gap-3 mb-3">
                  {locations.map((loc, idx) => (
                    <Button
                      key={loc.label}
                      variant={selectedLocation === idx ? "default" : "outline"}
                      onClick={() => setSelectedLocation(idx)}
                      className="px-4 py-2 text-sm font-medium"
                    >
                      {loc.label}
                    </Button>
                  ))}
                </div>
              </div>
              {/* Embedded Map */}
              <div className="space-y-2">
                <div className="aspect-video rounded-lg overflow-hidden border relative" style={{ minWidth: 400, minHeight: 220 }}>
                  <iframe
                    src={locations[selectedLocation].src}
                    className="absolute top-0 left-0 w-full h-full"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={locations[selectedLocation].label}
                  />
                </div>

                {/* Contact Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant="outline"
                    onClick={openFacebook}
                    className="flex items-center space-x-1 p-2 h-auto justify-start hover:bg-blue-50 border-blue-200"
                  >
                    <svg
                      className="h-4 w-4 text-blue-600"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span className="text-sm">{t("social.facebook")}</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={openGmail}
                    className="flex items-center space-x-1 p-2 h-auto justify-start hover:bg-red-50 border-red-200"
                  >
                    <svg
                      className="h-4 w-4 text-red-600"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.910 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                    </svg>
                    <span className="text-sm">{t("social.email")}</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={openWhatsApp}
                    className="flex items-center space-x-1 p-2 h-auto justify-start hover:bg-green-50 border-green-200"
                  >
                    <svg
                      className="h-4 w-4 text-green-600"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
                    </svg>
                    <span className="text-sm">{t("social.whatsapp")}</span>
                  </Button>

                  <div className="flex items-center space-x-1 p-2 border rounded-lg bg-gray-50">
                    <Phone className="h-4 w-4 text-gray-600 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {t("social.phoneNumbers")}
                      </div>
                      <div className="text-sm text-gray-600">
                        23 694 558 / 99 459 464
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Full page variant
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Address Section with Embedded Map */}
      <EmbeddedMap variant="full" />

      {/* Contact Methods */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <MessageCircle className="h-6 w-6 text-amber-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              {t("contact.getInTouch")}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Social Media */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">
                {t("social.socialMedia")}
              </h4>
              <Button
                variant="outline"
                onClick={openFacebook}
                className="w-full flex items-center space-x-3 p-4 h-auto justify-start hover:bg-blue-50 border-blue-200"
              >
                <svg
                  className="h-6 w-6 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <div className="text-left">
                  <div className="font-medium">{t("social.facebook")}</div>
                  <div className="text-sm text-gray-600">
                    {t("social.followUs")}
                  </div>
                </div>
              </Button>
            </div>

            {/* Direct Contact */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">
                {t("social.directContact")}
              </h4>

              <Button
                variant="outline"
                onClick={openGmail}
                className="w-full flex items-center space-x-3 p-4 h-auto justify-start hover:bg-red-50 border-red-200"
              >
                <svg
                  className="h-6 w-6 text-red-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.910 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                </svg>
                <div className="text-left">
                  <div className="font-medium">{t("social.emailUs")}</div>
                  <div className="text-sm text-gray-600">
                    Marsabdesslem93@gmail.com
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={openWhatsApp}
                className="w-full flex items-center space-x-3 p-4 h-auto justify-start hover:bg-green-50 border-green-200"
              >
                <svg
                  className="h-6 w-6 text-green-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
                </svg>
                <div className="text-left">
                  <div className="font-medium">{t("social.whatsapp")}</div>
                  <div className="text-sm text-gray-600">+216 23 694 558</div>
                </div>
              </Button>

              <div className="flex items-center space-x-3 p-4 border rounded-lg bg-gray-50">
                <Phone className="h-6 w-6 text-gray-600 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">
                    {t("social.phoneNumbers")}
                  </div>
                  <div className="text-gray-600">23 694 558 / 99 459 464</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopContactDetails;
