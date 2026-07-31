# Exploration: turno-retiro-feature

## 1. Context

Admin wants a NEW category of appointment Turn called **"retiro"** (pickup), to model the existing 30-min "Retiro" Service. Retiro turns behave like normal turns (same 5 states, same double-booking lock, same calendar) but:

- Are flagged with `category: 'retiro'` at creation/edit.
- Render with a **distinct color** in admin AND client views.
- Are **filter-compatible** with the booking Service: client picking the "Retiro" service sees only `retiro` turns; any other service sees only `normal` turns.
- Backend MUST reject (400) a booking where service-category ≠ turn-category.
- Admin can change a Turn's category, but if an active Date (cita) exists on that Turn, a confirmation modal warns before saving.

---

## 2. Current state (verified)

Pre-discovered findings re-checked against real files.

| Claim | Verdict | Evidence |
|---|---|---|
| Turn schema = `date`, `hour`, `state(enum, default 'Disponible')`, no `category`/`duration` | CONFIRMED | `api/models/turn.model.js:5-17`. Index `{ date: 1 }` at `:33`. |
| Date schema = `user, service(ref), type, handState, desiredDesign, designDetails, needRemove, turn(ref), cost, duration(String), state(enum Solicitada/Realizada/Cancelada), paymentMethod`. Index `{ turn: 1 }` | CONFIRMED | `api/models/date.model.js:3-54`, index `:69`. |
| Service schema = `name, type:[String], image, description, price, dateDuration`. No `category` | CONFIRMED | `api/models/service.model.js:3-26`. |
| "Retiro" service seeded: `name:"Retiro"`, `type:["uñas de gel","esmaltado semipermanente"]`, `price:5`, `dateDuration:"0:30"` | CONFIRMED | `api/bin/services.seed.js:12-19`. |
| `turns.controllers.list` builds `criterial={ date:{ $gt: startDate } }` + optional `$lte endDate`; visibility ceiling for non-admin only; embeds related dates as `dateData` | CONFIRMED | `api/controllers/turns.controllers.js:9-97`. |
| `turns.controllers.create` is passthrough `Turn.create(req.body)` | CONFIRMED | `:3-7`. |
| `dates.controllers.create` is passthrough `Date.create(req.body)` then email + push, NO service↔turn compatibility validation | CONFIRMED | `api/controllers/dates.controllers.js:5-27`. |
| `TurnsForm` = date + hour only, no category toggle | CONFIRMED | `web/src/components/turns/turns-form/TurnsForm.jsx:34-91`. |
| `TurnItemAdmin` colors driven by `turn.state` switch; special-case `date?.service?.name === "Semi Manos y Pies"` (teal vs emerald/yellow) | CONFIRMED | `web/src/components/turns/turn-item-admin/TurnItemAdmin.jsx:47-74`. |
| `TurnItemGuest` = pink for `Disponible`, gray otherwise | CONFIRMED | `web/src/components/turns/turn-item-guest/TurnItemGuest.jsx:4-11`. |
| `TurnDetailAndUpdate` exposes date, hour, state via `handleTurnChange` (generic `turn[key]=value`); submit calls `turnsService.update(id, turn)` with full turn object | CONFIRMED | `web/src/components/turns/turn-detail-and-update/TurnDetailAndUpdate.jsx:121-159`. No category select present. |
| `DatesForm.onDateSubmit` sends `{...data, user, service: service.id, turn: selectedTurn.id}`; locks Turn to "Solicitado" first, then creates Date, rolls back on error | CONFIRMED | `web/src/components/dates/dates-form/DatesForm.jsx:166-225`. |
| `NewDatePage` loads service via `servicesService.detail(id)`, passes `service` + `serviceTypes` to `DatesForm` | CONFIRMED | `web/src/pages/NewDatePage.jsx:13-21`. |
| `TurnsColorsExplication` legend = Disponible (pink-400) + Ocupado (gray-400) only | CONFIRMED | `web/src/components/turns/turns-color-explication/TurnsColorsExplication.jsx:3-17`. |

### Correction to pre-discovered context

- The **pre-discovered claim** that `TurnItemAdmin` admin renders "Disponible" as `bg-white border-2 border-emerald-500` and guest as `bg-pink-400` is correct, BUT the admin "Disponible" color is **white-with-emerald-border**, not emerald-filled. Color design for retiro must respect this two-visual-language split (admin = state-coded, guest = availability-coded).
- The pre-discovered "recommended color `bg-indigo-500`/`bg-violet-500`" is **NOT part of the DESIGN.md palette** (see §6) — needs explicit user sign-off.

