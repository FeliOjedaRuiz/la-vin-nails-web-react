# Design: Fix Turn Data Loading Race Condition & Performance

## Technical Approach

Apply a two-pronged cancellation guard (ref-check + AbortController) to the SWR background-revalidation path in both components, stabilize `useEffect` dependencies by hoisting pure functions to module scope, add missing MongoDB indexes, and wrap derived arrays in `useMemo`. Fixes the root-cause race condition (Bug 1) while eliminating the compounding unstable-deps loop (Bug 2) and adding stale-data protection to the guest variant.

## Architecture Decisions

### Decision: Cancellation Guard Strategy

| Option | Tradeoff | Chosen |
|--------|----------|--------|
| `useRef(initDate)` + setTurns guard | Only guards state writes; fetch still runs to completion | ✅ |
| AbortController only (network abort) | Cleaner, but browser may still deliver already-in-flight responses | — |
| Both (ref guard + AbortController) | Defensive; covers state-write AND network waste | ✅ |

**Rationale**: The ref guard (`currentInitDateRef.current !== initDate`) blocks stale `setTurns` for the SWR path (which currently has no guard). AbortController (`signal` passed to axios) cancels the HTTP request at the transport layer, saving backend work. Together they provide defense-in-depth. The existing `cancelled` flag in the useEffect cleanup only covers the "no-cache" loading path; it does NOT cover the SWR path because that path returns early (line 150 `return;`) before the `cancelled` closure is created.

### Decision: Stabilizing useEffect Dependencies

| Option | Tradeoff | Chosen |
|--------|----------|--------|
| Wrap `transformDate` in `useCallback` | Still needs dep array; error-prone | — |
| Move `transformDate`/`safeParseDate`/`getNextDate` to module scope | No deps at all; pure functions | ✅ |

**Rationale**: These are pure functions with zero closure over component state. Module scope gives them stable identity forever. `getNextDate` and `transformDate` become dead-simple exports. `baseDay` and `sixthDay` are recomputed per render but that's cheap O(1) — what matters is that `useEffect` deps no longer include unstable references.

### Decision: Guest SWR Revalidation

| Option | Tradeoff | Chosen |
|--------|----------|--------|
| Leave guest as-is (no background revalidation) | Stale data; user may book an unavailable turn | — |
| Mirror admin SWR with cancellation | Slightly more API traffic; same cancellation as admin | ✅ |

**Rationale**: The guest currently returns early on cache hit (line 178: `if (cached && !isReloadTriggered) return;`). Adding the same `turnsService.list(initDate, sixthDay, signal)` background call as admin, guarded by the same ref+AbortController, fixes staleness without introducing the race condition.

### Decision: Backend Query Strategy

| Option | Tradeoff | Chosen |
|--------|----------|--------|
| Aggregation pipeline (join Turn+Date in one query) | Single round-trip; complex pipeline, harder to populate refs | — |
| Two queries + Mongoose `.populate()` + index optimization | Two round-trips; simpler code; indexes eliminate COLLSCAN | ✅ |

**Rationale**: The current two-query approach (`Turn.find` → `DateModel.find({ turn: { $in } }).populate()`) is idiomatic Mongoose and well-understood. Adding `{ date: 1 }` on Turn and `{ turn: 1 }` on Date transforms both from COLLSCAN to IXSCAN — the performance gain is equivalent without refactoring the controller. MongoDB 4.2+ builds indexes in background by default.

### Decision: Render-Phase setState Replacement

| Option | Tradeoff | Chosen |
|--------|----------|--------|
| Keep render-phase `if (initDate !== prevInitDate) setState(...)` | Works today; fragile with StrictMode/Concurrent React | — |
| `useEffect(() => { /* set cache-derived state */ }, [initDate])` | Clean; React-recommended; one extra commit (paint) in worst case | ✅ |

**Rationale**: The render-phase block (lines 65-76 admin, 102-113 guest) is an anti-pattern React explicitly discourages. Replacing with `useEffect` that watches `initDate` achieves the same sync-to-cache behavior without render-phase side effects. The extra paint from the deferred state update is imperceptible (cache load is synchronous DOM text swap).

## Data Flow

### Before (race condition — admin SWR path)

```
User drags carousel: week A → week B

Render week B:
  useEffect fires → cache hit for B → SWR fetch for B (async) → return early

Render week A's leftover (stale):
  SWR fetch for A resolves → setTurns(weekAData) ❌ OVERWRITES week B state!

Result: Week B shows week A's turns (or "Sin turnos")
```

