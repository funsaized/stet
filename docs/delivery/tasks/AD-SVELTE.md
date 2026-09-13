# AD-SVELTE — Svelte full control
## Outcome
Svelte actions implement the adapter contract. **Parent:** B7. **State:** BLOCKED.
## Prerequisites
CONTRACT-02, CORE-06, CORE-07 accepted.
## Required reading
Adapter contract, `src/svelte.ts`, `tests/svelte.test.ts`, and generated Svelte examples for reference.
## Allowed edits
`src/svelte.ts` and `tests/svelte.test.ts` only. AGENT-02 owns shared generator sources.
## Exact change
Use action update/destroy for handle notification, visibility, updates, and replacement.
## Acceptance criteria
Callback identity no recreation; destroy reports null; async control uses supplied handle; no Svelte-specific controller.
## Verification
`npx vitest run tests/svelte.test.ts`, `npm run check`, relevant pattern test. Template propagation belongs to AGENT-02.
## Forbidden scope
Runtime redesign, hand-edited templates, dependencies, commit/push/publish.
## Stop conditions
Stop if accepted action type does not compile under supported Svelte.
## Review evidence
Action lifecycle cases and commands.
