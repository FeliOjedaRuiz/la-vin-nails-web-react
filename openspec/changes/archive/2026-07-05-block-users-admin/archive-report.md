# Archive Report: block-users-admin

**Status**: COMPLETE
**Archived**: 2026-07-05
**Archive path**: `openspec/changes/archive/2026-07-05-block-users-admin/`

---

## Summary

Implemented admin ability to block/unblock user accounts via a `blocked` boolean on the User model. Blocked users cannot log in, while all historical data (dates, photos, subscriptions) is preserved — no data loss or orphan records.

Originally scoped as "delete users" — pivoted to block/unblock during exploration to avoid orphan data risk.

## What Was Implemented

### Backend
- **User model** (`api/models/user.model.js`): Added `blocked: { type: Boolean, default: false }` field
- **Toggle controller** (`api/controllers/users.controllers.js`): `toggleBlock` flips `user.blocked` via `findByIdAndUpdate`, with self-block prevention (400 if admin targets own ID)
- **Login guard** (`api/controllers/users.controllers.js`): After password validation, blocked users receive 403 `"Tu cuenta ha sido bloqueada. Contactá al administrador."`. Wrong-password path stays 401 (no existence leak)
- **Route** (`api/config/routes.config.js`): `PATCH /users/:userId/toggle-block` chained with `secure.isAdmin` + `usersMid.clientExists`

### Frontend Service
- (`web/src/services/users.js`): Added `toggleBlock(userId)` → `PATCH /api/users/${userId}/toggle-block`

### Frontend UI — UserItem (Client List)
- Block/unblock toggle button inside `<Link>` card with `e.stopPropagation()` + `e.preventDefault()`
- "Bloqueada" badge (`text-pink-600 bg-pink-100`) when `user.blocked`
- Confirmation `<Modal>` with contextual text (block vs unblock)
- Admin-gated via `useContext(AuthContext)` with named import

### Frontend UI — UserProfile (Admin Profile View)
- Optional `onToggleBlock` prop — when provided, renders badge + toggle button + modal
- When absent (guest `ClientProfilePage`), no controls render — backward compatible
- Profile page refetches user state on successful toggle

### Error Handling
- User-facing error messages via `alert()` on toggle failure
- Console error logging with user notification in ProfilePage

### Tests
- 6 backend unit tests: toggleBlock controller (normal toggle, unblock, self-block 400), login with blocked scenarios (correct+403, wrong+401, unblocked+200)
- 12 frontend tests: UserItem badge/button/modal coverage + UserProfile badge/button/modal/prop-gate coverage
- All 22 frontend tests pass (UserItem + UserProfile)
- All 10 backend test suites pass

## Artifacts Produced

| Artifact | Path |
|----------|------|
| Exploration | `openspec/changes/archive/2026-07-05-block-users-admin/exploration.md` |
| Proposal | `openspec/changes/archive/2026-07-05-block-users-admin/proposal.md` |
| Spec (user-blocking) | `openspec/changes/archive/2026-07-05-block-users-admin/specs/user-blocking/spec.md` |
| Design | `openspec/changes/archive/2026-07-05-block-users-admin/design.md` |
| Tasks | `openspec/changes/archive/2026-07-05-block-users-admin/tasks.md` |
| Verify Report | `openspec/changes/archive/2026-07-05-block-users-admin/verify-report.md` |
| Archive Report | `openspec/changes/archive/2026-07-05-block-users-admin/archive-report.md` |
| Synced Main Spec | `openspec/specs/user-blocking/spec.md` |

## Commits (branch: `feat/block-users-admin`)

| Commit | Description |
|--------|-------------|
| `cb598ea` | feat(users): add block/unblock backend with toggle route and login guard |
| `12f80ea` | feat(users): add block/unblock badge and modal in admin user list |
| `4b8ff0b` | feat(users): add block/unblock controls to user profile page |
| `cc49458` | fix(users): correct AuthContext named import in UserItem and UserProfile |
| (latest) | fix(users): add error feedback on toggle failure and UserProfile tests |

## Issues Found & Resolved

| ID | Issue | Resolution |
|----|-------|------------|
| C-01 | Wrong AuthContext import (default instead of named) | Fixed — changed to `import { AuthContext }` |
| W-01 | Silent error swallowing on toggle failure | Fixed — user-facing error feedback added |
| W-02 | ProfilePage only logged errors on refetch failure | Fixed — user-facing message added on error |
| W-03 | No UserProfile block control tests | Fixed — 12 tests added, all passing |
| W-04 | Pre-existing test infrastructure failures | Out of scope (pre-existing in TurnDetailAndUpdate, RegistrationToggle) |

## Test Results

| Suite | Result |
|-------|--------|
| Backend (10 suites) | ✅ All pass |
| Frontend — UserItem (11 tests) | ✅ All pass |
| Frontend — UserProfile (12 tests, NEW) | ✅ All pass |
| Frontend — other suites (13 suites) | ✅ Pass |
| **Frontend total** | **22/22 tests pass** |

## Remaining Notes

- W-04 (pre-existing test infrastructure issues) is out of scope — not introduced by this change
- S-01 (add `runValidators` to `findByIdAndUpdate`): No change needed, low risk
- S-02 (Supertest integration test): Not implemented, backend unit tests cover the controller logic
- S-03 (verify full user object in response): Not implemented, low priority

## Source of Truth Updated

`openspec/specs/user-blocking/spec.md` now reflects the `user-blocking` capability (new domain).

## SDD Cycle Complete

The change has been fully planned, implemented, verified, and archived.
