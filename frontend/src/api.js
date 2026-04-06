// src/api.js
import axios from 'axios';

const BASE = 'http://localhost:8080/api';

const api = axios.create({ baseURL: BASE });

// Products
export const getProducts = () => api.get('/products');
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const getLowStock = () => api.get('/products/low-stock');

// Customers
export const getCustomers = () => api.get('/customers');
export const createCustomer = (data) => api.post('/customers', data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

// Invoices
export const getInvoices = () => api.get('/invoices');
export const getInvoice = (id) => api.get(`/invoices/${id}`);
export const createInvoice = (data) => api.post('/invoices', data);
export const getInvoicesByRange = (from, to) =>
  api.get(`/invoices/range?from=${from}&to=${to}`);

// Reports
export const getDashboard = () => api.get('/reports/dashboard');
export const getGstReport = (from, to) =>
  api.get(`/reports/gst-summary?from=${from}&to=${to}`);

export default api;
