# Spec: Turno Retiro Category

**Change**: `turno-retiro-feature`
**Status**: spec-ready
**Mode**: hybrid (OpenSpec files + Engram copy)
**TDD**: `true` — every requirement and scenario below MUST become a test first.

> This file consolidates the 3 capabilities for review. The canonical
> per-domain artifacts live under `specs/<capability>/spec.md` for archive.
> All IDs (REQ-*, SC-*) are unique across this change.

---

## Capability: turn-category (NEW)

### Purpose

Classify each `Turn` as `normal` or `retiro` (pickup) so the existing
30-min "Retiro" Service can be paired only with compatible turns,
and so retiro turns are visually distinguished in admin and guest views.

### Requirements

| ID | Requirement | RFC 2119 |
|----|-------------|----------|
| REQ-CAT-01 | `Turn.category` MUST be `{ type: String, enum: ['normal','retiro'], default: 'normal' }`. | MUST |
| REQ-CAT-02 | `TurnsForm` MUST expose a category toggle with Spanish labels `Normal` / `Retiro` at create. | MUST |
| REQ-CAT-03 | `TurnItemGuest` MUST render a `Disponible` retiro turn as `bg-violet-400`; normal stays `bg-pink-400`. Non-`Disponible` slots keep the existing gray treatment regardless of category. | MUST |
| REQ-CAT-04 | `TurnItemAdmin` MUST add a violet (`bg-violet-500`) dot/badge on `category==='retiro'` turns ON TOP OF the existing state color. The state color SHALL NOT be overridden by category. | MUST / SHALL NOT |
| REQ-CAT-05 | `TurnsColorsExplication` MUST include a retiro swatch labeled "Retiro" using `bg-violet-400`. | MUST |
| REQ-CAT-06 | `TurnDetailAndUpdate` MUST expose a `category` `<select>` (Spanish labels Normal/Retiro, value `'normal'`/`'retiro'`) at edit and persist it via the existing turn update flow. | MUST |
| REQ-CAT-07 | When `category` is changed on a Turn that has an active `Date` (non-`Cancelada` cita), `TurnDetailAndUpdate` MUST show a confirmation `Modal` warning before calling the submit handler. Saving SHALL require explicit confirmation. | MUST / SHALL |
| REQ-CAT-08 | Existing production `Turn` docs without `category` MUST resolve to `'normal'` via the Mongoose default. No migration script is required. | MUST |
| REQ-CAT-09 | The category `<select>` MUST render at `font-size >= 16px` (`text-base` or larger) to prevent iOS auto-zoom. | MUST |

### Scenarios

#### Scenario SC-CAT-01: Admin creates a normal turn
- GIVEN the admin is on the `TurnsForm` create view
- WHEN the admin submits the form without toggling the category control
- THEN the persisted `Turn` document has `category: 'normal'`

#### Scenario SC-CAT-02: Admin creates a retiro turn
- GIVEN the admin is on the `TurnsForm` create view
- WHEN the admin selects the "Retiro" toggle and submits
- THEN the persisted `Turn` document has `category: 'retiro'`

#### Scenario SC-CAT-03: Existing turn without category defaults to 'normal'
- GIVEN a `Turn` document in storage created before this feature
- WHEN it is read via `turnsService.detail` or returned by `turns.list`
- THEN its reported `category` is `'normal'`
- AND no write is required to backfill it

#### Scenario SC-CAT-04: Admin edits category on a turn with an active date
- GIVEN a `Turn` with `category: 'normal'` linked to a `Date` whose state is `'Solicitada'`
- WHEN the admin opens `TurnDetailAndUpdate` and changes the category to `'Reiro'`
- THEN a confirmation `Modal` appears
- AND the `turnsService.update` call SHALL NOT fire until the admin confirms
- AND on confirm the update persists `category: 'retiro'`

#### Scenario SC-CAT-05: Admin edits category on a turn with no active date
- GIVEN a `Turn` with `category: 'normal'` and no linked `Date`
- WHEN the admin changes the category to `'retiro'` and submits
- THEN no confirmation `Modal` appears
- AND the update persists `category: 'retiro'` directly

#### Scenario SC-CAT-06: Guest sees retiro Disponible slot in violet
- GIVEN a guest views the calendar and a `Disponible` turn has `category: 'retiro'`
- WHEN `TurnItemGuest` renders that slot
- THEN the rendered className includes `bg-violet-400`
- AND does not include `bg-pink-400`

