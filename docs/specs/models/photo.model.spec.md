# Modelo: Photo

## Schema
| Campo | Tipo | Requerido | Default | Descripción |
|-------|------|-----------|---------|-------------|
| `user` | ObjectId (ref: User) | Sí | — | Usuario propietario de la foto |
| `photoUrl` | String | Sí | `''` | URL de la fotografía (validada como URL) |
| `createdAt` | Date | Auto | `now` | Fecha de creación (timestamps) |
| `updatedAt` | Date | Auto | `now` | Fecha de última modificación (timestamps) |

## Índices
No se definen índices explícitos. Mongoose crea automáticamente un índice en `_id`.

## Virtuals / Methods / Statics
No se definen virtuals, methods ni statics custom en el schema.

### Transformación toJSON
El schema configura `toJSON` con dos comportamientos:
- **Expone virtuals** en la serialización.
- **Transforma la respuesta**: elimina `__v` (versionKey), reemplaza `_id` por `id` en los documentos serializados.

## Validaciones
- **`user`**: debe existir (mensaje: "Se requiere un usuario").
- **`photoUrl`**: debe existir (mensaje: "Se requiere url de la fotografía") Y debe ser una URL válida según `isValidUrl` (usa `new URL()` nativo de Node.js — mensaje: "Not a valid url").

## Relaciones
- **`user` → `User`**: referencia directa por ObjectId. Cada foto pertenece a un usuario.

## Gotchas
- **Default contradictorio**: `photoUrl` tiene `default: ''` pero también es `required` y validado como URL. Una cadena vacía **NO pasa** la validación `isValidUrl` (`new URL('')` lanza error). Esto significa que si se crea un Photo sin `photoUrl`, la validación fallará en runtime, no en el default.
- **Sin índices compuestos**: no hay índice en `user`, por lo que las búsquedas de fotos por usuario (`Photo.find({ user: ... })`) no están optimizadas a nivel base de datos.
- **Sin cascade delete**: si se elimina un User, las fotos asociadas no se eliminan automáticamente (no hay hooks `pre('remove')` ni referencias inversas).
