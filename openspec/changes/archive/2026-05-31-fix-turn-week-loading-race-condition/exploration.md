# Exploration: Fix Turn Data Loading Race Condition & Performance

## Current State

Two schedule pages (`SchedulePageAdmin` and `SchedulePageGuest`) share a carousel-based week navigation pattern. Each page renders one of two near-identical turn-list components: `TurnsListByWeekAdmin` and `TurnListByWeek`. Both use a module-level cache (`turnsCache`) with a stale-while-revalidate (SWR) pattern and a `useEffect` that fetches turn data from `GET /turns/date/:date?endDate=:endDate`.

The `WeekCarousel` component (framed-motion) renders 3 panels: prev, center, next. Fast user interaction (dragging or rapid button clicks) triggers rapid `initDate` changes in the parent, which cascade to the turn-list components.

Two observed symptoms:
1. **Fast scrolling** → some weeks render "Sin turnos" (empty). Slow scrolling works fine.
2. **General slowness** loading turn data.

---

## Verified Findings

### Bug 1 (CRITICAL, ADMIN ONLY): SWR path lacks cancellation → race condition on fast navigation

**File**: `web/src/components/turns/turns-list-by-week-admin/TurnsListByWeekAdmin.jsx`  
**Lines**: 139–151

```javascript
if (cached && !isReloadTriggered) {
    turnsService.list(initDate, sixthDay)     // ← async fire-and-forget
        .then((freshTurns) => {
            // ...
            setTurns(freshTurns);             // ← writes to state with NO cancelled guard
        })
        .catch(() => {});
    return;                                    // ← returns early, NO cleanup function
}
```

**Root cause**: When the SWR path fires a background fetch, it does NOT return a cleanup function from `useEffect`. If the user navigates to a different week before the promise resolves, `setTurns(freshTurns)` will write the OLD week's data into the component's state, overwriting the NEW week's data. The render-sync block (lines 65–76) may partially mitigate this by resetting state during render, but it is a race — the promise callback runs asynchronously and can win.

**Reproduction**: Navigate week A (has cache) → week B → wait for week A's SWR promise to resolve → week B shows week A's turns (or "Sin turnos" if week A data doesn't match week B's day columns).

**Guest variant**: `TurnListByWeek.jsx` line 178: `if (cached && !isReloadTriggered) return;` — the guest variant does NOT fire any SWR background fetch. No race condition, but data can go stale (see New Finding 1).

**JUDGMENT**: **CONFIRMED** but only affects the Admin component. The user's description of the bug is accurate for admin. The guest variant has a different design choice (no background revalidation).

---

### Bug 2 (PERFORMANCE, BOTH COMPONENTS): Unstable `getNextDate` causes useEffect to re-run every render

**Files**:
- `TurnsListByWeekAdmin.jsx` lines 78–102, 194
- `TurnListByWeek.jsx` lines 115–139, 221

```javascript
const transformDate = (date) => { /* ... */ };          // NOT memoized — new ref every render

const getNextDate = useCallback((base, daysToAdd) => {
    // ...
    return transformDate(d);
}, [transformDate]);                                     // ← depends on unstable transformDate

const sixthDay = getNextDate(baseDay, 6);                // ← changes every render

useEffect(() => {
    // ...
}, [reload, initDate, sixthDay, baseDay, getNextDate]); // ← deps change every render
```

**Root cause**: `transformDate` is a plain function body, not wrapped in `useCallback`. Every render creates a new function reference. `getNextDate`'s `useCallback` depends on `[transformDate]`, so `getNextDate` also gets a new reference every render. `sixthDay` is computed from `getNextDate`, so it too changes every render. The `useEffect` therefore fires on every render, causing the SWR path to launch unnecessary background `turnsService.list()` calls.

**Impact**: Not just "slowness" — the component fires redundant API requests on every render when cached data exists. This amplifies the race condition in Bug 1.