#### Scenario SC-CAT-07: Guest sees retiro occupied slot unchanged
- GIVEN a `Solicitado`/`Confirmado` retiro turn
- WHEN `TurnItemGuest` renders it
- THEN the className matches the existing `gray-400` occupied treatment
- AND no violet class is applied

#### Scenario SC-CAT-08: Admin sees violet dot on retiro turn preserving state color
- GIVEN an admin views a `Solicitado` turn with `category: 'retiro'`
- WHEN `TurnItemAdmin` renders it
- THEN the slot keeps its state-coded background (`bg-yellow-500` for `Solicitado`)
- AND a violet `bg-violet-500` dot/badge element is rendered alongside the state color

#### Scenario SC-CAT-09: Legend shows retiro swatch for guests
- GIVEN the guest calendar legend `TurnsColorsExplication` is rendered
- WHEN the user inspects the legend
- THEN a `bg-violet-400` swatch labeled "Retiro" is present alongside the existing Disponible/Ocupado entries

### Acceptance criteria
- [ ] All scenarios pass
- [ ] Tests cover each scenario (strict TDD)

---

## Capability: service-turn-compatibility (NEW)

### Purpose

Ensure a client booking the "Retiro" Service sees only compatible (`retiro`)
turns, any other service sees only `normal` turns, and the backend refuses
(HTTP 400) any service↔turn category mismatch on both `dates.create` and
`dates.update`. Service identity is decided by `service.name === "Retiro"`
(NO `category` field on `Service`).

### Requirements

| ID | Requirement | RFC 2119 |
|----|-------------|----------|
| REQ-STC-01 | "Retiro" service identity MUST be established by `service.name === "Retiro"` and NOT by a `Service.category` field. The `Service` model SHALL NOT be modified. | MUST / SHALL NOT |
| REQ-STC-02 | `turns.controllers.list` MUST filter DB-side by `req.query.category` when the param is present (`criterial.category = req.query.category`). When the param is absent, no category filter is applied. | MUST |
| REQ-STC-03 | Admin role (`req.user?.role === 'admin'`) MUST receive all categories (no implicit category filter) even if a `category` query param is sent. | MUST |
| REQ-STC-04 | `turnsService.list(date, endDate, category, signal)` MUST append `&category=<value>` to the request URL only when `category` is provided; absent category MUST NOT append the param. | MUST |
| REQ-STC-05 | `dates.controllers.create` MUST load the referenced `Turn` and `Service`, resolve `serviceCategory = service.name === 'Retiro' ? 'retiro' : 'normal'`, and return HTTP 400 when `serviceCategory !== turn.category` BEFORE persisting the `Date`. | MUST |
| REQ-STC-06 | `dates.controllers.update` MUST apply the SAME guard as REQ-STC-05 against the updated `service`/`turn` pair and return HTTP 400 on mismatch BEFORE persisting. | MUST |
| REQ-STC-07 | The 400 response body MUST include a Spanish message: `"El servicio Retiro solo puede reservarse en turnos marcados como retiro"` when the service is Retiro, or `"El servicio no es de retiro y no puede reservarse en un turno de retiro"` when the turn is retiro but the service is not. | MUST |
| REQ-STC-08 | `NewDatePage` / `DatesForm` MUST derive the requested `category` from the selected service (`name === 'Retiro'` → `'retiro'`, else `'normal'`) and pass it to `CalendarPanel` → `TurnListByWeek` → `turnsService.list`. | MUST |
| REQ-STC-09 | The category filter MUST remain independent of the visibility date-range ceiling (`endDate` rewrites) AND independent of the guest/admin auth path (orthogonal dimensions). | MUST |

### Scenarios

#### Scenario SC-STC-01: Client books Retiro service on a retiro turn
- GIVEN the client selected the "Retiro" service
- AND the calendar shows only `category: 'retiro'` turns
- WHEN the client selects a `retiro` turn and submits the booking
- THEN the API persists the `Date` and returns HTTP 200/201
- AND the turn is locked to `Solicitado`

#### Scenario SC-STC-02: Client maliciously books Retiro service on a normal turn
- GIVEN the client selected the "Retiro" service and a `category: 'normal'` turn id
- WHEN a crafted request reaches `dates.create` with that service+turn pair
- THEN `dates.create` returns HTTP 400
- AND the body contains `"El servicio Retiro solo puede reservarse en turnos marcados como retiro"`
- AND no `Date` is persisted and no turn lock occurs

