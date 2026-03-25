# Guía Paso a Paso: Migrar tu Frontend de Jinja2 a React

## Tu Proyecto Actual (Arquitectura Monolítica)

```
NAVEGADOR  →  FastAPI (main.py)  →  Jinja2 renderiza HTML  →  Devuelve página completa
                  ↓
            SQLite + API Mercadona
```

**El problema:** FastAPI hace TODO — sirve datos Y genera el HTML. Si quieres cambiar un botón, tocas el backend.

## Tu Proyecto Futuro (Arquitectura Separada)

```
NAVEGADOR  →  React App (localhost:5173)  →  Fetch JSON  →  FastAPI API (localhost:8000)
                                                                    ↓
                                                              SQLite + API Mercadona
```

**La ventaja:** Cada parte es independiente. React se encarga de lo visual, FastAPI solo de los datos.

---

## FASE 1: Preparar el Backend (tu FastAPI)

### Paso 1.1 — Entender qué ya tienes

¡Buena noticia! Ya tienes endpoints API listos en tu `main.py`:

```python
# Estos ya existen y devuelven JSON puro:
GET  /api/v1/categories              → Lista de categorías
GET  /api/v1/categories/{id}         → Productos de una categoría
GET  /api/v1/products/{id}           → Detalle de un producto
GET  /api/v1/buscar?query=leche      → Búsqueda de productos
```

### Paso 1.2 — Añadir endpoints de carrito que devuelvan JSON

Tu carrito actual usa sesiones del servidor y redirige con HTML. Para React necesitas endpoints que devuelvan JSON. Añade esto a tu `main.py`:

```python
# --- NUEVOS ENDPOINTS API PARA REACT ---

from fastapi import Body

@app.post("/api/v1/cart/add")
async def api_add_to_cart(request: Request, product_id: str = Body(...), quantity: int = Body(1)):
    cart = request.session.get("cart", {})
    if product_id in cart:
        cart[product_id] += quantity
    else:
        cart[product_id] = quantity
    request.session["cart"] = cart
    # Devolvemos el carrito actualizado, NO una redirección
    return {"message": "Producto añadido", "cart": cart}

@app.get("/api/v1/cart")
async def api_get_cart(request: Request):
    cart_items, total_price = get_cart_data(request)
    return {
        "items": cart_items,
        "total": round(total_price, 2),
        "count": sum(item["quantity"] for item in cart_items)
    }

@app.post("/api/v1/cart/update")
async def api_update_cart(request: Request, product_id: str = Body(...), quantity: int = Body(...)):
    cart = request.session.get("cart", {})
    if quantity <= 0:
        cart.pop(product_id, None)
    else:
        cart[product_id] = quantity
    request.session["cart"] = cart
    cart_items, total_price = get_cart_data(request)
    return {"items": cart_items, "total": round(total_price, 2)}

@app.delete("/api/v1/cart/{product_id}")
async def api_remove_from_cart(request: Request, product_id: str):
    cart = request.session.get("cart", {})
    cart.pop(product_id, None)
    request.session["cart"] = cart
    cart_items, total_price = get_cart_data(request)
    return {"items": cart_items, "total": round(total_price, 2)}

@app.post("/api/v1/checkout")
async def api_checkout(request: Request, shipping: str = Body("standard")):
    cart_items, subtotal = get_cart_data(request)
    if not cart_items:
        raise HTTPException(status_code=400, detail="Carrito vacío")

    shipping_cost = 5.00 if shipping == "express" else 0.00
    transaction_id = str(uuid.uuid4()).split('-')[0].upper()

    # Vaciar carrito
    request.session.pop("cart", None)

    return {
        "transaction_id": transaction_id,
        "items": cart_items,
        "subtotal": round(subtotal, 2),
        "shipping": shipping_cost,
        "total": round(subtotal + shipping_cost, 2)
    }
```

### Paso 1.3 — Verificar que CORS está bien configurado

Ya lo tienes, pero para desarrollo local asegúrate de que acepta tu frontend React:

