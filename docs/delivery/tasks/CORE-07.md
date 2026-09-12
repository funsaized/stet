# CORE-07 — Add internal nonreplaying updates

## Outcome
Adapters can update supported data without recreating entrance state.
## Parent
Required B6 subset. **State: BLOCKED.**
## Prerequisites
Accepted CONTRACT-02 and CORE-06.
## Required reading
Adapter/update contract, mount/primitives, description and option snapshots.
## Allowed edits
Approved internal runtime interfaces and focused tests.
## Exact change
Update appearance, text, placement, visibility and next-entrance settings per contract.
## Acceptance criteria
Same values no-op; current visibility/seed preserved; description updates safe; no public generic `update()`.
## Verification
Focused runtime update matrix and `npm run check`.
## Forbidden scope
Adapter edits, `src/rough.ts`, public update API, broad renderer refactor,
commit/push/publish.
## Stop conditions
Stop if a supported field cannot update without changing public behavior.
## Review evidence
Per-field outcomes and commands.
