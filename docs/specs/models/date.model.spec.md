# Modelo: Date

## Schema

| Campo | Tipo | Requerido | Default | Descripción |
|-------|------|-----------|---------|-------------|
| `user` | ObjectId (ref: User) | No | — | Usuario que solicita la cita |
| `service` | ObjectId (ref: Service) | Sí | — | Servicio asociado a la cita |
| `type` | String | Sí | — | Tipo de servicio (ej: "Manicura", "Pedicura") |
| `handState` | String | No | — | Estado actual de las manos/uñas del cliente |
| `desiredDesign` | String | No | — | Descripción del diseño deseado por el cliente |
| `designDetails` | String | No | — | Detalles específicos del diseño (máx 300 caracteres) |
| `needRemove` | String (enum: "Sí", "No") | No | "Sí" | Indica si se necesita remover esmalte/diseño previo |
| `turn` | ObjectId (ref: Turn) | No | — | Turno (slot de agenda) asociado a esta cita |
| `cost` | Number | No | — | Costo del servicio |
| `duration` | String | No | — | Duración estimada del servicio |
| `state` | String (enum: "Solicitada", "Realizada", "Cancelada") | No | "Solicitada" | Estado actual de la cita |
| `paymentMethod` | String (enum: "Sin cobrar", "Efectivo", "Bizum") | No | "Sin cobrar" | Método de pago utilizado |
| `createdAt` | Date (auto) | — | Ahora | Timestamp de creación (automático por `timestamps: true`) |
| `updatedAt` | Date (auto) | — | Ahora | Timestamp de última modificación (automático) |

## Índices

No hay índices explícitos definidos en este modelo. Existe un índice comentado (`{ date: 1, turn: 1 }`, unique) que **no está activo**. El campo `date` ni siquiera existe en el schema actual, lo que sugiere que este índice era de una versión anterior del modelo.

## Virtuals / Methods / Statics

No hay virtuals, methods ni statics definidos directamente en el schema.

**Transformación `toJSON`**: El schema configura una transformación global en `toJSON`:
- Habilita `virtuals: true` en la serialización
- Elimina `__v` (version key) del output
- Reemplaza `_id` por `id` en el output JSON
- Esto afecta a **todos** los documentos serializados, no solo a este modelo si se comparte la configuración

## Relaciones

| Relación | Modelo Referenciado | Tipo |
|----------|---------------------|------|
| `user` | `User` | Referencia opcional — quién creó/solicitó la cita |
| `service` | `Service` | Referencia requerida — qué servicio se va a realizar |
| `turn` | `Turn` | Referencia opcional — qué turno de agenda ocupa |

## Validaciones

| Campo | Regla | Mensaje |
|-------|-------|---------|
| `service` | Requerido | "Seleccione un servicio" |
| `type` | Requerido | "Seleccione un tipo de servicio" |
| `designDetails` | Máximo 300 caracteres | "max 300 chars." |
| `needRemove` | Enum: `["Sí", "No"]` | — |
| `state` | Enum: `["Solicitada", "Realizada", "Cancelada"]` | — |
| `paymentMethod` | Enum: `["Sin cobrar", "Efectivo", "Bizum"]` | — |

## Gotchas

1. **Sin campo `date`**: El modelo se llama `Date` pero **no tiene ningún campo que almacene la fecha/hora de la cita**. La fecha real vive en el modelo `Turn` referenciado. Esto es confuso semánticamente — `Date` en realidad representa una "reserva" o "booking", no una fecha.

2. **Índice comentado con campo inexistente**: Hay un `dateSchema.index({ date: 1, turn: 1 }, { unique: true })` comentado que referencia un campo `date` que no existe. Esto es código muerto que debería eliminarse para evitar confusión.

3. **`turn` es opcional pero es la clave temporal**: Dado que no hay campo de fecha en este modelo, si `turn` no se asigna, la cita queda sin referencia temporal. No hay validación que asegure que un `Date` tenga un `turn` asociado.

4. **`cost` es Number sin validación**: No hay mínimo, máximo ni default. Podría ser `null`, `0`, o negativo sin que Mongoose lo rechace.

5. **`duration` es String, no Number**: La duración se almacena como string (probablemente algo como "1h 30min" o "90"), lo que impite cálculos aritméticos directos (sumar duraciones, comparar, etc.).

6. **`toJSON` transforma `_id` → `id`**: Cualquier código backend que espere `_id` después de un `.toJSON()` o `.toObject()` va a fallar. Esto es consistente pero hay que tenerlo en cuenta.

7. **`timestamps: true`**: Agrega `createdAt` y `updatedAt` automáticamente, pero no están documentados explícitamente en el schema.
