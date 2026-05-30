# Spec Funcional: Home Page

## Metadata

| Campo | Valor |
|-------|-------|
| **Componente** | `HomePage.jsx` |
| **Ruta** | `/` |
| **Tipo** | Página pública (landing) |
| **Roles** | visitante, usuario (guest), admin |
| **Última actualización** | 2026-05-28 |
| **Estado** | documentado |

---

## Descripción General

La Home Page es la landing principal de La Vin Nails. Es una página **puramente presentacional** que actúa como vitrina del negocio: muestra un hero con CTAs, un carrusel de servicios con precios, y un slider de fotos de trabajos recientes. No contiene lógica de negocio propia; delega toda la funcionalidad en sub-componentes.

La página es **accesible sin autenticación** para cualquier rol. El Layout que la envuelve adapta la navegación inferior según el rol del usuario.

---

## Comportamiento por Rol

| Rol | Comportamiento en la página |
|-----|----------------------------|
| **Visitante (no logueado)** | Ve todos los contenidos. Los botones "Solicitar cita" en servicios redirigen a `/login`. El navbar inferior muestra: Home, Servicios, Agenda (guest), Perfil (guest). |
| **Usuario (guest)** | Ve todos los contenidos. Los botones "Solicitar cita" redirigen a `/new-date/:serviceId`. El navbar inferior muestra: Home, Servicios, Agenda (guest), Perfil (guest). |
| **Admin** | Ve todos los contenidos. Los botones "Solicitar cita" redirigen a `/new-date-admin/:serviceId`. El navbar inferior muestra: Home, Servicios, Agenda (admin), Gestión, Admin. |

---

## Reglas de Negocio

1. **SEO obligatorio**: Cada render inyecta metadatos `<title>`, `<meta description>`, Open Graph y Twitter Cards con el título "Manicura y Pedicura Profesional en Granada" y la descripción correspondiente.
2. **Schema.org estructurado**: Se inyecta JSON-LD de tipo `BeautySalon` con datos del negocio (dirección, teléfono, horario, coordenadas GPS, Instagram).
3. **Hero con imagen optimizada**: La imagen del hero se carga desde Cloudinary con `f_auto,q_auto,w_2000` y tiene `fetchpriority="high"` + `loading="eager"` para priorizar LCP.
4. **Servicios con CTA condicional por rol**: El botón "Solicitar cita" de cada tarjeta de servicio redirige a rutas distintas según el estado de autenticación:
   - Sin usuario → `/login`
   - Guest → `/new-date/:serviceId`
   - Admin → `/new-date-admin/:serviceId`
5. **Trabajos recientes desde API**: Las fotos se obtienen vía `GET /api/photos` al montar el componente. No hay paginación ni filtrado en el cliente.
6. **Slider de fotos con loop cíclico**: En móvil, el carousel de trabajos recientes vuelve al índice 0 cuando llega al final, y al máximo cuando retrocede desde el inicio.
7. **Vista responsive de trabajos**: En móvil se muestra un slider de una foto; en desktop (≥768px) se muestra una grid de hasta 8 fotos.
8. **LoginBanner deshabilitado**: Existe un `<LoginBanner />` comentado en el código — no se renderiza.

---

## Componentes Utilizados

| Componente | Ruta | Responsabilidad |
|------------|------|-----------------|
| `Layout` | `components/layouts/Layout.jsx` | Envoltura estructural: header fijo con logo, main con gradiente, bottom navigation bar con ítems condicionales por rol, PWA banners (Install + Update). |
| `SEO` | `components/seo/SEO.jsx` | Inyecta `<title>`, meta description, canonical, Open Graph y Twitter Cards vía `react-helmet-async`. |
| `LocalBusinessSchema` | `components/seo/LocalBusinessSchema.jsx` | Inyecta JSON-LD structured data para `BeautySalon` con datos fijos del negocio. |
| `Hero` | `components/hero/Hero.jsx` | Sección hero con imagen de fondo, logo, tagline y 3 CTAs: "Agendar Cita" → `/services`, "Ubicación" → Google Maps, "Consultar" → WhatsApp. |
| `ServicesHome` | `components/services/services-home/ServicesHome.jsx` | Carrusel horizontal de tarjetas de servicio. Lee el catálogo estático `services` (8 servicios hardcodeados). Muestra nombre, descripción, precio y CTA condicional por rol. |
| `RecentWork` | `components/recent-work/RecentWork.jsx` | Slider (móvil) / grid (desktop) de fotos obtenidas de la API. Carrusel cíclico con dots de navegación en móvil. Botón "Ver Más Trabajos" sin funcionalidad (no tiene handler). |
| `Footer` | `components/footer/Footer.jsx` | Footer con logo, descripción, links a Instagram y WhatsApp, dirección con link a Google Maps, y copyright dinámico con año actual. |

---

## Llamadas a API

| Endpoint | Método | Componente | Cuándo | Parámetros | Respuesta esperada |
|----------|--------|------------|--------|------------|-------------------|
| `GET /api/photos` | GET | `RecentWork` | `useEffect` al montar | Ninguno | Array de objetos `{ id, photoUrl, ... }` |

