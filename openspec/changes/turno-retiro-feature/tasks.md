# Tasks: Turno Retiro Category

## Review Workload Forecast

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium
Delivery strategy: auto-forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~410 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR1 (C1-C3 backend) → PR2 (C4-C7 frontend) |
| Chain strategy | stacked-to-main (size near 400, backend/frontend cleanly separable) |
| Decision needed before apply | No (auto-forecast → orchestrator proceeds with first slice) |

Rationale: design §8 already splits into 7 review-sized commits spanning 14 files across backend + frontend; total sits right at the 400-line budget, so two stacked PRs (backend slice, then frontend slice) keeps each review focused and revertible.

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Model + backend filter + 400 guard | PR 1 | base = main; backend-only, fully testable |
| 2 | Admin toggle/dot/legend + guest violet + cache/rollback + modal | PR 2 | base = PR 1 branch; frontend-only on top of backend contracts |

## Phase 1: Model + persistence (Commit 1)

- [x] 1.1 RED — Create `api/__tests__/models/turn.model.test.js`: assert `Turn.create({date,hour}).category === 'normal'` and that `'express'` is rejected with validation error. Verify `cd api && npm test -- turn.model.test` fails.
- [x] 1.2 GREEN — Edit `api/models/turn.model.js`: add `category:{type:String,enum:['normal','retiro'],default:'normal'}` after `state` + compound index `{date:1,category:1}`. Verify GREEN.
- [x] 1.3 REFACTOR — Add `Turn.create({category:'retiro'})` persists retiro test. Verify still GREEN.
- [x] 1.4 Commit — `feat(turn): add category enum on Turn model` (code + tests together).

## Phase 2: Backend list filter (Commit 2)

- [x] 2.1 RED — Extend `api/__tests__/controllers/turns.test.js`: seed 2 normal + 2 retiro turns; SC-STC-04 guest `?category=retiro` returns only retiro; SC-STC-05 `?category=normal`; SC-STC-06 admin no param sees both; SC-STC-07 admin with `?category=retiro` still sees both. Verify RED.
- [x] 2.2 GREEN — Edit `api/controllers/turns.controllers.js::list`: after ceiling block, `if(!isAdmin && req.query.category) criterial.category = req.query.category`. Verify GREEN.
- [x] 2.3 RED — Add `api/__tests__/services/turns.test.js` (or extend existing): `turnsService.list(date,end,'retiro',signal)` appends `&category=retiro`; absent category does NOT append. Verify RED.
- [x] 2.4 GREEN — Edit `web/src/services/turns.js`: `list(date,endDate,category,signal)` appends `&category=` only when truthy. Verify GREEN.
- [x] 2.5 Commit — `feat(turns): backend filtering by category query param`.

## Phase 3: dates 400 guard (Commit 3)

- [x] 3.1 RED — Create `api/__tests__/controllers/dates.test.js` (NEW) following `db-handler` setup; tests for SC-STC-02 (Retiro svc + normal turn → 400 with `"El servicio Retiro solo puede reservarse en turnos marcados como retiro"`, no Date persisted), SC-STC-03 (non-Retiro svc + retiro turn → 400 with `"El servicio no es de retiro y no puede reservarse en un turno de retiro"`), SC-STC-01 (Retiro svc + retiro turn → 201). Verify RED.
- [x] 3.2 GREEN — Add `assertServiceTurnCompatibility(turnId, serviceId)` helper to `api/controllers/dates.controllers.js` (with comment documenting `name === "Retiro"` coupling per design §2.3); call in `create` BEFORE `Date.create`. Verify GREEN.
- [x] 3.3 RED — Add test for SC-STC-10: `dates.update` Rejectiro svc / normal-turn pair → 400 before persist, existing Date unchanged. Verify RED.
- [x] 3.4 GREEN — Apply same helper to `dates.update` before `Object.assign + save`, using `req.body.turn ?? req.date.turn` and `req.body.service ?? req.date.service`. Verify GREEN.
- [x] 3.5 Commit — `feat(dates): reject service-turn category mismatch with 400`.

## Phase 4: Admin toggle + dot + legend (Commit 4)

