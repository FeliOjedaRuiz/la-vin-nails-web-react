# Design: Block Users Admin

## Technical Approach

Add a `blocked: Boolean` field to the User model, a `PATCH /users/:userId/toggle-block` admin endpoint, a login rejection guard, and toggle UI in two access points (`UserItem` list card + `UserProfile` detail card) with confirmation modals. Fully additive — no existing behavior modified.

## Architecture Decisions

| # | Decision | Option A | Option B | Choice | Rationale |
|---|----------|----------|----------|--------|-----------|
| 1 | Middleware for loading target user | `usersMid.checkUser` (sets `req.user`) | `usersMid.clientExists` (sets `req.clientUser`) | **B — `clientExists`** | `secure.isAdmin` already sets `req.user` = admin. `checkUser` would overwrite it, losing the admin identity needed for self-block prevention. `clientExists` stores the target as `req.clientUser`, matching the existing `PATCH /users/:userId` route pattern. |
| 2 | Self-block check location | In middleware (separate check before controller) | In controller (checks `req.user.id !== req.clientUser.id`) | **B — Controller** | Simpler. Keeps middleware generic. Self-block rejection is business logic, not a resource-existence concern. Uses `http-errors` `createError(400, ...)`, consistent with project pattern. |
| 3 | Modal state ownership | `UsersSearchComponent` (parent — one modal state per user, complex) | `UserItem` and `UserProfile` (each manages its own modal state) | **B — Component-local** | Matches the existing `TurnDetailAndUpdate` pattern where the modal lives in the same component as the trigger button. Simpler per-component setup. Parent passes `onToggleBlock` callback for state sync after API success. |
| 4 | Badge color | Red/error palette (`red-600`, `red-100`) per DESIGN.md error tokens | Pink palette (`pink-600`, `pink-100`) as status indicator | **B — Pink** | The badge is a status indicator, not an error/destructive action. Pink is the brand color, visible without being alarmist. Red is reserved for error messages and destructive-action confirmations (e.g., delete-turn button uses `bg-red-700`). |
| 5 | Button inside `<Link>` card | Separate `<div>` outside the `<Link>` | Inside the `<Link>` with `e.stopPropagation()` + `e.preventDefault()` | **B — Inside `<Link>`** | Keeps the card layout intact. The button stays within the card's visual boundary. Both event methods are called to prevent navigation. Modal renders at `z-20` (fixed overlay) so it's unaffected by the `<Link>` wrapper. |

## Data Flow

```
User clicks "Bloquear" button
  │
  ├── e.stopPropagation() + e.preventDefault()
  │     (prevents <Link> navigation)
  │
  ├── setModalState(true)
  │     Modal renders over the card/layout
  │
  ├── Admin clicks "Confirmar" → setModalState(false)
  ├── Admin clicks "Cancelar" → setModalState(false) only
  │
  └── Confirm → usersService.toggleBlock(userId)
                  │
                  ├── PATCH /api/users/:userId/toggle-block
                  │     ├── secure.isAdmin → sets req.user = admin
                  │     ├── usersMid.clientExists → sets req.clientUser = target
                  │     └── controller: req.user.id === req.clientUser.id? → 400
                  │                   req.clientUser.blocked = !req.clientUser.blocked
                  │                   req.clientUser.save() → 200 { user }
                  │
                  ├── Success → onToggleBlock(userId) re-fetches list
                  │             OR optimistically flips local state
                  │
                  └── Error → toast/alert, keep previous state, modal closes
```

**State sync**: `UsersSearchComponent` re-fetches `users.list()` on toggle (or optimistically flips the local user entry). `ProfilePage` refetches `users.detail(userId)` on mount — no sync needed since navigation reloads the page component.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `api/models/user.model.js` | Modify | Add `blocked: { type: Boolean, default: false }` to schema |
| `api/controllers/users.controllers.js` | Modify | Add `toggleBlock` controller + blocked check in `login` |
| `api/config/routes.config.js` | Modify | Add `PATCH /users/:userId/toggle-block` route |
| `web/src/services/users.js` | Modify | Add `toggleBlock(userId)` method |
| `web/src/components/users/user-item/UserItem.jsx` | Modify | Add block button + modal + badge (admin-gated via `AuthContext`) |
| `web/src/components/users/user-profile/UserProfile.jsx` | Modify | Add optional `onToggleBlock` prop: badge + button + modal |
| `web/src/components/users/users-list/UsersList.jsx` | Modify | Forward `onToggleBlock` prop to each `UserItem` |
| `web/src/components/users/users-search-component/UsersSearchComponent.jsx` | Modify | Pass `onToggleBlock` handler, manage user list state update |
| `web/src/pages/ProfilePage.jsx` | Modify | Pass `onToggleBlock` to `UserProfile` |

