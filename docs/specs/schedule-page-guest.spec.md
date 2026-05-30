# Agenda de Turnos — Vista Pública (Guest)

## Metadata
- **Ruta en la app**: `/schedule` (o la ruta pública del calendario)
- **Componente principal**: `SchedulePageGuest.jsx`
- **Archivos relacionados**:
  - `web/src/components/week-navigator/WeekNavigator.jsx` — navegador ◀ semana ▶
  - `web/src/components/carousel/WeekCarousel.jsx` — carrusel de semanas con swipe
  - `web/src/components/turns/turn-list-by-week/TurnListByWeek.jsx` — grilla de 6 columnas de días
  - `web/src/components/turns/turn-item-guest/TurnItemGuest.jsx` — ítem de turno individual
  - `web/src/components/turns/agenda-not-available/AgendaNotAvailable.jsx` — estado "bloqueado" (gris)
  - `web/src/components/turns/not-avalaible-turn/NotAvailableTurn.jsx` — estado "sin turnos" (gris)
  - `web/src/components/turns/turns-color-explication/TurnsColorsExplication.jsx` — leyenda de colores
  - `web/src/utils/monthVisibility.js` — lógica de visibilidad por mes
  - `web/src/services/turns.js` — capa de acceso a la API
  - `web/src/contexts/AuthStore.js` — contexto global de semana seleccionada
- **Última actualización**: 2026-05-30
- **Roles que interactúan**: visitante (sin sesión), usuario autenticado (igual a visitante en esta vista)

---

## Descripción General

Esta es la página pública de la agenda. Cualquier persona puede entrar sin registrarse y ver qué turnos están disponibles en el salón. Los turnos se muestran organizados por semana en una grilla de 6 días (lunes a sábado). La página NO permite reservar — es solo de consulta. Para reservar, el visitante es redirigido al flujo de servicios mediante un botón flotante.

---

## Comportamiento por Rol

### 👤 Visitante (sin sesión iniciada) / Usuario autenticado

> Esta vista tiene exactamente el mismo comportamiento para visitantes y usuarios con sesión iniciada. La diferencia de rol **no aplica aquí** — la restricción de visibilidad y navegación es idéntica para ambos.

**Qué puede ver:**
- La semana actual con los turnos disponibles, organizados de lunes a sábado
- El rango de fechas de la semana seleccionada en el navegador de semana
- Una leyenda de colores que explica el estado de cada turno
- Los turnos de las semanas navegables dentro del rango permitido
- El mensaje `AgendaNotAvailable` con la fecha de apertura cuando un mes aún no está abierto
- El mensaje `NotAvailableTurn` cuando un día no tiene turnos cargados

**Qué puede hacer:**
- Navegar hacia semanas futuras (dentro del límite del mes visible)
- Hacer swipe horizontal en móvil para cambiar de semana (carrusel con Framer Motion)
- Ver el detalle visual de cada turno (disponible, ocupado, etc.)
- Hacer clic en "¡Pide tu cita aquí!" para ir al flujo de servicios

**Qué NO puede hacer:**
- Navegar hacia semanas pasadas (el botón "anterior" está deshabilitado si está en la semana actual)
- Ver turnos de meses cuya agenda no se ha abierto todavía
- Reservar un turno desde esta página
- Acceder a funciones de administración

---

## Reglas de Negocio

