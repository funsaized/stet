# BOX-01 — Add deterministic box geometry
## Outcome
Internal rough-box geometry reuses stroked reveal. **Parent:** C1. **State:** BLOCKED.
## Prerequisites
CORE-06 accepted, so no concurrent writer is changing `src/rough.ts`.
## Required reading
`src/rough.ts`, existing ellipse/line geometry and tests, runtime contract.
## Allowed edits
`src/rough.ts` and focused geometry/browser visual tests.
## Exact change
Add only the geometry needed for box, including small/zero measured regions.
## Acceptance criteria
Stable seed; defined padding/roughness; accepted final and reveal path; no generic shape abstraction.
## Verification
Focused Vitest, browser visual fixture, manual review.
## Forbidden scope
Public exports/adapters/catalog, dependencies, snapshot acceptance without review, commit/push/publish.
## Stop conditions
Stop if path structure cannot use accepted reveal semantics.
## Review evidence
Determinism and visual artifact.
