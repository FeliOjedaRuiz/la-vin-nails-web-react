# registration-gate Specification

## Purpose

Guards the `POST /users` endpoint so new account creation can be toggled on/off by an admin. Includes the middleware, the admin toggle UI, and the register-page conditional rendering.

## Requirements

### Requirement: Registration Middleware — isOpen

The `registration.mid.isOpen` middleware MUST read the `registration.enabled` setting from MongoDB on every request. If the doc is missing or its value is `true`, the request SHALL proceed (`next()`). If the value is `false`, the request SHALL be rejected with 403.

#### Scenario: Registration open — request passes

- GIVEN `registration.enabled` is `true` in the DB
- WHEN `POST /users` is called
- THEN the middleware SHALL call `next()`
- AND the user creation flow SHALL proceed normally (201 on success)

#### Scenario: Registration closed — request blocked

- GIVEN `registration.enabled` is `false` in the DB
- WHEN `POST /users` is called
- THEN the middleware SHALL respond with 403
- AND the body SHALL include a message indicating registration is closed

#### Scenario: Fail-open — setting doc missing

- GIVEN no `registration.enabled` doc exists in the DB (first deploy, seed failed, doc deleted)
- WHEN `POST /users` is called
- THEN the middleware SHALL call `next()` (fail-open)
- AND registration proceeds as if enabled

### Requirement: POST /users Route Guarded

The `POST /users` route in `routes.config.js` MUST apply `isOpen` middleware before `users.create`. The route MUST remain unauthenticated (no auth middleware).

#### Scenario: Route applies isOpen middleware

- GIVEN the server is running
- WHEN a request hits `POST /users`
- THEN the middleware chain SHALL execute `isOpen` → `users.create`
- AND no auth token is required

### Requirement: RegisterPage Conditional Rendering

`RegisterPage` MUST fetch the `registration.enabled` setting on mount. If open, it SHALL render the `UsersForm` normally. If closed, it SHALL render a friendly closed message ("Registro temporalmente cerrado") without the form. On fetch failure, it SHALL default to showing the form (fail-open).

#### Scenario: Registration open — shows form

- GIVEN `registration.enabled` is `true`
- WHEN `RegisterPage` mounts
- THEN `UsersForm` SHALL render
- AND no "closed" message SHALL appear

#### Scenario: Registration closed — shows message

- GIVEN `registration.enabled` is `false`
- WHEN `RegisterPage` mounts
- THEN a message "Registro temporalmente cerrado" SHALL render
- AND `UsersForm` SHALL NOT render

#### Scenario: Fetch failure — shows form

- GIVEN the settings API returns an error (network failure, 500)
- WHEN `RegisterPage` mounts
- THEN `UsersForm` SHALL render (fail-open)
- AND no error toast SHALL display to the user

### Requirement: Admin RegistrationToggle

`RegistrationToggle` MUST display the current `registration.enabled` state with a toggle control. On toggle, it SHALL `PATCH` the setting and show loading/error feedback. It SHALL follow the existing `PwaStatusCard`/`PushSettingsCard` UI pattern.

#### Scenario: Displays current state on mount

- GIVEN `registration.enabled` is `true`
- WHEN `RegistrationToggle` mounts
- THEN the toggle SHALL show "on" state
- AND the label SHALL indicate registration is open

#### Scenario: Toggle from open to closed

- GIVEN `registration.enabled` is `true` and displayed
- WHEN the admin toggles the switch to "off"
- THEN the component SHALL show a loading state during the `PATCH` request
- AND on success, the toggle SHALL switch to "off" state
- AND `registration.enabled` SHALL be `false` in the DB

#### Scenario: Toggle failure — shows error

- GIVEN `RegistrationToggle` is mounted
- WHEN the admin toggles but the `PATCH` request fails (network error or 500)
- THEN the toggle SHALL revert to its previous state
- AND an error message/toast SHALL display to the admin
