# Modelo: PushSubscription

## Schema
| Campo | Tipo | Requerido | Default | Descripción |
|-------|------|-----------|---------|-------------|
| `user` | ObjectId | Sí | — | Referencia al modelo `User`. Identifica a quién pertenece la suscripción. |
| `endpoint` | String | Sí | — | URL del servicio de push del navegador. Único para evitar duplicados del mismo navegador. |
| `keys.p256dh` | String | Sí | — | Clave pública Diffie-Hellman para cifrado ECDH (estándar Web Push). |
| `keys.auth` | String | Sí | — | Secreto de autenticación para el protocolo de push. |
| `createdAt` | Date | — | `Date.now` | Generado automáticamente por `timestamps: true`. |
| `updatedAt` | Date | — | `Date.now` | Generado automáticamente por `timestamps: true`. |

## Índices
| Campo | Tipo | Propósito |
|-------|------|-----------|
| `endpoint` | Unique | Evita que se registren dos suscripciones con el mismo endpoint (mismo navegador/dispositivo). |

## Virtuals / Methods / Statics
No se definen virtuals, methods ni statics custom en este schema.

### Transformación `toJSON`
El schema aplica un transform global en `toJSON` que:
1. Elimina `__v` (version key de Mongoose) de la representación serializada.
2. Reemplaza `_id` por `id` para estandarizar la respuesta con el resto de la API.

Esto afecta a **todas** las respuestas JSON del modelo (incluyendo respuestas de Express que usen `.toJSON()` implícitamente).

## Validaciones
| Regla | Campo | Comportamiento |
|-------|-------|----------------|
| `required` | `user`, `endpoint`, `keys.p256dh`, `keys.auth` | Mongoose rechaza el `save()` si falta alguno. |
| `unique` | `endpoint` | El índice único de MongoDB rechaza inserciones con endpoint duplicado (error `E11000`). |

## Relaciones
| Campo | Modelo Referenciado | Tipo |
|-------|---------------------|------|
| `user` | `User` | One-to-Many (un usuario puede tener múltiples suscripciones en distintos dispositivos/navegadores). |

## Gotchas
- **Sin lógica de actualización de claves**: El índice `unique` en `endpoint` impide crear duplicados, pero si un navegador rota sus claves push (puede ocurrir), un `create()` fallará con `E11000`. El consumidor debe manejar esto con un `findOneAndUpdate()` o `upsert`.
- **Transform `toJSON` silencioso**: El `_id` original se pierde en la serialización y se reemplaza por `id`. Cualquier código que espere `_id` en respuestas JSON no lo encontrará.
- **Sin populate automático**: La referencia a `User` no tiene `populate` en el schema; debe resolverse explícitamente en las rutas/controllers.
- **Sin TTL ni expiración**: Las suscripciones push pueden volverse inválidas (usuario revoca permisos, navegador limpia datos). No hay mecanismo automático de limpieza; se requiere un proceso externo o endpoint dedicado para borrar suscripciones muertas.
- **Estructura estándar Web Push**: El shape `{ endpoint, keys: { p256dh, auth } }` coincide exactamente con el objeto `PushSubscription` del navegador. Esto sugiere que el frontend envía `subscription.toJSON()` directamente al backend.
