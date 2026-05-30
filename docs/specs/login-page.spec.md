# Spec Funcional — Login Page

## Metadata

| Campo | Valor |
|-------|-------|
| Componente | `LoginPage.jsx` |
| Ruta | `/login` |
| Archivo | `web/src/pages/LoginPage.jsx` |
| Rol | visitante (sin autenticar) |
| Última actualización | 2026-05-28 |

---

## Descripción General

Página de inicio de sesión para usuarios del sistema La Vin Nails. Permite a visitantes autenticarse con email y contraseña, acceder a la recuperación de contraseña, o navegar al registro de nueva cuenta. Tras un login exitoso, el usuario es redirigido al home (`/`) y su sesión se persiste en `localStorage`.

---

## Comportamiento por Rol

### Visitante (no autenticado)
- Ve el formulario de login con campos de email y contraseña.
- Puede navegar a `/restore` para recuperar contraseña olvidada.
- Puede navegar a `/register` para crear una cuenta nueva.
- Tras login exitoso, el rol cambia a `guest` o `admin` según el usuario, y es redirigido a `/`.

---

## Reglas de Negocio

1. **RB-01 — Validación de email obligatoria**: El campo email es requerido. Si está vacío al perder el foco (`onBlur`), se muestra "Se necesita un email".

2. **RB-02 — Validación de contraseña obligatoria**: El campo contraseña es requerido. Si está vacío al perder el foco, se muestra "Se necesita una contraseña".

3. **RB-03 — Credenciales inválidas no distinguen campo**: El backend responde con `401` y un error asociado al campo `password` ("Credenciales invalidas") tanto si el email no existe como si la contraseña no coincide. Esto evita enumeración de usuarios.

4. **RB-04 — Errores de servidor se muestran genéricos**: Si el error de login no viene con un objeto `errors` estructurado (ej. fallo de red, servidor caído), se muestra el `error.message` directamente en un banner rojo en la parte superior del formulario.

5. **RB-05 — Login exitoso persiste sesión**: Tras autenticación correcta, el token y los datos del usuario se guardan en `localStorage` (`user-access-token` y `current-user`). El usuario es redirigido a `/`.

6. **RB-06 — Login invalida cachés de turnos**: Al cambiar el usuario (login o logout), se limpian los cachés de turnos tanto de vista guest como admin para evitar datos stale de sesiones anteriores.

7. **RB-07 — El formulario valida en onBlur**: La validación de `react-hook-form` se ejecuta cuando el campo pierde el foco, no en cada cambio ni solo en submit.

---

## Componentes Utilizados

| Componente | Ruta | Responsabilidad |
|------------|------|-----------------|
| `Layout` | `components/layouts/Layout.jsx` | Envoltorio con header (logo), main con gradiente, y bottom navigation bar condicional por rol. Incluye banners PWA (install/update). |
| `UsersLogin` | `components/users/users-login/UsersLogin.jsx` | Formulario de login con validación, llamada a API, manejo de errores y redirección. |
| `ButtonPrimary` | `components/butons/ButtonPrimary.jsx` | Botón estilizado con gradiente emerald-to-pink. Usado para el CTA "Regístrate". |
| `ButtonGreen` | `components/butons/ButtonGreen.jsx` | Botón verde con gradiente emerald. Usado para el submit "Comenzar" del formulario. |

### Layout — Comportamiento relevante para Login
- El `Layout` renderiza bottom navigation con items condicionales según `role`:
  - `guest`: Home, Servicios, Agenda (guest-schedule), Perfil
  - `admin`: Home, Servicios, Agenda (admin-schedule), Gestión, Admin
- Como LoginPage se monta dentro de `Layout` pero el usuario aún no está logueado, el role es `guest` por defecto, mostrando la navegación de visitante.

---

## Llamadas a API

### POST `/login`

| Campo | Detalle |
|-------|---------|
| **Método** | `POST` |
| **Endpoint** | `/login` (base URL configurable via `REACT_APP_BASE_API_URL`) |
| **Body** | `{ email: string, password: string }` |
| **Headers** | Axios interceptor adjunta `Authorization: Bearer <token>` si existe en localStorage (no aplica para login, ya que no hay token previo). |
| **Respuesta exitosa (200)** | `{ token: string, ...user.toJSON() }` — incluye el JWT y los datos serializados del usuario (id, email, role, etc.). |
| **Respuesta error (401)** | `{ errors: { password: "Credenciales invalidas" } }` — mismo mensaje para email inexistente o contraseña incorrecta. |
| **Respuesta error (otro)** | El error se rechaza con su `message` original. |

**Controller backend**: `api/controllers/users.controllers.js` → `module.exports.login`
- Busca usuario por email.
- Si no existe → `401` con error en `password`.
- Si existe, verifica contraseña con `user.checkPassword()`.
- Si no coincide → `401` con error en `password`.
- Si coincide → genera JWT con `sub: user.id` y expiración configurable (`MAX_SESSION_TIME`, default 3600s = 1 hora).

