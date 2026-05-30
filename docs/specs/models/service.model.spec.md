# Modelo: Service

Representa un servicio ofrecido por La Vin Nails (ej: manicura, pedicura, nail art). Se usa para mostrar el catálogo de servicios disponibles y sus precios/duraciones.

## Schema

| Campo | Tipo | Requerido | Default | Descripción |
|-------|------|-----------|---------|-------------|
| `name` | String | Sí | — | Nombre del servicio |
| `type` | [String] | Sí | — | Array de strings que categorizan el servicio |
| `image` | String | No | — | URL de imagen del servicio (probablemente de Cloudinary) |
| `description` | String | Sí | — | Descripción detallada del servicio |
| `price` | Number | No | — | Precio del servicio |
| `dateDuration` | String | No | — | Duración del servicio como string (ej: "30 min", "1h") |
| `createdAt` | Date | No | `Date.now` | Timestamp automático (por `timestamps: true`) |
| `updatedAt` | Date | No | `Date.now` | Timestamp automático (por `timestamps: true`) |

## Índices

No se definen índices explícitos. Solo el `_id` por defecto de MongoDB.

## Virtuals / Methods / Statics

No hay virtuals, methods ni statics custom definidos en el schema.

### Transformación `toJSON`

El schema configura `toJSON` con:
- **virtuals: true** — incluye virtuals en la serialización (aunque no hay ninguno definido)
- **transform** — modifica el objeto al serializar:
  - Elimina `__v` (version key de Mongoose)
  - Mapea `_id` → `id` para el frontend
  - Elimina `_id` original

Esto significa que cualquier respuesta JSON de este modelo ya viene limpia para consumo del cliente.

## Validaciones

Solo validaciones implícitas de Mongoose:
- `name`, `type`, y `description` son requeridos (`required: true`)
- No hay validaciones custom (no hay `min`, `max`, `enum`, `match`, ni validators custom)

## Relaciones

No tiene referencias (`ref`) a otros modelos. Es un modelo independiente.

## Gotchas

1. **`type` es un array de strings, no un string simple**: El campo `type` usa `type: [String]`, lo que significa que cada servicio puede tener múltiples categorías. Esto puede ser intencional (un servicio puede ser "manicura" Y "nail art" a la vez) o puede ser un error de diseño si originalmente se pensó como una sola categoría.

2. **`price` es Number sin validación de mínimo**: No hay `min: 0`, por lo que se podrían guardar precios negativos sin error.

3. **`dateDuration` es String, no Number**: La duración se almacena como string libre (ej: "45 min"), lo que impide ordenar o filtrar por duración numéricamente. Si en algún momento se necesita comparar duraciones, habría que parsear el string.

4. **Sin índices para queries frecuentes**: Si se hacen queries por `type` o `name` frecuentemente, no hay índices que las optimicen.

5. **No hay `trim` ni `lowercase` en los strings**: Los campos de texto no normalizan whitespace ni capitalización, lo que puede causar duplicados visuales (ej: "Manicura " vs "Manicura").
