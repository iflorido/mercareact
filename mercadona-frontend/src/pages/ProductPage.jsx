// src/pages/ProductPage.jsx
// Equivale a: productos.html (ficha de producto completa)

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductDetail } from '../services/api';
import { useCart } from '../context/CartContext';
import SearchBar from '../components/SearchBar';

export default function ProductPage() {
  const { productPath } = useParams();
  const productId = productPath.split('-')[0];

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { addItem } = useCart();

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProductDetail(productId)
      .then(data => setProduct(data))
      .catch(() => setError('Producto no encontrado'))
      .finally(() => setLoading(false));
  }, [productId]);

  async function handleAddToCart() {
    setAdding(true);
    try {
      await addItem(product.id, quantity);
      setToastMessage(`${quantity} unidad(es) añadida(s) al carrito.`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setAdding(false);
    }
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: product.display_name,
        url: window.location.href,
      });
    }
  }

  // --- Loading ---
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status" />
        <p className="mt-3 text-muted">Cargando producto...</p>
      </div>
    );
  }

  // --- Error ---
  if (error || !product) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '4rem' }}></i>
        <h3 className="mt-3">{error || 'Producto no encontrado'}</h3>
        <Link to="/" className="btn btn-success mt-3">Volver al inicio</Link>
      </div>
    );
  }

  const unitPrice = product.price_instructions?.unit_price || '0';

  return (
    <>
      <div className="container mb-5">

        {/* ===== VOLVER ATRÁS ===== */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.history.back(); }}
            className="text-decoration-none text-muted"
          >
            <i className="bi bi-arrow-left fw-bold text-success"></i> Volver atrás
          </a>
        </div>

        <div className="row g-5">

          {/* ===== COLUMNA IZQUIERDA: IMAGEN ===== */}
          <div className="col-lg-6">
            <div className="image-container border bg-white">
              {product.photos && product.photos.length > 0 ? (
                <img
                  src={product.photos[0].regular}
                  alt={`Imagen de ${product.display_name}`}
                  className="product-detail-img"
                />
              ) : (
                <div className="text-center text-muted">
                  <i className="bi bi-image fs-1"></i>
                  <p>Sin imagen disponible</p>
                </div>
              )}
            </div>
          </div>

          {/* ===== COLUMNA DERECHA: DETALLES ===== */}
          <div className="col-lg-6">

            {/* Marca + Botón compartir */}
            <div className="d-flex align-items-start justify-content-between mb-2">
              {product.brand && (
                <span className="brand-badge">{product.brand}</span>
              )}
              <button
                className="btn btn-sm btn-outline-secondary rounded-circle"
                onClick={handleShare}
                title="Compartir"
              >
                <i className="bi bi-share"></i>
              </button>
            </div>

            {/* Nombre del producto */}
            <h1 className="display-6 fw-bold mb-3 text-dark">{product.display_name}</h1>

            {/* Nombre legal */}
            <p className="text-muted">{product.details?.legal_name}</p>

            {/* ===== BLOQUE DE PRECIO + AÑADIR AL CARRITO ===== */}
            <div className="my-4 p-4 bg-white rounded border shadow-sm">
              <div className="d-flex align-items-baseline mb-2">
                <span className="price-highlight me-2">{unitPrice} €</span>
                <span className="text-muted fs-5">/ unidad</span>
              </div>

              <div className="text-secondary small mb-3">
                <i className="bi bi-info-circle me-1"></i>
                {product.price_instructions?.unit_size} {product.price_instructions?.size_format}
                {product.price_instructions?.bulk_price && (
                  <> | <strong>{product.price_instructions.bulk_price} €</strong> (aprox.)</>
                )}
              </div>

              <hr className="text-muted opacity-25" />

              <label className="form-label fw-bold small">Cantidad</label>
              <div className="input-group input-group-lg">
                <input
                  type="number"
                  className="form-control text-center"
                  value={quantity}
                  min={1}
                  max={50}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ maxWidth: '100px' }}
                />
                <button
                  className="btn btn-success flex-grow-1"
                  onClick={handleAddToCart}
                  disabled={adding}
                >
                  {adding ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      {' '}Añadiendo...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cart-plus me-2"></i> Añadir al carrito
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ===== ACORDEÓN: INGREDIENTES / CONSERVACIÓN / PROVEEDOR ===== */}
            <div className="accordion" id="productAccordion">

              {/* 📝 Ingredientes */}
              {product.nutrition_information?.ingredients && (
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingIngredients">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseIngredients"
                      aria-expanded="false"
                      aria-controls="collapseIngredients"
                    >
                      <strong>📝 Ingredientes</strong>
                    </button>
                  </h2>
                  <div
                    id="collapseIngredients"
                    className="accordion-collapse collapse"
                    aria-labelledby="headingIngredients"
                    data-bs-parent="#productAccordion"
                  >
                    <div
                      className="accordion-body text-secondary small"
                      style={{ lineHeight: 1.6 }}
                      dangerouslySetInnerHTML={{ __html: product.nutrition_information.ingredients }}
                    />
                  </div>
                </div>
              )}

              {/* ❄️ Conservación y uso */}
              {product.details?.storage_instructions && (
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingStorage">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseStorage"
                      aria-expanded="false"
                      aria-controls="collapseStorage"
                    >
                      <strong>❄️ Conservación y uso</strong>
                    </button>
                  </h2>
                  <div
                    id="collapseStorage"
                    className="accordion-collapse collapse"
                    aria-labelledby="headingStorage"
                    data-bs-parent="#productAccordion"
                  >
                    <div className="accordion-body text-secondary">
                      {product.details.storage_instructions}
                    </div>
                  </div>
                </div>
              )}

              {/* 🏭 Información del Proveedor */}
              {product.details?.suppliers && product.details.suppliers.length > 0 && (
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingInfo">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseInfo"
                      aria-expanded="false"
                      aria-controls="collapseInfo"
                    >
                      <strong>🏭 Información del Proveedor</strong>
                    </button>
                  </h2>
                  <div
                    id="collapseInfo"
                    className="accordion-collapse collapse"
                    aria-labelledby="headingInfo"
                    data-bs-parent="#productAccordion"
                  >
                    <div className="accordion-body">
                      <ul className="list-unstyled">
                        {product.details.suppliers.map((supplier, i) => (
                          <li key={i}>{supplier.name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ===== BUSCADOR INFERIOR ===== */}
        <div className="mt-5 pt-5 border-top">
          <h4 className="text-center mb-4 text-muted">¿Buscas algo más?</h4>
          <div className="row justify-content-center">
            <div className="col-md-6">
              <SearchBar />
            </div>
          </div>
        </div>

      </div>

      {/* ===== TOAST DE CONFIRMACIÓN ===== */}
      <div className="toast-container position-fixed bottom-0 end-0 p-3">
        <div
          className={`toast align-items-center text-white bg-success border-0 ${showToast ? 'show' : ''}`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body">
              <i className="bi bi-check-circle-fill me-2"></i>
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => setShowToast(false)}
              aria-label="Close"
            />
          </div>
        </div>
      </div>
    </>
  );
}