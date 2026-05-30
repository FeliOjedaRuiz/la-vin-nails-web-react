# Spec Funcional: ClientProfilePage

## Metadata

| Campo | Valor |
|-------|-------|
| **Componente** | `ClientProfilePage.jsx` |
| **Tipo** | Página (page component) |
| **Ruta** | `/profile` |
| **Guard** | `PrivateRoute` (sin restricción de rol — accesible a cualquier usuario autenticado) |
| **Layout** | `Layout` (barra superior con logo + bottom navigation) |
| **Última actualización** | 2026-05-28 |

---

## Descripción General

`ClientProfilePage` es la página de perfil del usuario autenticado (rol `guest` o `admin`). Muestra la información personal del usuario, su galería de fotos de manicura, sus próximas citas pendientes y opciones de configuración de cuenta. La página está protegida por `PrivateRoute`, por lo que solo usuarios autenticados pueden acceder. Si no hay sesión, se redirige a `/login`.

La página se carga de forma **lazy** en `App.js` mediante `React.lazy()`.

---

## Comportamiento por Rol

### Usuario autenticado (guest / admin)

- Ve su propio perfil (nombre, apellido, teléfono con enlace WhatsApp, email, avatar).
- Puede expandir/colapsar secciones tipo acordeón: Galería, Próximas citas, Configuración de cuenta.
- Puede cancelar sus propias citas pendientes (con confirmación modal).
- Puede ver sus fotos de manicura subidas por el admin.
- Puede cerrar sesión (redirige a `/login` y limpia localStorage).
- Si es **admin**, ve un botón "+" en la galería para subir fotos (controlado por `NailPhotoGalery`).
- Si es **admin**, puede eliminar fotos desde la galería (grid y modal).

### Usuario no autenticado

- No puede acceder. `PrivateRoute` redirige a `/login`.

---

## Reglas de Negocio

### RB-01: Solo se muestran citas futuras o de hoy
Al cargar la página, se obtienen todas las citas del usuario (`GET /myDates/`) y se filtran en el frontend, descartando aquellas cuya fecha (`date.turn.date`) sea **anterior** a la fecha actual. La fecha actual se genera con una función `transformDate` que produce el formato `YYYY-MM-DD` con ceros a la izquierda.

### RB-02: Las citas se muestran en secciones expandibles
Las próximas citas están dentro de un acordeón con id `3`. Por defecto, todos los acordeones están cerrados (`open === 0`). El usuario debe hacer clic en el header para expandir.

### RB-03: Cancelación de cita requiere doble confirmación
Al cancelar una cita:
1. Primero se abre un modal preguntando "¿Estas seguro de que quieres cancelar tu cita?"
2. Al confirmar ("Aceptar"), se ejecuta `DELETE /dates/:id`
3. Luego se actualiza el estado del turno a `'Cancelado'` con `PATCH /turns/:id`
4. Finalmente se dispara `onDateDelete` que recarga la lista de citas del padre

### RB-04: El estado "Solicitado" se muestra como "Sin confirmación"
Si el turno tiene `state === 'Solicitado'`, el componente `DateDetail` lo muestra como `"Sin confirmación"` en lugar del valor crudo.

### RB-05: La galería muestra fotos en orden inverso
Las fotos del usuario se obtienen con `GET /photos/:userId` y se invierten (`reverse()`) antes de renderizar, mostrando las más recientes primero.

### RB-06: La sección de fidelidad está deshabilitada
El acordeón de "Tarjeta de fidelidad" (id `2`) está **comentado** en el JSX. No se renderiza. El componente `UserLoyaltyGuest` existe pero no se usa en esta página.

### RB-07: Configuración de cuenta es solo informativa
La sección de configuración no permite editar datos directamente. Ofrece:
- Un enlace a `/restore` para cambiar contraseña.
- Un mensaje indicando que próximamente se podrán editar datos o eliminar cuenta.
- Un enlace a WhatsApp del administrador para consultas.

### RB-08: El logout limpia toda la sesión
Al hacer clic en "Cerrar sesión", se ejecuta `logout()` del `AuthContext`, que:
- Elimina `user-access-token`, `current-user` y `current-date` de localStorage.
- Invalida las cachés de turnos (guest y admin).
- Navega a `/login`.

---

## Componentes Utilizados

| Componente | Rol | Props principales |
|------------|-----|-------------------|
| `Layout` | Contenedor principal con header y bottom nav | `children` |
| `UserProfile` | Muestra avatar, nombre, teléfono, email | `user` (del AuthContext) |
| `Accordion` / `AccordionHeader` / `AccordionBody` | Secciones colapsables | `open`, `icon`, `onClick` |
| `NailPhotoGalery` | Grid de fotos del usuario con modal de vista ampliada | `userId` (del AuthContext) |
| `DateDetail` | Detalle de una cita individual con botón de cancelar | `date`, `onDateDelete` |
| `Modal` | Overlay de confirmación para cancelar cita | `modalState`, `setModalState`, `children` |
| `ButtonGreen` | Botón estilizado para enlace WhatsApp | `children`, `styles` |
| `WhatsappIcon` | Icono SVG de WhatsApp | `color` |
| `UserLoyaltyGuest` | **No se usa** (comentado en el JSX) | — |

