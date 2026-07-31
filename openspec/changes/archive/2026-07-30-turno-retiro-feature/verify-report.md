# Verify Report: turno-retiro-feature PR 1 (backend)

## Status
- CRITICAL issues: 1
- WARNING issues: 2
- SUGGESTION issues: 2
- Verdict: **NEEDS FIXES**

## Spec coverage (PR 1 only)

| Capability | REQs covered | Scenarios covered | Verdict |
|------------|-------------|-------------------|---------|
| turn-category | REQ-CAT-01, 02, 03, 08 | SC-CAT-01, 02, 03 | ✅ |
| service-turn-compatibility | REQ-STC-01..07, 09 | SC-STC-01..07, 10 | ⚠️ (message mismatch on REQ-STC-07) |
| turn-week-loading (delta) | — (all frontend) | — (all frontend) | ⏳ deferred to PR 2 |

### Scenario-level mapping (PR 1 backend)

| Scenario | Layer | Test file | Status |
|----------|-------|-----------|--------|
| SC-CAT-01: Admin creates normal turn | Model default | `turn.model.test.js` | ✅ PASS |
| SC-CAT-02: Admin creates retiro turn | Model persist | `turn.model.test.js` | ✅ PASS |
| SC-CAT-03: Legacy doc defaults to 'normal' | Mongoose default | `turn.model.test.js` | ✅ PASS |
| SC-CAT-04..09 | Frontend | — | ⏳ PR 2 |
| SC-STC-01: Retiro svc + retiro turn → 201 | dates.create | `dates.test.js` | ✅ PASS |
| SC-STC-02: Retiro svc + normal turn → 400 | dates.create | `dates.test.js` | ⚠️ message mismatch |
| SC-STC-03: Non-Retiro svc + retiro turn → 400 | dates.create | `dates.test.js` | ⚠️ message mismatch |
| SC-STC-04: Guest ?category=retiro filter | turns.list | `turns.test.js` | ✅ PASS |
| SC-STC-05: Guest ?category=normal filter | turns.list | `turns.test.js` | ✅ PASS |
| SC-STC-06: Admin no param sees both | turns.list | `turns.test.js` | ✅ PASS |
| SC-STC-07: Admin ?category=retiro sees both | turns.list | `turns.test.js` | ✅ PASS |
| SC-STC-08..09 | Frontend cache key | — | ⏳ PR 2 |
| SC-STC-10: dates.update same guard | dates.update | `dates.test.js` | ⚠️ message mismatch |
| SC-TWL-* (all) | Frontend | — | ⏳ PR 2 |

## Test results

| Suite | Tests | Passing | Notes |
|-------|-------|---------|-------|
| `turn.model.test.js` | 3 | 3 | NEW file |
| `turns.test.js` | 8 | 8 | 5 new + 3 existing |
| `dates.test.js` | 5 | 5 | NEW file |
| **New tests total** | **16** | **16** | All green |
| Full backend suite | 113 | 106 pass / 7 fail | 7 failures are pre-existing |
| Pre-existing failures | 7 | — | `turns.visibility.test.js` fake-timer timeouts — UNCHANGED |
| New regressions | 0 | — | No new failures introduced |

## Commit hygiene

- [x] Tests ship with code (work-unit rule) — each commit includes its test file
- [x] Conventional commits — `feat(turn):`, `feat(turns):`, `feat(dates):`
- [x] No AI attribution — no "Co-Authored-By" in any commit
- [ ] No scope overflow — see WARNING #1 (extra SDD/tooling commits on branch)

## CRITICAL issues (must fix before merge)

### C1: Error message text deviates from spec (REQ-STC-07)

**Spec says (exact strings):**
- Retiro service + normal turn → `"El servicio Retiro solo puede reservarse en turnos marcados como retiro"`
- Non-Retiro service + retiro turn → `"El servicio no es de retiro y no puede reservarse en un turno de retiro"`

**Implementation says (`dates.controllers.js:29-31`):**
- Retiro service + normal turn → `"El servicio Retiro solo puede reservarse en turnos marcados como retiro."` (adds trailing period)
- Non-Retiro service + retiro turn → `"Los turnos marcados como retiro solo admiten el servicio Retiro."` (completely different wording + trailing period)

