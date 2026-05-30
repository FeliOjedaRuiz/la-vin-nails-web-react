# Send Restore Email Page (Solicitar Restauración de Contraseña)

## Metadata
- **Ruta en la app**: `/send-restore-email`
- **Componente principal**: `SendRestoreEmailPage.jsx`
- **Archivos relacionados**: `UsersSendRestoreEmail.jsx`, `usersService.js`, `Modal.jsx`
- **Última actualización**: 2026-05-28
- **Roles que interactúan**: visitante

---

## Descripción General
Página donde el usuario ingresa su email para solicitar un enlace de restauración de contraseña. Tras el envío exitoso, muestra un modal confirmando que el email fue enviado con instrucciones.

---

## Comportamiento por Rol

### 👤 Visitante
- Ve un formulario con un campo de email
- Al enviar, se dispara el email de restauración al servidor
- Tras éxito, se muestra un modal con mensaje de confirmación
- Si el email no existe o hay error, se muestran errores inline o un banner rojo

### 🔑 Usuario autenticado
- Mismo comportamiento que visitante (no requiere autenticación)

### 🛡️ Administrador
- No interactúa directamente con esta página

---

## Reglas de Negocio

1. **RB-01 — Acceso público**: Cualquiera puede solicitar restauración de contraseña, no requiere sesión.
2. **RB-02 — Email requerido**: El campo email es obligatorio.
3. **RB-03 — Sin feedback de existencia**: Si el email no existe en la base de datos, el backend debería responder igual (para no revelar qué emails están registrados). *Verificar en el controller.*
4. **RB-04 — Modal de confirmación**: Tras éxito, se muestra un modal indicando que se envió el email.
5. **RB-05 — Fire-and-forget**: El backend envía el email de forma asíncrona. El cliente recibe 200 incluso si el email falla en el servidor.

---

## Componentes Utilizados
| Componente | Responsabilidad en esta vista |
|------------|-------------------------------|
| `Layout` | Wrapper con navegación |
| `UsersSendRestoreEmail` | Formulario de email + modal de confirmación |
| `Modal` | Modal que muestra confirmación de envío |
| `ButtonGreen` | Botón de envío estilizado |

---

## Llamadas a API
| Endpoint | Método | Cuándo se llama | Qué retorna |
|----------|--------|-----------------|-------------|
| `/users/send-restore-email` | POST | Al enviar el formulario | Confirmación de envío |

---

## Estado y Efectos Secundarios
- **`serverError`**: Mensaje de error genérico del servidor. Se muestra en banner rojo.
- **`errors` (react-hook-form)**: Errores de validación inline por campo.
- **`modalState`**: Controla la visibilidad del modal de confirmación. Se activa tras éxito.
- **Efecto secundario**: El servidor envía un email con enlace de restauración. El cliente no espera respuesta del email — solo confirma que la solicitud fue recibida.

---

## Casos Edge y Gotchas
- **Fire-and-forget en backend**: El controller no espera la promise del mailer. Si el envío de email falla, el cliente recibe 200 de todos modos y muestra el modal de éxito.
- **Modal no se cierra automáticamente**: El usuario debe hacer clic en "Ok" para cerrar el modal. No hay auto-close.
- **Sin rate limiting**: No hay protección contra múltiples envíos consecutivos al mismo email.
- **`for` en vez de `htmlFor`**: El label usa `for` en lugar de `htmlFor` (warning de React).
- **Error genérico**: Si el servidor devuelve un error sin `errors` específicos, se muestra `error.message` en el banner rojo.
- **Sin validación de formato en frontend**: react-hook-form solo valida que el campo no esté vacío. La validación de formato de email la hace el backend.

---

## Tests Derivados (Checklist)

### Visitante
- [ ] Dado que ingreso un email válido, cuando envío el formulario, veo el modal de confirmación
- [ ] Dado que dejo el email vacío, cuando intento enviar, veo "Se necesita un email"
- [ ] Dado que el servidor devuelve error, veo el banner rojo con el mensaje de error

### Reglas de negocio
- [ ] **RB-01**: Verificar que no se requiere autenticación para acceder
- [ ] **RB-04**: Verificar que el modal se muestra tras éxito
- [ ] **RB-05**: Verificar que el cliente recibe 200 incluso si el email falla en el servidor

### Casos edge
- [ ] **Fire-and-forget**: Verificar que el modal se muestra aunque el email no se envíe realmente
- [ ] **Rate limiting**: Verificar que se pueden hacer múltiples envíos consecutivos

---

## Historial de Cambios Relevantes
| Fecha | Cambio | Razón |
|-------|--------|-------|
| 2026-05-28 | Spec inicial creada | Documentación del comportamiento existente |
