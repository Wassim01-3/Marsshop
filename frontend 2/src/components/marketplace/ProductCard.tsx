import { useState, useEffect } from "react";
import { Product, Category } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/hooks/use-currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Eye } from "lucide-react";
import { ProductDetailModal } from "./ProductDetailModal";
import { autoTranslateProduct } from "@/services/translationService";

interface ProductCardProps {
  product: Product;
  categories: Category[];
}

export const ProductCard = ({ product, categories }: ProductCardProps) => {
  const { t, language } = useLanguage();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const [showModal, setShowModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [pendingAddToCart, setPendingAddToCart] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Auto-scroll through product images
  useEffect(() => {
    if (!Array.isArray(product.images) || product.images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [product.images]);

  // Get current image or fallback
  const getCurrentImage = () => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images[currentImageIndex];
    }
    return '/placeholder.svg';
  };

  const hasColors = Array.isArray(product.colors) && product.colors.length > 0;
  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;

  const canAddToCart = (!hasColors || !!selectedColor) && (!hasSizes || !!selectedSize);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canAddToCart) {
      setPendingAddToCart(true);
      return;
    }
    let colorArg, colorNameArg;
    if (selectedColor && Array.isArray(selectedColor)) {
      colorArg = selectedColor.map(name => {
        const colorObj = product.colors?.find(c => c.name === name);
        return colorObj ? colorObj.value : name;
      });
      colorNameArg = selectedColor;
    } else if (selectedColor) {
      const colorObj = product.colors?.find(c => c.name === selectedColor);
      colorArg = colorObj ? colorObj.value : selectedColor;
      colorNameArg = colorObj ? colorObj.name : selectedColor;
    } else {
      colorArg = undefined;
      colorNameArg = undefined;
    }
    addItem(
      product,
      1,
      colorArg,
      selectedSize || undefined,
      colorNameArg
    );
    setSelectedColor(null);
    setSelectedSize(null);
    setPendingAddToCart(false);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };

  // Use translation context for UI text
  const getFeaturedText = () => {
    switch (language) {
      case "ar":
        return "مميز";
      case "fr":
        return "Vedette";
      default:
        return "Featured";
    }
  };

  const getStockText = () => {
    switch (language) {
      case "ar":
        return "متوفر";
      case "fr":
        return "en stock";
      default:
        return "in stock";
    }
  };

  // Price formatting for marketplace: always 3 decimals for decimals, comma separator
  const formatMarketplacePrice = (price: number | undefined | null) => {
    if (typeof price !== "number" || isNaN(price)) return "";
    if (Number.isInteger(price)) return price.toString() + " TND";
    return price.toLocaleString("fr-FR", { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + " TND";
  };

  function getColorCircleStyle(val: string | string[]) {
    if (Array.isArray(val)) {
      const stops = val.map((color, i) => {
        const start = Math.round((i / val.length) * 100);
        const end = Math.round(((i + 1) / val.length) * 100);
        return `${color} ${start}%, ${color} ${end}%`;
      });
      return { background: `linear-gradient(90deg, ${stops.join(", ")})` };
    }
    if (typeof val === 'string') {
      return { backgroundColor: val };
    }
    return {};
  }

  // Translate product fields based on current language
  const translatedProduct = autoTranslateProduct(product, language);

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden p-0">
        <div className="relative w-full aspect-[4/3]">
          <img
            src={getCurrentImage()}
            alt={translatedProduct.name}
            className="absolute top-0 left-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            onClick={handleViewDetails}
          />
          {translatedProduct.featured && (
            <Badge className="absolute top-2 left-2 bg-amber-500">
              {getFeaturedText()}
            </Badge>
          )}
          {translatedProduct.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Badge variant="secondary" className="bg-gray-800 text-white">
                {t("product.outOfStock")}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
            {translatedProduct.name}
          </h3>
          <div className="text-gray-600 text-sm mb-3 line-clamp-2" style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            <div dangerouslySetInnerHTML={{ __html: translatedProduct.description }} />
          </div>
          {/* Color swatches */}
          {translatedProduct.colors && translatedProduct.colors.length > 0 && (
            <div className="flex items-center mb-2">
              {translatedProduct.colors.map((color) => (
                <span
                  key={color.name}
                  className="inline-block w-5 h-5 rounded-full border mr-1"
                  style={getColorCircleStyle(color.value)}
                  title={color.name}
                />
              ))}
              <span className="ml-2 text-xs text-gray-700">{translatedProduct.colors.map(c => c.name).join(", ")}</span>
            </div>
          )}
          {/* Size badges */}
          {translatedProduct.sizes && translatedProduct.sizes.length > 0 && (
            <div className="flex items-center mb-2">
              {translatedProduct.sizes.map((size) => (
                <Badge key={size.name} variant="secondary" className="text-xs mr-1">
                  {size.name}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-amber-600">
              {formatPrice(translatedProduct.price)}
            </span>
            {translatedProduct.stock > 0 && (
              <Badge variant="secondary" className="text-xs">
                {translatedProduct.stock} {getStockText()}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 space-y-2">
          <div className="flex flex-col space-y-2 w-full">
            <Button
              onClick={handleViewDetails}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-2" />
              {t("marketplace.viewDetails")}
            </Button>
            {/* Color/Size selection UI if needed */}
            {pendingAddToCart && (
              <div className="p-2 bg-amber-50 rounded mb-2">
                {translatedProduct.colors && (
                  <div className="mb-2">
                    <span className="font-medium">Select Color:</span>
                    <div className="flex gap-2 mt-1">
                      {translatedProduct.colors.map((color) => (
                        <button
                          key={color.name}
                          className={`w-6 h-6 rounded-full border-2 ${selectedColor === color.name ? 'border-amber-500 scale-110' : 'border-gray-300 hover:border-gray-400'}`}
                          style={getColorCircleStyle(color.value)}
                          title={color.name}
                          onClick={() => setSelectedColor(color.name)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {translatedProduct.sizes && (
                  <div>
                    <span className="font-medium">Select Size:</span>
                    <div className="flex gap-2 mt-1">
                      {translatedProduct.sizes.map((size) => (
                        <button
                          key={size.name}
                          className={`px-2 py-1 rounded border text-xs ${selectedSize === size.name ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-300 hover:border-gray-400'}`}
                          onClick={() => setSelectedSize(size.name)}
                        >
                          {size.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <Button
                  className="mt-2"
                  size="sm"
                  disabled={!canAddToCart}
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
              </div>
            )}
            <Button
              onClick={handleAddToCart}
              disabled={translatedProduct.stock === 0}
              size="sm"
              className="w-full"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t("marketplace.addToCart")}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <ProductDetailModal
        product={translatedProduct}
        open={showModal}
        onOpenChange={setShowModal}
        categories={categories}
      />
    </>
  );
};
