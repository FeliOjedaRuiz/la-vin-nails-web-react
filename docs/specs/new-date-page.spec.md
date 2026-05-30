# New Date Page (Reserva de Turno)

## Metadata
- **Ruta en la app**: `/new-date/:id` (el `id` es el ObjectId del servicio)
- **Componente principal**: `NewDatePage.jsx`
- **Archivos relacionados**:
  - `components/dates/dates-form/DatesForm.jsx` — formulario de 4 pasos con toda la lógica de reserva
  - `services/services.js` — llamada `GET /services/:id` para cargar el servicio
  - `services/dates.js` — llamada `POST /dates` para crear la reserva
  - `services/turns.js` — llamada `PATCH /turns/:id` para actualizar el estado del turno
  - `contexts/AuthStore.js` — contexto que provee `user`, `currentWeek`, `onWeekSelect`
  - `components/week-navigator/WeekNavigator.jsx` — botones prev/next para navegar semanas
  - `components/carousel/WeekCarousel.jsx` — carrusel con swipe (Framer Motion) de 3 paneles
  - `components/turns/turn-list-by-week/TurnListByWeek.jsx` — grilla de turnos por día con caché stale-while-revalidate
  - `components/turns/turns-list-by-week-admin/TurnsListByWeekAdmin.jsx` — caché admin (invalidación cruzada)
  - `components/modal/Modal.jsx` — modal de confirmación antes de enviar
  - `components/turns/turns-color-explication/TurnsColorsExplication.jsx` — leyenda: rosa=disponible, gris=ocupado
  - `components/notices/Notices.jsx` — modal de comunicados activos al cargar la página
  - `components/layouts/Layout.jsx` — layout con header fijo y bottom nav
  - `utils/monthVisibility.js` — calcula si un día está bloqueado (mes futuro no abierto)
- **Última actualización**: 2026-05-28
- **Roles que interactúan**: visitante, usuario

---

## Descripción General
Permite a un usuario solicitar una cita para un servicio específico. El flujo consiste en completar 4 pasos: elegir el tipo de servicio, describir el diseño deseado, indicar si necesita remoción de uñas previas, y seleccionar un turno disponible en el calendario. Al confirmar, se crea una reserva (Date) y se marca el turno como "Solicitado".

---

## Comportamiento por Rol

### 👤 Visitante (sin sesión)
- **Puede ver**: la página completa con el formulario, el servicio seleccionado, el calendario con turnos disponibles, y la leyenda de colores
- **Puede hacer**: navegar por las semanas del calendario, seleccionar un turno, completar los campos del formulario
- **NO puede hacer**: confirmar la reserva. Al intentar enviar, recibe el mensaje: *"Tu sesión no pudo ser verificada. Prueba abrir la web desde Safari o vuelve a iniciar sesión."* dentro del modal de confirmación
- **Redirecciones**: ninguna. La página no redirige al visitante; simplemente bloquea el submit

### 🔑 Usuario autenticado
- **Diferencias con el visitante**: puede completar el flujo de reserva exitosamente
- **Acciones disponibles**: completar los 4 pasos, ver el modal de confirmación con resumen, enviar la solicitud, y ser redirigido a `/profile` tras el éxito
- **Protección contra doble-submit**: el botón "Confirmar" se deshabilita y muestra "Enviando..." mientras la petición está en curso

---

## Reglas de Negocio

1. **Solo usuarios autenticados pueden reservar**: al confirmar, se verifica `user?.id`. Si no existe, se bloquea el envío con mensaje de error en el modal. Esto se valida en el momento del submit, no al cargar la página.

2. **Formulario de 4 pasos obligatorios**:
   - Paso 1: seleccionar tipo de servicio (obligatorio, viene del servicio cargado)
   - Paso 2: describir detalles del diseño (obligatorio, 3-300 caracteres)
   - Paso 3: indicar si necesita remoción (Sí/No, obligatorio)
   - Paso 4: seleccionar un turno disponible (obligatorio, sin turno seleccionado el botón "Solicitar cita" aparece deshabilitado en gris)

3. **Navegación temporal limitada**:
   - **No se puede ir al pasado**: el botón "prev" de la semana está deshabilitado cuando la semana mostrada es la semana actual
   - **Techo de visibilidad**: los turnos más allá del fin del mes siguiente están bloqueados con candado (`isLocked`) y muestran `AgendaNotAvailable`
   - **Techo de navegación**: no se puede navegar más allá del fin del mes subsiguiente (permite ver las semanas del mes bloqueado con candados)

4. **Aplicación atómica en dos pasos**: al confirmar, primero se crea el `Date` (POST /dates) y luego se actualiza el `Turn` a estado "Solicitado" (PATCH /turns/:id). Si el segundo paso falla, el primero ya se ejecutó (no hay rollback).

