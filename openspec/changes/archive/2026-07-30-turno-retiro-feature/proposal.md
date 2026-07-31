# Proposal: Turno Retiro Category

## Intent

The admin (La Vin Nails owner) needs to mark certain appointment Turns as **"retiro"** (pickup) so clients booking the existing 30-min / 5€ "Retiro" Service only see compatible slots, and so retiro turns are visually distinguished from normal turns in both admin and guest views. Today all turns look identical and any service can be booked on any turn, forcing manual coordination and risking mismatches.

## Scope

### In scope
- Add `category: { type: String, enum: ['normal','retiro'], default: 'normal' }` to the `Turn` model (`api/models/turn.model.js`).
- Backend filter `turns.controllers.list` by `req.query.category` (DB-level, propagated through `turnsService.list`).
- Backend validation in `dates.controllers.create` AND `dates.controllers.update`: reject HTTP 400 when `service.name === "Retiro"` ⇏ `turn.category === "retiro"` (and vice versa).
- Admin create: `TurnsForm` adds a category toggle (Normal / Retiro).
- Admin edit: `TurnDetailAndUpdate` adds a `category` `<select>`; if category changes AND an active Date (cita) exists on the turn, a confirmation `Modal` warns before save.
- Visual: `TurnItemGuest` overrides the available-slot color to `bg-violet-400` for `category === 'retiro'`. `TurnItemAdmin` shows a violet dot/badge on top of the existing state color (no palette override).
- Legend: `TurnsColorsExplication` adds the retiro swatch for guests.
- Cache identity fix: `TurnListByWeek` guest cache key becomes `${initDate}:${category}` to avoid collision when switching services mid-week.
- Rollback fix: `DatesForm.jsx` error-rollback sends only `{ state: "Disponible" }` (not `{...selectedTurn, state:"Disponible"}`) to avoid clobbering a concurrent admin category edit.
- Strict TDD: every behavior gets tests first, per `openspec/config.yaml` (`tdd: true`).

### Out of scope
- Adding `category` (or any field) to the `Service` model — Service stays untouched. Compatibility is decided by `service.name === "Retiro"` on both client filter and backend validation.
- Adding a `duration` field to `Turn` — admin sets duration on the Date, existing behavior.
- General per-service color system (violet is reserved for retiro only).
- Documentation of the violet token in `DESIGN.md` — deferred to a later visual-validation step (user decision).
- PWA / service worker changes — confirmed SW does NOT cache API calls.
- i18n — no setup exists; all new UI strings stay in hardcoded Spanish.

## Capabilities

### New Capabilities
- `turn-category`: classifies each `Turn` as `normal` or `retiro`; defines the enum, defaults, admin create/edit surface, and visual differentiation rules.
- `service-turn-compatibility`: backend enforcement that a `Retiro` service can only be booked on a `retiro` turn (and vice versa), enforced on both `dates.create` and `dates.update`.

### Modified Capabilities
- `turn-week-loading`: guest `TurnListByWeek` cache key gains a `category` dimension so two services booking the same week no longer collide. Admin list keeps `initDate` key (admin shows mixed categories). Rollback fix in `DatesForm` is part of this delta to keep cache/store consistency on error.

## Approach

A single `category` enum field is added to the `Turn` Mongoose model. The client picks the category from the selected Service's `name === "Retiro"` and passes it as `?category=` to `GET /turns/date/:date`; the backend filters DB-side via `criterial.category`. Defense in depth: before persisting a Date, `dates.controllers.create` and `dates.controllers.update` load the referenced Turn + Service and reject (400) any service↔turn category mismatch. The existing `DatesForm` catch block already surfaces backend errors through `modalError`/`serverError` — only its rollback payload is tightened.