1. **Techo de visibilidad por mes (REGLA CRÍTICA)**: El visitante solo puede ver hasta el último día del mes siguiente al mes actual. Es decir: si hoy es cualquier día de mayo, el máximo visible es el 31 de mayo (mes actual, visible completo) + todos los días de junio (mes siguiente). A partir del 1 de julio, la agenda estaría bloqueada con el estado `AgendaNotAvailable`.

    - Fórmula en código (regla normal): `endOfMonth(addMonths(new Date(), 1))`
    - **Excepción de junio**: Solo el 1 de junio el offset cambia de M+1 a M+2 (2 meses adelante). El 1 de julio vuelve a la regla normal M+1.
      - Fórmula en código (excepción): `endOfMonth(new Date(now.getFullYear(), currentMonth + 2, 1))`
      - Esta excepción aplica únicamente en junio (0-indexed: mes 5).
    - Esta regla controla la visualización columna a columna dentro de una semana (cada columna se evalúa independientemente con `getMonthVisibility`).
    - **Navegación**: El visitante puede navegar hasta el final del mes BLOQUEADO (el mes siguiente al último visible), para poder ver los candados informativos.
      - Fórmula navegación (regla normal): `maxNavigationDate = endOfMonth(addMonths(new Date(), 2))`
      - Fórmula navegación (excepción): `endOfMonth(new Date(now.getFullYear(), currentMonth + 3, 1))`
      - El botón ▶ se deshabilita solo al llegar a este segundo límite.

2. **Apertura de mes**: El primer día de cada mes (día 1 del mes M), la agenda del mes siguiente (M+1) se "abre" automáticamente para que los visitantes puedan verla. No hay intervención manual del admin para esto — es una consecuencia directa de la fórmula del punto 1.

    **Excepción de junio**: El 1 de junio el offset cambia de M+1 a M+2 (se publican turnos de agosto). El 1 de julio vuelve a M+1 (se abre agosto por regla normal). El 1 de agosto abre septiembre (M+1). El 1 de septiembre abre octubre (M+1).

3. **Restricción de navegación al pasado**: Los visitantes no pueden retroceder a semanas anteriores a la actual. El botón ◀ está deshabilitado si la semana mostrada es la semana actual. La comparación se hace por `isSameDay` entre el primer día de la semana actual (domingo) y el `firstDay` del `currentWeek` del contexto.

4. **Reset al montar**: Cada vez que el visitante navega a esta página (montaje del componente), la semana se reinicia automáticamente a la semana actual. Esto impide que el carrusel quede "recordando" una semana futura de una visita anterior.

5. **Turno de selección sin efecto**: La función `onTurnSelection` que se pasa a `TurnListByWeek` está vacía (`useCallback(() => {}, [])`). En esta vista los turnos son solo de consulta — no pasan datos hacia arriba ni disparan ninguna acción.

---

## Componentes Utilizados

| Componente | Responsabilidad en esta vista |
|------------|-------------------------------|
| `WeekNavigator.jsx` | Muestra el rango de fechas de la semana y los botones ◀ ▶. Recibe `disablePrev` y `disableNext` para bloquear la navegación según las reglas |
| `WeekCarousel.jsx` | Renderiza un carrusel de 3 paneles (semana anterior, actual, siguiente) con animación y soporte para swipe táctil. Gestiona la transición y llama a `onWeekChange` al cambiar |
| `TurnListByWeek.jsx` | Grilla de 6 columnas (1 por día: lunes-sábado). Hace el fetch a la API, aplica el caché, y evalúa la visibilidad de cada columna con `getMonthVisibility`. Exporta también `clearGuestTurnsCache` |
| `TurnItemGuest.jsx` | Tarjeta visual de un turno individual. Solo presentación |
| `AgendaNotAvailable.jsx` | Mensaje mostrado en una columna cuando `isLocked: true`. Muestra la fecha a partir de la cual se abrirá ese mes. Estética en escala de grises. |
| `NotAvailableTurn.jsx` | Mensaje mostrado cuando una columna no tiene turnos cargados (no confundir con bloqueado) |
| `TurnsColorsExplication.jsx` | Leyenda estática de colores de estado de turno |

---

## Llamadas a API

| Endpoint | Método | Cuándo se llama | Qué retorna |
|----------|--------|-----------------|-------------|
| `/turns/date/:initDate?endDate=:sixthDay` | `GET` | Al montar `TurnListByWeek` y al cambiar `initDate` | Array de turnos para el rango de fechas dado |

