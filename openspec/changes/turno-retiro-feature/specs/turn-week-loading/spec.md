# Delta for turn-week-loading

## Purpose

Existing capability — now extended so the guest `TurnListByWeek` cache key
gains a `category` dimension (preventing cross-service cache collisions on the
same week) and the `DatesForm` booking rollback payload is tightened so it can
never clobber a concurrent admin category edit. The admin list keeps the
`initDate`-only key (admin shows mixed categories intentionally).

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Stable Effect Dependencies

The `useEffect` driving turn fetches MUST NOT re-fire from unmemoized function references or derived values stable for the same `initDate` AND `category`.
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

In-flight HTTP turn requests MUST be aborted at network level on unmount, week change, OR category change. `turnsService.list()` SHALL accept an optional `AbortSignal` and MUST propagate the `category` query param when provided.
(Previously: only unmount or week change; no category param.)

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

The guest turn list MUST revalidate stale cache in background using the same SWR pattern as admin, with identical cancellation guards. Cache identity for guests MUST include the `category` dimension (`${initDate}:${category}`); the admin list keeps the `initDate`-only key.
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

## REMOVED Requirements

None. (The "Cancellation Guarantee on Week Navigation", "Indexed Date-Range
Queries", "Memoized Derived Day Arrays", and "TurnDetail Date Fallback"
requirements from the main spec remain unchanged and are not part of this delta.)