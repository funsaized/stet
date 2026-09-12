# AD-INTEGRATE — Verify cross-framework parity
## Outcome
Vanilla and all adapters expose equal released behavior. **Parent:** B7/F2. **State:** BLOCKED.
## Prerequisites
All AD tasks accepted.
## Required reading
Adapter/runtime contracts, all adapter diffs, generator/template checks.
## Allowed edits
Integration tests and generator sources needed to correct proven parity gaps.
## Exact change
Run one equivalent visibility, callback, update, replay, cancellation, and replacement scenario per framework.
## Acceptance criteria
No adapter lacks public control; callbacks absent from plans; templates compile against actual exports.
## Verification
`npm run check`, `npm run test:templates`, `npm run test:patterns`, focused adapter tests.
## Forbidden scope
New behavior, unrelated refactors, direct generated edits, commit/push/publish.
## Stop conditions
Stop and return a specific adapter task on nonmechanical divergence.
## Review evidence
Parity matrix and commands.