**Notas de la capa de datos:**
- El servicio `turns.js` usa `http` (axios o fetch con base URL configurada)
- El rango de fechas es `initDate` (domingo de la semana) hasta `sixthDay` (sábado)
- Las fechas se formatean como strings `YYYY-MM-DD` sin depender del timezone del navegador (parsing manual `new Date(year, month - 1, day)` para evitar off-by-one en Safari)

---

## Estado y Efectos Secundarios

- **`currentWeek` (contexto)**: Semana seleccionada globalmente. Persiste en `AuthStore` mientras la sesión esté activa. Al hacer logout, se resetea a `undefined` para que la próxima sesión no herede semanas de un usuario anterior.

- **`initDate` (estado local)**: String `YYYY-MM-DD` del primer día de la semana a mostrar. Se sincroniza síncronamente al cambiar de semana (antes del re-render del carrusel) para evitar un flash donde el carrusel ve la fecha vieja.

- **Efecto de montaje** (`useEffect([], [])` en la página): Se ejecuta solo al montar. Calcula la semana actual (domingo como inicio de semana con `weekStartsOn: 0`) y la setea en el contexto y en `initDate`. Esto garantiza el reset al navegar a la página.

- **Caché de módulo en `TurnListByWeek`**: El objeto `turnsCache` vive a nivel de módulo (fuera del componente). Sobrevive desmontajes (navegación entre páginas). Implementa el patrón **stale-while-revalidate**: muestra datos previos inmediatamente mientras refresca en segundo plano. Se invalida completamente en `handleUserChange` (login/logout) dentro de `AuthStore`.

- **Prefetch de semanas adyacentes**: Después de cada fetch exitoso, `TurnListByWeek` prefetchea automáticamente las semanas `initDate - 7 días` y `initDate + 7 días` si no están en caché. Esto hace que la navegación siguiente/anterior sea instantánea.

---

## Casos Edge y Gotchas

- **Semana a caballo entre dos meses**: Si la semana mostrada tiene días en el mes visible y días en el mes bloqueado, las columnas del mes bloqueado muestran `AgendaNotAvailable` y las del mes visible muestran turnos normales. La visibilidad se evalúa columna a columna, NO semana entera.

- **Safari iOS — Parsing de fechas**: Todas las fechas se parsean manualmente (`new Date(year, month - 1, day)`) en lugar de `new Date('YYYY-MM-DD')`. Esto es crítico: Safari interpreta strings ISO sin hora como UTC, lo que puede hacer que aparezca el día anterior en timezones occidentales.

- **Carrusel y resize en móvil**: El `WeekCarousel` escucha el evento `resize`. En Safari iOS, el scroll que muestra/oculta la barra de dirección dispara `resize`. La implementación solo actualiza el ancho si cambió realmente (`prev === w ? prev : w`) para evitar el ciclo de desmontaje que hace que el scroll salte al top de la página.

- **Swipe falso por scroll vertical**: El `WeekCarousel` tiene un umbral mínimo de 15px de movimiento horizontal (`MIN_SWIPE_PX`) antes de considerar un gesto como swipe. Sin esto, un scroll vertical rápido con leve componente horizontal cambiaba de semana accidentalmente.

- **Deshabilitado con `disableNext`**: Cuando el visitante está en la última semana visible y hace swipe hacia adelante, el carrusel NO navega — anima de vuelta a la posición central con spring. Esto requiere que `disableNext` esté correctamente sincronizado en ambos lugares: `WeekNavigator` (botón) y `WeekCarousel` (swipe).

- **Flash de "sin turnos" al navegar**: Si el carrusel actualiza `initDate` antes de que el estado local se sincronice, `TurnListByWeek` puede mostrar brevemente "Sin turnos" aunque haya datos en caché. Esto se resolvió actualizando `initDate` síncronamente en `handleWeekChange` ANTES de llamar a `onWeekSelect` del contexto.

- **Cancelación de fetches obsoletos**: `TurnListByWeek` usa un flag `cancelled` (closure) para ignorar respuestas de fetches anteriores cuando el usuario navega rápido. Sin esto, una respuesta lenta de la semana A podría sobreescribir los datos ya mostrados de la semana B.

