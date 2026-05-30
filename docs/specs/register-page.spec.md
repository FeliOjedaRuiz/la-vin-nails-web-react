# Spec Funcional — Register Page

## Metadata

| Campo | Valor |
|-------|-------|
| Componente | `RegisterPage.jsx` |
| Ruta | `/register` |
| Archivo | `web/src/pages/RegisterPage.jsx` |
| Rol | visitante (sin autenticar) |
| Última actualización | 2026-05-28 |

---

## Descripción General

Página de registro de nuevos usuarios para el sistema La Vin Nails. Presenta un formulario con 5 campos (nombre, apellido, teléfono, email, contraseña) que valida en tiempo real al perder el foco. Tras un registro exitoso, el usuario es redirigido a la página de login (`/login`). Si el registro falla, los errores del servidor se mapean a los campos correspondientes del formulario o se muestran como un banner genérico.

Debajo del formulario, un banner invita a los usuarios ya registrados a iniciar sesión.

---

## Comportamiento por Rol

### Visitante (no autenticado)
- Ve el formulario de registro con 5 campos obligatorios.
- La validación se ejecuta al perder el foco de cada campo (`onBlur`).
- Puede enviar el formulario solo cuando todos los campos pasan la validación frontend.
- Tras registro exitoso, es redirigido a `/login` para autenticarse.
- Si el registro falla, ve errores inline en cada campo o un banner rojo genérico.
- Ve un banner inferior con enlace a `/login` para usuarios ya registrados.

---

## Reglas de Negocio

1. **RB-01 — Nombre obligatorio con límites**: El campo nombre es requerido, con mínimo 2 caracteres y máximo 20. Mensajes de error en español.

2. **RB-02 — Apellido obligatorio con límites**: El campo apellido es requerido, con mínimo 2 caracteres y máximo 20. Mensajes de error en español.

3. **RB-03 — Teléfono obligatorio con límite superior**: El campo teléfono es requerido, con máximo 12 dígitos. El formulario muestra un prefijo visual `+34` (España) que es decorativo — no se concatena al valor enviado.

4. **RB-04 — Email obligatorio con validación de formato**: El campo email es requerido y debe coincidir con el patrón `/^\S+@\S+\.\S+$/` (contiene `@` con texto a ambos lados y un `.` después del `@`).

5. **RB-05 — Contraseña obligatoria con mínimo 4 caracteres**: El campo contraseña es requerido, con mínimo 4 caracteres. No hay máximo en la validación frontend (el backend sí impone máximo de 16).

6. **RB-06 — Validación en onBlur**: El formulario usa `react-hook-form` con `mode: "onBlur"`. Los errores se muestran cuando el campo pierde el foco, no en cada cambio ni solo en submit.

7. **RB-07 — Errores del servidor se mapean a campos**: Si el backend responde con un objeto `errors` (ej. `{ email: "Email ya registrado" }`), cada error se asigna al campo correspondiente del formulario via `setError()`.

8. **RB-08 — Errores genéricos del servidor**: Si el error del servidor NO viene con un objeto `errors` estructurado (ej. fallo de red, 500 sin body), se muestra `error.message` en un banner rojo en la parte superior del formulario.

9. **RB-09 — Registro exitoso redirige a login**: Tras crear el usuario correctamente, se navega a `/login`. El usuario debe autenticarse manualmente — no hay login automático tras el registro.

10. **RB-10 — El rol por defecto es guest**: El modelo de User asigna `role: "guest"` por defecto. No hay forma de registrarse como admin desde esta página. El rol admin se asigna directamente en la base de datos.

---

## Componentes Utilizados

| Componente | Ruta | Responsabilidad |
|------------|------|-----------------|
| `Layout` | `components/layouts/Layout.jsx` | Envoltorio con header (logo), main con gradiente, y bottom navigation bar condicional por rol. Incluye banners PWA (install/update). |
| `UsersForm` | `components/users/users-form/UsersForm.jsx` | Formulario de registro con 5 campos, validación con `react-hook-form`, llamada a API, manejo de errores y redirección. |
| `LoginBanner` | `components/login-banner/LoginBanner.jsx` | Banner con texto "¿Ya te registraste?" y botón CTA que navega a `/login`. |
| `ButtonGreen` | `components/butons/ButtonGreen.jsx` | Botón verde con gradiente emerald. Usado para el submit "Registrarse". |

