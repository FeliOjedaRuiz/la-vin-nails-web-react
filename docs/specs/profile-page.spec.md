# Spec Funcional — Profile Page (Admin)

## Metadata

| Campo | Valor |
|-------|-------|
| **Componente** | `ProfilePage.jsx` |
| **Ruta** | `/users/:id` |
| **Roles** | admin (protegido por `PrivateRoute role="admin"`) |
| **Layout** | `Layout` (header fijo + bottom nav + fondo gradiente) |
| **Última actualización** | 2026-05-28 |

---

## Descripción General

Página de perfil de usuario vista por un **administrador**. Permite consultar la información de cualquier cliente del sistema, ver su galería de fotos de manicura, revisar sus citas futuras pendientes y (en secciones comentadas) acceder a su tarjeta de fidelidad y configuración de cuenta.

La página se accede desde la ruta `/users/:id` donde `:id` es el ObjectId del usuario en MongoDB. Es una página **solo para admin** — el guard `PrivateRoute` bloquea el acceso a cualquier otro rol.

---

## Comportamiento por Rol

### Admin

| Acción | Comportamiento |
|--------|---------------|
| Acceder a `/users/:id` | Ve el perfil completo del usuario con 3 acordeones activos: Galería, Próximas citas, Configuración de cuenta |
| Ver perfil | Muestra avatar, nombre completo, teléfono (con link a WhatsApp) y email |
| Ver galería | Acordeón "Galería" con botón "+" para subir fotos y grid de fotos del usuario |
| Subir foto | Botón "+" abre modal de subida; tras subir exitosamente, la galería se recarga |
| Ver fotos en grande | Click en cualquier foto abre lightbox con navegación izquierda/derecha |
| Eliminar foto | Botón de eliminar visible en thumbnails y en lightbox (confirmación con `window.confirm`) |
| Ver próximas citas | Acordeón "Próximas citas" muestra solo citas con fecha >= hoy |
| Ver detalle de cita | Cada cita muestra fecha, hora, servicio, tipo, detalles, remoción, precio, duración y estado |

### Usuario / Visitante

- **No tienen acceso** — `PrivateRoute role="admin"` redirige si el rol no es admin.
- Los usuarios normales usan `/profile` (`ClientProfilePage`), que es un componente distinto.

---

## Reglas de Negocio

1. **RB-01 — Acceso exclusivo admin**: La ruta `/users/:id` está protegida por `PrivateRoute` con `role="admin"`. Solo administrators pueden ver perfiles de otros usuarios.

2. **RB-02 — Filtrado de citas futuras**: Solo se muestran citas cuya fecha (`turn.date`) es mayor o igual a la fecha actual. Las citas pasadas se excluyen del listado.

3. **RB-03 — Galería en orden inverso**: Las fotos se cargan y se invierten (`reverse()`) para que las más recientes (últimas en la respuesta del API) aparezcan primero en el grid.

4. **RB-04 — Estado de cita "Solicitado"**: Cuando el estado del turno es `"Solicitado"`, se muestra como `"Sin confirmación"` en lugar del valor crudo.

5. **RB-05 — Precio y duración condicionales**: Si `cost` o `duration` están vacíos/falsy, se muestra `"sin confirmar."` en lugar del valor.

6. **RB-06 — Avatar por defecto**: Si el usuario no tiene `avatarUrl`, se usa una imagen por defecto alojada en Cloudinary.

7. **RB-07 — Placeholders de galería**: Cuando hay menos de 3 fotos, se muestran imágenes placeholder con opacidad reducida para mantener la estructura visual del grid.

8. **RB-08 — Secciones comentadas**: La tarjeta de fidelidad (`UserLoyalty`) y la configuración de cuenta (restaurar contraseña, eliminar cuenta) están **comentadas en el JSX** — no son funcionales actualmente.

---

## Componentes Utilizados

