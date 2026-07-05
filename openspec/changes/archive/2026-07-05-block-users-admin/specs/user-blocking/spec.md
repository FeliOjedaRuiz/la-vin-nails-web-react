# user-blocking Specification

## Purpose

Admins can soft-block user accounts via a `blocked` boolean. Blocked users cannot log in. Historical data is preserved. Additive — no existing behavior modified.

## Requirements

| ID | Requirement | RFC |
|----|------------|-----|
| REQ-01 | `blocked` field on User model | MUST |
| REQ-02 | `PATCH /users/:userId/toggle-block` admin endpoint | MUST |
| REQ-03 | Login rejects blocked users (403) | MUST |
| REQ-04 | `GET /users` response includes `blocked` | MUST |
| REQ-05 | `users.toggleBlock(id)` frontend service | MUST |
| REQ-06 | `UserItem` block toggle button + badge | MUST |
| REQ-07 | `UserProfile` block toggle (prop-gated) + badge | MUST |
| REQ-08 | Confirmation modal before every toggle | MUST |
| REQ-09 | Admin self-block prevention (400) | MUST |
| REQ-10 | Error handling preserves UI state | SHOULD |

### REQ-01: blocked Field on User Model

`User` schema MUST include `blocked: { type: Boolean, default: false }`. No migration needed — Mongoose defaults apply.

#### Scenario: New user defaults to unblocked
- GIVEN a user is created without `blocked`
- WHEN saved, THEN `blocked` SHALL be `false`

### REQ-02: Toggle Block Endpoint

`PATCH /api/users/:userId/toggle-block` MUST be chained with `secure.isAdmin` + `usersMid.checkUser`. Controller toggles `blocked`, saves, returns updated user. Self-block check: if `req.user.id === :userId`, return 400.

#### Scenario: Admin toggles a guest
- GIVEN admin auth + target exists + target ≠ admin
- WHEN endpoint is called
- THEN `blocked` flips (false↔true), 200, updated user returned

#### Scenario: Unauthenticated or non-admin
- GIVEN no/missing JWT or guest role
- WHEN endpoint is called, THEN 401

### REQ-03: Login Rejection

After password validation, `users.login` MUST check `user.blocked`. If `true`: 403, `"Tu cuenta ha sido bloqueada. Contactá al administrador."`. No JWT issued.

#### Scenario: Blocked user with valid password
- GIVEN `blocked: true`, correct password
- WHEN `POST /login`, THEN 403 with blocked message

#### Scenario: Blocked user with wrong password
- GIVEN `blocked: true`, wrong password
- WHEN `POST /login`, THEN 401 "Credenciales invalidas" (no existence leak)

#### Scenario: Unblocked user login unchanged
- GIVEN `blocked: false`, valid credentials
- WHEN `POST /login`, THEN 200, JWT returned normally

### REQ-04: User List Includes blocked

`GET /users` (admin) already returns all schema fields via `toJSON` — `blocked` MUST appear in each user object.

### REQ-05: Frontend toggleBlock Service

`users` service MUST export `toggleBlock(userId)` → `PATCH /api/users/${userId}/toggle-block` via axios.

### REQ-06: UserItem Toggle + Badge

`UserItem` MUST show "Bloqueada" badge (`text-pink-600 bg-pink-100`) when `user.blocked`. MUST show toggle button (admin-gated via `AuthContext`): "Bloquear" / "Desbloquear". Button MUST call `e.stopPropagation()` + `e.preventDefault()` to prevent `<Link>` navigation.

#### Scenario: Admin sees blocked user
- GIVEN admin auth + `user.blocked === true`
- THEN badge + "Desbloquear" button render

#### Scenario: Guest sees no controls
- GIVEN non-admin auth
- THEN no toggle button (badge-only if blocked)

### REQ-07: UserProfile Toggle + Badge

`UserProfile` MUST accept optional `onToggleBlock` prop. When provided: badge + toggle button render. When absent (guest views): neither renders — backward compatible.

### REQ-08: Confirmation Modal

Uses existing `<Modal>`. Message varies: block → "¿Estás seguro de que querés bloquear a [nombre]? Esta persona no podrá acceder a la app."; unblock → "¿Estás seguro de que querés desbloquear a [nombre]? Esta persona podrá volver a acceder a la app." Parent manages `modalState`.

#### Scenario: Confirm triggers toggle
- GIVEN modal open
- WHEN admin confirms, THEN `toggleBlock(id)` called, local state updated on success, modal closes

#### Scenario: Cancel dismisses
- GIVEN modal open
- WHEN admin cancels, THEN modal closes, no API call

### REQ-09: Admin Self-Block Prevention

Backend: if `req.user.id === req.params.userId`, return 400. Frontend: display error toast.

### REQ-10: Error Handling

If `toggleBlock` fails (network, 500, 400-self-block): show error message, keep previous `blocked` state.
