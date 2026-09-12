# CONTRACT-01 — Finalize runtime transitions

## Outcome
An implementation-ready state table matching `contracts/runtime.md`.
## Parent
A3. **State: BLOCKED.**
## Prerequisites
Accepted BASE-01.
## Required reading
Runtime contract, `src/mount.ts`, `src/primitives.ts`, `style.css`, runtime/browser tests.
## Allowed edits
`docs/delivery/contracts/runtime.md` and task evidence only.
## Exact change
Specify promise identity, overlap, redraw during reveal, ARIA ownership, offscreen/detached/destroyed behavior, and a test for every transition.
## Acceptance criteria
No worker must choose lifecycle behavior; arrow/sticky wrappers and static compatibility are covered.
## Verification
Independent contract review against every `StetHandle` caller.
## Forbidden scope
Runtime implementation, new animation features, commit/push/publish.
## Stop conditions
Stop on a product decision not covered by the approved contract.
## Review evidence
Reviewed state table and test mapping.
