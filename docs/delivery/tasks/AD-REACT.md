# AD-REACT — React full control
## Outcome
React implements the adapter contract. **Parent:** B7. **State:** BLOCKED.
## Prerequisites
CONTRACT-02, CORE-06, CORE-07 accepted.
## Required reading
Adapter contract, `src/react.ts`, `tests/react.test.ts`, and generated React examples for reference.
## Allowed edits
`src/react.ts` and `tests/react.test.ts` only. AGENT-02 owns shared generator sources.
## Exact change
Add React-18-compatible `onHandle`, changed-only visibility control, nonreplaying updates, and target replacement.
## Acceptance criteria
StrictMode cleanup; callback identity no remount; stable ref with replaced node detected; unrelated renders preserve imperative state; callback receives handle/null in approved order.
## Verification
`npx vitest run tests/react.test.ts`, `npm run check`, relevant pattern test. Template propagation belongs to AGENT-02.
## Forbidden scope
Runtime redesign, React-19-only API, hand-edited templates, dependencies, commit/push/publish.
## Stop conditions
Stop if accepted callback syntax does not compile on supported React.
## Review evidence
Lifecycle assertions, generated diff, commands.
