import { useState } from "react";
import { Product } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/hooks/use-currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Eye } from "lucide-react";
import { ProductDetailModal } from "./ProductDetailModal";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [showModal, setShowModal] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cartItem = {
      productId: product.id,
      quantity: 1,
      product: product,
    };
    addToCart(cartItem);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };

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

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
        <div className="relative">
          <img
            src={product.images?.[0] || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onClick={handleViewDetails}
          />
          {product.featured && (
            <Badge className="absolute top-2 left-2 bg-amber-500">
              {getFeaturedText()}
            </Badge>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Badge variant="secondary" className="bg-gray-800 text-white">
                {t("product.outOfStock")}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-amber-600">
              {formatPrice(product.price)}
            </span>
            {product.stock > 0 && (
              <Badge variant="secondary" className="text-xs">
                {product.stock} {getStockText()}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 space-y-2">
          <div className="flex space-x-2 w-full">
            <Button
              onClick={handleViewDetails}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              {t("marketplace.viewDetails")}
            </Button>
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              size="sm"
              className="flex-1"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t("marketplace.addToCart")}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <ProductDetailModal
        product={product}
        open={showModal}
        onOpenChange={setShowModal}
      />
    </>
  );
};
