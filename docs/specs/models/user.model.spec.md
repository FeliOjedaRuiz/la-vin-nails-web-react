# Modelo: User

Representa a los usuarios del sistema: clientes que reservan citas y administradores que gestionan la agenda.

**Archivo**: `api/models/user.model.js`
**Dependencias**: `mongoose`, `bcryptjs`
**Colección MongoDB**: `users`

---

## Schema

| Campo | Tipo | Requerido | Default | Descripción |
|-------|------|-----------|---------|-------------|
| `name` | String | Sí (mensaje: "Es necesario un nombre") | — | Nombre del usuario. Máximo 20 caracteres, mínimo 2. |
| `surname` | String | Sí (mensaje: "Es necesario almenos un apellido") | — | Apellido(s). Máximo 20 caracteres, mínimo 2. |
| `phone` | Number | Sí (mensaje: "Es necesario número de móvil") | — | Número de teléfono. **Sin formato internacional** — se almacena como número puro. |
| `email` | String | Sí (mensaje: "Es necesario un email") | — | Correo electrónico. Validado por regex. **Índice único.** |
| `password` | String | Sí (mensaje: "Es necesaria una contraseña") | — | Contraseña. Mínimo 4, máximo 16 caracteres. Se almacena hasheada con bcrypt (salt 10). |
| `role` | String | No | `"guest"` | Rol del usuario. Solo acepta `"admin"` o `"guest"`. |
| `loyalty` | Number | No | — | Contador de fidelidad (citas). Rango permitido: 0–10. **Sin valor default** — puede ser `undefined`. |
| `createdAt` | Date | Auto | Auto | Timestamp de creación (generado por `timestamps: true`). |
| `updatedAt` | Date | Auto | Auto | Timestamp de última modificación (generado por `timestamps: true`). |

**Total de campos definidos por el usuario**: 7 (más los 2 timestamps automáticos).

---

## Índices

| Campo | Tipo | Propósito |
|-------|------|-----------|
| `email` | Único | Garantiza que no haya dos usuarios con el mismo correo. Definido inline en el schema (`unique: true`). |

No hay índices compuestos ni adicionales definidos.

---

## Virtuals / Methods / Statics

### Virtual: `dates`

- **Tipo**: Virtual populate
- **Relación**: Referencia al modelo `Date` (colección de citas/servicios)
- **Configuración**: `localField: "_id"` → `foreignField: "user"`, `justOne: true`
- **Propósito**: Permite acceder a la cita asociada al usuario como `user.dates`

### Method: `checkPassword(candidatePassword)`

- **Firma**: `user.checkPassword(password) → Promise<boolean>`
- **Propósito**: Compara una contraseña en texto plano contra el hash almacenado usando `bcrypt.compare`
- **Retorna**: Promesa que resuelve a `true` si la contraseña coincide, `false` si no

### Pre-save Hook: hash de contraseña

- **Trigger**: Antes de cada `save()` en Mongoose
- **Condición**: Solo si el campo `password` fue modificado (`isModified("password")`)
- **Acción**: Genera un salt con factor de costo 10 y hashea la contraseña con bcrypt
- **Manejo de errores**: Pasa errores a `next()` si bcrypt falla

### Transformación toJSON

- Elimina `__v` (version key de Mongoose)
- Renombra `_id` a `id`
- **Elimina `password`** — nunca se expone en respuestas JSON

---

## Validaciones

| Campo | Regla | Mensaje |
|-------|-------|---------|
| `name` | `maxLength: 20` | "Máximo 20 caracteres" |
| `name` | `minLength: 2` | "Necesitamos al menos 2 caracteres" |
| `surname` | `maxLength: 20` | "Máximo 20 caracteres" |
| `surname` | `minLength: 2` | "Es necesario al menos 2 caracteres" |
| `email` | `match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/` | (mensaje por defecto de Mongoose) |
| `password` | `minLength: 4` | "Largo minimo 4 caracteres" |
| `password` | `maxLength: 16` | "Largo máximo 16 caracteres" |
| `role` | `enum: ["admin", "guest"]` | (mensaje por defecto de Mongoose) |
| `loyalty` | `min: 0` | "Minimo 0 cita" |
| `loyalty` | `max: 10` | "Máximo 10 citas" |

**Notas**:
- Los mensajes de validación están en español.
- `phone` no tiene validación de formato — cualquier número es aceptado.
- El regex de `email` es básico (no cubre todos los TLDs modernos, ej: `.technology`).

---

## Relaciones

| Modelo | Tipo | Campo local | Campo remoto | Dirección |
|--------|------|-------------|--------------|-----------|
| `Date` | Virtual populate (1:1 justOne) | `_id` | `user` | User → Date |

La relación es declarada como `justOne: true` en el virtual, lo cual implica que se espera **una sola** cita por usuario. Esto puede ser un error de diseño (ver Gotchas).

---

## Gotchas

### 1. `phone` como Number pierde información

El campo `phone` es de tipo `Number`. Esto significa:
- Números con ceros a la izquierda se truncan (ej: `0612345678` → `612345678`)
- No soporta formato internacional con `+` (ej: `+34 612 345 678`)
- **Recomendación**: Debería ser `String` con validación de formato.

### 2. Virtual `justOne: true` probablemente incorrecto

El virtual `dates` tiene `justOne: true`, pero un usuario puede tener múltiples citas a lo largo del tiempo. Esto haría que solo se devuelva **una** cita en lugar de un array. Si la intención es mostrar el historial de citas, `justOne` debería ser `false`.

### 3. Variable `ADMIN_USERS` sin uso

El archivo define `const ADMIN_USERS` leyendo de `process.env.ADMIN_USERS` (con fallback a `"admin@lavin.org"`), pero esta variable **no se usa en ningún lugar del modelo ni se exporta**. Es código muerto.

### 4. Contraseña con límites débiles

La contraseña acepta mínimo 4 caracteres y máximo 16. El máximo de 16 es restrictivo para usuarios que usan gestores de contraseñas con passwords largos. El mínimo de 4 es débil desde el punto de vista de seguridad.

### 5. El email no se normaliza

El campo `email` no tiene `lowercase: true` ni `trim: true`. Esto significa que `User@Email.COM` y `user@email.com` se consideran usuarios distintos, pese a ser el mismo correo.

### 6. Transformación `toJSON` elimina password — pero no `toObject`

El password se elimina al serializar a JSON (`toJSON`), pero si alguien llama `.toObject()` en un documento, el hash del password quedará expuesto.

### 7. Pre-save hook no cubre `findOneAndUpdate`

El hash de contraseña solo ocurre en el hook `pre("save")`. Si se usa `User.findOneAndUpdate()` o `User.updateOne()` para cambiar la contraseña, **no se hasheará** — se guardará en texto plano.

### 8. `loyalty` sin default

El campo `loyalty` no tiene valor por defecto. Si se crea un usuario sin especificar loyalty, el campo será `undefined` en la base de datos. Las validaciones `min` y `max` solo se aplican si el campo tiene valor.

### 9. Regex de email limitado

El regex `/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/` limita los TLDs a 2-4 caracteres. Excluye TLDs válidos como `.museum`, `.technology`, `.community`, etc.
