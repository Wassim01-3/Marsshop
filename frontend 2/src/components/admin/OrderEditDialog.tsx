import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Order } from "@/types";
import { Save, X, Package, User, Phone, MapPin, Calendar } from "lucide-react";

interface OrderEditDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedOrder: Order) => void;
}

const OrderEditDialog = ({
  order,
  isOpen,
  onClose,
  onSave,
}: OrderEditDialogProps) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [editedOrder, setEditedOrder] = useState<Order | null>(order);

  const statusOptions = [
    {
      value: "pending",
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "confirmed",
      label: "Confirmed",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "processing",
      label: "Processing",
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "shipped",
      label: "Shipped",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "delivered",
      label: "Delivered",
      color: "bg-emerald-100 text-emerald-800",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      color: "bg-red-100 text-red-800",
    },
  ];

  const handleSave = () => {
    if (editedOrder) {
      onSave(editedOrder);
      onClose();
    }
  };

  const handleClose = () => {
    setEditedOrder(order);
    onClose();
  };

  if (!order || !editedOrder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Edit Order #{order.id}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customer Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Customer Information</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={editedOrder.customerName}
                    onChange={(e) =>
                      setEditedOrder({
                        ...editedOrder,
                        customerName: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="customerPhone"
                      value={editedOrder.customerPhone}
                      onChange={(e) =>
                        setEditedOrder({
                          ...editedOrder,
                          customerPhone: e.target.value,
                        })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="customerAddress">Delivery Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Textarea
                      id="customerAddress"
                      value={editedOrder.customerAddress}
                      onChange={(e) =>
                        setEditedOrder({
                          ...editedOrder,
                          customerAddress: e.target.value,
                        })
                      }
                      className="pl-10"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Status and Details */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Order Details</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Order Status</Label>
                  <Select
                    value={editedOrder.status}
                    onValueChange={(value) =>
                      setEditedOrder({
                        ...editedOrder,
                        status: value as Order["status"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center space-x-2">
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Order Date</Label>
                  <Input
                    value={new Date(editedOrder.createdAt).toLocaleDateString()}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Order Total</Label>
                  <Input
                    value={formatPrice(editedOrder.total)}
                    disabled
                    className="bg-gray-50 font-semibold"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="notes">Order Notes</Label>
                <Textarea
                  id="notes"
                  value={editedOrder.notes || ""}
                  onChange={(e) =>
                    setEditedOrder({ ...editedOrder, notes: e.target.value })
                  }
                  placeholder="Add any special notes or instructions for this order..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Order Items</h3>

              <div className="space-y-3">
                {editedOrder.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />

                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">
                        Category: {item.product.category}
                      </p>
                      <p className="text-sm text-gray-600">
                        Unit Price: {formatPrice(item.price)}
                      </p>
                    </div>

                    <div className="text-center">
                      <Label className="text-sm text-gray-600">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value) || 1;
                          const updatedItems = editedOrder.items.map(
                            (orderItem, i) =>
                              i === index
                                ? { ...orderItem, quantity: newQuantity }
                                : orderItem,
                          );
                          const newTotal = updatedItems.reduce(
                            (sum, orderItem) =>
                              sum + orderItem.price * orderItem.quantity,
                            0,
                          );
                          setEditedOrder({
                            ...editedOrder,
                            items: updatedItems,
                            total: newTotal,
                          });
                        }}
                        className="w-20 text-center"
                      />
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-xl font-bold text-mars-600">
                    {formatPrice(editedOrder.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-mars-600 hover:bg-mars-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderEditDialog;