### Layout — Comportamiento relevante para Register
- El `Layout` renderiza bottom navigation con items condicionales según `role`.
- Como RegisterPage se monta dentro de `Layout` pero el usuario aún no está logueado, el role es `guest` por defecto, mostrando la navegación de visitante (Home, Servicios, Agenda guest, Perfil).

### LoginBanner
- Muestra un heading "¿Ya te registraste?" con una animación CSS que usa `translate-x-96` y `right-96` (se cancelan mutuamente — ver GOTCHA-03).
- Subtítulo: "Accede para agendar tu cita y conseguir descuentos."
- Botón `ButtonPrimary` que navega a `/login`.

---

## Llamadas a API

### POST `/users`

| Campo | Detalle |
|-------|---------|
| **Método** | `POST` |
| **Endpoint** | `/users` (base URL configurable via `REACT_APP_BASE_API_URL`) |
| **Body** | `{ name: string, surname: string, phone: number, email: string, password: string }` |
| **Headers** | Axios interceptor adjunta `Authorization: Bearer <token>` si existe en localStorage. Para registro, normalmente no hay token previo. |
| **Respuesta exitosa (201)** | Objeto usuario serializado (sin password, con `id` en lugar de `_id`). |
| **Respuesta error (4xx/5xx)** | Puede incluir `response.data.errors` como objeto con claves = nombres de campo y valores = mensajes de error. |

**Controller backend**: `api/controllers/users.controllers.js` → `module.exports.create`
- Llama `User.create(req.body)` directamente con el body recibido.
- Si la creación es exitosa → responde `201` con el usuario creado.
- Si falla (ej. email duplicado, validación de Mongoose) → pasa el error al middleware de error.

**Modelo backend** (`api/models/user.model.js`) — validaciones que el frontend NO replica:
- `email`: debe coincidir con `/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/` (más estricto que el frontend).
- `email`: `unique: true` — MongoDB rechaza duplicados con error de índice.
- `password`: máximo 16 caracteres (el frontend NO valida esto).
- `phone`: tipo `Number` en Mongoose (el frontend usa `type="number"` en el input).
- `role`: se asigna automáticamente como `"guest"`.

---

## Estado y Efectos Secundarios

### Estado local (UsersForm)
- `serverError`: `undefined` | `string` — mensaje de error genérico del servidor. Se limpia (`undefined`) en cada intento de submit.

### Estado del formulario (react-hook-form)
- `errors`: objeto con errores de validación por campo. Se popula tanto por validación frontend (onBlur) como por mapeo de errores del servidor (`setError()`).

### Efectos secundarios
1. **Navegación**: `navigate("/login")` tras registro exitoso.
2. **Sin escritura en localStorage**: A diferencia del login, el registro NO persiste nada en localStorage. El usuario creado existe en la base de datos pero la sesión no se inicia automáticamente.
3. **Sin invalidación de caché**: No se limpian cachés de turnos ni se modifica el AuthContext, ya que el usuario no se autentica tras el registro.

---

## Casos Edge y Gotchas

### GOTCHA-01 — El prefijo `+34` es decorativo, no funcional
El formulario muestra visualmente `+34` junto al campo de teléfono, pero este valor **NO se concatena** al número enviado al backend. El usuario debe escribir el número completo incluyendo el código de país si es necesario. Esto puede causar confusión — el usuario podría escribir solo 9 dígitos pensando que el `+34` ya está incluido.

### GOTCHA-02 — El campo `phone` es `type="number"` pero el backend espera `Number`
El input usa `type="number"` que permite valores decimales y notación científica (ej. `1e5`). El backend Mongoose lo convierte a `Number`, pero un teléfono como `612345678.0` sería técnicamente válido. No hay validación frontend que fuerce solo dígitos enteros.

### GOTCHA-03 — Máximo de password (16 chars) no se valida en frontend
El modelo Mongoose impone `maxLength: 16` para la contraseña, pero el formulario de registro solo valida `minLength: 4`. Si un usuario escribe una contraseña de 20 caracteres, la validación frontend pasa, pero el backend rechazará la creación con un error de validación de Mongoose.

### GOTCHA-04 — Email duplicado produce error genérico del servidor
Cuando MongoDB rechaza un email duplicado (violación de índice `unique`), el error que llega al frontend NO tiene la forma `{ errors: { email: "..." } }`. En su lugar, llega como un error genérico que se muestra en el banner rojo con `error.message`. **El usuario no ve el error asociado al campo email**, sino un mensaje técnico genérico.

