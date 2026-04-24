import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { BrowserRouter as Router } from "react-router-dom";

import { HelmetProvider } from "react-helmet-async";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Router>
        <App />
      </Router>
    </HelmetProvider>
  </React.StrictMode>
);
reportWebVitals();

// Activa la PWA en producción con cache-first via Workbox.
// En desarrollo no tiene efecto (unregister automático).
// Más info: https://cra.link/PWA
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    // Emitimos un evento personalizado para mostrar el banner de actualización 
    // en la UI, en lugar de recargar de forma forzada.
    const event = new CustomEvent("pwaUpdate", { detail: registration });
    window.dispatchEvent(event);
  },
});

