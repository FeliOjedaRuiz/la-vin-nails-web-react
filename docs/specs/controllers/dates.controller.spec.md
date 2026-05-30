# Controller: Dates

Gestiona las "Dates" (reservas/solicitudes de servicio) del sistema. Una Date representa la petición concreta de un usuario asociada a un turno y un servicio.

## Endpoints

### POST /dates
- **Middleware**: `secure.auth`
- **Body esperado**: objeto con campos del modelo Date (`service`, `type`, `turn`, `desiredDesign`, `designDetails`, `needRemove`, etc.). `service` y `type` son obligatorios según el modelo.
- **Lógica**:
  1. Crea una Date directamente con `req.body` (sin sanitización de campos protegidos como `_id`, `createdAt`, etc.)
  2. Responde 201 con la Date creada
  3. En segundo plano (fire-and-forget): hace populate de `turn`, `user` y `service`, envía email de creación al cliente y notificación push a todos los administradores
- **Respuesta exitosa**: `201` — documento Date creado (sin populate)
- **Errores posibles**:
  - `401` — token ausente o inválido (middleware `secure.auth`)
  - `5xx` — error de validación del modelo (campos requeridos, maxLength) o error de MongoDB

### GET /dates
- **Middleware**: `secure.isAdmin`
- **Query esperado**: `?turn=<turnId>` (opcional)
- **Lógica**:
  1. Si se pasa `turn` en query, filtra por ese turn; si no, devuelve todas
  2. Hace populate de `turn`, `user` y `service`
  3. Devuelve el array de dates
- **Respuesta exitosa**: `200` — array de Date[] con populate
- **Errores posibles**:
  - `401` — token ausente, inválido o usuario no admin

### GET /dates/:userId
- **Middleware**: `secure.isAdmin`
- **Params esperado**: `userId` — ObjectId del usuario
- **Lógica**:
  1. Busca todas las dates donde `user === userId`
  2. Hace populate de `turn`, `user` y `service`
  3. Devuelve el array
- **Respuesta exitosa**: `200` — array de Date[] del usuario especificado
- **Errores posibles**:
  - `401` — token ausente, inválido o usuario no admin

### GET /dates/selectedDate/:selectedDate
- **Middleware**: `secure.isAdmin`
- **Params esperado**: `selectedDate` — string en formato `YYYY-MM-DD`
- **Lógica**:
  1. Carga TODAS las dates de la base de datos con populate de `turn` y `user`
  2. Filtra en memoria comparando `date.turn.date === selectedDate`
  3. Devuelve solo las dates que coinciden con esa fecha exacta
- **Respuesta exitosa**: `200` — array de Date[] filtradas por fecha
- **Errores posibles**:
  - `401` — token ausente, inválido o usuario no admin

### GET /dates/selectedMonth/:selectedMonth
- **Middleware**: `secure.isAdmin`
- **Params esperado**: `selectedMonth` — string en formato `YYYY-MM`
- **Lógica**:
  1. Carga TODAS las dates de la base de datos con populate de `turn`
  2. Parsea `selectedMonth` en `[year, month]`
  3. Filtra en memoria comparando año y mes de `date.turn.date`
  4. Devuelve solo las dates del mes especificado
- **Respuesta exitosa**: `200` — array de Date[] filtradas por mes
- **Errores posibles**:
  - `401` — token ausente, inválido o usuario no admin

### GET /myDates
- **Middleware**: `secure.auth`
- **Body/Query**: ninguno
- **Lógica**:
  1. Usa `req.user.id` (inyectado por `secure.auth`) como criterio
  2. Busca dates donde `user === req.user.id`
  3. Hace populate de `turn`, `user` y `service`
  4. Devuelve el array
- **Respuesta exitosa**: `200` — array de Date[] del usuario autenticado
- **Errores posibles**:
  - `401` — token ausente o inválido

### PATCH /dates/:id
- **Middleware**: `secure.isAdmin`, `datesMid.exists`
- **Params esperado**: `id` — ObjectId de la date
- **Body esperado**: campos a actualizar del modelo Date
- **Lógica**:
  1. `datesMid.exists` carga la date y la adjunta en `req.date` (404 si no existe)
  2. Hace `Object.assign(req.date, req.body)` — mergea TODOS los campos del body sobre el documento
  3. Guarda el documento modificado
  4. Devuelve la date actualizada
