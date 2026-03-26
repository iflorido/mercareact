// src/components/FilterPanel.jsx
import { useState, useEffect, useMemo } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function FilterPanel({ products, onFilter }) {
  const { minPrice, maxPrice, brands } = useMemo(() => {
    if (!products || products.length === 0) {
      return { minPrice: 0, maxPrice: 100, brands: [] };
    }

    // DEBUG: Log del primer producto para ver la estructura real
    console.log('[FilterPanel] Primer producto recibido:', products[0]);
    console.log('[FilterPanel] Keys:', Object.keys(products[0]));

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

    console.log('[FilterPanel] Marcas extraídas:', brandList);

    return {
      minPrice: Math.floor(min * 100) / 100,
      maxPrice: Math.ceil(max * 100) / 100,
      brands: brandList,
    };
  }, [products]);

  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
    setSelectedBrands([]);
  }, [minPrice, maxPrice]);

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

      {/* Marcas — se muestra si hay al menos 1 marca */}
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

// ── Extraer precio ──
function extractPrice(product) {
  const raw = product.price_instructions?.unit_price
    || product.unit_price
    || '0';
  return parseFloat(String(raw).replace(',', '.').replace('€', '').trim()) || 0;
}

// ── Extraer marca — intenta TODAS las formas posibles ──
function extractBrand(product) {
  // 1. brand como string directo
  if (typeof product.brand === 'string' && product.brand.trim()) {
    return product.brand.trim();
  }

  // 2. brand como objeto con .name (algunas APIs lo devuelven así)
  if (product.brand && typeof product.brand === 'object' && product.brand.name) {
    return String(product.brand.name).trim();
  }

  // 3. Dentro de details
  if (product.details?.brand && typeof product.details.brand === 'string') {
    return product.details.brand.trim();
  }

  // 4. Campo badge o packaging que a veces contiene la marca
  if (typeof product.badge === 'string' && product.badge.trim()) {
    return product.badge.trim();
  }

  // 5. Extraer del display_name: marcas comunes de Mercadona al final del nombre
  const knownBrands = [
    'Hacendado', 'Bosque Verde', 'Deliplus', 'Compy', 'Dulciora',
    'Al Punto', 'Fresón de Palos', 'Casa Tarradellas', 'El Pozo',
    'Gallo', 'Nestlé', 'Danone', 'Bimbo', 'Kellogg', 'Cola Cao',
    'Nocilla', 'Phoskitos', 'Don Simón', 'Pascual', 'Puleva',
    'Central Lechera Asturiana', 'García Baquero', 'President',
    'Campofrío', 'Oscar Mayer', 'Dia', 'Chanquete', 'Lay\'s',
  ];

  const name = product.display_name || '';
  for (const b of knownBrands) {
    // Buscar la marca al final del nombre (patrón habitual de Mercadona)
    if (name.toLowerCase().endsWith(b.toLowerCase())) {
      return b;
    }
    // O al principio
    if (name.toLowerCase().startsWith(b.toLowerCase())) {
      return b;
    }
  }

  return null;
}