# Módulo: Base API (Configuración Axios)

## Responsabilidad
Centraliza la configuración HTTP del frontend: crea una instancia Axios reutilizable que inyecta automáticamente el token JWT en cada request y maneja la expiración de sesión (401) redirigiendo al login. Evita que cada servicio repita lógica de autenticación y manejo de errores.

## Configuración
| Propiedad | Valor | Descripción |
|-----------|-------|-------------|
| `baseURL` | `process.env.REACT_APP_BASE_API_URL` | URL base del backend, leída de variables de entorno de Create React App |
| `timeout` | _no configurado_ | Sin timeout explícito; depende del default de Axios (~0 = infinito) |
| `headers` | _ninguno por defecto_ | Se inyectan dinámicamente vía interceptor de request |

## Interceptores

### Request
Antes de cada petición:
1. Intenta leer `user-access-token` de `localStorage`.
2. Si existe, agrega el header `Authorization: Bearer <token>`.
3. Si `localStorage` no es accesible (ej. modo incógnito estricto, cookies bloqueadas), captura el error con `console.warn` y envía el request **sin token**.
4. Incluye un `console.debug("Handling request interceptor")` para trazabilidad en desarrollo.

### Response
- **Éxito**: desempaqueta automáticamente `response.data`, devolviendo solo el payload útil en lugar del objeto Axios completo.
- **Error (401)**: cuando el backend responde con Unauthorized **y** la página actual NO es `/login`:
  1. Elimina `current-user` y `user-access-token` de `localStorage`.
  2. Redirige con `window.location.href = "/"` (hard redirect, no React Router).
  3. Retorna `Promise.resolve()` para que el caller no reciba un error rechazado.
- **Error (cualquier otro)**: rechaza la promesa con el error original.

## Manejo de errores

| Código / Situación | Comportamiento |
|--------------------|----------------|
| `401` (fuera de `/login`) | Limpia localStorage, redirige a `/`, resuelve silenciosamente |
| `401` (en `/login`) | Rechaza la promesa normalmente (el login page maneja el error) |
| `403`, `500`, otros | Rechaza la promesa; el servicio o componente caller debe manejarlo |
| Network error (sin response) | Rechaza la promesa; `error.response` es `undefined` |
| `localStorage` inaccesible | `console.warn`, continúa sin token (no bloquea el request) |

## Dependencias
- `axios` — librería HTTP
- `process.env.REACT_APP_BASE_API_URL` — variable de entorno de Create React App
- `localStorage` — almacenamiento del navegador para `user-access-token` y `current-user`
- `window.location` — redirección hard en caso de 401

## Gotchas
- **Hard redirect en 401**: usa `window.location.href = "/"` en lugar de `navigate()` de React Router. Esto causa un **full page reload**, perdiendo todo el estado en memoria del SPA.
- **Silent resolution en 401**: retorna `Promise.resolve()` sin valor, lo que significa que cualquier `.then()` posterior recibe `undefined` en lugar de un error. Los callers que esperen datos pueden fallar silenciosamente.
- **Sin timeout**: no hay timeout configurado. En redes lentas o backend caído, los requests pueden quedar pendientes indefinidamente.
- **Token key hardcodeada**: la clave `user-access-token` está hardcodeada en el interceptor; si AuthStore cambia el nombre de la key, este interceptor se rompe silenciosamente.
- **Safari iOS Private Browsing**: `localStorage` puede lanzar `QuotaExceededError` o ser inaccesible en modo privado. El try/catch lo maneja, pero el request se envía sin autenticación.