- **Respuesta exitosa**: `200` — documento Date actualizado
- **Errores posibles**:
  - `401` — token ausente, inválido o usuario no admin
  - `404` — date no encontrada (middleware `datesMid.exists`)
  - `5xx` — error de validación del modelo o MongoDB

### DELETE /dates/:id
- **Middleware**: `secure.auth`, `datesMid.exists`, `datesMid.checkOwner`
- **Params esperado**: `id` — ObjectId de la date
- **Lógica**:
  1. `datesMid.exists` carga la date en `req.date` (404 si no existe)
  2. `datesMid.checkOwner` verifica que el usuario sea admin O que sea el owner de la date (403 si no)
  3. Hace populate de `turn`, `user` y `service` para obtener datos completos
  4. Elimina la date con `deleteOne`
  5. Responde 204 (sin contenido)
  6. En segundo plano (fire-and-forget): envía email de eliminación al cliente
- **Respuesta exitosa**: `204` — sin cuerpo
- **Errores posibles**:
  - `401` — token ausente o inválido
  - `403` — usuario no es admin ni owner de la date (`datesMid.checkOwner`)
  - `404` — date no encontrada (`datesMid.exists`)

## Reglas de negocio

1. **Creación con notificaciones asíncronas**: al crear una date, el email y push notification se envían después de responder al cliente. Si fallan, el error se pierde silenciosamente (no se propaga al cliente).
2. **Eliminación con notificación asíncrona**: el email de eliminación se dispara después del `204`. Mismo patrón fire-and-forget: si falla, no hay feedback.
3. **Solo admins listan globalmente**: los endpoints de listado general, por usuario, por fecha y por mes requieren rol admin.
4. **Usuarios ven solo sus dates**: `GET /myDates` devuelve exclusivamente las dates del usuario autenticado.
5. **Eliminación restringida al owner o admin**: un usuario normal solo puede eliminar sus propias dates. Un admin puede eliminar cualquiera.
6. **Actualización solo por admin**: `PATCH /dates/:id` está restringido a administradores. No hay verificación de owner porque solo admins pueden acceder.
7. **Estado por defecto**: toda date nueva se crea con `state: "Solicitada"` y `paymentMethod: "Sin cobrar"` (definido en el modelo).
8. **Sin sanitización de body en create/update**: no hay middleware `cleanBody` en las rutas de dates. Campos como `_id`, `createdAt`, `updatedAt` podrían ser inyectados desde el body (aunque MongoDB ignora `_id` en create si ya existe).

## Tests derivados

- [ ] POST /dates crea una date con body válido y devuelve 201
- [ ] POST /dates rechaza body sin `service` o `type` (validación del modelo)
- [ ] POST /dates rechaza `designDetails` mayor a 300 caracteres
- [ ] POST /dates sin token devuelve 401
- [ ] GET /dates devuelve todas las dates con populate (solo admin)
- [ ] GET /dates?turn=X filtra por turn específico
- [ ] GET /dates sin token devuelve 401
- [ ] GET /dates sin rol admin devuelve 401
- [ ] GET /dates/:userId devuelve dates de un usuario específico (solo admin)
- [ ] GET /dates/selectedDate/:date filtra por fecha exacta comparando string
- [ ] GET /dates/selectedMonth/:month filtra por año y mes (formato YYYY-MM)
- [ ] GET /myDates devuelve solo las dates del usuario autenticado
- [ ] GET /myDates sin token devuelve 401
- [ ] PATCH /dates/:id actualiza campos y devuelve date modificada (solo admin)
- [ ] PATCH /dates/:id con id inexistente devuelve 404
- [ ] PATCH /dates/:id sin rol admin devuelve 401
- [ ] DELETE /dates/:id elimina la date y devuelve 204 (owner)
- [ ] DELETE /dates/:id elimina la date y devuelve 204 (admin)
- [ ] DELETE /dates/:id de otro usuario devuelve 403
- [ ] DELETE /dates/:id con id inexistente devuelve 404
- [ ] DELETE /dates/:id sin token devuelve 401
- [ ] Verificar que el email de creación se envía tras POST (mock mailer)
- [ ] Verificar que el push notification se envía a admins tras POST (mock pushService)
- [ ] Verificar que el email de eliminación se envía tras DELETE (mock mailer)
