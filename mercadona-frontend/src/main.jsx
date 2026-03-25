// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// 1. Bootstrap CSS + iconos
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// 2. Nuestros estilos globales (migrados de los HTML de Jinja2)
import './styles/app.css';

// 3. Bootstrap JS (necesario para acordeón, modales, toasts, etc.)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);