# service-turn-compatibility Specification

## Purpose

Ensure a client booking the "Retiro" Service sees only compatible (`retiro`)
turns, any other service sees only `normal` turns, and the backend refuses
(HTTP 400) any service↔turn category mismatch on both `dates.create` and
`dates.update`. Service identity is decided by `service.name === "Retiro"`
(NO `category` field on `Service`).

## Requirements

### Requirement: Retiro Service Identity

"Retiro" service identity MUST be established by `service.name === "Retiro"` and NOT by a `Service.category` field. The `Service` model SHALL NOT be modified.

#### Scenario: SC-STC-01 Client books Retiro service on a retiro turn

- GIVEN the client selected the "Retiro" service
- AND the calendar shows only `category: 'retiro'` turns
- WHEN the client selects a `retiro` turn and submits the booking
- THEN the API persists the `Date` and returns HTTP 200/201
- AND the turn is locked to `Solicitado`

### Requirement: Backend Category Filter on turns.list

`turns.controllers.list` MUST filter DB-side by `req.query.category` when the param is present (`criterial.category = req.query.category`). When absent, no category filter is applied. Admin role (`req.user?.role === 'admin'`) MUST receive all categories even if a `category` query param is sent. The filter MUST remain independent of the visibility date-range ceiling AND the guest/admin auth path.

#### Scenario: SC-STC-02 Client maliciously books Retiro service on a normal turn

- GIVEN the client selected the "Retiro" service and a `category: 'normal'` turn id
- WHEN a crafted request reaches `dates.create` with that service+turn pair
- THEN `dates.create` returns HTTP 400
- AND the body contains `"El servicio Retiro solo puede reservarse en turnos marcados como retiro"`
- AND no `Date` is persisted and no turn lock occurs

#### Scenario: SC-STC-03 Client books non-Retiro service on a retiro turn

- GIVEN the client selected a non-"Retiro" service and a `category: 'retiro'` turn id
- WHEN the request reaches `dates.create`
- THEN `dates.create` returns HTTP 400
- AND the body contains `"El servicio no es de retiro y no puede reservarse en un turno de retiro"`
- AND no `Date` is persisted and no turn lock occurs

#### Scenario: SC-STC-04 Backend list filter — guest retiro request

- GIVEN a guest sends `GET /turns/date/2026-08-03?category=retiro`
- WHEN `turns.list` runs
- THEN only `Turn` docs with `category: 'retiro'` in that date range are returned

#### Scenario: SC-STC-05 Backend list filter — guest normal request

- GIVEN a guest sends `GET /turns/date/2026-08-03?category=normal`
- WHEN `turns.list` runs
- THEN only `Turn` docs with `category: 'normal'` are returned

#### Scenario: SC-STC-06 Backend list filter — admin sees all categories

- GIVEN an admin sends `GET /turns/date/2026-08-03` (no `category` param)
- WHEN `turns.list` runs
- THEN `Turn` docs of BOTH `normal` and `retiro` categories in that range are returned

#### Scenario: SC-STC-07 Backend list filter — admin with category param still sees all

- GIVEN an admin sends `GET /turns/date/2026-08-03?category=retiro`
- WHEN `turns.list` runs
- THEN the `category` filter is NOT applied (admin sees both categories)
- AND the visibility ceiling still applies

### Requirement: turnsService Category Propagation

`turnsService.list(date, endDate, category, signal)` MUST append `&category=<value>` to the request URL only when `category` is provided; absent category MUST NOT append the param. `NewDatePage` / `DatesForm` MUST derive the requested `category` from the selected service (`name === 'Retiro'` → `'retiro'`, else `'normal'`) and pass it to `CalendarPanel` → `TurnListByWeek` → `turnsService.list`.

#### Scenario: SC-STC-08 Frontend cache key for retiro service

- GIVEN the client is on `/services/<retiro-service-id>` for week 2026-08-03
- WHEN `TurnListByWeek` loads turns
- THEN the SWR cache key equals `2026-08-03:retiro`
- AND `turnsService.list` is called with `category='retiro'`

#### Scenario: SC-STC-09 Frontend cache key for non-retiro service

- GIVEN the client is on `/services/<any-other-service-id>` for week 2026-08-03
- WHEN `TurnListByWeek` loads turns
- THEN the SWR cache key equals `2026-08-03:normal`
- AND `turnsService.list` is called with `category='normal'`

### Requirement: dates.create Category Compatibility Guard

`dates.controllers.create` MUST load the referenced `Turn` and `Service`, resolve `serviceCategory = service.name === 'Retiro' ? 'retiro' : 'normal'`, and return HTTP 400 when `serviceCategory !== turn.category` BEFORE persisting the `Date`. The 400 body MUST include a Spanish message: `"El servicio Retiro solo puede reservarse en turnos marcados como retiro"` when the service is Retiro, or `"El servicio no es de retiro y no puede reservarse en un turno de retiro"` when the turn is retiro but the service is not.

(See SC-STC-02, SC-STC-03.)

### Requirement: dates.update Category Compatibility Guard

`dates.controllers.update` MUST apply the SAME guard as `dates.create` against the updated `service`/`turn` pair and return HTTP 400 on mismatch BEFORE persisting.

#### Scenario: SC-STC-10 dates.update respects same rule

- GIVEN an existing `Date` linking a "Retiro" service and a `category: 'normal'` turn
- WHEN the admin updates that `Date` to the Retiro service / normal-turn pair
- THEN `dates.update` returns HTTP 400 before persisting
- AND the existing `Date` is left unchanged