- [ ] 4.1 RED — Create/extend `web/src/__tests__/components/turns/turns-form/TurnsForm.test.jsx`: SC-CAT-01 unchecked submit → payload `category:'normal'`; SC-CAT-02 checked → `category:'retiro'`. Verify RED.
- [ ] 4.2 GREEN — Edit `web/src/components/turns/turns-form/TurnsForm.jsx`: add toggle `Es turno de retiro` (Spanish label, `text-base`, ≥16px); register `category` (`'retiro'` when checked else `'normal'`). Verify GREEN.
- [ ] 4.3 RED — Create/extend `web/src/__tests__/components/turns/turn-item-admin/TurnItemAdmin.test.jsx`: SC-CAT-08 `Solicitado` + retiro renders `bg-yellow-500` state AND a `bg-violet-500` dot/badge; normal renders no violet dot. Verify RED.
- [ ] 4.4 GREEN — Edit `web/src/components/turns/turn-item-admin/TurnItemAdmin.jsx`: add `<span className="w-2 h-2 rounded-full bg-violet-500 absolute top-1 right-1" />` when `turn.category === 'retiro'`, as sibling of state-colored div (do NOT override state color). Verify GREEN.
- [ ] 4.5 RED — Extend `web/src/__tests__/components/turns/turns-color-explication/TurnsColorsExplication.test.jsx`: SC-CAT-09 a `bg-violet-400` swatch labeled `"Retiro"` is present. Verify RED.
- [ ] 4.6 GREEN — Edit `web/src/components/turns/turns-color-explication/TurnsColorsExplication.jsx`: add retiro legend row (`bg-violet-400` swatch + "Retiro" label). Verify GREEN.
- [ ] 4.7 Commit — `feat(turns): admin create toggle, violet dot badge, legend swatch`.

## Phase 5: Guest violet override (Commit 5)

- [ ] 5.1 RED — Create/extend `web/src/__tests__/components/turns/turn-item-guest/TurnItemGuest.test.jsx`: SC-CAT-06 retiro + Disponible → className includes `bg-violet-400` and NOT `bg-pink-400`; SC-CAT-07 retiro + non-Disponible → existing `bg-gray-400` occupied treatment, NO violet. Verify RED.
- [ ] 5.2 GREEN — Edit `web/src/components/turns/turn-item-guest/TurnItemGuest.jsx`: when `Disponible` + `category==='retiro'` use `bg-violet-400` (selected: `bg-violet-600 ring-2 ring-violet-400`); non-Disponible unchanged. Verify GREEN.
- [ ] 5.3 Commit — `feat(turns): guest violet override for retiro Disponible slots`.

## Phase 6: Cache + rollback (Commit 6)

- [ ] 6.1 RED — Extend `web/src/__tests__/components/turns/turn-list-by-week/TurnListByWeek.test.jsx`: SC-STC-08 `service.name==='Retiro'` → `turnsService.list` called with `category='retiro'` and cache key `2026-08-03:retiro`; SC-STC-09 non-Retiro → `category='normal'` key `2026-08-03:normal`; SC-TWL-ADD-01 switch service on same week triggers new fetch (no reused slot); SC-TWL-MOD-02 changing category refetches once. Verify RED.
- [ ] 6.2 GREEN — Edit `web/src/components/turns/turn-list-by-week/TurnListByWeek.jsx`: accept `category` prop; `turnsCache[\`${initDate}:${category}\`]`; include `category` in `useEffect` deps. Verify GREEN.
- [ ] 6.3 GREEN — Edit `web/src/components/dates/dates-form/DatesForm.jsx`: `const category = service?.name === 'Retiro' ? 'retiro':'normal'`; thread to `CalendarPanel` → `TurnListByWeek`; thread `category` through `web/src/components/dates/calendar-panel/CalendarPanel.jsx`. Verify GREEN.
- [ ] 6.4 RED — Extend `web/src/__tests__/components/dates/dates-form/DatesForm.test.jsx`: SC-TWL-ADD-03 — when `Date.create` rejects with 400, `turnsService.update` rollback mock called with payload exactly `{ state:"Disponible" }` (no `category` field). Verify RED.
- [ ] 6.5 GREEN — Edit `web/src/components/dates/dates-form/DatesForm.jsx`: change rollback line `turnsService.update(selectedTurn.id, { state:"Disponible" })` (remove `...selectedTurn`). Verify GREEN.
- [ ] 6.6 Commit — `fix(dates): category-aware guest cache key + tight rollback payload`.