```python
origins = [
    "http://localhost:5173",   # Vite dev server
    "http://localhost:3000",   # Por si usas otro puerto
    "https://mercaapi.automaworks.es",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,    # Importante para las cookies de sesión
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## FASE 2: Crear el Proyecto React

### Paso 2.1 — Instalar Node.js

Descarga Node.js LTS desde https://nodejs.org (versión 20 o superior). Verifica la instalación:

```bash
node --version    # Debe mostrar v20.x.x o superior
npm --version     # Viene incluido con Node
```

### Paso 2.2 — Crear el proyecto con Vite

Vite es la herramienta moderna para crear proyectos React (mucho más rápida que Create React App):

```bash
# Crear el proyecto
npm create vite@latest mercadona-frontend -- --template react

# Entrar al directorio
cd mercadona-frontend

# Instalar dependencias
npm install
```

### Paso 2.3 — Instalar las librerías que necesitarás

```bash
# React Router → Para navegar entre páginas (como tus rutas de FastAPI)
npm install react-router-dom

# Bootstrap → Para mantener el mismo diseño que ya tienes
npm install bootstrap bootstrap-icons

# Axios → Para hacer peticiones HTTP al backend (más cómodo que fetch)
npm install axios
```

### Paso 2.4 — Estructura de carpetas

Organiza tu proyecto así (crea las carpetas manualmente):

```
mercadona-frontend/
├── public/
├── src/
│   ├── components/         ← Piezas reutilizables (Navbar, Footer, ProductCard...)
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── SearchBar.jsx
│   │   ├── ProductCard.jsx
│   │   └── Toast.jsx
│   ├── pages/              ← Páginas completas (equivalen a tus .html)
│   │   ├── HomePage.jsx        ← index.html
│   │   ├── CategoryPage.jsx    ← categoria.html
│   │   ├── ProductPage.jsx     ← productos.html
│   │   ├── SearchPage.jsx      ← resultados.html
│   │   ├── CartPage.jsx        ← carrito.html
│   │   ├── CheckoutPage.jsx    ← checkout.html
│   │   └── SuccessPage.jsx     ← success.html
│   ├── services/           ← Funciones para hablar con el backend
│   │   └── api.js
│   ├── context/            ← Estado global (carrito compartido entre páginas)
│   │   └── CartContext.jsx
│   ├── App.jsx             ← Enrutador principal
│   ├── main.jsx            ← Punto de entrada
│   └── index.css
├── package.json
└── vite.config.js
```

---

## FASE 3: Conceptos Básicos de React (Lo Mínimo que Necesitas)

### Concepto 1 — Componentes

Un componente es una función que devuelve HTML (llamado JSX). Es como un "bloque" reutilizable.

```jsx
// Tu Jinja2:
// <h1 class="text-success">{{ product.display_name }}</h1>

// En React:
function ProductTitle({ name }) {
  return <h1 className="text-success">{name}</h1>;
}

// Diferencias clave:
// - class → className (porque "class" es palabra reservada en JS)
// - {{ variable }} → {variable} (una sola llave)
// - Los datos llegan como "props" (argumentos de la función)
```

### Concepto 2 — Estado (useState)

El estado es una variable que, al cambiar, React re-renderiza automáticamente el componente.

```jsx
import { useState } from 'react';

