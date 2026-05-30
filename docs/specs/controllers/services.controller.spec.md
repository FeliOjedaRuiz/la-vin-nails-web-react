# Controller: Services

## Endpoints

### GET /services
- **Middleware**: ninguno (endpoint público)
- **Body/Query esperado**: ninguno
- **Lógica**:
  1. Ejecuta `Service.find()` sin filtros — devuelve todos los servicios registrados en MongoDB.
  2. Si la consulta es exitosa, responde con un JSON array de servicios.
  3. Si falla, delega el error al middleware de manejo de errores global (`next`).
- **Respuesta exitosa**: `200 OK` — array de objetos Service (transformados por el schema: `id` en lugar de `_id`, sin `__v`).
- **Errores posibles**:
  - `500` (o el que defina el error handler global) — si la conexión a MongoDB falla o la consulta lanza excepción.

### GET /services/:id
- **Middleware**: ninguno (endpoint público)
- **Body/Query esperado**: `:id` en path — ObjectId válido de MongoDB.
- **Lógica**:
  1. Ejecuta `Service.findById(req.params.id)` para buscar un servicio por su identificador.
  2. Si lo encuentra, responde con el objeto Service en JSON (transformado por el schema).
  3. Si no lo encuentra, responde `200` con `null` (comportamiento por defecto de Mongoose cuando `findById` no halla el documento).
  4. Si falla (ej. `id` no es un ObjectId válido), delega al error handler global (`next`).
- **Respuesta exitosa**: `200 OK` — objeto Service o `null` si no existe.
- **Errores posibles**:
  - `500` (o el que defina el error handler global) — si el `id` no es un ObjectId válido o hay error de conexión.

## Reglas de negocio

1. **Sin autenticación**: ambos endpoints son completamente públicos. Cualquier cliente puede listar y consultar servicios sin credenciales.
2. **Sin paginación**: `Service.find()` no aplica límites ni paginación — devuelve todos los registros de la colección. Si la colección crece, esto puede impactar rendimiento.
3. **Sin validación de entrada**: en `GET /services/:id` no se valida que `:id` sea un ObjectId válido antes de llamar a `findById`. Mongoose maneja el error internamente, pero el response depende del error handler global.
4. **Solo lectura**: este controller no expone operaciones de creación, actualización ni eliminación. La gestión de servicios se hace por otro medio (probablemente seed o acceso directo a la base de datos).
5. **Transformación de salida**: el schema aplica `toJSON` con virtuals, eliminando `__v` y exponiendo `id` como string derivado de `_id`.

## Integración con Notion

**No existe integración con Notion en este controller.** A diferencia de otros controllers del proyecto (como `turns.controllers`), `services.controllers.js` no importa ni utiliza el SDK de Notion. Los servicios se leen exclusivamente desde MongoDB.

## Tests derivados

- [ ] `GET /services` devuelve array vacío cuando no hay servicios en la base de datos
- [ ] `GET /services` devuelve todos los servicios cuando existen registros
- [ ] `GET /services/:id` devuelve el servicio correcto cuando el ID existe
- [ ] `GET /services/:id` devuelve `null` (status 200) cuando el ID no existe
- [ ] `GET /services/:id` delega error al handler global cuando el ID no es un ObjectId válido
- [ ] `GET /services` no requiere autenticación (acceso público)
- [ ] `GET /services/:id` no requiere autenticación (acceso público)
- [ ] Los servicios devueltos incluyen `id` como string y NO incluyen `__v` ni `_id`
