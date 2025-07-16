import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export const getProducts = async () => {
  const response = await fetch(`${apiUrl}/api/products`);
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  const data = await response.json();
  // Support both API Platform and Hydra formats
  return data.member || data['hydra:member'] || data || [];
};

export const getProduct = async (id: string) => {
  const response = await axios.get(`${apiUrl}/api/products/${id}`);
  return response.data;
};

export const createProduct = async (productData: any) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    "Content-Type": "application/ld+json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(`${apiUrl}/api/products`, {
    method: "POST",
    headers,
    body: JSON.stringify(productData),
  });
  if (!response.ok) {
    throw new Error("Failed to create product");
  }
  return response.json();
};

export const updateProduct = async (productId: string, productData: any) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    "Content-Type": "application/ld+json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  try {
    const response = await fetch(`${apiUrl}/api/products/${productId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error("Failed to update product");
    }
    const result = await response.json();
    return result;
  } catch (error: any) {
    throw error;
  }
};

export const deleteProduct = async (productId: string) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(`${apiUrl}/api/products/${productId}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) {
    throw new Error("Failed to delete product");
  }
  return response.ok;
};

export const incrementProductViews = async (id: string) => {
  const response = await fetch(`${apiUrl}/api/products/${id}/view`, { method: 'POST' });
  if (!response.ok) {
    throw new Error('Failed to increment product views');
  }
  return response.json();
}; 
