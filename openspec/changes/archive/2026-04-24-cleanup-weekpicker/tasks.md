# Tasks: Cleanup WeekPicker and Unused Dependencies

## Phase 1: Removal of Orphaned Code

- [x] 1.1 Delete directory `web/src/components/week-picker/` and all its contents.

## Phase 2: Dependency Cleanup

- [x] 2.1 Uninstall `styled-components` in the `web/` directory using `npm uninstall styled-components`.

## Phase 3: Verification

- [x] 3.1 Execute `npm run build` in the `web/` directory to ensure no hidden imports or build errors.
- [x] 3.2 Execute `npm test` in the `web/` directory to verify that all existing tests pass.
