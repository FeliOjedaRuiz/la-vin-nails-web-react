# Verify Report: Block Users Admin

**Change**: `block-users-admin`
**Project**: `web-la-vin-nails-react`
**Verification date**: 2026-07-05
**Verifier**: SDD verify phase

---

## CRITICAL (must fix before merge)

### C-01: Wrong `AuthContext` import crashes the feature at runtime

**Files**: `web/src/components/users/user-item/UserItem.jsx` (line 3), `web/src/components/users/user-profile/UserProfile.jsx` (line 2)

**Issue**: Both files import `AuthContext` as the **default** export from `AuthStore`:
```javascript
import AuthContext from "../../../contexts/AuthStore";   // WRONG
```

But `AuthStore.js` exports `AuthContext` as a **named** export, and the default export is the `AuthStore` component itself:
```javascript
export { AuthStore as default, AuthContext };
```

Every other file in the project (20+ components) correctly uses the named import:
```javascript
import { AuthContext } from "../../../contexts/AuthStore";  // CORRECT
```

**Impact**: `useContext(AuthContext)` in both components receives the `AuthStore` **component** (not the React context object). React's `useContext` cannot destructure this, returns `undefined`, and the destructuring `const { user: adminUser } = useContext(AuthContext)` throws:
> TypeError: Cannot destructure property 'user' of '(0 , _react.useContext)(...)' as it is undefined.

This **completely breaks** the block toggle UI in production. The badge, the toggle button, and the modal are all gated behind `isAdmin = adminUser && adminUser.role === "admin"` where `adminUser` will always be `undefined`.

**Evidence**:
1. All 11 frontend tests in `UserItem.test.js` fail with this exact error.
2. The project-wide convention (22 occurrences) consistently uses named import `{ AuthContext }`.
3. The two new files were the only ones using the default import.

**Fix**: Change both files to:
```javascript
import { AuthContext } from "../../../contexts/AuthStore";
```

---

## WARNING (should fix before merge)

### W-01: Silent error swallowing on toggle failure

**Files**: `web/src/components/users/user-item/UserItem.jsx` (lines 32-34), `web/src/components/users/user-profile/UserProfile.jsx` (lines 34-36)

**Issue**: When `toggleBlock` fails (network error, 500, 400 self-block), the `.catch()` handler silently ignores the error:
```javascript
.catch(() => {
  // keep previous state, error handled by caller if needed
});
```

The spec (REQ-10 — SHOULD) states: *"show error message, keep previous blocked state"*. No error toast, no alert, no console warning. The user clicks Confirm, the modal closes, and nothing happens — no feedback that an error occurred.

**Evidence**:
- The catch block has only a comment, no user-facing feedback.
- The `handleToggleBlock` in `ProfilePage.jsx` (lines 95-100) also only logs to console on error.
- `UsersSearchComponent.jsx` `fetchUsers()` (line 15) also catches with `console.error(error)` only.

**Recommendation**: Add a toast/alert in the catch handler. Even a simple `alert()` or setting an error state that renders a message would satisfy the SHOULD requirement. Example:
```javascript
.catch((error) => {
  const msg = error?.response?.data?.error || 'Error al cambiar estado. Intenta de nuevo.';
  alert(msg); // or use a toast component
});
```

### W-02: `ProfilePage` only logs errors when refetching after toggle

**File**: `web/src/pages/ProfilePage.jsx` (lines 95-100)

**Issue**: The `onToggleBlock` handler refetches the user on success, but on failure only logs to console:
```javascript
.catch((error) => console.error(error));
```

A refetch failure after a successful toggle will leave the UI showing stale data. While this is a minor edge case, there should be at least a notification.

**Recommendation**: Show a user-facing message if the refetch fails, or set user state from the toggle response directly.

### W-03: No frontend test coverage for `UserProfile` block controls

**File**: No test file exists for `UserProfile` block toggle functionality.

**Issue**: The `UserProfile` component has block toggle logic (badge + button + modal + `onToggleBlock` prop gate), but there are no frontend tests for it. The tasks (5.3) only specify `UserItem` tests.

**Recommendation**: Add tests for `UserProfile` similar to `UserItem.test.js` covering:
- Badge renders when `user.blocked` is true
- Badge hidden when `user.blocked` is false
- Button renders when `onToggleBlock` is provided (admin)
- Button hidden when `onToggleBlock` is not provided (guest/backward-compat)
- Modal opens/closes correctly

### W-04: Pre-existing frontend test infrastructure issues

**Evidence**: The overall frontend test suite shows:
- **3 failed suites, 15 failed tests** (13 passed, 50 tests passed)
- `TurnDetailAndUpdate.test.js` — FAIL (pre-existing, unrelated to this change)
- `RegistrationToggle.test.js` — FAIL (pre-existing, unrelated to this change)
- `UserItem.test.js` — FAIL (11 tests fail — directly caused by C-01)

The pre-existing failures were not introduced by this change, but the `UserItem.test.js` failures will be resolved when C-01 is fixed.

**Recommendation**: After fixing C-01, re-run `cd web && npm test` to confirm UserItem tests pass. The two pre-existing failures should be addressed separately.

