// src/components/FilterPanel.jsx
import { useState, useEffect, useMemo } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function FilterPanel({ products, onFilter }) {
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
  const [sortOrder, setSortOrder] = useState('default');

  // Resetear filtros cuando cambian los productos base
  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
    setSelectedBrands([]);
    setSortOrder('default');
  }, [minPrice, maxPrice]);

  // Aplicar filtros + ordenación
  useEffect(() => {
    if (!onFilter || !products) return;

    let filtered = products.filter(p => {
      const price = extractPrice(p);
      if (price < priceRange[0] || price > priceRange[1]) return false;

      if (selectedBrands.length > 0) {
        const brand = extractBrand(p);
        if (!brand || !selectedBrands.includes(brand)) return false;
      }

      return true;
    });

    // Ordenar
    if (sortOrder === 'price-asc') {
      filtered = [...filtered].sort((a, b) => extractPrice(a) - extractPrice(b));
    } else if (sortOrder === 'price-desc') {
      filtered = [...filtered].sort((a, b) => extractPrice(b) - extractPrice(a));
    }

    onFilter(filtered);
  }, [priceRange, selectedBrands, sortOrder, products, onFilter]);

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
    setSortOrder('default');
  }

  if (!products || products.length === 0) return null;

  const hasActiveFilters = selectedBrands.length > 0
    || priceRange[0] > minPrice
    || priceRange[1] < maxPrice
    || sortOrder !== 'default';

  return (
    <div className="filter-bar">
      {/* Ordenar */}
      <div className="filter-bar-section">
        <div className="filter-label">Ordenar por</div>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="filter-select"
        >
          <option value="default">Relevancia</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
        </select>
      </div>

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
      {brands.length > 0 && (
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

      {/* Limpiar */}
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

function extractPrice(product) {
  const raw = product.price_instructions?.unit_price
    || product.unit_price
    || '0';
  return parseFloat(String(raw).replace(',', '.').replace('€', '').trim()) || 0;
}

function extractBrand(product) {
  if (typeof product.brand === 'string' && product.brand.trim()) {
    return product.brand.trim();
  }
  if (product.brand && typeof product.brand === 'object' && product.brand.name) {
    return String(product.brand.name).trim();
  }
  if (product.details?.brand && typeof product.details.brand === 'string') {
    return product.details.brand.trim();
  }
  if (typeof product.badge === 'string' && product.badge.trim()) {
    return product.badge.trim();
  }
  const knownBrands = [
    'Hacendado', 'Bosque Verde', 'Deliplus', 'Compy', 'Dulciora',
    'Al Punto', 'Fresón de Palos', 'Casa Tarradellas', 'El Pozo',
    'Gallo', 'Nestlé', 'Danone', 'Bimbo', 'Kellogg', 'Cola Cao',
    'Nocilla', 'Phoskitos', 'Don Simón', 'Pascual', 'Puleva',
    'Central Lechera Asturiana', 'García Baquero', 'President',
    'Campofrío', 'Oscar Mayer', 'Dia', 'Chanquete', "Lay's",
  ];
  const name = product.display_name || '';
  for (const b of knownBrands) {
    if (name.toLowerCase().endsWith(b.toLowerCase())) return b;
    if (name.toLowerCase().startsWith(b.toLowerCase())) return b;
  }
  return null;
}