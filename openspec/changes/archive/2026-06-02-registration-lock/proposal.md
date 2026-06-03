# Proposal: Registration Lock

## Intent

Give the admin a toggle to close user registration from the admin panel. Currently `POST /users` is unguarded — anyone can create accounts at any time. This is a security and operational gap.

## Scope

### In Scope
- MongoDB `AppSetting` key-value model (`key: String (unique), value: Mixed`)
- Backend setting controller: `GET /settings`, `GET /settings/:key`, `PATCH /settings`
- Middleware `registration.mid.js` → `isOpen()` guarding `POST /users` (403 when closed)
- Admin toggle card (`RegistrationToggle`) on `AdminPage`
- `RegisterPage` conditional rendering: form vs "closed" message
- Seed logic: create `registration.enabled: true` on first start if absent

### Out of Scope
- General settings admin UI beyond the registration toggle
- Per-user or conditional registration rules (e.g., invite-only, email domain filter)
- Caching layer — always read from DB (one extra query is negligible)

## Capabilities

### New Capabilities
- `app-settings`: reusable key-value configuration model, controller CRUD, seed on first run
- `registration-gate`: middleware guarding POST /users with fail-open default

### Modified Capabilities
- None

## Approach

**Backend**: New Mongoose model `AppSetting`, controller `settings.controllers.js`, middleware `registration.mid.js`. Add `GET/PATCH /settings` routes (admin-gated with existing `isAdmin` middleware). Add `isOpen` middleware to `POST /users` route in `routes.config.js`. Seed: app startup script checks for `registration.enabled` doc, creates it with `true` if absent.

**Frontend**: New service `web/src/services/settings.js` (wraps axios). New `RegistrationToggle` component following existing `PwaStatusCard`/`PushSettingsCard` pattern. Inject into `AdminPage` config section. Modify `RegisterPage` to fetch `registration.enabled` on mount and conditionally render.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `api/models/AppSetting.model.js` | New | Key-value settings schema |
| `api/controllers/settings.controllers.js` | New | CRUD for settings |
| `api/middlewares/registration.mid.js` | New | `isOpen()` guard |
| `api/config/routes.config.js` | Modified | Add `/settings` routes + gate `POST /users` |
| `api/bin/seed.js` or `app.js` | Modified | Seed `registration.enabled` on start |
| `web/src/services/settings.js` | New | Axios wrapper for settings API |
| `web/src/components/settings/registration-toggle/RegistrationToggle.jsx` | New | Admin toggle card |
| `web/src/pages/AdminPage.jsx` | Modified | Add `RegistrationToggle` card |
| `web/src/pages/RegisterPage.jsx` | Modified | Conditional render: form or "closed" |
| `api/__tests__/` | Modified | Add registration middleware + settings controller tests |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Setting doc missing on first deploy blocks all registrations | Low | Middleware fail-open: `isOpen` returns `true` when doc absent |
| Admin locks mid-registration — user in form sees 403 on submit | Med | `UsersForm` already has `serverError` state; shows error gracefully |
| Existing user creation tests fail without seeded setting | Med | Seed `registration.enabled` in test setup OR rely on fail-open |

## Rollback Plan

1. Remove `registration.mid.isOpen` from `POST /users` route
2. Remove `/settings` routes from `routes.config.js`
3. Comment out `RegistrationToggle` from `AdminPage`
4. Revert `RegisterPage` to always show form

No data migration needed — `AppSetting` collection can be dropped or left unused.

## Dependencies

None (uses existing `isAdmin` middleware and Mongoose).

## Success Criteria

- [ ] Admin can toggle registration open/closed from admin panel with immediate effect
- [ ] `POST /users` returns 403 when closed, 201 when open
- [ ] `RegisterPage` shows closed message instead of form when registration locked
- [ ] First-deploy scenario: no setting doc → registration open (fail-open verified)
- [ ] Existing tests pass; new middleware/controller tests cover both open and closed states
