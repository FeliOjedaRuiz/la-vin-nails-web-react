# Admin Page (Dashboard Admin)

## Metadata
- **Ruta en la app**: `/admin`
- **Componente principal**: `AdminPage.jsx`
- **Archivos relacionados**: `UsersSearchComponent.jsx`, `UsersList.jsx`, `UsersSearchBar.jsx`, `AuthStore.js`
- **Última actualización**: 2026-05-28
- **Roles que interactúan**: admin

---

## Descripción General
Página de inicio del panel de administración. Muestra un buscador de usuarios para filtrar por nombre y una lista de usuarios del sistema. Incluye un botón de cerrar sesión, un mensaje personalizado y los paneles de administración y configuración de la PWA y notificaciones Push.

---

## Comportamiento por Rol

### 🛡️ Administrador
- Ve un botón de "Cerrar sesión" que ejecuta `logout()` del AuthContext
- Ve un panel de estado de la PWA (`PwaStatusCard`) con el estado del Service Worker.
- Ve un panel de configuración de notificaciones Push (`PushSettingsCard`) con un toggle para habilitarlas y un botón para enviar pruebas.
- Ve un buscador de usuarios que filtra por nombre (case-insensitive)
- Ve la lista completa de usuarios cargada al montar el componente
- Puede hacer clic en un usuario para ver su perfil de cliente (redirige a `/clients/:id`)

### 👤 Visitante / 🔑 Usuario
- No tienen acceso a esta página (protegida por guard de admin)

---

## Reglas de Negocio

1. **RB-01 — Solo admin**: Accesible exclusivamente para administradores.
2. **RB-02 — Búsqueda por nombre**: El filtro de usuarios es case-insensitive y busca por coincidencia parcial en el campo `name`.
3. **RB-03 — Carga inicial**: Al montar, se cargan TODOS los usuarios de la base de datos sin paginación.
4. **RB-04 — Logout**: El botón de cerrar sesión está visible directamente en la página (no solo en la navegación).
5. **RB-05 — Sin funcionalidad semanal/mensual**: A diferencia de AccountingPage, esta página es solo un dashboard de búsqueda de usuarios.
6. **RB-06 — Gestión de PWA/Push**: El administrador puede ver el estado de la PWA, solicitar actualizaciones del Service Worker, suscribirse/desuscribirse de notificaciones y enviar notificaciones de prueba directamente desde este dashboard.

---

## Componentes Utilizados
| Componente | Responsabilidad en esta vista |
|------------|-------------------------------|
| `Layout` | Wrapper con navegación y guard de admin |
| `UsersSearchComponent` | Contenedor de búsqueda + lista de usuarios |
| `PwaStatusCard` | Muestra el estado del Service Worker y notifica si la app está en modo desarrollo |
| `PushSettingsCard` | Toggle tipo iOS para suscripción a push y botón de notificación de prueba |
| `UsersSearchBar` | Input de búsqueda con estado controlado |
| `UsersList` | Lista renderizada de usuarios filtrados |

---

## Llamadas a API
| Endpoint | Método | Cuándo se llama | Qué retorna |
|----------|--------|-----------------|-------------|
| `/users` | GET | Al montar UsersSearchComponent | Lista completa de usuarios |
| `/push/unsubscribe` | DELETE | Al desactivar el toggle en `PushSettingsCard` | 204 No Content |
| `/push/test` | POST | Al pulsar el botón "Notificación de prueba" en `PushSettingsCard` | 200 OK con mensaje de éxito |

---

## Estado y Efectos Secundarios
- **`usePwaStatus` hook**: La página consume este hook para manejar el estado completo de la PWA (suscripciones, modos, errores).
- **`users`**: Lista completa de usuarios cargada de la API. No cambia después de la carga inicial.
- **`search`**: Texto del buscador. Se actualiza con cada cambio en el input.
- **`usersToShow`**: Derivado — `users.filter(u => u.name.includes(search))`. Se recalcula en cada render.
- **Efecto de carga**: Se ejecuta una sola vez al montar (`[]` deps). Carga todos los usuarios.

---

## Casos Edge y Gotchas
- **Sin paginación**: `GET /users` devuelve TODOS los usuarios. Si la base crece, esto impacta rendimiento.
- **Filtrado en cliente**: La búsqueda se hace con `.filter()` en el array completo, no en el servidor.
- **Sin loading state**: Mientras carga la API, el usuario ve una lista vacía sin spinner.
- **Errores silenciosos**: El `.catch()` solo hace `console.error`. No hay feedback visual si falla la carga.
- **Botón logout duplicado**: Ya existe un logout en la navegación del Layout. Este botón es redundante pero accesible.
- **`for` en vez de `htmlFor`**: El label del search bar usa `for` en lugar de `htmlFor` (warning de React).
- **Mensaje personalizado**: Los mensajes "¡TE AMAMOS MUCHO!" y "Dino y Feli" son hardcoded en la página.

---

## Tests Derivados (Checklist)

### Administrador
- [ ] Dado que soy admin, cuando entro a /admin, veo el buscador de usuarios
- [ ] Dado que soy admin, cuando escribo en el buscador, la lista se filtra por nombre
- [ ] Dado que soy admin, cuando hago clic en "Cerrar sesión", se ejecuta logout
- [ ] Dado que soy admin, cuando la búsqueda está vacía, veo todos los usuarios

### Reglas de negocio
- [ ] **RB-02**: Verificar que la búsqueda es case-insensitive ("ANA" encuentra "Ana")
- [ ] **RB-02**: Verificar que la búsqueda es por coincidencia parcial ("mar" encuentra "María")

### Casos edge
- [ ] **Sin loading**: Verificar que no hay spinner mientras carga la lista
- [ ] **Error silencioso**: Verificar que si la API falla, no hay feedback visual

---

## Historial de Cambios Relevantes
| Fecha | Cambio | Razón |
|-------|--------|-------|
| 2026-05-28 | Spec inicial creada | Documentación del comportamiento existente |