**JUDGMENT**: **CONFIRMED** in both components. More severe than "performance" — it's a logic bug that causes unnecessary network traffic.

---

### Bug 3 (PERFORMANCE, BACKEND): No MongoDB index on `Turn.date`

**File**: `api/models/turn.model.js` (entire file, lines 1–35)

```javascript
const turnSchema = new mongoose.Schema({
    date: { type: String, required: true },
    hour: { type: String, required: true },
    state: { type: String, enum: [...], default: "Disponible" },
}, { timestamps: true, toJSON: {...} });
// NO .index() call anywhere
```

**Query in controller** (`api/controllers/turns.controllers.js` line 55):
```javascript
const turns = await Turn.find({ date: { $gt: startDate, $lte: endDate } }).lean();
```

**Impact**: Every turn list request performs a full collection scan on the `Turn` collection. As turn data grows, this becomes progressively slower. The `date` field is stored as a `String` in `YYYY-MM-DD` format, which sorts correctly (lexicographic = chronological) and can be indexed.

**Note on date.model.js**: Line 69 has a commented-out index `// dateSchema.index({ date: 1, turn: 1 }, { unique: true })` — but the Date schema has NO `date` field. This is stale/misleading cruft and should be removed. The Date model actually needs an index on `turn` to optimize `DateModel.find({ turn: { $in: turnIds } })` (line 60).

**JUDGMENT**: **CONFIRMED**. The Turn model is missing a critical index.

---

### Optimization 4 (PERFORMANCE, BOTH COMPONENTS): Missing `useMemo` on filtered/sorted day arrays

**Files**:
- `TurnsListByWeekAdmin.jsx` lines 201–206
- `TurnListByWeek.jsx` lines 226–231

```javascript
const firstDayTurns  = sortByHour(turns.filter((t) => t.date === firstDay));
const secondDayTurns = sortByHour(turns.filter((t) => t.date === secondDay));
// ... 4 more
```

Six `.filter()` + `.sort()` operations run on every render. These arrays feed into `DayColumn` which (in the guest variant) uses `React.memo`. Without `useMemo`, the memo is defeated because new array references are created every render.

**JUDGMENT**: **CONFIRMED**. Low-hanging optimization that also fixes React.memo effectiveness in the guest variant.

---

## New Issues Discovered

### New Finding 1: Guest variant shows stale data (no background revalidation)

**File**: `TurnListByWeek.jsx` line 178

```javascript
if (cached && !isReloadTriggered) return;  // ← just returns, no background refresh
```

Unlike the admin variant, the guest component does NOT fire a background revalidation. If another user books a turn (or an admin modifies one), the guest sees stale cached data until they manually trigger a cache invalidation (e.g., by submitting their own booking). The `clearGuestTurnsCache()` function is called from `DatesForm`, `DatesFormAdmin`, `AuthStore`, and `TurnDetailAndUpdate`, but **not** from any polling or WebSocket mechanism.

**Risk**: A guest could attempt to book a turn that is no longer available.

---

### New Finding 2: Date model needs index on `turn` field

**File**: `api/models/date.model.js`

The query in `turns.controllers.js` line 60:
```javascript
const dates = await DateModel.find({ turn: { $in: turnIds } })
    .populate('user')
    .populate('service')
    .lean();
```

No index exists on `Date.turn`. Adding `dateSchema.index({ turn: 1 })` would speed up this lookup. The commented-out index on line 69 references a non-existent `date` field — should be removed as cleanup.

---

### New Finding 3: No AbortController — fetches run to completion even when cancelled

Both components use a `cancelled` flag (lines 158, 193 for admin; 185, 220 for guest) to discard stale responses, but the HTTP request itself is NOT aborted. The backend still processes the request, the database query still runs, and the response is sent over the wire before being discarded by the flag check. Adding `AbortController`/`AbortSignal` to the `turnsService.list()` call would properly cancel the fetch at the network level.

