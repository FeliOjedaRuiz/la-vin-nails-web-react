# app-settings Specification

## Purpose

Key-value configuration system stored in MongoDB, exposed via REST endpoints protected by admin authentication. Supports the registration lock feature and any future admin toggles.

## Requirements

### Requirement: AppSetting Schema

The system MUST provide an `AppSetting` Mongoose model with `key` (String, unique, required) and `value` (Mixed, required). The `key` field MUST be indexed for fast lookup.

#### Scenario: Setting document created

- GIVEN no setting exists for key `"registration.enabled"`
- WHEN a `GET /settings/:key` or `PATCH /settings/:key` call references it
- THEN the system SHALL create the document lazily with a sensible default before responding

#### Scenario: Duplicate key rejection

- GIVEN an `AppSetting` doc exists with key `"registration.enabled"`
- WHEN an attempt is made to create another with the same key
- THEN MongoDB SHALL reject it with a duplicate key error

### Requirement: Admin-only Settings API

All settings endpoints (`/settings`, `/settings/:key`) MUST reject requests from unauthenticated or non-admin clients with 401/403.

#### Scenario: Unauthenticated access denied

- GIVEN no valid `Authorization` header
- WHEN `GET /settings` is called
- THEN the server SHALL respond with 401

#### Scenario: Non-admin access denied

- GIVEN a valid token from a user with `role !== "admin"`
- WHEN any `/settings` endpoint is called
- THEN the server SHALL respond with 403

### Requirement: List All Settings

`GET /settings` MUST return a JSON object mapping all setting keys to their values. If no `registration.enabled` doc exists, it MUST seed it with `true` before responding.

#### Scenario: Returns all settings

- GIVEN settings `{ registration.enabled: true, another.key: "foo" }` exist
- WHEN an admin calls `GET /settings`
- THEN the response SHALL be `{ registration.enabled: true, another.key: "foo" }` with status 200

#### Scenario: Seeds registration.enabled on first access

- GIVEN no `registration.enabled` doc exists in the collection
- WHEN an admin calls `GET /settings`
- THEN a doc `{ key: "registration.enabled", value: true }` SHALL be created
- AND the response SHALL include `registration.enabled: true`

### Requirement: Get Single Setting

`GET /settings/:key` MUST return the value of a single setting. If the key does not exist and the key is `registration.enabled`, it MUST seed a default value of `true`.

#### Scenario: Setting found

- GIVEN an `AppSetting` with key `"test.key"` and value `"bar"` exists
- WHEN an admin calls `GET /settings/test.key`
- THEN the response SHALL be `{ key: "test.key", value: "bar" }` with status 200

#### Scenario: Invalid key — not found (non-seeded key)

- GIVEN no `AppSetting` exists for `"nonexistent.key"`
- WHEN an admin calls `GET /settings/nonexistent.key`
- THEN the server SHALL respond with 404

### Requirement: Update Setting Value

`PATCH /settings/:key` MUST validate the request body contains a `value` field, update the document, and return the updated setting. For `registration.enabled`, `value` MUST be boolean.

#### Scenario: Successful update

- GIVEN `registration.enabled` is `true`
- WHEN an admin calls `PATCH /settings/registration.enabled` with `{ value: false }`
- THEN the doc SHALL be updated to `value: false`
- AND the response SHALL include the updated document with status 200

#### Scenario: Missing value in body

- GIVEN any setting key
- WHEN an admin calls `PATCH /settings/:key` without a `value` field
- THEN the server SHALL respond with 400

#### Scenario: Invalid registration.enabled type

- GIVEN `registration.enabled` exists
- WHEN an admin calls `PATCH /settings/registration.enabled` with `{ value: "yes" }` (string, not boolean)
- THEN the server SHALL respond with 400
