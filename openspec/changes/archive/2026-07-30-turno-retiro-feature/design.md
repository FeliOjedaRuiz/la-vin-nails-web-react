# Design: Turno Retiro Category

**Change**: `turno-retiro-feature`
**Status**: design-ready
**TDD**: `true` — every behavior below gets a test first.
**Review budget**: 400 lines (target ~250–350).

## 1. Architecture overview

```
Turn model (api/models/turn.model.js)
   ↓ +category: 'normal' | 'retiro'  (default 'normal')  +index {category:1}
   ↓
turns.controllers.js
   ├─ create    → passthrough (category from req.body, default 'normal')
   ├─ list      → criterial.category = req.query.category  (NON-admin only)
   ├─ detail    → returns category (transparent)
   └─ update    → passthrough on category (modal enforced client-side)
   ↓
dates.controllers.js
   ├─ create    → 400 if serviceRetiro XOR turnRetiro  (BEFORE Date.create)
   └─ update    → same 400 guard                          (BEFORE req.date.save)
   ↓
Frontend (web/src)
   ├─ services/turns.js        → list(date,endDate,category,signal)
   ├─ TurnsForm                → toggle "Es turno de retiro"
   ├─ TurnItemAdmin            → violet dot ON TOP of state color
   ├─ TurnItemGuest            → bg-violet-400 when retiro+Disponible
   ├─ TurnsColorsExplication   → violet "Retiro" swatch
   ├─ TurnListByWeek           → cache key `${initDate}:${category}`
   ├─ TurnsListByWeekAdmin     → cache key `initDate` (unchanged, mixed)
   ├─ DatesForm                → derive category from service.name; rollback fix
   └─ TurnDetailAndUpdate      → category <select> + confirmation Modal
```

## 2. Data model

### 2.1 Turn model diff (`api/models/turn.model.js`)

```js
// add inside the schema object, after `state`:
category: {
  type: String,
  enum: ["normal", "retiro"],
  default: "normal",
},
// add new compound index for the list filter (low cardinality, but cheap):
turnSchema.index({ date: 1, category: 1 }, { background: true });
```
The existing `{ date: 1 }` index is kept (it serves `.find({date})` and `dates.listByMonth`-style reads). The compound `{date,category}` covers both the date-range query and the category filter in one IXSCAN.

### 2.2 Migration / backfill
No script. Mongoose `default: 'normal'` materializes on read for legacy docs (REQ-CAT-08 / SC-CAT-03). Writes through `turns.update` will persist the field the next time an admin edits. No production script needed.