---

## 3. Discovered during explore

### 3.1 Where `TurnListByWeek` gets turns — query shape & filter injection point
- `web/src/services/turns.js:5-8` — `list(date, endDate, signal)` → `GET /turns/date/:date?endDate=YYYY-MM-DD`. **Only date range is sent. No category param today.**
- `TurnListByWeek.jsx:189,211` calls `turnsService.list(initDate, sixthDay, signal)`. Filter is purely date-range.
- **Filter injection point (cleanest): add `?category=` to the backend `list` and propagate through the service.** DB-level filtering avoids shipping all turns and hiding client-side — and matches the existing date-range pattern in `criterial`.
- `turns.controllers.js:50` `criterial = { date: { $gt: startDate } }` → trivial to add `if (req.query.category) criterial.category = req.query.category;`.
- `GET /turns/date/:date` is wired with `secure.optionalAuth` (`api/config/routes.config.js:72`) → guests CAN call it. Adding a category param does not leak data (security enforced at booking).

### 3.2 ⚠️ SWR cache key collision (HIGH-severity gotcha)
- `TurnListByWeek.jsx:130` `const turnsCache = {}` keyed by `initDate` ONLY.
- `TurnsListByWeekAdmin.jsx:86` `turnsCache = {}` keyed by `initDate` ONLY.
- If we add a category filter to the same `initDate`, two services (retiro vs normal) booking the **same week** would **share the cache slot** → wrong turns shown when switching services.
- **Cache key MUST become `${initDate}:${category}`** (guest list). Admin list shows ALL turns regardless of category (no filter), so its key can stay `initDate` — but only if admin intentionally shows both categories mixed (likely yes).

### 3.3 Other Turn readers/writers
- `turns.mid.js` — `exists` (loads Turn into `req.turn`) and `isFree` (blocks delete if a Date exists on the turn). Used by `PATCH /turns/:id` and `DELETE /turns/:id` (`routes.config.js:74-80`). `isFree` pattern is the reference for "active date" guard.
- `push.controllers.js:96` and `dates.controllers.js:22` — build `/turns/:id` URLs for push notifications. Read-only on Turn id; no category involvement.
- `dates.controllers.js:91-111` `listByMonth` uses `$lookup` from `dates` → `turns`. Returns turn docs inside dates. No category handling today; will transit leaked category in aggregation (harmless).
- `expenses.controllers.js` + `expense.model.js` — `category` field already exists on Expense (unrelated domain). **Confirms `category` is an established field name in this project** — reuse it for Turn/Service.

### 3.4 `TurnDetailAndUpdate` field exposure
- Currently exposes `date`, `hour`, `state` via `<input>/<select>` with `id={field}` and `handleTurnChange` (`:121-129`) does `setTurn({ ...turn, [key]: value })` generically.
- Adding a `category` `<select id="category">` with options `['Normal','Retiro']` (Spanish labels, English-ish values `'normal'`/`'retiro'`) plugs in with NO new handler — but the initial render must seed `turnStates`-style ordering for category too.
- The confirmation-modal requirement (option B): intercept `handleSubmit` (`:141-150`). If `category` changed AND `date` (active cita) exists → show a `Modal` warning before calling `onTurnSubmit`. There is already a `Modal` component imported (`:8`) used for delete confirm — same pattern.

### 3.5 DESIGN.md exists — relevant tokens (see §6 for full)
- `DESIGN.md` defines palettes: `primary` = Pink (300-800), `secondary` = Teal (400-700), `accent` = Emerald (600-700), `warning` = Amber, `error` = Red. **No indigo/violet/purple token.**
- Typographic rule: inputs MUST be `>=16px` (`text-base`); never `text-sm` for `<input>/<select>/<textarea>`.
- `h-dvh` mandatory (no `h-screen`/`100vh`).
- Poppins font.

### 3.6 React-hook-form validation already in place (pattern to mirror)
- `DatesForm.jsx:285-295` registers `type` select with `required`. `serviceTypes` default-seeded via `setValue("type", serviceTypes[0])` at `:76-80`.
- The booking form uses `handleSubmit(onFormValid, onInvalid)` → modal confirmation → `confirmAndSubmit()` → `onDateSubmit(formData)` (`:232-243`). **This is where backend-validation error (400 on category mismatch) surfaces** — `onDateSubmit` catch block (`:212-224`) already sets `modalError`/`serverError`. No new plumbing needed, just the backend rejection.

