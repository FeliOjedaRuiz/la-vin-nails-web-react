# Controller: Turns

## Endpoints

### POST /turns
- **Middleware**: `secure.isAdmin`
- **Body esperado**: objeto con `date` (string), `hour` (string), `state` (string, opcional — enum: "Disponible", "Solicitado", "Confirmado", "Cancelado", "Reservado", default "Disponible")
- **Lógica**:
  1. Verifica que el usuario sea administrador (401 si no)
  2. Crea un documento Turn directamente con `req.body` via `Turn.create()`
  3. Mongoose aplica validación del schema (date y hour son requeridos)
- **Respuesta exitosa**: `201` — documento Turn creado (con `id`, `date`, `hour`, `state`, `createdAt`, `updatedAt`)
- **Errores posibles**:
  - `401` — token ausente, inválido, o usuario no es admin
  - `400` / `500` — errores de validación de Mongoose o de base de datos (pasados a `next`)

### GET /turns/date/:date
- **Middleware**: `secure.optionalAuth`
- **Query/Params esperado**:
  - `:date` (path param) — fecha inicio en formato `YYYY-MM-DD`
  - `?endDate=` (query param, opcional) — fecha fin en formato `YYYY-MM-DD`
- **Lógica**:
  1. Autenticación opcional: si hay token válido, pobla `req.user`; si no, continúa como guest
  2. **Visibilidad según rol**:
     - **No-admin**: se aplica un **piso** (no puede ver semanas pasadas — el startDate se fuerza al domingo de la semana actual en UTC) y un **techo** (no puede ver más allá del último día del mes siguiente, calculado en timezone Europe/Madrid via `Intl.DateTimeFormat`)
     - **Admin**: usa el `:date` y `endDate` tal cual, sin restricciones
  3. Construye un filtro MongoDB: `{ date: { $gt: startDate } }`, añadiendo `$lte: endDate` si existe
  4. Ejecuta `Turn.find()` con `.lean()`
  5. Para cada turno encontrado, busca las Dates asociadas (`DateModel.find({ turn: { $in: turnIds } })`) y las popula con `user` y `service`
  6. Mapea manualmente las Dates populadas a cada turno bajo la propiedad `dateData` (null si no hay fecha asociada), añadiendo `id` manualmente porque `.lean()` omite virtuals
- **Respuesta exitosa**: `200` — array de objetos turno, cada uno con `id`, `date`, `hour`, `state`, `dateData` (objeto Date populado o null)
- **Errores posibles**:
  - `500` — errores de base de datos (pasados a `next`)

### GET /turns/:id
- **Middleware**: ninguno (público)
- **Params esperado**: `:id` — ObjectId del turno
- **Lógica**:
  1. Busca el turno por ID con `Turn.findById()`
  2. Si existe, lo devuelve tal cual (con virtual `id` gracias al transform del schema)
  3. Si no existe, devuelve `null` (sin error 404)
- **Respuesta exitosa**: `200` — documento Turn o `null`
- **Errores posibles**:
  - `500` — errores de base de datos (pasados a `next`)

### PATCH /turns/:id
- **Middleware**: `secure.auth`, `turnsMid.exists`
- **Params esperado**: `:id` — ObjectId del turno
- **Body esperado**: campos del turno a actualizar (`date`, `hour`, `state`)
- **Lógica**:
  1. Verifica autenticación (401 si no hay token válido)
  2. Verifica que el turno existe (404 si no, via `turnsMid.exists`)
  3. Mezcla `req.body` sobre `req.turn` con `Object.assign()`
  4. Guarda el documento modificado con `.save()`
- **Respuesta exitosa**: `200` — documento Turn actualizado
- **Errores posibles**:
  - `401` — token ausente o inválido
  - `404` — turno no encontrado
  - `400` / `500` — errores de validación o base de datos (pasados a `next`)

### DELETE /turns/:id
- **Middleware**: `secure.isAdmin`, `turnsMid.exists`, `turnsMid.isFree`
- **Params esperado**: `:id` — ObjectId del turno
- **Lógica**:
  1. Verifica que el usuario sea administrador (401 si no)
  2. Verifica que el turno existe (404 si no, via `turnsMid.exists`)
  3. Verifica que el turno esté libre — no tiene Dates asociadas (400 si tiene, via `turnsMid.isFree`)
  4. Elimina el turno con `Turn.deleteOne()`
- **Respuesta exitosa**: `204` — sin cuerpo
- **Errores posibles**:
  - `401` — token ausente, inválido, o usuario no es admin
  - `404` — turno no encontrado
  - `400` — el turno tiene Dates asociadas ("One Date is in this turn")
  - `500` — errores de base de datos (pasados a `next`)

## Reglas de negocio

1. **Solo admins pueden crear turnos** — la creación es una operación administrativa.
2. **Solo admins pueden eliminar turnos** — y únicamente si no tienen reservas (Dates) asociadas.
3. **Visibilidad temporal escalonada** — los no-admins no pueden ver turnos de semanas pasadas (piso: domingo de la semana actual en UTC) ni más allá del mes siguiente (techo: último día del mes siguiente en hora España). Los admins ven todo el rango.
4. **El detalle de turno es público** — cualquier persona puede consultar un turno por ID sin autenticación.
5. **Cualquier usuario autenticado puede actualizar un turno** — no se requiere rol admin para PATCH, solo autenticación + existencia del turno.
6. **Los turnos se eliminan solo si están libres** — no se permite borrar un turno que tenga Dates (reservas) vinculadas; hay que eliminar las Dates primero.
7. **El piso de visibilidad usa UTC, el techo usa Europe/Madrid** — hay una asimetría intencional: el inicio de semana se calcula en UTC mientras que el límite mensual se calcula en hora española.

## Tests derivados
- [ ] POST /turns — 201 con body válido siendo admin
- [ ] POST /turns — 401 sin token
- [ ] POST /turns — 401 con token de usuario no-admin
- [ ] POST /turns — 400 si falta `date` o `hour` en el body
- [ ] GET /turns/date/:date — admin ve todo el rango solicitado
- [ ] GET /turns/date/:date — no-admin no ve semanas pasadas (piso aplicado)
- [ ] GET /turns/date/:date — no-admin no ve más allá del mes siguiente (techo aplicado)
- [ ] GET /turns/date/:date — guest (sin token) recibe turnos con restricciones
- [ ] GET /turns/date/:date — cada turno incluye `dateData` populado con user y service
- [ ] GET /turns/date/:date — turno sin fecha asociada tiene `dateData: null`
- [ ] GET /turns/:id — 200 con turno existente
- [ ] GET /turns/:id — 200 con `null` si el ID no existe (sin 404)
- [ ] PATCH /turns/:id — 200 actualizando campos válidos
- [ ] PATCH /turns/:id — 401 sin token
- [ ] PATCH /turns/:id — 404 si el turno no existe
- [ ] DELETE /turns/:id — 204 eliminando turno libre siendo admin
- [ ] DELETE /turns/:id — 401 sin token
- [ ] DELETE /turns/:id — 401 con token de usuario no-admin
- [ ] DELETE /turns/:id — 404 si el turno no existe
- [ ] DELETE /turns/:id — 400 si el turno tiene Dates asociadas
- [ ] Regla de negocio — piso calculado como domingo de semana actual en UTC
- [ ] Regla de negocio — techo calculado como último día del mes siguiente en Europe/Madrid
- [ ] Regla de negocio — `.lean()` omite virtuals, por eso `id` se mapea manualmente en `list`
