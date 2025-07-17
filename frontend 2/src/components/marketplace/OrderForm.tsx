import { useState } from "react";
import { Product, Order, OrderItem } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/hooks/use-currency";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createOrder } from '@/services/orderService';
import { autoTranslateProduct } from "@/services/translationService";
import { normalizeDateString } from "@/lib/utils";

interface OrderFormProps {
  product: Product;
  quantity: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  color?: string | string[];
  colorName?: string[];
  size?: string;
}

export const OrderForm = ({
  product,
  quantity,
  open,
  onOpenChange,
  onBack,
  color,
  colorName,
  size,
}: OrderFormProps) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { toast } = useToast();

  const { formatPrice } = useCurrency();

  // Translate product fields based on current language
  const translatedProduct = autoTranslateProduct(product, language);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const total = translatedProduct.price * quantity;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    return (
      formData.name.trim() && formData.phone.trim() && formData.address.trim()
    );
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
    onOpenChange(false);
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItem: OrderItem = {
        productId: product.id,
        quantity,
        price: product.price,
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          stock: product.stock,
          featured: product.featured,
          createdAt: normalizeDateString(product.createdAt),
          // Only include first image URL, not base64 data
          images: product.images.length > 0 ? [product.images[0]] : [],
          colors: product.colors || [],
          sizes: product.sizes || []
        },
        color: Array.isArray(color) ? color[0] : color,
        size: size,
      };

      const orderPayload = {
        items: [orderItem],
        total,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        notes: formData.notes,
      };

      await createOrder(orderPayload);

      toast({
        title: "Order Placed Successfully!",
        description: t("order.success"),
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <Button onClick={onBack} variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-2xl">{t("order.title")}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="flex items-center space-x-4">
              <img
                src={translatedProduct.images[0]}
                alt={translatedProduct.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h4 className="font-medium">{translatedProduct.name}</h4>
                <div className="flex items-center space-x-3 mt-1">
                  {/* Color swatch and name */}
                  <span className="text-sm text-gray-500">Color:</span>
                  {color ? (
                    Array.isArray(color) ? (
                      <>
                        <span className="text-sm text-gray-700">{colorName && colorName.length > 0 ? colorName.join(", ") : (Array.isArray(color) ? color.join(", ") : "")}</span>
                        <span style={{ ...getColorCircleStyle(color), borderRadius: '50%', display: 'inline-block', width: 20, height: 20, border: '1px solid #ccc', marginLeft: 4 }} title={colorName && colorName.length > 0 ? colorName.join(", ") : (Array.isArray(color) ? color.join(", ") : "")}></span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-gray-700">{colorName && colorName.length > 0 ? colorName[0] : (typeof color === 'string' ? color : '')}</span>
                        <span style={{ ...getColorCircleStyle(typeof color === 'string' ? color : ''), borderRadius: '50%', display: 'inline-block', width: 20, height: 20, border: '1px solid #ccc', marginLeft: 4 }} title={colorName && colorName.length > 0 ? colorName[0] : (typeof color === 'string' ? color : '')}></span>
                      </>
                    )
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                  {/* Size badge */}
                  <span className="text-sm text-gray-500 ml-4">Size:</span>
                  {size ? (
                    <span style={{ borderRadius: '50%', border: '1px solid #ccc', padding: '0 8px', fontSize: '0.9em' }}>{size}</span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Quantity: {quantity} × {formatPrice(translatedProduct.price)}
                </p>
              </div>
              <div className="text-lg font-bold">{formatPrice(total)}</div>
            </div>
          </div>

          <Separator />

          {/* Customer Information Form */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Customer Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("order.name")} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("order.phone")} *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{t("order.address")} *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter your complete address"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any special instructions or notes (optional)"
                rows={2}
              />
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total Amount:</span>
              <span className="text-amber-600">{formatPrice(total)}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={handleAddToCart}
                variant="outline"
                size="lg"
                className="w-full"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {t("order.addToCart")}
              </Button>

              <Button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full py-4 text-lg bg-amber-500 text-white hover:bg-amber-600"
              >
                Order now
              </Button>
            </div>

            <p className="text-sm text-gray-600 text-center">
              * Required fields
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