**Impact:** The second message is semantically similar but lexically different from the spec. The spec uses RFC 2119 MUST with exact quoted strings. Tests also assert the implementation's wording, so they pass — but they verify the wrong text.

**Fix:** Change `dates.controllers.js:31` to `'El servicio no es de retiro y no puede reservarse en un turno de retiro'` and update `dates.test.js:127` to match. Decide on trailing period policy (spec has none).

## WARNING issues (should fix before merge)

### W1: Extra non-feature commits on the branch

The branch `feat/turno-retiro-feature` contains 5 commits since `origin/renew-2026`, but only 3 are feature commits:

| Commit | In PR 1? |
|--------|----------|
| `5556f32` chore(tools): refresh skill registry | ❌ tooling |
| `10da3d2` feat(turn): add category enum | ✅ |
| `76b56b1` feat(turns): filter list by category | ✅ |
| `e0f8636` feat(dates): enforce compatibility guard | ✅ |
| `ae6b343` docs(sdd): mark phases 1-3 tasks complete | ❌ SDD artifact |

**Recommendation:** When creating the PR, either (a) use `--base renew-2026` and accept all 5 commits (the 2 extras are harmless), or (b) rebase to exclude them. The `openspec/` changes in `ae6b343` are internal SDD bookkeeping and arguably shouldn't ship in a feature PR.

### W2: Trailing period inconsistency in error messages

The implementation adds `.` to both 400 messages, but the spec strings don't include periods. Existing project error messages (e.g., `'Turno no encontrado'` at `turns.controllers.js:108`) do NOT use trailing periods. The added periods are inconsistent with project convention.

## SUGGESTION issues (nice to have)

### S1: `validCategories` whitelist is a defensive improvement

`turns.controllers.js:51,57` adds a `validCategories = ['normal', 'retiro']` check that silently ignores invalid category params (test: "ignores an invalid category query param"). This is NOT in the spec (spec says "when the param is present" → filter) but is good defensive coding. Worth documenting in a comment so a future dev doesn't remove it thinking it's dead code.

### S2: `turnsService.list` backward-compatibility is clever but complex

The `web/src/services/turns.js` signature change handles 3 calling conventions (legacy signal, positional category+signal, object params). This is well-intentioned for backward compatibility, but the branching logic (lines 8-28) is non-trivial for a simple URL builder. Consider simplifying in PR 2 once all callers migrate to the new form.

## Design coherence

| Design Decision | Implementation | Verdict |
|-----------------|---------------|---------|
| §2.1: `category` enum + compound index | `turn.model.js:18-22, 39` | ✅ Matches |
| §2.3: No `Service` model changes | No `service.model.js` diff | ✅ Matches |
| §2.3: Comment documenting `name === "Retiro"` coupling | `dates.controllers.js:8-9` | ✅ Matches |
| §3.2: `assertServiceTurnCompatibility` helper | `dates.controllers.js:12-34` | ✅ Matches (message differs) |
| §3.4: Admin bypass on `?category=` | `turns.controllers.js:57` | ✅ Matches |
| §3.4: Date ceiling logic untouched | No change to ceiling block | ✅ Matches |
| §4.3: `turnsService.list` backward-compatible | `web/src/services/turns.js` | ✅ Matches (3-form support) |
| §8: Work-unit commits (C1-C3) | 3 feature commits | ✅ Matches |

## Files inspected

- `api/models/turn.model.js` (modified)
- `api/__tests__/models/turn.model.test.js` (new)
- `api/controllers/turns.controllers.js` (modified)
- `api/__tests__/controllers/turns.test.js` (extended)
- `api/controllers/dates.controllers.js` (modified)
- `api/__tests__/controllers/dates.test.js` (new)
- `web/src/services/turns.js` (modified)
- `openspec/changes/turno-retiro-feature/spec.md`
- `openspec/changes/turno-retiro-feature/design.md`
- `openspec/changes/turno-retiro-feature/tasks.md`

## Verdict

**NEEDS FIXES** — One CRITICAL issue: the second 400 error message (`REQ-STC-07`) deviates from the spec's exact string. The fix is a one-line change in `dates.controllers.js:31` plus the corresponding test assertion update in `dates.test.js:127`. Once fixed, PR 1 is ready to merge. The 2 WARNINGs (extra commits, trailing periods) are minor and can be addressed at the user's discretion.
