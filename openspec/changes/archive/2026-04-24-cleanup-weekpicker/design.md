# Design: Cleanup WeekPicker and Unused Dependencies

## Technical Approach

The implementation will focus on the removal of the orphaned `week-picker` directory and the uninstallation of the `styled-components` library. Verification will be performed using `npm run build` and `npm test` in the `web/` directory.

## Architecture Decisions

### Decision: Direct deletion of orphaned directory

**Choice**: Use `rm -rf` (or equivalent) to remove `web/src/components/week-picker/`.
**Alternatives considered**: Commenting out code, moving to a `legacy/` folder.
**Rationale**: Grep analysis confirmed zero imports outside the directory. Deletion is the cleanest way to remove technical debt.

### Decision: NPM uninstallation

**Choice**: Use `npm uninstall styled-components`.
**Alternatives considered**: Manually editing `package.json`.
**Rationale**: `npm uninstall` correctly updates both `package.json` and `package-lock.json`, ensuring consistency in the dependency tree.

## Data Flow

No data flow changes. This is a pure cleanup of UI components and libraries.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `web/src/components/week-picker/` | Delete | Orphaned component and styles. |
| `web/package.json` | Modify | Remove `styled-components`. |
| `web/package-lock.json` | Modify | Updated via npm uninstall. |

## Interfaces / Contracts

No new interfaces or contracts.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Existing components | Run `npm test` to ensure no regressions in other areas. |
| Integration | Build process | Run `npm run build` to verify no hidden import errors exist. |

## Migration / Rollout

No migration required.

## Open Questions

None.
