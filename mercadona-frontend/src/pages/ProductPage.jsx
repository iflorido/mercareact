// src/pages/ProductPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getProductDetail } from '../services/api';
import { useCart } from '../context/CartContext';
import SearchBar from '../components/SearchBar';
import ProductSlider from '../components/ProductSlider';

export default function ProductPage() {
  const { productPath } = useParams();
  const location = useLocation();
  const productId = productPath.split('-')[0];

  // categoryId puede venir del state de navegación (desde CategoryPage)
  const categoryId = location.state?.categoryId || null;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const { addItem } = useCart();

  useEffect(() => {
    setLoading(true);
    setError(null);
    setQuantity(1);
    getProductDetail(productId)
      .then(data => setProduct(data))
      .catch(() => setError('Producto no encontrado'))
      .finally(() => setLoading(false));
  }, [productId]);

  async function handleAddToCart() {
    setAdding(true);
    try {
      await addItem(product.id, quantity);
      setToastMsg(`${quantity} unidad(es) añadida(s)`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setAdding(false);
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
      <div className="spinner-border" style={{ color: 'var(--accent)' }} role="status" />
    </div>
  );

  if (error || !product) return (
    <div className="container-app" style={{ textAlign: 'center', padding: '4rem 0' }}>
      <i className="bi bi-exclamation-triangle" style={{ fontSize: '3rem', color: 'var(--text-3)' }}></i>
      <h3 style={{ marginTop: '1rem' }}>{error || 'Producto no encontrado'}</h3>
      <Link to="/" className="btn-accent" style={{ marginTop: '1rem' }}>Volver al inicio</Link>
    </div>
  );

  const unitPrice = product.price_instructions?.unit_price || '0';

  return (
    <>
      <div className="container-app" style={{ padding: '1.5rem 1.25rem 3rem' }}>
        {/* Volver */}
        <a href="#" onClick={(e) => { e.preventDefault(); window.history.back(); }}
          style={{ color: 'var(--accent)', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1.5rem' }}>
          <i className="bi bi-arrow-left"></i> Volver
        </a>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
          {/* Imagen */}
          <div className="detail-image-box">
            {product.photos?.length > 0 ? (
              <img src={product.photos[0].regular} alt={product.display_name} />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-3)' }}>
                <i className="bi bi-image" style={{ fontSize: '3rem' }}></i>
                <p>Sin imagen</p>
              </div>
            )}
          </div>

          {/* Detalles */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              {product.brand && <span className="brand-pill">{product.brand}</span>}
              <button className="btn-ghost btn-sm" onClick={() => navigator.share?.({ title: product.display_name, url: window.location.href })} title="Compartir">
                <i className="bi bi-share"></i>
              </button>
            </div>

            <h1 style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', marginBottom: '0.5rem' }}>
              {product.display_name}
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              {product.details?.legal_name}
            </p>

            {/* Precio + Añadir */}
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="detail-price">{unitPrice} €</span>
                <span style={{ color: 'var(--text-2)', fontSize: '0.92rem' }}>/ unidad</span>
              </div>

              <p style={{ color: 'var(--text-2)', fontSize: '0.82rem', marginBottom: '1rem' }}>
                <i className="bi bi-info-circle" style={{ marginRight: '0.3rem' }}></i>
                {product.price_instructions?.unit_size} {product.price_instructions?.size_format}
                {product.price_instructions?.bulk_price && (
                  <> | <strong>{product.price_instructions.bulk_price} €</strong> (aprox.)</>
                )}
              </p>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Cantidad</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="number" min={1} max={50} value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ width: '80px', padding: '0.6rem', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-xs)', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '0.92rem' }}
                  />
                  <button className="btn-accent" style={{ flex: 1, fontSize: '0.92rem' }} onClick={handleAddToCart} disabled={adding}>
                    {adding ? 'Añadiendo...' : <><i className="bi bi-bag-plus"></i> Añadir al carrito</>}
                  </button>
                </div>
              </div>
            </div>

            {/* Acordeón */}
            <div className="accordion" id="productAccordion">
              {product.nutrition_information?.ingredients && (
                <div className="accordion-item">
                  <h2 className="accordion-header"><button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseIng" aria-expanded="false"><strong>Ingredientes</strong></button></h2>
                  <div id="collapseIng" className="accordion-collapse collapse" data-bs-parent="#productAccordion">
                    <div className="accordion-body" style={{ fontSize: '0.86rem', color: 'var(--text-2)', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: product.nutrition_information.ingredients }} />
                  </div>
                </div>
              )}
              {product.details?.storage_instructions && (
                <div className="accordion-item">
                  <h2 className="accordion-header"><button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseStor"><strong>Conservación y uso</strong></button></h2>
                  <div id="collapseStor" className="accordion-collapse collapse" data-bs-parent="#productAccordion">
                    <div className="accordion-body" style={{ fontSize: '0.86rem', color: 'var(--text-2)' }}>{product.details.storage_instructions}</div>
                  </div>
                </div>
              )}
              {product.details?.suppliers?.length > 0 && (
                <div className="accordion-item">
                  <h2 className="accordion-header"><button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSupp"><strong>Proveedor</strong></button></h2>
                  <div id="collapseSupp" className="accordion-collapse collapse" data-bs-parent="#productAccordion">
                    <div className="accordion-body" style={{ fontSize: '0.86rem', color: 'var(--text-2)' }}>
                      {product.details.suppliers.map((s, i) => <div key={i}>{s.name}</div>)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Buscador inferior */}
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <h4 style={{ color: 'var(--text-2)', fontSize: '1rem', marginBottom: '1rem' }}>¿Buscas algo más?</h4>
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <SearchBar />
          </div>
        </div>

        {/* Productos relacionados */}
        {categoryId && (
          <ProductSlider productId={productId} categoryId={categoryId} />
        )}
      </div>

      {/* Toast */}
      {showToast && (
        <div className="toast-custom">
          <i className="bi bi-check-circle-fill"></i>
          {toastMsg}
        </div>
      )}
    </>
  );
}