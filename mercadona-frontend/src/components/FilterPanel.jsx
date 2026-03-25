// src/components/FilterPanel.jsx
// Panel de filtros horizontal — se coloca en el área de contenido, encima de los productos
// Extrae marcas y precios reales de los productos visibles

import { useState, useEffect, useMemo } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function FilterPanel({ products, onFilter }) {
  // Extraer precios y marcas reales de los productos
  const { minPrice, maxPrice, brands } = useMemo(() => {
    if (!products || products.length === 0) {
      return { minPrice: 0, maxPrice: 100, brands: [] };
    }

    let min = Infinity, max = 0;
    const brandMap = {};

    products.forEach(p => {
      const price = extractPrice(p);
      if (price < min) min = price;
      if (price > max) max = price;

      // Extraer marca real: el campo brand viene de la API de Mercadona
      // Para búsqueda SQLite no hay brand → se omite
      const brand = extractBrand(p);
      if (brand) {
        brandMap[brand] = (brandMap[brand] || 0) + 1;
      }
    });

    if (min === Infinity) min = 0;
    if (max === 0) max = 100;

    const brandList = Object.entries(brandMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      minPrice: Math.floor(min * 100) / 100,
      maxPrice: Math.ceil(max * 100) / 100,
      brands: brandList,
    };
  }, [products]);

  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  // Resetear filtros cuando cambian los productos base
  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
    setSelectedBrands([]);
  }, [minPrice, maxPrice]);

  // Aplicar filtros
  useEffect(() => {
    if (!onFilter || !products) return;

    const filtered = products.filter(p => {
      const price = extractPrice(p);
      if (price < priceRange[0] || price > priceRange[1]) return false;

      if (selectedBrands.length > 0) {
        const brand = extractBrand(p);
        if (!brand || !selectedBrands.includes(brand)) return false;
      }

      return true;
    });

    onFilter(filtered);
  }, [priceRange, selectedBrands, products, onFilter]);

  function toggleBrand(brandName) {
    setSelectedBrands(prev =>
      prev.includes(brandName)
        ? prev.filter(b => b !== brandName)
        : [...prev, brandName]
    );
  }

  function clearFilters() {
    setPriceRange([minPrice, maxPrice]);
    setSelectedBrands([]);
  }

  if (!products || products.length === 0) return null;

  const hasActiveFilters = selectedBrands.length > 0
    || priceRange[0] > minPrice
    || priceRange[1] < maxPrice;

  return (
    <div className="filter-bar">
      {/* Precio */}
      <div className="filter-bar-section">
        <div className="filter-label">Precio</div>
        <div style={{ padding: '0 0.25rem' }}>
          <Slider
            range
            min={minPrice}
            max={maxPrice}
            step={0.1}
            value={priceRange}
            onChange={setPriceRange}
          />
        </div>
        <div className="price-range-row" style={{ marginTop: '0.25rem' }}>
          <input type="text" className="price-input" value={`${priceRange[0].toFixed(2)} €`} readOnly />
          <span style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>—</span>
          <input type="text" className="price-input" value={`${priceRange[1].toFixed(2)} €`} readOnly />
        </div>
      </div>

      {/* Marcas */}
      {brands.length > 1 && (
        <div className="filter-bar-section" style={{ flex: 1 }}>
          <div className="filter-label">Marca</div>
          <div className="filter-brands-wrap">
            {brands.map(brand => (
              <label key={brand.name} className="filter-brand-chip">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.name)}
                  onChange={() => toggleBrand(brand.name)}
                />
                <span className="filter-chip-text">
                  {brand.name}
                  <span className="filter-brand-count">({brand.count})</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Limpiar filtros */}
      {hasActiveFilters && (
        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.25rem' }}>
          <button className="btn-ghost btn-sm" onClick={clearFilters}>
            <i className="bi bi-x-circle"></i> Limpiar
          </button>
        </div>
      )}
    </div>
  );
}

// ── Utilidades ──

function extractPrice(product) {
  const raw = product.price_instructions?.unit_price
    || product.unit_price
    || '0';
  return parseFloat(String(raw).replace(',', '.').replace('€', '').trim()) || 0;
}

function extractBrand(product) {
  // 1. Campo directo (viene de la API de categorías de Mercadona)
  if (product.brand && typeof product.brand === 'string' && product.brand.trim()) {
    return product.brand.trim();
  }
  // 2. Dentro de details (viene del detalle de producto)
  if (product.details?.brand && typeof product.details.brand === 'string') {
    return product.details.brand.trim();
  }
  // 3. No hay marca conocida — retornar null (no forzar "Hacendado")
  return null;
}