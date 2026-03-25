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