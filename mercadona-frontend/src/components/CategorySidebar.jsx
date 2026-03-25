// src/components/CategorySidebar.jsx
// Sidebar desplegable con categorías principales → subcategorías
// En móvil: offcanvas que se desliza desde la izquierda

import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCategories } from '../services/api';
import { slugify } from '../utils';

export default function CategorySidebar({ currentCategoryId }) {
  const [categories, setCategories] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    getCategories()
      .then(data => {
        setCategories(data.results || []);
        // Auto-expandir la categoría que contiene la subcategoría activa
        if (currentCategoryId && data.results) {
          const parentId = findParentId(data.results, currentCategoryId);
          if (parentId) setExpanded(prev => ({ ...prev, [parentId]: true }));
        }
      })
      .catch(console.error);
  }, [currentCategoryId]);

  function findParentId(cats, subId) {
    for (const cat of cats) {
      if (cat.categories?.some(sub => sub.id === Number(subId))) {
        return cat.id;
      }
    }
    return null;
  }

  function toggleExpand(catId) {
    setExpanded(prev => ({ ...prev, [catId]: !prev[catId] }));
  }

  return (
    <div>
      <div className="sidebar-title">Categorías</div>
      {categories.map(cat => (
        <div key={cat.id} className="cat-tree-item">
          <div
            className={`cat-tree-parent ${expanded[cat.id] ? 'active' : ''}`}
            onClick={() => toggleExpand(cat.id)}
          >
            <span className={`arrow ${expanded[cat.id] ? 'open' : ''}`}>▸</span>
            {cat.name}
          </div>

          {expanded[cat.id] && cat.categories && (
            <div className="cat-tree-children">
              {cat.categories.map(sub => (
                <Link
                  key={sub.id}
                  to={`/categories/${sub.id}-${slugify(sub.name)}`}
                  className={`cat-tree-child ${Number(currentCategoryId) === sub.id ? 'active' : ''}`}
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}