#### Scenario SC-STC-03: Client books non-Retiro service on a retiro turn
- GIVEN the client selected a non-"Retiro" service and a `category: 'retiro'` turn id
- WHEN the request reaches `dates.create`
- THEN `dates.create` returns HTTP 400
- AND the body contains `"El servicio no es de retiro y no puede reservarse en un turno de retiro"`
- AND no `Date` is persisted and no turn lock occurs

#### Scenario SC-STC-04: Backend list filter — guest retiro request
- GIVEN a guest sends `GET /turns/date/2026-08-03?category=retiro`
- WHEN `turns.list` runs
- THEN only `Turn` docs with `category: 'retiro'` in that date range are returned

#### Scenario SC-STC-05: Backend list filter — guest normal request
- GIVEN a guest sends `GET /turns/date/2026-08-03?category=normal`
- WHEN `turns.list` runs
- THEN only `Turn` docs with `category: 'normal'` are returned

#### Scenario SC-STC-06: Backend list filter — admin sees all categories
- GIVEN an admin sends `GET /turns/date/2026-08-03` (no `category` param)
- WHEN `turns.list` runs
- THEN `Turn` docs of BOTH `normal` and `retiro` categories in that range are returned

#### Scenario SC-STC-07: Backend list filter — admin with category param still sees all
- GIVEN an admin sends `GET /turns/date/2026-08-03?category=retiro`
- WHEN `turns.list` runs
- THEN the `category` filter is NOT applied (admin sees both categories)
- AND the visibility ceiling still applies

#### Scenario SC-STC-08: Frontend cache key for retiro service
- GIVEN the client is on `/services/<retiro-service-id>` for week 2026-08-03
- WHEN `TurnListByWeek` loads turns
- THEN the SWR cache key equals `2026-08-03:retiro`
- AND `turnsService.list` is called with `category='retiro'`

#### Scenario SC-STC-09: Frontend cache key for non-retiro service
- GIVEN the client is on `/services/<any-other-service-id>` for week 2026-08-03
- WHEN `TurnListByWeek` loads turns
- THEN the SWR cache key equals `2026-08-03:normal`
- AND `turnsService.list` is called with `category='normal'`

#### Scenario SC-STC-10: dates.update respects same rule
- GIVEN an existing `Date` linking a "Retiro" service and a `category: 'normal'` turn
- WHEN the admin updates that `Date` to the Retiro service / normal-turn pair
- THEN `dates.update` returns HTTP 400 before persisting
- AND the existing `Date` is left unchanged

### Acceptance criteria
- [ ] All scenarios pass
- [ ] Tests cover each scenario (strict TDD)

---

## Capability: turn-week-loading (MODIFIED)

### Purpose

Existing capability — now extended so the guest `TurnListByWeek` cache key
gains a `category` dimension (preventing cross-service cache collisions on the
same week) and the `DatesForm` booking rollback payload is tightened so it can
never clobber a concurrent admin category edit. The admin list keeps the
`initDate`-only key (admin shows mixed categories intentionally).

### Delta from existing spec

#### ADDED Requirements

### Requirement: Category-Aware Guest Cache Identity

The guest `TurnListByWeek` in-memory cache MUST be keyed by
`${initDate}:${category}` so two services booking the same week
(`retiro` vs `normal`) do not collide. The admin `TurnsListByWeekAdmin`
cache SHALL remain keyed by `initDate` only (admin shows mixed categories).

#### Scenario: SC-TWL-ADD-01 Guest cache isolation per category

- GIVEN the client is on `/services/<retiro-service-id>` viewing week `2026-08-03` with cache populated for `2026-08-03:retiro`
- WHEN the client navigates to `/services/<other-service-id>` for the same week
- THEN the calendar fetches turns for cache key `2026-08-03:normal`
- AND does not reuse the `2026-08-03:retiro` list

#### Scenario: SC-TWL-ADD-02 Admin cache key stays category-free

- GIVEN the admin `TurnsListByWeekAdmin` has populated cache for `2026-08-03` (mixed categories)
- WHEN a new turn of `category: 'retiro'` is created and admin cache is cleared
- THEN the admin cache key re-populates as `2026-08-03` (no `:category` suffix)
- AND both `normal` and `retiro` turns render in the same admin column

### Requirement: Booking Rollback Payload Isolation

When the `DatesForm` booking flow locks a turn to `Solicitado` and the
subsequent `Date.create` call fails, the error-rollback `turnsService.update`
call MUST send only `{ state: "Disponible" }` for that turn id. The rollback
payload SHALL NOT include any other turn field (notably `category`), so a
concurrent admin category edit on the same turn is never clobbered.

#### Scenario: SC-TWL-ADD-03 Rollback does not clobber category

