# Design: Registration Lock

## Technical Approach

Backend: New `AppSetting` Mongoose model (key-value), settings controller with admin-gated CRUD, `registration.mid` middleware guarding `POST /users` with fail-open behavior. Seed runs on every `app.js` startup via `findOneAndUpdate` with `upsert`.

Frontend: New `settings` service wrapping the API, `RegistrationToggle` card component on `AdminPage` following `PushSettingsCard` pattern, `RegisterPage` checks `registration.enabled` on mount and conditionally renders form or closed message.

## Architecture Decisions

| Decision | Options | Choice | Rationale |
|----------|---------|--------|-----------|
| Seed mechanism | Startup hook vs migration script | Startup `app.js` hook | Simplest; runs on every deploy via Docker; no migration tooling needed |
| Seed idempotency | `findOneAndUpdate` upsert | `findOneAndUpdate` with `$setOnInsert` | Atomic; never overwrites existing admin value; safe across deploys |
| Lazy creation in controller | Controller-only vs startup-only | Both (belt + suspenders) | Startup is primary; controller `getOrDefault` is safety net for deleted docs |
| Middleware DB query | Static model method vs inline | Inline `AppSetting.findOne` | Only one doc fetched; no benefit from helper indirection; simpler to read |
| Middleware filename | `settings.mid.js` vs `registration.mid.js` | `registration.mid.js` | One concern per file; matches proposal; future guards can be separate files |
| Closed message style | Toast vs inline | Inline in `RegisterPage` | Spec says friendly closed message; toast would be misleading for intentional state |

## Data Flow

```
AdminPage → RegistrationToggle ──PATCH──→ settings.controllers.update ──→ AppSetting.findOneAndUpdate → MongoDB
                  │                         ▲ secure.isAdmin guards
                  │
RegisterPage ──GET──→ settings.controllers.getByKey ──→ AppSetting.getOrDefault → { key, value }
                  │    (public, no auth — fail-open on error)
                  │
POST /users ──→ registration.mid.isOpen ──→ AppSetting.findOne({ key: "registration.enabled" })
                       │                              │
                       ├─ value=true  → next() → users.create → 201
                       ├─ value=false → 403 { message: "Registro temporalmente cerrado" }
                       └─ doc null    → next() (fail-open: first deploy or doc deleted)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `api/models/app-setting.model.js` | Create | Schema: `key` (String, unique, indexed), `value` (Mixed). Static `getOrDefault(key, defaultValue)` |
| `api/controllers/settings.controllers.js` | Create | `list` (GET all + seed `registration.enabled`), `getByKey` (GET one + lazy seed), `update` (PATCH, validates `value` in body) |
| `api/middlewares/registration.mid.js` | Create | `isOpen`: reads `registration.enabled`, calls `next()` if true/missing, returns 403 if false |
| `api/config/routes.config.js` | Modify | Add `GET /settings`, `GET /settings/:key`, `PATCH /settings/:key` with `secure.isAdmin`. Add `registrationMid.isOpen` before `users.create` on `POST /users` |
| `api/app.js` | Modify | After DB connect: `AppSetting.getOrDefault("registration.enabled", true)` to seed on startup |
| `web/src/services/settings.js` | Create | `getAll()`, `getByKey(key)`, `update(key, value)` — follows `users.js` pattern with `import http from "./base-api"` |
| `web/src/components/settings/registration-toggle/RegistrationToggle.jsx` | Create | Card with toggle switch, follows `PushSettingsCard` card pattern (header + status row + toggle button + loading spinner) |
| `web/src/pages/AdminPage.jsx` | Modify | Import and render `RegistrationToggle` in the PWA controls `div` |
| `web/src/pages/RegisterPage.jsx` | Modify | `useEffect` + `useState` to fetch status; conditional render: `UsersForm` or closed message. Fail-open on fetch error |

## Key Code Patterns

### Model — Static helper with upsert

```js
// api/models/app-setting.model.js
const appSettingSchema = new mongoose.Schema({
  key:   { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
});

appSettingSchema.statics.getOrDefault = function (key, defaultValue) {
  return this.findOneAndUpdate(
    { key },
    { $setOnInsert: { key, value: defaultValue } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};
```

### Middleware — fail-open

```js
// api/middlewares/registration.mid.js
const AppSetting = require("../models/app-setting.model");

module.exports.isOpen = (req, res, next) => {
  AppSetting.findOne({ key: "registration.enabled" })
    .then((setting) => {
      if (!setting || setting.value === true) return next();
      res.status(403).json({ message: "El registro está temporalmente cerrado." });
    })
    .catch(next); // DB failure also fail-open — propagates as 500, not 403
};
```

### RegisterPage — fail-open on fetch

```js
// web/src/pages/RegisterPage.jsx (additional logic)
const [isOpen, setIsOpen] = useState(true); // default: open (fail-open)
const [loading, setLoading] = useState(true);

useEffect(() => {
  settingsApi.getByKey("registration.enabled")
    .then(({ value }) => setIsOpen(value))
    .catch(() => setIsOpen(true))  // fail-open on fetch error
    .finally(() => setLoading(false));
}, []);
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit — Model | `getOrDefault` upserts correctly, duplicate key rejects | Mongoose + mongodb-memory-server |
| Unit — Middleware | `isOpen` passes when true/missing, blocks when false | Mock `AppSetting.findOne` with Jest |
| Integration | GET/PATCH settings return correct codes, admin auth enforced, lazy seed works | Supertest + mongodb-memory-server |
| Integration | `POST /users` blocked when closed, passes when open | Supertest, seed `registration.enabled` |
| Component | `RegistrationToggle` renders, toggles, shows loading/error | RTL, mock `settingsApi` |
| Component | `RegisterPage` shows form/open/closed/error states | RTL, mock `settingsApi` |

## Migration / Rollout

No data migration. `findOneAndUpdate` upsert handles first deploy atomically. Rollback: remove middleware from route, remove toggle card, revert RegisterPage — no data cleanup needed.

## Open Questions

None.
