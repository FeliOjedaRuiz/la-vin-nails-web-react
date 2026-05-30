# Modelo: Turn

## Schema

| Campo | Tipo | Requerido | Default | Descripción |
|-------|------|-----------|---------|-------------|
| `date` | String | Sí | — | Fecha del turno almacenada como string (no Date) |
| `hour` | String | Sí | — | Hora del turno almacenada como string (no Date) |
| `state` | String | No | `"Disponible"` | Estado del turno. Valores válidos: `"Disponible"`, `"Solicitado"`, `"Confirmado"`, `"Cancelado"`, `"Reservado"` |
| `createdAt` | Date | Auto | `Date.now` | Generado automáticamente por `timestamps: true` |
| `updatedAt` | Date | Auto | `Date.now` | Generado automáticamente por `timestamps: true` |

## Índices

No hay índices explícitos definidos. Solo el índice automático de `_id` provisto por MongoDB.

## Virtuals / Methods / Statics

No hay virtuals, methods ni statics definidos en el schema.

### Transformación `toJSON`

Se configura `toJSON` con `virtuals: true` y una función `transform` que:
1. Elimina `__v` (version key de Mongoose) de la respuesta serializada
2. Reemplaza `_id` por `id` (copia el valor de `_id` a `id` y luego borra `_id`)

Esto afecta a todas las respuestas JSON del modelo (ej: `res.json(turn)`).

## Validaciones

| Campo | Regla | Detalle |
|-------|-------|---------|
| `date` | `required` | No puede ser null/undefined al crear |
| `hour` | `required` | No puede ser null/undefined al crear |
| `state` | `enum` | Solo acepta los 5 valores listados; cualquier otro valor genera error de validación de Mongoose |

## Relaciones

No tiene relaciones con otros modelos (no hay campos `ref`). Es un modelo independiente.

## Gotchas

- **`date` y `hour` son Strings, no Date**: Esto significa que no se pueden usar operadores nativos de MongoDB para rangos de fechas (`$gte`, `$lt`, etc.) sin parseo previo. Las consultas por fecha dependen del formato exacto del string almacenado. Si el formato no es ISO (`YYYY-MM-DD`), el ordenamiento lexicográfico puede dar resultados incorrectos.
- **No hay índice en `date` + `hour`**: Si la tabla de turnos crece, las consultas para buscar turnos por fecha/hora harán un collection scan. En un sistema de turnos esto es la query más común.
- **Sin validación de formato**: No hay regex ni custom validator que verifique que `date` y `hour` tengan un formato consistente (ej: `"2026-05-28"` vs `"28/05/2026"`). Depende enteramente del código que crea los documentos.
- **Sin hooks**: No hay `pre-save` ni `post-save`. No se normaliza ni transforma ningún dato antes de persistir.
- **Estado inicial siempre "Disponible"**: Si se crea un turno sin especificar `state`, queda como `"Disponible"`. No hay lógica que impida crear un turno directamente en otro estado.
