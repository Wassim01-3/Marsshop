import { useState, useEffect } from "react";
import { Product, Category } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/hooks/use-currency";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Minus, Plus, ChevronLeft, ChevronRight, CreditCard } from "lucide-react";
import { OrderForm } from "./OrderForm";
import type { Product as ProductType, Category as CategoryType } from '@/types';
import { incrementProductViews } from '@/services/productService';
import { autoTranslateProduct } from "@/services/translationService";

interface ProductDetailModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryType[];
}

export const ProductDetailModal = ({
  product,
  open,
  onOpenChange,
  categories = [],
}: ProductDetailModalProps) => {
  const { t, language } = useLanguage();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [quantity, setQuantity] = useState(1);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [carouselImages, setCarouselImages] = useState([getDefaultProductImage(product)]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [lastSelectedColor, setLastSelectedColor] = useState(null);

  // Increment product views when modal is opened
  useEffect(() => {
    if (open && product?.id) {
      incrementProductViews(String(product.id)).catch(() => {});
    }
  }, [open, product?.id]);

  // Extract color and size options from product
  const colorOptions = Array.isArray(product.colors) ? product.colors : [];
  const sizeOptions = Array.isArray(product.sizes) ? product.sizes : [];

  // Collect all images (main + all color images)
  function getAllProductImages(product) {
    let images = [];
    if (Array.isArray(product.images)) images = [...product.images];
    if (product.image && !images.includes(product.image)) images.unshift(product.image);
    if (Array.isArray(product.colors)) {
      product.colors.forEach(color => {
        if (Array.isArray(color.images)) {
          color.images.forEach(img => {
            if (!images.includes(img)) images.push(img);
          });
        }
      });
    }
    return images.length ? images : ["/placeholder.svg"];
  }

  // Update carousel images when color selection changes
  useEffect(() => {
    let newImages;
    if (selectedColors.length > 0) {
      // Show images for the last selected color
      const colorObj = colorOptions.find(c => c.name === lastSelectedColor);
      if (colorObj && Array.isArray(colorObj.images) && colorObj.images.length > 0) {
        newImages = colorObj.images;
      } else {
        newImages = getAllProductImages(product);
      }
    } else {
      newImages = getAllProductImages(product);
    }
    if (JSON.stringify(newImages) !== JSON.stringify(carouselImages)) {
      setCarouselImages(newImages);
      setCurrentImageIndex(0);
    }
  }, [selectedColors, lastSelectedColor, product, colorOptions]);

  // Auto-scroll carousel
  useEffect(() => {
    if (!autoScroll || carouselImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 3000); // Change image every 3 seconds
    return () => clearInterval(interval);
  }, [autoScroll, carouselImages.length]);

  const handleManualImageSelect = (index) => {
    setCurrentImageIndex(index);
    setAutoScroll(false);
    // Resume auto-scroll after 10 seconds
    setTimeout(() => setAutoScroll(true), 10000);
  };

  // Debug: Log categories before using .find
  console.log('ProductDetailModal categories:', categories);
  const safeCategories = Array.isArray(categories) ? categories : [];
  const categoryObj = safeCategories.length
    ? safeCategories.find(
        (cat) => (cat && (cat['@id'] || cat.id) === product.category)
      )
    : undefined;

  // Find stock for selected color/size
  const selectedVariant = Array.isArray(product.variants)
    ? product.variants.find(v => v.color === selectedColors.join(",") && v.size === selectedSize)
    : undefined;
  const availableStock = selectedVariant ? selectedVariant.stock : product.stock;

  const handleAddToCart = () => {
    let colorArg, colorNameArg;
    if (selectedColors.length > 1) {
      colorArg = selectedColors.map(name => {
        const colorObj = colorOptions.find(c => c.name === name);
        return colorObj ? colorObj.value : name;
      });
      colorNameArg = selectedColors;
    } else if (selectedColors.length === 1) {
      const colorObj = colorOptions.find(c => c.name === selectedColors[0]);
      colorArg = colorObj ? colorObj.value : selectedColors[0];
      colorNameArg = colorObj ? colorObj.name : selectedColors[0];
    } else {
      colorArg = undefined;
      colorNameArg = undefined;
    }
    addItem(product, quantity, colorArg, selectedSize, colorNameArg);
    onOpenChange(false);
  };

  const handleOrderNow = () => {
    setShowOrderForm(true);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) setQuantity(quantity + 1);
  };

  // Helper to get the default product image
  function getDefaultProductImage(product) {
    if (product.image) return product.image;
    if (Array.isArray(product.images) && product.images.length > 0) return product.images[0];
    return '/placeholder.svg'; // fallback
  }

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

  const handleColorClick = (colorName) => {
    setSelectedSize(null);
    setSelectedColors(prev => {
      if (prev.includes(colorName)) {
        // Deselect
        setLastSelectedColor(null);
        return [];
      } else {
        setLastSelectedColor(colorName);
        return [colorName];
      }
    });
  };

  // Helper to check if all required variants are selected
  function allVariantsSelected() {
    const needsColor = colorOptions.length > 0;
    const needsSize = sizeOptions.length > 0;
    const colorSelected = !needsColor || selectedColors.length > 0;
    const sizeSelected = !needsSize || !!selectedSize;
    return colorSelected && sizeSelected;
  }

  // Translate product fields based on current language
  const translatedProduct = autoTranslateProduct(product);

  if (showOrderForm) {
    // Map selectedColors (names) to color values for swatch
    const selectedColorValues = selectedColors.length > 1
      ? selectedColors.map(name => {
          const colorObj = colorOptions.find(c => c.name === name);
          return colorObj ? colorObj.value : name;
        })
      : lastSelectedColor && colorOptions.find(c => c.name === lastSelectedColor)?.value;
    return (
      <OrderForm
        product={translatedProduct}
        quantity={quantity}
        open={open}
        onOpenChange={onOpenChange}
        onBack={() => setShowOrderForm(false)}
        color={selectedColors.length > 1 ? selectedColorValues : selectedColorValues || lastSelectedColor}
        colorName={selectedColors}
        size={selectedSize}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{translatedProduct.name}</DialogTitle>
          {translatedProduct.featured && (
            <Badge className="bg-amber-500 ml-2">Featured</Badge>
          )}
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={carouselImages[currentImageIndex]}
                alt={translatedProduct.name}
                className="w-full h-full object-contain"
              />
              {/* Manual scroll buttons */}
              {carouselImages.length > 1 && (
                <>
                  <button
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow"
                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)}
                    aria-label="Previous image"
                    style={{ zIndex: 2 }}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow"
                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length)}
                    aria-label="Next image"
                    style={{ zIndex: 2 }}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
              {translatedProduct.stock === 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <Badge variant="secondary" className="bg-gray-800 text-white">
                    {t("product.outOfStock")}
                  </Badge>
                </div>
              )}
            </div>

            {carouselImages.length > 1 && (
              <div className="flex space-x-2">
                {carouselImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleManualImageSelect(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index
                        ? "border-amber-500"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${translatedProduct.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-amber-600">
                  {formatPrice(translatedProduct.price)}
                </span>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                {availableStock > 0 ? (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    {availableStock} {t("product.stock")}
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-red-100 text-red-800"
                  >
                    {t("product.outOfStock")}
                  </Badge>
                )}
              </div>

              <div className="text-gray-700 leading-relaxed mb-2">
                <div dangerouslySetInnerHTML={{ __html: translatedProduct.description }} />
              </div>

              {/* Category */}
              {!safeCategories.length ? (
                <div className="mt-2 text-sm text-gray-500">Loading category...</div>
              ) : categoryObj && categoryObj.name ? (
                <div className="mt-2 text-sm text-gray-500">
                  <span className="font-semibold">{t("product.category")}: </span>
                  {categoryObj.name}
                </div>
              ) : null}

              {/* Show selected color(s) */}
              {selectedColors.length > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  <span className="font-semibold">colors: </span>{selectedColors.join(", ")}
                </div>
              )}

              {selectedSize && (
                <div className="mt-2 text-sm text-gray-500">
                  <span className="font-semibold">size: </span>{selectedSize}
                </div>
              )}

              {/* Show variant image if selected */}
              {selectedColors.length > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  <span className="font-semibold">images: </span>
                  <img src={carouselImages[0]} alt={translatedProduct.name} className="inline-block w-16 h-16 object-cover rounded ml-2" />
                </div>
              )}
            </div>

            <Separator />

            {/* Sizes */}
            {sizeOptions.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  size
                </Label>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size) => (
                    <button
                      key={size.name}
                      onClick={() => setSelectedSize(size.name)}
                      className={`w-12 h-12 rounded-full border-2 text-sm font-medium transition-colors duration-200 flex items-center justify-center ${
                        selectedSize === size.name
                          ? "bg-amber-500 text-white border-amber-500"
                          : "bg-white text-gray-900 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {colorOptions.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  colors
                </Label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => handleColorClick(color.name)}
                      className={`px-3 py-1 rounded border text-sm font-medium flex items-center gap-2 transition-colors duration-200 ${
                        selectedColors[0] === color.name
                          ? "bg-amber-500 text-white border-amber-500"
                          : "bg-white text-gray-900 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      <span className="inline-block w-4 h-4 rounded-full border" style={getColorCircleStyle(color.value)}></span>
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Quantity Selector */}
            {translatedProduct.stock > 0 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="quantity" className="text-sm font-medium">
                    {t("product.quantity")}
                  </Label>
                  <div className="flex items-center space-x-3 mt-2">
                    <Button
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      variant="outline"
                      size="sm"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= 1 && value <= translatedProduct.stock) {
                          setQuantity(value);
                        }
                      }}
                      className="w-20 text-center"
                      min="1"
                      max={translatedProduct.stock}
                    />
                    <Button
                      onClick={increaseQuantity}
                      disabled={quantity >= translatedProduct.stock}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-lg font-semibold text-gray-900">
                  total: {formatPrice(translatedProduct.price * quantity)}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button
                    onClick={handleAddToCart}
                    disabled={
                      (colorOptions.length > 0 && !selectedColors.length) ||
                      (sizeOptions.length > 0 && !selectedSize) ||
                      availableStock === 0
                    }
                    className="flex-1 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {t("marketplace.addToCart")}
                  </Button>
                  <Button
                    onClick={handleOrderNow}
                    disabled={
                      (colorOptions.length > 0 && !selectedColors.length) ||
                      (sizeOptions.length > 0 && !selectedSize) ||
                      availableStock === 0
                    }
                    className="flex-1 bg-amber-500 text-white hover:bg-amber-600"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Order now
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
