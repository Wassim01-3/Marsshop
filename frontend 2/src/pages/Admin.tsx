import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/hooks/use-currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  BarChart3,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus,
  Settings,
  CheckCircle,
  XCircle,
  Star,
  TrendingDown,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Navigate } from "react-router-dom";
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/services/productService";
import { getOrders, updateOrder, getAllOrders, deleteOrder } from "@/services/orderService";
import { Product, Order } from "@/types";
import LogoUpload from "@/components/admin/LogoUpload";
import CategoryManager from "@/components/admin/CategoryManager";
import EnhancedProductForm from "@/components/admin/EnhancedProductForm";
import { getCategories } from "@/services/categoryService";
import OrderViewDialog from "@/components/admin/OrderViewDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import EditProductDialog from "@/components/admin/EditProductDialog";
import MarsSpinner from "@/components/admin/MarsSpinner";

// Add user type
interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  roles: string[];
  note?: string;
  createdAt?: string;
  pendingOrders?: number;
  address?: string; // Added address field
}

const Admin = () => {
  const { t } = useLanguage();
  const { user, isAdmin, authLoading } = useAuth();
  const { formatPrice } = useCurrency();
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [adminOrders, setAdminOrders] = useState([]);
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState<string | null>(null);

  // Dialog states
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [isOrderViewOpen, setIsOrderViewOpen] = useState(false);
  // Restore state for product view dialog
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isProductViewOpen, setIsProductViewOpen] = useState(false);

  // Add user states
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [noteEditMode, setNoteEditMode] = useState(false);

  // Add state for pending orders dialog
  const [pendingOrdersDialogUser, setPendingOrdersDialogUser] = useState<AdminUser | null>(null);
  const [isPendingOrdersDialogOpen, setIsPendingOrdersDialogOpen] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [showPendingDropdown, setShowPendingDropdown] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const productsData = await getProducts();
      const categoriesData = await getCategories();
      const ordersData = await getAllOrders();
      // Normalize product fields and coerce id to string
      const normalizedProducts = productsData.map(product => ({
        ...product,
        id: String(product.id),
        images: Array.isArray(product.images) ? product.images : [],
        category: product.category || '',
        stock: typeof product.stock === 'number' ? product.stock : 0,
        featured: typeof product.featured === 'boolean' ? product.featured : false,
        colors: Array.isArray(product.colors) ? product.colors : [],
        sizes: Array.isArray(product.sizes) ? product.sizes : [],
      }));
      // Normalize productId in order items to string
      const normalizedOrders = ordersData.map(order => ({
        ...order,
        items: order.items.map(item => ({
          ...item,
          productId: String(item.productId),
        })),
      }));
      setAdminProducts(normalizedProducts);
      setCategories(categoriesData);
      setAdminOrders(normalizedOrders);
    } catch (error) {
      // handle error, e.g. show toast
    } finally {
      setLoading(false);
    }
  };

  // Only fetch data if admin is confirmed
  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchData();
    }
  }, [authLoading, isAdmin]);

  // Fetch users (only fetch, do not calculate pending orders here)
  useEffect(() => {
    if (!isAdmin) return;
    setLoadingUsers(true);
    fetch("http://localhost:8000/api/users", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then(res => res.json())
      .then(users => setAdminUsers(users))
      .finally(() => setLoadingUsers(false));
  }, [isAdmin]);

  // Recalculate pending orders per user whenever adminOrders or adminUsers changes
  useEffect(() => {
    if (!isAdmin) return;
    setAdminUsers(prevUsers => {
      // Build a count of pending orders per user from adminOrders
      const pendingCount: Record<string, number> = {};
      adminOrders.forEach((order: any) => {
        if (order.status === 'pending' && order.user && order.user.id) {
          const userId = String(order.user.id);
          pendingCount[userId] = (pendingCount[userId] || 0) + 1;
        }
      });
      // Map users to include updated pendingOrders
      return prevUsers.map((u: any) => ({
        ...u,
        pendingOrders: pendingCount[String(u.id)] || 0,
      }));
    });
  }, [adminOrders, isAdmin]);

  // Now handle loading/redirect logic
  if (authLoading || loading || loadingUsers) {
    return <MarsSpinner />;
  } else if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Product management functions
  const handleProductSubmit = async (
    productData: Omit<Product, "id" | "createdAt">,
  ) => {
    setLoading(true);
    try {
      if (editingProduct) {
        // Update existing product via API
        const updated = await updateProduct(editingProduct.id, productData);
        setAdminProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? updated : p)),
        );
        setActionMessage({
          type: "success",
          text: "Product updated successfully!",
        });
      } else {
        // Create new product via API
        const created = await createProduct(productData);
        setAdminProducts((prev) => [...prev, created]);
        setActionMessage({
          type: "success",
          text: "Product created successfully!",
        });
      }
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (error) {
      setActionMessage({
        type: "error",
        text: editingProduct ? "Failed to update product." : "Failed to create product.",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditDialogOpen(true);
  };

  const handleSaveEditProduct = async (updated: Partial<Product>) => {
    if (!editingProduct) return;
    setLoading(true);
    try {
      const updatedProduct = await updateProduct(editingProduct.id, updated);
      const normalizedProduct = {
        ...updatedProduct,
        id: String(updatedProduct.id),
        images: Array.isArray(updatedProduct.images) ? updatedProduct.images : [],
        category: updatedProduct.category || '',
        stock: typeof updatedProduct.stock === 'number' ? updatedProduct.stock : 0,
        featured: typeof updatedProduct.featured === 'boolean' ? updatedProduct.featured : false,
        colors: Array.isArray(updatedProduct.colors) ? updatedProduct.colors : [],
        sizes: Array.isArray(updatedProduct.sizes) ? updatedProduct.sizes : [],
      };
      setAdminProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? normalizedProduct : p)));
      setActionMessage({ type: "success", text: "Product updated successfully!" });
    } catch (error) {
      setActionMessage({ type: "error", text: "Failed to update product." });
    } finally {
      setLoading(false);
      setEditDialogOpen(false);
      setEditingProduct(null);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleViewProduct = (product: Product) => {
    setViewingProduct(product);
    setIsProductViewOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    setLoading(true);
    try {
      await deleteProduct(productId);
    setAdminProducts((prev) => prev.filter((p) => p.id !== productId));
    setActionMessage({
      type: "success",
      text: "Product deleted successfully!",
    });
    } catch (error) {
      setActionMessage({
        type: "error",
        text: "Failed to delete product. Please try again.",
      });
    } finally {
      setLoading(false);
    setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const toggleProductFeatured = async (productId: string) => {
    if (updatingStatus === productId) return; // Prevent double clicks
    
    console.log('Toggling featured status for product:', productId);
    setUpdatingStatus(productId);
    try {
      const product = adminProducts.find(p => p.id === productId);
      if (!product) {
        console.log('Product not found:', productId);
        return;
      }

      console.log('Current featured status:', product.featured);
      const updatedProductData = {
        ...product,
        featured: !product.featured
      };

      console.log('New featured status will be:', updatedProductData.featured);

      // Remove id and createdAt from the update data as they shouldn't be sent
      const { id, createdAt, ...updateData } = updatedProductData;

      console.log('Sending update data:', updateData);

      // Call API to update the product
      const updatedProduct = await updateProduct(productId, updateData);

      console.log('API response:', updatedProduct);
      console.log('API response featured status:', updatedProduct.featured);
      console.log('Type of featured status:', typeof updatedProduct.featured);

      // Ensure we have a valid response and extract the featured status
      const newFeaturedStatus = updatedProduct && typeof updatedProduct.featured === 'boolean' 
        ? updatedProduct.featured 
        : !product.featured; // fallback to the opposite of current status

      console.log('New featured status to set:', newFeaturedStatus);

      // Update local state with the response from the API
      setAdminProducts((prev) => {
        console.log('Previous state:', prev);
        const newState = prev.map((p) =>
          p.id === productId ? { ...p, featured: newFeaturedStatus } : p,
        );
        console.log('New state:', newState);
        return newState;
      });

      // Show correct message based on the actual updated status
      console.log('Is now featured:', newFeaturedStatus);
      setActionMessage({ 
        type: "success", 
        text: `Product ${newFeaturedStatus ? 'marked as featured' : 'removed from featured'}!` 
      });

      // Force refresh the products list to ensure we have the latest data
      setTimeout(async () => {
        try {
          const refreshedProducts = await getProducts();
          const normalizedProducts = refreshedProducts.map(product => ({
            ...product,
            id: String(product.id),
            images: Array.isArray(product.images) ? product.images : [],
            category: product.category || '',
            stock: typeof product.stock === 'number' ? product.stock : 0,
            featured: typeof product.featured === 'boolean' ? product.featured : false,
            colors: Array.isArray(product.colors) ? product.colors : [],
            sizes: Array.isArray(product.sizes) ? product.sizes : [],
          }));
          setAdminProducts(normalizedProducts);
          console.log('Products refreshed from server');
        } catch (error) {
          console.error('Failed to refresh products:', error);
        }
      }, 500); // Small delay to ensure server has processed the update
    } catch (error) {
      console.error('Failed to update product status:', error);
      setActionMessage({ 
        type: "error", 
        text: "Failed to update product status. Please try again." 
      });
    } finally {
      setUpdatingStatus(null);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  // Mock data and placeholder functions for dashboard, orders, users, and settings
  const stats = {
    totalUsers: 150,
    totalProducts: adminProducts.length,
    totalOrders: 28,
    totalRevenue: 10000,
    monthlyGrowth: 12.5,
    mostDemanded: [],
    pendingOrders: 3,
    completedOrders: 25,
  };
  const recentOrders = [];
  const OrderStatusBadge = ({ status }: { status: string }) => (
    <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
  );

  // Helper to get category name from IRI
  const getCategoryName = (categoryIri: string) => {
    if (!categoryIri) return '';
    const found = categories.find((cat: any) => cat['@id'] === categoryIri || String(cat.id) === categoryIri);
    return found ? found.name : categoryIri;
  };

  // Helper to format price as requested
  const formatAdminPrice = (price: number | undefined | null) => {
    if (price === null || price === undefined) return "N/A";
    return price.toLocaleString("fr-FR", { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + " TND";
  };

  // Function to get status color
  const getStatusColor = (status: string) => {
    const colors = {
      pending: "text-amber-500 font-bold",
      confirmed: "text-teal-600 font-bold",
      processing: "text-indigo-500 font-bold",
      shipped: "text-violet-500 font-bold",
      delivered: "text-emerald-500 font-bold",
      cancelled: "text-rose-500 font-bold",
    };
    return colors[status as keyof typeof colors] || "text-slate-500 font-bold";
  };

  // Handler to update order status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    
    if (updatingOrderStatus === orderId) return; // Prevent double clicks
    
    setUpdatingOrderStatus(orderId);
    try {
      // Get the current order to check previous status
      const currentOrder = adminOrders.find(order => order.id === orderId);
      if (!currentOrder) {
        console.log(`Order ${orderId} not found in adminOrders`);
        return;
      }
      
      const previousStatus = currentOrder.status;
      console.log(`Order ${orderId} status change: ${previousStatus} -> ${status}`);
      console.log('Current order object:', currentOrder);
      console.log('Order items:', currentOrder.items);
      
      // Update the order status in the backend
      await updateOrder(orderId, { status });
      
      
      // Handle stock updates based on status changes
      if (status === 'confirmed' && previousStatus !== 'confirmed') {
        // Remove quantities from stock when order is confirmed
        await updateProductStockForOrder(currentOrder, 'decrease');
      } else if (previousStatus === 'confirmed' && status !== 'confirmed') {
        // Re-add quantities to stock when order status changes from confirmed to something else
        await updateProductStockForOrder(currentOrder, 'increase');
      } else {
      }
      // No stock changes for pending <-> cancelled transitions
      
      // Update the local state
      setAdminOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );
      
      // Refresh products to get updated stock
      await fetchData();
      
      // Show success message
      setActionMessage({
        type: "success",
        text: `Order status updated to ${status}`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      // Show error message
      setActionMessage({
        type: "error",
        text: "Failed to update order status",
      });
    } finally {
      setUpdatingOrderStatus(null);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  // Function to update product stock based on order status changes
  const updateProductStockForOrder = async (order: any, action: 'increase' | 'decrease') => {
    try {
      for (const item of order.items) {
        // Support both productId and ProductId keys
        const productId = item.productId || item.ProductId;
        const product = adminProducts.find(p => p.id === String(productId));
        if (product) {
          // Update main product stock as before
          const oldStock = product.stock;
          const newStock = action === 'decrease' 
            ? Math.max(0, product.stock - item.quantity)
            : product.stock + item.quantity;

          // Prepare updated sizes array if applicable
          let updatedSizes = Array.isArray(product.sizes) ? [...product.sizes] : undefined;
          if (item.size && updatedSizes) {
            updatedSizes = updatedSizes.map(sizeObj => {
              if (
                (sizeObj.id && item.size && sizeObj.id === item.size) ||
                (sizeObj.name && item.size && sizeObj.name === item.size)
              ) {
                const newSizeStock = action === 'decrease'
                  ? Math.max(0, (sizeObj.stock || 0) - item.quantity)
                  : (sizeObj.stock || 0) + item.quantity;
                return { ...sizeObj, stock: newSizeStock };
              }
              return sizeObj;
            });
          }

          // Build update payload
          const updatePayload: any = { stock: newStock };
          if (updatedSizes) updatePayload.sizes = updatedSizes;

          // Update product stock and sizes in backend using productService
          try {
            const updatedProduct = await updateProduct(product.id, updatePayload);
          } catch (updateError) {
            throw updateError;
          }
          // Update local state immediately
          setAdminProducts(prev => prev.map(p => 
            p.id === product.id ? { ...p, stock: newStock, sizes: updatedSizes || p.sizes } : p
          ));
        }
      }
    } catch (error) {
      throw error;
    }
  };

  // Handler to delete order
  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrder(orderId);
      setAdminOrders((prev) => prev.filter((order) => order.id !== orderId));
    } catch (error) {
      // Optionally show a toast or error message
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    await fetch(`http://localhost:8000/api/users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setAdminUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Update note
  const handleUpdateNote = async (userId: number, note: string) => {
    await fetch(`http://localhost:8000/api/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ note }),
    });
    setAdminUsers((prev) => prev.map((u) => u.id === userId ? { ...u, note } : u));
    setEditingNoteId(null);
  };

  // User details dialog
  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };

  // Helper to format phone number as 'XX XXX XXX'
  function formatPhoneNumber(phone?: string) {
    if (!phone) return '-';
    // Remove non-digits
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 8) {
      return digits.replace(/(\d{2})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    return phone;
  }

  // ProductViewDialog styled like ProductDetailModal
  const ProductViewDialog = ({ product, isOpen, onClose }: { product: Product | null, isOpen: boolean, onClose: () => void }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [autoScroll, setAutoScroll] = useState(true);
    const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      if (!isOpen) {
        setAutoScroll(false);
        if (autoScrollRef.current) clearTimeout(autoScrollRef.current);
        return;
      }
      setAutoScroll(true);
      setCurrentImageIndex(0);
      // Reset color selection when dialog opens
      setSelectedColor(null);
    }, [isOpen, product]);

    useEffect(() => {
      if (!autoScroll || !isOpen) return;
      if (autoScrollRef.current) clearTimeout(autoScrollRef.current);
      autoScrollRef.current = setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => {
        if (autoScrollRef.current) clearTimeout(autoScrollRef.current);
      };
    }, [currentImageIndex, autoScroll, isOpen, product]);

    if (!product) return null;
    const colorOptions = Array.isArray(product.colors) ? product.colors : [];
    const sizeOptions = Array.isArray(product.sizes) ? product.sizes : [];
    // Filter images by selected color if available
    let images: string[] = [];
    if (selectedColor) {
      const colorObj = colorOptions.find(c => c.name === selectedColor);
      if (colorObj && Array.isArray(colorObj.images) && colorObj.images.length > 0) {
        images = colorObj.images;
      }
    }
    if (!images.length) {
      images = Array.isArray(product.images) && product.images.length > 0 ? product.images : ["/placeholder.svg"];
    }
    // Calculate pending/confirmed order totals for this product
    let pendingQty = 0, confirmedQty = 0;
    adminOrders.forEach(order => {
      if (!Array.isArray(order.items)) return;
      order.items.forEach(item => {
        if (String(item.productId) === String(product.id)) {
          if (order.status === 'pending') pendingQty += item.quantity;
          if (order.status === 'confirmed') confirmedQty += item.quantity;
        }
      });
    });
    // Handler for manual navigation and color click (pauses auto-scroll)
    const handleManualNav = (newIndex: number) => {
      setCurrentImageIndex(newIndex);
      setAutoScroll(false);
      if (autoScrollRef.current) clearTimeout(autoScrollRef.current);
      setTimeout(() => setAutoScroll(true), 4000);
    };
    const handleColorClick = (colorName: string) => {
      setSelectedColor(colorName);
      setCurrentImageIndex(0);
      setAutoScroll(false);
      if (autoScrollRef.current) clearTimeout(autoScrollRef.current);
      setTimeout(() => setAutoScroll(true), 4000);
    };
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center">
              {product.name}
              {product.featured && (
                <Badge className="bg-amber-500 ml-2">Featured</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Images Carousel */}
            <div className="space-y-4">
              <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={images[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
                {images.length > 1 && (
                  <>
                    <button
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow"
                      onClick={() => handleManualNav((currentImageIndex - 1 + images.length) % images.length)}
                      aria-label="Previous image"
                      style={{ zIndex: 2 }}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow"
                      onClick={() => handleManualNav((currentImageIndex + 1) % images.length)}
                      aria-label="Next image"
                      style={{ zIndex: 2 }}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <Badge variant="secondary" className="bg-gray-800 text-white">
                      Out of Stock
                    </Badge>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex space-x-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleManualNav(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        currentImageIndex === index
                          ? "border-amber-500"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
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
                    {formatPrice(product.price)}
                  </span>
                </div>
                <div className="flex items-center space-x-4 mb-4">
                  {product.stock > 0 ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {product.stock} in stock
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      Out of Stock
                    </Badge>
                  )}
                </div>
                <div className="text-gray-700 leading-relaxed mb-2">
                  {product.description}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <span className="font-semibold">Category: </span>
                  {getCategoryName(product.category)}
                </div>
              </div>
              {sizeOptions.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Sizes</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {sizeOptions.map((size) => (
                      <Badge key={size.id} className="bg-gray-100 text-gray-800 border-gray-300">{size.name} ({size.stock})</Badge>
                    ))}
                  </div>
                  {/* Color swatches as image selectors, under sizes */}
                  {(colorOptions.length > 0) && (
                    <div className="mt-2">
                      <Label className="text-sm font-medium mb-2 block">Color</Label>
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color.id}
                            onClick={() => handleColorClick(color.name)}
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 focus:outline-none relative
                              bg-white/30
                              ${selectedColor === color.name
                                ? "border-amber-500 ring-4 ring-amber-200 scale-110 shadow-amber-200"
                                : "border-gray-300 hover:border-amber-400 hover:scale-105 shadow-md"}
                            `}
                            title={color.name}
                            style={{
                              ...(getColorCircleStyle(color.value) as React.CSSProperties),
                              boxShadow: selectedColor === color.name
                                ? '0 4px 16px 0 rgba(251,191,36,0.25), 0 1px 4px 0 rgba(0,0,0,0.10) inset'
                                : '0 2px 8px 0 rgba(0,0,0,0.10), 0 1px 4px 0 rgba(0,0,0,0.10) inset',
                              overflow: 'hidden',
                            }}
                          >
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-700">Variants:</span>
                  <div className="flex flex-col gap-1 mt-1">
                    {product.variants.map((variant, idx) => (
                      <div key={idx} className="text-xs text-gray-700">
                        Color: {variant.color}, Size: {variant.size}, Stock: {variant.stock}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Pending/Confirmed Order Totals */}
              <div className="flex flex-wrap gap-4 mt-4">
                <Badge className="bg-amber-100 text-amber-800 border-amber-300">Pending Orders: {pendingQty}</Badge>
                <Badge className="bg-teal-100 text-teal-800 border-teal-300">Confirmed Orders: {confirmedQty}</Badge>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-2 justify-end mt-4">
                <Button variant="outline" onClick={() => { onClose(); handleEditProduct(product); }}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="outline" className="text-rose-600 border-rose-300" onClick={() => { onClose(); handleDeleteProduct(product.id); }}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
                <Button variant={product.featured ? "default" : "outline"} onClick={() => { onClose(); toggleProductFeatured(product.id); }}>
                  <Star className={`h-4 w-4 mr-1 ${product.featured ? 'text-amber-500' : ''}`} />
                  {product.featured ? 'Unfeature' : 'Mark as Featured'}
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-2">Product ID: {product.id}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t("admin.dashboard")}
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name}. Here's what's happening with your store.
          </p>
        </div>
        {/* Action Message */}
        {actionMessage && (
          <Alert
            className={`mb-6 ${actionMessage.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
          >
            <AlertDescription
              className={
                actionMessage.type === "success"
                  ? "text-green-800"
                  : "text-red-800"
              }
            >
              {actionMessage.text}
            </AlertDescription>
          </Alert>
        )}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>{t("admin.dashboard")}</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>{t("admin.products")}</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>{t("admin.orders")}</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>{t("admin.users")}</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Category</span>
            </TabsTrigger>
          </TabsList>
          {/* Dashboard Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Pending Orders Section */}
            <Card className="bg-gradient-to-r from-amber-50 to-mars-50 border-amber-200 shadow-md mb-6">
              <CardContent className="flex flex-col md:flex-row items-center justify-between py-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-amber-100 rounded-full p-4 flex items-center justify-center shadow">
                    <ShoppingCart className="h-10 w-10 text-mars-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-mars-700">{adminOrders.filter(order => order.status === 'pending').length}</div>
                    <div className="text-lg text-gray-700 font-medium">Pending Orders</div>
                  </div>
                </div>
                <div className="relative w-full md:w-auto mt-4 md:mt-0 flex flex-col items-end">
                  <Button
                    className="bg-mars-600 hover:bg-mars-700 text-white text-lg px-6 py-3 rounded-lg shadow"
                    onClick={() => setShowPendingDropdown(v => !v)}
                    aria-expanded={showPendingDropdown}
                    aria-controls="pending-orders-dropdown"
                  >
                    {showPendingDropdown ? 'Hide' : 'View All Pending Orders'}
                  </Button>
                  <div
                    id="pending-orders-dropdown"
                    className={`transition-all duration-300 ease-in-out overflow-hidden bg-white border border-amber-200 rounded-lg shadow-lg mt-2 w-full md:w-[32rem] ${showPendingDropdown ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
                    style={{ zIndex: 20 }}
                  >
                    <ul className="divide-y divide-amber-100">
                      {adminOrders.filter(order => order.status === 'pending').length === 0 ? (
                        <li className="p-6 text-center text-gray-400">No pending orders.</li>
                      ) : (
                        adminOrders.filter(order => order.status === 'pending').map(order => (
                          <li key={order.id} className="flex items-center justify-between px-4 py-3 hover:bg-amber-50 transition">
                            <div className="flex flex-col">
                              <span className="font-semibold text-mars-700">Order #{order.id}</span>
                              <span className="text-gray-600 text-sm">{order.customerName || 'No name'}</span>
                              <span className="text-xs text-gray-400">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-4 text-mars-600 border-mars-200 hover:bg-mars-50"
                              onClick={() => {
                                setViewingOrder(order);
                                setIsOrderViewOpen(true);
                                setShowPendingDropdown(false);
                              }}
                            >
                              View Details
                            </Button>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Statistics Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Combined Total Orders and Orders by Status */}
              <Card className="border border-mars-200 bg-white shadow-sm flex flex-col justify-between col-span-1 md:col-span-1">
                <CardContent className="flex flex-col items-center py-6 gap-6">
                  <div className="w-full flex flex-col items-center">
                    <div className="text-3xl font-bold text-mars-700 mb-1 text-center">{adminOrders.length}</div>
                    <div className="text-base text-gray-700 font-medium flex items-center gap-2 justify-center mb-4">
                      <ShoppingCart className="h-5 w-5 text-mars-600" />
                      Total Orders
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center w-full">
                    {[
                      { status: 'pending', label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
                      { status: 'confirmed', label: 'Confirmed', bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
                      { status: 'cancelled', label: 'Cancelled', bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
                    ].map(({ status, label, bg, text, border }) => (
                      <span
                        key={status}
                        className={`capitalize px-4 py-1 text-sm font-semibold rounded-full ${bg} ${text} ${border} border shadow-sm`}
                      >
                        {label}: {adminOrders.filter(o => o.status === status).length}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {/* Orders Trend Chart (last 7 days) */}
              <Card className="border border-mars-200 bg-white shadow-sm flex flex-col justify-between col-span-1 md:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-mars-700 text-base">
                    <TrendingUp className="h-5 w-5 text-indigo-500" /> Orders Trend (Last 7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-40 flex items-end">
                    {(() => {
                      // Calculate orders per day for last 7 days
                      const days = Array.from({length: 7}, (_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (6 - i));
                        return d;
                      });
                      const ordersPerDay = days.map(day =>
                        adminOrders.filter(o => {
                          const d = new Date(o.createdAt);
                          return d.toDateString() === day.toDateString();
                        }).length
                      );
                      const max = Math.max(...ordersPerDay, 1);
                      // SVG line chart
                      const width = 440; // Increased width for better fit
                      const height = 120;
                      const padding = 36;
                      const stepX = (width - 2 * padding) / (ordersPerDay.length - 1);
                      const points = ordersPerDay.map((count, i) => {
                        const x = padding + i * stepX;
                        const y = height - padding - (count / max) * (height - 2 * padding);
                        return [x, y];
                      });
                      // Line path
                      const linePath = points.map(([x, y], i) => i === 0 ? `M${x},${y}` : `L${x},${y}`).join(' ');
                      // Area path
                      const areaPath = `M${points[0][0]},${height-padding} ` +
                        points.map(([x, y]) => `L${x},${y}`).join(' ') +
                        ` L${points[points.length-1][0]},${height-padding} Z`;
                      return (
                        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} className="block mx-auto">
                          {/* Area fill */}
                          <path d={areaPath} fill="#f5e7e0" opacity="0.7" />
                          {/* Line */}
                          <path d={linePath} fill="none" stroke="#b45309" strokeWidth="3" strokeLinejoin="round" />
                          {/* Points */}
                          {points.map(([x, y], i) => (
                            <circle key={i} cx={x} cy={y} r={4} fill="#b45309" stroke="#fff" strokeWidth={1.5} />
                          ))}
                          {/* X axis labels */}
                          {days.map((day, i) => (
                            <text key={i} x={padding + i * stepX} y={height - padding + 16} textAnchor="middle" fontSize="11" fill="#888">
                              {day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </text>
                          ))}
                          {/* Y axis labels (0 and max) */}
                          <text x={padding - 8} y={height - padding + 2} textAnchor="end" fontSize="11" fill="#888">0</text>
                          <text x={padding - 8} y={padding + 2} textAnchor="end" fontSize="11" fill="#888">{max}</text>
                        </svg>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
              {/* Most Ordered Products block placed in the same row */}
              <Card className="border border-mars-200 bg-white shadow-sm flex flex-col justify-between col-span-1 md:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-mars-600" />
                    <span>Most Ordered Products</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    // Count total quantity ordered for each productId (pending + confirmed orders)
                    const productSales: Record<string, { product: any, quantity: number }> = {};
                    adminOrders.forEach(order => {
                      if (order.status !== 'pending' && order.status !== 'confirmed') return; // Only count pending and confirmed orders
                      if (Array.isArray(order.items)) {
                        order.items.forEach(item => {
                          if (!productSales[item.productId]) {
                            const prod = adminProducts.find(p => p.id === item.productId);
                            if (prod) {
                              productSales[item.productId] = { product: prod, quantity: 0 };
                            }
                          }
                          if (productSales[item.productId]) {
                            productSales[item.productId].quantity += item.quantity;
                          }
                        });
                      }
                    });
                    // Get top 5 products by quantity
                    const topProducts = Object.values(productSales)
                      .sort((a, b) => b.quantity - a.quantity)
                      .slice(0, 5);
                    if (topProducts.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Product Data</h3>
                          <p className="text-gray-600">Complete some orders to see most demanded products.</p>
                        </div>
                      );
                    }
                    return (
                      <ul className="divide-y divide-amber-100">
                        {topProducts.map(({ product, quantity }) => (
                          <li key={product.id} className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-4">
                              <img
                                src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg'}
                                alt={product.name}
                                className="w-14 h-14 object-cover rounded border"
                              />
                              <div>
                                <div className="font-semibold text-mars-700">{product.name}</div>
                                <div className="text-xs text-gray-500">ID: {product.id}</div>
                                <div className="text-xs text-gray-500">Category: {getCategoryName(product.category)}</div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className="bg-mars-50 text-mars-700 px-3 py-1 rounded-full text-sm font-semibold border border-mars-200">{quantity} ordered</span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-mars-600 border-mars-200 hover:bg-mars-50"
                                onClick={() => handleViewProduct(product)}
                              >
                                View Product
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
            {/* Product Statistics: Low Stock & Most Viewed */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Low Stock Products */}
              <Card className="border border-mars-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-mars-700 text-base">
                    <Package className="h-5 w-5 text-amber-600" />
                    Low Stock Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const lowStockProducts = adminProducts.filter(p => typeof p.stock === 'number' && p.stock <= 5);
                    if (lowStockProducts.length === 0) {
                      return <div className="text-gray-600 py-4">No products are low in stock.</div>;
                    }
                    return (
                      <ul className="divide-y divide-amber-100">
                        {lowStockProducts.map(product => (
                          <li key={product.id} className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg'}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded border"
                              />
                              <div>
                                <div className="font-semibold text-mars-700">{product.name}</div>
                                <div className="text-xs text-gray-500">ID: {product.id}</div>
                                <div className="text-xs text-gray-500">Stock: <span className="text-rose-600 font-bold">{product.stock}</span></div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-mars-600 border-mars-200 hover:bg-mars-50"
                              onClick={() => handleViewProduct(product)}
                            >
                              Restock
                            </Button>
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </CardContent>
              </Card>
              {/* Most Viewed Products */}
              <Card className="border border-mars-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-mars-700 text-base">
                    <Eye className="h-5 w-5 text-indigo-500" />
                    Most Viewed Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    // Assume each product has a 'views' property (number)
                    const mostViewed = [...adminProducts]
                      .filter(p => typeof p.views === 'number')
                      .sort((a, b) => (b.views || 0) - (a.views || 0))
                      .slice(0, 5);
                    if (mostViewed.length === 0) {
                      return <div className="text-gray-600 py-4">No view data available.</div>;
                    }
                    return (
                      <ul className="divide-y divide-amber-100">
                        {mostViewed.map(product => (
                          <li key={product.id} className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg'}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded border"
                              />
                              <div>
                                <div className="font-semibold text-mars-700">{product.name}</div>
                                <div className="text-xs text-gray-500">ID: {product.id}</div>
                                <div className="text-xs text-gray-500">Views: <span className="text-indigo-600 font-bold">{product.views}</span></div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-mars-600 border-mars-200 hover:bg-mars-50"
                              onClick={() => handleViewProduct(product)}
                            >
                              View Product
                            </Button>
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          {/* Products Tab (real data) */}
          <TabsContent value="products" className="space-y-6">
            {!showProductForm ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Products Management</CardTitle>
                  <Button
                    onClick={() => {
                      setEditingProduct(null);
                      setShowProductForm(true);
                    }}
                    className="bg-mars-600 hover:bg-mars-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Product
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Variants</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminProducts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7}>No products found.</TableCell>
                        </TableRow>
                      )}
                      {adminProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <img
                                src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '/placeholder.svg'}
                                alt={product.name}
                                className="w-10 h-10 rounded object-cover"
                              />
                              <div>
                                <div className="font-medium">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {product.id}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">
                            {getCategoryName(product.category)}
                          </TableCell>
                          <TableCell>{formatAdminPrice(product.price)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                product.stock > 0 ? "secondary" : "destructive"
                              }
                            >
                              {product.stock > 0
                                ? `${product.stock} in stock`                                : "Out of stock"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              {product.colors && product.colors.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {product.colors.length} colors
                                </Badge>
                              )}
                              {product.sizes && product.sizes.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {product.sizes.length} sizes
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {product.featured && <Badge>Featured</Badge>}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  toggleProductFeatured(product.id)
                                }
                                disabled={updatingStatus === product.id}
                                className={
                                  product.featured
                                    ? "text-amber-500 hover:text-amber-600"
                                    : "text-slate-400 hover:text-slate-600"
                                }
                                title={
                                  product.featured
                                    ? "Remove from featured"
                                    : "Mark as featured"
                                }
                              >
                                <Star className={`h-4 w-4 ${updatingStatus === product.id ? 'animate-spin' : ''}`} />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewProduct(product)}
                                title="View Product"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                                title="Edit Product"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Product
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "
                                      {product.name}"? This action cannot be
                                      undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteProduct(product.id)
                                      }
                                      className="bg-rose-500 hover:bg-rose-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <EnhancedProductForm
                onSubmit={handleProductSubmit}
                onCancel={() => {
                  setShowProductForm(false);
                  setEditingProduct(null);
                }}
                initialProduct={editingProduct || undefined}
              />
            )}
          </TabsContent>
          {/* Orders Tab (mocked) */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Orders Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminOrders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={10}>No orders found.</TableCell>
                      </TableRow>
                    )}
                    {adminOrders
                      // Sort orders: pending (oldest first), then confirmed, then cancelled
                      .slice() // copy to avoid mutating state
                      .sort((a, b) => {
                        // 1. Pending first (oldest first)
                        if (a.status === 'pending' && b.status !== 'pending') return -1;
                        if (a.status !== 'pending' && b.status === 'pending') return 1;
                        if (a.status === 'pending' && b.status === 'pending') {
                          // Oldest first
                          return new Date(a.createdAt) - new Date(b.createdAt);
                        }
                        // 2. Confirmed next
                        if (a.status === 'confirmed' && b.status !== 'confirmed') return -1;
                        if (a.status !== 'confirmed' && b.status === 'confirmed') return 1;
                        // 3. Cancelled last (or any other status)
                        return 0;
                      })
                      .map((order, orderIdx) => (
                        order.items.map((item, idx) => {
                          const isFirst = idx === 0;
                          const rowClass = isFirst ? '' : 'border-t border-gray-200';
                          const rowStyle = isFirst ? { borderTop: '4px solid #9ca3af' } : {};
                          return (
                            <TableRow key={order.id + '-' + idx} className={rowClass} style={rowStyle}>
                              {isFirst && (
                                <TableCell rowSpan={order.items.length} className="align-middle text-lg font-bold">{order.id}</TableCell>
                              )}
                              {isFirst && (
                                <TableCell rowSpan={order.items.length} className="align-middle">{order.customerName}</TableCell>
                              )}
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  {item.productImage && (
                                    <img src={item.productImage} alt={item.productName} className="w-8 h-8 object-cover rounded" />
                                  )}
                                  <span className="font-medium">{item.productName}</span>
                                </div>
                              </TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>
                                {item.color ? (
                                  <span style={{ ...getColorCircleStyle(item.color), borderRadius: '50%', display: 'inline-block', width: 20, height: 20 }} title={item.color}></span>
                                ) : '-'}
                              </TableCell>
                              <TableCell>
                                {item.size ? (
                                  <span style={{ borderRadius: '50%', border: '1px solid #ccc', padding: '0 8px' }}>{item.size}</span>
                                ) : '-'}
                              </TableCell>
                              {isFirst && (
                                <TableCell rowSpan={order.items.length} className="align-middle">{formatPrice(order.total)}</TableCell>
                              )}
                              {isFirst && (
                                <TableCell rowSpan={order.items.length} className="align-middle">
                                  <div className="flex items-center space-x-2">
                                    <span className={getStatusColor(order.status)}>{order.status}</span>
                                    {/* Confirm Button */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                                      title="Confirm Order"
                                      disabled={updatingOrderStatus === order.id}
                                      className={order.status === 'confirmed' ? 'text-teal-600' : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50'}
                                    >
                                      <CheckCircle className={`h-4 w-4 ${updatingOrderStatus === order.id ? 'animate-spin' : ''}`} />
                                    </Button>
                                    {/* Pending Button */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleUpdateOrderStatus(order.id, 'pending')}
                                      title="Mark as Pending"
                                      disabled={updatingOrderStatus === order.id}
                                      className={order.status === 'pending' ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}
                                    >
                                      <Clock className={`h-4 w-4 ${updatingOrderStatus === order.id ? 'animate-spin' : ''}`} />
                                    </Button>
                                    {/* Cancel Button */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                      title="Cancel Order"
                                      disabled={updatingOrderStatus === order.id}
                                      className={order.status === 'cancelled' ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'}
                                    >
                                      <XCircle className={`h-4 w-4 ${updatingOrderStatus === order.id ? 'animate-spin' : ''}`} />
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                              {isFirst && (
                                <TableCell rowSpan={order.items.length} className="align-middle">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                              )}
                              {isFirst && (
                                <TableCell rowSpan={order.items.length} className="align-middle">
                                  <div className="flex items-center space-x-2">
                                    {/* Delete Button */}
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                          title="Delete Order"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Delete Order
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete order #{order.id}? This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            Cancel
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteOrder(order.id)}
                                            className="bg-rose-500 hover:bg-rose-600"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                    {/* View Details Button */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setViewingOrder(order);
                                        setIsOrderViewOpen(true);
                                      }}
                                      title="View Details"
                                    >
                                      <Eye className="h-4 w-4 text-mars-600" />
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Users Tab (real data) */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Users Management</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div>Loading users...</div>
                ) : (
                  <Table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="py-3 px-4 text-left">ID</TableHead>
                        <TableHead className="py-3 px-4 text-left">Name</TableHead>
                        <TableHead className="py-3 px-4 text-left">Phone</TableHead>
                        <TableHead className="py-3 px-4 text-left">Pending Orders</TableHead>
                        <TableHead className="py-3 px-4 text-left">Note</TableHead>
                        <TableHead className="py-3 px-4 text-left">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminUsers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-gray-400">No users found.</TableCell>
                        </TableRow>
                      )}
                      {adminUsers.map((user, idx) => (
                        <TableRow
                          key={user.id}
                          className={
                            idx % 2 === 0
                              ? "bg-white hover:bg-gray-50 transition"
                              : "bg-gray-50 hover:bg-gray-100 transition"
                          }
                        >
                          <TableCell className="py-3 px-4 font-mono text-xs text-gray-500">{user.id}</TableCell>
                          <TableCell className="py-3 px-4"><span className="font-medium text-gray-900">{user.name}</span></TableCell>
                          <TableCell className="py-3 px-4 text-gray-700">{formatPhoneNumber(user.phone)}</TableCell>
                          <TableCell className="py-3 px-4 font-semibold text-mars-600 flex items-center gap-2 justify-center">
                            {user.pendingOrders}
                            <Button size="sm" variant="ghost" title="View Pending Orders" onClick={() => { setPendingOrdersDialogUser(user); setIsPendingOrdersDialogOpen(true); }}>
                              <Eye className="h-4 w-4 text-mars-600" />
                            </Button>
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="p-1"
                              onClick={() => { setSelectedUser(user); setIsNoteDialogOpen(true); setNoteEditMode(false); setNoteInput(user.note || ''); }}
                              title={user.note ? 'Edit Note' : 'Add Note'}
                            >
                              <Edit className={`h-5 w-5 ${user.note ? 'text-mars-600' : 'text-gray-400'}`} />
                            </Button>
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost" onClick={() => handleViewUser(user)} title="View Details">
                                <Eye className="h-4 w-4 text-mars-600" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteUser(user.id)} title="Delete User">
                                <Trash2 className="h-4 w-4 text-rose-500" />
                              </Button>
                </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            {/* User details dialog */}
            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>User Details</DialogTitle>
                </DialogHeader>
                {selectedUser && (
                  <div className="space-y-2">
                    <div><b>ID:</b> {selectedUser.id}</div>
                    <div><b>Name:</b> {selectedUser.name}</div>
                    <div><b>Email:</b> {selectedUser.email || '-'}</div>
                    <div><b>Phone:</b> {selectedUser.phone || '-'}</div>
                    <div><b>Address:</b> {selectedUser.address || '-'}</div>
                    <div><b>Roles:</b> {selectedUser.roles ? selectedUser.roles.join(", ") : '-'}</div>
                    <div><b>Created At:</b> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : '-'}</div>
                    <div><b>Pending Orders:</b> {selectedUser.pendingOrders}</div>
                    <div><b>Note:</b> {selectedUser.note || '-'}</div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            {/* Note Dialog */}
            <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
              <DialogContent className="max-w-md w-full">
                <DialogHeader>
                  <DialogTitle>User Note</DialogTitle>
                </DialogHeader>
                {selectedUser && (
                  <div className="flex flex-col gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[120px] border text-gray-800 text-lg whitespace-pre-wrap">
                      {noteEditMode ? (
                        <textarea
                          className="w-full min-h-[100px] border rounded p-2 focus:ring-2 focus:ring-mars-200"
                          value={noteInput}
                          onChange={e => {
                            if (e.target.value.length <= 100) setNoteInput(e.target.value);
                          }}
                          maxLength={100}
                          autoFocus
                        />
                      ) : (
                        selectedUser.note ? selectedUser.note : <span className="text-gray-400 italic">No note for this user.</span>
                      )}
                    </div>
                    <div className="text-right text-xs text-gray-500 mt-1">{noteInput.length}/100</div>
                    <div className="flex justify-end gap-2">
                      {noteEditMode ? (
                        <>
                          <Button size="sm" className="bg-mars-600 text-white hover:bg-mars-700" onClick={async () => { await handleUpdateNote(selectedUser.id, noteInput); setNoteEditMode(false); setIsNoteDialogOpen(false); }}>Done</Button>
                          <Button size="sm" variant="outline" onClick={() => { setNoteInput(selectedUser.note || ''); setNoteEditMode(false); }}>Cancel</Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setNoteEditMode(true)}>Edit</Button>
                      )}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>
          {/* Settings Tab (real components) */}
          <TabsContent value="settings" className="space-y-6">
            <CategoryManager />
          </TabsContent>
        </Tabs>
      </div>
      {/* Order Details Dialog */}
      <OrderViewDialog 
        order={viewingOrder} 
        isOpen={isOrderViewOpen} 
        onClose={() => {
          setIsOrderViewOpen(false);
          setViewingOrder(null);
        }}
        onUpdateStatus={handleUpdateOrderStatus}
        onDeleteOrder={handleDeleteOrder}
        updatingStatus={updatingOrderStatus}
        adminProducts={adminProducts}
      />
      {/* Product Details Dialog */}
      <ProductViewDialog
        product={viewingProduct}
        isOpen={isProductViewOpen}
        onClose={() => {
          setIsProductViewOpen(false);
          setViewingProduct(null);
        }}
      />
      {/* Edit Product Dialog */}
      <EditProductDialog
        product={editingProduct}
        isOpen={editDialogOpen}
        onClose={() => { setEditDialogOpen(false); setEditingProduct(null); }}
        onSave={handleSaveEditProduct}
      />
      {/* Pending Orders Dialog */}
      <Dialog open={isPendingOrdersDialogOpen} onOpenChange={setIsPendingOrdersDialogOpen}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>Pending Orders for {pendingOrdersDialogUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminOrders.filter(order => order.status === 'pending' && order.user && order.user.id === pendingOrdersDialogUser?.id).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6 text-gray-400">No pending orders for this user.</TableCell>
                  </TableRow>
                ) : (
                  adminOrders.filter(order => order.status === 'pending' && order.user && order.user.id === pendingOrdersDialogUser?.id).map((order, orderIdx) => (
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
                              {item.productImage && (
                                <img src={item.productImage} alt={item.productName} className="w-8 h-8 object-cover rounded" />
                              )}
                              <span className="font-medium">{item.productName}</span>
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            {item.color ? (
                              <span style={{ ...getColorCircleStyle(item.color), borderRadius: '50%', display: 'inline-block', width: 20, height: 20 }} title={item.color}></span>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            {item.size ? (
                              <span style={{ borderRadius: '50%', border: '1px solid #ccc', padding: '0 8px' }}>{item.size}</span>
                            ) : '-'}
                          </TableCell>
                          {isFirst && (
                            <TableCell rowSpan={order.items.length} className="align-middle">{formatPrice(order.total)}</TableCell>
                          )}
                          {isFirst && (
                            <TableCell rowSpan={order.items.length} className="align-middle">
                              <span className={getStatusColor(order.status)}>{order.status}</span>
                            </TableCell>
                          )}
                          {isFirst && (
                            <TableCell rowSpan={order.items.length} className="align-middle">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</TableCell>
                          )}
                          {isFirst && (
                            <TableCell rowSpan={order.items.length} className="align-middle">
                              <div className="flex items-center space-x-2">
                                {/* Delete Button */}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                      title="Delete Order"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Order
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete order #{order.id}? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteOrder(order.id)}
                                        className="bg-rose-500 hover:bg-rose-600"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                {/* View Details Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setViewingOrder(order);
                                    setIsOrderViewOpen(true);
                                  }}
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4 text-mars-600" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;

