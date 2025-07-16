import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { CartItem, Product } from "@/types";
import { useAuth } from "./AuthContext";
import { getProducts } from "@/services/productService";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number, color?: string | string[], size?: string, colorName?: string | string[]) => void;
  removeItem: (uniqueId: string) => void;
  updateQuantity: (uniqueId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  guestMessage: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Simple deep compare for arrays of objects
function deepEqual(a: any, b: any): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loadedItems, setLoadedItems] = useState<CartItem[]>([]);
  const [guestMessage, setGuestMessage] = useState<string | null>(null);
  const [cartLoaded, setCartLoaded] = useState(false);
  const isFirstSync = useRef(true);

  // Fetch cart on mount
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("token");
      fetch("http://localhost:8000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then(async (data) => {
          if (Array.isArray(data.items)) {
            try {
              const products = await getProducts();
              const enriched = data.items.map((item: any) => {
                const product = products.find((p: any) => p.id === item.productId);
                return {
                  ...item,
                  availableColors: product?.colors || [],
                  availableSizes: product?.sizes || [],
                };
              });
              setItems(enriched);
              setLoadedItems(enriched);
            } catch {
              setItems(data.items);
              setLoadedItems(data.items);
            }
          } else {
            setItems([]);
            setLoadedItems([]);
          }
          setCartLoaded(true);
        })
        .catch(() => {
          setItems([]);
          setLoadedItems([]);
          setCartLoaded(true);
        });
    } else {
    const savedCart = localStorage.getItem("mars-shop-cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
            setLoadedItems(parsedCart);
        } else {
            localStorage.removeItem("mars-shop-cart");
            setItems([]);
            setLoadedItems([]);
          }
        } catch {
          localStorage.removeItem("mars-shop-cart");
          setItems([]);
          setLoadedItems([]);
        }
      } else {
        setItems([]);
        setLoadedItems([]);
      }
      setCartLoaded(true);
    }
  }, [isAuthenticated]);

  // Sync cart on change, but only after cartLoaded is true and if items changed
  useEffect(() => {
    if (!cartLoaded) return;
    if (deepEqual(items, loadedItems)) return; // Only sync if items changed
    if (isAuthenticated) {
      const token = localStorage.getItem("token");
      fetch("http://localhost:8000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items }),
      }).then(() => setLoadedItems(items));
    } else {
    if (items.length > 0) {
    localStorage.setItem("mars-shop-cart", JSON.stringify(items));
      } else {
      localStorage.removeItem("mars-shop-cart");
      }
      setLoadedItems(items);
    }
  }, [items, isAuthenticated, cartLoaded, loadedItems]);

  const addItem = (product: Product, quantity: number, color?: string | string[], size?: string, colorName?: string | string[]) => {
    if (!isAuthenticated) {
      setGuestMessage("Please log in to use the cart.");
      return;
    }
    setItems((currentItems) => {
      const newItem: CartItem = {
        productId: product.id,
        quantity,
        name: product.name,
        price: product.price,
        image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '/placeholder.svg',
        color,
        colorName,
        size,
        uniqueId: `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      return [...currentItems, newItem];
    });
  };

  const removeItem = (uniqueId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.uniqueId !== uniqueId)
    );
  };

  const updateQuantity = (uniqueId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(uniqueId);
      return;
    }
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.uniqueId === uniqueId ? { ...item, quantity } : item
      ),
    );
  };

  const clearCart = () => {
    if (isAuthenticated) {
      const token = localStorage.getItem("token");
      fetch("http://localhost:8000/api/cart", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    setItems([]);
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        guestMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
