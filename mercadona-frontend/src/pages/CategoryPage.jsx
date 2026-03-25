// src/pages/CategoryPage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCategoryProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

export default function CategoryPage() {
  const { categoryPath } = useParams();                // Obtiene "123-lacteos" de la URL
  const categoryId = categoryPath.split('-')[0];       // Extrae "123"

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCategoryProducts(categoryId)
      .then(data => setCategory(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [categoryId]);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-success" /></div>;
  if (!category) return <div className="text-center py-5"><h3>Categoría no encontrada</h3></div>;

  return (
    <div className="container mb-5">
      <div className="row mb-4 justify-content-center">
        <div className="col-md-8"><SearchBar /></div>
      </div>

      <div className="alert alert-light border shadow-sm text-center mb-4">
        <h1 className="display-6 fw-bold text-success m-0">{category.name}</h1>
      </div>

      {category.categories.map(subCat => (
        subCat.products && subCat.products.length > 0 && (
          <div key={subCat.id}>
            <h3 style={{ color: '#005432', borderBottom: '2px solid #9dcfbc', paddingBottom: '10px', marginTop: '2rem' }}>
              {subCat.name}
            </h3>
            <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
              {subCat.products.map(product => (
                <div className="col" key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
}