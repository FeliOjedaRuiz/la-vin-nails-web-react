# Tasks: Block Users Admin

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~190 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Backend model + toggle endpoint + login guard + frontend UI + manual verification + automated tests | Single PR | ~190 lines total; well under 400-line review budget |

## Phase 1: Backend Foundation

- [ ] 1.1 Add `blocked: { type: Boolean, default: false }` to User schema (`api/models/user.model.js`)
- [ ] 1.2 Add `toggleBlock` controller (`api/controllers/users.controllers.js`) — flip `req.clientUser.blocked`, self-block guard (400 if `req.user.id === req.clientUser.id`), save, return updated user via `res.json(user)`
- [ ] 1.3 Add blocked-user guard in `login` controller — after password validation: `user.blocked` → `createError(403, { errors: { password: 'Tu cuenta ha sido bloqueada. Contactá al administrador.' } })`. Wrong-password path stays 401 (no existence leak)
- [ ] 1.4 Add `PATCH /users/:userId/toggle-block` route chained with `secure.isAdmin` + `usersMid.clientExists` (`api/config/routes.config.js`)
- [ ] 1.5 Manual verify: toggle endpoint via curl/Postman — confirm 200 toggle, 403 login rejection for blocked user, 400 self-block prevention

## Phase 2: Frontend Service Layer

- [ ] 2.1 Add `toggleBlock(userId)` → `PATCH /api/users/${userId}/toggle-block` to `web/src/services/users.js`. Export via `usersApi` object

## Phase 3: Frontend UI — UserItem (Client List)

- [ ] 3.1 Add badge (`text-pink-600 bg-pink-100 text-xs font-semibold px-2 py-0.5 rounded`, label "Bloqueada"), block/unblock button, and confirmation `<Modal>` to `web/src/components/users/user-item/UserItem.jsx`. Admin-gated via `useContext(AuthContext)`. Button calls `e.stopPropagation()` + `e.preventDefault()` inside the `<Link>` wrapper. Managed via local `modalState`/`onToggleBlock` prop
- [ ] 3.2 Forward `onToggleBlock` through `UsersList` (`web/src/components/users/users-list/UsersList.jsx`) → `UsersSearchComponent` (`web/src/components/users/users-search-component/UsersSearchComponent.jsx`) — handler calls `toggleBlock(id)`, refetches list on success
- [ ] 3.3 Manual verify: block user from list → badge appears → modal text varies (block vs unblock) → unblock → badge disappears

## Phase 4: Frontend UI — UserProfile (Admin Profile View)

- [ ] 4.1 Add `onToggleBlock` optional prop to `web/src/components/users/user-profile/UserProfile.jsx`. When provided: badge + button + modal render. When absent: no controls render (backward-compatible with guest `ClientProfilePage`)
- [ ] 4.2 Pass `onToggleBlock` handler from `web/src/pages/ProfilePage.jsx` — calls `usersService.toggleBlock(id)`, refetches user state on success
- [ ] 4.3 Manual verify: block from profile → badge on profile → navigate to list → badge consistent. Unblock → badge clears

## Phase 5: Automated Testing

- [ ] 5.1 API unit: `toggleBlock` — normal toggle (200), self-block (400), missing user (404). Jest + mongodb-memory-server
- [ ] 5.2 API unit: `login` — blocked+correct password (403 with blocked message), blocked+wrong password (401 "Credenciales invalidas"), unblocked+correct (200 + JWT). Jest + mongodb-memory-server
- [ ] 5.3 FE unit: `UserItem` renders badge when `user.blocked`, no badge when `!blocked`, button visible for admin only. RTL + mocked `AuthContext`
- [ ] 5.4 Integration: Supertest — full flow: admin blocks user → user login returns 403 → admin unblocks → user login returns 200. Run with `cd api && npm test && cd ../web && CI=true npm test`
