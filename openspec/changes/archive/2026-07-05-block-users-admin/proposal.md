# Proposal: Block Users Admin

## Intent

Admins need to revoke user access without destroying historical data. Hard-deleting users orphans ObjectId references across `Date.user`, `Photo.user`, and `PushSubscription`—breaking the UI for past appointments and gallery. A **soft block** via a `blocked` boolean preserves all history (dates, photos, accounting) while preventing login and future bookings. This replaces the original "delete users" scope.

## Scope

### In Scope

- **User model**: add `blocked: { type: Boolean, default: false }` to `user.model.js`
- **Backend endpoint**: `PATCH /users/:userId/toggle-block` toggles `blocked` (admin-only via `secure.isAdmin`)
- **Login guard**: `users.login` rejects blocked users with 403 "Tu cuenta ha sido bloqueada. Contacta con la administración."
- **Self-block prevention**: backend returns 400 if admin targets their own user ID
- **Frontend service**: `users.toggleBlock(userId)` calling the new endpoint
- **`UserItem` component**: block/unblock button + `<Modal>` confirmation + "Bloqueada" badge (admin-gated via `AuthContext`)
- **`UserProfile` component**: block/unblock button via `onToggleBlock` prop + `<Modal>` confirmation + badge
- **Blocked badge**: red indicator using DESIGN.md error tokens (`text-pink-600`, `bg-pink-100`)

### Out of Scope

- Hard deletion, soft delete with `deletedAt`, cascade deletes, or nullification
- Email notification to blocked users
- Bulk block/unblock operations
- Blocked-user list filtering (client-side search already works)

## Capabilities

### New Capabilities

- **`user-blocking`**: Admin ability to toggle a `blocked` boolean on users, preventing login while preserving all related data. Includes backend toggle endpoint, login rejection, self-block guard, frontend toggle UI in two access points with confirmation modal, and blocked status badge.

### Modified Capabilities

- None — all existing capabilities are unchanged. This is purely additive.

## Approach

1. **Schema (`api/models/user.model.js`)**: Add `blocked: Boolean` field (default `false`). No migration needed—Mongoose defaults apply to existing docs.
2. **Backend controller**: `users.toggleBlock` reads user via middleware-set `req.user`, prevents self-block, flips `blocked`, saves, returns updated user. Login controller: after password check, if `user.blocked` return `createError(403, ...)`.
3. **Route (`api/config/routes.config.js`)**: `PATCH /users/:userId/toggle-block` chained with `secure.isAdmin` and `usersMid.checkUser`.
4. **Frontend service (`web/src/services/users.js`)**: `toggleBlock(userId)` uses existing axios interceptor.
5. **UI — `UserItem`**: Button inside `<Link>` card requires `e.stopPropagation()` + `e.preventDefault()`. Admin-gated via `useContext(AuthContext)`. Badge shows "Bloqueada" when `user.blocked`.
6. **UI — `UserProfile`**: New `onToggleBlock` prop. Admin `ProfilePage` passes handler; guest `ClientProfilePage` omits it (backward compatible).
7. **Modal**: Follows existing pattern from `TurnDetailAndUpdate`—parent manages `modalState`, passes Cancel/Accept buttons as children to `<Modal>`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `api/models/user.model.js` | Modified | Add `blocked` field |
| `api/controllers/users.controllers.js` | Modified | Add `toggleBlock`; guard login |
| `api/config/routes.config.js` | Modified | Add `PATCH /users/:userId/toggle-block` |
| `web/src/services/users.js` | Modified | Add `toggleBlock(userId)` |
| `web/src/components/users/user-item/UserItem.jsx` | Modified | Block btn, modal, badge |
| `web/src/components/users/user-profile/UserProfile.jsx` | Modified | Block btn (prop-gated), modal, badge |
| `web/src/components/users/UsersSearchComponent.jsx` | Modified | Pass toggle callback, handle state |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Login error message leaks user existence info | Low | Generic "cuenta bloqueada" — no user existence confirmation |
| UserItem `<Link>` navigation conflict | Low | `e.stopPropagation()` + `e.preventDefault()` on button click |
| Frontend state drift between list and profile views | Low | Profile refetches on mount; list updates local state optimistically |
| Admin accidentally blocking themselves via direct API | None | Backend returns 400 before any mutation |

## Rollback Plan

Revert the commit. The `blocked` field is additive—removing route and UI restores previous behavior. Existing users remain `blocked: false` via Mongoose default. No data migration to reverse.

## Dependencies

None external. Reuses existing `Modal`, `AuthContext`, `secure.isAdmin`, `usersMid.checkUser`. No new npm packages.

## Success Criteria

- [ ] Admin blocks a user from clients list → user cannot log in (403)
- [ ] Admin unblocks the same user → login works again
- [ ] Admin blocks/unblocks from client profile → toggles state correctly
- [ ] Admin cannot block themselves (400 error)
- [ ] Confirmation modal appears before every block/unblock action with correct contextual text
- [ ] Blocked badge ("Bloqueada") visible in both `UserItem` and `UserProfile` when `user.blocked === true`
- [ ] All existing tests pass (no regressions)
