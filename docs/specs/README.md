# Specs Funcionales — La Vin Nails

Este directorio contiene las especificaciones funcionales de las páginas, features y modelos de la aplicación.

Cada spec describe **qué hace** un componente, **para quién**, bajo **qué reglas de negocio**, y qué **casos edge** hay que tener en cuenta. Son la fuente de verdad para escribir tests y para que nada se pierda cuando se toca código existente.

> Este proyecto fue construido durante años sin asistentes de IA y sin tests formales. Las specs aquí documentadas preservan el conocimiento que hasta ahora solo vivía en el código y en la memoria de quien lo construyó.

---

## Cómo usar estas specs

- **Antes de tocar una página**: lee su spec primero para entender el comportamiento esperado
- **Al terminar una feature**: actualiza la spec si el comportamiento cambió
- **Para escribir tests**: los "Tests Derivados" de cada spec son el punto de partida
- **Para generar una nueva spec**: usa el workflow `/documentar`

---

## Índice de Specs

### Páginas

| Página / Feature | Ruta | Roles | Última actualización |
|-----------------|------|-------|----------------------|
| [Agenda de Turnos — Vista Pública](./schedule-page-guest.spec.md) | `/schedule` | visitante, usuario | 2026-05-01 |
| [Agenda de Turnos — Vista Administrador](./schedule-page-admin.spec.md) | `/admin-schedule` | admin | 2026-05-04 |
| [Detalle y Actualización de Turno](./turn-detail-page.spec.md) | `/turns/:id` | admin | 2026-05-04 |
| [Catálogo de Servicios](./services-page.spec.md) | `/services` | visitante, usuario, admin | 2026-05-28 |
| [Reserva de Turno](./new-date-page.spec.md) | `/new-date/:id` | visitante, usuario | 2026-05-28 |
| [Reserva de Turno — Admin](./new-date-admin-page.spec.md) | `/admin/new-date/:id` | admin | 2026-05-28 |
| [Login Page](./login-page.spec.md) | `/login` | visitante | 2026-05-28 |
| [Client Profile Page](./client-profile-page.spec.md) | `/profile` | guest, admin | 2026-05-28 |
| [Profile Page (Admin)](./profile-page.spec.md) | `/users/:id` | admin | 2026-05-28 |
| [Register Page](./register-page.spec.md) | `/register` | visitante | 2026-05-28 |
| [Home Page](./home-page.spec.md) | `/` | visitante, usuario, admin | 2026-05-28 |
| [Admin Page (Dashboard)](./admin-page.spec.md) | `/admin` | admin | 2026-05-28 |
| [Accounting Page](./accounting-page.spec.md) | `/accounting` | admin | 2026-05-28 |
| [Restore Password Page](./restore-password-page.spec.md) | `/restore-password/:userId` | usuario | 2026-05-28 |
| [Send Restore Email Page](./send-restore-email-page.spec.md) | `/send-restore-email` | visitante | 2026-05-28 |
| [Error Page](./error-page.spec.md) | `/error` | todos | 2026-05-28 |

### Controllers

| Controller | Ruta | Última actualización |
|------------|------|----------------------|
| [Controller: Users](./controllers/users.controller.spec.md) | `api/controllers/` | 2026-05-28 |
| [Controller: Dates](./controllers/dates.controller.spec.md) | `api/controllers/` | 2026-05-28 |
| [Controller: Turns](./controllers/turns.controller.spec.md) | `api/controllers/` | 2026-05-28 |
| [Controller: Push Notifications](./controllers/push.controller.spec.md) | `api/controllers/` | 2026-05-28 |
| [Controller: Services](./controllers/services.controller.spec.md) | `api/controllers/` | 2026-05-28 |
| [Controller: Photos](./controllers/photos.controller.spec.md) | `api/controllers/` | 2026-05-28 |
| [Controller: Expenses](./controllers/expenses.controller.spec.md) | `api/controllers/` | 2026-05-28 |

### Middlewares

| Middleware | Ruta | Última actualización |
|------------|------|----------------------|
| [Middleware: Secure (Auth + Roles)](./middlewares/secure.mid.spec.md) | `api/middlewares/` | 2026-05-28 |

### Modelos

| Modelo | Ruta | Roles | Última actualización |
|--------|------|-------|----------------------|
| [Modelo: User](./models/user.model.spec.md) | `api/models/` | todos | 2026-05-28 |
| [Modelo: Date](./models/date.model.spec.md) | `api/models/` | todos | 2026-05-28 |
| [Modelo: Turn](./models/turn.model.spec.md) | `api/models/` | todos | 2026-05-28 |
| [Modelo: Service](./models/service.model.spec.md) | `api/models/` | todos | 2026-05-28 |
| [Modelo: Photo](./models/photo.model.spec.md) | `api/models/` | todos | 2026-05-28 |
| [Modelo: PushSubscription](./models/push-subscription.model.spec.md) | `api/models/` | todos | 2026-05-28 |
| [Modelo: Expense](./models/expense.model.spec.md) | `api/models/` | todos | 2026-05-28 |

### Infraestructura Frontend

| Módulo | Ruta | Última actualización |
|--------|------|----------------------|
| [AuthStore (Contexto de Auth)](./infra/auth-store.spec.md) | `web/src/contexts/` | 2026-05-28 |
| [Base API (Axios config)](./infra/base-api.spec.md) | `web/src/services/` | 2026-05-28 |

---

## Convención de Nombres

Los archivos siguen el patrón `[nombre-en-kebab-case].spec.md`, alineado con el nombre del componente principal:

| Componente | Archivo spec |
|------------|-------------|
| `SchedulePageGuest.jsx` | `schedule-page-guest.spec.md` |
| `SchedulePageAdmin.jsx` | `schedule-page-admin.spec.md` |
| `NewDatePage.jsx` | `new-date-page.spec.md` |
| `NewDateAdminPage.jsx` | `new-date-admin-page.spec.md` |