**Notas**:
- La llamada usa `photosService.list()` que a su vez usa `http` (Axios) configurado en `base-api`.
- No hay manejo de loading state ni error UI — solo `console.error` en caso de fallo.
- No se invalida ni refresca la lista; se ejecuta una sola vez al montar.

---

## Estado y Efectos Secundarios

### Estado propio de HomePage
**Ninguno.** El componente es puramente presentacional — no tiene `useState`, `useEffect`, ni hooks propios.

### Estado heredado del Layout
- **`AuthContext.user`**: El Layout lee el contexto de autenticación para renderizar los ítems del bottom nav según el rol.
- **`localStorage.current-user`**: El AuthStore restaura el usuario desde localStorage al iniciar la app.

### Efectos secundarios
1. **SEO**: `react-helmet-async` modifica el `<head>` del documento (title, meta tags, script JSON-LD).
2. **RecentWork**: `useEffect` dispara `GET /api/photos` al montar el componente.
3. **PWA**: `InstallBanner` y `UpdateBanner` (dentro de Layout) pueden interactuar con el service worker del navegador.

---

## Casos Edge y Gotchas

### Gotchas

1. **Botón "Ver Más Trabajos" no funciona**: El botón al final de `RecentWork` no tiene `onClick` ni `href` — es un dead UI element. El usuario lo pulsa y no pasa nada.

2. **Sin loading state en fotos**: Si la API de fotos tarda o falla, el usuario ve una sección vacía sin indicador de carga ni mensaje de error.

3. **Servicios hardcodeados**: El catálogo de 8 servicios está en un archivo JS estático (`LaVinServices.js`), no viene de la API. Cualquier cambio de precio o nuevo servicio requiere deploy de frontend.

4. **`h-[calc(100vh-112px)]` en Hero**: El hero usa `100vh` en lugar de `100dvh`. En Safari iOS la barra de navegación puede tapar contenido inferior del hero. Esto contradice la convención del proyecto de usar `h-dvh`.

5. **Carrusel cíclico con `maxIndex`**: Cuando `recentWorks.length === 0`, `maxIndex = 0` y el carousel no rompe, pero tampoco muestra nada. Cuando hay 1 foto, `maxIndex = 0` y los botones prev/next no hacen nada visible (loop al mismo índice).

6. **`window.location.origin` en SSR**: `LocalBusinessSchema` y `SEO` usan `window.location` directamente. Si la app alguna vez se renderiza en servidor (SSR), esto lanzará un error `window is not defined`.

7. **LoginBanner comentado**: Hay un `<LoginBanner />` comentado en la página. Si se descomenta sin contexto, podría duplicar lógica de autenticación visual.

### Casos Edge

| Escenario | Comportamiento actual |
|-----------|----------------------|
| API de fotos devuelve array vacío | Sección "Mis Últimos Trabajos" muestra título y descripción pero sin imágenes ni dots de navegación. |
| API de fotos falla (network error) | Error silencioso en consola. Sección vacía sin feedback al usuario. |
| Usuario sin localStorage (primera visita) | `role = 'guest'` en el Layout — navegación de invitado. |
| localStorage corrupto | `AuthStore` captura el error con `try/catch` y retorna `undefined` — trata al usuario como no autenticado. |
| Imagen de servicio sin URL | Usa `/placeholder.svg` como fallback. |
| Foto de trabajo sin URL | Usa `/placeholder.svg` como fallback. |

---

## Tests Derivados

### Tests de renderizado

1. **T01** — La página renderiza las 5 secciones principales: Hero, ServicesHome, RecentWork, Footer (y Layout wrapper).
2. **T02** — El SEO inyecta el título "Manicura y Pedicura Profesional en Granada | La Vin Nails".
3. **T03** — El JSON-LD se inyecta con tipo `BeautySalon` y contiene la dirección de Granada.

### Tests de comportamiento por rol

4. **T04** — Sin usuario autenticado, los botones "Solicitar cita" en servicios navegan a `/login`.
5. **T05** — Con usuario `guest`, los botones "Solicitar cita" navegan a `/new-date/:serviceId`.
6. **T06** — Con usuario `admin`, los botones "Solicitar cita" navegan a `/new-date-admin/:serviceId`.
7. **T07** — El bottom nav del Layout muestra ítems diferentes según el rol (guest vs admin).

### Tests de API

8. **T08** — Al montar, se ejecuta `GET /api/photos` exactamente una vez.
9. **T09** — Si la API devuelve fotos, se renderizan en el slider (móvil) o grid (desktop).
10. **T10** — Si la API falla, no se lanza una exception al usuario (error manejado con console.error).

### Tests de UI responsive

11. **T11** — En viewport < 768px, RecentWork muestra un slider con navegación por flechas y dots.
12. **T12** — En viewport ≥ 768px, RecentWork muestra una grid de 4 columnas con hasta 8 fotos.
13. **T13** — El carrusel de servicios permite scroll horizontal en móvil (snap-x).

### Tests de edge cases

14. **T14** — Con 0 fotos de la API, la sección RecentWork no muestra imágenes ni dots.
15. **T15** — Con 1 foto, los botones prev/next no cambian la imagen visible (maxIndex = 0).
16. **T16** — El botón "Ver Más Trabajos" no tiene ningún efecto al hacer clic (dead element).

---

## Historial de Cambios

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2026-05-28 | Spec inicial creada desde código existente | SDD |
