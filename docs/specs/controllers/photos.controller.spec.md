# Controller: Photos

## Endpoints

### POST /upload
- **Middleware**: `secure.isAdmin`, `fileUploader.single('photoUrl')` (Multer + CloudinaryStorage)
- **Body esperado**: multipart/form-data con campo `photoUrl` (archivo de imagen)
- **Lógica**:
  1. Verifica que el usuario sea admin (middleware `secure.isAdmin`)
  2. Multer intercepta el archivo `photoUrl` y lo sube automáticamente a Cloudinary via `CloudinaryStorage`
  3. La configuración de Cloudinary permite solo formatos `jpg` y `png`
  4. Las imágenes se guardan en el folder `la-vin-nails-web/uñas-clientas`
  5. Si no hay archivo, pasa un error al middleware de errores global
  6. Devuelve la URL de la imagen subida (proporcionada por Cloudinary en `req.file.path`)
- **Respuesta exitosa**: 200 — `{ photoUrl: "<cloudinary_url>" }`
- **Errores posibles**:
  - 401/403 — No autenticado o no es admin (middleware `secure.isAdmin`)
  - 500 — Error de Multer/Cloudinary si la subida falla (pasado via `next`)
  - Error genérico si `req.file` es undefined (pasado via `next` con mensaje "No file uploaded!")

### POST /photos
- **Middleware**: `secure.auth`
- **Body esperado**: JSON con campos del modelo Photo:
  - `user` (ObjectId, required) — referencia al usuario propietario
  - `photoUrl` (String, required) — URL de la fotografía (validada como URL)
- **Lógica**:
  1. Verifica que el usuario esté autenticado
  2. Crea un documento Photo en MongoDB con el body recibido
  3. El modelo aplica validación de URL en `photoUrl`
- **Respuesta exitosa**: 201 — documento Photo creado (con virtual `id`, sin `_id` ni `__v`)
- **Errores posibles**:
  - 401 — No autenticado (middleware `secure.auth`)
  - 400 — Validación de Mongoose falla (URL inválida, campos faltantes)
  - 500 — Error de base de datos

### GET /photos
- **Middleware**: ninguno (endpoint público)
- **Query esperado**: ninguno
- **Lógica**:
  1. Busca todos los documentos Photo en MongoDB
  2. Ordena por `createdAt` descendente (más recientes primero)
  3. Limita a 18 resultados
- **Respuesta exitosa**: 200 — array de hasta 18 objetos Photo
- **Errores posibles**:
  - 500 — Error de base de datos

### GET /photos/:userId
- **Middleware**: `secure.auth`, `secure.isAuthorized`
- **Params esperado**: `userId` (ObjectId en la URL)
- **Lógica**:
  1. Verifica autenticación y que el usuario sea el mismo que `userId` (middleware `secure.isAuthorized`)
  2. Busca todos los Photos donde `user` coincide con `req.params.userId`
- **Respuesta exitosa**: 200 — array de objetos Photo del usuario
- **Errores posibles**:
  - 401 — No autenticado
  - 403 — Autenticado pero intenta acceder a photos de otro usuario
  - 500 — Error de base de datos

### DELETE /photos/:id
- **Middleware**: `secure.isAdmin`, `photosMid.exists`
- **Params esperado**: `id` (ObjectId del Photo)
- **Lógica**:
  1. Verifica que el usuario sea admin
  2. Middleware `photosMid.exists` busca el Photo por ID y lo adjunta en `req.photo`; si no existe, pasa error 404
  3. Extrae el `public_id` de Cloudinary desde `photo.photoUrl` usando la función interna `getPublicIdFromUrl`
  4. Si logra extraer el public_id, llama a `cloudinary.uploader.destroy(public_id)` para eliminar la imagen de Cloudinary
  5. El resultado de Cloudinary se loguea pero NO bloquea la eliminación si falla (try/catch interno)
  6. Elimina el documento Photo de MongoDB con `Photo.deleteOne({ _id: req.params.id })`
  7. Responde 204 sin contenido
