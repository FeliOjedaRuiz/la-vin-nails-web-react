# Controller: Users

## Endpoints

### POST /api/v1/users
- **Middleware**: `secure.cleanBody` (global — strips `_id`, `author`, `createdAt`, `updatedAt` del body)
- **Body esperado**: `{ name, surname, phone, email, password, role?, loyalty? }` — todos los campos del schema User
- **Lógica**:
  1. Crea un nuevo documento User directamente con `User.create(req.body)`
  2. El pre-save hook del modelo hashea la contraseña con bcrypt automáticamente
  3. Si `role` no se envía, el modelo le asigna `"guest"` por defecto
  4. Si el email ya existe, MongoDB dispara un error E11000 que el error handler global convierte en 409
- **Respuesta exitosa**: `201` — JSON del usuario creado (sin password, con `id` en lugar de `_id`, sin `__v`)
- **Errores posibles**:
  - `400` — Validación del schema fallida (nombre corto/largo, email inválido, password fuera de rango 4-16 chars, etc.)
  - `409` — Email duplicado (E11000)

### POST /api/v1/login
- **Middleware**: `secure.cleanBody` (global)
- **Body esperado**: `{ email, password }`
- **Lógica**:
  1. Busca un usuario por email con `User.findOne`
  2. Si no existe, devuelve 401 con `{ errors: { password: 'Credenciales invalidas' } }`
  3. Si existe, compara la contraseña con `user.checkPassword()` (bcrypt.compare)
  4. Si no coincide, devuelve el mismo 401 genérico (no revela si el email existe o no)
  5. Si coincide, firma un JWT con `sub: user.id` y `exp: Date.now()/1000 + maxSessionTime` (default 3600s = 1 hora)
  6. Devuelve el token junto con los datos serializados del usuario
- **Respuesta exitosa**: `200` — `{ token, id, name, surname, phone, email, role, loyalty, createdAt, updatedAt }`
- **Errores posibles**:
  - `401` — Credenciales inválidas (email no existe o password incorrecto)

### POST /api/v1/sendRestoreEmail/:email
- **Middleware**: `secure.cleanBody` (global), `usersMid.exists`
- **Query/Params esperado**: `:email` en la URL (el email del usuario)
- **Lógica**:
  1. `usersMid.exists` busca el usuario por `req.params.email` y lo asigna a `req.user`
  2. Si no existe, el middleware responde 404
  3. El controller envía un email de restauración de contraseña vía `mailer.sendRestorePasswordEmail(user)`
  4. El email contiene un enlace a `https://la-vin-nails-app.fly.dev/restore/{user.id}`
  5. **No espera la resolución del envío de email** — el mailer es fire-and-forget (no retorna promise al controller)
- **Respuesta exitosa**: `200` — respuesta vacía (el mailer no devuelve nada al controller, Express envía 200 implícito)
- **Errores posibles**:
  - `404` — Usuario no encontrado (viene del middleware)

### POST /api/v1/restorepassword/:userId
- **Middleware**: `secure.cleanBody` (global), `usersMid.checkUser`
- **Query/Params esperado**: `:userId` en la URL
- **Body esperado**: campos del usuario a actualizar — típicamente `{ password }`
- **Lógica**:
  1. `usersMid.checkUser` busca el usuario por `req.params.userId` y lo asigna a `req.user`
  2. Si no existe, el middleware responde 404
  3. El controller hace `Object.assign(req.user, req.body)` — copia TODOS los campos del body al usuario
  4. Guarda el usuario con `.save()` — el pre-save hook hashea la nueva contraseña si fue modificada
  5. Devuelve el usuario actualizado
- **Respuesta exitosa**: `200` — JSON del usuario actualizado
- **Errores posibles**:
  - `404` — Usuario no encontrado (middleware)
  - `400` — Validación del schema fallida en los nuevos valores
  - `409` — Si se intenta cambiar el email a uno ya existente

### GET /api/v1/users/:userId
- **Middleware**: `secure.cleanBody` (global), `secure.auth`, `secure.isAuthorized`
- **Params esperado**: `:userId` en la URL
- **Lógica**:
  1. `secure.auth` verifica el JWT y carga `req.user`
  2. `secure.isAuthorized` permite acceso si el usuario es admin O si el `userId` coincide con el usuario autenticado
  3. El controller busca el usuario por `req.params.userId` con `User.findById`
  4. Devuelve el usuario encontrado
- **Respuesta exitosa**: `200` — JSON del usuario
- **Errores posibles**:
  - `401` — Token faltante, inválido, o usuario no autorizado para ver este perfil
  - `404` — Usuario no encontrado (si el ID no existe en la BD)