---

## SUGGESTION (nice to have)

### S-01: Add `runValidators` to `findByIdAndUpdate`

**File**: `api/controllers/users.controllers.js` (line 91)

**Issue**: The `toggleBlock` controller uses `findByIdAndUpdate` (bypassed Mongoose full validation to avoid password hash length issues). Consider adding `{ runValidators: true, context: 'query' }` to validate the `blocked` field type. Currently low risk since `blocked` is a boolean, but a future schema change could introduce validation rules on it.

**Recommendation**: No change needed now. Documented for awareness.

### S-02: Add integration test for full toggle-block flow

**Tasks reference**: 5.4 (Integration test)

**Issue**: The tasks specify an integration test (Supertest — full flow: admin blocks user → user login returns 403 → admin unblocks → user login returns 200), but no file appears to exist for it.

**Recommendation**: Add `api/__tests__/controllers/users.toggle-block.integration.test.js` using Supertest to verify the full HTTP flow end-to-end.

### S-03: Backend toggle-block tests don't verify the response JSON structure

**File**: `api/__tests__/controllers/users.toggle-block.test.js`

**Issue**: The 200-response tests only verify `data.blocked` but don't verify that other expected fields (name, email, role, etc.) are present in the response. The API contract specifies returning the full user object.

**Recommendation**: Assert on additional response fields to match the API contract more precisely.

---

## Task Completion Status

| Task | Status | Notes |
|------|--------|-------|
| **Phase 1: Backend Foundation** | | |
| 1.1 Add `blocked` field to User model | ✅ Complete | `user.model.js` line 48-51 — `type: Boolean, default: false` |
| 1.2 Add `toggleBlock` controller | ✅ Complete | `users.controllers.js` line 86-93 — self-block guard (400), flips blocked, `findByIdAndUpdate` |
| 1.3 Add blocked-user guard in login | ✅ Complete | `users.controllers.js` line 29-33 — 403 with blocked message after password validation |
| 1.4 Add `PATCH /users/:userId/toggle-block` route | ✅ Complete | `routes.config.js` line 59-64 — chained with `secure.isAdmin` + `usersMid.clientExists` |
| 1.5 Manual verify (endpoint) | ✅ Complete | Backend tests confirm behavior. All 10 API test suites pass. |
| **Phase 2: Frontend Service Layer** | | |
| 2.1 Add `toggleBlock(userId)` service method | ✅ Complete | `web/src/services/users.js` line 18 — `http.patch(...)` |
| **Phase 3: Frontend UI — UserItem** | | |
| 3.1 Add badge + button + modal to UserItem | ❌ Blocked by C-01 | Code structure complete (badge, button, modal, stopPropagation, local modalState). **But import bug prevents any of it from working at runtime.** |
| 3.2 Forward `onToggleBlock` through UsersList → UsersSearchComponent | ✅ Complete | `UsersList.jsx` line 8 passes prop. `UsersSearchComponent.jsx` line 26-28 calls `fetchUsers()` on toggle. |
| 3.3 Manual verify (UserItem block flow) | ❌ Blocked by C-01 | Cannot verify because `useContext(AuthContext)` crashes at runtime. |
| **Phase 4: Frontend UI — UserProfile** | | |
| 4.1 Add `onToggleBlock` optional prop to UserProfile | ❌ Blocked by C-01 | Code structure complete (prop gate, badge, button, modal). **But import bug prevents it from working.** |
| 4.2 Pass `onToggleBlock` from ProfilePage | ✅ Complete | `ProfilePage.jsx` line 93-100 — calls `toggleBlock`, refetches user on success |
| 4.3 Manual verify (UserProfile block flow) | ❌ Blocked by C-01 | Cannot verify because `useContext(AuthContext)` crashes at runtime. |
| **Phase 5: Automated Testing** | | |
| 5.1 API unit: toggleBlock controller | ✅ Complete | `api/__tests__/controllers/users.toggle-block.test.js` — 3 tests: normal toggle, unblock, self-block 400. All pass. |
| 5.2 API unit: login blocked scenarios | ✅ Complete | Same file — 3 tests: blocked+correct 403, blocked+wrong 401, unblocked 200+JWT. All pass. |
| 5.3 FE unit: UserItem badge/button/modal | ❌ Blocked by C-01 | Test file exists (`UserItem.test.js` — 11 well-written tests). All fail because `AuthContext` import is wrong in the component. |
| 5.4 Integration: Supertest full flow | 🔲 Pending | No integration test file found. The backend unit tests cover the controller logic but not the HTTP layer. |

---

## Test Results

### Backend tests (`cd api && npm test`)

| Suite | Result | Tests |
|-------|--------|-------|
| `__tests__/controllers/users.toggle-block.test.js` | ✅ PASS | 6/6 |
| `__tests__/models/user.test.js` (blocked field tests) | ✅ PASS | 2/2 (part of 13 total) |
| All other suites (8 suites) | ✅ PASS | All pass |
| **Total** | **10/10 suites pass** | **All tests pass** |

### Frontend tests (`cd web && npx react-scripts test --watchAll=false`)

