# Tasks: Implementación PWA — La Vin Nails

## Phase 1: Identity & Assets (Manifest y Meta Tags) ✅

- [x] 1.1 **Generar Iconos PWA**: Creado directorio `web/public/icons/` con `icon-192x192.png`, `icon-512x512.png` y `apple-touch-icon.png` (180x180). Icono generado con paleta emerald del proyecto.
- [x] 1.2 **Crear Manifest**: Creado `web/public/manifest.json` con `short_name`, `name`, `display: standalone`, `theme_color: "#059669"`, `background_color: "#ecfdf5"` e `icons`.
- [x] 1.3 **Actualizar HTML**: Modificado `web/public/index.html` con meta tags Apple (`apple-mobile-web-app-capable`, `status-bar-style`, `apple-touch-icon`) y `theme-color` actualizado a `#059669`.

## Phase 2: Service Worker Installation (Precache Shell) ✅

- [x] 2.1 **Añadir Service Worker helper**: Creado `web/src/serviceWorkerRegistration.js` con template nativo de CRA.
- [x] 2.2 **Añadir Service Worker core**: Creado `web/src/service-worker.js` con Workbox precaching y App Shell routing para React Router.
- [x] 2.3 **Registrar SW en la App**: Modificado `web/src/index.js` — importa `serviceWorkerRegistration` y llama `register()` solo en producción.

## Phase 3: Verification & Build ✅

- [x] 3.1 **Test de Build**: `npm run build` exitoso. CRA inyecta el manifiesto Workbox y genera `build/service-worker.js`, `build/manifest.json` y `build/icons/`.
- [ ] 3.2 **Simular Producción Local**: Pendiente — servir `build/` localmente y verificar en Chrome DevTools (Application > Manifest + SW).
- [ ] 3.3 **Lighthouse Audit**: Pendiente — ejecutar reporte Lighthouse sobre la build de producción.
