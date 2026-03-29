## Exploration: Implementación de PWA (La Vin Nails)

### Current State
El frontend (`web/`) es una SPA estándar creada con `react-scripts` (Create React App). 
No tiene capacidades PWA activas. La carpeta `web/public/` solo contiene `index.html`, `favicon.ico` y `robots.txt`. Falta el `manifest.json`, la batería gráfica de íconos obligatoria para Android/iOS y la configuración de Service Workers en la raíz del código (`web/src/`).

### Affected Areas
- `web/public/index.html` — Requiere ajustes pesados (Meta tags móviles, `theme-color`, etiquetas Apple Web App y enlazado al manifiesto).
- `web/public/manifest.json` — Nuevo archivo para la descripción general y comportamiento standalone de la PWA.
- `web/public/icons/` — Necesitará contener múltiples resoluciones del logotipo principal (ej. 192x192, 512x512) y `apple-touch-icon`.
- `web/src/index.js` — Deberá modificarse para registrar o inyectar el Service Worker en producción.
- `web/src/service-worker.js` (y `serviceWorkerRegistration.js`) — Archivos core de caché offline y redentención (Workbox).

### Approaches

1. **Aproximación Nativa (CRA Default Template)** — Extraer los archivos del boilerplate nativo de PWA de CRA (Create React App) e inyectarlos localmente de manera manual, ajustándolos sin modificar configuraciones webpack subyacentes.
   - Pros: Cero dependencias complejas extras, compatible y seguro de mantener.
   - Cons: Hay que configurar el cacheo manualmente si queremos salinos del comportamiento por defecto (offline first estático).
   - Effort: Low/Medium

2. **Aproximación Avanzada (Workbox-Inject)** — Usar plugins para inyectar Workbox avanzado modificando scripts de arranque de CRA.
   - Pros: Control absoluto del caching de la API hacia el backend de `la-vin-nails-api`.
   - Cons: React-scripts lo dificulta sin hacer un `eject` total o meter `craco/react-app-rewired`.
   - Effort: High

### Recommendation
Opción 1: **Aproximación Nativa adaptada manual**. Debido a la prohibición y limitación estricta de sobre-complicar dependencias (MERN base minimalista), insertaremos manualmente los assets, el `manifest.json`, y el set de archivos `serviceWorkerRegistration` nativos de react, usando la configuración básica de `Workbox` permitida en CRA vanilla sin "ejectear".

### Risks
- **Crasheos en Safari (iOS)**: Safari maneja pésimo las PWAs instaladas, guardando cachés extraños e ignorando a veces las validaciones dinámicas.
- **Teclado flotante iOS**: Una vez instalada (`standalone`), en el iPhone la PWA sufre reajustes erráticos de la pantalla cuando salta el teclado en los inputs del componente de reservas.

### Ready for Proposal
Yes — Estamos listos para proponer la arquitectura y decidir con el usuario sobre los colores nativos, splash screens y cacheo que tendrá en Safari.
