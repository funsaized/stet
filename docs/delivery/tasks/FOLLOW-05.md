# FOLLOW-05 — Per-side padding
## Outcome
CSS-like padding where primitives define padding. **Parent:** C4. **State:** BLOCKED/post-release.
## Prerequisites
Concrete asymmetric placement need.
## Required reading
Primitive geometry, plan generator limitations and tests.
## Allowed edits
Shared normalization, applicable primitives/contracts/tests.
## Exact change
Accept scalar and approved shorthand; decide highlight separately.
## Acceptance criteria
Scalar output unchanged; invalid/negative behavior explicit; schemas represent type or contract is revised first.
## Verification
Normalization table and representative visuals.
## Forbidden scope
Global placement solver, commit/push/publish.
## Stop conditions
Stop if shorthand cannot fit current schema without approved generator work.
## Review evidence
Type/geometry cases.
