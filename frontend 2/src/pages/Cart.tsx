import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/hooks/use-currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { TableCell } from "@/components/ui/table";
import { createOrder } from '@/services/orderService';
import { OrderItem } from "@/types";
import MarsSpinner from "@/components/admin/MarsSpinner";

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

type OrderPayloadItem = {
  productId: string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
};

const Cart = () => {
  const { t } = useLanguage();
  const { items, removeItem, updateQuantity, clearCart, total, guestMessage } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    notes: "",
  });

  // State for variant selections
  const [variantSelections, setVariantSelections] = useState<{
    [productId: string]: { color?: string; size?: string };
  }>({});

  const handleUpdateQuantity = (uniqueId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(uniqueId);
    } else {
      updateQuantity(uniqueId, newQuantity);
    }
  };

  const handleVariantSelection = (productId: string, variantType: 'color' | 'size', value: string) => {
    setVariantSelections(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [variantType]: value
      }
    }));
  };

  const validateVariants = () => {
    for (const item of items) {
      const selections = variantSelections[item.uniqueId] || {};
      if (item.availableColors && item.availableColors.length > 0 && !item.color && !selections.color) {
        return false;
      }
      if (item.availableSizes && item.availableSizes.length > 0 && !item.size && !selections.size) {
        return false;
      }
    }
    return true;
  };

  const handleCheckout = async () => {
    if (
      !customerInfo.name.trim() ||
      !customerInfo.phone.trim() ||
      !customerInfo.address.trim()
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!validateVariants()) {
      toast({
        title: "Error",
        description: "Please select all required variants (color and size) for your products.",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingOut(true);

    try {
      // Create order items with variants - only send essential product info
      const orderItems: OrderPayloadItem[] = items.map((item) => {
        const selections = variantSelections[item.uniqueId] || {};
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          color: item.color || selections.color,
          size: item.size || selections.size,
        };
      });

      const orderPayload = {
        items: orderItems,
        total,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address,
        notes: customerInfo.notes,
      };

      await createOrder(orderPayload);

      clearCart();
      setVariantSelections({});

      toast({
        title: "Order Placed Successfully!",
        description: t("order.success"),
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <ShoppingCart className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Please log in to use the cart.
            </h1>
            <p className="text-gray-600 mb-8">
              You must be authenticated to add, view, or checkout items in your cart.
            </p>
            <Link to="/login">
              <Button className="bg-amber-600 hover:bg-amber-700">
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <ShoppingCart className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t("cart.empty")}
            </h1>
            <p className="text-gray-600 mb-8">
              Start shopping to add items to your cart.
            </p>
            <Link to="/marketplace">
              <Button className="bg-amber-600 hover:bg-amber-700">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isCheckingOut) {
    return <MarsSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t("cart.title")}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.uniqueId}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {item.name}
                        {item.color && (
                          <div className="flex items-center mt-1">
                            <button
                              type="button"
                              className="px-3 py-1 rounded border text-sm font-medium flex items-center gap-2 bg-white text-gray-900 border-gray-300"
                              style={{ cursor: "default" }}
                              tabIndex={-1}
                            >
                            <span
                                className="inline-block w-4 h-4 rounded-full border"
                                style={getColorCircleStyle(item.color)}
                            ></span>
                              {(() => {
                                // Prefer colorName if present
                                if (item.colorName) {
                                  const nameList = Array.isArray(item.colorName) ? item.colorName : [item.colorName];
                                  return nameList.join(' & ');
                                }
                                // Fallback to code
                                const colorList = Array.isArray(item.color) ? item.color : [item.color];
                                return colorList.join(' & ');
                              })()}
                            </button>
                          </div>
                        )}
                        {item.size && (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-300 bg-white text-gray-900 text-sm font-medium ml-1 mt-1">
                            {item.size}
                          </span>
                        )}
                      </h3>
                    </div>

                    <div className="flex flex-col items-end space-y-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.uniqueId,
                              item.quantity - 1,
                            )
                          }
                          variant="outline"
                          size="sm"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= 1) {
                              handleUpdateQuantity(item.uniqueId, value);
                            }
                          }}
                          className="w-16 text-center"
                          min="1"
                        />
                        <Button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.uniqueId,
                              item.quantity + 1,
                            )
                          }
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Item Total and Remove */}
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        <Button
                          onClick={() => removeItem(item.uniqueId)}
                          variant="ghost"
                          size="sm"
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {t("cart.remove")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary and Checkout */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => {
                  const selections = variantSelections[item.uniqueId] || {};
                  const needsColor = !item.color;
                  const needsSize = !item.size;
                  const showOrderSummary = needsColor || needsSize;
                  return (
                    <div key={item.uniqueId} className="space-y-3">
                      <div className="flex justify-between text-sm">
                    <span>
                          {item.name} × {item.quantity}
                    </span>
                    <span>
                          {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                      {/* Variant Selection UI if needed */}
                      {showOrderSummary && (
                        <div className="space-y-2 text-xs">
                          {/* Color Selection */}
                          {needsColor && (item.availableColors || []).length > 0 && (
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-600">Color:</span>
                              <div className="flex space-x-1">
                                {(item.availableColors || []).map((color, index) => (
                                  <button
                                    key={color.id || `${item.uniqueId}-color-${index}`}
                                    onClick={() => handleVariantSelection(item.uniqueId, 'color', color.name)}
                                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                                      selections.color === color.name
                                        ? 'border-amber-500 scale-110'
                                        : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                  />
                                ))}
                              </div>
                              {!selections.color && (
                                <span className="text-red-500 text-xs">* Required</span>
                              )}
                            </div>
                          )}
                          {/* Size Selection */}
                          {needsSize && (item.availableSizes || []).length > 0 && (
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-600">Size:</span>
                              <div className="flex space-x-1">
                                {(item.availableSizes || []).map((size, index) => (
                                  <button
                                    key={size.id || `${item.uniqueId}-size-${index}`}
                                    onClick={() => handleVariantSelection(item.uniqueId, 'size', size.name)}
                                    className={`px-2 py-1 text-xs rounded border transition-all ${
                                      selections.size === size.name
                                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                                        : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                  >
                                    {size.name}
                                  </button>
                                ))}
                              </div>
                              {!selections.size && (
                                <span className="text-red-500 text-xs">* Required</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>{t("cart.total")}</span>
                  <span className="text-amber-600">{formatPrice(total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="checkout-name">{t("order.name")} *</Label>
                  <Input
                    id="checkout-name"
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="checkout-phone">{t("order.phone")} *</Label>
                  <Input
                    id="checkout-phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="checkout-address">
                    {t("order.address")} *
                  </Label>
                  <Textarea
                    id="checkout-address"
                    value={customerInfo.address}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder="Enter your complete address"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="checkout-notes">Additional Notes</Label>
                  <Textarea
                    id="checkout-notes"
                    value={customerInfo.notes}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Any special instructions (optional)"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              disabled={isCheckingOut || !validateVariants()}
              className="w-full py-6 text-lg"
              size="lg"
            >
              {isCheckingOut
                ? t("common.loading")
                : `${t("cart.checkout")} - ${formatPrice(total)}`}
            </Button>
            
            {!validateVariants() && (
              <p className="text-sm text-red-600 text-center">
                Please select all required variants before checkout
              </p>
            )}

            <Link to="/marketplace">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