### 2.3 Service model
**NO changes** to `service.model.js` (locked decision #1). Compatibility is decided by `service.name === "Retiro"` at the call site:
- **Seed risk**: `api/bin/services.seed.js:12-19` defines the canonical `"Retiro"` name. Any rename of that seed entry silently breaks the filter AND the 400 guard. The string match is a **deliberate** coupling — the backend 400 (Section 3) is the real guard, the seed is the source of truth for the name. No frontend-only assumption may rely on the Retiro service id.
- **Documentation**: a comment in `dates.controllers.js` validation helper MUST call out the `name === "Retiro"` coupling so a future rename is caught in code review.

## 3. API design

### 3.1 Endpoints

| Method | Path | Change |
|--------|------|--------|
| POST | /api/v1/turns | accepts `category` in body (default `'normal'`); passthrough. |
| GET | /api/v1/turns/date/:date | adds `?category=` query. **Non-admin** → `criterial.category`; **admin** → filter ignored (sees all). |
| GET | /api/v1/turns/:id | returns `category` (no code change). |
| PATCH | /api/v1/turns/:id | accepts `category`. No backend modal guard — frontend enforces the confirmation. |
| POST | /api/v1/dates | **NEW 400 guard** before `Date.create`. |
| PATCH | /api/v1/dates/:id | **NEW 400 guard** before `req.date.save()`. |

### 3.2 Validation helper (`dates.controllers.js`)

```js
const createError = require('http-errors');
const Turn = require('../models/turn.model');
const Service = require('../models/service.model');

// NOTE: retiro identity is tied to `service.name === "Retiro"` (see api/bin/services.seed.js).
// If the seed name is renamed, update this helper AND the frontend DatesForm derivation.
async function assertServiceTurnCompatibility(turnId, serviceId) {
  const [turn, service] = await Promise.all([
    Turn.findById(turnId).lean(),
    Service.findById(serviceId).lean(),
  ]);
  if (!turn)    return next(createError(400, 'Turno no encontrado'));
  if (!service) return next(createError(400, 'Servicio no encontrado'));
  const isRetiroService = service.name === 'Retiro';
  const isRetiroTurn    = turn.category === 'retiro';
  if (isRetiroService !== isRetiroTurn) {
    throw createError(400, isRetiroService
      ? 'El servicio Retiro solo puede reservarse en turnos marcados como retiro'
      : 'El servicio no es de retiro y no puede reservarse en un turno de retiro');
  }
  return { turn, service };
}
```

- `dates.create` → `assertServiceTurnCompatibility(req.body.turn, req.body.service)` then `Date.create(req.body)`. Failure → `next(err)` renders via the existing `app.js` error middleware `{ message }` shape (api/app.js:111–113).
- `dates.update` → `assertServiceTurnCompatibility(req.body.turn ?? req.date.turn, req.body.service ?? req.date.service)` before `Object.assign(req.date, req.body); req.date.save()`.

`next` is passed in by closure; controllers already use `(req, res, next) => …`. Helper is exported from the same file (avoids a new module file).

### 3.3 Error response shape
Matches existing project shape (api/app.js:111→`{ message: error.message }`). Frontend catch in `DatesForm.onDateSubmit` already reads `error.response?.data?.errors` then falls back to `error.response?.data?.message` via `error.message` (axios unwraps `response.data.message` to `error.message`). **No frontend error-plumbing change.**

### 3.4 turns.list filter injection (REQ-STC-02/03)

```js
// inside list(), AFTER the admin ceiling block, BEFORE criterial is built:
const isAdmin = req.user?.role === 'admin';
// … existing ceiling only when !isAdmin …
const criterial = { date: { $gt: startDate } };
if (req.query.endDate) criterial.date.$lte = req.query.endDate;
if (!isAdmin && req.query.category) criterial.category = req.query.category;
```
Admin path skips the `category` filter (REQ-STC-03). The date-ceiling logic is untouched — independent dimension (REQ-STC-09).

## 4. Frontend architecture

### 4.1 Component changes

| Component | Change |
|-----------|--------|
| `services/turns.js` | `list(date, endDate, category, signal)` → appends `&category=<v>` only when category is truthy. |
| `TurnsForm` | Adds a checkbox/pill toggle `Es turno de retiro` registering `category` (`'retiro'` when checked else `'normal'`). New `<input>`/`<select>` MUST use `text-base` (≥16px) per AGENTS.md. Default unchecked → `'normal'` (SC-CAT-01). |
| `TurnItemAdmin` | Adds a badge `<span className="w-2 h-2 rounded-full bg-violet-500 absolute top-1 right-1" />` rendered as sibling of the state-colored div when `turn.category === 'retiro'`. State bg/text untouched (REQ-CAT-04). |
| `TurnItemGuest` | When `Disponible` + `category==='retiro'` → `bg-violet-400`/selected `bg-violet-600 ring-2 ring-violet-400` (instead of pink/emerald); non-Disponible keeps `bg-gray-300`. |
| `TurnsColorsExplication` | Adds legend row: `bg-violet-400` swatch + `"Retiro"` label. |
| `TurnListByWeek` | `turnsCache[\`${initDate}:${category}\`]`. Accept `category` prop from `CalendarPanel`. `useEffect` deps include `category` (SC-TWL-MOD-02). |
| `CalendarPanel` | Passes `category` prop down (new prop, threaded from `DatesForm`). |
| `DatesForm` | `const category = service?.name === 'Retiro' ? 'retiro' : 'normal';` passed to `CalendarPanel`. Rollback payload → only `{ state: 'Disponible' }`. |
| `TurnDetailAndUpdate` | Adds `<select id="category" className="text-base">` with Spanish labels `Normal`/`Retiro`, values `'normal'`/`'retiro'`. `handleSubmit` intercepts: if `category !== initialCategory && turn.dateData && turn.dateData.state !== 'Cancelada'` → open `Modal` warning, else `onTurnSubmit` directly. |
| `TurnsListByWeekAdmin` | **No change** (admin shows mixed categories, key stays `initDate`). |

### 4.2 Cache-key strategy

Guest cache before: `turnsCache['2026-08-03']`. After: two independent slots.

```
Week 2026-08-03:
  turnsCache['2026-08-03:retiro']  ← Retiro service booking
  turnsCache['2026-08-03:normal']  ← any other service booking
```
Switching services on the same week now hits a different slot → no stale cross-category render (SC-TWL-ADD-01). `clearGuestTurnsCache()` (module-level helper) wipes both slots on booking success. Admin cache key `2026-08-03` stays single — admin intentionally sees both categories (SC-TWL-ADD-02).

### 4.3 Rollback fix (`DatesForm.jsx`)

```diff
- await turnsService.update(selectedTurn.id, { ...selectedTurn, state: "Disponible" });
+ await turnsService.update(selectedTurn.id, { state: "Disponible" });
```
Sending only `{ state }` means a concurrent admin `category` edit between our lock (`:195`) and our rollback (`:203`) is preserved — never clobbered (SC-TWL-ADD-03). The lock payload stays `{ ...selectedTurn, state: "Solicitado" }` (intentional: we acquire the slot).

### 4.4 Lock-vs-400 ordering (risk #3)

Flow is **kept as-is**:
1. `turnsService.update(turn.id, {...selectedTurn, state:"Solicitado"})` (lock)
2. `datesService.create(payload)` → `assertServiceTurnCompatibility` runs **server-side before** `Date.create`
3. on 400 → catch → rollback `{ state:"Disponible" }` → rethrow → `setModalError(message)`

No reordering. The 400 runs after lock because the lock is the double-booking guard; rollback is already wired. Mismatch cost: one wasteful lock+unlock pair (cheap, idempotent).

## 5. Color system (locked decision)

| Context | Class | Notes |
|---------|-------|-------|
| Guest available + retiro | `bg-violet-400` | replaces `bg-pink-400` |
| Guest available + normal | `bg-pink-400` | unchanged |
| Guest selected + retiro | `bg-violet-600 ring-2 ring-violet-400` | mirrors existing emerald-selected pattern |
| Guest occupied (any cat) | `bg-gray-300` | unchanged |
| Admin retiro badge | `w-2 h-2 rounded-full bg-violet-500 absolute top-1 right-1` | always violet, never overrides state bg |

**DESIGN.md doc deferred** (locked decision #3). After visual validation, the team will append the violet token to `DESIGN.md` in a separate PR. No token doc in this PR.

## 6. Test architecture (strict TDD)

### 6.1 Test file inventory

| File | Status | Tests (TDD scenario coverage) |
|------|--------|--------------------------------|
| `api/__tests__/models/turn.model.test.js` | NEW | default 'normal'; enum rejects unknown; `.create({category:'retiro'})` persists |
| `api/__tests__/controllers/turns.test.js` | EXTEND | `?category=retiro` guest filter (SC-STC-04); `?category=normal` (SC-STC-05); admin sees both with `?category=retiro` (SC-STC-07); admin no param (SC-STC-06); create accepts category (SC-CAT-02) |
| `api/__tests__/controllers/dates.test.js` | **NEW** (risk #5) | 400 mismatch create both branches (SC-STC-02/03); 200 match create (SC-STC-01); 400 mismatch update (SC-STC-10); 400 when turn/service missing; verify NO Date persisted on reject |
| `web/src/__tests__/components/turns/turns-form/TurnsForm.test.jsx` | NEW or EXTEND | unchecked → payload `category:'normal'` (SC-CAT-01); checked → payload `category:'retiro'` (SC-CAT-02) |
| `web/src/__tests__/components/turns/turn-item-admin/TurnItemAdmin.test.jsx` | NEW or EXTEND | retiro renders violet dot (SC-CAT-08); normal renders no dot; dot coexists with `bg-yellow-500` (Solicitado) |
| `web/src/__tests__/components/turns/turn-item-guest/TurnItemGuest.test.jsx` | NEW or EXTEND | retiro+Disponible → `bg-violet-400` no `bg-pink-400` (SC-CAT-06); retiro+no-Disponible → gray, no violet (SC-CAT-07) |
| `web/src/__tests__/components/turns/turns-color-explication/TurnsColorsExplication.test.jsx` | NEW or EXTEND | violet swatch + "Retiro" label present (SC-CAT-09) |
| `web/src/__tests__/components/turns/turn-list-by-week/TurnListByWeek.test.jsx` | EXTEND | cache key `__entries__` includes `${initDate}:retiro` when category retiro (SC-STC-08); switching category → fetch called with new value (SC-TWL-MOD-02) |
| `web/src/__tests__/components/dates/dates-form/DatesForm.test.jsx` | EXTEND | passes `category='retiro'` to list when service.name==='Retiro' (SC-STC-08); rollback payload equals `{state:'Disponible'}` (SC-TWL-ADD-03) |
| `web/src/__tests__/components/turns/turn-detail-and-update/TurnDetailAndUpdate.test.jsx` | EXTEND | modal appears when category changes AND active non-Cancelada Date (SC-CAT-04); no modal when no dateData (SC-CAT-05); `turnsService.update` not called until confirm (SC-CAT-04) |

### 6.2 Test patterns to mirror

- **Backend** (`api/__tests__/controllers/turns.test.js`): Jest + `db-handler` (`mongodb-memory-server`); `beforeAll(connect) / afterEach(clearDatabase) / afterAll(closeDatabase)`. Controllers invoked directly: `const req = { params, query, user }; const res = { json(turns){ done() } }; const next = (err)=>done(err)`. Async list wrapped in `new Promise`. **New `dates.test.js` follows the same `db-handler` setup** and uses promise-wrapped invocation for `datesController.create/update`.
- **Frontend** (`web/src/__tests__/components/turns/TurnDetailAndUpdate.test.js`): RTL + `renderWithProviders` from `web/src/test-utils`; `jest.mock('../../../services/turns')` + `jest.mock('../../../services/dates')`; `jest.mock('react-router-dom', () => ({ ...jest.requireActual(...), useNavigate, useParams }))`; mock `clearAdminTurnsCache`/`clearGuestTurnsCache`. Class assertions via `container.querySelector('[class*="bg-violet-400"]')`.
- **Cache-key assertion**: import the module-level `turnsCache` via a named export test-only seam (or assert on `turnsService.list` mock `.toHaveBeenCalledWith(date, endDate, 'retiro', expect.any(AbortSignal))` — preferred, no internal cache leak).

### 6.3 TDD ordering (per-task)

1. Model: test `Turn.category` default/enum → it fails → add field → passes.
2. Backend list filter: SC-STC-04/05/06/07 tests fail → add `criterial.category` + admin bypass → pass.
3. Backend dates 400 guard: SC-STC-02/03/10 tests fail → add `assertServiceTurnCompatibility` to `create`+`update` → pass.
4. `turnsService.list` signature: SC-STC-04 client test fails → append `&category=` → pass.
5. Cache key + rollback: SC-TWL-ADD-01/03 tests fail → key change + rollback `{state}` → pass.
6. Guest color: SC-CAT-06/07 tests fail → violet branch → pass.
7. Admin dot + legend: SC-CAT-08/09 tests fail → badge + swatch → pass.
8. Admin create toggle: SC-CAT-01/02 tests fail → `TurnsForm` toggle → pass.
9. Admin edit + modal: SC-CAT-04/05 tests fail → select + modal → pass.

## 7. Risks and decisions (spec-phase resolution)

| # | Risk | Decision | Rationale |
|---|------|----------|-----------|
| 1 | `service.name === "Retiro"` fragile on rename | ACCEPTED | Backend 400 is the real guard; `services.seed.js` is the canonical name source; helper comment documents the coupling; frontend filter is best-effort UX. |
| 2 | Option B lets an admin create an inconsistent active cita | ACCEPTED | Admin explicitly chose this; modal warns; reports reflect current state; no extra clamp in `TurnItemAdmin` or `listByMonth` (harmless leak — E8). |
| 3 | 400 race vs lock ordering | KEPT (lock → create → rollback) | 400 guard runs server-side before persist; rollback already wired in `DatesForm`; cost of mismatch is one wasteful lock+unlock. |
| 4 | Admin `?category=` filter | Admin CAN send it but backend IGNORES it (admin sees both). No special-casing beyond the role check that already exists for the ceiling. |
| 5 | New `dates.test.js` file absent | CREATE in apply phase (task: scaffold + first 400-mismatch test before any controller change). |

Additional risks carried from proposal: cache-key collision (mitigated §4.2), rollback clobber (mitigated §4.3), E1 legacy docs (`default` covers), E10 admin-forgets-toggle (UX, legend + tooltip).

## 8. Work-unit commit plan

Seven review-sized commits, each keeps tests with the code they verify (work-unit-commits skill). Chained-PR or single PR decided at tasks phase; commits are independent revert units either way.

| # | Commit | Scope |
|---|--------|-------|
| 1 | `feat(turn): add category enum on Turn model` | model field + index + `turn.model.test.js` (default/enum) |
| 2 | `feat(turns): backend filtering by category` | `turns.controllers.list` + admin bypass + `turnsService.list` signature + `turns.test.js` extend |
| 3 | `feat(dates): reject service↔turn category mismatch (400)` | `dates.controllers.create/update` + helper + NEW `dates.test.js` |
| 4 | `feat(turns): admin create toggle + dot badge + legend` | `TurnsForm` toggle, `TurnItemAdmin` badge, `TurnsColorsExplication` + 3 test files |
| 5 | `feat(turns): guest violet override for retiro Disponible` | `TurnItemGuest` violet branch + test |
| 6 | `fix(dates): category-aware guest cache + tight rollback payload` | `TurnListByWeek` cache key, `CalendarPanel`/`DatesForm` category threading, rollback `{state}` + tests |
| 7 | `feat(turns): admin edit category with confirmation modal` | `TurnDetailAndUpdate` select + modal + tests |

No docs commit (DESIGN.md token doc deferred — locked decision #3).

## 9. Out of scope (explicit)

- No `category` field on `Service`.
- No `duration` on `Turn`.
- No `DESIGN.md` token documentation (deferred).
- No PWA / service-worker changes (SW does not cache API).
- No i18n changes (Spanish-only, hardcoded).
- No general "color per service" system (future feature, retiro is the only special case).
- No production backfill script (Mongoose default covers legacy turns).
- No middleware/seed changes (seed untouched; `name === "Retiro"` is the coupling).