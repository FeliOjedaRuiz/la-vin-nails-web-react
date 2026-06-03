# Módulo: PWA & Push Notifications (Frontend)

## Responsabilidad
Gestiona la interacción del frontend con el Service Worker (SW) de la Progressive Web App (PWA) y la API del navegador para Notificaciones Push. Provee un hook centralizado y componentes de interfaz para que los administradores monitoreen el estado y controlen sus suscripciones.

## API pública

| Export | Tipo | Descripción |
|--------|------|-------------|
| `usePwaStatus` | React Hook | Hook principal que encapsula la lógica de SW y Push |
| `PwaStatusCard` | React Component | UI para mostrar el estado del SW y actualizaciones |
| `PushSettingsCard`| React Component | UI para activar/desactivar notificaciones y probarlas |

---

## Hook: `usePwaStatus`

### Estado devuelto
El hook devuelve un objeto con las siguientes propiedades:

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `swStatus` | `'checking' \| 'installed' \| 'active' \| 'unregistered' \| 'error'` | Estado actual del Service Worker |
| `isDevMode` | `boolean` | `true` si no se encontró un SW (típicamente en desarrollo local) |
| `pushPermission` | `'default' \| 'granted' \| 'denied'` | Estado del permiso del navegador para notificaciones |
| `isSubscribed` | `boolean` | `true` si el usuario tiene una suscripción Push activa |
| `testResult` | `object \| null` | Resultado del último envío de notificación de prueba (con `type` y `message`) |

### Métodos expuestos
| Método | Descripción |
|--------|-------------|
| `checkForUpdate()` | Obliga al Service Worker a buscar una nueva versión en el servidor. |
| `togglePush()` | Activa o desactiva la suscripción a notificaciones Push. Pide permisos si es necesario. |
| `sendTestNotification()` | Llama a la API (`POST /push/test`) para enviar una notificación de prueba. |

### Comportamiento y Efectos
1. **Detección de Desarrollo**: Al montar, intenta obtener el registro del SW mediante `navigator.serviceWorker.getRegistration()`. Si devuelve `undefined`, asume que está en modo de desarrollo (`isDevMode = true`) para evitar que la UI se quede colgada esperando un SW inexistente.
2. **Carga Inicial**: Verifica el permiso actual de notificaciones (`Notification.permission`) y revisa si ya existe una suscripción activa (`pushManager.getSubscription()`).
3. **Toggle de Push**:
   - Al **activar**: Pide permisos al usuario. Si los otorga, obtiene la VAPID key del backend (`GET /push/public-key`), se suscribe usando el `PushManager` del navegador y envía la suscripción al backend (`POST /push/subscribe`).
   - Al **desactivar**: Obtiene la suscripción actual, extrae el `endpoint`, la elimina localmente con `unsubscribe()` y avisa al backend (`DELETE /push/unsubscribe`) para que borre el registro en la BD.
4. **Notificación de prueba**: Invoca a `POST /push/test` y actualiza el estado `testResult` (éxito o error) que se limpia automáticamente tras 3 segundos.

---

## Componentes UI

### `PwaStatusCard`
Muestra visualmente el estado del Service Worker (`swStatus`).
- **Estados visuales**:
  - `active` / `installed`: Badge verde ("Activo" / "Instalado").
  - `error`: Badge rojo.
  - `checking`: Spinner de carga.
  - `unregistered`: Badge gris oscuro.
- **Modo Desarrollo**: Si `isDevMode` es true, muestra un banner amarillo advirtiendo que las funciones de PWA no están disponibles en desarrollo. Deshabilita el botón de "Buscar actualizaciones".
- **Interacción**: Botón "Buscar actualizaciones" invoca `checkForUpdate()`.

### `PushSettingsCard`
Permite administrar las notificaciones.
- **Estados visuales**:
  - Badge de permiso del navegador (verde si concedido, rojo si denegado, amarillo si pendiente).
  - Toggle switch (estilo iOS) que refleja `isSubscribed`.
- **Interacción**:
  - El toggle invoca `togglePush()`. Si se está en modo desarrollo, el toggle aparece deshabilitado.
  - El botón "Notificación de prueba" invoca `sendTestNotification()`. También se deshabilita en modo desarrollo o si no hay suscripción activa.
  - Muestra un mensaje temporal de feedback cuando se prueba la notificación (usando `testResult`).

---

## Casos Edge y Gotchas

1. **`navigator.serviceWorker.ready` vs `getRegistration()`**: El hook utiliza `getRegistration()` en lugar de `.ready` para la inicialización porque `.ready` devuelve una promesa que **nunca se resuelve** si no hay un Service Worker registrado (lo que sucede en local / development). Usar `getRegistration()` permite detectar este caso y habilitar el flag `isDevMode`.
2. **Permisos denegados**: Si el usuario bloquea las notificaciones a nivel navegador (`denied`), el toggle seguirá deshabilitado y se requiere acción manual del usuario en la configuración del navegador para revertirlo.
3. **Re-suscripción optimizada (Tier 1)**: El hook heredado `usePushNotifications.js` sigue activando notificaciones on-load para admins. Este fue modificado para usar la función `isSameVapidKey`, evitando re-suscribir (y sobrecargar la BD) en cada carga si la VAPID key pública no ha cambiado.
