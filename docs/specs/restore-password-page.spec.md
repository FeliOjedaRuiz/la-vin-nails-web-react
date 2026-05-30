# Restore Password Page (Restaurar Contraseña)

## Metadata
- **Ruta en la app**: `/restore-password/:userId`
- **Componente principal**: `RestorePasswordPage.jsx`
- **Archivos relacionados**: `UsersRestorePassword.jsx`, `usersService.js`
- **Última actualización**: 2026-05-28
- **Roles que interactúan**: usuario (con link de restauración)

---

## Descripción General
Página donde el usuario ingresa su nueva contraseña después de hacer clic en el enlace de restauración recibido por email. El enlace contiene el `userId` como parámetro de ruta.

---

## Comportamiento por Rol

### 👤 Usuario (con link de restauración)
- Ve un formulario con un campo para la nueva contraseña
- Al enviar, la contraseña se actualiza para el usuario identificado por `userId` en la URL
- Tras éxito, es redirigido a `/login`
- Si hay errores de validación del servidor, se muestran inline en el campo correspondiente
- Si hay un error de servidor no específico, se muestra un banner rojo

### 🛡️ Administrador
- No interactúa directamente con esta página (es un flujo de auto-servicio)

### 👤 Visitante (sin link)
- No debería acceder a esta página sin un `userId` válido en la URL

---

## Reglas de Negocio

1. **RB-01 — Acceso por enlace**: La página requiere un `userId` válido en la URL (parámetro de ruta).
2. **RB-02 — Solo contraseña**: El formulario solo pide la nueva contraseña, no confirma repetición.
3. **RB-03 — Validación en servidor**: La validación de la contraseña (mínimo 4 chars, máximo 16) se hace en el backend.
4. **RB-04 — Redirección post-éxito**: Tras restaurar exitosamente, redirige a `/login`.
5. **RB-05 — Sin verificación de token**: No hay token de seguridad en la URL — solo el `userId`. Cualquiera con el enlace puede cambiar la contraseña.
6. **RB-06 — Privilege escalation posible**: El backend hace `Object.assign(req.user, req.body)` en el endpoint de restore, lo que permite enviar campos adicionales como `role`.

---

## Componentes Utilizados
| Componente | Responsabilidad en esta vista |
|------------|-------------------------------|
| `Layout` | Wrapper con navegación |
| `UsersRestorePassword` | Formulario de nueva contraseña con react-hook-form |
| `ButtonGreen` | Botón de envío estilizado |

---

## Llamadas a API
| Endpoint | Método | Cuándo se llama | Qué retorna |
|----------|--------|-----------------|-------------|
| `/users/restore-password/:userId` | PATCH | Al enviar el formulario | Usuario actualizado |

---

## Estado y Efectos Secundarios
- **`serverError`**: Mensaje de error genérico del servidor. Se muestra en banner rojo si no hay errores específicos de campo.
- **`errors` (react-hook-form)**: Errores de validación inline por campo.
- **`userId` (useParams)**: Extraído de la URL. Se pasa al servicio para identificar al usuario.
- **Efecto de navegación**: Tras éxito, `navigate("/login")` redirige al login.

---

## Casos Edge y Gotchas
- **Sin token de seguridad**: El enlace de restauración solo contiene `userId`. No hay token expirable ni de un solo uso. Cualquiera que conozca un userId puede cambiar la contraseña.
- **`for` en vez de `htmlFor`**: El label usa `for` en lugar de `htmlFor` (warning de React, accesibilidad comprometida).
- **Sin confirmación de contraseña**: Solo hay un campo de contraseña. No hay campo de "confirmar contraseña".
- **Validación solo en servidor**: El frontend no valida longitud mínima/máxima. El usuario puede enviar una contraseña de 20 caracteres y recibir error del backend.
- **Privilege escalation**: El backend copia todo el body al usuario. Enviar `{ password: "new", role: "admin" }` podría escalar privilegios.
- **`setServerError()` sin argumento**: En el try, `setServerError()` se llama sin argumentos, lo que setea `undefined`. Funciona pero es confuso — debería ser `setServerError(undefined)`.

---

## Tests Derivados (Checklist)

### Usuario con link
- [ ] Dado que tengo un link de restauración, cuando entro a la página, veo el formulario de nueva contraseña
- [ ] Dado que envío una contraseña válida, cuando el servidor responde 200, soy redirigido a /login
- [ ] Dado que envío una contraseña vacía, veo el error "Se necesita una contraseña"

### Reglas de negocio
- [ ] **RB-03**: Verificar que una contraseña de menos de 4 chars es rechazada por el servidor
- [ ] **RB-05**: Verificar que el enlace no contiene token de seguridad (solo userId)

### Casos edge
- [ ] **Sin token**: Verificar que cualquier userId válido permite cambiar la contraseña
- [ ] **Privilege escalation**: Verificar que el backend no permite cambiar el role

---

## Historial de Cambios Relevantes
| Fecha | Cambio | Razón |
|-------|--------|-------|
| 2026-05-28 | Spec inicial creada | Documentación del comportamiento existente |
