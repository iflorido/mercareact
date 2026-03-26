// src/pages/SuccessPage.jsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

export default function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state;

  const [currentDate] = useState(() => {
    const now = new Date();
    return now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
  });

  useEffect(() => {
    if (!orderData) navigate('/', { replace: true });
  }, [orderData, navigate]);

  if (!orderData) return null;

  const { transaction_id, items, shipping, total } = orderData;

  return (
    <div className="container-app" style={{ padding: '3rem 1.25rem', textAlign: 'center' }}>

      {/* Icono animado */}
      <div style={{ marginBottom: '1.5rem' }}>
        <i className="bi bi-check-circle-fill success-icon"></i>
      </div>

      <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', marginBottom: '0.5rem' }}>
        ¡Gracias por tu compra!
      </h1>
      <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', marginBottom: '2.5rem' }}>
        Tu pedido simulado ha sido procesado correctamente.
      </p>

      {/* ── Ticket ── */}
      <div id="ticket-invoice" className="ticket-card">
        <div className="ticket-header">
          <i className="bi bi-receipt" style={{ marginRight: '0.5rem' }}></i>
          Pedido #{transaction_id}
        </div>

        <div style={{ padding: '1.25rem' }}>
          {/* Fecha */}
          <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: '1rem' }}>
            {currentDate}
          </div>

          {/* Productos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {items.map((item, i) => (
              <div
                key={item.id || i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-3)' }}>Cantidad: {item.quantity}</div>
                </div>
                <span style={{ fontWeight: 500, fontSize: '0.92rem' }}>{(item.price * item.quantity).toFixed(2)}€</span>
              </div>
            ))}

            {/* Envío */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontSize: '0.88rem', color: 'var(--text-2)', borderBottom: '1px solid var(--border)' }}>
              <span>Envío</span>
              <span>{shipping.toFixed(2)}€</span>
            </div>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0 0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>TOTAL</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--accent)' }}>{total.toFixed(2)}€</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border)', fontSize: '0.76rem', color: 'var(--text-3)', background: 'var(--bg)' }}>
          Comprobante de compra simulada — Mercadona API
        </div>
      </div>

      {/* ── Acciones ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', marginTop: '2.5rem', marginBottom: '2rem' }}>
        <button onClick={() => window.print()} className="btn-ghost" style={{ padding: '0.7rem 1.5rem' }}>
          <i className="bi bi-file-earmark-pdf"></i> Imprimir Ticket (PDF)
        </button>
        <Link to="/" className="btn-accent" style={{ padding: '0.7rem 1.5rem' }}>
          <i className="bi bi-bag-plus"></i> Realizar nueva compra
        </Link>
      </div>
    </div>
  );
}