function Counter() {
  // [valorActual, funciónParaCambiar] = useState(valorInicial)
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Has hecho click {count} veces</p>
      <button onClick={() => setCount(count + 1)}>
        Click
      </button>
    </div>
  );
}
```

### Concepto 3 — Efectos (useEffect)

Se ejecuta código cuando el componente aparece en pantalla (como `window.onload`). Perfecto para cargar datos del backend.

```jsx
import { useState, useEffect } from 'react';

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Se ejecuta UNA VEZ al montar el componente (por el [] vacío)
  useEffect(() => {
    fetch('http://localhost:8000/api/v1/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data.results);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando...</p>;

  return (
    <ul>
      {categories.map(cat => (
        <li key={cat.id}>{cat.name}</li>
      ))}
    </ul>
  );
}
```

### Concepto 4 — Equivalencias Jinja2 → React

| Jinja2 | React JSX |
|--------|-----------|
| `{{ variable }}` | `{variable}` |
| `{% for item in items %}` | `{items.map(item => (...))}` |
| `{% if condition %}` | `{condition && (...)}` o `{condition ? (...) : (...)}` |
| `{% include "header.html" %}` | `<Header />` (importar componente) |
| `class="..."` | `className="..."` |
| `onclick="fn()"` | `onClick={fn}` |
| `{{ "%.2f"\|format(price) }}` | `{price.toFixed(2)}` |
| `{{ name \| slugify }}` | `{slugify(name)}` (función JS propia) |

---

## FASE 4: Construir la App Paso a Paso

### Paso 4.1 — Configurar el punto de entrada (`main.jsx`)

```jsx
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Importar Bootstrap (reemplaza los CDN links de tus HTML)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

### Paso 4.2 — Configurar las rutas (`App.jsx`)

Esto es el equivalente a todas tus `@app.get(...)` de FastAPI, pero en el frontend:

```jsx
// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';

function App() {
  return (
    <CartProvider>
      <div className="d-flex flex-direction-column" style={{ minHeight: '100vh', flexDirection: 'column' }}>
        <Navbar />

        <main className="flex-grow-1">
          <Routes>
            {/* Cada Route equivale a un @app.get() de FastAPI */}
            <Route path="/" element={<HomePage />} />
            <Route path="/categories/:categoryPath" element={<CategoryPage />} />
            <Route path="/products/:productPath" element={<ProductPage />} />
            <Route path="/buscar" element={<SearchPage />} />
            <Route path="/carrito" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/success" element={<SuccessPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </CartProvider>
  );
}

export default App;
```

### Paso 4.3 — Servicio API (`services/api.js`)

Centraliza todas las llamadas al backend en un solo archivo:

```js
// src/services/api.js
import axios from 'axios';

// En desarrollo apunta a localhost, en producción a tu dominio
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Importante: envía cookies de sesión
});

// ---- CATEGORÍAS ----
export const getCategories = () =>
  api.get('/api/v1/categories').then(res => res.data);

export const getCategoryProducts = (categoryId) =>
  api.get(`/api/v1/categories/${categoryId}`).then(res => res.data);

// ---- PRODUCTOS ----
export const getProductDetail = (productId) =>
  api.get(`/api/v1/products/${productId}`).then(res => res.data);

// ---- BÚSQUEDA ----
export const searchProducts = (query) =>
  api.get('/api/v1/buscar', { params: { query } }).then(res => res.data);

// ---- CARRITO ----
export const getCart = () =>
  api.get('/api/v1/cart').then(res => res.data);

export const addToCart = (productId, quantity = 1) =>
  api.post('/api/v1/cart/add', { product_id: productId, quantity }).then(res => res.data);

export const updateCartItem = (productId, quantity) =>
  api.post('/api/v1/cart/update', { product_id: productId, quantity }).then(res => res.data);

export const removeFromCart = (productId) =>
  api.delete(`/api/v1/cart/${productId}`).then(res => res.data);

// ---- CHECKOUT ----
export const checkout = (shippingMethod) =>
  api.post('/api/v1/checkout', { shipping: shippingMethod }).then(res => res.data);
```

### Paso 4.4 — Estado global del carrito (`context/CartContext.jsx`)

El carrito se necesita en muchas páginas (Navbar badge, CartPage, Checkout...). Usamos Context para compartirlo:

```jsx
// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

const CartContext = createContext();

// Hook personalizado para usar el carrito fácilmente
export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  // Cargar carrito al inicio
  useEffect(() => {
    refreshCart();
  }, []);

  async function refreshCart() {
    try {
      const data = await api.getCart();
      setCartItems(data.items);
      setCartTotal(data.total);
      setCartCount(data.count);
    } catch (err) {
      console.error('Error cargando carrito:', err);
    }
  }

  async function addItem(productId, quantity = 1) {
    await api.addToCart(productId, quantity);
    await refreshCart();
  }

  async function updateItem(productId, quantity) {
    await api.updateCartItem(productId, quantity);
    await refreshCart();
  }

  async function removeItem(productId) {
    await api.removeFromCart(productId);
    await refreshCart();
  }

  return (
    <CartContext.Provider value={{
      cartCount, cartItems, cartTotal,
      addItem, updateItem, removeItem, refreshCart,
      setCartCount, setCartItems, setCartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
}
```

### Paso 4.5 — Componente Navbar (`components/Navbar.jsx`)

Convierte tu `<nav>` de Jinja2 a React:

```jsx
// src/components/Navbar.jsx
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import SearchBar from './SearchBar';

export default function Navbar() {
  const { cartCount } = useCart();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold text-success" to="/">
          <i className="bi bi-shop"></i> Mercadona API{' '}
          <small className="d-none d-sm-inline">- FastAPI Explorer</small>
        </Link>

        <div className="d-flex align-items-center">
          <Link to="/carrito" className="btn btn-outline-success position-relative me-2">
            <i className="bi bi-cart3 fs-5"></i>
            {cartCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

### Paso 4.6 — Componente SearchBar (`components/SearchBar.jsx`)

```jsx
// src/components/SearchBar.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/buscar?query=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex-grow-1 w-100">
      <div className="input-group">
        <span className="input-group-text bg-white text-muted border-end-0">
          <i className="bi bi-search"></i>
        </span>
        <input
          type="search"
          className="form-control border-start-0 ps-0"
          placeholder="Buscar producto..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        />
        <button className="btn btn-success" type="submit">Buscar</button>
      </div>
    </form>
  );
}
```

### Paso 4.7 — Componente ProductCard (`components/ProductCard.jsx`)

Este es un bloque reutilizable que aparece en categorías y resultados de búsqueda:

```jsx
// src/components/ProductCard.jsx
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { slugify } from '../utils';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  // Extraer precio como número
  const priceStr = product.price_instructions?.unit_price
    || product.unit_price || '0';
  const price = parseFloat(String(priceStr).replace(',', '.').replace('€', '').trim());

  const productUrl = `/products/${product.id}-${slugify(product.display_name)}`;

  async function handleAddToCart(e) {
    e.preventDefault();
    await addItem(product.id, 1);
    // Aquí podrías mostrar un Toast de confirmación
  }

  return (
    <div className="card shadow-sm h-100" style={{ borderRadius: '12px', border: 'none' }}>
      <Link to={productUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
        <img
          src={product.thumbnail}
          className="card-img-top"
          alt={product.display_name}
          style={{ height: '150px', objectFit: 'contain', padding: '10px', marginTop: '10px' }}
        />
        <div className="card-body pb-0">
          <h6 className="card-title" style={{ lineHeight: 1.4, minHeight: '2.8em' }}>
            {product.display_name}
          </h6>
          <div className="mt-2">
            <div style={{ color: '#d9534f', fontWeight: 700, fontSize: '1.25rem' }}>
              {priceStr} {!String(priceStr).includes('€') && '€'}
            </div>
          </div>
        </div>
      </Link>

      <div className="card-footer bg-white border-top-0 pt-0 pb-3">
        <div className="d-grid gap-2">
          <Link to={productUrl} className="btn btn-sm btn-outline-secondary">
            Ver detalle
          </Link>
          <button onClick={handleAddToCart} className="btn btn-sm btn-success fw-bold">
            <i className="bi bi-cart-plus"></i> Añadir
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Paso 4.8 — Función auxiliar slugify (`utils.js`)

```js
// src/utils.js
export function slugify(text) {
  if (!text) return '';
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
```

### Paso 4.9 — Página de Inicio (`pages/HomePage.jsx`)

Este es el equivalente completo a tu `index.html`:

```jsx
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
```

### Paso 4.10 — Página de Categoría (`pages/CategoryPage.jsx`)

```jsx
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
```

### Paso 4.11 — Página de Producto (`pages/ProductPage.jsx`)

```jsx
// src/pages/ProductPage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductDetail } from '../services/api';
import { useCart } from '../context/CartContext';

export default function ProductPage() {
  const { productPath } = useParams();
  const productId = productPath.split('-')[0];

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const { addItem } = useCart();

  useEffect(() => {
    setLoading(true);
    getProductDetail(productId)
      .then(data => setProduct(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [productId]);

  async function handleAddToCart() {
    setAdding(true);
    try {
      await addItem(product.id, quantity);
      alert(`${quantity} unidad(es) añadida(s) al carrito.`);
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-success" /></div>;
  if (!product) return <div className="text-center py-5"><h3>Producto no encontrado</h3></div>;

  const price = product.price_instructions?.unit_price || '0';

  return (
    <div className="container mb-5">
      <a href="#" onClick={() => window.history.back()} className="text-decoration-none text-muted">
        <i className="bi bi-arrow-left fw-bold text-success"></i> Volver atrás
      </a>

      <div className="row g-5 mt-2">
        {/* Imagen */}
        <div className="col-lg-6">
          <div className="bg-white border rounded p-4 text-center" style={{ minHeight: '400px' }}>
            {product.photos?.length > 0 ? (
              <img src={product.photos[0].regular} alt={product.display_name}
                style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
            ) : (
              <div className="text-muted"><i className="bi bi-image fs-1"></i><p>Sin imagen</p></div>
            )}
          </div>
        </div>

        {/* Detalles */}
        <div className="col-lg-6">
          {product.brand && (
            <span className="badge bg-light text-dark mb-2" style={{ fontSize: '0.9rem' }}>
              {product.brand}
            </span>
          )}

          <h1 className="display-6 fw-bold">{product.display_name}</h1>
          <p className="text-muted">{product.details?.legal_name}</p>

          <div className="my-4 p-4 bg-white rounded border shadow-sm">
            <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#d9534f' }}>
              {price} €
            </span>
            <span className="text-muted fs-5"> / unidad</span>

            <hr />

            <label className="form-label fw-bold small">Cantidad</label>
            <div className="input-group input-group-lg">
              <input type="number" className="form-control text-center"
                value={quantity} min={1} max={50}
                onChange={(e) => setQuantity(Number(e.target.value))}
                style={{ maxWidth: '100px' }} />
              <button className="btn btn-success flex-grow-1"
                onClick={handleAddToCart} disabled={adding}>
                {adding ? (
                  <span className="spinner-border spinner-border-sm me-2" />
                ) : (
                  <i className="bi bi-cart-plus me-2"></i>
                )}
                Añadir al carrito
              </button>
            </div>
          </div>

          {/* Acordeón de detalles */}
          <div className="accordion" id="productAccordion">
            {product.nutrition_information?.ingredients && (
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed" type="button"
                    data-bs-toggle="collapse" data-bs-target="#collapseIngredients">
                    <strong>📝 Ingredientes</strong>
                  </button>
                </h2>
                <div id="collapseIngredients" className="accordion-collapse collapse"
                  data-bs-parent="#productAccordion">
                  <div className="accordion-body text-secondary small"
                    dangerouslySetInnerHTML={{ __html: product.nutrition_information.ingredients }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Paso 4.12 — Página de Búsqueda (`pages/SearchPage.jsx`)

```jsx
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
```

### Paso 4.13 — Footer (`components/Footer.jsx`)

```jsx
// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="mt-auto text-light py-4" style={{ backgroundColor: '#212529' }}>
      <div className="container text-center">
        <div className="row align-items-center">
          <div className="col-md-6 text-md-start mb-3 mb-md-0">
            <h5 className="text-white mb-1">Desarrollado por Ignacio Florido</h5>
            <p className="mb-0 small" style={{ color: '#adb5bd' }}>
              Frontend con <strong>React</strong> + Backend con <strong>FastAPI</strong> & <strong>SQLite</strong>.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <a href="https://cv.iflorido.es" target="_blank" rel="noreferrer"
              className="btn btn-outline-light btn-sm me-2">
              <i className="bi bi-person-circle"></i> Ver CV
            </a>
            <a href="https://github.com/iflorido/FastAPI-Mercadona" target="_blank" rel="noreferrer"
              className="btn btn-dark btn-sm border-secondary">
              <i className="bi bi-github"></i> GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

---

## FASE 5: Ejecutar y Probar

### Paso 5.1 — Arrancar el Backend

En una terminal:

```bash
cd tu-proyecto-fastapi
uvicorn main:app --reload --port 8000
```

### Paso 5.2 — Arrancar el Frontend React

En otra terminal:

```bash
cd mercadona-frontend
npm run dev
```

Abre http://localhost:5173 en el navegador. Deberías ver tu tienda funcionando con React.

### Paso 5.3 — Proxy en desarrollo (opcional pero recomendado)

Para evitar problemas de CORS en desarrollo, configura Vite para redirigir las peticiones API:

```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
});
```

Con esto puedes usar rutas relativas en `api.js` (quitar `http://localhost:8000`).

---

## FASE 6: Para Producción

### Paso 6.1 — Compilar React

```bash
cd mercadona-frontend
npm run build
```

Esto genera una carpeta `dist/` con HTML, CSS y JS estáticos.

### Paso 6.2 — Servir desde FastAPI (opción simple)

Copia la carpeta `dist/` dentro de tu proyecto FastAPI y añade:

```python
# Al final de main.py, DESPUÉS de todas las rutas API
from fastapi.staticfiles import StaticFiles

# Sirve los archivos de React
app.mount("/", StaticFiles(directory="dist", html=True), name="spa")
```

### Paso 6.3 — Servir con Nginx (opción profesional)

```nginx
server {
    listen 80;
    server_name mercaapi.automaworks.es;

    # Frontend React
    location / {
        root /var/www/mercadona-frontend/dist;
        try_files $uri $uri/ /index.html;    # SPA fallback
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
    }
}
```

---

## Resumen: Mapa de Equivalencias

| Jinja2 (actual) | React (nuevo) | Tipo |
|---|---|---|
| `index.html` | `pages/HomePage.jsx` | Página |
| `categoria.html` | `pages/CategoryPage.jsx` | Página |
| `productos.html` | `pages/ProductPage.jsx` | Página |
| `resultados.html` | `pages/SearchPage.jsx` | Página |
| `carrito.html` | `pages/CartPage.jsx` | Página |
| `checkout.html` | `pages/CheckoutPage.jsx` | Página |
| `success.html` | `pages/SuccessPage.jsx` | Página |
| `buscar.html` | `components/SearchBar.jsx` | Componente |
| `footer.html` | `components/Footer.jsx` | Componente |
| `header.html` | `components/Navbar.jsx` | Componente |
| Tarjeta de producto (HTML repetido) | `components/ProductCard.jsx` | Componente |
| Sesión del servidor (cookies) | `context/CartContext.jsx` | Estado global |
| URLs de Jinja2 (`url_for(...)`) | React Router (`<Link to=...>`) | Navegación |
| `{{ variable }}` | `{variable}` | Interpolación |
| `{% for ... %}` | `.map(...)` | Bucles |
| `{% if ... %}` | `{condition && ...}` | Condicionales |

---

## Orden Recomendado para Implementar

1. Instalar todo y crear la estructura de carpetas
2. `api.js` → para que puedas probar las conexiones al backend
3. `Navbar` + `Footer` → los ves en todas las páginas
4. `HomePage` → la primera página que verás
5. `CategoryPage` + `ProductCard` → navegar productos
6. `SearchPage` → búsqueda
7. `ProductPage` → detalle de producto
8. `CartContext` → lógica del carrito compartida
9. `CartPage` → ver el carrito
10. `CheckoutPage` + `SuccessPage` → flujo de compra
