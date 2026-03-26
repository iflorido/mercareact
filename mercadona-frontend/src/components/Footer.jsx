// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="footer-main">
      <div className="container-app">
        <div className="footer-inner">
          <div className="footer-text">
            <strong>Ignacio Florido</strong> — React + FastAPI + SQLite <br />Proyecto de demostración técnica React desarrollado por Ignacio Florido. No es una tienda real y no se procesan pedidos reales.<br />
            Servidor FastAPI en mercaapi.automaworks.es
          </div>
          <div className="footer-links">
            <a href="https://cv.iflorido.es" target="_blank" rel="noreferrer" className="footer-link">
              <i className="bi bi-person-circle"></i> CV
            </a>
            <a href="https://github.com/iflorido/FastAPI-Mercadona" target="_blank" rel="noreferrer" className="footer-link">
              <i className="bi bi-github"></i> GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}