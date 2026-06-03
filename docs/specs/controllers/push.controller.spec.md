# Controller: Push Notifications

## Endpoints

### GET /push/public-key
- **Middleware**: `secure.auth` — requiere token JWT válido. El usuario debe existir en la base de datos.
- **Body/Query esperado**: ninguno.
- **Lógica**:
  1. Verifica que la variable de entorno `VAPID_PUBLIC_KEY` esté definida.
  2. Si no está configurada, delega un error 500 al manejador global.
  3. Si existe, recorta espacios en blanco (trim) y devuelve la clave pública como JSON.
- **Respuesta exitosa**: `200 OK` — `{ publicKey: string }`
- **Errores posibles**:
  - `401 Unauthorized` — token ausente, inválido o usuario no encontrado (viene del middleware `secure.auth`).
  - `500 Internal Server Error` — `VAPID_PUBLIC_KEY` no está definida en el entorno.

### POST /push/subscribe
- **Middleware**: `secure.auth` — requiere token JWT válido. El usuario debe existir en la base de datos.
- **Body esperado**:
  - `endpoint` (string) — URL del servicio de push del navegador (obligatorio).
  - `keys` (object) — objeto con las claves criptográficas del navegador:
    - `keys.p256dh` (string, obligatorio)
    - `keys.auth` (string, obligatorio)
- **Lógica**:
  1. Extrae `endpoint` y `keys` del body.
  2. Valida que ambos campos estén presentes; si falta alguno, delega error 400.
  3. Construye un objeto con `user` (tomado de `req.user.id` por el middleware), `endpoint` y `keys`.
  4. Ejecuta `PushSubscription.findOneAndUpdate` con `upsert: true` buscando por `endpoint`:
     - Si ya existe una suscripción con ese endpoint, la actualiza con los nuevos datos.
     - Si no existe, crea un nuevo documento.
  5. Si MongoDB rechaza la operación por índice duplicado (código 11000), delega error 409.
  6. Cualquier otro error de base de datos se delega al manejador global.
- **Respuesta exitosa**: `201 Created` — el documento de suscripción completo (transformado por el modelo: `id` en lugar de `_id`, sin `__v`).
- **Errores posibles**:
  - `401 Unauthorized` — token ausente, inválido o usuario no encontrado (viene del middleware `secure.auth`).
  - `400 Bad Request` — `endpoint` o `keys` faltan en el body.
  - `409 Conflict` — el índice único de `endpoint` en MongoDB detecta un duplicado (race condition entre upsert concurrentes).
  - `500 Internal Server Error` — cualquier otro error no manejado de MongoDB.

### DELETE /push/unsubscribe
- **Middleware**: `secure.isAdmin` — requiere token JWT válido y rol de administrador.
- **Body esperado**:
  - `endpoint` (string) — URL del servicio de push del navegador a desuscribir (obligatorio).
- **Lógica**:
  1. Extrae `endpoint` del body.
  2. Valida que el `endpoint` esté presente; si falta, delega error 400.
  3. Ejecuta `PushSubscription.findOneAndDelete` buscando por `endpoint` y `user` (tomado de `req.user.id`).
  4. Si no se encuentra el documento, devuelve error 404.
- **Respuesta exitosa**: `204 No Content` — la suscripción fue eliminada.
- **Errores posibles**:
  - `401 Unauthorized` — token ausente, inválido o usuario no encontrado.
  - `403 Forbidden` — el usuario no es administrador.
  - `400 Bad Request` — `endpoint` falta en el body.
  - `404 Not Found` — la suscripción no existe o no pertenece al usuario logueado.
  - `500 Internal Server Error` — cualquier otro error de MongoDB.

### POST /push/test
- **Middleware**: `secure.isAdmin` — requiere token JWT válido y rol de administrador.
- **Body/Query esperado**: ninguno.
- **Lógica**:
  1. Busca la última reserva real en la colección `Date` (`findOne().sort({ createdAt: -1 }).populate('user service turn')`).
  2. Si no hay ninguna reserva en la base de datos, delega error 404.
  3. Busca todas las suscripciones push del usuario logueado (`req.user.id`).
  4. Si no tiene suscripciones, delega error 404.
  5. Construye un payload push con la estructura de notificación para turnos, usando los datos de la reserva encontrada (título, cuerpo con la fecha/hora e icon badge).
  6. Envía la notificación usando `webpush.sendNotification` a todas las suscripciones del admin logueado.
