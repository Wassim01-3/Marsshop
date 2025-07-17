import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/hooks/use-currency";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Order, Product } from "@/types";
import {
  Package,
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  ShoppingBag,
  CheckCircle,
  Clock,
  XCircle,
  Trash2,
} from "lucide-react";
import { normalizeDateString } from "@/lib/utils";

interface OrderViewDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (orderId: string, status: string) => Promise<void>;
  onDeleteOrder?: (orderId: string) => Promise<void>;
  updatingStatus?: string | null;
  adminProducts?: Product[]; // Add this prop
}

const OrderViewDialog = ({ 
  order, 
  isOpen, 
  onClose, 
  onUpdateStatus, 
  onDeleteOrder, 
  updatingStatus,
  adminProducts = [] // Default to empty array
}: OrderViewDialogProps) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [currentOrderStatus, setCurrentOrderStatus] = useState<string>('');

  // Update local status when order changes
  useEffect(() => {
    if (order) {
      setCurrentOrderStatus(order.status);
    }
  }, [order]);

  // Get product details from adminProducts instead of API
  const getProductDetails = (productId: string): Product | null => {
    return adminProducts.find(product => product.id === productId) || null;
  };

  // Refresh product details after status change
  const handleStatusUpdate = async (orderId: string, status: string) => {
    // Update local status immediately for better UX
    setCurrentOrderStatus(status);
    await onUpdateStatus(orderId, status);
    // Refresh product details to get updated stock information
    // This part is now handled by the parent component passing adminProducts
  };

  if (!order) return null;

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-amber-100 text-amber-800 border-amber-300",
      confirmed: "bg-teal-100 text-teal-800 border-teal-300",
      processing: "bg-indigo-100 text-indigo-800 border-indigo-300",
      shipped: "bg-violet-100 text-violet-800 border-violet-300",
      delivered: "bg-emerald-100 text-emerald-800 border-emerald-300",
      cancelled: "bg-rose-100 text-rose-800 border-rose-300",
    };
    return (
      colors[status as keyof typeof colors] ||
      "bg-slate-100 text-slate-800 border-slate-300"
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "confirmed":
        return "✅";
      case "processing":
        return "🔄";
      case "shipped":
        return "🚚";
      case "delivered":
        return "📦";
      case "cancelled":
        return "❌";
      default:
        return "📋";
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-mars-600" />
            <span>Order Details #{order.id}</span>
            <Badge className={`ml-2 ${getStatusColor(currentOrderStatus)}`}>
              <span className="mr-1">{getStatusIcon(currentOrderStatus)}</span>
              {currentOrderStatus.charAt(0).toUpperCase() + currentOrderStatus.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Order Summary */}
          <Card className="border-mars-200 bg-gradient-to-r from-mars-50 to-amber-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-mars-700">
                <ShoppingBag className="h-5 w-5" />
                <span>Order Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-mars-600">
                  {order.items.length}
                </div>
                <div className="text-sm text-gray-600">Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatPrice(order.total)}
                </div>
                <div className="text-sm text-gray-600">Total Amount</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {new Date(normalizeDateString(order.createdAt)).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">Order Date</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">
                  {order.userId ? "Registered" : "Guest"}
                </div>
                <div className="text-sm text-gray-600">Customer Type</div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Customer Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Customer Name</p>
                      <p className="font-semibold text-lg">
                        {order.customerName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Phone Number</p>
                      <p className="font-medium">{order.customerPhone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Delivery Address</p>
                      <p className="font-medium leading-relaxed">
                        {order.customerAddress}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {order.notes && (
                <>
                  <Separator />
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Order Notes</p>
                      <p className="font-medium bg-gray-50 p-3 rounded-lg mt-1">
                        {order.notes}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-green-600" />
                <span>Order Items ({order.items.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => {
                  const product = getProductDetails(item.productId);
                  // Normalize color to array if needed
                  let colorArr: string[] = [];
                  if (item.color) {
                    if (Array.isArray(item.color)) {
                      colorArr = item.color;
                    } else if (typeof item.color === 'string' && item.color.includes(',')) {
                      colorArr = item.color.split(',').map(s => s.trim());
                    } else {
                      colorArr = [item.color];
                    }
                  }
                  let colorNames: string[] = [];
                  let combinedColorName: string | null = null;
                  if (colorArr.length && product?.colors) {
                    // Try to find a combined color whose value matches colorArr (order-insensitive)
                    const match = product.colors.find(c => Array.isArray(c.value) &&
                      c.value.length === colorArr.length &&
                      c.value.every(v => colorArr.includes(v)) &&
                      colorArr.every(v => c.value.includes(v))
                    );
                    if (match) {
                      combinedColorName = match.name;
                    } else {
                      // Fallback: map each value to a color name, deduplicated
                      colorNames = colorArr.map(val => {
                        const found = product.colors.find(c => c.value === val || (Array.isArray(c.value) && c.value.includes(val)));
                        return found ? found.name : val;
                      });
                      colorNames = Array.from(new Set(colorNames));
                    }
                  }
                  return (
                    <div key={index}>
                      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="relative">
                          <img
                            src={product?.images?.[0] || '/placeholder.svg'}
                            alt={product?.name || 'Product'}
                            className="w-20 h-20 rounded-lg object-cover shadow-sm"
                          />
                          <Badge className="absolute -top-2 -right-2 bg-mars-600 text-white">
                            {item.quantity}
                          </Badge>
                        </div>

                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-gray-900">
                            {product?.name || 'Product Name Not Available'}
                          </h4>
                          <div className="flex items-center space-x-3 mt-1">
                            {/* Color swatch */}
                            <span className="text-sm text-gray-500">Color:</span>
                            {colorArr.length ? (
                              <span className="inline-flex items-center">
                                <span
                                  className="inline-block w-4 h-4 rounded-full border mr-1"
                                  style={getColorCircleStyle(colorArr)}
                                ></span>
                                <span>
                                  {combinedColorName ? combinedColorName : colorNames.join(' & ')}
                                </span>
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                            {/* Size badge */}
                            <span className="text-sm text-gray-500 ml-4">Size:</span>
                            {item.size ? (
                              <span style={{ borderRadius: '50%', border: '1px solid #ccc', padding: '0 8px', fontSize: '0.9em' }}>{item.size}</span>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <div className="text-sm text-gray-600">Unit Price</div>
                          <div className="font-semibold">
                            {formatPrice(item.price)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </div>
                          <div className="text-lg font-bold text-mars-600">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                      {index < order.items.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Order Total */}
              <Separator className="my-6" />
              <div className="bg-gradient-to-r from-mars-50 to-amber-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-mars-600" />
                    <span className="text-lg font-semibold">Order Total</span>
                  </div>
                  <div className="text-2xl font-bold text-mars-600">
                    {formatPrice(order.total)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span>Order Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Order Created</p>
                    <p className="text-sm text-gray-600">
                      {new Date(normalizeDateString(order.createdAt)).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="ml-1.5 h-4 w-0.5 bg-gray-300"></div>

                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      currentOrderStatus !== "pending"
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <div>
                    <p className="font-medium">Current Status</p>
                    <p className="text-sm text-gray-600">
                      {currentOrderStatus.charAt(0).toUpperCase() +
                        currentOrderStatus.slice(1)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        {onUpdateStatus && onDeleteOrder && (
          <DialogFooter className="flex justify-center pt-6 border-t">
            <div className="flex flex-wrap gap-2 justify-center">
              {/* Confirm Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleStatusUpdate(order.id, 'confirmed');
                }}
                disabled={updatingStatus === order.id}
                className={currentOrderStatus === 'confirmed' ? 'text-teal-600 border-teal-300 bg-teal-50' : 'text-slate-600 hover:text-teal-600 hover:border-teal-300 hover:bg-teal-50'}
              >
                <CheckCircle className={`h-4 w-4 mr-2 ${updatingStatus === order.id ? 'animate-spin' : ''}`} />
                Confirm
              </Button>
              
              {/* Pending Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleStatusUpdate(order.id, 'pending');
                }}
                disabled={updatingStatus === order.id}
                className={currentOrderStatus === 'pending' ? 'text-amber-500 border-amber-300 bg-amber-50' : 'text-slate-600 hover:text-amber-500 hover:border-amber-300 hover:bg-amber-50'}
              >
                <Clock className={`h-4 w-4 mr-2 ${updatingStatus === order.id ? 'animate-spin' : ''}`} />
                Pending
              </Button>
              
              {/* Cancel Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleStatusUpdate(order.id, 'cancelled');
                }}
                disabled={updatingStatus === order.id}
                className={currentOrderStatus === 'cancelled' ? 'text-rose-500 border-rose-300 bg-rose-50' : 'text-slate-600 hover:text-rose-500 hover:border-rose-300 hover:bg-rose-50'}
              >
                <XCircle className={`h-4 w-4 mr-2 ${updatingStatus === order.id ? 'animate-spin' : ''}`} />
                Cancel
              </Button>
              
              {/* Delete Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteOrder(order.id)}
                disabled={updatingStatus === order.id}
                className="text-rose-500 border-rose-300 hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderViewDialog;