- GIVEN the client's `DatesForm` has locked `turn.id` to `Solicitado` and `Date.create` then rejects with HTTP 400 (category mismatch)
- WHEN `onDateSubmit` runs its catch-block rollback
- THEN the rollback `turnsService.update(turn.id, ...)` payload equals `{ state: "Disponible" }`
- AND does not include a `category` field
- AND if an admin concurrently changed `category` between lock and rollback, that admin value is preserved

#### MODIFIED Requirements

### Requirement: Stable Effect Dependencies

The `useEffect` driving turn fetches MUST NOT re-fire from unmemoized function
references or derived values stable for the same `initDate` AND `category`.
(Previously: stable for the same `initDate` only.)

#### Scenario: SC-TWL-MOD-01 Parent re-render without initDate or category change

- GIVEN guest component with stable `initDate` and stable `category`
- WHEN parent re-renders without changing either
- THEN useEffect SHALL NOT execute
- AND no network request SHALL fire

#### Scenario: SC-TWL-MOD-02 Effect fires when only category changes

- GIVEN guest component on week A with `category: 'retiro'`
- WHEN the parent service prop changes such that `category` becomes `'normal'` without `initDate` changing
- THEN useEffect SHALL execute exactly once
- AND one fetch for the same week with `category='normal'` SHALL initiate

#### Scenario: SC-TWL-MOD-03 Effect fires when only initDate changes

- GIVEN guest component displaying week A with a stable `category`
- WHEN `initDate` changes to week B's Monday
- THEN useEffect SHALL execute exactly once
- AND one fetch for week B with the same `category` SHALL initiate

### Requirement: Fetch Abort on Unmount or Week Change

In-flight HTTP turn requests MUST be aborted at network level on unmount,
week change, OR category change. `turnsService.list()` SHALL accept an
optional `AbortSignal` and MUST propagate the `category` query param when
provided. (Previously: only unmount or week change; no category param.)

#### Scenario: SC-TWL-MOD-04 Abort on component unmount

- GIVEN turn-list component with in-flight `turnsService.list()` call
- WHEN component unmounts
- THEN fetch SHALL abort via `AbortController.abort()`

#### Scenario: SC-TWL-MOD-05 Abort on week change

- GIVEN component fetching week A with `category='retiro'`
- WHEN user navigates to week B
- THEN fetch for week A SHALL abort
- AND a new fetch for week B with `category='retiro'` SHALL initiate

#### Scenario: SC-TWL-MOD-06 Abort on category change

- GIVEN component fetching week A with `category='retiro'`
- WHEN the selected service changes so `category` becomes `'normal'` (same week)
- THEN the in-flight fetch for `category='retiro'` SHALL abort
- AND a new fetch for the same week with `category='normal'` SHALL initiate

### Requirement: Guest Cache Revalidation with Cancellation

The guest turn list MUST revalidate stale cache in background using the
same SWR pattern as admin, with identical cancellation guards. Cache
identity for guests MUST include the `category` dimension
(`${initDate}:${category}`); the admin list keeps the `initDate`-only key.
(Previously: cache identity was `initDate` for both admin and guest.)

#### Scenario: SC-TWL-MOD-07 Guest cache hit triggers background refresh

- GIVEN guest views a week + category with cached turn data (cache not expired)
- WHEN the component mounts
- THEN cached data for the `${initDate}:${category}` key SHALL display immediately
- AND a background fetch SHALL revalidate in parallel

#### Scenario: SC-TWL-MOD-08 Guest navigation cancels in-flight revalidation

- GIVEN guest has an in-flight background revalidation for `(week A, category='retiro')`
- WHEN user navigates to week B
- THEN the response for week A with `category='retiro'` MUST NOT set state
- AND week B's data with the same `category` SHALL be requested normally

#### Scenario: SC-TWL-MOD-09 Guest category switch reuses only matching cache

- GIVEN guest has cached `2026-08-03:retiro` populated
- WHEN the service changes so `category='normal'` for the same week
- THEN the cache lookup for `2026-08-03:normal` is a miss
- AND a fresh network fetch for `category='normal'` SHALL initiate
- AND the `2026-08-03:retiro` entry SHALL NOT be served

#### REMOVED Requirements

None. (The "Cancellation Guarantee on Week Navigation", "Indexed Date-Range
Queries", "Memoized Derived Day Arrays", and "TurnDetail Date Fallback"
requirements from the main spec remain unchanged and are not part of this delta.)

### Acceptance criteria
- [ ] All new + modified scenarios pass
- [ ] Tests cover each scenario (strict TDD)