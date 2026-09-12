# MEASURE-01 — Separate payload measurements

## Outcome
Reproducible minimal, full-core, CSS, and optional-integration measurements.
## Parent
A5. **State: BLOCKED.**
## Prerequisites
Accepted BASE-01.
## Required reading
`scripts-size.mjs`, `scripts/agent/check-package.mjs`, package exports and side effects.
## Allowed edits
Measurement scripts/tests and measurement docs.
## Exact change
Add separate bundle cases without changing current limits.
## Acceptance criteria
Core excludes agent/Node/Playwright code; method is reproducible; tree-shaking is measured.
## Verification
`npm run size`, `npm run test:package`.
## Forbidden scope
Budget increases, runtime optimization/refactor, dependencies, commit/push/publish.
## Stop conditions
Stop if a bundler change would make results incomparable without lead approval.
## Review evidence
Commands, inputs, outputs, current limits.
