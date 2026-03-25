// src/pages/CategoryPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getCategoryProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import ShopLayout from '../components/ShopLayout';
import FilterPanel from '../components/FilterPanel';

export default function CategoryPage() {
  const { categoryPath } = useParams();
  const categoryId = categoryPath.split('-')[0];

  const [category, setCategory] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCategoryProducts(categoryId)
      .then(data => {
        setCategory(data);
        // Recoger todos los productos de todas las subcategorías
        // NO forzar brand — dejar el valor real de la API
        const products = [];
        (data.categories || []).forEach(sub => {
          (sub.products || []).forEach(p => {
            products.push(p);
          });
        });
        setAllProducts(products);
        setFilteredProducts(products);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categoryId]);

  const handleFilter = useCallback((filtered) => {
    setFilteredProducts(filtered);
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="spinner-border" style={{ color: 'var(--accent)' }} role="status" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container-app" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h3>Categoría no encontrada</h3>
      </div>
    );
  }

  return (
    <div className="container-app" style={{ padding: '1.5rem 1.25rem 3rem' }}>
      <div style={{ maxWidth: '500px', marginBottom: '1.5rem' }}>
        <SearchBar />
      </div>

      <ShopLayout currentCategoryId={categoryId}>
        {/* Filtros — dentro del área de contenido, encima del título */}
        <FilterPanel products={allProducts} onFilter={handleFilter} />

        <h1 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{category.name}</h1>
        <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
          {filteredProducts.length} producto{filteredProducts.length !== 1 && 's'}
        </p>

        {filteredProducts.length > 0 ? (
          <div className="product-card-grid">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} categoryId={categoryId} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-2)' }}>
            <i className="bi bi-funnel" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem', color: 'var(--text-3)' }}></i>
            <p>No hay productos que coincidan con los filtros.</p>
          </div>
        )}
      </ShopLayout>
    </div>
  );
}