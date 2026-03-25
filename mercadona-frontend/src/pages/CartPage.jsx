// src/pages/CartPage.jsx
// Equivale a: carrito.html
// Funcionalidad: ver carrito, actualizar cantidades, eliminar productos, ir a checkout

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { slugify } from '../utils';

export default function CartPage() {
  const { cartItems, cartTotal, updateItem, removeItem } = useCart();

  // Estado local para manejar las cantidades editables de cada producto.
  // Se inicializa con las cantidades actuales del carrito.
  // Usamos un objeto { productId: cantidad } para no perder el valor del input
  // mientras el usuario escribe antes de pulsar "actualizar".
  const [quantities, setQuantities] = useState(() => {
    const initial = {};
    cartItems.forEach(item => {
      initial[item.id] = item.quantity;
    });
    return initial;
  });

  // Se dispara cuando el usuario cambia el número en el input
  function handleQuantityChange(productId, value) {
    setQuantities(prev => ({ ...prev, [productId]: value }));
  }

  // Se dispara al pulsar el botón de actualizar (icono de reload)
  async function handleUpdate(productId) {
    const newQty = parseInt(quantities[productId]) || 1;
    await updateItem(productId, newQty);
  }

  // Se dispara al pulsar el botón de eliminar (icono de papelera)
  async function handleDelete(productId) {
    await removeItem(productId);
  }

  // ---------- CARRITO VACÍO ----------
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mb-5">
        <div className="text-center py-5">
          <div className="mb-3">
            <i className="bi bi-cart-x text-muted" style={{ fontSize: '5rem' }}></i>
          </div>
          <h3>Tu carrito está vacío</h3>
          <p className="text-muted">Parece que aún no has añadido productos.</p>
          <Link to="/" className="btn btn-success mt-3 px-4">Ir a la tienda</Link>
        </div>
      </div>
    );
  }

  // ---------- CARRITO CON PRODUCTOS ----------
  return (
    <div className="container mb-5">
      <div className="row g-4">

        {/* ===== COLUMNA IZQUIERDA: TABLA DE PRODUCTOS ===== */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Producto</th>
                      <th>Precio</th>
                      <th>Cantidad</th>
                      <th>Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map(item => {
                      // Calcular subtotal de esta línea
                      const subtotal = (item.price * item.quantity).toFixed(2);

                      return (
                        <tr key={item.id}>
                          {/* Producto: imagen + nombre con enlace */}
                          <td className="ps-4">
                            <div className="d-flex align-items-center">
                              <Link to={`/products/${item.id}-${slugify(item.display_name)}`}>
                                <img
                                  src={item.thumbnail}
                                  alt={item.display_name}
                                  className="me-3"
                                  style={{
                                    width: '70px',
                                    height: '70px',
                                    objectFit: 'contain',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '6px',
                                    background: 'white',
                                    padding: '5px',
                                  }}
                                />
                              </Link>
                              <div style={{ maxWidth: '250px' }}>
                                <Link
                                  to={`/products/${item.id}-${slugify(item.display_name)}`}
                                  className="text-decoration-none fw-bold"
                                  style={{ color: '#212529' }}
                                >
                                  {item.display_name}
                                </Link>
                              </div>
                            </div>
                          </td>

                          {/* Precio unitario */}
                          <td className="text-muted small">{item.unit_price}</td>

                          {/* Cantidad: input + botón actualizar */}
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                max="50"
                                className="form-control form-control-sm text-center"
                                style={{ width: '60px' }}
                                value={quantities[item.id] ?? item.quantity}
                                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              />
                              <button
                                className="btn btn-sm btn-link text-primary p-0"
                                title="Actualizar cantidad"
                                onClick={() => handleUpdate(item.id)}
                              >
                                <i className="bi bi-arrow-clockwise fs-5"></i>
                              </button>
                            </div>
                          </td>

                          {/* Subtotal de la línea */}
                          <td className="fw-bold text-success">{subtotal} €</td>

                          {/* Botón eliminar */}
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger border-0"
                              title="Eliminar"
                              onClick={() => handleDelete(item.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ===== COLUMNA DERECHA: RESUMEN DEL PEDIDO ===== */}
        <div className="col-lg-4">
          <div
            className="shadow-sm"
            style={{
              background: 'white',
              padding: '25px',
              borderRadius: '12px',
              border: '1px solid #e9ecef',
            }}
          >
            <h4 className="mb-3">Resumen del pedido</h4>

            <div className="d-flex justify-content-between mb-2 text-muted">
              <span>Subtotal</span>
              <span>{cartTotal.toFixed(2)} €</span>
            </div>
            <div className="d-flex justify-content-between mb-4 text-muted">
              <span>Envío estimado</span>
              <span className="text-success fw-bold">GRATIS</span>
            </div>

            <hr />

            <div className="d-flex justify-content-between mb-4 align-items-center">
              <span className="fw-bold fs-5">Total a pagar</span>
              <span className="fw-bold text-success fs-3">{cartTotal.toFixed(2)} €</span>
            </div>

            <div className="d-grid gap-2">
              <Link to="/checkout" className="btn btn-success btn-lg shadow-sm">
                Finalizar Compra <i className="bi bi-chevron-right"></i>
              </Link>
              <Link to="/" className="btn btn-outline-secondary">
                Seguir comprando
              </Link>
            </div>

            <div className="mt-3 text-center small text-muted">
              <i className="bi bi-shield-lock"></i> Pago 100% Seguro (Simulado)
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}