---

## Estado y Efectos Secundarios

### Estado local (UsersLogin)
- `serverError`: `undefined` | `string` — mensaje de error genérico del servidor, se limpia en cada intento de submit.

### Estado global (AuthContext)
- `onUserChange(user)`: Actualiza el usuario en contexto, persiste en `localStorage`, e invalida cachés de turnos.
- `user`: Se actualiza con el objeto devuelto por el login.

### Efectos secundarios
1. **localStorage write**: `user-access-token` y `current-user` se escriben tras login exitoso.
2. **Cache invalidation**: `clearGuestTurnsCache()` y `clearAdminTurnsCache()` se ejecutan en cada cambio de usuario.
3. **Push notifications**: El hook `usePushNotifications(user)` se ejecuta dentro de `AuthStore` y reacciona al cambio de usuario (registro de service worker para notificaciones push).
4. **Navigación**: `navigate("/")` tras login exitoso.

---

## Casos Edge y Gotchas

### GOTCHA-01 — Error de email inexistente aparece en campo password
El backend no distingue entre "email no encontrado" y "contraseña incorrecta". Ambos devuelven `errors.password = "Credenciales invalidas"`. El frontend mapea este error al campo `password` del formulario, no al `email`. **El usuario puede pensar que su contraseña está mal cuando en realidad el email no está registrado.**

### GOTCHA-02 — `setServerError()` sin argumentos
En `onLoginSubmit`, se llama `setServerError()` sin pasar `undefined` explícitamente. En React, esto establece el estado a `undefined` (comportamiento correcto), pero es un patrón frágil — si alguien añade un parámetro después, el comportamiento cambia.

### GOTCHA-03 — Bottom nav visible en login
El `Layout` siempre renderiza la bottom navigation bar. En la página de login, el usuario ve la nav de `guest` (con links a Home, Servicios, Agenda guest, Perfil) **antes** de autenticarse. Esto puede ser confuso si el usuario espera que login sea una página aislada.

### GOTCHA-04 — Animación CSS con `translate-x-96` + `right-96`
La sección "¿No tienes cuenta?" usa una combinación de `translate-x-96` y `right-96` que se cancelan mutuamente. Esto parece ser un intento de animación de entrada que no funciona correctamente — el elemento aparece en su posición normal sin animación visible.

### GOTCHA-05 — `for` attribute en labels (no `htmlFor`)
Los labels del formulario usan `for="email"` y `for="password"` en lugar de `htmlFor`. En JSX, esto genera un warning de React y puede causar problemas de accesibilidad en algunos navegadores.

### GOTCHA-06 — Errores de red no se manejan específicamente
Si el servidor está caído o no hay conexión, el `error.message` se muestra directamente al usuario. No hay mensaje amigable tipo "No se pudo conectar al servidor".

---

## Tests Derivados

### Tests de validación de formulario
| ID | Test | Input esperado | Resultado esperado |
|----|------|----------------|-------------------|
| T-01 | Email vacío al perder foco | Campo email: `""`, onBlur | Muestra "Se necesita un email" |
| T-02 | Password vacío al perder foco | Campo password: `""`, onBlur | Muestra "Se necesita una contraseña" |
| T-03 | Email con formato válido | Campo email: `"test@mail.com"`, onBlur | No muestra error de validación |

### Tests de login exitoso
| ID | Test | Input esperado | Resultado esperado |
|----|------|----------------|-------------------|
| T-04 | Login con credenciales correctas | Email + password válidos | Redirige a `/`, token en localStorage, user en AuthContext |
| T-05 | Login invalida cachés de turnos | Login exitoso | `clearGuestTurnsCache()` y `clearAdminTurnsCache()` fueron llamados |

### Tests de login fallido
| ID | Test | Input esperado | Resultado esperado |
|----|------|----------------|-------------------|
| T-06 | Email no registrado | Email inexistente + cualquier password | Muestra "Credenciales invalidas" en campo password |
| T-07 | Contraseña incorrecta | Email válido + password incorrecto | Muestra "Credenciales invalidas" en campo password |
| T-08 | Error de servidor (500) | Servidor caído o error interno | Muestra banner rojo con `error.message` genérico |

### Tests de navegación
| ID | Test | Input esperado | Resultado esperado |
|----|------|----------------|-------------------|
| T-09 | Link "¿Olvidaste tu contraseña?" | Click en link | Navega a `/restore` |
| T-10 | Botón "Regístrate" | Click en botón | Navega a `/register` |

### Tests de Layout en Login
| ID | Test | Input esperado | Resultado esperado |
|----|------|----------------|-------------------|
| T-11 | Bottom nav muestra items de guest | Página /login sin autenticar | Muestra Home, Servicios, Agenda (guest), Perfil |

---

## Historial de Cambios

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2026-05-28 | Spec inicial creada desde código existente | SDD |
