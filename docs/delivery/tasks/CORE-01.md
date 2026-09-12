# CORE-01 — Add visibility and ARIA ownership

## Outcome
All six current primitives implement the approved explicit visibility contract.
## Parent
B1. **State: BLOCKED.**
## Prerequisites
Accepted CONTRACT-01.
## Required reading
Runtime contract; `src/mount.ts`, `src/primitives.ts`, `tests/stet.test.ts`, scroll/browser tests.
## Allowed edits
Those runtime/test files and generated contract sources/outputs required by public options.
## Exact change
Separate author intent from culling; implement show/hide; toggle all owned descriptions; forward full handles through arrow/sticky.
## Acceptance criteria
Hide survives observer changes; native/foreign ARIA remains; show restores owned IDs; cleanup is idempotent; static default remains.
## Verification
Focused Vitest, `npm run check`, targeted browser/scroll test.
## Forbidden scope
Reveal CSS, adapter redesign, unrelated geometry, hand-edited generated output, commit/push/publish.
## Stop conditions
Stop if implementation contradicts the accepted transition table.
## Review evidence
State/ARIA cases and command outcomes.
