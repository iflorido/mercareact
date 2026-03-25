// src/context/CartContext.jsx

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartCount, setCartCount]   = useState(0);
  const [cartItems, setCartItems]   = useState([]);
  const [cartTotal, setCartTotal]   = useState(0);

  const refreshCart = useCallback(async () => {
    try {
      const data = await api.getCart();
      setCartItems(data.items || []);
      setCartTotal(data.total || 0);
      setCartCount(data.count || 0);
    } catch (err) {
      console.error('Error cargando carrito:', err);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  async function addItem(productId, quantity = 1) {
    await api.addToCart(productId, quantity);
    await refreshCart();
  }

  async function updateItem(productId, quantity) {
    await api.updateCartItem(productId, quantity);
    await refreshCart();
  }

  async function removeItem(productId) {
    await api.removeFromCart(productId);
    await refreshCart();
  }

  // ★ Vaciar carrito: intenta /cart/clear, si falla elimina uno a uno
  async function clearAllItems() {
    try {
      // Intentar el endpoint directo primero
      await api.clearCart();
    } catch (err) {
      // Si no existe el endpoint, eliminar cada producto con el endpoint que SÍ existe
      console.warn('clearCart endpoint no disponible, eliminando uno a uno...');
      for (const item of cartItems) {
        try {
          await api.removeFromCart(item.id);
        } catch (e) {
          console.warn('Error eliminando item:', item.id, e);
        }
      }
    }

    // Limpiar estado local
    setCartItems([]);
    setCartTotal(0);
    setCartCount(0);
  }

  return (
    <CartContext.Provider
      value={{
        cartCount, cartItems, cartTotal,
        addItem, updateItem, removeItem, clearAllItems, refreshCart,
        setCartCount, setCartItems, setCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}