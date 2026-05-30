# Spec Funcional: New Date Admin Page

## Metadata

| Campo | Valor |
|-------|-------|
| **Componente** | `NewDateAdminPage.jsx` |
| **Ruta** | `/admin/new-date/:id` |
| **Rol requerido** | admin |
| **Dependencia principal** | `DatesFormAdmin.jsx` |
| **Última actualización** | 2026-05-28 |

## Descripción General

Página administrativa para **crear una cita (date) en nombre de un cliente**. El admin selecciona un usuario existente, configura los detalles del servicio (tipo, descripción, necesidad de remoción) y elige un turno disponible en el calendario semanal. Tras confirmación en modal, se crea la cita y se marca el turno como "Solicitado".

La página en sí es un contenedor mínimo (33 líneas): lee el `id` del servicio desde los params de la ruta, carga el servicio con sus tipos, y delega toda la lógica al componente `DatesFormAdmin`.

## Comportamiento por Rol

### Admin
- Accede a la página desde `/admin/new-date/:id` donde `:id` es el ID del servicio.
- Ve un formulario de 5 pasos para crear una cita en nombre de un cliente.
- Debe seleccionar un usuario existente de la base de datos (no puede inventar uno).
- Selecciona un turno disponible en el carrusel semanal.
- Confirma la solicitud en un modal de confirmación.
- Tras éxito, es redirigido a `/admin-schedule`.

### Visitante / Usuario no admin
- No debería poder acceder a esta ruta (la protección de rol se maneja a nivel de routing, no en este componente).

## Reglas de Negocio

1. **Servicio obligatorio**: La página requiere un `:id` de servicio válido en la URL. Si el servicio no existe o la llamada falla, el formulario se renderiza con `service = {}` (nombre vacío, tipos vacíos).

2. **Usuario obligatorio (validación manual)**: El campo de selección de usuario NO está registrado en `react-hook-form`. Se valida manualmente en `onFormValid`: si `selectedUser.id` no existe, se dispara un error custom con scroll automático al input del usuario.

3. **Tipo de servicio con valor por defecto**: Si `serviceTypes` tiene elementos, el primer tipo se preselecciona automáticamente vía `setValue("type", serviceTypes[0])`.

4. **Descripción obligatoria**: El campo `designDetails` es requerido con mínimo 3 caracteres y máximo 300.

5. **Remoción obligatoria**: El campo `needRemove` es un radio button requerido con dos opciones: "No" (uñas limpias) o "Sí" (con remoción).

6. **Turno obligatorio**: El botón "Solicitar cita" aparece deshabilitado (gris) hasta que se selecciona un turno con `hour` definido.

7. **Doble escritura atómica**: Al confirmar, se ejecutan DOS operaciones en secuencia:
   - Primero: `POST /dates` crea la cita.
   - Segundo: `PATCH /turns/:id` actualiza el turno a `state: "Solicitado"`.
   - Si la primera falla, la segunda no se ejecuta.
   - Si la primera succeeds pero la segunda falla, el error se muestra pero la cita ya fue creada.

8. **Invalidación de caché tras éxito**: Tras crear la cita exitosamente, se limpian ambos caches de turnos (`clearGuestTurnsCache` y `clearAdminTurnsCache`) para evitar que el turno recién reservado aparezca como "Disponible" en otras vistas.

9. **Semana inicial siempre reseteada**: Al montar el componente, la semana se resetea a la semana actual (domingo a sábado), independientemente de la semana que estuviera seleccionada en el contexto global.

10. **Usuarios cargados una sola vez**: La lista de usuarios se carga una vez al montar (`UsersService.list()`). No se recarga al cambiar de turno ni al navegar entre semanas.

11. **Cierre de dropdown por click fuera**: Un event listener en `document` cierra el dropdown de usuarios cuando el click ocurre fuera del input. Se limpia correctamente en el teardown del useEffect.

## Componentes Utilizados

| Componente | Propósito | Props clave |
|------------|-----------|-------------|
| `Layout` | Shell de la app con navbar y bottom nav | `children` |
| `DatesFormAdmin` | Formulario completo de 5 pasos + modal | `service`, `serviceTypes` |
| `WeekNavigator` | Navegación de semana (prev/next) con fechas formateadas | `currentWeek`, `onPrev`, `onNext` |
| `WeekCarousel` | Carrusel deslizable de 3 paneles (semana prev/center/next) | `initDate`, `onWeekChange`, `renderItem` |
| `CalendarPanelAdmin` (memo) | Wrapper memoizado de `TurnListByWeek` para evitar remounts | `date`, `selectedTurn`, `onTurnSelection` |
| `TurnListByWeek` | Grid de 6 columnas con turnos del día, caché stale-while-revalidate | `initDate`, `onTurnSelection`, `selectedTurn` |
| `Modal` | Overlay de confirmación antes del submit | `modalState`, `setModalState`, `children` |
| `UserItemSelect` | Item individual en la lista de búsqueda de usuarios | `user`, `onUserSelect` |