5. **Invalidación de caché tras reserva exitosa**: se limpian tanto el caché de turnos guest como el de admin para que el calendario muestre datos frescos al volver.

6. **Cierre del modal antes de navegar**: el modal se cierra (`setModalState(false)`) ANTES del `navigate("/profile")`. Sin esto, el modal fixed z-20 queda renderizado encima de la página de perfil.

7. **Detección de in-app browsers**: si el user-agent detecta Instagram, Facebook, Twitter, Line o Snapchat, se muestra un banner amarillo advirtiendo que la web debería abrirse en el navegador nativo (Safari/Chrome).

8. **El tipo de servicio se preselecciona**: al cargar los `serviceTypes`, el primer tipo se establece automáticamente como valor por defecto del select mediante `setValue` de react-hook-form.

---

## Componentes Utilizados

| Componente | Responsabilidad en esta vista |
|------------|-------------------------------|
| `Notices` | Modal de comunicados activos (se muestra antes que el contenido, z-20) |
| `Layout` | Envoltura con header fijo (logo) y bottom navigation bar |
| `DatesForm` | Formulario principal de 4 pasos con toda la lógica de reserva |
| `WeekNavigator` | Botones prev/next para navegar entre semanas con fechas formateadas |
| `WeekCarousel` | Carrusel de 3 paneles con swipe (Framer Motion), mide ancho real del viewport |
| `CalendarPanel` | Wrapper memoizado de `TurnListByWeek` — fuera de DatesForm para evitar remounts |
| `TurnListByWeek` | Grilla de 6 días (lunes a sábado) con turnos por día, caché stale-while-revalidate, prefetch de semanas adyacentes |
| `DayColumn` | Columna memoizada de un día individual con skeleton loading |
| `TurnItemGuest` | Item individual de turno (disponible/ocupado/seleccionado) |
| `TurnsColorsExplication` | Leyenda visual: rosa=disponible, gris=ocupado |
| `Modal` | Overlay de confirmación con resumen de la cita y botones cancelar/confirmar |
| `AgendaNotAvailable` | Mensaje de "agenda no disponible" para días bloqueados por mes |
| `NotAvailableTurn` | Mensaje de "sin turnos" cuando un día no tiene slots |

---

## Llamadas a API

| Endpoint | Método | Cuándo se llama | Qué retorna |
|----------|--------|-----------------|-------------|
| `GET /services/:id` | GET | Al montar `NewDatePage` (una vez) | Objeto servicio con `name`, `type` (array de tipos) |
| `GET /turns/date/:date?endDate=:endDate` | GET | Al montar cada semana del carrusel + prefetch de adyacentes | Array de turnos con `id`, `date`, `hour`, `state` |
| `POST /dates` | POST | Al confirmar la reserva (submit del formulario) | Documento Date creado (201) |
| `PATCH /turns/:id` | PATCH | Inmediatamente después de crear el Date, en la misma secuencia | Turno actualizado con `state: "Solicitado"` |
| `GET /notices?slug=comunicado` | GET | Al montar el componente `Notices` (antes del contenido) | Array con un objeto notice (`title`, `subtitle`, `description`, `active`) |

---

## Estado y Efectos Secundarios

- **`service` / `serviceTypes`**: se cargan al montar desde `GET /services/:id`. `serviceTypes` alimenta el select del paso 1.
- **`initDate`**: string `YYYY-MM-DD` del primer día de la semana mostrada. Se inicializa con la semana actual y cambia al navegar.
- **`selectedTurn`**: objeto del turno seleccionado por el usuario. De aquí se deriva `selectedDate`.
- **`selectedDate`**: valor derivado directamente de `selectedTurn.date` (sin useEffect intermedio para evitar render extra).
- **`isSubmitting`**: boolean que bloquea el botón de confirmación durante el envío.
- **`serverError`**: mensaje de error del servidor que se muestra sobre el formulario.
- **`modalError`**: mensaje de error dentro del modal (ej: sesión no verificada).
- **`formData`**: datos validados del formulario, guardados antes de abrir el modal.
- **`modalState`**: controla la visibilidad del modal de confirmación.
- **`currentWeek`**: objeto `{ firstDay, lastDay }` compartido via `AuthContext`. Controla la navegación entre semanas.
- **Efecto de carga del servicio**: se ejecuta solo al montar (`[]`), llama `servicesService.detail(id)` y setea `service` + `serviceTypes`.
- **Efecto de inicialización de semana**: se ejecuta solo al montar (`[]`), resetea `currentWeek` a la semana actual y actualiza `initDate`.
- **Efecto de valor por defecto del tipo**: se ejecuta cuando `serviceTypes` cambia, setea el primer tipo como valor del select.
- **Efecto secundario de caché**: `clearGuestTurnsCache()` y `clearAdminTurnsCache()` se llaman tras reserva exitosa para invalidar datos stale.

