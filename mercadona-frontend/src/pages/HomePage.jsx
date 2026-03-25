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
      .then(data => setCategories(data.results || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="spinner-border" style={{ color: 'var(--accent)' }} role="status" />
        <p style={{ marginTop: '1rem', color: 'var(--text-2)' }}>Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container-app" style={{ textAlign: 'center' }}>
          <h1>
            Explora el catálogo de <span className="accent">Mercadona</span>
          </h1>
          <p className="lead" style={{ marginInline: 'auto' }}>
            Proyecto de demostración técnica por <strong>Ignacio Florido</strong>.
            React + FastAPI + SQLite.
          </p>
          <div className="search-wrap" style={{ marginInline: 'auto' }}>
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Category grid */}
      <div className="container-app" style={{ paddingBottom: '3rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1rem',
        }}>
          {categories.map(mainCat => (
            <div key={mainCat.id} className="card-clean">
              <div className="cat-card-header">
                <i className="bi bi-tag-fill"></i>
                {mainCat.name}
              </div>
              <div className="cat-card-body">
                {mainCat.categories?.map(sub => (
                  <Link
                    key={sub.id}
                    to={`/categories/${sub.id}-${slugify(sub.name)}`}
                    className="cat-link"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}