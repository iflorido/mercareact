// src/components/Navbar.jsx
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { cartCount } = useCart();

  return (
    <nav className="navbar-main">
      <div className="container-app">
        <Link to="/" className="nav-brand">
          <i className="bi bi-shop"></i>
          Mercadona API
          <small>FastAPI Explorer- React</small>
        </Link>

        <Link to="/carrito" className="nav-cart">
          <i className="bi bi-bag"></i>
          {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
        </Link>
      </div>
    </nav>
  );
}