---

### New Finding 4: Render-phase `setState` anti-pattern in both components

**Files**:
- `TurnsListByWeekAdmin.jsx` lines 65–76
- `TurnListByWeek.jsx` lines 102–113

```javascript
const [prevInitDate, setPrevInitDate] = useState(initDate);
if (initDate !== prevInitDate) {
    setPrevInitDate(initDate);
    // setTurns and setLoading called during render
}
```

Setting state during the render phase is discouraged by React and can cause bugs with Strict Mode (double-invocation) and future concurrent features. While it works today, it's a fragile pattern. The same derived-state logic could be achieved with `useEffect` or `useMemo`.

---

### New Finding 5: `months` and `days` lookup objects recreated every render

**Files**:
- `TurnsListByWeekAdmin.jsx` lines 111–112
- `TurnListByWeek.jsx` lines 148–156

These static lookup objects are recreated on every render. Should be hoisted to module scope.

---

### New Finding 6: Duplicate `eslint-disable` comment

**File**: `SchedulePageAdmin.jsx` lines 43–44

```javascript
// eslint-disable-next-line react-hooks/exhaustive-deps
// eslint-disable-next-line react-hooks/exhaustive-deps   // ← duplicate
```

Cosmetic, but indicates sloppy editing.

---

## Affected Areas

| File | Issue(s) |
|------|----------|
| `web/src/components/turns/turns-list-by-week-admin/TurnsListByWeekAdmin.jsx` | Bug 1, Bug 2, Opt 4, New 4, New 5 |
| `web/src/components/turns/turn-list-by-week/TurnListByWeek.jsx` | Bug 2, Opt 4, New 1, New 4, New 5 |
| `web/src/pages/SchedulePageAdmin.jsx` | New 6 (cosmetic) |
| `api/models/turn.model.js` | Bug 3 (add index) |
| `api/models/date.model.js` | New 2 (add index), stale comment |
| `web/src/services/turns.js` | New 3 (optional AbortController support) |
| `web/src/__tests__/components/turns/TurnsListByWeekAdmin.test.js` | Test may need update after fixes |

### Components that consume the cache
- `TurnDetailAndUpdate.jsx` — calls both `clearAdminTurnsCache()` and `clearGuestTurnsCache()`
- `DatesForm.jsx` — calls both clear functions
- `DatesFormAdmin.jsx` — calls both clear functions
- `AuthStore.js` — calls both clear functions on logout

These invalidation points are correct. No changes needed there.

---

## Recommendations

1. **Fix Bug 1 first** (race condition) — highest user impact
2. **Fix Bug 2 simultaneously** (unstable deps) — closely coupled, same files
3. **Add MongoDB index** (Bug 3 + New 2) — backend-only, can be done in parallel
4. **Add useMemo** (Opt 4) — quick win
5. **Decide on guest SWR behavior** (New 1) — is stale data acceptable? If not, add background revalidation WITH proper cancellation

---

## Risks

- **Guest SWR addition**: If we add background revalidation to the guest variant (New 1), we MUST include cancellation to avoid replicating Bug 1 there. Adding SWR without cancellation would make the guest page inherit the same race condition.
- **Index creation on production**: Adding an index to a live MongoDB collection with existing data will lock the collection briefly. Should be done during low-traffic hours or via `background: true` (default in MongoDB 4.2+).
- **AbortController scope**: Requires changing `turnsService.list()` signature to accept an optional `signal`. All callers of `list()` must be updated (including prefetch calls).
- **Existing test**: `TurnsListByWeekAdmin.test.js` tests the SWR behavior. If we change how cancellation works, the test assertions may need adjustment.

---

## Ready for Proposal

**Yes** — the root causes are clearly identified with line numbers. The scope is well-bounded: 2 frontend components, 2 backend models, plus optional AbortController support. The fix is straightforward and low-risk.