### After (with cancellation)

```
User drags carousel: week A → week B

Render week B:
  useEffect fires → AbortController.abort() kills week A's in-flight fetch
  useEffect fires → cache hit for B → SWR fetch for B with signal stored in ref

Render week A's leftover (stale):
  SWR fetch for A resolves → fetch already aborted at network level
  (or) ref guard: currentInitDateRef.current ("B") !== captured initDate ("A") → bail

Result: Week B displays its correct data ✅
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `web/src/components/turns/turns-list-by-week-admin/TurnsListByWeekAdmin.jsx` | Modify | Race-condition fix (ref guard + AbortController), stable deps, module-level helpers, useMemo, useEffect-derived state |
| `web/src/components/turns/turn-list-by-week/TurnListByWeek.jsx` | Modify | Guest SWR addition with cancellation, stable deps, module-level helpers, useMemo, useEffect-derived state |
| `web/src/services/turns.js` | Modify | Add optional `signal` param to `list(date, endDate?, signal?)`, pass to axios |
| `api/models/turn.model.js` | Modify | Add `turnSchema.index({ date: 1 })` |
| `api/models/date.model.js` | Modify | Add `dateSchema.index({ turn: 1 })`, remove stale commented-out index on line 69 |
| `web/src/pages/SchedulePageAdmin.jsx` | Modify | Remove duplicate `eslint-disable-next-line` (line 44) |
| `web/src/__tests__/components/turns/TurnsListByWeekAdmin.test.js` | Update | Add AbortSignal mock support; add cancellation scenario test |

## Component Tree Changes

### TurnsListByWeekAdmin

- **Hoist to module scope**: `transformDate`, `safeParseDate`, `getNextDate`, `months`, `days` → pure exports
- **New refs**: `currentInitDateRef` (guards SWR setTurns), `abortControllerRef` (stores controller for cleanup)
- **Replace render-phase block** (lines 65-76): → `useEffect(() => { if cached setTurns(cached) else setTurns([]) setLoading(!cached) }, [initDate])`
- **SWR path** (line 139-151): add `signal` to `list()`, add ref guard before `setTurns`, create/abort controller in cleanup
- **Stats array** (lines 201-206): wrap 6× `sortByHour(turns.filter(...))` in `useMemo([turns, firstDay...sixthDay])`
- **useEffect deps**: reduce to `[reload, initDate]`

### TurnListByWeek (guest)

- **Hoist to module scope**: same helpers as admin
- **New refs**: same pattern as admin
- **Replace render-phase block** (lines 102-113): same `useEffect` pattern as admin
- **Guest SWR** (line 178): replace `return` with `turnsService.list(initDate, sixthDay, signal).then(...)` guarded by ref check
- **Stats + visibility arrays** (lines 226-238): wrap both in `useMemo`
- **useEffect deps**: reduce to `[reload, initDate]`

### turnsService

- `list(date, endDate, signal)` → `http.get(url, { signal })` — backward-compatible (optional 3rd param)

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (frontend) | SWR cancellation: stale `setTurns` is NOT called after week change | Jest + RTL: mock `turnsService.list` with a deferred promise, change `initDate` before resolving, assert `setTurns` not called with stale data |
| Unit (frontend) | Guest SWR fires background fetch on cache hit | Mock cache pre-populated, verify `list()` called, verify stale data replaced after resolve |
| Unit (frontend) | `useMemo` stable references | Render with same `turns`, capture refs, re-render, assert `===` equality |
| Integration (backend) | Index scan on date-range query | `Turn.find({ date: { $gt, $lte } }).explain()` shows `IXSCAN` stage |
| Regression | Existing admin SWR test | Update `TurnsListByWeekAdmin.test.js` to mirror the new AbortSignal-compatible mock; test still verifies cache-while-revalidate pattern |

## Migration / Rollout

No data migration required. Indexes are additive (no schema change). Frontend changes are contained within 2 components + 1 service. Rollback: revert commit. MongoDB index rollback (unlikely needed): `db.turns.dropIndex("date_1")`, `db.dates.dropIndex("turn_1")`.

## Open Questions

- [ ] Confirm MongoDB version on Fly.io is ≥ 4.2 (background index builds default)
- [ ] Decide: should the 6 `DayColumn` components in the admin variant also get `React.memo` (currently only guest uses it)?
