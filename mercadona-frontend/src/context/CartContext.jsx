// src/context/CartContext.jsx
// Carrito basado en localStorage — funciona sin cookies de sesión
// Almacena { productId: { quantity, name, price, thumbnail, unit_price, display_name } }

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

const CartContext = createContext();
const CART_KEY = 'mercadona_cart';

export function useCart() {
  return useContext(CartContext);
}

// Leer carrito de localStorage
function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Guardar carrito en localStorage
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);

  // Derivar datos del carrito
  const cartItems = Object.values(cart);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Persistir en localStorage cada vez que cambia
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  // Añadir producto — necesita datos del producto para mostrar en el carrito
  async function addItem(productId, quantity = 1, productData = null) {
    setCart(prev => {
      const existing = prev[productId];

      if (existing) {
        // Ya existe: solo incrementar cantidad
        return {
          ...prev,
          [productId]: { ...existing, quantity: existing.quantity + quantity },
        };
      }

      // Nuevo producto: guardar datos para mostrar en CartPage
      // Si no vienen datos, los rellenamos después
      const newItem = {
        id: productId,
        quantity,
        name: productData?.display_name || productData?.name || '',
        display_name: productData?.display_name || productData?.name || '',
        price: productData?.price || 0,
        unit_price: productData?.unit_price || '',
        thumbnail: productData?.thumbnail || '',
      };

      return { ...prev, [productId]: newItem };
    });

    // Si no teníamos datos del producto, obtenerlos de la API
    setCart(prev => {
      if (prev[productId] && (!prev[productId].name || prev[productId].price === 0)) {
        // Fetch asíncrono para rellenar datos
        api.getProductDetail(productId).then(product => {
          const price = parseFloat(
            String(product.price_instructions?.unit_price || '0')
              .replace(',', '.').replace('€', '').trim()
          ) || 0;

          setCart(current => ({
            ...current,
            [productId]: {
              ...current[productId],
              name: product.display_name,
              display_name: product.display_name,
              price,
              unit_price: product.price_instructions?.unit_price || '',
              thumbnail: product.thumbnail || product.photos?.[0]?.regular || '',
            },
          }));
        }).catch(console.error);
      }
      return prev;
    });
  }

  // Actualizar cantidad
  function updateItem(productId, quantity) {
    setCart(prev => {
      if (!prev[productId]) return prev;
      if (quantity <= 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: { ...prev[productId], quantity } };
    });
  }

  // Eliminar producto
  function removeItem(productId) {
    setCart(prev => {
      const { [productId]: _, ...rest } = prev;
      return rest;
    });
  }

  // Vaciar carrito completo
  function clearAllItems() {
    setCart({});
    localStorage.removeItem(CART_KEY);
  }

  // Refresh — no-op para compatibilidad con componentes existentes
  function refreshCart() {}

  return (
    <CartContext.Provider
      value={{
        cartCount, cartItems, cartTotal, cart,
        addItem, updateItem, removeItem, clearAllItems, refreshCart,
        // Setters por compatibilidad
        setCartCount: () => {},
        setCartItems: () => {},
        setCartTotal: () => {},
      }}
    >
      {children}
    </CartContext.Provider>
  );
}