# Agenda de Turnos (Admin)

## Metadata
- **Ruta en la app**: `/admin-schedule` (estimada)
- **Componente principal**: `SchedulePageAdmin.jsx`
- **Archivos relacionados**: `WeekNavigator.jsx`, `TurnsForm.jsx`, `WeekCarousel.jsx`, `TurnsListByWeekAdmin.jsx`, `TurnItemAdmin.jsx`, `AuthStore.jsx`, `turnsService.js`
- **Última actualización**: 2026-05-30
- **Roles que interactúan**: admin

---

## Descripción General
Muestra la vista general de la agenda para el administrador. Permite ver los turnos semana a semana, divididos por día, con navegación fluida y la capacidad de crear rápidamente nuevos bloques de turnos usando un formulario en la misma pantalla.

---

## Comportamiento por Rol

### 🛡️ Administrador
- Puede visualizar el calendario de todas las semanas (pasadas y futuras).
- Navega semana a semana mediante botones de "anterior" y "siguiente".
- Puede crear nuevos turnos (bloques de tiempo disponibles) rellenando un formulario directo en la parte superior del calendario.
- Los turnos se listan por día de forma ordenada por hora de inicio.
- Al hacer clic en un turno individual, transita al detalle del turno para editarlo.

---

## Reglas de Negocio

1. **Semana inicial condicional**: Al montar la página, si `currentWeek` ya existe en el contexto (ej: el admin vuelve desde `TurnDetailPage`), se respeta esa semana y se sincroniza `initDate` con ella. Si `currentWeek` no existe (primera visita o recarga), se inicializa a la semana actual y se actualiza el contexto global.
2. **Navegación Síncrona (Anti-flash)**: Al cambiar de semana, el estado local (`initDate`) se actualiza síncronamente antes de propagar al contexto para evitar que el componente de carrusel sufra un "flash" o reinicio por estados desfasados.
3. **Refresco por creación rápida**: Cuando el admin crea un turno con `TurnsForm`, se dispara un `reload` toggle que notifica a la lista de turnos para volver a cargar la información de esa semana instantáneamente.
4. **Estrategia SWR (Stale-While-Revalidate)**: El listado de turnos utiliza una caché global en memoria. Al moverse de semanas o volver de la edición de un turno (Back Navigation):
   - Se pinta en pantalla **inmediatamente** la última copia local (evitando pantallas blancas de carga).
   - En paralelo (background), se hace un refetch al servidor y, si hay diferencias, la vista se actualiza automáticamente.
5. **Prefetching Direccional**: Para agilizar la UX, cuando se cargan los datos de una semana, la aplicación solicita también (en background) los datos de la semana anterior y la siguiente y los deja listos en caché.

---

## Componentes Utilizados

| Componente | Responsabilidad en esta vista |
|------------|-------------------------------|
| `SchedulePageAdmin.jsx` | Coordina la navegación de la semana y el estado central para el admin. |
| `WeekNavigator.jsx` | Botones de interfaz para retroceder o avanzar de semana. |
| `TurnsForm.jsx` | Formulario simplificado para añadir turnos rápidamente. |
| `WeekCarousel.jsx` | Componente contenedor que maneja transiciones y el rendering de la semana activa. |
| `TurnsListByWeekAdmin.jsx` | Fetching de datos de la API, manejo del caché SWR y partición de la semana en 6 columnas de días. |
| `DayColumn` (interno) | Agrupa los componentes de un día específico. |

---

## Llamadas a API

| Endpoint | Método | Cuándo se llama | Qué retorna |
|----------|--------|-----------------|-------------|
| `turnsService.list(init, end)` | GET | Al entrar a una semana en `TurnsListByWeekAdmin` | Lista de turnos creados para esos 6 días. |

---

## Estado y Efectos Secundarios

- **`initDate`** (`SchedulePageAdmin`): Define la fecha base para calcular la semana mostrada. Al cambiar, obliga al listado a mostrar la semana correspondiente.
- **`reload`** (`SchedulePageAdmin`): Toggle (booleano) que cambia cuando `TurnsForm` crea un turno nuevo. Dispara el useEffect en el listado para recargar datos.
- **`turnsCache`** (`TurnsListByWeekAdmin`): Objeto global de caché a nivel de módulo. Evita perder el historial de semanas durante la vida de la sesión.
- **Efecto de carga en `TurnsListByWeekAdmin`**: Se ejecuta cuando cambia `initDate` o `reload`. Primero revisa la caché y, luego, solicita datos nuevos, actualizando de forma imperceptible si hay variaciones y gestionando posibles carreras por cancelaciones de fetches anteriores.

---

## Casos Edge y Gotchas

- **Back Navigation Nativa y Navegación por Router**: Cuando el administrador vuelve a esta página desde `TurnDetailPage` (vía `navigate()` o botón "Atrás" del navegador), el `useEffect` de montaje respeta el `currentWeek` persistido en `AuthContext` en lugar de resetear a la semana actual. Además, `initDate` se sincroniza explícitamente con ese `currentWeek` para evitar un desfase visual entre `WeekNavigator` y `WeekCarousel`. El diseño SWR fuerza silenciosamente un refetch, garantizando no mostrar *stale data*.
- **Sub-Componentes en el Listado**: Componentes como `DayColumn`, `SkeletonDay` y `EmptyDay` están extraídos fuera de la función de render de `TurnsListByWeekAdmin`. Si se declarasen dentro, React los re-montaría en cada render, destruyendo estados internos como el de `TurnItemAdmin`.
- **Falso parpadeo "Sin turnos"**: Se utiliza una inicialización de estado condicional síncrona en `TurnsListByWeekAdmin` al detectar cambio de prop `initDate` con datos en caché para renderizar la tabla al instante, antes de que el useEffect reaccione, evitando mostrar "Sin turnos" erróneamente por un instante.

---

## Tests Derivados (Checklist)

### Administrador
- [x] Verificar que muestra los turnos de la caché inmediatamente al navegar entre semanas ya visitadas.
- [x] Verificar que, aunque exista caché, se revalida la data si se vuelve a montar el componente o se navega.
- [ ] Verificar que crear un turno mediante el formulario superior actualiza automáticamente la lista de esa semana.
- [ ] Verificar que el scroll y layout de la tabla son correctos sin desbordar el contenedor.

### Reglas de negocio
- [ ] **Navegación Anti-flash**: Verificar que la transición de semana en `SchedulePageAdmin` no reinicia innecesariamente `WeekCarousel`.

---

## Historial de Cambios Relevantes

| Fecha | Cambio | Razón |
|-------|--------|-------|
| 2026-05-30 | `useEffect` de montaje ahora respeta `currentWeek` si ya existe en contexto y sincroniza `initDate` | Al editar un turno y volver desde `TurnDetailPage`, la página reseteaba a la semana actual en lugar de mantener la semana que el admin estaba viendo. |
