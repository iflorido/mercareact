// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Bootstrap CSS (base - still needed for accordion, forms, grid utilities)
import 'bootstrap/dist/css/bootstrap.min.css';

// Bootstrap JS still needed for accordion collapse
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Bootstrap Icons
import 'bootstrap-icons/font/bootstrap-icons.css';

// Our custom editorial theme (replaces Bootstrap CSS)
import './styles/app.css';

import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);