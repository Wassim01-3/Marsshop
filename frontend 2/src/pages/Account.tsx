import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Navigate } from "react-router-dom";
import { getMyOrders } from '@/services/orderService';
import { Table, TableHeader, TableBody, TableCell, TableRow, TableHead } from "@/components/ui/table";
import MarsSpinner from "@/components/admin/MarsSpinner";
import { normalizeDateString } from "@/lib/utils";

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

const Account = () => {
  // All hooks at the top
  const { t } = useLanguage();
  const { user, updateProfile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [authChecked, setAuthChecked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [userOrders, setUserOrders] = useState([]);

  // Sync formData with user details whenever user changes
  useEffect(() => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
  }, [user]);

  // Move fetchOrders above useEffect
  const fetchOrders = async () => {
    try {
      const response = await getMyOrders();
      // If response is Hydra format, extract the member array
      const orders = Array.isArray(response)
        ? response
        : Array.isArray(response.member)
          ? response.member
          : [];
      setUserOrders(orders);
    } catch (error) {
      setUserOrders([]); // fallback to empty array on error
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    setAuthChecked(true);
  }, [user]);

  // Early returns after all hooks
  if (!authChecked) {
    return <MarsSpinner />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSave = async () => {
    const result = await updateProfile(formData);
    if (result.success) {
    setIsEditing(false);
    toast({
      title: "Success",
      description: "Your profile has been updated successfully.",
    });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t("account.profile")}
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="profile"
              className="flex items-center space-x-2"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    {t("common.edit")}
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      {t("common.cancel")}
                    </Button>
                    <Button onClick={handleSave} size="sm">
                      {t("common.save")}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">{t("order.name")}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="email">{t("account.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">{t("order.phone")}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="address">{t("order.address")}</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>

                {user?.isAdmin && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        Administrator
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                <section>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userOrders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8}>No orders found.</TableCell>
                        </TableRow>
                      )}
                      {userOrders.map((order, orderIdx) => (
                        order.items.map((item, idx) => {
                          const isFirst = idx === 0;
                          const rowClass = isFirst ? '' : 'border-t border-gray-200';
                          const rowStyle = isFirst ? { borderTop: '4px solid #9ca3af' } : {};
                          return (
                            <TableRow key={order.id + '-' + idx} className={rowClass} style={rowStyle}>
                              {isFirst && (
                                <TableCell rowSpan={order.items.length} className="align-middle text-lg font-bold">{order.id}</TableCell>
                              )}
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  {item.product?.images?.[0] && (
                                    <img src={item.product.images[0]} alt={item.product?.name || item.productName} className="w-8 h-8 object-cover rounded" />
                                  )}
                                  <span className="font-medium">{item.product?.name || item.productName}</span>
                                </div>
                              </TableCell>
                              <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                                {item.color ? (
                                  <span style={{ ...getColorCircleStyle(item.color), borderRadius: '50%', display: 'inline-block', width: 20, height: 20 }} title={item.color}></span>
                                ) : '-'}
                              </TableCell>
                              <TableCell>{item.size || '-'}</TableCell>
                              {isFirst && (
                                <TableCell rowSpan={order.items.length} className="align-middle">{
                                  typeof order.total === 'number'
                                    ? order.total.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' TND'
                                    : 'N/A'
                                }</TableCell>
                              )}
                              {isFirst && (
                                <TableCell rowSpan={order.items.length} className="align-middle">
                                  <span className={
                                    (order.status === 'pending' ? 'text-amber-500 ' :
                                    order.status === 'confirmed' ? 'text-teal-600 ' :
                                    order.status === 'processing' ? 'text-indigo-500 ' :
                                    order.status === 'shipped' ? 'text-violet-500 ' :
                                    order.status === 'delivered' ? 'text-emerald-500 ' :
                                    order.status === 'cancelled' ? 'text-rose-500 ' :
                                    'text-slate-500 ') + 'font-bold'
                                  }>{order.status}</span>
                          </TableCell>
                              )}
                              {isFirst && (
                                <TableCell rowSpan={order.items.length} className="align-middle">{new Date(normalizeDateString(order.createdAt)).toLocaleString()}</TableCell>
                              )}
                        </TableRow>
                          );
                        })
                      ))}
                    </TableBody>
                  </Table>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Account Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Member since:</span>
                      <span>
                        {new Date(normalizeDateString(user?.createdAt || "")).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account type:</span>
                      <span>
                        {user?.isAdmin ? "Administrator" : "Customer"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Preferences</h3>
                  <p className="text-gray-600 text-sm">
                    Language and other preferences can be changed using the
                    navigation menu.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Privacy & Security
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Your data is secure and protected. We never share your
                    personal information with third parties.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Account;