## Llamadas a API

| # | Método | Endpoint | Cuándo | Payload / Params | Respuesta esperada |
|---|--------|----------|--------|------------------|-------------------|
| 1 | `GET` | `/services/:id` | Al montar (useEffect) | `id` desde `useParams()` | Objeto service con `id`, `name`, `type` (array de strings) |
| 2 | `GET` | `/users` | Al montar (useEffect) | Ninguno | Array de usuarios con `id`, `name`, `surname` |
| 3 | `POST` | `/dates` | Al confirmar submit | `{ user, service, turn, type, designDetails, needRemove }` | Objeto date creado (201) |
| 4 | `PATCH` | `/turns/:id` | Tras éxito de POST /dates | `{ ...selectedTurn, state: "Solicitado" }` | Turno actualizado |
| 5 | `GET` | `/turns/date/:start?endDate=:end` | Dentro de `TurnListByWeek`, al cambiar semana | Rango de fechas (6 días) | Array de turnos con `id`, `hour`, `date`, `state`, `dateData` |

### Detalle del payload de POST /dates

El objeto enviado se construye en `onDateSubmit`:
- `user`: ID del usuario seleccionado (manual, no del form)
- `service`: ID del servicio (de `useParams`)
- `turn`: ID del turno seleccionado
- `type`: valor del select (primer tipo de servicio por defecto)
- `designDetails`: texto del textarea (3-300 chars)
- `needRemove`: "Sí" o "No"

### Comportamiento del backend (dates.controllers.js)

Tras crear la date, el backend:
1. Responde 201 con el objeto creado.
2. En segundo plano (fire-and-forget): popula la date con turn, user, service y envía email de notificación.
3. Envía push notification a todos los admins con título "🗓️ Nueva Reserva".

## Estado y Efectos Secundarios

### Estado local (useState)

| Variable | Tipo | Inicialización | Propósito |
|----------|------|----------------|-----------|
| `service` | object | `{}` | Datos del servicio cargado desde API |
| `serviceTypes` | array | `[]` | Array de tipos extraído de `service.type` |
| `initDate` | string (YYYY-MM-DD) | Domingo de la semana actual | Fecha base para el carrusel de turnos |
| `selectedTurn` | object | `{}` | Turno seleccionado por el admin |
| `selectedDate` | derived | `selectedTurn.date` | Fecha derivada del turno |
| `modalState` | boolean | `false` | Controla visibilidad del modal de confirmación |
| `formData` | object \| null | `null` | Datos validados del form (se guardan antes de abrir modal) |
| `users` | array | `[]` | Lista completa de usuarios para el selector |
| `search` | string | `""` | Texto de búsqueda en el input de usuarios |
| `open` | string | `"hidden"` | Estado de visibilidad del dropdown (`"hidden"` o `""`) |
| `selectedUser` | object | `{}` | Usuario seleccionado del dropdown |
| `isSubmitting` | boolean | `false` | Controla estado del botón de confirmación |
| `serverError` | string \| undefined | `undefined` | Mensaje de error del servidor |

### Contexto consumido

| Contexto | Valores usados | Propósito |
|----------|----------------|-----------|
| `AuthContext` | `currentWeek`, `onWeekSelect` | Sincronizar semana seleccionada globalmente |

### Efectos secundarios

1. **Navegación**: Tras éxito completo, redirige a `/admin-schedule`.
2. **Cache clearing**: Limpia caches de turnos guest y admin tras éxito.
3. **Scroll + focus**: Si el usuario no está seleccionado al submit, hace scroll suave al input y le da foco tras 300ms.
4. **Email + Push (backend)**: El backend envía email y push notification tras crear la date.

## Casos Edge y Gotchas

### Gotcha 1: CalendarPanelAdmin debe estar FUERA del componente
`CalendarPanelAdmin` está definido como componente separado con `React.memo` **fuera** de `DatesFormAdmin`. Si estuviera dentro, cada render crearía un tipo nuevo de componente → React haría unmount + remount de los 3 paneles del carrusel → freeze del UI.

### Gotcha 2: El campo usuario NO está en react-hook-form
El selector de usuarios es manual (input + dropdown custom). No está registrado con `register()`. La validación se hace manualmente en `onFormValid` chequeando `selectedUser?.id`. Si falla, se dispara `setError("user", ...)` manualmente.

### Gotcha 3: Submit cierra modal incluso en error
En el `catch` de `onDateSubmit`, se ejecuta `setModalState(false)` antes de mostrar el error. Esto significa que el usuario ve el error en el banner del form, no dentro del modal.

