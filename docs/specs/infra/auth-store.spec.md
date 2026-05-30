# Módulo: AuthStore (Contexto de Autenticación)

## Responsabilidad
Centraliza el estado de autenticación, la sesión del usuario activo, la semana y fecha seleccionadas, y la persistencia en `localStorage`. Actúa como proveedor global de contexto para toda la app, invalidando cachés de turnos cuando el usuario cambia.

## API pública

| Export | Tipo | Descripción |
|--------|------|-------------|
| `AuthStore` (default) | React Component (Provider) | Envuelve la app y provee el contexto de auth |
| `AuthContext` | React Context | El contexto en sí, consumible vía `useContext(AuthContext)` |

### Valores expuestos por el Provider (`value`)

| Clave | Tipo | Descripción |
|-------|------|-------------|
| `user` | `object \| undefined` | Usuario logueado (con `token`, `role`, etc.) o `undefined` |
| `currentWeek` | `any \| undefined` | Semana seleccionada en la agenda |
| `currentDate` | `any \| undefined` | Fecha seleccionada en la agenda |
| `onUserChange(user)` | `(user?) => void` | Actualiza el usuario; persiste o limpia `localStorage` según corresponda |
| `logout()` | `() => void` | Limpia sesión, resetea estado y navega a `/login` |
| `onWeekSelect(week)` | `(week) => void` | Selecciona una semana (solo en memoria) |
| `onDateSelect(date)` | `(date?) => void` | Selecciona o elimina una fecha; persiste en `localStorage` |
| `deleteDate()` | `() => void` | Elimina la fecha seleccionada (solo en memoria, **no** toca `localStorage`) |

## Estado interno

| Estado | Tipo | Para qué se usa | Cuándo cambia |
|--------|------|-----------------|---------------|
| `user` | `object \| undefined` | Usuario autenticado actual | Login, logout, o restauración desde `localStorage` al montar |
| `currentWeek` | `any \| undefined` | Semana activa en la vista de turnos | Cuando se llama `onWeekSelect` o `logout` |
| `currentDate` | `any \| undefined` | Fecha activa en la vista de turnos | Cuando se llama `onDateSelect`, `deleteDate`, `logout`, o restauración desde `localStorage` al montar |

## Dependencias

| Dependencia | Origen | Para qué se usa |
|-------------|--------|-----------------|
| `usePushNotifications` | `../hooks/usePushNotifications` | Registra push notifications para admins al detectar un usuario |
| `clearGuestTurnsCache` | `../components/turns/turn-list-by-week/TurnListByWeek` | Invalida caché de turnos del guest al cambiar usuario |
| `clearAdminTurnsCache` | `../components/turns/turns-list-by-week-admin/TurnsListByWeekAdmin` | Invalida caché de turnos del admin al cambiar usuario |
| `useNavigate` | `react-router-dom` | Redirige a `/login` tras logout |
| `localStorage` | Browser API | Persiste `current-user`, `user-access-token`, y `current-date` |

## Comportamiento

### Restauración de sesión al montar
Al inicializar `AuthStore`, lee `current-user` y `current-date` desde `localStorage`. Si existen, los parsea y los usa como valores iniciales de `user` y `currentDate`. Si `localStorage` no está disponible o el parseo falla, retorna `undefined` silenciosamente (con `console.warn`).

### Login / Actualización de usuario (`onUserChange`)
1. Invalida **siempre** los cachés de turnos (guest y admin).
2. Si `user` es falsy (logout): elimina `user-access-token`, `current-user` y `current-date` de `localStorage`.
3. Si `user` tiene valor: guarda `user.token` en `user-access-token` y el objeto completo en `current-user` (JSON stringified).
4. Actualiza el estado `user`.

> **Nota**: `onUserChange` es la única función que maneja login y logout a la vez. No hay un `login()` separado — el componente de login llama directamente a `onUserChange(user)`.

### Logout (`logout`)
1. Llama `handleUserChange()` sin argumentos (equivale a logout).
2. Resetea `currentWeek` y `currentDate` a `undefined`.
3. Navega a `/login`.

### Selección de semana (`onWeekSelect`)
Solo actualiza el estado en memoria (`currentWeek`). **No persiste** en `localStorage`.

### Selección de fecha (`onDateSelect`)
1. Si `date` es falsy: elimina `current-date` de `localStorage`.
2. Si `date` tiene valor: guarda en `localStorage` como JSON.
3. Actualiza el estado `currentDate`.

### Eliminación de fecha (`deleteDate`)
Llama `setCurrentDate()` sin argumentos, lo que setea `currentDate` a `undefined`. **No toca `localStorage`** — inconsistencia con `onDateSelect(null)`.

### Push Notifications
El hook `usePushNotifications(user)` se ejecuta cada vez que `user` cambia. Solo activa el flujo de push si el usuario tiene `role === 'admin'` y el navegador soporta Service Workers y Push Manager.

## Gotchas

1. **`deleteDate` vs `onDateSelect(null)`**: `deleteDate()` solo limpia el estado en memoria pero **no elimina** `current-date` de `localStorage`. `onDateSelect(null)` sí lo elimina. Esto puede causar que al recargar la página se restaure una fecha que el usuario creía eliminada.

2. **`onUserChange` sin token**: Si se pasa un objeto `user` sin propiedad `token`, se guarda `undefined` en `user-access-token` en `localStorage`. No hay validación de que el token exista.

3. **`currentDate` inicializer**: `useState(restoreDateFromLocalStorage)` pasa la **función** como initializer (lazy), lo cual es correcto. Pero `useState(restoreUserFromLocalStorage())` pasa el **resultado** de la función (ejecución inmediata). Ambos funcionan, pero la inconsistencia es un code smell.

4. **Sin protección contra XSS en `localStorage`**: El token y el usuario se almacenan en `localStorage` sin cifrar. Si hay un vector XSS, el token es accesible. No hay refresh de token — la sesión expira cuando el JWT expira.

5. **Cachés de turnos acoplados al contexto de auth**: `AuthStore` importa directamente funciones de invalidación de caché desde componentes de turnos. Esto crea un acoplamiento circular potencial — el contexto de infraestructura conoce detalles de componentes de dominio.

6. **`currentWeek` no se persiste**: A diferencia de `currentDate`, la semana seleccionada se pierde al recargar la página.
