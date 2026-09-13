# CORE-03 — Implement underline reveal

## Outcome
The first opt-in finite stroked entrance.
## Parent
B2. **State: BLOCKED.**
## Prerequisites
Accepted CORE-02.
## Required reading
Runtime contract, mount/path creation, underline geometry, CSS and visual tests.
## Allowed edits
Shared reveal mechanism, underline integration, CSS, focused unit/browser tests.
## Exact change
Implement a path-length draw-on using approved duration/delay/initial-hidden
behavior without a pre-animation flash. Ensure viewport culling cannot prevent
logical completion and that an annotation unculled after completion displays its
final frame.
## Acceptance criteria
Correct draw-on and final state; refresh/scroll/resize do not replay; static
underline remains compatible; offscreen completion follows the runtime contract.
## Verification
Focused Vitest, targeted Playwright reveal test, manual visual review.
## Forbidden scope
Other primitive treatments, snapshots without review, dependency/budget changes, commit/push/publish.
## Stop conditions
Stop if completion semantics require unapproved API changes.
## Review evidence
Timing/state assertions and visual artifact.