---

## Casos Edge y Gotchas

- **Safari iOS — parsing de fechas**: TODAS las fechas se parsean con split seguro `YYYY-MM-DD → new Date(year, month-1, day)`. Nunca se usa `new Date(string)` directo porque Safari falla con formatos ISO.
- **Safari iOS — viewport**: el `Modal` usa `height: '100dvh'` (no `100vh`) para evitar que la barra de navegación de Safari tape el contenido.
- **Safari iOS — zoom en inputs**: los inputs del formulario usan `font-size` de al menos `16px` (clases Tailwind `text-sm` = 14px en textarea, pero los selects y radios usan tamaños mayores).
- **In-app browsers**: Instagram/Facebook/Twitter abren la web en un WebView limitado que puede romper cookies/sesiones. Se detecta por user-agent y se muestra banner de advertencia.
- **Si no hay servicio**: el `service` se inicializa como `{}` vacío. El nombre se muestra como string vacío hasta que carga la API.
- **Si no hay turnos en un día**: se muestra `NotAvailableTurn` en lugar de la columna vacía.
- **Si la semana es la actual**: el botón "prev" está deshabilitado — no se puede navegar al pasado.
- **Si se supera el mes de visibilidad**: los días se muestran con candado (`AgendaNotAvailable`) indicando cuándo se abrirá la agenda.
- **Doble-submit protegido**: `if (isSubmitting) return` al inicio de `onDateSubmit` previene envíos duplicados.
- **Race condition en submit**: el `await` en `onTurnSubmit()` es deliberado — si se actualizara el turno sin await, la invalidación de caché podría ocurrir antes de que el turno se marque como "Solicitado".
- **CalendarPanel fuera de DatesForm**: está definido como componente separado y memoizado. Si estuviera dentro, cada re-render de DatesForm crearía un tipo nuevo → unmount/remount de los 540 TurnItemGuest → freeze en móvil.
- **Error handling del servidor**: si el backend retorna `errors` en la respuesta, se mapean a los campos del formulario via `setError`. Si no, se muestra mensaje genérico en `serverError` y `modalError`.
- **El modal se cierra en validación fallida**: `onInvalid` cierra el modal si react-hook-form detecta errores, evitando que quede abierto sin datos válidos.

---

## Tests Derivados (Checklist)

### Visitante
- [ ] Dado un visitante sin sesión, cuando completa los 4 pasos y hace click en "Solicitar cita", entonces se abre el modal con error de sesión
- [ ] Dado un visitante sin sesión, cuando navega la página, entonces puede ver el calendario y los turnos disponibles
- [ ] Dado un visitante sin sesión, cuando selecciona un turno, entonces el botón "Solicitar cita" cambia de gris a verde

### Usuario autenticado
- [ ] Dado un usuario autenticado, cuando completa los 4 pasos y confirma, entonces se crea un Date y se redirige a /profile
- [ ] Dado un usuario autenticado, cuando confirma una reserva, entonces el turno seleccionado cambia a estado "Solicitado"
- [ ] Dado un usuario autenticado, cuando confirma una reserva, entonces los cachés de turnos guest y admin se invalidan
- [ ] Dado un usuario autenticado, cuando hace doble click en confirmar, entonces solo se envía una petición (isSubmitting bloquea)

### Reglas de negocio
- [ ] Dado que la semana mostrada es la semana actual, cuando el usuario hace click en "prev", entonces no navega al pasado
- [ ] Dado que se supera el mes de visibilidad, cuando el usuario navega a esa semana, entonces los días muestran candado
- [ ] Dado que no se seleccionó un turno, cuando el usuario intenta enviar, entonces el botón está deshabilitado (gris)
- [ ] Dado que el textarea tiene menos de 3 caracteres, cuando el usuario intenta enviar, entonces muestra error de validación
- [ ] Dado que el textarea tiene más de 300 caracteres, cuando el usuario intenta enviar, entonces muestra error de validación
- [ ] Dado que no se seleccionó "needRemove", cuando el usuario intenta enviar, entonces muestra error de validación
- [ ] Dado un in-app browser (Instagram), cuando carga la página, entonces se muestra el banner de advertencia

### Regreso de errores del servidor
- [ ] Dado un error de validación del backend, cuando se envía el formulario, entonces los errores se mapean a los campos correspondientes
- [ ] Dado un error de conexión, cuando se envía el formulario, entonces se muestra mensaje genérico de error

---

## Historial de Cambios Relevantes
| Fecha | Cambio | Razón |
|-------|--------|-------|
| 2026-05-28 | Spec inicial creada | Documentación del comportamiento observable de NewDatePage |