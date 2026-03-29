# PWA Specification — La Vin Nails

## Purpose
Describe los requisitos que la aplicación DEBE cumplir para ser considerada una Progressive Web App instalable, con comportamiento nativo en iOS/Safari y Android/Chrome.

---

## Requirements

### Requirement: Web App Manifest

La aplicación MUST exponer un `manifest.json` válido enlazado desde `index.html`.

El manifest MUST contener: `name`, `short_name`, `start_url`, `display: standalone`, `background_color`, `theme_color` e `icons`.

Los iconos MUST incluir al menos: 192×192 y 512×512 en formato PNG.

#### Scenario: Manifest detectado por navegador

- GIVEN el usuario abre la app en Chrome para Android
- WHEN el navegador procesa `index.html`
- THEN resuelve `manifest.json` sin errores 404
- AND muestra el panel de instalación con nombre y ícono correctos

#### Scenario: Manifest inválido o ausente

- GIVEN el manifest.json no existe o tiene JSON malformado
- WHEN el navegador procesa `index.html`
- THEN NO muestra el banner de instalación
- AND Lighthouse reporta fallo en auditoría "Installable"

---

### Requirement: Meta Tags iOS (Apple)

La aplicación MUST incluir las siguientes meta tags en `index.html`:
- `apple-mobile-web-app-capable: yes`
- `apple-mobile-web-app-status-bar-style`
- `apple-mobile-web-app-title`
- `apple-touch-icon` para resolución 180×180

#### Scenario: Instalación en iPhone (Safari)

- GIVEN el usuario abre la app en Safari iOS
- WHEN pulsa "Añadir a pantalla de inicio"
- THEN la app aparece con el ícono correcto en la home screen
- AND al abrirla se lanza en modo standalone (sin barra Safari)

#### Scenario: Título en pantalla de inicio iOS

- GIVEN la app está instalada en iOS
- WHEN el usuario ve el ícono en la home screen
- THEN el título visible es "La Vin Nails" (≤12 caracteres para evitar truncamiento)

---

### Requirement: Service Worker — Precache del Shell

La aplicación MUST registrar un Service Worker en producción.

El SW MUST usar `workbox-precaching` para cachear todos los assets estáticos generados por el build (HTML, CSS, JS, imágenes de public/).

El SW MUST NO registrarse en desarrollo (`process.env.NODE_ENV !== 'production'`).

#### Scenario: Primera visita (online)

- GIVEN el usuario visita la app por primera vez con conexión
- WHEN el SW se instala y activa
- THEN los assets estáticos quedan cacheados en Cache Storage
- AND las visitas siguientes cargan desde caché sin hit al servidor

#### Scenario: Visita sin conexión (offline)

- GIVEN el SW está instalado y los assets están cacheados
- WHEN el usuario abre la app sin conexión a internet
- THEN el shell de la app (HTML/CSS/JS) carga correctamente
- AND se muestra el estado vacío de datos (no un error de red genérico)

#### Scenario: Deploy nuevo (actualización de SW)

- GIVEN existe una versión anterior del SW activa
- WHEN se despliega una nueva versión con assets con nuevo hash
- THEN el SW nuevo se instala en segundo plano
- AND en la siguiente recarga (o cierre/apertura) la nueva versión se activa

---

### Requirement: Registro condicional del SW

La aplicación MUST llamar a `serviceWorkerRegistration.register()` solo si `NODE_ENV === 'production'`.

En desarrollo MUST llamar a `serviceWorkerRegistration.unregister()` para evitar cachés obsoletos.

#### Scenario: Entorno de desarrollo

- GIVEN el developer ejecuta `npm run dev`
- WHEN la app arranca en localhost
- THEN NO se registra ningún Service Worker
- AND las peticiones NO son interceptadas por caché

---

### Requirement: Puntuación Lighthouse

La aplicación SHOULD alcanzar un Lighthouse PWA score ≥ 90 en modo incógnito.

#### Scenario: Auditoría Lighthouse

- GIVEN el build de producción está desplegado en HTTPS
- WHEN se ejecuta Lighthouse con categoría "Progressive Web App"
- THEN el score es ≥ 90
- AND no hay fallos críticos en "Installable" ni en "PWA Optimized"
