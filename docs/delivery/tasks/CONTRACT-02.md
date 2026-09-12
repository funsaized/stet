# CONTRACT-02 — Finalize adapter/update design

## Outcome
Compiled, idiomatic adapter signatures and a minimal nonreplaying internal update design.
## Parent
A4 and required B6 subset. **State: ACCEPTED.**
## Prerequisites
Accepted CONTRACT-01.
## Required reading
Adapter contract; `src/react.ts`, `src/vue.ts`, `src/svelte.ts`, `src/angular.ts`; adapter/pattern tests.
## Allowed edits
`docs/delivery/contracts/adapters.md`, proposed compile-only contract fixtures, evidence.
## Exact change
Fix `onHandle` syntax/ordering and visibility/update/target-replacement behavior for all adapters.
## Acceptance criteria
React 18+, Vue directive, Svelte action, and Angular directive examples compile; callbacks never serialize; no lifecycle question remains.
## Verification
Narrow framework compilation and independent API review.
## Forbidden scope
Production implementation, controller registry, public generic update API, commit/push/publish.
## Stop conditions
Stop if one callback shape cannot be expressed idiomatically in a supported adapter.
## Review evidence
Exact types/examples and compilation outcomes.
