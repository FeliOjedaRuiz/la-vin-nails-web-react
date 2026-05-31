# turn-week-loading Specification

## Purpose

Data-loading contract for week-navigated turn lists. Defines cancellation, cache revalidation, memoization, and indexed query requirements for admin (`TurnsListByWeekAdmin`) and guest (`TurnListByWeek`) components.

## Requirements

### Requirement: Cancellation Guarantee on Week Navigation

The system MUST discard stale in-flight responses when the user navigates to a different week. A promise resolved for a previous week SHALL NOT overwrite current-week state.

#### Scenario: SWR background fetch overwritten by navigation

- GIVEN admin view loads week A (cached, triggers background SWR fetch)
- WHEN user navigates to week B before the SWR promise for week A resolves
- THEN the SWR response for week A MUST NOT call `setTurns` or modify state
- AND week B SHALL display its correct turn data

#### Scenario: Rapid sequential carousel drag

- GIVEN admin view at week A
- WHEN user drags carousel through weeks B, C, D within 500ms
- THEN only week D's data SHALL persist in state
- AND no intermediate week response SHALL overwrite the final state

### Requirement: Guest Cache Revalidation with Cancellation

The guest turn list MUST revalidate stale cache in background using the same SWR pattern as admin, with identical cancellation guards.

#### Scenario: Guest cache hit triggers background refresh

- GIVEN guest views a week with cached turn data (cache not expired)
- WHEN the component mounts
- THEN cached data SHALL display immediately
- AND a background fetch SHALL revalidate in parallel

#### Scenario: Guest navigation cancels in-flight revalidation

- GIVEN guest has an in-flight background revalidation for week A
- WHEN user navigates to week B
- THEN the response for week A MUST NOT set state
- AND week B's data SHALL be requested normally

### Requirement: Indexed Date-Range Queries

MongoDB turn queries by date range MUST use index scans (IXSCAN). The `Turn` collection SHALL have a B-tree index on `date`.

#### Scenario: Date-range query uses index

- GIVEN a `Turn` collection with `{ date: 1 }` index
- WHEN `Turn.find({ date: { $gt: '2026-01-01', $lte: '2026-01-07' } })` executes
- THEN `explain()` SHALL show IXSCAN stage
- AND query time SHALL scale logarithmically with collection size

### Requirement: Fetch Abort on Unmount or Week Change

In-flight HTTP turn requests MUST be aborted at network level on unmount or week change. `turnsService.list()` SHALL accept an optional `AbortSignal`.

#### Scenario: Abort on component unmount

- GIVEN turn-list component with in-flight `turnsService.list()` call
- WHEN component unmounts
- THEN fetch SHALL abort via `AbortController.abort()`

#### Scenario: Abort on week change

- GIVEN component fetching week A
- WHEN user navigates to week B
- THEN fetch for week A SHALL abort
- AND a new fetch for week B SHALL initiate

### Requirement: Stable Effect Dependencies

The `useEffect` driving turn fetches MUST NOT re-fire from unmemoized function references or derived values stable for the same `initDate`.

#### Scenario: Parent re-render without initDate change

- GIVEN component with stable `initDate` prop
- WHEN parent re-renders without changing `initDate`
- THEN useEffect SHALL NOT execute
- AND no network request SHALL fire

#### Scenario: Effect fires only on initDate change

- GIVEN component displaying week A
- WHEN `initDate` changes to week B's Monday
- THEN useEffect SHALL execute exactly once
- AND one fetch for week B's date range SHALL initiate

### Requirement: Memoized Derived Day Arrays

Filtered and sorted arrays of turns grouped by day MUST maintain stable references between renders when inputs are unchanged.

#### Scenario: Stable references prevent child re-renders

- GIVEN `DayColumn` wrapped in `React.memo` with unchanged `turns`
- WHEN parent re-renders
- THEN filtered day arrays SHALL return same reference
- AND `React.memo` SHALL skip `DayColumn` re-render

#### Scenario: New data produces new references

- GIVEN component with `turns` for week A
- WHEN `turns` updates to week B data
- THEN filtered day arrays SHALL return new references
- AND `DayColumn` components SHALL re-render correctly

### Requirement: TurnDetail Date Fallback

The `TurnDetailAndUpdate` component MUST display date/cita details using `turn.dateData` from the backend response when `currentDate` context is unavailable (direct navigation or race condition).

#### Scenario: Direct navigation to turn detail without context

- GIVEN admin navigates directly to `/turns/:id` (no `currentDate` in context)
- WHEN `TurnDetailAndUpdate` fetches turn detail via `turnsService.detail(id)`
- THEN `turn.dateData` from backend response SHALL be used as date fallback
- AND cita details SHALL display correctly (not "aún no fue solicitado")

#### Scenario: Context currentDate overrides dateData when available

- GIVEN `currentDate` exists in AuthContext
- WHEN `TurnDetailAndUpdate` mounts
- THEN `currentDate` SHALL take precedence over `turn.dateData`
- AND `deleteDate()` SHALL clear context after sync
