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