---

## Llamadas a API

### Frontend → Backend

| Método | Endpoint | Servicio | Cuándo se llama | Propósito |
|--------|----------|----------|-----------------|-----------|
| `GET` | `/myDates/` | `datesService.myList()` | `useEffect` al montar y cada vez que `reload` cambia | Obtiene todas las citas del usuario autenticado (el token se envía vía interceptor de axios) |
| `DELETE` | `/dates/:id` | `datesService.deleteDate(id)` | Al confirmar cancelación en el modal | Elimina la cita de la base de datos |
| `PATCH` | `/turns/:id` | `turnsService.update(id, turn)` | Inmediatamente después de eliminar la cita | Actualiza el estado del turno a `'Cancelado'` |
| `GET` | `/photos/:userId` | `photosService.listByUser(userId)` | Dentro de `NailPhotoGalery` al montar | Obtiene las fotos asociadas al usuario |
| `DELETE` | `/photos/:id` | `photosService.deletePhoto(id)` | Dentro de `NailPhotoGalery` al eliminar (solo admin) | Elimina una foto |

### Backend: `myList` controller

El endpoint `GET /myDates/` en `dates.controllers.js`:
- Extrae `req.user.id` del token JWT (inyectado por middleware `secure`).
- Busca todos los documentos `Date` donde `user === req.user.id`.
- Hace `populate` de `turn`, `user` y `service`.
- Retorna el array de citas completo.

### Backend: `delete` controller

El endpoint `DELETE /dates/:id`:
- Busca la cita, hace populate de relaciones.
- Elimina el documento con `deleteOne`.
- Responde con `204 No Content`.
- Envía email de notificación de cita cancelada (`mailer.sendDateDeletedEmail`).

---

## Estado y Efectos Secundarios

### Estado local del componente

| Variable | Tipo | Valor inicial | Propósito |
|----------|------|---------------|-----------|
| `dates` | Array | `[]` | Lista de citas futuras del usuario |
| `reload` | Boolean | `false` | Flag para forzar re-fetch de citas tras cancelación |
| `open` | Number | `0` | ID del acordeón actualmente abierto (0 = ninguno) |

### Efectos (`useEffect`)

1. **Fetch de citas**: Se ejecuta al montar y cada vez que `reload` cambia. Llama a `datesService.myList()`, filtra las citas con fecha >= hoy, y actualiza `dates`.

### Efectos secundarios observables

- **Logout**: Limpia 3 keys de localStorage (`user-access-token`, `current-user`, `current-date`) y navega a `/login`.
- **Cancelación de cita**: Dispara 2 llamadas HTTP secuenciales (DELETE date → PATCH turn) y envía email de notificación desde el backend.
- **Interceptor de axios**: Si cualquier llamada recibe `401`, limpia localStorage y redirige a `/` (no a `/login`).

---

## Casos Edge y Gotchas

### GOTCHA-01: `transformDate` usa hora local del navegador
La función `transformDate` crea un `new Date()` sin especificar zona horaria. Esto significa que la comparación de fechas depende de la hora local del navegador del usuario. Si un usuario está en una zona horaria diferente a la del servidor, podría ver o no ver citas del día actual de forma inconsistente.

### GOTCHA-02: `reload` es un boolean toggle, no un contador
`setReload(!reload)` invierte un boolean. Esto funciona porque el `useEffect` tiene `[reload]` como dependencia — cualquier cambio, sea `true` o `false`, dispara el efecto. Sin embargo, si por alguna razón el estado se queda en el mismo valor (ej: dos cancelaciones rápidas que terminan en el mismo boolean), el efecto NO se dispara. En la práctica, como las cancelaciones son secuenciales, esto rara vez ocurre.

### GOTCHA-03: No hay loading state para las citas
Mientras se cargan las citas (`datesService.myList()`), el usuario ve un acordeón vacío sin indicador de carga. Si la red es lenta, parece que no tiene citas cuando en realidad están cargando.

### GOTCHA-04: Error de cancelación se loguea pero no se muestra al usuario
Si `datesService.deleteDate()` o `turnsService.update()` fallan, el error solo se envía a `console.error`. El usuario no ve ningún feedback visual de que la cancelación falló.

### GOTCHA-05: El enlace de WhatsApp del perfil tiene un `$` mal formado
En la sección de configuración, el href es `https://wa.me/$+34699861930?...` — el `$` antes del `+34` es un error de string template que no se interpoló. El enlace funciona porque WhatsApp ignora el `$`, pero es código muerto que debería limpiarse.