- **Respuesta exitosa**: `200 OK` — `{ message: 'Notificación de prueba enviada exitosamente', result: ... }`
- **Errores posibles**:
  - `401 Unauthorized` / `403 Forbidden` — fallos de autenticación o permisos (no es admin).
  - `404 Not Found` — no hay reservas en la BD, o el usuario no tiene suscripciones push activas.
  - `500 Internal Server Error` — error al enviar la notificación mediante web-push o problemas de BD.

## Reglas de negocio

1. **Solo usuarios autenticados** pueden obtener la clave pública y suscribirse a notificaciones push. No hay acceso anónimo.
2. **Una suscripción por endpoint**: el campo `endpoint` tiene índice único en MongoDB. Si el mismo navegador intenta suscribirse dos veces, se actualiza la existente (upsert) en lugar de crear duplicados.
3. **La suscripción se vincula al usuario** mediante `req.user.id`, que inyecta el middleware `secure.auth`. No se puede suscribir a otro usuario.
4. **La clave pública VAPID** se lee directamente de `VAPID_PUBLIC_KEY` en el entorno. Si no está configurada, el servidor falla con 500 — no hay fallback.
5. **El trim de la clave pública** es una defensa contra errores de configuración con espacios accidentales, que romperían la verificación criptográfica del lado del cliente (especialmente en Safari/iOS).
6. **Manejo de desuscripciones**: Se puede cancelar la suscripción de un navegador enviando su `endpoint` a `DELETE /push/unsubscribe`. Esto elimina físicamente el registro de la BD.
7. **Notificación de prueba**: El administrador puede enviar una notificación simulada a sus propios dispositivos suscritos para verificar el funcionamiento del sistema (`POST /push/test`). Esta notificación usa datos reales de la última reserva en la BD para probar también el deep linking.

## Tests derivados

- [ ] GET /push/public-key devuelve 200 con `{ publicKey }` cuando `VAPID_PUBLIC_KEY` está definida
- [ ] GET /push/public-key devuelve 500 cuando `VAPID_PUBLIC_KEY` no está definida
- [ ] GET /push/public-key devuelve 401 sin token JWT
- [ ] GET /push/public-key devuelve 401 con token inválido
- [ ] GET /push/public-key devuelve 401 con token de usuario que no existe en la BD
- [ ] GET /push/public-key hace trim de espacios en la clave pública
- [ ] POST /push/subscribe devuelve 201 con la suscripción creada cuando el body es válido
- [ ] POST /push/subscribe devuelve 201 con la suscripción actualizada cuando el endpoint ya existe (upsert)
- [ ] POST /push/subscribe devuelve 400 cuando falta `endpoint` en el body
- [ ] POST /push/subscribe devuelve 400 cuando falta `keys` en el body
- [ ] POST /push/subscribe devuelve 401 sin token JWT
- [ ] POST /push/subscribe vincula la suscripción al `req.user.id` del token, no a un valor del body
- [ ] POST /push/subscribe devuelve 409 cuando hay un conflicto de índice único (código 11000 de MongoDB)
- [ ] POST /push/subscribe propaga errores no esperados de MongoDB al manejador global
- [ ] DELETE /push/unsubscribe devuelve 204 cuando se elimina la suscripción correctamente
- [ ] DELETE /push/unsubscribe devuelve 400 cuando falta `endpoint` en el body
- [ ] DELETE /push/unsubscribe devuelve 404 cuando la suscripción no existe o no pertenece al usuario
- [ ] DELETE /push/unsubscribe devuelve 403 si el usuario no es admin
- [ ] POST /push/test devuelve 200 y envía notificación cuando el admin tiene suscripciones y hay reservas
- [ ] POST /push/test devuelve 404 si no hay reservas en la BD
- [ ] POST /push/test devuelve 404 si el admin no tiene suscripciones push activas
- [ ] POST /push/test devuelve 403 si el usuario no es admin
