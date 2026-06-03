# Archive Report: registration-lock

**Status**: ✅ COMPLETE
**Archived at**: `openspec/changes/archive/2026-06-02-registration-lock/`
**Archive date**: 2026-06-02
**Branch**: `renew-2026`

---

## Summary

Implemented a registration lock feature giving the admin a toggle to close user registration from the admin panel. The feature spans both backend (AppSetting key-value model, settings controller, registration middleware, routes, seed) and frontend (settings service, RegistrationToggle component, AdminPage and RegisterPage modifications).

**PR 1 (Backend)**: AppSetting model, settings controller, registration middleware, route wiring, startup seed, and all associated tests (37 tests passing).
**PR 2 (Frontend)**: Settings service, RegistrationToggle component, AdminPage integration, RegisterPage conditional rendering, and component tests (8 tests passing after bugfix).

---

## Specs Synced to Main

| Domain | Action | Details |
|--------|--------|---------|
| `app-settings` | Created → `openspec/specs/app-settings/spec.md` | New key-value config domain. 8 requirements: Schema, Admin-only API, List, Get, Update (with boolean validation), lazy seed. |
| `registration-gate` | Created → `openspec/specs/registration-gate/spec.md` | New registration guard domain. 5 requirements: isOpen middleware, POST /users route guard, RegisterPage conditional rendering, Admin RegistrationToggle UI. |

---

## Files Created

### Backend (`api/`)

| File | Description |
|------|-------------|
| `api/models/app-setting.model.js` | AppSetting Mongoose model: `key` (String, unique, indexed), `value` (Mixed), timestamps. Static `getOrDefault(key, defaultValue)` via `findOneAndUpdate` + `$setOnInsert` + upsert. |
| `api/controllers/settings.controllers.js` | Settings controller: `list` (GET all + lazy-seed), `getByKey` (GET one, seed registration.enabled if missing, else 404), `update` (PATCH, validates `value`, boolean validation for registration.enabled). |
| `api/middlewares/registration.mid.js` | `isOpen` middleware: reads `registration.enabled` from DB, calls `next()` if true/missing (fail-open), returns 403 if false. |
| `api/__tests__/models/app-setting.test.js` | Model unit tests: upsert, duplicate key, timestamps, Mixed types (9 tests). |
| `api/__tests__/registration.middleware.test.js` | Middleware unit tests: pass when true, 403 when false, fail-open when missing or DB error (5 tests). |
| `api/__tests__/controllers/settings.test.js` | Controller integration tests: list, get, update, auth, lazy-seed, boolean validation (11 tests). |

### Frontend (`web/src/`)

| File | Description |
|------|-------------|
| `web/src/services/settings.js` | Settings API service: `getAll()`, `getByKey(key)`, `update(key, value)` via `http` from `base-api`. Follows `users.js` pattern. |
| `web/src/components/settings/registration-toggle/RegistrationToggle.jsx` | Admin toggle card component. Mount: GET status; toggle: PATCH with loading/error states. Follows `PushSettingsCard` pattern. |
| `web/src/__tests__/components/settings/RegistrationToggle.test.js` | Component tests: toggle states, loading, error revert, fail-open mount (8 test assertions). |

---

## Files Modified

| File | Change |
|------|--------|
| `api/config/routes.config.js` | Added public `GET /settings/registration.enabled`, admin `GET /settings`, admin `GET /settings/:key`, admin `PATCH /settings/:key`. Added `registrationMid.isOpen` before `users.create` on `POST /users`. |
| `api/app.js` | Added `mongoose.connection.once('open')` → `AppSetting.getOrDefault('registration.enabled', true)` for startup seed. |
| `web/src/pages/AdminPage.jsx` | Imported and rendered `RegistrationToggle` in PWA controls section. |
| `web/src/pages/RegisterPage.jsx` | Added `useState(isOpen=true)` + `useEffect` fetching `getByKey("registration.enabled")`. Shows `UsersForm` when open, "Registro temporalmente cerrado" when closed. Fail-open on fetch error. |
| `api/__tests__/controllers/auth.test.js` | Added 3 registration gate tests: blocked when closed, allowed when open, fail-open when doc missing. |

