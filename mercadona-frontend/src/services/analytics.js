// src/services/analytics.js
// Funciones centralizadas para eventos de Google Analytics 4
// gtag() se carga globalmente desde index.html

function gtag(...args) {
  if (typeof window.gtag === 'function') {
    window.gtag(...args);
  }
}

// Cuando el usuario ve un producto (ficha de producto)
export function trackViewItem(product) {
  const price = extractPrice(product);
  gtag('event', 'view_item', {
    currency: 'EUR',
    value: price,
    items: [{
      item_id: product.id,
      item_name: product.display_name,
      item_brand: product.brand || 'Hacendado',
      price,
      quantity: 1,
    }],
  });
}

// Cuando añade un producto al carrito
export function trackAddToCart(product, quantity = 1) {
  const price = extractPrice(product);
  gtag('event', 'add_to_cart', {
    currency: 'EUR',
    value: price * quantity,
    items: [{
      item_id: product.id,
      item_name: product.display_name || product.name,
      item_brand: product.brand || 'Hacendado',
      price,
      quantity,
    }],
  });
}

// Cuando inicia el checkout
export function trackBeginCheckout(items, total) {
  gtag('event', 'begin_checkout', {
    currency: 'EUR',
    value: total,
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name || item.display_name,
      price: item.price,
      quantity: item.quantity,
      currency: 'EUR',
    })),
  });
}

// Cuando completa la compra
export function trackPurchase(transactionId, items, total, shipping) {
  const subtotal = total - shipping;
  gtag('event', 'purchase', {
    transaction_id: transactionId,
    value: total,
    tax: Math.round(subtotal * 0.21 * 100) / 100,
    shipping,
    currency: 'EUR',
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
      currency: 'EUR',
    })),
  });
}

function extractPrice(product) {
  const raw = product.price_instructions?.unit_price
    || product.unit_price
    || product.price
    || '0';
  return parseFloat(String(raw).replace(',', '.').replace('€', '').trim()) || 0;
}