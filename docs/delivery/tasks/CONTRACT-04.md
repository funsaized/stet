# CONTRACT-04 — Finalize shipping guarantees

## Outcome
Exact production, preview-only, local-only, disabled, mixed, and source-map output matrix.
## Parent
E1. **State: BLOCKED.**
## Prerequisites
Accepted BASE-01 and CONTRACT-02.
## Required reading
Shipping contract, Vite configs, `package.json` side effects, package checks.
## Allowed edits
`docs/delivery/contracts/shipping.md` and evidence only.
## Exact change
Specify every mode's module ownership, build constants, emitted artifacts, and unsupported configurations.
## Acceptance criteria
Each disabled/runtime/content guarantee is falsifiable; production marks survive mixed mode.
## Verification
Independent bundler/package review.
## Forbidden scope
Universal AST stripping, Vite plugin implementation, commit/push/publish.
## Stop conditions
Stop if a guarantee cannot be tested at emitted-output level.
## Review evidence
Output matrix and proposed sentinel checks.