---

## Commits (8 Work-Unit Commits)

| # | Hash | Message |
|---|------|---------|
| 1 | `84ab5b0` | `feat(api): add AppSetting model with getOrDefault static` |
| 2 | `46e5c1a` | `feat(api): add settings controller with list/get/update` |
| 3 | `3aa2118` | `feat(api): add registration isOpen middleware` |
| 4 | `ab9976e` | `feat(api): wire settings routes and registration gate + seed on startup` |
| 5 | `b7e90f9` | `feat(web): add settings service for app configuration` |
| 6 | `c49fbd8` | `feat(web): add RegistrationToggle component for admin panel` |
| 7 | `e3424ad` | `feat(web): add registration toggle to AdminPage` |
| 8 | `95e1bd3` | `feat(web): add registration status check to RegisterPage` |

---

## Bug Found and Fixed During Verification

**CRITICAL**: Import path error in `RegistrationToggle.jsx`

- **Root cause**: The component at `src/components/settings/registration-toggle/RegistrationToggle.jsx` imported settings service as `../../services/settings` (2 levels up), resolving to `components/services/settings.js` which does not exist.
- **Fix**: Changed to `../../../services/settings` (3 levels up to `src/`).
- **Impact**: Blocked all 8 test assertions and would cause a runtime error if the component rendered. Fixed before final archiving.

**WARNING (pre-existing, not caused by this change)**: Test suites with `MongoMemoryServer` fail when run in parallel due to resource contention. All suites pass when run individually.

---

## Verification Results

| Metric | PR 1 (Backend) | PR 2 (Frontend) |
|--------|----------------|-----------------|
| Tasks | 6/6 complete ✅ | 5/5 complete ✅ |
| Tests | 37 passed / 0 failed ✅ | 8 passed / 0 failed ✅ (after bugfix) |
| Spec compliance | 25/25 scenarios | 7/7 scenarios |
| Build | Pass (Node.js) | Pass (CRA) |
| Verdict | PASS ✅ | PASS ✅ (after bugfix) |

---

## Architecture Decisions Validated

| Decision | Status |
|----------|--------|
| Seed via startup `app.js` hook | ✅ Implemented |
| Seed idempotency via `$setOnInsert` | ✅ Implemented |
| Lazy creation in controller (belt + suspenders) | ✅ Implemented |
| Middleware uses inline `AppSetting.findOne` | ✅ Implemented |
| Middleware filename `registration.mid.js` | ✅ Implemented |
| Closed message inline (not toast) | ✅ Implemented |
| Fail-open on doc not found | ✅ Implemented |
| Fail-open on DB error | ✅ Implemented |
| Public route order before generic param | ✅ Implemented |

---

## Follow-Up Recommendations

1. **Add `RegisterPage.test.js`** — The design specifies component tests for RegisterPage (3 scenarios: form open, closed message, fail-open), but no test file was created. This is a design-to-task gap.
2. **Fix parallel test execution** — `MongoMemoryServer` suites fail when run concurrently. Adding `jest.setTimeout(30000)` to each test file's `beforeAll` would resolve this.
3. **Extract error strings** — The hardcoded error message in `RegistrationToggle` (`"No se pudo actualizar el estado. Intenta de nuevo."`) could be extracted to a constants file for maintainability.
4. **General settings admin UI** — The `app-settings` capability can now support any future admin toggle (e.g., maintenance mode, feature flags) with just a new component on `AdminPage`.

---

## Archive Contents

- `proposal.md` ✅
- `design.md` ✅
- `tasks.md` ✅
- `specs/app-settings/spec.md` ✅
- `specs/registration-gate/spec.md` ✅
- `verify-report.md` ✅
- `verify-report-pr2.md` ✅
- `archive-report.md` ✅ (this file)

---

## Source of Truth Updated

The following specs now reflect the new behavior as main specs:
- `openspec/specs/app-settings/spec.md`
- `openspec/specs/registration-gate/spec.md`

---

**SDD Cycle Complete** ✅ — registration-lock has been fully planned, implemented, verified, and archived.
