import { Product, Category, Order } from "@/types";

export const categories: Category[] = [
  {
    id: "electronics",
    name: "Electronics",
    description: "Latest gadgets and electronic devices",
    icon: "📱",
  },
  {
    id: "fashion",
    name: "Fashion",
    description: "Trendy clothing and accessories",
    icon: "👕",
  },
  {
    id: "home",
    name: "Home & Garden",
    description: "Home decor and garden essentials",
    icon: "🏠",
  },
  {
    id: "sports",
    name: "Sports",
    description: "Sports equipment and fitness gear",
    icon: "⚽",
  },
  {
    id: "books",
    name: "Books",
    description: "Books and educational materials",
    icon: "📚",
  },
  {
    id: "beauty",
    name: "Beauty",
    description: "Cosmetics and personal care",
    icon: "💄",
  },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Wireless Bluetooth Headphones",
    description:
      "High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
    price: 270.5,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop",
    ],
    category: "electronics",
    stock: 15,
    featured: true,
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "2",
    name: "Smart Watch Pro",
    description:
      "Advanced smartwatch with health monitoring, GPS tracking, and 7-day battery life. Compatible with all smartphones.",
    price: 750.0,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500&h=500&fit=crop",
    ],
    category: "electronics",
    stock: 8,
    featured: true,
    createdAt: "2024-01-10T00:00:00Z",
  },
  {
    id: "3",
    name: "Premium Cotton T-Shirt",
    description:
      "Comfortable and stylish cotton t-shirt available in multiple colors. Made from 100% organic cotton.",
    price: 75.0,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&h=500&fit=crop",
    ],
    category: "fashion",
    stock: 25,
    featured: false,
    createdAt: "2024-01-20T00:00:00Z",
  },
  {
    id: "4",
    name: "Designer Sunglasses",
    description:
      "Stylish sunglasses with UV protection and polarized lenses. Perfect for outdoor activities and fashion.",
    price: 240.0,
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&h=500&fit=crop",
    ],
    category: "fashion",
    stock: 12,
    featured: true,
    createdAt: "2024-01-18T00:00:00Z",
  },
  {
    id: "5",
    name: "Coffee Maker Deluxe",
    description:
      "Programmable coffee maker with built-in grinder and thermal carafe. Makes perfect coffee every time.",
    price: 480.0,
    images: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1559305616-ee3822c46b5b?w=500&h=500&fit=crop",
    ],
    category: "home",
    stock: 6,
    featured: false,
    createdAt: "2024-01-12T00:00:00Z",
  },
  {
    id: "6",
    name: "Yoga Mat Pro",
    description:
      "Non-slip yoga mat with extra cushioning and carrying strap. Eco-friendly and durable material.",
    price: 120.0,
    images: [
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1506629905607-d7f8b4e7f21c?w=500&h=500&fit=crop",
    ],
    category: "sports",
    stock: 20,
    featured: false,
    createdAt: "2024-01-25T00:00:00Z",
  },
  {
    id: "7",
    name: "Programming Guide Book",
    description:
      "Comprehensive guide to modern programming languages and best practices. Perfect for beginners and professionals.",
    price: 138.0,
    images: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop",
    ],
    category: "books",
    stock: 30,
    featured: false,
    createdAt: "2024-01-22T00:00:00Z",
  },
  {
    id: "8",
    name: "Luxury Face Cream",
    description:
      "Anti-aging face cream with natural ingredients and SPF protection. Suitable for all skin types.",
    price: 210.0,
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop",
    ],
    category: "beauty",
    stock: 18,
    featured: true,
    createdAt: "2024-01-28T00:00:00Z",
  },
  {
    id: "9",
    name: "Gaming Laptop",
    description:
      "High-performance gaming laptop with RTX graphics and 16GB RAM. Perfect for gaming and professional work.",
    price: 3900.0,
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500&h=500&fit=crop",
    ],
    category: "electronics",
    stock: 4,
    featured: true,
    createdAt: "2024-01-30T00:00:00Z",
  },
  {
    id: "10",
    name: "Wireless Charging Pad",
    description:
      "Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicators.",
    price: 90.0,
    images: [
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&h=500&fit=crop",
    ],
    category: "electronics",
    stock: 22,
    featured: false,
    createdAt: "2024-02-01T00:00:00Z",
  },
];

export const mockOrders: Order[] = [
  {
    id: "1",
    userId: "2",
    customerName: "John Doe",
    customerPhone: "+1987654321",
    customerAddress: "456 Customer Ave, Earth City",
    items: [
      {
        productId: "1",
        quantity: 1,
        price: 270.5,
        product: products[0],
      },
    ],
    total: 270.5,
    status: "pending",
    createdAt: "2024-02-01T10:30:00Z",
  },
  {
    id: "2",
    customerName: "Alice Smith",
    customerPhone: "+1555123456",
    customerAddress: "789 Main Street, Luna City",
    items: [
      {
        productId: "2",
        quantity: 1,
        price: 750.0,
        product: products[1],
      },
      {
        productId: "4",
        quantity: 2,
        price: 240.0,
        product: products[3],
      },
    ],
    total: 1230.0,
    status: "confirmed",
    createdAt: "2024-02-01T14:15:00Z",
  },
];
