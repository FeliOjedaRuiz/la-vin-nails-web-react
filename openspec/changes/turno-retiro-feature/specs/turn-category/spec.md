# turn-category Specification

## Purpose

Classify each `Turn` as `normal` or `retiro` (pickup) so the existing 30-min
"Retiro" Service can be paired only with compatible turns and retiro turns are
visually distinguished in admin and guest views.

## Requirements

### Requirement: Turn Category Field

`Turn.category` MUST be `{ type: String, enum: ['normal','retiro'], default: 'normal' }`. Existing production `Turn` docs without `category` MUST resolve to `'normal'` via the Mongoose default. No migration script is required.

#### Scenario: SC-CAT-01 Admin creates a normal turn

- GIVEN the admin is on the `TurnsForm` create view
- WHEN the admin submits the form without toggling the category control
- THEN the persisted `Turn` document has `category: 'normal'`

#### Scenario: SC-CAT-02 Admin creates a retiro turn

- GIVEN the admin is on the `TurnsForm` create view
- WHEN the admin selects the "Retiro" toggle and submits
- THEN the persisted `Turn` document has `category: 'retiro'`

#### Scenario: SC-CAT-03 Existing turn without category defaults to 'normal'

- GIVEN a `Turn` document in storage created before this feature
- WHEN it is read via `turnsService.detail` or returned by `turns.list`
- THEN its reported `category` is `'normal'`
- AND no write is required to backfill it

### Requirement: Admin Category Toggle on Create

`TurnsForm` MUST expose a category toggle with Spanish labels `Normal` / `Retiro` at create. The category control MUST render at `font-size >= 16px`.

#### Scenario: SC-CAT-04 Admin edits category on a turn with an active date

- GIVEN a `Turn` with `category: 'normal'` linked to a `Date` whose state is `'Solicitada'`
- WHEN the admin opens `TurnDetailAndUpdate` and changes the category to `'retiro'`
- THEN a confirmation `Modal` appears
- AND the `turnsService.update` call SHALL NOT fire until the admin confirms
- AND on confirm the update persists `category: 'retiro'`

#### Scenario: SC-CAT-05 Admin edits category on a turn with no active date

- GIVEN a `Turn` with `category: 'normal'` and no linked `Date`
- WHEN the admin changes the category to `'retiro'` and submits
- THEN no confirmation `Modal` appears
- AND the update persists `category: 'retiro'` directly

### Requirement: Guest Retiro Visual Differentiation

`TurnItemGuest` MUST render a `Disponible` retiro turn as `bg-violet-400`; normal stays `bg-pink-400`. Non-`Disponible` slots keep the existing gray treatment regardless of category.

#### Scenario: SC-CAT-06 Guest sees retiro Disponible slot in violet

- GIVEN a guest views the calendar and a `Disponible` turn has `category: 'retiro'`
- WHEN `TurnItemGuest` renders that slot
- THEN the rendered className includes `bg-violet-400`
- AND does not include `bg-pink-400`

#### Scenario: SC-CAT-07 Guest sees retiro occupied slot unchanged

- GIVEN a `Solicitado`/`Confirmado` retiro turn
- WHEN `TurnItemGuest` renders it
- THEN the className matches the existing `gray-400` occupied treatment
- AND no violet class is applied

### Requirement: Admin Retiro Dot/Badge

`TurnItemAdmin` MUST add a violet (`bg-violet-500`) dot/badge on `category==='retiro'` turns ON TOP OF the existing state color. The state color SHALL NOT be overridden by category.

#### Scenario: SC-CAT-08 Admin sees violet dot on retiro turn preserving state color

- GIVEN an admin views a `Solicitado` turn with `category: 'retiro'`
- WHEN `TurnItemAdmin` renders it
- THEN the slot keeps its state-coded background (`bg-yellow-500` for `Solicitado`)
- AND a violet `bg-violet-500` dot/badge element is rendered alongside the state color

### Requirement: Retiro Legend Swatch

`TurnsColorsExplication` MUST include a retiro swatch labeled "Retiro" using `bg-violet-400`.

#### Scenario: SC-CAT-09 Legend shows retiro swatch for guests

- GIVEN the guest calendar legend `TurnsColorsExplication` is rendered
- WHEN the user inspects the legend
- THEN a `bg-violet-400` swatch labeled "Retiro" is present alongside the existing Disponible/Ocupado entries

### Requirement: Admin Category Edit Surface

`TurnDetailAndUpdate` MUST expose a `category` `<select>` (Spanish labels Normal/Retiro, value `'normal'`/`'retiro'`) at edit and persist it via the existing turn update flow. The `<select>` MUST render at `font-size >= 16px`. When `category` is changed on a Turn that has an active `Date` (non-`Cancelada` cita), a confirmation `Modal` MUST be shown before calling the submit handler; saving SHALL require explicit confirmation.

(See SC-CAT-04 and SC-CAT-05 for the modal behavior scenarios.)