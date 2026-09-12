# CORE-04 — Implement circle reveal

## Outcome
Circle reuses the accepted stroked reveal mechanism.
## Parent
B2. **State: BLOCKED.**
## Prerequisites
Accepted CORE-03.
## Required reading
Circle geometry, accepted underline mechanism and tests.
## Allowed edits
Circle integration and corresponding focused tests.
## Exact change
Apply the shared reveal without a second controller.
## Acceptance criteria
Same lifecycle as underline; geometry refresh does not replay; settled appearance stays compatible.
## Verification
Focused Vitest/browser tests and manual visual review.
## Forbidden scope
Generic shape abstraction, unrelated primitives, budget/snapshot changes, commit/push/publish.
## Stop conditions
Stop if the shared mechanism cannot preserve circle geometry.
## Review evidence
Parity cases and visual artifact.
