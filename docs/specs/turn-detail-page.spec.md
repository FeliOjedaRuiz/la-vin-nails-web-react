# Detalle y Actualización de Turno

## Metadata
- **Ruta en la app**: `/admin-schedule/:id` (o similar, envuelto por `TurnDetailPage.jsx`)
- **Componente principal**: `TurnDetailAndUpdate.jsx`
- **Archivos relacionados**: `TurnDetailPage.jsx`, `Modal.jsx`, `UserProfile.jsx`, `turnsService.js`, `datesService.js`, `AuthStore.jsx`
- **Última actualización**: 2026-05-04
- **Roles que interactúan**: admin

---

## Descripción General
Vista dedicada al administrador para ver, editar y gestionar los detalles profundos de un turno y la cita (reserva) vinculada a él. Permite cambiar estados, ajustar la facturación, cancelar citas, o enviar mensajes automatizados por WhatsApp al cliente.

---

## Comportamiento por Rol

### 🛡️ Administrador
- Si el turno no tiene cliente (es solo un bloque libre), puede modificar su fecha, hora y estado, o eliminar el bloque por completo.
- Si el turno tiene una cita vinculada, no puede borrar el bloque directamente. En su lugar, se exponen datos del cliente, servicio, tipo de esmaltado y detalles de remoción.
- Puede actualizar el **costo** y la **duración** final de la cita (ideal post-servicio).
- Puede **cancelar** la cita vinculada (separada del turno en sí).
- Puede enviar una confirmación automatizada por **WhatsApp** que inyecta en la URL los detalles actualizados del turno y el costo.

---

## Reglas de Negocio

1. **Gestión Asíncrona de Guardado (Race Conditions)**: Cuando el administrador pulsa "Guardar", se realiza la actualización de datos secuencialmente mediante `await` (turno, luego cita). Solo tras confirmar ambas operaciones exitosamente en BD, se limpia la caché global y se redirige a la agenda.
2. **Invalidación Dura de Cachés**: Independientemente de si se guarda, se cancela la cita o se borra el turno, se invalidan completamente las cachés de turnos locales del módulo (`clearAdminTurnsCache`, `clearGuestTurnsCache`). Esto previene que el administrador o el cliente vean datos viejos en el calendario tras una modificación.
3. **Restricción de Borrado**: El botón de eliminación total del turno solo aparece cuando el turno **no está reservado** (es decir, no tiene objeto `date` asociado).
4. **Comportamiento de Cancelación de Cita**: Si se borra la cita vinculada mediante "Cancelar Cita", no se elimina el turno de la agenda. Se elimina la cita en backend, y el turno padre se actualiza automáticamente forzando su estado a "Cancelado".
5. **Comunicación Contextual**: El link de WhatsApp se recalcula dinámicamente cada vez que se modifican los campos de hora o detalles en el front-end para que el mensaje enviado siempre represente el estado que el admin está viendo en pantalla.

---

## Componentes Utilizados

| Componente | Responsabilidad en esta vista |
|------------|-------------------------------|
| `TurnDetailPage.jsx` | Wrapper y layout que centra y encierra el formulario. |
| `TurnDetailAndUpdate.jsx` | Controla toda la lógica del formulario, llamadas API, modales y vinculaciones de datos. |
| `Modal.jsx` | Diálogos modales reutilizables para confirmación de acciones destructivas (eliminar/cancelar). |
| `UserProfile.jsx` | Presentación minificada de la información personal del usuario que solicitó el turno. |

---

## Llamadas a API

| Endpoint | Método | Cuándo se llama | Qué retorna |
|----------|--------|-----------------|-------------|
| `turnsService.detail(id)` | GET | Al entrar en la página | Toda la información del turno, incluyendo su cita si aplica. |
| `turnsService.update(id, obj)` | PUT/PATCH | Al guardar (Submit) o cancelar cita | El turno modificado. |
| `datesService.update(id, obj)` | PUT/PATCH | Al guardar (Submit), si existe una cita | La cita con costo y duración actualizados. |
| `turnsService.deleteTurn(id)` | DELETE | Al confirmar borrar turno (sin cita) | - |
| `datesService.deleteDate(id)` | DELETE | Al confirmar cancelar la cita | - |

---

## Estado y Efectos Secundarios

- **`turn` / `date`**: Almacenan el objeto y las modificaciones de los inputs. La inicialización de `date` provino históricamente del contexto `AuthContext` (estado de navegación en memoria).
- **`turnStates`**: Mantiene un arreglo dinámico para reordenar las opciones del selector de estado en HTML asegurándose de que el estado actual siempre sea el primero en la lista.
- **`turnDateWhatsapp`**: Estado derivado recalculado para tener el texto legible de la fecha listo para inyectarse en la string de WhatsApp.
- **Efecto de limpieza al desmontar**: En vez de esperar, apenas inicia el componente se "consume" el dato de `date` del contexto (vía `deleteDate()`) para no arrastrarlo por error a futuras visitas de otras rutas.

---

## Casos Edge y Gotchas

- **Inputs Incontrolados**: En React, asignar `value={date.cost}` cuando al inicializar el dato era `undefined` provoca un warning de React (incontrolled to controlled). Esto es un *code smell* que se mantiene pero no frena la funcionalidad actual.
- **Bug histórico arreglado: Cita a Cancelado**: Previamente el código intentaba setear `date.turn.state = 'Cancelado'`. Como el backend serializa `turn` en la `date` solo como un ID primitivo de string, esto fallaba silenciosamente y la UI se corrompía. Ahora usa la llamada separada `turnsService.update(id, { state: 'Cancelado' })`.
- **Relaciones de Objetos en Edición**: Al hacer update de `date`, se aplanan los campos re-asignando IDs (ej: `date.user = date.user.id`). Esto se hace para ajustarse a las expectativas planas que espera la API para las referencias de Mongoose.

---

## Tests Derivados (Checklist)

### Administrador
- [x] Verificar que al guardar, el sistema espera las respuestas del servidor antes de navegar de vuelta a la agenda.
- [ ] Verificar que el enlace de WhatsApp reacciona a los inputs del coste y duración antes de presionar el botón de Guardar.
- [ ] Verificar que si un turno tiene un usuario asignado, los campos de coste y duración aparecen pero el botón de Eliminar Turno desaparece.

### Reglas de negocio
- [ ] **Limpieza de caché post-modificación**: Validar que tras cualquier acción exitosa (submit, borrado de cita, borrado de turno) se invoca correctamente `clearAdminTurnsCache()`.
- [ ] **Actualización plana de IDs**: Confirmar que en `onDateSubmit()`, antes de mandar los datos, los objetos anidados como `user`, `service` y `turn` son convertidos a sus respectivos `id`.
