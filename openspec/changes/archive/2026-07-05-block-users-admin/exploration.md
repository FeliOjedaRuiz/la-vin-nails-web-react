# Exploration: block-users-admin

> Admin ability to block/unblock users from the clients list and client profile view, with confirmation modal.
> Originally scoped as "delete-users-admin" — pivoted to block/unblock during the proposal phase to avoid orphan data risk.

---

## 1. Current State — Users Area Map

### 1.1 Component Tree & Data Flow

```
AdminPage (/admin)
  └─ AccordionItem "Listado de Clientas"
       └─ UsersSearchComponent          ← fetches: UsersService.list() → users[]
            ├─ UsersSearchBar            ← filters by name (client-side)
            └─ UsersList ({users})
                 └─ UserItem ({user})    ← <Link to={`/users/${user.id}`}> full-card link
                      ├─ name + surname  ← text-pink-600, bold
                      ├─ phone
                      └─ email


ProfilePage (/users/:id)  [admin view, PrivateRoute role="admin"]
  └─ Layout
       └─ UserProfile ({user})           ← fetched: UsersService.detail(userId)
            ├─ avatar (Cloudinary default)
            ├─ name + surname
            ├─ phone → WhatsApp link
            └─ email
       └─ Accordions: Gallery (PhotoUpload+NailPhotoGalery), Dates (DateDetailAdmin), Settings (empty)

ClientProfilePage (/profile)  [guest view, PrivateRoute]
  └─ Layout
       └─ UserProfile ({user})           ← from AuthContext (logged-in user)
       └─ Accordions: Gallery, Dates (DateDetail), Settings
```

### 1.2 Routing

| Route | Component | Guard | Purpose |
|-------|-----------|-------|---------|
| `/admin` | `AdminPage` | `PrivateRoute role="admin"` | Admin panel with client list accordion |
| `/users/:id` | `ProfilePage` | `PrivateRoute role="admin"` | Admin views a specific client's profile |
| `/profile` | `ClientProfilePage` | `PrivateRoute` (any auth) | Logged-in client views own profile |

### 1.3 UserItem — BLOCK BUTTON ACCESS POINT #1

`web/src/components/users/user-item/UserItem.jsx`

- The entire card is a `<Link>` wrapping all content. Clicking anywhere navigates to `/users/:id`.
- To add a block/unblock button: needs `onClick` with `e.stopPropagation()` and `e.preventDefault()` to avoid navigation.
- The button should only render if the current user is admin (needs `useContext(AuthContext)`).

### 1.4 UserProfile — BLOCK BUTTON ACCESS POINT #2

`web/src/components/users/user-profile/UserProfile.jsx`

- Pure presentational component — receives `user` prop, renders avatar + contact info.
- Used in **both** admin `ProfilePage` and guest `ClientProfilePage`.
- The block button MUST only appear in the admin context. Options:
  - **(A)** Pass an `isAdmin` prop → caller decides visibility.
  - **(B)** Read `AuthContext` inside `UserProfile` and check `user.role`.
  - **(C)** Pass an `onToggleBlock` callback and let the parent render the button.

---

## 2. Users Service Layer

`web/src/services/users.js`

```js
import http from "./base-api";  // axios, base URL from REACT_APP_BASE_API_URL, JWT interceptor

create(user)          → POST /users
login(user)           → POST /login
sendRestoreEmail(e)   → POST /sendRestoreEmail/:email
restorePassword(u,id) → POST /restorepassword/:userId
detail(userId)        → GET /users/:userId
update(userId, user)  → PATCH /users/:userId
list()                → GET /users

// MISSING: toggleBlock method
```

**Action needed**: Add `toggleBlock(userId) => http.patch('/users/${userId}/toggle-block')`.

---

## 3. Backend Users API

### 3.1 Existing Routes

