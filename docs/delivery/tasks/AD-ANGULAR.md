# AD-ANGULAR — Angular full control
## Outcome
Angular directives implement the adapter contract. **Parent:** B7. **State:** BLOCKED.
## Prerequisites
CONTRACT-02, CORE-06, CORE-07 accepted.
## Required reading
Adapter contract, `src/angular.ts`, generated Angular examples for reference, and pattern lifecycle/SSR tests.
## Allowed edits
`src/angular.ts` and directly relevant Angular pattern tests only. AGENT-02 owns shared generator sources.
## Exact change
Preserve render-safe attachment while adding handle notification, changed visibility, updates, and replacement.
## Acceptance criteria
Directive imports valid; input changes do not replay; awaitable handle available; destroy reports null; SSR/hydration unchanged.
## Verification
`npm run check`, `npm run test:patterns`. Template propagation belongs to AGENT-02.
## Forbidden scope
Field injection changes, new Angular package, hand-edited templates, dependencies, commit/push/publish.
## Stop conditions
Stop if accepted input/output syntax conflicts with Angular 20–21 compilation.
## Review evidence
Compile, lifecycle, and SSR outcomes.
