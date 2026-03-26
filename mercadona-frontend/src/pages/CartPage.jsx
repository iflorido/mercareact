// src/pages/CartPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { slugify } from '../utils';

export default function CartPage() {
  const { cartItems, cartTotal, updateItem, removeItem } = useCart();

  const [quantities, setQuantities] = useState(() => {
    const initial = {};
    cartItems.forEach(item => { initial[item.id] = item.quantity; });
    return initial;
  });

  function handleQuantityChange(productId, value) {
    setQuantities(prev => ({ ...prev, [productId]: value }));
  }

  async function handleUpdate(productId) {
    const newQty = parseInt(quantities[productId]) || 1;
    await updateItem(productId, newQty);
  }

  async function handleDelete(productId) {
    await removeItem(productId);
  }

  // ── Carrito vacío ──
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container-app" style={{ textAlign: 'center', padding: '5rem 1.25rem' }}>
        <i className="bi bi-bag-x" style={{ fontSize: '4rem', color: 'var(--text-3)', display: 'block', marginBottom: '1rem' }}></i>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Tu carrito está vacío</h2>
        <p style={{ color: 'var(--text-2)', marginBottom: '1.5rem' }}>Parece que aún no has añadido productos.</p>
        <Link to="/" className="btn-accent" style={{ padding: '0.7rem 2rem' }}>Ir a la tienda</Link>
      </div>
    );
  }

  // ── Carrito con productos ──
  return (
    <div className="container-app" style={{ padding: '1.5rem 1.25rem 3rem' }}>
      <h1 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Tu carrito</h1>

      <div className="cart-grid">

        {/* ── Lista de productos ── */}
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {cartItems.map((item, idx) => {
            const subtotal = (item.price * item.quantity).toFixed(2);

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  borderBottom: idx < cartItems.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                {/* Imagen */}
                <Link to={`/products/${item.id}-${slugify(item.display_name)}`}>
                  <img
                    src={item.thumbnail}
                    alt={item.display_name}
                    style={{
                      width: '64px',
                      height: '64px',
                      objectFit: 'contain',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--bg)',
                      padding: '4px',
                      flexShrink: 0,
                    }}
                  />
                </Link>

                {/* Nombre + precio unitario */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    to={`/products/${item.id}-${slugify(item.display_name)}`}
                    style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)', display: 'block', marginBottom: '0.15rem' }}
                  >
                    {item.display_name}
                  </Link>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{item.unit_price}</span>
                </div>

                {/* Cantidad */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={quantities[item.id] ?? item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    style={{
                      width: '56px',
                      padding: '0.4rem',
                      border: '1px solid var(--border-2)',
                      borderRadius: 'var(--radius-xs)',
                      textAlign: 'center',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.85rem',
                      background: 'var(--bg)',
                    }}
                  />
                  <button
                    onClick={() => handleUpdate(item.id)}
                    title="Actualizar"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--accent)',
                      fontSize: '1.1rem',
                      padding: '0.2rem',
                    }}
                  >
                    <i className="bi bi-arrow-clockwise"></i>
                  </button>
                </div>

                {/* Subtotal */}
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: 'var(--price)',
                  minWidth: '70px',
                  textAlign: 'right',
                }}>
                  {subtotal} €
                </span>

                {/* Eliminar */}
                <button
                  onClick={() => handleDelete(item.id)}
                  title="Eliminar"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-3)',
                    fontSize: '1rem',
                    padding: '0.3rem',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.target.style.color = 'var(--price)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-3)'}
                >
                  <i className="bi bi-trash3"></i>
                </button>
              </div>
            );
          })}
        </div>

        {/* ── Resumen ── */}
        <div className="total-panel">
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1.25rem' }}>Resumen del pedido</h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem', color: 'var(--text-2)' }}>
            <span>Subtotal</span>
            <span>{cartTotal.toFixed(2)} €</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.88rem', color: 'var(--text-2)' }}>
            <span>Envío estimado</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>GRATIS</span>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontWeight: 600, fontSize: '1rem' }}>Total</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--price)' }}>{cartTotal.toFixed(2)} €</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to="/checkout" className="btn-accent" style={{ padding: '0.75rem', fontSize: '0.95rem', textAlign: 'center' }}>
              Finalizar Compra <i className="bi bi-chevron-right"></i>
            </Link>
            <Link to="/" className="btn-ghost" style={{ textAlign: 'center' }}>
              Seguir comprando
            </Link>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.76rem', color: 'var(--text-3)', marginTop: '1rem' }}>
            <i className="bi bi-shield-lock" style={{ marginRight: '0.3rem' }}></i> Pago 100% Seguro (Simulado)
          </p>
        </div>
      </div>
    </div>
  );
}