### 3.7 i18n
- **No i18n setup found** (`grep` for `i18n`/`locales`/`translations` dirs returned nothing). All UI strings are hardcoded Spanish. **Keep all new strings in Spanish** to match project voice.

### 3.8 PWA / service worker — turns cache
- `web/src/service-worker.js:1-6` comment: **API calls are NOT cached** (network always). Only static shell + local images are cached (`StaleWhileRevalidate` for `.png/.webp`).
- → **No SW-level cache invalidation needed** when a Turn's category changes. The only cache to handle is the **in-memory module SWR cache** in `TurnListByWeek` / `TurnsListByWeekAdmin` (already invalidated via `clearGuestTurnsCache`/`clearAdminTurnsCache` after mutations — `DatesForm.jsx:209-210`, `TurnDetailAndUpdate.jsx:147-148`).

### 3.9 Existing tests for turns/dates
- **Backend** (`api/__tests__/`): Jest + `mongodb-memory-server` via `db-handler`. `controllers/turns.test.js` (date-range + endDate), `controllers/turns.visibility.test.js` (Spain ceiling + June exception), `models/service.test.js`. **NO `dates.controllers.test.js`** — the new validation test would be a NEW file.
- **Frontend** (`web/src/__tests__/`): RTL + `renderWithProviders` test util. `components/turns/TurnDetailAndUpdate.test.js` exists (race-condition + dateData fallback). `pages/SchedulePageAdmin.test.js`, `SchedulePageGuest.test.js`, `Services` mocked via `jest.mock('../../../services/turns')`.
- `openspec/config.yaml` → `tdd: true`, `test_command: "cd api && npm test && cd ../web && CI=true npm test"`. Coverage threshold: 0 (tests must pass, no % gate).

### 3.10 Retiro-service identification (key design fork)
- Today the "Retiro" service is identified **only by `name === "Retiro"`**. The proposed Turn `category` needs a matching marker on Service to compare `service.category === turn.category`.
- Three options (decision in spec phase): add `category` enum to Service (clean, symmetric), add `isRetiro: Boolean` to Service (narrow), or match by `service.name` (fragile, no schema change).

---

## 4. Edge cases & risks

| # | Case | Severity | Note |
|---|---|---|---|
| E1 | Existing production turns have no `category` | LOW | Mongoose `default: 'normal'` covers it. No migration needed; optional null-safe script if wanted. |
| E2 | Admin changes a Turn's category while a client has it selected but hasn't submitted | MEDIUM | Backend validation rejects the booking with 400. Frontend `onDateSubmit` catch already rolls back `turn.state → 'Disponible'`. BUT `DatesForm.jsx:203` rollback sends `{...selectedTurn, state:"Disponible"}` carrying the **client's stale category** → would overwrite the admin's category change. Fix: rollback MUST send only `{ state: "Disponible" }`. |
| E3 | SWR cache key collision when switching services on same week | HIGH | See §3.2. Cache key must include category. |
| E4 | `turns.list` visibility ceiling vs category filter interaction | LOW | Independent: ceiling rewrites `endDate`, category adds `criterial.category`. No conflict. |
| E5 | Retiro color collides with admin state-coded palette (orange=Reservado, yellow=Solicitado, emerald=Confirmado, red=Cancelado, white/emerald-border=Disponible) | MEDIUM | Need a rule: does `category:'retiro'` override state colors, or add a tint/badge? Open question §9. |
| E6 | Admin changes category while an active Date (cita) exists on the turn | MEDIUM | Requirement = frontend confirmation modal. Backend still allows (admin action). If category drives service-compatibility, the existing cita may become "inconsistent" with its turn — acceptable for past citas? Open question §9. |
| E7 | `Date.update` (`dates.controllers.js:116-122`) is also passthrough — can a client/admin re-target a Date to a turn of the other category? | MEDIUM | Should add the same validation on `Date.update` (defense in depth), not only on `create`. |
| E8 | `listByMonth` aggregation returns turn docs raw — may leak `category` into admin reports (harmless, no UI consumes it today) | LOW | No action. |
| E9 | Guest can `GET /turns/date/:date?category=normal` to enumerate retiro turns | LOW | No data leak: viewing a turn ≠ booking it. Booking is enforced. Acceptable. |
| E10 | `TurnsForm` admin-create: a future admin forgets to flag retiro → client with Retiro service sees no slots | LOW | UX only; admin trainable. Mitigate with a tooltip + clear color legend. |

