// src/components/SearchBar.jsx
// Equivale a: buscar.html
// Funcionalidad: buscador de texto + escáner de código de barras con cámara (Quagga2)
// + botón "Inicio" que solo aparece fuera del home

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

// ---- Utilidad: cargar Quagga2 desde CDN solo cuando se necesite ----
let quaggaPromise = null;
function loadQuagga() {
  if (window.Quagga) return Promise.resolve(window.Quagga);
  if (quaggaPromise) return quaggaPromise;

  quaggaPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@ericblade/quagga2@1.8.4/dist/quagga.min.js';
    script.onload = () => resolve(window.Quagga);
    script.onerror = () => reject(new Error('No se pudo cargar el escáner'));
    document.head.appendChild(script);
  });

  return quaggaPromise;
}

// ---- Validación EAN-13 (idéntica a tu buscar.html) ----
function isValidEan13(code) {
  if (!code || code.length !== 13) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(code[12]);
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const scannerRef = useRef(null);
  const quaggaRef = useRef(null);

  // ---- Buscar por texto ----
  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/buscar?query=${encodeURIComponent(query.trim())}`);
    }
  }

  // ---- Parar el escáner ----
  const stopScanner = useCallback(() => {
    if (quaggaRef.current) {
      try {
        quaggaRef.current.stop();
      } catch (e) {
        // Puede fallar si ya estaba parado
      }
      quaggaRef.current = null;
    }
    setScannerReady(false);
  }, []);

  // ---- Abrir modal del escáner ----
  function openScanner() {
    setShowScanner(true);
  }

  // ---- Cerrar modal del escáner ----
  function closeScanner() {
    stopScanner();
    setShowScanner(false);
  }

  // ---- Iniciar Quagga cuando el modal se abre y el contenedor existe ----
  useEffect(() => {
    if (!showScanner || !scannerRef.current) return;

    let cancelled = false;

    async function startQuagga() {
      try {
        const Quagga = await loadQuagga();
        if (cancelled) return;

        quaggaRef.current = Quagga;

        Quagga.init({
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: scannerRef.current,
            constraints: {
              facingMode: 'environment',
              width: { min: 640, ideal: 1280, max: 1920 },
              height: { min: 480, ideal: 720, max: 1080 },
            },
            area: {
              top: '30%',
              right: '10%',
              bottom: '30%',
              left: '10%',
            },
          },
          locator: {
            patchSize: 'medium',
            halfSample: true,
          },
          numOfWorkers: 2,
          frequency: 10,
          decoder: {
            readers: ['ean_reader'],
          },
          locate: true,
        }, (err) => {
          if (err) {
            console.error('Error cámara:', err);
            alert('Error al acceder a la cámara: ' + err);
            return;
          }
          if (cancelled) return;

          Quagga.start();
          setScannerReady(true);

          // Truco para iOS/Android: forzar enfoque continuo
          try {
            const track = Quagga.CameraAccess.getActiveTrack();
            if (track && typeof track.getCapabilities === 'function') {
              const capabilities = track.getCapabilities();
              if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
                track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
              }
            }
          } catch (e) {
            // No pasa nada si no soporta enfoque
          }
        });

        // Dibujar cajas verdes de detección
        Quagga.onProcessed((result) => {
          const drawingCtx = Quagga.canvas.ctx.overlay;
          const drawingCanvas = Quagga.canvas.dom.overlay;
          if (result) {
            drawingCtx.clearRect(
              0, 0,
              parseInt(drawingCanvas.getAttribute('width')),
              parseInt(drawingCanvas.getAttribute('height'))
            );
            if (result.box) {
              Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
                color: 'green',
                lineWidth: 2,
              });
            }
          }
        });

        // Cuando detecta un código válido
        Quagga.onDetected((result) => {
          const code = result.codeResult.code;

          if (isValidEan13(code)) {
            // Vibración de éxito
            if (navigator.vibrate) navigator.vibrate(200);

            console.log('Código VÁLIDO detectado:', code);
            stopScanner();
            setShowScanner(false);

            // Buscar con el código escaneado
            setQuery(code);
            navigate(`/buscar?query=${encodeURIComponent(code)}`);
          } else {
            console.log('Lectura parcial o inválida ignorada:', code);
          }
        });

      } catch (err) {
        console.error('Error cargando Quagga:', err);
        alert('No se pudo cargar el escáner de código de barras.');
      }
    }

    // Pequeño delay para que el DOM del modal se renderice
    const timer = setTimeout(startQuagga, 100);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      stopScanner();
    };
  }, [showScanner, navigate, stopScanner]);

  return (
    <>
      {/* ===== BARRA DE BÚSQUEDA + BOTÓN ESCÁNER + BOTÓN INICIO ===== */}
      <div className="d-flex flex-column flex-md-row gap-2 align-items-center w-100">
        <form onSubmit={handleSubmit} className="flex-grow-1 w-100" id="searchForm">
          <div className="input-group">
            <span className="input-group-text bg-white text-muted border-end-0">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="search"
              id="search-input"
              className="form-control border-start-0 ps-0 border-end-0"
              placeholder="Buscar producto..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
            />
            {/* Botón escáner de código de barras */}
            <button
              className="btn btn-outline-secondary border-start-0 border-end-0"
              type="button"
              onClick={openScanner}
              title="Escanear código de barras"
            >
              <i className="bi bi-upc-scan"></i>
            </button>
            <button className="btn btn-success" type="submit">Buscar</button>
          </div>
        </form>

        {/* Botón Inicio: solo aparece fuera del home (igual que tu Jinja2) */}
        {!isHome && (
          <Link to="/" className="btn btn-outline-secondary text-nowrap">
            <i className="bi bi-house-door-fill"></i> Inicio
          </Link>
        )}
      </div>

      {/* ===== MODAL DEL ESCÁNER ===== */}
      {showScanner && (
        <>
          {/* Backdrop */}
          <div
            className="modal-backdrop show"
            style={{ zIndex: 1040 }}
            onClick={closeScanner}
          />

          {/* Modal */}
          <div
            className="modal d-block"
            tabIndex="-1"
            style={{ zIndex: 1050 }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                {/* Header verde */}
                <div className="modal-header bg-success text-white">
                  <p className="modal-title mb-0">Escanear Código</p>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={closeScanner}
                  />
                </div>

                {/* Body: cámara + cuadro de escaneo */}
                <div className="modal-body p-0 bg-dark text-center">
                  <div
                    ref={scannerRef}
                    id="interactive"
                    className="viewport"
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: 'auto',
                      overflow: 'hidden',
                      background: '#000',
                      borderRadius: '8px',
                    }}
                  >
                    {/* Cuadro rojo guía (igual que tu HTML original) */}
                    <div
                      className="scanner-box"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80%',
                        height: '150px',
                        border: '2px solid rgba(255, 0, 0, 0.7)',
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                        borderRadius: '10px',
                        zIndex: 10,
                      }}
                    >
                      {/* Línea de escaneo animada */}
                      <div
                        style={{
                          position: 'absolute',
                          width: '100%',
                          height: '2px',
                          background: 'red',
                          top: '50%',
                          animation: 'scanline 2s infinite',
                          boxShadow: '0 0 4px red',
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-2 text-white bg-dark">
                    <small>Centra el código en el recuadro</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}