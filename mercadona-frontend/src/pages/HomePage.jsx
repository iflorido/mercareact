// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../services/api';
import { slugify } from '../utils';
import SearchBar from '../components/SearchBar';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(data => setCategories(data.results))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status" />
        <p className="mt-3 text-muted">Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <header className="text-center text-white py-5 mb-4"
        style={{ backgroundColor: '#005432', borderRadius: '0 0 25px 25px' }}>
        <div className="container">
          <h1 className="display-5 fw-bold mb-3">🛒 Explorador de API de Mercadona</h1>
          <p className="lead mb-4 mx-auto" style={{ maxWidth: '800px' }}>
            Proyecto de demostración técnica desarrollado por <strong>Ignacio Florido</strong>.
          </p>
          <div className="d-flex justify-content-center">
            <div className="col-md-8 bg-white p-3 rounded-pill text-dark shadow-sm">
              <SearchBar />
            </div>
          </div>
        </div>
      </header>

      {/* Grid de categorías */}
      <div className="container mb-5">
        <h2 className="h4 fw-bold text-dark border-start border-4 border-success ps-3">
          Catálogo de Productos Disponibles
        </h2>
        <p className="text-muted">Navega por las categorías para explorar productos.</p>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {categories.map(mainCat => (
            <div className="col" key={mainCat.id}>
              <section className="card h-100" style={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div className="card-header fw-bold"
                  style={{ backgroundColor: '#fff', borderBottom: '3px solid #005432', color: '#005432', padding: '1.2rem' }}>
                  <i className="bi bi-tag-fill me-2"></i> {mainCat.name}
                </div>
                <div className="card-body">
                  <ul className="list-unstyled mb-0">
                    {mainCat.categories.map(sub => (
                      <li key={sub.id}>
                        <Link
                          to={`/categories/${sub.id}-${slugify(sub.name)}`}
                          className="d-block text-decoration-none py-2"
                          style={{ color: '#444', borderBottom: '1px solid #eee' }}
                        >
                          <i className="bi bi-chevron-right small text-success me-1"></i>
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}