---

## 5. Existing OpenSpec specs affected

| Spec | Affected? | Why |
|---|---|---|
| `turn-week-loading` | **YES** | Defines the SWR cache + week navigation contract for `TurnListByWeek`/`TurnsListByWeekAdmin`. Adding a `category` dimension to the guest list changes **cache identity** (key must include category). A delta spec is required. Admin list shows all categories mixed (no filter) so its contract is unchanged. |
| `frontend` (PWA) | NO | API is not cached by the SW; no PWA contract change. (Mention in proposal that PWA is intentionally unaffected.) |
| `app-settings` | NO | Unrelated KV config. |
| `registration-gate` | NO | Unrelated. |
| `user-blocking` | NO | Unrelated. |

---

## 6. Conventions to respect

### From `AGENTS.md` (project rules)
- **JS puro, NO TypeScript.**
- **`h-dvh` always** — forbidden `h-screen` / `100vh` (Safari iOS dynamic bars).
- **Inputs `font-size >= 16px`** (`text-base`), never `text-sm` on `<input>/<select>/<textarea>` (prevents iOS auto-zoom).
- **date-fns** for date math (already used in `DatesForm`).
- Mobile-First, premium.

### From `DESIGN.md` (tokens)
- **Primary Pink** `300-800` (`#f06292`–`#ad1457`); `pink-700/500` for buttons/titles.
- **Secondary Teal** `400-700`.
- **Accent Emerald** `600-700` (`#059669`/`#047857`).
- **Warning Amber**, **Error Red**.
- **NO indigo/violet/purple token defined.** Introducing a retiro color outside the documented palette needs **explicit user sign-off** (§9). Candidate: `violet-500` `#8b5cf6` or `indigo-500` `#6366f1` (both premium, distinct from the state palette).
- Background `#ffffff`; text `#1A1A1A`; Poppins; base input size 16px; `animate-fade-in-down` for entrances.

### From `openspec/config.yaml`
- Specs: **Given/When/Then**, **RFC 2119** keywords (MUST/SHALL/SHOULD/MAY).
- Design: sequence diagrams for complex flows; rationale for decisions.
- Tasks: grouped by phase (infra/impl/test), hierarchical numbering.
- **tdd: true** — tests first.
- `test_command`: `cd api && npm test && cd ../web && CI=true npm test`.

---

## 7. Test patterns to follow

### Backend (`api/__tests__/controllers/turns.test.js` reference)
- Jest + `db-handler` (`mongodb-memory-server`): `beforeAll(connect)`, `afterEach(clearDatabase)`, `afterAll(closeDatabase)`.
- Controller invoked directly: `const req = { params, query, user }; const res = { json(turns){...done()} }; turnsController.list(req, res, next)`.
- `turns.visibility.test.js` uses promise-wrapped invocation for async `list`.
- **New file needed:** `api/__tests__/controllers/dates.test.js` (currently absent) for the service↔turn category compatibility validation on `create` and `update`.

### Frontend (`web/src/__tests__/components/turns/TurnDetailAndUpdate.test.js` reference)
- RTL + `renderWithProviders` (`web/src/test-utils` exported helper).
- `jest.mock('../../../services/turns')` + `jest.mock('../../../services/dates')`.
- `jest.mock('react-router-dom', () => ({ ...jest.requireActual('react-router-dom'), useNavigate: () => mockNavigate, useParams: () => ({ id: '123' }) }))`.
- Mock `clearAdminTurnsCache` / `clearGuestTurnsCache` via factory mock.
- Patterns to add: `TurnsForm` category-toggle test, `TurnListByWeek` cache-key-includes-category test, `DatesForm` mismatch-rollback test, color-class tests for `TurnItemGuest`/`TurnItemAdmin` retiro branch.

---

## 8. Recommended approach

Use a **`category` String enum `['normal','retiro']` (default `'normal'`) field on BOTH `Turn` and `Service`**, not a boolean `isRetiro`. Reasons: (1) `category` is already the established field name on `expense.model.js` — consistency; (2) enum is forward-extensible if a future service type appears; (3) symmetric comparison `turn.category === service.category` reads cleanly in the controller.

