# CORE-08 — Reconcile motion size budgets

## Outcome
Accepted measured budgets after motion, without hidden leakage.
## Parent
A5. **State: BLOCKED.**
## Prerequisites
Accepted MEASURE-01, CORE-06, and BOX-02 so the budget includes every required
core primitive.
## Required reading
Measurement evidence, package graph, product size goals.
## Allowed edits
Only lead-approved optimizations or explicit budget/documentation updates.
## Exact change
Measure deltas, remove accidental inclusion, and record the approved ceiling decision.
## Acceptance criteria
Minimal/full deltas recorded; tree-shaking remains; every limit change is explicit.
## Verification
`npm run size`, `npm run test:package`.
## Forbidden scope
Silent limit increase, feature deletion without product approval, commit/push/publish.
## Stop conditions
Worker stops for lead decision after producing measurements.
## Review evidence
Before/after bundle graph and decision.
