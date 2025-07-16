import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const getOrders = async () => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await axios.get(`${API_URL}/api/orders`, { headers });
  return response.data;
};

export const getOrder = async (id: string) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await axios.get(`${API_URL}/api/orders/${id}`, { headers });
  return response.data;
};

export const createOrder = async (orderData: any) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/ld+json'
  };
  const token = localStorage.getItem('token');
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await axios.post(`${API_URL}/api/orders`, orderData, { headers });
  return response.data;
};

export const updateOrder = async (id: string, orderData: any) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await axios.put(`${API_URL}/api/admin/orders/${id}`, orderData, { headers });
  return response.data;
};

export const deleteOrder = async (id: string) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await axios.delete(`${API_URL}/api/admin/orders/${id}`, { headers });
  return response.data;
};

export const getAllOrders = async () => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await axios.get(`${API_URL}/api/admin/orders`, { headers });
  return response.data;
}; 

export const getMyOrders = async () => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await axios.get(`${API_URL}/api/my-orders`, { headers });
  return response.data;
};

export const confirmOrder = async (id: string) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await axios.patch(`${API_URL}/api/admin/orders/${id}/confirm`, {}, { headers });
  return response.data;
};

export const setOrderPending = async (id: string) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await axios.patch(`${API_URL}/api/admin/orders/${id}/pending`, {}, { headers });
  return response.data;
};

export const cancelOrder = async (id: string) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await axios.patch(`${API_URL}/api/admin/orders/${id}/cancel`, {}, { headers });
  return response.data;
}; 