// src/components/ProductCard.jsx
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { slugify } from '../utils';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  // Extraer precio como número
  const priceStr = product.price_instructions?.unit_price
    || product.unit_price || '0';
  const price = parseFloat(String(priceStr).replace(',', '.').replace('€', '').trim());

  const productUrl = `/products/${product.id}-${slugify(product.display_name)}`;

  async function handleAddToCart(e) {
    e.preventDefault();
    await addItem(product.id, 1);
    // Aquí podrías mostrar un Toast de confirmación
  }

  return (
    <div className="card shadow-sm h-100" style={{ borderRadius: '12px', border: 'none' }}>
      <Link to={productUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
        <img
          src={product.thumbnail}
          className="card-img-top"
          alt={product.display_name}
          style={{ height: '150px', objectFit: 'contain', padding: '10px', marginTop: '10px' }}
        />
        <div className="card-body pb-0">
          <h6 className="card-title" style={{ lineHeight: 1.4, minHeight: '2.8em' }}>
            {product.display_name}
          </h6>
          <div className="mt-2">
            <div style={{ color: '#d9534f', fontWeight: 700, fontSize: '1.25rem' }}>
              {priceStr} {!String(priceStr).includes('€') && '€'}
            </div>
          </div>
        </div>
      </Link>

      <div className="card-footer bg-white border-top-0 pt-0 pb-3">
        <div className="d-grid gap-2">
          <Link to={productUrl} className="btn btn-sm btn-outline-secondary">
            Ver detalle
          </Link>
          <button onClick={handleAddToCart} className="btn btn-sm btn-success fw-bold">
            <i className="bi bi-cart-plus"></i> Añadir
          </button>
        </div>
      </div>
    </div>
  );
}