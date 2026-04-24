# Proposal: Cleanup WeekPicker and Unused Dependencies

## Intent

Remove orphaned code and dependencies to reduce bundle size and technical debt. The `week-picker` component is no longer used, and `styled-components` was identified as an unused dependency.

## Scope

### In Scope
- Remove orphaned directory: `web/src/components/week-picker/`.
- Uninstall unused dependency: `styled-components`.
- Update `web/package.json`.
- Verify build and tests in `web/`.

### Out of Scope
- Modifying `api/` (no changes needed there).
- Modifying `react-day-picker` or `date-fns` (used elsewhere).

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- **project-cleanup**: Removing legacy UI components and unused libraries.

## Approach

1. Verify that `week-picker` is truly orphaned (already done in exploration).
2. Delete the directory `web/src/components/week-picker/`.
3. Run `npm uninstall styled-components` in the `web/` directory.
4. Run `npm run build` in `web/` to ensure no broken imports remain hidden.
5. Run `npm test` in `web/` to ensure no regressions.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `web/src/components/week-picker/` | Removed | Orphans: HonestWeekPicker.js, ArrowLeft.js, ArrowRight.js, styles. |
| `web/package.json` | Modified | Removal of `styled-components`. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Hidden imports of week-picker | Low | Grep confirmed 0 imports outside its folder. |
| Dependency conflict after uninstall | Low | `styled-components` is not used in src. |

## Rollback Plan

- Revert deletions from git history.
- Reinstall dependencies: `npm install styled-components`.

## Dependencies

- None.

## Success Criteria

- [ ] Directory `web/src/components/week-picker/` is gone.
- [ ] `styled-components` is removed from `package.json`.
- [ ] `npm run build` succeeds in `web/`.
- [ ] `npm test` succeeds in `web/`.