---

## Tests Derivados (Checklist)

### Navegación de semanas

- [ ] **Al montar la página**: La semana mostrada siempre es la semana actual, independientemente de lo que el usuario haya visto antes
- [ ] **Botón ◀ deshabilitado en semana actual**: Si la semana mostrada es la actual, el botón "anterior" está visualmente deshabilitado y no responde al clic
- [ ] **Botón ◀ habilitado en semanas futuras**: Si el usuario navegó una semana adelante, el botón "anterior" vuelve a estar habilitado
- [ ] **Swipe hacia atrás bloqueado en semana actual**: Si el usuario hace swipe izquierda estando en la semana actual, el carrusel rebota sin cambiar de semana

### Visibilidad por mes (REGLA CRÍTICA)

- [ ] **Mes actual completamente visible**: Todos los días del mes actual muestran turnos (o el estado "sin turnos" si no hay, pero nunca `AgendaNotAvailable`)
- [ ] **Mes siguiente completamente visible**: Todos los días del mes siguiente muestran turnos o "sin turnos"
- [ ] **Mes subsiguiente bloqueado**: Los días del mes que está dos meses por delante muestran `AgendaNotAvailable`
- [ ] **Botón ▶ deshabilitado al llegar al límite de navegación**: Cuando la semana mostrada contiene el último día del mes bloqueado, el botón "siguiente" se deshabilita (ej: si es mayo, permite navegar hasta fin de julio)
- [ ] **Semana a caballo entre meses visible/bloqueado**: Las columnas de cada mes se comportan independientemente (algunas visibles, otras bloqueadas en la misma semana)
- [ ] **El componente `AgendaNotAvailable` muestra la fecha de apertura correcta**: La fecha mostrada debe ser el día 1 del mes bloqueado

### Excepción de junio

- [ ] **El 1 de junio un guest ve turnos hasta fin de agosto** (M+2)
- [ ] **El 1 de julio un guest ve turnos hasta fin de agosto** (M+1 normal)
- [ ] **El 1 de agosto un guest ve turnos hasta fin de septiembre** (M+1 normal)
- [ ] **El 1 de septiembre un guest ve turnos hasta fin de octubre** (M+1 normal)

### Caché y datos

- [ ] **Sin parpadeo al navegar**: Al ir a una semana que ya fue visitada, los datos aparecen instantáneamente sin pasar por el estado de loading
- [ ] **Loading skeleton visible en primera visita**: La primera vez que se carga una semana, se muestra el skeleton antes de los datos
- [ ] **Invalidación de caché en login/logout**: Después de iniciar o cerrar sesión, el caché de turnos se limpia y los datos se recargan frescos

### Safari iOS

- [ ] **Sin off-by-one en fechas**: En Safari iOS, las fechas mostradas en las columnas coinciden con las fechas reales (sin que aparezca el día anterior)
- [ ] **Sin salto de scroll al hacer resize**: Al hacer scroll en Safari iOS (la barra de dirección aparece/desaparece), el carrusel no reinicia ni salta al top de la página

### Botón de conversión

- [ ] **Botón "¡Pide tu cita aquí!" visible**: El botón flotante está visible en cualquier estado de la página
- [ ] **Botón redirige a `/services`**: Al hacer clic, navega al flujo de reserva

---

## Historial de Cambios Relevantes

| Fecha | Cambio | Razón |
|-------|--------|-------|
| 2026-05-30 | Excepción de junio en visibilidad | El 1 de junio el offset cambia de M+1 a M+2 (se publican turnos de agosto). El 1 de julio vuelve a M+1 normal |
| 2026-05 | Refactor estética `AgendaNotAvailable` | De ámbar a escala de grises por requerimiento de diseño |
| 2026-05 | Extensión de límite de navegación | Permitir navegar hasta el final del mes bloqueado para ver los candados informativos |
| 2026-04 | Se añadió `WeekCarousel` con Framer Motion | Reemplazar navegación por botones sola; mejorar UX en móvil con swipe nativo |
