# Proposal: Fix Turn Data Loading Race Condition & Performance

## Intent

Fix a critical race condition in the admin turn list that shows wrong-week data on fast navigation, and resolve 9 additional performance/correctness issues discovered during exploration. The root cause is missing cancellation in the SWR revalidation path; compounding factors include unstable React deps triggering redundant fetches and unindexed MongoDB queries.

## Scope

### In Scope (Tiered)

**Tier 1 — Critical (blocking bug)**
- Add cancelled-guard in admin SWR path (`TurnsListByWeekAdmin.jsx:139-151`)
- Memoize `transformDate`/`getNextDate` to stop useEffect re-fire loop (both components)

**Tier 2 — Performance**
- Add MongoDB index on `Turn.date` (+ cleanup stale comment in `date.model.js`)
- Add MongoDB index on `Date.turn`
- Wrap 6× filter/sort in `useMemo` (both components, fixes React.memo on guest)

**Tier 3 — Enhancements**
- Add background SWR revalidation to guest variant (with cancellation guard)
- Add AbortController support to `turnsService.list()` for network-level cancellation

**Tier 4 — Cleanup**
- Replace render-phase setState with derived-state pattern (both components)
- Hoist `months`/`days` objects to module scope (both components)
- Remove duplicate eslint-disable comment (`SchedulePageAdmin.jsx:43-44`)

### Out of Scope
- Replacing SWR cache with React Query/SWR library
- WebSocket/polling for real-time turn availability
- Refactoring WeekCarousel component

## Capabilities

### New Capabilities
- `turn-week-loading`: Data-loading contract for week-navigated turn lists — covers cancellation, cache revalidation, memoization, and indexed backend queries

### Modified Capabilities
- None — existing PWA spec is unrelated

## Approach

**Frontend (same two components)**:
1. Replace `cancelled` flag with `useRef`-tracked AbortController, passing signal to `turnsService.list()`
2. Move `transformDate` to module scope (pure function, no deps) to stabilize `getNextDate`'s `useCallback`
3. Wrap 6 filtered/sorted day arrays in `useMemo([turns, dayLabels], ...)`
4. Replace render-phase `setState` with `useEffect`-driven derived state on `initDate` change
5. Guest SWR: add background `list()` call when cache hit, guarded by same AbortController

**Backend**:
1. `turn.model.js`: `turnSchema.index({ date: 1 })` with `background: true`
2. `date.model.js`: `dateSchema.index({ turn: 1 })` with `background: true`; remove commented-out cruft on line 69

**Service layer**:
- Add optional `signal` param to `turnsService.list(date, endDate, signal)`

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `web/src/components/turns/turns-list-by-week-admin/` | Modified | Race condition fix, memoization, AbortController |
| `web/src/components/turns/turn-list-by-week/` | Modified | Memoization, guest SWR, AbortController |
| `web/src/pages/SchedulePageAdmin.jsx` | Modified | Remove duplicate eslint-disable (1 line) |
| `api/models/turn.model.js` | Modified | Add `date` index |
| `api/models/date.model.js` | Modified | Add `turn` index, remove stale comment |
| `web/src/services/turns.js` | Modified | Optional `signal` parameter |
| `web/src/__tests__/components/turns/TurnsListByWeekAdmin.test.js` | Updated | Test cancellation/memo behavior |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| MongoDB index creation locks collection briefly on production | Low | Use `background: true` (default in Mongo 4.2+); deploy during low-traffic window |
| Guest SWR increases API load | Medium | Same cache TTL as admin; AbortController prevents concurrent duplicate fetches |
| AbortController changes `turnsService.list()` signature | Low | Make `signal` optional (backward-compatible); update all callers in same PR |
| Existing test breaks on cancellation logic | Medium | Update test mocks to support `AbortSignal`; verify cancellation behavior explicitly |

## Rollback Plan

- All frontend changes are in 2 components + 1 page + 1 service → revert the commit
- MongoDB indexes: `db.turns.dropIndex("date_1")` and `db.dates.dropIndex("turn_1")` if performance regresses (unlikely)
- No database migration or schema change — indexes are additive

## Dependencies

- None (no external libraries, no API versioning)

## Success Criteria

- [ ] Fast week navigation (click/drag) never shows wrong-week turns in admin panel
- [ ] `useEffect` in both turn-list components fires only on actual `initDate` changes (not every render)
- [ ] MongoDB `explain()` on turn queries shows `IXSCAN` instead of `COLLSCAN`
- [ ] Guest turn list revalidates stale cache in background without introducing race condition
- [ ] All existing tests pass; new test covers cancellation scenario
- [ ] No new ESLint warnings