```js
// api/config/routes.config.js (lines 38-58)
router.post('/users', registrationMid.isOpen, users.create);                         // public registration
router.post('/login', users.login);                                                   // public login
router.post('/sendRestoreEmail/:email', usersMid.exists, users.sendRestoreEmail);     // public restore
router.post('/restorepassword/:userId', usersMid.checkUser, users.restorePassword);   // public restore
router.get('/users/:userId', secure.auth, secure.isAuthorized, users.detail);         // auth + own or admin
router.patch('/users/:userId', secure.isAdmin, usersMid.clientExists, users.update);  // admin only
router.get('/users', secure.isAdmin, users.list);                                     // admin only

// MISSING: router.patch('/users/:userId/toggle-block', secure.isAdmin, ... , users.toggleBlock);
```

### 3.2 Existing Controllers

`api/controllers/users.controllers.js`

- `create` — `User.create(req.body)` → 201
- `login` — find by email, check password, sign JWT → { token, ...user }
- `sendRestoreEmail` — finds user by email from middleware, sends restore email
- `restorePassword` — sets password on req.user (from middleware), saves
- `detail` — `User.findById(req.params.userId)` → user
- `update` — `User.findByIdAndUpdate(req.clientUser.id, req.body)` → then re-fetches → updated user
- `list` — `User.find()` → all users
- **MISSING: toggleBlock controller**

### 3.3 Authorization Pattern

```js
// api/middlewares/secure.mid.js
module.exports.isAdmin = (req, res, next) => {
  // Verifies JWT, finds user, checks user.role === "admin"
  // Sets req.user on success, 401 on failure
};
```

Admin users are defined in `process.env.ADMIN_USERS` (comma-separated emails, default: `admin@lavin.org`). The `role` field in the User model is `enum: ["admin", "guest"]` with default `"guest"`.

**Action needed**: New `PATCH /users/:userId/toggle-block` should use `secure.isAdmin` middleware + `usersMid.checkUser` to verify the user exists.

### 3.4 Data Model Relationships (ORPHAN RISK — PIVOTED TO BLOCK)

```
User (model)
  ├── virtual "dates" → Date.user (ObjectId ref)
  ├── referenced by: Photo.user (ObjectId ref, NOT required)
  ├── referenced by: PushSubscription (likely has user ref)
  └── referenced by: Date.user (ObjectId ref)

Turn (model)
  └── No direct user reference (only referenced by Date.turn)
```

**Decision made**: Block instead of delete. Adding a `blocked: Boolean` field preserves all historical data while revoking access. Blocked users cannot log in; admin can toggle the block on/off.

---

## 4. Modal Component Status

### Existing Modal

`web/src/components/modal/Modal.jsx`

```jsx
function Modal({ children, modalState }) {
  return (
    <>
      {modalState && (
        <div className="w-screen fixed p-6 top-0 left-0 bg-black/50 z-20
                        flex justify-center items-center overflow-y-auto"
             style={{ height: '100dvh' }}>
          <div className="bg-gradient-to-tr from-pink-50 to-emerald-50
                          p-6 rounded-lg shadow-2xl flex flex-col justify-around">
            {children}
          </div>
        </div>
      )}
    </>
  );
}
```

**Props accepted:**
- `children` — React nodes (buttons, text — everything inside the modal)
- `modalState` — boolean, controls visibility

**NOT accepted** (but sometimes passed anyway):
- `setModalState`, `onConfirm`, `onCancel`, `title`, `message` — these are NOT destructured. All logic lives inside `{children}` via parent closure.

**Pattern observed in the codebase:**
```jsx
// Parent component
const [modalState, setModalState] = useState(false);

// Trigger button (outside Modal)
<button onClick={() => setModalState(true)}>Block</button>

// Modal with inline content
<Modal modalState={modalState}>
  <p>¿Estás segura?</p>
  <button onClick={() => setModalState(false)}>Cancelar</button>
  <button onClick={handleToggleBlock}>Aceptar</button>
</Modal>
```

**Assessment**: The Modal is sufficient for this feature. No new modal component needed. Follow existing pattern.

---

## 5. Existing Action Patterns Found

