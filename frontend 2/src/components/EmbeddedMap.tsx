import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink, Navigation } from "lucide-react";

interface EmbeddedMapProps {
  variant?: "compact" | "full";
  className?: string;
}

const EmbeddedMap = ({
  variant = "full",
  className = "",
}: EmbeddedMapProps) => {
  const { t } = useLanguage();
  const [isLoaded, setIsLoaded] = useState(false);

  // Store location details
  const storeAddress = "46V9+79C, Ben Gardane";
  const storeCoordinates = "33.1363, 11.2186"; // Approximate coordinates for Ben Gardane

  // Google Maps embed URL with your store location
  const embedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3274.123456789!2d11.2186!3d33.1363!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDA4JzEwLjciTiAxMcKwMTMnMDYuOSJF!5e0!3m2!1sen!2stn!4v1645123456789!5m2!1sen!2stn&q=${encodeURIComponent(storeAddress)}`;

  // Alternative: OpenStreetMap embed URL
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=11.210,33.130,11.227,33.143&layer=mapnik&marker=${storeCoordinates}`;

  const openInGoogleMaps = () => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeAddress)}`;
    window.open(mapsUrl, "_blank");
  };

  const openDirections = () => {
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(storeAddress)}`;
    window.open(directionsUrl, "_blank");
  };

  // Remove the LogoMarker component and all its usages

  if (variant === "compact") {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <CardContent className="p-0">
          <div className="relative">
            {/* Map Container */}
            <div className="relative w-full h-48 bg-gray-100">
              <iframe
                src={embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={() => setIsLoaded(true)}
                className="transition-opacity duration-300"
                title="Mars Shop Location"
              />
              {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="flex flex-col items-center space-y-2">
                    <MapPin className="h-8 w-8 text-gray-400 animate-pulse" />
                    <p className="text-sm text-gray-500">{t("map.loading")}</p>
                  </div>
                </div>
              )}
              {/* Custom Logo Marker */}
            </div>

            {/* Store Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <div className="text-white">
                <div className="flex items-center space-x-2 mb-1">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium text-sm">Mars Shop</span>
                </div>
                <p className="text-xs opacity-90">{storeAddress}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-3 bg-gray-50">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openDirections}
                className="flex-1 text-xs"
              >
                <Navigation className="h-3 w-3 mr-1" />
                {t("map.directions")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openInGoogleMaps}
                className="flex-1 text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                {t("map.viewLarger")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full version for About page
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-mars-600" />
          <span>{t("contact.location")}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Store Details */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900">{t("home.title")}</h4>
          <p className="text-gray-700">{storeAddress}</p>
          <p className="text-sm text-gray-600">بن قردان، تونس</p>
        </div>

        {/* Embedded Map */}
        <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setIsLoaded(true)}
            className="transition-opacity duration-300"
            title="Mars Shop Location - Ben Gardane"
          />
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-3">
                <MapPin className="h-12 w-12 text-gray-400 animate-pulse" />
                <p className="text-gray-500">{t("map.storeLocation")}</p>
              </div>
            </div>
          )}
          {/* Custom Logo Marker */}
        </div>

        {/* Map Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={openDirections}
            className="flex-1 bg-mars-600 hover:bg-mars-700"
          >
            <Navigation className="h-4 w-4 mr-2" />
            {t("map.getDirections")}
          </Button>
          <Button
            variant="outline"
            onClick={openInGoogleMaps}
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {t("map.openInGoogleMaps")}
          </Button>
        </div>

        {/* Additional Store Info */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900">
                {t("language") === "ar" ? "المنطقة:" : "Region:"}
              </span>
              <span
                className={`ml-2 text-gray-600 ${t("language") === "ar" ? "mr-2" : ""}`}
              >
                {t("language") === "ar"
                  ? "ولاية مدنين"
                  : "Médenine Governorate"}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900">
                {t("language") === "ar" ? "البلد:" : "Country:"}
              </span>
              <span
                className={`ml-2 text-gray-600 ${t("language") === "ar" ? "mr-2" : ""}`}
              >
                {t("language") === "ar" ? "تونس" : "Tunisia"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmbeddedMap;
