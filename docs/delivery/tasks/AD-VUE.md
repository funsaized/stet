# AD-VUE — Vue full control
## Outcome
Vue directives implement the adapter contract. **Parent:** B7. **State:** BLOCKED.
## Prerequisites
CONTRACT-02, CORE-06, CORE-07 accepted.
## Required reading
Adapter contract, `src/vue.ts`, `tests/vue.test.ts`, and generated Vue examples for reference.
## Allowed edits
`src/vue.ts` and `tests/vue.test.ts` only. AGENT-02 owns shared generator sources.
## Exact change
Use directive mounted/updated/unmounted lifecycle for `onHandle`, changed visibility, updates, and replacement.
## Acceptance criteria
Callback never serializes; identity changes do not remount; unmount reports null; unchanged reactive values preserve imperative state.
## Verification
`npx vitest run tests/vue.test.ts`, `npm run check`, relevant pattern test. Template propagation belongs to AGENT-02.
## Forbidden scope
Runtime redesign, new Vue abstraction, hand-edited templates, dependencies, commit/push/publish.
## Stop conditions
Stop if accepted binding shape conflicts with supported Vue directive typing.
## Review evidence
Directive lifecycle cases and commands.