### GOTCHA-06: `actualDate` se calcula en cada render
`const actualDate = transformDate(new Date())` se ejecuta en cada render del componente, no solo en el mount. Esto es ineficiente pero no causa bugs porque la fecha no cambia durante la vida del componente (a menos que el componente se re-renderice a medianoche exacto).

### GOTCHA-07: `DateDetail` calcula su estado solo una vez
El `useEffect` en `DateDetail` que mapea `'Solicitado'` → `'Sin confirmación'` tiene `[]` como dependencias. Si el estado del turno cambiara externamente, el componente no lo reflejaría sin un re-mount.

### GOTCHA-08: La galería tiene placeholders condicionales inconsistentes
`NailPhotoGalery` renderiza imágenes placeholder basadas en `!photos[0]`, `!photos[1]`, y `!photos[2]` con lógica diferente para admin vs guest. Esto es frágil: si se elimina una foto del medio, los placeholders pueden aparecer en posiciones incorrectas.

---

## Tests Derivados

### Tests de renderizado

| ID | Descripción | Condición | Resultado esperado |
|----|-------------|-----------|-------------------|
| T-01 | Renderiza el perfil del usuario | Usuario autenticado | Se muestra `UserProfile` con nombre, teléfono, email y avatar |
| T-02 | Renderiza 3 acordeones expandibles | Usuario autenticado | Se muestran headers: "Galeria", "Próximas citas", "Configuración de cuenta" |
| T-03 | No renderiza tarjeta de fidelidad | Cualquier usuario | El acordeón de fidelidad está comentado y no aparece en el DOM |
| T-04 | Muestra mensaje sin citas pendientes | Usuario sin citas futuras | Se muestra "No tienes citas pendientes" |
| T-05 | Muestra botón de cerrar sesión | Usuario autenticado | El botón "Cerrar sesión" es visible |

### Tests de interacción

| ID | Descripción | Acción | Resultado esperado |
|----|-------------|--------|-------------------|
| T-06 | Abrir acordeón de galería | Clic en "Galeria" | Se expande el cuerpo con `NailPhotoGalery` |
| T-07 | Abrir acordeón de citas | Clic en "Próximas citas" | Se expande el cuerpo con la lista de `DateDetail` |
| T-08 | Cerrar acordeón abierto | Clic en el mismo header | El acordeón se colapsa (`open` vuelve a 0) |
| T-09 | Solo un acordeón abierto a la vez | Abrir acordeón 1, luego abrir 3 | El acordeón 1 se cierra, solo el 3 está abierto |
| T-10 | Cancelar cita — abrir modal | Clic en "Cancelar cita" | Se abre modal de confirmación |
| T-11 | Cancelar cita — confirmar | Clic en "Aceptar" del modal | Se envía DELETE, luego PATCH, se recarga la lista |
| T-12 | Cancelar cita — descartar | Clic en "Cancelar" del modal | El modal se cierra, no se envía ninguna petición |
| T-13 | Cerrar sesión | Clic en "Cerrar sesión" | Se limpian localStorage keys, se navega a `/login` |
| T-14 | Ir a restaurar contraseña | Clic en "Restaurar contraseña" | Se navega a `/restore` |

### Tests de lógica de negocio

| ID | Descripción | Condición | Resultado esperado |
|----|-------------|-----------|-------------------|
| T-15 | Filtra citas pasadas | API devuelve citas con fechas pasadas y futuras | Solo las citas con `date.turn.date >= actualDate` se muestran |
| T-16 | Mapea estado "Solicitado" | Turno con `state === 'Solicitado'` | Se muestra "Sin confirmación" en lugar de "Solicitado" |
| T-17 | Recarga citas tras cancelación | Se confirma cancelación | `reload` cambia, `useEffect` se dispara, lista se actualiza |
| T-18 | Precio sin confirmar | Cita con `cost` falsy | Se muestra "sin confirmar." |
| T-19 | Duración sin confirmar | Cita con `duration` falsy | Se muestra "sin confirmar." |

### Tests de acceso

| ID | Descripción | Condición | Resultado esperado |
|----|-------------|-----------|-------------------|
| T-20 | Redirige si no hay sesión | Usuario no autenticado accede a `/profile` | `PrivateRoute` redirige a `/login` |
| T-21 | Permite acceso a guest | Usuario con `role === 'guest'` | La página se renderiza normalmente |
| T-22 | Permite acceso a admin | Usuario con `role === 'admin'` | La página se renderiza normalmente |
| T-23 | Redirige si token expirado (401) | Token expira mientras la página está abierta | Interceptor limpia localStorage y redirige a `/` |

---

## Historial de Cambios

| Fecha | Cambio | Razón |
|-------|--------|-------|
| 2026-05-28 | Spec inicial creada | Documentación funcional del código existente sin tests previos |
