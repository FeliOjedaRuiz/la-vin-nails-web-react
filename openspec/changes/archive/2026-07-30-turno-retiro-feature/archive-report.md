# Archive Report: turno-retiro-feature

**Status**: COMPLETE
**Archived**: 2026-07-30
**Archive path**: `openspec/changes/archive/2026-07-30-turno-retiro-feature/`

## Summary

Added a `category` enum (`'normal'` / `'retiro'`) to the Turn model so the admin can mark appointment slots as "retiro" (pickup). Retiro slots behave identically to normal slots (same 5 states, same double-booking lock) but are visually distinguished with a violet color and are only bookable by clients selecting the "Retiro" service. A backend compatibility guard (HTTP 400) enforces the service↔turn match on both create and update.

The change was split into 2 chained PRs (stacked-to-main) to stay within the 400-line review budget: PR 1 (backend, 6 commits, ~225 code lines) and PR 2 (frontend, 5 commits, ~225 code lines). Total: 11 commits, 41 new tests (16 backend + 25 frontend), 0 CRITICALs, 2 WARNINGs (both fixed), 1 SUGGESTION.

## What changed

| Layer | Files | Change |
|-------|-------|--------|
| **Model** | `api/models/turn.model.js` | `category` enum + compound index `{date:1, category:1}` |
| **Backend** | `api/controllers/turns.controllers.js` | `?category=` filter, admin bypass |
| **Backend** | `api/controllers/dates.controllers.js` | `assertServiceTurnCompatibility` helper, 400 on mismatch (create + update) |
| **Frontend** | `web/src/services/turns.js` | `list` accepts `category` param |
| **Frontend** | `web/src/components/turns/turns-form/TurnsForm.jsx` | Category toggle (Normal / Retiro) |
| **Frontend** | `web/src/components/turns/turn-item-admin/TurnItemAdmin.jsx` | Violet dot/badge on top of state color |
| **Frontend** | `web/src/components/turns/turn-item-guest/TurnItemGuest.jsx` | `bg-violet-400` override for retiro+Disponible |
| **Frontend** | `web/src/components/turns/turns-color-explication/TurnsColorsExplication.jsx` | Legend entry for retiro |
| **Frontend** | `web/src/components/turns/turn-list-by-week/TurnListByWeek.jsx` | Cache key `${initDate}:${category}` |
| **Frontend** | `web/src/components/dates/dates-form/DatesForm.jsx` | Category filter + tight rollback `{state}` |
| **Frontend** | `web/src/components/turns/turn-detail-and-update/TurnDetailAndUpdate.jsx` | Category select + confirmation modal on active Date |

## PRs

| # | Branch | Commits | Lines (code) | Tests | Status |
|---|--------|---------|--------------|-------|--------|
| 1 | `feat/turno-retiro-feature` | 6 | ~225 | 16 | Merged to `renew-2026` |
| 2 | `feat/turno-retiro-frontend` | 5 | ~225 | 25 | Merged to `renew-2026` |

## Spec delta applied

- **NEW spec**: `turn-category` → created at `openspec/specs/turn-category/spec.md` (9 REQs, 9 scenarios)
- **NEW spec**: `service-turn-compatibility` → created at `openspec/specs/service-turn-compatibility/spec.md` (9 REQs, 10 scenarios)
- **MODIFIED spec**: `turn-week-loading` → delta appended (2 new requirements: category-aware cache keys + tight rollback payload)

## Pre-existing issues (not from this change)

- `turns.visibility.test.js`: 7 failures (fake-timer timeouts) — unchanged
- `RegistrationToggle.test.js`: 4 failures — unchanged

## Out of scope (explicitly deferred)

- `category` on Service model (user decision: not needed)
- `duration` on Turn model (user decision: not needed)
- DESIGN.md token documentation for violet (deferred to after visual validation)
- General "color per service" system (future feature, noted by user)

## Lessons learned

1. **SWR cache collision is real**: When a client switches between services in the same week, the cache key MUST include the category. This was discovered during the explore phase and fixed in PR 2.
2. **Rollback payload clobber**: Sending `{...selectedTurn, state: "Disponible"}` on error can overwrite concurrent admin edits. Tightening to `{state: "Disponible"}` is a defensive fix that should be applied broadly.
3. **Spec ↔ implementation message drift**: The spec defined exact Spanish error messages for the 400 guard, but the apply phase used slightly different strings. The verify phase caught this and it was fixed before merge.
4. **`for` vs `htmlFor` anti-pattern**: The codebase has multiple instances of `for` instead of `htmlFor` on `<label>` elements, which generates React console warnings. A cleanup PR would be valuable.
5. **Chained PRs work well for this project**: Splitting backend and frontend into separate PRs kept each under the 400-line review budget and allowed independent review. The stacked-to-main strategy worked cleanly.
