// src/pages/SuccessPage.jsx
// Equivale a: success.html
// Funcionalidad: muestra el ticket de compra con el navbar centrado de Mercadona API,
// permite imprimir como PDF, y ofrece volver a comprar.
// Los datos llegan vía React Router state (pasados desde CheckoutPage).

import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

export default function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Recuperar datos del pedido (pasados desde CheckoutPage vía navigate state)
  const orderData = location.state;

  // Fecha actual generada al montar
  const [currentDate] = useState(() => {
    const now = new Date();
    return now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
  });

  // Si no hay datos de pedido (acceso directo por URL), redirigir al inicio
  useEffect(() => {
    if (!orderData) {
      navigate('/', { replace: true });
    }
  }, [orderData, navigate]);

  if (!orderData) return null;

  const { transaction_id, items, shipping, total } = orderData;

  return (
    <>
      {/* Navbar centrada (igual que tu success.html original) */}
      <nav className="navbar navbar-light bg-light mb-4 shadow-sm">
        <div className="container justify-content-center">
          <span className="navbar-brand mb-0 h1 text-success fw-bold">
            <i className="bi bi-shop"></i> Mercadona API
          </span>
        </div>
      </nav>

      <div className="container py-5 text-center">
        {/* Icono de éxito animado */}
        <div className="mb-4">
          <i className="bi bi-check-circle-fill success-icon"></i>
        </div>

        <h1 className="display-5 fw-bold text-success success-heading">
          ¡Gracias por tu compra!
        </h1>
        <p className="lead mb-4 text-muted success-lead">
          Tu pedido simulado ha sido procesado correctamente.
        </p>

        {/* ===== TICKET / FACTURA ===== */}
        <div
          id="ticket-invoice"
          className="card mx-auto shadow-sm border-success"
          style={{ maxWidth: '500px' }}
        >
          <div className="card-header bg-success text-white fw-bold">
            <i className="bi bi-receipt"></i> Pedido #{transaction_id}
          </div>

          <div className="card-body bg-white">
            <div className="text-end text-muted small mb-3">
              Fecha: {currentDate}
            </div>

            <ul className="list-group list-group-flush text-start">
              {items.map((item, index) => (
                <li
                  key={item.id || index}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <span className="fw-bold">{item.name}</span>
                    <div className="small text-muted">Cantidad: {item.quantity}</div>
                  </div>
                  <span>{(item.price * item.quantity).toFixed(2)}€</span>
                </li>
              ))}

              <li className="list-group-item d-flex justify-content-between bg-light mt-2">
                <span>Envío</span>
                <span>{shipping.toFixed(2)}€</span>
              </li>

              <li className="list-group-item d-flex justify-content-between bg-light fw-bold fs-5 text-success">
                <span>TOTAL</span>
                <span>{total.toFixed(2)}€</span>
              </li>
            </ul>
          </div>

          <div className="card-footer text-muted small">
            Comprobante de compra simulada - Mercadona API
          </div>
        </div>

        {/* ===== BOTONES DE ACCIÓN ===== */}
        <div className="mt-5 mb-5 d-flex flex-column flex-md-row justify-content-center gap-3 success-actions">
          <button
            onClick={() => window.print()}
            className="btn btn-outline-secondary btn-lg shadow-sm"
          >
            <i className="bi bi-file-earmark-pdf"></i> Imprimir Ticket (PDF)
          </button>

          <Link to="/" className="btn btn-success btn-lg shadow">
            <i className="bi bi-cart-plus"></i> Realizar nueva compra
          </Link>
        </div>
      </div>
    </>
  );
}