# CONTRACT-01 evidence

- Revision/base: `7279869d68c09829de08b36cd74633e9dd63c0db`; BASE-01 is ACCEPTED.
- Files changed: `docs/delivery/contracts/runtime.md`, task/backlog state, and this evidence file; no product or generated files.
- Implementation inspected: `src/mount.ts`, `src/primitives.ts`, all four framework adapters, `style.css`, runtime/browser tests, direct/template/site `StetHandle` callers, package scripts, and agent generator/catalog/template machinery.
- Acceptance criteria checked: the runtime contract now fixes exact in-flight promise identity, overlap and cancellation ordering, static and destroyed behavior, redraw progress, target culling/detachment, ARIA ownership, unsupported animation validation, complete arrow/sticky handles, and a runnable test location for every transition.
- Caller review: direct vanilla/site/template callers consume cleanup and redraw methods; React, Vue, Svelte, and Angular currently destroy/remount handles; arrow and sticky currently wrap and narrow the returned handle. The contract explicitly requires wrapper completeness and gives adapters a target-replacement rule without prescribing CONTRACT-02 ergonomics.
- Commands and actual outcomes: repository reads and searches only; `StetHandle` search found runtime, primitive wrappers, four adapters, unit tests, templates/patterns, website, docs, and retained trial/evidence consumers. No product test was rerun because this task changes documentation only; BASE-01 contains the current executed baseline.
- Generated-contract review: flat scalar options match `scripts/agent/generate.mjs`; lifecycle metadata/templates currently describe only `refresh`, `resketch`, and `destroy`, so implementation tasks must regenerate rather than hand-edit outputs.
- Unverified items: the transition test map is design evidence, not an assertion that unimplemented lifecycle tests pass.
- Reviewer decision: ACCEPT after three review passes resolved instant-finish, replay, observer visibility, destroy settlement, seed, and test-map ambiguities.
