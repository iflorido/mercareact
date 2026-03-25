// src/pages/CheckoutPage.jsx
// Equivale a: checkout.html

import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearAllItems } = useCart();
  const formRef = useRef(null);

  // Flag para evitar redirección cuando vaciamos el carrito al finalizar
  const isProcessing = useRef(false);

  const [form, setForm] = useState({
    first_name: 'Ignacio',
    last_name: 'Florido',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'ES',
    shipping: 'standard',
    paymentMethod: 'credit',
    notas: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [paymentDone, setPaymentDone] = useState(false);

  const shippingCost = form.shipping === 'express' ? 5.0 : 0.0;
  const grandTotal = cartTotal + shippingCost;

  // Si el carrito está vacío Y NO estamos procesando → redirigir al inicio
  useEffect(() => {
    if (!isProcessing.current && (!cartItems || cartItems.length === 0)) {
      navigate('/', { replace: true });
    }
  }, [cartItems, navigate]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handlePay(e) {
    e.preventDefault();
    const formEl = formRef.current;
    if (!formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }
    startPaymentProcess();
  }

  function startPaymentProcess() {
    isProcessing.current = true;
    setShowModal(true);
    setCurrentStep(1);
    setProgress(10);
    setPaymentDone(false);

    setTimeout(() => { setCurrentStep(2); setProgress(40); }, 1500);
    setTimeout(() => { setCurrentStep(3); setProgress(70); }, 3000);
    setTimeout(() => { setCurrentStep(4); setProgress(90); }, 4500);

    setTimeout(() => {
      setCurrentStep(5);
      setProgress(100);
      setPaymentDone(true);
      setTimeout(() => finishOrder(), 1000);
    }, 6000);
  }

  async function finishOrder() {
    const transactionId = crypto.randomUUID().split('-')[0].toUpperCase();

    // Guardar datos ANTES de vaciar el carrito
    const orderData = {
      transaction_id: transactionId,
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name || item.display_name,
        price: item.price,
        quantity: item.quantity,
      })),
      subtotal: cartTotal,
      shipping: shippingCost,
      total: grandTotal,
    };

    // ★ Vaciar carrito del SERVIDOR y del estado local
    //   clearAllItems() intenta /cart/clear, si falla elimina uno a uno
    await clearAllItems();

    // Navegar a success con los datos del pedido
    navigate('/success', { state: orderData, replace: true });
  }

  const stepMessages = {
    1: 'Estableciendo conexión segura...',
    2: 'Verificando credenciales bancarias...',
    3: 'Solicitando autorización al banco...',
    4: 'Confirmando saldo disponible...',
    5: '¡Pago Autorizado!',
  };

  if (!isProcessing.current && (!cartItems || cartItems.length === 0)) return null;

  return (
    <>
      <nav className="navbar navbar-light bg-light mb-4 shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold text-success" to="/carrito">
            <i className="bi bi-arrow-left"></i> Volver al Carrito
          </Link>
          <span className="navbar-text fw-bold">🛒 Finalizar Compra</span>
        </div>
      </nav>

      <div className="container py-4">
        <div className="row g-5">
          <div className="col-md-8">
            <h4 className="mb-3 text-success">Dirección de envío</h4>

            <div className="alert alert-warning small d-flex align-items-center">
              <i className="bi bi-info-circle-fill me-2"></i>
              <div><strong>Simulación:</strong> No uses datos reales. Proyecto Demo.</div>
            </div>

            <form ref={formRef} noValidate onSubmit={handlePay}>
              <div className="row g-3">
                <div className="col-sm-6">
                  <label htmlFor="firstName" className="form-label" style={{ color: '#198754' }}>Nombre</label>
                  <input type="text" className="form-control" id="firstName" name="first_name" value={form.first_name} onChange={handleChange} required />
                </div>
                <div className="col-sm-6">
                  <label htmlFor="lastName" className="form-label" style={{ color: '#198754' }}>Apellidos</label>
                  <input type="text" className="form-control" id="lastName" name="last_name" value={form.last_name} onChange={handleChange} required />
                </div>
                <div className="col-sm-6">
                  <label htmlFor="email" className="form-label" style={{ color: '#198754' }}>Correo Electrónico</label>
                  <input type="email" className="form-control" id="email" name="email" placeholder="ejemplo@dominio.com" value={form.email} onChange={handleChange} required />
                </div>
                <div className="col-sm-6">
                  <label htmlFor="phone" className="form-label" style={{ color: '#198754' }}>Teléfono</label>
                  <input type="tel" className="form-control" id="phone" name="phone" placeholder="+34 600 000 000" value={form.phone} onChange={handleChange} required />
                </div>
                <div className="col-6">
                  <label htmlFor="address" className="form-label" style={{ color: '#198754' }}>Dirección</label>
                  <input type="text" className="form-control" id="address" name="address" placeholder="Calle Falsa 123" value={form.address} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label htmlFor="city" className="form-label" style={{ color: '#198754' }}>Ciudad</label>
                  <input type="text" className="form-control" id="city" name="city" placeholder="Ciudad" value={form.city} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <label htmlFor="state" className="form-label" style={{ color: '#198754' }}>Provincia</label>
                  <input type="text" className="form-control" id="state" name="state" placeholder="Provincia" value={form.state} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <label htmlFor="zip" className="form-label" style={{ color: '#198754' }}>Código Postal</label>
                  <input type="text" className="form-control" id="zip" name="zip" placeholder="00000" value={form.zip} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <label htmlFor="country" className="form-label" style={{ color: '#198754' }}>País</label>
                  <select className="form-select" id="country" name="country" value={form.country} onChange={handleChange} required>
                    <option value="ES">España</option>
                  </select>
                </div>
                <div className="col-md-12">
                  <label htmlFor="shipping" className="form-label" style={{ color: '#198754' }}>Método de Envío</label>
                  <select className="form-select" id="shipping" name="shipping" value={form.shipping} onChange={handleChange} required>
                    <option value="standard">Envío Estándar (3-5 días) - Gratis</option>
                    <option value="express">Envío Exprés (1-2 días) - 5.00€</option>
                  </select>
                </div>
                <div className="col-12">
                  <label htmlFor="notas" className="form-label" style={{ color: '#198754' }}>Notas de envío</label>
                  <textarea className="form-control" id="notas" name="notas" placeholder="Indique notas para su envío" rows="5" value={form.notas} onChange={handleChange} />
                </div>
              </div>

              <hr className="my-4" />

              <h5 className="mb-3 text-success">Pago Seguro (Simulado)</h5>
              <div className="my-3">
                <div className="form-check">
                  <input id="credit" name="paymentMethod" type="radio" className="form-check-input" value="credit" checked={form.paymentMethod === 'credit'} onChange={handleChange} />
                  <label className="form-check-label" htmlFor="credit">Tarjeta de Crédito</label>
                </div>
                <div className="form-check">
                  <input id="bizum" name="paymentMethod" type="radio" className="form-check-input" value="bizum" checked={form.paymentMethod === 'bizum'} onChange={handleChange} />
                  <label className="form-check-label" htmlFor="bizum">Bizum</label>
                </div>
              </div>

              <hr className="my-4" />

              <button className="w-100 btn btn-success btn-lg py-3 fw-bold shadow-sm" type="submit">
                PAGAR {grandTotal.toFixed(2)}€ <i className="bi bi-credit-card-2-front ms-2"></i>
              </button>
            </form>
          </div>

          <div className="col-md-4 order-md-last">
            <h4 className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-success">Resumen</span>
              <span className="badge bg-success rounded-pill">{cartItems.length}</span>
            </h4>
            <ul className="list-group mb-3 shadow-sm">
              {cartItems.map(item => (
                <li key={item.id} className="list-group-item d-flex justify-content-between lh-sm">
                  <div>
                    <h6 className="my-0">{item.name || item.display_name}</h6>
                    <small className="text-muted">Cant: {item.quantity}</small>
                  </div>
                  <span className="text-muted">{(item.price * item.quantity).toFixed(2)}€</span>
                </li>
              ))}
              <li className="list-group-item d-flex justify-content-between bg-light small">
                <span className="text-muted">Gastos de envío</span>
                <span className="text-muted">{shippingCost.toFixed(2)}€</span>
              </li>
              <li className="list-group-item d-flex justify-content-between bg-light">
                <span className="fw-bold text-success">TOTAL</span>
                <strong className="text-success">{grandTotal.toFixed(2)}€</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {showModal && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} />
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1060 }}>
            <div className="bg-white rounded shadow-lg text-center p-4" style={{ maxWidth: '400px', width: '90%' }}>
              <div className="mb-4">
                {!paymentDone ? (
                  <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                ) : (
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }} />
                )}
              </div>
              <h4 className="mb-3 text-secondary">Pasarela de Pago Segura</h4>
              <div style={{ minHeight: '30px' }}>
                <div key={currentStep} className={`fs-5 ${currentStep === 5 ? 'fw-bold text-success' : ''}`} style={{ animation: 'fadeIn 0.5s' }}>
                  {stepMessages[currentStep]}
                </div>
              </div>
              <div className="mt-4 progress" style={{ height: '5px' }}>
                <div className="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style={{ width: `${progress}%`, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}