| Componente | Ruta | Propósito |
|------------|------|-----------|
| `Layout` | `components/layouts/Layout.jsx` | Envoltorio con header fijo, bottom nav y fondo gradiente |
| `UserProfile` | `components/users/user-profile/UserProfile.jsx` | Muestra avatar, nombre, teléfono (link WhatsApp) y email del usuario |
| `Accordion` / `AccordionHeader` / `AccordionBody` | `components/ui/Accordion.jsx` | Componente custom de acordeón con apertura/cierre controlado externamente |
| `PhotoUpload` | `components/nails-photos/photo-upload/PhotoUpload.jsx` | Modal de subida de fotos (solo visible cuando `visible === true`) |
| `NailPhotoGalery` | `components/nails-photos/nail-photo-galery/NailPhotoGalery.jsx` | Grid de fotos con lightbox, navegación y eliminación (admin-only) |
| `DateDetailAdmin` | `components/dates/date-detail-admin/DateDetailAdmin.jsx` | Tarjeta de detalle de cita con todos los campos del turno |
| `ChevronIcon` | Inline SVG | Icono de flecha para acordeones (rotación 180° al abrir) |

---

## Llamadas a API

| # | Servicio | Método | Endpoint | Parámetros | Cuándo se llama |
|---|----------|--------|----------|------------|-----------------|
| 1 | `userServices.detail()` | GET | `/users/:userId` | `userId` de `useParams` | Al montar el componente (dependencia: `userId`) |
| 2 | `datesService.listByUser()` | GET | `/dates/:userId` | `userId` | Al montar y cada vez que `reload` cambia |
| 3 | `photosService.listByUser()` | GET | `/photos/:userId` | `userId` | Dentro de `NailPhotoGalery` (dependencias: `userId`, `reload`) |
| 4 | `photosService.upload()` | POST | `/upload` | `FormData` con archivo | Al seleccionar archivo en `PhotoUpload` |
| 5 | `photosService.create()` | POST | `/photos` | `{ photoUrl, user }` | Al confirmar subida en `PhotoUpload` |
| 6 | `photosService.deletePhoto()` | DELETE | `/photos/:id` | `photoId` | Al confirmar eliminación en `NailPhotoGalery` o `PhotoItem` |

### Detalle del backend

- **`users.controllers.detail`**: `User.findById(req.params.userId)` — devuelve el documento completo del usuario.
- **`dates.controllers.listByUser`**: `Date.find({ user: userId }).populate('turn').populate('user').populate('service')` — devuelve array de Date con relaciones pobladas.
- **`photos.controllers.listByUser`**: `Photo.find({ user: userId })` — devuelve array de Photo sin ordenar (el frontend hace `reverse()`).
- **`photos.controllers.upload`**: Sube archivo a Cloudinary via multer, devuelve `{ photoUrl }`.
- **`photos.controllers.create`**: Crea documento Photo en MongoDB.
- **`photos.controllers.delete`**: Elimina de Cloudinary (via `cloudinary.uploader.destroy`) y luego de MongoDB.

---

## Estado y Efectos Secundarios

### Estado local del componente

| Variable | Tipo | Valor inicial | Propósito |
|----------|------|---------------|-----------|
| `reload` | boolean | `false` | Trigger para recargar datos de citas y fotos |
| `visible` | boolean | `false` | Controla visibilidad del modal `PhotoUpload` |
| `dates` | array | `[]` | Citas futuras del usuario (filtradas) |
| `user` | object | `{}` | Datos del perfil del usuario |
| `open` | number | `0` | Índice del acordeón abierto (0 = ninguno) |

### Efectos (`useEffect`)

1. **Carga de usuario** (`[userId]`): Llama `userServices.detail(userId)` y setea `user`. Se ejecuta al montar y cuando cambia el `userId` de la URL.

2. **Reload inicial** (`[]`): `setReload(!reload)` — efecto intencionalmente extraño que togglea `reload` una vez al montar. Esto dispara el efecto de carga de citas.

3. **Carga de citas** (`[reload]`): Llama `datesService.listByUser(userId)`, filtra las citas con `turn.date >= actualDate`, y setea `dates`. Se ejecuta al montar (por el reload inicial) y cada vez que `reload` cambia (tras subir una foto).

### Efectos secundarios

- **`console.log` en `changeVisibility`**: Imprime el valor de `visible` **antes** del toggle (stale closure), no el valor nuevo.
- **`console.error` en catches**: Todos los errores de API se loguean a consola pero no se muestran al usuario.

---

## Casos Edge y Gotchas

### GOTCHA-01 — `transformDate` manual en lugar de formateador
El componente implementa su propia función `transformDate` que convierte una fecha a string `YYYY-MM-DD` manualmente. Esto es propenso a errores de timezone porque `new Date()` crea una fecha en hora local pero el string resultante no tiene en cuenta la conversión UTC. Podría dar fechas incorrectas cerca de medianoche.

