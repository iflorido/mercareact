// src/components/ProductSlider.jsx
// Slider horizontal de productos relacionados usando Swiper
// Muestra productos de la misma categoría

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { getCategoryProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import { slugify } from '../utils';

export default function ProductSlider({ productId, categoryId }) {
  const [related, setRelated] = useState([]);
  const { addItem } = useCart();

  useEffect(() => {
    if (!categoryId) return;

    getCategoryProducts(categoryId)
      .then(data => {
        // Recoger todos los productos de todas las subcategorías
        const allProducts = [];
        (data.categories || []).forEach(sub => {
          (sub.products || []).forEach(p => {
            // Excluir el producto actual
            if (String(p.id) !== String(productId)) {
              allProducts.push(p);
            }
          });
        });
        // Máximo 15 productos
        setRelated(allProducts.slice(0, 15));
      })
      .catch(console.error);
  }, [categoryId, productId]);

  if (related.length === 0) return null;

  return (
    <div className="related-section">
      <div className="related-title">Productos relacionados</div>

      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={12}
        slidesPerView={2}
        breakpoints={{
          480: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
          1280: { slidesPerView: 6 },
        }}
      >
        {related.map(product => {
          const price = product.price_instructions?.unit_price || '0';
          const url = `/products/${product.id}-${slugify(product.display_name)}`;

          return (
            <SwiperSlide key={product.id}>
              <div className="pcard">
                <Link to={url}>
                  <div className="pcard-img">
                    <img src={product.thumbnail} alt={product.display_name} />
                  </div>
                </Link>
                <div className="pcard-body">
                  <Link to={url} style={{ color: 'inherit' }}>
                    <div className="pcard-name">{product.display_name}</div>
                  </Link>
                  <div className="pcard-price">{price} €</div>
                  <button
                    className="btn-accent btn-sm btn-full"
                    onClick={() => addItem(product.id, 1)}
                  >
                    <i className="bi bi-bag-plus"></i> Añadir
                  </button>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}