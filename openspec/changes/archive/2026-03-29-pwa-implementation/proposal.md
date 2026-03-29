# Proposal: Implementación PWA — La Vin Nails

## Intent
La administradora y sus clientas acceden desde el móvil (>90% iOS/Safari). Convertir la SPA en una PWA instalable elimina la fricción de abrir un navegador, proporciona splash screen nativa y permite cachear el shell de la app para cargas instantáneas.

## Scope

### In Scope
- `manifest.json` con identidad visual, iconos multi-resolución y modo `standalone`
- Meta tags iOS (apple-mobile-web-app-*) y theme-color dinámico
- Service Worker con estrategia Workbox nativa de CRA (precache del shell estático)
- Registro condicional del SW solo en producción
- Generación/subida de iconos PWA (192x192, 512x512, apple-touch-icon)

### Out of Scope
- Cache offline de llamadas API al backend (requeriría Workbox custom → `eject`)
- Push notifications
- Background sync

## Approach
**Aproximación Nativa CRA**: Inyectar manualmente los archivos de SW del template PWA de CRA (`serviceWorkerRegistration.js`, `service-worker.js`) sin eject. Workbox se auto-configura vía `react-scripts build` si detecta `service-worker.js` en `src/`. El manifest.json se crea en `public/` con los colores de marca.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `web/public/manifest.json` | New | Identidad PWA, iconos, colores, display standalone |
| `web/public/index.html` | Modified | Meta tags Apple, theme-color, apple-touch-icon |
| `web/public/icons/` | New | Iconos 192x192, 512x512, apple-touch-icon 180x180 |
| `web/src/service-worker.js` | New | SW con precache Workbox (CRA native) |
| `web/src/serviceWorkerRegistration.js` | New | Helper de registro/desregistro del SW |
| `web/src/index.js` | Modified | Importar y llamar `register()` del SW |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Safari ignora cachés/manifest parcialmente | High | Usar meta tags Apple dedicados como fallback |
| Keyboard push en standalone iOS | Med | Documentar workaround `visualViewport` |
| SW cachea versión vieja tras deploy | Med | `workbox-precaching` con hash revving (default CRA) |

## Rollback Plan
1. Cambiar `register()` por `unregister()` en `index.js`
2. Eliminar `service-worker.js` y `serviceWorkerRegistration.js`
3. Borrar `manifest.json` y `icons/`
4. Revertir meta tags en `index.html`
5. Deploy → el SW previo se auto-desregistra al no encontrar su scope

## Dependencies
- `workbox-*` — CRA `react-scripts@5` ya lo incluye como dependencia interna; no hace falta instalar nada

## Success Criteria
- [ ] `npm run build` genera `build/service-worker.js` funcional
- [ ] En Chrome DevTools > Application > Manifest se muestra correctamente
- [ ] La app es instalable (banner "Add to Home Screen" aparece)
- [ ] En iOS Safari, "Añadir a pantalla de inicio" muestra la app en standalone con el icono correcto
- [ ] Lighthouse PWA score ≥ 90
