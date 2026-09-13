# CORE-05 — Add completion, replay, cancellation

## Outcome
The approved asynchronous state machine works for underline and circle and is
reusable by later supported reveal primitives.
## Parent
B4. **State: BLOCKED.**
## Prerequisites
Accepted CORE-04 (which transitively requires CONTRACT-01).
## Required reading
Runtime contract, current reveal implementation, all handle wrappers/callers.
## Allowed edits
Shared runtime/result exports, wrappers, focused unit/browser tests, generated type sources as required.
## Exact change
Implement promise joining, replay supersession, cancellation results, and destroyed behavior.
## Acceptance criteria
Operations settle exactly once; no listener/promise leak; cancellation never reports finished.
## Verification
Transition-table Vitest and real-browser interruption cases; `npm run check`.
## Forbidden scope
Groups, adapters, rejection-based normal cancellation, commit/push/publish.
## Stop conditions
Stop after two failed fixes for any race and report reproducible evidence.
## Review evidence
Every transition mapped to a passing check.
