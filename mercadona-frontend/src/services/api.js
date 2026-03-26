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

// ---- CARRITO ----
export const getCart = () =>
  api.get('/api/v1/cart').then(res => res.data);

export const addToCart = (productId, quantity = 1) =>
  api.post('/api/v1/cart/add', { product_id: productId, quantity }).then(res => res.data);

export const updateCartItem = (productId, quantity) =>
  api.post('/api/v1/cart/update', { product_id: productId, quantity }).then(res => res.data);

// Eliminar un producto usando el endpoint ORIGINAL de tu main.py (/cart/update con FormData)
// Este endpoint SIEMPRE existe porque es el que usa tu versión Jinja2
export async function removeFromCart(productId) {
  const formData = new FormData();
  formData.append('product_id', productId);
  formData.append('quantity', '0');
  formData.append('action', 'delete');
  return api.post('/cart/update', formData).then(res => res.data);
}

// Intentar vaciar con el endpoint nuevo, si falla usar el original
export async function clearCart() {
  try {
    return await api.post('/api/v1/cart/clear').then(res => res.data);
  } catch {
    // Endpoint no existe → no hacer nada, CartContext eliminará uno a uno
    throw new Error('clearCart endpoint not available');
  }
}