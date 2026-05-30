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

## Reglas de negocio

1. **Solo usuarios autenticados** pueden obtener la clave pública y suscribirse a notificaciones push. No hay acceso anónimo.
2. **Una suscripción por endpoint**: el campo `endpoint` tiene índice único en MongoDB. Si el mismo navegador intenta suscribirse dos veces, se actualiza la existente (upsert) en lugar de crear duplicados.
3. **La suscripción se vincula al usuario** mediante `req.user.id`, que inyecta el middleware `secure.auth`. No se puede suscribir a otro usuario.
4. **La clave pública VAPID** se lee directamente de `VAPID_PUBLIC_KEY` en el entorno. Si no está configurada, el servidor falla con 500 — no hay fallback.
5. **El trim de la clave pública** es una defensa contra errores de configuración con espacios accidentales, que romperían la verificación criptográfica del lado del cliente (especialmente en Safari/iOS).
6. **No hay endpoint de unsubscribe**: una vez suscrito, no hay forma de cancelar la suscripción a través de este controller. La limpieza de suscripciones obsoletas debe hacerse manualmente o por otro mecanismo.

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