### GOTCHA-02 — `reload` togglea en lugar de incrementarse
`reload` es un boolean que se togglea (`!reload`). Esto funciona pero es frágil — si dos actualizaciones rápidas ocurren, el valor vuelve al estado anterior y podría no disparar el efecto esperado. Un contador numérico sería más robusto.

### GOTCHA-03 — `visible` stale closure en `console.log`
En `changeVisibility`, el `console.log('visible', visible)` imprime el valor **anterior** de `visible` porque el closure captura el valor del render anterior. No afecta funcionalidad pero confunde en debug.

### GOTCHA-04 — `actualDate` se calcula en cada render
`transformDate(new Date())` se ejecuta en cada render del componente, no está memoizado. En la práctica no causa bugs porque la fecha no cambia durante la vida del componente, pero es ineficiente.

### GOTCHA-05 — `DateDetailAdmin` usa `useEffect` con array vacío para estado
`DateDetailAdmin` tiene un `useEffect(() => ..., [])` que setea el estado basado en `date.turn.state`. Si la prop `date` cambia, el estado interno NO se actualiza porque el efecto solo corre una vez.

### GOTCHA-06 — Secciones comentadas pero importadas
`UserLoyalty` está importado pero su uso está comentado. `DateDetailAdmin` se usa para mostrar citas de cualquier usuario (no solo admin), pero el nombre sugiere uso exclusivo admin.

### GOTCHA-07 — `h-1w-16` typo en UserProfile
En `UserProfile.jsx`, la clase `h-1w-16` es un typo (probablemente quería ser `w-16`). Tailwind la ignora silenciosamente.

### GOTCHA-08 — Sin manejo de loading states
No hay indicadores de carga mientras se fetchean los datos del usuario, las citas o las fotos. El usuario ve estados vacíos (`{}`, `[]`) hasta que las promesas resuelven.

### GOTCHA-09 — Filtro de citas usa comparación de strings
`date.turn.date >= actualDate` compara strings en formato `YYYY-MM-DD`. Funciona correctamente SIEMPRE QUE ambas fechas estén en el mismo formato y timezone, pero es frágil ante datos inconsistentes.

---

## Tests Derivados

| # | Test | Tipo | Descripción |
|---|------|------|-------------|
| T-01 | Carga inicial de usuario | Unit | Al montar con `userId`, se llama `userServices.detail(userId)` y se renderiza `UserProfile` con los datos |
| T-02 | Carga inicial de citas | Unit | Al montar, se llama `datesService.listByUser(userId)` y se filtran citas futuras |
| T-03 | Filtrado de citas pasadas | Unit | Citas con `turn.date < hoy` NO aparecen en el listado |
| T-04 | Acordeones cerrados por defecto | UI | Al cargar, todos los acordeones están cerrados (`open === 0`) |
| T-05 | Apertura de acordeón Galería | UI | Click en "Galería" abre el acordeón (`open === 1`) |
| T-06 | Apertura de acordeón Próximas citas | UI | Click en "Próximas citas" abre el acordeón (`open === 3`) |
| T-07 | Toggle de acordeón | UI | Click en acordeón ya abierto lo cierra |
| T-08 | Sin citas pendientes | UI | Cuando `dates` está vacío, se muestra "No tienes citas pendientes" |
| T-09 | Subida de foto recarga galería | Integration | Tras subir foto exitosamente, `reload` cambia y la galería se refresca |
| T-10 | Modal de subida controlado por visible | UI | `PhotoUpload` solo se renderiza cuando `visible === true` |
| T-11 | `transformDate` formatea correctamente | Unit | `transformDate` produce string `YYYY-MM-DD` con ceros a la izquierda |
| T-12 | Estado "Solicitado" se muestra como "Sin confirmación" | Unit | `DateDetailAdmin` con `state === 'Solicitado'` renderiza "Sin confirmación" |
| T-13 | Avatar por defecto cuando no hay url | Unit | `UserProfile` con `avatarUrl` vacío usa imagen por defecto de Cloudinary |
| T-14 | Placeholders de galería | UI | Con 0-2 fotos, se muestran placeholders con opacidad reducida |
| T-15 | Error en carga de usuario | Error | Si `userServices.detail` falla, se loguea a consola pero no se muestra UI de error |
| T-16 | Error en carga de citas | Error | Si `datesService.listByUser` falla, se loguea a consola pero no se muestra UI de error |

---

## Historial de Cambios

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2026-05-28 | Spec inicial creada desde código existente | SDD |
