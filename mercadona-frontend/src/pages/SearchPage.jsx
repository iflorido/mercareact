// src/pages/SearchPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import ShopLayout from '../components/ShopLayout';
import FilterPanel from '../components/FilterPanel';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';

  const [allResults, setAllResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) { setLoading(false); return; }
    setLoading(true);
    searchProducts(query)
      .then(data => {
        setAllResults(data || []);
        setFilteredResults(data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query]);

  const handleFilter = useCallback((filtered) => {
    setFilteredResults(filtered);
  }, []);

  return (
    <div className="container-app" style={{ padding: '1.5rem 1.25rem 3rem' }}>
      <div style={{ maxWidth: '500px', marginBottom: '1.5rem' }}>
        <SearchBar />
      </div>

      <ShopLayout>
        {/* Filtros — dentro del área de contenido */}
        <FilterPanel products={allResults} onFilter={handleFilter} />

        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>
          Resultados para: <span style={{ color: 'var(--accent)' }}>"{query}"</span>
        </h2>
        <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
          {filteredResults.length} resultado{filteredResults.length !== 1 && 's'}
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div className="spinner-border" style={{ color: 'var(--accent)' }} role="status" />
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="product-card-grid">
            {filteredResults.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-2)' }}>
            <i className="bi bi-search" style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem', color: 'var(--text-3)' }}></i>
            <h3 style={{ fontSize: '1.1rem' }}>No encontramos nada</h3>
            <p style={{ fontSize: '0.88rem' }}>Intenta con otro término.</p>
          </div>
        )}
      </ShopLayout>
    </div>
  );
}