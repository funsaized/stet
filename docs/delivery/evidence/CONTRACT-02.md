# CONTRACT-02 evidence

- Revision/base: `7279869d68c09829de08b36cd74633e9dd63c0db`; CONTRACT-01 is ACCEPTED.
- Files changed: `docs/delivery/contracts/adapters.md`, compile-only fixtures under `docs/delivery/contracts/fixtures/`, task/backlog state, and this evidence file; no product/generated files.
- Implementation inspected: all four source adapters, mount/primitives handle flow, adapter unit tests, generated lifecycle patterns/templates, package scripts, and TypeScript/Angular/Vue/Svelte compiler configuration.
- Acceptance criteria checked: exact React, Vue, Svelte, and Angular callback syntax is documented and represented by compile-only fixtures; callbacks are stripped from runtime options and all serialization; declarative visibility, imperative state, updates, callback transfer, teardown, and target replacement have one ordered algorithm; `updateHandle` is source-only and uses a per-handle private capability rather than a public API or registry.
- Commands and actual outcomes:
  - First parallel fixture compilation exposed fixture-only setup issues: inherited `rootDir`, missing proposed visibility fields, and an unexported Angular fixture directive. These were corrected without product edits.
  - `node_modules/.bin/tsc -p docs/delivery/contracts/fixtures/tsconfig.json` — exit 0.
  - `node_modules/.bin/vue-tsc -p docs/delivery/contracts/fixtures/tsconfig.json --noEmit` — exit 0.
  - `node_modules/.bin/svelte-check --workspace docs/delivery/contracts/fixtures --tsconfig ./tsconfig.json` — exit 0; zero errors and warnings.
  - `node_modules/.bin/ngc -p docs/delivery/contracts/fixtures/tsconfig.json` — exit 0.
- Fixture boundary: fixtures model the approved future adapter types using the current `StetHandle`/`StetOptions` base; they prove framework syntax and type expressibility, not that unimplemented production adapters already expose the contract.
- Generated-contract result: `onHandle`/`stetOnHandle` are adapter metadata outside `StetOptions`, so current scalar schema generation has no callback to serialize.
- Unverified items: runtime implementation and lifecycle tests are intentionally deferred to CORE/AD tasks.
- Reviewer decision: ACCEPT after three review passes resolved callback stability, shared update ordering, internal wiring, and missing/changed target states.
