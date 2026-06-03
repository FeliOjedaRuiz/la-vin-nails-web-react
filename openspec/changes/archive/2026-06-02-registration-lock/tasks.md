# Tasks: Registration Lock

## Review Workload Forecast

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: Medium

Estimated changed lines ~480–530 (backend ~300, frontend ~120, tests ~100). Suggested split: PR 1 = backend (Phase 1–2 + tests 4.1–4.4), PR 2 = frontend (Phase 3 + test 4.5).

> `GET /settings/registration.enabled` is the only public settings route (RegisterPage reads it without auth). All other `/settings` routes use `secure.isAdmin`. Route order ensures specific public match before generic `/:key`.

---

## Phase 1: Backend Foundation

- [x] 1.1 **Model** — Create `api/models/app-setting.model.js`. Schema: `key` (String, unique, indexed), `value` (Mixed), timestamps. Static `getOrDefault(key, default)` via `findOneAndUpdate` + `$setOnInsert` + upsert.
  > AppSetting Schema spec

- [x] 1.2 **Middleware** — Create `api/middlewares/registration.mid.js`. `isOpen()`: `findOne({ key: "registration.enabled" })` → pass if missing/true (`next()`), 403 if false. `.catch(next)` for fail-open.
  > Registration Middleware (open, closed, fail-open)

- [x] 1.3 **Controller** — Create `api/controllers/settings.controllers.js`. `list` (GET all + lazy-seed), `getByKey` (GET one, seed `registration.enabled` if missing, else 404), `update` (PATCH, require `value`, validate boolean for `registration.enabled`).
  > app-settings API (list, get, update, seed, validation)

## Phase 2: Backend Wiring

- [x] 2.1 **Routes** — Modify `api/config/routes.config.js`. Import settings controller + registrationMid. Add: public `GET /settings/registration.enabled`, admin `GET /settings`, admin `GET /settings/:key`, admin `PATCH /settings/:key`. Add `registrationMid.isOpen` before `users.create` on `POST /users`.
  > Routes guard + admin auth

- [x] 2.2 **Seed** — Modify `api/app.js`. After db.config require, import AppSetting model. Add `mongoose.connection.once('open', () => AppSetting.getOrDefault('registration.enabled', true))`.
  > Startup seed

## Phase 3: Frontend

- [ ] 3.1 **Service** — Create `web/src/services/settings.js`. `getAll()`, `getByKey(key)`, `update(key, value)` via `http` from `base-api`. Follow `users.js` pattern.
  > Settings service

- [ ] 3.2 **Component** — Create `web/src/components/settings/registration-toggle/RegistrationToggle.jsx`. Card with toggle, follows `PushSettingsCard` pattern. States: enabled, loading, error. Mount: GET status. Toggle: PATCH, spinner, revert on error.
  > Admin RegistrationToggle (3 scenarios)

- [ ] 3.3 **Admin page** — Modify `web/src/pages/AdminPage.jsx`. Import + render RegistrationToggle inside PWA controls div after PushSettingsCard. Self-contained (no props).
  > Admin panel

- [ ] 3.4 **Register page** — Modify `web/src/pages/RegisterPage.jsx`. `useState(isOpen=true)` + `useEffect` fetching `getByKey("registration.enabled")`. Show form when open, friendly "Registro temporalmente cerrado" when closed. Fail-open on fetch error.
  > RegisterPage conditional rendering (3 scenarios)

## Phase 4: Testing

- [x] 4.1 **Model tests** — Create `api/__tests__/models/app-setting.test.js`. Test `getOrDefault` upsert + duplicate key rejection (Memory server).
- [x] 4.2 **Middleware tests** — Create `api/__tests__/registration.middleware.test.js`. Mock `findOne`, verify pass when true/missing/error, 403 when false.
- [x] 4.3 **Controller tests** — Create `api/__tests__/controllers/settings.test.js`. Supertest: list, get, update, auth 401/403, boolean validation.
- [x] 4.4 **Gate tests** — Add to `api/__tests__/controllers/auth.test.js`. Seed `false` → POST 403, seed `true` → 201.
- [ ] 4.5 **Component tests** — Create `RegistrationToggle.test.jsx`. RTL: render toggle, PATCH loading, error revert.
  > All spec scenarios covered
