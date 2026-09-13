# SHIP-01 — Build explicit exclusion fixtures
## Outcome
Production, preview, local-only, disabled, and mixed Vite modes use a review-only module boundary. **Parent:** E2. **State: READY.**
## Prerequisites
CONTRACT-04 accepted.
## Required reading
Shipping contract, Vite/package side-effect behavior, packed-consumer patterns.
## Allowed edits
Proposed build-exclusion consumer fixture and its configuration/tests.
## Exact change
Implement all contracted modes with a normal compile-time boundary and no source rewriting.
## Acceptance criteria
Production and mixed retain intentional marks; preview/local behave as documented;
disabled app works; no privacy claim from no-op rendering.
## Verification
Fresh production builds and runtime smoke tests.
## Forbidden scope
AST stripping, Vite plugin, product runtime edits, commit/push/publish.
## Stop conditions
Stop if packed package behavior differs from the contract.
## Review evidence
Mode outputs and runtime screenshots/status.
