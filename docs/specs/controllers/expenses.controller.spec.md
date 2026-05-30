# Controller: Expenses

## Endpoints

### POST /expenses
- **Middleware**: `secure.isAdmin`
- **Body esperado**: objeto con campos del modelo Expense
  - `description` (string, opcional, máx 20 caracteres)
  - `category` (string, opcional, enum: `"Insumos"`, `"Gastos fijos"`, `"Otros"`, default `"Otros"`)
  - `amount` (number, **requerido**, min 0, máx 2000)
  - `date` (string, **requerido**, formato `"YYYY-MM-DD"`)
- **Lógica**:
  1. Verifica que el usuario sea admin (middleware).
  2. Pasa `req.body` directamente a `Expense.create()`.
  3. Mongoose valida los campos según el schema.
  4. Si la validación pasa, persiste el documento en MongoDB.
- **Respuesta exitosa**: `201 Created` — documento Expense creado (sin `__v`, con `id` en lugar de `_id`).
- **Errores posibles**:
  - `401/403` — usuario no autenticado o no es admin (middleware `secure.isAdmin`).
  - `400` — validación de Mongoose falla (amount fuera de rango, description > 20 chars, category inválida, date faltante).
  - `500` — error de base de datos o fallo interno (pasado a `next`).

### GET /expenses/:date
- **Middleware**: `secure.isAdmin`
- **Query/Params esperado**: `:date` — string de fecha en formato `"YYYY-MM-DD"`.
- **Lógica**:
  1. Verifica que el usuario sea admin.
  2. Construye un filtro `{ date: req.params.date }` (match exacto de string).
  3. Ejecuta `Expense.find()` con ese filtro.
  4. Devuelve todos los expenses cuya fecha coincida exactamente con el parámetro.
- **Respuesta exitosa**: `200 OK` — array de Expense (vacío si no hay coincidencias).
- **Errores posibles**:
  - `401/403` — no autenticado o no admin.
  - `500` — error de base de datos.

### GET /expenses/selectedMonth/:selectedMonth
- **Middleware**: `secure.isAdmin`
- **Query/Params esperado**: `:selectedMonth` — string en formato `"YYYY-MM"`.
- **Lógica**:
  1. Verifica que el usuario sea admin.
  2. Ejecuta `Expense.find()` **sin filtros** — trae TODOS los expenses de la base de datos.
  3. Filtra en memoria comparando `expense.date.split('-')` contra `targetYear` y `targetMonth`.
  4. Devuelve solo los expenses que coinciden en año y mes.
- **Respuesta exitosa**: `200 OK` — array de Expense filtrados por mes (vacío si no hay coincidencias).
- **Errores posibles**:
  - `401/403` — no autenticado o no admin.
  - `500` — error de base de datos.
- **⚠️ Gotcha de rendimiento**: Trae **todos** los registros de la colección y filtra en memoria. A medida que crece la tabla, este endpoint se degrada. Debería usar un rango de fechas en la query de MongoDB.

### PATCH /expenses/:expenseId
- **Middleware**: `secure.isAdmin`, `expensesMid.exists`
- **Params esperado**: `:expenseId` — ObjectId de MongoDB.
- **Body esperado**: campos a actualizar del modelo Expense (parciales).
- **Lógica**:
  1. Verifica que el usuario sea admin.
  2. El middleware `expensesMid.exists` busca el expense por `req.params.expenseId` y lo adjunta a `req.expense`. Si no existe, responde `404`.
  3. Aplica `Object.assign(req.expense, req.body)` — mezcla los campos del body sobre el documento existente.
  4. Ejecuta `req.expense.save()` para persistir los cambios.
  5. Mongoose valida los campos modificados antes de guardar.
- **Respuesta exitosa**: `200 OK` — documento Expense actualizado.
- **Errores posibles**:
  - `401/403` — no autenticado o no admin.
  - `404` — expense no encontrado (middleware `expensesMid.exists`).
  - `400` — validación de Mongoose falla tras la actualización.
  - `500` — error de base de datos.