## API Contract

### PATCH /api/users/:userId/toggle-block

```
Headers: Authorization: Bearer <admin-jwt>
Response 200: { user: { id, name, surname, email, phone, avatarUrl, role, loyalty, blocked, ... } }
Response 400: { error: "No podés bloquear tu propia cuenta" }
Response 401: { error: "Missing acces token" }  — from secure.isAdmin
Response 403: { error: "Unauthorized" }          — non-admin from secure.isAdmin
Response 404: { error: "User not found" }         — from usersMid.clientExists
```

### POST /api/auth/login (modified)

When `user.blocked === true` after successful password check:
```
Response 403: { errors: { password: "Tu cuenta ha sido bloqueada. Contactá al administrador." } }
```

This replaces the existing `401` "Credenciales invalidas" when the user is blocked and password is correct. When blocked + wrong password: `401` "Credenciales invalidas" (no existence leak).

## Component Design

### UserItem

- **Badge**: `text-pink-600 bg-pink-100 text-xs font-semibold px-2 py-0.5 rounded` — renders when `user.blocked`. Positioned at the top-right of the card via `absolute top-2 right-2`.
- **Button**: "Bloquear" / "Desbloquear" text button (or icon-only for mobile). Admin-gated via `useContext(AuthContext)`. Uses `e.stopPropagation()` + `e.preventDefault()` inside the `<Link>`.
- **Modal**: Uses existing `<Modal modalState={modalState}>`. Title + contextual message + Cancelar/Confirmar buttons. Example messages:
  - Block: "¿Estás segura de que querés bloquear a [nombre]? No podrá acceder a la app."
  - Unblock: "¿Estás segura de que querés desbloquear a [nombre]? Podrá volver a acceder a la app."

### UserProfile

- Accepts `onToggleBlock(userId)` as optional prop. When absent (`ClientProfilePage`), no controls render.
- When present: badge + button + modal (same modal pattern as UserItem).
- `ProfilePage` creates `handleToggleBlock(userId)` that calls `usersService.toggleBlock(userId)` and refetches `user` state on success.

## Styling Decisions

- **Badge**: `text-pink-600 bg-pink-100` per DESIGN.md pink palette — visible status indicator, not alarmist.
- **Badge label**: "Bloqueada" with `text-xs font-semibold`, rounded pill shape.
- **Button**: Small, minimal — text or icon. Consistent placement: bottom-left of UserItem card, below contact info in UserProfile.
- **Modal**: Inherits existing `Modal` gradient style (`from-pink-50 to-emerald-50`). Follows project pattern — no changes to Modal component.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (API) | User model `blocked` default | Model test: create user without `blocked`, assert `false` |
| Unit (API) | `toggleBlock` controller — normal toggle, self-block rejection, 404 | Jest + mongodb-memory-server |
| Unit (API) | Login rejection when `blocked: true` with correct password | Jest + mongodb-memory-server |
| Unit (API) | Login rejection when `blocked: true` with wrong password (no leak) | Jest + mongodb-memory-server |
| Unit (FE) | `UserItem` renders badge when `blocked`, no badge when `!blocked` | React Testing Library |
| Unit (FE) | `UserItem` renders button for admin, not for guest | RTL + mocked `AuthContext` |
| Integration | Full flow: admin toggles → user login rejected → admin unblocks → user login succeeds | Supertest (API) |

## Migration

No migration required. The `blocked` field has `default: false` — Mongoose applies the default to all existing documents on next read/write. No database migration script needed.

## Open Questions

- [ ] Should the `GET /users` endpoint exclude blocked users from non-admin queries? (Out of scope for this change — blocked users remain visible in admin panel via existing `role: "admin"` gate.)
