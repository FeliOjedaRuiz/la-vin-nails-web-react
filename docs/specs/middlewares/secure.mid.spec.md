# Middleware: Secure (Auth JWT + Roles)

## Funciones exportadas

| Función | Parámetros | Qué valida/hace | Respuesta en error |
|---------|------------|-----------------|-------------------|
| `cleanBody` | `req, res, next` | Elimina campos protegidos del body (`_id`, `author`, `createdAt`, `updatedAt`) antes de pasar al siguiente middleware. Previene que el cliente sobrescriba campos internos. | Nunca falla — siempre llama a `next()` |
| `auth` | `req, res, next` | Extrae el token del header `Authorization: Bearer <token>`, lo verifica con `jwt.verify` contra `process.env.JWT_SECRET`, busca el usuario en BD por `decoded.sub` y lo adjunta en `req.user`. | 401 — `"Missing acces token"` si no hay token; 401 — `"User not found"` si el usuario no existe en BD; 401 — error crudo de `jwt.verify` si el token es inválido/expirado |
| `optionalAuth` | `req, res, next` | Igual que `auth` pero **nunca falla**. Si no hay token, el token es inválido, o el usuario no existe, simplemente continúa sin asignar `req.user`. Permite rutas que funcionan tanto para autenticados como para invitados. | Ninguna — siempre llama a `next()` sin error |
| `isAdmin` | `req, res, next` | Duplica la lógica de `auth` (extrae token, verifica JWT, busca usuario) y además valida que `user.role === "admin"`. | 401 — `"Missing acces token"` si no hay token; 401 — `"Unauthorized"` si el usuario no tiene rol admin; 401 — error crudo de `jwt.verify` si el token es inválido |
| `isAuthorized` | `req, res, next` | Verifica que el usuario autenticado sea admin **o** que el `req.user.id` coincida con `req.params.userId`. Permite que un usuario acceda a sus propios recursos o que un admin acceda a cualquiera. | 401 — `"Unauthorized"` si no es admin y el ID no coincide |

## Dependencias

| Dependencia | Origen | Uso |
|-------------|--------|-----|
| `User` model | `../models/user.model` | Busca usuarios por ID (`findById`) para validar existencia y rol |
| `jsonwebtoken` | npm | Verifica tokens JWT con `process.env.JWT_SECRET` |
| `http-errors` | npm | Crea objetos de error con status code para Express |

## Flujo de autenticación

1. Se lee `req.headers.authorization` y se splittea por espacio; el token es el segundo elemento (`[1]`).
2. Si no hay token → error 401 (excepto en `optionalAuth` que continúa sin error).
3. Se llama a `jwt.verify(token, process.env.JWT_SECRET)` dentro de un `try/catch`.
4. Si la verificación falla → error 401 con el error crudo de `jsonwebtoken` (excepto en `optionalAuth`).
5. Si la verificación es exitosa, se extrae `decoded.sub` como el ID del usuario.
6. Se busca el usuario en MongoDB con `User.findById(decoded.sub)`.
7. Si se encuentra → se asigna `req.user = user` y se llama a `next()`.
8. Si no se encuentra → error 401 `"User not found"` (excepto en `optionalAuth`).

**Nota**: El payload del JWT usa `sub` como campo para el ID del usuario (estándar JWT claim).

## Flujo de autorización (roles)

- **`isAdmin`**: Verifica que `user.role === "admin"`. Los roles válidos según el modelo User son `"admin"` y `"guest"` (default: `"guest"`).
- **`isAuthorized`**: Se usa **después** de `auth` (asume que `req.user` ya existe). Permite paso si `req.user.role === "admin"` **o** si el ID del usuario coincide con `req.params.userId`.

## Gotchas

### BUG CRÍTICO: `isAuthorized` usa asignación en vez de comparación

En la línea 93:
```js
if ((req.user.role === "admin") || (req.user.id = req.params.userId))
```

El segundo término usa `=` (asignación) en vez de `===` (comparación). Esto significa que:
- **Siempre** asigna `req.params.userId` a `req.user.id`
- La expresión siempre evalúa a truthy (a menos que `req.params.userId` sea falsy)
- **Cualquier usuario autenticado puede acceder a recursos de cualquier otro usuario**

Esto anula completamente la protección de esta función. Debería ser `req.user.id === req.params.userId`.

### Duplicación de lógica entre `auth` e `isAdmin`

`isAdmin` repite toda la lógica de `auth` (extracción de token, `jwt.verify`, `User.findById`) en vez de componer `auth()` + verificación de rol. Esto significa que si la lógica de autenticación cambia en un lugar, hay que cambiarla en dos.

### Typo en mensajes de error

Los mensajes dicen `"Missing acces token"` (debería ser `"access token"`). Aparece en `auth` e `isAdmin`.

### No se verifica que el usuario esté activo/baneado

Si un usuario existe en la BD pero debería estar deshabilitado, el middleware no lo detecta. Solo verifica existencia y rol.

### `optionalAuth` silenciosamente ignora errores de BD

Si `User.findById` falla por un error de conexión a MongoDB, `optionalAuth` lo captura y continúa como si no hubiera usuario. Esto puede enmascarar problemas de infraestructura.
