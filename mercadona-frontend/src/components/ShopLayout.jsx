// src/components/ShopLayout.jsx
// Layout: sidebar izquierdo con categorías + área de contenido principal
// Filtros ya NO van aquí — van dentro del children (CategoryPage/SearchPage)

import { useState } from 'react';
import CategorySidebar from './CategorySidebar';

export default function ShopLayout({ children, currentCategoryId }) {
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  return (
    <>
      {/* Botón móvil para abrir offcanvas */}
      <button
        className="btn-ghost btn-sm mobile-filter-btn"
        onClick={() => setShowOffcanvas(true)}
      >
        <i className="bi bi-list"></i> Categorías
      </button>

      <div className="shop-layout">
        {/* Sidebar desktop — solo categorías */}
        <aside className="sidebar-panel sidebar-desktop">
          <CategorySidebar currentCategoryId={currentCategoryId} />
        </aside>

        {/* Contenido principal (filtros + productos van dentro) */}
        <div>{children}</div>
      </div>

      {/* Offcanvas móvil */}
      {showOffcanvas && (
        <>
          <div className="offcanvas-backdrop" onClick={() => setShowOffcanvas(false)} />
          <div className="offcanvas-panel">
            <div className="offcanvas-header">
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>Categorías</span>
              <button className="offcanvas-close" onClick={() => setShowOffcanvas(false)}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            <CategorySidebar currentCategoryId={currentCategoryId} />
          </div>
        </>
      )}
    </>
  );
}