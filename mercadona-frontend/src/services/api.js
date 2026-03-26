// src/services/api.js
import axios from 'axios';

const API_BASE = 'https://mercaapi.automaworks.es';

const api = axios.create({
  baseURL: API_BASE,
});

// ---- CATEGORÍAS ----
export const getCategories = () =>
  api.get('/api/v1/categories').then(res => res.data);

export const getCategoryProducts = (categoryId) =>
  api.get(`/api/v1/categories/${categoryId}`).then(res => res.data);

// ---- PRODUCTOS ----
export const getProductDetail = (productId) =>
  api.get(`/api/v1/products/${productId}`).then(res => res.data);

// ---- BÚSQUEDA ----
export const searchProducts = (query) =>
  api.get('/api/v1/buscar', { params: { query } }).then(res => res.data);