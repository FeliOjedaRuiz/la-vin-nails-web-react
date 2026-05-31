# Tasks: Fix Turn Data Loading Race Condition & Performance

## Review Workload Forecast

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Tier 1 — Critical: Race Condition Fixes

- [ ] 1.1 Add optional `signal` param to `turnsService.list(date, endDate, signal)` — `web/src/services/turns.js` (~3L)
  Dependencies: none. Verifiable by: existing callers work without signal; axios aborts on `controller.abort()`.

- [ ] 1.2 Admin SWR guard: add `currentInitDateRef` + `abortControllerRef`; guard `setTurns` — `TurnsListByWeekAdmin.jsx` (~13L)
  Deps: 1.1. Lines 139–151: pass `signal` to `list()`, check ref before `setTurns()`. Cleanup aborts controller.
  AC: rapid drag never shows wrong-week turns (spec §Cancellation scenarios).

- [ ] 1.3 Guest SWR: replace `if (cached && !isReloadTriggered) return;` with background fetch — `TurnListByWeek.jsx` (~17L)
  Deps: 1.1. Same ref+AbortController pattern as admin. Background `list()` guarded by ref check.
  AC: cache hit triggers bg fetch; navigation cancels stale response (spec §Guest Cache Revalidation).

- [ ] 1.4 Remove duplicate `eslint-disable-next-line` — `SchedulePageAdmin.jsx` (~1L)
  Deps: none. Line 44: remove second directive.
  AC: ESLint clean on this file.

## Tier 2 — Performance: Stable Dependencies & Memoization

- [x] 2.1 Hoist `transformDate`, `safeParseDate`, `getNextDate` to module-scope exports — both components (~25L)
  Dependencies: none. Remove `useCallback` on `getNextDate`. Zero closure deps, stable identity.
  AC: useEffect no longer re-fires on parent re-render with same `initDate` (spec §Stable Effect Dependencies).

- [x] 2.2 Replace render-phase setState with `useEffect(() => { sync cache }, [initDate])` — both components (~24L)
  Deps: 2.1. Remove render-phase block (admin:65–76, guest:102–113). Add effect for cache-derived state sync.
  AC: no render-phase side effects; cache sync correct on `initDate` change.

- [x] 2.3 Wrap filtered day arrays in `useMemo([turns, dayLabels])` — both components (~22L)
  Deps: 2.1. Admin: 6× `sortByHour(turns.filter(…))` → `useMemo`. Guest: same + 6× `getMonthVisibility()` → `useMemo`.
  AC: `React.memo`-wrapped `DayColumn` skips re-render when `turns` unchanged (spec §Memoized Derived Day Arrays).

## Tier 3 — Backend: MongoDB Indexes

- [x] 3.1 Add `turnSchema.index({ date: 1 })` — `api/models/turn.model.js` (~2L)
  Deps: none. After schema, before `module.exports`. Default background build (Mongo ≥4.2).
  AC: `explain()` shows IXSCAN on date-range query (spec §Indexed Date-Range Queries).

- [x] 3.2 Add `dateSchema.index({ turn: 1 })`, remove stale comment — `api/models/date.model.js` (~3L)
  Deps: none. Replace line-69 commented-out index with active `dateSchema.index({ turn: 1 })`.
  AC: `explain()` shows IXSCAN on `Date.find({ turn: { $in } })`.

## Tier 4 — Cleanup

- [x] 4.1 Hoist `months` + `days` static objects to module scope — both components (~6L)
  Deps: none. Referenced by hoisted `getFormattedDate` (from 2.1).
  AC: `getFormattedDate()` still renders correct Spanish month/day labels.

- [ ] 4.2 Update test mocks for AbortSignal; add cancellation scenario — `TurnsListByWeekAdmin.test.js` (~25L)
  Deps: 1.1, 1.2. Mock `list()` accepts optional 3rd param. Test: rapid `initDate` change → stale `setTurns` NOT called.
  AC: `cd web && CI=true npm test` passes.