### GOTCHA-05 — `for` attribute en labels (no `htmlFor`)
Los labels del formulario usan `for="name"`, `for="surname"`, etc. en lugar de `htmlFor`. En JSX, esto genera un warning de React y puede causar problemas de accesibilidad en algunos navegadores.

### GOTCHA-06 — Animación CSS del LoginBanner no funciona
El heading "¿Ya te registraste?" usa `translate-x-96` combinado con `relative right-96`, que se cancelan mutuamente. El elemento aparece en su posición normal sin animación visible. Parece un intento de animación de entrada que no se completó.

### GOTCHA-07 — No hay login automático tras registro
Tras crear la cuenta exitosamente, el usuario es redirigido a `/login` y debe volver a escribir sus credenciales. No hay flujo de auto-login post-registro. Esto es una decisión de diseño que añade fricción al onboarding.

### GOTCHA-08 — `console.debug` en producción
El `onUserSubmit` incluye `console.debug("Registering...")` que se ejecuta en cada intento de registro. Si no se filtra en el build de producción, esto expone información de debugging.

---

## Tests Derivados

### Tests de validación de formulario
| ID | Test | Input esperado | Resultado esperado |
|----|------|----------------|-------------------|
| T-01 | Nombre vacío al perder foco | Campo name: `""`, onBlur | Muestra "Es necesario un nombre" |
| T-02 | Nombre con 1 carácter | Campo name: `"A"`, onBlur | Muestra "Se necesitan al menos 2 caracteres" |
| T-03 | Nombre con 21 caracteres | Campo name: 21 chars, onBlur | Muestra "Máximo 20 caracteres" |
| T-04 | Apellido vacío al perder foco | Campo surname: `""`, onBlur | Muestra "Se necesita un apellido" |
| T-05 | Apellido con 1 carácter | Campo surname: `"A"`, onBlur | Muestra "Se necesitan al menos 2 caracteres" |
| T-06 | Teléfono vacío al perder foco | Campo phone: `""`, onBlur | Muestra "Se necesita un número de teléfono" |
| T-07 | Email vacío al perder foco | Campo email: `""`, onBlur | Muestra "Se necesita un email" |
| T-08 | Email sin formato válido | Campo email: `"sin-arroba"`, onBlur | Muestra "Es necesario un email valido" |
| T-09 | Contraseña vacía al perder foco | Campo password: `""`, onBlur | Muestra "Se necesita una contraseña" |
| T-10 | Contraseña con 3 caracteres | Campo password: `"abc"`, onBlur | Muestra "Largo minimo 4 caracteres" |

### Tests de registro exitoso
| ID | Test | Input esperado | Resultado esperado |
|----|------|----------------|-------------------|
| T-11 | Registro con datos válidos | Todos los campos válidos | POST `/users` → 201, navega a `/login` |
| T-12 | No se escribe en localStorage tras registro | Registro exitoso | `localStorage` no contiene `user-access-token` ni `current-user` |

### Tests de registro fallido — errores mapeados a campos
| ID | Test | Input esperado | Resultado esperado |
|----|------|----------------|-------------------|
| T-13 | Backend devuelve errors por campo | `{ errors: { email: "Email ya registrado" } }` | Muestra "Email ya registrado" bajo el campo email |
| T-14 | Backend devuelve múltiples errores | `{ errors: { name: "X", email: "Y" } }` | Muestra ambos errores en sus campos respectivos |

### Tests de registro fallido — errores genéricos
| ID | Test | Input esperado | Resultado esperado |
|----|------|----------------|-------------------|
| T-15 | Email duplicado (violación de índice) | Email ya existente en DB | Muestra banner rojo con `error.message` genérico |
| T-16 | Error de servidor (500) | Servidor caído o error interno | Muestra banner rojo con `error.message` genérico |
| T-17 | Error de red (sin conexión) | Sin conexión a internet | Muestra banner rojo con `error.message` genérico |

### Tests de navegación y UI
| ID | Test | Input esperado | Resultado esperado |
|----|------|----------------|-------------------|
| T-18 | Banner "Iniciar sesión" visible | Página /renderizada | Muestra LoginBanner con botón que navega a `/login` |
| T-19 | Bottom nav muestra items de guest | Página /register sin autenticar | Muestra Home, Servicios, Agenda (guest), Perfil |
| T-20 | Prefijo +34 visible junto al teléfono | Formulario renderizado | Muestra `+34` como elemento visual decorativo antes del input de teléfono |

---

## Historial de Cambios

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2026-05-28 | Spec inicial creada desde código existente | SDD |
