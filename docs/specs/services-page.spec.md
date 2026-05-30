# Services Page

## Metadata
- **Ruta en la app**: `/services`
- **Componente principal**: `ServicesPage.jsx`
- **Archivos relacionados**:
  - `web/src/components/services/LaVinServices/LaVinServices.js` — datos estáticos de servicios (8 items)
  - `web/src/components/layouts/Layout.jsx` — layout con header fijo y bottom nav
  - `web/src/contexts/AuthStore.js` — contexto de autenticación (`user`, `role`)
  - `web/src/components/seo/SEO.jsx` — meta tags con react-helmet-async
- **Última actualización**: 2026-05-28
- **Roles que interactúan**: visitante, usuario (guest), admin

---

## Descripción General
Página de catálogo que muestra los 8 servicios de manicura de La Vin Nails en un grid de tarjetas. Cada tarjeta incluye imagen, precio, duración estimada y botón para solicitar cita. Los detalles de cada servicio se muestran en un overlay expandible. Los datos de servicios son estáticos (hardcoded), **no se fetchean desde la API**.

---

## Comportamiento por Rol

### 👤 Visitante (sin sesión — `user` es `undefined` o `null`)
- Ve todas las tarjetas de servicios con imagen, nombre, precio y duración
- Puede expandir/colapsar los detalles de cada servicio
- Al pulsar "Solicitar cita" es redirigido a `/login`
- **NO puede** reservar turno directamente

### 🔑 Usuario autenticado (rol `guest`)
- Mismo comportamiento visual que el visitante
- Al pulsar "Solicitar cita" es redirigido a `/new-date/${service.id}` para reservar turno
- Puede ver detalles expandidos de cada servicio

### 🛡️ Administrador (rol `admin`)
- Mismo comportamiento visual que los demás roles
- Al pulsar "Solicitar cita" es redirigido a `/new-date-admin/${service.id}` (flujo de reserva admin)
- Puede ver detalles expandidos de cada servicio

### ⚠️ Rol desconocido
- Si `user.role` no es `guest` ni `admin`, el botón de cita no se renderiza (retorna `null`). El usuario ve la tarjeta pero sin acción de reserva.

---

## Reglas de Negocio

1. **Datos estáticos, sin API**: Los servicios se importan como un array JavaScript hardcoded (`LaVinServices.js`). No hay llamada a `GET /services` del backend. Si se añade un servicio en la base de datos, **no aparecerá** en esta página hasta que se actualice el archivo manualmente.
2. **Solo un servicio expandido a la vez**: El estado `expandedService` guarda un único ID. Al expandir un servicio, cualquier otro previamente expandido se colapsa automáticamente.
3. **Redirección de cita según rol**: El destino del botón "Solicitar cita" depende exclusivamente de `user.role`: sin sesión → `/login`, `guest` → `/new-date/:id`, `admin` → `/new-date-admin/:id`.
4. **Iconos cíclicos**: Los 4 iconos decorativos (Sparkles, Star, Heart, Palette) se asignan por posición usando `index % 4`. El orden visual de los servicios determina qué icono recibe cada uno.
5. **Imagen fallback**: Si un servicio no tiene `image`, se muestra `/placeholder.svg`.
6. **Contenido comentado**: Hay secciones de UI comentadas en el código: badge "Popular" en el primer servicio y sección "Incluye" con features en el overlay. No están activas en producción.

---

## Componentes Utilizados
| Componente | Responsabilidad en esta vista |
|------------|-------------------------------|
| `Layout` | Envoltura con header fijo superior, bottom navigation y contenedor principal |
| `SEO` | Inyecta `<title>`, meta description y OpenGraph tags para SEO |
| `Card` (inline) | Contenedor visual de cada servicio con bordes y sombra |
| `CardContent` (inline) | Padding y estructura interna de la tarjeta |
| `Button` (inline) | Botones de acción con variantes `default`, `outline`, `ghost` |
| `AppointmentButton` (inline) | Lógica condicional de redirección según rol del usuario |
| `Clock`, `ChevronDown`, `ChevronUp`, `X`, `Star`, `Heart`, `Sparkles`, `Palette` (inline) | Iconos SVG inline para UI decorativa y funcional |

---

## Llamadas a API
| Endpoint | Método | Cuándo se llama | Qué retorna |
|----------|--------|-----------------|-------------|
| *(ninguna)* | — | — | — |

**Nota importante**: Esta página **no realiza ninguna llamada a API**. Los 8 servicios están hardcodeados en `LaVinServices.js`. El endpoint `GET /services` del backend existe pero no es consumido por este componente.