### Gotcha 4: Doble escritura sin rollback
Si `POST /dates` succeeds pero `PATCH /turns/:id` falla, la cita queda creada pero el turno NO cambia a "Solicitado". No hay mecanismo de compensación/rollback.

### Gotcha 5: Service vacío si la carga falla
Si `servicesService.detail(id)` falla (catch), el componente no muestra error ni loading. Simplemente renderiza con `service = {}` y `serviceTypes = []`, lo que resulta en un formulario sin nombre de servicio y sin opciones de tipo.

### Gotcha 6: Semana se resetea siempre al montar
El useEffect de inicialización de semana se ejecuta **siempre** al montar, sin importar qué semana estuviera activa en el contexto global. Esto es intencional para que el admin siempre empiece en la semana actual.

### Gotcha 7: Caches de turnos separados (guest vs admin)
Existen dos caches independientes: `turnsCache` en `TurnListByWeek.jsx` (guest) y `turnsCache` en `TurnsListByWeekAdmin.jsx` (admin). Ambos se limpian tras crear una cita para evitar inconsistencia visual.

### Gotcha 8: Event listener de document para cerrar dropdown
El listener de click en `document` para cerrar el dropdown se registra correctamente en useEffect con cleanup. Sin embargo, compara `e.target !== input` por referencia directa, lo que significa que clicks en cualquier parte del documento (incluyendo hijos del dropdown) cierran el dropdown. El dropdown solo permanece abierto mientras se interactúa directamente con el input.

### Edge case: Servicio sin tipos
Si `service.type` es undefined o array vacío, el select de tipos no renderiza opciones. El usuario verá un select vacío y la validación `required` se disparará.

### Edge case: Lista de usuarios vacía
Si `UsersService.list()` retorna array vacío o falla, el dropdown no muestra resultados. El usuario no puede completar el paso 1.

## Tests Derivados

### Tests de renderizado
1. **T1**: Renderiza el Layout con el título del servicio cuando la carga es exitosa.
2. **T2**: Renderiza el formulario con serviceTypes poblados cuando el servicio tiene tipos.
3. **T3**: Renderiza sin error visible cuando la carga del servicio falla (service vacío).
4. **T4**: El botón "Solicitar cita" aparece deshabilitado (gris) cuando no hay turno seleccionado.
5. **T5**: El botón "Solicitar cita" aparece habilitado (verde) cuando hay un turno con hour seleccionado.

### Tests de interacción
6. **T6**: Al escribir en el input de búsqueda, filtra la lista de usuarios por nombre (case-insensitive).
7. **T7**: Al seleccionar un usuario, el input muestra "nombre surname" y se cierra el dropdown.
8. **T8**: Al hacer click fuera del input de usuario, el dropdown se cierra.
9. **T9**: El tipo de servicio preselecciona el primer valor de serviceTypes.
10. **T10**: La navegación de semana (prev/next) actualiza el carrusel y los turnos mostrados.

### Tests de validación
11. **T11**: Submit sin usuario seleccionado muestra error "Debes buscar y seleccionar un paciente de la lista" y hace scroll al input.
12. **T12**: Submit sin tipo de servicio muestra error "Debes seleccionar un tipo de decoración."
13. **T13**: Submit con designDetails menor a 3 caracteres muestra error de minLength.
14. **T14**: Submit con designDetails mayor a 300 caracteres muestra error de maxLength.
15. **T15**: Submit sin seleccionar needRemove muestra error "Debes seleccionar una opción."
16. **T16**: Submit sin turno seleccionado no abre el modal (botón deshabilitado).

### Tests de submit
17. **T17**: Al confirmar en el modal, se llama a POST /dates con el payload correcto.
18. **T18**: Tras éxito de POST /dates, se llama a PATCH /turns/:id con state "Solicitado".
19. **T19**: Tras éxito completo, se limpian ambos caches de turnos y se navega a /admin-schedule.
20. **T20**: Si POST /dates falla, se muestra el error del servidor en el banner y NO se ejecuta PATCH /turns.
21. **T21**: Si PATCH /turns falla tras éxito de POST, el error se muestra pero el modal ya está cerrado.
22. **T22**: El botón "Confirmar" del modal muestra "Enviando..." y está deshabilitado durante el submit.

### Tests de estado inicial
23. **T23**: Al montar, la semana se inicializa al domingo de la semana actual.
24. **T24**: Al montar, se carga la lista de usuarios una sola vez.
25. **T25**: Al montar, se actualiza currentWeek en el AuthContext a la semana actual.

## Historial de Cambios

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2026-05-28 | Spec inicial creada desde análisis del código fuente | SDD Apply |
