# Modelo: Expense

Registro de gastos operativos del negocio (insumos, gastos fijos, otros).

## Schema

| Campo | Tipo | Requerido | Default | Descripción |
|-------|------|-----------|---------|-------------|
| `description` | String | No | — | Descripción breve del gasto. Máximo 20 caracteres. |
| `category` | String | No | `'Otros'` | Categoría del gasto. Valores permitidos: `'Insumos'`, `'Gastos fijos'`, `'Otros'`. |
| `amount` | Number | Sí | — | Monto del gasto. Debe estar entre 0 y 2000 (inclusive). |
| `date` | String | Sí | — | Fecha del gasto almacenada como string (no Date). |
| `createdAt` | Date | Auto | `Date.now` | Timestamp de creación (automático por `timestamps: true`). |
| `updatedAt` | Date | Auto | `Date.now` | Timestamp de última actualización (automático por `timestamps: true`). |

## Índices

No se definen índices explícitos. Solo el índice automático de `_id` provisto por MongoDB.

## Virtuals / Methods / Statics

No hay virtuals, methods ni statics definidos en el schema.

**Transformación JSON** (`toJSON`):
- Incluye virtuals en la salida.
- Elimina `__v` (version key) del objeto serializado.
- Expone `id` como alias de `_id` y luego elimina `_id` del output.

## Validaciones

| Campo | Regla | Mensaje |
|-------|-------|---------|
| `description` | `maxLength: 20` | "Maximo 20 caracteres." |
| `amount` | `required` | — |
| `amount` | `min: 0` | "El monto no puede ser negativo." |
| `amount` | `max: 2000` | "El monto no puede superar los 2000." |
| `category` | `enum: ['Insumos', 'Gastos fijos', 'Otros']` | Validación implícita de Mongoose |
| `date` | `required` | — |

## Relaciones

No tiene relaciones con otros modelos (no hay campos `ref`). Es un modelo independiente.

## Gotchas

- **`date` es String, no Date**: La fecha se almacena como string, no como tipo `Date` de MongoDB. Esto impide consultas nativas de rango (`$gte`, `$lt`) sin parseo previo. Probablemente se almacena en formato `YYYY-MM-DD` o similar.
- **Límite de monto bajo**: El `max` de 2000 en `amount` es un tope bajo que podría necesitar ajuste si el negocio crece o si la moneda cambia.
- **`description` opcional pero con límite**: Aunque no es requerido, si se proporciona tiene un límite estricto de 20 caracteres — bastante restrictivo para descripciones de gastos.
- **Sin soft delete**: No hay mecanismo de borrado lógico; los gastos eliminados se pierden permanentemente.