---

## Estado y Efectos Secundarios
- **`expandedService`** (`useState`): Almacena el ID del servicio cuyo overlay de detalles está visible. Valor inicial `null`. Cambia al pulsar "Ver detalles" / "Menos detalles" / "Cerrar detalles" / botón X.
- **`user`** (`useContext(AuthContext)`): Se consume del contexto global. Determina la ruta de redirección del botón "Solicitar cita". No hay efecto secundario asociado — es lectura pura.
- **Sin `useEffect`**: El componente no tiene efectos secundarios. No hay fetch de datos, no hay suscripciones, no hay limpieza.

---

## Casos Edge y Gotchas

- **Safari iOS — `min-h-screen`**: El componente usa `min-h-screen` en lugar de `h-dvh`. Esto **puede causar problemas de viewport** en Safari iOS cuando la barra de navegación aparece/desaparece. El `Layout` padre usa `minHeight: '100dvh'` en el `<main>`, lo cual mitiga parcialmente el problema, pero el `min-h-screen` del wrapper interno es inconsistente con la convención del proyecto.
- **Si no hay datos**: No aplica — los datos son estáticos y siempre están presentes. Si el archivo `LaVinServices.js` se vaciara, el grid se renderizaría vacío sin mensaje de "no hay servicios".
- **`AppointmentButton` dentro del `.map()`**: El componente `AppointmentButton` se define como función dentro de cada iteración del `.map()`. Esto crea una nueva función en cada render, lo cual es ineficiente pero funcional.
- **Overlay con `absolute inset-0`**: El panel de detalles usa posicionamiento absoluto sobre la tarjeta. En pantallas muy pequeñas, el contenido scrollable puede solaparse con los botones fijos del fondo si la descripción es muy larga.
- **Sin loading state**: Al no haber fetch, no hay estado de carga ni manejo de errores de red.
- **IDs de servicios hardcoded**: Los IDs en `LaVinServices.js` (ej. `"64e1e8f4c7d250c0a7d4c112"`) parecen ObjectIds de MongoDB. Si la base de datos cambia estos IDs, los links de reserva apuntarían a servicios inexistentes.

---

## Tests Derivados (Checklist)

### Visitante
- [ ] Dado un visitante sin sesión, cuando ve la página `/services`, entonces se muestran 8 tarjetas de servicios con nombre, precio, duración e imagen
- [ ] Dado un visitante sin sesión, cuando pulsa "Solicitar cita" en cualquier servicio, entonces es redirigido a `/login`
- [ ] Dado un visitante sin sesión, cuando pulsa "Ver detalles" en un servicio, entonces se abre un overlay con la descripción del servicio
- [ ] Dado un visitante con el overlay abierto, cuando pulsa "Cerrar detalles" o la X, entonces el overlay se cierra

### Usuario autenticado (guest)
- [ ] Dado un usuario con rol `guest`, cuando pulsa "Solicitar cita" en un servicio, entonces es redirigido a `/new-date/${serviceId}`
- [ ] Dado un usuario con rol `guest`, cuando ve la página, entonces el comportamiento visual es idéntico al visitante

### Administrador
- [ ] Dado un usuario con rol `admin`, cuando pulsa "Solicitar cita" en un servicio, entonces es redirigido a `/new-date-admin/${serviceId}`

### Reglas de negocio
- [ ] Dado que se expande un servicio A, cuando se expande el servicio B, entonces el overlay de A se cierra y solo B queda expandido
- [ ] Dado un servicio sin imagen definida, cuando se renderiza su tarjeta, entonces se muestra `/placeholder.svg` como imagen
- [ ] Dado un usuario con rol desconocido (ni `guest` ni `admin`), cuando ve una tarjeta de servicio, entonces el botón "Solicitar cita" no se muestra
- [ ] Dado el grid de servicios, cuando se renderiza, entonces los iconos decorativos se asignan cíclicamente (Sparkles, Star, Heart, Palette) según el índice

### SEO
- [ ] Cuando se carga la página `/services`, entonces el `<title>` contiene "Catálogo de Servicios de Manicura | La Vin Nails"
- [ ] Cuando se carga la página `/services`, entonces el meta description contiene el texto de servicios de uñas en Granada

---

## Historial de Cambios Relevantes
| Fecha | Cambio | Razón |
|-------|--------|-------|
| 2026-05-28 | Spec funcional inicial creada | Documentación de comportamiento observable del componente existente |
