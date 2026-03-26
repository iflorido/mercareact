// src/components/ProductCard.jsx
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { slugify } from '../utils';

export default function ProductCard({ product, categoryId }) {
  const { addItem } = useCart();

  const priceStr = product.price_instructions?.unit_price
    || product.unit_price || '0';
  const priceFloat = parseFloat(String(priceStr).replace(',', '.').replace('€', '').trim()) || 0;

  const productUrl = `/products/${product.id}-${slugify(product.display_name)}`;
  const linkState = categoryId ? { categoryId } : undefined;

  async function handleAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    // Pasar datos del producto para que el carrito tenga la info para mostrar
    await addItem(product.id, 1, {
      display_name: product.display_name,
      price: priceFloat,
      unit_price: priceStr,
      thumbnail: product.thumbnail,
    });
  }

  return (
    <div className="pcard">
      <Link to={productUrl} state={linkState}>
        <div className="pcard-img">
          <img src={product.thumbnail} alt={product.display_name} />
        </div>
      </Link>
      <div className="pcard-body">
        <Link to={productUrl} state={linkState} style={{ color: 'inherit' }}>
          <div className="pcard-name">{product.display_name}</div>
        </Link>
        <div className="pcard-price">
          {priceStr} {!String(priceStr).includes('€') && '€'}
        </div>
        <div className="pcard-actions">
          <Link to={productUrl} state={linkState} className="btn-ghost btn-sm" style={{ flex: 1, textAlign: 'center' }}>
            Detalle
          </Link>
          <button onClick={handleAdd} className="btn-accent btn-sm" style={{ flex: 1 }}>
            <i className="bi bi-bag-plus"></i> Añadir
          </button>
        </div>
      </div>
    </div>
  );
}