Admin UX: `TurnsForm` gains a category toggle for creation; `TurnDetailAndUpdate` gains a `category` select whose change triggers a `Modal` confirmation when an active Date exists on the turn (option B). Visual language: guest view overrides the available-slot bg to `bg-violet-400` for retiro (preserving the availability-coded model); admin view keeps the state-coded palette and adds a violet dot/badge on retiro turns (preserving the state language). Strict TDD is enforced: every behavior above gets a test first (`api/__tests__/controllers/dates.test.js` is a new file; frontend tests extend `TurnDetailAndUpdate.test.js`, add `TurnsForm` category test, `TurnListByWeek` cache-key test, `DatesForm` mismatch-rollback test, and color-class tests for both `TurnItemGuest` and `TurnItemAdmin`).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `api/models/turn.model.js` | Modified | Add `category` enum field (default `'normal'`). |
| `api/controllers/turns.controllers.js` | Modified | `list` reads `req.query.category`; admin role sees all. |
| `api/controllers/dates.controllers.js` | Modified | `create` + `update` validate service↔turn category; 400 on mismatch. |
| `web/src/services/turns.js` | Modified | `list(date, endDate, category, signal)` appends `&category=`. |
| `web/src/components/turns/turns-form/TurnsForm.jsx` | Modified | Category toggle on create. |
| `web/src/components/turns/turn-detail-and-update/TurnDetailAndUpdate.jsx` | Modified | Category select + confirmation modal. |
| `web/src/components/turns/turn-item-guest/TurnItemGuest.jsx` | Modified | `bg-violet-400` for retiro Disponible. |
| `web/src/components/turns/turn-item-admin/TurnItemAdmin.jsx` | Modified | Violet dot/badge on retiro. |
| `web/src/components/turns/turns-color-explication/TurnsColorsExplication.jsx` | Modified | Retiro legend swatch. |
| `web/src/components/turns/turn-list-by-week/TurnListByWeek.jsx` | Modified | Cache key `${initDate}:${category}` (guest only). |
| `web/src/components/dates/dates-form/DatesForm.jsx` | Modified | Pass category to list; rollback sends only `{state}`. |

## Risks

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| 1 | Admin changes category on a Turn with active Date → booking inconsistency | MEDIUM | Confirmation modal before save (user decision); backend still allows admin action. |
| 2 | SWR cache-key change breaks existing bookmarks/deep links | LOW | Cache is in-memory module-level, not persisted. |
| 3 | `violet-500` not in DESIGN.md tokens | LOW | User accepted; document in DESIGN.md after visual validation. |
| 4 | Rollback sends full stale Turn, clobbering concurrent admin category edit | MEDIUM | Fix `DatesForm` rollback to send only `{ state: "Disponible" }`. |
| 5 | `service.name === "Retiro"` is fragile to future renames | LOW | Accepted tradeoff (user locked decision); backend validation is the real guard, not the name. |
| 6 | Existing production Turn docs have no `category` | LOW | Mongoose `default: 'normal'` backfills automatically; no migration script needed. |
| 7 | `dates.update` passthrough allows re-targeting a Date to the other category | MEDIUM | Same validation guard added to `create` AND `update`. |

## Rollback Plan

Revert in three independent steps if needed:
1. **Backend validation reverted**: remove the category checks in `dates.controllers.create/update` — system returns to passthrough behavior (no booking mismatches blocked).
2. **Frontend filter reverted**: `turnsService.list` ignores `category`, `TurnListByWeek` reverts to `initDate` key. The `Turn.category` field remains in the DB but is unused.
3. **Schema field reverted**: drop `category` from `turn.model.js` (Mongoose tolerates the extra field in existing docs; reads return undefined, controller checks become falsy → treated as `'normal'`).

Each step is independently reversible; full revert order: 1 (validation) → 2 (frontend) → 3 (field).

## Dependencies

- Strict TDD active — test runner: `cd api && npm test && cd ../web && CI=true npm test`.
- No new packages required (existing Tailwind tokens, Mongoose, react-hook-form).
- No data migration — Mongoose `default: 'normal'` backfills `Turn` automatically.
- `TurnDetailAndUpdate.test.js` already exists as the frontend test reference pattern; `dates.test.js` is a NEW backend test file.

## Success Criteria

- [ ] Admin can create a Turn flagged `retiro` and it appears with violet-400 in the guest calendar.
- [ ] Client selecting the "Retiro" Service sees only `retiro` turns; selecting any other service sees only `normal` turns.
- [ ] Booking a non-Retiro service on a `retiro` turn (or vice versa) returns HTTP 400 with a clear message, on both `create` and `update`.
- [ ] Switching services mid-week does not show stale turns from the other category (cache key includes category).
- [ ] Admin changing a category on a Turn that has an active Date triggers a confirmation modal before save.
- [ ] Rollback on booking error changes only `turn.state` (never clobbers a concurrent admin category edit).
- [ ] All behaviors pass `cd api && npm test && cd ../web && CI=true npm test`.

## Estimated size

Rough estimate: **~250-350 lines changed across 11 files**, fitting a single PR under the 400-line review budget — to be confirmed in the tasks phase.