### 5.1 Photo Delete (simplest — window.confirm)

`web/src/components/nails-photos/photo-item/PhotoItem.jsx`
```js
function handleDeleteClick(e) {
  e.stopPropagation();
  if (window.confirm('¿Estás segura de que quieres eliminar esta foto?')) {
    onDelete(photo.id);
  }
}
```

### 5.2 Turn Delete (Modal pattern)

`web/src/components/turns/turn-detail-and-update/TurnDetailAndUpdate.jsx`
```js
const [modalState, setModalState] = useState(false);

const handleDeleteTurn = () => {
  turnsService.deleteTurn(id)
    .then(navigateToSchedule)
    .catch((error) => console.error(error));
};

// Modal usage:
<Modal modalState={modalState}>
  <p className="font-bold text-2xl">Eliminar Turno</p>
  <p>¿Quieres eliminar el turno?</p>
  <div onClick={() => setModalState(false)}>Cancelar</div>
  <div onClick={handleDeleteTurn}>Aceptar</div>
</Modal>
```

### 5.3 Date Delete (Modal + service + state update)

`web/src/components/dates/date-detail/DateDetail.jsx`
```js
const handleDeleteDate = () => {
  setModalState(false);
  datesService.deleteDate(date.id)
    .then(updateTurnState)
    .catch(console.error);
};
```

---

## 6. Recommended Approach (Post-Pivot: Block/Unblock)

### Frontend

1. **Add `toggleBlock` method to `users.js` service** → `PATCH /users/:userId/toggle-block`
2. **UserItem block/unblock button**: Add a toggle button inside the card. Use `e.stopPropagation()` + `e.preventDefault()` to prevent `<Link>` navigation. Only render if current user is admin (check via `AuthContext`).
3. **UserProfile block/unblock button**: Pass a new `onToggleBlock` prop. Admin `ProfilePage` passes the handler; guest `ClientProfilePage` passes nothing (button doesn't render, backward compatible).
4. **Confirmation modal**: Reuse existing `<Modal>` component. Same pattern as `TurnDetailAndUpdate` — `modalState` boolean, trigger button toggles it, modal shows contextual message ("¿Estás segura de que quieres bloquear a [name]?" / "¿Estás segura de que quieres desbloquear a [name]?").
5. **Blocked badge**: Red pill/badge with "Bloqueada" text, using DESIGN.md error palette (`#f44336`).
6. **After toggle**: Refetch user data in profile, update local state in list.

### Backend

1. **Add `blocked` field** to `user.model.js`: `blocked: { type: Boolean, default: false }`
2. **Add `toggleBlock` controller** to `users.controllers.js`:
   - Find user by ID (middleware sets `req.user`)
   - Check admin isn't blocking themselves
   - Flip `user.blocked`
   - Save and return updated user
3. **Guard login**: In `users.login`, after password validation, check `user.blocked`. If true, return 403.
4. **Add route**: `router.patch('/users/:userId/toggle-block', secure.isAdmin, usersMid.checkUser, users.toggleBlock)`

---

## 7. Key Risks & Gotchas

1. ~~**ORPHAN DATA (HIGH)**~~ — **RESOLVED**: Pivoted to block/unblock. No data is deleted.
2. **UserItem navigation conflict** — The entire card is a `<Link>`. A block button inside it MUST call `e.stopPropagation()` AND `e.preventDefault()`.
3. **UserProfile dual context** — Same component used for admin-view and self-view. Block button must be admin-only via prop gating.
4. **Admin self-block** — Backend MUST prevent an admin from blocking their own account.
5. **Blocked state sync** — Toggling in one access point (list) should be reflected in the other (profile). Profile refetches on mount; list updates optimistically.
6. **Login rejection UX** — Error message must be clear but not leak internal details. Use "Tu cuenta ha sido bloqueada. Contacta con la administración."

---

## 8. Ready for Proposal

**Yes** — The codebase is well-understood, patterns are identified, and the data strategy (block instead of delete) is locked in. Proceed to proposal.