### DELETE /expenses/:id
- **Middleware**: `secure.isAdmin`, `expensesMid.exists`
- **Params esperado**: `:id` — se espera que sea un ObjectId de MongoDB.
- **Lógica**:
  1. Verifica que el usuario sea admin.
  2. El middleware `expensesMid.exists` intenta buscar el expense por `req.params.expenseId`.
  3. Si existe, ejecuta `Expense.deleteOne({ _id: req.expense.id })`.
  4. Loguea el ID del expense eliminado en consola.
- **Respuesta exitosa**: `204 No Content` — sin body.
- **Errores posibles**:
  - `401/403` — no autenticado o no admin.
  - `404` — expense no encontrado.
  - `500` — error de base de datos.
- **⚠️ BUG conocido**: La ruta usa `:id` pero el middleware `expensesMid.exists` busca por `req.params.expenseId`. Estos nombres no coinciden, por lo que **el middleware siempre devuelve 404** porque `req.params.expenseId` es `undefined`. El delete nunca funcionará correctamente hasta que se alinee el nombre del parámetro.

## Reglas de negocio

1. **Solo admins** pueden crear, leer, actualizar y eliminar expenses. Todos los endpoints están protegidos por `secure.isAdmin`.
2. **El monto tiene límites estrictos**: mínimo 0, máximo 2000. Esto se valida a nivel de schema de Mongoose.
3. **La descripción es corta**: máximo 20 caracteres.
4. **La categoría es cerrada**: solo acepta `"Insumos"`, `"Gastos fijos"` u `"Otros"`. Si no se proporciona, default `"Otros"`.
5. **La fecha es un string**, no un Date de MongoDB. Se almacena como `"YYYY-MM-DD"` y se compara como string exacto.
6. **El filtrado por mes es ineficiente**: se traen todos los registros y se filtran en memoria en lugar de usar una query con rango de fechas.
7. **No hay soft delete**: los expenses se eliminan físicamente de la base de datos.
8. **El update es parcial pero sin whitelist**: `Object.assign` aplica cualquier campo del body sobre el documento, incluyendo campos que no deberían ser modificables (como `createdAt` si se pasaran).

## Tests derivados

- [ ] POST /expenses — crea expense válido con todos los campos, retorna 201
- [ ] POST /expenses — crea expense con campos mínimos (solo amount + date), category default "Otros"
- [ ] POST /expenses — rechaza amount > 2000 con 400
- [ ] POST /expenses — rechaza amount < 0 con 400
- [ ] POST /expenses — rechaza description > 20 chars con 400
- [ ] POST /expenses — rechaza category inválida con 400
- [ ] POST /expenses — rechaza body sin date con 400
- [ ] POST /expenses — rechaza body sin amount con 400
- [ ] POST /expenses — usuario no admin recibe 401/403
- [ ] GET /expenses/:date — retorna expenses para una fecha existente
- [ ] GET /expenses/:date — retorna array vacío para fecha sin expenses
- [ ] GET /expenses/:date — usuario no admin recibe 401/403
- [ ] GET /expenses/selectedMonth/:selectedMonth — retorna expenses del mes correcto
- [ ] GET /expenses/selectedMonth/:selectedMonth — retorna array vacío para mes sin expenses
- [ ] GET /expenses/selectedMonth/:selectedMonth — no retorna expenses de otros meses
- [ ] GET /expenses/selectedMonth/:selectedMonth — usuario no admin recibe 401/403
- [ ] PATCH /expenses/:expenseId — actualiza campos válidos, retorna 200
- [ ] PATCH /expenses/:expenseId — retorna 404 para expense inexistente
- [ ] PATCH /expenses/:expenseId — rechaza actualización con amount inválido
- [ ] PATCH /expenses/:expenseId — usuario no admin recibe 401/403
- [ ] DELETE /expenses/:id — **BUG**: actualmente siempre retorna 404 por mismatch de parámetro (`:id` vs `expenseId`)
- [ ] DELETE /expenses/:id (corregido) — elimina expense existente, retorna 204
- [ ] DELETE /expenses/:id (corregido) — retorna 404 para expense inexistente
- [ ] DELETE /expenses/:id — usuario no admin recibe 401/403