### PATCH /api/v1/users/:userId
- **Middleware**: `secure.cleanBody` (global), `secure.isAdmin`, `usersMid.clientExists`
- **Params esperado**: `:userId` en la URL
- **Body esperado**: campos del usuario a actualizar (parciales)
- **Lógica**:
  1. `secure.isAdmin` verifica que el usuario autenticado tenga rol `"admin"`
  2. `usersMid.clientExists` busca el usuario target por `req.params.userId` y lo asigna a `req.clientUser`
  3. El controller hace `User.findByIdAndUpdate(req.clientUser.id, req.body)` — actualiza con los campos del body
  4. Luego hace un segundo `User.findById(user.id)` para obtener el documento actualizado y devolverlo
  5. **Nota**: la opción `new: true` no se usa en el `findByIdAndUpdate`, por eso se necesita la segunda consulta
- **Respuesta exitosa**: `200` — JSON del usuario actualizado
- **Errores posibles**:
  - `401` — Token faltante, inválido, o usuario no es admin
  - `404` — Usuario target no encontrado (middleware)
  - `400` — Validación del schema fallida

### GET /api/v1/users
- **Middleware**: `secure.cleanBody` (global), `secure.isAdmin`
- **Lógica**:
  1. `secure.isAdmin` verifica que el usuario autenticado tenga rol `"admin"`
  2. El controller devuelve TODOS los usuarios con `User.find()` sin filtros ni paginación
- **Respuesta exitosa**: `200` — Array de todos los usuarios (sin password)
- **Errores posibles**:
  - `401` — Token faltante, inválido, o usuario no es admin

## Reglas de negocio

1. **Roles**: Solo existen dos roles — `"admin"` y `"guest"`. El rol por defecto es `"guest"`.
2. **Password hashing**: Toda contraseña se hashea automáticamente con bcrypt (salt rounds: 10) antes de guardar. Nunca se almacena en texto plano.
3. **Sesión**: El token JWT expira por defecto a 1 hora (`MAX_SESSION_TIME` env var, fallback 3600s).
4. **Email único**: El email debe ser único en la base de datos. Un duplicado genera error 409.
5. **Validación de nombre**: Entre 2 y 20 caracteres.
6. **Validación de password**: Entre 4 y 16 caracteres.
7. **Loyalty**: Valor numérico entre 0 y 10 (representa cantidad de citas).
8. **Protección de campos**: El middleware global `cleanBody` elimina `_id`, `author`, `createdAt`, `updatedAt` del body antes de cualquier operación de escritura.
9. **Admin-only**: Listar todos los usuarios y actualizar un usuario solo puede hacerlo un admin.
10. **Self-service**: Un usuario autenticado puede ver su propio perfil, pero no el de otros (a menos que sea admin).

## Tests derivados

- [ ] POST /users crea usuario con rol "guest" por defecto cuando no se envía role
- [ ] POST /users devuelve 409 cuando el email ya existe
- [ ] POST /users devuelve 400 cuando el password tiene menos de 4 caracteres
- [ ] POST /users devuelve 400 cuando el nombre tiene menos de 2 caracteres
- [ ] POST /users no acepta `_id` en el body (cleanBody global lo elimina)
- [ ] POST /login devuelve 401 con mensaje genérico cuando el email no existe
- [ ] POST /login devuelve 401 con mensaje genérico cuando la password es incorrecta
- [ ] POST /login devuelve token JWT + datos del usuario cuando las credenciales son correctas
- [ ] POST /login el token expira después de MAX_SESSION_TIME segundos
- [ ] POST /sendRestoreEmail/:email devuelve 404 cuando el email no existe
- [ ] POST /sendRestoreEmail/:email envía email de restauración cuando el usuario existe
- [ ] POST /restorepassword/:userId devuelve 404 cuando el userId no existe
- [ ] POST /restorepassword/:userId actualiza la password y la hashea automáticamente
- [ ] GET /users/:userId devuelve 401 sin token
- [ ] GET /users/:userId devuelve 401 si el usuario autenticado no es el target ni admin
- [ ] GET /users/:userId devuelve el usuario cuando el autenticado es el propio usuario
- [ ] GET /users/:userId devuelve el usuario cuando el autenticado es admin
- [ ] PATCH /users/:userId devuelve 401 si el usuario no es admin
- [ ] PATCH /users/:userId actualiza los campos del usuario target cuando es admin
- [ ] PATCH /users/:userId devuelve 404 cuando el userId target no existe
- [ ] GET /users devuelve 401 si el usuario no es admin
- [ ] GET /users devuelve array completo de usuarios cuando es admin
- [ ] GET /users no incluye passwords en la respuesta
