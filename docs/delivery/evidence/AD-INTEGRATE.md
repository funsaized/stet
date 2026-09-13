# AD-INTEGRATE evidence

- Revision/base: `d6fd6e7`
- Environment: Linux; Node v26.7.0; npm 11.19.0
- Files changed during integration: `src/react.ts`, `tests/react.test.ts`
- Parity matrix: vanilla exposes the handle directly; React, Vue, Svelte, and Angular expose the same handle through their idiomatic callbacks. All adapters implement changed-only visibility, complete nonreplaying updates, callback transfer, teardown null, missing-target silence, target replacement, current declarative visibility on replacement, and deferred client attachment. React additionally preserves StrictMode ordering.
- Metadata: `onHandle`/`stetOnHandle` remain adapter-only and absent from runtime plans, schemas, and capabilities.
- Commands and exit status: `npx vitest run tests/react.test.ts tests/vue.test.ts tests/svelte.test.ts tests/angular.test.ts` — 0 (57 passed); `npm run check` — 0; `npm run test:templates` — 0 (35 snippets/patterns, no diagnostics); `npm run test:patterns` — 0 (18 passed: Chromium and Firefox).
- Proven integration gap corrected: React now matches Vue/Svelte/Angular by completing valid target replacement before rethrowing an outgoing callback exception; focused React suite passed 18/18.
- Reviewer decision: APPROVE; no confirmed released-behavior parity gap.
