# Design: Implementación PWA — La Vin Nails

## Technical Approach

Inyección manual de los 3 archivos del template PWA oficial de CRA (`cra-template-pwa`) en el proyecto existente. CRA `react-scripts@5.0.1` ya trae `workbox-*@6.5.4` como dependencia transitiva y detecta automáticamente `src/service-worker.js` para invocar `InjectManifest` de Workbox durante el build de producción. **Cero dependencias nuevas, cero eject.**

## Architecture Decisions

### Decision: Template PWA Nativo vs Workbox Custom

| Opción | Tradeoff | Decisión |
|--------|----------|----------|
| Template PWA CRA (InjectManifest) | Solo precache estático, sin control fino de API cache | ✅ Elegida |
| Workbox manual con craco/rewired | Control total de cache de API | ❌ Requiere eject o wrapper |
| SW desde cero (fetch event) | Control absoluto | ❌ Reinventar la rueda |

**Rationale**: El proyecto usa CRA vanilla sin eject. `react-scripts` detecta `src/service-worker.js` e inyecta el manifiesto de precache automáticamente. No necesitamos cachear API calls (scope está out), así que la configuración nativa es suficiente.

### Decision: Iconos — Generación y formato

| Opción | Tradeoff | Decisión |
|--------|----------|----------|
| generate_image + subida manual a public/ | Control total del diseño | ✅ Elegida |
| Convertir favicon.ico actual | Baja resolución (favicon suele ser 32x32) | ❌ Insuficiente |

**Rationale**: Necesitamos mínimo 192×192 y 512×512 PNG, más apple-touch-icon 180×180. El favicon actual no da para eso.

### Decision: Colores del manifest

**Choice**: `theme_color: #059669` (emerald-600), `background_color: #ecfdf5` (emerald-50).
**Rationale**: Consistente con la paleta Tailwind del proyecto. El emerald-600 es el color principal de la marca.

## Data Flow

```
[Build time]
react-scripts build
    └─ detecta src/service-worker.js → InjectManifest plugin
        └─ genera build/service-worker.js con self.__WB_MANIFEST reemplazado

[Runtime - Producción]
index.js → serviceWorkerRegistration.register()
    └─ navigator.serviceWorker.register('/service-worker.js')
        └─ SW instala → precacheAndRoute(manifest)
            └─ Visitas siguientes: Cache-first para shell, Network para API

[Runtime - Desarrollo]
index.js → serviceWorkerRegistration.unregister()
    └─ Sin SW activo, sin caché
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `web/public/manifest.json` | Create | Identidad PWA con colores emerald, iconos, display standalone |
| `web/public/index.html` | Modify | Meta tags Apple (capable, status-bar, title, touch-icon), theme-color |
| `web/public/icons/` | Create | Directorio con icon-192x192.png, icon-512x512.png, apple-touch-icon.png |
| `web/src/service-worker.js` | Create | Template oficial CRA: precache + app shell routing + image cache |
| `web/src/serviceWorkerRegistration.js` | Create | Helper register/unregister del template CRA (sin modificaciones) |
| `web/src/index.js` | Modify | Importar y llamar `register()` de serviceWorkerRegistration |

## Interfaces / Contracts

```js
// serviceWorkerRegistration.js — API pública
export function register(config)   // config: { onSuccess, onUpdate }
export function unregister()

// service-worker.js — Workbox (importado por el SW, no por la app)
precacheAndRoute(self.__WB_MANIFEST)  // CRA inyecta el manifest en build
```

```json
// manifest.json — Estructura requerida
{
  "short_name": "La Vin Nails",
  "name": "La Vin Nails — Manicura Granada",
  "icons": [
    { "src": "icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#059669",
  "background_color": "#ecfdf5"
}
```

## Testing Strategy

| Layer | Qué testear | Approach |
|-------|------------|----------|
| Manual | Manifest válido, instalable | Chrome DevTools > Application |
| Manual | iOS Safari install | Dispositivo real o BrowserStack |
| Automated | Lighthouse PWA score ≥ 90 | `npx lighthouse --only-categories=pwa` post-build |
| Existing | Guards, AuthStore, Interceptors | Ya cubiertos — 45 tests existentes validan que la PWA no rompe nada |

## Migration / Rollout

No migration required. Los archivos nuevos se añaden sin afectar funcionalidad existente. El `register()` en index.js es la única modificación que activa el SW en producción.

## Open Questions

- [x] ¿Colores del manifest? → Resuelto: emerald-600 / emerald-50
- [ ] ¿El favicon actual es adecuado como base para los iconos PWA o la administradora preferirá un diseño nuevo?