| Suite | Result | Tests | Notes |
|-------|--------|-------|-------|
| `__tests__/components/users/UserItem.test.js` | ❌ FAIL | 0/11 | All fail due to C-01 (wrong import) |
| Pre-existing failures (2 suites) | ❌ FAIL | Unrelated to this change | |
| Remaining suites (13 suites) | ✅ PASS | | |
| **Total** | **13 pass, 3 fail** | **50 pass, 15 fail** | **11 failures directly caused by C-01** |

---

## Spec Compliance

| ID | Requirement | RFC | Status | Evidence |
|----|------------|-----|--------|----------|
| REQ-01 | `blocked` field on User model | MUST | ✅ Compliant | `user.model.js:48-51` |
| REQ-02 | `PATCH /users/:userId/toggle-block` admin endpoint | MUST | ✅ Compliant | `routes.config.js:59-64`, `users.controllers.js:86-93` |
| REQ-03 | Login rejects blocked users (403) | MUST | ✅ Compliant | `users.controllers.js:29-33` |
| REQ-04 | `GET /users` response includes `blocked` | MUST | ✅ Compliant | `list` returns all fields via `User.find()` |
| REQ-05 | `users.toggleBlock(id)` frontend service | MUST | ✅ Compliant | `users.js:18` |
| REQ-06 | `UserItem` block toggle button + badge | MUST | ❌ **Broken** | Code written correctly but C-01 prevents runtime execution |
| REQ-07 | `UserProfile` block toggle (prop-gated) + badge | MUST | ❌ **Broken** | Code written correctly but C-01 prevents runtime execution |
| REQ-08 | Confirmation modal | MUST | ✅ Compliant | Code structure in both UserItem and UserProfile (but blocked by C-01) |
| REQ-09 | Admin self-block prevention (400) | MUST | ✅ Compliant | Backend: `users.controllers.js:87-88`. Frontend: silent catch (W-01) |
| REQ-10 | Error handling preserves UI state | SHOULD | ⚠️ Partial | State preserved (no re-render changes it), but no error feedback shown (W-01) |

## Design Compliance

| Decision | Choice | Status | Evidence |
|----------|--------|--------|----------|
| 1 | Use `usersMid.clientExists` (sets `req.clientUser`) | ✅ Compliant | `routes.config.js:62` |
| 2 | Self-block check in controller | ✅ Compliant | `users.controllers.js:87` — `req.user.id !== req.clientUser.id` |
| 3 | Modal state — component-local | ✅ Compliant | `UserItem:useState(false)`, `UserProfile:useState(false)` |
| 4 | Badge color — pink (not red) | ✅ Compliant | `text-pink-600 bg-pink-100` in both UserItem and UserProfile |
| 5 | Button inside `<Link>` with `e.stopPropagation() + e.preventDefault()` | ✅ Compliant | `UserItem.jsx:19-21` |
| API contract: 200, 400, 401, 403, 404 responses | ✅ Compliant | Controller + middleware chain covers all |
| Styling: badge label "Bloqueada", pill shape | ✅ Compliant | `UserItem.jsx:51` |
| Login 403 message | ✅ Compliant | `users.controllers.js:31` |

---

## Overall Verdict

### ❌ FAIL

**One CRITICAL issue must be fixed before this feature can be merged.**

C-01 is a showstopper: both `UserItem` and `UserProfile` import `AuthContext` as the default export instead of the named export. This causes `useContext(AuthContext)` to receive the `AuthStore` component instead of the actual React context object, crashing the entire frontend UI feature at runtime.

**Summary**:
- **CRITICAL**: 1 issue (blocks all frontend functionality)
- **WARNING**: 4 issues (should fix before merge)
- **SUGGESTION**: 3 issues (nice to have)

**What works correctly (backend is solid)**:
- ✅ User model `blocked` field with correct defaults
- ✅ `toggleBlock` controller with self-block prevention and `findByIdAndUpdate`
- ✅ Login guard rejects blocked users (403) after password validation
- ✅ Route chained with `secure.isAdmin` + `usersMid.clientExists`
- ✅ Frontend `toggleBlock` service method
- ✅ `onToggleBlock` prop forwarding through component tree
- ✅ All 10 backend test suites pass (6 new toggle-block tests)
- ✅ All design decisions correctly implemented

**Next recommended phase**: Fix CRITICAL issue C-01, then re-verify. After all CRITICAL and WARNING issues are addressed, proceed to `sdd-archive`.

---

## How to Fix C-01

In **both** files:

**`web/src/components/users/user-item/UserItem.jsx`** (line 3):
```diff
- import AuthContext from "../../../contexts/AuthStore";
+ import { AuthContext } from "../../../contexts/AuthStore";
```

**`web/src/components/users/user-profile/UserProfile.jsx`** (line 2):
```diff
- import AuthContext from "../../../contexts/AuthStore";
+ import { AuthContext } from "../../../contexts/AuthStore";
```

After the fix, run:
```bash
cd web && npx react-scripts test --watchAll=false --testPathPattern="UserItem"
```

All 11 tests should pass (the other 2 failing suites are pre-existing and unrelated).