- **Respuesta exitosa**: 204 — sin cuerpo
- **Errores posibles**:
  - 401/403 — No autenticado o no es admin
  - 404 — Photo no encontrado (middleware `photosMid.exists`)
  - 500 — Error general (pasado via `next`)

## Reglas de negocio

1. Solo los administradores pueden subir imágenes a Cloudinary y eliminar fotos (tanto de Cloudinary como de la base de datos).
2. Cualquier usuario autenticado puede crear un registro Photo, pero el `user` debe ser un ObjectId válido.
3. El endpoint `GET /photos` es público pero está limitado a 18 resultados ordenados por más reciente.
4. Un usuario solo puede ver sus propias fotos (`GET /photos/:userId` requiere `isAuthorized`).
5. La eliminación de una foto intenta primero borrarla de Cloudinary, pero si esa operación falla, **igual elimina el registro de la base de datos** (el catch interno no re-throwea).
6. Las imágenes subidas a Cloudinary se almacenan exclusivamente en el folder `la-vin-nails-web/uñas-clientas` y solo se aceptan formatos `jpg` y `png`.

## Integración con Cloudinary

### Subida de imágenes
- Se usa `multer-storage-cloudinary` (`CloudinaryStorage`) como motor de almacenamiento de Multer.
- Cuando un admin hace `POST /upload`, Multer intercepta el campo `photoUrl`, lo sube a Cloudinary automáticamente, y el resultado queda en `req.file.path` con la URL completa de Cloudinary.
- La configuración de Cloudinary se carga desde variables de entorno: `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET`.

### Eliminación de imágenes
- La función `getPublicIdFromUrl` extrae el `public_id` de una URL de Cloudinary:
  1. Decodifica la URL con `decodeURIComponent`
  2. Divide por `/` y busca el índice de `"upload"`
  3. Salta la versión (ej. `v1755702210`) tomando desde `uploadIndex + 2`
  4. Remueve la extensión del archivo con regex
- **Gotcha**: Si la URL no contiene `"upload"`, la función retorna `null` y la imagen NO se elimina de Cloudinary (solo se borra de la BD).
- El resultado de `cloudinary.uploader.destroy` se loguea extensamente pero los errores **no bloquean** la eliminación del registro en MongoDB.

### Configuración de Cloudinary
- Folder: `la-vin-nails-web/uñas-clientas`
- Formatos permitidos: `jpg`, `png`
- El controller importa `cloudinary.v2` directamente (no usa el export del config file)

## Tests derivados

- [ ] POST /upload rechaza a usuarios no admin (401/403)
- [ ] POST /upload sube un archivo jpg y devuelve la URL de Cloudinary
- [ ] POST /upload rechaza archivos que no sean jpg/png
- [ ] POST /upload devuelve error si no se envía archivo
- [ ] POST /photos crea un Photo válido con user y photoUrl
- [ ] POST /photos rechaza photoUrl que no sea una URL válida
- [ ] POST /photos requiere autenticación
- [ ] GET /photos devuelve máximo 18 fotos ordenadas por más reciente
- [ ] GET /photos es accesible sin autenticación
- [ ] GET /photos/:userId devuelve solo las fotos del usuario autenticado
- [ ] GET /photos/:userId rechaza acceso a fotos de otro usuario (403)
- [ ] DELETE /photos/:id elimina la imagen de Cloudinary y el registro de MongoDB
- [ ] DELETE /photos/:id elimina el registro de MongoDB aunque falle Cloudinary
- [ ] DELETE /photos/:id rechaza a usuarios no admin
- [ ] DELETE /photos/:id devuelve 404 si el Photo no existe
- [ ] getPublicIdFromUrl extrae correctamente el public_id de una URL de Cloudinary con versión
- [ ] getPublicIdFromUrl retorna null si la URL no contiene "upload"