## Phase 7: Confirmation modal (Commit 7)

- [ ] 7.1 RED — Extend `web/src/__tests__/components/turns/turn-detail-and-update/TurnDetailAndUpdate.test.jsx`: SC-CAT-04 — turn `category:'normal'` linked to a `Date` state `'Solicitada'`; change category to `'retiro'` and submit → Modal appears AND `turnsService.update` is NOT called until confirm; on confirm → update fires with `category:'retiro'`. SC-CAT-05 — no linked Date → no Modal, update fires directly. Verify RED.
- [ ] 7.2 GREEN — Edit `web/src/components/turns/turn-detail-and-update/TurnDetailAndUpdate.jsx`: add `<select id="category" className="text-base">` with Spanish labels `Normal`/`Retiro`, values `'normal'`/`'retiro'`; seed initial category; intercept `handleSubmit`: if `category !== initialCategory && turn.dateData && turn.dateData.state !== 'Cancelada'` → open `Modal` (reuse existing `Modal` import); confirm → `onTurnSubmit`. Verify GREEN.
- [ ] 7.3 REFACTOR — Extract modal trigger into a named helper; re-run tests. Verify GREEN.
- [ ] 7.4 Commit — `feat(turns): admin edit category with confirmation modal on active date`.

## Acceptance criteria
- [ ] All 31 scenarios across the 3 spec files pass (turn-category 9, service-turn-compatibility 10, turn-week-loading delta 12).
- [ ] All tests green: `cd api && npm test && cd ../web && CI=true npm test`.
- [ ] No new ESLint warnings.
- [ ] No `100vh` or `h-screen` introduced (use `h-dvh` if any new layout).
- [ ] All new `<input>`/`<select>` use `text-base` (16px) — `category` select + TurnsForm toggle.
- [ ] No new npm dependencies.
- [ ] No `category` added to `Service`; no `duration` added to `Turn`; no DESIGN.md edit.

## Estimated line counts per file (for review budget)

| File | Estimated changed lines |
|------|--------------------------|
| `api/models/turn.model.js` | +8 |
| `api/controllers/turns.controllers.js` | +5 |
| `api/controllers/dates.controllers.js` | +20 |
| `api/__tests__/controllers/turns.test.js` | +30 |
| `api/__tests__/controllers/dates.test.js` (NEW) | ~80 |
| `api/__tests__/models/turn.model.test.js` (NEW) | ~25 |
| `web/src/services/turns.js` | +5 |
| `web/src/components/turns/turns-form/TurnsForm.jsx` | +15 |
| `web/src/components/turns/turn-item-admin/TurnItemAdmin.jsx` | +8 |
| `web/src/components/turns/turn-item-guest/TurnItemGuest.jsx` | +6 |
| `web/src/components/turns/turns-color-explication/TurnsColorsExplication.jsx` | +5 |
| `web/src/components/turns/turn-list-by-week/TurnListByWeek.jsx` | +10 |
| `web/src/components/dates/dates-form/DatesForm.jsx` | +20 |
| `web/src/components/dates/calendar-panel/CalendarPanel.jsx` | +5 |
| `web/src/components/turns/turn-detail-and-update/TurnDetailAndUpdate.jsx` | +25 |
| Various frontend tests | +143 |
| **Total estimated** | **~410** |

## Rollback plan

Seven commits = seven independent revert units. Full-revert order (mirror proposal §Rollback): revert frontend (C7 → C4) → revert frontend cache+rollback (C6) → revert backend validation (C3) → revert backend filter (C2) → revert model field (C1). The `Turn.category` field left in DB on partial revert is harmless (Mongoose `default:'normal'` backfills legacy docs; controller guards treat absent/`undefined` as `'normal'`-equivalent via the `name === "Retiro"` XOR). No production data migration was ever written, so no rollback script is needed.

## Open questions

None — all decisions locked in preflight (color violet-500/400, `name === "Retiro"` match, no Service.category, option B modal, 400 on both create+update, no `duration` on Turn, no DESIGN.md doc, no PWA, no i18n).