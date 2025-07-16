import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const getCategories = async () => {
  const response = await axios.get(`${API_URL}/api/categories`);
  // Support both API Platform v3+ (member) and Hydra (hydra:member) formats
  if (Array.isArray(response.data.member)) {
    return response.data.member;
  }
  if (Array.isArray(response.data["hydra:member"])) {
    return response.data["hydra:member"];
  }
  return response.data || [];
};

export const createCategory = async (categoryData: any) => {
  const response = await axios.post(`${API_URL}/api/categories`, categoryData);
  return response.data;
};

export const updateCategory = async (id: string, categoryData: any) => {
  const response = await axios.put(`${API_URL}/api/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const response = await axios.delete(`${API_URL}/api/categories/${id}`);
  return response.data;
}; 