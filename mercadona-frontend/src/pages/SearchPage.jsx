// src/pages/SearchPage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      setLoading(true);
      searchProducts(query)
        .then(data => setResults(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [query]);

  return (
    <div className="container mb-5">
      <div className="row mb-4 justify-content-center">
        <div className="col-md-8"><SearchBar /></div>
      </div>

      <h4 className="mb-4 pb-2 border-bottom">
        Resultados para: <span className="text-success fst-italic">"{query}"</span>
      </h4>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-success" /></div>
      ) : results.length > 0 ? (
        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
          {results.map(product => (
            <div className="col" key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5" style={{ color: '#6c757d' }}>
          <i className="bi bi-search" style={{ fontSize: '4rem' }}></i>
          <h3>No encontramos nada</h3>
          <p>No hay productos que coincidan con "<strong>{query}</strong>".</p>
        </div>
      )}
    </div>
  );
}