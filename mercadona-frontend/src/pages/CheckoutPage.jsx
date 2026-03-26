// src/pages/CheckoutPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearAllItems } = useCart();
  const formRef = useRef(null);
  const isProcessing = useRef(false);

  const [form, setForm] = useState({
    first_name: 'Ignacio', last_name: 'Florido',
    email: '', phone: '', address: '', city: '', state: '', zip: '',
    country: 'ES', shipping: 'standard', paymentMethod: 'credit', notas: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [paymentDone, setPaymentDone] = useState(false);

  const shippingCost = form.shipping === 'express' ? 5.0 : 0.0;
  const grandTotal = cartTotal + shippingCost;

  useEffect(() => {
    if (!isProcessing.current && (!cartItems || cartItems.length === 0)) {
      navigate('/', { replace: true });
    }
  }, [cartItems, navigate]);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handlePay(e) {
    e.preventDefault();
    if (!formRef.current.checkValidity()) { formRef.current.reportValidity(); return; }
    isProcessing.current = true;
    setShowModal(true); setCurrentStep(1); setProgress(10); setPaymentDone(false);
    setTimeout(() => { setCurrentStep(2); setProgress(40); }, 1500);
    setTimeout(() => { setCurrentStep(3); setProgress(70); }, 3000);
    setTimeout(() => { setCurrentStep(4); setProgress(90); }, 4500);
    setTimeout(() => { setCurrentStep(5); setProgress(100); setPaymentDone(true); setTimeout(finishOrder, 1000); }, 6000);
  }

  async function finishOrder() {
    const transactionId = crypto.randomUUID().split('-')[0].toUpperCase();
    const orderData = {
      transaction_id: transactionId,
      items: cartItems.map(item => ({ id: item.id, name: item.name || item.display_name, price: item.price, quantity: item.quantity })),
      subtotal: cartTotal, shipping: shippingCost, total: grandTotal,
    };
    await clearAllItems();
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

  // Campo reutilizable
  const Field = ({ id, name, label, type = 'text', placeholder, required = true, colClass = '' }) => (
    <div className={colClass}>
      <label htmlFor={id} style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '0.35rem' }}>{label}</label>
      {type === 'textarea' ? (
        <textarea id={id} name={name} placeholder={placeholder} rows="4" value={form[name]} onChange={handleChange} required={required}
          style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-xs)', fontFamily: 'var(--font-body)', fontSize: '0.88rem', background: 'var(--bg)', color: 'var(--text)', resize: 'vertical', outline: 'none' }} />
      ) : type === 'select' ? (
        <select id={id} name={name} value={form[name]} onChange={handleChange} required={required}
          style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-xs)', fontFamily: 'var(--font-body)', fontSize: '0.88rem', background: 'var(--bg)', color: 'var(--text)', outline: 'none' }}>
          {placeholder}
        </select>
      ) : (
        <input type={type} id={id} name={name} placeholder={placeholder} value={form[name]} onChange={handleChange} required={required}
          style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-xs)', fontFamily: 'var(--font-body)', fontSize: '0.88rem', background: 'var(--bg)', color: 'var(--text)', outline: 'none' }} />
      )}
    </div>
  );

  return (
    <>
      <div className="container-app" style={{ padding: '1.5rem 1.25rem 3rem' }}>
        {/* Back */}
        <Link to="/carrito" style={{ color: 'var(--accent)', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1.5rem' }}>
          <i className="bi bi-arrow-left"></i> Volver al Carrito
        </Link>

        <div className="checkout-grid">

          {/* ── Formulario ── */}
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Dirección de envío</h2>

            <div style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 'var(--radius-xs)', padding: '0.7rem 1rem', fontSize: '0.82rem', color: '#92400e', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-info-circle-fill"></i>
              <span><strong>Simulación:</strong> No uses datos reales. Proyecto Demo.</span>
            </div>

            <form ref={formRef} noValidate onSubmit={handlePay}>
              <div className="checkout-form-grid">
                <Field id="firstName" name="first_name" label="Nombre" />
                <Field id="lastName" name="last_name" label="Apellidos" />
                <Field id="email" name="email" label="Correo Electrónico" type="email" placeholder="ejemplo@dominio.com" />
                <Field id="phone" name="phone" label="Teléfono" type="tel" placeholder="+34 600 000 000" />
                <Field id="address" name="address" label="Dirección" placeholder="Calle Falsa 123" />
                <Field id="city" name="city" label="Ciudad" placeholder="Ciudad" />
                <Field id="state" name="state" label="Provincia" placeholder="Provincia" />
                <Field id="zip" name="zip" label="Código Postal" placeholder="00000" />
                <Field id="country" name="country" label="País" type="select" placeholder={<option value="ES">España</option>} />
                <Field id="shipping" name="shipping" label="Método de Envío" type="select" placeholder={<><option value="standard">Estándar (3-5 días) — Gratis</option><option value="express">Exprés (1-2 días) — 5.00€</option></>} />
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '0.75rem' }}>
                <Field id="notas" name="notas" label="Notas de envío" type="textarea" placeholder="Indique notas para su envío" required={false} />
              </div>

              <div style={{ borderTop: '1px solid var(--border)', marginTop: '1.25rem', paddingTop: '1.25rem' }}>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>Método de pago</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {['credit', 'bizum'].map(method => (
                    <label key={method} style={{
                      flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem',
                      border: `1px solid ${form.paymentMethod === method ? 'var(--accent)' : 'var(--border-2)'}`,
                      borderRadius: 'var(--radius-xs)', cursor: 'pointer', transition: 'border-color 0.2s',
                      background: form.paymentMethod === method ? 'var(--accent-dim)' : 'var(--bg)',
                    }}>
                      <input type="radio" name="paymentMethod" value={method} checked={form.paymentMethod === method} onChange={handleChange}
                        style={{ accentColor: 'var(--accent)' }} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>
                        {method === 'credit' ? 'Tarjeta de Crédito' : 'Bizum'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-accent btn-full" style={{ marginTop: '1.5rem', padding: '0.85rem', fontSize: '1rem' }}>
                PAGAR {grandTotal.toFixed(2)}€ <i className="bi bi-credit-card-2-front" style={{ marginLeft: '0.4rem' }}></i>
              </button>
            </form>
          </div>

          {/* ── Resumen ── */}
          <div className="total-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Resumen</h3>
              <span style={{ background: 'var(--accent)', color: 'white', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px' }}>{cartItems.length}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {cartItems.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name || item.display_name}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-3)' }}>Cant: {item.quantity}</div>
                  </div>
                  <span style={{ color: 'var(--text-2)', flexShrink: 0, marginLeft: '0.5rem' }}>{(item.price * item.quantity).toFixed(2)}€</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-2)', marginBottom: '0.3rem' }}>
                <span>Envío</span>
                <span>{shippingCost.toFixed(2)}€</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.35rem', color: 'var(--price)' }}>{grandTotal.toFixed(2)}€</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal pasarela de pago ── */}
      {showModal && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', zIndex: 1050 }} />
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1060 }}>
            <div style={{ background: 'var(--bg-2)', borderRadius: 'var(--radius)', padding: '2rem 2.5rem', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>

              <div style={{ marginBottom: '1.5rem' }}>
                {!paymentDone ? (
                  <div style={{ width: '48px', height: '48px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                ) : (
                  <i className="bi bi-check-circle-fill" style={{ fontSize: '3.5rem', color: 'var(--success)' }}></i>
                )}
              </div>

              <h4 style={{ fontSize: '1rem', color: 'var(--text-2)', marginBottom: '0.75rem', fontWeight: 500 }}>Pasarela de Pago Segura</h4>

              <div style={{ minHeight: '28px' }}>
                <div key={currentStep} style={{ fontSize: '0.95rem', fontWeight: currentStep === 5 ? 700 : 400, color: currentStep === 5 ? 'var(--success)' : 'var(--text)', animation: 'fadeIn 0.4s' }}>
                  {stepMessages[currentStep]}
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', height: '4px', background: 'var(--surface-3)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--accent)', borderRadius: '2px', width: `${progress}%`, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}