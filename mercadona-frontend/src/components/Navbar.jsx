// src/components/Navbar.jsx
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import SearchBar from './SearchBar';

export default function Navbar() {
  const { cartCount } = useCart();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top mb-3 pt-3 pb-2">
      <div className="container">
        <Link className="navbar-brand fw-bold text-success" to="/">
          <i className="bi bi-shop"></i> Mercadona API{' '}
          <small className="d-none d-sm-inline">- FastAPI Explorer con React</small>
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