- **Models**: add `category` to `turn.model.js` and `service.model.js` with `enum:['normal','retiro']`, `default:'normal'`. Existing turns and non-Retiro services get `'normal'` automatically (E1 resolved).
- **Seed/migration**: update `api/bin/services.seed.js` to set `category:'retiro'` for the "Retiro" entry; ship a one-time script (or `apiscripts/`) to backfill the existing "Retiro" service doc in production. No turn backfill needed (default covers it).
- **Backend validation (defense in depth)**: in `dates.controllers.js::create`, after `Date.create` fails OR — better — BEFORE creating, fetch the referenced `turn` and `service`, compare `category`, reject `400 { message: "El turno no es compatible con el servicio" }` on mismatch. Repeat the same guard in `dates.controllers.js::update` (E7). The client lock-then-create flow in `DatesForm` means the 400 surfaces cleanly in the existing catch block; the rollback fix (E2) MUST change `{...selectedTurn, state:"Disponible"}` → `{ state:"Disponible" }`.
- **Backend filter**: `turns.controllers.js::list` reads `req.query.category` and adds `criterial.category` when present. Admin `list` calls should pass no `category` (admin sees both) — admin route already uses `secure.isAdmin`? No: `GET /turns/date/:date` is `optionalAuth`, so admin-ness is detected inside the controller via `req.user?.role==='admin'`. Keep the admin call without `category` and the client `TurnListByWeek` call WITH `service.category`.
- **Frontend service layer**: `turnsService.list(date, endDate, category, signal)` → appends `&category=retiro|normal` when provided.
- **Client calendar**: `DatesForm` derives `category` from `service.category` and passes it to `CalendarPanel` → `TurnListByWeek`. **Cache key becomes `turnsCache[\`${initDate}:${category}\`]`** (E3 fix). Admin `TurnsListByWeekAdmin` keeps `initDate` key (no category filter).
- **Admin create/edit**: `TurnsForm` add a radio/checkbox "Es turno de retiro" → registers `category`. `TurnDetailAndUpdate` add a `<select id="category">` (Spanish labels Normal/Retiro); `handleSubmit` intercepts: if `category` changed AND `date` (active cita) exists → open a `Modal` warning ("Hay una cita activa en este turno. ¿Cambiar la categoría igualmente?") before `onTurnSubmit`.
- **Colors**: introduce **`violet-500` `#8b5cf6`** for retiro (pending user sign-off §9). Guest view: `Disponible` + `category==='retiro'` → `bg-violet-400`; normal stays `bg-pink-400`. Admin view is state-coded — to avoid palette collision, retiro adds a **badge/dot** (`violet-500`) rather than overriding the state color (E5 mitigation).
- **Legend**: `TurnsColorsExplication` adds the retiro swatch + label "Retiro" for guests.

---

## 9. Open questions

1. **Retiro color token**: `DESIGN.md` declares only Pink/Teal/Emerald/Amber/Red. Introduce `violet-500` (or `indigo-500`)? Needs explicit user approval — adding a token outside the documented palette. *(Recommend `violet-500`.)*
2. **Admin color treatment for retiro**: override state colors entirely, or keep state color + add a violet badge/dot? *(Recommend badge/dot to preserve the state language.)*
3. **Service identification**: confirm approach = add `category` to Service schema + seed update + one-time production backfill script (vs. `isRetiro` boolean vs. `name==='Retiro'` match). *(Recommend `category` enum on Service.)*
4. **Active cita on category change**: backend should allow it (admin action) with only a frontend modal warning — OR should the backend also refuse when a non-cancelled Date exists on the turn? *(Recommend allow + frontend modal, matching the user's "option B".)*
5. **`Date.update` validation scope**: confirm we add the service↔turn compatibility guard to BOTH `create` and `update` of Date. *(Recommend both — defense in depth.)*
6. **Rollback fix scope**: confirm we change `DatesForm` rollback to send only `{ state:"Disponible" }` (not the whole stale turn) to avoid clobbering an admin's concurrent category edit. *(Recommend yes.)*
7. **Cache key naming**: confirm guest cache key = `${initDate}:${category}` and admin cache key stays `initDate` (admin shows mixed categories). *(Recommend yes.)*

---

**Ready for Proposal?** YES — pending answers to §9 questions (especially #1 color token + #3 Service identification) before the spec phase.